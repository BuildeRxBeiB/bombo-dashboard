/**
 * Playwright Test Configuration
 * For BOMBO Dashboard UI Testing
 */

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',

  // Test timeout
  timeout: 60000,

  // Global timeout
  globalTimeout: 600000,

  // Expect timeout
  expect: {
    timeout: 10000
  },

  // Parallel execution
  fullyParallel: false,
  workers: 1,

  // Retry failed tests
  retries: process.env.CI ? 2 : 1,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL
    baseURL: 'http://localhost:3002',

    // Screenshots
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Browser options
    headless: false,
    viewport: { width: 1920, height: 1080 },

    // Navigation timeout
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 120000,
  },
});