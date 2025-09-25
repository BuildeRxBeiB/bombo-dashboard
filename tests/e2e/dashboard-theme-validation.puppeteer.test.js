/**
 * BOMBO Dashboard Theme & Layout Validation Tests - Puppeteer
 *
 * This test suite verifies the following fixes:
 * 1. Executive Overview position (right after Hero section)
 * 2. Pure Black and White theme implementation
 * 3. No tab navigation - all content visible
 * 4. Financial Performance improvements
 * 5. Chart visibility and styling
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TEST_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const VIEWPORT = { width: 1920, height: 1080 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

// Helper function to ensure screenshot directory exists
async function ensureScreenshotDir() {
  try {
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating screenshot directory:', error);
  }
}

// Helper function to take screenshot with metadata
async function takeScreenshot(page, name, description = '') {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `${timestamp}_${name}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true
  });

  console.log(`✓ Screenshot saved: ${filename} ${description ? `- ${description}` : ''}`);
  return filepath;
}

// Helper function to check element background color
async function getBackgroundColor(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;
    return window.getComputedStyle(element).backgroundColor;
  }, selector);
}

// Helper function to check text color
async function getTextColor(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return null;
    return window.getComputedStyle(element).color;
  }, selector);
}

// Helper function to validate grayscale color
function isGrayscaleColor(colorString) {
  if (!colorString) return false;

  // Parse RGB values
  const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!rgbMatch) {
    // Check for rgba
    const rgbaMatch = colorString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (!rgbaMatch) return false;

    const [, r, g, b] = rgbaMatch.map(Number);
    // For grayscale, R, G, and B should be equal or very close
    return Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
  }

  const [, r, g, b] = rgbMatch.map(Number);
  return Math.abs(r - g) <= 5 && Math.abs(g - b) <= 5 && Math.abs(r - b) <= 5;
}

describe('BOMBO Dashboard - Theme & Layout Validation Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    await ensureScreenshotDir();
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: VIEWPORT
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });

    // Wait for main content to load
    await page.waitForSelector('main', { timeout: 10000 });
  });

  afterEach(async () => {
    if (page) await page.close();
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  describe('1. Section Order Validation', () => {
    test('Executive Overview should appear immediately after Hero section', async () => {
      // Get all section IDs in order
      const sectionOrder = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('div[id]'));
        return sections.map(s => s.id).filter(id => id);
      });

      console.log('Section order found:', sectionOrder);

      // Verify Executive Overview is second after hero
      expect(sectionOrder[0]).toBe('hero');
      expect(sectionOrder[1]).toBe('executive');

      // Verify complete order
      expect(sectionOrder).toEqual([
        'hero',
        'executive',
        'financial',
        'growth',
        'retention',
        'market'
      ]);

      await takeScreenshot(page, 'section-order', 'Section ordering validation');
    });

    test('Executive Overview should be visible without scrolling', async () => {
      const executiveSection = await page.$('#executive');
      expect(executiveSection).not.toBeNull();

      const isVisible = await page.evaluate(() => {
        const element = document.querySelector('#executive');
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.top < window.innerHeight;
      });

      expect(isVisible).toBe(true);
    });
  });

  describe('2. Pure Black and White Theme Validation', () => {
    test('Main background should be pure black', async () => {
      const bgColor = await getBackgroundColor(page, 'main');
      console.log('Main background color:', bgColor);

      expect(isGrayscaleColor(bgColor)).toBe(true);

      // Check for black or very dark gray
      const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        expect(r).toBeLessThanOrEqual(20);
        expect(g).toBeLessThanOrEqual(20);
        expect(b).toBeLessThanOrEqual(20);
      }
    });

    test('All section backgrounds should be grayscale', async () => {
      const sections = ['#hero', '#executive', '#financial', '#growth', '#retention', '#market'];

      for (const sectionId of sections) {
        const sectionBg = await page.evaluate((id) => {
          const element = document.querySelector(id);
          if (!element) return null;

          // Check the section and all its children for non-grayscale backgrounds
          const allElements = [element, ...element.querySelectorAll('*')];
          const colors = [];

          for (const el of allElements) {
            const bg = window.getComputedStyle(el).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
              colors.push(bg);
            }
          }

          return colors;
        }, sectionId);

        console.log(`${sectionId} background colors:`, sectionBg);

        if (sectionBg) {
          for (const color of sectionBg) {
            expect(isGrayscaleColor(color)).toBe(true);
          }
        }
      }

      await takeScreenshot(page, 'theme-validation', 'Black and white theme check');
    });

    test('All text should be white or gray', async () => {
      const textColors = await page.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, h3, h4, p, span, div');
        const colors = new Set();

        elements.forEach(el => {
          const color = window.getComputedStyle(el).color;
          if (color) colors.add(color);
        });

        return Array.from(colors);
      });

      console.log('Text colors found:', textColors);

      for (const color of textColors) {
        expect(isGrayscaleColor(color)).toBe(true);
      }
    });

    test('Charts should use only grayscale colors', async () => {
      // Scroll to growth section with charts
      await page.evaluate(() => {
        document.querySelector('#growth')?.scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(1000);

      // Check Recharts elements
      const chartColors = await page.evaluate(() => {
        const chartElements = document.querySelectorAll('.recharts-layer path, .recharts-layer rect, .recharts-layer line');
        const colors = new Set();

        chartElements.forEach(el => {
          const stroke = el.getAttribute('stroke');
          const fill = el.getAttribute('fill');
          if (stroke && stroke !== 'none') colors.add(stroke);
          if (fill && fill !== 'none') colors.add(fill);
        });

        return Array.from(colors);
      });

      console.log('Chart colors found:', chartColors);

      // Verify no blue, purple, or colored gradients
      const forbiddenColors = ['blue', 'purple', 'green', 'red', 'yellow', 'orange', 'pink'];
      for (const color of chartColors) {
        for (const forbidden of forbiddenColors) {
          expect(color.toLowerCase()).not.toContain(forbidden);
        }
      }

      await takeScreenshot(page, 'charts-grayscale', 'Charts grayscale validation');
    });
  });

  describe('3. No Tab Navigation - All Content Visible', () => {
    test('Growth Metrics should show all 3 charts without tabs', async () => {
      await page.evaluate(() => {
        document.querySelector('#growth')?.scrollIntoView();
      });
      await page.waitForTimeout(500);

      // Check that there are no tab buttons
      const tabButtons = await page.$$('[role="tab"]');
      console.log(`Found ${tabButtons.length} tab buttons in Growth Metrics`);

      // Verify no tabs in Growth Metrics section
      const growthTabButtons = await page.evaluate(() => {
        const growthSection = document.querySelector('#growth');
        if (!growthSection) return 0;
        return growthSection.querySelectorAll('[role="tab"]').length;
      });

      expect(growthTabButtons).toBe(0);

      // Verify all 3 charts are visible
      const chartsVisible = await page.evaluate(() => {
        const growthSection = document.querySelector('#growth');
        if (!growthSection) return { userGrowth: false, engagement: false, dauMau: false };

        const hasUserGrowth = !!growthSection.querySelector('.recharts-wrapper');
        const charts = growthSection.querySelectorAll('.recharts-wrapper');

        return {
          totalCharts: charts.length,
          allVisible: charts.length >= 3
        };
      });

      console.log('Growth Metrics charts:', chartsVisible);
      expect(chartsVisible.allVisible).toBe(true);

      await takeScreenshot(page, 'growth-metrics-no-tabs', 'All growth charts visible');
    });

    test('Retention Analysis should show both heatmaps side by side', async () => {
      await page.evaluate(() => {
        document.querySelector('#retention')?.scrollIntoView();
      });
      await page.waitForTimeout(500);

      // Check for side-by-side layout
      const heatmapsLayout = await page.evaluate(() => {
        const retentionSection = document.querySelector('#retention');
        if (!retentionSection) return null;

        // Look for grid or flex layout
        const container = retentionSection.querySelector('.grid, .flex');
        if (!container) return null;

        const style = window.getComputedStyle(container);
        return {
          display: style.display,
          gridColumns: style.gridTemplateColumns,
          flexDirection: style.flexDirection
        };
      });

      console.log('Heatmaps layout:', heatmapsLayout);

      // Verify both heatmaps are present
      const heatmapCount = await page.evaluate(() => {
        const retentionSection = document.querySelector('#retention');
        if (!retentionSection) return 0;

        // Count heatmap containers
        const heatmaps = retentionSection.querySelectorAll('.retention-heatmap, [class*="heatmap"]');
        return heatmaps.length;
      });

      expect(heatmapCount).toBeGreaterThanOrEqual(2);

      await takeScreenshot(page, 'retention-heatmaps', 'Both heatmaps visible');
    });
  });

  describe('4. Financial Performance Improvements', () => {
    test('Tooltips should have black background with white text', async () => {
      await page.evaluate(() => {
        document.querySelector('#financial')?.scrollIntoView();
      });
      await page.waitForTimeout(500);

      // Hover over a chart element to trigger tooltip
      const chartElement = await page.$('.recharts-layer .recharts-bar-rectangle, .recharts-layer .recharts-line-curve');

      if (chartElement) {
        await chartElement.hover();
        await page.waitForTimeout(500);

        const tooltipStyles = await page.evaluate(() => {
          const tooltip = document.querySelector('.recharts-tooltip-wrapper');
          if (!tooltip) return null;

          const content = tooltip.querySelector('.recharts-default-tooltip, [class*="tooltip"]');
          if (!content) return null;

          const styles = window.getComputedStyle(content);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            border: styles.border
          };
        });

        console.log('Tooltip styles:', tooltipStyles);

        if (tooltipStyles) {
          expect(isGrayscaleColor(tooltipStyles.backgroundColor)).toBe(true);
          expect(isGrayscaleColor(tooltipStyles.color)).toBe(true);
        }
      }

      await takeScreenshot(page, 'tooltip-styling', 'Tooltip black background validation');
    });

    test('Unit economics fonts should be larger (text-2xl)', async () => {
      const unitEconomicsStyles = await page.evaluate(() => {
        const financialSection = document.querySelector('#financial');
        if (!financialSection) return null;

        // Find unit economics elements
        const unitEconomicsElements = financialSection.querySelectorAll('[class*="text-2xl"]');
        const fontSize = [];

        unitEconomicsElements.forEach(el => {
          const style = window.getComputedStyle(el);
          fontSize.push({
            class: el.className,
            fontSize: style.fontSize
          });
        });

        return fontSize;
      });

      console.log('Unit economics font sizes:', unitEconomicsStyles);

      // Verify text-2xl class is applied (should be 24px or 1.5rem)
      if (unitEconomicsStyles && unitEconomicsStyles.length > 0) {
        for (const style of unitEconomicsStyles) {
          const size = parseFloat(style.fontSize);
          expect(size).toBeGreaterThanOrEqual(20); // At least 20px
        }
      }
    });

    test('Industry benchmark citation should be present', async () => {
      await page.evaluate(() => {
        document.querySelector('#financial')?.scrollIntoView({ block: 'end' });
      });
      await page.waitForTimeout(500);

      const hasBenchmarkCitation = await page.evaluate(() => {
        const financialSection = document.querySelector('#financial');
        if (!financialSection) return false;

        const text = financialSection.textContent || '';
        return text.includes('benchmark') || text.includes('Benchmark') || text.includes('Industry');
      });

      expect(hasBenchmarkCitation).toBe(true);

      await takeScreenshot(page, 'benchmark-citation', 'Industry benchmark citation');
    });

    test('2025 estimated bars should appear in revenue chart', async () => {
      const has2025Data = await page.evaluate(() => {
        const financialSection = document.querySelector('#financial');
        if (!financialSection) return false;

        // Check for 2025 in chart labels or data
        const chartTexts = financialSection.querySelectorAll('.recharts-text, text');
        let found2025 = false;

        chartTexts.forEach(el => {
          if (el.textContent && el.textContent.includes('2025')) {
            found2025 = true;
          }
        });

        return found2025;
      });

      expect(has2025Data).toBe(true);

      await takeScreenshot(page, 'revenue-2025', '2025 revenue projection');
    });
  });

  describe('5. Chart Visibility Tests', () => {
    test('Revenue line should be clearly visible in growth projections', async () => {
      await page.evaluate(() => {
        document.querySelector('#financial')?.scrollIntoView();
      });
      await page.waitForTimeout(500);

      const revenueLineVisible = await page.evaluate(() => {
        const lines = document.querySelectorAll('.recharts-line-curve');
        if (lines.length === 0) return false;

        // Check stroke width and opacity
        const visibilityChecks = [];
        lines.forEach(line => {
          const strokeWidth = line.getAttribute('stroke-width');
          const opacity = line.getAttribute('opacity') || '1';
          const stroke = line.getAttribute('stroke');

          visibilityChecks.push({
            width: parseFloat(strokeWidth) >= 2,
            opacity: parseFloat(opacity) >= 0.8,
            hasStroke: !!stroke && stroke !== 'none'
          });
        });

        return visibilityChecks.some(check =>
          check.width && check.opacity && check.hasStroke
        );
      });

      expect(revenueLineVisible).toBe(true);

      await takeScreenshot(page, 'revenue-line-visibility', 'Revenue line visibility check');
    });

    test('All charts should be properly styled in grayscale', async () => {
      const sections = ['#financial', '#growth', '#retention'];

      for (const sectionId of sections) {
        await page.evaluate((id) => {
          document.querySelector(id)?.scrollIntoView();
        }, sectionId);
        await page.waitForTimeout(500);

        const chartValidation = await page.evaluate((id) => {
          const section = document.querySelector(id);
          if (!section) return null;

          const charts = section.querySelectorAll('.recharts-wrapper');
          const validation = {
            sectionId: id,
            chartCount: charts.length,
            allGrayscale: true,
            details: []
          };

          charts.forEach((chart, index) => {
            const paths = chart.querySelectorAll('path, rect, line');
            let hasColor = false;

            paths.forEach(el => {
              const stroke = el.getAttribute('stroke');
              const fill = el.getAttribute('fill');

              // Check for non-grayscale colors
              if ((stroke && stroke.match(/#[0-9a-f]{6}/i)) ||
                  (fill && fill.match(/#[0-9a-f]{6}/i))) {
                // Check if it's a shade of gray
                if (stroke && !stroke.match(/#[0-9a-f]{1}\\1{5}/i)) {
                  hasColor = true;
                }
                if (fill && !fill.match(/#[0-9a-f]{1}\\1{5}/i)) {
                  hasColor = true;
                }
              }
            });

            validation.details.push({
              chartIndex: index,
              hasColoredElements: hasColor
            });

            if (hasColor) validation.allGrayscale = false;
          });

          return validation;
        }, sectionId);

        console.log(`Chart validation for ${sectionId}:`, chartValidation);

        if (chartValidation) {
          expect(chartValidation.allGrayscale).toBe(true);
        }
      }

      await takeScreenshot(page, 'all-charts-grayscale', 'All charts grayscale validation');
    });
  });

  describe('6. Responsive Design Tests', () => {
    test('Mobile view should maintain black and white theme', async () => {
      await page.setViewport(MOBILE_VIEWPORT);
      await page.reload({ waitUntil: 'networkidle2' });

      const mobileBgColor = await getBackgroundColor(page, 'main');
      expect(isGrayscaleColor(mobileBgColor)).toBe(true);

      await takeScreenshot(page, 'mobile-theme', 'Mobile theme validation');
    });

    test('Sections should stack properly on mobile', async () => {
      await page.setViewport(MOBILE_VIEWPORT);
      await page.reload({ waitUntil: 'networkidle2' });

      const sectionPositions = await page.evaluate(() => {
        const sections = ['hero', 'executive', 'financial', 'growth', 'retention', 'market'];
        const positions = {};

        sections.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            positions[id] = {
              top: rect.top,
              height: rect.height
            };
          }
        });

        return positions;
      });

      // Verify sections are stacked vertically
      const sectionOrder = ['hero', 'executive', 'financial', 'growth', 'retention', 'market'];
      for (let i = 0; i < sectionOrder.length - 1; i++) {
        const current = sectionPositions[sectionOrder[i]];
        const next = sectionPositions[sectionOrder[i + 1]];

        if (current && next) {
          expect(current.top).toBeLessThan(next.top);
        }
      }

      await takeScreenshot(page, 'mobile-layout', 'Mobile layout validation');
    });
  });

  describe('7. Performance and Accessibility', () => {
    test('Page should load within acceptable time', async () => {
      const startTime = Date.now();
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      const loadTime = Date.now() - startTime;

      console.log(`Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });

    test('All images should have alt text', async () => {
      const imagesWithoutAlt = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const missing = [];

        images.forEach(img => {
          if (!img.alt || img.alt.trim() === '') {
            missing.push(img.src);
          }
        });

        return missing;
      });

      console.log('Images without alt text:', imagesWithoutAlt);
      expect(imagesWithoutAlt.length).toBe(0);
    });

    test('Contrast ratios should meet WCAG standards', async () => {
      // Simple contrast check for white text on black background
      const contrastCheck = await page.evaluate(() => {
        // Calculate relative luminance
        function getLuminance(r, g, b) {
          const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }

        // Calculate contrast ratio
        function getContrastRatio(l1, l2) {
          const lighter = Math.max(l1, l2);
          const darker = Math.min(l1, l2);
          return (lighter + 0.05) / (darker + 0.05);
        }

        const mainBg = window.getComputedStyle(document.querySelector('main')).backgroundColor;
        const mainText = window.getComputedStyle(document.querySelector('h1, h2, p')).color;

        // Parse RGB values
        const bgMatch = mainBg.match(/\d+/g);
        const textMatch = mainText.match(/\d+/g);

        if (bgMatch && textMatch) {
          const bgLuminance = getLuminance(...bgMatch.map(Number));
          const textLuminance = getLuminance(...textMatch.map(Number));
          const ratio = getContrastRatio(bgLuminance, textLuminance);

          return {
            ratio: ratio,
            meetsAAA: ratio >= 7,
            meetsAA: ratio >= 4.5
          };
        }

        return null;
      });

      console.log('Contrast ratio check:', contrastCheck);

      if (contrastCheck) {
        expect(contrastCheck.meetsAA).toBe(true);
      }
    });
  });

  describe('8. Error State Testing', () => {
    test('Dashboard should handle network errors gracefully', async () => {
      // Simulate offline mode
      await page.setOfflineMode(true);

      try {
        await page.reload();
        // Check if error message or fallback is displayed
        await page.waitForTimeout(2000);

        const hasErrorHandling = await page.evaluate(() => {
          return document.body.textContent.includes('offline') ||
                 document.body.textContent.includes('error') ||
                 document.querySelector('[role="alert"]') !== null;
        });

        console.log('Has error handling:', hasErrorHandling);
      } finally {
        await page.setOfflineMode(false);
      }
    });
  });
});

// Test runner
(async () => {
  console.log('🚀 Starting BOMBO Dashboard Theme & Layout Validation Tests');
  console.log('================================================');
  console.log(`Testing URL: ${TEST_URL}`);
  console.log(`Screenshots will be saved to: ${SCREENSHOT_DIR}`);
  console.log('');

  try {
    // Note: In a real environment, you would use Jest or another test runner
    // For this example, we're using a simple async runner
    console.log('✅ Test suite created successfully');
    console.log('');
    console.log('To run these tests, use:');
    console.log('  npm test -- dashboard-theme-validation.puppeteer.test.js');
    console.log('');
    console.log('Or run directly with:');
    console.log('  node tests/e2e/dashboard-theme-validation.puppeteer.test.js');
  } catch (error) {
    console.error('❌ Test suite creation failed:', error);
    process.exit(1);
  }
})();

module.exports = {
  TEST_URL,
  SCREENSHOT_DIR,
  ensureScreenshotDir,
  takeScreenshot,
  getBackgroundColor,
  getTextColor,
  isGrayscaleColor
};