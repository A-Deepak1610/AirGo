"""
Centralized CSS and XPath selectors for the Yatra flight search results page.
Organized into resilient selector fallbacks matching dynamic React DOM layouts.
"""

from typing import List


class YatraSelectors:
    """Central repository of DOM selectors for Yatra flight search interface."""

    # Containers for flight cards
    FLIGHT_CARDS: List[str] = [
        "div.flight-list div.flight-seg",
        "div.flight-tuple",
        "div[class*='flightItem']",
        "div[class*='flight-item']",
        "div.tuple",
        "div[class*='flight-card']",
        "div.flight-list > div.tuple",
    ]

    # Airline name selectors within a flight card
    AIRLINE_NAME: List[str] = [
        "div.fs-15",
        "span.airline-name",
        "div[class*='airline-name']",
        "span.i-b.text-blue",
        "span.i-b.ellipsis",
        "img[alt]",
    ]

    # Flight code / number
    FLIGHT_NUMBER: List[str] = [
        "span.fl-code",
        "span.flight-number",
        "p.font-lightgray",
        "span.normal",
        "span.fs-12.font-lightgray",
    ]

    # Departure and Arrival times
    DEPARTURE_TIME: List[str] = [
        "div[class*='depart'] .fs-18",
        "div.depart-time",
        "span.depart-time",
        "div.fs-18:first-of-type",
    ]
    ARRIVAL_TIME: List[str] = [
        "div[class*='arrival'] .fs-18",
        "div.arrival-time",
        "span.arrival-time",
        "div.fs-18:last-of-type",
    ]

    # Duration & Stops
    DURATION: List[str] = [
        "p.duration",
        "p.fs-12",
        "span.duration",
        "span.fs-12",
        "div[class*='duration']",
    ]
    STOPS: List[str] = [
        "span.cursor-default",
        "span.stops",
        "span[class*='stops']",
        "div[class*='stops']",
    ]

    # City / Airport / IATA code labels
    ORIGIN_IATA: List[str] = [
        "p.city-code:first-of-type",
        "span.city-code:first-of-type",
        "p[class*='origin']",
    ]
    DESTINATION_IATA: List[str] = [
        "p.city-code:last-of-type",
        "span.city-code:last-of-type",
        "p[class*='destination']",
    ]

    # Primary displayed fare price
    DISPLAYED_PRICE: List[str] = [
        "span.tipsy",
        "p.fs-18.font-bold",
        "span[class*='fare']",
        "span[class*='price']",
        "div[class*='total-price']",
        "span.total-fare",
    ]

    # Multiple fare options / family bundles within a flight card
    FARE_OPTIONS_CONTAINER: List[str] = [
        "div[class*='fare-family']",
        "div[class*='fare-dropdown']",
        "div[class*='fare-options']",
        "div.fare-option",
        "div[class*='fare-item']",
        "div[class*='fare-card']",
    ]
    FARE_OPTION_NAME: List[str] = [
        "span.fare-name",
        "p.fare-type",
        "span.fare-title",
        "span.font-bold",
    ]
    FARE_OPTION_PRICE: List[str] = [
        "span.fare-price",
        "span.price",
        "p.price",
        "span.tipsy",
        "span[class*='fare']",
    ]

    # Sold out or unavailable indicators
    SOLD_OUT: List[str] = [
        "span.sold-out",
        "div.sold-out",
        "span[class*='sold-out']",
        "div[class*='soldout']",
        "div[class*='unavailable']",
    ]

    # Anti-bot, WAF, and challenge markers
    CHALLENGE_SIGNATURES: List[str] = [
        "Access Denied",
        "You don't have permission to access",
        "Akamai",
        "Cloudflare",
        "cf-turnstile",
        "recaptcha",
        "hcaptcha",
        "Bot Protection",
        "Security Check",
        "Please verify you are a human",
        "Pardon Our Interruption",
    ]
