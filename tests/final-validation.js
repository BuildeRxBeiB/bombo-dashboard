const puppeteer = require('puppeteer');

async function runFinalValidation() {
  console.log('='.repeat(60));
  console.log('BOMBO DASHBOARD - FINAL VALIDATION REPORT');
  console.log('='.repeat(60));

  let browser;
  const issues = [];
  const successes = [];

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Test different viewports
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      console.log(`\nTesting ${viewport.name} (${viewport.width}x${viewport.height}):`);
      await page.setViewport(viewport);

      await page.goto('http://localhost:3000', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Check page loads without errors
      const title = await page.title();
      if (title.includes('BOMBO')) {
        console.log(`  ✅ Page loaded successfully`);
        successes.push(`${viewport.name}: Page loads correctly`);
      } else {
        console.log(`  ❌ Page title issue: ${title}`);
        issues.push(`${viewport.name}: Unexpected title`);
      }

      // Check main sections
      const sections = ['#hero', '#financial', '#engagement'];
      for (const section of sections) {
        const element = await page.$(section);
        if (element) {
          const isVisible = await element.isIntersectingViewport();
          if (isVisible || section !== '#hero') { // Other sections may be below fold
            console.log(`  ✅ Section ${section} exists`);
            successes.push(`${viewport.name}: ${section} section present`);
          }
        } else {
          console.log(`  ❌ Section ${section} not found`);
          issues.push(`${viewport.name}: ${section} missing`);
        }
      }

      // Take screenshot for this viewport
      await page.screenshot({
        path: `tests/viewport-${viewport.name.toLowerCase()}.png`,
        fullPage: false // Just viewport
      });
    }

    // Test theme colors
    console.log('\n' + '-'.repeat(60));
    console.log('THEME VALIDATION:');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000');

    const colors = await page.evaluate(() => {
      const main = document.querySelector('main');
      const cards = document.querySelectorAll('[class*="card"]');
      const text = document.querySelector('h1');

      return {
        mainBg: window.getComputedStyle(main).backgroundColor,
        cardCount: cards.length,
        textColor: text ? window.getComputedStyle(text).color : null
      };
    });

    console.log(`  Background: ${colors.mainBg}`);
    console.log(`  Card elements: ${colors.cardCount}`);
    console.log(`  Text color: ${colors.textColor}`);

    if (colors.mainBg === 'rgb(0, 0, 0)') {
      successes.push('Theme: Black background applied correctly');
      console.log('  ✅ Black theme confirmed');
    } else {
      issues.push(`Theme: Background color is ${colors.mainBg} instead of black`);
    }

    // Check for JavaScript errors
    console.log('\n' + '-'.repeat(60));
    console.log('ERROR CHECK:');
    const jsErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });

    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (jsErrors.length === 0) {
      console.log('  ✅ No JavaScript errors detected');
      successes.push('No console errors');
    } else {
      console.log(`  ❌ Found ${jsErrors.length} JavaScript errors`);
      jsErrors.forEach(err => {
        console.log(`    - ${err}`);
        issues.push(`JS Error: ${err}`);
      });
    }

    // Performance check
    console.log('\n' + '-'.repeat(60));
    console.log('PERFORMANCE:');
    const metrics = await page.metrics();
    console.log(`  DOM Nodes: ${metrics.Nodes}`);
    console.log(`  JS Heap: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);

    if (metrics.Nodes < 3000) {
      successes.push('Performance: DOM node count is optimal');
    } else {
      issues.push(`Performance: High DOM node count (${metrics.Nodes})`);
    }

  } catch (error) {
    console.error('\n❌ Critical error during testing:', error.message);
    issues.push(`Critical: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Final Report
  console.log('\n' + '='.repeat(60));
  console.log('FINAL SUMMARY:');
  console.log('='.repeat(60));

  console.log(`\n✅ SUCCESSES (${successes.length}):`);
  successes.forEach(s => console.log(`  • ${s}`));

  if (issues.length > 0) {
    console.log(`\n⚠️  ISSUES FOUND (${issues.length}):`);
    issues.forEach(i => console.log(`  • ${i}`));
  } else {
    console.log('\n🎉 NO ISSUES FOUND!');
  }

  console.log('\n' + '='.repeat(60));
  console.log('STATUS: ' + (issues.length === 0 ? '✅ ALL TESTS PASSED' : `⚠️ ${issues.length} ISSUES NEED ATTENTION`));
  console.log('='.repeat(60));

  return issues.length === 0;
}

// Run the validation
runFinalValidation()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });