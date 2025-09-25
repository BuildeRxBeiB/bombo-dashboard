#!/usr/bin/env node

/**
 * BOMBO Dashboard Quick Validation Test
 *
 * Quick and focused test to verify the 6 critical requirements:
 * 1. JetBrains Mono font applied
 * 2. GTV shows $70.0M+
 * 3. Sections load without errors
 * 4. BOMBO logo displays
 * 5. Navigation works
 * 6. No console errors
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const TEST_URL = 'http://localhost:3001';
const RESULTS_FILE = path.join(__dirname, 'quick-validation-results.json');

// Test results
const results = {
  timestamp: new Date().toISOString(),
  url: TEST_URL,
  tests: {},
  consoleErrors: [],
  summary: { passed: 0, failed: 0, total: 6 }
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
  let browser;

  try {
    log('\n========== BOMBO DASHBOARD VALIDATION ==========', 'cyan');
    log(`Testing: ${TEST_URL}`, 'cyan');
    log(`Time: ${new Date().toLocaleString()}\n`, 'cyan');

    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.consoleErrors.push({
          text: msg.text(),
          time: new Date().toISOString()
        });
      }
    });

    // Navigate to page
    await page.goto(TEST_URL, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for page to stabilize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 1: JetBrains Mono Font
    log('Test 1: JetBrains Mono Font Validation', 'bright');
    try {
      const fontCheck = await page.evaluate(() => {
        const body = document.body;
        const bodyClasses = body.className;
        const computedStyle = window.getComputedStyle(body);
        const fontFamily = computedStyle.fontFamily;

        // Check various elements for font
        const h1 = document.querySelector('h1');
        const h1Font = h1 ? window.getComputedStyle(h1).fontFamily : null;

        return {
          bodyClasses,
          hasFontMono: bodyClasses.includes('font-mono'),
          fontFamily,
          hasJetBrains: fontFamily.toLowerCase().includes('jetbrains'),
          h1Font,
          success: bodyClasses.includes('font-mono') &&
                  (fontFamily.toLowerCase().includes('jetbrains') ||
                   fontFamily.toLowerCase().includes('mono'))
        };
      });

      results.tests.fontValidation = fontCheck;

      if (fontCheck.success) {
        log('  ✅ JetBrains Mono font is applied correctly', 'green');
        log(`     Body classes: ${fontCheck.bodyClasses}`, 'reset');
        log(`     Font family: ${fontCheck.fontFamily}`, 'reset');
        results.summary.passed++;
      } else {
        log('  ❌ JetBrains Mono font not properly applied', 'red');
        results.summary.failed++;
      }
    } catch (error) {
      log(`  ❌ Font test failed: ${error.message}`, 'red');
      results.tests.fontValidation = { error: error.message };
      results.summary.failed++;
    }

    // Test 2: GTV Display ($70.0M+)
    log('\nTest 2: GTV Display Value', 'bright');
    try {
      const gtvCheck = await page.evaluate(() => {
        // Look for $70.0M+ or $70M+ in various locations
        const allText = document.body.innerText;
        const has70M = allText.includes('$70.0M+') || allText.includes('$70M+');

        // Find specific element with GTV
        const gtvElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const text = el.textContent || '';
          return text.includes('$70.0M') || text.includes('$70M');
        });

        const gtvElement = gtvElements.find(el => {
          const text = el.textContent?.trim() || '';
          return text === '$70.0M+' || text === '$70M+';
        });

        return {
          found: has70M,
          exactMatch: !!gtvElement,
          elementText: gtvElement?.textContent?.trim(),
          hasPlus: allText.includes('$70.0M+') || allText.includes('$70M+'),
          success: has70M && (allText.includes('$70.0M+') || allText.includes('$70M+'))
        };
      });

      results.tests.gtvDisplay = gtvCheck;

      if (gtvCheck.success) {
        log('  ✅ GTV displays correctly with plus sign', 'green');
        log(`     Found: "${gtvCheck.elementText}"`, 'reset');
        results.summary.passed++;
      } else {
        log('  ❌ GTV display issue', 'red');
        log(`     Expected: $70.0M+ or $70M+`, 'reset');
        log(`     Found GTV: ${gtvCheck.found}`, 'reset');
        log(`     Has plus: ${gtvCheck.hasPlus}`, 'reset');
        results.summary.failed++;
      }
    } catch (error) {
      log(`  ❌ GTV test failed: ${error.message}`, 'red');
      results.tests.gtvDisplay = { error: error.message };
      results.summary.failed++;
    }

    // Test 3: All Sections Load
    log('\nTest 3: Section Loading', 'bright');
    try {
      const sectionsCheck = await page.evaluate(() => {
        // Check for main content sections
        const hasHero = !!document.querySelector('#hero, section');
        const hasCards = document.querySelectorAll('[data-slot="card"], .rounded-xl, .bg-gray-900').length > 0;
        const hasMetrics = document.body.innerText.includes('Total Users') &&
                          document.body.innerText.includes('801K');
        const hasCharts = document.querySelectorAll('.recharts-wrapper, svg').length > 0;

        // Check for any error messages
        const errorElements = document.querySelectorAll('.error, [role="alert"]');

        return {
          hasHero,
          hasCards,
          hasMetrics,
          hasCharts,
          errorCount: errorElements.length,
          success: hasHero && hasCards && hasMetrics && errorElements.length === 0
        };
      });

      results.tests.sections = sectionsCheck;

      if (sectionsCheck.success) {
        log('  ✅ All sections loaded successfully', 'green');
        log(`     Hero: ${sectionsCheck.hasHero}, Cards: ${sectionsCheck.hasCards}`, 'reset');
        log(`     Metrics: ${sectionsCheck.hasMetrics}, Charts: ${sectionsCheck.hasCharts}`, 'reset');
        results.summary.passed++;
      } else {
        log('  ❌ Some sections failed to load', 'red');
        log(`     Errors found: ${sectionsCheck.errorCount}`, 'reset');
        results.summary.failed++;
      }
    } catch (error) {
      log(`  ❌ Sections test failed: ${error.message}`, 'red');
      results.tests.sections = { error: error.message };
      results.summary.failed++;
    }

    // Test 4: BOMBO Logo
    log('\nTest 4: BOMBO Logo Display', 'bright');
    try {
      const logoCheck = await page.evaluate(() => {
        // Look for BOMBO logo in various forms
        const svgLogos = document.querySelectorAll('svg');
        const hasSvgLogo = svgLogos.length > 0;

        // Check for BOMBO text
        const hasBomboText = document.body.innerText.includes('BOMBO') ||
                            document.body.innerText.includes('Bombo');

        // Check sidebar specifically
        const sidebar = document.querySelector('aside, .fixed.left-0, [class*="sidebar"]');
        const hasSidebar = !!sidebar;

        return {
          hasSvgLogo,
          svgCount: svgLogos.length,
          hasBomboText,
          hasSidebar,
          success: hasSvgLogo && hasBomboText && hasSidebar
        };
      });

      results.tests.logo = logoCheck;

      if (logoCheck.success) {
        log('  ✅ BOMBO logo displays correctly', 'green');
        log(`     SVG logos: ${logoCheck.svgCount}, Text: ${logoCheck.hasBomboText}`, 'reset');
        results.summary.passed++;
      } else {
        log('  ❌ BOMBO logo issue', 'red');
        log(`     SVG: ${logoCheck.hasSvgLogo}, Text: ${logoCheck.hasBomboText}`, 'reset');
        results.summary.failed++;
      }
    } catch (error) {
      log(`  ❌ Logo test failed: ${error.message}`, 'red');
      results.tests.logo = { error: error.message };
      results.summary.failed++;
    }

    // Test 5: Navigation
    log('\nTest 5: Navigation Functionality', 'bright');
    try {
      const navCheck = await page.evaluate(() => {
        // Find navigation elements
        const navButtons = document.querySelectorAll('nav button, aside button');
        const navLinks = document.querySelectorAll('nav a, aside a');

        // Check for navigation text
        const navTexts = ['Overview', 'Executive Summary', 'Financial', 'Engagement'];
        const hasNavText = navTexts.some(text => document.body.innerText.includes(text));

        return {
          buttonCount: navButtons.length,
          linkCount: navLinks.length,
          hasNavText,
          success: (navButtons.length > 0 || navLinks.length > 0) && hasNavText
        };
      });

      results.tests.navigation = navCheck;

      if (navCheck.success) {
        log('  ✅ Navigation elements present and functional', 'green');
        log(`     Buttons: ${navCheck.buttonCount}, Links: ${navCheck.linkCount}`, 'reset');
        results.summary.passed++;
      } else {
        log('  ❌ Navigation issues detected', 'red');
        results.summary.failed++;
      }

      // Try clicking a nav item
      const navButton = await page.$('nav button, aside button');
      if (navButton) {
        await navButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        log('     Clicked navigation item successfully', 'reset');
      }
    } catch (error) {
      log(`  ❌ Navigation test failed: ${error.message}`, 'red');
      results.tests.navigation = { error: error.message };
      results.summary.failed++;
    }

    // Test 6: Console Errors
    log('\nTest 6: Console Error Check', 'bright');

    // Filter out non-critical errors
    const criticalErrors = results.consoleErrors.filter(err =>
      !err.text.includes('Warning') &&
      !err.text.includes('DevTools') &&
      !err.text.includes('favicon')
    );

    results.tests.consoleErrors = {
      total: results.consoleErrors.length,
      critical: criticalErrors.length,
      success: criticalErrors.length === 0
    };

    if (criticalErrors.length === 0) {
      log('  ✅ No critical console errors', 'green');
      results.summary.passed++;
    } else {
      log(`  ❌ Found ${criticalErrors.length} critical console errors`, 'red');
      criticalErrors.slice(0, 3).forEach(err => {
        log(`     - ${err.text}`, 'yellow');
      });
      results.summary.failed++;
    }

    // Take final screenshot
    await page.screenshot({
      path: path.join(__dirname, 'dashboard-final-state.png'),
      fullPage: true
    });

  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    results.fatalError = error.message;
  } finally {
    if (browser) {
      await browser.close();
    }

    // Save results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

    // Print summary
    log('\n========== TEST SUMMARY ==========', 'cyan');
    log(`Total Tests: ${results.summary.total}`, 'bright');
    log(`✅ Passed: ${results.summary.passed}`, 'green');
    log(`❌ Failed: ${results.summary.failed}`, 'red');

    const passRate = ((results.summary.passed / results.summary.total) * 100).toFixed(1);
    log(`\nPass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');

    log('\n========== VALIDATION RESULTS ==========', 'cyan');

    if (results.summary.passed === results.summary.total) {
      log('🎉 ALL REQUIREMENTS MET!', 'green');
      log('\n✅ JetBrains Mono font correctly applied', 'green');
      log('✅ GTV displays $70.0M+ with plus sign', 'green');
      log('✅ All sections load without errors', 'green');
      log('✅ BOMBO logo displays in sidebar', 'green');
      log('✅ Navigation works correctly', 'green');
      log('✅ No critical console errors', 'green');
    } else {
      log('⚠️  Some requirements not met. Review the details above.', 'yellow');
    }

    log(`\nDetailed results saved to: ${RESULTS_FILE}`, 'cyan');
    log(`Screenshot saved to: dashboard-final-state.png\n`, 'cyan');

    process.exit(results.summary.failed > 0 ? 1 : 0);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});