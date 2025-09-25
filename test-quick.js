const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the dashboard
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Check for errors
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      pageErrors.push(msg.text());
    }
  });

  // Wait a bit for any delayed errors
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check sidebar text
  const sidebarText = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('.text-sm.font-medium'));
    return elements.map(el => el.textContent);
  });

  console.log('✅ Dashboard loaded successfully');
  console.log('📊 Sidebar labels:', sidebarText);
  console.log('🐛 Page errors found:', pageErrors.length === 0 ? 'None' : pageErrors);

  await browser.close();
})();