/**
 * PKL-278651-PERF-0001-LOAD
 * Main Load Testing Orchestration Script
 * 
 * This script orchestrates the execution of all load testing scenarios
 * and provides a consolidated reporting mechanism for test results.
 */

const { sleep } = require('k6');
const exec = require('k6/execution');
const http = require('k6/http');
const { check, group } = require('k6');
const { Counter, Rate, Trend } = require('k6/metrics');
const env = require('./config/environment');
const thresholds = require('./config/thresholds');

// Import individual test scenarios
const authTest = require('./scenarios/authentication.js');
const goldenTicketTest = require('./scenarios/golden-ticket.js');
// Add other test scenario imports as they are implemented
// const matchTest = require('./scenarios/match-recording.js');
// const tournamentTest = require('./scenarios/tournament-discovery.js');
// const leaderboardTest = require('./scenarios/leaderboard.js');

// Global metrics
const overallErrorRate = new Rate('overall_error_rate');
const overallResponseTime = new Trend('overall_response_time');
const scenarioSuccess = new Rate('scenario_success');
const scenarioStarted = new Counter('scenario_started');
const scenarioCompleted = new Counter('scenario_completed');

// Test configuration based on environment
export const options = {
  // Base test configuration
  stages: [
    // Ramp up from 0 to baseline users
    { duration: '30s', target: thresholds.testTypes.baseline.users },
    
    // Hold at baseline for stability verification
    { duration: '1m', target: thresholds.testTypes.baseline.users },
    
    // Ramp up to normal load test level
    { duration: '1m', target: thresholds.testTypes.load.users },
    
    // Hold at normal load to establish performance patterns
    { duration: '3m', target: thresholds.testTypes.load.users },
    
    // Ramp up to stress test level
    { duration: '1m', target: thresholds.testTypes.stress.users },
    
    // Hold at stress test level to identify breaking points
    { duration: '2m', target: thresholds.testTypes.stress.users },
    
    // Spike test with sudden increase to max users
    { duration: '10s', target: thresholds.testTypes.spike.users },
    
    // Hold spike briefly
    { duration: '30s', target: thresholds.testTypes.spike.users },
    
    // Return to normal load
    { duration: '30s', target: thresholds.testTypes.load.users },
    
    // Hold at normal load to verify recovery
    { duration: '1m', target: thresholds.testTypes.load.users },
    
    // Ramp down gradually
    { duration: '30s', target: 0 }
  ],
  
  // Performance thresholds
  thresholds: {
    'http_req_duration': [`p(95)<${thresholds.http.p95}`, `p(99)<${thresholds.http.p99}`],
    'http_req_failed': [`rate<${thresholds.errors.overall / 100}`],
    'overall_error_rate': [`rate<${thresholds.errors.overall / 100}`],
    'scenario_success': ['rate>0.9'] // 90% of all scenarios should complete successfully
  },
  
  // Test type tags for reporting
  tags: {
    testType: 'full_platform_load_test'
  }
};

/**
 * System health check to verify the platform is responsive
 */
function healthCheck() {
  const baseUrl = env.baseUrl;
  
  const response = http.get(`${baseUrl}/api/health`, {
    tags: { name: 'health_check' }
  });
  
  return check(response, {
    'Health check successful': (r) => r.status === 200
  });
}

/**
 * Execute a specific test scenario
 * @param {Object} scenario - The test scenario module to execute
 * @param {string} name - Name of the scenario for reporting
 */
function executeScenario(scenario, name) {
  try {
    scenarioStarted.add(1, { scenario: name });
    
    // Execute the test scenario's default function
    if (typeof scenario.default === 'function') {
      scenario.default();
      scenarioCompleted.add(1, { scenario: name });
      scenarioSuccess.add(1, { scenario: name });
    } else {
      console.error(`Scenario ${name} does not have a default export function`);
      scenarioCompleted.add(1, { scenario: name });
      scenarioSuccess.add(0, { scenario: name });
    }
  } catch (error) {
    console.error(`Error executing scenario ${name}:`, error);
    scenarioCompleted.add(1, { scenario: name });
    scenarioSuccess.add(0, { scenario: name });
  }
}

/**
 * Default function called by k6 for each virtual user
 */
export default function() {
  // Perform health check first
  const isHealthy = healthCheck();
  
  // Only proceed if health check passes
  if (!isHealthy) {
    console.error('Health check failed, skipping test scenarios');
    overallErrorRate.add(1);
    return;
  }
  
  // Distribute virtual users across different test scenarios based on VU number
  const vuNumber = exec.vu.idInTest % 5; // Assuming 5 total scenarios when all are implemented
  
  switch(vuNumber) {
    case 0:
      // Authentication tests
      group('Authentication Scenario', function() {
        executeScenario(authTest, 'authentication');
      });
      break;
      
    case 1:
      // Golden Ticket tests
      group('Golden Ticket Scenario', function() {
        executeScenario(goldenTicketTest, 'golden_ticket');
      });
      break;
      
    // Uncomment as other scenarios are implemented
    /*
    case 2:
      // Match recording tests
      group('Match Recording Scenario', function() {
        executeScenario(matchTest, 'match_recording');
      });
      break;
      
    case 3:
      // Tournament discovery tests
      group('Tournament Discovery Scenario', function() {
        executeScenario(tournamentTest, 'tournament_discovery');
      });
      break;
      
    case 4:
      // Leaderboard tests
      group('Leaderboard Scenario', function() {
        executeScenario(leaderboardTest, 'leaderboard');
      });
      break;
    */
      
    default:
      // Run authentication by default if we have more VUs than expected
      group('Default Authentication Scenario', function() {
        executeScenario(authTest, 'authentication_default');
      });
      break;
  }
  
  // Add a small pause between iterations to prevent overwhelming the system
  sleep(1);
}