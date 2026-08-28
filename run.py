import argparse
import logging
import sys
from datetime import date
import uvicorn
from airgo.pipeline.db import init_db
from airgo.scrapers.orchestrator import ScrapingOrchestrator
from airgo.pipeline.cleaner import DataCleaningPipeline
from airgo.engine.index_calculator import IndexCalculator
from airgo.engine.backtest import BacktestEngine

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("AirGo.Runner")


def main():
    parser = argparse.ArgumentParser(description="AirGo: Real-Time Airfare Price Index (APIx) Platform")
    parser.add_argument("--scrape", action="store_true", help="Execute live multi-source web scrapers")
    parser.add_argument("--clean", action="store_true", help="Run data cleaning, de-duplication, and outlier filtering")
    parser.add_argument("--compute-index", action="store_true", help="Compute daily/weekly/monthly APIx index values")
    parser.add_argument("--backtest", action="store_true", help="Run 30-day backtest against DGCA baseline")
    parser.add_argument("--serve", action="store_true", help="Start FastAPI web server and executive dashboard")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host address for web server")
    parser.add_argument("--port", type=int, default=8000, help="Port for web server")
    parser.add_argument("--all", action="store_true", help="Run complete pipeline (scrape -> clean -> compute -> serve)")

    args = parser.parse_args()

    # If no flags provided, default to --all
    if not any([args.scrape, args.clean, args.compute_index, args.backtest, args.serve, args.all]):
        args.all = True

    # 1. Initialize Database
    logger.info("Initializing AirGo database schema...")
    init_db()

    # 2. Seed DGCA Benchmarks
    backtester = BacktestEngine()
    backtester.seed_dgca_benchmarks()

    # 3. Scraping
    if args.scrape or args.all:
        logger.info("🚀 Running live multi-source web scraping across DGCA routes and advance windows...")
        orchestrator = ScrapingOrchestrator()
        result = orchestrator.run_batch(max_routes=6)
        logger.info(f"Scraping completed: {result}")

    # 4. Cleaning
    if args.clean or args.all:
        logger.info("🧹 Running data cleaning, de-duplication, and outlier removal...")
        cleaner = DataCleaningPipeline()
        clean_res = cleaner.process_pending_quotes(date.today())
        logger.info(f"Cleaning completed: {clean_res}")

    # 5. Compute Index
    if args.compute_index or args.all:
        logger.info("📊 Calculating Real-Time Airfare Price Index (APIx)...")
        calc = IndexCalculator()
        idx_res = calc.compute_daily_index(date.today())
        logger.info(f"APIx Index calculation completed: {idx_res}")

    # 6. Backtesting
    if args.backtest:
        logger.info("📈 Running 30-day backtest against official DGCA monthly tariff benchmarks...")
        bt_res = backtester.run_30_day_backtest()
        logger.info(f"Backtest MAPE: {bt_res['mape_pct']}% | Correlation: {bt_res['correlation_with_cpi']}")

    # 7. Start Web Server
    if args.serve or args.all:
        logger.info(f"🌐 Launching AirGo Executive Dashboard on http://{args.host}:{args.port}")
        uvicorn.run("airgo.api.app:app", host=args.host, port=args.port, reload=False)


if __name__ == "__main__":
    main()
