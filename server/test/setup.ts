/**
 * Test Setup for Coach Application Workflow
 * Sets up test environment and mock data
 */

import { beforeAll, afterAll } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.SESSION_SECRET = 'test_session_secret';

beforeAll(async () => {
  // Test setup
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Test cleanup
  console.log('Cleaning up test environment...');
});