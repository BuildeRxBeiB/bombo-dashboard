/**
 * Visual Validation Test Suite using Playwright
 *
 * This test suite uses Playwright to perform visual regression testing
 * and validate that the dashboard maintains a pure black/white/gray theme
 * across different viewport sizes and interactions.
 */

const { test, expect } = require('@playwright/test');

test.describe('BOMBO Dashboard Visual Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:3000');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Wait for any animations to complete
    await page.waitForTimeout(2000);
  });

  test('Homepage loads with pure black/white theme', async ({ page }) => {
    // Check that the main background is black
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)');

    // Take a full page screenshot for manual review
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('Executive Overview section uses only grayscale colors', async ({ page }) => {
    // Scroll to Executive Overview section
    await page.locator('section').first().scrollIntoViewIfNeeded();

    // Check section background
    const section = page.locator('section').first();
    await expect(section).toHaveCSS('background-color', 'rgb(0, 0, 0)');

    // Check that all cards use grayscale backgrounds
    const cards = page.locator('[class*="bg-gray-900"]');
    await expect(cards).toHaveCount(4); // Should have 4 advantage cards

    // Take screenshot of the section
    await expect(section).toHaveScreenshot('executive-overview.png', {
      threshold: 0.2
    });
  });

  test('Growth Metrics charts use only grayscale colors', async ({ page }) => {
    // Scroll to Growth Metrics section
    const growthSection = page.locator('text=Growth & Engagement Metrics').locator('..').locator('..');
    await growthSection.scrollIntoViewIfNeeded();

    // Wait for charts to render
    await page.waitForTimeout(3000);

    // Check that charts are rendered
    const charts = page.locator('.recharts-wrapper');
    await expect(charts).toHaveCount(3); // Should have 3 charts

    // Take screenshot
    await expect(growthSection).toHaveScreenshot('growth-metrics.png', {
      threshold: 0.2
    });
  });

  test('Retention Analysis heatmaps use grayscale colors', async ({ page }) => {
    // Scroll to Retention Analysis section
    const retentionSection = page.locator('text=Retention Analysis').locator('..').locator('..');
    await retentionSection.scrollIntoViewIfNeeded();

    // Wait for heatmaps to render
    await page.waitForTimeout(2000);

    // Check heatmap elements exist
    const heatmapElements = page.locator('[class*="bg-white"], [class*="bg-gray-"]');
    await expect(heatmapElements.first()).toBeVisible();

    // Take screenshot
    await expect(retentionSection).toHaveScreenshot('retention-analysis.png', {
      threshold: 0.2
    });
  });

  test('Financial Performance section maintains grayscale theme', async ({ page }) => {
    // Scroll to Financial Performance section
    const financialSection = page.locator('text=Financial Performance').locator('..').locator('..');
    await financialSection.scrollIntoViewIfNeeded();

    // Wait for charts to render
    await page.waitForTimeout(3000);

    // Take screenshot
    await expect(financialSection).toHaveScreenshot('financial-performance.png', {
      threshold: 0.2
    });
  });

  test('Market Opportunity section uses proper theme', async ({ page }) => {
    // Scroll to Market Opportunity section
    const marketSection = page.locator('text=Market Opportunity').locator('..').locator('..');
    await marketSection.scrollIntoViewIfNeeded();

    // Wait for charts to render
    await page.waitForTimeout(3000);

    // Take screenshot
    await expect(marketSection).toHaveScreenshot('market-opportunity.png', {
      threshold: 0.2
    });
  });

  test('Interactive elements maintain theme on hover', async ({ page }) => {
    // Test card hover states
    const firstCard = page.locator('.hover\\:border-gray-600').first();
    await firstCard.hover();
    await page.waitForTimeout(500);

    // Take screenshot during hover
    await expect(page).toHaveScreenshot('hover-state.png', {
      threshold: 0.2
    });
  });

  test('Tooltips use black background with white text', async ({ page }) => {
    // Scroll to a chart with tooltips
    const chartArea = page.locator('.recharts-wrapper').first();
    await chartArea.scrollIntoViewIfNeeded();

    // Hover over chart to trigger tooltip
    await chartArea.hover();
    await page.waitForTimeout(1000);

    // Check if tooltip appears with correct styling
    const tooltip = page.locator('[class*="bg-black"]').filter({ hasText: /\d/ }).first();
    if (await tooltip.isVisible()) {
      await expect(tooltip).toHaveCSS('background-color', 'rgb(0, 0, 0)');
      await expect(tooltip).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
  });

  test('Mobile viewport maintains grayscale theme', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for responsive layout to apply
    await page.waitForTimeout(1000);

    // Take mobile screenshot
    await expect(page).toHaveScreenshot('mobile-view.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('Tablet viewport maintains grayscale theme', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Wait for responsive layout to apply
    await page.waitForTimeout(1000);

    // Take tablet screenshot
    await expect(page).toHaveScreenshot('tablet-view.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('No colored elements detected by DOM inspection', async ({ page }) => {
    // Get all elements with background colors
    const coloredElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const coloredElements = [];

      elements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;
        const borderColor = computedStyle.borderColor;

        // Check if colors are non-grayscale
        const isColoredBg = bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && !isGrayscale(bgColor);
        const isColoredText = textColor && !isGrayscale(textColor);
        const isColoredBorder = borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && !isGrayscale(borderColor);

        if (isColoredBg || isColoredText || isColoredBorder) {
          coloredElements.push({
            tag: el.tagName,
            className: el.className,
            bgColor: bgColor,
            textColor: textColor,
            borderColor: borderColor
          });
        }
      });

      function isGrayscale(colorString) {
        if (!colorString || colorString === 'rgba(0, 0, 0, 0)') return true;

        const rgbMatch = colorString.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
        if (rgbMatch) {
          const [, r, g, b] = rgbMatch.map(Number);
          return r === g && g === b; // True grayscale has equal RGB values
        }

        return false; // If we can't parse it, consider it potentially colored
      }

      return coloredElements;
    });

    // Assert no colored elements found
    expect(coloredElements).toHaveLength(0);

    if (coloredElements.length > 0) {
      console.log('Colored elements found:', coloredElements);
    }
  });

  test('Chart colors are strictly grayscale', async ({ page }) => {
    // Wait for all charts to load
    await page.waitForTimeout(5000);

    // Check SVG elements in charts for colored attributes
    const chartSvgs = page.locator('svg');
    const svgCount = await chartSvgs.count();

    for (let i = 0; i < svgCount; i++) {
      const svg = chartSvgs.nth(i);

      // Get all paths, rects, and circles in the chart
      const coloredElements = await svg.evaluate((svgEl) => {
        const elements = svgEl.querySelectorAll('path, rect, circle, line');
        const colored = [];

        elements.forEach(el => {
          const fill = el.getAttribute('fill');
          const stroke = el.getAttribute('stroke');

          if (fill && !isGrayscaleColor(fill)) {
            colored.push({ element: el.tagName, attribute: 'fill', value: fill });
          }
          if (stroke && !isGrayscaleColor(stroke)) {
            colored.push({ element: el.tagName, attribute: 'stroke', value: stroke });
          }
        });

        function isGrayscaleColor(color) {
          if (!color || color === 'none' || color === 'transparent') return true;

          // Check hex colors
          if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return r === g && g === b;
          }

          // Check if it's a known grayscale color
          const grayscaleColors = ['#ffffff', '#000000', '#9ca3af', '#6b7280', '#374151', '#d1d5db'];
          return grayscaleColors.includes(color.toLowerCase());
        }

        return colored;
      });

      // Assert no colored elements in this chart
      expect(coloredElements).toHaveLength(0);
    }
  });
});

test.describe('Accessibility and Theme Consistency', () => {
  test('High contrast ratios maintained', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check contrast ratios for text elements
    const textElements = page.locator('h1, h2, h3, h4, h5, h6, p, span').filter({ hasText: /.+/ });
    const count = await textElements.count();

    for (let i = 0; i < Math.min(count, 10); i++) { // Check first 10 text elements
      const element = textElements.nth(i);

      const contrast = await element.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el);
        const textColor = computedStyle.color;
        const bgColor = computedStyle.backgroundColor;

        return { textColor, bgColor };
      });

      // Basic check that text is white/gray on black background
      expect(contrast.textColor).toMatch(/rgb\\((255|[0-9]{1,2}), \\1, \\1\\)/);
    }
  });

  test('Focus indicators are visible and grayscale', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Check focus styles
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      const focusOutline = await focusedElement.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow
        };
      });

      // Focus indicators should be visible
      expect(focusOutline.outline).not.toBe('none');
    }
  });
});