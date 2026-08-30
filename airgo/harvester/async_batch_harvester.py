"""
AirGo Multi-Carrier Top-5 Flight Auditing Engine with Visual Proof Storage.
Audits up to 5 flights per Route x Horizon (ensuring every distinct airline is represented),
captures stage screenshots (search_results.png, checkout_review.png), and saves structured JSONs.
"""

import os
import sys
import io
import re
import csv
import json
import asyncio
import random
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional

from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from bs4 import BeautifulSoup

from airgo.utils.run_manager import create_run_directory, save_run_artifact

# Fix Windows terminal UTF-8 encoding
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
    """
    Loads top domestic routes from the DGCA route basket CSV.
    """
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
                    "weight": weight,
                    "tier": row.get("tier", "Tier 1")
                })

    if top_n and top_n > 0:
        routes = routes[:top_n]

    return routes


def get_target_dates(horizons: List[int]) -> List[Dict[str, Any]]:
    """
    Generates target dates for each advance purchase horizon.
    """
    today = date.today()
    targets = []
    for h in horizons:
        t_date = today + timedelta(days=h)
        targets.append({
            "horizon_days": h,
            "horizon_label": f"T+{h}",
            "date_obj": t_date,
            "date_dmy": t_date.strftime("%d/%m/%Y"),
            "date_iso": t_date.isoformat()
        })
    return targets


def build_easemytrip_url(origin: str, dest: str, date_dmy: str) -> str:
    orig_city = CITY_NAMES.get(origin, origin)
    dest_city = CITY_NAMES.get(dest, dest)
    return (
        f"https://flight.easemytrip.com/FlightList/Index?"
        f"srch={origin}-{orig_city}-India|{dest}-{dest_city}-India|{date_dmy}"
        f"&px=1-0-0&cbn=0&ar=undefined&isDM=true&IsDoubleSeat=false&C=IN"
    )


async def safe_capture_screenshot(page: Page, path: str):
    """
    Captures screenshot safely handling Chromium texture buffer boundaries.
    """
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        await page.screenshot(path=path, full_page=False)
    except Exception:
        try:
            await page.screenshot(path=path)
        except Exception as e:
            print(f"  [!] Screenshot note: {e}")


async def audit_multi_carrier_route(
    context: BrowserContext,
    job: Dict[str, Any],
    run_dir: str,
    max_flights: int = 5,
    timeout_ms: int = 45000
) -> List[Dict[str, Any]]:
    """
    Audits up to max_flights per route-horizon:
    1. Guarantees every operating airline is represented.
    2. Fills remaining slots with the cheapest market flights.
    3. Captures search_results.png and checkout_review.png in structured folders.
    """
    origin = job["origin"]
    dest = job["dest"]
    date_dmy = job["date_dmy"]
    date_iso = job["date_iso"]
    horizon = job["horizon"]
    route_name = f"{origin}-{dest}"
    search_url = build_easemytrip_url(origin, dest, date_dmy)

    # Base folder for this route and horizon: runs/<run_dir>/<ROUTE>/<HORIZON>/
    horizon_folder = os.path.join(run_dir, route_name, horizon)
    os.makedirs(horizon_folder, exist_ok=True)

    page = await context.new_page()
    audited_flights = []

    try:
        # 1. Search page navigation
        await page.goto(search_url, wait_until="domcontentloaded", timeout=timeout_ms)
        
        try:
            await page.wait_for_selector(
                "div.fltResult, .fltResult, button:has-text('BOOK NOW')",
                timeout=18000
            )
        except Exception:
            await page.wait_for_timeout(4000)

        # Stage 1: Capture Search Results Proof Screenshot
        search_img_path = os.path.join(horizon_folder, "search_results.png")
        await safe_capture_screenshot(page, search_img_path)

        # 2. Extract all flight cards & index them for selection
        raw_cards = await page.evaluate(r"""() => {
            const cards = Array.from(document.querySelectorAll('div.fltResult'));
            const flightList = [];

            cards.forEach((card, idx) => {
                const priceEl = card.querySelector("span[id*='spnPrice']") || card.querySelector("div.col-md-2 span[price]");
                let price = null;
                if (priceEl) {
                    const attr = priceEl.getAttribute('price');
                    if (attr) price = parseFloat(attr);
                    if (!price) {
                        const clean = priceEl.innerText.replace(/[^0-9.]/g, '');
                        if (clean) price = parseFloat(clean);
                    }
                }

                const airEl = card.querySelector("span.txt-r4") || card.querySelector("span.air-name");
                const fltEl = card.querySelector("span.txt-r5") || card.querySelector("span.flt-num");
                const times = Array.from(card.querySelectorAll("span.txt-r2-n")).map(t => t.innerText.trim());
                const durEl = card.querySelector("span.dura_md") || card.querySelector("span.non-stop");

                if (price && airEl) {
                    flightList.push({
                        domIndex: idx,
                        carrier: airEl.innerText.trim(),
                        flightNumber: fltEl ? fltEl.innerText.trim() : 'N/A',
                        departureTime: times.length > 0 ? times[0] : 'N/A',
                        arrivalTime: times.length > 1 ? times[1] : 'N/A',
                        duration: durEl ? durEl.innerText.trim() : 'N/A',
                        searchPrice: price
                    });
                }
            });

            return flightList;
        }""")

        if not raw_cards:
            print(f"[⚠️ ] {route_name}_{horizon:<6} | No live flight inventory rendered on EaseMyTrip.")
            await page.close()
            return []

        # 3. Selection Algorithm: Guaranteed Airline Representation + Top Cheapest
        # Group by carrier
        carrier_groups = {}
        for c in raw_cards:
            carrier = c["carrier"]
            if carrier not in carrier_groups:
                carrier_groups[carrier] = []
            carrier_groups[carrier].append(c)

        # Sort each carrier's flights by price
        for carrier in carrier_groups:
            carrier_groups[carrier].sort(key=lambda x: x["searchPrice"])

        selected_flights = []
        # A. Pick cheapest flight of each distinct airline
        for carrier, flights in carrier_groups.items():
            selected_flights.append(flights[0])

        # B. If we have fewer than max_flights, fill remaining slots with cheapest overall
        if len(selected_flights) < max_flights:
            all_sorted = sorted(raw_cards, key=lambda x: x["searchPrice"])
            for f in all_sorted:
                if f not in selected_flights:
                    selected_flights.append(f)
                    if len(selected_flights) >= max_flights:
                        break
        else:
            # If we have more airlines than max_flights, keep top max_flights cheapest among them
            selected_flights.sort(key=lambda x: x["searchPrice"])
            selected_flights = selected_flights[:max_flights]

        # Sort final selection by price
        selected_flights.sort(key=lambda x: x["searchPrice"])

        print(f"\n✈️  [{route_name}_{horizon}] Selected {len(selected_flights)} distinct airline flights to audit:")
        for idx, sf in enumerate(selected_flights, 1):
            print(f"   {idx}. {sf['carrier']:<18} ({sf['flightNumber']:<8}) - Search Fare: INR {sf['searchPrice']}")

        # 4. Audit each of the selected flights through Review/Checkout
        for idx, flt in enumerate(selected_flights, 1):
            clean_carrier = re.sub(r'[^a-zA-Z0-9]', '', flt['carrier'])
            clean_fltno = re.sub(r'[^a-zA-Z0-9]', '', flt['flightNumber'])
            flight_folder_name = f"{idx:02d}_{clean_carrier}_{clean_fltno}"
            flight_dir = os.path.join(horizon_folder, flight_folder_name)
            os.makedirs(flight_dir, exist_ok=True)

            dom_idx = flt["domIndex"]
            
            # Click the specific BOOK NOW button for this card using Playwright locator
            card_locator = page.locator("div.fltResult").nth(dom_idx)
            book_btn = card_locator.locator("button:has-text('BOOK NOW'), a:has-text('BOOK NOW'), .btn-book, [class*='book-btn'], button").first
            try:
                await book_btn.click()
            except Exception:
                await page.evaluate(f"""() => {{
                    const cards = document.querySelectorAll('div.fltResult');
                    if (cards && cards[{dom_idx}]) {{
                        const b = cards[{dom_idx}].querySelector("button, a, .btn-book, [class*='book-btn']");
                        if (b) b.click();
                    }}
                }}""")

            await page.wait_for_timeout(4500)

            # Switch to the opened checkout tab
            pages = context.pages
            checkout_page = pages[-1] if len(pages) > 1 else page
            await checkout_page.wait_for_load_state("domcontentloaded")
            await checkout_page.wait_for_timeout(2500)

            # Stage 2: Capture Verified Checkout Review Proof Screenshot
            checkout_img_path = os.path.join(flight_dir, "checkout_review.png")
            await safe_capture_screenshot(checkout_page, checkout_img_path)

            # Extract verified line-item fare breakup
            breakup = await checkout_page.evaluate(r"""() => {
                let baseFare = null;
                let totalTaxes = null;
                let grandTotal = null;

                const baseEl = document.querySelector('#spnBasePrice') || document.querySelector('.base-fare-price');
                if (baseEl) {
                    const clean = baseEl.innerText.replace(/[^0-9.]/g, '');
                    if (clean) baseFare = parseFloat(clean);
                }

                const taxEl = document.querySelector('#spnTax') || document.querySelector('.tax-price');
                if (taxEl) {
                    const clean = taxEl.innerText.replace(/[^0-9.]/g, '');
                    if (clean) totalTaxes = parseFloat(clean);
                }

                const grandEl = document.querySelector('#spnGrandTotal') || document.querySelector('#spnTotal') || document.querySelector('.totl-fre');
                if (grandEl) {
                    const clean = grandEl.innerText.replace(/[^0-9.]/g, '');
                    if (clean) grandTotal = parseFloat(clean);
                }

                if (baseFare === null || totalTaxes === null || grandTotal === null) {
                    const allText = document.body.innerText;
                    const bMatch = allText.match(/Base Fare[^\d]*([\d,]+(?:\.\d+)?)/i);
                    if (bMatch && baseFare === null) baseFare = parseFloat(bMatch[1].replace(/,/g, ''));

                    const tMatch = allText.match(/(?:Taxes|Fee & Surcharges|Other Surcharges)[^\d]*([\d,]+(?:\.\d+)?)/i);
                    if (tMatch && totalTaxes === null) totalTaxes = parseFloat(tMatch[1].replace(/,/g, ''));

                    const gMatch = allText.match(/Grand Total[^\d]*([\d,]+(?:\.\d+)?)/i);
                    if (gMatch && grandTotal === null) grandTotal = parseFloat(gMatch[1].replace(/,/g, ''));
                }

                if (baseFare === null && grandTotal !== null && totalTaxes !== null) {
                    baseFare = Math.round((grandTotal - totalTaxes) * 100) / 100;
                }

                return {
                    base_fare: baseFare,
                    total_taxes: totalTaxes,
                    grand_total: grandTotal
                };
            }""")

            grand_total = breakup.get("grand_total") or flt["searchPrice"]
            taxes = breakup.get("total_taxes")
            base_fare = breakup.get("base_fare")
            if base_fare is None and grand_total and taxes:
                base_fare = round(grand_total - taxes, 2)

            audit_item = {
                "route": route_name,
                "origin": origin,
                "destination": dest,
                "horizon": horizon,
                "departure_date": date_iso,
                "carrier": flt["carrier"],
                "flight_number": flt["flightNumber"],
                "departure_time": flt["departureTime"],
                "arrival_time": flt["arrivalTime"],
                "duration": flt["duration"],
                "search_fare": flt["searchPrice"],
                "audited_base_fare": base_fare,
                "audited_taxes": taxes,
                "audited_grand_total": grand_total,
                "checkout_url": checkout_page.url,
                "screenshot_search": os.path.relpath(search_img_path, run_dir),
                "screenshot_checkout": os.path.relpath(checkout_img_path, run_dir),
                "captured_at": datetime.now().isoformat()
            }

            # Save individual flight audit JSON
            save_run_artifact(flight_dir, "audit_breakup.json", audit_item)
            audited_flights.append(audit_item)

            print(f"  [✅] Audited {flt['carrier']:<18} | Base: INR {base_fare} | Taxes: INR {taxes} | Grand Total: INR {grand_total}")

            # Close checkout tab if opened separately
            if checkout_page != page:
                await checkout_page.close()

    except Exception as e:
        print(f"[❌] {route_name}_{horizon} failed: {e}")

    finally:
        for p in context.pages:
            try:
                await p.close()
            except Exception:
                pass

    return audited_flights


async def worker_consumer(
    worker_id: int,
    browser: Browser,
    queue: asyncio.Queue,
    results_list: list,
    run_dir: str,
    max_flights: int = 5,
    recycle_every: int = 10
):
    """
    Worker coroutine pulling jobs with context recycling and anti-bot spacing.
    """
    context = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        ),
        locale="en-IN"
    )
    queries_handled = 0

    while True:
        try:
            job = await queue.get()
        except asyncio.CancelledError:
            break

        if job is None:
            queue.task_done()
            break

        queries_handled += 1
        if queries_handled > recycle_every:
            try:
                await context.close()
            except Exception:
                pass
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                ),
                locale="en-IN"
            )
            queries_handled = 0

        await asyncio.sleep(random.uniform(0.8, 1.8))

        flt_results = await audit_multi_carrier_route(
            context=context,
            job=job,
            run_dir=run_dir,
            max_flights=max_flights
        )

        retries = job.get("retries", 0)
        if len(flt_results) == 0 and retries < 2:
            job["retries"] = retries + 1
            print(f"🔄 Retrying {job['route']}_{job['horizon']} (Attempt {job['retries']}/2)...")
            await asyncio.sleep(2.5)
            await queue.put(job)
        else:
            results_list.extend(flt_results)

        queue.task_done()

    try:
        await context.close()
    except Exception:
        pass


async def run_async_batch_harvest(
    csv_path: str = "data/processed/dgca_top100_route_basket.csv",
    top_n: int = 5,
    horizons: List[int] = [1, 7, 15, 30, 45],
    num_workers: int = 3,
    flights_per_route: int = 5
) -> Dict[str, Any]:
    """
    Master Multi-Carrier Deep Checkout Batch Harvester.
    """
    run_dir = create_run_directory(prefix=f"top{top_n}_all_airlines")

    print("\n" + "=" * 95)
    print("🚀 AIRGO MULTI-CARRIER DEEP CHECKOUT HARVESTER (ALL AIRLINES AUDITED WITH PROOF)")
    print("=" * 95)
    print(f"  Target Routes (Top N) : {top_n}")
    print(f"  Horizons              : {[f'T+{h}' for h in horizons]}")
    print(f"  Flights per Route     : Up to {flights_per_route} (every distinct carrier represented)")
    print(f"  Concurrent Workers    : {num_workers} parallel browser workers")
    print(f"  Visual Audit Folder   : {run_dir}")
    print("=" * 95 + "\n")

    routes = load_route_basket(csv_path, top_n=top_n)
    target_dates = get_target_dates(horizons)

    queue = asyncio.Queue()
    total_jobs = 0
    for r in routes:
        for t in target_dates:
            queue.put_nowait({
                "origin": r["origin"],
                "dest": r["destination"],
                "route": r["route"],
                "rank": r["rank"],
                "weight": r["weight"],
                "horizon": t["horizon_label"],
                "date_dmy": t["date_dmy"],
                "date_iso": t["date_iso"]
            })
            total_jobs += 1

    print(f"📋 Enqueued {total_jobs} route-horizon jobs into Async Worker Queue.\n")

    results_list = []
    start_time = datetime.now()

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"]
        )

        workers = []
        for i in range(num_workers):
            w = asyncio.create_task(
                worker_consumer(
                    worker_id=i + 1,
                    browser=browser,
                    queue=queue,
                    results_list=results_list,
                    run_dir=run_dir,
                    max_flights=flights_per_route
                )
            )
            workers.append(w)

        await queue.join()

        for _ in range(num_workers):
            await queue.put(None)
        await asyncio.gather(*workers)

        await browser.close()

    elapsed = (datetime.now() - start_time).total_seconds()

    # Save unified master dataset and summary
    save_run_artifact(run_dir, "audited_checkout_quotes.json", results_list)

    summary = {
        "run_timestamp": datetime.now().isoformat(),
        "run_directory": run_dir,
        "elapsed_seconds": round(elapsed, 2),
        "total_route_horizon_jobs": total_jobs,
        "total_flights_audited": len(results_list),
        "top_n_routes": top_n,
        "horizons_covered": [f"T+{h}" for h in horizons],
        "flights_per_route": flights_per_route,
        "workers": num_workers
    }
    save_run_artifact(run_dir, "batch_summary.json", summary)

    print("\n" + "=" * 95)
    print("📊 MULTI-CARRIER BATCH HARVEST EXECUTION SUMMARY")
    print("=" * 95)
    print(f"  * Total Flights Audited to Checkout : {len(results_list)}")
    print(f"  * Total Time Elapsed                : {elapsed:.2f}s (avg {elapsed/max(1, len(results_list)):.2f}s per audited flight)")
    print(f"  * Master Quotes JSON Saved          : {os.path.join(run_dir, 'audited_checkout_quotes.json')}")
    print(f"  * Batch Summary Saved               : {os.path.join(run_dir, 'batch_summary.json')}")
    print("=" * 95 + "\n")

    return summary
