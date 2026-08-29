"""
Cleartrip Live Flight Scraper & Fare Extraction Engine.
Features:
- 100% Real-time DOM attribute extraction for Cleartrip's desktop web app
- Zero Dummy Data Policy — no synthetic variables or hardcoded fallbacks
- Timestamped audit storage in runs/YYYY-MM-DD_HH-MM-SS_cleartrip/
- Full CLI support: --origin, --dest, --date, --visible, --pause, --output
"""

import os
import sys
import io
import re
import json
import time
import argparse
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from playwright.sync_api import sync_playwright

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from airgo.scrapers.cleartrip_scraper import parse_cleartrip_flight_card, CITY_MAP, AIRLINE_LOOKUP

# Fix Windows terminal UTF-8 encoding
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass


def scrape_cleartrip(
    origin: str = "DEL",
    destination: str = "BOM",
    dep_date: Optional[str] = None,
    headless: bool = True,
    pause_for_inspection: bool = False
) -> List[Dict[str, Any]]:
    origin = origin.upper().strip()
    destination = destination.upper().strip()

    target_date = datetime.strptime(dep_date, "%Y-%m-%d").date() if dep_date else (date.today() + timedelta(days=1))
    date_formatted = target_date.strftime("%d/%m/%Y")
    orig_city = CITY_MAP.get(origin, origin)
    dest_city = CITY_MAP.get(destination, destination)

    # Create timestamped run folder for audit trail
    run_timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    run_dir = os.path.join(ROOT_DIR, "runs", f"{run_timestamp}_cleartrip_{origin}_{destination}")
    os.makedirs(run_dir, exist_ok=True)

    search_url = (
        f"https://www.cleartrip.com/flights/results?"
        f"adults=1&childs=0&infants=0&class=Economy&depart_date={date_formatted}"
        f"&from={origin}&to={destination}&intl=n"
        f"&origin={origin}%20-%20{orig_city},%20IN&destination={destination}%20-%20{dest_city},%20IN"
    )

    print("\n" + "=" * 85)
    print("✈️  CLEARTRIP LIVE FLIGHT SCRAPER & REAL-TIME FARE ENGINE")
    print("=" * 85)
    print(f"  Route:          {origin} ({orig_city}) -> {destination} ({dest_city})")
    print(f"  Departure Date: {target_date} ({date_formatted})")
    print(f"  Mode:           {'Headless Chromium' if headless else '🖥️ Visible Chromium Window'}")
    print(f"  Target URL:     {search_url}")
    print(f"  Run Directory:  {run_dir}")
    print("=" * 85)
    print("\n[1/4] Launching Chromium browser...")

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=headless,
            slow_mo=30 if not headless else 0,
            args=["--start-maximized", "--no-sandbox"]
        )
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="en-IN",
            viewport={"width": 1920, "height": 1080}
        )
        page = context.new_page()

        try:
            print("[2/4] Navigating to Cleartrip search page and waiting for live inventory...")
            page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(4000)

            # Scroll to trigger lazy loading of flight catalog
            print("[3/4] Scanning live flight inventory across airlines...")
            for _ in range(3):
                page.evaluate("window.scrollBy(0, 1000);")
                page.wait_for_timeout(800)
            page.evaluate("window.scrollTo(0, 0);")
            page.wait_for_timeout(500)

            # Capture visual screenshot proof for ground-truth audit
            proof_path = os.path.join(run_dir, "screenshot_proof.png")
            page.screenshot(path=proof_path, full_page=False)
            print(f"📸 Saved Ground-Truth Proof Screenshot -> {proof_path}")

            # Save rendered DOM html
            dom_path = os.path.join(run_dir, "search_results.html")
            with open(dom_path, "w", encoding="utf-8") as f:
                f.write(page.content())
            print(f"📄 Saved Rendered DOM HTML -> {dom_path}")

            # Extract raw DOM flight cards
            cards_data = page.evaluate("""() => {
                const flights = [];
                const buttons = Array.from(document.querySelectorAll('button'));
                
                buttons.forEach(btn => {
                    const btnText = (btn.innerText || '').trim();
                    if (btnText === 'Book' || btnText.includes('Book') || btnText.includes('View fare')) {
                        let container = btn.parentElement;
                        for (let i = 0; i < 7; i++) {
                            if (!container) break;
                            const text = container.innerText || '';
                            if (text.includes('₹') && (/\\d{1,2}:\\d{2}/.test(text))) {
                                flights.push({
                                    text: text,
                                    html: container.outerHTML
                                });
                                break;
                            }
                            container = container.parentElement;
                        }
                    }
                });
                return flights;
            }""")

            print(f"[4/4] Parsing {len(cards_data)} raw flight card elements from live DOM...\n")

            seen_keys = set()
            for card in cards_data:
                parsed = parse_cleartrip_flight_card(card.get("text", ""), card.get("html", ""))
                if not parsed:
                    continue

                key = f"{parsed['carrier_code']}_{parsed['flight_number']}_{parsed['departure_time']}_{parsed['total_fare']}"
                if key in seen_keys:
                    continue
                seen_keys.add(key)

                parsed["origin"] = origin
                parsed["destination"] = destination
                parsed["departure_date"] = str(target_date)
                parsed["search_url"] = search_url
                results.append(parsed)

            # Save run summary JSON in timestamped run dir
            summary_path = os.path.join(run_dir, "run_summary.json")
            with open(summary_path, "w", encoding="utf-8") as f:
                json.dump({
                    "timestamp": run_timestamp,
                    "ota": "Cleartrip",
                    "origin": origin,
                    "destination": destination,
                    "departure_date": str(target_date),
                    "search_url": search_url,
                    "quotes_count": len(results),
                    "quotes": results
                }, f, indent=2, ensure_ascii=False)
            print(f"📊 Saved Run Summary JSON -> {summary_path}")

            if pause_for_inspection and not headless:
                print("⏸️ Paused for 10 seconds for visual inspection...")
                page.wait_for_timeout(10000)

        except Exception as e:
            print(f"[!] Error scraping Cleartrip live page: {e}")
        finally:
            browser.close()

    if not results:
        print(f"\n⚠️ FAIL FAST WARNING: No valid live Cleartrip quotes extracted for {origin}->{destination} on {target_date}.\n")

    return results


def main():
    parser = argparse.ArgumentParser(description="Cleartrip Live Flight Scraper & CPI Fare Extractor")
    parser.add_argument("--origin", type=str, default="DEL", help="Origin airport code (default: DEL)")
    parser.add_argument("--dest", type=str, default="BOM", help="Destination airport code (default: BOM)")
    parser.add_argument("--date", type=str, default=None, help="Departure date in YYYY-MM-DD format (default: tomorrow)")
    parser.add_argument("--visible", action="store_true", help="Open visible Chromium browser window on screen")
    parser.add_argument("--pause", action="store_true", help="Pause visible browser for visual inspection")
    parser.add_argument("--output", type=str, default="test_cleartrip.json", help="Output JSON filename (default: test_cleartrip.json)")

    args = parser.parse_args()

    quotes = scrape_cleartrip(
        origin=args.origin,
        destination=args.dest,
        dep_date=args.date,
        headless=not args.visible,
        pause_for_inspection=args.pause
    )

    if not quotes:
        print("\n[!] Zero valid live flight quotes extracted.\n")
        return

    print("=" * 110)
    print(f"{'AIRLINE':<20} | {'FLIGHT':<10} | {'DEP TIME':<9} | {'ARR TIME':<9} | {'DURATION':<9} | {'STOPS':<6} | {'BASE FARE':<11} | {'TOTAL FARE'}")
    print("=" * 110)
    for q in quotes:
        print(
            f"{q['carrier']:<20} | "
            f"{q['flight_number']:<10} | "
            f"{q['departure_time']:<9} | "
            f"{q['arrival_time']:<9} | "
            f"{q['duration']:<9} | "
            f"{q['stops']:<6} | "
            f"INR {q['base_fare']:<7} | "
            f"INR {q['total_fare']}"
        )
    print("=" * 110)
    print(f"\n✅ Successfully Extracted: {len(quotes)} 100% Real Live Cleartrip Flight Quotes")

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(quotes, f, indent=2, ensure_ascii=False)
    print(f"💾 Results saved to: {args.output}\n")


if __name__ == "__main__":
    main()
