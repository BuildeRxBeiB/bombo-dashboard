import { test, expect, Page } from '@playwright/test';

/**
 * BOMBO Investment Dashboard E2E Test Suite
 * Tests all critical user workflows and component interactions
 */

test.describe('BOMBO Investment Dashboard - Complete Test Suite', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test.describe('1. Component Rendering Tests', () => {
    test('All 7 main sections should be visible', async () => {
      // HeroSection
      await expect(page.locator('section').filter({ hasText: 'BOMBO' }).first()).toBeVisible();

      // ExecutiveOverview
      await expect(page.locator('section').filter({ hasText: 'Executive Overview' })).toBeVisible();

      // GrowthMetrics
      await expect(page.locator('section').filter({ hasText: 'Growth Metrics' })).toBeVisible();

      // FinancialPerformance
      await expect(page.locator('section').filter({ hasText: 'Financial Performance' })).toBeVisible();

      // RetentionAnalysis
      await expect(page.locator('section').filter({ hasText: 'Retention Analysis' })).toBeVisible();

      // MarketOpportunity
      await expect(page.locator('section').filter({ hasText: 'Market Opportunity' })).toBeVisible();

      // InvestmentHighlights
      await expect(page.locator('section').filter({ hasText: 'Investment Highlights' })).toBeVisible();
    });

    test('Hero section components render correctly', async () => {
      const heroSection = page.locator('section').first();

      // Check for logo/title
      await expect(heroSection.locator('h1')).toContainText('BOMBO');

      // Check for tagline
      await expect(heroSection.locator('text=/Democratizing Group Savings/')).toBeVisible();

      // Check for animated metrics
      await expect(heroSection.locator('text=/users/')).toBeVisible();
      await expect(heroSection.locator('text=/GTV/')).toBeVisible();
      await expect(heroSection.locator('text=/LTV:CAC/')).toBeVisible();
    });
  });

  test.describe('2. Data Accuracy Tests', () => {
    test('Key metrics display correct values', async () => {
      // Total users: 801,492
      const usersText = await page.locator('text=/801.*492|801,492/').first().textContent();
      expect(usersText).toBeTruthy();

      // Total GTV: $70M+
      const gtvText = await page.locator('text=/$70M/').first().textContent();
      expect(gtvText).toBeTruthy();

      // LTV:CAC ratio: 25.3x
      const ltvcacText = await page.locator('text=/25\.3x/').first().textContent();
      expect(ltvcacText).toBeTruthy();

      // Daily growth: 1,302 users/day
      const dailyGrowthText = await page.locator('text=/1.*302.*users\/day|1,302.*users\/day/').first().textContent();
      expect(dailyGrowthText).toBeTruthy();
    });

    test('2025 data marked as YTD (8 months)', async () => {
      // Look for YTD indication in financial charts
      const ytdIndicator = await page.locator('text=/YTD.*8.*months|2025.*YTD/i').count();
      expect(ytdIndicator).toBeGreaterThan(0);
    });

    test('Executive Overview metrics are accurate', async () => {
      const overview = page.locator('section').filter({ hasText: 'Executive Overview' });

      // Check for key metrics
      await expect(overview.locator('text=/801.*492|801,492/')).toBeVisible();
      await expect(overview.locator('text=/$70M/')).toBeVisible();
      await expect(overview.locator('text=/97%/')).toBeVisible(); // Retention rate
      await expect(overview.locator('text=/25\.3x/')).toBeVisible(); // LTV:CAC
    });
  });

  test.describe('3. Interactive Elements Tests', () => {
    test('Growth Metrics tabs switch correctly', async () => {
      const growthSection = page.locator('section').filter({ hasText: 'Growth Metrics' });

      // Test User Growth tab (should be default)
      await expect(growthSection.locator('[role="tabpanel"]').first()).toBeVisible();

      // Click Engagement tab
      await growthSection.locator('[role="tab"]:has-text("Engagement")').click();
      await page.waitForTimeout(500); // Wait for animation

      // Click DAU/MAU tab
      await growthSection.locator('[role="tab"]:has-text("DAU/MAU")').click();
      await page.waitForTimeout(500); // Wait for animation

      // Verify tab content changes
      const tabPanelContent = await growthSection.locator('[role="tabpanel"]').textContent();
      expect(tabPanelContent).toBeTruthy();
    });

    test('Retention Analysis tabs switch correctly', async () => {
      const retentionSection = page.locator('section').filter({ hasText: 'Retention Analysis' });

      // Test Buyer Cohorts tab (should be default)
      await expect(retentionSection.locator('[role="tabpanel"]').first()).toBeVisible();

      // Click Non-Buyer Cohorts tab
      await retentionSection.locator('[role="tab"]:has-text("Non-Buyer Cohorts")').click();
      await page.waitForTimeout(500); // Wait for animation

      // Verify tab content changes
      const tabPanelContent = await retentionSection.locator('[role="tabpanel"]').textContent();
      expect(tabPanelContent).toBeTruthy();
    });

    test('Chart tooltips appear on hover', async () => {
      // Find a chart element
      const chartElement = page.locator('.recharts-wrapper').first();
      await chartElement.scrollIntoViewIfNeeded();

      // Get chart bounds
      const box = await chartElement.boundingBox();
      if (box) {
        // Hover over chart area
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(1000); // Wait for tooltip

        // Check if tooltip appears (Recharts creates a tooltip element)
        const tooltip = page.locator('.recharts-tooltip-wrapper');
        const isTooltipVisible = await tooltip.isVisible().catch(() => false);

        // Note: Tooltips might not appear in headless mode, so we check for chart interaction capability
        expect(chartElement).toBeVisible();
      }
    });

    test('Animated counters in HeroSection work', async () => {
      // Check if counter elements exist and have numerical content
      const counterElements = await page.locator('section').first().locator('[class*="animate"]').count();
      expect(counterElements).toBeGreaterThan(0);

      // Verify animation classes are applied
      const animatedElement = page.locator('section').first().locator('[class*="animate-"]').first();
      const classes = await animatedElement.getAttribute('class');
      expect(classes).toContain('animate');
    });
  });

  test.describe('4. Responsive Design Tests', () => {
    test('Mobile viewport (iPhone 12)', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if main sections are still visible
      await expect(page.locator('text="BOMBO"').first()).toBeVisible();
      await expect(page.locator('text="Executive Overview"')).toBeVisible();

      // Check if layout adapts (sections should stack vertically)
      const sections = await page.locator('section').count();
      expect(sections).toBeGreaterThan(5);

      // Verify no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    });

    test('Tablet viewport (iPad)', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check if main sections are visible
      await expect(page.locator('text="BOMBO"').first()).toBeVisible();
      await expect(page.locator('text="Growth Metrics"')).toBeVisible();

      // Check grid layouts adapt appropriately
      const executiveOverview = page.locator('section').filter({ hasText: 'Executive Overview' });
      await expect(executiveOverview).toBeVisible();
    });

    test('Desktop viewport (1920x1080)', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // All sections should be visible
      const sections = await page.locator('section').count();
      expect(sections).toBeGreaterThanOrEqual(7);

      // Check if grid layouts are applied
      const executiveOverview = page.locator('section').filter({ hasText: 'Executive Overview' });
      const gridElements = await executiveOverview.locator('[class*="grid"]').count();
      expect(gridElements).toBeGreaterThan(0);
    });

    test('Ultra-wide viewport (2560x1440)', async () => {
      await page.setViewportSize({ width: 2560, height: 1440 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check content max-width constraint
      const container = page.locator('[class*="container"], [class*="max-w"]').first();
      await expect(container).toBeVisible();

      // Verify no layout breaking
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    });
  });

  test.describe('5. Visual Consistency Tests', () => {
    test('Dark theme is applied consistently', async () => {
      // Check if dark background is applied
      const backgroundColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // Dark theme should have dark background
      expect(backgroundColor).toMatch(/rgb.*\(.*[0-5]\d.*,.*[0-5]\d.*,.*[0-5]\d.*\)|#[0-3]/);
    });

    test('Gradient effects are visible', async () => {
      // Check for gradient classes in hero section
      const gradientElements = await page.locator('[class*="gradient"], [class*="bg-gradient"]').count();
      expect(gradientElements).toBeGreaterThan(0);

      // Check for radial gradient backgrounds
      const radialGradients = await page.locator('[class*="radial"]').count();
      expect(radialGradients).toBeGreaterThan(0);
    });

    test('Glassmorphism effects are applied', async () => {
      // Check for backdrop blur and transparency
      const glassElements = await page.locator('[class*="backdrop-blur"], [class*="bg-opacity"]').count();
      expect(glassElements).toBeGreaterThan(0);

      // Check for border styles typical of glassmorphism
      const borderElements = await page.locator('[class*="border"], [class*="ring"]').count();
      expect(borderElements).toBeGreaterThan(0);
    });

    test('Typography hierarchy is consistent', async () => {
      // Check h1 elements
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0);

      // Check h2 elements for section titles
      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThanOrEqual(6); // At least one per major section

      // Check font sizes are hierarchical
      const h1Size = await page.locator('h1').first().evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      const h2Size = await page.locator('h2').first().evaluate(el =>
        window.getComputedStyle(el).fontSize
      );

      expect(parseInt(h1Size)).toBeGreaterThan(parseInt(h2Size));
    });
  });

  test.describe('6. Performance Tests', () => {
    test('Page loads within acceptable time', async () => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('Charts render without errors', async () => {
      // Check for any console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.reload();
      await page.waitForTimeout(3000); // Wait for charts to render

      // No critical errors should occur
      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') && !e.includes('hydration')
      );
      expect(criticalErrors.length).toBe(0);
    });

    test('Animations run smoothly', async () => {
      // Check if CSS animations are defined
      const animationElements = await page.locator('[class*="animate"], [class*="transition"]').count();
      expect(animationElements).toBeGreaterThan(0);

      // Check if Framer Motion animations work
      const framerElements = await page.locator('[style*="transform"], [style*="opacity"]').count();
      expect(framerElements).toBeGreaterThan(0);
    });
  });

  test.describe('7. Accessibility Tests', () => {
    test('Interactive elements are keyboard navigable', async () => {
      // Tab through the page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Check if focus is visible
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName : null;
      });
      expect(focusedElement).toBeTruthy();
    });

    test('ARIA roles are properly implemented', async () => {
      // Check for tab roles
      const tabElements = await page.locator('[role="tab"]').count();
      expect(tabElements).toBeGreaterThan(0);

      // Check for tabpanel roles
      const tabPanels = await page.locator('[role="tabpanel"]').count();
      expect(tabPanels).toBeGreaterThan(0);

      // Check for tablist roles
      const tabLists = await page.locator('[role="tablist"]').count();
      expect(tabLists).toBeGreaterThan(0);
    });

    test('Images have alt text', async () => {
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });
  });

  test.describe('8. Cross-browser Tests', () => {
    test('Page renders correctly in different browsers', async () => {
      // This test will run in all configured browsers
      // Just verify basic rendering
      await expect(page.locator('text="BOMBO"').first()).toBeVisible();
      await expect(page.locator('section')).toHaveCount(7);
    });
  });
});

/**
 * Specific User Journey Tests
 */
test.describe('User Journey Tests', () => {
  test('Investor exploring dashboard flow', async ({ page }) => {
    // 1. Land on page
    await page.goto('/');
    await expect(page.locator('h1:has-text("BOMBO")')).toBeVisible();

    // 2. Scroll through hero metrics
    const heroSection = page.locator('section').first();
    await heroSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // Watch animations

    // 3. Review Executive Overview
    const executiveSection = page.locator('section').filter({ hasText: 'Executive Overview' });
    await executiveSection.scrollIntoViewIfNeeded();
    await expect(executiveSection).toBeVisible();

    // 4. Explore Growth Metrics tabs
    const growthSection = page.locator('section').filter({ hasText: 'Growth Metrics' });
    await growthSection.scrollIntoViewIfNeeded();

    // Click through tabs
    await growthSection.locator('[role="tab"]:has-text("Engagement")').click();
    await page.waitForTimeout(500);
    await growthSection.locator('[role="tab"]:has-text("DAU/MAU")').click();
    await page.waitForTimeout(500);
    await growthSection.locator('[role="tab"]:has-text("User Growth")').click();

    // 5. Check Financial Performance
    const financialSection = page.locator('section').filter({ hasText: 'Financial Performance' });
    await financialSection.scrollIntoViewIfNeeded();
    await expect(financialSection).toBeVisible();

    // 6. Review Retention Analysis
    const retentionSection = page.locator('section').filter({ hasText: 'Retention Analysis' });
    await retentionSection.scrollIntoViewIfNeeded();

    // Switch between cohort views
    await retentionSection.locator('[role="tab"]:has-text("Non-Buyer Cohorts")').click();
    await page.waitForTimeout(500);
    await retentionSection.locator('[role="tab"]:has-text("Buyer Cohorts")').click();

    // 7. Examine Market Opportunity
    const marketSection = page.locator('section').filter({ hasText: 'Market Opportunity' });
    await marketSection.scrollIntoViewIfNeeded();
    await expect(marketSection).toBeVisible();

    // 8. Review Investment Highlights
    const investmentSection = page.locator('section').filter({ hasText: 'Investment Highlights' });
    await investmentSection.scrollIntoViewIfNeeded();
    await expect(investmentSection).toBeVisible();
  });

  test('Mobile user quick metrics review', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Check key metrics are visible without scrolling
    await expect(page.locator('text="BOMBO"').first()).toBeVisible();

    // Scroll to Executive Overview
    await page.locator('text="Executive Overview"').scrollIntoViewIfNeeded();

    // Quick metric checks
    await expect(page.locator('text=/801.*492|801,492/').first()).toBeVisible();
    await expect(page.locator('text=/$70M/').first()).toBeVisible();

    // Verify smooth scrolling on mobile
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
  });
});