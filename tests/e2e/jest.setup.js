/**
 * Jest setup file for E2E tests
 * Configures test environment and global settings
 */

// Extend Jest timeout for E2E tests
jest.setTimeout(60000);

// Create screenshots directory if it doesn't exist
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Add custom matchers if needed
expect.extend({
  toBeVisible(received) {
    const pass = received !== null && received !== undefined;
    return {
      pass,
      message: () => `expected element to${pass ? ' not' : ''} be visible`
    };
  }
});

// Global teardown
afterAll(async () => {
  // Cleanup tasks
  console.log('E2E tests completed');
});
