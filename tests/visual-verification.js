#!/usr/bin/env node

/**
 * Visual Verification Script for BOMBO Dashboard
 *
 * This script opens the dashboard in a browser and performs quick visual checks
 * for the requested fixes. It's designed for manual verification alongside
 * automated tests.
 */

const puppeteer = require('puppeteer');
const path = require('path');

const TEST_URL = process.env.TEST_URL || 'http://localhost:3001';
const DELAY = 2000; // 2 seconds between sections

async function visualVerification() {
  console.log('🔍 BOMBO Dashboard Visual Verification');
  console.log('======================================');
  console.log(`URL: ${TEST_URL}`);
  console.log('');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    devtools: true,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  try {
    console.log('📂 Opening dashboard...');
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });

    console.log('');
    console.log('🎯 VERIFICATION CHECKLIST');
    console.log('=========================');

    // 1. Check section order
    console.log('1. Executive Overview Position:');
    console.log('   ✓ Should appear immediately after Hero section');
    console.log('   ✓ No other content between Hero and Executive Overview');

    await page.evaluate(() => {
      document.querySelector('#executive')?.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(DELAY);

    // 2. Check black and white theme
    console.log('');
    console.log('2. Pure Black and White Theme:');
    console.log('   ✓ Main background should be pure black');
    console.log('   ✓ All text should be white or gray');
    console.log('   ✓ No blue, green, purple, or other colors visible');
    console.log('   ✓ Charts should only use grayscale colors');

    // 3. Check Growth Metrics
    console.log('');
    console.log('3. Growth Metrics (No Tabs):');
    await page.evaluate(() => {
      document.querySelector('#growth')?.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(DELAY);

    console.log('   ✓ All 3 charts should be visible at once');
    console.log('   ✓ No tab buttons or tab navigation');
    console.log('   ✓ User Growth, Engagement, and DAU/MAU charts');

    // 4. Check Retention Analysis
    console.log('');
    console.log('4. Retention Analysis (No Tabs):');
    await page.evaluate(() => {
      document.querySelector('#retention')?.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(DELAY);

    console.log('   ✓ Both heatmaps should be visible side by side');
    console.log('   ✓ Buyer and Non-Buyer retention heatmaps');
    console.log('   ✓ No tab navigation required');

    // 5. Check Financial Performance
    console.log('');
    console.log('5. Financial Performance Improvements:');
    await page.evaluate(() => {
      document.querySelector('#financial')?.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(DELAY);

    console.log('   ✓ Unit economics should use larger fonts (24px+)');
    console.log('   ✓ Industry benchmark citation should be visible');
    console.log('   ✓ 2025 estimated bars in revenue chart');
    console.log('   ✓ Tooltips should have black background with white text');

    // 6. Check chart visibility
    console.log('');
    console.log('6. Chart Visibility:');
    console.log('   ✓ Revenue lines should be clearly visible');
    console.log('   ✓ All chart elements should be in grayscale');
    console.log('   ✓ No colored chart elements');

    // Interactive checks
    console.log('');
    console.log('🖱️  INTERACTIVE CHECKS');
    console.log('======================');
    console.log('Please manually verify:');
    console.log('1. Hover over chart elements to check tooltip styling');
    console.log('2. Check mobile responsiveness by resizing window');
    console.log('3. Verify no colored elements are visible anywhere');
    console.log('4. Confirm all sections are accessible via sidebar navigation');

    // Mobile viewport test
    console.log('');
    console.log('📱 Testing mobile viewport...');
    await page.setViewport({ width: 375, height: 812 });
    await page.waitForTimeout(DELAY);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(DELAY);

    console.log('   ✓ Mobile view should maintain black/white theme');
    console.log('   ✓ Sections should stack vertically');
    console.log('   ✓ Text should remain readable');

    // Return to desktop view
    await page.setViewport({ width: 1400, height: 900 });
    await page.waitForTimeout(DELAY);

    console.log('');
    console.log('✅ Visual verification complete!');
    console.log('');
    console.log('📋 QUICK VERIFICATION SUMMARY:');
    console.log('==============================');

    const sections = await page.evaluate(() => {
      const sectionIds = ['hero', 'executive', 'financial', 'growth', 'retention', 'market'];
      return sectionIds.map(id => {
        const element = document.getElementById(id);
        return {
          id,
          exists: !!element,
          visible: element ? element.offsetHeight > 0 : false
        };
      });
    });

    sections.forEach((section, index) => {
      const status = section.exists && section.visible ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${section.id}: ${section.exists ? 'Present' : 'Missing'}`);
    });

    const chartCount = await page.evaluate(() => {
      return document.querySelectorAll('.recharts-wrapper').length;
    });

    console.log(`📊 Total charts found: ${chartCount}`);

    const tabCount = await page.evaluate(() => {
      return document.querySelectorAll('[role="tab"]').length;
    });

    console.log(`🚫 Tab elements found: ${tabCount} (should be 0)`);

    console.log('');
    console.log('🎨 COLOR THEME CHECK:');
    console.log('=====================');

    const colorCheck = await page.evaluate(() => {
      const mainBg = window.getComputedStyle(document.querySelector('main')).backgroundColor;

      // Find any potentially colored elements
      const elements = document.querySelectorAll('*');
      const coloredElements = [];

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const color = style.color;

        // Simple check for non-grayscale colors
        const isColored = (c) => {
          if (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return false;

          // Check for obvious color names
          const colorNames = ['blue', 'green', 'red', 'purple', 'yellow', 'orange', 'pink', 'cyan'];
          if (colorNames.some(name => c.toLowerCase().includes(name))) return true;

          // Check RGB values for non-grayscale
          const rgbMatch = c.match(/rgb[a]?\((\d+),\s*(\d+),\s*(\d+)/);
          if (rgbMatch) {
            const [, r, g, b] = rgbMatch.map(Number);
            return Math.abs(r - g) > 15 || Math.abs(g - b) > 15 || Math.abs(r - b) > 15;
          }

          return false;
        };

        if (isColored(bg) || isColored(color)) {
          coloredElements.push({
            tag: el.tagName,
            bg: isColored(bg) ? bg : null,
            color: isColored(color) ? color : null
          });
        }
      });

      return {
        mainBackground: mainBg,
        coloredElementsCount: coloredElements.length,
        samples: coloredElements.slice(0, 5)
      };
    });

    console.log(`Main background: ${colorCheck.mainBackground}`);
    console.log(`Colored elements found: ${colorCheck.coloredElementsCount}`);

    if (colorCheck.coloredElementsCount > 0) {
      console.log('⚠️  Some colored elements detected:');
      colorCheck.samples.forEach(el => {
        if (el.bg) console.log(`   ${el.tag} background: ${el.bg}`);
        if (el.color) console.log(`   ${el.tag} text: ${el.color}`);
      });
    } else {
      console.log('✅ No colored elements detected');
    }

    console.log('');
    console.log('📖 NEXT STEPS:');
    console.log('===============');
    console.log('1. Review any colored elements found above');
    console.log('2. Check tooltip styling by hovering over charts');
    console.log('3. Test responsive behavior by resizing browser');
    console.log('4. Verify accessibility with keyboard navigation');
    console.log('');
    console.log('Press Ctrl+C to close when finished...');

    // Keep the browser open for manual inspection
    await new Promise(resolve => {
      process.on('SIGINT', resolve);
    });

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  visualVerification().catch(console.error);
}

module.exports = { visualVerification };