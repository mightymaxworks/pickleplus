/**
 * PKL-278651-PERF-0001-LOAD
 * Performance thresholds configuration
 * 
 * This file defines the acceptable performance thresholds for different
 * aspects of the system under test. These thresholds are used to automatically
 * determine whether a test passes or fails.
 */

module.exports = {
  // Overall HTTP response time thresholds (milliseconds)
  http: {
    // 95% of requests must complete within 500ms
    p95: 500,
    
    // 99% of requests must complete within 1000ms
    p99: 1000,
    
    // The median response time should be below 200ms
    median: 200,
    
    // Maximum acceptable response time for any request
    max: 3000
  },
  
  // Error rate thresholds (percentage)
  errors: {
    // Overall error rate must be below 0.1%
    overall: 0.1,
    
    // Critical endpoints error rate must be below 0.05%
    critical: 0.05
  },
  
  // Specific endpoint response time thresholds (milliseconds)
  endpoints: {
    // Authentication endpoints
    auth: {
      login: {
        p95: 500,
        median: 200
      },
      register: {
        p95: 800,
        median: 400
      },
      currentUser: {
        p95: 300,
        median: 100
      }
    },
    
    // Tournament endpoints
    tournament: {
      list: {
        p95: 600,
        median: 250
      },
      detail: {
        p95: 800,
        median: 300
      },
      features: {
        p95: 400,
        median: 150
      },
      discovery: {
        p95: 400,
        median: 150
      }
    },
    
    // Match endpoints
    match: {
      create: {
        p95: 700,
        median: 300
      },
      validate: {
        p95: 600,
        median: 250
      },
      history: {
        p95: 800,
        median: 350
      },
      stats: {
        p95: 500,
        median: 200
      },
      recent: {
        p95: 500,
        median: 200
      }
    },
    
    // Golden Ticket endpoints
    goldenTicket: {
      list: {
        p95: 400,
        median: 150
      },
      claim: {
        p95: 500,
        median: 200
      },
      reveal: {
        p95: 600,
        median: 250
      }
    },
    
    // Ranking endpoints
    ranking: {
      leaderboard: {
        p95: 800,
        median: 350
      },
      position: {
        p95: 500,
        median: 200
      },
      history: {
        p95: 700,
        median: 300
      },
      tiers: {
        p95: 400,
        median: 150
      }
    },
    
    // XP endpoints
    xp: {
      total: {
        p95: 400,
        median: 150
      },
      transactions: {
        p95: 600,
        median: 250
      }
    },
    
    // User endpoints
    user: {
      profile: {
        p95: 600,
        median: 250
      },
      search: {
        p95: 800,
        median: 350
      }
    }
  },
  
  // Database performance thresholds
  database: {
    // Query execution time thresholds (milliseconds)
    queryTime: {
      // 99% of database queries should execute in under 100ms
      p99: 100,
      
      // The median query execution time should be below 30ms
      median: 30,
      
      // Maximum acceptable query execution time
      max: 500
    },
    
    // Connection pool utilization should stay below 80%
    connectionPool: 80,
    
    // Lock contention time should be below 100ms
    lockContention: 100
  },
  
  // System resource utilization thresholds (percentage)
  resources: {
    // CPU utilization should stay below 70%
    cpu: 70,
    
    // Memory utilization should stay below 80%
    memory: 80,
    
    // Disk I/O utilization should stay below 60%
    diskIO: 60,
    
    // Network utilization should stay below 70%
    network: 70
  },
  
  // Throughput thresholds (requests per second)
  throughput: {
    // Minimum overall throughput
    min: 100,
    
    // Minimum throughput for critical endpoints
    critical: {
      auth: 50,
      tournament: 75,
      match: 50,
      goldenTicket: 30
    }
  },
  
  // Success criteria for specific test types
  testTypes: {
    // Baseline test should have no errors
    baseline: {
      errorRate: 0,
      responseTimeP95: 400
    },
    
    // Load test thresholds
    load: {
      errorRate: 0.1,
      responseTimeP95: 500
    },
    
    // Stress test thresholds (slightly relaxed)
    stress: {
      errorRate: 0.5,
      responseTimeP95: 1000
    },
    
    // Spike test thresholds
    spike: {
      errorRate: 1.0,
      responseTimeP95: 2000
    },
    
    // Endurance test thresholds
    endurance: {
      errorRate: 0.1,
      responseTimeP95: 600
    }
  }
};