import sys
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(locale="en-IN")
    url = "https://www.google.com/travel/flights?q=Flights%20to%20BOM%20from%20DEL%20on%202026-08-29%20one%20way"
    page.goto(url, wait_until="domcontentloaded")
    page.wait_for_timeout(4000)
    
    rows = page.query_selector_all("li.pIav2d")
    print(f"Total flight rows found: {len(rows)}")
    for i, r in enumerate(rows[:5]):
        text = r.inner_text().replace('\u202f', ' ').replace('\xa0', ' ')
        print(f"\n--- FLIGHT {i+1} ---")
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for l in lines:
            print(f"  > {l}")
    browser.close()
