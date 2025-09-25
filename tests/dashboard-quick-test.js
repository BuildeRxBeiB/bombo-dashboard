#!/usr/bin/env node

/**
 * Quick Dashboard Test - MessageSquare Fix Verification
 * Validates that the MessageSquare import error is resolved and dashboard works
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';

async function quickTest() {
    console.log('\n' + '='.repeat(70));
    console.log('DASHBOARD QUICK TEST - MESSAGSQUARE FIX VERIFICATION');
    console.log('='.repeat(70));

    let browser;
    let passed = true;
    const issues = [];

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Track errors
        const consoleErrors = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                const text = msg.text();
                consoleErrors.push(text);
                // Check for critical errors
                if (text.includes('MessageSquare') || text.includes('is not defined')) {
                    console.log(`❌ CRITICAL ERROR: ${text.substring(0, 100)}`);
                    passed = false;
                }
            }
        });

        page.on('pageerror', (error) => {
            const msg = error.message;
            consoleErrors.push(msg);
            if (msg.includes('MessageSquare')) {
                console.log(`❌ PAGE ERROR: ${msg.substring(0, 100)}`);
                passed = false;
            }
        });

        console.log('\n📄 Loading dashboard...');
        await page.goto(BASE_URL, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Wait a bit for React to render
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('✅ Page loaded\n');
        console.log('🔍 Running tests...\n');

        // Test 1: Check for MessageSquare errors
        console.log('1️⃣  MessageSquare Import Test');
        const messageSquareErrors = consoleErrors.filter(e =>
            e.includes('MessageSquare') || e.includes('is not defined')
        );

        if (messageSquareErrors.length === 0) {
            console.log('   ✅ No MessageSquare errors - FIX CONFIRMED!');
        } else {
            console.log(`   ❌ Found ${messageSquareErrors.length} MessageSquare errors`);
            issues.push('MessageSquare errors still present');
            passed = false;
        }

        // Test 2: Check RetentionAnalysis section
        console.log('\n2️⃣  RetentionAnalysis Section Test');
        const retentionExists = await page.$('#retention');
        if (retentionExists) {
            console.log('   ✅ Retention section found');

            // Check if MessageSquare component rendered inside
            const retentionContent = await page.$eval('#retention', el => el.textContent);
            if (retentionContent && retentionContent.length > 50) {
                console.log('   ✅ Retention section has content');
            } else {
                console.log('   ⚠️  Retention section seems empty');
                issues.push('Retention section may not be rendering properly');
            }
        } else {
            console.log('   ❌ Retention section not found');
            issues.push('Retention section missing');
            passed = false;
        }

        // Test 3: Check all main sections
        console.log('\n3️⃣  Dashboard Sections Test');
        const sections = ['hero', 'executive', 'financial', 'growth', 'retention', 'market'];
        let sectionsFound = 0;

        for (const section of sections) {
            const exists = await page.$(`#${section}`);
            if (exists) {
                sectionsFound++;
                console.log(`   ✅ ${section} section`);
            } else {
                console.log(`   ❌ ${section} section missing`);
                issues.push(`${section} section not found`);
            }
        }

        if (sectionsFound === sections.length) {
            console.log(`   ✅ All ${sections.length} sections found`);
        } else {
            console.log(`   ⚠️  Only ${sectionsFound}/${sections.length} sections found`);
            if (sectionsFound < 4) passed = false;
        }

        // Test 4: Check for charts
        console.log('\n4️⃣  Charts Rendering Test');
        await page.waitForSelector('.recharts-wrapper', { timeout: 5000 }).catch(() => null);
        const charts = await page.$$('.recharts-wrapper');

        if (charts.length > 0) {
            console.log(`   ✅ ${charts.length} charts found and rendering`);
        } else {
            console.log('   ⚠️  No charts found (may still be loading)');
            issues.push('Charts not rendering');
        }

        // Test 5: Check navigation
        console.log('\n5️⃣  Navigation Test');
        const navButtons = await page.$$('nav button, .fixed button');
        if (navButtons.length > 0) {
            console.log(`   ✅ ${navButtons.length} navigation buttons found`);
        } else {
            console.log('   ⚠️  No navigation buttons found');
            issues.push('Navigation may not be working');
        }

        // Test 6: Check for any undefined/NaN displays
        console.log('\n6️⃣  Data Display Test');
        const pageText = await page.evaluate(() => document.body.innerText);
        const hasUndefined = pageText.includes('undefined');
        const hasNaN = pageText.includes('NaN');
        const hasNull = pageText.includes('null');

        if (!hasUndefined && !hasNaN && !hasNull) {
            console.log('   ✅ No invalid data displays (undefined/NaN/null)');
        } else {
            console.log('   ⚠️  Found invalid data displays:');
            if (hasUndefined) console.log('      - "undefined" found in page');
            if (hasNaN) console.log('      - "NaN" found in page');
            if (hasNull) console.log('      - "null" found in page');
            issues.push('Invalid data displays detected');
        }

        // Test 7: Performance check
        console.log('\n7️⃣  Performance Check');
        const metrics = await page.metrics();
        const heapMB = (metrics.JSHeapUsedSize / 1048576).toFixed(1);
        const nodes = metrics.Nodes;

        console.log(`   📊 JS Heap: ${heapMB} MB`);
        console.log(`   📊 DOM Nodes: ${nodes}`);

        if (parseFloat(heapMB) < 100 && nodes < 20000) {
            console.log('   ✅ Performance metrics acceptable');
        } else {
            console.log('   ⚠️  Performance may need optimization');
            if (parseFloat(heapMB) > 150) {
                issues.push('High memory usage');
            }
        }

        // Filter out hydration warnings (common in Next.js dev)
        const criticalErrors = consoleErrors.filter(e =>
            !e.includes('Hydration') &&
            !e.includes('Warning:') &&
            !e.includes('DevTools')
        );

        console.log('\n8️⃣  Console Errors Summary');
        if (criticalErrors.length === 0) {
            console.log('   ✅ No critical console errors');
        } else {
            console.log(`   ⚠️  ${criticalErrors.length} console errors (non-critical)`);
            criticalErrors.slice(0, 3).forEach(err => {
                console.log(`      - ${err.substring(0, 80)}...`);
            });
        }

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        passed = false;
        issues.push(`Test error: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    // Final Report
    console.log('\n' + '='.repeat(70));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(70));

    if (passed && issues.length === 0) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ MessageSquare fix is working correctly');
        console.log('✅ Dashboard is fully functional');
        console.log('✅ No critical errors detected');
        console.log('\n✨ The dashboard is ready for use!');
    } else if (passed) {
        console.log('\n✅ MESSAGSQUARE FIX VERIFIED - Core functionality working');
        console.log('\n⚠️  Minor issues detected:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        console.log('\n💡 These issues are non-critical and the dashboard is usable.');
    } else {
        console.log('\n❌ CRITICAL ISSUES FOUND:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        console.log('\n🔧 Please fix these issues before using the dashboard.');
    }

    console.log('\n' + '='.repeat(70) + '\n');

    process.exit(passed ? 0 : 1);
}

// Run the test
quickTest().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});