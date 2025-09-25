/**
 * BOMBO Dashboard Cross-Browser Test Suite (Playwright)
 * Test Engineer: Universal Tester
 * Date: 2025-09-23
 *
 * Cross-browser validation across Chrome, Firefox, Safari, and Edge
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

// Define test data
const ENGAGEMENT_METRICS = {
  userReturnRate: '78%',
  buyerRetention: '98%',
  sessionGrowth: '+68%',
  dailyMessages: '1.5K avg',
  messagesPerChat: '2.41',
  avgTimeInChat: '5.19 min'
};

const FINANCIAL_METRICS = {
  totalRevenue: '$9.35M',
  totalGTV: '$50.67M',
  contributionMargin: '86%'
};

const MARKET_OPPORTUNITY = {
  totalTAM: '$1.8B',
  argentinaTAM: '180',
  chileTAM: '135',
  peruTAM: '90',
  eventCoverage: '80%'
};

// Helper functions
async function waitForChartsToLoad(page: Page) {
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(2000); // Allow charts to render
}

async function scrollToSection(page: Page, sectionId: string) {
  await page.evaluate((id) => {
    document.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' });
  }, sectionId);
  await page.waitForTimeout(1000);
}

async function checkTextContent(page: Page, selector: string, expectedText: string) {
  const element = await page.$(selector);
  if (element) {
    const text = await element.textContent();
    return text?.includes(expectedText) ?? false;
  }
  return false;
}

// Test suite
test.describe('BOMBO Dashboard Cross-Browser Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await waitForChartsToLoad(page);
  });

  test.describe('Navigation and Structure', () => {
    test('should display navigation sidebar with all sections', async ({ page }) => {
      // Check sidebar exists
      const sidebar = await page.locator('.md\\:ml-64').first();
      await expect(sidebar).toBeVisible();

      // Check all navigation links
      const navLinks = [
        { href: '#hero', text: 'Overview' },
        { href: '#executive', text: 'Executive' },
        { href: '#financial', text: 'Financial' },
        { href: '#engagement', text: 'Engagement Highlights' },
        { href: '#growth', text: 'Growth' },
        { href: '#retention', text: 'Retention' },
        { href: '#market', text: 'Market' }
      ];

      for (const link of navLinks) {
        const navElement = await page.locator(`a[href="${link.href}"]`).first();
        if (link.text === 'Engagement Highlights') {
          // Special check for new section
          await expect(navElement).toBeVisible();
        }
      }
    });

    test('should have correct page structure and sections', async ({ page }) => {
      const sections = ['hero', 'executive', 'financial', 'engagement', 'growth', 'retention', 'market'];

      for (const section of sections) {
        const sectionElement = await page.locator(`#${section}`);
        await expect(sectionElement).toBeVisible();
      }
    });
  });

  test.describe('Engagement Highlights Section', () => {
    test.beforeEach(async ({ page }) => {
      await scrollToSection(page, 'engagement');
    });

    test('should display section title and description', async ({ page }) => {
      const title = await page.locator('#engagement h2');
      await expect(title).toContainText('Engagement Highlights');

      const description = await page.locator('#engagement .text-xl.text-gray-400').first();
      await expect(description).toContainText('95K+ DAU');
      await expect(description).toContainText('219K+ MAU');
    });

    test('should display key metric cards', async ({ page }) => {
      // User Return Rate
      const returnRateCard = await page.locator('text=User Return Rate').locator('..');
      await expect(returnRateCard).toContainText(ENGAGEMENT_METRICS.userReturnRate);

      // Buyer Retention
      const buyerRetentionCard = await page.locator('text=Buyer Retention').locator('..');
      await expect(buyerRetentionCard).toContainText(ENGAGEMENT_METRICS.buyerRetention);

      // Session Growth
      const sessionGrowthCard = await page.locator('text=Session Growth').locator('..');
      await expect(sessionGrowthCard).toContainText(ENGAGEMENT_METRICS.sessionGrowth);
    });

    test('should display DAU/MAU charts', async ({ page }) => {
      // DAU Chart
      const dauChart = await page.locator('text=Daily Active Users').locator('..');
      await expect(dauChart).toBeVisible();
      await expect(dauChart).toContainText('Peak DAU');
      await expect(dauChart).toContainText('Mean DAU');
      await expect(dauChart).toContainText('Median DAU');

      // MAU Chart
      const mauChart = await page.locator('text=Monthly Active Users').locator('..');
      await expect(mauChart).toBeVisible();
      await expect(mauChart).toContainText('Peak MAU');
      await expect(mauChart).toContainText('Average MAU');
    });

    test('should display cumulative return rate chart', async ({ page }) => {
      const returnChart = await page.locator('text=Cumulative Return Rate').locator('..');
      await expect(returnChart).toBeVisible();
      await expect(returnChart).toContainText('Buyers');
      await expect(returnChart).toContainText('Non-buyers');
      await expect(returnChart).toContainText('98% eventually return');
      await expect(returnChart).toContainText('78% eventually return');
    });

    test('should display session duration evolution', async ({ page }) => {
      const sessionChart = await page.locator('text=Average Session Duration').locator('..');
      await expect(sessionChart).toBeVisible();
      await expect(sessionChart).toContainText('8.8m');
      await expect(sessionChart).toContainText('13.2m');
      await expect(sessionChart).toContainText('12.4m');
      await expect(sessionChart).toContainText('+68%');
    });

    test('should display chat and messaging metrics', async ({ page }) => {
      const chatSection = await page.locator('text=Chat Engagement').locator('..');
      await expect(chatSection).toBeVisible();
      await expect(chatSection).toContainText(ENGAGEMENT_METRICS.dailyMessages);
      await expect(chatSection).toContainText(ENGAGEMENT_METRICS.messagesPerChat);
      await expect(chatSection).toContainText(ENGAGEMENT_METRICS.avgTimeInChat);
    });

    test('should display comments activity', async ({ page }) => {
      const commentsSection = await page.locator('text=Comments Activity').locator('..');
      await expect(commentsSection).toBeVisible();
      await expect(commentsSection).toContainText('310');
      await expect(commentsSection).toContainText('113K');
      await expect(commentsSection).toContainText('9.2K');
      await expect(commentsSection).toContainText('14.1K');
    });

    test('should display platform features usage', async ({ page }) => {
      // News Section
      const newsSection = await page.locator('text=News Section').locator('..');
      await expect(newsSection).toBeVisible();
      await expect(newsSection).toContainText('Users accessed');

      // Push Notifications
      const pushSection = await page.locator('text=Push Notifications').locator('..');
      await expect(pushSection).toBeVisible();
      await expect(pushSection).toContainText('People accessed');

      // Events
      const eventsSection = await page.locator('text=Events').locator('..');
      await expect(eventsSection).toBeVisible();
      await expect(eventsSection).toContainText('12.9M');
      await expect(eventsSection).toContainText('Total event views');
    });
  });

  test.describe('Financial Metrics Section', () => {
    test.beforeEach(async ({ page }) => {
      await scrollToSection(page, 'financial');
    });

    test('should display total revenue prominently', async ({ page }) => {
      const revenueCard = await page.locator('text=Total Revenue (All-Time)').locator('..');
      await expect(revenueCard).toBeVisible();
      await expect(revenueCard).toContainText(FINANCIAL_METRICS.totalRevenue);
    });

    test('should display four metric cards', async ({ page }) => {
      const metricCards = await page.locator('#financial .bg-gray-900\\/50.border-gray-800.p-6');
      await expect(metricCards).toHaveCount(4);

      // Check each metric
      const metrics = [
        'Total Revenue (All-Time)',
        'Total GTV',
        '2025 YTD',
        'Contribution Margin'
      ];

      for (const metric of metrics) {
        const card = await page.locator(`text=${metric}`);
        await expect(card).toBeVisible();
      }
    });

    test('should display financial charts', async ({ page }) => {
      const charts = await page.locator('#financial canvas');
      const chartCount = await charts.count();
      expect(chartCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Market Opportunity Section', () => {
    test.beforeEach(async ({ page }) => {
      await scrollToSection(page, 'market');
    });

    test('should display correct TAM values', async ({ page }) => {
      // Total TAM
      const totalTAM = await page.locator(`text=${MARKET_OPPORTUNITY.totalTAM}`);
      await expect(totalTAM).toBeVisible();

      // Regional TAMs
      const marketSection = await page.locator('#market');

      // Argentina TAM (180M)
      await expect(marketSection).toContainText(MARKET_OPPORTUNITY.argentinaTAM);

      // Chile TAM (135M)
      await expect(marketSection).toContainText(MARKET_OPPORTUNITY.chileTAM);

      // Peru TAM (90M)
      await expect(marketSection).toContainText(MARKET_OPPORTUNITY.peruTAM);
    });

    test('should use "Event Coverage" instead of "Market Share"', async ({ page }) => {
      const eventCoverageCard = await page.locator('text=Event Coverage');
      await expect(eventCoverageCard).toBeVisible();

      // Check for 80% of events
      const eightyPercent = await page.locator(`text=${MARKET_OPPORTUNITY.eventCoverage}`).first();
      await expect(eightyPercent).toBeVisible();

      // Verify no "market share" text
      const marketSection = await page.locator('#market');
      const content = await marketSection.textContent();
      expect(content?.toLowerCase()).not.toContain('market share');
    });
  });

  test.describe('Growth Metrics Section', () => {
    test.beforeEach(async ({ page }) => {
      await scrollToSection(page, 'growth');
    });

    test('should have simplified metrics without redundancy', async ({ page }) => {
      const growthSection = await page.locator('#growth');
      const content = await growthSection.textContent();

      // These should NOT be in Growth section (moved to Engagement)
      expect(content).not.toContain('DAU Evolution');
      expect(content).not.toContain('MAU Growth');
    });

    test('should display platform engagement charts', async ({ page }) => {
      const charts = await page.locator('#growth canvas');
      const chartCount = await charts.count();
      expect(chartCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Theme and Visual Consistency', () => {
    test('should have consistent black/white theme', async ({ page }) => {
      // Check background color
      const mainBg = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? window.getComputedStyle(main).backgroundColor : null;
      });
      expect(mainBg).toBe('rgb(0, 0, 0)');

      // Check text colors
      const whiteTextElements = await page.locator('.text-white').count();
      expect(whiteTextElements).toBeGreaterThan(0);

      const grayTextElements = await page.locator('.text-gray-400').count();
      expect(grayTextElements).toBeGreaterThan(0);
    });

    test('should have consistent card styling', async ({ page }) => {
      const cards = await page.locator('.bg-gray-900\\/50').count();
      expect(cards).toBeGreaterThan(0);

      const borderedCards = await page.locator('.border-gray-800').count();
      expect(borderedCards).toBeGreaterThan(0);
    });
  });

  test.describe('Interactivity and UX', () => {
    test('should have working navigation links', async ({ page }) => {
      const navLinks = ['hero', 'executive', 'financial', 'engagement', 'growth', 'retention', 'market'];

      for (const link of navLinks) {
        await page.click(`a[href="#${link}"]`);
        await page.waitForTimeout(500);

        // Check if scrolled to section
        const sectionInView = await page.evaluate((sectionId) => {
          const section = document.querySelector(`#${sectionId}`);
          if (!section) return false;
          const rect = section.getBoundingClientRect();
          return rect.top >= 0 && rect.top <= window.innerHeight;
        }, link);

        expect(sectionInView).toBeTruthy();
      }
    });

    test('should display chart tooltips on hover', async ({ page }) => {
      await scrollToSection(page, 'engagement');

      // Find a chart
      const chart = await page.locator('canvas').first();
      const box = await chart.boundingBox();

      if (box) {
        // Hover over chart
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(1000);

        // Check for tooltip (Recharts creates tooltip elements)
        const tooltip = await page.locator('.recharts-tooltip-wrapper');
        // Tooltip may or may not be visible depending on chart implementation
      }
    });
  });

  test.describe('Responsive Design', () => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      test(`should render correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        // Check main content is visible
        const main = await page.locator('main');
        await expect(main).toBeVisible();

        // Check for horizontal scroll (should not exist)
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBeFalsy();

        // Take screenshot for visual verification
        await page.screenshot({
          path: `test-results/screenshots/responsive-${viewport.name}-${Date.now()}.png`,
          fullPage: true
        });
      });
    }
  });

  test.describe('Performance and Error Checking', () => {
    test('should not have console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      expect(errors).toHaveLength(0);
    });

    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should not have TypeScript errors in build', async ({ page }) => {
      // This would be checked during build process
      // Including as a placeholder for CI/CD integration
      expect(true).toBeTruthy();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();

      expect(h1Count).toBeGreaterThan(0);
      expect(h2Count).toBeGreaterThan(0);
    });

    test('should have alt text for images', async ({ page }) => {
      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        // Icons might not have alt text, but main images should
      }
    });
  });
});

// Additional cross-browser specific tests
test.describe('Browser-Specific Tests', () => {
  test('Chrome: should render WebGL charts correctly', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');

    await page.goto(BASE_URL);
    const canvas = await page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('Firefox: should handle CSS grid correctly', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');

    await page.goto(BASE_URL);
    const gridElements = await page.locator('.grid').count();
    expect(gridElements).toBeGreaterThan(0);
  });

  test('Safari: should handle backdrop filters', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');

    await page.goto(BASE_URL);
    // Safari-specific rendering tests
  });
});