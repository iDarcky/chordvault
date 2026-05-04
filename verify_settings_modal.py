import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Record video
        context = await browser.new_context(
            record_video_dir="/home/jules/verification/videos/",
            viewport={'width': 1280, 'height': 800}
        )
        page = await context.new_page()

        print("Navigating to http://localhost:5173...")
        await page.goto("http://localhost:5173", wait_until="networkidle")

        # Check for Skip button
        try:
            print("Looking for Skip button...")
            skip_button = page.locator('text=Skip').first
            if await skip_button.is_visible(timeout=5000):
                print("Clicking Skip...")
                await skip_button.click()
                await page.wait_for_timeout(1000)
        except Exception as e:
            print("No Skip button found or needed:", e)

        print("Looking for Settings button in TopHeader...")
        try:
            settings_btn = page.locator('button[title="Settings"]')
            if await settings_btn.is_visible(timeout=5000):
                await settings_btn.click()
                print("Clicked Settings icon.")
            else:
                print("Could not find Settings icon button.")
        except Exception as e:
            print("Exception clicking Settings icon:", e)

        await page.wait_for_timeout(2000)
        print("Taking modal screenshot...")
        await page.screenshot(path="/home/jules/verification/screenshots/modal_opened_via_icon.png")

        print("Clicking Team/Workspace tab...")
        try:
            await page.get_by_text('Workspace', exact=False).first.click()
        except:
            pass
        await page.wait_for_timeout(1000)

        print("Clicking Settings tab (to test close)...")
        # Click background to close
        await page.mouse.click(10, 10)
        await page.wait_for_timeout(1000)

        print("Closing context...")
        await context.close()
        await browser.close()
        print("Done.")

asyncio.run(main())
