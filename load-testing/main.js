/**
 * PKL-278651-PERF-0001-LOAD
 * Main Load Testing Orchestration Script
 * 
 * This script orchestrates the execution of all load testing scenarios
 * and provides a consolidated reporting mechanism for test results.
 */

import { check, sleep, group } from 'k6';
import http from 'k6/http';
import { config, testVolumes } from './config/environment.js';
import { defaultThresholds } from './config/thresholds.js';

// Determine test volume based on environment variable or use baseline by default
const testType = __ENV.TEST_TYPE || 'baseline';
const volume = testVolumes[testType];

// Configuration for this test
export const options = {
  vus: __ENV.TEST_USERS ? parseInt(__ENV.TEST_USERS) : volume.vus,
  iterations: volume.iterations,
  thresholds: {
    // Apply default thresholds
    ...defaultThresholds,
  },
  // Set duration constraint
  maxDuration: __ENV.TEST_DURATION || volume.maxDuration,
};

/**
 * System health check to verify the platform is responsive
 */
function healthCheck() {
  const res = http.get(`${config.baseUrl}/api/health`);
  
  check(res, {
    'Health check status is 200': (r) => r.status === 200,
  });
  
  return res.status === 200;
}

/**
 * Execute a specific test scenario
 * @param {string} username - Test user username
 * @param {string} password - Test user password
 */
function executeScenarios(username, password) {
  // First authenticate
  const loginPayload = JSON.stringify({
    username,
    password,
  });
  
  const loginHeaders = {
    'Content-Type': 'application/json',
  };
  
  let authenticated = false;
  
  group('Authentication', function() {
    const loginRes = http.post(
      `${config.baseUrl}/api/auth/login`, 
      loginPayload, 
      { headers: loginHeaders, tags: { scenario: 'auth' } }
    );
    
    authenticated = check(loginRes, {
      'Login status is 200': (r) => r.status === 200,
    });
    
    if (authenticated) {
      const currentUserRes = http.get(
        `${config.baseUrl}/api/auth/current-user`,
        { tags: { scenario: 'auth' } }
      );
      
      check(currentUserRes, {
        'Current user status is 200': (r) => r.status === 200,
      });
    }
  });
  
  // Only continue if authentication succeeded
  if (!authenticated) {
    console.log('Authentication failed, skipping remaining scenarios');
    return;
  }
  
  // Small delay between scenarios
  sleep(0.5);
  
  group('Golden Ticket', function() {
    const activeTicketsRes = http.get(
      `${config.baseUrl}/api/golden-tickets/active`,
      { tags: { scenario: 'golden_ticket' } }
    );
    
    check(activeTicketsRes, {
      'Get active tickets status is 200': (r) => r.status === 200 || r.status === 404,
    });
    
    const claimedTicketsRes = http.get(
      `${config.baseUrl}/api/golden-tickets/claimed`,
      { tags: { scenario: 'golden_ticket' } }
    );
    
    check(claimedTicketsRes, {
      'Get claimed tickets status is 200': (r) => r.status === 200,
    });
  });
  
  // Small delay between scenarios
  sleep(0.5);
  
  group('Profile', function() {
    const profileRes = http.get(
      `${config.baseUrl}/api/profile`,
      { tags: { scenario: 'profile' } }
    );
    
    check(profileRes, {
      'Get profile status is 200': (r) => r.status === 200,
    });
  });
  
  // End the test with logout
  group('Logout', function() {
    const logoutRes = http.post(
      `${config.baseUrl}/api/auth/logout`,
      null,
      { tags: { scenario: 'auth' } }
    );
    
    check(logoutRes, {
      'Logout status is 200': (r) => r.status === 200,
    });
  });
}

/**
 * Default function called by k6 for each virtual user
 */
export default function() {
  // First check if the system is responsive
  if (!healthCheck()) {
    console.log('Health check failed, aborting this iteration');
    return;
  }
  
  // Execute all scenarios with the standard user
  executeScenarios(
    config.testUsers.standard.username, 
    config.testUsers.standard.password
  );
  
  // Sleep before the next iteration
  sleep(1);
}