import { test, expect, devices } from '@playwright/test';

test.describe('BOMBO Dashboard Comprehensive Tests', () => {

  test('Dashboard loads with all sections', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:3000');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/BOMBO/);

    // Check main sections exist
    const heroSection = page.locator('#hero');
    await expect(heroSection).toBeVisible();

    const financialSection = page.locator('#financial');
    await expect(financialSection).toBeVisible();

    const engagementSection = page.locator('#engagement');
    await expect(engagementSection).toBeVisible();

    // Check for hero title
    const heroTitle = page.locator('#hero h1');
    await expect(heroTitle).toContainText('Bombo');

    // Check background color is black
    const mainBg = await page.locator('main').evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(mainBg).toBe('rgb(0, 0, 0)');

    // Check for metrics
    const metrics = page.locator('[class*="metric"]');
    const metricsCount = await metrics.count();
    expect(metricsCount).toBeGreaterThan(0);

    // Check for charts (SVG elements)
    const charts = page.locator('svg');
    const chartsCount = await charts.count();
    expect(chartsCount).toBeGreaterThan(0);

    // Take screenshot
    await page.screenshot({
      path: 'tests/playwright-dashboard.png',
      fullPage: true
    });
  });

  test('Responsive design - Mobile', async ({ browser }) => {
    const iPhone = devices['iPhone 12'];
    const context = await browser.newContext({
      ...iPhone,
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check that sections are visible on mobile
    const heroSection = page.locator('#hero');
    await expect(heroSection).toBeVisible();

    await page.screenshot({
      path: 'tests/mobile-dashboard.png',
      fullPage: true
    });

    await context.close();
  });

  test('Responsive design - Tablet', async ({ browser }) => {
    const iPad = devices['iPad'];
    const context = await browser.newContext({
      ...iPad,
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check that sections are visible on tablet
    const heroSection = page.locator('#hero');
    await expect(heroSection).toBeVisible();

    await page.screenshot({
      path: 'tests/tablet-dashboard.png',
      fullPage: true
    });

    await context.close();
  });

  test('Check for console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Wait a bit to catch any delayed console errors
    await page.waitForTimeout(2000);

    expect(consoleErrors).toHaveLength(0);
  });

  test('Performance metrics', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check that the page loads within reasonable time
    const performanceTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
      };
    });

    // Page should load in less than 5 seconds
    expect(performanceTiming.loadTime).toBeLessThan(5000);

    console.log('Performance metrics:', performanceTiming);
  });
});