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
import subprocess
import uvicorn

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from airgo.pipeline.db import init_db


def start_server(host: str = "127.0.0.1", port: int = 8000, reload: bool = True):
    """Starts the FastAPI executive dashboard and REST API backend."""
    print(f"\n=======================================================")
    print(f"🚀 Launching AirGo APIx Platform on http://{host}:{port}")
    print(f"   Documentation: http://{host}:{port}/docs")
    print(f"=======================================================\n")
    uvicorn.run("airgo.api.app:app", host=host, port=port, reload=reload)


def run_pipeline(top_n: int = 5, horizons: str = "1,7,15,30,45", checkout: bool = False):
    """Executes the automated end-to-end harvest, clean, and indexing pipeline."""
    from scripts.run_daily_harvest import execute_daily_cycle
    execute_daily_cycle(top_n=top_n, horizons=horizons, checkout_audit=checkout)


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
    parser.add_argument("--top-n", type=int, default=5, help="Number of top DGCA routes to audit (default: 5)")
    parser.add_argument("--horizons", type=str, default="1,7,15,30,45", help="Advance-purchase windows in days (default: 1,7,15,30,45)")
    parser.add_argument("--checkout", action="store_true", help="Execute deep checkout fee and tax audit")

    args = parser.parse_args()

    # If no flags provided, show help
    if not (args.serve or args.scrape or args.clean or args.compute_index):
        parser.print_help()
        sys.exit(0)

    # Initialize PostgreSQL schemas
    init_db()

    # Trigger Scraping / Pipeline
    if args.scrape or args.clean or args.compute_index:
        run_pipeline(top_n=args.top_n, horizons=args.horizons, checkout=args.checkout)

    # Start Server
    if args.serve:
        start_server(host=args.host, port=args.port, reload=not args.no_reload)


if __name__ == "__main__":
    main()
