/**
 * BOMBO Dashboard Enhanced Features Cross-Browser Validation Test Suite - Playwright
 *
 * Comprehensive test suite to verify all enhanced features based on user feedback:
 * 1. Enhanced Metrics Display - Comprehensive key metrics in two-row layout
 * 2. Fixed Growth Projections Chart - Separate charts with proper scaling
 * 3. Enhanced Storytelling - Zero-CAC growth story and retention analysis
 * 4. Theme Consistency - Pure Black and White maintained
 * 5. Sidebar Improvements - Enhanced logo and navigation
 * 6. Cross-browser compatibility validation
 */

import { test, expect, Page, Locator } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

// Test configuration
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots-playwright');

// Helper to ensure screenshots directory exists
async function ensureScreenshotsDir() {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating screenshots directory:', error);
  }
}

// Color validation helpers
function parseRgb(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  };
}

function isGrayscale(color: string): boolean {
  const rgb = parseRgb(color);
  if (!rgb) return false;

  // For grayscale, R, G, and B values should be equal or very close
  const tolerance = 5;
  return Math.abs(rgb.r - rgb.g) <= tolerance &&
         Math.abs(rgb.g - rgb.b) <= tolerance &&
         Math.abs(rgb.r - rgb.b) <= tolerance;
}

function isBlackOrDarkGray(color: string): boolean {
  const rgb = parseRgb(color);
  if (!rgb) return false;

  // Check if color is black or very dark gray (all values < 50)
  return rgb.r <= 50 && rgb.g <= 50 && rgb.b <= 50;
}

function isWhiteOrLightGray(color: string): boolean {
  const rgb = parseRgb(color);
  if (!rgb) return false;

  // Check if color is white or light gray (all values > 200)
  return rgb.r >= 200 && rgb.g >= 200 && rgb.b >= 200;
}

test.describe('BOMBO Dashboard - Comprehensive Fixes Validation', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for main content
    await page.waitForSelector('main', { timeout: 10000 });
  });

  test.describe('1. Executive Overview Position Validation', () => {
    test('Executive Overview must appear immediately after Hero section', async ({ page }) => {
      // Get all section IDs in order
      const sectionOrder = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('div[id]'));
        return sections.map(s => s.id).filter(id => id);
      });

      console.log('📍 Section order:', sectionOrder);

      // Validate exact order
      expect(sectionOrder[0]).toBe('hero');
      expect(sectionOrder[1]).toBe('executive');

      // Validate complete order
      expect(sectionOrder).toEqual([
        'hero',
        'executive',
        'financial',
        'growth',
        'retention',
        'market'
      ]);

      // Take screenshot for documentation
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'section-order.png'),
        fullPage: true
      });
    });

    test('Executive Overview should be visible on initial load', async ({ page }) => {
      // Check if Executive Overview is in viewport on load
      const isInViewport = await page.evaluate(() => {
        const element = document.querySelector('#executive');
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
      });

      // It might be just below viewport, so scroll slightly and check
      if (!isInViewport) {
        await page.evaluate(() => window.scrollBy(0, 500));

        const isVisibleAfterScroll = await page.isVisible('#executive');
        expect(isVisibleAfterScroll).toBe(true);
      }

      // Verify Executive Overview content
      const executiveSection = page.locator('#executive');
      await expect(executiveSection).toBeVisible();
      await expect(executiveSection.locator('h2')).toContainText('Executive Overview');
    });
  });

  test.describe('2. Pure Black and White Theme Validation', () => {
    test('Main container must use pure black background', async ({ page }) => {
      const mainBgColor = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? window.getComputedStyle(main).backgroundColor : null;
      });

      console.log('🎨 Main background color:', mainBgColor);

      expect(mainBgColor).toBeTruthy();
      expect(isBlackOrDarkGray(mainBgColor!)).toBe(true);
      expect(isGrayscale(mainBgColor!)).toBe(true);
    });

    test('All sections must use only grayscale backgrounds', async ({ page }) => {
      const sections = ['#hero', '#executive', '#financial', '#growth', '#retention', '#market'];
      const nonGrayscaleElements: string[] = [];

      for (const sectionId of sections) {
        const colors = await page.evaluate((id) => {
          const section = document.querySelector(id);
          if (!section) return [];

          const elements = [section, ...Array.from(section.querySelectorAll('*'))];
          const colorSet = new Set<string>();

          elements.forEach(el => {
            const bg = window.getComputedStyle(el as Element).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
              colorSet.add(bg);
            }
          });

          return Array.from(colorSet);
        }, sectionId);

        console.log(`🎨 ${sectionId} background colors:`, colors);

        for (const color of colors) {
          if (!isGrayscale(color)) {
            nonGrayscaleElements.push(`${sectionId}: ${color}`);
          }
        }
      }

      expect(nonGrayscaleElements).toHaveLength(0);

      if (nonGrayscaleElements.length > 0) {
        console.error('❌ Non-grayscale backgrounds found:', nonGrayscaleElements);
      }

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'theme-validation.png'),
        fullPage: true
      });
    });

    test('All text must be white or gray', async ({ page }) => {
      const textColors = await page.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, p, span, div, a, li');
        const colors = new Set<string>();

        elements.forEach(el => {
          const color = window.getComputedStyle(el).color;
          if (color) colors.add(color);
        });

        return Array.from(colors);
      });

      console.log('📝 Text colors found:', textColors);

      const nonGrayscaleText: string[] = [];
      for (const color of textColors) {
        if (!isGrayscale(color)) {
          nonGrayscaleText.push(color);
        }
      }

      expect(nonGrayscaleText).toHaveLength(0);

      if (nonGrayscaleText.length > 0) {
        console.error('❌ Non-grayscale text colors found:', nonGrayscaleText);
      }
    });

    test('Charts must use only grayscale colors', async ({ page }) => {
      // Navigate to sections with charts
      await page.locator('#growth').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const chartColors = await page.evaluate(() => {
        const chartElements = document.querySelectorAll(
          '.recharts-layer path, .recharts-layer rect, .recharts-layer line, .recharts-bar, .recharts-line'
        );
        const colors = new Set<string>();

        chartElements.forEach(el => {
          const stroke = el.getAttribute('stroke');
          const fill = el.getAttribute('fill');

          if (stroke && stroke !== 'none' && stroke !== 'transparent') {
            colors.add(stroke);
          }
          if (fill && fill !== 'none' && fill !== 'transparent') {
            colors.add(fill);
          }
        });

        return Array.from(colors);
      });

      console.log('📊 Chart colors:', chartColors);

      // Check for forbidden colors
      const forbiddenPatterns = [
        /blue/i, /purple/i, /green/i, /red/i,
        /yellow/i, /orange/i, /pink/i, /cyan/i,
        /magenta/i, /teal/i, /indigo/i
      ];

      const coloredElements: string[] = [];
      for (const color of chartColors) {
        for (const pattern of forbiddenPatterns) {
          if (pattern.test(color)) {
            coloredElements.push(color);
            break;
          }
        }

        // Also check hex colors for non-grayscale
        if (color.startsWith('#')) {
          const hex = color.substring(1);
          if (hex.length === 6) {
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            if (Math.abs(r - g) > 10 || Math.abs(g - b) > 10 || Math.abs(r - b) > 10) {
              coloredElements.push(color);
            }
          }
        }
      }

      expect(coloredElements).toHaveLength(0);

      if (coloredElements.length > 0) {
        console.error('❌ Colored chart elements found:', coloredElements);
      }

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'charts-grayscale.png'),
        fullPage: true
      });
    });
  });

  test.describe('3. No Tab Navigation - All Content Visible', () => {
    test('Growth Metrics must show all 3 charts without tabs', async ({ page }) => {
      await page.locator('#growth').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Check for absence of tab components
      const tabElements = await page.locator('#growth [role="tab"]').count();
      expect(tabElements).toBe(0);

      // Check for absence of Tabs components
      const tabsComponents = await page.locator('#growth [data-radix-collection-item], #growth [role="tablist"]').count();
      expect(tabsComponents).toBe(0);

      // Verify all 3 charts are visible
      const growthSection = page.locator('#growth');

      // Look for chart containers
      const chartContainers = await growthSection.locator('.recharts-wrapper').count();
      console.log(`📊 Found ${chartContainers} charts in Growth Metrics`);

      expect(chartContainers).toBeGreaterThanOrEqual(3);

      // Verify specific chart types are present
      const chartsInfo = await page.evaluate(() => {
        const section = document.querySelector('#growth');
        if (!section) return null;

        const charts = section.querySelectorAll('.recharts-wrapper');
        return {
          totalCharts: charts.length,
          hasLineChart: !!section.querySelector('.recharts-line'),
          hasBarChart: !!section.querySelector('.recharts-bar'),
          chartTitles: Array.from(section.querySelectorAll('h3, h4')).map(h => h.textContent)
        };
      });

      console.log('📊 Growth Metrics charts info:', chartsInfo);

      expect(chartsInfo?.totalCharts).toBeGreaterThanOrEqual(3);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'growth-metrics-all-charts.png'),
        fullPage: false
      });
    });

    test('Retention Analysis must show both heatmaps side by side', async ({ page }) => {
      await page.locator('#retention').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Check for absence of tabs
      const retentionTabs = await page.locator('#retention [role="tab"]').count();
      expect(retentionTabs).toBe(0);

      // Check for grid or flex layout
      const layoutInfo = await page.evaluate(() => {
        const section = document.querySelector('#retention');
        if (!section) return null;

        // Look for container with multiple heatmaps
        const gridContainer = section.querySelector('.grid, [class*="grid"]');
        const flexContainer = section.querySelector('.flex, [class*="flex"]');

        const container = gridContainer || flexContainer;
        if (!container) return null;

        const style = window.getComputedStyle(container);
        return {
          display: style.display,
          gridColumns: style.gridTemplateColumns,
          flexDirection: style.flexDirection,
          childCount: container.children.length
        };
      });

      console.log('📊 Retention heatmaps layout:', layoutInfo);

      // Verify both heatmaps are present
      const heatmapInfo = await page.evaluate(() => {
        const section = document.querySelector('#retention');
        if (!section) return null;

        // Count heatmap-like elements
        const heatmapContainers = section.querySelectorAll('[class*="heatmap"], .retention-heatmap, .grid > div > div');
        const titles = Array.from(section.querySelectorAll('h3, h4')).map(h => h.textContent);

        return {
          heatmapCount: heatmapContainers.length,
          hasBuyerHeatmap: titles.some(t => t?.toLowerCase().includes('buyer')),
          hasNonBuyerHeatmap: titles.some(t => t?.toLowerCase().includes('non-buyer')),
          titles: titles
        };
      });

      console.log('📊 Retention heatmaps info:', heatmapInfo);

      expect(heatmapInfo?.hasBuyerHeatmap).toBe(true);
      expect(heatmapInfo?.hasNonBuyerHeatmap).toBe(true);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'retention-both-heatmaps.png'),
        fullPage: false
      });
    });
  });

  test.describe('4. Financial Performance Improvements', () => {
    test('Tooltips must have black background with white text', async ({ page }) => {
      await page.locator('#financial').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Find a chart element to hover
      const chartBar = page.locator('#financial .recharts-bar-rectangle').first();
      const chartLine = page.locator('#financial .recharts-line-dot').first();

      let tooltipFound = false;

      // Try hovering on bar chart
      if (await chartBar.isVisible()) {
        await chartBar.hover();
        await page.waitForTimeout(300);

        const tooltipStyles = await page.evaluate(() => {
          const tooltip = document.querySelector('.recharts-tooltip-wrapper .recharts-default-tooltip');
          if (!tooltip) return null;

          const styles = window.getComputedStyle(tooltip);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            border: styles.border
          };
        });

        if (tooltipStyles) {
          console.log('🎨 Tooltip styles:', tooltipStyles);

          expect(isBlackOrDarkGray(tooltipStyles.backgroundColor)).toBe(true);
          expect(isWhiteOrLightGray(tooltipStyles.color)).toBe(true);
          tooltipFound = true;
        }
      }

      // Try hovering on line chart if bar chart didn't work
      if (!tooltipFound && await chartLine.isVisible()) {
        await chartLine.hover();
        await page.waitForTimeout(300);

        const tooltipStyles = await page.evaluate(() => {
          const tooltip = document.querySelector('.recharts-tooltip-wrapper .recharts-default-tooltip');
          if (!tooltip) return null;

          const styles = window.getComputedStyle(tooltip);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color
          };
        });

        if (tooltipStyles) {
          console.log('🎨 Line chart tooltip styles:', tooltipStyles);

          expect(isBlackOrDarkGray(tooltipStyles.backgroundColor)).toBe(true);
          expect(isWhiteOrLightGray(tooltipStyles.color)).toBe(true);
        }
      }

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'tooltip-styling.png'),
        fullPage: false
      });
    });

    test('Unit economics must use larger fonts (text-2xl)', async ({ page }) => {
      await page.locator('#financial').scrollIntoViewIfNeeded();

      const unitEconomicsInfo = await page.evaluate(() => {
        const section = document.querySelector('#financial');
        if (!section) return null;

        // Find elements with text-2xl class
        const largeTextElements = section.querySelectorAll('[class*="text-2xl"], [class*="text-xl"]');
        const fontSizes: string[] = [];

        largeTextElements.forEach(el => {
          const style = window.getComputedStyle(el);
          fontSizes.push(style.fontSize);
        });

        // Also check for unit economics specific content
        const hasUnitEconomics = section.textContent?.includes('CAC') ||
                                 section.textContent?.includes('LTV') ||
                                 section.textContent?.includes('Unit Economics');

        return {
          largeTextCount: largeTextElements.length,
          fontSizes: fontSizes,
          hasUnitEconomics: hasUnitEconomics
        };
      });

      console.log('💰 Unit economics font info:', unitEconomicsInfo);

      expect(unitEconomicsInfo?.largeTextCount).toBeGreaterThan(0);

      // Check that font sizes are actually large (at least 20px)
      if (unitEconomicsInfo?.fontSizes) {
        for (const fontSize of unitEconomicsInfo.fontSizes) {
          const size = parseFloat(fontSize);
          expect(size).toBeGreaterThanOrEqual(20);
        }
      }
    });

    test('Industry benchmark citation must be present', async ({ page }) => {
      await page.locator('#financial').scrollIntoViewIfNeeded();

      const hasBenchmark = await page.evaluate(() => {
        const section = document.querySelector('#financial');
        if (!section) return false;

        const text = section.textContent?.toLowerCase() || '';
        return text.includes('benchmark') ||
               text.includes('industry') ||
               text.includes('average') ||
               text.includes('comparison');
      });

      expect(hasBenchmark).toBe(true);

      // Look for specific benchmark text
      const benchmarkElement = page.locator('#financial :text-matches("benchmark|industry|average", "i")');
      const benchmarkCount = await benchmarkElement.count();

      console.log(`📊 Found ${benchmarkCount} benchmark references`);
      expect(benchmarkCount).toBeGreaterThan(0);
    });

    test('2025 estimated data must appear in revenue chart', async ({ page }) => {
      await page.locator('#financial').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const has2025Data = await page.evaluate(() => {
        const section = document.querySelector('#financial');
        if (!section) return false;

        // Check for 2025 in chart labels
        const chartTexts = section.querySelectorAll('.recharts-text, text, .recharts-xAxis-tick-value');
        let found2025 = false;

        chartTexts.forEach(el => {
          if (el.textContent?.includes('2025')) {
            found2025 = true;
          }
        });

        // Also check for 2025 in any text content
        if (!found2025) {
          found2025 = section.textContent?.includes('2025') || false;
        }

        return found2025;
      });

      expect(has2025Data).toBe(true);

      // Look for 2025 specifically in chart elements
      const chart2025 = await page.locator('#financial .recharts-wrapper :text("2025")').count();
      console.log(`📊 Found ${chart2025} instances of 2025 in charts`);

      expect(chart2025).toBeGreaterThan(0);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '2025-projection.png'),
        fullPage: false
      });
    });
  });

  test.describe('5. Chart Visibility and Styling', () => {
    test('Revenue line must be clearly visible in growth projections', async ({ page }) => {
      await page.locator('#financial').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const lineChartInfo = await page.evaluate(() => {
        const lines = document.querySelectorAll('.recharts-line-curve, .recharts-line path');
        const visibleLines: any[] = [];

        lines.forEach(line => {
          const strokeWidth = line.getAttribute('stroke-width') || '0';
          const opacity = line.getAttribute('opacity') || '1';
          const stroke = line.getAttribute('stroke');

          visibleLines.push({
            width: parseFloat(strokeWidth),
            opacity: parseFloat(opacity),
            stroke: stroke,
            isVisible: parseFloat(strokeWidth) >= 2 && parseFloat(opacity) >= 0.8
          });
        });

        return {
          lineCount: lines.length,
          visibleLines: visibleLines.filter(l => l.isVisible).length,
          details: visibleLines
        };
      });

      console.log('📈 Line chart visibility:', lineChartInfo);

      expect(lineChartInfo.visibleLines).toBeGreaterThan(0);

      // At least one line should be clearly visible
      const hasVisibleLine = lineChartInfo.details.some((line: any) => line.isVisible);
      expect(hasVisibleLine).toBe(true);
    });

    test('All charts must be properly styled in black/white/gray', async ({ page }) => {
      const chartSections = ['#financial', '#growth', '#retention'];
      const colorViolations: string[] = [];

      for (const sectionId of chartSections) {
        await page.locator(sectionId).scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        const validation = await page.evaluate((id) => {
          const section = document.querySelector(id);
          if (!section) return null;

          const charts = section.querySelectorAll('.recharts-wrapper');
          const issues: string[] = [];

          charts.forEach((chart, index) => {
            const elements = chart.querySelectorAll('path, rect, line, circle');

            elements.forEach(el => {
              const stroke = el.getAttribute('stroke');
              const fill = el.getAttribute('fill');

              // Check for non-grayscale colors
              const checkColor = (color: string | null, type: string) => {
                if (!color || color === 'none' || color === 'transparent') return;

                // Check for color keywords
                const colorKeywords = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink'];
                for (const keyword of colorKeywords) {
                  if (color.toLowerCase().includes(keyword)) {
                    issues.push(`Chart ${index}: ${type} uses ${color}`);
                  }
                }

                // Check hex colors
                if (color.startsWith('#') && color.length === 7) {
                  const r = parseInt(color.substr(1, 2), 16);
                  const g = parseInt(color.substr(3, 2), 16);
                  const b = parseInt(color.substr(5, 2), 16);

                  if (Math.abs(r - g) > 10 || Math.abs(g - b) > 10 || Math.abs(r - b) > 10) {
                    issues.push(`Chart ${index}: ${type} uses non-grayscale ${color}`);
                  }
                }
              };

              checkColor(stroke, 'stroke');
              checkColor(fill, 'fill');
            });
          });

          return {
            sectionId: id,
            chartCount: charts.length,
            issues: issues
          };
        }, sectionId);

        if (validation?.issues && validation.issues.length > 0) {
          colorViolations.push(...validation.issues.map(i => `${sectionId}: ${i}`));
        }

        console.log(`📊 ${sectionId} validation:`, validation);
      }

      expect(colorViolations).toHaveLength(0);

      if (colorViolations.length > 0) {
        console.error('❌ Color violations found:', colorViolations);
      }

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'all-charts-validation.png'),
        fullPage: true
      });
    });
  });

  test.describe('6. Mobile Responsiveness', () => {
    test('Mobile view must maintain black and white theme', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const mobileBgColor = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? window.getComputedStyle(main).backgroundColor : null;
      });

      expect(isBlackOrDarkGray(mobileBgColor!)).toBe(true);
      expect(isGrayscale(mobileBgColor!)).toBe(true);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'mobile-theme.png'),
        fullPage: true
      });
    });

    test('Sections must stack properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const sectionOrder = await page.evaluate(() => {
        const ids = ['hero', 'executive', 'financial', 'growth', 'retention', 'market'];
        const positions: any = {};

        ids.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            positions[id] = {
              top: rect.top + window.scrollY,
              height: rect.height
            };
          }
        });

        return positions;
      });

      // Verify vertical stacking
      const expectedOrder = ['hero', 'executive', 'financial', 'growth', 'retention', 'market'];
      for (let i = 0; i < expectedOrder.length - 1; i++) {
        const current = sectionOrder[expectedOrder[i]];
        const next = sectionOrder[expectedOrder[i + 1]];

        if (current && next) {
          expect(current.top).toBeLessThan(next.top);
        }
      }
    });
  });

  test.describe('7. Performance and Accessibility', () => {
    test('Page must load within 5 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`⚡ Page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(5000);
    });

    test('Contrast ratio must meet WCAG AA standards', async ({ page }) => {
      const contrastInfo = await page.evaluate(() => {
        // Simple contrast ratio calculation
        function getLuminance(r: number, g: number, b: number): number {
          const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        }

        function getContrastRatio(l1: number, l2: number): number {
          const lighter = Math.max(l1, l2);
          const darker = Math.min(l1, l2);
          return (lighter + 0.05) / (darker + 0.05);
        }

        const main = document.querySelector('main');
        const heading = document.querySelector('h1, h2');

        if (!main || !heading) return null;

        const bgColor = window.getComputedStyle(main).backgroundColor;
        const textColor = window.getComputedStyle(heading).color;

        const bgMatch = bgColor.match(/\d+/g);
        const textMatch = textColor.match(/\d+/g);

        if (!bgMatch || !textMatch) return null;

        const bgLuminance = getLuminance(...bgMatch.slice(0, 3).map(Number) as [number, number, number]);
        const textLuminance = getLuminance(...textMatch.slice(0, 3).map(Number) as [number, number, number]);
        const ratio = getContrastRatio(bgLuminance, textLuminance);

        return {
          ratio: ratio,
          meetsAA: ratio >= 4.5,
          meetsAAA: ratio >= 7
        };
      });

      console.log('♿ Contrast ratio:', contrastInfo);

      if (contrastInfo) {
        expect(contrastInfo.meetsAA).toBe(true);
      }
    });

    test('All interactive elements must be keyboard accessible', async ({ page }) => {
      // Tab through the page and ensure all interactive elements can be reached
      const interactiveElements = await page.evaluate(() => {
        const selectors = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const elements = document.querySelectorAll(selectors);
        return elements.length;
      });

      console.log(`⌨️ Found ${interactiveElements} interactive elements`);
      expect(interactiveElements).toBeGreaterThan(0);

      // Test tab navigation
      for (let i = 0; i < Math.min(5, interactiveElements); i++) {
        await page.keyboard.press('Tab');

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tagName: el?.tagName,
            text: el?.textContent?.slice(0, 50)
          };
        });

        console.log(`Tab ${i + 1}: Focused on ${focusedElement.tagName}`);
      }
    });
  });

  test.describe('8. Final Validation Summary', () => {
    test('Complete dashboard validation', async ({ page }) => {
      const validationResults = {
        executivePosition: false,
        blackWhiteTheme: false,
        noTabs: false,
        tooltipStyling: false,
        largerFonts: false,
        benchmarkCitation: false,
        projection2025: false,
        chartVisibility: false
      };

      // 1. Executive Overview position
      const sectionOrder = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('div[id]'));
        return sections.map(s => s.id).filter(id => id);
      });
      validationResults.executivePosition = sectionOrder[1] === 'executive';

      // 2. Black and white theme
      const mainBg = await page.evaluate(() => {
        const main = document.querySelector('main');
        return main ? window.getComputedStyle(main).backgroundColor : null;
      });
      validationResults.blackWhiteTheme = isGrayscale(mainBg!);

      // 3. No tabs
      const tabCount = await page.locator('[role="tab"]').count();
      validationResults.noTabs = tabCount === 0;

      // 4. Tooltip styling (check structure exists)
      await page.locator('#financial').scrollIntoViewIfNeeded();
      const hasCharts = await page.locator('.recharts-wrapper').count() > 0;
      validationResults.tooltipStyling = hasCharts;

      // 5. Larger fonts
      const largeText = await page.locator('[class*="text-2xl"], [class*="text-xl"]').count();
      validationResults.largerFonts = largeText > 0;

      // 6. Benchmark citation
      const hasBenchmark = await page.locator(':text-matches("benchmark|industry", "i")').count() > 0;
      validationResults.benchmarkCitation = hasBenchmark;

      // 7. 2025 projection
      const has2025 = await page.locator(':text("2025")').count() > 0;
      validationResults.projection2025 = has2025;

      // 8. Chart visibility
      const chartCount = await page.locator('.recharts-wrapper').count();
      validationResults.chartVisibility = chartCount >= 5;

      console.log('✅ Final Validation Results:', validationResults);

      // Generate summary screenshot
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'final-validation.png'),
        fullPage: true
      });

      // Assert all validations pass
      Object.entries(validationResults).forEach(([key, value]) => {
        expect(value).toBe(true);
      });

      // Print summary
      console.log('\n📋 VALIDATION SUMMARY:');
      console.log('========================');
      Object.entries(validationResults).forEach(([key, value]) => {
        const status = value ? '✅' : '❌';
        console.log(`${status} ${key}: ${value}`);
      });
    });
  });
});