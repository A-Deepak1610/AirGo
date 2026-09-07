"""
Yatra deep checkout and fare verification engine.
Progresses through the Yatra booking flow up to the final pre-payment / Pay Now stage,
extracts authoritative payable prices and fee breakdowns, detects price changes,
captures ground-truth Pay Now screenshots, and halts strictly before payment.
"""

from datetime import datetime, timezone
from decimal import Decimal
import logging
from typing import Any, Dict, List, Optional
from playwright.async_api import Page, TimeoutError as PlaywrightTimeoutError

from airgo.scrapers.yatra.models import (
    AntiBotEvent,
    AntiBotEventType,
    AvailabilityStatus,
    DataStatus,
    NormalizedFareQuote,
)
from airgo.scrapers.yatra.parser import YatraParser
from airgo.scrapers.yatra.run_manager import YatraRunManager
from airgo.scrapers.yatra.selectors import YatraSelectors

logger = logging.getLogger("AirGo.Yatra.Checkout")


class YatraCheckoutVerifier:
    """
    Orchestrates flight booking progression up to the Pay Now screen.
    Guarantees strict halt before payment: no financial credentials entered,
    and no final payment submission clicked.
    """

    def __init__(
        self,
        run_manager: YatraRunManager,
        timeout_ms: int = 25000,
    ):
        self.run_manager = run_manager
        self.timeout_ms = timeout_ms

    async def verify_fare(
        self,
        page: Page,
        quote: NormalizedFareQuote,
        window_code: str,
    ) -> NormalizedFareQuote:
        """
        Executes booking navigation for a candidate fare quote from the search page:
        1. Identifies flight card and clicks Book / Select Fare.
        2. Progresses through review pages and bypasses non-payment add-on dialogs.
        3. Fills non-sensitive guest contact info if required by Yatra.
        4. Waits for Pay Now / Payment options page to render.
        5. Extracts final payable price and breakdown.
        6. Captures Pay Now screenshot.
        7. Halts without paying.
        """
        logger.info(
            f"Initiating checkout verification for {quote.route} | {quote.flight_number} | "
            f"{quote.fare_option_name or 'Standard'} (Displayed: ₹{quote.displayed_price})"
        )

        paynow_shot_path = self.run_manager.get_paynow_screenshot_path(
            route_code=quote.route,
            window_code=window_code,
            flight_number=quote.flight_number,
            fare_option_name=quote.fare_option_name or "standard",
        )

        try:
            # 1. Check if the initial page has an anti-bot challenge
            initial_html = await page.content()
            challenge = YatraParser.detect_anti_bot(
                html=initial_html,
                status_code=200,
                url=page.url,
                route=quote.route,
                travel_date=quote.travel_date,
            )
            if challenge:
                return await self._handle_challenge(page, quote, challenge, window_code)

            # 2. Locate the specific flight card
            flight_card_locator = await self._find_flight_card(page, quote)
            if not flight_card_locator:
                quote.verification_status = DataStatus.VERIFICATION_FAILED
                quote.error_reason = f"Flight card {quote.flight_number} not found on search page"
                return quote

            # 3. Click Book / Select Fare Option
            booked = await self._select_flight_and_fare(page, flight_card_locator, quote)
            if not booked:
                # Check if flight showed sold-out during attempt
                html_check = await page.content()
                if "sold out" in html_check.lower():
                    quote.availability_status = AvailabilityStatus.SOLD_OUT
                    quote.verification_status = DataStatus.SOLD_OUT
                    quote.error_reason = "Flight became sold out upon selection"
                    return quote

                quote.verification_status = DataStatus.VERIFICATION_FAILED
                quote.error_reason = "Failed to trigger booking action on flight card"
                return quote

            # 4. Handle review / passenger info & dismiss popups
            await self._handle_review_and_popups(page)

            # 5. Check again for security barriers during progression
            post_nav_html = await page.content()
            challenge = YatraParser.detect_anti_bot(
                html=post_nav_html,
                status_code=200,
                url=page.url,
                route=quote.route,
                travel_date=quote.travel_date,
            )
            if challenge:
                return await self._handle_challenge(page, quote, challenge, window_code)

            # 6. Wait for Pre-Payment / Pay Now page
            is_paynow = await self._wait_for_paynow_page(page)
            paynow_html = await page.content()

            # 7. Capture ground-truth Pay Now screenshot
            try:
                await page.screenshot(path=str(paynow_shot_path), full_page=False)
                quote.paynow_screenshot_path = str(paynow_shot_path)
                logger.info(f"Captured Pay Now screenshot: {paynow_shot_path}")
            except Exception as ss_err:
                logger.warning(f"Could not capture Pay Now screenshot: {ss_err}")

            # 8. Check for price change alert or sold out banner
            price_alert = YatraParser.detect_price_change_alert(paynow_html)
            if "sold out" in paynow_html.lower() or "seats sold out" in paynow_html.lower():
                quote.availability_status = AvailabilityStatus.SOLD_OUT
                quote.verification_status = DataStatus.SOLD_OUT
                quote.error_reason = "Seats sold out during checkout progression"
                return quote

            # 9. Extract final payable price & fee breakdown
            breakdown = YatraParser.parse_paynow_breakdown(paynow_html)
            final_price = breakdown.get("final_payable_price")

            if final_price is not None and final_price > Decimal("0.00"):
                quote.final_payable_price = final_price
                quote.verification_timestamp = datetime.now(timezone.utc)

                # Update breakdown components if extracted
                if breakdown.get("base_fare"):
                    quote.base_fare = breakdown["base_fare"]  # type: ignore
                if breakdown.get("taxes"):
                    quote.taxes = breakdown["taxes"]  # type: ignore
                if breakdown.get("convenience_fee"):
                    quote.convenience_fee = breakdown["convenience_fee"]  # type: ignore
                if breakdown.get("other_charges"):
                    quote.other_charges = breakdown["other_charges"]  # type: ignore

                # Determine if price changed
                diff = final_price - (quote.displayed_search_price or quote.displayed_price)
                quote.price_difference = diff

                if diff != Decimal("0.00") or price_alert:
                    quote.verification_status = DataStatus.PRICE_CHANGED
                    if price_alert:
                        quote.error_reason = f"Price changed during checkout: {price_alert} (Diff: ₹{diff})"
                    logger.info(
                        f"Price change detected for {quote.flight_number}: "
                        f"Displayed ₹{quote.displayed_search_price} -> Final ₹{final_price} (Diff: ₹{diff})"
                    )
                else:
                    quote.verification_status = DataStatus.FARE_VERIFIED
                    logger.info(
                        f"Fare verified successfully for {quote.flight_number}: ₹{final_price}"
                    )
            else:
                # Could not reliably parse final payable total
                quote.verification_status = DataStatus.VERIFICATION_FAILED
                quote.error_reason = "Pay Now page reached but total payable price element could not be parsed"
                logger.warning(
                    f"Pay Now page reached for {quote.flight_number} but total amount missing in DOM"
                )

        except PlaywrightTimeoutError as te:
            logger.warning(f"Timeout during checkout verification for {quote.flight_number}: {te}")
            quote.verification_status = DataStatus.VERIFICATION_FAILED
            quote.error_reason = f"Timeout during booking progression: {te}"
            err_shot = self.run_manager.get_screenshot_path(quote.route, window_code, "checkout_timeout")
            try:
                await page.screenshot(path=str(err_shot), full_page=False)
            except Exception:
                pass
        except Exception as e:
            logger.warning(f"Unexpected error during checkout verification for {quote.flight_number}: {e}")
            quote.verification_status = DataStatus.VERIFICATION_FAILED
            quote.error_reason = f"Unexpected checkout error: {e}"

        return quote

    async def _find_flight_card(self, page: Page, quote: NormalizedFareQuote) -> Optional[Any]:
        """Locates the card element matching flight number or airline details."""
        clean_fn = quote.flight_number.replace("-", "").strip()
        card_selectors = [
            f"div.flight-seg:has-text('{quote.flight_number}')",
            f"div.flight-seg:has-text('{clean_fn}')",
            f"div[class*='flightItem']:has-text('{quote.flight_number}')",
            f"div.flight-seg:has-text('{quote.airline}'):has-text('{quote.departure_time}')",
        ]
        for sel in card_selectors:
            try:
                loc = page.locator(sel)
                first_loc = getattr(loc, "first", loc)
                if await first_loc.count() > 0 and await first_loc.is_visible():
                    return first_loc
            except Exception:
                continue

        try:
            loc = page.locator("div.flight-seg")
            first_loc = getattr(loc, "first", loc)
            if await first_loc.count() > 0:
                return first_loc
        except Exception:
            pass

        return None

    async def _select_flight_and_fare(
        self,
        page: Page,
        card_locator: Any,
        quote: NormalizedFareQuote,
    ) -> bool:
        """Clicks book / select fare option on the chosen flight card."""
        try:
            # Check if specific fare option button is visible inside this card
            if quote.fare_option_name:
                fare_btn_selectors = [
                    f"div.fare-option:has-text('{quote.fare_option_name}') button",
                    f"div[class*='fare-family']:has-text('{quote.fare_option_name}') button",
                    f"button:has-text('{quote.fare_option_name}')",
                ]
                for f_sel in fare_btn_selectors:
                    loc = card_locator.locator(f_sel)
                    btn = getattr(loc, "first", loc)
                    if await btn.count() > 0 and await btn.is_visible():
                        await btn.click()
                        await page.wait_for_load_state("domcontentloaded", timeout=10000)
                        return True

            # Otherwise, click the primary Book / Choose button on the card
            for b_sel in YatraSelectors.BOOK_BUTTON:
                loc = card_locator.locator(b_sel)
                btn = getattr(loc, "first", loc)
                if await btn.count() > 0 and await btn.is_visible():
                    await btn.click()
                    await page.wait_for_load_state("domcontentloaded", timeout=10000)

                    # Check if a fare family drawer / modal opened
                    drawer_loc = page.locator("div.fare-family button, div.fare-options button")
                    drawer_btn = getattr(drawer_loc, "first", drawer_loc)
                    if await drawer_btn.count() > 0 and await drawer_btn.is_visible():
                        await drawer_btn.click()
                        await page.wait_for_load_state("domcontentloaded", timeout=10000)

                    return True

        except Exception as e:
            logger.info(f"Flight selection interaction note: {e}")

        return False

    async def _handle_review_and_popups(self, page: Page) -> None:
        """
        Dismisses intermediate addon popups (insurance, seats, meals)
        and fills non-sensitive guest traveler details if required.
        """
        for _ in range(3):
            # Dismiss popups / opt-out of insurance or seat selection
            for pop_sel in YatraSelectors.ADDON_SKIP_BUTTON:
                try:
                    skip_btn = page.locator(pop_sel).first
                    if await skip_btn.count() > 0 and await skip_btn.is_visible():
                        await skip_btn.click()
                        logger.info(f"Dismissed checkout addon dialog using '{pop_sel}'")
                        await page.wait_for_timeout(1000)
                except Exception:
                    pass

            # If passenger contact form is required, fill non-sensitive generic audit info
            try:
                email_input = page.locator("input[type='email'], input[name*='email'], input[id*='email']").first
                if await email_input.count() > 0 and await email_input.is_visible():
                    curr_val = await email_input.input_value()
                    if not curr_val:
                        await email_input.fill("audit.traveler@example.com")

                mobile_input = page.locator("input[type='tel'], input[name*='mobile'], input[id*='mobile']").first
                if await mobile_input.count() > 0 and await mobile_input.is_visible():
                    curr_val = await mobile_input.input_value()
                    if not curr_val:
                        await mobile_input.fill("9876543210")

                fname_input = page.locator("input[name*='fname'], input[id*='fname'], input[placeholder*='First']").first
                if await fname_input.count() > 0 and await fname_input.is_visible():
                    curr_val = await fname_input.input_value()
                    if not curr_val:
                        await fname_input.fill("Audit")

                lname_input = page.locator("input[name*='lname'], input[id*='lname'], input[placeholder*='Last']").first
                if await lname_input.count() > 0 and await lname_input.is_visible():
                    curr_val = await lname_input.input_value()
                    if not curr_val:
                        await lname_input.fill("Traveler")
            except Exception:
                pass

            # Click Continue / Proceed to Payment
            progressed = False
            for cont_sel in YatraSelectors.CONTINUE_BOOKING_BUTTON:
                try:
                    cont_btn = page.locator(cont_sel).first
                    if await cont_btn.count() > 0 and await cont_btn.is_visible():
                        await cont_btn.click()
                        logger.info(f"Progressed review screen via '{cont_sel}'")
                        await page.wait_for_load_state("domcontentloaded", timeout=10000)
                        progressed = True
                        break
                except Exception:
                    pass

            if not progressed:
                break

    async def _wait_for_paynow_page(self, page: Page) -> bool:
        """Waits for the final pre-payment page or total payable amount to appear."""
        for sel in YatraSelectors.PAYNOW_CONTAINER + YatraSelectors.PAYNOW_TOTAL_AMOUNT:
            try:
                loc = page.locator(sel).first
                if await loc.count() > 0 and await loc.is_visible():
                    return True
            except Exception:
                continue

        try:
            query = ", ".join(YatraSelectors.PAYNOW_TOTAL_AMOUNT[:4])
            await page.wait_for_selector(query, timeout=8000)
            return True
        except Exception:
            pass

        return False

    async def _handle_challenge(
        self,
        page: Page,
        quote: NormalizedFareQuote,
        challenge: AntiBotEvent,
        window_code: str,
    ) -> NormalizedFareQuote:
        """Captures challenge screenshot and records challenge state without evasion."""
        challenge_shot = self.run_manager.get_screenshot_path(
            quote.route, window_code, "checkout_challenge"
        )
        try:
            await page.screenshot(path=str(challenge_shot), full_page=False)
            challenge.screenshot_path = str(challenge_shot)
        except Exception:
            pass

        self.run_manager.record_anti_bot_event(challenge)
        if challenge.event_type == AntiBotEventType.CAPTCHA:
            quote.verification_status = DataStatus.CAPTCHA_BLOCKED
        elif challenge.event_type == AntiBotEventType.ACCESS_DENIED:
            quote.verification_status = DataStatus.ACCESS_DENIED
        else:
            quote.verification_status = DataStatus.CAPTCHA_BLOCKED

        quote.error_reason = f"Security barrier encountered during checkout: {challenge.message}"
        logger.warning(
            f"Security challenge halted checkout verification for {quote.flight_number}: {challenge.message}"
        )
        return quote
