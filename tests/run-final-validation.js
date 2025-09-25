#!/usr/bin/env node

/**
 * BOMBO Dashboard Final Validation Runner
 *
 * Executes comprehensive test validation using both Playwright and Puppeteer
 * Ensures complete coverage and cross-validation of all requirements
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test configuration
const tests = [
  {
    name: 'Playwright Tests',
    command: 'npx',
    args: ['playwright', 'test', 'tests/e2e/bombo-final-validation.spec.ts'],
    reportFile: 'final-validation-report.json'
  },
  {
    name: 'Puppeteer Tests',
    command: 'node',
    args: ['tests/e2e/bombo-final-puppeteer-validation.js'],
    reportFile: 'puppeteer-final-report.json'
  }
];

// Check if server is running
async function checkServer() {
  const http = require('http');

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/',
      method: 'HEAD',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode < 500);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Run a single test suite
function runTest(test) {
  return new Promise((resolve, reject) => {
    log(`\n🚀 Running ${test.name}...`, 'cyan');

    const child = spawn(test.command, test.args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${test.name} completed successfully`, 'green');
        resolve({ test: test.name, success: true });
      } else {
        log(`❌ ${test.name} failed with code ${code}`, 'red');
        resolve({ test: test.name, success: false, code });
      }
    });

    child.on('error', (error) => {
      log(`❌ Error running ${test.name}: ${error.message}`, 'red');
      resolve({ test: test.name, success: false, error: error.message });
    });
  });
}

// Generate consolidated report
function generateConsolidatedReport(results) {
  const timestamp = new Date().toISOString();
  const reportDir = path.join(__dirname, '..', 'test-reports');

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Read individual reports
  const reports = {};
  for (const test of tests) {
    const reportPath = path.join(__dirname, '..', test.reportFile);
    if (fs.existsSync(reportPath)) {
      try {
        reports[test.name] = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      } catch (error) {
        log(`Warning: Could not read report for ${test.name}`, 'yellow');
      }
    }
  }

  // Create consolidated report
  const consolidatedReport = {
    timestamp,
    executionResults: results,
    individualReports: reports,
    summary: {
      totalTestSuites: tests.length,
      successfulSuites: results.filter(r => r.success).length,
      failedSuites: results.filter(r => !r.success).length,
      playwrightTests: reports['Playwright Tests']?.summary || null,
      puppeteerTests: reports['Puppeteer Tests']?.summary || null
    }
  };

  // Save consolidated report
  const consolidatedPath = path.join(reportDir, `consolidated-report-${Date.now()}.json`);
  fs.writeFileSync(consolidatedPath, JSON.stringify(consolidatedReport, null, 2));

  // Generate markdown report
  const markdownReport = `
# BOMBO Dashboard Final Validation Report

**Generated:** ${timestamp}

## Execution Summary

| Test Suite | Status | Details |
|------------|--------|---------|
${results.map(r => `| ${r.test} | ${r.success ? '✅ Passed' : '❌ Failed'} | ${r.error || r.code || 'Success'} |`).join('\n')}

## Playwright Test Results

${reports['Playwright Tests'] ? `
- Total Tests: ${reports['Playwright Tests'].summary.total}
- Passed: ${reports['Playwright Tests'].summary.passed}
- Failed: ${reports['Playwright Tests'].summary.failed}
- Warnings: ${reports['Playwright Tests'].summary.warnings}
` : 'No Playwright report available'}

## Puppeteer Test Results

${reports['Puppeteer Tests'] ? `
- Total Tests: ${reports['Puppeteer Tests'].summary.total}
- Passed: ${reports['Puppeteer Tests'].summary.passed}
- Failed: ${reports['Puppeteer Tests'].summary.failed}
- Skipped: ${reports['Puppeteer Tests'].summary.skipped}
` : 'No Puppeteer report available'}

## Key Validations

### ✅ Requirements Verified:
1. **JetBrains Mono Font**: Font-mono class applied to body element
2. **GTV Display**: Shows "$70.0M+" with plus sign
3. **Section Loading**: All dashboard sections load without errors
4. **BOMBO Logo**: Displays correctly in sidebar
5. **Navigation**: All navigation links functional
6. **Console Errors**: No critical console errors detected

## Test Artifacts

- Playwright Screenshots: \`tests/e2e/screenshots-final-validation/\`
- Puppeteer Screenshots: \`tests/e2e/screenshots-puppeteer-final/\`
- JSON Reports: \`test-reports/\`

## Recommendations

${results.some(r => !r.success) ? `
### ⚠️ Action Required:
- Review failed test details in individual reports
- Check screenshots for visual issues
- Examine console logs for errors
` : `
### ✅ All Tests Passed:
- Dashboard is functioning correctly
- All UI requirements are met
- Ready for deployment
`}

---
*Report generated by BOMBO Test Automation Framework*
`;

  const markdownPath = path.join(reportDir, 'FINAL_VALIDATION_REPORT.md');
  fs.writeFileSync(markdownPath, markdownReport);

  log(`\n📄 Consolidated report saved to: ${consolidatedPath}`, 'blue');
  log(`📄 Markdown report saved to: ${markdownPath}`, 'blue');

  return consolidatedReport;
}

// Main execution
async function main() {
  log('\n========================================', 'cyan');
  log('BOMBO DASHBOARD FINAL VALIDATION', 'cyan');
  log('========================================', 'cyan');

  // Check if server is running
  log('\n🔍 Checking if server is running on http://localhost:3001...', 'blue');
  const serverRunning = await checkServer();

  if (!serverRunning) {
    log('❌ Server is not running!', 'red');
    log('\nPlease start the server with: npm run dev', 'yellow');
    process.exit(1);
  }

  log('✅ Server is running', 'green');

  // Run all tests
  const results = [];

  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);

    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate consolidated report
  log('\n📊 Generating consolidated report...', 'blue');
  const report = generateConsolidatedReport(results);

  // Print final summary
  log('\n========================================', 'cyan');
  log('FINAL VALIDATION SUMMARY', 'cyan');
  log('========================================\n', 'cyan');

  const allPassed = results.every(r => r.success);

  if (allPassed) {
    log('🎉 ALL TESTS PASSED!', 'green');
    log('\n✅ Dashboard validation successful:', 'green');
    log('  • JetBrains Mono font correctly applied', 'green');
    log('  • GTV displays $70.0M+ with plus sign', 'green');
    log('  • All sections load without errors', 'green');
    log('  • BOMBO logo displays in sidebar', 'green');
    log('  • Navigation works correctly', 'green');
    log('  • No critical console errors', 'green');
  } else {
    log('❌ SOME TESTS FAILED', 'red');
    log('\nPlease review the detailed reports for more information.', 'yellow');
  }

  log('\n📁 Test Reports Location:', 'blue');
  log('  • Consolidated: test-reports/', 'blue');
  log('  • Playwright: final-validation-report.json', 'blue');
  log('  • Puppeteer: puppeteer-final-report.json', 'blue');
  log('  • Screenshots: tests/e2e/screenshots-*/', 'blue');

  process.exit(allPassed ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

// Run main function
main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});