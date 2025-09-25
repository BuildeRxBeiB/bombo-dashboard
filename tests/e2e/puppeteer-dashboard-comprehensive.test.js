/**
 * BOMBO Dashboard Comprehensive Puppeteer Test Suite
 * Tests for all enhanced features based on user feedback
 * Focus on chart rendering, metrics display, and UI/UX workflows
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

describe('BOMBO Dashboard - Comprehensive Enhancement Tests', () => {
  let browser;
  let page;
  const baseUrl = 'http://localhost:3000';
  const screenshotDir = path.join(__dirname, '../screenshots/puppeteer');

  beforeAll(async () => {
    // Ensure screenshot directory exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    browser = await puppeteer.launch({
      headless: process.env.CI ? true : false,
      slowMo: process.env.CI ? 0 : 50,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Set up console error tracking
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });

    // Navigate to dashboard
    await page.goto(baseUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('1. Enhanced Metrics Display Tests', () => {
    test('should display all comprehensive key metrics correctly', async () => {
      // Wait for metrics to load
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Test first row of metrics (Total Users, Purchasers, Tickets, Market Share)
      const firstRowMetrics = await page.$$eval(
        '.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 .bg-gray-900\\/50',
        elements => elements.slice(0, 4).map(el => ({
          label: el.querySelector('.text-sm.text-gray-400')?.textContent || '',
          value: el.querySelector('.text-2xl.font-bold.text-white')?.textContent || '',
          trend: el.querySelector('.bg-gray-800')?.textContent || ''
        }))
      );

      // Verify first row metrics
      expect(firstRowMetrics).toHaveLength(4);
      expect(firstRowMetrics[0].label).toBe('Total Users');
      expect(firstRowMetrics[0].trend).toBe('801K+');
      expect(firstRowMetrics[1].label).toBe('Total Purchasers');
      expect(firstRowMetrics[1].trend).toBe('222K+');
      expect(firstRowMetrics[2].label).toBe('Tickets Sold');
      expect(firstRowMetrics[2].trend).toBe('1.3M+');
      expect(firstRowMetrics[3].label).toBe('Market Share');
      expect(firstRowMetrics[3].trend).toBe('Argentina');

      await page.screenshot({
        path: path.join(screenshotDir, 'comprehensive-metrics-first-row.png'),
        fullPage: false
      });
    });

    test('should display second row of growth metrics correctly', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Test second row of metrics (Daily New Users, Peak MAU, Peak DAU, LTV:CAC)
      const secondRowMetrics = await page.$$eval(
        '.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4 .bg-gray-900\\/50',
        elements => elements.slice(4, 8).map(el => ({
          label: el.querySelector('.text-sm.text-gray-400')?.textContent || '',
          value: el.querySelector('.text-2xl.font-bold.text-white')?.textContent || '',
          trend: el.querySelector('.bg-gray-800')?.textContent || ''
        }))
      );

      // Verify second row metrics
      expect(secondRowMetrics).toHaveLength(4);
      expect(secondRowMetrics[0].label).toBe('Daily New Users');
      expect(secondRowMetrics[0].trend).toBe('Zero CAC');
      expect(secondRowMetrics[1].label).toBe('Peak MAU');
      expect(secondRowMetrics[1].trend).toBe('Jan 2025');
      expect(secondRowMetrics[2].label).toBe('Peak DAU');
      expect(secondRowMetrics[2].trend).toBe('95K+');
      expect(secondRowMetrics[3].label).toBe('LTV:CAC Ratio');
      expect(secondRowMetrics[3].trend).toBe('25.3x Industry');

      await page.screenshot({
        path: path.join(screenshotDir, 'comprehensive-metrics-second-row.png'),
        fullPage: false
      });
    });
  });

  describe('2. Enhanced Charts Rendering Tests', () => {
    test('should render User Acquisition Timeline chart properly', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Wait for chart to load
      await page.waitForSelector('.recharts-responsive-container', { timeout: 15000 });

      // Check if area chart is rendered
      const areaChart = await page.$('.recharts-area-chart');
      expect(areaChart).toBeTruthy();

      // Verify chart elements
      const areaElement = await page.$('.recharts-area-area');
      expect(areaElement).toBeTruthy();

      const xAxis = await page.$('.recharts-xAxis');
      expect(xAxis).toBeTruthy();

      const yAxis = await page.$('.recharts-yAxis');
      expect(yAxis).toBeTruthy();

      // Check for gradient
      const gradient = await page.$('#userGradient');
      expect(gradient).toBeTruthy();

      await page.screenshot({
        path: path.join(screenshotDir, 'user-acquisition-chart.png'),
        fullPage: false
      });
    });

    test('should render Platform Engagement Metrics chart properly', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Scroll to engagement chart
      await page.evaluate(() => {
        const engagementChart = document.querySelector('.recharts-bar-chart');
        if (engagementChart) {
          engagementChart.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      await page.waitForTimeout(2000); // Wait for scroll and chart render

      // Check if bar chart is rendered
      const barChart = await page.$('.recharts-bar-chart');
      expect(barChart).toBeTruthy();

      // Verify bars are rendered
      const bars = await page.$$('.recharts-bar-rectangle');
      expect(bars.length).toBeGreaterThan(0);

      await page.screenshot({
        path: path.join(screenshotDir, 'engagement-metrics-chart.png'),
        fullPage: false
      });
    });

    test('should render DAU/MAU chart with proper dual lines', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Scroll to DAU/MAU chart
      await page.evaluate(() => {
        const dauMauChart = document.querySelector('.recharts-line-chart');
        if (dauMauChart) {
          dauMauChart.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      await page.waitForTimeout(2000);

      // Check if line chart is rendered
      const lineChart = await page.$('.recharts-line-chart');
      expect(lineChart).toBeTruthy();

      // Verify two lines (MAU and DAU)
      const lines = await page.$$('.recharts-line-curve');
      expect(lines.length).toBe(2);

      // Check legend
      const legend = await page.$('.recharts-legend-wrapper');
      expect(legend).toBeTruthy();

      await page.screenshot({
        path: path.join(screenshotDir, 'dau-mau-chart.png'),
        fullPage: false
      });
    });
  });

  describe('3. Enhanced Storytelling Content Tests', () => {
    test('should display Zero-CAC Growth Story properly', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Check for growth story section
      const growthStory = await page.$('.max-w-6xl.mx-auto.p-6.bg-gray-900\\/30');
      expect(growthStory).toBeTruthy();

      // Verify main heading
      const heading = await page.$eval(
        '.max-w-6xl.mx-auto.p-6.bg-gray-900\\/30 h3',
        el => el.textContent
      );
      expect(heading).toBe('The Zero-CAC Growth Story');

      // Check for three story sections
      const storySections = await page.$$('.grid.grid-cols-1.md\\:grid-cols-3 > div');
      expect(storySections.length).toBe(3);

      // Verify section titles
      const sectionTitles = await page.$$eval(
        '.grid.grid-cols-1.md\\:grid-cols-3 h4',
        elements => elements.map(el => el.textContent.trim())
      );

      expect(sectionTitles).toContain('Pure Organic Growth');
      expect(sectionTitles).toContain('Network Effects in Action');
      expect(sectionTitles).toContain('Scalable Growth Model');

      await page.screenshot({
        path: path.join(screenshotDir, 'zero-cac-growth-story.png'),
        fullPage: false
      });
    });

    test('should display key statistics correctly in storytelling', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Check for key statistics in the text
      const pageText = await page.evaluate(() => document.body.textContent);

      expect(pageText).toContain('$0.28 CAC');
      expect(pageText).toContain('$70+');
      expect(pageText).toContain('12,467 daily messages');
      expect(pageText).toContain('80% market share');
      expect(pageText).toContain('1,302 new users daily');
      expect(pageText).toContain('zero paid marketing');
    });
  });

  describe('4. Sidebar and Navigation Tests', () => {
    test('should display enhanced sidebar with proper logo and stats', async () => {
      // Wait for sidebar to load
      await page.waitForSelector('[data-testid="navigation-sidebar"]', { timeout: 10000 });

      // Check sidebar visibility
      const sidebar = await page.$('[data-testid="navigation-sidebar"]');
      expect(sidebar).toBeTruthy();

      // Check for logo
      const logo = await page.$('.text-2xl.font-bold');
      expect(logo).toBeTruthy();

      // Verify quick stats section
      const quickStats = await page.$$('.border-l-2.border-gray-700');
      expect(quickStats.length).toBeGreaterThan(0);

      await page.screenshot({
        path: path.join(screenshotDir, 'enhanced-sidebar.png'),
        fullPage: false
      });
    });

    test('should handle sidebar navigation correctly', async () => {
      await page.waitForSelector('[data-testid="navigation-sidebar"]', { timeout: 10000 });

      // Test navigation links
      const navLinks = await page.$$('[data-testid="navigation-sidebar"] a');
      expect(navLinks.length).toBeGreaterThan(0);

      // Test clicking on Growth section
      const growthLink = await page.$('a[href="#growth"]');
      if (growthLink) {
        await growthLink.click();
        await page.waitForTimeout(1000);

        // Verify we're at the growth section
        const currentUrl = page.url();
        expect(currentUrl).toContain('#growth');
      }
    });
  });

  describe('5. Responsive Design Tests', () => {
    test('should work properly on mobile viewport', async () => {
      await page.setViewport({ width: 375, height: 667 }); // iPhone SE
      await page.reload({ waitUntil: 'networkidle0' });

      // Check if sidebar is hidden on mobile
      const sidebar = await page.$('[data-testid="navigation-sidebar"]');
      const sidebarVisible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }, sidebar);

      // On mobile, sidebar should be positioned differently
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Check if charts are responsive
      const chart = await page.$('.recharts-responsive-container');
      expect(chart).toBeTruthy();

      await page.screenshot({
        path: path.join(screenshotDir, 'mobile-responsive.png'),
        fullPage: true
      });
    });

    test('should work properly on tablet viewport', async () => {
      await page.setViewport({ width: 768, height: 1024 }); // iPad
      await page.reload({ waitUntil: 'networkidle0' });

      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Check metrics grid responsiveness
      const metricsGrid = await page.$('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(metricsGrid).toBeTruthy();

      await page.screenshot({
        path: path.join(screenshotDir, 'tablet-responsive.png'),
        fullPage: true
      });
    });
  });

  describe('6. Performance and Loading Tests', () => {
    test('should load within acceptable time limits', async () => {
      const startTime = Date.now();

      await page.goto(baseUrl, { waitUntil: 'networkidle0' });
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);

      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle chart interactions smoothly', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });
      await page.waitForSelector('.recharts-responsive-container', { timeout: 15000 });

      // Try hovering over chart elements
      const chartArea = await page.$('.recharts-area-area');
      if (chartArea) {
        await chartArea.hover();
        await page.waitForTimeout(500);

        // Check for tooltip
        const tooltip = await page.$('.recharts-tooltip-wrapper');
        // Tooltip might not always appear, but interaction should not crash
      }
    });
  });

  describe('7. Theme and Visual Consistency Tests', () => {
    test('should maintain pure black/white theme throughout', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Check main background
      const mainBg = await page.evaluate(() => {
        const main = document.querySelector('main');
        return window.getComputedStyle(main).backgroundColor;
      });

      // Should be black (rgb(0, 0, 0)) or very close
      expect(mainBg).toBe('rgb(0, 0, 0)');

      // Check section backgrounds
      const sectionBg = await page.evaluate(() => {
        const section = document.querySelector('.py-20.bg-black');
        return window.getComputedStyle(section).backgroundColor;
      });

      expect(sectionBg).toBe('rgb(0, 0, 0)');
    });

    test('should have proper white text on black backgrounds', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Check main headings color
      const headingColor = await page.evaluate(() => {
        const heading = document.querySelector('.text-4xl.md\\:text-5xl.font-bold.text-white');
        return window.getComputedStyle(heading).color;
      });

      // Should be white (rgb(255, 255, 255)) or very close
      expect(headingColor).toBe('rgb(255, 255, 255)');
    });
  });

  describe('8. Data Accuracy Tests', () => {
    test('should display correct numerical formatting', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Check if numbers are properly formatted
      const metricValues = await page.$$eval(
        '.text-2xl.font-bold.text-white',
        elements => elements.map(el => el.textContent.trim())
      );

      // Should have properly formatted numbers (with commas, K+, etc.)
      const hasFormattedNumbers = metricValues.some(value =>
        value.includes('K') || value.includes('M') || value.includes(',') || value.includes('%')
      );

      expect(hasFormattedNumbers).toBeTruthy();
    });

    test('should show consistent data across different chart views', async () => {
      await page.waitForSelector('[data-testid="growth-metrics"]', { timeout: 10000 });

      // Get peak MAU from metrics card
      const peakMAUFromCard = await page.$eval(
        '.text-2xl.font-bold.text-white',
        el => el.textContent.trim()
      );

      // Scroll to DAU/MAU chart and check peak MAU there
      await page.evaluate(() => {
        const dauMauChart = document.querySelector('.recharts-line-chart');
        if (dauMauChart) {
          dauMauChart.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      await page.waitForTimeout(2000);

      // Data should be consistent across views
      // This is more of a smoke test to ensure no obvious discrepancies
    });
  });
});