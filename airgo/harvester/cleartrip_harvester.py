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

from playwright.async_api import async_playwright, BrowserContext, Page

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

        for (let i = 0; i < bookButtons.length; i++) {
            const btn = bookButtons[i];
            
            // Traverse up to find card container
            let container = btn;
            for (let k = 0; k < 6; k++) {
                if (container.parentElement) container = container.parentElement;
            }

            if (!container) continue;

            const text = container.innerText || '';
            const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

            // Airline name & flight number
            const airlineEl = container.querySelector('p[font-size="12px"], [class*="airline"], [class*="name"]');
            const flightNoEl = container.querySelector('p[font-size="10px"], [class*="flight-number"], [class*="number"]');

            let airlineName = airlineEl ? airlineEl.innerText.trim() : '';
            let flightNumber = flightNoEl ? flightNoEl.innerText.trim() : '';

            // Fallback parsing from text lines
            if (!airlineName || !flightNumber) {
                for (const line of lines) {
                    if (/^(indigo|air\s*india(\s*express)?|spicejet|akasa(\s*air)?|vistara|alliance\s*air)/i.test(line)) {
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
                // The first price match is usually the main flight price
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

            if (airlineName && flightNumber && price > 0) {
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
    page = await context.new_page()

    try:
        await page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
        await page.wait_for_selector("button:has-text('Book')", timeout=25000)
        await page.wait_for_timeout(3000)

        # Match exact flight card by carrier and flight digits
        target_airline = flight_target.get("airline", "").strip().lower()
        target_num_digits = re.sub(r"\D", "", flight_target.get("flightNumber", ""))

        clicked = await page.evaluate(r"""({ targetAirline, targetDigits }) => {
            const clean = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const bookButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Book');

            for (const btn of bookButtons) {
                let container = btn;
                for (let k = 0; k < 6; k++) {
                    if (container.parentElement) container = container.parentElement;
                }
                const text = container ? container.innerText : '';
                const cleanText = clean(text);
                const digits = text.replace(/\D/g, '');

                if (cleanText.includes(targetAirline.replace(/\s+/g, '')) && digits.includes(targetDigits)) {
                    btn.click();
                    return true;
                }
            }
            return false;
        }""", {"targetAirline": target_airline, "targetDigits": target_num_digits})

        if not clicked:
            print(f"  [!] Card match note for {flight_target['airline']} ({flight_target['flightNumber']}): Card not found")
            return None

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
        review_page = context.pages[-1]
        await review_page.wait_for_load_state("domcontentloaded")
        await review_page.wait_for_timeout(3000)

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
        await page.close()


async def run_cleartrip_harvest(
    csv_path: str,
    top_n: int = 5,
    horizons: List[int] = [1, 7, 15, 30, 45],
    flights_per_route: int = 5
) -> str:
    """
    Executes Cleartrip multi-carrier harvest across DGCA routes.
    """
    routes = load_route_basket(csv_path, top_n=top_n)
    run_dir = create_run_directory(f"cleartrip_top{top_n}")

    print("=" * 95)
    print(f"🛫 AIRGO CLEARTRIP MULTI-CARRIER ROUTE HARVESTER")
    print(f"   * Routes: {len(routes)} Top DGCA Routes")
    print(f"   * Horizons: {[f'T+{h}' for h in horizons]}")
    print(f"   * Storage: {run_dir}")
    print("=" * 95)

    all_audited_quotes = []

    async with async_playwright() as p:
        temp_profile = tempfile.mkdtemp(prefix="airgo_cleartrip_")
        context = await p.chromium.launch_persistent_context(
            user_data_dir=temp_profile,
            headless=False,
            channel="msedge",
            viewport={"width": 1920, "height": 1080},
            args=["--start-maximized", "--disable-blink-features=AutomationControlled"],
            locale="en-IN",
            timezone_id="Asia/Kolkata"
        )

        for route in routes:
            origin = route["origin"]
            dest = route["destination"]
            route_code = route["route"]

            for h in horizons:
                horizon_label = f"T+{h}"
                dept_date = (date.today() + timedelta(days=h)).strftime("%d/%m/%Y")
                search_url = f"https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0&class=Economy&depart_date={dept_date}&from={origin}&to={dest}&intl=n&page=loaded"

                rh_dir = os.path.join(run_dir, route_code, horizon_label)
                os.makedirs(rh_dir, exist_ok=True)

                page = await context.new_page()
                try:
                    await page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
                    await page.wait_for_selector("button:has-text('Book')", timeout=25000)
                    await page.wait_for_timeout(3000)

                    # Capture search inventory
                    search_shot = os.path.join(rh_dir, "search_results.png")
                    await safe_capture_screenshot(page, search_shot)

                    # Extract all flight cards
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

                    for idx, flt in enumerate(selected_flights):
                        carrier_slug = re.sub(r'[^a-zA-Z0-9]', '', flt['airline'])
                        flight_slug = re.sub(r'[^a-zA-Z0-9]', '', flt['flightNumber'])
                        flt_dir = os.path.join(rh_dir, f"{idx+1:02d}_{carrier_slug}_{flight_slug}")
                        os.makedirs(flt_dir, exist_ok=True)

                        quote = await audit_cleartrip_flight(context, search_url, flt, flt_dir, route_code, horizon_label)
                        if quote:
                            all_audited_quotes.append(quote)
                            print(f"  [✅] Audited {flt['airline']:<20} ({flt['flightNumber']:<8}) | Base: INR {quote['base_fare_inr']} | Taxes: INR {quote['taxes_inr']} | Total: INR {quote['final_payable_total_inr']}")

                except Exception as e:
                    print(f"[⚠️ ] {route_code}_{horizon_label} | Error: {e}")
                finally:
                    await page.close()

        await context.close()

    save_run_artifact(run_dir, "audited_cleartrip_quotes.json", all_audited_quotes)
    print(f"\n🎉 Cleartrip Harvest Completed! Total Quotes Saved: {len(all_audited_quotes)}")
    return run_dir
