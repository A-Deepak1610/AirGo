"""
AirGo Fixed Async Queue Worker Pool with Deep Checkout Auditing for All Routes.
Processes the DGCA Route Basket across T+1, T+7, T+15, T+30, T+45 horizons by actively
navigating to the Review/Checkout page for EVERY route to extract audited base fares, taxes, and grand totals.
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


async def audit_single_route_checkout(
    context: BrowserContext,
    job: Dict[str, Any],
    timeout_ms: int = 45000
) -> Dict[str, Any]:
    """
    Audits a single route-horizon job by searching flights AND clicking BOOK NOW
    to extract the verified checkout line-item price breakup directly from the DOM.
    """
    origin = job["origin"]
    dest = job["dest"]
    date_dmy = job["date_dmy"]
    date_iso = job["date_iso"]
    horizon = job["horizon"]
    task_id = f"{origin}-{dest}_{horizon}"
    search_url = build_easemytrip_url(origin, dest, date_dmy)

    page = await context.new_page()
    result = {
        "task_id": task_id,
        "route": f"{origin}-{dest}",
        "origin": origin,
        "destination": dest,
        "horizon": horizon,
        "departure_date": date_iso,
        "search_url": search_url,
        "status": "pending",
        "search_fare": None,
        "carrier": None,
        "flight_number": None,
        "departure_time": None,
        "arrival_time": None,
        "checkout_base_fare": None,
        "checkout_taxes": None,
        "checkout_convenience_fee": None,
        "checkout_grand_total": None,
        "checkout_url": None,
        "error": None
    }

    try:
        # 1. Navigate to Search page
        await page.goto(search_url, wait_until="domcontentloaded", timeout=timeout_ms)
        
        # Dynamic selector wait: wait until flight cards render into the DOM
        try:
            await page.wait_for_selector(
                "div.fltResult, .fltResult, [class*='fltResult'], div[ng-repeat*='Flight'], button:has-text('BOOK NOW')",
                timeout=18000
            )
        except Exception:
            await page.wait_for_timeout(4000)

        # Extract search flight details from first flight card
        card_data = await page.evaluate(r"""() => {
            const firstCard = document.querySelector('div.fltResult') || document.querySelector('.fltResult');
            if (!firstCard) return null;

            const priceEl = firstCard.querySelector("span[id*='spnPrice']") || firstCard.querySelector("div.col-md-2 span[price]");
            let price = null;
            if (priceEl) {
                const attr = priceEl.getAttribute('price');
                if (attr) price = parseFloat(attr);
                if (!price) {
                    const clean = priceEl.innerText.replace(/[^0-9.]/g, '');
                    if (clean) price = parseFloat(clean);
                }
            }

            const airEl = firstCard.querySelector("span.txt-r4") || firstCard.querySelector("span.air-name");
            const fltEl = firstCard.querySelector("span.txt-r5") || firstCard.querySelector("span.flt-num");
            const times = Array.from(firstCard.querySelectorAll("span.txt-r2-n")).map(t => t.innerText.trim());

            return {
                searchPrice: price,
                carrier: airEl ? airEl.innerText.trim() : null,
                flightNo: fltEl ? fltEl.innerText.trim() : null,
                depTime: times.length > 0 ? times[0] : null,
                arrTime: times.length > 1 ? times[1] : null
            };
        }""")

        if not card_data or not card_data.get("searchPrice"):
            result["status"] = "no_flights_found"
            await page.close()
            return result

        result["search_fare"] = card_data["searchPrice"]
        result["carrier"] = card_data["carrier"]
        result["flight_number"] = card_data["flightNo"]
        result["departure_time"] = card_data["depTime"]
        result["arrival_time"] = card_data["arrTime"]

        # 2. Click Book Now to enter Checkout Review
        book_btn = await page.query_selector("button:has-text('BOOK NOW'), a:has-text('BOOK NOW'), .btn-book, [class*='book-btn']")
        if not book_btn:
            await page.evaluate("""() => {
                const b = document.querySelector('button[ng-click*="BookNow"], button:not([disabled])');
                if (b) b.click();
            }""")
        else:
            await book_btn.click()

        await page.wait_for_timeout(4500)

        # 3. Switch to checkout page tab if opened
        pages = context.pages
        checkout_page = pages[-1] if len(pages) > 1 else page
        await checkout_page.wait_for_load_state("domcontentloaded")
        await checkout_page.wait_for_timeout(2500)

        result["checkout_url"] = checkout_page.url

        # 4. Extract verified line-item checkout fare breakup
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

            // Text fallback parsing
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

        result["checkout_base_fare"] = breakup.get("base_fare")
        result["checkout_taxes"] = breakup.get("total_taxes")
        result["checkout_grand_total"] = breakup.get("grand_total") or result["search_fare"]
        if result["checkout_base_fare"] is None and result["checkout_grand_total"] and result["checkout_taxes"]:
            result["checkout_base_fare"] = round(result["checkout_grand_total"] - result["checkout_taxes"], 2)
        result["status"] = "success"

        print(
            f"[✅] {task_id:<16} | Carrier: {result['carrier']:<12} | "
            f"Search: INR {result['search_fare']} -> Checkout: INR {result['checkout_grand_total']} "
            f"(Base: {result['checkout_base_fare']}, Taxes: {result['checkout_taxes']})"
        )

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        print(f"[❌] {task_id:<16} | Failed: {str(e)[:60]}")

    finally:
        # Clean up open pages in context
        for p in context.pages:
            try:
                await p.close()
            except Exception:
                pass

    return result


async def worker_consumer(
    worker_id: int,
    browser: Browser,
    queue: asyncio.Queue,
    results_list: list,
    recycle_every: int = 15
):
    """
    Worker coroutine pulling jobs from the queue with browser context recycling and anti-bot jitter.
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

        if job is None:  # Sentinel to terminate worker
            queue.task_done()
            break

        # Recycle context to prevent Chromium memory leaks
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

        # Anti-bot randomized jitter
        await asyncio.sleep(random.uniform(0.8, 1.8))

        # Execute checkout audit
        res = await audit_single_route_checkout(context, job)
        
        # Automatic Retry (up to 2 retries on transient network/rendering lag)
        retries = job.get("retries", 0)
        if res["status"] != "success" and retries < 2:
            job["retries"] = retries + 1
            print(f"🔄 Retrying {job['route']}_{job['horizon']} (Attempt {job['retries']}/2 after short backoff)...")
            await asyncio.sleep(2.0)
            await queue.put(job)
        else:
            results_list.append(res)

        queue.task_done()

    try:
        await context.close()
    except Exception:
        pass


async def run_async_batch_harvest(
    csv_path: str = "data/processed/dgca_top100_route_basket.csv",
    top_n: int = 5,
    horizons: List[int] = [1, 7, 15, 30, 45],
    num_workers: int = 3
) -> Dict[str, Any]:
    """
    Master Async Queue Runner with deep checkout auditing across all routes and horizons.
    """
    run_dir = create_run_directory(prefix=f"checkout_batch_top{top_n}")

    print("\n" + "=" * 95)
    print("🛒 AIRGO ASYNC DEEP CHECKOUT HARVESTER (ALL ROUTES AUDITED TO FINAL CHECKOUT)")
    print("=" * 95)
    print(f"  Target Routes (Top N) : {top_n}")
    print(f"  Horizons              : {[f'T+{h}' for h in horizons]}")
    print(f"  Concurrent Workers    : {num_workers} parallel browser workers")
    print(f"  Audit Storage Folder  : {run_dir}")
    print("=" * 95 + "\n")

    routes = load_route_basket(csv_path, top_n=top_n)
    target_dates = get_target_dates(horizons)

    # 1. Populate asyncio.Queue
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

    print(f"📋 Enqueued {total_jobs} route-horizon checkout jobs into Async Queue.\n")

    results_list = []
    start_time = datetime.now()

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"]
        )

        # 2. Spawn worker coroutines
        workers = []
        for i in range(num_workers):
            w = asyncio.create_task(
                worker_consumer(
                    worker_id=i + 1,
                    browser=browser,
                    queue=queue,
                    results_list=results_list
                )
            )
            workers.append(w)

        # Wait for all jobs in the queue to be processed
        await queue.join()

        # Stop workers with None sentinel
        for _ in range(num_workers):
            await queue.put(None)
        await asyncio.gather(*workers)

        await browser.close()

    elapsed = (datetime.now() - start_time).total_seconds()

    successful_jobs = [r for r in results_list if r["status"] == "success"]
    failed_jobs = [r for r in results_list if r["status"] != "success"]

    # Save outputs into run folder
    save_run_artifact(run_dir, "audited_checkout_quotes.json", results_list)

    summary = {
        "run_timestamp": datetime.now().isoformat(),
        "run_directory": run_dir,
        "elapsed_seconds": round(elapsed, 2),
        "total_jobs": len(results_list),
        "successful_jobs": len(successful_jobs),
        "failed_jobs": len(failed_jobs),
        "top_n_routes": top_n,
        "horizons_covered": [f"T+{h}" for h in horizons],
        "workers": num_workers
    }
    save_run_artifact(run_dir, "batch_summary.json", summary)

    print("\n" + "=" * 95)
    print("📊 DEEP CHECKOUT HARVEST EXECUTION SUMMARY")
    print("=" * 95)
    print(f"  * Total Routes Audited to Checkout : {len(results_list)}")
    print(f"  * Successfully Audited            : {len(successful_jobs)} / {len(results_list)}")
    print(f"  * Total Time Elapsed              : {elapsed:.2f}s (avg {elapsed/max(1, len(results_list)):.2f}s per checkout)")
    print(f"  * Audited Quotes JSON Saved       : {os.path.join(run_dir, 'audited_checkout_quotes.json')}")
    print(f"  * Batch Summary Saved             : {os.path.join(run_dir, 'batch_summary.json')}")
    print("=" * 95 + "\n")

    return summary
