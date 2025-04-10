/**
 * PKL-278651-PERF-0001-LOAD
 * Load Testing Environment Configuration
 */

export const environments = {
  local: {
    baseUrl: "https://7c53293f-df0f-44d1-aa13-74da41f82777-00-5jeol01lwwzz.worf.replit.dev",
    apiTimeout: 30000, // 30 seconds
    testUsers: {
      standard: {
        username: "testuser",
        password: "password123"
      },
      admin: {
        username: "mightymax",
        password: "password123"
      }
    }
  },
  staging: {
    baseUrl: "https://staging.pickleplus.com",
    apiTimeout: 30000,
    testUsers: {
      standard: {
        username: "loadtest_user",
        password: "stagingPassword2025!"
      },
      admin: {
        username: "loadtest_admin",
        password: "stagingAdmin2025!"
      }
    }
  }
};

// Default to local environment
export const currentEnv = __ENV.NODE_ENV || "local";
export const config = environments[currentEnv];

// Test volume settings
export const testVolumes = {
  baseline: {
    vus: 10,         // Virtual Users (concurrent users)
    iterations: 100,  // Total number of iterations to run
    maxDuration: "30s"
  },
  load: {
    vus: 50,
    iterations: 500,
    maxDuration: "2m"
  },
  stress: {
    vus: 200,
    iterations: 1000,
    maxDuration: "5m"
  },
  spike: {
    vus: 500,
    iterations: 1000,
    maxDuration: "3m"
  },
  endurance: {
    vus: 30,
    iterations: 3000,
    maxDuration: "10m"
  }
};

// Performance thresholds
export const thresholds = {
  http_req_duration: [
    { threshold: 'p(95)<500', abortOnFail: true },  // 95% of requests must complete below 500ms
    { threshold: 'p(99)<1000', abortOnFail: false }, // 99% of requests must complete below 1000ms
  ],
  http_req_failed: [
    { threshold: 'rate<0.01', abortOnFail: true },  // Error rate must be less than 1%
  ],
};