import asyncio
import os
import re
import datetime
import json
import random
from patchright.async_api import async_playwright

async def scrape_goibibo_route(p, origin, destination):
    print(f"\n[GoIbibo Visual Scraping] {origin} -> {destination}")
    # Target date: T+7
    travel_date = (datetime.date.today() + datetime.timedelta(days=7)).strftime("%Y%m%d")
    
    # GoIbibo URL format: air-{Origin}-{Dest}-{YYYYMMDD}--1-0-0-E-D
    url = f"https://www.goibibo.com/flights/air-{origin}-{destination}-{travel_date}--1-0-0-E-D/"
    
    user_data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "patchright_userdata")
    context_args = {
        "user_data_dir": user_data_dir,
        "headless": False,
        "slow_mo": 1000,
        "args": ["--disable-blink-features=AutomationControlled"],
        "viewport": {'width': 1920, 'height': 1080},
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "timezone_id": "Asia/Kolkata",
        "locale": "en-IN"
    }
    
    try:
        context = await p.chromium.launch_persistent_context(**context_args, channel="chrome")
    except Exception as e:
        print(f"Warning: Could not launch with channel='chrome' ({e}), falling back to bundled Chromium.")
        context = await p.chromium.launch_persistent_context(**context_args)
        
    page = context.pages[0] if context.pages else await context.new_page()
    
    # Set up run directory in AirGo/runs/
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    runs_dir = os.path.join(root_dir, "runs", f"{timestamp}_goibibo_{origin}_{destination}")
    os.makedirs(runs_dir, exist_ok=True)
    
    parsed_flights = []
    
    try:
        # Human-like warm-up sequence
        print("Performing human-like warm-up sequence...")
        await page.goto("https://www.goibibo.com/", timeout=60000)
        await page.wait_for_timeout(random.randint(2000, 5000))
        await page.mouse.move(500, 500)
        await page.mouse.click(500, 500)
        await page.wait_for_timeout(random.randint(1000, 2000))
        
        # Proceed to target URL
        print(f"Navigating to deep search URL: {url}")
        await page.goto(url, timeout=60000)
        print("Waiting for page to load...")
        
        # Wait for either VIEW FARES or BOOK button
        try:
            await page.wait_for_selector("text=/VIEW FARES|BOOK|Book/i", timeout=30000)
            await page.wait_for_timeout(5000) # Give prices time to render
        except Exception:
            print("Warning: Could not find BOOK/VIEW FARES buttons. Checking if blocked by bot protection.")
            
        try:
            await page.wait_for_timeout(8000)
            content = await page.evaluate('() => document.documentElement.outerHTML')
        except Exception as e:
            print(f"Content capture retry due to: {e}")
            await page.wait_for_timeout(5000)
            content = await page.evaluate('() => document.documentElement.outerHTML')
        with open(os.path.join(runs_dir, "search_results.html"), "w", encoding="utf-8") as f:
            f.write(content)
            
        # Capture screenshot
        await page.screenshot(path=os.path.join(runs_dir, "search_results.png"), full_page=False)
        print(f"Captured search results DOM and screenshot in {runs_dir}")
        
        if "Please enable javascript in your browser" in content or "Access Denied" in content:
            print("BLOCKED_BY_BOT_PROTECTION: Akamai challenge page detected.")
        else:
            # Find all buttons that look like booking triggers
            buttons = await page.locator("button").filter(has_text=re.compile(r"^(BOOK|VIEW FARES)$", re.IGNORECASE)).all()
            print(f"Found {len(buttons)} booking buttons visually.")
            
            # Extract basic data (Rule 1 & 2)
            for i in range(min(5, len(buttons))):
                try:
                    card_text = await page.evaluate('''(btn) => {
                        let parent = btn.parentElement;
                        for(let k=0; k<6; k++) {
                            if(parent && parent.parentElement) {
                                parent = parent.parentElement;
                            }
                        }
                        return parent ? parent.innerText : "";
                    }''', await buttons[i].element_handle())
                    
                    price_match = re.search(r'₹\s*([\d,]+)', card_text)
                    if price_match:
                        price_str = price_match.group(1).replace(",", "")
                        parsed_flights.append({
                            "origin": origin,
                            "destination": destination,
                            "horizon": "T+7",
                            "total_fare": int(price_str),
                            "timestamp": datetime.datetime.now().isoformat(),
                            "source": "GoIbibo_Visual",
                            "raw_text": card_text.replace("\n", " | ")
                        })
                    else:
                        parsed_flights.append({
                            "origin": origin,
                            "destination": destination,
                            "horizon": "T+7",
                            "total_fare": None,
                            "timestamp": datetime.datetime.now().isoformat(),
                            "source": "GoIbibo_Visual",
                            "raw_text": card_text.replace("\n", " | ")
                        })
                except Exception as ex:
                    print(f"Could not parse card {i}: {ex}")

            # Click through to booking
            if buttons:
                print("Proceeding to booking visually...")
                await buttons[0].dispatch_event('click')
                await page.wait_for_timeout(3000)
                
                # GoIbibo often shows a "Fare Selection" popup. If there's another 'Book' button, click it.
                popup_book = page.locator("button").filter(has_text=re.compile(r"^BOOK$", re.IGNORECASE))
                if await popup_book.count() > 1:
                    # Usually the second one is in the popup
                    await popup_book.nth(1).dispatch_event('click')
                    
                # Wait on booking page
                print("Waiting on booking page for 15 seconds...")
                await page.wait_for_timeout(15000)
                
                # Capture booking page HTML and screenshot
                with open(os.path.join(runs_dir, "booking_page.html"), "w", encoding="utf-8") as f:
                    f.write(await page.evaluate('() => document.documentElement.outerHTML'))
                await page.screenshot(path=os.path.join(runs_dir, "booking_page.png"), full_page=False)
                print("Captured booking page DOM and screenshot.")
            
    except Exception as e:
        print(f"Error during GoIbibo scrape: {e}")
    finally:
        await context.close()
        
    # Save the standard audited json
    out_file = os.path.join(runs_dir, "run_summary.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(parsed_flights, f, indent=4)
        
    print(f"\n[DONE] Saved {len(parsed_flights)} records to {runs_dir}")
    return parsed_flights

async def main():
    async with async_playwright() as p:
        await scrape_goibibo_route(p, "DEL", "BOM")

if __name__ == "__main__":
    asyncio.run(main())
