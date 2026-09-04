import asyncio
import json
import os
import datetime
from patchright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

# Top routes based on DGCA traffic data (subset for prototype)
ROUTES = [
    ("DEL", "BOM"),
    ("BLR", "HYD")
]
HORIZONS = [1, 7] # T+1, T+7 for prototype speed

async def scrape_route(p, origin, destination, horizon):
    print(f"\n[Scraping] {origin} -> {destination} (T+{horizon})")
    
    travel_date = (datetime.date.today() + datetime.timedelta(days=horizon)).strftime("%Y-%m-%d")
    url = f"https://www.spicejet.com/search?from={origin}&to={destination}&tripType=1&departure={travel_date}"
    
    proxy_url = os.environ.get("PROXY_URL")
    browser = await p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    page = await context.new_page()
    
    api_data_list = []
    
    async def handle_response(response):
        if "api/v3/search/availability" in response.url:
            try:
                json_data = await response.json()
                api_data_list.append(json_data)
                print(">> Intercepted Availability JSON!")
            except Exception:
                pass
                
    page.on("response", handle_response)
    
    try:
        await page.goto(url, timeout=45000)
        # Wait for the network API call to finish
        await page.wait_for_timeout(10000)
    except Exception as e:
        print(f"Error navigating: {e}")
    finally:
        await browser.close()
        
    return api_data_list

def parse_spicejet_api(raw_json_list, origin, destination, horizon):
    parsed_flights = []
    timestamp_now = datetime.datetime.now().isoformat()
    
    for payload in raw_json_list:
        try:
            data_block = payload.get("data", {})
            trips = data_block.get("trips", [])
            fares_lookup = data_block.get("faresAvailable", {})
            
            for trip in trips:
                journeys = trip.get("journeysAvailable", [])
                for journey in journeys:
                    desig = journey.get("designator", {})
                    flight_num = "SG" # Default, could extract from segments
                    
                    fares = journey.get("fares", {})
                    for fare_key, fare_summary in fares.items():
                        fare_full = fares_lookup.get(fare_key)
                        if not fare_full:
                            continue
                            
                        passenger_fares = fare_full.get("passengerFares", [])
                        if not passenger_fares:
                            continue
                            
                        pf = passenger_fares[0]
                        total_fare = pf.get("fareAmount", 0)
                        base_fare = pf.get("publishedFare", 0)
                        taxes = total_fare - base_fare
                        
                        parsed_flights.append({
                            "flight_number": flight_num,
                            "origin": origin,
                            "destination": destination,
                            "horizon": f"T+{horizon}",
                            "fare_class": fare_full.get("fareCode", "Unknown"),
                            "base_fare": base_fare,
                            "taxes_fees": taxes,
                            "total_fare": total_fare,
                            "timestamp": timestamp_now,
                            "source": "SpiceJet_API"
                        })
        except Exception as e:
            print(f"Parsing error: {e}")
            
    return parsed_flights

async def main():
    runs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "runs")
    os.makedirs(runs_dir, exist_ok=True)
    
    all_parsed_data = []
    all_raw_data = []
    
    async with async_playwright() as p:
        for origin, dest in ROUTES:
            for hz in HORIZONS:
                raw_data = await scrape_route(p, origin, dest, hz)
                all_raw_data.extend(raw_data)
                
                parsed = parse_spicejet_api(raw_data, origin, dest, hz)
                all_parsed_data.extend(parsed)
                print(f"Extracted {len(parsed)} flights.")
                
    # Save the standard audited json
    out_file = os.path.join(runs_dir, f"spicejet_audited_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_parsed_data, f, indent=4)
        
    # Save raw dump for debugging
    raw_file = os.path.join(runs_dir, "spicejet_raw_dump.json")
    with open(raw_file, "w", encoding="utf-8") as f:
        json.dump(all_raw_data, f, indent=4)
        
    print(f"\n[DONE] Saved {len(all_parsed_data)} standardized records to {out_file}")

if __name__ == "__main__":
    asyncio.run(main())
