/**
 * PKL-278651-BOUNCE-0005-PROD - Bounce Production Configuration
 * 
 * This script configures Bounce for production deployment with appropriate
 * test schedules, notification settings, and autonomous test configurations.
 * 
 * Run with: npx tsx scripts/configure-bounce-production.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { pool, db } from '../server/db';
import { sql } from 'drizzle-orm';

interface TestSchedule {
  name: string;
  description: string;
  cronExpression: string;
  testSuiteId: number;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
}

interface NotificationChannel {
  name: string;
  type: 'slack' | 'email' | 'in-app';
  config: Record<string, any>;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Main function to configure Bounce for production
 */
async function configureBounceProduction() {
  console.log('Starting Bounce production configuration...');
  
  try {
    // Check if Bounce tables exist
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.error('Bounce tables do not exist. Please run bounce core migration first.');
      process.exit(1);
    }
    
    // Set up test schedules for production
    await configureTestSchedules();
    
    // Set up notification channels
    await configureNotificationChannels();
    
    // Configure autonomous testing parameters
    await configureAutonomousSettings();
    
    console.log('Bounce production configuration completed successfully!');
    
  } catch (error) {
    console.error('Error configuring Bounce for production:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Check if Bounce tables exist in the database
 */
async function checkTablesExist(): Promise<boolean> {
  const tablesQuery = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('bounce_test_runs', 'bounce_findings', 'bounce_schedules', 'bounce_notification_channels')
  `);
  
  return tablesQuery.length === 4;
}

/**
 * Configure test schedules for production environment
 */
async function configureTestSchedules() {
  console.log('Configuring test schedules...');
  
  // First clear any existing schedules
  await db.execute(sql`TRUNCATE bounce_schedules`);
  
  // Define production test schedules
  const schedules: TestSchedule[] = [
    {
      name: 'Daily Core Features',
      description: 'Tests all core platform features',
      cronExpression: '0 2 * * *',  // 2 AM daily
      testSuiteId: 1,
      priority: 'high',
      isActive: true
    },
    {
      name: 'Weekly Regression',
      description: 'Full regression test suite',
      cronExpression: '0 1 * * 0',  // 1 AM on Sundays
      testSuiteId: 2,
      priority: 'medium',
      isActive: true
    },
    {
      name: 'Daily Mobile Experience',
      description: 'Tests mobile-specific features',
      cronExpression: '0 3 * * *',  // 3 AM daily
      testSuiteId: 3,
      priority: 'high',
      isActive: true
    },
    {
      name: 'Performance Monitoring',
      description: 'Performance and load tests',
      cronExpression: '0 4 * * 1',  // 4 AM on Mondays
      testSuiteId: 4,
      priority: 'medium',
      isActive: true
    },
    {
      name: 'Security Scans',
      description: 'Security and vulnerability testing',
      cronExpression: '0 2 * * 3',  // 2 AM on Wednesdays
      testSuiteId: 5,
      priority: 'high',
      isActive: true
    }
  ];
  
  // Insert the schedules
  for (const schedule of schedules) {
    await db.execute(sql`
      INSERT INTO bounce_schedules (
        name, 
        description, 
        cron_expression, 
        test_suite_id, 
        priority, 
        is_active
      ) VALUES (
        ${schedule.name}, 
        ${schedule.description}, 
        ${schedule.cronExpression}, 
        ${schedule.testSuiteId}, 
        ${schedule.priority}, 
        ${schedule.isActive}
      )
    `);
  }
  
  console.log(`Configured ${schedules.length} test schedules`);
}

/**
 * Configure notification channels for test results
 */
async function configureNotificationChannels() {
  console.log('Configuring notification channels...');
  
  // Clear existing channels
  await db.execute(sql`TRUNCATE bounce_notification_channels`);
  
  // Define notification channels
  const channels: NotificationChannel[] = [
    {
      name: 'Critical Alerts',
      type: 'slack',
      config: {
        channel: '#critical-alerts',
        throttle: false
      },
      severity: 'critical'
    },
    {
      name: 'Engineering Team',
      type: 'slack',
      config: {
        channel: '#engineering',
        throttle: {
          maxPerHour: 5,
          groupSimilar: true
        }
      },
      severity: 'high'
    },
    {
      name: 'QA Dashboard',
      type: 'in-app',
      config: {
        dashboard: true,
        realtime: true
      },
      severity: 'medium'
    },
    {
      name: 'Daily Digest',
      type: 'email',
      config: {
        recipients: ['qa@pickleplus.com', 'engineering@pickleplus.com'],
        schedule: '0 9 * * *',  // 9 AM daily
        format: 'html'
      },
      severity: 'low'
    }
  ];
  
  // Insert the channels
  for (const channel of channels) {
    await db.execute(sql`
      INSERT INTO bounce_notification_channels (
        name, 
        type, 
        config, 
        severity
      ) VALUES (
        ${channel.name}, 
        ${channel.type}, 
        ${JSON.stringify(channel.config)}, 
        ${channel.severity}
      )
    `);
  }
  
  console.log(`Configured ${channels.length} notification channels`);
}

/**
 * Configure autonomous testing settings
 */
async function configureAutonomousSettings() {
  console.log('Configuring autonomous testing settings...');
  
  // Define autonomous testing configuration
  const autonomousConfig = {
    userInterventionThresholds: {
      maxDailyRequests: 3,
      requestThresholds: {
        criticalFlow: {
          failedAttempts: 3,
          timeSinceLastSuccess: 24 // hours
        },
        standardFlow: {
          failedAttempts: 5,
          timeSinceLastSuccess: 72 // hours
        }
      }
    },
    retryPolicies: {
      default: {
        maxRetries: 3,
        backoffFactor: 1.5,
        initialDelay: 1000
      },
      flaky: {
        maxRetries: 5,
        backoffFactor: 2,
        initialDelay: 2000
      }
    },
    xpRewards: {
      quickVerification: 15,
      complexIssueHelp: 50,
      newFeatureValidation: 35
    },
    testingPreferences: {
      preferOffHours: true,
      maxConcurrentTests: 3,
      preserveUserCreatedData: true,
      cleanupTestData: true
    }
  };
  
  // Store the configuration
  await db.execute(sql`
    INSERT INTO bounce_config (
      key, 
      value, 
      updated_at
    ) VALUES (
      'autonomous_settings', 
      ${JSON.stringify(autonomousConfig)}, 
      NOW()
    )
    ON CONFLICT (key) DO UPDATE
    SET value = ${JSON.stringify(autonomousConfig)},
        updated_at = NOW()
  `);
  
  console.log('Autonomous settings configured');
}

// Run the configuration
configureBounceProduction().catch(err => {
  console.error('Failed to configure Bounce for production:', err);
  process.exit(1);
});