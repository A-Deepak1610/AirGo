"""
Cleartrip Airfare Scraper with Playwright/Patchright and Chrome.
Searches specified routes and advance purchase windows, extracts top 5 listings,
attempts deep checkout audits (review, seat map, payment gateway),
and writes screenshot evidence and JSON artifacts to runs/ directory.
Strictly Zero Dummy Data Policy.
"""

import os
import sys
import io
import json
import asyncio
import tempfile
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path

from patchright.async_api import async_playwright, BrowserContext, Page

# Ensure UTF-8 stdout encoding on Windows consoles
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

CITY_LOOKUP = {
    "DEL": "New Delhi", "BOM": "Mumbai", "BLR": "Bengaluru", "HYD": "Hyderabad",
    "CCU": "Kolkata", "MAA": "Chennai", "GOI": "Goa", "GOX": "Goa",
    "PNQ": "Pune", "AMD": "Ahmedabad", "COK": "Kochi", "GAU": "Guwahati",
    "LKO": "Lucknow", "PAT": "Patna", "JAI": "Jaipur", "SXR": "Srinagar",
    "BBI": "Bhubaneswar", "IXC": "Chandigarh", "IXR": "Ranchi", "VTZ": "Visakhapatnam",
    "TRV": "Thiruvananthapuram", "VNS": "Varanasi", "IDR": "Indore", "NAG": "Nagpur"
}


class CleartripScraper:
    def __init__(
        self,
        route: str = "BOM-DEL",
        horizons: List[int] = None,
        headless: bool = True,
        runs_dir: Optional[str] = None
    ):
        self.route = route.upper()
        parts = self.route.split("-")
        if len(parts) != 2:
            raise ValueError(f"Invalid route format: '{route}'. Expected format 'ORIGIN-DEST' (e.g. 'BOM-DEL').")
        self.origin = parts[0]
        self.dest = parts[1]
        self.horizons = horizons if horizons is not None else [1, 7, 15, 30, 45]
        self.headless = headless
        
        # Base runs directory
        workspace_dir = Path(__file__).resolve().parent.parent.parent.parent
        self.base_runs_dir = Path(runs_dir) if runs_dir else workspace_dir / "runs"
        
        # Timestamped run folder: runs/YYYY-MM-DD_HH-MM-SS_cleartrip/
        timestamp_str = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        self.run_folder = self.base_runs_dir / f"{timestamp_str}_cleartrip"
        self.run_folder.mkdir(parents=True, exist_ok=True)
        
        print(f"[CleartripScraper] Initialized run folder: {self.run_folder}")

    async def _launch_browser(self, p, profile_dir: str) -> BrowserContext:
        """Launches persistent Chrome context with anti-bot stealth flags."""
        args = [
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-infobars",
            "--window-position=0,0",
            "--ignore-certificate-errors",
            "--ignore-certificate-errors-spki-list",
            "--disable-web-security",
        ]
        return await p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            channel="chrome",
            headless=self.headless,
            args=args,
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            locale="en-IN",
            timezone_id="Asia/Kolkata"
        )

    async def _safe_capture_screenshot(self, page: Page, path: Path):
        """Scrolls and captures high-resolution screenshot without exceeding Chromium limits."""
        path.parent.mkdir(parents=True, exist_ok=True)
        try:
            await page.evaluate(r"""async () => {
                const scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
                const step = 400;
                for (let y = 0; y < Math.min(scrollHeight, 3000); y += step) {
                    window.scrollBy(0, step);
                    await new Promise(res => setTimeout(res, 50));
                }
                window.scrollTo(0, 0);
                await new Promise(res => setTimeout(res, 100));
            }""")
        except Exception:
            pass

        try:
            await page.screenshot(path=str(path), full_page=True)
        except Exception:
            try:
                await page.screenshot(path=str(path), full_page=False)
            except Exception as e:
                print(f"[!] Screenshot capture warning: {e}")

    async def _extract_flight_cards(self, page: Page) -> List[Dict[str, Any]]:
        """Extracts live flight listings from rendered search DOM."""
        return await page.evaluate(r"""() => {
            const results = [];
            const bookButtons = Array.from(document.querySelectorAll('button')).filter(
                b => b.innerText.trim().toLowerCase() === 'book'
            );

            function findCardForButton(btn) {
                let cur = btn.parentElement;
                let card = null;
                while (cur && cur !== document.body) {
                    const logos = cur.querySelectorAll('img[src*="air-logos"]');
                    const books = Array.from(cur.querySelectorAll('button')).filter(b => b.innerText.trim().toLowerCase() === 'book');
                    if (books.length === 1 && logos.length >= 1) {
                        card = cur;
                    }
                    if (books.length > 1) break;
                    cur = cur.parentElement;
                }
                return card || btn.closest('div');
            }

            for (let i = 0; i < bookButtons.length; i++) {
                const btn = bookButtons[i];
                const container = findCardForButton(btn);
                if (!container) continue;

                const text = container.innerText || '';

                let airlineName = '';
                let flightNumber = '';

                const imgEl = container.querySelector('img[alt], img[src*="air-logos"]');
                if (imgEl && imgEl.parentElement && imgEl.parentElement.parentElement) {
                    const nameContainer = imgEl.parentElement.parentElement;
                    const pTags = Array.from(nameContainer.querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean);
                    if (pTags.length >= 1) airlineName = pTags[0];
                    if (pTags.length >= 2) flightNumber = pTags[1];
                }

                if (!airlineName || /refundable/i.test(airlineName)) {
                    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                    for (const line of lines) {
                        if (/^(indigo|air\s*india(\s*express)?|spicejet|akasa(\s*air)?|vistara|alliance\s*air|star\s*air)$/i.test(line)) {
                            airlineName = line;
                        }
                        if (/^[0-9A-Z]{2}[-\s]?[0-9]{3,4}$/i.test(line)) {
                            flightNumber = line;
                        }
                    }
                }

                let price = 0.0;
                const priceMatches = text.match(/₹\s*([\d,]+)/g);
                if (priceMatches && priceMatches.length > 0) {
                    const cleanPrice = priceMatches[0].replace(/[₹,\s]/g, '');
                    price = parseFloat(cleanPrice) || 0.0;
                }

                const timeMatches = text.match(/\b([012]?\d:[0-5]\d)\b/g);
                let depTime = timeMatches && timeMatches.length > 0 ? timeMatches[0] : '';
                let arrTime = timeMatches && timeMatches.length > 1 ? timeMatches[1] : '';

                const durMatch = text.match(/\b(\d+h\s*\d*m?|\d+m)\b/i);
                let duration = durMatch ? durMatch[1] : '';

                if (price > 0) {
                    results.push({
                        domIndex: i,
                        airline: airlineName || 'Unknown Airline',
                        flightNumber: (flightNumber || 'FLT').replace(/\s+/g, ''),
                        departureTime: depTime,
                        arrivalTime: arrTime,
                        duration: duration,
                        price: price,
                        stops: /non-?stop/i.test(text) ? 0 : 1
                    });
                }
            }
            return results;
        }""")

    async def _attempt_deep_checkout(
        self,
        context: BrowserContext,
        page: Page,
        window_dir: Path,
        top_flight: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Attempts deep checkout navigation to capture:
        01_checkout_review.png, 02_aircraft_seat_map.png, 03_final_payment_gateway.png.
        If deep checkout encounters errors, gracefully falls back to search prices.
        """
        audit_result = {
            "checkout_successful": False,
            "base_fare": None,
            "taxes": None,
            "convenience_fee": None,
            "total_fare": top_flight["price"],
            "notes": ""
        }

        try:
            book_buttons = page.locator("button:has-text('Book')")
            if await book_buttons.count() == 0:
                audit_result["notes"] = "No Book buttons found on page."
                return audit_result

            print(f"  [Deep Checkout] Clicking Book on top flight {top_flight['airline']} ({top_flight['flightNumber']})...")
            await book_buttons.first.click()
            await page.wait_for_timeout(2500)

            # Check if 'Select your fare' modal appeared
            select_btn = page.locator("button:has-text('Select')").first
            if await select_btn.count() > 0:
                print("  [Deep Checkout] Fare options modal presented. Clicking 'Select'...")
                await select_btn.click()
                await page.wait_for_timeout(1500)

            continue_btn = page.locator("button:has-text('Continue')").first
            checkout_page = None

            if await continue_btn.count() > 0:
                print("  [Deep Checkout] Clicking 'Continue'...")
                try:
                    async with context.expect_page(timeout=8000) as p_info:
                        await continue_btn.click()
                    checkout_page = await p_info.value
                except Exception:
                    await continue_btn.click()
                    await page.wait_for_timeout(4000)
                    checkout_page = context.pages[-1] if len(context.pages) > 1 else page
            else:
                checkout_page = context.pages[-1] if len(context.pages) > 1 else page

            await checkout_page.wait_for_load_state("domcontentloaded")
            await checkout_page.wait_for_timeout(4000)

            # Step 1: 01_checkout_review.png
            review_shot = window_dir / "01_checkout_review.png"
            await self._safe_capture_screenshot(checkout_page, review_shot)
            print(f"  [Deep Checkout] Saved: {review_shot.name}")

            # Inspect review text for breakdown
            breakdown = await checkout_page.evaluate(r"""() => {
                const text = document.body.innerText;
                let base = null, taxes = null, grand = null;
                const bMatch = text.match(/Base\s*Fare[^\d]*([\d,]+)/i);
                if (bMatch) base = parseFloat(bMatch[1].replace(/,/g, ''));
                const tMatch = text.match(/Taxes[^\d]*([\d,]+)/i);
                if (tMatch) taxes = parseFloat(tMatch[1].replace(/,/g, ''));
                const gMatch = text.match(/Total\s*Price[^\d]*([\d,]+)/i);
                if (gMatch) grand = parseFloat(gMatch[1].replace(/,/g, ''));
                return { base, taxes, grand, hasError: /server error|try again/i.test(text) };
            }""")

            if breakdown.get("hasError"):
                audit_result["notes"] = "OTA checkout gateway returned server error; falling back to listing price."
                return audit_result

            if breakdown.get("base") or breakdown.get("grand"):
                audit_result["checkout_successful"] = True
                audit_result["base_fare"] = breakdown.get("base")
                audit_result["taxes"] = breakdown.get("taxes")
                audit_result["total_fare"] = breakdown.get("grand") or top_flight["price"]
                audit_result["notes"] = "Observed exact base fare and tax breakdown from checkout review."

            # Step 2: Look for Seat Selection / Seat Map
            seat_btn = checkout_page.locator("button:has-text('Select Seat'), button:has-text('Seats'), a:has-text('Seats')").first
            if await seat_btn.count() > 0:
                try:
                    await seat_btn.click()
                    await checkout_page.wait_for_timeout(3000)
                    seat_shot = window_dir / "02_aircraft_seat_map.png"
                    await self._safe_capture_screenshot(checkout_page, seat_shot)
                    print(f"  [Deep Checkout] Saved: {seat_shot.name}")
                except Exception as se:
                    print(f"  [!] Seat map capture note: {se}")

            # Step 3: Look for Payment Gateway / Continue to Pay
            pay_btn = checkout_page.locator("button:has-text('Continue to payment'), button:has-text('Pay Now'), button:has-text('Proceed to Pay')").first
            if await pay_btn.count() > 0:
                try:
                    await pay_btn.click()
                    await checkout_page.wait_for_timeout(3000)
                    pay_shot = window_dir / "03_final_payment_gateway.png"
                    await self._safe_capture_screenshot(checkout_page, pay_shot)
                    print(f"  [Deep Checkout] Saved: {pay_shot.name}")
                except Exception as pe:
                    print(f"  [!] Payment gateway capture note: {pe}")

            if checkout_page != page:
                await checkout_page.close()

        except Exception as e:
            audit_result["notes"] = f"Deep checkout exception ({e}); retained search result price."

        return audit_result

    async def run(self) -> Dict[str, Any]:
        """
        Executes search and extraction across configured advance purchase horizons.
        """
        print("=" * 80)
        print(f"[AirGo Cleartrip Scraper] Target Route: {self.route}")
        print(f"                        Horizons    : {[f'T+{h}' for h in self.horizons]}")
        print(f"                        Output Run  : {self.run_folder}")
        print("=" * 80)

        all_quotes: List[Dict[str, Any]] = []
        horizon_summaries: List[Dict[str, Any]] = []
        today_date = date.today()

        profile_dir = tempfile.mkdtemp(prefix="airgo_ct_run_")

        async with async_playwright() as p:
            context = await self._launch_browser(p, profile_dir)
            try:
                for h in self.horizons:
                    horizon_label = f"T+{h}"
                    travel_dt = today_date + timedelta(days=h)
                    dept_date_str = travel_dt.strftime("%d/%m/%Y")

                    window_dir = self.run_folder / self.route / horizon_label
                    window_dir.mkdir(parents=True, exist_ok=True)

                    search_url = (
                        f"https://www.cleartrip.com/flights/results?"
                        f"adults=1&childs=0&infants=0&class=Economy&depart_date={dept_date_str}"
                        f"&from={self.origin}&to={self.dest}&intl=n&page=loaded"
                    )

                    print(f"\n[Scraping] {self.route} | {horizon_label} (Travel Date: {dept_date_str})...")
                    page = await context.new_page()

                    try:
                        res = await page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
                        await page.wait_for_timeout(6000)

                        # Capture 00_search_results.png
                        shot_00 = window_dir / "00_search_results.png"
                        await self._safe_capture_screenshot(page, shot_00)
                        print(f"  [Screenshot] Saved: {shot_00.name}")

                        # Extract listings
                        raw_cards = await self._extract_flight_cards(page)
                        print(f"  [Observed] Total live flights rendered: {len(raw_cards)}")

                        # Take top 5 listings
                        top5 = raw_cards[:5]

                        # Attempt deep checkout on flight #0
                        deep_audit = None
                        if top5:
                            deep_audit = await self._attempt_deep_checkout(context, page, window_dir, top5[0])

                        # Format quotes
                        horizon_quotes = []
                        for rank, card in enumerate(top5):
                            is_top_flight = (rank == 0)
                            base_fare = None
                            taxes = None
                            if is_top_flight and deep_audit and deep_audit.get("checkout_successful"):
                                base_fare = deep_audit.get("base_fare")
                                taxes = deep_audit.get("taxes")

                            q = {
                                "rank": rank + 1,
                                "platform": "Cleartrip",
                                "platform_type": "ota",
                                "route": self.route,
                                "origin": self.origin,
                                "destination": self.dest,
                                "travel_date": travel_dt.isoformat(),
                                "advance_purchase_days": h,
                                "window": horizon_label,
                                "airline": card["airline"],
                                "flight_number": card["flightNumber"],
                                "departure_time": card["departureTime"],
                                "arrival_time": card["arrivalTime"],
                                "duration": card["duration"],
                                "stops": card["stops"],
                                "search_price": card["price"],
                                "deep_checkout_base_fare": base_fare,
                                "deep_checkout_taxes": taxes,
                                "final_price": card["price"],
                                "currency": "INR",
                                "fare_class": "Economy",
                                "scraped_at": datetime.utcnow().isoformat(),
                                "screenshot_evidence": f"{self.route}/{horizon_label}/00_search_results.png"
                            }
                            horizon_quotes.append(q)
                            all_quotes.append(q)

                        min_p = min([q["final_price"] for q in horizon_quotes]) if horizon_quotes else None
                        max_p = max([q["final_price"] for q in horizon_quotes]) if horizon_quotes else None

                        h_summary = {
                            "horizon": horizon_label,
                            "travel_date": travel_dt.isoformat(),
                            "flights_found": len(raw_cards),
                            "top_5_extracted": len(horizon_quotes),
                            "min_price": min_p,
                            "max_price": max_p,
                            "deep_checkout_audit": deep_audit
                        }
                        horizon_summaries.append(h_summary)

                        print(f"  [Summary] Top {len(horizon_quotes)} quotes recorded (Min: Rs {min_p}, Max: Rs {max_p})")

                    except Exception as he:
                        print(f"  [!] Error scraping {self.route}_{horizon_label}: {he}")
                    finally:
                        await page.close()

            finally:
                await context.close()
                import shutil
                shutil.rmtree(profile_dir, ignore_errors=True)

        # Write quotes.json at root of run folder
        quotes_file = self.run_folder / "quotes.json"
        with open(quotes_file, "w", encoding="utf-8") as f:
            json.dump(all_quotes, f, indent=2)

        # Write run_summary.json at root of run folder
        summary_file = self.run_folder / "run_summary.json"
        summary_data = {
            "scraper": "Cleartrip",
            "channel": "chrome",
            "route": self.route,
            "horizons": [f"T+{h}" for h in self.horizons],
            "total_quotes_captured": len(all_quotes),
            "run_completed_at": datetime.utcnow().isoformat(),
            "horizon_details": horizon_summaries,
            "run_folder": str(self.run_folder)
        }
        with open(summary_file, "w", encoding="utf-8") as f:
            json.dump(summary_data, f, indent=2)

        print("\n" + "=" * 80)
        print(f"[AirGo Cleartrip Scraper] SCRAPING COMPLETE!")
        print(f"   * Total Quotes Captured : {len(all_quotes)}")
        print(f"   * Artifacts Folder      : {self.run_folder}")
        print(f"   * Quotes JSON           : {quotes_file.name}")
        print(f"   * Run Summary JSON      : {summary_file.name}")
        print("=" * 80)

        return summary_data


def run_cleartrip_scrape(
    route: str = "BOM-DEL",
    horizons: List[int] = None,
    headless: bool = True
) -> Dict[str, Any]:
    scraper = CleartripScraper(route=route, horizons=horizons, headless=headless)
    return asyncio.run(scraper.run())


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Cleartrip Flight Scraper with Patchright & Chrome")
    parser.add_argument("--route", type=str, default="BOM-DEL", help="Route code e.g. BOM-DEL")
    parser.add_argument("--horizons", type=str, default="1,7,15,30,45", help="Comma-separated advance windows e.g. 1,7,15,30,45")
    parser.add_argument("--visible", action="store_true", help="Launch visible Chrome browser window (non-headless)")
    args = parser.parse_args()

    horizon_list = [int(x.strip()) for x in args.horizons.split(",") if x.strip().isdigit()]
    run_cleartrip_scrape(route=args.route, horizons=horizon_list, headless=not args.visible)
