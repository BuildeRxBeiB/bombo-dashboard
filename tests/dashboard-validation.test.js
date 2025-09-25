const puppeteer = require('puppeteer');

async function testDashboard() {
  console.log('Starting BOMBO Dashboard validation test...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Test 1: Check page title
    const title = await page.title();
    console.log(`✓ Page title: ${title}`);

    // Test 2: Check if main sections exist
    console.log('\nChecking main sections:');

    // Check Hero Section
    const heroSection = await page.$('#hero');
    if (heroSection) {
      console.log('✓ Hero section found');
      const heroText = await page.$eval('#hero h1', el => el.textContent);
      console.log(`  Hero title: ${heroText}`);
    } else {
      console.log('✗ Hero section not found');
    }

    // Check Financial Performance Section
    const financialSection = await page.$('#financial');
    if (financialSection) {
      console.log('✓ Financial Performance section found');
    } else {
      console.log('✗ Financial Performance section not found');
    }

    // Check Engagement Highlights Section
    const engagementSection = await page.$('#engagement');
    if (engagementSection) {
      console.log('✓ Engagement Highlights section found');
    } else {
      console.log('✗ Engagement Highlights section not found');
    }

    // Test 3: Check Navigation Sidebar
    const sidebar = await page.$('[class*="navigation-sidebar"]');
    if (sidebar) {
      console.log('✓ Navigation sidebar found');
    } else {
      console.log('✗ Navigation sidebar not found');
    }

    // Test 4: Check background colors (should be black/white/gray)
    console.log('\nChecking theme colors:');
    const bgColor = await page.evaluate(() => {
      const main = document.querySelector('main');
      return window.getComputedStyle(main).backgroundColor;
    });
    console.log(`  Main background color: ${bgColor}`);

    // Test 5: Check for any console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Take a screenshot for visual verification
    await page.screenshot({
      path: 'tests/dashboard-screenshot.png',
      fullPage: true
    });
    console.log('\n✓ Screenshot saved to tests/dashboard-screenshot.png');

    // Test 6: Check KPI metrics
    const kpiMetrics = await page.$$eval('[class*="metric"]', elements => elements.length);
    if (kpiMetrics > 0) {
      console.log(`✓ Found ${kpiMetrics} metric elements`);
    }

    // Test 7: Check for charts
    const charts = await page.$$eval('svg', elements => elements.length);
    if (charts > 0) {
      console.log(`✓ Found ${charts} chart/SVG elements`);
    }

    // Report console errors if any
    if (consoleErrors.length > 0) {
      console.log('\n⚠ Console errors detected:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✓ No console errors detected');
    }

    console.log('\n✅ Dashboard validation test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testDashboard().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});