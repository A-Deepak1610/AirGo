import asyncio
import os
import re
import datetime
import json
from patchright.async_api import async_playwright

ROUTES = [("DEL", "BOM")]

async def scrape_visual_route(p, origin, destination):
    print(f"\n[Visual Scraping] {origin} -> {destination}")
    travel_date = (datetime.date.today() + datetime.timedelta(days=7)).strftime("%Y-%m-%d")
    url = f"https://www.spicejet.com/search?from={origin}&to={destination}&tripType=1&departure={travel_date}"
    
    browser = await p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        viewport={'width': 1920, 'height': 1080}
    )
    page = await context.new_page()
    
    parsed_flights = []
    
    try:
        await page.goto(url, timeout=45000)
        
        # Wait for 'SpiceSaver' column to render visually
        await page.wait_for_selector("text=SpiceSaver", timeout=30000)
        await page.wait_for_timeout(5000) # Wait for prices to load
        
        # Take visual proof screenshot
        runs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "runs")
        os.makedirs(runs_dir, exist_ok=True)
        screenshot_path = os.path.join(runs_dir, f"spicejet_visual_{origin}_{destination}.png")
        await page.screenshot(path=screenshot_path)
        print(f"Captured visual proof: {screenshot_path}")
        
        # Extract visual text using strict DOM Locators as per AGENTS.md Rule 2
        # SpiceJet uses id="aircraft-no" for flights, and data-testid="spicesaver-flight-select-radio-button-0" for prices
        
        flight_nodes = await page.locator("#aircraft-no").all()
        
        for i in range(min(5, len(flight_nodes))):
            flight_num = await flight_nodes[i].inner_text()
            flight_num = flight_num.strip()
            
            # Use exact hierarchy observed in the DOM
            # The radio button and the price text are siblings inside a parent div
            price_container = page.locator(f'div:has(> div[data-testid="spicesaver-flight-select-radio-button-{i}"]) > div#selected-onward-container')
            
            if await price_container.count() > 0:
                price_text = await price_container.first.inner_text()
                # Clean up the string (e.g. "₹ 22,301")
                price_str = re.sub(r"[^\d]", "", price_text)
                
                if price_str:
                    parsed_flights.append({
                        "flight_number": flight_num,
                        "origin": origin,
                        "destination": destination,
                        "horizon": "T+7",
                        "total_fare": int(price_str),
                        "timestamp": datetime.datetime.now().isoformat(),
                        "source": "SpiceJet_Visual_DOM_Strict"
                    })
                    
    except Exception as e:
        print(f"Error during visual scrape: {e}")
    finally:
        await browser.close()
        
    return parsed_flights

async def main():
    runs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "runs")
    os.makedirs(runs_dir, exist_ok=True)
    
    all_data = []
    
    async with async_playwright() as p:
        for origin, dest in ROUTES:
            data = await scrape_visual_route(p, origin, dest)
            all_data.extend(data)
            
    out_file = os.path.join(runs_dir, f"spicejet_visual_audited.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=4)
        
    print(f"\n[DONE] Extracted top {len(all_data)} flights visually to {out_file}")

if __name__ == "__main__":
    asyncio.run(main())
