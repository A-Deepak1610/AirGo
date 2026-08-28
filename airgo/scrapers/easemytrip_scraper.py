import logging
import random
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from curl_cffi import requests as curl_requests
from airgo.scrapers.base import BaseScraper
from airgo.pipeline.models import RawQuoteSchema
from airgo.engine.dgca_weights import INDIAN_AIRLINES

logger = logging.getLogger("AirGoScraper.EaseMyTrip")


class EaseMyTripScraper(BaseScraper):
    """
    Live web scraper for EaseMyTrip domestic flight search.
    Uses curl_cffi with Chrome 124 TLS/JA3 impersonation to query real-time airfares.
    """

    def __init__(self, rate_limit_secs: float = 1.0):
        super().__init__(name="EaseMyTrip", rate_limit_secs=rate_limit_secs)
        self.search_url = "https://flight.easemytrip.com/FlightList/GetFlightList"

    def fetch_quotes(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        advance_window: str,
        advance_days: int
    ) -> List[RawQuoteSchema]:
        """Fetch live quotes from EaseMyTrip search API using browser TLS impersonation."""
        formatted_date = departure_date.strftime("%d/%m/%Y") # DD/MM/YYYY
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Referer": f"https://flight.easemytrip.com/FlightList/Index?srch={origin}-{destination}-{formatted_date}&px=1-0-0&cbn=0&ar=undefined&isDM=true",
            "Content-Type": "application/json; charset=UTF-8",
            "Origin": "https://flight.easemytrip.com",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
        }

        payload = {
            "org": origin,
            "dest": destination,
            "dd": formatted_date,
            "ad": 1,
            "ch": 0,
            "in": 0,
            "cls": "0", # Economy
            "isDom": True,
            "cpc": ""
        }

        quotes: List[RawQuoteSchema] = []
        booking_today = date.today()

        try:
            # Using curl_cffi for Chrome TLS fingerprint impersonation
            response = curl_requests.post(
                self.search_url,
                json=payload,
                headers=headers,
                impersonate="chrome124",
                timeout=15
            )

            if response.status_code == 200:
                try:
                    data = response.json()
                    flight_items = []
                    if isinstance(data, dict):
                        flight_items = data.get("FlightDetails", []) or data.get("flights", []) or data.get("data", []) or data.get("AvailableFlights", [])
                    elif isinstance(data, list):
                        flight_items = data

                    for item in flight_items:
                        quote = self._parse_flight_item(item, origin, destination, departure_date, booking_today, advance_window, advance_days)
                        if quote:
                            quotes.append(quote)
                except Exception as parse_err:
                    self.logger.debug(f"JSON parsing note: {parse_err}")
            else:
                self.logger.debug(f"EaseMyTrip status {response.status_code}")
        except Exception as e:
            self.logger.debug(f"EaseMyTrip primary request error: {e}")

        # If primary API requires active session cookie, query secondary live endpoint
        if not quotes:
            quotes = self._fetch_live_ota_stream(origin, destination, departure_date, booking_today, advance_window, advance_days)

        return quotes

    def _parse_flight_item(
        self,
        item: Dict[str, Any],
        origin: str,
        destination: str,
        departure_date: date,
        booking_date: date,
        advance_window: str,
        advance_days: int
    ) -> Optional[RawQuoteSchema]:
        """Normalize raw flight payload into RawQuoteSchema."""
        try:
            carrier_code = item.get("AirlineCode") or item.get("alCode", "6E")
            carrier_name = item.get("AirlineName") or INDIAN_AIRLINES.get(carrier_code, "IndiGo")
            flight_no = str(item.get("FlightNumber") or item.get("fltNo") or "101")
            if not flight_no.startswith(carrier_code):
                flight_no = f"{carrier_code}-{flight_no}"

            total_fare = float(item.get("Fare") or item.get("grossFare") or item.get("TotalFare") or item.get("Price") or 0)
            if total_fare <= 0:
                return None

            base_fare = float(item.get("BaseFare") or round(total_fare * 0.74, 2))
            taxes = float(item.get("Tax") or round(total_fare - base_fare, 2))
            surcharges = float(item.get("FuelSurcharge") or 0.0)
            convenience_fee = float(item.get("ConvenienceFee") or 350.0)

            dep_time_str = str(item.get("DepartureTime") or item.get("depTime") or "07:30")
            dep_hour, dep_min = [int(x) for x in dep_time_str.split(":")[:2]]
            dep_datetime = datetime.combine(departure_date, datetime.min.time()).replace(hour=dep_hour, minute=dep_min)

            stops = int(item.get("Stops") or item.get("stops") or 0)
            duration = int(item.get("Duration") or item.get("durationMinutes") or 130)

            return RawQuoteSchema(
                source="EaseMyTrip",
                carrier=carrier_name,
                carrier_code=carrier_code,
                flight_number=flight_no,
                origin=origin,
                destination=destination,
                departure_datetime=dep_datetime,
                duration_mins=duration,
                stops=stops,
                booking_date=booking_date,
                advance_window=advance_window,
                advance_days=advance_days,
                fare_class="Economy",
                base_fare=base_fare,
                surcharges=surcharges,
                taxes=taxes,
                convenience_fee=convenience_fee,
                total_fare=total_fare,
                is_sold_out=item.get("IsSoldOut", False),
                seats_remaining=item.get("SeatsLeft", 9),
                metadata_json={"raw_airline": carrier_name, "provider": "EaseMyTrip"}
            )
        except Exception:
            return None

    def _fetch_live_ota_stream(
        self,
        origin: str,
        destination: str,
        departure_date: date,
        booking_date: date,
        advance_window: str,
        advance_days: int
    ) -> List[RawQuoteSchema]:
        """Live search query across EaseMyTrip web flight stream."""
        quotes = []
        try:
            url = f"https://flight.easemytrip.com/api/v1/FareCalendar/{origin}/{destination}/{departure_date.strftime('%Y-%m-%d')}"
            res = curl_requests.get(url, impersonate="chrome124", timeout=10)
            if res.status_code == 200:
                data = res.json()
                if isinstance(data, list):
                    for flight in data:
                        q = self._parse_flight_item(flight, origin, destination, departure_date, booking_date, advance_window, advance_days)
                        if q:
                            quotes.append(q)
        except Exception:
            pass
        return quotes
