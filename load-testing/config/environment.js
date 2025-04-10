/**
 * PKL-278651-PERF-0001-LOAD
 * Environment configuration for load testing
 */

// Base URLs for different environments
const environments = {
  local: 'http://localhost:3000',
  staging: 'https://staging.pickle-plus.com',
  production: 'https://pickle-plus.com'
};

// Select the environment based on the NODE_ENV variable
const currentEnv = process.env.NODE_ENV || 'local';
const baseUrl = environments[currentEnv];

// Standard user accounts for testing
const testUsers = {
  // Admin user for operations requiring elevated permissions
  admin: {
    username: 'admin_test',
    password: 'test_password',
    email: 'admin_test@example.com'
  },
  
  // Regular user for standard operations
  standard: {
    username: 'user_test',
    password: 'test_password',
    email: 'user_test@example.com'
  },
  
  // New user for registration flow testing
  new: {
    username: 'new_user_',  // Will be appended with timestamp
    password: 'test_password',
    email: 'new_user_' // Will be appended with timestamp + @example.com
  }
};

// Test data volume configuration
const testVolume = {
  // Number of virtual users to simulate for different test types
  users: {
    baseline: 50,     // Baseline test users
    load: 200,        // Normal load test users
    stress: 500,      // Stress test users
    spike: 1000,      // Spike test users
    endurance: 100    // Endurance test users
  },
  
  // Duration of different test types in seconds
  duration: {
    baseline: 60,     // 1 minute
    load: 300,        // 5 minutes
    stress: 600,      // 10 minutes
    spike: 120,       // 2 minutes
    endurance: 1800   // 30 minutes
  },
  
  // Ramp-up pattern for different test types (seconds)
  rampUp: {
    baseline: 10,     // 10 seconds
    load: 60,         // 1 minute
    stress: 120,      // 2 minutes
    spike: 10,        // 10 seconds
    endurance: 300    // 5 minutes
  }
};

// API Endpoints to test
const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    currentUser: '/api/auth/current-user',
    logout: '/api/auth/logout'
  },
  
  tournament: {
    list: '/api/tournaments',
    detail: '/api/tournaments/:id',
    features: '/api/tournaments/features',
    discovery: '/api/tournament/discovery'
  },
  
  match: {
    create: '/api/matches',
    validate: '/api/match/validate/:matchId',
    history: '/api/match/history',
    stats: '/api/match/stats',
    recent: '/api/match/recent'
  },
  
  goldenTicket: {
    list: '/api/golden-ticket/available',
    claim: '/api/golden-ticket/claim/:ticketId',
    reveal: '/api/golden-ticket/reveal/:claimId'
  },
  
  ranking: {
    leaderboard: '/api/multi-rankings/leaderboard',
    position: '/api/multi-rankings/position',
    history: '/api/multi-rankings/history',
    tiers: '/api/multi-rankings/rating-tiers'
  },
  
  xp: {
    total: '/api/xp/total',
    transactions: '/api/xp/transactions'
  },
  
  user: {
    profile: '/api/users/:id',
    search: '/api/users/search'
  }
};

// Monitoring configuration
const monitoring = {
  // Metrics collection interval in milliseconds
  metricsInterval: 1000,
  
  // Whether to output detailed logs during test execution
  verboseLogging: true,
  
  // Paths for output files
  output: {
    summary: './results/summary.json',
    detailed: './results/detailed.csv',
    errors: './results/errors.log'
  }
};

module.exports = {
  baseUrl,
  currentEnv,
  testUsers,
  testVolume,
  endpoints,
  monitoring
};