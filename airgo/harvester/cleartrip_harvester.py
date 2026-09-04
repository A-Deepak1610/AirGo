"""
AirGo Cleartrip Multi-Carrier Flight Auditing Engine with Zero Dummy Data.
Extracts live observed fares, flight numbers, and checkout review proof from Cleartrip.
"""

import os
import sys
import io
import re
import csv
import json
import asyncio
import tempfile
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional

from patchright.async_api import async_playwright, BrowserContext, Page

from airgo.utils.run_manager import create_run_directory, save_run_artifact

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

CITY_NAMES = {
    "DEL": "Delhi", "BOM": "Mumbai", "BLR": "Bengaluru", "HYD": "Hyderabad",
    "CCU": "Kolkata", "MAA": "Chennai", "GOI": "Goa", "GOX": "Goa",
    "PNQ": "Pune", "AMD": "Ahmedabad", "COK": "Kochi", "GAU": "Guwahati",
    "LKO": "Lucknow", "PAT": "Patna", "JAI": "Jaipur", "SXR": "Srinagar",
    "BBI": "Bhubaneswar", "IXC": "Chandigarh", "IXR": "Ranchi", "VTZ": "Visakhapatnam",
    "TRV": "Thiruvananthapuram", "VNS": "Varanasi", "IDR": "Indore", "NAG": "Nagpur",
    "ATQ": "Amritsar", "IXB": "Bagdogra", "BDQ": "Vadodara", "UDR": "Udaipur"
}


def load_route_basket(csv_path: str, top_n: Optional[int] = None) -> List[Dict[str, Any]]:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Route basket CSV not found at: {csv_path}")

    routes = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            pair = row.get("route", "").strip().upper()
            if "-" in pair:
                origin, dest = pair.split("-", 1)
                try:
                    total_pax = int(float(str(row.get("total_pax", 0)).strip() or 0))
                except Exception:
                    total_pax = 0
                try:
                    weight = float(str(row.get("weight_traffic_within_basket", 0.0)).strip() or 0.0)
                except Exception:
                    weight = 0.0

                routes.append({
                    "rank": int(row.get("rank", len(routes) + 1)),
                    "route": pair,
                    "origin": origin.strip(),
                    "destination": dest.strip(),
                    "city1": row.get("city1", ""),
                    "city2": row.get("city2", ""),
                    "total_pax": total_pax,
                    "weight": weight
                })

    routes.sort(key=lambda r: r["rank"])
    if top_n is not None and top_n > 0:
        routes = routes[:top_n]
    return routes


async def safe_capture_screenshot(page: Page, path: str):
    """
    Smoothly scrolls down the full DOM to trigger lazy assets, then captures full_page screenshot.
    """
    try:
        await page.evaluate(r"""async () => {
            const scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
            const step = 400;
            for (let y = 0; y < scrollHeight; y += step) {
                window.scrollBy(0, step);
                await new Promise(res => setTimeout(res, 80));
            }
            window.scrollTo(0, 0);
            await new Promise(res => setTimeout(res, 200));
        }""")
    except Exception:
        pass

    try:
        await page.screenshot(path=path, full_page=True)
    except Exception as e:
        print(f"[!] Full-page screenshot fallback triggered: {e}")
        try:
            await page.screenshot(path=path, full_page=False)
        except Exception as e2:
            print(f"[❌] Screenshot failed: {e2}")


async def extract_cleartrip_search_cards(page: Page) -> List[Dict[str, Any]]:
    """
    DOM-first extraction of flight cards from Cleartrip search results page.
    Strictly extracts raw observed DOM elements with zero dummy data.
    """
    return await page.evaluate(r"""() => {
        const results = [];
        const bookButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Book');

        function findCardForButton(btn) {
            let cur = btn.parentElement;
            let card = null;
            while (cur && cur !== document.body) {
                const logos = cur.querySelectorAll('img[src*="air-logos"]');
                const books = Array.from(cur.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Book');
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

            // Find all <p> elements with airline name and flight number
            // The airline container has an <img> logo followed by two <p> tags
            const imgEl = container.querySelector('img[alt], img[src*="air-logos"]');
            let airlineName = '';
            let flightNumber = '';

            if (imgEl && imgEl.parentElement && imgEl.parentElement.parentElement) {
                const nameContainer = imgEl.parentElement.parentElement;
                const pTags = Array.from(nameContainer.querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean);
                if (pTags.length >= 1) airlineName = pTags[0];
                if (pTags.length >= 2) flightNumber = pTags[1];
            }

            // Fallback parsing from text lines excluding refundability tags
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

            // Price extraction
            let price = 0.0;
            const priceMatches = text.match(/₹\s*([\d,]+)/g);
            if (priceMatches && priceMatches.length > 0) {
                const cleanPrice = priceMatches[0].replace(/[₹,\s]/g, '');
                price = parseFloat(cleanPrice) || 0.0;
            }

            // Departure & Arrival times
            const timeMatches = text.match(/\b([012]?\d:[0-5]\d)\b/g);
            let depTime = timeMatches && timeMatches.length > 0 ? timeMatches[0] : '';
            let arrTime = timeMatches && timeMatches.length > 1 ? timeMatches[1] : '';

            // Duration
            const durMatch = text.match(/\b(\d+h\s*\d*m?|\d+m)\b/i);
            let duration = durMatch ? durMatch[1] : '';

            if (airlineName && !/refundable/i.test(airlineName) && flightNumber && price > 0) {
                results.push({
                    domIndex: i,
                    airline: airlineName,
                    flightNumber: flightNumber.replace(/\s+/g, ''),
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


async def audit_cleartrip_flight(
    context: BrowserContext,
    search_url: str,
    flight_target: Dict[str, Any],
    flight_dir: str,
    route_code: str,
    horizon_label: str
) -> Optional[Dict[str, Any]]:
    """
    Performs full multi-step checkout review for a single distinct Cleartrip flight in an isolated tab.
    """
    initial_pages = set(context.pages)
    page = await context.new_page()
    review_page = None

    try:
        await page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
        await page.wait_for_selector("button:has-text('Book')", timeout=35000)
        await page.wait_for_timeout(2000)

        # Smooth scroll to ensure all lazy cards are hydrated in the DOM
        await page.evaluate("""async () => {
            const scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
            for (let y = 0; y < Math.min(scrollHeight, 4000); y += 500) {
                window.scrollBy(0, 500);
                await new Promise(r => setTimeout(r, 60));
            }
            window.scrollTo(0, 0);
        }""")
        await page.wait_for_timeout(1000)

        # Match exact flight card by carrier and flight digits
        target_airline = flight_target.get("airline", "").strip().lower()
        target_flight_no = flight_target.get("flightNumber", "").strip()
        target_dom_index = flight_target.get("domIndex", -1)

        target_btn_index = await page.evaluate(r"""({ targetAirline, targetFlightNo, targetIndex }) => {
            const clean = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const bookButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Book');
            const cleanTargetAir = clean(targetAirline);
            const cleanTargetFlt = clean(targetFlightNo);
            const targetDigits = cleanTargetFlt.replace(/\D/g, '');

            function findCardForButton(btn) {
                let cur = btn.parentElement;
                let card = null;
                while (cur && cur !== document.body) {
                    const logos = cur.querySelectorAll('img[src*="air-logos"]');
                    const books = Array.from(cur.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Book');
                    if (books.length === 1 && logos.length >= 1) {
                        card = cur;
                    }
                    if (books.length > 1) break;
                    cur = cur.parentElement;
                }
                return card || btn.closest('div');
            }

            // 1. Scan for button whose specific card matches the flight number!
            if (cleanTargetFlt) {
                for (let i = 0; i < bookButtons.length; i++) {
                    const card = findCardForButton(bookButtons[i]);
                    if (!card) continue;
                    const t = clean(card.innerText);
                    if (t.includes(cleanTargetFlt)) {
                        return i;
                    }
                }
            }

            // 2. Scan by carrier and digits
            if (cleanTargetAir && targetDigits) {
                for (let i = 0; i < bookButtons.length; i++) {
                    const card = findCardForButton(bookButtons[i]);
                    if (!card) continue;
                    const t = clean(card.innerText);
                    if (t.includes(cleanTargetAir) && t.includes(targetDigits)) {
                        return i;
                    }
                }
            }

            // 3. Fallback to targetIndex if within bounds
            if (targetIndex >= 0 && targetIndex < bookButtons.length) {
                return targetIndex;
            }

            return -1;
        }""", {
            "targetAirline": target_airline,
            "targetFlightNo": target_flight_no,
            "targetIndex": target_dom_index
        })

        if target_btn_index < 0:
            print(f"  [!] Card match note for {flight_target['airline']} ({flight_target['flightNumber']}): Card not found")
            return None

        # Execute genuine trusted OS-level click via Patchright CDP
        book_btn = page.locator("button:has-text('Book')").nth(target_btn_index)
        await book_btn.scroll_into_view_if_needed()
        await book_btn.click()

        await page.wait_for_timeout(2000)

        # Handle 'Select your fare' modal
        select_btn = page.locator("button:has-text('Select')").first
        if await select_btn.is_visible():
            await select_btn.click()
            await page.wait_for_timeout(1500)

        cont_btn = page.locator("button:has-text('Continue')").first
        if await cont_btn.is_visible():
            await cont_btn.click()

        await page.wait_for_timeout(6000)

        # Find the review tab
        new_pages = [p for p in context.pages if p not in initial_pages and p != page]
        review_page = new_pages[-1] if new_pages else context.pages[-1]
        await review_page.wait_for_load_state("domcontentloaded")
        await review_page.wait_for_timeout(3000)

        # Check if Cleartrip returned a server error / Akamai block page
        if "failure" in review_page.url or await review_page.locator("text='Server error'").is_visible():
            review_shot = os.path.join(flight_dir, "01_checkout_review_blocked.png")
            await safe_capture_screenshot(review_page, review_shot)
            print(f"  [❌] Cleartrip blocked checkout with Akamai 'Server error' for {flight_target['airline']} ({flight_target['flightNumber']})")
            return None

        # Capture Stage 1: Checkout Review Form Screenshot
        review_shot = os.path.join(flight_dir, "01_checkout_review.png")
        await safe_capture_screenshot(review_page, review_shot)

        # Extract Fare Breakdown from Review DOM
        breakdown = await review_page.evaluate(r"""() => {
            const text = document.body.innerText;
            
            let baseFare = 0.0;
            let taxes = 0.0;
            let grandTotal = 0.0;

            const baseMatch = text.match(/Base\s*Fare[^\d]*([\d,]+)/i);
            if (baseMatch) baseFare = parseFloat(baseMatch[1].replace(/,/g, '')) || 0.0;

            const taxMatch = text.match(/Taxes[^\d]*([\d,]+)/i);
            if (taxMatch) taxes = parseFloat(taxMatch[1].replace(/,/g, '')) || 0.0;

            const totalMatch = text.match(/Total\s*Price[^\d]*([\d,]+)/i);
            if (totalMatch) grandTotal = parseFloat(totalMatch[1].replace(/,/g, '')) || 0.0;

            return {
                baseFare,
                taxes,
                grandTotal: grandTotal || (baseFare + taxes)
            };
        }""")

        quote = {
            "platform": "Cleartrip",
            "audit_timestamp": datetime.utcnow().isoformat() + "Z",
            "route": route_code,
            "advance_horizon": horizon_label,
            "airline": flight_target.get("airline"),
            "flight_number": flight_target.get("flightNumber"),
            "departure_time": flight_target.get("departureTime"),
            "arrival_time": flight_target.get("arrivalTime"),
            "duration": flight_target.get("duration"),
            "base_fare_inr": breakdown.get("baseFare", 0.0) or flight_target.get("price", 0.0),
            "taxes_inr": breakdown.get("taxes", 0.0),
            "seat_selection_fee": 0.0,
            "final_payable_total_inr": breakdown.get("grandTotal", flight_target.get("price", 0.0)),
            "screenshots": {
                "checkout_review": os.path.basename(review_shot)
            }
        }

        save_run_artifact(flight_dir, "audit_breakup.json", quote)
        return quote

    except Exception as e:
        print(f"  [❌] Error auditing Cleartrip flight {flight_target['airline']} ({flight_target['flightNumber']}): {e}")
        return None
    finally:
        try:
            await page.close()
        except Exception:
            pass
        if review_page and review_page != page:
            try:
                await review_page.close()
            except Exception:
                pass


async def launch_cleartrip_context(p, profile_dir: str) -> BrowserContext:
    try:
        return await p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            channel="msedge",
            headless=False,
            no_viewport=True,
            locale="en-IN",
            timezone_id="Asia/Kolkata"
        )
    except Exception:
        return await p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            channel="chrome",
            headless=False,
            no_viewport=True,
            locale="en-IN",
            timezone_id="Asia/Kolkata"
        )


async def run_cleartrip_harvest(
    csv_path: str,
    top_n: int = 5,
    horizons: List[int] = [1, 7, 15, 30, 45],
    flights_per_route: int = 5,
    checkout: bool = False
) -> str:
    """
    Executes Cleartrip multi-carrier search inventory harvest across DGCA routes.
    By default runs clean page-flow extraction. If checkout=True, executes deep booking audit.
    """
    routes = load_route_basket(csv_path, top_n=top_n)
    run_dir = create_run_directory(f"cleartrip_top{top_n}")

    print("=" * 95)
    print(f"🛫 AIRGO CLEARTRIP MULTI-CARRIER ROUTE HARVESTER ({'DEEP CHECKOUT' if checkout else 'PAGE FLOW'})")
    print(f"   * Routes: {len(routes)} Top DGCA Routes")
    print(f"   * Horizons: {[f'T+{h}' for h in horizons]}")
    print(f"   * Storage: {run_dir}")
    print("=" * 95)

    all_audited_quotes = []
    profile_dir = os.path.join(os.getcwd(), "runs", "patchright_chrome_profile")
    os.makedirs(profile_dir, exist_ok=True)

    booking_count = 0

    async with async_playwright() as p:
        for route_idx, route in enumerate(routes):
            origin = route["origin"]
            dest = route["destination"]
            route_code = route["route"]

            route_profile_dir = tempfile.mkdtemp(prefix=f"airgo_ct_{route_code}_")
            print(f"\n🌐 Launching fresh browser instance for Route [{route_idx + 1}/{len(routes)}]: {route_code}...")
            context = await launch_cleartrip_context(p, route_profile_dir)

            try:
                for h in horizons:
                    horizon_label = f"T+{h}"
                    dept_date = (date.today() + timedelta(days=h)).strftime("%d/%m/%Y")
                    search_url = f"https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0&class=Economy&depart_date={dept_date}&from={origin}&to={dest}&intl=n&page=loaded"

                    rh_dir = os.path.join(run_dir, route_code, horizon_label)
                    os.makedirs(rh_dir, exist_ok=True)

                    page = await context.new_page()
                    try:
                        await page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
                        await page.wait_for_selector("button:has-text('Book')", timeout=35000)
                        await page.wait_for_timeout(3000)

                        # Capture search inventory ground truth
                        search_shot = os.path.join(rh_dir, "search_results.png")
                        await safe_capture_screenshot(page, search_shot)

                        # Extract all flight cards directly from the rendered DOM
                        cards = await extract_cleartrip_search_cards(page)
                        print(f"\n✈️  [{route_code}_{horizon_label}] Found {len(cards)} live flights on Cleartrip:")

                        # Ensure carrier diversity
                        seen_carriers = set()
                        selected_flights = []
                        for c in cards:
                            carrier = c["airline"]
                            if carrier not in seen_carriers:
                                seen_carriers.add(carrier)
                                selected_flights.append(c)
                            if len(selected_flights) >= flights_per_route:
                                break

                        # Fill remaining slots up to flights_per_route
                        if len(selected_flights) < flights_per_route:
                            for c in cards:
                                if c not in selected_flights:
                                    selected_flights.append(c)
                                    if len(selected_flights) >= flights_per_route:
                                        break

                        for idx, flt in enumerate(selected_flights):
                            carrier_slug = re.sub(r'[^a-zA-Z0-9]', '', flt['airline'])
                            flight_slug = re.sub(r'[^a-zA-Z0-9]', '', flt['flightNumber'])
                            flt_dir = os.path.join(rh_dir, f"{idx+1:02d}_{carrier_slug}_{flight_slug}")
                            os.makedirs(flt_dir, exist_ok=True)

                            if checkout:
                                quote = await audit_cleartrip_flight(context, search_url, flt, flt_dir, route_code, horizon_label)
                                if quote:
                                    all_audited_quotes.append(quote)
                                    print(f"  [✅] Audited {flt['airline']:<20} ({flt['flightNumber']:<8}) | Base: INR {quote['base_fare_inr']} | Taxes: INR {quote['taxes_inr']} | Total: INR {quote['final_payable_total_inr']}")

                                booking_count += 1
                                if booking_count % 5 == 0:
                                    print(f"\n⏳ Completed {booking_count} bookings. Enforcing 30s cooldown to reset session rate limits...")
                                    await asyncio.sleep(30)
                                else:
                                    await asyncio.sleep(4)
                            else:
                                quote = {
                                    "platform": "Cleartrip",
                                    "audit_timestamp": datetime.utcnow().isoformat() + "Z",
                                    "route": route_code,
                                    "advance_horizon": horizon_label,
                                    "airline": flt["airline"],
                                    "flight_number": flt["flightNumber"],
                                    "departure_time": flt["departureTime"],
                                    "arrival_time": flt["arrivalTime"],
                                    "duration": flt["duration"],
                                    "total_fare_inr": flt["price"],
                                    "stops": flt["stops"],
                                    "screenshot": os.path.relpath(search_shot, run_dir)
                                }
                                all_audited_quotes.append(quote)
                                save_run_artifact(flt_dir, "quote.json", quote)
                                print(f"  [✅] Extracted {flt['airline']:<20} ({flt['flightNumber']:<8}) | Time: {flt['departureTime']}->{flt['arrivalTime']} | Fare: INR {flt['price']}")

                    except Exception as e:
                        print(f"[⚠️ ] {route_code}_{horizon_label} | Error: {e}")
                    finally:
                        await page.close()

            finally:
                try:
                    await context.close()
                except Exception:
                    pass
                try:
                    import shutil
                    shutil.rmtree(route_profile_dir, ignore_errors=True)
                except Exception:
                    pass

            if route_idx < len(routes) - 1:
                print(f"\n⏳ Completed Route {route_code}. Cooling down for 30s before launching next route session...")
                await asyncio.sleep(30)

    save_run_artifact(run_dir, "audited_cleartrip_quotes.json", all_audited_quotes)
    print(f"\n🎉 Cleartrip Harvest Completed! Total Quotes Saved: {len(all_audited_quotes)}")
    return run_dir
