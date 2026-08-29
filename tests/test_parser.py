import re
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(locale="en-IN")
    url = "https://www.google.com/travel/flights?q=Flights%20to%20BOM%20from%20DEL%20on%202026-08-29%20one%20way"
    page.goto(url, wait_until="domcontentloaded")
    page.wait_for_timeout(4000)
    
    rows = page.query_selector_all("li.pIav2d")
    print(f"Total flight rows found: {len(rows)}")
    
    for i, r in enumerate(rows[:10]):
        text = r.inner_text().replace('\u202f', ' ').replace('\xa0', ' ')
        
        # Exact price extraction from Google Flights
        # In Google Flights, price is in span with aria-label or contains rupee/numbers
        price = None
        price_match = re.search(r"[\u20b9₹Rs\.]+\s*([0-9,]+)", text)
        if price_match:
            price = float(price_match.group(1).replace(",", ""))
        
        # Fallback price selector
        price_span = r.query_selector(".YMlIz span, .FkiRtd span, [aria-label*='Indian rupees']")
        if price_span:
            p_text = price_span.inner_text().replace('\u202f', ' ').replace('\xa0', ' ')
            pm = re.search(r"([0-9,]+)", p_text)
            if pm:
                price = float(pm.group(1).replace(",", ""))

        # Dep time & Arrival time
        times = re.findall(r"(\d{1,2}:\d{2}\s*(?:AM|PM)?)", text, re.IGNORECASE)
        dep_time = times[0] if len(times) >= 1 else "Unknown"
        arr_time = times[1] if len(times) >= 2 else "Unknown"
        
        # Airline
        airline = "IndiGo"
        for a in ["Air India Express", "Air India", "Akasa Air", "SpiceJet", "IndiGo", "Vistara"]:
            if a.lower() in text.lower():
                airline = a
                break

        # Duration
        dur_match = re.search(r"(\d+\s*hr(?:\s*\d+\s*min)?)", text)
        dur = dur_match.group(1) if dur_match else "2 hr"

        # Stops
        stops = 0 if "nonstop" in text.lower() else (1 if "1 stop" in text.lower() else 2)

        print(f"Flight {i+1}: {airline:<18} | Dep: {dep_time:<8} -> Arr: {arr_time:<8} | Dur: {dur:<12} | Stops: {stops} | Fare: INR {price}")
        
    browser.close()
