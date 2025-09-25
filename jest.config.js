/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/dashboard.spec.ts' // Skip Playwright tests in Jest
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },

  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Coverage configuration
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**'
  ],

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: true
};

module.exports = config;