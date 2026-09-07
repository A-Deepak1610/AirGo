"""
AirGo Master CLI Entrypoint for MoSPI & RBI Airfare Analytics Platform.

Usage:
    python run.py --serve --port 8000
    python run.py --scrape --clean --compute-index
    python run.py --scrape --top-n 3 --horizons 1,7,15,30
"""

import os
import sys
import argparse
from typing import Optional
import logging
import uvicorn

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

from airgo.pipeline.db import init_db


def start_server(host: str = "127.0.0.1", port: int = 8000, reload: bool = True):
    """Starts the FastAPI executive dashboard and REST API backend."""
    print(f"\n=======================================================")
    print(f"[AirGo] Launching APIx Platform on http://{host}:{port}")
    print(f"        Interactive API Documentation: http://{host}:{port}/docs")
    print(f"        Health Check Endpoint: http://{host}:{port}/health")
    print(f"=======================================================\n")
    uvicorn.run("airgo.api.app:app", host=host, port=port, reload=reload)


def run_pipeline(
    routes: Optional[str] = None,
    top_n: int = 3,
    horizons: str = "1,7,15,30,45",
    checkout: bool = False,
    headless: Optional[bool] = None,
    pause: Optional[float] = None,
    slow_mo: Optional[int] = None,
):
    """Executes the automated end-to-end harvest across Yatra corridors."""
    import asyncio
    from airgo.scrapers.yatra import run_yatra_harvest, list_routes

    print("\n=======================================================")
    print(f"[AirGo] Launching Yatra Airfare Scraper Pipeline (Checkout Verification: {checkout})...")
    if headless is False:
        print("[AirGo] Running in 🖥️ HEADED VISIBLE BROWSER MODE (Chromium window visible on desktop)")
        if pause:
            print(f"[AirGo] Observation pause configured: {pause}s")
        if slow_mo:
            print(f"[AirGo] Action slow-mo configured: {slow_mo}ms")
    print("=======================================================\n")

    horizons_list = [int(h.strip()) for h in horizons.split(",") if h.strip().isdigit()]
    route_codes = None
    if routes:
        route_codes = [r.strip().upper() for r in routes.split(",") if r.strip()]
    else:
        all_routes = list_routes(active_only=True)
        route_codes = [r.route_code for r in all_routes[:top_n]]

    summary = asyncio.run(
        run_yatra_harvest(
            routes=route_codes,
            horizons=horizons_list,
            checkout=checkout,
            headless=headless,
            pause=pause,
            slow_mo=slow_mo,
        )
    )
    print("\n=======================================================")
    print(f"[AirGo] Yatra Harvest Completed: {summary['total_fares_selected']} fares selected, {summary['total_fares_verified']} verified.")
    print(f"        Price changes detected: {summary.get('total_price_changes', 0)}")
    print(f"        Artifacts saved to: {summary['artifacts_directory']}")
    print(f"        Database records persisted: {summary['db_inserted_quotes']}")
    print("=======================================================\n")


def main():
    parser = argparse.ArgumentParser(
        description="AirGo: Real-Time Airfare Price Index (APIx) Platform",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    # Execution Modes
    parser.add_argument("--serve", action="store_true", help="Start the FastAPI backend server and dashboard")
    parser.add_argument("--scrape", action="store_true", help="Trigger live web-scraping harvest across top routes")
    parser.add_argument("--clean", action="store_true", help="Run data deduplication and statistical outlier filtering")
    parser.add_argument("--compute-index", action="store_true", help="Calculate APIx Laspeyres, Jevons, and Fisher index numbers")

    # Server Configuration
    parser.add_argument("--host", type=str, default="127.0.0.1", help="API host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000, help="API port (default: 8000)")
    parser.add_argument("--no-reload", action="store_true", help="Disable auto-reload in server mode")

    # Pipeline Configuration
    parser.add_argument("--routes", type=str, default=None, help="Comma-separated corridors (e.g. BOM-DEL,BLR-DEL,BLR-BOM)")
    parser.add_argument("--top-n", type=int, default=3, help="Number of top DGCA routes to audit (default: 3)")
    parser.add_argument("--horizons", type=str, default="1,7,15,30,45", help="Advance-purchase windows in days (default: 1,7,15,30,45)")
    parser.add_argument("--checkout", action="store_true", help="Execute deep checkout fee and tax audit")
    parser.add_argument("--headless", action="store_true", help="Run browser scrapers in headless mode (no GUI windows)")
    parser.add_argument("--headful", "--visible", dest="headful", action="store_true", help="Run browser in visible GUI window for debugging")
    parser.add_argument("--pause", type=float, default=None, help="Observation delay in seconds when in headed mode (default: 3.0)")
    parser.add_argument("--slow-mo", type=int, default=None, help="Playwright slow-mo action delay in ms (default: 250 in headed mode)")

    args = parser.parse_args()

    headless_mode = None
    if args.headless:
        os.environ["HEADLESS"] = "true"
        headless_mode = True
    elif args.headful:
        os.environ["HEADLESS"] = "false"
        headless_mode = False

    # If no flags provided, show help
    if not (args.serve or args.scrape or args.clean or args.compute_index):
        parser.print_help()
        sys.exit(0)

    # Initialize PostgreSQL schemas
    init_db()

    # Trigger Scraping / Pipeline
    if args.scrape or args.clean or args.compute_index:
        run_pipeline(
            routes=args.routes,
            top_n=args.top_n,
            horizons=args.horizons,
            checkout=args.checkout,
            headless=headless_mode,
            pause=args.pause,
            slow_mo=args.slow_mo,
        )

    # Start Server
    if args.serve:
        start_server(host=args.host, port=args.port, reload=not args.no_reload)


if __name__ == "__main__":
    main()
