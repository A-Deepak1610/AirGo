"""
AirGo CLI Runner for Asynchronous Deep Checkout Harvesting across DGCA Routes.
Usage:
    python scripts/run_batch_harvest.py --top-n 2 --horizons 1,7 --workers 2
    python scripts/run_batch_harvest.py --top-n 5 --horizons 1,7,15,30,45 --workers 3
    python scripts/run_batch_harvest.py --top-n 20 --horizons 1,7,15,30,45 --workers 4
"""

import os
import sys
import asyncio
import argparse

# Add repository root to sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from airgo.harvester.async_batch_harvester import run_async_batch_harvest


def main():
    parser = argparse.ArgumentParser(description="AirGo Asynchronous Deep Checkout Route Harvester")
    parser.add_argument("--top-n", type=int, default=5, help="Number of top DGCA routes to audit (default: 5)")
    parser.add_argument("--horizons", type=str, default="1,7,15,30,45", help="Comma-separated advance horizons in days (e.g. 1,7,15,30,45)")
    parser.add_argument("--workers", type=int, default=3, help="Number of concurrent worker browser contexts (default: 3)")
    parser.add_argument("--csv", type=str, default="data/processed/dgca_top100_route_basket.csv", help="Path to DGCA top 100 route basket CSV")

    args = parser.parse_args()

    horizons_list = [int(h.strip()) for h in args.horizons.split(",") if h.strip().isdigit()]
    csv_full_path = os.path.join(ROOT_DIR, args.csv) if not os.path.isabs(args.csv) else args.csv

    asyncio.run(
        run_async_batch_harvest(
            csv_path=csv_full_path,
            top_n=args.top_n,
            horizons=horizons_list,
            num_workers=args.workers
        )
    )


if __name__ == "__main__":
    main()
