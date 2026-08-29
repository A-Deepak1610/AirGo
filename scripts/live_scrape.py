"""
Visual Live Flight Scraper Launcher.
Run this directly in your terminal: `python live_scrape.py`
Opens a real Chrome browser window on your desktop to scrape live fares.
"""
import os
import sys
import io

# 1. Ensure project root is on sys.path for any new terminal window
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# 2. Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

from datetime import date, timedelta
from airgo.scrapers.playwright_scraper import PlaywrightFlightScraper
from airgo.pipeline.cleaner import DataCleaningPipeline
from airgo.engine.index_calculator import IndexCalculator
from airgo.pipeline.db import init_db, get_db_session
from airgo.pipeline.models import RawQuoteDB


def main():
    print("\n" + "="*70)
    print(">> AIRGO: VISUAL LIVE FLIGHT SCRAPER (CHROME NON-HEADLESS)")
    print("="*70)
    print("Starting Chromium on your screen in 2 seconds...\n")
    
    init_db()
    scraper = PlaywrightFlightScraper(headless=False, rate_limit_secs=1.0)
    
    # Target: Delhi to Mumbai for tomorrow (T+1)
    dep_date = date.today() + timedelta(days=1)
    print(f"[Search] Route: DEL -> BOM | Departure Date: {dep_date} (T+1 Next Day)")
    
    quotes = scraper.fetch_quotes(
        origin="DEL",
        destination="BOM",
        departure_date=dep_date,
        advance_window="T+1",
        advance_days=1
    )
    
    if not quotes:
        print("\n[!] No live quotes extracted. Check internet connection or route availability.\n")
        return

    # Save raw quotes to DB
    with get_db_session() as session:
        for q in quotes:
            session.add(RawQuoteDB(
                source=q.source,
                carrier=q.carrier,
                carrier_code=q.carrier_code,
                flight_number=q.flight_number,
                origin=q.origin,
                destination=q.destination,
                departure_datetime=q.departure_datetime,
                duration_mins=q.duration_mins,
                stops=q.stops,
                booking_date=q.booking_date,
                advance_window=q.advance_window,
                advance_days=q.advance_days,
                fare_class=q.fare_class,
                base_fare=q.base_fare,
                taxes=q.taxes,
                total_fare=q.total_fare,
                source_url=q.source_url
            ))
            
    # Clean and recalculate
    cleaner = DataCleaningPipeline()
    cleaner.process_pending_quotes(date.today())
    
    calc = IndexCalculator()
    calc.compute_daily_index(date.today())

    print("\n" + "="*70)
    print(f"[SUCCESS] Extracted {len(quotes)} 100% REAL LIVE Quotes Directly From Web:")
    print("="*70)
    for q in quotes:
        dep_str = q.departure_datetime.strftime('%I:%M %p')
        print(f"  * {q.carrier:<15} | Flight: {q.flight_number:<8} | Fare: INR {q.total_fare:<7} | Base: INR {q.base_fare:<7} | Dep: {dep_str}")
    
    if quotes:
        print(f"\n[Live Link] Verify on Google Flights:\n  {quotes[0].source_url}")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
