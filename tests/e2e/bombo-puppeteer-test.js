const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(process.cwd(), 'test-results', 'puppeteer-screenshots');
const TEST_TIMEOUT = 30000;

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results tracking
const testResults = {
  timestamp: new Date().toISOString(),
  testSuite: 'BOMBO Dashboard Puppeteer Test',
  tests: [],
  summary: {
    passed: 0,
    failed: 0,
    total: 0
  }
};

// Helper function to run individual tests
async function runTest(name, testFn) {
  console.log(`\n🧪 Running: ${name}`);
  const startTime = Date.now();

  try {
    await testFn();
    const duration = Date.now() - startTime;
    console.log(`✅ PASSED: ${name} (${duration}ms)`);
    testResults.tests.push({
      name,
      status: 'PASSED',
      duration
    });
    testResults.summary.passed++;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ FAILED: ${name} (${duration}ms)`);
    console.error(`   Error: ${error.message}`);
    testResults.tests.push({
      name,
      status: 'FAILED',
      duration,
      error: error.message
    });
    testResults.summary.failed++;
  }
  testResults.summary.total++;
}

// Main test suite
async function runComprehensiveTests() {
  console.log('='.repeat(60));
  console.log('BOMBO Dashboard Comprehensive Puppeteer Test Suite');
  console.log('='.repeat(60));
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Screenshot Directory: ${SCREENSHOT_DIR}`);
  console.log('='.repeat(60));

  let browser;
  let page;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    page = await browser.newPage();

    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });

    // Set up console message capture
    const consoleMessages = {
      errors: [],
      warnings: [],
      logs: []
    };

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        consoleMessages.errors.push(text);
      } else if (type === 'warning') {
        consoleMessages.warnings.push(text);
      } else {
        consoleMessages.logs.push(text);
      }
    });

    // Navigate to the dashboard
    console.log(`\nNavigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, {
      waitUntil: 'networkidle2',
      timeout: TEST_TIMEOUT
    });
    console.log('✅ Successfully loaded dashboard');

    // Test 1: JetBrains Mono Font Verification
    await runTest('JetBrains Mono font is applied correctly', async () => {
      const bodyStyles = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);
        return {
          className: body.className,
          fontFamily: computedStyle.fontFamily
        };
      });

      if (!bodyStyles.className.includes('font-mono')) {
        throw new Error('Body element missing font-mono class');
      }

      if (!bodyStyles.fontFamily.toLowerCase().includes('jetbrains')) {
        throw new Error(`Font family does not include JetBrains Mono. Found: ${bodyStyles.fontFamily}`);
      }

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'test-1-jetbrains-font.png'),
        fullPage: false
      });
    });

    // Test 2: GTV Display with Plus Sign
    await runTest('GTV displays "$70.0M+" with plus sign', async () => {
      // Wait for GTV element
      await page.waitForSelector('::-p-text($70.0M+)', { timeout: 10000 });

      const gtvText = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const gtvElement = elements.find(el => el.textContent?.includes('$70.0M+'));
        return gtvElement ? gtvElement.textContent : null;
      });

      if (!gtvText) {
        throw new Error('GTV element not found');
      }

      if (gtvText !== '$70.0M+') {
        throw new Error(`GTV text incorrect. Expected: "$70.0M+", Found: "${gtvText}"`);
      }

      // Take screenshot of GTV element
      const gtvElement = await page.$('::-p-text($70.0M+)');
      if (gtvElement) {
        await gtvElement.screenshot({
          path: path.join(SCREENSHOT_DIR, 'test-2-gtv-display.png')
        });
      }
    });

    // Test 3: All Sections Load Without Errors
    await runTest('All sections load without errors', async () => {
      const sections = [
        'Overview',
        'Metrics',
        'Gateways',
        'Projects',
        'Documentation',
        'Settings'
      ];

      for (const section of sections) {
        // Find and click section link
        const sectionLink = await page.evaluateHandle((sectionName) => {
          const links = Array.from(document.querySelectorAll('a, button'));
          return links.find(link => link.textContent?.includes(sectionName));
        }, section);

        if (!sectionLink) {
          throw new Error(`Section link not found: ${section}`);
        }

        await sectionLink.click();
        await page.waitForTimeout(500);

        // Check for error messages
        const hasErrors = await page.evaluate(() => {
          const bodyText = document.body.textContent || '';
          return /error|failed|exception/i.test(bodyText);
        });

        if (hasErrors) {
          throw new Error(`Error detected in ${section} section`);
        }

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `test-3-section-${section.toLowerCase()}.png`),
          fullPage: true
        });
      }
    });

    // Test 4: BOMBO Logo in Sidebar
    await runTest('BOMBO logo displays correctly in sidebar', async () => {
      const logoInfo = await page.evaluate(() => {
        const sidebar = document.querySelector('.sidebar') || document.querySelector('[class*="sidebar"]');
        if (!sidebar) return null;

        const bomboElement = Array.from(sidebar.querySelectorAll('*'))
          .find(el => el.textContent?.includes('BOMBO'));

        if (!bomboElement) return null;

        const styles = window.getComputedStyle(bomboElement);
        return {
          text: bomboElement.textContent,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          color: styles.color,
          isVisible: bomboElement.offsetParent !== null
        };
      });

      if (!logoInfo) {
        throw new Error('BOMBO logo not found in sidebar');
      }

      if (!logoInfo.isVisible) {
        throw new Error('BOMBO logo is not visible');
      }

      // Take screenshot of sidebar
      const sidebar = await page.$('.sidebar, [class*="sidebar"]');
      if (sidebar) {
        await sidebar.screenshot({
          path: path.join(SCREENSHOT_DIR, 'test-4-bombo-logo.png')
        });
      }
    });

    // Test 5: Navigation Functionality
    await runTest('Navigation through all sections works', async () => {
      const navItems = ['Overview', 'Metrics', 'Gateways', 'Projects', 'Documentation', 'Settings'];

      for (const item of navItems) {
        const navLink = await page.evaluateHandle((itemName) => {
          const links = Array.from(document.querySelectorAll('a, button'));
          return links.find(link => link.textContent?.trim() === itemName);
        }, item);

        if (!navLink) {
          throw new Error(`Navigation item not found: ${item}`);
        }

        await navLink.click();
        await page.waitForTimeout(300);

        // Verify navigation occurred
        const pageContent = await page.content();
        if (!pageContent) {
          throw new Error(`Failed to navigate to ${item}`);
        }

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `test-5-nav-${item.toLowerCase()}.png`),
          fullPage: false
        });
      }
    });

    // Test 6: Console Errors Check
    await runTest('No console errors present', async () => {
      // Reload page to capture fresh console messages
      await page.reload({ waitUntil: 'networkidle2' });

      // Navigate through sections to trigger any errors
      const sections = ['Overview', 'Metrics', 'Gateways'];

      for (const section of sections) {
        const link = await page.evaluateHandle((sectionName) => {
          const links = Array.from(document.querySelectorAll('a, button'));
          return links.find(l => l.textContent?.includes(sectionName));
        }, section);

        if (link) {
          await link.click();
          await page.waitForTimeout(500);
        }
      }

      if (consoleMessages.errors.length > 0) {
        throw new Error(`Console errors detected: ${consoleMessages.errors.join(', ')}`);
      }
    });

    // Test 7: Performance Metrics
    await runTest('Performance metrics within acceptable range', async () => {
      await page.reload({ waitUntil: 'networkidle2' });

      const metrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          domInteractive: perfData.domInteractive - perfData.fetchStart
        };
      });

      if (metrics.domInteractive > 3000) {
        throw new Error(`DOM Interactive too slow: ${metrics.domInteractive}ms (threshold: 3000ms)`);
      }

      console.log(`  Performance Metrics:`);
      console.log(`    - DOM Interactive: ${metrics.domInteractive}ms`);
      console.log(`    - DOM Content Loaded: ${metrics.domContentLoaded}ms`);
      console.log(`    - Page Load Complete: ${metrics.loadComplete}ms`);
    });

    // Test 8: Responsive Design
    await runTest('Responsive design works correctly', async () => {
      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await page.setViewport({
          width: viewport.width,
          height: viewport.height
        });

        await page.waitForTimeout(500);

        const isContentVisible = await page.evaluate(() => {
          const main = document.querySelector('main');
          return main && main.offsetParent !== null;
        });

        if (!isContentVisible) {
          throw new Error(`Content not visible at ${viewport.name} viewport`);
        }

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `test-8-responsive-${viewport.name}.png`),
          fullPage: false
        });
      }
    });

    // Test 9: Visual Regression
    await runTest('Visual regression screenshots', async () => {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

      // Full page screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'test-9-full-dashboard.png'),
        fullPage: true
      });

      // Viewport screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'test-9-viewport-dashboard.png'),
        fullPage: false
      });
    });

  } catch (error) {
    console.error('\n❌ Test suite failed with critical error:');
    console.error(error);
    testResults.summary.failed = testResults.summary.total || 1;
  } finally {
    if (browser) {
      await browser.close();
    }

    // Save test results
    const reportPath = path.join(process.cwd(), 'test-results', 'bombo-puppeteer-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUITE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`📊 Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
    console.log(`📁 Screenshots: ${SCREENSHOT_DIR}`);
    console.log(`📄 Report: ${reportPath}`);
    console.log('='.repeat(60));

    // Exit with appropriate code
    process.exit(testResults.summary.failed > 0 ? 1 : 0);
  }
}

// Run the tests
runComprehensiveTests().catch(console.error);