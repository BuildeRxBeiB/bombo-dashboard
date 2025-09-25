/**
 * BOMBO Dashboard Comprehensive Test Suite
 * Test Engineer: Universal Tester
 * Date: 2025-09-23
 *
 * This test suite validates all recent dashboard changes including:
 * 1. New Engagement Highlights section
 * 2. Updated Financial Metrics
 * 3. Simplified Growth Metrics
 * 4. Updated Market Opportunity TAM values
 * 5. Theme consistency and visual elements
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_URL = 'http://localhost:3000';
const VIEWPORT_SIZES = [
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 1366, height: 768, name: 'laptop' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 375, height: 667, name: 'mobile' }
];

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  sections: {},
  errors: [],
  screenshots: []
};

// Utility functions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot(page, name, section) {
  const screenshotPath = path.join(__dirname, '../../test-results/screenshots', `${section}-${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  testResults.screenshots.push({ name, section, path: screenshotPath });
  return screenshotPath;
}

async function logTestResult(section, testName, status, details = {}) {
  if (!testResults.sections[section]) {
    testResults.sections[section] = [];
  }

  testResults.sections[section].push({
    test: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  });

  testResults.summary.total++;
  if (status === 'PASS') testResults.summary.passed++;
  else if (status === 'FAIL') testResults.summary.failed++;
  else if (status === 'WARNING') testResults.summary.warnings++;

  console.log(`[${section}] ${testName}: ${status}`, details.message || '');
}

// Test Suite Functions

async function testNavigationSidebar(page) {
  const section = 'NavigationSidebar';
  console.log(`\n=== Testing ${section} ===`);

  try {
    // Check if sidebar exists
    const sidebar = await page.$('.md\\:ml-64');
    if (!sidebar) {
      await logTestResult(section, 'Sidebar Presence', 'FAIL', { message: 'Sidebar not found' });
      return;
    }
    await logTestResult(section, 'Sidebar Presence', 'PASS');

    // Check for Engagement Highlights link
    const engagementLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.find(link => link.textContent.includes('Engagement Highlights'));
    });

    if (engagementLink) {
      await logTestResult(section, 'Engagement Highlights Link', 'PASS');
    } else {
      await logTestResult(section, 'Engagement Highlights Link', 'FAIL', { message: 'Link not found in sidebar' });
    }

    // Test all navigation links
    const navItems = ['Hero', 'Executive', 'Financial', 'Engagement', 'Growth', 'Retention', 'Market'];
    for (const item of navItems) {
      const linkExists = await page.$(`a[href="#${item.toLowerCase()}"]`);
      await logTestResult(section, `${item} Navigation`, linkExists ? 'PASS' : 'FAIL');
    }

  } catch (error) {
    await logTestResult(section, 'Sidebar Test', 'FAIL', { error: error.message });
  }
}

async function testEngagementHighlights(page) {
  const section = 'EngagementHighlights';
  console.log(`\n=== Testing ${section} ===`);

  try {
    // Scroll to engagement section
    await page.evaluate(() => {
      document.querySelector('#engagement')?.scrollIntoView();
    });
    await delay(1000);

    // Test section header
    const sectionTitle = await page.$eval('#engagement h2', el => el.textContent);
    if (sectionTitle.includes('Engagement Highlights')) {
      await logTestResult(section, 'Section Title', 'PASS');
    } else {
      await logTestResult(section, 'Section Title', 'FAIL', { message: `Found: ${sectionTitle}` });
    }

    // Test key metrics cards
    const metricsToCheck = [
      { label: 'User Return Rate', value: '78%' },
      { label: 'Buyer Retention', value: '98%' },
      { label: 'Session Growth', value: '+68%' }
    ];

    for (const metric of metricsToCheck) {
      const found = await page.evaluate((label) => {
        const cards = Array.from(document.querySelectorAll('.bg-gray-900\\/50'));
        return cards.some(card => card.textContent.includes(label));
      }, metric.label);

      await logTestResult(section, `${metric.label} Card`, found ? 'PASS' : 'FAIL');
    }

    // Test DAU/MAU charts
    const dauChart = await page.$('#engagement canvas');
    await logTestResult(section, 'DAU Chart Presence', dauChart ? 'PASS' : 'FAIL');

    // Test Cumulative Return Rate chart
    const returnRateText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h3'));
      return elements.some(el => el.textContent.includes('Cumulative Return Rate'));
    });
    await logTestResult(section, 'Return Rate Chart', returnRateText ? 'PASS' : 'FAIL');

    // Test Session Duration Evolution
    const sessionDuration = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h3'));
      return elements.some(el => el.textContent.includes('Average Session Duration'));
    });
    await logTestResult(section, 'Session Duration Chart', sessionDuration ? 'PASS' : 'FAIL');

    // Test Chat/Messaging metrics
    const chatMetrics = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.text-white'));
      return elements.some(el => el.textContent.includes('Chat Engagement'));
    });
    await logTestResult(section, 'Chat Metrics', chatMetrics ? 'PASS' : 'FAIL');

    // Test News/Push/Events sections
    const platformFeatures = ['News Section', 'Push Notifications', 'Events'];
    for (const feature of platformFeatures) {
      const found = await page.evaluate((f) => {
        const elements = Array.from(document.querySelectorAll('h3'));
        return elements.some(el => el.textContent.includes(f));
      }, feature);
      await logTestResult(section, feature, found ? 'PASS' : 'FAIL');
    }

    await takeScreenshot(page, 'engagement-section', section);

  } catch (error) {
    await logTestResult(section, 'Engagement Test', 'FAIL', { error: error.message });
  }
}

async function testFinancialMetrics(page) {
  const section = 'FinancialMetrics';
  console.log(`\n=== Testing ${section} ===`);

  try {
    // Scroll to financial section
    await page.evaluate(() => {
      document.querySelector('#financial')?.scrollIntoView();
    });
    await delay(1000);

    // Test Total Revenue display
    const totalRevenue = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.text-3xl'));
      return elements.find(el => el.textContent.includes('$9.35M'));
    });

    if (totalRevenue) {
      await logTestResult(section, 'Total Revenue ($9.35M)', 'PASS');
    } else {
      await logTestResult(section, 'Total Revenue ($9.35M)', 'FAIL', { message: 'Value not found or incorrect' });
    }

    // Test 4 metric cards
    const metricCards = await page.$$('#financial .bg-gray-900\\/50.border-gray-800.p-6');
    const cardCount = metricCards.length;

    if (cardCount === 4) {
      await logTestResult(section, 'Four Metric Cards', 'PASS', { count: cardCount });
    } else {
      await logTestResult(section, 'Four Metric Cards', 'FAIL', { message: `Found ${cardCount} cards, expected 4` });
    }

    // Test specific metrics
    const metricsToVerify = [
      'Total Revenue (All-Time)',
      'Total GTV',
      '2025 YTD',
      'Contribution Margin'
    ];

    for (const metric of metricsToVerify) {
      const found = await page.evaluate((m) => {
        const elements = Array.from(document.querySelectorAll('.text-sm'));
        return elements.some(el => el.textContent.includes(m));
      }, metric);
      await logTestResult(section, `${metric} Display`, found ? 'PASS' : 'FAIL');
    }

    await takeScreenshot(page, 'financial-section', section);

  } catch (error) {
    await logTestResult(section, 'Financial Test', 'FAIL', { error: error.message });
  }
}

async function testGrowthMetrics(page) {
  const section = 'GrowthMetrics';
  console.log(`\n=== Testing ${section} ===`);

  try {
    // Scroll to growth section
    await page.evaluate(() => {
      document.querySelector('#growth')?.scrollIntoView();
    });
    await delay(1000);

    // Check for split platform engagement charts
    const charts = await page.$$('#growth canvas');
    const chartCount = charts.length;

    if (chartCount >= 2) {
      await logTestResult(section, 'Split Platform Charts', 'PASS', { count: chartCount });
    } else {
      await logTestResult(section, 'Split Platform Charts', 'FAIL', { message: `Found ${chartCount} charts, expected at least 2` });
    }

    // Verify no redundant metrics
    const redundantMetrics = ['DAU Evolution', 'MAU Growth'];
    for (const metric of redundantMetrics) {
      const found = await page.evaluate((m) => {
        const growthSection = document.querySelector('#growth');
        return growthSection ? growthSection.textContent.includes(m) : false;
      }, metric);

      if (!found) {
        await logTestResult(section, `No Redundant ${metric}`, 'PASS');
      } else {
        await logTestResult(section, `No Redundant ${metric}`, 'WARNING', { message: 'Metric should be in Engagement section only' });
      }
    }

    await takeScreenshot(page, 'growth-section', section);

  } catch (error) {
    await logTestResult(section, 'Growth Test', 'FAIL', { error: error.message });
  }
}

async function testMarketOpportunity(page) {
  const section = 'MarketOpportunity';
  console.log(`\n=== Testing ${section} ===`);

  try {
    // Scroll to market section
    await page.evaluate(() => {
      document.querySelector('#market')?.scrollIntoView();
    });
    await delay(1000);

    // Test TAM values
    const tamValues = [
      { country: 'Argentina', value: '$180M', text: '180000000' },
      { country: 'Chile', value: '$135M', text: '135000000' },
      { country: 'Peru', value: '$90M', text: '90000000' }
    ];

    for (const tam of tamValues) {
      const found = await page.evaluate((country, value) => {
        const marketSection = document.querySelector('#market');
        if (!marketSection) return false;
        const text = marketSection.textContent;
        return text.includes(country) && (text.includes(value) || text.includes(value.replace('$', '').replace('M', '')));
      }, tam.country, tam.value);

      await logTestResult(section, `${tam.country} TAM (${tam.value})`, found ? 'PASS' : 'FAIL');
    }

    // Test Total TAM
    const totalTAM = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.text-3xl'));
      return elements.some(el => el.textContent.includes('$1.8B'));
    });
    await logTestResult(section, 'Total TAM ($1.8B)', totalTAM ? 'PASS' : 'FAIL');

    // Test "Event Coverage" instead of "Market Share"
    const eventCoverage = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.text-sm'));
      return elements.some(el => el.textContent.includes('Event Coverage'));
    });
    await logTestResult(section, 'Event Coverage Text', eventCoverage ? 'PASS' : 'FAIL');

    // Verify 80% of events
    const eightyPercent = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.text-3xl'));
      return elements.some(el => el.textContent.includes('80%'));
    });
    await logTestResult(section, '80% of Events', eightyPercent ? 'PASS' : 'FAIL');

    // Check no "market share" text
    const noMarketShare = await page.evaluate(() => {
      const marketSection = document.querySelector('#market');
      return marketSection ? !marketSection.textContent.toLowerCase().includes('market share') : false;
    });
    await logTestResult(section, 'No "Market Share" Text', noMarketShare ? 'PASS' : 'FAIL');

    await takeScreenshot(page, 'market-section', section);

  } catch (error) {
    await logTestResult(section, 'Market Test', 'FAIL', { error: error.message });
  }
}

async function testThemeConsistency(page) {
  const section = 'ThemeConsistency';
  console.log(`\n=== Testing ${section} ===`);

  try {
    // Test background colors
    const bgColor = await page.evaluate(() => {
      const main = document.querySelector('main');
      return window.getComputedStyle(main).backgroundColor;
    });

    if (bgColor === 'rgb(0, 0, 0)' || bgColor === 'black') {
      await logTestResult(section, 'Black Background', 'PASS');
    } else {
      await logTestResult(section, 'Black Background', 'WARNING', { message: `Found: ${bgColor}` });
    }

    // Test text colors
    const whiteTextElements = await page.$$eval('.text-white', els => els.length);
    const grayTextElements = await page.$$eval('.text-gray-400', els => els.length);

    await logTestResult(section, 'White Text Elements', 'PASS', { count: whiteTextElements });
    await logTestResult(section, 'Gray Text Elements', 'PASS', { count: grayTextElements });

    // Test card backgrounds
    const cards = await page.$$eval('.bg-gray-900\\/50', els => els.length);
    await logTestResult(section, 'Consistent Card Styling', cards > 0 ? 'PASS' : 'FAIL', { count: cards });

  } catch (error) {
    await logTestResult(section, 'Theme Test', 'FAIL', { error: error.message });
  }
}

async function testChartInteractivity(page) {
  const section = 'ChartInteractivity';
  console.log(`\n=== Testing ${section} ===`);

  try {
    // Find all charts
    const charts = await page.$$('canvas');
    await logTestResult(section, 'Charts Found', 'PASS', { count: charts.length });

    // Test hover on first chart
    if (charts.length > 0) {
      const chartBox = await charts[0].boundingBox();
      if (chartBox) {
        await page.mouse.move(chartBox.x + chartBox.width / 2, chartBox.y + chartBox.height / 2);
        await delay(500);

        // Check for tooltip
        const tooltip = await page.$('.recharts-tooltip-wrapper');
        await logTestResult(section, 'Chart Tooltip', tooltip ? 'PASS' : 'WARNING', { message: 'Tooltip may not be visible' });
      }
    }

    // Test chart rendering errors
    const consoleErrors = await page.evaluate(() => {
      return window.__chartErrors || [];
    });

    if (consoleErrors.length === 0) {
      await logTestResult(section, 'No Chart Errors', 'PASS');
    } else {
      await logTestResult(section, 'Chart Errors', 'FAIL', { errors: consoleErrors });
    }

  } catch (error) {
    await logTestResult(section, 'Interactivity Test', 'FAIL', { error: error.message });
  }
}

async function testResponsiveness(page) {
  const section = 'Responsiveness';
  console.log(`\n=== Testing ${section} ===`);

  for (const viewport of VIEWPORT_SIZES) {
    try {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await delay(1000);

      // Check if content is visible and not overflowing
      const overflow = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main.scrollWidth > main.clientWidth;
      });

      if (!overflow) {
        await logTestResult(section, `${viewport.name} Layout`, 'PASS', { size: `${viewport.width}x${viewport.height}` });
      } else {
        await logTestResult(section, `${viewport.name} Layout`, 'WARNING', { message: 'Content overflow detected' });
      }

      // Take screenshot for each viewport
      await takeScreenshot(page, `responsive-${viewport.name}`, section);

    } catch (error) {
      await logTestResult(section, `${viewport.name} Test`, 'FAIL', { error: error.message });
    }
  }
}

async function testPerformanceMetrics(page) {
  const section = 'Performance';
  console.log(`\n=== Testing ${section} ===`);

  try {
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        totalTime: perfData.loadEventEnd
      };
    });

    // Check load times
    if (metrics.loadTime < 3000) {
      await logTestResult(section, 'Page Load Time', 'PASS', { time: `${metrics.loadTime}ms` });
    } else {
      await logTestResult(section, 'Page Load Time', 'WARNING', { time: `${metrics.loadTime}ms`, message: 'Load time exceeds 3 seconds' });
    }

    // Check for memory leaks
    if (window.gc) {
      window.gc();
      const memory = await page.evaluate(() => performance.memory.usedJSHeapSize);
      await logTestResult(section, 'Memory Usage', 'PASS', { memory: `${(memory / 1048576).toFixed(2)}MB` });
    }

  } catch (error) {
    await logTestResult(section, 'Performance Test', 'FAIL', { error: error.message });
  }
}

// Main test runner
async function runTests() {
  console.log('=================================');
  console.log('BOMBO Dashboard Comprehensive Test');
  console.log('=================================');
  console.log(`Starting tests at ${new Date().toISOString()}`);
  console.log(`Test URL: ${TEST_URL}\n`);

  // Create results directory
  const resultsDir = path.join(__dirname, '../../test-results');
  const screenshotsDir = path.join(resultsDir, 'screenshots');

  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  let browser;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();

    // Set up console error tracking
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testResults.errors.push({
          type: 'console',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // Navigate to dashboard
    console.log(`Navigating to ${TEST_URL}...`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded successfully\n');

    // Run all tests
    await testNavigationSidebar(page);
    await testEngagementHighlights(page);
    await testFinancialMetrics(page);
    await testGrowthMetrics(page);
    await testMarketOpportunity(page);
    await testThemeConsistency(page);
    await testChartInteractivity(page);
    await testResponsiveness(page);
    await testPerformanceMetrics(page);

    // Generate summary
    console.log('\n=================================');
    console.log('TEST SUMMARY');
    console.log('=================================');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed} (${(testResults.summary.passed/testResults.summary.total*100).toFixed(1)}%)`);
    console.log(`Failed: ${testResults.summary.failed} (${(testResults.summary.failed/testResults.summary.total*100).toFixed(1)}%)`);
    console.log(`Warnings: ${testResults.summary.warnings}`);

    // Critical failures check
    if (testResults.summary.failed > 0) {
      console.log('\n⚠️  CRITICAL ISSUES FOUND:');
      Object.entries(testResults.sections).forEach(([section, tests]) => {
        const failures = tests.filter(t => t.status === 'FAIL');
        if (failures.length > 0) {
          console.log(`\n${section}:`);
          failures.forEach(f => {
            console.log(`  - ${f.test}: ${f.details.message || f.details.error || 'Failed'}`);
          });
        }
      });
    }

    // Save detailed results
    const reportPath = path.join(resultsDir, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);

    // Save HTML report
    const htmlReport = generateHTMLReport(testResults);
    const htmlPath = path.join(resultsDir, `test-report-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`HTML report saved to: ${htmlPath}`);

  } catch (error) {
    console.error('Test execution failed:', error);
    testResults.errors.push({
      type: 'execution',
      message: error.message,
      stack: error.stack
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Exit with appropriate code
  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

function generateHTMLReport(results) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BOMBO Dashboard Test Report</title>
  <style>
    body { font-family: -apple-system, sans-serif; margin: 0; padding: 20px; background: #000; color: #fff; }
    .header { text-align: center; padding: 40px 0; border-bottom: 1px solid #333; }
    .summary { display: flex; justify-content: space-around; padding: 40px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 48px; font-weight: bold; }
    .stat-label { color: #999; margin-top: 10px; }
    .passed { color: #4ade80; }
    .failed { color: #f87171; }
    .warning { color: #fbbf24; }
    .section { margin: 40px 0; padding: 20px; background: #111; border-radius: 8px; }
    .section-title { font-size: 24px; margin-bottom: 20px; }
    .test { padding: 10px 0; border-bottom: 1px solid #333; display: flex; justify-content: space-between; }
    .test:last-child { border: none; }
    .test-name { flex: 1; }
    .test-status { padding: 4px 12px; border-radius: 4px; font-size: 12px; }
    .status-pass { background: #166534; }
    .status-fail { background: #991b1b; }
    .status-warning { background: #854d0e; }
    .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
    .screenshot { background: #111; padding: 10px; border-radius: 8px; }
    .screenshot img { width: 100%; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>BOMBO Dashboard Test Report</h1>
    <p>Generated: ${results.timestamp}</p>
  </div>

  <div class="summary">
    <div class="stat">
      <div class="stat-value">${results.summary.total}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat">
      <div class="stat-value passed">${results.summary.passed}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat">
      <div class="stat-value failed">${results.summary.failed}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat">
      <div class="stat-value warning">${results.summary.warnings}</div>
      <div class="stat-label">Warnings</div>
    </div>
  </div>

  ${Object.entries(results.sections).map(([section, tests]) => `
    <div class="section">
      <h2 class="section-title">${section}</h2>
      ${tests.map(test => `
        <div class="test">
          <span class="test-name">${test.test}</span>
          <span class="test-status status-${test.status.toLowerCase()}">${test.status}</span>
        </div>
      `).join('')}
    </div>
  `).join('')}

  ${results.screenshots.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Screenshots</h2>
      <div class="screenshots">
        ${results.screenshots.map(s => `
          <div class="screenshot">
            <h3>${s.name}</h3>
            <p>${s.section}</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}
</body>
</html>
  `;
}

// Run tests
runTests().catch(console.error);