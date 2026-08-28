from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Date, Boolean, JSON, Index
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# ==========================================
# SQLAlchemy ORM Tables
# ==========================================

class RawQuoteDB(Base):
    """Raw scraped price quote directly from airline/OTA sources."""
    __tablename__ = "raw_quotes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(50), nullable=False, index=True)
    carrier = Column(String(50), nullable=False, index=True)
    carrier_code = Column(String(10), nullable=True)
    flight_number = Column(String(20), nullable=False)
    origin = Column(String(10), nullable=False, index=True)
    destination = Column(String(10), nullable=False, index=True)
    departure_datetime = Column(DateTime, nullable=False, index=True)
    arrival_datetime = Column(DateTime, nullable=True)
    duration_mins = Column(Integer, nullable=True)
    stops = Column(Integer, default=0)
    
    booking_date = Column(Date, nullable=False, index=True)
    advance_window = Column(String(10), nullable=False, index=True)
    advance_days = Column(Integer, nullable=False)
    fare_class = Column(String(30), default="Economy")
    
    base_fare = Column(Float, nullable=True)
    surcharges = Column(Float, nullable=True)
    taxes = Column(Float, nullable=True)
    convenience_fee = Column(Float, nullable=True)
    total_fare = Column(Float, nullable=False)
    
    source_url = Column(String(500), nullable=True)
    is_sold_out = Column(Boolean, default=False)
    seats_remaining = Column(Integer, nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow, index=True)
    metadata_json = Column(JSON, nullable=True)


class CleanFareDB(Base):
    """De-duplicated, normalized, and outlier-filtered fare data."""
    __tablename__ = "clean_fares"

    id = Column(Integer, primary_key=True, autoincrement=True)
    raw_quote_id = Column(Integer, nullable=True)
    
    sector = Column(String(20), nullable=False, index=True)
    origin = Column(String(10), nullable=False)
    destination = Column(String(10), nullable=False)
    carrier = Column(String(50), nullable=False, index=True)
    flight_number = Column(String(20), nullable=False)
    
    departure_date = Column(Date, nullable=False, index=True)
    departure_time = Column(String(10), nullable=True)
    booking_date = Column(Date, nullable=False, index=True)
    advance_window = Column(String(10), nullable=False, index=True)
    advance_days = Column(Integer, nullable=False)
    fare_class = Column(String(30), default="Economy")
    stops = Column(Integer, default=0)
    
    base_fare = Column(Float, nullable=False)
    taxes_and_fees = Column(Float, nullable=False)
    total_fare = Column(Float, nullable=False, index=True)
    
    source_url = Column(String(500), nullable=True)
    is_outlier = Column(Boolean, default=False, index=True)
    outlier_reason = Column(String(100), nullable=True)
    source_count = Column(Integer, default=1)
    sources = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_sector_booking_advance", "sector", "booking_date", "advance_window"),
    )


class APIxIndexDB(Base):
    """Calculated Airfare Price Index (APIx) across time frequencies."""
    __tablename__ = "apix_indices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    index_date = Column(Date, nullable=False, index=True)
    frequency = Column(String(20), nullable=False, index=True)
    sector = Column(String(20), default="ALL", index=True)
    advance_window = Column(String(10), default="ALL")
    
    index_value = Column(Float, nullable=False)
    laspeyres_value = Column(Float, nullable=True)
    jevons_value = Column(Float, nullable=True)
    fisher_value = Column(Float, nullable=True)
    
    avg_fare = Column(Float, nullable=False)
    median_fare = Column(Float, nullable=False)
    min_fare = Column(Float, nullable=True)
    max_fare = Column(Float, nullable=True)
    quote_count = Column(Integer, nullable=False)
    
    dod_change_pct = Column(Float, nullable=True)
    wow_change_pct = Column(Float, nullable=True)
    mom_change_pct = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class DGCABenchmarkDB(Base):
    """Publicly available DGCA passenger traffic & monthly average fare benchmarks."""
    __tablename__ = "dgca_benchmarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sector = Column(String(20), nullable=False, index=True)
    period = Column(String(20), nullable=False, index=True)
    monthly_pax_traffic = Column(Integer, nullable=False)
    traffic_weight = Column(Float, nullable=False)
    avg_fare_published = Column(Float, nullable=False)
    base_fare_index = Column(Float, default=100.0)


class ScraperLogDB(Base):
    """Execution logs for scraper runs."""
    __tablename__ = "scraper_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(50), nullable=False, index=True)
    source = Column(String(50), nullable=False)
    route = Column(String(20), nullable=False)
    advance_window = Column(String(10), nullable=False)
    departure_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)
    flights_found = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ==========================================
# Pydantic DTOs
# ==========================================

class RawQuoteSchema(BaseModel):
    source: str
    carrier: str
    carrier_code: Optional[str] = None
    flight_number: str
    origin: str
    destination: str
    departure_datetime: datetime
    arrival_datetime: Optional[datetime] = None
    duration_mins: Optional[int] = None
    stops: int = 0
    booking_date: date
    advance_window: str
    advance_days: int
    fare_class: str = "Economy"
    base_fare: Optional[float] = None
    surcharges: Optional[float] = None
    taxes: Optional[float] = None
    convenience_fee: Optional[float] = None
    total_fare: float
    source_url: Optional[str] = None
    is_sold_out: bool = False
    seats_remaining: Optional[int] = None
    metadata_json: Optional[Dict[str, Any]] = None


class CleanFareSchema(BaseModel):
    sector: str
    origin: str
    destination: str
    carrier: str
    flight_number: str
    departure_date: date
    departure_time: Optional[str] = None
    booking_date: date
    advance_window: str
    advance_days: int
    fare_class: str = "Economy"
    stops: int = 0
    base_fare: float
    taxes_and_fees: float
    total_fare: float
    source_url: Optional[str] = None
    is_outlier: bool = False
    outlier_reason: Optional[str] = None
    source_count: int = 1
    sources: Optional[str] = None


class ElasticityPoint(BaseModel):
    advance_window: str
    advance_days: int
    avg_fare: float
    median_fare: float
    fare_multiplier: float
    elasticity_score: float
    sample_size: int
