const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Check for buttons
  const buttons = await page.evaluate(() => {
    const buttonElements = Array.from(document.querySelectorAll('button'));
    const dataRoomButtons = buttonElements.filter(btn =>
      btn.textContent.includes('Volver al Data Room')
    );
    return {
      count: dataRoomButtons.length,
      texts: dataRoomButtons.map(btn => btn.textContent),
      visible: dataRoomButtons.map(btn => {
        const rect = btn.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
    };
  });

  // Check links
  const links = await page.evaluate(() => {
    const linkElements = Array.from(document.querySelectorAll('a[href*="dr.bombocommunity.xyz"]'));
    return {
      count: linkElements.length,
      hrefs: linkElements.map(a => a.href)
    };
  });

  console.log('✅ Data Room Buttons found:', buttons.count);
  console.log('   Button texts:', buttons.texts);
  console.log('   All visible:', buttons.visible.every(v => v) ? 'Yes' : 'No');
  console.log('✅ Links to dr.bombocommunity.xyz:', links.count);
  console.log('   URLs:', links.hrefs);

  // Take screenshot
  await page.screenshot({ path: 'data-room-buttons-test.png', fullPage: true });
  console.log('📸 Screenshot saved as data-room-buttons-test.png');

  await browser.close();
})();