/**
 * PKL-278651-PERF-0001-LOAD
 * Authentication Load Testing Scenario
 * 
 * This script tests the authentication endpoints for performance under load.
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { config, testVolumes, thresholds } from './config/environment.js';
import { defaultThresholds, endpointThresholds } from './config/thresholds.js';

// Determine test volume based on environment variable or use baseline by default
const testType = __ENV.TEST_TYPE || 'baseline';
const volume = testVolumes[testType];

// Configuration for this test
export const options = {
  vus: __ENV.TEST_USERS ? parseInt(__ENV.TEST_USERS) : 5, // Start with a small number of VUs
  iterations: __ENV.TEST_ITERATIONS ? parseInt(__ENV.TEST_ITERATIONS) : 10, // Limit to 10 iterations for initial testing
  thresholds: {
    // Basic thresholds for performance monitoring
    'http_req_duration': [
      { threshold: 'p(95)<500', abortOnFail: false },  // 95% of requests must complete below 500ms
      { threshold: 'p(99)<1000', abortOnFail: false }, // 99% of requests must complete below 1000ms
    ],
    'http_req_failed': [
      { threshold: 'rate<0.01', abortOnFail: false },  // Error rate must be less than 1%
    ],
    // Endpoint-specific thresholds
    'http_req_duration{endpoint:login}': [{ threshold: 'p(95)<1000', abortOnFail: false }],
    'http_req_duration{endpoint:logout}': [{ threshold: 'p(95)<300', abortOnFail: false }],
    'http_req_duration{endpoint:currentUser}': [{ threshold: 'p(95)<300', abortOnFail: false }],
  },
  // Set duration constraint
  maxDuration: __ENV.TEST_DURATION || '30s',
};

// Test user credentials
const user = config.testUsers.standard;

/**
 * Default function called by k6 for each virtual user
 */
export default function() {
  // 1. Test /api/auth/login endpoint
  const loginPayload = JSON.stringify({
    username: user.username,
    password: user.password,
  });
  
  const loginHeaders = {
    'Content-Type': 'application/json',
  };
  
  const loginRes = http.post(
    `${config.baseUrl}/api/auth/login`, 
    loginPayload, 
    { headers: loginHeaders, tags: { endpoint: 'login' } }
  );
  
  // Check if login was successful
  check(loginRes, {
    'Login status is 200': (r) => r.status === 200,
    'Login response has user data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id && body.username;
      } catch (e) {
        return false;
      }
    },
  });
  
  // If login failed, no point continuing this iteration
  if (loginRes.status !== 200) {
    console.log(`Login failed with status ${loginRes.status}`);
    // Wait a bit before the next iteration to avoid hammering the server
    sleep(1);
    return;
  }
  
  // Extract cookies from login response
  const cookies = loginRes.cookies;
  
  // 2. Test /api/auth/current-user endpoint
  const currentUserRes = http.get(
    `${config.baseUrl}/api/auth/current-user`,
    { tags: { endpoint: 'currentUser' } }
  );
  
  check(currentUserRes, {
    'Current user status is 200': (r) => r.status === 200,
    'Current user returns user data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id && body.username;
      } catch (e) {
        return false;
      }
    },
  });
  
  // Small delay between requests to simulate user behavior
  sleep(0.5);
  
  // 3. Test /api/auth/logout endpoint
  const logoutRes = http.post(
    `${config.baseUrl}/api/auth/logout`,
    null,
    { tags: { endpoint: 'logout' } }
  );
  
  check(logoutRes, {
    'Logout status is 200': (r) => r.status === 200,
  });
  
  // End of test scenario, sleep for a bit before next iteration
  sleep(1);
}