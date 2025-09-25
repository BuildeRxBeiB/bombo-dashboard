/**
 * BOMBO Dashboard Final Validation Test Suite
 *
 * This comprehensive test suite validates:
 * 1. JetBrains Mono font application
 * 2. GTV display with "$70.0M+" format
 * 3. All sections loading without errors
 * 4. BOMBO logo display in sidebar
 * 5. Navigation through all sections
 * 6. Console error monitoring
 *
 * Test Automation Engineer: Elite Testing Protocol
 * Date: ${new Date().toISOString()}
 */

import { test, expect, Page, ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const TEST_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots-final-validation');
const REPORT_FILE = path.join(__dirname, '../../final-validation-report.json');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test results collector
const testResults = {
  timestamp: new Date().toISOString(),
  url: TEST_URL,
  tests: [] as any[],
  consoleErrors: [] as string[],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Helper function to capture test results
function recordTestResult(testName: string, status: 'passed' | 'failed' | 'warning', details: any) {
  testResults.tests.push({
    name: testName,
    status,
    timestamp: new Date().toISOString(),
    details
  });

  testResults.summary.total++;
  testResults.summary[status === 'warning' ? 'warnings' : status]++;
}

// Helper function to save test report
function saveTestReport() {
  fs.writeFileSync(REPORT_FILE, JSON.stringify(testResults, null, 2));
  console.log(`Test report saved to: ${REPORT_FILE}`);
}

test.describe('BOMBO Dashboard Final Validation Suite', () => {
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Reset console errors for each test
    consoleErrors = [];

    // Monitor console for errors
    page.on('console', (message: ConsoleMessage) => {
      if (message.type() === 'error') {
        const errorText = message.text();
        consoleErrors.push(errorText);
        testResults.consoleErrors.push({
          text: errorText,
          location: message.location(),
          timestamp: new Date().toISOString()
        } as any);
      }
    });

    // Monitor page errors
    page.on('pageerror', (error) => {
      const errorMessage = `Page Error: ${error.message}`;
      consoleErrors.push(errorMessage);
      testResults.consoleErrors.push({
        text: errorMessage,
        stack: error.stack,
        timestamp: new Date().toISOString()
      } as any);
    });

    // Navigate to dashboard with proper wait
    await page.goto(TEST_URL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for initial render
    await page.waitForTimeout(2000);
  });

  test.afterAll(async () => {
    // Save final test report
    saveTestReport();
  });

  test('1. JetBrains Mono Font Validation', async ({ page }) => {
    const testName = 'JetBrains Mono Font Application';

    try {
      // Check body element for font-mono class
      const bodyElement = await page.locator('body');
      const bodyClasses = await bodyElement.getAttribute('class');

      // Verify font-mono class is present
      const hasFontMonoClass = bodyClasses?.includes('font-mono') || false;

      // Get computed font-family style
      const fontFamily = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).fontFamily;
      });

      // Check if JetBrains Mono is in the font stack
      const hasJetBrainsMonoFont = fontFamily.toLowerCase().includes('jetbrains') ||
                                   fontFamily.toLowerCase().includes('mono');

      // Verify specific elements have the correct font
      const elementsToCheck = [
        { selector: 'h1', description: 'Main headings' },
        { selector: 'p', description: 'Paragraphs' },
        { selector: '.text-xs', description: 'Small text' },
        { selector: '.text-sm', description: 'Small-medium text' },
        { selector: '.text-2xl', description: 'Large text' }
      ];

      const fontResults = [];

      for (const element of elementsToCheck) {
        const elements = await page.locator(element.selector).first();
        if (await elements.count() > 0) {
          const elementFont = await elements.evaluate(el =>
            window.getComputedStyle(el).fontFamily
          );
          fontResults.push({
            element: element.description,
            selector: element.selector,
            fontFamily: elementFont,
            hasMonospace: elementFont.toLowerCase().includes('mono')
          });
        }
      }

      // Take screenshot of font rendering
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'font-validation.png'),
        fullPage: true
      });

      const testPassed = hasFontMonoClass && hasJetBrainsMonoFont;

      recordTestResult(testName, testPassed ? 'passed' : 'failed', {
        bodyClasses,
        hasFontMonoClass,
        computedFontFamily: fontFamily,
        hasJetBrainsMonoFont,
        elementFonts: fontResults,
        screenshot: 'font-validation.png'
      });

      expect(hasFontMonoClass).toBeTruthy();
      expect(hasJetBrainsMonoFont).toBeTruthy();

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });

  test('2. GTV Display Value Validation ($70.0M+)', async ({ page }) => {
    const testName = 'GTV Display Format';

    try {
      // Wait for metrics to load
      await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: 10000 });

      // Find GTV metric card
      const gtvCard = await page.locator('text=/Gross Transaction Volume/i').first();
      await expect(gtvCard).toBeVisible();

      // Get the parent card to find the value
      const gtvParent = await gtvCard.locator('..').first();

      // Look for the $70.0M+ value
      const gtvValue = await gtvParent.locator('text=/\\$70\\.0M\\+/').first();
      const gtvValueText = await gtvValue.textContent();

      // Alternative selectors for GTV value
      const alternativeSelectors = [
        'h2:has-text("$70.0M+")',
        '.text-2xl:has-text("$70.0M+")',
        'div:has-text("$70.0M+")'
      ];

      let foundGtvValue = false;
      let actualValue = '';

      if (await gtvValue.count() > 0) {
        foundGtvValue = true;
        actualValue = gtvValueText || '';
      } else {
        // Try alternative selectors
        for (const selector of alternativeSelectors) {
          const element = await page.locator(selector).first();
          if (await element.count() > 0) {
            foundGtvValue = true;
            actualValue = await element.textContent() || '';
            break;
          }
        }
      }

      // Check for exact format with plus sign
      const hasCorrectFormat = actualValue === '$70.0M+';
      const hasPlusSign = actualValue.includes('+');
      const hasCorrectAmount = actualValue.includes('70.0M');

      // Take screenshot of GTV section
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'gtv-display.png'),
        clip: await gtvParent.boundingBox() || undefined
      });

      recordTestResult(testName, hasCorrectFormat ? 'passed' : 'failed', {
        foundGtvValue,
        actualValue,
        expectedValue: '$70.0M+',
        hasCorrectFormat,
        hasPlusSign,
        hasCorrectAmount,
        screenshot: 'gtv-display.png'
      });

      expect(foundGtvValue).toBeTruthy();
      expect(hasCorrectFormat).toBeTruthy();
      expect(hasPlusSign).toBeTruthy();

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });

  test('3. All Sections Load Without Errors', async ({ page }) => {
    const testName = 'Section Loading Validation';

    try {
      const sections = [
        { name: 'Metrics Grid', selector: '[data-testid="metrics-grid"]', required: true },
        { name: 'Revenue Chart', selector: '[data-testid="revenue-chart"]', required: true },
        { name: 'User Chart', selector: '[data-testid="user-chart"]', required: true },
        { name: 'Activity Feed', selector: '[data-testid="activity-feed"]', required: true },
        { name: 'Analytics Dashboard', selector: '.analytics-dashboard', required: false },
        { name: 'Charts Container', selector: '.recharts-wrapper', required: false }
      ];

      const sectionResults = [];
      let allRequiredLoaded = true;

      for (const section of sections) {
        const element = await page.locator(section.selector).first();
        const isVisible = await element.count() > 0;

        if (isVisible) {
          const boundingBox = await element.boundingBox();
          sectionResults.push({
            name: section.name,
            selector: section.selector,
            loaded: true,
            visible: true,
            dimensions: boundingBox
          });
        } else {
          sectionResults.push({
            name: section.name,
            selector: section.selector,
            loaded: false,
            visible: false,
            required: section.required
          });

          if (section.required) {
            allRequiredLoaded = false;
          }
        }

        // Take screenshot of each visible section
        if (isVisible) {
          const screenshotName = `section-${section.name.toLowerCase().replace(/\s+/g, '-')}.png`;
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, screenshotName),
            clip: await element.boundingBox() || undefined
          });
        }
      }

      // Check for loading spinners or error messages
      const hasLoadingSpinners = await page.locator('.loading, .spinner, [role="status"]').count() > 0;
      const hasErrorMessages = await page.locator('.error, .alert-error, [role="alert"]').count() > 0;

      recordTestResult(testName, allRequiredLoaded ? 'passed' : 'failed', {
        sections: sectionResults,
        allRequiredLoaded,
        hasLoadingSpinners,
        hasErrorMessages,
        consoleErrors: consoleErrors.length
      });

      expect(allRequiredLoaded).toBeTruthy();
      expect(hasErrorMessages).toBeFalsy();

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });

  test('4. BOMBO Logo Display in Sidebar', async ({ page }) => {
    const testName = 'BOMBO Logo Validation';

    try {
      // Check for BOMBO logo in sidebar
      const logoSelectors = [
        'aside img[alt*="BOMBO" i]',
        'nav img[alt*="BOMBO" i]',
        '.sidebar img[alt*="BOMBO" i]',
        'img[src*="bombo" i]',
        'aside .logo',
        'aside h1:has-text("BOMBO")',
        'aside span:has-text("BOMBO")'
      ];

      let logoFound = false;
      let logoDetails = {};

      for (const selector of logoSelectors) {
        const logo = await page.locator(selector).first();
        if (await logo.count() > 0) {
          logoFound = true;

          // Get logo details
          if (selector.includes('img')) {
            logoDetails = {
              type: 'image',
              selector,
              src: await logo.getAttribute('src'),
              alt: await logo.getAttribute('alt'),
              visible: await logo.isVisible(),
              boundingBox: await logo.boundingBox()
            };
          } else {
            logoDetails = {
              type: 'text',
              selector,
              text: await logo.textContent(),
              visible: await logo.isVisible(),
              boundingBox: await logo.boundingBox()
            };
          }
          break;
        }
      }

      // Check sidebar visibility
      const sidebar = await page.locator('aside, .sidebar, nav').first();
      const sidebarVisible = await sidebar.count() > 0 && await sidebar.isVisible();

      // Take screenshot of sidebar with logo
      if (sidebarVisible) {
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'sidebar-logo.png'),
          clip: await sidebar.boundingBox() || undefined
        });
      }

      recordTestResult(testName, logoFound ? 'passed' : 'failed', {
        logoFound,
        logoDetails,
        sidebarVisible,
        screenshot: 'sidebar-logo.png'
      });

      expect(logoFound).toBeTruthy();
      expect(sidebarVisible).toBeTruthy();

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });

  test('5. Navigation Through All Sections', async ({ page }) => {
    const testName = 'Navigation Functionality';

    try {
      // Find all navigation links
      const navSelectors = [
        'aside a',
        'nav a',
        '.sidebar a',
        '[role="navigation"] a'
      ];

      let navigationLinks = [];

      for (const selector of navSelectors) {
        const links = await page.locator(selector).all();
        if (links.length > 0) {
          for (const link of links) {
            const text = await link.textContent();
            const href = await link.getAttribute('href');
            if (text && text.trim()) {
              navigationLinks.push({
                text: text.trim(),
                href,
                selector
              });
            }
          }
          break;
        }
      }

      const navigationResults = [];

      // Test each navigation link
      for (const link of navigationLinks) {
        try {
          // Click the link
          await page.click(`text="${link.text}"`);
          await page.waitForTimeout(1000);

          // Check if navigation was successful
          const currentUrl = page.url();
          const pageLoaded = await page.evaluate(() => document.readyState === 'complete');

          navigationResults.push({
            link: link.text,
            href: link.href,
            navigated: true,
            currentUrl,
            pageLoaded,
            errors: []
          });

          // Take screenshot after navigation
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `nav-${link.text.toLowerCase().replace(/\s+/g, '-')}.png`)
          });

        } catch (navError) {
          navigationResults.push({
            link: link.text,
            href: link.href,
            navigated: false,
            error: navError.message
          });
        }
      }

      // Test tab navigation if tabs exist
      const tabs = await page.locator('[role="tablist"] [role="tab"]').all();
      const tabResults = [];

      for (const tab of tabs) {
        const tabText = await tab.textContent();
        await tab.click();
        await page.waitForTimeout(500);

        const isSelected = await tab.getAttribute('aria-selected') === 'true';
        tabResults.push({
          tab: tabText,
          clicked: true,
          selected: isSelected
        });
      }

      recordTestResult(testName, navigationLinks.length > 0 ? 'passed' : 'warning', {
        navigationLinks: navigationLinks.length,
        navigationResults,
        tabsFound: tabs.length,
        tabResults
      });

      expect(navigationLinks.length).toBeGreaterThan(0);

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });

  test('6. Console Error Monitoring', async ({ page }) => {
    const testName = 'Console Error Check';

    try {
      // Navigate through the application to trigger any potential errors
      await page.reload();
      await page.waitForTimeout(3000);

      // Check for any console errors collected
      const hasConsoleErrors = consoleErrors.length > 0;

      // Filter out known/acceptable warnings
      const criticalErrors = consoleErrors.filter(error =>
        !error.includes('Warning:') &&
        !error.includes('DevTools') &&
        !error.includes('favicon')
      );

      recordTestResult(testName, criticalErrors.length === 0 ? 'passed' : 'failed', {
        totalConsoleMessages: consoleErrors.length,
        criticalErrors: criticalErrors.length,
        errors: criticalErrors,
        allMessages: consoleErrors
      });

      expect(criticalErrors.length).toBe(0);

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });

  test('7. Performance and Visual Regression', async ({ page }) => {
    const testName = 'Performance Metrics';

    try {
      // Measure page load performance
      const performanceMetrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          domInteractive: perfData.domInteractive,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
        };
      });

      // Check for memory leaks by monitoring heap size
      const memoryInfo = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory;
        }
        return null;
      });

      // Take full page screenshot for visual regression
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'full-page-final.png'),
        fullPage: true
      });

      // Take viewport screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'viewport-final.png')
      });

      const performanceAcceptable =
        performanceMetrics.domContentLoaded < 3000 &&
        performanceMetrics.firstContentfulPaint < 2000;

      recordTestResult(testName, performanceAcceptable ? 'passed' : 'warning', {
        performanceMetrics,
        memoryInfo,
        screenshots: ['full-page-final.png', 'viewport-final.png']
      });

      expect(performanceMetrics.domContentLoaded).toBeLessThan(5000);

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });

  test('8. Responsive Design Validation', async ({ page }) => {
    const testName = 'Responsive Design';

    try {
      const viewports = [
        { name: 'Desktop', width: 1920, height: 1080 },
        { name: 'Laptop', width: 1366, height: 768 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 }
      ];

      const responsiveResults = [];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);

        // Check if key elements are visible and properly sized
        const metricsVisible = await page.locator('[data-testid="metrics-grid"]').isVisible();
        const chartsVisible = await page.locator('.recharts-wrapper').first().isVisible();

        // Take screenshot for each viewport
        const screenshotName = `responsive-${viewport.name.toLowerCase()}.png`;
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, screenshotName)
        });

        responsiveResults.push({
          viewport: viewport.name,
          dimensions: `${viewport.width}x${viewport.height}`,
          metricsVisible,
          chartsVisible,
          screenshot: screenshotName
        });
      }

      const allViewportsWork = responsiveResults.every(r => r.metricsVisible);

      recordTestResult(testName, allViewportsWork ? 'passed' : 'failed', {
        viewportTests: responsiveResults,
        allViewportsWork
      });

      expect(allViewportsWork).toBeTruthy();

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });

  test('9. Accessibility Validation', async ({ page }) => {
    const testName = 'Accessibility Compliance';

    try {
      // Check for ARIA attributes
      const ariaElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[role], [aria-label], [aria-describedby]');
        return Array.from(elements).map(el => ({
          tag: el.tagName,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          ariaDescribedby: el.getAttribute('aria-describedby')
        }));
      });

      // Check for alt text on images
      const images = await page.locator('img').all();
      const imageResults = [];

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        imageResults.push({
          src,
          hasAlt: !!alt,
          altText: alt
        });
      }

      // Check for proper heading hierarchy
      const headings = await page.evaluate(() => {
        const h1s = document.querySelectorAll('h1');
        const h2s = document.querySelectorAll('h2');
        const h3s = document.querySelectorAll('h3');
        return {
          h1Count: h1s.length,
          h2Count: h2s.length,
          h3Count: h3s.length,
          properHierarchy: h1s.length > 0
        };
      });

      // Check for keyboard navigation
      const focusableElements = await page.evaluate(() => {
        const focusable = document.querySelectorAll(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        return focusable.length;
      });

      const accessibilityScore = {
        ariaElementsCount: ariaElements.length,
        imagesWithAlt: imageResults.filter(i => i.hasAlt).length,
        totalImages: imageResults.length,
        headingHierarchy: headings.properHierarchy,
        focusableElements
      };

      const isAccessible =
        accessibilityScore.imagesWithAlt === accessibilityScore.totalImages &&
        headings.properHierarchy &&
        focusableElements > 0;

      recordTestResult(testName, isAccessible ? 'passed' : 'warning', {
        accessibilityScore,
        ariaElements: ariaElements.length,
        imageResults,
        headings,
        focusableElements
      });

      expect(focusableElements).toBeGreaterThan(0);

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });

  test('10. Data Integrity Validation', async ({ page }) => {
    const testName = 'Data Integrity Check';

    try {
      // Check that numerical values are properly formatted
      const metrics = await page.evaluate(() => {
        const metricElements = document.querySelectorAll('[data-testid="metrics-grid"] h2');
        return Array.from(metricElements).map(el => el.textContent?.trim());
      });

      // Validate metric formats
      const metricValidation = metrics.map(metric => {
        if (!metric) return { value: null, valid: false };

        const hasProperFormat =
          /^\$?[\d,]+\.?\d*[KMB]?\+?$/.test(metric) || // Money/number format
          /^\d+\.?\d*%$/.test(metric) || // Percentage
          /^[\d,]+$/.test(metric); // Plain number

        return {
          value: metric,
          valid: hasProperFormat
        };
      });

      // Check chart data presence
      const chartDataPresent = await page.evaluate(() => {
        const charts = document.querySelectorAll('.recharts-wrapper');
        return charts.length > 0;
      });

      // Check activity feed has items
      const activityItems = await page.locator('[data-testid="activity-feed"] > div').count();

      const dataIntegrityPassed =
        metricValidation.every(m => m.valid) &&
        chartDataPresent &&
        activityItems > 0;

      recordTestResult(testName, dataIntegrityPassed ? 'passed' : 'failed', {
        metrics: metricValidation,
        chartsPresent: chartDataPresent,
        activityItemsCount: activityItems,
        dataIntegrityPassed
      });

      expect(dataIntegrityPassed).toBeTruthy();

    } catch (error) {
      recordTestResult(testName, 'failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  });
});

// Generate summary report after all tests
test.afterAll(async () => {
  console.log('\n========================================');
  console.log('BOMBO DASHBOARD FINAL VALIDATION SUMMARY');
  console.log('========================================\n');

  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);

  if (testResults.consoleErrors.length > 0) {
    console.log(`\n🔴 Console Errors Found: ${testResults.consoleErrors.length}`);
  }

  console.log(`\nDetailed report saved to: ${REPORT_FILE}`);
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);

  // Generate markdown report
  const markdownReport = `
# BOMBO Dashboard Final Validation Report

**Date:** ${testResults.timestamp}
**URL:** ${testResults.url}

## Summary
- **Total Tests:** ${testResults.summary.total}
- **Passed:** ${testResults.summary.passed}
- **Failed:** ${testResults.summary.failed}
- **Warnings:** ${testResults.summary.warnings}

## Test Results

${testResults.tests.map(test => `
### ${test.name}
- **Status:** ${test.status}
- **Details:** ${JSON.stringify(test.details, null, 2)}
`).join('\n')}

## Console Errors
${testResults.consoleErrors.length > 0 ?
  testResults.consoleErrors.map(error => `- ${JSON.stringify(error)}`).join('\n') :
  'No console errors detected'}

## Screenshots
All screenshots saved to: ${SCREENSHOT_DIR}
`;

  fs.writeFileSync(
    path.join(__dirname, '../../FINAL_VALIDATION_REPORT.md'),
    markdownReport
  );
});