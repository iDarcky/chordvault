import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  try {
    console.log('Visiting Welcome screen...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/2026_welcome.png' });

    console.log('Clicking GET STARTED...');
    await page.click('text=GET STARTED');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/2026_dashboard.png' });

    console.log('Clicking Library...');
    // Look for Library in the sidebar or navigation
    await page.click('text=Library');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/2026_library.png' });

    console.log('Clicking Add Song...');
    const addSongBtn = await page.$('text=Add Song');
    if (addSongBtn) {
      await addSongBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/home/jules/verification/screenshots/2026_editor.png' });
    }

  } catch (e) {
    console.error('Error during verification:', e);
  } finally {
    await browser.close();
  }
})();
