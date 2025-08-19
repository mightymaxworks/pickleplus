module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'client/src/pages/coach/**/*.{js,ts,jsx,tsx}',
    'server/routes/coach-*.{js,ts}',
    'shared/schema/coach-*.{js,ts}'
  ],
  coverageDirectory: 'coverage/coaching',
  coverageReporters: ['text', 'lcov', 'html']
};