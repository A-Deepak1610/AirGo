from datetime import date, datetime
from airgo.pipeline.db import init_db, get_db_session
from airgo.pipeline.models import RawQuoteDB, CleanFareDB
from airgo.pipeline.cleaner import DataCleaningPipeline
from sqlalchemy import select


def test_data_cleaning_pipeline():
    init_db()
    today = date.today()
    cleaner = DataCleaningPipeline(iqr_multiplier=1.5)

    # Insert sample raw quotes including a duplicate and an extreme outlier
    with get_db_session() as session:
        session.add_all([
            RawQuoteDB(
                source="EaseMyTrip", carrier="IndiGo", flight_number="6E-205",
                origin="DEL", destination="BOM", departure_datetime=datetime.now(),
                booking_date=today, advance_window="T+7", advance_days=7,
                base_fare=3500.0, total_fare=4800.0
            ),
            RawQuoteDB(
                source="Ixigo", carrier="IndiGo", flight_number="6E-205",
                origin="DEL", destination="BOM", departure_datetime=datetime.now(),
                booking_date=today, advance_window="T+7", advance_days=7,
                base_fare=3600.0, total_fare=4900.0 # Duplicate flight
            ),
            RawQuoteDB(
                source="EaseMyTrip", carrier="Air India", flight_number="AI-101",
                origin="DEL", destination="BOM", departure_datetime=datetime.now(),
                booking_date=today, advance_window="T+7", advance_days=7,
                base_fare=3700.0, total_fare=5000.0
            ),
            RawQuoteDB(
                source="EaseMyTrip", carrier="SpiceJet", flight_number="SG-812",
                origin="DEL", destination="BOM", departure_datetime=datetime.now(),
                booking_date=today, advance_window="T+7", advance_days=7,
                base_fare=3600.0, total_fare=4900.0
            ),
            RawQuoteDB(
                source="EaseMyTrip", carrier="Akasa Air", flight_number="QP-112",
                origin="DEL", destination="BOM", departure_datetime=datetime.now(),
                booking_date=today, advance_window="T+7", advance_days=7,
                base_fare=3400.0, total_fare=4700.0
            ),
            RawQuoteDB(
                source="FaultySource", carrier="TestAir", flight_number="TA-999",
                origin="DEL", destination="BOM", departure_datetime=datetime.now(),
                booking_date=today, advance_window="T+7", advance_days=7,
                base_fare=45000.0, total_fare=52000.0 # Extreme Outlier
            ),
        ])

    result = cleaner.process_pending_quotes(today)
    assert result["status"] == "SUCCESS"
    assert result["raw_quotes_processed"] >= 6
    assert result["outliers_removed"] >= 1
