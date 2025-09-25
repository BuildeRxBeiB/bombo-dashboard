#!/usr/bin/env node

/**
 * Bombo Dashboard - Complete Test Suite Runner
 * Executes both Puppeteer and Playwright tests and generates a unified report
 */

const fs = require('fs').promises;
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

// Helper function to check if server is running
async function checkServerRunning(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}🚀 BOMBO DASHBOARD - COMPLETE TEST SUITE${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  // Check if server is running
  console.log(`${colors.yellow}🔍 Checking if server is running at http://localhost:3000...${colors.reset}`);
  const serverRunning = await checkServerRunning('http://localhost:3000');

  if (!serverRunning) {
    console.error(`${colors.red}❌ Server is not running at http://localhost:3000${colors.reset}`);
    console.log(`${colors.yellow}Please start the development server with: npm run dev${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.green}✅ Server is running!${colors.reset}\n`);

  let puppeteerReport = null;
  let playwrightReport = null;

  // Run Puppeteer tests
  console.log(`${colors.magenta}Starting Puppeteer tests...${colors.reset}`);
  try {
    const { runPuppeteerTests } = require('./puppeteer/dashboard.test');
    puppeteerReport = await runPuppeteerTests();
    console.log(`${colors.green}✅ Puppeteer tests completed${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}❌ Puppeteer tests failed:${colors.reset}`, error);
  }

  // Add delay between test suites
  console.log(`${colors.yellow}Waiting 2 seconds before running Playwright tests...${colors.reset}`);
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Run Playwright tests
  console.log(`${colors.magenta}Starting Playwright tests...${colors.reset}`);
  try {
    const { runPlaywrightTests } = require('./playwright/dashboard.spec');
    playwrightReport = await runPlaywrightTests();
    console.log(`${colors.green}✅ Playwright tests completed${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}❌ Playwright tests failed:${colors.reset}`, error);
  }

  // Display final summary
  console.log(`\n${colors.bright}${colors.green}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.green}✅ ALL TESTS COMPLETED${colors.reset}`);
  console.log(`${colors.bright}${colors.green}${'='.repeat(60)}${colors.reset}\n`);

  if (puppeteerReport && playwrightReport) {
    // Calculate totals
    const totalTests = puppeteerReport.summary.total + playwrightReport.summary.totalTests;
    const totalPassed = puppeteerReport.summary.passed + playwrightReport.summary.passed;
    const totalFailed = puppeteerReport.summary.failed + playwrightReport.summary.failed;
    const overallSuccess = ((totalPassed / totalTests) * 100).toFixed(1);

    console.log(`${colors.cyan}📊 OVERALL RESULTS:${colors.reset}`);
    console.log(`  Total Tests Run: ${totalTests}`);
    console.log(`  ✅ Passed: ${totalPassed}`);
    console.log(`  ❌ Failed: ${totalFailed}`);
    console.log(`  📈 Success Rate: ${overallSuccess}%`);

    console.log(`\n${colors.cyan}📁 Test Artifacts:${colors.reset}`);
    console.log(`  • Puppeteer Report: ./tests/reports/puppeteer-report.json`);
    console.log(`  • Playwright Report: ./tests/reports/playwright-report.json`);
    console.log(`  • Screenshots: ./tests/screenshots/`);

    // Exit with appropriate code
    process.exit(totalFailed > 0 ? 1 : 0);
  } else {
    console.error(`${colors.red}❌ Some test suites did not complete${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error);
  process.exit(1);
});