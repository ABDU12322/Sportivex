/**
 * Jest Configuration for System E2E Tests
 * Ensures proper test environment setup and reporting
 */

export default {
  displayName: 'E2E System Tests',
  testEnvironment: 'node',
  testMatch: ['**/tests/systemtests/**/*.e2e.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/socket/**',
    '!src/config/**',
    '!src/**/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testTimeout: 10000,
  verbose: true,
  bail: false,
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  globals: {
    'NODE_ENV': 'test'
  }
};
