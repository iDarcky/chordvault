import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})

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

        await page.click("text=Library", timeout=5000)
        await page.wait_for_timeout(1000)

        await page.screenshot(path="desktop_library_list.png")
        await browser.close()

asyncio.run(main())
