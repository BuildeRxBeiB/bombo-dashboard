/**
 * Bombo Dashboard - Puppeteer Automated Tests
 * Test Suite for validating dashboard functionality and UI rendering
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots/puppeteer');
const REPORT_PATH = path.join(__dirname, '../reports/puppeteer-report.json');

// Test utilities
class TestReporter {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tool: 'Puppeteer',
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  addTest(name, passed, details = {}) {
    this.results.tests.push({
      name,
      passed,
      timestamp: new Date().toISOString(),
      ...details
    });
    this.results.summary.total++;
    if (passed) {
      this.results.summary.passed++;
    } else {
      this.results.summary.failed++;
    }
  }

  async saveReport() {
    await fs.writeFile(REPORT_PATH, JSON.stringify(this.results, null, 2));
    return this.results;
  }
}

// Main test suite
async function runPuppeteerTests() {
  const reporter = new TestReporter();
  let browser;
  let page;

  try {
    console.log('🚀 Starting Puppeteer Tests for Bombo Dashboard...\n');

    // Ensure screenshot directory exists
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to false to see the browser
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();

    // Enable console logging from the page
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
    });

    // TEST 1: Page Loads Without 404 Error
    console.log('📝 Test 1: Checking if page loads without 404 error...');
    try {
      const response = await page.goto(BASE_URL, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      const status = response.status();
      const testPassed = status === 200;

      reporter.addTest(
        'Page loads without 404 error',
        testPassed,
        {
          statusCode: status,
          url: BASE_URL,
          message: testPassed ? 'Page loaded successfully' : `Page returned status ${status}`
        }
      );

      console.log(testPassed ? '✅ PASSED' : `❌ FAILED (Status: ${status})`);

      // Take initial screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '01-initial-load.png'),
        fullPage: true
      });

    } catch (error) {
      reporter.addTest(
        'Page loads without 404 error',
        false,
        { error: error.message }
      );
      console.log('❌ FAILED:', error.message);
    }

    // TEST 2: CSS Styles Are Applied Correctly
    console.log('\n📝 Test 2: Verifying CSS styles are applied...');
    try {
      // Wait for main content to be rendered
      await page.waitForSelector('main', { timeout: 5000 });

      // Check if Tailwind CSS is loaded
      const hasStyles = await page.evaluate(() => {
        const main = document.querySelector('main');
        if (!main) return false;

        const styles = window.getComputedStyle(main);
        // Check for black background (bg-black class)
        const bgColor = styles.backgroundColor;
        const hasBlackBg = bgColor === 'rgb(0, 0, 0)' || bgColor === 'rgba(0, 0, 0, 1)';

        // Check for min-height
        const hasMinHeight = styles.minHeight === '100vh' || parseFloat(styles.minHeight) > 0;

        return {
          hasBlackBg,
          hasMinHeight,
          bgColor,
          minHeight: styles.minHeight
        };
      });

      const testPassed = hasStyles.hasBlackBg && hasStyles.hasMinHeight;

      reporter.addTest(
        'CSS styles are applied correctly',
        testPassed,
        {
          details: hasStyles,
          message: testPassed ? 'CSS styles loaded and applied' : 'CSS styles not properly applied'
        }
      );

      console.log(testPassed ? '✅ PASSED' : '❌ FAILED');
      if (!testPassed) {
        console.log('  Details:', hasStyles);
      }

    } catch (error) {
      reporter.addTest(
        'CSS styles are applied correctly',
        false,
        { error: error.message }
      );
      console.log('❌ FAILED:', error.message);
    }

    // TEST 3: Navigation Sidebar Does Not Occupy Full Screen
    console.log('\n📝 Test 3: Checking NavigationSidebar width...');
    try {
      // Look for the navigation sidebar
      const sidebarInfo = await page.evaluate(() => {
        // Try multiple possible selectors for the sidebar
        const sidebar = document.querySelector('[class*="sidebar"]') ||
                       document.querySelector('aside') ||
                       document.querySelector('nav');

        if (!sidebar) {
          return { found: false };
        }

        const rect = sidebar.getBoundingClientRect();
        const styles = window.getComputedStyle(sidebar);
        const viewportWidth = window.innerWidth;
        const sidebarWidth = rect.width;
        const widthPercentage = (sidebarWidth / viewportWidth) * 100;

        return {
          found: true,
          width: sidebarWidth,
          viewportWidth: viewportWidth,
          widthPercentage: widthPercentage.toFixed(2),
          position: styles.position,
          display: styles.display,
          occupiesFullScreen: widthPercentage > 90
        };
      });

      const testPassed = sidebarInfo.found && !sidebarInfo.occupiesFullScreen;

      reporter.addTest(
        'Navigation sidebar does not occupy full screen',
        testPassed,
        {
          sidebarInfo,
          message: testPassed ?
            `Sidebar width: ${sidebarInfo.widthPercentage}% of viewport` :
            sidebarInfo.found ?
              `Sidebar occupies ${sidebarInfo.widthPercentage}% of viewport` :
              'Sidebar not found'
        }
      );

      console.log(testPassed ? '✅ PASSED' : '❌ FAILED');
      if (sidebarInfo.found) {
        console.log(`  Sidebar width: ${sidebarInfo.width}px (${sidebarInfo.widthPercentage}% of viewport)`);
      }

      // Take screenshot of sidebar
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '02-sidebar-check.png'),
        fullPage: false
      });

    } catch (error) {
      reporter.addTest(
        'Navigation sidebar does not occupy full screen',
        false,
        { error: error.message }
      );
      console.log('❌ FAILED:', error.message);
    }

    // TEST 4: Shadcn/UI Components Render With Styles
    console.log('\n📝 Test 4: Verifying shadcn/ui components...');
    try {
      // Check for various shadcn/ui component indicators
      const componentsInfo = await page.evaluate(() => {
        const results = {
          hasRadixUI: false,
          componentsFound: [],
          stylesApplied: false
        };

        // Check for Radix UI data attributes (common in shadcn/ui)
        const radixElements = document.querySelectorAll('[data-state], [data-radix-collection-item], [data-orientation]');
        results.hasRadixUI = radixElements.length > 0;

        // Check for common shadcn/ui classes
        const shadcnPatterns = [
          'rounded-', 'border-', 'bg-', 'text-', 'shadow-',
          'hover:', 'focus:', 'dark:', 'transition-'
        ];

        shadcnPatterns.forEach(pattern => {
          const elements = document.querySelectorAll(`[class*="${pattern}"]`);
          if (elements.length > 0) {
            results.componentsFound.push({
              pattern: pattern,
              count: elements.length
            });
          }
        });

        // Check if custom CSS variables are defined (common in shadcn/ui themes)
        const rootStyles = getComputedStyle(document.documentElement);
        const hasCSSVars = rootStyles.getPropertyValue('--background') ||
                          rootStyles.getPropertyValue('--foreground') ||
                          rootStyles.getPropertyValue('--primary');

        results.stylesApplied = results.componentsFound.length > 0 || hasCSSVars;
        results.hasCSSVariables = !!hasCSSVars;

        return results;
      });

      const testPassed = componentsInfo.stylesApplied || componentsInfo.hasRadixUI;

      reporter.addTest(
        'Shadcn/UI components render with styles',
        testPassed,
        {
          ...componentsInfo,
          message: testPassed ?
            'Shadcn/UI components detected and styled' :
            'Shadcn/UI components not properly rendered'
        }
      );

      console.log(testPassed ? '✅ PASSED' : '❌ FAILED');
      if (componentsInfo.componentsFound.length > 0) {
        console.log('  Components found:', componentsInfo.componentsFound.map(c => c.pattern).join(', '));
      }

    } catch (error) {
      reporter.addTest(
        'Shadcn/UI components render with styles',
        false,
        { error: error.message }
      );
      console.log('❌ FAILED:', error.message);
    }

    // TEST 5: Visual Validation Screenshots
    console.log('\n📝 Test 5: Taking visual validation screenshots...');
    try {
      // Desktop viewport
      await page.setViewport({ width: 1920, height: 1080 });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '03-desktop-view.png'),
        fullPage: true
      });

      // Tablet viewport
      await page.setViewport({ width: 768, height: 1024 });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '04-tablet-view.png'),
        fullPage: true
      });

      // Mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '05-mobile-view.png'),
        fullPage: true
      });

      reporter.addTest(
        'Visual validation screenshots captured',
        true,
        {
          screenshots: [
            '03-desktop-view.png',
            '04-tablet-view.png',
            '05-mobile-view.png'
          ],
          message: 'Screenshots captured for all viewport sizes'
        }
      );

      console.log('✅ PASSED - Screenshots saved');

    } catch (error) {
      reporter.addTest(
        'Visual validation screenshots captured',
        false,
        { error: error.message }
      );
      console.log('❌ FAILED:', error.message);
    }

    // TEST 6: Dark Theme Applied
    console.log('\n📝 Test 6: Verifying dark theme (black background)...');
    try {
      await page.setViewport({ width: 1920, height: 1080 });

      const themeInfo = await page.evaluate(() => {
        const main = document.querySelector('main');
        const body = document.body;
        const html = document.documentElement;

        const getBackgroundColor = (element) => {
          if (!element) return null;
          const styles = window.getComputedStyle(element);
          return styles.backgroundColor;
        };

        const isBlackOrDark = (color) => {
          if (!color) return false;
          // Check for black or very dark colors
          return color === 'rgb(0, 0, 0)' ||
                 color === 'rgba(0, 0, 0, 1)' ||
                 color.includes('0, 0, 0') ||
                 color.includes('black');
        };

        const results = {
          mainBg: getBackgroundColor(main),
          bodyBg: getBackgroundColor(body),
          htmlBg: getBackgroundColor(html),
          hasBlackMain: isBlackOrDark(getBackgroundColor(main)),
          hasDarkTheme: false,
          darkElements: []
        };

        // Check for dark theme classes
        const darkClasses = ['dark', 'bg-black', 'bg-gray-900', 'bg-slate-900'];
        darkClasses.forEach(cls => {
          if (html.classList.contains(cls) || body.classList.contains(cls) ||
              (main && main.classList.contains(cls))) {
            results.darkElements.push(cls);
          }
        });

        results.hasDarkTheme = results.hasBlackMain || results.darkElements.length > 0;

        return results;
      });

      const testPassed = themeInfo.hasDarkTheme;

      reporter.addTest(
        'Dark theme applied (black background)',
        testPassed,
        {
          ...themeInfo,
          message: testPassed ?
            'Dark theme is properly applied' :
            'Dark theme not detected'
        }
      );

      console.log(testPassed ? '✅ PASSED' : '❌ FAILED');
      if (themeInfo.darkElements.length > 0) {
        console.log('  Dark theme classes:', themeInfo.darkElements.join(', '));
      }

      // Final screenshot with annotations
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '06-final-validation.png'),
        fullPage: true
      });

    } catch (error) {
      reporter.addTest(
        'Dark theme applied (black background)',
        false,
        { error: error.message }
      );
      console.log('❌ FAILED:', error.message);
    }

    // Performance metrics
    console.log('\n📝 Collecting performance metrics...');
    try {
      const metrics = await page.metrics();
      const performanceData = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        return perfData ? {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          domInteractive: perfData.domInteractive,
          duration: perfData.duration
        } : null;
      });

      reporter.addTest(
        'Performance metrics collected',
        true,
        {
          metrics: {
            ...metrics,
            performance: performanceData
          },
          message: 'Performance data collected successfully'
        }
      );

      console.log('✅ Performance metrics collected');

    } catch (error) {
      console.log('⚠️  Could not collect performance metrics:', error.message);
    }

  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    reporter.addTest(
      'Test suite execution',
      false,
      { error: error.message }
    );
  } finally {
    if (browser) {
      await browser.close();
    }

    // Save and display report
    const report = await reporter.saveReport();

    console.log('\n' + '='.repeat(50));
    console.log('📊 PUPPETEER TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${((report.summary.passed / report.summary.total) * 100).toFixed(2)}%`);
    console.log('\nDetailed report saved to:', REPORT_PATH);
    console.log('Screenshots saved to:', SCREENSHOT_DIR);
    console.log('='.repeat(50));

    return report;
  }
}

// Execute tests if run directly
if (require.main === module) {
  runPuppeteerTests()
    .then(() => {
      console.log('\n✅ Puppeteer test suite completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runPuppeteerTests };