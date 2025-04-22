/**
 * PKL-278651-TEST-0001-PROD
 * Smoke Test Script
 * 
 * This script performs basic smoke tests on a deployed application
 * to verify that critical functionality is working.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

const fetch = require('node-fetch');

// Base URL for the deployed application
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// List of critical endpoints to test
const ENDPOINTS = [
  { path: '/api/health', expectedStatus: 200, description: 'Health check endpoint' },
  { path: '/api/db-status', expectedStatus: 200, description: 'Database status endpoint' },
  { path: '/api/memory', expectedStatus: 200, description: 'Memory usage endpoint' },
  { path: '/api/auth/current-user', expectedStatus: 401, description: 'Auth endpoint (should return 401 if not logged in)' },
  { path: '/api/multi-rankings/leaderboard', expectedStatus: 200, description: 'Leaderboard endpoint' },
  { path: '/', expectedStatus: 200, description: 'Main application page' },
];

// Authentication test information
const AUTH_TEST = {
  endpoint: '/api/login',
  method: 'POST',
  body: { username: 'test_user', password: 'test_password' },
  expectedStatus: 200,
  description: 'Authentication endpoint'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Run a test on an endpoint
 */
async function testEndpoint(endpoint, description, method = 'GET', body = null, expectedStatus = 200) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`${colors.blue}Testing ${description} (${method} ${url})...${colors.reset}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    
    if (response.status === expectedStatus) {
      console.log(`${colors.green}✓ ${description} - Status: ${response.status} (expected ${expectedStatus})${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ ${description} - Status: ${response.status} (expected ${expectedStatus})${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ ${description} - Error: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.magenta}========================================${colors.reset}`);
  console.log(`${colors.magenta}  Pickle+ Deployment Smoke Tests${colors.reset}`);
  console.log(`${colors.magenta}  Testing against: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.magenta}  Date: ${new Date().toISOString()}${colors.reset}`);
  console.log(`${colors.magenta}========================================${colors.reset}`);
  
  let passed = 0;
  let failed = 0;
  
  // Test all endpoints
  for (const endpoint of ENDPOINTS) {
    const success = await testEndpoint(
      endpoint.path,
      endpoint.description,
      'GET',
      null,
      endpoint.expectedStatus
    );
    
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Test authentication
  const authSuccess = await testEndpoint(
    AUTH_TEST.endpoint,
    AUTH_TEST.description,
    AUTH_TEST.method,
    AUTH_TEST.body,
    AUTH_TEST.expectedStatus
  );
  
  if (authSuccess) {
    passed++;
  } else {
    failed++;
  }
  
  // Print summary
  console.log(`${colors.magenta}========================================${colors.reset}`);
  console.log(`${colors.magenta}  Test Summary${colors.reset}`);
  console.log(`${colors.magenta}========================================${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.magenta}Total: ${passed + failed}${colors.reset}`);
  
  // Return exit code based on test results
  process.exit(failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Error running tests: ${error.message}${colors.reset}`);
  process.exit(1);
});