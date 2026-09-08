"""
Master Orchestrator CLI for AirGo Airfare Scrapers.
Runs Cleartrip, HappyFares, and Goibibo sequentially across specified advance purchase windows.
Adheres strictly to Zero Dummy Data, DOM-first extraction, and Visual Ground-Truth proof.

Usage:
    python scripts/run_all_scrapers.py --route BOM-DEL --horizons 1,7,15 --visible
    python scripts/run_all_scrapers.py --platforms cleartrip,happyfares,goibibo --horizons 1,7,15
"""

import sys
import os
import io
import time
import argparse
from pathlib import Path
from typing import List, Dict, Any

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

from airgo.scrapers.cleartrip.scraper import run_cleartrip_scrape
from airgo.scrapers.happyfares.scraper import run_happyfares_scrape
from airgo.scrapers.goibibo.scraper import run_goibibo_scrape


def main():
    parser = argparse.ArgumentParser(
        description="AirGo Multi-Platform Airfare Scraper Runner (Cleartrip, HappyFares, Goibibo)"
    )
    parser.add_argument(
        "--platforms",
        type=str,
        default="cleartrip,happyfares,goibibo",
        help="Comma-separated platforms to run: cleartrip,happyfares,goibibo (default: all 3)"
    )
    parser.add_argument(
        "--route",
        type=str,
        default="BOM-DEL",
        help="Target route e.g. BOM-DEL (default: BOM-DEL)"
    )
    parser.add_argument(
        "--horizons",
        type=str,
        default="1,7,15",
        help="Comma-separated advance purchase days e.g. 1,7,15 (default: 1,7,15)"
    )
    parser.add_argument(
        "--visible",
        action="store_true",
        help="Launch visible Chrome browser window (headed mode) instead of headless"
    )
    parser.add_argument(
        "--pause",
        type=int,
        default=3,
        help="Seconds to pause browser on screen before closing in visible mode (default: 3)"
    )
    args = parser.parse_args()

    # Parse horizons
    horizon_list = [int(x.strip()) for x in args.horizons.split(",") if x.strip().isdigit()]
    if not horizon_list:
        horizon_list = [1, 7, 15]

    # Parse platforms
    selected_platforms = [p.strip().lower() for p in args.platforms.split(",") if p.strip()]

    print("=" * 80)
    print("✈️  AIRGO MULTI-PLATFORM SCRAPER ORCHESTRATION")
    print(f"   * Route          : {args.route}")
    print(f"   * Horizons       : {[f'T+{h}' for h in horizon_list]}")
    print(f"   * Platforms      : {selected_platforms}")
    print(f"   * Visible Chrome : {args.visible}")
    print(f"   * Pause at end   : {args.pause}s")
    print("=" * 80)

    results: Dict[str, Any] = {}
    overall_start = time.time()

    for p in selected_platforms:
        print("\n" + "#" * 80)
        print(f"🚀 RUNNING SCRAPER FOR PLATFORM: {p.upper()}")
        print("#" * 80 + "\n")

        p_start = time.time()
        try:
            if p == "cleartrip":
                res = run_cleartrip_scrape(
                    route=args.route,
                    horizons=horizon_list,
                    headless=not args.visible,
                    pause_at_end=args.pause
                )
                results["cleartrip"] = {"status": "SUCCESS", "data": res, "duration": time.time() - p_start}
            elif p == "happyfares":
                res = run_happyfares_scrape(
                    route=args.route,
                    horizons=horizon_list,
                    headless=not args.visible,
                    pause_at_end=args.pause
                )
                results["happyfares"] = {"status": "SUCCESS", "data": res, "duration": time.time() - p_start}
            elif p == "goibibo":
                res = run_goibibo_scrape(
                    route=args.route,
                    horizons=horizon_list,
                    headless=not args.visible,
                    pause_at_end=args.pause
                )
                results["goibibo"] = {"status": "SUCCESS", "data": res, "duration": time.time() - p_start}
            else:
                print(f"[!] Unknown platform: {p}. Skipping.")
                results[p] = {"status": "UNKNOWN_PLATFORM"}
        except Exception as e:
            print(f"[❌ ERROR] Failure while running {p}: {e}")
            import traceback
            traceback.print_exc()
            results[p] = {"status": "FAILED", "error": str(e), "duration": time.time() - p_start}

        time.sleep(2.0)

    total_duration = time.time() - overall_start
    print("\n" + "=" * 80)
    print("🏁 ALL REQUESTED SCRAPERS FINISHED")
    print(f"   * Total Execution Time: {total_duration:.1f}s")
    for plat, info in results.items():
        dur_str = f"{info.get('duration', 0):.1f}s" if 'duration' in info else "N/A"
        print(f"   * {plat.upper():<12}: Status={info.get('status')} | Duration={dur_str}")
    print("=" * 80)


if __name__ == "__main__":
    main()
