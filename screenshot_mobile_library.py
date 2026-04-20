import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Mobile viewport
        context = await browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        page = await context.new_page()

        await page.goto("http://localhost:5173")
        await page.wait_for_timeout(1000)

        try:
            await page.click("text='Get Started'", timeout=2000)
            await page.wait_for_timeout(1000)
        except:
            pass

        try:
            await page.click("text='Skip'", timeout=2000)
            await page.wait_for_timeout(1000)
        except:
            pass

        try:
            # On mobile, we need to tap the Library icon on the bottom nav
            # Wait for any bottom nav button
            await page.click("text=Library", timeout=5000)
            await page.wait_for_timeout(1000)
        except:
            pass

        await page.screenshot(path="mobile_library_list.png")
        await browser.close()

asyncio.run(main())
