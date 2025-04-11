/**
 * PKL-278651-PERF-0001-LOAD
 * Golden Ticket Load Testing Scenario
 * 
 * This script tests the golden ticket endpoints for performance under load.
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { config, testVolumes } from './config/environment.js';
import { defaultThresholds, featureThresholds } from './config/thresholds.js';

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
    // Feature-specific thresholds
    'http_req_duration{feature:golden_ticket}': [
      { threshold: 'p(95)<600', abortOnFail: false },  // Golden ticket operations should be reasonably fast
    ],
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
  // 1. Authenticate first
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
    { headers: loginHeaders }
  );
  
  // Check if login was successful
  if (loginRes.status !== 200) {
    console.log(`Login failed with status ${loginRes.status}`);
    sleep(1);
    return;
  }
  
  // 2. Test golden ticket API endpoints with appropriate tags
  
  // Check active golden tickets
  const activeTicketsRes = http.get(
    `${config.baseUrl}/api/golden-tickets/active`,
    { tags: { feature: 'golden_ticket', endpoint: 'active' } }
  );
  
  check(activeTicketsRes, {
    'Get active tickets status is 200': (r) => r.status === 200,
  });
  
  // Small delay between requests to simulate user behavior
  sleep(0.5);
  
  // If we have active tickets, try to claim one
  if (activeTicketsRes.status === 200) {
    try {
      const tickets = JSON.parse(activeTicketsRes.body);
      
      // Only attempt to claim if there are tickets
      if (tickets && tickets.length > 0) {
        const ticketId = tickets[0].id;
        
        const claimRes = http.post(
          `${config.baseUrl}/api/golden-tickets/claim/${ticketId}`,
          null,
          { tags: { feature: 'golden_ticket', endpoint: 'claim' } }
        );
        
        check(claimRes, {
          'Claim ticket status is 200': (r) => r.status === 200,
        });
      }
    } catch (e) {
      // If parsing fails, just continue with the test
      console.log('Error parsing active tickets response:', e);
    }
  }
  
  // Check sponsors list
  const sponsorsRes = http.get(
    `${config.baseUrl}/api/sponsors`,
    { tags: { feature: 'golden_ticket', endpoint: 'sponsors' } }
  );
  
  check(sponsorsRes, {
    'Get sponsors status is 200': (r) => r.status === 200,
  });
  
  // Check user's claimed tickets
  const claimedTicketsRes = http.get(
    `${config.baseUrl}/api/golden-tickets/claimed`,
    { tags: { feature: 'golden_ticket', endpoint: 'claimed' } }
  );
  
  check(claimedTicketsRes, {
    'Get claimed tickets status is 200': (r) => r.status === 200,
  });
  
  // End of test scenario, sleep for a bit before next iteration
  sleep(1);
}