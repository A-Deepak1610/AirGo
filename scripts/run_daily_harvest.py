"""
AirGo Master Daily Automated Harvester and Pipeline Execution Script.
Executes complete end-to-end scheduled pipeline:
1. Live web harvest across configured top DGCA routes and advance windows (T+1, T+7, T+15, T+30, T+45)
2. PostgreSQL ingestion via PipelineOrchestrator
3. Canonical deduplication and IQR outlier filtering
4. Computation of Daily APIx Price Indices (Laspeyres, Jevons, Fisher)
5. Generation of timestamped run evidence and audit logs
"""

import os
import sys
import time
import asyncio
import logging
import argparse
from datetime import datetime, date

# Add workspace root to sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from airgo.utils.run_manager import create_run_directory, save_run_artifact
from airgo.harvester.cleartrip_harvester import run_cleartrip_harvest
from airgo.pipeline.db import init_db
from airgo.pipeline.cleaner import DataCleaningPipeline
from airgo.engine.index_calculator import IndexCalculator
from airgo.engine.backtest import BacktestEngine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("AirGo.DailyRunner")


def execute_daily_cycle(
    top_n: int = 5,
    horizons: str = "1,7,15,30,45",
    checkout_audit: bool = False
):
    """Executes a complete scheduled daily harvesting and indexing cycle."""
    start_time = time.time()
    today_str = date.today().isoformat()
    logger.info(f"================================================================")
    logger.info(f"🚀 [AIRGO] Starting Automated Daily Pipeline Execution ({today_str})")
    logger.info(f"   Top Routes: {top_n} | Advance Horizons: {horizons}")
    logger.info(f"================================================================")

    # 1. Initialize PostgreSQL database schema if needed
    init_db()

    # 2. Parse lead-time horizons
    horizons_list = [int(h.strip()) for h in horizons.split(",") if h.strip().isdigit()]
    csv_path = os.path.join(ROOT_DIR, "data", "processed", "dgca_top100_route_basket.csv")

    # 3. Execute live multi-carrier harvesting
    logger.info("📡 [Phase 1/4] Executing Live Multi-Carrier Web Harvesting...")
    try:
        asyncio.run(
            run_cleartrip_harvest(
                csv_path=csv_path,
                top_n=top_n,
                horizons=horizons_list,
                checkout=checkout_audit
            )
        )
    except Exception as e:
        logger.error(f"❌ Harvest phase failed: {e}", exc_info=True)
        # Still proceed to clean and index any quotes captured

    # 4. Clean, normalize and reject statistical outliers
    logger.info("🧹 [Phase 2/4] Running Data Cleaning, De-duplication & IQR Filtering...")
    cleaner = DataCleaningPipeline(iqr_multiplier=2.0)
    clean_result = cleaner.process_pending_quotes(date.today())
    logger.info(f"   Cleaning summary: {clean_result}")

    # 5. Compute Real-Time APIx Price Indices
    logger.info("📊 [Phase 3/4] Computing APIx Daily National and Sector Indices...")
    calculator = IndexCalculator()
    index_result = calculator.compute_daily_index(date.today())
    logger.info(f"   APIx Index Result: {index_result}")

    # 6. Benchmark against DGCA historical tariffs
    logger.info("📈 [Phase 4/4] Validating 30-Day Rolling Backtest against DGCA Benchmarks...")
    backtest = BacktestEngine()
    backtest_result = backtest.run_30_day_backtest()
    logger.info(f"   Backtest MAPE: {backtest_result.get('mape_pct')}% | Correlation: {backtest_result.get('correlation_with_cpi')}")

    elapsed = round(time.time() - start_time, 2)
    logger.info(f"================================================================")
    logger.info(f"✅ [AIRGO] Daily Scheduled Pipeline Completed in {elapsed}s")
    logger.info(f"================================================================")


def main():
    parser = argparse.ArgumentParser(description="AirGo Automated Daily Production Runner")
    parser.add_argument("--top-n", type=int, default=5, help="Number of top DGCA routes (default: 5)")
    parser.add_argument("--horizons", type=str, default="1,7,15,30,45", help="Advance lead-time days")
    parser.add_argument("--checkout", action="store_true", default=False, help="Run deep checkout tax audit")

    args = parser.parse_args()
    execute_daily_cycle(top_n=args.top_n, horizons=args.horizons, checkout_audit=args.checkout)


if __name__ == "__main__":
    main()
