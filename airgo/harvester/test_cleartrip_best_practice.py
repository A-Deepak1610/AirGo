import os
import sys
import io
import json
import asyncio
from datetime import date, timedelta
from patchright.async_api import async_playwright

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

PROFILE_DIR = os.path.join(os.getcwd(), "runs", "patchright_chrome_profile")

async def test_best_practice_cleartrip():
    os.makedirs(PROFILE_DIR, exist_ok=True)
    tomorrow = (date.today() + timedelta(days=1)).strftime("%d/%m/%Y")
    url = f"https://www.cleartrip.com/flights/results?adults=1&childs=0&infants=0&class=Economy&depart_date={tomorrow}&from=BOM&to=DEL&intl=n&page=loaded"

    print(f"Launching Patchright with Best Practice config...")
    print(f"Profile: {PROFILE_DIR}")

    async with async_playwright() as p:
        # Best practice config as specified:
        # launch_persistent_context, channel="msedge" (or default patched chromium), headless=False, no_viewport=True, no custom headers
        try:
            context = await p.chromium.launch_persistent_context(
                user_data_dir=PROFILE_DIR,
                channel="msedge",
                headless=False,
                no_viewport=True
            )
            print("Launched with Microsoft Edge channel.")
        except Exception as e:
            print(f"Edge launch note: {e}, falling back to patched Chromium...")
            context = await p.chromium.launch_persistent_context(
                user_data_dir=PROFILE_DIR,
                headless=False,
                no_viewport=True
            )

        page = context.pages[0] if context.pages else await context.new_page()

        async def on_response(res):
            if "itinerary/create" in res.url:
                try:
                    body = await res.text()
                    print(f"\n[PATCHRIGHT ITINERARY CREATE RESPONSE {res.status}]:")
                    print(body[:400])
                except Exception as e:
                    print(f"Error reading response: {e}")

        page.on("response", on_response)

        print(f"1. Navigating to Cleartrip Search: {url}")
        await page.goto(url, wait_until="domcontentloaded", timeout=45000)
        await page.wait_for_selector("button:has-text('Book')", timeout=25000)
        await page.wait_for_timeout(4000)

        # 1. Click Book
        print("2. Clicking Book...")
        book_btn = page.locator("button:has-text('Book')").first
        await book_btn.click()
        await page.wait_for_timeout(2000)

        # 2. Select fare
        select_btn = page.locator("button:has-text('Select')").first
        if await select_btn.is_visible():
            print("Clicking Select fare button...")
            await select_btn.click()
            await page.wait_for_timeout(1500)

        # 3. Click Continue
        cont_btn = page.locator("button:has-text('Continue')").first
        if await cont_btn.is_visible():
            print("Clicking Continue button...")
            await cont_btn.click()

        await page.wait_for_timeout(8000)

        print(f"\nTotal Open Tabs: {len(context.pages)}")
        for idx, pg in enumerate(context.pages):
            print(f"Page {idx} URL: {pg.url}")

        review_page = context.pages[-1]
        print(f"Active Tab URL: {review_page.url}")
        await review_page.screenshot(path="runs/cleartrip_best_practice_review.png", full_page=True)
        print("Captured: runs/cleartrip_best_practice_review.png")

        await context.close()

if __name__ == "__main__":
    asyncio.run(test_best_practice_cleartrip())
