/**
 * BOMBO Dashboard UI Changes Validation Test Suite
 * Test Engineer: Universal Tester
 * Date: 2025-09-24
 *
 * Purpose: Validate specific UI changes made to the BOMBO dashboard
 * Framework: Playwright
 * Target URL: http://localhost:3001
 *
 * Test Coverage:
 * 1. Hero section title and subtitle changes
 * 2. Button removal verification
 * 3. KPI cards content verification
 * 4. Section titles size changes
 * 5. Growth Trajectory section relocation
 * 6. Financial Metrics section validation
 * 7. Executive Overview modifications
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3002',
  timeout: 30000,
  retries: 2,
  viewport: { width: 1920, height: 1080 },
  screenshotDir: path.join(__dirname, 'screenshots', 'ui-changes'),
  reportDir: path.join(__dirname, 'reports')
};

// Expected text sizes based on requirements
const EXPECTED_SIZES = {
  mainTitle: 'text-4xl', // Changed from text-6xl
  sectionTitles: 'text-3xl', // Changed from text-5xl
};

// Expected KPI metrics in hero section
const EXPECTED_HERO_METRICS = [
  { label: 'CAC', expectedPresence: true },
  { label: 'Peak MAU', expectedPresence: true },
  { label: 'Tickets Sold', expectedPresence: true },
  { label: '90-Day Churn', expectedPresence: true },
  { label: 'Buyer Retention', expectedPresence: false }, // Should NOT be present
  { label: 'Contribution Margin', expectedPresence: false } // Should NOT be present in hero
];

// Test results storage
let testResults = {
  timestamp: new Date().toISOString(),
  url: TEST_CONFIG.baseURL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

test.describe('BOMBO Dashboard UI Changes Validation', () => {
  test.beforeAll(async () => {
    // Create screenshot directory if it doesn't exist
    await fs.mkdir(TEST_CONFIG.screenshotDir, { recursive: true });
    await fs.mkdir(TEST_CONFIG.reportDir, { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    // Set viewport and navigate to dashboard
    await page.setViewportSize(TEST_CONFIG.viewport);
    await page.goto(TEST_CONFIG.baseURL, {
      waitUntil: 'networkidle',
      timeout: TEST_CONFIG.timeout
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Allow animations to complete
  });

  test('1. Verify Hero Section Title Size Change', async ({ page }) => {
    const testCase = {
      name: 'Hero Section Title Size',
      status: 'pending',
      details: {}
    };

    try {
      // Check main title
      const mainTitle = await page.locator('h1:has-text("BOMBO")').first();
      await expect(mainTitle).toBeVisible();

      // Get class attribute to verify size
      const titleClasses = await mainTitle.getAttribute('class');

      // Verify text-4xl is present (not text-6xl)
      if (titleClasses.includes('text-4xl') && !titleClasses.includes('text-6xl')) {
        testCase.status = 'passed';
        testCase.details.message = 'Main title correctly uses text-4xl';
      } else if (titleClasses.includes('text-6xl')) {
        testCase.status = 'failed';
        testCase.details.message = 'Main title still uses text-6xl instead of text-4xl';
        testCase.details.actualClasses = titleClasses;
      } else {
        testCase.status = 'warning';
        testCase.details.message = 'Main title size class not clearly identified';
        testCase.details.actualClasses = titleClasses;
      }

      // Take screenshot for evidence
      await page.screenshot({
        path: path.join(TEST_CONFIG.screenshotDir, 'hero-title-size.png'),
        clip: await mainTitle.boundingBox()
      });

    } catch (error) {
      testCase.status = 'failed';
      testCase.details.error = error.message;
    }

    testResults.tests.push(testCase);
  });

  test('2. Verify Subtitle Removal from Hero Section', async ({ page }) => {
    const testCase = {
      name: 'Hero Section Subtitle Removal',
      status: 'pending',
      details: {}
    };

    try {
      // Check that subtitle is NOT present
      const subtitleSelectors = [
        'text="Transforming"',
        'text="entertainment industry"',
        'text="innovative"',
        'p:has-text("Transforming")'
      ];

      let subtitleFound = false;
      for (const selector of subtitleSelectors) {
        const element = await page.locator(selector).first();
        if (await element.count() > 0) {
          subtitleFound = true;
          testCase.details.foundSelector = selector;
          break;
        }
      }

      if (!subtitleFound) {
        testCase.status = 'passed';
        testCase.details.message = 'Subtitle correctly removed from hero section';
      } else {
        testCase.status = 'failed';
        testCase.details.message = 'Subtitle still present in hero section';
      }

      // Screenshot hero section
      await page.screenshot({
        path: path.join(TEST_CONFIG.screenshotDir, 'hero-subtitle-check.png'),
        fullPage: false
      });

    } catch (error) {
      testCase.status = 'failed';
      testCase.details.error = error.message;
    }

    testResults.tests.push(testCase);
  });

  test('3. Verify "Explore Investment Opportunity" Button Removal', async ({ page }) => {
    const testCase = {
      name: 'Investment Button Removal',
      status: 'pending',
      details: {}
    };

    try {
      // Check that the button is NOT present
      const buttonSelectors = [
        'button:has-text("Explore Investment Opportunity")',
        'a:has-text("Explore Investment Opportunity")',
        'text="Explore Investment Opportunity"'
      ];

      let buttonFound = false;
      for (const selector of buttonSelectors) {
        const element = await page.locator(selector);
        if (await element.count() > 0) {
          buttonFound = true;
          testCase.details.foundSelector = selector;
          break;
        }
      }

      if (!buttonFound) {
        testCase.status = 'passed';
        testCase.details.message = 'Button correctly removed from hero section';
      } else {
        testCase.status = 'failed';
        testCase.details.message = '"Explore Investment Opportunity" button still present';
      }

    } catch (error) {
      testCase.status = 'failed';
      testCase.details.error = error.message;
    }

    testResults.tests.push(testCase);
  });

  test('4. Verify Hero Section KPI Metrics', async ({ page }) => {
    const testCase = {
      name: 'Hero Section KPI Metrics',
      status: 'pending',
      details: {
        metrics: []
      }
    };

    try {
      let allCorrect = true;

      for (const metric of EXPECTED_HERO_METRICS) {
        const metricLocator = await page.locator(`text="${metric.label}"`).first();
        const isPresent = await metricLocator.count() > 0;

        const metricTest = {
          label: metric.label,
          expected: metric.expectedPresence,
          actual: isPresent,
          passed: isPresent === metric.expectedPresence
        };

        if (!metricTest.passed) {
          allCorrect = false;
        }

        testCase.details.metrics.push(metricTest);
      }

      testCase.status = allCorrect ? 'passed' : 'failed';
      testCase.details.message = allCorrect
        ? 'All KPI metrics correctly displayed/removed'
        : 'Some KPI metrics are incorrect';

      // Screenshot KPI section
      await page.screenshot({
        path: path.join(TEST_CONFIG.screenshotDir, 'hero-kpi-metrics.png')
      });

    } catch (error) {
      testCase.status = 'failed';
      testCase.details.error = error.message;
    }

    testResults.tests.push(testCase);
  });

  test('5. Verify Section Titles Size Changes', async ({ page }) => {
    const testCase = {
      name: 'Section Titles Size',
      status: 'pending',
      details: {
        sections: []
      }
    };

    try {
      // Section titles to check
      const sectionTitles = [
        'Executive Overview',
        'Growth Trajectory',
        'Financial Metrics',
        'Marketing Performance',
        'Product & Technology'
      ];

      let allCorrect = true;

      for (const title of sectionTitles) {
        const titleLocator = await page.locator(`h2:has-text("${title}")`).first();

        if (await titleLocator.count() > 0) {
          const classes = await titleLocator.getAttribute('class');
          const hasCorrectSize = classes.includes('text-3xl') && !classes.includes('text-5xl');

          testCase.details.sections.push({
            title,
            hasCorrectSize,
            classes
          });

          if (!hasCorrectSize) {
            allCorrect = false;
          }
        }
      }

      testCase.status = allCorrect ? 'passed' : 'failed';
      testCase.details.message = allCorrect
        ? 'All section titles use text-3xl'
        : 'Some section titles still use text-5xl';

    } catch (error) {
      testCase.status = 'failed';
      testCase.details.error = error.message;
    }

    testResults.tests.push(testCase);
  });

  test('6. Verify Growth Trajectory Section Placement', async ({ page }) => {
    const testCase = {
      name: 'Growth Trajectory Section Placement',
      status: 'pending',
      details: {}
    };

    try {
      // Get all section headers in order
      const sections = await page.locator('h2').allTextContents();

      // Find indices
      const executiveIndex = sections.findIndex(s => s.includes('Executive Overview'));
      const growthIndex = sections.findIndex(s => s.includes('Growth Trajectory'));

      if (executiveIndex !== -1 && growthIndex !== -1) {
        if (growthIndex === executiveIndex + 1) {
          testCase.status = 'passed';
          testCase.details.message = 'Growth Trajectory correctly placed after Executive Overview';
        } else {
          testCase.status = 'failed';
          testCase.details.message = 'Growth Trajectory not immediately after Executive Overview';
          testCase.details.actualOrder = sections;
        }
      } else {
        testCase.status = 'failed';
        testCase.details.message = 'Could not find required sections';
        testCase.details.foundSections = sections;
      }

      // Scroll to and screenshot Growth Trajectory section
      const growthSection = await page.locator('h2:has-text("Growth Trajectory")').first();
      if (await growthSection.count() > 0) {
        await growthSection.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: path.join(TEST_CONFIG.screenshotDir, 'growth-trajectory-placement.png')
        });
      }

    } catch (error) {
      testCase.status = 'failed';
      testCase.details.error = error.message;
    }

    testResults.tests.push(testCase);
  });

  test('7. Verify Financial Metrics Section Content', async ({ page }) => {
    const testCase = {
      name: 'Financial Metrics Section',
      status: 'pending',
      details: {
        tables: [],
        metrics: []
      }
    };

    try {
      // Scroll to Financial Metrics section
      const financialSection = await page.locator('h2:has-text("Financial Metrics")').first();
      await financialSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      // Check for Financial Performance table
      const perfTable = await page.locator('table').filter({ hasText: '2023' }).first();
      const hasFinancialTable = await perfTable.count() > 0;

      if (hasFinancialTable) {
        // Check for years 2023, 2024, 2025
        const years = ['2023', '2024', '2025'];
        for (const year of years) {
          const yearCell = await page.locator(`td:has-text("${year}")`).count();
          testCase.details.tables.push({
            year,
            found: yearCell > 0
          });
        }
      }

      // Check for Customer Economics table
      const customerMetrics = ['Customer Acquisition Cost', 'Average Order Value', 'Purchase Frequency'];
      for (const metric of customerMetrics) {
        const metricFound = await page.locator(`text="${metric}"`).count() > 0;
        testCase.details.metrics.push({
          metric,
          found: metricFound
        });
      }

      // Check for Contribution Margin and COGS
      const contributionMargin = await page.locator('text="Contribution Margin"').count() > 0;
      const cogs = await page.locator('text=/COGS|Cost of Goods/i').count() > 0;

      testCase.details.hasContributionMargin = contributionMargin;
      testCase.details.hasCOGS = cogs;

      // Determine test status
      const allTablesCorrect = testCase.details.tables.every(t => t.found);
      const allMetricsCorrect = testCase.details.metrics.every(m => m.found);

      if (allTablesCorrect && allMetricsCorrect && contributionMargin) {
        testCase.status = 'passed';
        testCase.details.message = 'Financial Metrics section correctly displays all required elements';
      } else {
        testCase.status = 'failed';
        testCase.details.message = 'Some Financial Metrics elements are missing';
      }

      // Screenshot Financial Metrics section
      await page.screenshot({
        path: path.join(TEST_CONFIG.screenshotDir, 'financial-metrics-section.png')
      });

    } catch (error) {
      testCase.status = 'failed';
      testCase.details.error = error.message;
    }

    testResults.tests.push(testCase);
  });

  test('8. Verify Executive Overview Timeline Removal', async ({ page }) => {
    const testCase = {
      name: 'Executive Overview Timeline Check',
      status: 'pending',
      details: {}
    };

    try {
      // Scroll to Executive Overview
      const execSection = await page.locator('h2:has-text("Executive Overview")').first();
      await execSection.scrollIntoViewIfNeeded();

      // Get the parent section
      const sectionContent = await execSection.locator('..').first();

      // Check that Growth Trajectory timeline is NOT in Executive Overview
      const timelineInExec = await sectionContent.locator('text="Growth Trajectory"').count();
      const hasTimeline = await sectionContent.locator('.timeline, [class*="timeline"]').count();

      if (timelineInExec === 0 && hasTimeline === 0) {
        testCase.status = 'passed';
        testCase.details.message = 'Growth Trajectory timeline correctly removed from Executive Overview';
      } else {
        testCase.status = 'failed';
        testCase.details.message = 'Growth Trajectory elements still present in Executive Overview';
        testCase.details.timelineElements = timelineInExec;
      }

      // Screenshot Executive Overview
      await page.screenshot({
        path: path.join(TEST_CONFIG.screenshotDir, 'executive-overview-check.png')
      });

    } catch (error) {
      testCase.status = 'failed';
      testCase.details.error = error.message;
    }

    testResults.tests.push(testCase);
  });

  test.afterAll(async () => {
    // Calculate summary
    testResults.summary.total = testResults.tests.length;
    testResults.summary.passed = testResults.tests.filter(t => t.status === 'passed').length;
    testResults.summary.failed = testResults.tests.filter(t => t.status === 'failed').length;
    testResults.summary.warnings = testResults.tests.filter(t => t.status === 'warning').length;

    // Generate report
    const reportPath = path.join(TEST_CONFIG.reportDir, `ui-changes-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));

    // Generate markdown report
    const markdownReport = generateMarkdownReport(testResults);
    const mdReportPath = path.join(TEST_CONFIG.reportDir, `ui-changes-report-${Date.now()}.md`);
    await fs.writeFile(mdReportPath, markdownReport);

    console.log('\n========================================');
    console.log('UI CHANGES VALIDATION COMPLETE');
    console.log('========================================');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Warnings: ${testResults.summary.warnings}`);
    console.log(`\nReports saved to: ${TEST_CONFIG.reportDir}`);
    console.log(`Screenshots saved to: ${TEST_CONFIG.screenshotDir}`);
  });
});

function generateMarkdownReport(results) {
  let report = `# BOMBO Dashboard UI Changes Validation Report\n\n`;
  report += `**Date:** ${results.timestamp}\n`;
  report += `**URL:** ${results.url}\n\n`;

  report += `## Summary\n\n`;
  report += `- **Total Tests:** ${results.summary.total}\n`;
  report += `- **Passed:** ${results.summary.passed} ✅\n`;
  report += `- **Failed:** ${results.summary.failed} ❌\n`;
  report += `- **Warnings:** ${results.summary.warnings} ⚠️\n\n`;

  report += `## Test Results\n\n`;

  results.tests.forEach((test, index) => {
    const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️';
    report += `### ${index + 1}. ${test.name} ${icon}\n\n`;
    report += `**Status:** ${test.status.toUpperCase()}\n\n`;

    if (test.details.message) {
      report += `**Result:** ${test.details.message}\n\n`;
    }

    if (test.details.metrics) {
      report += `**Metrics Verification:**\n`;
      test.details.metrics.forEach(m => {
        const icon = m.passed ? '✅' : '❌';
        report += `- ${m.label}: Expected ${m.expected ? 'present' : 'absent'}, Actually ${m.actual ? 'present' : 'absent'} ${icon}\n`;
      });
      report += '\n';
    }

    if (test.details.sections) {
      report += `**Section Titles:**\n`;
      test.details.sections.forEach(s => {
        const icon = s.hasCorrectSize ? '✅' : '❌';
        report += `- ${s.title}: ${s.hasCorrectSize ? 'Correct size (text-3xl)' : 'Incorrect size'} ${icon}\n`;
      });
      report += '\n';
    }

    if (test.details.error) {
      report += `**Error:** ${test.details.error}\n\n`;
    }
  });

  report += `## Recommendations\n\n`;

  if (results.summary.failed > 0) {
    report += `### Issues Found:\n\n`;
    results.tests.filter(t => t.status === 'failed').forEach(test => {
      report += `- **${test.name}:** ${test.details.message || test.details.error}\n`;
    });
    report += '\n';
  }

  if (results.summary.failed === 0) {
    report += `✅ All UI changes have been successfully implemented and verified.\n\n`;
  } else {
    report += `❌ Some UI changes are not correctly implemented. Please review the failed tests above.\n\n`;
  }

  return report;
}

module.exports = { TEST_CONFIG, EXPECTED_SIZES, EXPECTED_HERO_METRICS };