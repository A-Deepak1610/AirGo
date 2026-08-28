from datetime import date, timedelta
from airgo.scrapers.airline_scrapers import AirlineDirectScraper
from airgo.scrapers.easemytrip_scraper import EaseMyTripScraper
from airgo.pipeline.models import RawQuoteSchema


def test_airline_direct_scraper():
    scraper = AirlineDirectScraper(airline_code="6E")
    dep_date = date.today() + timedelta(days=7)
    quotes = scraper.fetch_quotes(
        origin="DEL",
        destination="BOM",
        departure_date=dep_date,
        advance_window="T+7",
        advance_days=7
    )
    assert len(quotes) > 0
    q = quotes[0]
    assert isinstance(q, RawQuoteSchema)
    assert q.carrier == "IndiGo"
    assert q.origin == "DEL"
    assert q.destination == "BOM"
    assert q.total_fare > 0
    assert q.base_fare > 0
    assert q.advance_window == "T+7"


def test_easemytrip_scraper_parsing():
    scraper = EaseMyTripScraper()
    item = {
        "AirlineCode": "AI",
        "AirlineName": "Air India",
        "FlightNumber": "AI-805",
        "Fare": 5400.0,
        "BaseFare": 4000.0,
        "Tax": 1400.0,
        "DepartureTime": "09:30",
        "Stops": 0,
        "Duration": 130
    }
    dep_date = date.today() + timedelta(days=1)
    q = scraper._parse_flight_item(
        item,
        origin="DEL",
        destination="BOM",
        departure_date=dep_date,
        booking_date=date.today(),
        advance_window="T+1",
        advance_days=1
    )
    assert q is not None
    assert q.carrier == "Air India"
    assert q.flight_number == "AI-805"
    assert q.total_fare == 5400.0
    assert q.base_fare == 4000.0
