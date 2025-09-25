/**
 * BOMBO Dashboard Final Puppeteer Validation
 *
 * Comprehensive Puppeteer test suite for cross-browser validation
 * Validates all critical UI/UX requirements
 *
 * Test Engineer: Elite Testing Protocol
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const TEST_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots-puppeteer-final');
const REPORT_FILE = path.join(__dirname, '../../puppeteer-final-report.json');
const TEST_TIMEOUT = 60000;

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  url: TEST_URL,
  browser: null,
  tests: [],
  consoleErrors: [],
  networkErrors: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to log with colors
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to record test results
function recordTest(name, status, details = {}) {
  testResults.tests.push({
    name,
    status,
    timestamp: new Date().toISOString(),
    duration: details.duration || 0,
    details
  });

  testResults.summary.total++;
  if (status === 'passed') {
    testResults.summary.passed++;
    log(`  ✅ ${name}`, 'green');
  } else if (status === 'failed') {
    testResults.summary.failed++;
    log(`  ❌ ${name}: ${details.error || 'Unknown error'}`, 'red');
  } else if (status === 'skipped') {
    testResults.summary.skipped++;
    log(`  ⏭️  ${name}`, 'yellow');
  }
}

// Main test suite
async function runComprehensiveTests() {
  let browser;
  let page;

  try {
    log('\n========================================', 'cyan');
    log('BOMBO DASHBOARD PUPPETEER VALIDATION', 'cyan');
    log('========================================\n', 'cyan');

    // Launch browser with specific configuration
    log('Launching browser...', 'blue');
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    testResults.browser = {
      version: await browser.version(),
      userAgent: await browser.userAgent()
    };

    page = await browser.newPage();

    // Set up console error monitoring
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const error = {
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        };
        consoleErrors.push(error);
        testResults.consoleErrors.push(error);
      }
    });

    // Set up network error monitoring
    page.on('requestfailed', request => {
      testResults.networkErrors.push({
        url: request.url(),
        failure: request.failure(),
        timestamp: new Date().toISOString()
      });
    });

    // Navigate to the dashboard
    log('Navigating to dashboard...', 'blue');
    await page.goto(TEST_URL, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: JetBrains Mono Font Validation
    log('\n📝 Test 1: JetBrains Mono Font Validation', 'bright');
    const startTime1 = Date.now();
    try {
      // Check for font-mono class on body
      const bodyClasses = await page.evaluate(() => {
        return document.body.className;
      });

      const hasFontMonoClass = bodyClasses.includes('font-mono');

      // Get computed font-family
      const computedFont = await page.evaluate(() => {
        const bodyStyle = window.getComputedStyle(document.body);
        return bodyStyle.fontFamily;
      });

      // Check specific elements for font application
      const elementFonts = await page.evaluate(() => {
        const elements = ['h1', 'h2', 'p', '.text-sm', '.text-xs'];
        const results = {};

        elements.forEach(selector => {
          const el = document.querySelector(selector);
          if (el) {
            results[selector] = window.getComputedStyle(el).fontFamily;
          }
        });

        return results;
      });

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'font-validation.png'),
        fullPage: true
      });

      const testPassed = hasFontMonoClass && (
        computedFont.toLowerCase().includes('jetbrains') ||
        computedFont.toLowerCase().includes('mono')
      );

      recordTest('JetBrains Mono Font Application', testPassed ? 'passed' : 'failed', {
        duration: Date.now() - startTime1,
        bodyClasses,
        hasFontMonoClass,
        computedFont,
        elementFonts,
        screenshot: 'font-validation.png'
      });

    } catch (error) {
      recordTest('JetBrains Mono Font Application', 'failed', {
        duration: Date.now() - startTime1,
        error: error.message
      });
    }

    // Test 2: GTV Display Value ($70.0M+)
    log('\n💰 Test 2: GTV Display Validation', 'bright');
    const startTime2 = Date.now();
    try {
      // Wait for metrics to load
      await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: 10000 });

      // Find and validate GTV value
      const gtvValidation = await page.evaluate(() => {
        // Look for GTV text
        const gtvLabel = Array.from(document.querySelectorAll('*')).find(
          el => el.textContent?.includes('Gross Transaction Volume')
        );

        if (!gtvLabel) return { found: false };

        // Find the value in the parent container
        const parent = gtvLabel.closest('.rounded-lg') || gtvLabel.parentElement;
        const valueElement = parent?.querySelector('h2, .text-2xl');
        const value = valueElement?.textContent?.trim();

        return {
          found: true,
          value: value,
          hasPlus: value?.includes('+'),
          exactMatch: value === '$70.0M+',
          element: {
            tagName: valueElement?.tagName,
            classes: valueElement?.className
          }
        };
      });

      // Take screenshot of GTV section
      const gtvElement = await page.$('text=/Gross Transaction Volume/i');
      if (gtvElement) {
        const box = await gtvElement.boundingBox();
        if (box) {
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'gtv-display.png'),
            clip: {
              x: Math.max(0, box.x - 50),
              y: Math.max(0, box.y - 50),
              width: box.width + 100,
              height: box.height + 100
            }
          });
        }
      }

      recordTest('GTV Display Format ($70.0M+)', gtvValidation.exactMatch ? 'passed' : 'failed', {
        duration: Date.now() - startTime2,
        ...gtvValidation,
        screenshot: 'gtv-display.png'
      });

    } catch (error) {
      recordTest('GTV Display Format ($70.0M+)', 'failed', {
        duration: Date.now() - startTime2,
        error: error.message
      });
    }

    // Test 3: All Sections Load Without Errors
    log('\n📊 Test 3: Section Loading Validation', 'bright');
    const startTime3 = Date.now();
    try {
      const sections = [
        { name: 'Metrics Grid', selector: '[data-testid="metrics-grid"]' },
        { name: 'Revenue Chart', selector: '[data-testid="revenue-chart"]' },
        { name: 'User Chart', selector: '[data-testid="user-chart"]' },
        { name: 'Activity Feed', selector: '[data-testid="activity-feed"]' }
      ];

      const sectionResults = [];
      let allLoaded = true;

      for (const section of sections) {
        try {
          const element = await page.$(section.selector);
          const isVisible = element ? await element.isIntersectingViewport() : false;

          sectionResults.push({
            name: section.name,
            selector: section.selector,
            found: !!element,
            visible: isVisible
          });

          if (!element) {
            allLoaded = false;
          }

          // Screenshot each section
          if (element) {
            const box = await element.boundingBox();
            if (box) {
              await page.screenshot({
                path: path.join(SCREENSHOT_DIR, `section-${section.name.toLowerCase().replace(/\s+/g, '-')}.png`),
                clip: box
              });
            }
          }
        } catch (err) {
          sectionResults.push({
            name: section.name,
            selector: section.selector,
            error: err.message
          });
          allLoaded = false;
        }
      }

      recordTest('All Sections Load', allLoaded ? 'passed' : 'failed', {
        duration: Date.now() - startTime3,
        sections: sectionResults,
        allLoaded
      });

    } catch (error) {
      recordTest('All Sections Load', 'failed', {
        duration: Date.now() - startTime3,
        error: error.message
      });
    }

    // Test 4: BOMBO Logo in Sidebar
    log('\n🎯 Test 4: BOMBO Logo Validation', 'bright');
    const startTime4 = Date.now();
    try {
      const logoValidation = await page.evaluate(() => {
        // Check for logo in different possible locations
        const selectors = [
          'aside img[alt*="BOMBO" i]',
          'nav img[alt*="BOMBO" i]',
          'img[src*="bombo" i]',
          'aside h1:has-text("BOMBO")',
          'aside span:has-text("BOMBO")'
        ];

        for (const selector of selectors) {
          try {
            const element = document.querySelector(selector);
            if (element) {
              return {
                found: true,
                selector: selector,
                type: element.tagName,
                text: element.textContent,
                src: element.getAttribute('src'),
                alt: element.getAttribute('alt')
              };
            }
          } catch (e) {
            // Try text search
            const textElement = Array.from(document.querySelectorAll('aside *')).find(
              el => el.textContent?.includes('BOMBO')
            );
            if (textElement) {
              return {
                found: true,
                type: 'text',
                text: textElement.textContent,
                tagName: textElement.tagName
              };
            }
          }
        }
        return { found: false };
      });

      // Screenshot sidebar
      const sidebar = await page.$('aside');
      if (sidebar) {
        const box = await sidebar.boundingBox();
        if (box) {
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'sidebar-logo.png'),
            clip: box
          });
        }
      }

      recordTest('BOMBO Logo Display', logoValidation.found ? 'passed' : 'failed', {
        duration: Date.now() - startTime4,
        ...logoValidation,
        screenshot: 'sidebar-logo.png'
      });

    } catch (error) {
      recordTest('BOMBO Logo Display', 'failed', {
        duration: Date.now() - startTime4,
        error: error.message
      });
    }

    // Test 5: Navigation Functionality
    log('\n🔗 Test 5: Navigation Testing', 'bright');
    const startTime5 = Date.now();
    try {
      // Get all navigation links
      const navLinks = await page.evaluate(() => {
        const links = document.querySelectorAll('aside a, nav a');
        return Array.from(links).map(link => ({
          text: link.textContent?.trim(),
          href: link.getAttribute('href'),
          classes: link.className
        })).filter(link => link.text);
      });

      const navigationResults = [];

      // Test clicking each navigation item
      for (const link of navLinks.slice(0, 5)) { // Test first 5 links
        try {
          await page.click(`text="${link.text}"`);
          await new Promise(resolve => setTimeout(resolve, 1000));

          navigationResults.push({
            link: link.text,
            success: true,
            url: page.url()
          });
        } catch (err) {
          navigationResults.push({
            link: link.text,
            success: false,
            error: err.message
          });
        }
      }

      // Test tab navigation if exists
      const tabs = await page.$$('[role="tablist"] [role="tab"]');
      const tabResults = [];

      for (const tab of tabs) {
        const tabText = await tab.evaluate(el => el.textContent);
        await tab.click();
        await new Promise(resolve => setTimeout(resolve, 500));

        const isSelected = await tab.evaluate(el => el.getAttribute('aria-selected') === 'true');
        tabResults.push({
          tab: tabText,
          selected: isSelected
        });
      }

      recordTest('Navigation Functionality', navLinks.length > 0 ? 'passed' : 'failed', {
        duration: Date.now() - startTime5,
        linksFound: navLinks.length,
        navigationTests: navigationResults,
        tabsFound: tabs.length,
        tabResults
      });

    } catch (error) {
      recordTest('Navigation Functionality', 'failed', {
        duration: Date.now() - startTime5,
        error: error.message
      });
    }

    // Test 6: Console Error Check
    log('\n🔴 Test 6: Console Error Monitoring', 'bright');
    const startTime6 = Date.now();
    try {
      // Filter critical errors
      const criticalErrors = consoleErrors.filter(error =>
        !error.text.includes('Warning:') &&
        !error.text.includes('DevTools') &&
        !error.text.includes('favicon')
      );

      recordTest('Console Errors', criticalErrors.length === 0 ? 'passed' : 'failed', {
        duration: Date.now() - startTime6,
        totalErrors: consoleErrors.length,
        criticalErrors: criticalErrors.length,
        errors: criticalErrors.slice(0, 10) // First 10 errors
      });

    } catch (error) {
      recordTest('Console Errors', 'failed', {
        duration: Date.now() - startTime6,
        error: error.message
      });
    }

    // Test 7: Performance Metrics
    log('\n⚡ Test 7: Performance Validation', 'bright');
    const startTime7 = Date.now();
    try {
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
          firstPaint: paint[0]?.startTime || 0,
          firstContentfulPaint: paint[1]?.startTime || 0,
          domElements: document.querySelectorAll('*').length
        };
      });

      const isPerformant =
        metrics.domContentLoaded < 3000 &&
        metrics.firstContentfulPaint < 2000;

      recordTest('Performance Metrics', isPerformant ? 'passed' : 'failed', {
        duration: Date.now() - startTime7,
        metrics,
        performant: isPerformant
      });

    } catch (error) {
      recordTest('Performance Metrics', 'failed', {
        duration: Date.now() - startTime7,
        error: error.message
      });
    }

    // Test 8: Responsive Design
    log('\n📱 Test 8: Responsive Design', 'bright');
    const startTime8 = Date.now();
    try {
      const viewports = [
        { name: 'Desktop', width: 1920, height: 1080 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 }
      ];

      const responsiveResults = [];

      for (const viewport of viewports) {
        await page.setViewport({
          width: viewport.width,
          height: viewport.height
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const layoutCheck = await page.evaluate(() => {
          const metrics = document.querySelector('[data-testid="metrics-grid"]');
          const sidebar = document.querySelector('aside');

          return {
            metricsVisible: metrics ? metrics.offsetParent !== null : false,
            sidebarVisible: sidebar ? sidebar.offsetParent !== null : false,
            viewportWidth: window.innerWidth
          };
        });

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `responsive-${viewport.name.toLowerCase()}.png`)
        });

        responsiveResults.push({
          viewport: viewport.name,
          ...viewport,
          ...layoutCheck,
          screenshot: `responsive-${viewport.name.toLowerCase()}.png`
        });
      }

      const allResponsive = responsiveResults.every(r => r.metricsVisible);

      recordTest('Responsive Design', allResponsive ? 'passed' : 'failed', {
        duration: Date.now() - startTime8,
        viewports: responsiveResults,
        allResponsive
      });

    } catch (error) {
      recordTest('Responsive Design', 'failed', {
        duration: Date.now() - startTime8,
        error: error.message
      });
    }

    // Test 9: Visual Regression
    log('\n📸 Test 9: Visual Regression', 'bright');
    const startTime9 = Date.now();
    try {
      // Reset viewport to standard size
      await page.setViewport({ width: 1920, height: 1080 });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take comprehensive screenshots
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'full-page-final.png'),
        fullPage: true
      });

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'viewport-final.png')
      });

      // Scroll to bottom and screenshot
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(resolve => setTimeout(resolve, 500));

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'bottom-view.png')
      });

      recordTest('Visual Regression Capture', 'passed', {
        duration: Date.now() - startTime9,
        screenshots: [
          'full-page-final.png',
          'viewport-final.png',
          'bottom-view.png'
        ]
      });

    } catch (error) {
      recordTest('Visual Regression Capture', 'failed', {
        duration: Date.now() - startTime9,
        error: error.message
      });
    }

    // Test 10: Data Integrity
    log('\n✅ Test 10: Data Integrity', 'bright');
    const startTime10 = Date.now();
    try {
      const dataValidation = await page.evaluate(() => {
        // Check metrics format
        const metricElements = document.querySelectorAll('[data-testid="metrics-grid"] h2');
        const metrics = Array.from(metricElements).map(el => {
          const text = el.textContent?.trim();
          return {
            value: text,
            valid: /^\$?[\d,]+\.?\d*[KMB]?\+?$/.test(text) ||
                   /^\d+\.?\d*%$/.test(text) ||
                   /^[\d,]+$/.test(text)
          };
        });

        // Check for charts
        const charts = document.querySelectorAll('.recharts-wrapper');

        // Check activity feed
        const activityItems = document.querySelectorAll('[data-testid="activity-feed"] > div');

        return {
          metrics,
          chartsFound: charts.length,
          activityItems: activityItems.length,
          allMetricsValid: metrics.every(m => m.valid)
        };
      });

      recordTest('Data Integrity', dataValidation.allMetricsValid ? 'passed' : 'failed', {
        duration: Date.now() - startTime10,
        ...dataValidation
      });

    } catch (error) {
      recordTest('Data Integrity', 'failed', {
        duration: Date.now() - startTime10,
        error: error.message
      });
    }

  } catch (error) {
    log(`\n❌ Critical Error: ${error.message}`, 'red');
    testResults.criticalError = error.message;
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
    }

    // Save test results
    fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));

    // Print summary
    log('\n========================================', 'cyan');
    log('TEST SUMMARY', 'cyan');
    log('========================================\n', 'cyan');

    log(`Total Tests: ${testResults.summary.total}`, 'bright');
    log(`✅ Passed: ${testResults.summary.passed}`, 'green');
    log(`❌ Failed: ${testResults.summary.failed}`, 'red');
    log(`⏭️  Skipped: ${testResults.summary.skipped}`, 'yellow');

    if (testResults.consoleErrors.length > 0) {
      log(`\n⚠️  Console Errors: ${testResults.consoleErrors.length}`, 'yellow');
    }

    if (testResults.networkErrors.length > 0) {
      log(`⚠️  Network Errors: ${testResults.networkErrors.length}`, 'yellow');
    }

    log(`\nDetailed report: ${REPORT_FILE}`, 'blue');
    log(`Screenshots: ${SCREENSHOT_DIR}`, 'blue');

    // Generate markdown summary
    const markdownSummary = `
# BOMBO Dashboard Puppeteer Validation Report

**Date:** ${testResults.timestamp}
**URL:** ${testResults.url}
**Browser:** ${testResults.browser?.version || 'Unknown'}

## Summary
- Total Tests: ${testResults.summary.total}
- Passed: ${testResults.summary.passed}
- Failed: ${testResults.summary.failed}
- Skipped: ${testResults.summary.skipped}

## Test Results

${testResults.tests.map(test => `
### ${test.name}
- Status: **${test.status}**
- Duration: ${test.details.duration}ms
${test.status === 'failed' ? `- Error: ${test.details.error}` : ''}
`).join('\n')}

## Console Errors
${testResults.consoleErrors.length > 0 ?
  testResults.consoleErrors.slice(0, 5).map(e => `- ${e.text}`).join('\n') :
  'No console errors detected'}

## Screenshots
All screenshots saved to: ${SCREENSHOT_DIR}
`;

    fs.writeFileSync(
      path.join(__dirname, '../../PUPPETEER_VALIDATION_SUMMARY.md'),
      markdownSummary
    );

    // Exit with appropriate code
    process.exit(testResults.summary.failed > 0 ? 1 : 0);
  }
}

// Run the tests
runComprehensiveTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});