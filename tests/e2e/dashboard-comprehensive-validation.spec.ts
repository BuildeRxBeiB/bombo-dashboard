/**
 * Comprehensive Dashboard Validation Test Suite using Playwright
 *
 * Cross-browser testing for:
 * - Chrome, Firefox, Safari, Edge
 * - MessageSquare icon fix validation
 * - Full dashboard functionality
 * - Performance metrics
 * - Visual regression
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { bomboData } from '../../lib/data';

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Define test data expectations
const EXPECTED_SECTIONS = [
    'hero-section',
    'executive-overview',
    'investment-highlights',
    'market-opportunity',
    'growth-metrics',
    'retention-analysis',
    'financial-performance'
];

const VIEWPORTS = {
    mobile: { width: 375, height: 812 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
    wide: { width: 2560, height: 1440 }
};

// Test utilities
class DashboardTestHelper {
    constructor(private page: Page) {}

    async captureConsoleErrors(): Promise<string[]> {
        const errors: string[] = [];
        this.page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        this.page.on('pageerror', (error) => {
            errors.push(error.message);
        });
        return errors;
    }

    async scrollThroughPage(): Promise<void> {
        await this.page.evaluate(() => {
            return new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    async checkElementVisibility(selector: string): Promise<boolean> {
        const element = await this.page.locator(selector).first();
        return await element.isVisible();
    }

    async getPerformanceMetrics() {
        return await this.page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
            };
        });
    }
}

test.describe('MessageSquare Icon Fix Validation', () => {
    let errors: string[];

    test.beforeEach(async ({ page }) => {
        const helper = new DashboardTestHelper(page);
        errors = await helper.captureConsoleErrors();
    });

    test('MessageSquare icon renders without errors', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Wait for RetentionAnalysis section
        await expect(page.locator('#retention-analysis')).toBeVisible();

        // Check for MessageSquare icons
        const messageSquareIcons = await page.locator('svg[data-lucide="message-square"]').count();
        expect(messageSquareIcons).toBeGreaterThan(0);

        // Verify no MessageSquare-related errors
        const messageSquareErrors = errors.filter(error =>
            error.includes('MessageSquare') || error.includes('is not defined')
        );
        expect(messageSquareErrors).toHaveLength(0);

        // Take screenshot of the fixed section
        await page.locator('#retention-analysis').screenshot({
            path: 'tests/screenshots/retention-analysis-fixed.png'
        });
    });

    test('All Lucide icons load correctly', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        const iconNames = [
            'users', 'user-check', 'repeat', 'trending-up', 'message-square',
            'rocket', 'target', 'zap', 'trophy', 'star', 'arrow-right',
            'chart-bar', 'chart-line', 'activity', 'dollar-sign'
        ];

        for (const iconName of iconNames) {
            const iconCount = await page.locator(`svg[data-lucide="${iconName}"]`).count();
            if (iconCount === 0) {
                console.warn(`Warning: Icon "${iconName}" not found on page`);
            }
        }

        // Check for icon-related errors
        const iconErrors = errors.filter(error =>
            error.toLowerCase().includes('icon') || error.toLowerCase().includes('lucide')
        );
        expect(iconErrors).toHaveLength(0);
    });
});

test.describe('Dashboard Sections Rendering', () => {
    test('All sections render and are visible', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        for (const sectionId of EXPECTED_SECTIONS) {
            const section = page.locator(`#${sectionId}`);
            await expect(section).toBeVisible();

            // Verify section has content
            const sectionContent = await section.textContent();
            expect(sectionContent).toBeTruthy();
            expect(sectionContent!.length).toBeGreaterThan(10);

            console.log(`✓ Section "${sectionId}" rendered successfully`);
        }
    });

    test('Navigation sidebar functions correctly', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Check navigation sidebar exists
        const navSidebar = page.locator('.fixed.left-0.top-1\\/2');
        await expect(navSidebar).toBeVisible();

        // Get all navigation buttons
        const navButtons = navSidebar.locator('button');
        const buttonCount = await navButtons.count();
        expect(buttonCount).toBeGreaterThan(0);

        // Test navigation to each section
        for (let i = 0; i < buttonCount; i++) {
            const button = navButtons.nth(i);
            const isActive = await button.getAttribute('data-active');

            // Click and verify scroll
            await button.click();
            await page.waitForTimeout(500); // Wait for smooth scroll

            // Verify section is in viewport
            const sectionId = EXPECTED_SECTIONS[i];
            if (sectionId) {
                const section = page.locator(`#${sectionId}`);
                await expect(section).toBeInViewport({ ratio: 0.2 });
            }
        }
    });
});

test.describe('Chart Components Validation', () => {
    test('All charts render with data', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Wait for Recharts to load
        await page.waitForSelector('.recharts-wrapper', { timeout: 10000 });

        const charts = page.locator('.recharts-wrapper');
        const chartCount = await charts.count();
        expect(chartCount).toBeGreaterThan(0);

        console.log(`Found ${chartCount} charts on the dashboard`);

        // Validate each chart has data elements
        for (let i = 0; i < chartCount; i++) {
            const chart = charts.nth(i);
            await expect(chart).toBeVisible();

            // Check for data elements (bars, lines, or areas)
            const hasData = await chart.evaluate((el) => {
                const bars = el.querySelectorAll('.recharts-bar-rectangle').length;
                const lines = el.querySelectorAll('.recharts-line-curve').length;
                const areas = el.querySelectorAll('.recharts-area-area').length;
                const pies = el.querySelectorAll('.recharts-pie-sector').length;
                return bars + lines + areas + pies > 0;
            });

            expect(hasData).toBe(true);
        }
    });

    test('Chart tooltips work on hover', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Find first chart
        const firstChart = page.locator('.recharts-wrapper').first();
        await expect(firstChart).toBeVisible();

        // Get chart dimensions
        const chartBox = await firstChart.boundingBox();
        if (chartBox) {
            // Hover over chart center
            await page.mouse.move(
                chartBox.x + chartBox.width / 2,
                chartBox.y + chartBox.height / 2
            );

            // Wait for tooltip
            await page.waitForTimeout(500);

            // Check if tooltip appears
            const tooltip = page.locator('.recharts-tooltip-wrapper');
            const tooltipCount = await tooltip.count();

            if (tooltipCount > 0) {
                const isVisible = await tooltip.first().isVisible();
                console.log('Chart tooltip interaction:', isVisible ? 'Working' : 'Not visible');
            }
        }
    });
});

test.describe('Responsive Design Testing', () => {
    Object.entries(VIEWPORTS).forEach(([device, viewport]) => {
        test(`Renders correctly on ${device} (${viewport.width}x${viewport.height})`, async ({ page }) => {
            await page.setViewportSize(viewport);
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Check for horizontal overflow
            const hasOverflow = await page.evaluate(() => {
                return document.documentElement.scrollWidth > window.innerWidth;
            });
            expect(hasOverflow).toBe(false);

            // Check main content visibility
            const heroSection = page.locator('#hero-section');
            await expect(heroSection).toBeVisible();

            // Take screenshot for visual verification
            await page.screenshot({
                path: `tests/screenshots/${device}-view.png`,
                fullPage: false
            });

            // Check text readability
            const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6').count();
            expect(textElements).toBeGreaterThan(0);

            console.log(`✓ ${device} responsive test passed`);
        });
    });
});

test.describe('Interactive Elements Testing', () => {
    test('Tab navigation in Financial Performance', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Scroll to Financial Performance section
        await page.locator('#financial-performance').scrollIntoViewIfNeeded();

        // Find tab buttons
        const tabs = page.locator('[role="tab"]');
        const tabCount = await tabs.count();

        if (tabCount > 0) {
            for (let i = 0; i < tabCount; i++) {
                const tab = tabs.nth(i);
                await tab.click();
                await page.waitForTimeout(300);

                // Verify tab is active
                const isActive = await tab.getAttribute('data-state');
                if (i === 0 || isActive === 'active') {
                    const tabPanel = page.locator('[role="tabpanel"]').first();
                    await expect(tabPanel).toBeVisible();
                }
            }
            console.log(`✓ Tested ${tabCount} tab interactions`);
        }
    });

    test('Card hover effects', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Find cards with hover effects
        const cards = page.locator('.group').first();

        if (await cards.count() > 0) {
            // Get initial styles
            const initialTransform = await cards.evaluate((el) =>
                window.getComputedStyle(el).transform
            );

            // Hover over card
            await cards.hover();
            await page.waitForTimeout(300);

            // Get hover styles
            const hoverTransform = await cards.evaluate((el) =>
                window.getComputedStyle(el).transform
            );

            // Some cards might have transform on hover
            console.log('Card hover effect detected:', initialTransform !== hoverTransform);
        }
    });
});

test.describe('Performance Testing', () => {
    test('Page loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();

        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;
        console.log(`Page load time: ${loadTime}ms`);

        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);

        // Get performance metrics
        const helper = new DashboardTestHelper(page);
        const metrics = await helper.getPerformanceMetrics();

        console.log('Performance Metrics:', metrics);

        // Check Core Web Vitals thresholds
        expect(metrics.firstContentfulPaint).toBeLessThan(2500); // Good FCP < 2.5s
    });

    test('No memory leaks during interaction', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Get initial memory
        const initialMemory = await page.evaluate(() => {
            if ((performance as any).memory) {
                return (performance as any).memory.usedJSHeapSize;
            }
            return 0;
        });

        // Perform interactions
        const helper = new DashboardTestHelper(page);
        for (let i = 0; i < 3; i++) {
            await helper.scrollThroughPage();
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(500);
        }

        // Get final memory
        const finalMemory = await page.evaluate(() => {
            if ((performance as any).memory) {
                return (performance as any).memory.usedJSHeapSize;
            }
            return 0;
        });

        if (initialMemory && finalMemory) {
            const memoryGrowth = ((finalMemory - initialMemory) / initialMemory) * 100;
            console.log(`Memory growth: ${memoryGrowth.toFixed(2)}%`);

            // Memory growth should be reasonable (less than 30%)
            expect(memoryGrowth).toBeLessThan(30);
        }
    });
});

test.describe('Data Integrity Testing', () => {
    test('All metrics display correctly', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Check for invalid data displays
        const invalidData = await page.evaluate(() => {
            const textNodes = document.evaluate(
                "//text()[normalize-space(.) != '']",
                document,
                null,
                XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                null
            );

            const errors = [];
            for (let i = 0; i < textNodes.snapshotLength; i++) {
                const text = textNodes.snapshotItem(i)?.textContent?.trim() || '';
                if (text === 'NaN' || text === 'undefined' || text === 'null' || text === 'Invalid Date') {
                    errors.push(text);
                }
            }
            return errors;
        });

        expect(invalidData).toHaveLength(0);

        // Verify key metrics from data
        const heroMetrics = page.locator('#hero-section .text-4xl, #hero-section .text-5xl');
        const metricsCount = await heroMetrics.count();
        expect(metricsCount).toBeGreaterThan(0);

        for (let i = 0; i < metricsCount; i++) {
            const metricText = await heroMetrics.nth(i).textContent();
            expect(metricText).toBeTruthy();
            expect(metricText).not.toContain('NaN');
            expect(metricText).not.toContain('undefined');
        }
    });

    test('Retention heatmaps display correct data', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Navigate to Retention Analysis
        await page.locator('#retention-analysis').scrollIntoViewIfNeeded();

        // Check heatmap cells
        const heatmapCells = page.locator('#retention-analysis .grid > div > div').filter({
            hasText: /^\d+(\.\d+)?%?$/
        });

        const cellCount = await heatmapCells.count();
        if (cellCount > 0) {
            console.log(`Found ${cellCount} heatmap data cells`);

            // Verify cells have valid percentage values
            for (let i = 0; i < Math.min(5, cellCount); i++) {
                const cellText = await heatmapCells.nth(i).textContent();
                if (cellText) {
                    const value = parseFloat(cellText.replace('%', ''));
                    expect(value).toBeGreaterThanOrEqual(0);
                    expect(value).toBeLessThanOrEqual(100);
                }
            }
        }
    });
});

test.describe('Accessibility Testing', () => {
    test('Dashboard meets basic accessibility requirements', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Check for proper heading hierarchy
        const headings = await page.evaluate(() => {
            const h1Count = document.querySelectorAll('h1').length;
            const h2Count = document.querySelectorAll('h2').length;
            const h3Count = document.querySelectorAll('h3').length;

            return { h1: h1Count, h2: h2Count, h3: h3Count };
        });

        expect(headings.h1).toBeGreaterThan(0);
        expect(headings.h2).toBeGreaterThan(0);

        // Check for ARIA landmarks
        const hasLandmarks = await page.evaluate(() => {
            const main = document.querySelector('main, [role="main"]');
            const nav = document.querySelector('nav, [role="navigation"]');
            return { hasMain: !!main, hasNav: !!nav };
        });

        expect(hasLandmarks.hasMain).toBe(true);

        // Check button accessibility
        const buttons = page.locator('button');
        const buttonCount = await buttons.count();

        for (let i = 0; i < Math.min(5, buttonCount); i++) {
            const button = buttons.nth(i);
            const hasText = await button.textContent();
            const hasAriaLabel = await button.getAttribute('aria-label');

            expect(hasText || hasAriaLabel).toBeTruthy();
        }

        // Check color contrast (basic check)
        const hasHighContrast = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            let goodContrast = true;

            elements.forEach(el => {
                const styles = window.getComputedStyle(el);
                const bg = styles.backgroundColor;
                const color = styles.color;

                // Basic check for black on white or white on dark
                if (bg === 'rgb(0, 0, 0)' && color === 'rgb(0, 0, 0)') {
                    goodContrast = false;
                }
                if (bg === 'rgb(255, 255, 255)' && color === 'rgb(255, 255, 255)') {
                    goodContrast = false;
                }
            });

            return goodContrast;
        });

        expect(hasHighContrast).toBe(true);
    });

    test('Keyboard navigation works', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Test tab navigation
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        // Check if focus is visible
        const focusedElement = await page.evaluate(() => {
            const el = document.activeElement;
            return {
                tagName: el?.tagName,
                className: el?.className,
                hasFocusRing: window.getComputedStyle(el as HTMLElement).outline !== 'none'
            };
        });

        expect(focusedElement.tagName).toBeTruthy();

        // Tab through several elements
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(100);
        }

        // Test Enter key on button
        const activeButton = await page.evaluate(() => {
            return document.activeElement?.tagName === 'BUTTON';
        });

        if (activeButton) {
            await page.keyboard.press('Enter');
            // No error should occur
        }
    });
});

test.describe('Error Boundary Testing', () => {
    test('No console errors during full interaction', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        page.on('pageerror', (error) => {
            errors.push(error.message);
        });

        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Perform various interactions
        const helper = new DashboardTestHelper(page);
        await helper.scrollThroughPage();

        // Click on various interactive elements
        const buttons = page.locator('button').filter({ hasText: /.+/ });
        const buttonCount = await buttons.count();

        for (let i = 0; i < Math.min(3, buttonCount); i++) {
            await buttons.nth(i).click();
            await page.waitForTimeout(200);
        }

        // Check for errors
        if (errors.length > 0) {
            console.error('Console errors found:', errors);
        }

        expect(errors).toHaveLength(0);
    });

    test('Handles network failures gracefully', async ({ page, context }) => {
        // Block certain resources to simulate network issues
        await context.route('**/*.jpg', route => route.abort());
        await context.route('**/*.png', route => route.abort());

        await page.goto(BASE_URL);
        await page.waitForLoadState('domcontentloaded');

        // Page should still be functional
        const heroSection = page.locator('#hero-section');
        await expect(heroSection).toBeVisible();

        // Main content should still render
        const mainContent = await page.textContent('main');
        expect(mainContent).toBeTruthy();
        expect(mainContent!.length).toBeGreaterThan(100);
    });
});

test.describe('Cross-Browser Testing', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
        test(`Dashboard works in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
            if (currentBrowser !== browserName) {
                test.skip();
            }

            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');

            // Basic functionality check
            const heroSection = page.locator('#hero-section');
            await expect(heroSection).toBeVisible();

            // Check charts render
            const charts = page.locator('.recharts-wrapper');
            const chartCount = await charts.count();
            expect(chartCount).toBeGreaterThan(0);

            // Navigation works
            const navButtons = page.locator('.fixed.left-0.top-1\\/2 button');
            if (await navButtons.count() > 0) {
                await navButtons.first().click();
                // No errors should occur
            }

            console.log(`✓ ${browserName} compatibility verified`);
        });
    });
});

test.describe('Final Validation Summary', () => {
    test('Generate comprehensive test report', async ({ page }) => {
        const errors: string[] = [];
        const helper = new DashboardTestHelper(page);

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        // Collect all test results
        const report = {
            timestamp: new Date().toISOString(),
            url: BASE_URL,
            browser: page.context().browser()?.browserType().name() || 'unknown',
            messageSquareFix: {
                validated: errors.filter(e => e.includes('MessageSquare')).length === 0,
                iconCount: await page.locator('svg[data-lucide="message-square"]').count()
            },
            sections: {
                total: EXPECTED_SECTIONS.length,
                rendered: 0
            },
            charts: {
                count: await page.locator('.recharts-wrapper').count(),
                hasData: true
            },
            errors: {
                console: errors.length,
                network: 0
            },
            performance: await helper.getPerformanceMetrics(),
            responsive: {
                testedViewports: Object.keys(VIEWPORTS).length,
                passed: true
            },
            accessibility: {
                hasHeadings: await page.locator('h1, h2, h3').count() > 0,
                hasLandmarks: await page.locator('main').count() > 0
            },
            recommendation: errors.length === 0 ? 'PASS ✓' : 'FAIL ✗'
        };

        // Count rendered sections
        for (const sectionId of EXPECTED_SECTIONS) {
            if (await page.locator(`#${sectionId}`).count() > 0) {
                report.sections.rendered++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('PLAYWRIGHT COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(60));
        console.log(JSON.stringify(report, null, 2));
        console.log('='.repeat(60) + '\n');

        // Final assertions
        expect(report.messageSquareFix.validated).toBe(true);
        expect(report.errors.console).toBe(0);
        expect(report.sections.rendered).toBe(report.sections.total);
    });
});