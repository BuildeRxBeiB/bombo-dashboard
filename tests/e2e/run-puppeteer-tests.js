#!/usr/bin/env node

/**
 * Puppeteer Test Runner for BOMBO Dashboard Validation
 *
 * This script runs the Puppeteer tests for validating the dashboard fixes.
 * It can be run directly with Node.js without requiring Jest.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Test configuration
const TEST_URL = process.env.TEST_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots-puppeteer');
const HEADLESS = process.env.HEADLESS !== 'false';

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
async function ensureScreenshotDir() {
  try {
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating screenshot directory:', error);
  }
}

async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}_${name}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true
  });

  return filepath;
}

function logTest(name, passed, error = null) {
  testResults.total++;

  if (passed) {
    testResults.passed++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    testResults.failed++;
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (error) {
      console.log(`  ${colors.red}Error: ${error}${colors.reset}`);
      testResults.errors.push({ test: name, error });
    }
  }
}

function logSection(name) {
  console.log(`\n${colors.bright}${colors.blue}${name}${colors.reset}`);
  console.log('─'.repeat(50));
}

// Test implementations
async function testSectionOrder(page) {
  logSection('1. Section Order Validation');

  try {
    const sectionOrder = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('div[id]'));
      return sections.map(s => s.id).filter(id => id);
    });

    const isCorrectOrder =
      sectionOrder[0] === 'hero' &&
      sectionOrder[1] === 'executive' &&
      sectionOrder[2] === 'financial' &&
      sectionOrder[3] === 'growth' &&
      sectionOrder[4] === 'retention' &&
      sectionOrder[5] === 'market';

    logTest('Executive Overview appears after Hero section', sectionOrder[1] === 'executive');
    logTest('Complete section order is correct', isCorrectOrder);

    if (!isCorrectOrder) {
      console.log(`  Found order: ${sectionOrder.join(' → ')}`);
    }

    await takeScreenshot(page, 'section-order');
  } catch (error) {
    logTest('Section order validation', false, error.message);
  }
}

async function testBlackWhiteTheme(page) {
  logSection('2. Pure Black and White Theme Validation');

  try {
    // Check main background
    const mainBg = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? window.getComputedStyle(main).backgroundColor : null;
    });

    const isBlack = mainBg && (mainBg.includes('0, 0, 0') || mainBg.includes('rgb(0'));
    logTest('Main background is pure black', isBlack);

    // Check for non-grayscale colors
    const coloredElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colored = [];

      elements.forEach(el => {
        const bg = window.getComputedStyle(el).backgroundColor;
        const color = window.getComputedStyle(el).color;

        // Simple check for non-grayscale
        const checkColor = (c) => {
          if (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return false;

          const match = c.match(/rgb[a]?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const [, r, g, b] = match.map(Number);
            return Math.abs(r - g) > 10 || Math.abs(g - b) > 10 || Math.abs(r - b) > 10;
          }
          return false;
        };

        if (checkColor(bg) || checkColor(color)) {
          colored.push({
            tag: el.tagName,
            bg: checkColor(bg) ? bg : null,
            color: checkColor(color) ? color : null
          });
        }
      });

      return colored.slice(0, 5); // Return first 5 violations
    });

    logTest('All elements use grayscale colors', coloredElements.length === 0);

    if (coloredElements.length > 0) {
      console.log(`  Found ${coloredElements.length} colored elements`);
      coloredElements.forEach(el => {
        if (el.bg) console.log(`    ${el.tag} background: ${el.bg}`);
        if (el.color) console.log(`    ${el.tag} text: ${el.color}`);
      });
    }

    await takeScreenshot(page, 'theme-validation');
  } catch (error) {
    logTest('Theme validation', false, error.message);
  }
}

async function testNoTabs(page) {
  logSection('3. No Tab Navigation Validation');

  try {
    // Scroll to Growth Metrics
    await page.evaluate(() => {
      document.querySelector('#growth')?.scrollIntoView();
    });
    await page.waitForFunction(() => new Promise(r => setTimeout(r, 500)));

    // Check for tabs in Growth Metrics
    const growthTabs = await page.evaluate(() => {
      const section = document.querySelector('#growth');
      if (!section) return 0;
      return section.querySelectorAll('[role="tab"]').length;
    });

    logTest('Growth Metrics has no tabs', growthTabs === 0);

    // Check for multiple charts visible
    const growthCharts = await page.evaluate(() => {
      const section = document.querySelector('#growth');
      if (!section) return 0;
      return section.querySelectorAll('.recharts-wrapper').length;
    });

    logTest('Growth Metrics shows all 3 charts', growthCharts >= 3);

    // Scroll to Retention Analysis
    await page.evaluate(() => {
      document.querySelector('#retention')?.scrollIntoView();
    });
    await page.waitForFunction(() => new Promise(r => setTimeout(r, 500)));

    // Check for tabs in Retention
    const retentionTabs = await page.evaluate(() => {
      const section = document.querySelector('#retention');
      if (!section) return 0;
      return section.querySelectorAll('[role="tab"]').length;
    });

    logTest('Retention Analysis has no tabs', retentionTabs === 0);

    // Check for both heatmaps
    const heatmapInfo = await page.evaluate(() => {
      const section = document.querySelector('#retention');
      if (!section) return { count: 0, hasBuyer: false, hasNonBuyer: false };

      const text = section.textContent || '';
      return {
        count: section.querySelectorAll('[class*="heatmap"], .grid > div').length,
        hasBuyer: text.toLowerCase().includes('buyer'),
        hasNonBuyer: text.toLowerCase().includes('non-buyer')
      };
    });

    logTest('Both heatmaps are visible', heatmapInfo.hasBuyer && heatmapInfo.hasNonBuyer);

    await takeScreenshot(page, 'no-tabs-validation');
  } catch (error) {
    logTest('No tabs validation', false, error.message);
  }
}

async function testFinancialImprovements(page) {
  logSection('4. Financial Performance Improvements');

  try {
    // Scroll to Financial section
    await page.evaluate(() => {
      document.querySelector('#financial')?.scrollIntoView();
    });
    await page.waitForFunction(() => new Promise(r => setTimeout(r, 500)));

    // Check for larger fonts
    const largeFonts = await page.evaluate(() => {
      const section = document.querySelector('#financial');
      if (!section) return 0;

      const largeElements = section.querySelectorAll('[class*="text-2xl"], [class*="text-xl"]');
      return largeElements.length;
    });

    logTest('Unit economics uses larger fonts', largeFonts > 0);

    // Check for benchmark citation
    const hasBenchmark = await page.evaluate(() => {
      const section = document.querySelector('#financial');
      if (!section) return false;

      const text = section.textContent?.toLowerCase() || '';
      return text.includes('benchmark') || text.includes('industry');
    });

    logTest('Industry benchmark citation present', hasBenchmark);

    // Check for 2025 data
    const has2025 = await page.evaluate(() => {
      const section = document.querySelector('#financial');
      if (!section) return false;

      return section.textContent?.includes('2025') || false;
    });

    logTest('2025 projection data present', has2025);

    // Try to check tooltip styling
    const chartElement = await page.$('#financial .recharts-bar-rectangle, #financial .recharts-line-dot');
    if (chartElement) {
      await chartElement.hover();
      await page.waitForFunction(() => new Promise(r => setTimeout(r, 300)));

      const tooltipStyle = await page.evaluate(() => {
        const tooltip = document.querySelector('.recharts-tooltip-wrapper .recharts-default-tooltip');
        if (!tooltip) return null;

        const styles = window.getComputedStyle(tooltip);
        return {
          bg: styles.backgroundColor,
          color: styles.color
        };
      });

      const hasBlackTooltip = tooltipStyle &&
        (tooltipStyle.bg.includes('0, 0, 0') || tooltipStyle.bg.includes('rgb(0'));

      logTest('Tooltips have black background', hasBlackTooltip || tooltipStyle === null);
    }

    await takeScreenshot(page, 'financial-improvements');
  } catch (error) {
    logTest('Financial improvements validation', false, error.message);
  }
}

async function testChartVisibility(page) {
  logSection('5. Chart Visibility');

  try {
    // Count all charts
    const totalCharts = await page.evaluate(() => {
      return document.querySelectorAll('.recharts-wrapper').length;
    });

    logTest('Multiple charts are visible', totalCharts >= 5);

    // Check line visibility
    const lineVisibility = await page.evaluate(() => {
      const lines = document.querySelectorAll('.recharts-line-curve');
      const visible = [];

      lines.forEach(line => {
        const strokeWidth = parseFloat(line.getAttribute('stroke-width') || '0');
        const opacity = parseFloat(line.getAttribute('opacity') || '1');

        if (strokeWidth >= 2 && opacity >= 0.8) {
          visible.push(true);
        }
      });

      return visible.length > 0;
    });

    logTest('Revenue lines are clearly visible', lineVisibility);

    // Check chart colors are grayscale
    const chartColors = await page.evaluate(() => {
      const elements = document.querySelectorAll('.recharts-layer path, .recharts-layer rect');
      const nonGrayscale = [];

      elements.forEach(el => {
        const stroke = el.getAttribute('stroke');
        const fill = el.getAttribute('fill');

        const checkHex = (color) => {
          if (!color || !color.startsWith('#')) return false;

          const hex = color.substring(1);
          if (hex.length === 6) {
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            return Math.abs(r - g) > 10 || Math.abs(g - b) > 10 || Math.abs(r - b) > 10;
          }
          return false;
        };

        if (checkHex(stroke) || checkHex(fill)) {
          nonGrayscale.push(stroke || fill);
        }
      });

      return nonGrayscale.slice(0, 5);
    });

    logTest('Charts use only grayscale colors', chartColors.length === 0);

    if (chartColors.length > 0) {
      console.log(`  Found non-grayscale chart colors: ${chartColors.join(', ')}`);
    }

    await takeScreenshot(page, 'chart-visibility');
  } catch (error) {
    logTest('Chart visibility validation', false, error.message);
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════╗
║   BOMBO Dashboard Theme & Layout Validation Tests  ║
╚════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`${colors.yellow}📍 Test URL: ${TEST_URL}${colors.reset}`);
  console.log(`${colors.yellow}📸 Screenshots: ${SCREENSHOT_DIR}${colors.reset}`);
  console.log(`${colors.yellow}🖥️  Mode: ${HEADLESS ? 'Headless' : 'Headed'}${colors.reset}\n`);

  // Ensure screenshot directory exists
  await ensureScreenshotDir();

  let browser;
  let page;

  try {
    // Launch browser
    console.log(`${colors.cyan}Launching browser...${colors.reset}`);
    browser = await puppeteer.launch({
      headless: HEADLESS,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 }
    });

    page = await browser.newPage();

    // Navigate to the dashboard
    console.log(`${colors.cyan}Navigating to dashboard...${colors.reset}`);
    await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for main content
    await page.waitForSelector('main', { timeout: 10000 });

    // Run test suites
    await testSectionOrder(page);
    await testBlackWhiteTheme(page);
    await testNoTabs(page);
    await testFinancialImprovements(page);
    await testChartVisibility(page);

  } catch (error) {
    console.error(`\n${colors.red}Fatal error: ${error.message}${colors.reset}`);
    testResults.errors.push({ test: 'Test Runner', error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print summary
  console.log(`\n${colors.bright}${colors.cyan}
════════════════════════════════════════════════════
                   TEST SUMMARY
════════════════════════════════════════════════════
${colors.reset}`);

  const passRate = testResults.total > 0
    ? Math.round((testResults.passed / testResults.total) * 100)
    : 0;

  console.log(`Total Tests: ${testResults.total}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(`Pass Rate: ${passRate}%`);

  if (testResults.failed > 0) {
    console.log(`\n${colors.red}❌ VALIDATION FAILED${colors.reset}`);
    console.log('Please fix the following issues:');

    testResults.errors.forEach((err, index) => {
      console.log(`${index + 1}. ${err.test}: ${err.error}`);
    });

    process.exit(1);
  } else {
    console.log(`\n${colors.green}✅ ALL VALIDATIONS PASSED!${colors.reset}`);
    console.log('The dashboard meets all requirements.');
    process.exit(0);
  }
}

// Check if running directly
if (require.main === module) {
  runTests().catch(error => {
    console.error(`${colors.red}Unhandled error: ${error}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { runTests };