"""
EaseMyTrip 100% Real Live Seat Data & Payment Extraction Engine.
STRICT ZERO-SYNTHETIC DATA RULE:
- Extracts full flight quotes, checkout fare breakup, and live cabin seats directly from live DOM.
- Accurately targets the modal popup and clicks 'Let Me Choose Myself'.
- Stores flight_quotes.json, checkout_fare_breakup.json, real_live_seat_data.json,
  and run_summary.json cleanly in runs/YYYY-MM-DD_HH-MM-SS_<prefix>/.
"""

import os
import sys
import io
import re
import json
import argparse
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

from airgo.utils.run_manager import create_run_directory, save_run_artifact

# Fix Windows terminal UTF-8 encoding
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass


def parse_flight_cards(html_content: str, origin: str = "DEL", destination: str = "BOM", dep_date: str = "30/08/2026"):
    """
    Parses exact flight cards from rendered search DOM.
    """
    soup = BeautifulSoup(html_content, "html.parser")
    cards = soup.select("div.fltResult")
    flights = []

    for card in cards:
        # Airline Name
        airline_el = card.select_one("span.txt-r4") or card.select_one("span.air-name")
        airline = airline_el.get_text(strip=True) if airline_el else "Unknown"

        # Flight Number
        flt_num_el = card.select_one("span.txt-r5") or card.select_one("span.flt-num")
        flt_num = flt_num_el.get_text(strip=True) if flt_num_el else "N/A"

        # Times
        times = [t.get_text(strip=True) for t in card.select("span.txt-r2-n")]
        dep_time = times[0] if len(times) > 0 else "N/A"
        arr_time = times[1] if len(times) > 1 else "N/A"

        # Duration
        dur_el = card.select_one("span.dura_md") or card.select_one("span.non-stop")
        duration = dur_el.get_text(strip=True) if dur_el else "N/A"

        # Price tag
        price_el = card.select_one("span[id*='spnPrice']") or card.select_one("div.col-md-2 span[price]")
        total_fare = None
        if price_el:
            if price_el.has_attr("price"):
                try:
                    total_fare = float(price_el["price"])
                except Exception:
                    pass
            if total_fare is None:
                clean_txt = re.sub(r"[^\d.]", "", price_el.get_text())
                if clean_txt:
                    total_fare = float(clean_txt)

        if total_fare is not None:
            flights.append({
                "carrier": airline,
                "flight_number": flt_num,
                "origin": origin,
                "destination": destination,
                "departure_date": dep_date,
                "departure_time": dep_time,
                "arrival_time": arr_time,
                "duration": duration,
                "total_fare": total_fare
            })

    return flights


def extract_checkout_breakup_from_page(checkout_page):
    """
    Extracts base fare, taxes, and grand total directly from the live DOM.
    """
    return checkout_page.evaluate(r"""() => {
        let baseFare = null;
        let totalTaxes = null;
        let grandTotal = null;

        // Base fare
        const baseEl = document.querySelector('#spnBasePrice') || document.querySelector('.base-fare-price');
        if (baseEl) {
            const clean = baseEl.innerText.replace(/[^0-9.]/g, '');
            if (clean) baseFare = parseFloat(clean);
        }

        // Taxes
        const taxEl = document.querySelector('#spnTax') || document.querySelector('.tax-price');
        if (taxEl) {
            const clean = taxEl.innerText.replace(/[^0-9.]/g, '');
            if (clean) totalTaxes = parseFloat(clean);
        }

        // Grand Total
        const grandEl = document.querySelector('#spnGrandTotal') || document.querySelector('#spnTotal') || document.querySelector('.totl-fre');
        if (grandEl) {
            const clean = grandEl.innerText.replace(/[^0-9.]/g, '');
            if (clean) grandTotal = parseFloat(clean);
        }

        // Fallback: parse text blocks
        if (baseFare === null || totalTaxes === null || grandTotal === null) {
            const allText = document.body.innerText;
            const bMatch = allText.match(/Base Fare[^\d]*([\d,]+(?:\.\d+)?)/i);
            if (bMatch && baseFare === null) baseFare = parseFloat(bMatch[1].replace(/,/g, ''));

            const tMatch = allText.match(/(?:Taxes|Fee & Surcharges|Other Surcharges)[^\d]*([\d,]+(?:\.\d+)?)/i);
            if (tMatch && totalTaxes === null) totalTaxes = parseFloat(tMatch[1].replace(/,/g, ''));

            const gMatch = allText.match(/Grand Total[^\d]*([\d,]+(?:\.\d+)?)/i);
            if (gMatch && grandTotal === null) grandTotal = parseFloat(gMatch[1].replace(/,/g, ''));
        }

        return {
            base_fare: baseFare,
            total_taxes: totalTaxes,
            grand_total: grandTotal
        };
    }""")


def run_live_seat_extractor(visible: bool = False, pause: bool = False):
    # 1. Create dedicated timestamped run folder
    run_dir = create_run_directory(prefix="seat_analysis")
    
    print("\n" + "=" * 90)
    print("✈️  EASEMYTRIP REAL LIVE SEAT EXTRACTOR & PAYMENT AUDIT")
    print("=" * 90)
    print(f"  Mode:        {'🖥️ Visible Chromium Window' if visible else '⚡ Fast Headless Engine'}")
    print(f"  Audit Run:   {run_dir}")
    print("=" * 90)

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=not visible,
            slow_mo=60 if visible else 0,
            args=["--start-maximized", "--no-sandbox"]
        )
        context = browser.new_context(
            no_viewport=True if visible else False,
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="en-IN"
        )
        page = context.new_page()

        origin = "DEL"
        destination = "BOM"
        dep_date = "30/08/2026"
        search_url = f"https://flight.easemytrip.com/FlightList/Index?srch={origin}-Delhi-India|{destination}-Mumbai-India|{dep_date}&px=1-0-0&cbn=0&ar=undefined&isDM=true&IsDoubleSeat=false&C=IN"
        
        print("\n[1/5] Loading live flight search...")
        page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(6000)

        # Save rendered search DOM & Parse Flight Quotes
        search_html = page.content()
        save_run_artifact(run_dir, "search_results.html", search_html)
        
        flight_quotes = parse_flight_cards(search_html, origin, destination, dep_date)
        save_run_artifact(run_dir, "flight_quotes.json", flight_quotes)
        print(f"  ✓ Parsed {len(flight_quotes)} genuine live flight quotes -> {os.path.join(run_dir, 'flight_quotes.json')}")

        # 1. Click Book Now
        print("[2/5] Navigating to Review/Checkout...")
        book_btn = page.query_selector("button:has-text('BOOK NOW'), a:has-text('BOOK NOW'), .btn-book, [class*='book-btn']")
        if not book_btn:
            print("[!] ERROR: No live flight cards available on EaseMyTrip for this route.")
            browser.close()
            return

        book_btn.click()
        page.wait_for_timeout(5000)

        checkout_page = context.pages[-1] if len(context.pages) > 1 else page
        checkout_page.wait_for_load_state("domcontentloaded")
        checkout_page.wait_for_timeout(3000)

        # Save review DOM & Parse Checkout Fare Breakup
        checkout_html = checkout_page.content()
        save_run_artifact(run_dir, "checkout_review.html", checkout_html)

        fare_breakup = extract_checkout_breakup_from_page(checkout_page)
        save_run_artifact(run_dir, "checkout_fare_breakup.json", fare_breakup)
        print(f"  ✓ Parsed live checkout fare breakup -> {os.path.join(run_dir, 'checkout_fare_breakup.json')}")

        # 2. Fill Guest Contact & Passenger info
        print("[3/5] Auto-filling passenger form...")
        checkout_page.evaluate("""() => {
            const email = document.querySelector('#txtEmailId') || document.querySelector('#txtEmailAdult0');
            if (email) { email.value = 'audit.flight@airgo.in'; email.dispatchEvent(new Event('input', {bubbles: true})); }
            
            const phone = document.querySelector('#txtCPhone') || document.querySelector('#txtCPhoneAdult0');
            if (phone) { phone.value = '9876543210'; phone.dispatchEvent(new Event('input', {bubbles: true})); }

            const title = document.querySelector('#titleAdult0');
            if (title) { title.value = 'Mr'; title.dispatchEvent(new Event('change', {bubbles: true})); }

            const fn = document.querySelector('#txtFNAdult0');
            if (fn) { fn.value = 'Arun'; fn.dispatchEvent(new Event('input', {bubbles: true})); }

            const ln = document.querySelector('#txtLNAdult0');
            if (ln) { ln.value = 'Kumar'; ln.dispatchEvent(new Event('input', {bubbles: true})); }

            const noIns = document.querySelector('#notinsure') || document.querySelector('.insur-no');
            if (noIns) noIns.click();
        }""")
        checkout_page.wait_for_timeout(2000)

        # 3. Click Continue Booking to trigger the seat popup modal
        print("[4/5] Clicking 'Continue Booking' to trigger seat modal...")
        checkout_page.evaluate("""() => {
            const btn = document.querySelector('#spnTransaction') || document.querySelector('.con1') || document.querySelector('#divContinueReview2') || document.querySelector('.srch-fill');
            if (btn) btn.click();
        }""")
        checkout_page.wait_for_timeout(3500)

        # 4. TARGET THE EXACT MODAL 'Let Me Choose Myself'
        print("[5/5] 🎯 Clicking 'Let Me Choose Myself' on Modal Popup...")
        
        choose_myself_locator = checkout_page.locator("text='Let Me Choose Myself'")
        try:
            choose_myself_locator.wait_for(state="visible", timeout=6000)
            choose_myself_locator.click()
            print("  ✓ Clicked 'Let Me Choose Myself' on modal popup!")
        except Exception:
            checkout_page.evaluate("""() => {
                const els = Array.from(document.querySelectorAll('a, span, div, p'));
                const target = els.find(el => (el.innerText || '').trim() === 'Let Me Choose Myself');
                if (target) target.click();
            }""")

        checkout_page.wait_for_timeout(4000)

        # Scroll to center the aircraft cabin seat map
        checkout_page.evaluate("""() => {
            const seatMap = document.querySelector('#seatArea') || document.querySelector('.seat-layout') || document.querySelector('.seat-matrix') || document.querySelector('[class*=\"seat\"]');
            if (seatMap) seatMap.scrollIntoView({behavior: 'smooth', block: 'center'});
        }""")
        checkout_page.wait_for_timeout(2000)

        # 5. Extract 100% REAL LIVE Available Seats directly from the DOM
        real_seat_result = checkout_page.evaluate(r"""() => {
            const seatLabels = Array.from(document.querySelectorAll('label[ng-click*="SelectedV2"], label.s_seat_avl, div.seat_n, span.seat_n'));
            
            const liveSeats = [];

            seatLabels.forEach(el => {
                const id = el.id || '';
                const title = el.getAttribute('title') || el.innerText || '';
                const cls = el.className || '';

                // Clean real seat number correctly by stripping origin_destination prefix (e.g. DEL_BOM9-D -> 9-D)
                let seatNo = id.replace(/^[A-Z]{3}_[A-Z]{3}/, '');
                if (!seatNo || seatNo.length < 2) {
                    seatNo = el.innerText.trim();
                }

                if (!cls.includes('s_seat_ocu') && !cls.includes('occ') && !cls.includes('book') && id.includes('_')) {
                    liveSeats.push({
                        seatNumber: seatNo,
                        rawDomId: id,
                        title: title.trim(),
                        className: cls,
                        domSelector: '#' + id
                    });
                }
            });

            if (liveSeats.length === 0) {
                return { error: "No selectable live seats found on active DOM" };
            }

            const target = liveSeats[0];
            const domEl = document.querySelector(target.domSelector);
            if (domEl) {
                domEl.scrollIntoView({behavior: 'smooth', block: 'center'});
                domEl.click();
            }

            return {
                totalLiveAvailableSeats: liveSeats.length,
                clickedSeatNumber: target.seatNumber,
                clickedSeatRawId: target.rawDomId,
                sampleLiveSeats: liveSeats.slice(0, 10)
            };
        }""")

        # Screenshot of the cabin seat map inside the run directory
        screenshot_path = os.path.join(run_dir, "aircraft_cabin_seat_map.png")
        try:
            checkout_page.screenshot(path=screenshot_path, full_page=False)
            print(f"📸 Live Aircraft Cabin Seat Map Screenshot Captured -> {screenshot_path}")
        except Exception as e:
            print(f"[!] Screenshot note: {e}")

        if "error" not in real_seat_result:
            print("\n" + "=" * 90)
            print("🎯 REAL LIVE SEAT EXTRACTED DIRECTLY FROM ACTIVE CABIN DOM (ZERO DUMMY DATA)")
            print("=" * 90)
            print(f"  * Total Genuine Available Seats on Plane : {real_seat_result['totalLiveAvailableSeats']}")
            print(f"  * Real Clicked Seat Number              : {real_seat_result['clickedSeatNumber']}")
            print(f"  * Real DOM Element ID                   : {real_seat_result['clickedSeatRawId']}")
            print("=" * 90)

            print("\n📋 FIRST 5 GENUINE AVAILABLE SEATS PARSED FROM LIVE CABIN DOM:")
            for s in real_seat_result["sampleLiveSeats"][:5]:
                print(f"  * Seat: {s['seatNumber']:<8} | DOM ID: {s['rawDomId']:<15} | Class: {s['className']}")
            print("=" * 90 + "\n")

            save_run_artifact(run_dir, "real_live_seat_data.json", real_seat_result)
            print(f"💾 100% Real Live Seat Data Saved -> {os.path.join(run_dir, 'real_live_seat_data.json')}")

        # Save run summary metadata with origin, destination, and fare summary
        summary_metadata = {
            "run_timestamp": datetime.now().isoformat(),
            "run_directory": run_dir,
            "route": f"{origin} -> {destination}",
            "origin": origin,
            "destination": destination,
            "departure_date": dep_date,
            "total_flights_scraped": len(flight_quotes),
            "fare_breakup": fare_breakup,
            "available_seats_count": real_seat_result.get("totalLiveAvailableSeats"),
            "selected_seat": real_seat_result.get("clickedSeatNumber"),
            "selected_dom_id": real_seat_result.get("clickedSeatRawId")
        }
        save_run_artifact(run_dir, "run_summary.json", summary_metadata)
        print(f"💾 Run Summary Saved -> {os.path.join(run_dir, 'run_summary.json')}\n")

        if pause and visible:
            print("⏸️  Browser window is PAUSED on your screen for 20 seconds so you can see the full seat map...")
            checkout_page.wait_for_timeout(20000)

        browser.close()


def main():
    parser = argparse.ArgumentParser(description="100% Real Live Seat Data & Payment Extraction Engine")
    parser.add_argument("--visible", action="store_true", help="Open visible Chromium browser window on screen")
    parser.add_argument("--pause", action="store_true", help="Pause visible browser for 20 seconds for manual inspection")
    args = parser.parse_args()

    run_live_seat_extractor(visible=args.visible, pause=args.pause)


if __name__ == "__main__":
    main()
