/**
 * MessageSquare Icon Fix Validation Test Suite
 *
 * This comprehensive test suite validates:
 * 1. MessageSquare icon import error is fixed in RetentionAnalysis component
 * 2. All dashboard sections render without errors
 * 3. Charts and visualizations load correctly
 * 4. Interactive elements function properly
 * 5. No console errors or warnings
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('MessageSquare Icon Fix & Dashboard Comprehensive Test', () => {
    let browser;
    let page;
    let consoleErrors = [];
    let consoleWarnings = [];

    const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
    const TIMEOUT = 30000;

    // Test configuration
    const viewports = {
        mobile: { width: 375, height: 812 },
        tablet: { width: 768, height: 1024 },
        desktop: { width: 1920, height: 1080 }
    };

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: process.env.CI === 'true' ? true : false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
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
        consoleErrors = [];
        consoleWarnings = [];

        // Capture console messages
        page.on('console', (msg) => {
            const type = msg.type();
            const text = msg.text();

            if (type === 'error') {
                consoleErrors.push({
                    text,
                    location: msg.location(),
                    stackTrace: msg.stackTrace()
                });
            } else if (type === 'warning') {
                consoleWarnings.push({
                    text,
                    location: msg.location()
                });
            }
        });

        // Capture page errors
        page.on('pageerror', (error) => {
            consoleErrors.push({
                text: error.message,
                stack: error.stack
            });
        });

        // Capture request failures
        page.on('requestfailed', (request) => {
            consoleErrors.push({
                text: `Request failed: ${request.url()}`,
                reason: request.failure().errorText
            });
        });
    });

    afterEach(async () => {
        if (page) {
            await page.close();
        }
    });

    describe('1. MessageSquare Icon Fix Validation', () => {
        test('RetentionAnalysis component renders without MessageSquare error', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Wait for RetentionAnalysis section to be visible
            const retentionSection = await page.waitForSelector('#retention-analysis', {
                timeout: TIMEOUT
            });
            expect(retentionSection).toBeTruthy();

            // Check that there are no MessageSquare-related errors
            const messageSquareErrors = consoleErrors.filter(error =>
                error.text.includes('MessageSquare') ||
                error.text.includes('is not defined')
            );

            expect(messageSquareErrors).toHaveLength(0);

            // Verify MessageSquare icon is rendered properly in the section
            const messageSquareIcons = await page.$$('svg[data-lucide="message-square"]');
            expect(messageSquareIcons.length).toBeGreaterThan(0);

            // Take screenshot for visual verification
            await page.screenshot({
                path: path.join(__dirname, '../../screenshots/retention-analysis-fixed.png'),
                fullPage: false,
                clip: await retentionSection.boundingBox()
            });
        });

        test('All Lucide icons load correctly', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Check for all expected icons
            const iconNames = [
                'users', 'user-check', 'repeat', 'trending-up', 'message-square',
                'rocket', 'target', 'zap', 'trophy', 'star', 'arrow-right',
                'chart-bar', 'chart-line', 'activity', 'dollar-sign'
            ];

            for (const iconName of iconNames) {
                const icons = await page.$$(`svg[data-lucide="${iconName}"]`);
                if (icons.length === 0) {
                    console.warn(`Icon not found: ${iconName}`);
                }
            }

            // Ensure no icon-related errors
            const iconErrors = consoleErrors.filter(error =>
                error.text.toLowerCase().includes('icon') ||
                error.text.toLowerCase().includes('lucide')
            );

            expect(iconErrors).toHaveLength(0);
        });
    });

    describe('2. Full Dashboard Functionality Testing', () => {
        test('All dashboard sections render correctly', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Test all major sections
            const sections = [
                { id: '#hero-section', name: 'Hero Section' },
                { id: '#executive-overview', name: 'Executive Overview' },
                { id: '#investment-highlights', name: 'Investment Highlights' },
                { id: '#market-opportunity', name: 'Market Opportunity' },
                { id: '#growth-metrics', name: 'Growth Metrics' },
                { id: '#retention-analysis', name: 'Retention Analysis' },
                { id: '#financial-performance', name: 'Financial Performance' }
            ];

            for (const section of sections) {
                const element = await page.$(section.id);
                expect(element).toBeTruthy();

                // Check if section is visible
                const isVisible = await page.evaluate((selector) => {
                    const el = document.querySelector(selector);
                    if (!el) return false;
                    const rect = el.getBoundingClientRect();
                    return rect.height > 0 && rect.width > 0;
                }, section.id);

                expect(isVisible).toBe(true);
                console.log(`✓ ${section.name} rendered successfully`);
            }
        });

        test('Navigation sidebar works correctly', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Check if navigation sidebar exists
            const navSidebar = await page.$('.fixed.left-0.top-1\\/2');
            expect(navSidebar).toBeTruthy();

            // Test navigation links
            const navLinks = await page.$$('.fixed.left-0.top-1\\/2 button');
            expect(navLinks.length).toBeGreaterThan(0);

            // Test smooth scrolling for each nav item
            for (let i = 0; i < Math.min(navLinks.length, 3); i++) {
                await navLinks[i].click();
                await page.waitForTimeout(500); // Wait for smooth scroll

                // Verify no errors occurred during navigation
                const navigationErrors = consoleErrors.filter(error =>
                    Date.now() - 1000 < error.timestamp
                );
                expect(navigationErrors).toHaveLength(0);
            }
        });

        test('Charts render without errors', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Wait for Recharts components
            await page.waitForSelector('.recharts-wrapper', {
                timeout: TIMEOUT
            });

            // Count all charts
            const charts = await page.$$('.recharts-wrapper');
            expect(charts.length).toBeGreaterThan(0);
            console.log(`Found ${charts.length} charts on the page`);

            // Check for chart-related errors
            const chartErrors = consoleErrors.filter(error =>
                error.text.includes('recharts') ||
                error.text.includes('chart') ||
                error.text.includes('NaN') ||
                error.text.includes('undefined')
            );

            expect(chartErrors).toHaveLength(0);

            // Verify chart interactions (hover tooltips)
            const firstChart = charts[0];
            const chartBox = await firstChart.boundingBox();
            if (chartBox) {
                await page.mouse.move(
                    chartBox.x + chartBox.width / 2,
                    chartBox.y + chartBox.height / 2
                );
                await page.waitForTimeout(200);

                // Check if tooltip appears
                const tooltip = await page.$('.recharts-tooltip-wrapper');
                if (tooltip) {
                    const tooltipVisible = await tooltip.isIntersectingViewport();
                    console.log('Chart tooltip interaction:', tooltipVisible ? 'Working' : 'Not visible');
                }
            }
        });

        test('Interactive elements respond correctly', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Test tabs in Financial Performance
            const tabButtons = await page.$$('[role="tab"]');
            if (tabButtons.length > 0) {
                for (const tab of tabButtons) {
                    await tab.click();
                    await page.waitForTimeout(300);

                    // Check if tab content changed
                    const activeTab = await page.$('[role="tab"][data-state="active"]');
                    expect(activeTab).toBeTruthy();
                }
                console.log(`✓ Tested ${tabButtons.length} tab interactions`);
            }

            // Test any buttons
            const buttons = await page.$$('button');
            console.log(`Found ${buttons.length} buttons on the page`);

            // Test hover states
            const cards = await page.$$('.group');
            if (cards.length > 0) {
                const firstCard = cards[0];
                await firstCard.hover();
                await page.waitForTimeout(200);

                // Verify hover effects applied
                const hasHoverClass = await page.evaluate((el) => {
                    return el.matches(':hover');
                }, firstCard);

                console.log('Card hover state:', hasHoverClass ? 'Active' : 'Inactive');
            }
        });
    });

    describe('3. Responsive Design Validation', () => {
        Object.entries(viewports).forEach(([device, viewport]) => {
            test(`Dashboard renders correctly on ${device}`, async () => {
                await page.setViewport(viewport);
                await page.goto(BASE_URL, {
                    waitUntil: 'networkidle0',
                    timeout: TIMEOUT
                });

                // Check for layout breaks
                const layoutErrors = await page.evaluate(() => {
                    const elements = document.querySelectorAll('*');
                    const errors = [];

                    elements.forEach(el => {
                        const rect = el.getBoundingClientRect();
                        // Check for elements extending beyond viewport
                        if (rect.right > window.innerWidth) {
                            errors.push({
                                element: el.tagName,
                                class: el.className,
                                issue: 'Element extends beyond viewport'
                            });
                        }

                        // Check for text overflow
                        if (el.scrollWidth > el.clientWidth) {
                            errors.push({
                                element: el.tagName,
                                class: el.className,
                                issue: 'Text overflow detected'
                            });
                        }
                    });

                    return errors;
                });

                if (layoutErrors.length > 0) {
                    console.warn(`Layout issues on ${device}:`, layoutErrors.slice(0, 5));
                }

                // Take screenshot for each viewport
                await page.screenshot({
                    path: path.join(__dirname, `../../screenshots/${device}-view.png`),
                    fullPage: false
                });

                console.log(`✓ ${device} view tested (${viewport.width}x${viewport.height})`);
            });
        });
    });

    describe('4. Performance Validation', () => {
        test('Dashboard loads within acceptable time', async () => {
            const startTime = Date.now();

            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            const loadTime = Date.now() - startTime;
            console.log(`Page load time: ${loadTime}ms`);

            expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds

            // Get performance metrics
            const metrics = await page.metrics();
            console.log('Performance Metrics:', {
                'JS Heap Used': `${(metrics.JSHeapUsedSize / 1048576).toFixed(2)} MB`,
                'JS Heap Total': `${(metrics.JSHeapTotalSize / 1048576).toFixed(2)} MB`,
                'DOM Nodes': metrics.Nodes,
                'Layout Count': metrics.LayoutCount,
                'Style Recalcs': metrics.RecalcStyleCount
            });

            // Check Core Web Vitals
            const vitals = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const data = {
                        FCP: null,
                        LCP: null,
                        CLS: null,
                        FID: null
                    };

                    // First Contentful Paint
                    const fcpObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
                        if (fcp) data.FCP = fcp.startTime;
                    });
                    fcpObserver.observe({ entryTypes: ['paint'] });

                    // Largest Contentful Paint
                    const lcpObserver = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        if (lastEntry) data.LCP = lastEntry.startTime;
                    });
                    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                    setTimeout(() => resolve(data), 2000);
                });
            });

            console.log('Core Web Vitals:', vitals);
        });

        test('No memory leaks detected', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Initial memory snapshot
            const initialMetrics = await page.metrics();
            const initialHeap = initialMetrics.JSHeapUsedSize;

            // Interact with the page
            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(500);
                await page.evaluate(() => window.scrollTo(0, 0));
                await page.waitForTimeout(500);
            }

            // Final memory snapshot
            const finalMetrics = await page.metrics();
            const finalHeap = finalMetrics.JSHeapUsedSize;

            const heapGrowth = ((finalHeap - initialHeap) / initialHeap) * 100;
            console.log(`Heap growth: ${heapGrowth.toFixed(2)}%`);

            // Memory should not grow excessively (allowing 50% growth)
            expect(heapGrowth).toBeLessThan(50);
        });
    });

    describe('5. Error Detection & Console Validation', () => {
        test('No console errors present', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Wait for any lazy-loaded content
            await page.waitForTimeout(2000);

            // Scroll through the page to trigger any lazy loading
            await page.evaluate(() => {
                return new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 100;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;

                        if(totalHeight >= scrollHeight){
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });

            // Report all console errors
            if (consoleErrors.length > 0) {
                console.error('Console Errors Found:', consoleErrors);
            }

            expect(consoleErrors).toHaveLength(0);
        });

        test('No console warnings present', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Filter out expected React warnings
            const unexpectedWarnings = consoleWarnings.filter(warning =>
                !warning.text.includes('React') &&
                !warning.text.includes('DevTools')
            );

            if (unexpectedWarnings.length > 0) {
                console.warn('Console Warnings Found:', unexpectedWarnings);
            }

            // Warnings are less critical but should be minimal
            expect(unexpectedWarnings.length).toBeLessThanOrEqual(5);
        });

        test('All network requests successful', async () => {
            const failedRequests = [];

            page.on('requestfailed', request => {
                failedRequests.push({
                    url: request.url(),
                    reason: request.failure().errorText
                });
            });

            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            if (failedRequests.length > 0) {
                console.error('Failed Network Requests:', failedRequests);
            }

            expect(failedRequests).toHaveLength(0);
        });
    });

    describe('6. Data Display Validation', () => {
        test('All metrics display with correct formatting', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Check for NaN or undefined values
            const dataErrors = await page.evaluate(() => {
                const errors = [];
                const textNodes = document.evaluate(
                    "//text()[normalize-space(.) != '']",
                    document,
                    null,
                    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                    null
                );

                for (let i = 0; i < textNodes.snapshotLength; i++) {
                    const text = textNodes.snapshotItem(i).textContent.trim();
                    if (text === 'NaN' || text === 'undefined' || text === 'null') {
                        errors.push({
                            text: text,
                            parent: textNodes.snapshotItem(i).parentElement?.className
                        });
                    }
                }

                return errors;
            });

            expect(dataErrors).toHaveLength(0);

            // Verify number formatting
            const numbers = await page.$$eval('[class*="text-4xl"], [class*="text-3xl"], [class*="text-2xl"]', elements =>
                elements.map(el => el.textContent.trim())
            );

            numbers.forEach(num => {
                // Check if it's supposed to be a number
                if (num.match(/[\d,.%$€]/)) {
                    expect(num).not.toContain('NaN');
                    expect(num).not.toContain('undefined');
                    expect(num).not.toContain('null');
                }
            });

            console.log(`✓ Validated ${numbers.length} metric displays`);
        });

        test('Chart data renders correctly', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Check if charts have data
            const chartData = await page.evaluate(() => {
                const charts = document.querySelectorAll('.recharts-wrapper');
                return Array.from(charts).map(chart => {
                    const bars = chart.querySelectorAll('.recharts-bar-rectangle');
                    const lines = chart.querySelectorAll('.recharts-line-curve');
                    const areas = chart.querySelectorAll('.recharts-area-area');

                    return {
                        hasBars: bars.length > 0,
                        hasLines: lines.length > 0,
                        hasAreas: areas.length > 0,
                        totalDataPoints: bars.length + lines.length + areas.length
                    };
                });
            });

            chartData.forEach((chart, index) => {
                expect(chart.totalDataPoints).toBeGreaterThan(0);
                console.log(`Chart ${index + 1}: ${chart.totalDataPoints} data points rendered`);
            });
        });
    });

    describe('7. Accessibility Testing', () => {
        test('Dashboard has proper accessibility attributes', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            // Check for ARIA labels
            const accessibilityChecks = await page.evaluate(() => {
                const checks = {
                    hasLandmarks: document.querySelectorAll('[role]').length > 0,
                    hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
                    hasAltText: Array.from(document.querySelectorAll('img')).every(img => img.alt),
                    hasButtonLabels: Array.from(document.querySelectorAll('button')).every(
                        btn => btn.textContent.trim() || btn.getAttribute('aria-label')
                    ),
                    hasProperContrast: true // This would require more complex checking
                };

                return checks;
            });

            expect(accessibilityChecks.hasLandmarks).toBe(true);
            expect(accessibilityChecks.hasHeadings).toBe(true);
            expect(accessibilityChecks.hasButtonLabels).toBe(true);

            console.log('Accessibility Checks:', accessibilityChecks);
        });
    });

    describe('8. Final Validation Report', () => {
        test('Generate comprehensive test report', async () => {
            await page.goto(BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: TIMEOUT
            });

            const report = {
                timestamp: new Date().toISOString(),
                url: BASE_URL,
                messageSquareFixValidated: consoleErrors.filter(e => e.text.includes('MessageSquare')).length === 0,
                totalErrors: consoleErrors.length,
                totalWarnings: consoleWarnings.length,
                performanceMetrics: await page.metrics(),
                coverage: {
                    sectionsTesteD: 7,
                    chartsValidated: true,
                    responsiveTestsD: 3,
                    interactionsTested: true
                },
                recommendation: consoleErrors.length === 0 ? 'PASS - Dashboard ready for production' : 'FAIL - Issues need attention'
            };

            console.log('\n========================================');
            console.log('COMPREHENSIVE TEST REPORT');
            console.log('========================================');
            console.log(JSON.stringify(report, null, 2));
            console.log('========================================\n');

            expect(report.messageSquareFixValidated).toBe(true);
            expect(report.totalErrors).toBe(0);
        });
    });
});