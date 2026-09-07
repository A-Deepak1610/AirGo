"""
CLI Runner for HappyFares Scraper.
Usage:
    python scripts/scrape_happyfares.py --route BOM-DEL --horizons 1,7,15,30,45
    python scripts/scrape_happyfares.py --route BOM-DEL --horizons 1 --visible
    python scripts/scrape_happyfares.py --route BOM-DEL --horizons 45 --visible --pause 20
"""

import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from airgo.scrapers.happyfares.scraper import run_happyfares_scrape
import argparse

def main():
    parser = argparse.ArgumentParser(description="AirGo HappyFares Live Airfare Scraper")
    parser.add_argument("--route", type=str, default="BOM-DEL", help="Target route e.g. BOM-DEL (default: BOM-DEL)")
    parser.add_argument("--horizons", type=str, default="1,7,15,30,45", help="Advance purchase days e.g. 1,7,15,30,45 (default: 1,7,15,30,45)")
    parser.add_argument("--visible", action="store_true", help="Run visible Chrome browser instead of headless")
    parser.add_argument("--pause", type=int, default=15, help="Seconds to pause browser on screen before closing in visible mode (default: 15)")
    args = parser.parse_args()

    horizon_list = [int(x.strip()) for x in args.horizons.split(",") if x.strip().isdigit()]
    if not horizon_list:
        horizon_list = [1, 7, 15, 30, 45]

    run_happyfares_scrape(route=args.route, horizons=horizon_list, headless=not args.visible, pause_at_end=args.pause)

if __name__ == "__main__":
    main()
