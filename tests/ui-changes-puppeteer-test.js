/**
 * BOMBO Dashboard UI Changes Validation with Puppeteer
 * Test Engineer: Universal Tester
 * Date: 2025-09-24
 *
 * This script validates all specified UI changes using Puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3002';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'ui-validation');
const REPORT_DIR = path.join(__dirname, 'reports');

// Test results collector
const testResults = {
  timestamp: new Date().toISOString(),
  url: BASE_URL,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
};

// Helper function to add test result
function addTestResult(name, status, details = {}) {
  testResults.tests.push({
    name,
    status,
    details,
    timestamp: new Date().toISOString()
  });
  testResults.summary.total++;
  if (status === 'passed') testResults.summary.passed++;
  if (status === 'failed') testResults.summary.failed++;
}

// Main test execution
async function runTests() {
  console.log('Starting BOMBO Dashboard UI Validation Tests...\n');

  // Create directories
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  await fs.mkdir(REPORT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  try {
    const page = await browser.newPage();

    // Navigate to dashboard
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForFunction(() => document.readyState === 'complete');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for animations

    // Test 1: Main Title Size (should be text-4xl, not text-6xl)
    console.log('Test 1: Verifying main title size...');
    try {
      const titleElement = await page.$('h1');
      if (titleElement) {
        const titleClass = await page.evaluate(el => el.className, titleElement);
        const hasCorrectSize = titleClass.includes('text-4xl') && !titleClass.includes('text-6xl');

        if (hasCorrectSize) {
          addTestResult('Main Title Size', 'passed', {
            message: 'Title correctly uses text-4xl',
            classes: titleClass
          });
        } else {
          addTestResult('Main Title Size', 'failed', {
            message: 'Title does not use text-4xl or still uses text-6xl',
            classes: titleClass
          });
        }

        // Screenshot
        await titleElement.screenshot({
          path: path.join(SCREENSHOT_DIR, '1-main-title.png')
        });
      } else {
        addTestResult('Main Title Size', 'failed', {
          message: 'Main title (h1) not found'
        });
      }
    } catch (error) {
      addTestResult('Main Title Size', 'failed', {
        error: error.message
      });
    }

    // Test 2: Subtitle Removal
    console.log('Test 2: Verifying subtitle removal...');
    try {
      const subtitleTexts = [
        'Transforming',
        'entertainment industry',
        'innovative'
      ];

      let subtitleFound = false;
      for (const text of subtitleTexts) {
        const elements = await page.$$(`text/${text}`);
        if (elements.length > 0) {
          subtitleFound = true;
          break;
        }
      }

      if (!subtitleFound) {
        addTestResult('Subtitle Removal', 'passed', {
          message: 'Subtitle correctly removed from hero section'
        });
      } else {
        addTestResult('Subtitle Removal', 'failed', {
          message: 'Subtitle text still present in hero section'
        });
      }

      // Screenshot hero area
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '2-hero-section.png'),
        clip: { x: 0, y: 0, width: 1920, height: 600 }
      });
    } catch (error) {
      addTestResult('Subtitle Removal', 'failed', {
        error: error.message
      });
    }

    // Test 3: Button Removal
    console.log('Test 3: Verifying button removal...');
    try {
      const buttonText = 'Explore Investment Opportunity';
      const buttonElement = await page.$(`button::-p-text(${buttonText}), a::-p-text(${buttonText})`);

      if (!buttonElement) {
        addTestResult('Button Removal', 'passed', {
          message: '"Explore Investment Opportunity" button correctly removed'
        });
      } else {
        addTestResult('Button Removal', 'failed', {
          message: 'Button still present in hero section'
        });
      }
    } catch (error) {
      addTestResult('Button Removal', 'failed', {
        error: error.message
      });
    }

    // Test 4: Hero KPI Metrics
    console.log('Test 4: Verifying hero KPI metrics...');
    try {
      const expectedMetrics = {
        'CAC': true,
        'Peak MAU': true,
        'Tickets Sold': true,
        '90-Day Churn': true,
        'Buyer Retention': false,
        'Contribution Margin': false
      };

      const metricResults = [];
      for (const [metric, shouldExist] of Object.entries(expectedMetrics)) {
        const elements = await page.$$(`text/${metric}`);
        const exists = elements.length > 0;
        const correct = exists === shouldExist;

        metricResults.push({
          metric,
          expected: shouldExist,
          found: exists,
          correct
        });
      }

      const allCorrect = metricResults.every(r => r.correct);

      if (allCorrect) {
        addTestResult('Hero KPI Metrics', 'passed', {
          message: 'All KPI metrics correctly displayed/removed',
          metrics: metricResults
        });
      } else {
        addTestResult('Hero KPI Metrics', 'failed', {
          message: 'Some KPI metrics are incorrect',
          metrics: metricResults
        });
      }

      // Screenshot KPI section
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '4-kpi-metrics.png'),
        fullPage: false
      });
    } catch (error) {
      addTestResult('Hero KPI Metrics', 'failed', {
        error: error.message
      });
    }

    // Test 5: Section Title Sizes
    console.log('Test 5: Verifying section title sizes...');
    try {
      const sectionTitles = [
        'Executive Overview',
        'Growth Trajectory',
        'Financial Metrics',
        'Marketing Performance',
        'Product & Technology'
      ];

      const sectionResults = [];
      for (const title of sectionTitles) {
        const elements = await page.$$(`h2::-p-text(${title})`);
        if (elements.length > 0) {
          const element = elements[0];
          const className = await page.evaluate(el => el.className, element);
          const hasCorrectSize = className.includes('text-3xl') && !className.includes('text-5xl');

          sectionResults.push({
            title,
            hasCorrectSize,
            classes: className
          });
        }
      }

      const allCorrect = sectionResults.every(r => r.hasCorrectSize);

      if (allCorrect) {
        addTestResult('Section Title Sizes', 'passed', {
          message: 'All section titles use text-3xl',
          sections: sectionResults
        });
      } else {
        addTestResult('Section Title Sizes', 'failed', {
          message: 'Some section titles do not use text-3xl',
          sections: sectionResults
        });
      }
    } catch (error) {
      addTestResult('Section Title Sizes', 'failed', {
        error: error.message
      });
    }

    // Test 6: Growth Trajectory Placement
    console.log('Test 6: Verifying Growth Trajectory placement...');
    try {
      const h2Elements = await page.$$eval('h2', elements =>
        elements.map(el => el.textContent.trim())
      );

      const execIndex = h2Elements.findIndex(text => text.includes('Executive Overview'));
      const growthIndex = h2Elements.findIndex(text => text.includes('Growth Trajectory'));

      if (execIndex !== -1 && growthIndex !== -1) {
        if (growthIndex === execIndex + 1) {
          addTestResult('Growth Trajectory Placement', 'passed', {
            message: 'Growth Trajectory correctly placed after Executive Overview',
            order: h2Elements
          });
        } else {
          addTestResult('Growth Trajectory Placement', 'failed', {
            message: 'Growth Trajectory not immediately after Executive Overview',
            order: h2Elements,
            execIndex,
            growthIndex
          });
        }
      } else {
        addTestResult('Growth Trajectory Placement', 'failed', {
          message: 'Could not find required sections',
          foundSections: h2Elements
        });
      }

      // Scroll to Growth Trajectory and screenshot
      const growthSection = await page.$('h2::-p-text(Growth Trajectory)');
      if (growthSection) {
        await growthSection.scrollIntoView();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, '6-growth-trajectory.png')
        });
      }
    } catch (error) {
      addTestResult('Growth Trajectory Placement', 'failed', {
        error: error.message
      });
    }

    // Test 7: Financial Metrics Section
    console.log('Test 7: Verifying Financial Metrics section...');
    try {
      // Scroll to Financial Metrics
      const financialSection = await page.$('h2::-p-text(Financial Metrics)');
      if (financialSection) {
        await financialSection.scrollIntoView();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Check for year data
      const years = ['2023', '2024', '2025'];
      const yearResults = [];
      for (const year of years) {
        const elements = await page.$$(`td::-p-text(${year}), th::-p-text(${year})`);
        yearResults.push({
          year,
          found: elements.length > 0
        });
      }

      // Check for customer metrics
      const customerMetrics = [
        'Customer Acquisition Cost',
        'Average Order Value',
        'Purchase Frequency'
      ];

      const metricResults = [];
      for (const metric of customerMetrics) {
        const elements = await page.$$(`text/${metric}`);
        metricResults.push({
          metric,
          found: elements.length > 0
        });
      }

      // Check for Contribution Margin and COGS
      const contribMargin = await page.$$('text/Contribution Margin');
      const cogs = await page.$$('text/COGS');

      const hasAllElements =
        yearResults.every(y => y.found) &&
        metricResults.some(m => m.found) &&
        contribMargin.length > 0;

      if (hasAllElements) {
        addTestResult('Financial Metrics Section', 'passed', {
          message: 'Financial Metrics section contains required elements',
          years: yearResults,
          metrics: metricResults,
          hasContributionMargin: contribMargin.length > 0,
          hasCOGS: cogs.length > 0
        });
      } else {
        addTestResult('Financial Metrics Section', 'failed', {
          message: 'Some Financial Metrics elements are missing',
          years: yearResults,
          metrics: metricResults,
          hasContributionMargin: contribMargin.length > 0,
          hasCOGS: cogs.length > 0
        });
      }

      // Screenshot Financial section
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '7-financial-metrics.png')
      });
    } catch (error) {
      addTestResult('Financial Metrics Section', 'failed', {
        error: error.message
      });
    }

    // Test 8: Executive Overview Timeline Check
    console.log('Test 8: Verifying Executive Overview timeline removal...');
    try {
      // Find Executive Overview section
      const execSection = await page.$('h2::-p-text(Executive Overview)');
      if (execSection) {
        await execSection.scrollIntoView();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check for timeline elements within Executive Overview section
        const parentSection = await execSection.evaluateHandle(el => el.closest('section') || el.parentElement.parentElement);

        const hasTimeline = await parentSection.evaluate(section => {
          const timelineElements = section.querySelectorAll('.timeline, [class*="timeline"]');
          const growthText = section.textContent.includes('Growth Trajectory');
          return timelineElements.length > 0 || growthText;
        });

        if (!hasTimeline) {
          addTestResult('Executive Overview Timeline', 'passed', {
            message: 'Timeline correctly removed from Executive Overview'
          });
        } else {
          addTestResult('Executive Overview Timeline', 'failed', {
            message: 'Timeline elements still present in Executive Overview'
          });
        }

        // Screenshot Executive Overview
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, '8-executive-overview.png')
        });
      } else {
        addTestResult('Executive Overview Timeline', 'failed', {
          message: 'Executive Overview section not found'
        });
      }
    } catch (error) {
      addTestResult('Executive Overview Timeline', 'failed', {
        error: error.message
      });
    }

    // Take full page screenshot
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'full-dashboard.png'),
      fullPage: true
    });

  } catch (error) {
    console.error('Critical test error:', error);
    addTestResult('Critical Error', 'failed', {
      error: error.message
    });
  } finally {
    await browser.close();
  }

  // Generate reports
  await generateReports();
}

// Generate test reports
async function generateReports() {
  // JSON report
  const jsonReportPath = path.join(REPORT_DIR, `ui-validation-report-${Date.now()}.json`);
  await fs.writeFile(jsonReportPath, JSON.stringify(testResults, null, 2));

  // Markdown report
  let mdReport = `# BOMBO Dashboard UI Changes Validation Report\n\n`;
  mdReport += `**Date:** ${testResults.timestamp}\n`;
  mdReport += `**URL:** ${testResults.url}\n\n`;

  mdReport += `## Summary\n\n`;
  mdReport += `- **Total Tests:** ${testResults.summary.total}\n`;
  mdReport += `- **Passed:** ${testResults.summary.passed} ✅\n`;
  mdReport += `- **Failed:** ${testResults.summary.failed} ❌\n\n`;

  mdReport += `## Test Results\n\n`;

  testResults.tests.forEach((test, index) => {
    const icon = test.status === 'passed' ? '✅' : '❌';
    mdReport += `### ${index + 1}. ${test.name} ${icon}\n\n`;
    mdReport += `**Status:** ${test.status.toUpperCase()}\n`;

    if (test.details.message) {
      mdReport += `**Result:** ${test.details.message}\n`;
    }

    if (test.details.metrics) {
      mdReport += `\n**Metrics Details:**\n`;
      test.details.metrics.forEach(m => {
        const icon = m.correct ? '✅' : '❌';
        mdReport += `- ${m.metric}: Expected ${m.expected ? 'present' : 'absent'}, Found ${m.found ? 'present' : 'absent'} ${icon}\n`;
      });
    }

    if (test.details.sections) {
      mdReport += `\n**Section Details:**\n`;
      test.details.sections.forEach(s => {
        const icon = s.hasCorrectSize ? '✅' : '❌';
        mdReport += `- ${s.title}: ${s.hasCorrectSize ? 'Correct size' : 'Incorrect size'} ${icon}\n`;
      });
    }

    if (test.details.error) {
      mdReport += `**Error:** ${test.details.error}\n`;
    }

    mdReport += `\n---\n\n`;
  });

  mdReport += `## Issues Found\n\n`;

  const failedTests = testResults.tests.filter(t => t.status === 'failed');
  if (failedTests.length === 0) {
    mdReport += `✅ All UI changes have been successfully implemented!\n\n`;
  } else {
    mdReport += `The following issues need attention:\n\n`;
    failedTests.forEach(test => {
      mdReport += `- **${test.name}:** ${test.details.message || test.details.error}\n`;
    });
  }

  mdReport += `\n## Screenshots\n\n`;
  mdReport += `Screenshots have been saved to: ${SCREENSHOT_DIR}\n\n`;
  mdReport += `- 1-main-title.png - Main title verification\n`;
  mdReport += `- 2-hero-section.png - Hero section overview\n`;
  mdReport += `- 4-kpi-metrics.png - KPI metrics display\n`;
  mdReport += `- 6-growth-trajectory.png - Growth Trajectory section\n`;
  mdReport += `- 7-financial-metrics.png - Financial Metrics section\n`;
  mdReport += `- 8-executive-overview.png - Executive Overview section\n`;
  mdReport += `- full-dashboard.png - Full dashboard screenshot\n`;

  const mdReportPath = path.join(REPORT_DIR, `ui-validation-report-${Date.now()}.md`);
  await fs.writeFile(mdReportPath, mdReport);

  // Console output
  console.log('\n========================================');
  console.log('UI VALIDATION TEST RESULTS');
  console.log('========================================');
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed} ✅`);
  console.log(`Failed: ${testResults.summary.failed} ❌`);
  console.log('========================================\n');

  testResults.tests.forEach((test, index) => {
    const icon = test.status === 'passed' ? '✅' : '❌';
    console.log(`${index + 1}. ${test.name}: ${test.status.toUpperCase()} ${icon}`);
    if (test.details.message) {
      console.log(`   ${test.details.message}`);
    }
  });

  console.log('\n========================================');
  console.log('REPORTS GENERATED:');
  console.log(`- JSON Report: ${jsonReportPath}`);
  console.log(`- Markdown Report: ${mdReportPath}`);
  console.log(`- Screenshots: ${SCREENSHOT_DIR}`);
  console.log('========================================\n');

  // Return summary for CI/CD integration
  return testResults.summary.failed === 0;
}

// Execute tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });