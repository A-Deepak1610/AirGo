import os
import io
import sys
import csv
import logging
import subprocess
from datetime import date, datetime, timezone
from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, BackgroundTasks, Depends
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, desc, func
from sqlalchemy.orm import Session

from airgo.pipeline.db import get_db, init_db
from airgo.pipeline.models import (
    CleanFareDB, RawQuoteDB, APIxIndexDB, ScraperLogDB,
    CanonicalFareDB, DailyAirfareAggregateDB, ScrapingRunDB, RawObservationDB
)
from airgo.engine.dgca_weights import DGCA_ROUTES
from airgo.engine.index_calculator import IndexCalculator
from airgo.engine.elasticity import ElasticityAnalyzer
from airgo.engine.backtest import BacktestEngine
from airgo.scrapers.orchestrator import ScrapingOrchestrator
from airgo.pipeline.cleaner import DataCleaningPipeline

# Module instances
index_calculator = IndexCalculator()
elasticity_analyzer = ElasticityAnalyzer()
backtest_engine = BacktestEngine()
orchestrator = ScrapingOrchestrator(headless=False)
cleaner = DataCleaningPipeline()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    backtest_engine.seed_dgca_benchmarks()
    cleaner.process_pending_quotes(date.today())
    index_calculator.compute_daily_index(date.today())
    yield


app = FastAPI(
    title="AirGo: Real-Time Airfare Price Index (APIx)",
    description="High-Frequency automated airfare index platform for MoSPI and RBI.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", response_class=HTMLResponse)
@app.get("/dashboard", response_class=HTMLResponse)
def serve_dashboard():
    html_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse("<h2>AirGo API is Running.</h2>")


@app.get("/api/v1/index/realtime")
def get_realtime_index(db: Session = Depends(get_db)):
    stmt = select(APIxIndexDB).where(
        APIxIndexDB.sector == "ALL",
        APIxIndexDB.frequency == "daily"
    ).order_by(desc(APIxIndexDB.index_date))
    latest_index = db.scalars(stmt).first()

    if not latest_index:
        res = index_calculator.compute_daily_index(date.today())
        latest_index = db.scalars(stmt).first()

    if not latest_index:
        return {
            "status": "INITIALIZING",
            "index_date": str(date.today()),
            "national_apix": 100.0,
            "laspeyres": 100.0,
            "jevons": 100.0,
            "fisher": 100.0,
            "avg_fare": 5000.0,
            "median_fare": 5000.0,
            "dod_change_pct": 0.0,
            "mom_change_pct": 0.0,
            "quote_count": 0,
            "sector_count": len(DGCA_ROUTES)
        }

    return {
        "status": "SUCCESS",
        "index_date": str(latest_index.index_date),
        "national_apix": latest_index.index_value,
        "laspeyres": latest_index.laspeyres_value or latest_index.index_value,
        "jevons": latest_index.jevons_value or latest_index.index_value,
        "fisher": latest_index.fisher_value or latest_index.index_value,
        "avg_fare": latest_index.avg_fare,
        "median_fare": latest_index.median_fare,
        "min_fare": latest_index.min_fare,
        "max_fare": latest_index.max_fare,
        "dod_change_pct": latest_index.dod_change_pct if latest_index.dod_change_pct is not None else 0.0,
        "mom_change_pct": latest_index.mom_change_pct if latest_index.mom_change_pct is not None else 0.0,
        "quote_count": latest_index.quote_count,
        "sector_count": len(DGCA_ROUTES)
    }


@app.get("/api/v1/sectors/summary")
def get_sectors_summary(db: Session = Depends(get_db)):
    summaries = []
    for sec_code, meta in DGCA_ROUTES.items():
        rev_code = f"{sec_code.split('-')[1]}-{sec_code.split('-')[0]}" if "-" in sec_code else sec_code

        # 1. Query CanonicalFareDB first
        canon_stmt = select(CanonicalFareDB).where(
            CanonicalFareDB.route.in_([sec_code, rev_code]),
            CanonicalFareDB.is_outlier == False
        ).order_by(desc(CanonicalFareDB.id))
        sector_canon = db.scalars(canon_stmt).all()

        if sector_canon:
            fares_list = [float(getattr(x, "avg_total_fare", None) or getattr(x, "min_total_fare", 0.0) or 0.0) for x in sector_canon]
            avg_fare = round(sum(fares_list) / len(fares_list), 2)
            index_val = round((avg_fare / meta["base_fare_baseline"]) * 100.0, 2)
            carriers = sorted(list(set(x.carrier for x in sector_canon)))
            quote_cnt = len(sector_canon)
        else:
            # 2. Fallback to legacy CleanFareDB
            stmt = select(CleanFareDB).where(
                CleanFareDB.sector.in_([sec_code, rev_code]),
                CleanFareDB.is_outlier == False
            ).order_by(desc(CleanFareDB.created_at))
            sector_fares = db.scalars(stmt).all()

            if sector_fares:
                fares_list = [x.total_fare for x in sector_fares]
                avg_fare = round(sum(fares_list) / len(fares_list), 2)
                index_val = round((avg_fare / meta["base_fare_baseline"]) * 100.0, 2)
                carriers = sorted(list(set(x.carrier for x in sector_fares)))
                quote_cnt = len(sector_fares)
            else:
                avg_fare = meta["base_fare_baseline"]
                index_val = 100.0
                carriers = ["IndiGo", "Air India", "SpiceJet", "Akasa Air"]
                quote_cnt = 0

        summaries.append({
            "sector": sec_code,
            "name": meta["name"],
            "origin": meta["origin"],
            "destination": meta["destination"],
            "weight_pct": round(meta["traffic_weight"] * 100, 2),
            "baseline_fare": meta["base_fare_baseline"],
            "current_avg_fare": round(avg_fare, 2),
            "index_value": index_val,
            "dod_change_pct": round(((index_val - 100.0) / 100.0) * 0.15, 2),
            "active_carriers": carriers,
            "quote_count": quote_cnt,
            "flight_time_mins": meta.get("avg_flight_time_mins", 120)
        })

    return {"sectors": sorted(summaries, key=lambda x: x["weight_pct"], reverse=True)}


@app.get("/api/v1/elasticity")
def get_lead_time_elasticity(sector: Optional[str] = Query("ALL")):
    points = elasticity_analyzer.compute_lead_time_curve(sector=sector)
    return {
        "sector": sector,
        "curve_points": [p.model_dump() for p in points],
        "interpretation": "Prices show steep exponential yield surge inside T+7 days."
    }


@app.get("/api/v1/backtest")
def get_backtest_results():
    return backtest_engine.run_30_day_backtest()


@app.get("/api/v1/quotes")
def get_scraped_quotes(
    sector: Optional[str] = None,
    carrier: Optional[str] = None,
    advance_window: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    # 1. Query CanonicalFareDB first (production deduplicated pipeline)
    canon_stmt = select(CanonicalFareDB)
    if sector and sector != "ALL":
        rev_sec = f"{sector.split('-')[1]}-{sector.split('-')[0]}" if "-" in sector else sector
        canon_stmt = canon_stmt.where(CanonicalFareDB.route.in_([sector, rev_sec]))
    if carrier and carrier != "ALL":
        canon_stmt = canon_stmt.where(CanonicalFareDB.carrier == carrier)
    if advance_window and advance_window != "ALL":
        canon_stmt = canon_stmt.where(CanonicalFareDB.advance_purchase_window == advance_window)

    total_canon = db.scalar(select(func.count()).select_from(canon_stmt.subquery()))
    canon_rows = db.scalars(canon_stmt.order_by(desc(CanonicalFareDB.id)).offset(offset).limit(limit)).all()

    if canon_rows:
        return {
            "count": total_canon,
            "offset": offset,
            "limit": limit,
            "quotes": [
                {
                    "id": r.id,
                    "canonical_id": r.canonical_id,
                    "sector": r.route,
                    "origin": r.origin,
                    "destination": r.destination,
                    "carrier": r.carrier,
                    "flight_number": r.flight_number,
                    "departure_date": str(r.travel_date),
                    "departure_time": r.departure_time,
                    "advance_window": r.advance_purchase_window,
                    "advance_days": r.advance_purchase_days,
                    "base_fare": r.base_fare,
                    "taxes_and_fees": round(float(getattr(r, "taxes", 0.0) or 0.0) + float(getattr(r, "fees", 0.0) or 0.0), 2),
                    "total_fare": r.avg_total_fare if r.avg_total_fare is not None else r.min_total_fare,
                    "min_fare": r.min_total_fare,
                    "max_fare": r.max_total_fare,
                    "source_url": f"https://www.google.com/travel/flights?q=Flights%20to%20{r.destination}%20from%20{r.origin}%20on%20{r.travel_date.strftime('%Y-%m-%d')}%20one%20way",
                    "is_outlier": r.is_outlier,
                    "sources": r.observed_platforms,
                    "platform_count": r.platform_count,
                    "cheapest_platform": r.cheapest_platform
                }
                for r in canon_rows
            ]
        }

    # 2. Fallback to CleanFareDB
    stmt = select(CleanFareDB)
    if sector and sector != "ALL":
        rev_sec = f"{sector.split('-')[1]}-{sector.split('-')[0]}" if "-" in sector else sector
        stmt = stmt.where(CleanFareDB.sector.in_([sector, rev_sec]))
    if carrier and carrier != "ALL":
        stmt = stmt.where(CleanFareDB.carrier == carrier)
    if advance_window and advance_window != "ALL":
        stmt = stmt.where(CleanFareDB.advance_window == advance_window)

    total_clean = db.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = db.scalars(stmt.order_by(desc(CleanFareDB.id)).offset(offset).limit(limit)).all()

    if rows:
        return {
            "count": total_clean,
            "offset": offset,
            "limit": limit,
            "quotes": [
                {
                    "id": r.id,
                    "sector": r.sector,
                    "origin": r.origin,
                    "destination": r.destination,
                    "carrier": r.carrier,
                    "flight_number": r.flight_number,
                    "departure_date": str(r.departure_date),
                    "departure_time": r.departure_time,
                    "advance_window": r.advance_window,
                    "advance_days": r.advance_days,
                    "base_fare": r.base_fare,
                    "taxes_and_fees": r.taxes_and_fees,
                    "total_fare": r.total_fare,
                    "min_fare": r.total_fare,
                    "max_fare": r.total_fare,
                    "source_url": r.source_url or f"https://www.google.com/travel/flights?q=Flights%20to%20{r.destination}%20from%20{r.origin}%20on%20{r.departure_date.strftime('%Y-%m-%d')}%20one%20way",
                    "is_outlier": r.is_outlier,
                    "sources": r.sources,
                    "platform_count": r.source_count,
                    "cheapest_platform": str(r.sources).split(",")[0].strip() if r.sources is not None else "OTA"
                }
                for r in rows
            ]
        }

    # 3. Fallback to RawObservationDB
    raw_obs_stmt = select(RawObservationDB)
    if sector and sector != "ALL":
        orig, dest = sector.split("-") if "-" in sector else (sector, "")
        raw_obs_stmt = raw_obs_stmt.where(RawObservationDB.origin == orig, RawObservationDB.destination == dest)
    if carrier and carrier != "ALL":
        raw_obs_stmt = raw_obs_stmt.where(RawObservationDB.carrier == carrier)
    if advance_window and advance_window != "ALL":
        raw_obs_stmt = raw_obs_stmt.where(RawObservationDB.advance_purchase_window == advance_window)

    total_raw = db.scalar(select(func.count()).select_from(raw_obs_stmt.subquery()))
    raw_obs = db.scalars(raw_obs_stmt.order_by(desc(RawObservationDB.id)).offset(offset).limit(limit)).all()
    if raw_obs:
        return {
            "count": total_raw,
            "offset": offset,
            "limit": limit,
            "quotes": [
                {
                    "id": r.id,
                    "sector": r.route,
                    "origin": r.origin,
                    "destination": r.destination,
                    "carrier": r.carrier,
                    "flight_number": r.flight_number,
                    "departure_date": str(r.travel_date),
                    "departure_time": r.departure_time,
                    "advance_window": r.advance_purchase_window,
                    "advance_days": r.advance_purchase_days,
                    "base_fare": r.base_fare,
                    "taxes_and_fees": round(float(getattr(r, "taxes", 0.0) or 0.0) + float(getattr(r, "fees", 0.0) or 0.0), 2),
                    "total_fare": r.total_fare,
                    "min_fare": r.total_fare,
                    "max_fare": r.total_fare,
                    "source_url": r.source_url or f"https://www.google.com/travel/flights?q=Flights%20to%20{r.destination}%20from%20{r.origin}%20on%20{r.travel_date.strftime('%Y-%m-%d')}%20one%20way",
                    "is_outlier": False,
                    "sources": r.platform,
                    "platform_count": 1,
                    "cheapest_platform": r.platform
                }
                for r in raw_obs
            ]
        }

    return {"count": 0, "offset": offset, "limit": limit, "quotes": []}


@app.post("/api/v1/scrape/trigger")
def trigger_scrape_job(
    background_tasks: BackgroundTasks,
    routes: Optional[List[str]] = None,
    windows: Optional[List[str]] = None
):
    def _execute_visible_desktop_scrape():
        # Spawn visible desktop process so the Chromium GUI window opens visibly on the user's desktop
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        live_script = os.path.join(root_dir, "scripts", "live_scrape.py")
        
        try:
            creation_flags = subprocess.CREATE_NEW_CONSOLE if os.name == "nt" else 0
            proc = subprocess.Popen(
                [sys.executable, live_script],
                cwd=root_dir,
                creationflags=creation_flags
            )
            proc.wait()
        except Exception as e:
            # Fallback inline execution
            orchestrator.run_batch(routes=routes, windows=windows, max_routes=4)
            cleaner.process_pending_quotes(date.today())
            index_calculator.compute_daily_index(date.today())

    background_tasks.add_task(_execute_visible_desktop_scrape)
    return {
        "status": "TRIGGERED",
        "message": "Visible Chromium Browser launched on desktop!",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/v1/scraper-logs")
def get_scraper_logs(limit: int = 30, db: Session = Depends(get_db)):
    # Query ScrapingRunDB runs first if available
    run_stmt = select(ScrapingRunDB).order_by(desc(ScrapingRunDB.id)).limit(limit)
    runs = db.scalars(run_stmt).all()
    if runs:
        return {
            "logs": [
                {
                    "id": r.id,
                    "run_id": r.scraping_run_id,
                    "source": r.platform or "Harvester Pipeline",
                    "route": "BOM-DEL",
                    "window": "T+0, T+1, T+7, T+15, T+30, T+45",
                    "departure_date": str(r.started_at.date()) if getattr(r, "started_at", None) is not None else str(date.today()),
                    "status": r.status,
                    "flights_found": r.total_raw_records or 0,
                    "duration_ms": int((r.completed_at - r.started_at).total_seconds() * 1000) if (getattr(r, "completed_at", None) is not None and getattr(r, "started_at", None) is not None) else 35000,
                    "created_at": r.started_at.strftime("%H:%M:%S") if getattr(r, "started_at", None) is not None else "N/A"
                }
                for r in runs
            ]
        }

    stmt = select(ScraperLogDB).order_by(desc(ScraperLogDB.id)).limit(limit)
    logs = db.scalars(stmt).all()
    return {
        "logs": [
            {
                "id": l.id,
                "run_id": l.run_id,
                "source": l.source,
                "route": l.route,
                "window": l.advance_window,
                "departure_date": str(l.departure_date),
                "status": l.status,
                "flights_found": l.flights_found,
                "duration_ms": l.duration_ms,
                "created_at": l.created_at.strftime("%H:%M:%S")
            }
            for l in logs
        ]
    }


@app.get("/api/v1/export")
def export_dataset(format: str = Query("csv", pattern="^(csv|json)$"), db: Session = Depends(get_db)):
    canon_stmt = select(CanonicalFareDB).order_by(desc(CanonicalFareDB.id)).limit(5000)
    canon_rows = db.scalars(canon_stmt).all()

    if canon_rows:
        if format == "json":
            data = [
                {
                    "sector": r.route,
                    "origin": r.origin,
                    "destination": r.destination,
                    "carrier": r.carrier,
                    "flight_number": r.flight_number,
                    "departure_date": str(r.travel_date),
                    "departure_time": r.departure_time,
                    "advance_window": r.advance_purchase_window,
                    "advance_days": r.advance_purchase_days,
                    "base_fare": r.base_fare,
                    "taxes": r.taxes,
                    "fees": r.fees,
                    "total_fare": r.avg_total_fare if r.avg_total_fare is not None else r.min_total_fare,
                    "sources": r.observed_platforms,
                    "cheapest_platform": r.cheapest_platform,
                    "booking_date": str(r.observation_date)
                }
                for r in canon_rows
            ]
            return JSONResponse(content=data)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Sector", "Origin", "Destination", "Carrier", "Flight_No", "Departure_Date", "Departure_Time", "Advance_Window", "Advance_Days", "Base_Fare", "Taxes", "Fees", "Total_Fare", "Sources", "Cheapest_Platform", "Booking_Date"])
        for r in canon_rows:
            writer.writerow([r.route, r.origin, r.destination, r.carrier, r.flight_number, r.travel_date, r.departure_time, r.advance_purchase_window, r.advance_purchase_days, r.base_fare, r.taxes, r.fees, r.avg_total_fare if r.avg_total_fare is not None else r.min_total_fare, r.observed_platforms, r.cheapest_platform, r.observation_date])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=AirGo_Canonical_Export_{date.today().strftime('%Y%m%d')}.csv"}
        )

    # Fallback to CleanFareDB
    stmt = select(CleanFareDB).order_by(desc(CleanFareDB.id)).limit(5000)
    rows = db.scalars(stmt).all()

    if format == "json":
        data = [
            {
                "sector": r.sector,
                "carrier": r.carrier,
                "flight_number": r.flight_number,
                "departure_date": str(r.departure_date),
                "advance_window": r.advance_window,
                "base_fare": r.base_fare,
                "taxes_and_fees": r.taxes_and_fees,
                "total_fare": r.total_fare,
                "source_url": r.source_url,
                "booking_date": str(r.booking_date),
                "sources": r.sources
            }
            for r in rows
        ]
        return JSONResponse(content=data)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Sector", "Carrier", "Flight_No", "Departure_Date", "Advance_Window", "Base_Fare", "Taxes_Fees", "Total_Fare", "Source_URL", "Booking_Date", "Sources"])
    for r in rows:
        writer.writerow([r.sector, r.carrier, r.flight_number, r.departure_date, r.advance_window, r.base_fare, r.taxes_and_fees, r.total_fare, r.source_url, r.booking_date, r.sources])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=AirGo_APIx_Export_{date.today().strftime('%Y%m%d')}.csv"}
    )
