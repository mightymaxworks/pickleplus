// Jest setup file for coaching tests
const { beforeAll, afterAll } = require('@jest/globals');

// Global test setup
beforeAll(async () => {
  console.log('🚀 Setting up 55-skill assessment test environment...');
});

afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
});