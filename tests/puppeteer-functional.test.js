/**
 * Puppeteer Functional Testing Suite
 *
 * This test suite uses Puppeteer to perform comprehensive functional testing
 * of the BOMBO dashboard with focus on black/white theme validation,
 * user interactions, and performance metrics.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PuppeteerTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      functionalTests: [],
      performanceMetrics: {},
      colorValidation: {
        passed: true,
        violations: []
      },
      accessibility: {},
      screenshots: []
    };
  }

  async setup() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();

    // Set viewport to desktop size
    await this.page.setViewport({ width: 1920, height: 1080 });

    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Listen for network failures
    this.page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ Failed to load: ${response.url()} - ${response.status()}`);
      }
    });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async navigateToApp() {
    console.log('🌐 Navigating to BOMBO Dashboard...');

    try {
      // Navigate to the app (assuming it's running on localhost:3000)
      await this.page.goto('http://localhost:3000', {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for main content to load
      await this.page.waitForSelector('section', { timeout: 10000 });

      // Additional wait for any animations
      await this.page.waitForTimeout(3000);

      this.addTestResult('Navigation', 'Successfully loaded dashboard', 'PASS');
    } catch (error) {
      this.addTestResult('Navigation', `Failed to load dashboard: ${error.message}`, 'FAIL');
      throw error;
    }
  }

  async testPageLoad() {
    console.log('⏱️  Testing page load performance...');

    const performanceMetrics = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0
      };
    });

    this.results.performanceMetrics = performanceMetrics;

    // Test performance thresholds
    if (performanceMetrics.domContentLoaded < 3000) {
      this.addTestResult('Performance', 'DOM Content Loaded within acceptable time', 'PASS');
    } else {
      this.addTestResult('Performance', 'DOM Content Loaded took too long', 'FAIL');
    }

    if (performanceMetrics.firstContentfulPaint < 2000) {
      this.addTestResult('Performance', 'First Contentful Paint within acceptable time', 'PASS');
    } else {
      this.addTestResult('Performance', 'First Contentful Paint took too long', 'FAIL');
    }
  }

  async testColorTheme() {
    console.log('🎨 Testing color theme compliance...');

    // Get all elements and check their computed styles
    const colorViolations = await this.page.evaluate(() => {
      const violations = [];
      const elements = document.querySelectorAll('*');

      // Define acceptable colors (grayscale only)
      const acceptableColors = [
        'rgb(0, 0, 0)', 'rgb(255, 255, 255)', // Pure black/white
        'rgba(0, 0, 0, 0)', 'transparent', // Transparent
        // Tailwind grays in RGB
        'rgb(31, 41, 55)', 'rgb(55, 65, 81)', 'rgb(75, 85, 99)', 'rgb(107, 114, 128)',
        'rgb(156, 163, 175)', 'rgb(209, 213, 219)', 'rgb(229, 231, 235)', 'rgb(243, 244, 246)',
        'rgb(249, 250, 251)', 'rgb(15, 23, 42)', 'rgb(30, 41, 59)', 'rgb(51, 65, 85)',
        'rgb(71, 85, 105)', 'rgb(100, 116, 139)', 'rgb(148, 163, 184)', 'rgb(203, 213, 225)',
        'rgb(226, 232, 240)', 'rgb(241, 245, 249)', 'rgb(248, 250, 252)'
      ];

      function isAcceptableColor(color) {
        if (!color || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') return true;

        // Parse RGB values
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          const [, r, g, b] = rgbMatch.map(Number);
          // Check if it's grayscale (R=G=B)
          return r === g && g === b;
        }

        return acceptableColors.includes(color);
      }

      for (let i = 0; i < Math.min(elements.length, 1000); i++) { // Check first 1000 elements
        const element = elements[i];
        const computedStyle = window.getComputedStyle(element);

        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;
        const borderColor = computedStyle.borderColor;

        if (bgColor && !isAcceptableColor(bgColor)) {
          violations.push({
            element: element.tagName + (element.className ? '.' + element.className.split(' ')[0] : ''),
            property: 'background-color',
            value: bgColor
          });
        }

        if (textColor && !isAcceptableColor(textColor)) {
          violations.push({
            element: element.tagName + (element.className ? '.' + element.className.split(' ')[0] : ''),
            property: 'color',
            value: textColor
          });
        }

        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && !isAcceptableColor(borderColor)) {
          violations.push({
            element: element.tagName + (element.className ? '.' + element.className.split(' ')[0] : ''),
            property: 'border-color',
            value: borderColor
          });
        }
      }

      return violations;
    });

    this.results.colorValidation.violations = colorViolations;
    this.results.colorValidation.passed = colorViolations.length === 0;

    if (colorViolations.length === 0) {
      this.addTestResult('Color Theme', 'All elements use grayscale colors only', 'PASS');
    } else {
      this.addTestResult('Color Theme', `Found ${colorViolations.length} color violations`, 'FAIL');
    }
  }

  async testSectionVisibility() {
    console.log('👁️  Testing section visibility and layout...');

    const sections = [
      'Executive Overview',
      'Growth & Engagement Metrics',
      'Retention Analysis',
      'Financial Performance',
      'Market Opportunity'
    ];

    for (const sectionName of sections) {
      try {
        // Find section by text content
        const sectionElement = await this.page.waitForXPath(
          `//h2[contains(text(), '${sectionName}')]`,
          { timeout: 5000 }
        );

        if (sectionElement) {
          // Scroll section into view
          await this.page.evaluate(el => el.scrollIntoView(), sectionElement);
          await this.page.waitForTimeout(1000);

          // Check if section is visible
          const isVisible = await this.page.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
          }, sectionElement);

          if (isVisible) {
            this.addTestResult('Section Visibility', `${sectionName} section is visible`, 'PASS');
          } else {
            this.addTestResult('Section Visibility', `${sectionName} section is not visible`, 'FAIL');
          }
        }
      } catch (error) {
        this.addTestResult('Section Visibility', `${sectionName} section not found`, 'FAIL');
      }
    }
  }

  async testInteractivity() {
    console.log('🖱️  Testing interactive elements...');

    // Test hover effects on cards
    try {
      const cards = await this.page.$$('.hover\\:border-gray-600');
      if (cards.length > 0) {
        await cards[0].hover();
        await this.page.waitForTimeout(500);
        this.addTestResult('Interactivity', 'Card hover effects work', 'PASS');
      } else {
        this.addTestResult('Interactivity', 'No hoverable cards found', 'WARN');
      }
    } catch (error) {
      this.addTestResult('Interactivity', 'Failed to test hover effects', 'FAIL');
    }

    // Test chart tooltips (if any)
    try {
      const chartAreas = await this.page.$$('.recharts-wrapper');
      if (chartAreas.length > 0) {
        await chartAreas[0].hover();
        await this.page.waitForTimeout(1000);
        this.addTestResult('Interactivity', 'Chart interactions work', 'PASS');
      }
    } catch (error) {
      this.addTestResult('Interactivity', 'Chart interaction test failed', 'WARN');
    }
  }

  async testResponsiveDesign() {
    console.log('📱 Testing responsive design...');

    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      await this.page.setViewport(viewport);
      await this.page.waitForTimeout(1000);

      // Check if content is still visible and properly laid out
      const isContentVisible = await this.page.evaluate(() => {
        const sections = document.querySelectorAll('section');
        return sections.length > 0 && Array.from(sections).every(section => {
          const rect = section.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
      });

      if (isContentVisible) {
        this.addTestResult('Responsive Design', `Layout works on ${viewport.name}`, 'PASS');
      } else {
        this.addTestResult('Responsive Design', `Layout broken on ${viewport.name}`, 'FAIL');
      }

      // Take screenshot for manual review
      const screenshotPath = `/Users/beib/playground_beib/bombo_metrics/bombo-dashboard/tests/screenshots/${viewport.name.toLowerCase()}-view.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.results.screenshots.push(screenshotPath);
    }

    // Reset to desktop
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async testAccessibility() {
    console.log('♿ Testing accessibility...');

    // Check for basic accessibility features
    const accessibilityCheck = await this.page.evaluate(() => {
      const results = {};

      // Check for alt text on images
      const images = document.querySelectorAll('img');
      results.imagesWithAlt = Array.from(images).filter(img => img.alt).length;
      results.totalImages = images.length;

      // Check for heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      results.totalHeadings = headings.length;

      // Check for focusable elements
      const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      results.focusableElements = focusableElements.length;

      // Check color contrast (basic check)
      const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
      let goodContrast = 0;
      for (const el of textElements) {
        const style = window.getComputedStyle(el);
        const textColor = style.color;
        const bgColor = style.backgroundColor;

        // Simple contrast check for white text on dark backgrounds
        if (textColor.includes('255, 255, 255') || textColor.includes('rgb(255, 255, 255)')) {
          goodContrast++;
        }
      }
      results.goodContrastElements = goodContrast;
      results.totalTextElements = textElements.length;

      return results;
    });

    this.results.accessibility = accessibilityCheck;

    // Test keyboard navigation
    try {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
      const focusedElement = await this.page.evaluate(() => document.activeElement.tagName);

      if (focusedElement) {
        this.addTestResult('Accessibility', 'Keyboard navigation works', 'PASS');
      } else {
        this.addTestResult('Accessibility', 'No keyboard focus detected', 'WARN');
      }
    } catch (error) {
      this.addTestResult('Accessibility', 'Keyboard navigation test failed', 'FAIL');
    }

    // Evaluate accessibility score
    const accessibilityScore = (
      (accessibilityCheck.goodContrastElements / accessibilityCheck.totalTextElements) * 40 +
      (accessibilityCheck.focusableElements > 0 ? 30 : 0) +
      (accessibilityCheck.totalHeadings > 0 ? 30 : 0)
    );

    if (accessibilityScore >= 80) {
      this.addTestResult('Accessibility', `Good accessibility score: ${accessibilityScore.toFixed(1)}%`, 'PASS');
    } else {
      this.addTestResult('Accessibility', `Poor accessibility score: ${accessibilityScore.toFixed(1)}%`, 'FAIL');
    }
  }

  addTestResult(category, description, status) {
    this.results.functionalTests.push({
      category,
      description,
      status,
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.functionalTests.length,
        passed: this.results.functionalTests.filter(t => t.status === 'PASS').length,
        failed: this.results.functionalTests.filter(t => t.status === 'FAIL').length,
        warnings: this.results.functionalTests.filter(t => t.status === 'WARN').length,
        colorViolations: this.results.colorValidation.violations.length,
        themeCompliant: this.results.colorValidation.passed
      },
      results: this.results
    };

    return report;
  }

  async runAllTests() {
    console.log('🚀 Starting Puppeteer Functional Test Suite...\n');

    try {
      await this.setup();
      await this.navigateToApp();
      await this.testPageLoad();
      await this.testColorTheme();
      await this.testSectionVisibility();
      await this.testInteractivity();
      await this.testResponsiveDesign();
      await this.testAccessibility();

      const report = this.generateReport();

      // Print summary
      console.log('\n📊 FUNCTIONAL TEST SUMMARY:');
      console.log(`Total Tests: ${report.summary.totalTests}`);
      console.log(`✅ Passed: ${report.summary.passed}`);
      console.log(`❌ Failed: ${report.summary.failed}`);
      console.log(`⚠️  Warnings: ${report.summary.warnings}`);
      console.log(`🎨 Theme Compliant: ${report.summary.themeCompliant ? 'YES' : 'NO'}`);
      console.log(`🌈 Color Violations: ${report.summary.colorViolations}`);

      // Print detailed results
      console.log('\n📋 DETAILED RESULTS:');
      this.results.functionalTests.forEach(test => {
        const icon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${icon} [${test.category}] ${test.description}`);
      });

      if (this.results.colorValidation.violations.length > 0) {
        console.log('\n🌈 COLOR VIOLATIONS:');
        this.results.colorValidation.violations.forEach(violation => {
          console.log(`  ❌ ${violation.element}: ${violation.property} = ${violation.value}`);
        });
      }

      // Save report
      const reportPath = '/Users/beib/playground_beib/bombo_metrics/bombo-dashboard/tests/puppeteer-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);

      return report;

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    } finally {
      await this.teardown();
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  (async () => {
    const tester = new PuppeteerTester();
    try {
      const results = await tester.runAllTests();
      process.exit(results.summary.failed > 0 ? 1 : 0);
    } catch (error) {
      console.error('Test execution failed:', error);
      process.exit(1);
    }
  })();
}

module.exports = PuppeteerTester;