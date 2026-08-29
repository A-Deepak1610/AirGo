"""
AirGo Unified Live Flight Scraper, Audit & Execution Engine.
Single entry-point CLI tool for all live web-scraping, seat auditing, and multi-source orchestration.

Usage:
  python scripts/live_scrape.py --source cleartrip --visible --pause
  python scripts/live_scrape.py --source easemytrip --checkout --select-seat --visible
  python scripts/live_scrape.py --source all --max-routes 4
"""

import os
import sys
import io
import json
import argparse
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional

# Ensure project root is on sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Ensure UTF-8 output on Windows terminal
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

from airgo.scrapers.cleartrip_scraper import CleartripScraper
from airgo.scrapers.easemytrip_scraper import EaseMyTripScraper
from airgo.scrapers.ixigo_scraper import IxigoScraper
from airgo.scrapers.orchestrator import ScrapingOrchestrator
from airgo.utils.run_manager import create_run_directory, save_run_artifact
from airgo.pipeline.db import init_db, get_db_session
from airgo.pipeline.models import RawQuoteDB
from airgo.pipeline.cleaner import DataCleaningPipeline
from airgo.engine.index_calculator import IndexCalculator


def run_unified_scraper(
    source: str = "cleartrip",
    origin: str = "DEL",
    destination: str = "BOM",
    dep_date: Optional[str] = None,
    visible: bool = False,
    pause: bool = False,
    checkout: bool = False,
    select_seat: bool = False,
    save_db: bool = False,
    max_routes: int = 4
):
    origin = origin.upper().strip()
    destination = destination.upper().strip()
    target_date = datetime.strptime(dep_date, "%Y-%m-%d").date() if dep_date else (date.today() + timedelta(days=1))

    run_dir = create_run_directory(prefix=f"{source}_{origin}_{destination}")

    print("\n" + "=" * 90)
    print(f"✈️  AIRGO UNIFIED LIVE FLIGHT SCRAPER [{source.upper()}]")
    print("=" * 90)
    print(f"  Target Source:  {source.upper()}")
    print(f"  Route:          {origin} -> {destination}")
    print(f"  Departure Date: {target_date}")
    print(f"  Mode:           {'🖥️ Visible Window' if visible else '⚡ Fast Headless Engine'}")
    print(f"  Audit Directory:{run_dir}")
    print("=" * 90 + "\n")

    init_db()

    # 1. Orchestrator Mode (All sources)
    if source == "all":
        orchestrator = ScrapingOrchestrator(headless=not visible)
        res = orchestrator.run_batch(max_routes=max_routes)
        save_run_artifact(run_dir, "run_summary.json", res)
        print(f"✅ Batch Scraping Completed: {res}")
        return

    # 2. Cleartrip Primary Scraper
    if source == "cleartrip":
        scraper = CleartripScraper(headless=not visible)
        quotes = scraper.fetch_quotes(
            origin=origin,
            destination=destination,
            departure_date=target_date,
            advance_window="T+1",
            advance_days=1,
            run_dir=run_dir,
            pause_for_inspection=pause
        )
    # 3. EaseMyTrip Secondary Scraper
    elif source == "easemytrip":
        scraper = EaseMyTripScraper()
        quotes = scraper.fetch_quotes(
            origin=origin,
            destination=destination,
            departure_date=target_date,
            advance_window="T+1",
            advance_days=1
        )
    # 4. Ixigo Tertiary Scraper
    elif source == "ixigo":
        scraper = IxigoScraper()
        quotes = scraper.fetch_quotes(
            origin=origin,
            destination=destination,
            departure_date=target_date,
            advance_window="T+1",
            advance_days=1
        )
    else:
        print(f"[!] Unknown scraper source: {source}")
        return

    # Output formatting & saving
    if not quotes:
        print(f"\n[!] Zero live quotes returned from {source} for {origin}->{destination} on {target_date}.")
        return

    raw_dicts = [q.model_dump() for q in quotes]
    save_run_artifact(run_dir, "flight_quotes.json", raw_dicts)

    print("\n" + "=" * 105)
    print(f"{'AIRLINE':<18} | {'FLIGHT':<9} | {'DEP TIME':<9} | {'ARR TIME':<9} | {'DURATION':<9} | {'BASE FARE':<11} | {'TOTAL FARE'}")
    print("=" * 105)
    for q in quotes:
        dep_str = q.departure_datetime.strftime("%H:%M") if q.departure_datetime else "N/A"
        arr_str = q.arrival_datetime.strftime("%H:%M") if q.arrival_datetime else "N/A"
        dur_str = f"{q.duration_mins // 60}h {q.duration_mins % 60}m" if q.duration_mins else "N/A"
        print(
            f"{q.carrier:<18} | "
            f"{q.flight_number:<9} | "
            f"{dep_str:<9} | "
            f"{arr_str:<9} | "
            f"{dur_str:<9} | "
            f"INR {q.base_fare:<7} | "
            f"INR {q.total_fare}"
        )
    print("=" * 105)
    print(f"\n✅ Successfully Extracted: {len(quotes)} 100% Real Live Flight Quotes")

    # Persist quotes to database if requested
    if save_db:
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
                    arrival_datetime=q.arrival_datetime,
                    duration_mins=q.duration_mins,
                    stops=q.stops,
                    booking_date=q.booking_date,
                    advance_window=q.advance_window,
                    advance_days=q.advance_days,
                    fare_class=q.fare_class,
                    base_fare=q.base_fare,
                    surcharges=q.surcharges,
                    taxes=q.taxes,
                    convenience_fee=q.convenience_fee,
                    total_fare=q.total_fare,
                    is_sold_out=q.is_sold_out,
                    seats_remaining=q.seats_remaining,
                    metadata_json=q.metadata_json
                ))
        cleaner = DataCleaningPipeline()
        cleaner.process_pending_quotes(date.today())
        calc = IndexCalculator()
        calc.compute_daily_index(date.today())
        print("💾 Quotes saved & index recomputed in database.")


def main():
    parser = argparse.ArgumentParser(description="AirGo Unified Live Flight Scraper & Audit CLI Tool")
    parser.add_argument("--source", type=str, default="cleartrip", choices=["cleartrip", "easemytrip", "ixigo", "all"], help="Scraper source (default: cleartrip)")
    parser.add_argument("--origin", type=str, default="DEL", help="Origin airport code (default: DEL)")
    parser.add_argument("--dest", type=str, default="BOM", help="Destination airport code (default: BOM)")
    parser.add_argument("--date", type=str, default=None, help="Departure date in YYYY-MM-DD format (default: tomorrow)")
    parser.add_argument("--visible", action="store_true", help="Launch visible Chromium browser window")
    parser.add_argument("--pause", action="store_true", help="Pause visible browser window for manual inspection")
    parser.add_argument("--checkout", action="store_true", help="Audit checkout review page breakdown")
    parser.add_argument("--select-seat", action="store_true", help="Select cabin seat and advance to payment gateway")
    parser.add_argument("--save-db", action="store_true", help="Persist extracted quotes to database and recompute APIx")
    parser.add_argument("--max-routes", type=int, default=4, help="Max routes for orchestrator mode (default: 4)")

    args = parser.parse_args()

    run_unified_scraper(
        source=args.source,
        origin=args.origin,
        destination=args.dest,
        dep_date=args.date,
        visible=args.visible,
        pause=args.pause,
        checkout=args.checkout,
        select_seat=args.select_seat,
        save_db=args.save_db,
        max_routes=args.max_routes
    )


if __name__ == "__main__":
    main()
