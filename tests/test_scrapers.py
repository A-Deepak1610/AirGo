from datetime import date, timedelta
from airgo.scrapers.easemytrip_scraper import EaseMyTripScraper
from airgo.scrapers.cleartrip_scraper import parse_cleartrip_flight_card


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


def test_cleartrip_scraper_parsing():
    sample_text = """
    IndiGo
    6E-5014
    18:30
    3h 55m
    Non-stop
    22:25
    ₹6,179
    Book
    """
    parsed = parse_cleartrip_flight_card(sample_text)
    assert parsed is not None
    assert parsed["carrier"] == "IndiGo"
    assert parsed["flight_number"] == "6E-5014"
    assert parsed["total_fare"] == 6179.0
    assert parsed["departure_time"] == "18:30"
    assert parsed["arrival_time"] == "22:25"
