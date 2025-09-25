#!/usr/bin/env node

/**
 * MessageSquare Icon Fix Verification Script
 * Quick validation that the MessageSquare import error has been resolved
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function verifyMessageSquareFix() {
    console.log('\n' + '='.repeat(60));
    console.log('MESSAGE SQUARE FIX VERIFICATION');
    console.log('='.repeat(60));
    console.log(`Testing URL: ${BASE_URL}\n`);

    let browser;
    const results = {
        timestamp: new Date().toISOString(),
        url: BASE_URL,
        errors: [],
        warnings: [],
        checks: {}
    };

    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Capture console messages
        page.on('console', (msg) => {
            const type = msg.type();
            const text = msg.text();

            if (type === 'error') {
                results.errors.push(text);
                console.log(`❌ Console Error: ${text.substring(0, 100)}...`);
            } else if (type === 'warning') {
                results.warnings.push(text);
            }
        });

        // Capture page errors
        page.on('pageerror', (error) => {
            results.errors.push(error.message);
            console.log(`❌ Page Error: ${error.message.substring(0, 100)}...`);
        });

        // Navigate to page
        console.log('📄 Loading dashboard...');
        await page.goto(BASE_URL, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        console.log('✅ Dashboard loaded\n');

        // Check 1: Look for MessageSquare-related errors
        console.log('🔍 Checking for MessageSquare errors...');
        const messageSquareErrors = results.errors.filter(error =>
            error.includes('MessageSquare') ||
            error.includes('is not defined') ||
            error.includes('Cannot read properties of undefined')
        );

        results.checks.messageSquareErrors = messageSquareErrors.length === 0;

        if (messageSquareErrors.length === 0) {
            console.log('✅ No MessageSquare errors found');
        } else {
            console.log(`❌ Found ${messageSquareErrors.length} MessageSquare-related errors:`);
            messageSquareErrors.forEach((error, i) => {
                console.log(`   ${i + 1}. ${error.substring(0, 150)}`);
            });
        }

        // Check 2: Verify RetentionAnalysis section exists
        console.log('\n🔍 Checking RetentionAnalysis section...');
        const retentionSection = await page.$('#retention-analysis');
        results.checks.retentionSectionExists = !!retentionSection;

        if (retentionSection) {
            console.log('✅ RetentionAnalysis section found');

            // Check if section is visible
            const isVisible = await page.evaluate(() => {
                const el = document.querySelector('#retention-analysis');
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                return rect.height > 0 && rect.width > 0;
            });

            results.checks.retentionSectionVisible = isVisible;
            console.log(isVisible ? '✅ Section is visible' : '⚠️  Section exists but not visible');
        } else {
            console.log('❌ RetentionAnalysis section not found');
        }

        // Check 3: Look for MessageSquare icons
        console.log('\n🔍 Checking for MessageSquare icons...');
        const messageSquareIconCount = await page.evaluate(() => {
            // Check for Lucide icons with message-square
            const lucideIcons = document.querySelectorAll('svg[data-lucide="message-square"]');
            const svgIcons = document.querySelectorAll('svg');
            let messageSquareFound = 0;

            // Also check SVG elements that might be MessageSquare icons
            svgIcons.forEach(svg => {
                const paths = svg.querySelectorAll('path');
                paths.forEach(path => {
                    const d = path.getAttribute('d');
                    // MessageSquare icon typically has a specific path
                    if (d && d.includes('M21 15a2')) {
                        messageSquareFound++;
                    }
                });
            });

            return {
                lucide: lucideIcons.length,
                potential: messageSquareFound,
                totalSvg: svgIcons.length
            };
        });

        results.checks.messageSquareIcons = messageSquareIconCount;
        console.log(`📊 Icon counts:`);
        console.log(`   - Lucide MessageSquare icons: ${messageSquareIconCount.lucide}`);
        console.log(`   - Potential MessageSquare icons: ${messageSquareIconCount.potential}`);
        console.log(`   - Total SVG icons on page: ${messageSquareIconCount.totalSvg}`);

        // Check 4: Verify all sections render
        console.log('\n🔍 Checking all dashboard sections...');
        const sections = [
            'hero-section',
            'executive-overview',
            'investment-highlights',
            'market-opportunity',
            'growth-metrics',
            'retention-analysis',
            'financial-performance'
        ];

        let sectionsFound = 0;
        for (const sectionId of sections) {
            const exists = await page.$(`#${sectionId}`);
            if (exists) {
                sectionsFound++;
                console.log(`   ✅ ${sectionId}`);
            } else {
                console.log(`   ❌ ${sectionId} - NOT FOUND`);
            }
        }

        results.checks.sectionsFound = `${sectionsFound}/${sections.length}`;

        // Check 5: Look for any Lucide icon errors
        console.log('\n🔍 Checking for Lucide icon errors...');
        const lucideErrors = results.errors.filter(error =>
            error.toLowerCase().includes('lucide') ||
            error.toLowerCase().includes('icon')
        );

        results.checks.lucideErrors = lucideErrors.length === 0;

        if (lucideErrors.length === 0) {
            console.log('✅ No Lucide icon errors found');
        } else {
            console.log(`⚠️  Found ${lucideErrors.length} icon-related errors`);
        }

        // Check 6: Performance check
        console.log('\n⚡ Checking page performance...');
        const metrics = await page.metrics();
        results.performance = {
            jsHeapUsedMB: (metrics.JSHeapUsedSize / 1048576).toFixed(2),
            domNodes: metrics.Nodes,
            layoutCount: metrics.LayoutCount
        };

        console.log(`   - JS Heap: ${results.performance.jsHeapUsedMB} MB`);
        console.log(`   - DOM Nodes: ${results.performance.domNodes}`);
        console.log(`   - Layout Count: ${results.performance.layoutCount}`);

        // Take screenshot
        const screenshotDir = path.join(__dirname, 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const screenshotPath = path.join(screenshotDir, 'message-square-verification.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: false
        });
        console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

        // Final verdict
        console.log('\n' + '='.repeat(60));
        console.log('VERIFICATION RESULTS');
        console.log('='.repeat(60));

        const allChecksPassed =
            results.checks.messageSquareErrors &&
            results.checks.retentionSectionExists &&
            results.checks.lucideErrors &&
            results.errors.length === 0;

        if (allChecksPassed) {
            console.log('✅ MESSAGE SQUARE FIX VERIFIED - All checks passed!');
            console.log('   - No MessageSquare errors detected');
            console.log('   - RetentionAnalysis section renders correctly');
            console.log('   - No console errors found');
            console.log('\n🎉 The dashboard is working correctly!');
        } else {
            console.log('⚠️  ISSUES DETECTED:');
            if (!results.checks.messageSquareErrors) {
                console.log('   ❌ MessageSquare errors still present');
            }
            if (!results.checks.retentionSectionExists) {
                console.log('   ❌ RetentionAnalysis section not found');
            }
            if (results.errors.length > 0) {
                console.log(`   ❌ ${results.errors.length} console errors detected`);
            }
        }

        // Save detailed results
        const resultsPath = path.join(__dirname, 'message-square-verification-results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log(`\n📊 Detailed results saved: ${resultsPath}`);

        return allChecksPassed ? 0 : 1;

    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        results.fatalError = error.message;
        return 1;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the verification
verifyMessageSquareFix().then(exitCode => {
    console.log('\n' + '='.repeat(60) + '\n');
    process.exit(exitCode);
}).catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});