"""
AirGo Background Daemon Scheduler for Recurring Daily Executions.
Runs continuously as a background service and triggers the daily pipeline
at a configured time (default: 03:00 AM IST) every 24 hours.
Usage:
    python scripts/daily_scheduler.py --time 03:00
    python scripts/daily_scheduler.py --now  # Run immediately once, then schedule
"""

import os
import sys
import time
import logging
import argparse
import subprocess
from datetime import datetime, timedelta

# Add root directory to sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Scheduler] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(ROOT_DIR, "runs", "scheduler.log"), mode="a", encoding="utf-8")
    ]
)
logger = logging.getLogger("AirGo.Scheduler")


def run_harvest_cycle(top_n: int = 5, horizons: str = "1,7,15,30,45"):
    """Spawns the daily harvest runner process."""
    cmd = [
        sys.executable,
        os.path.join(ROOT_DIR, "scripts", "run_daily_harvest.py"),
        "--top-n", str(top_n),
        "--horizons", horizons
    ]
    logger.info(f"Triggering daily harvest subprocess: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=ROOT_DIR)
    if result.returncode == 0:
        logger.info("Daily harvest subprocess finished successfully.")
    else:
        logger.error(f"Daily harvest subprocess failed with exit code: {result.returncode}")


def start_scheduler(target_time_str: str = "03:00", top_n: int = 5, run_immediately: bool = False):
    """Schedules daily execution at target_time_str (HH:MM)."""
    target_hour, target_minute = [int(x) for x in target_time_str.split(":")]
    logger.info(f"AirGo Daily Scheduler initialized. Daily execution set to: {target_hour:02d}:{target_minute:02d} local time.")
    
    if run_immediately:
        logger.info("Immediate run requested (--now). Executing initial cycle...")
        run_harvest_cycle(top_n=top_n)

    while True:
        now = datetime.now()
        target_today = now.replace(hour=target_hour, minute=target_minute, second=0, microsecond=0)
        
        if now >= target_today:
            # Scheduled time has already passed today; schedule for tomorrow
            next_run = target_today + timedelta(days=1)
        else:
            next_run = target_today

        wait_seconds = (next_run - now).total_seconds()
        logger.info(f"Next automated execution scheduled for: {next_run.strftime('%Y-%m-%d %H:%M:%S')} (waiting {wait_seconds / 3600:.2f} hours)")

        # Sleep until next scheduled window
        time.sleep(wait_seconds)

        logger.info(f"Scheduled time reached ({next_run.strftime('%H:%M')}). Starting daily harvest...")
        run_harvest_cycle(top_n=top_n)

        # Brief sleep to prevent double execution in the same minute
        time.sleep(70)


def main():
    parser = argparse.ArgumentParser(description="AirGo Daily Recurring Pipeline Daemon")
    parser.add_argument("--time", type=str, default="03:00", help="Time of day for daily run in 24h format (HH:MM, default: 03:00)")
    parser.add_argument("--top-n", type=int, default=5, help="Number of routes to audit (default: 5)")
    parser.add_argument("--now", action="store_true", default=False, help="Trigger a run immediately before sleeping")

    args = parser.parse_args()
    
    os.makedirs(os.path.join(ROOT_DIR, "runs"), exist_ok=True)
    start_scheduler(target_time_str=args.time, top_n=args.top_n, run_immediately=args.now)


if __name__ == "__main__":
    main()
