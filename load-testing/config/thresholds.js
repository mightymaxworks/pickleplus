/**
 * PKL-278651-PERF-0001-LOAD
 * Performance Thresholds Configuration
 * 
 * This file defines acceptable performance thresholds for different API endpoints
 * and scenarios. These thresholds are used to determine pass/fail criteria
 * for load tests.
 */

export const defaultThresholds = {
  // Response time thresholds
  http_req_duration: [
    { threshold: 'p(95)<500', abortOnFail: true },   // 95% of requests must complete below 500ms
    { threshold: 'avg<300', abortOnFail: false },    // Average response time under 300ms
    { threshold: 'max<2000', abortOnFail: false },   // Maximum response time under 2s
    { threshold: 'med<200', abortOnFail: false },    // Median response time under 200ms
  ],
  
  // Error rate thresholds
  http_req_failed: [
    { threshold: 'rate<0.01', abortOnFail: true },   // Error rate must be less than 1%
  ],
  
  // Throughput thresholds (requests per second)
  http_reqs: [
    { threshold: 'rate>50', abortOnFail: false },    // Should handle at least 50 requests/second
  ],
};

// Endpoint-specific thresholds
export const endpointThresholds = {
  // Authentication endpoints may be slightly slower
  '/api/auth/login': {
    http_req_duration: [
      { threshold: 'p(95)<800', abortOnFail: true },  // 95% of login requests under 800ms
      { threshold: 'avg<400', abortOnFail: false },   // Average login time under 400ms
    ],
  },
  
  // Database-heavy endpoints
  '/api/matches': {
    http_req_duration: [
      { threshold: 'p(95)<1000', abortOnFail: true }, // 95% of match listing requests under 1s
    ],
  },
  
  // Simple, cached endpoints should be very fast
  '/api/health': {
    http_req_duration: [
      { threshold: 'p(95)<100', abortOnFail: true },  // Health checks should be very fast
    ],
  }
};

// Feature-specific thresholds
export const featureThresholds = {
  // Golden Ticket feature
  goldenTicket: {
    http_req_duration: [
      { threshold: 'p(95)<600', abortOnFail: true },  // Golden ticket operations should be reasonably fast
    ],
  },
  
  // Tournament feature
  tournaments: {
    http_req_duration: [
      { threshold: 'p(95)<800', abortOnFail: true },  // Tournament-related operations can be more complex
    ],
  }
};