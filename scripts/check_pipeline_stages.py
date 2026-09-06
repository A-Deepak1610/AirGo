"""
AirGo Pipeline Stage Inspector and Health Auditor.
Prints the current status, row counts, latest records, and artifacts across all 5 pipeline stages.

Usage:
    python scripts/check_pipeline_stages.py
"""

import os
import sys
from datetime import date
from sqlalchemy import select, func, desc

import io

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from airgo.pipeline.db import get_db_session as get_db_context
from airgo.pipeline.models import (
    ScrapingRunDB, RawObservationDB, CanonicalFareDB,
    DailyAirfareAggregateDB, APIxIndexDB, DGCABenchmarkDB
)


def inspect_all_stages():
    print("\n" + "=" * 95)
    print("🔍 AIRGO MULTI-STAGE PIPELINE AUDIT & HEALTH MONITOR")
    print("=" * 95)

    with get_db_context() as db:
        # -------------------------------------------------------------
        # STAGE 1: Live Harvesting & Scraping Runs
        # -------------------------------------------------------------
        total_runs = db.scalar(select(func.count(ScrapingRunDB.id))) or 0
        total_raw = db.scalar(select(func.count(RawObservationDB.id))) or 0
        latest_runs = db.scalars(select(ScrapingRunDB).order_by(desc(ScrapingRunDB.started_at)).limit(4)).all()

        print(f"\n📡 [STAGE 1] LIVE HARVESTING & SCRAPING RUNS")
        print(f"   • Total Scraping Runs Logged  : {total_runs}")
        print(f"   • Total Raw Flight Quotes     : {total_raw}")
        print(f"   • Recent Harvest Executions   :")
        for r in latest_runs:
            status_symbol = "✅" if r.status == "SUCCESS" else "⚠️"
            dur = f"{(r.completed_at - r.started_at).total_seconds():.1f}s" if r.completed_at else "running"
            print(f"     {status_symbol} [{r.platform:<10}] Run ID: {r.scraping_run_id:<32} | Routes: {r.routes_count} | Status: {r.status} ({dur})")

        # -------------------------------------------------------------
        # STAGE 2: Canonical Deduplication & Outlier Filtering
        # -------------------------------------------------------------
        total_canonical = db.scalar(select(func.count(CanonicalFareDB.id))) or 0
        total_outliers = db.scalar(select(func.count(CanonicalFareDB.id)).where(CanonicalFareDB.is_outlier == True)) or 0
        latest_canonical = db.scalars(select(CanonicalFareDB).order_by(desc(CanonicalFareDB.id)).limit(3)).all()

        print(f"\n🧹 [STAGE 2] CANONICAL DEDUPLICATION & IQR OUTLIER FILTERING")
        print(f"   • Canonical Clean Fares       : {total_canonical}")
        print(f"   • Statistical Outliers Flagged: {total_outliers}")
        print(f"   • Sample Canonical Records    :")
        for c in latest_canonical:
            cheapest = f"(Cheapest: {c.cheapest_platform} | Observed: {c.observed_platforms})" if c.cheapest_platform else ""
            print(f"     ✈️  {c.carrier:<16} {c.flight_number:<8} | Route: {c.route} ({c.advance_purchase_window}) | Fare: ₹{c.min_total_fare:.1f} {cheapest}")

        # -------------------------------------------------------------
        # STAGE 3: Daily Route-Level Airfare Aggregates
        # -------------------------------------------------------------
        total_aggregates = db.scalar(select(func.count(DailyAirfareAggregateDB.id))) or 0
        sample_aggs = db.scalars(select(DailyAirfareAggregateDB).order_by(desc(DailyAirfareAggregateDB.observation_date)).limit(3)).all()

        print(f"\n📊 [STAGE 3] DAILY AIRFARE AGGREGATES")
        print(f"   • Total Route-Window Summary Rows : {total_aggregates}")
        print(f"   • Sample Aggregate Metrics        :")
        for a in sample_aggs:
            print(f"     📈 Route: {a.route:<8} | Horizon: {a.advance_purchase_window:<4} | Mean: ₹{a.average_fare:.1f} | Median: ₹{a.median_fare:.1f} | Quotes: {a.observation_count}")

        # -------------------------------------------------------------
        # STAGE 4: Real-Time APIx Price Index
        # -------------------------------------------------------------
        latest_index = db.scalars(
            select(APIxIndexDB).where(APIxIndexDB.sector == "ALL").order_by(desc(APIxIndexDB.index_date)).limit(1)
        ).first()

        print(f"\n🎯 [STAGE 4] REAL-TIME APIX PRICE INDICES (MoSPI / RBI BASE)")
        if latest_index:
            dod_str = f"{latest_index.dod_change_pct:+.2f}%" if latest_index.dod_change_pct is not None else "0.00% (Base Period)"
            print(f"   • Date               : {latest_index.index_date}")
            print(f"   • National APIx      : {latest_index.index_value:.2f}")
            print(f"   • Laspeyres Index    : {latest_index.laspeyres_value:.2f}")
            print(f"   • Jevons Geometric   : {latest_index.jevons_value:.2f}")
            print(f"   • Fisher Ideal Index : {latest_index.fisher_value:.2f}")
            print(f"   • Day-over-Day (DoD) : {dod_str}")
            print(f"   • Underlying Quotes  : {latest_index.quote_count}")
        else:
            print("   • Status: No index computed yet for today.")

        # -------------------------------------------------------------
        # STAGE 5: Benchmarking & Local Audit Evidence
        # -------------------------------------------------------------
        total_benchmarks = db.scalar(select(func.count(DGCABenchmarkDB.id))) or 0
        runs_dir = os.path.join(ROOT_DIR, "runs")
        local_runs = sorted([
            f for f in os.listdir(runs_dir)
            if os.path.isdir(os.path.join(runs_dir, f)) and f.startswith("202")
        ]) if os.path.exists(runs_dir) else []

        print(f"\n📁 [STAGE 5] AUDIT EVIDENCE & LOCAL RUN ARTIFACTS")
        print(f"   • DGCA Benchmark Rows : {total_benchmarks}")
        print(f"   • Local Evidence Runs : {len(local_runs)} folders in `runs/`")
        for folder in local_runs[-3:]:
            folder_path = os.path.join(runs_dir, folder)
            files = []
            for root, _, fs in os.walk(folder_path):
                files.extend(fs)
            has_shot = any(f.endswith(".png") for f in files)
            has_json = any(f.endswith(".json") for f in files)
            print(f"     📁 {folder:<45} (Proofs: Screenshot={has_shot}, JSON={has_json})")

    print("\n" + "=" * 95)
    print("💡 TIPS FOR INTERACTIVE INSPECTION:")
    print("   1. Run full pipeline       : python run.py --scrape --top-n 2 --horizons 1,7")
    print("   2. Launch web dashboard    : python run.py --serve")
    print("   3. Open browser dashboard  : http://127.0.0.1:8000/dashboard")
    print("   4. View interactive API doc: http://127.0.0.1:8000/docs")
    print("=" * 95 + "\n")


if __name__ == "__main__":
    inspect_all_stages()
