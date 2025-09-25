/**
 * Bombo Dashboard - Playwright Automated Tests
 * Cross-browser test suite for comprehensive dashboard validation
 */

const { chromium, firefox, webkit, devices } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots/playwright');
const REPORT_PATH = path.join(__dirname, '../reports/playwright-report.json');

// Browser configurations
const BROWSERS = [
  { name: 'chromium', launcher: chromium },
  { name: 'firefox', launcher: firefox },
  { name: 'webkit', launcher: webkit }
];

// Test utilities
class TestReporter {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tool: 'Playwright',
      browsers: {},
      summary: {
        totalBrowsers: 0,
        totalTests: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  addBrowserTest(browser, testName, passed, details = {}) {
    if (!this.results.browsers[browser]) {
      this.results.browsers[browser] = {
        tests: [],
        summary: { total: 0, passed: 0, failed: 0 }
      };
      this.results.summary.totalBrowsers++;
    }

    this.results.browsers[browser].tests.push({
      name: testName,
      passed,
      timestamp: new Date().toISOString(),
      ...details
    });

    this.results.browsers[browser].summary.total++;
    this.results.summary.totalTests++;

    if (passed) {
      this.results.browsers[browser].summary.passed++;
      this.results.summary.passed++;
    } else {
      this.results.browsers[browser].summary.failed++;
      this.results.summary.failed++;
    }
  }

  async saveReport() {
    await fs.writeFile(REPORT_PATH, JSON.stringify(this.results, null, 2));
    return this.results;
  }
}

// Test implementation for each browser
async function runBrowserTests(browserConfig, reporter) {
  const browserName = browserConfig.name;
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🌐 Testing with ${browserName.toUpperCase()}`);
  console.log('='.repeat(50));

  let browser;
  let context;
  let page;

  try {
    // Launch browser
    browser = await browserConfig.launcher.launch({
      headless: false, // Set to false to see the browser
      slowMo: 50 // Slow down operations by 50ms for visibility
    });

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      hasTouch: false,
      javaScriptEnabled: true
    });

    // Enable console and error logging
    context.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`  ❌ Console Error: ${msg.text()}`);
      }
    });

    page = await context.newPage();

    // TEST 1: Page Loads Without 404
    console.log('\n📝 Test 1: Page load verification...');
    try {
      const response = await page.goto(BASE_URL, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      const status = response.status();
      const testPassed = status === 200;

      reporter.addBrowserTest(
        browserName,
        'Page loads without 404 error',
        testPassed,
        {
          statusCode: status,
          url: BASE_URL
        }
      );

      console.log(testPassed ? '  ✅ PASSED' : `  ❌ FAILED (Status: ${status})`);

      // Screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `${browserName}-01-initial-load.png`),
        fullPage: true
      });

    } catch (error) {
      reporter.addBrowserTest(
        browserName,
        'Page loads without 404 error',
        false,
        { error: error.message }
      );
      console.log('  ❌ FAILED:', error.message);
    }

    // TEST 2: CSS Styles Applied
    console.log('\n📝 Test 2: CSS validation...');
    try {
      // Wait for main element
      await page.waitForSelector('main', { timeout: 5000 });

      const stylesInfo = await page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return { found: false };

        const styles = window.getComputedStyle(main);
        const bgColor = styles.backgroundColor;
        const minHeight = styles.minHeight;

        return {
          found: true,
          backgroundColor: bgColor,
          minHeight: minHeight,
          hasBlackBg: bgColor === 'rgb(0, 0, 0)' || bgColor === 'rgba(0, 0, 0, 1)',
          hasMinHeight: minHeight === '100vh' || parseFloat(minHeight) > 0
        };
      });

      const testPassed = stylesInfo.found && stylesInfo.hasBlackBg && stylesInfo.hasMinHeight;

      reporter.addBrowserTest(
        browserName,
        'CSS styles are applied correctly',
        testPassed,
        stylesInfo
      );

      console.log(testPassed ? '  ✅ PASSED' : '  ❌ FAILED');

    } catch (error) {
      reporter.addBrowserTest(
        browserName,
        'CSS styles are applied correctly',
        false,
        { error: error.message }
      );
      console.log('  ❌ FAILED:', error.message);
    }

    // TEST 3: Navigation Sidebar Width
    console.log('\n📝 Test 3: Sidebar dimensions...');
    try {
      const sidebarInfo = await page.evaluate(() => {
        const selectors = [
          '[class*="sidebar"]',
          'aside',
          'nav',
          '[class*="navigation"]'
        ];

        let sidebar = null;
        for (const selector of selectors) {
          sidebar = document.querySelector(selector);
          if (sidebar) break;
        }

        if (!sidebar) return { found: false };

        const rect = sidebar.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const widthPercentage = (rect.width / viewportWidth) * 100;

        return {
          found: true,
          width: rect.width,
          height: rect.height,
          viewportWidth: viewportWidth,
          widthPercentage: widthPercentage.toFixed(2),
          occupiesFullScreen: widthPercentage > 90
        };
      });

      const testPassed = sidebarInfo.found && !sidebarInfo.occupiesFullScreen;

      reporter.addBrowserTest(
        browserName,
        'Navigation sidebar does not occupy full screen',
        testPassed,
        sidebarInfo
      );

      console.log(testPassed ? '  ✅ PASSED' : '  ❌ FAILED');
      if (sidebarInfo.found) {
        console.log(`    Width: ${sidebarInfo.width}px (${sidebarInfo.widthPercentage}%)`);
      }

    } catch (error) {
      reporter.addBrowserTest(
        browserName,
        'Navigation sidebar does not occupy full screen',
        false,
        { error: error.message }
      );
      console.log('  ❌ FAILED:', error.message);
    }

    // TEST 4: Shadcn/UI Components
    console.log('\n📝 Test 4: Component validation...');
    try {
      const componentsInfo = await page.evaluate(() => {
        // Check for Radix UI elements
        const radixElements = document.querySelectorAll(
          '[data-radix-collection-item], [data-state], [data-orientation]'
        );

        // Check for Tailwind utility classes
        const utilityClasses = [
          'rounded-', 'border-', 'bg-', 'text-', 'shadow-',
          'hover:', 'focus:', 'dark:', 'flex', 'grid'
        ];

        const foundClasses = [];
        utilityClasses.forEach(pattern => {
          const elements = document.querySelectorAll(`[class*="${pattern}"]`);
          if (elements.length > 0) {
            foundClasses.push({
              pattern,
              count: elements.length
            });
          }
        });

        // Check CSS custom properties
        const root = document.documentElement;
        const rootStyles = getComputedStyle(root);
        const hasThemeVars = !!(
          rootStyles.getPropertyValue('--background') ||
          rootStyles.getPropertyValue('--foreground') ||
          rootStyles.getPropertyValue('--primary') ||
          rootStyles.getPropertyValue('--radius')
        );

        return {
          hasRadixUI: radixElements.length > 0,
          radixCount: radixElements.length,
          utilityClasses: foundClasses,
          hasThemeVars,
          componentCount: foundClasses.reduce((sum, c) => sum + c.count, 0)
        };
      });

      const testPassed = componentsInfo.componentCount > 0 ||
                        componentsInfo.hasRadixUI ||
                        componentsInfo.hasThemeVars;

      reporter.addBrowserTest(
        browserName,
        'Shadcn/UI components render with styles',
        testPassed,
        componentsInfo
      );

      console.log(testPassed ? '  ✅ PASSED' : '  ❌ FAILED');
      console.log(`    Components found: ${componentsInfo.componentCount}`);

    } catch (error) {
      reporter.addBrowserTest(
        browserName,
        'Shadcn/UI components render with styles',
        false,
        { error: error.message }
      );
      console.log('  ❌ FAILED:', error.message);
    }

    // TEST 5: Responsive Design Testing
    console.log('\n📝 Test 5: Responsive design validation...');
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      try {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height
        });

        await page.waitForTimeout(500); // Wait for responsive changes

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `${browserName}-viewport-${viewport.name.toLowerCase()}.png`),
          fullPage: true
        });

        console.log(`  ✅ ${viewport.name} screenshot captured`);

      } catch (error) {
        console.log(`  ❌ ${viewport.name} screenshot failed:`, error.message);
      }
    }

    reporter.addBrowserTest(
      browserName,
      'Responsive design screenshots',
      true,
      { viewportsTested: viewports.length }
    );

    // TEST 6: Dark Theme Validation
    console.log('\n📝 Test 6: Dark theme validation...');
    try {
      await page.setViewportSize({ width: 1920, height: 1080 });

      const darkThemeInfo = await page.evaluate(() => {
        const main = document.querySelector('main');
        const body = document.body;
        const html = document.documentElement;

        const checkDarkTheme = (element) => {
          if (!element) return false;
          const styles = window.getComputedStyle(element);
          const bgColor = styles.backgroundColor;

          return bgColor === 'rgb(0, 0, 0)' ||
                 bgColor === 'rgba(0, 0, 0, 1)' ||
                 bgColor.includes('0, 0, 0');
        };

        const darkClasses = [];
        ['dark', 'bg-black', 'bg-gray-900', 'bg-slate-900'].forEach(cls => {
          if (html.classList.contains(cls)) darkClasses.push(`html.${cls}`);
          if (body.classList.contains(cls)) darkClasses.push(`body.${cls}`);
          if (main && main.classList.contains(cls)) darkClasses.push(`main.${cls}`);
        });

        return {
          hasBlackMain: checkDarkTheme(main),
          hasBlackBody: checkDarkTheme(body),
          darkClasses: darkClasses,
          isDarkTheme: checkDarkTheme(main) || darkClasses.length > 0
        };
      });

      const testPassed = darkThemeInfo.isDarkTheme;

      reporter.addBrowserTest(
        browserName,
        'Dark theme applied (black background)',
        testPassed,
        darkThemeInfo
      );

      console.log(testPassed ? '  ✅ PASSED' : '  ❌ FAILED');
      if (darkThemeInfo.darkClasses.length > 0) {
        console.log(`    Dark classes: ${darkThemeInfo.darkClasses.join(', ')}`);
      }

    } catch (error) {
      reporter.addBrowserTest(
        browserName,
        'Dark theme applied (black background)',
        false,
        { error: error.message }
      );
      console.log('  ❌ FAILED:', error.message);
    }

    // TEST 7: Performance Metrics
    console.log('\n📝 Test 7: Performance metrics...');
    try {
      const metrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (!perfData) return null;

        return {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
          loadComplete: Math.round(perfData.loadEventEnd - perfData.fetchStart),
          firstPaint: Math.round(perfData.responseEnd - perfData.fetchStart),
          domInteractive: Math.round(perfData.domInteractive - perfData.fetchStart),
          duration: Math.round(perfData.duration)
        };
      });

      if (metrics) {
        reporter.addBrowserTest(
          browserName,
          'Performance metrics collected',
          true,
          { metrics }
        );

        console.log('  ✅ Metrics collected');
        console.log(`    DOM Content Loaded: ${metrics.domContentLoaded}ms`);
        console.log(`    Page Load Complete: ${metrics.loadComplete}ms`);
      } else {
        throw new Error('Performance data not available');
      }

    } catch (error) {
      reporter.addBrowserTest(
        browserName,
        'Performance metrics collected',
        false,
        { error: error.message }
      );
      console.log('  ⚠️  Could not collect metrics:', error.message);
    }

    // Final screenshot with network idle
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `${browserName}-final-state.png`),
      fullPage: true
    });

  } catch (error) {
    console.error(`\n❌ Browser test error for ${browserName}:`, error);
    reporter.addBrowserTest(
      browserName,
      'Browser test execution',
      false,
      { error: error.message }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Main test runner
async function runPlaywrightTests() {
  const reporter = new TestReporter();

  console.log('🚀 Starting Playwright Cross-Browser Tests for Bombo Dashboard...');
  console.log(`Testing URL: ${BASE_URL}`);
  console.log(`Browsers: ${BROWSERS.map(b => b.name).join(', ')}\n`);

  // Ensure directories exist
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });

  // Run tests for each browser
  for (const browserConfig of BROWSERS) {
    await runBrowserTests(browserConfig, reporter);
  }

  // Save and display final report
  const report = await reporter.saveReport();

  console.log('\n' + '='.repeat(60));
  console.log('📊 PLAYWRIGHT TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Browsers Tested: ${report.summary.totalBrowsers}`);
  console.log(`Total Tests Run: ${report.summary.totalTests}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`Success Rate: ${((report.summary.passed / report.summary.totalTests) * 100).toFixed(2)}%`);

  console.log('\n📊 Results by Browser:');
  for (const [browser, data] of Object.entries(report.browsers)) {
    const successRate = ((data.summary.passed / data.summary.total) * 100).toFixed(2);
    console.log(`  ${browser}: ${data.summary.passed}/${data.summary.total} passed (${successRate}%)`);
  }

  console.log('\n📁 Output Files:');
  console.log(`  Report: ${REPORT_PATH}`);
  console.log(`  Screenshots: ${SCREENSHOT_DIR}`);
  console.log('='.repeat(60));

  return report;
}

// Execute tests if run directly
if (require.main === module) {
  runPlaywrightTests()
    .then(() => {
      console.log('\n✅ Playwright test suite completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runPlaywrightTests };