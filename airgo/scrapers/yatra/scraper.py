"""
Master Yatra airfare scraper orchestrator.
Executes multi-route and multi-horizon searches, manages Playwright browser pages,
handles anti-bot detections safely, extracts all flight and fare options,
saves screenshots and raw JSON to /runs/yatra/, and persists to PostgreSQL.
"""

import asyncio
from datetime import date, datetime, timezone
from decimal import Decimal
import logging
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

from playwright.async_api import Page, Response

from airgo.scrapers.yatra.browser import BROWSER_MANAGER, PlaywrightBrowserManager
from airgo.scrapers.yatra.config import DEFAULT_YATRA_CONFIG, YatraScraperConfig
from airgo.scrapers.yatra.dates import SearchWindow, generate_search_windows
from airgo.scrapers.yatra.db_adapter import persist_fare_quotes_to_db
from airgo.scrapers.yatra.models import (
    AntiBotEvent,
    AntiBotEventType,
    AvailabilityStatus,
    DataStatus,
    NormalizedFareQuote,
)
from airgo.scrapers.yatra.parser import YatraParser
from airgo.scrapers.yatra.routes import RouteDefinition, get_route, list_routes
from airgo.scrapers.yatra.run_manager import YatraRunManager
from airgo.scrapers.yatra.selectors import YatraSelectors

logger = logging.getLogger("AirGo.Yatra.Scraper")


class YatraScraper:
    """Master controller executing airfare collection across corridors and advance windows."""

    def __init__(
        self,
        config: Optional[YatraScraperConfig] = None,
        run_manager: Optional[YatraRunManager] = None,
        browser_manager: Optional[PlaywrightBrowserManager] = None,
    ):
        self.config = config or DEFAULT_YATRA_CONFIG
        self.run_manager = run_manager or YatraRunManager(base_runs_dir=self.config.runs_dir)
        self.browser_manager = browser_manager or BROWSER_MANAGER

    def build_search_url(
        self,
        origin_iata: str,
        dest_iata: str,
        travel_date: date,
        cabin_class: str = "Economy",
    ) -> str:
        """Constructs the canonical Yatra flight trigger URL."""
        params = {
            "type": "O",
            "viewName": "normal",
            "flexi": "0",
            "noOfSegments": "1",
            "origin": origin_iata.strip().upper(),
            "originCountry": "IN",
            "destination": dest_iata.strip().upper(),
            "destinationCountry": "IN",
            "flight_depart_date": travel_date.strftime("%d/%m/%Y"),
            "ADT": "1",
            "CHD": "0",
            "INF": "0",
            "class": cabin_class,
            "source": "fresco-home",
        }
        return f"https://flight.yatra.com/air-search-ui/dom2/trigger?{urlencode(params)}"

    async def search_route_window(
        self,
        page: Page,
        route: RouteDefinition,
        window: SearchWindow,
    ) -> Dict[str, Any]:
        """
        Executes a single route/window search: navigates, progressively scrolls to load
        all lazy-loaded flights, detects anti-bot challenges, captures screenshot proof,
        and parses all available flight cards.
        """
        search_url = self.build_search_url(
            origin_iata=route.origin_iata,
            dest_iata=route.dest_iata,
            travel_date=window.travel_date,
        )
        print(f"\n[Yatra] Route: {route.route_code}")
        print(f"[Yatra] Window: {window.window_code}")
        print(f"[Yatra] Travel date: {window.iso_travel_date}\n")
        print(f"[Yatra] Searching Yatra...")
        logger.info(
            f"Executing Yatra search for {route.route_code} | {window.window_code} | {window.iso_travel_date}"
        )

        search_context = {
            "route": route.route_code,
            "origin": route.origin_iata,
            "destination": route.dest_iata,
            "search_date": window.search_date,
            "travel_date": window.travel_date,
            "advance_purchase_days": window.advance_purchase_days,
            "url": search_url,
        }

        response: Optional[Response] = None
        try:
            response = await page.goto(
                search_url,
                wait_until="domcontentloaded",
                timeout=self.config.browser_timeout_ms,
            )
        except Exception as e:
            logger.warning(f"Navigation error on {route.route_code} {window.window_code}: {e}")
            print(f"[Yatra][ERROR] Navigation timed out / failed: {e}")
            err_shot = self.run_manager.get_screenshot_path(
                route.route_code, window.window_code, "navigation_error"
            )
            try:
                await page.screenshot(path=str(err_shot), full_page=False)
            except Exception:
                pass
            return {
                "status": "error",
                "message": str(e),
                "raw_quotes": [],
                "normalized_quotes": [],
            }

        status_code = response.status if response else 200
        html = await page.content()

        # Check for Anti-Bot / Security Barriers (Without Evasion)
        challenge_event = YatraParser.detect_anti_bot(
            html=html,
            status_code=status_code,
            url=search_url,
            route=route.route_code,
            travel_date=window.travel_date,
        )

        if challenge_event:
            print(f"\n[Yatra][SECURITY] {challenge_event.message}")
            challenge_shot = self.run_manager.get_screenshot_path(
                route.route_code, window.window_code, "security_challenge"
            )
            try:
                await page.screenshot(path=str(challenge_shot), full_page=False)
                challenge_event.screenshot_path = str(challenge_shot)
            except Exception:
                pass

            self.run_manager.record_anti_bot_event(challenge_event)

            if not self.config.headless and self.config.observation_delay > 0:
                print(f"[Yatra] Holding challenge window for {self.config.observation_delay}s diagnostic inspection...")
                await asyncio.sleep(self.config.observation_delay)

            return {
                "status": "challenge",
                "challenge": challenge_event,
                "raw_quotes": [],
                "normalized_quotes": [],
            }

        # Wait for dynamic flight list rendering
        try:
            await page.wait_for_selector("div.tuple, div.flight-seg, div.flightItem", timeout=20000)
            print("[Yatra] Search results loaded.")
        except Exception:
            print("[Yatra][ERROR] Flight selector returned 0 elements.")

        # Progressive lazy-load scrolling to load ALL flights
        prev_count = 0
        for _ in range(8):
            curr_count = await page.locator("div.tuple").count()
            if curr_count > 0:
                print(f"[Yatra] Flights currently loaded: {curr_count}")
            if curr_count > prev_count:
                prev_count = curr_count
                await page.evaluate("window.scrollBy(0, 1200)")
                await asyncio.sleep(1.2)
            else:
                break
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(0.8)

        # Capture search results screenshot proof
        results_shot = self.run_manager.get_screenshot_path(
            route.route_code, window.window_code, "search_results"
        )
        try:
            await page.screenshot(path=str(results_shot), full_page=False)
            logger.info(f"Saved search results screenshot: {results_shot}")
        except Exception as e:
            logger.warning(f"Failed to capture screenshot: {e}")

        # Parse rendered flight cards
        rendered_html = await page.content()
        raw_quotes, normalized_quotes = YatraParser.parse_flight_cards(
            rendered_html, search_context=search_context
        )

        if not raw_quotes:
            print(f"[Yatra][ERROR] Search results loaded but no flight cards matched for {route.route_code}.")
        else:
            print(f"[Yatra] Search results loaded")

        if not self.config.headless and self.config.observation_delay > 0:
            await asyncio.sleep(self.config.observation_delay)

        return {
            "status": "success",
            "raw_quotes": raw_quotes,
            "normalized_quotes": normalized_quotes,
        }

    async def verify_candidates(
        self,
        page: Page,
        candidates: List[NormalizedFareQuote],
        route: RouteDefinition,
        window: SearchWindow,
    ) -> List[NormalizedFareQuote]:
        """
        Runs checkout verification for candidate quotes.
        Navigates each candidate through the booking flow up to Pay Now.
        """
        from airgo.scrapers.yatra.checkout import YatraCheckoutVerifier

        verifier = YatraCheckoutVerifier(run_manager=self.run_manager)
        verified_quotes: List[NormalizedFareQuote] = []

        for idx, q in enumerate(candidates):
            if q.availability_status == AvailabilityStatus.SOLD_OUT:
                verified_quotes.append(q)
                continue

            await asyncio.sleep(self.config.request_delay)
            print(f"\n[Yatra] Verifying fare {idx + 1}/{len(candidates)}")

            updated_q = await verifier.verify_fare(page, q, window_code=window.window_code)
            verified_quotes.append(updated_q)

            if not self.config.headless and self.config.observation_delay > 0:
                await asyncio.sleep(self.config.observation_delay)

            # If challenge occurred, halt further checkout attempts for this search
            if updated_q.verification_status in (DataStatus.CAPTCHA_BLOCKED, DataStatus.ACCESS_DENIED):
                print(f"[Yatra][SECURITY] Checkout verification halted due to barrier")
                for remaining_q in candidates[idx + 1:]:
                    remaining_q.verification_status = updated_q.verification_status
                    remaining_q.error_reason = updated_q.error_reason
                    verified_quotes.append(remaining_q)
                break

            # If more quotes remain, ensure we are back on the search results page
            if idx < len(candidates) - 1:
                try:
                    await page.bring_to_front()
                    if "air-search-ui" not in page.url:
                        search_url = self.build_search_url(route.origin_iata, route.dest_iata, window.travel_date)
                        await page.goto(search_url, wait_until="domcontentloaded", timeout=self.config.browser_timeout_ms)
                        await page.wait_for_selector("div.tuple", timeout=10000)
                except Exception:
                    pass

        return verified_quotes

    async def run_harvest(
        self,
        route_codes: Optional[List[str]] = None,
        horizons: Optional[List[int]] = None,
        checkout: bool = False,
        persist_db: bool = True,
    ) -> Dict[str, Any]:
        """
        Master execution runner:
        Iterates over routes and horizons with controlled concurrency, rate delays,
        optional deep checkout verification, and artifact collection.
        """
        start_time = datetime.now(timezone.utc)
        logger.info(f"Starting Yatra Harvest Job [Run ID: {self.run_manager.run_id}, Checkout: {checkout}]")

        # Select target corridors
        if route_codes:
            active_routes = [r for code in route_codes if (r := get_route(code))]
        else:
            active_routes = list_routes(active_only=True)

        windows = generate_search_windows(horizons=horizons)
        all_quote_records: List[Dict[str, Any]] = []
        all_raw_quotes: List[Dict[str, Any]] = []
        all_normalized_quotes: List[NormalizedFareQuote] = []
        challenge_events: List[AntiBotEvent] = []
        failures: List[Dict[str, Any]] = []

        total_flights_found = 0
        total_fare_options_found = 0
        total_fares_selected = 0
        file_lock = asyncio.Lock()

        semaphore = asyncio.Semaphore(self.config.max_concurrency)

        async def _execute_single(route: RouteDefinition, window: SearchWindow):
            nonlocal total_flights_found, total_fare_options_found, total_fares_selected
            async with semaphore:
                await asyncio.sleep(self.config.request_delay)

                retries = 0
                while retries <= self.config.max_retries:
                    try:
                        async with self.browser_manager.new_page(
                            headless=self.config.headless,
                            slow_mo_ms=self.config.slow_mo_ms,
                        ) as page:
                            res = await self.search_route_window(page, route, window)

                            if res["status"] == "challenge":
                                challenge_events.append(res["challenge"])
                                await asyncio.sleep(self.config.request_delay * self.config.backoff_factor)
                                break
                            elif res["status"] == "success":
                                cur_raw = res["raw_quotes"]
                                cur_norm = res["normalized_quotes"]
                                all_raw_quotes.extend(cur_raw)

                                # 1. Group all available quotes by flight number
                                flights_map: Dict[str, List[NormalizedFareQuote]] = {}
                                for q in cur_norm:
                                    flights_map.setdefault(q.flight_number, []).append(q)

                                total_flights_found += len(flights_map)
                                total_fare_options_found += len(cur_raw)

                                # 2. Get the single cheapest available fare for EACH flight
                                flights_cheapest: Dict[str, NormalizedFareQuote] = {}
                                for fn, f_quotes in flights_map.items():
                                    cheapest_q = min(f_quotes, key=lambda x: x.displayed_price)
                                    flights_cheapest[fn] = cheapest_q

                                print(f"\n[Yatra] Flights found: {len(flights_cheapest)}\n")
                                print("[Yatra] Extracting flight fares...\n")
                                for fn, ch_q in flights_cheapest.items():
                                    clean_fn = fn.replace("-", "")
                                    print(f"[Yatra] {clean_fn} → cheapest fare ₹{int(ch_q.displayed_price)}")

                                # 3. Sort flights by their cheapest available fare
                                print(f"\n[Yatra] Sorting flights by cheapest fare...\n")
                                sorted_flights = sorted(flights_cheapest.values(), key=lambda x: x.displayed_price)

                                # 4. Select TOP 5 CHEAPEST FLIGHTS per route and window
                                top_5_flights = sorted_flights[:5]
                                total_fares_selected += len(top_5_flights)

                                print("[Yatra] TOP 5:")
                                for rank_i, q in enumerate(top_5_flights, start=1):
                                    clean_fn = q.flight_number.replace("-", "")
                                    print(f"{rank_i}. {clean_fn} → ₹{int(q.displayed_price)}")
                                print()

                                from airgo.scrapers.yatra.checkout import YatraCheckoutVerifier
                                verifier = YatraCheckoutVerifier(run_manager=self.run_manager)

                                window_records: List[Dict[str, Any]] = []
                                window_normalized: List[NormalizedFareQuote] = []

                                for rank_i, cand_q in enumerate(top_5_flights, start=1):
                                    clean_fn = self.run_manager._sanitize_filename(cand_q.flight_number)
                                    screenshot_path = self.run_manager.get_top5_screenshot_path(
                                        route_code=route.route_code,
                                        window_code=window.window_code,
                                        rank=rank_i,
                                        flight_number=cand_q.flight_number,
                                    )
                                    rel_screenshot = f"{route.route_code}/{window.window_code}/{rank_i:02d}_{clean_fn}.png"

                                    if checkout:
                                        page_closed = False
                                        try:
                                            v = page.is_closed()
                                            if isinstance(v, bool):
                                                page_closed = v
                                        except Exception:
                                            pass

                                        if page_closed:
                                            print(f"[Yatra] Search results page is closed. Halting further checkout verification.")
                                            verified_q = cand_q.model_copy()
                                            verified_q.verification_status = DataStatus.VERIFICATION_FAILED
                                            verified_q.error_reason = "Search page was closed before verification"
                                        else:
                                            print(f"[Yatra] Verifying flight {rank_i}/{len(top_5_flights)}...")
                                            verified_q = await verifier.verify_fare(
                                                page=page,
                                                quote=cand_q,
                                                window_code=window.window_code,
                                                custom_screenshot_path=screenshot_path,
                                            )
                                            if (
                                                verified_q.final_payable_price is not None
                                                and verified_q.final_payable_price > Decimal("0")
                                            ):
                                                print("[Yatra] Reached Pay Now.")
                                                print(f"[Yatra] Final price: ₹{int(verified_q.final_payable_price)}\n")
                                            else:
                                                print(f"[Yatra][ERROR] Flight {cand_q.flight_number} verification failed\n")
                                    else:
                                        verified_q = cand_q.model_copy()
                                        try:
                                            card = await verifier._find_flight_card(page, cand_q)
                                            if card and await card.count() > 0 and await card.is_visible():
                                                await card.screenshot(path=str(screenshot_path))
                                            else:
                                                await page.screenshot(path=str(screenshot_path), full_page=False)
                                        except Exception:
                                            try:
                                                await page.screenshot(path=str(screenshot_path), full_page=False)
                                            except Exception:
                                                pass

                                    search_price_val = int(round(float(verified_q.displayed_search_price or verified_q.displayed_price)))
                                    final_price_val: Optional[int] = None
                                    if checkout:
                                        if (
                                            verified_q.final_payable_price is not None
                                            and verified_q.final_payable_price > Decimal("0")
                                        ):
                                            final_price_val = int(round(float(verified_q.final_payable_price)))
                                        else:
                                            final_price_val = None
                                    else:
                                        final_price_val = search_price_val

                                    base_fare_val = (
                                        int(round(float(verified_q.base_fare)))
                                        if (verified_q.final_payable_price is not None and verified_q.base_fare > Decimal("0"))
                                        else None
                                    )
                                    taxes_val = (
                                        int(round(float(verified_q.taxes)))
                                        if (verified_q.final_payable_price is not None and verified_q.taxes > Decimal("0"))
                                        else None
                                    )

                                    rec = {
                                        "rank": rank_i,
                                        "platform": "Yatra",
                                        "platform_type": "ota",
                                        "route": route.route_code,
                                        "origin": route.origin_iata,
                                        "destination": route.dest_iata,
                                        "travel_date": window.iso_travel_date,
                                        "advance_purchase_days": window.advance_purchase_days,
                                        "window": window.window_code,
                                        "airline": verified_q.airline,
                                        "flight_number": verified_q.flight_number,
                                        "departure_time": verified_q.departure_time,
                                        "arrival_time": verified_q.arrival_time,
                                        "duration": verified_q.duration,
                                        "stops": verified_q.stops,
                                        "search_price": search_price_val,
                                        "deep_checkout_base_fare": base_fare_val,
                                        "deep_checkout_taxes": taxes_val,
                                        "final_price": final_price_val,
                                        "currency": "INR",
                                        "fare_class": "Economy",
                                        "scraped_at": verified_q.scraped_at.isoformat(),
                                        "screenshot_evidence": rel_screenshot,
                                    }
                                    window_records.append(rec)
                                    window_normalized.append(verified_q)

                                    # If more flights remain in this search window, return to search page
                                    if checkout and rank_i < len(top_5_flights):
                                        try:
                                            await page.bring_to_front()
                                            if "air-search-ui" not in page.url:
                                                search_url = self.build_search_url(
                                                    route.origin_iata, route.dest_iata, window.travel_date
                                                )
                                                await page.goto(
                                                    search_url,
                                                    wait_until="domcontentloaded",
                                                    timeout=self.config.browser_timeout_ms,
                                                )
                                                await page.wait_for_selector("div.tuple", timeout=10000)
                                        except Exception:
                                            pass

                                # Incremental write to quotes.json after each route + window
                                async with file_lock:
                                    all_quote_records.extend(window_records)
                                    all_normalized_quotes.extend(window_normalized)
                                    self.run_manager.save_quotes(all_quote_records)
                                    self.run_manager.save_normalized_quotes(all_normalized_quotes)
                                    if persist_db and window_normalized:
                                        try:
                                            persist_fare_quotes_to_db(window_normalized, run_started_at=start_time)
                                        except Exception as db_err:
                                            logger.warning(f"DB persistence warning: {db_err}")

                                break
                            else:
                                retries += 1
                                backoff = self.config.request_delay * (self.config.backoff_factor ** retries)
                                await asyncio.sleep(backoff)
                    except Exception as exc:
                        retries += 1
                        logger.warning(
                            f"Task failed ({route.route_code} {window.window_code}) attempt {retries}: {exc}"
                        )
                        if retries > self.config.max_retries:
                            failures.append({
                                "route": route.route_code,
                                "window": window.window_code,
                                "error": str(exc),
                            })
                        await asyncio.sleep(self.config.request_delay * self.config.backoff_factor)

        tasks = []
        for route in active_routes:
            for win in windows:
                tasks.append(_execute_single(route, win))

        await asyncio.gather(*tasks, return_exceptions=True)

        # Final dataset serialization
        if all_quote_records:
            self.run_manager.save_quotes(all_quote_records)
        self.run_manager.save_raw_quotes(all_raw_quotes)
        self.run_manager.save_normalized_quotes(all_normalized_quotes)

        db_inserted = len(all_normalized_quotes) if persist_db else 0

        end_time = datetime.now(timezone.utc)
        duration_seconds = round((end_time - start_time).total_seconds(), 2)

        # Compute summary metrics
        total_fares_verified = sum(1 for q in all_normalized_quotes if q.verification_status == DataStatus.FARE_VERIFIED)
        total_price_changes = sum(1 for q in all_normalized_quotes if q.verification_status == DataStatus.PRICE_CHANGED)
        total_sold_out = sum(
            1 for q in all_normalized_quotes
            if q.verification_status == DataStatus.SOLD_OUT or q.availability_status == AvailabilityStatus.SOLD_OUT
        )
        total_failed_extractions = sum(
            1 for q in all_normalized_quotes if q.verification_status == DataStatus.VERIFICATION_FAILED
        ) + len(failures)
        total_successful_extractions = len(all_normalized_quotes) - total_failed_extractions

        total_captcha_events = sum(
            1 for e in challenge_events if e.event_type in (AntiBotEventType.CAPTCHA, "captcha")
        )
        total_access_denied_events = sum(
            1 for e in challenge_events if e.event_type in (AntiBotEventType.ACCESS_DENIED, "access_denied")
        )

        screenshot_count = self.run_manager.count_screenshots()

        overall_status = "COMPLETED"
        if not all_normalized_quotes and (failures or challenge_events):
            overall_status = "FAILED"
        elif failures or challenge_events or total_failed_extractions > 0:
            overall_status = "PARTIAL"

        summary = {
            "source": "Yatra",
            "run_id": self.run_manager.run_id,
            "routes": [r.route_code for r in active_routes],
            "windows": [w.window_code for w in windows],
            "total_searches": len(active_routes) * len(windows),
            "total_flights_found": total_flights_found,
            "total_flights_processed": len(all_quote_records),
            "total_top_5_selected": len(all_quote_records),
            "total_verified": total_fares_verified,
            "total_price_changes": total_price_changes,
            "total_captcha_events": total_captcha_events,
            "total_akamai_events": len(challenge_events),
            "total_errors": len(failures) + total_failed_extractions,
            "total_json_records": len(all_quote_records),
            "overall_status": overall_status,
            # Backward-compatibility keys for existing assertions and audit reporting
            "routes_requested": [r.route_code for r in active_routes],
            "advance_purchase_windows": [w.window_code for w in windows],
            "total_fare_options_found": total_fare_options_found,
            "total_fares_selected": total_fares_selected,
            "total_fares_verified": total_fares_verified,
            "total_successful_extractions": total_fares_verified if checkout else len(all_quote_records),
            "total_failed_extractions": total_failed_extractions,
            "total_sold_out": total_sold_out,
            "total_antibot_events": len(challenge_events),
            "total_access_denied_events": total_access_denied_events,
            "screenshot_count": screenshot_count,
            "started_at": start_time.isoformat(),
            "completed_at": end_time.isoformat(),
            "duration_seconds": duration_seconds,
            "db_inserted_quotes": db_inserted,
            "artifacts_directory": str(self.run_manager.run_dir),
        }

        self.run_manager.save_scraping_summary(summary)

        # Print final formatted summary matching Section 18 / 19
        print("\n=======================================================")
        print("[AirGo] YATRA SCRAPING COMPLETED")
        print("=======================================================")
        print(f"Mode: {'HEADED' if not self.config.headless else 'HEADLESS'}")
        print(f"Route: {', '.join(r.route_code for r in active_routes)}")
        print(f"Horizon: {', '.join(w.window_code for w in windows)}")
        print(f"Travel Date: {', '.join(w.iso_travel_date for w in windows)}\n")
        print(f"Flights Found: {total_flights_found}")
        print(f"Flights Processed: {len(all_quote_records)}")
        print(f"Fare Options Found: {total_fare_options_found}")
        print(f"Cheapest Fares Selected: {total_fares_selected}")
        print(f"Fares Verified: {total_fares_verified}")
        print(f"Price Changes: {total_price_changes}")
        print(f"Verification Failures: {total_failed_extractions}")
        print(f"Akamai Events: {len(challenge_events)}")
        print(f"CAPTCHA Events: {total_captcha_events}\n")
        print("JSON:")
        print(f"{self.run_manager.run_dir}/data/\n")
        print("Screenshots:")
        print(f"{self.run_manager.run_dir}/screenshots/\n")
        print("Logs:")
        print(f"{self.run_manager.run_dir}/logs/\n")
        print(f"Database Records: {db_inserted}")
        print("=======================================================\n")
        return summary


async def run_yatra_harvest(
    routes: Optional[List[str]] = None,
    horizons: Optional[List[int]] = None,
    checkout: bool = False,
    headless: Optional[bool] = None,
    pause: Optional[float] = None,
    slow_mo: Optional[int] = None,
) -> Dict[str, Any]:
    """Helper entrypoint to trigger Yatra harvest with custom filters, checkout, and headed mode observability."""
    cfg = YatraScraperConfig()
    if headless is not None:
        cfg.headless = headless
        if not headless:
            from airgo.config import HEADED_SLOW_MO_MS, HEADED_OBSERVATION_DELAY
            if pause is None:
                cfg.observation_delay = HEADED_OBSERVATION_DELAY
            if slow_mo is None:
                cfg.slow_mo_ms = HEADED_SLOW_MO_MS
    if pause is not None:
        cfg.observation_delay = pause
    if slow_mo is not None:
        cfg.slow_mo_ms = slow_mo
    scraper = YatraScraper(config=cfg)
    return await scraper.run_harvest(route_codes=routes, horizons=horizons, checkout=checkout)
