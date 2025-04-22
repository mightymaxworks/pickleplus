/**
 * PKL-278651-LAUNCH-0001-MON - Launch Day Monitoring Dashboard Setup
 * 
 * This script configures the monitoring dashboard for launch day,
 * setting up real-time metrics tracking, alerting thresholds,
 * and performance monitoring.
 * 
 * Run with: npx tsx scripts/setup-launch-monitoring.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { pool, db } from '../server/db';
import { sql } from 'drizzle-orm';

interface MonitoringMetric {
  name: string;
  description: string;
  query: string;
  refreshInterval: number; // seconds
  alertThreshold?: number;
  alertMessage?: string;
  visualization: 'line' | 'bar' | 'gauge' | 'counter';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface DashboardPanel {
  title: string;
  description: string;
  metrics: string[];
  layout: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  refreshInterval: number; // seconds
}

/**
 * Main function to set up the launch monitoring dashboard
 */
async function setupLaunchMonitoring() {
  console.log('Setting up launch day monitoring dashboard...');
  
  try {
    // Create monitoring tables if they don't exist
    await createMonitoringTables();
    
    // Configure metrics to track
    await configureMonitoringMetrics();
    
    // Set up dashboard layout
    await configureDashboardLayout();
    
    // Configure alert notifications
    await configureAlertNotifications();
    
    console.log('Launch monitoring dashboard setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up launch monitoring:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Create monitoring tables if they don't exist
 */
async function createMonitoringTables() {
  console.log('Creating monitoring tables...');
  
  // Create metrics table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS monitoring_metrics (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      query TEXT NOT NULL,
      refresh_interval INTEGER NOT NULL DEFAULT 60,
      alert_threshold FLOAT,
      alert_message TEXT,
      visualization VARCHAR(20) NOT NULL,
      priority VARCHAR(10) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  
  // Create dashboard panels table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS monitoring_dashboard_panels (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      description TEXT,
      metrics JSONB NOT NULL,
      layout JSONB NOT NULL,
      refresh_interval INTEGER NOT NULL DEFAULT 60,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  
  // Create alert notifications table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS monitoring_alert_notifications (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      channels JSONB NOT NULL,
      throttle_settings JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  
  // Create metrics history table for storing time-series data
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS monitoring_metrics_history (
      id SERIAL PRIMARY KEY,
      metric_name VARCHAR(100) NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      value FLOAT NOT NULL,
      FOREIGN KEY (metric_name) REFERENCES monitoring_metrics(name)
    )
  `);
  
  console.log('Monitoring tables created successfully');
}

/**
 * Configure monitoring metrics
 */
async function configureMonitoringMetrics() {
  console.log('Configuring monitoring metrics...');
  
  // First clear existing metrics
  await db.execute(sql`TRUNCATE monitoring_metrics CASCADE`);
  
  // Define metrics to track
  const metrics: MonitoringMetric[] = [
    // User activity metrics
    {
      name: 'active_users',
      description: 'Number of currently active users',
      query: `SELECT COUNT(*) FROM sessions WHERE last_activity > NOW() - INTERVAL '15 minutes'`,
      refreshInterval: 30, // 30 seconds
      visualization: 'counter',
      priority: 'high'
    },
    {
      name: 'signups_per_minute',
      description: 'New user signups per minute',
      query: `SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '1 minute'`,
      refreshInterval: 60,
      visualization: 'gauge',
      priority: 'high'
    },
    {
      name: 'login_success_rate',
      description: 'Percentage of successful login attempts',
      query: `
        SELECT 
          (SELECT COUNT(*) FROM auth_log WHERE action = 'login' AND status = 'success' AND timestamp > NOW() - INTERVAL '5 minutes') * 100.0 / 
          NULLIF((SELECT COUNT(*) FROM auth_log WHERE action = 'login' AND timestamp > NOW() - INTERVAL '5 minutes'), 0)
      `,
      refreshInterval: 60,
      alertThreshold: 90,
      alertMessage: 'Login success rate has dropped below 90%',
      visualization: 'gauge',
      priority: 'critical'
    },
    
    // System performance metrics
    {
      name: 'api_response_time',
      description: 'Average API response time (ms)',
      query: `SELECT AVG(response_time) FROM api_log WHERE timestamp > NOW() - INTERVAL '5 minutes'`,
      refreshInterval: 30,
      alertThreshold: 300,
      alertMessage: 'Average API response time exceeds 300ms',
      visualization: 'line',
      priority: 'critical'
    },
    {
      name: 'error_rate',
      description: 'Error rate per minute',
      query: `SELECT COUNT(*) FROM error_log WHERE timestamp > NOW() - INTERVAL '1 minute'`,
      refreshInterval: 30,
      alertThreshold: 10,
      alertMessage: 'Error rate exceeds 10 per minute',
      visualization: 'line',
      priority: 'critical'
    },
    {
      name: 'db_connection_pool',
      description: 'Database connection pool utilization',
      query: `SELECT used_connections * 100.0 / total_connections FROM connection_pool_stats`,
      refreshInterval: 60,
      alertThreshold: 80,
      alertMessage: 'Database connection pool utilization above 80%',
      visualization: 'gauge',
      priority: 'high'
    },
    
    // Feature usage metrics
    {
      name: 'matches_recorded',
      description: 'Matches recorded in last hour',
      query: `SELECT COUNT(*) FROM matches WHERE created_at > NOW() - INTERVAL '1 hour'`,
      refreshInterval: 300, // 5 minutes
      visualization: 'counter',
      priority: 'medium'
    },
    {
      name: 'active_tournaments',
      description: 'Currently active tournaments',
      query: `SELECT COUNT(*) FROM tournaments WHERE status = 'active'`,
      refreshInterval: 300,
      visualization: 'counter',
      priority: 'medium'
    },
    {
      name: 'bug_reports',
      description: 'Bug reports submitted in last hour',
      query: `SELECT COUNT(*) FROM bug_reports WHERE created_at > NOW() - INTERVAL '1 hour'`,
      refreshInterval: 300,
      alertThreshold: 20,
      alertMessage: 'High volume of bug reports in the last hour',
      visualization: 'counter',
      priority: 'high'
    }
  ];
  
  // Insert the metrics
  for (const metric of metrics) {
    await db.execute(sql`
      INSERT INTO monitoring_metrics (
        name,
        description,
        query,
        refresh_interval,
        alert_threshold,
        alert_message,
        visualization,
        priority
      ) VALUES (
        ${metric.name},
        ${metric.description},
        ${metric.query},
        ${metric.refreshInterval},
        ${metric.alertThreshold || null},
        ${metric.alertMessage || null},
        ${metric.visualization},
        ${metric.priority}
      )
    `);
  }
  
  console.log(`Configured ${metrics.length} monitoring metrics`);
}

/**
 * Configure dashboard layout
 */
async function configureDashboardLayout() {
  console.log('Configuring dashboard layout...');
  
  // Clear existing panels
  await db.execute(sql`TRUNCATE monitoring_dashboard_panels`);
  
  // Define dashboard panels
  const panels: DashboardPanel[] = [
    // User activity panel
    {
      title: 'User Activity',
      description: 'Real-time user engagement metrics',
      metrics: ['active_users', 'signups_per_minute', 'login_success_rate'],
      layout: {
        width: 6,
        height: 4,
        x: 0,
        y: 0
      },
      refreshInterval: 30
    },
    
    // System health panel
    {
      title: 'System Health',
      description: 'Core system performance metrics',
      metrics: ['api_response_time', 'error_rate', 'db_connection_pool'],
      layout: {
        width: 6,
        height: 4,
        x: 6,
        y: 0
      },
      refreshInterval: 30
    },
    
    // Feature usage panel
    {
      title: 'Feature Usage',
      description: 'Key feature utilization metrics',
      metrics: ['matches_recorded', 'active_tournaments', 'bug_reports'],
      layout: {
        width: 12,
        height: 4,
        x: 0,
        y: 4
      },
      refreshInterval: 300
    }
  ];
  
  // Insert the panels
  for (const panel of panels) {
    await db.execute(sql`
      INSERT INTO monitoring_dashboard_panels (
        title,
        description,
        metrics,
        layout,
        refresh_interval
      ) VALUES (
        ${panel.title},
        ${panel.description},
        ${JSON.stringify(panel.metrics)},
        ${JSON.stringify(panel.layout)},
        ${panel.refreshInterval}
      )
    `);
  }
  
  console.log(`Configured ${panels.length} dashboard panels`);
}

/**
 * Configure alert notifications
 */
async function configureAlertNotifications() {
  console.log('Configuring alert notifications...');
  
  // Clear existing alert configurations
  await db.execute(sql`TRUNCATE monitoring_alert_notifications`);
  
  // Define alert notification configurations
  const alertConfigs = [
    {
      name: 'Critical Alerts',
      channels: {
        slack: {
          channel: '#launch-critical-alerts',
          mentions: ['@launch-team']
        },
        email: {
          recipients: ['ops@pickleplus.com', 'engineering@pickleplus.com'],
          subject: '[CRITICAL] Pickle+ Launch Alert'
        },
        sms: {
          recipients: ['+1234567890'] // On-call engineer
        }
      },
      throttleSettings: {
        enabled: false // No throttling for critical alerts
      }
    },
    {
      name: 'High Priority Alerts',
      channels: {
        slack: {
          channel: '#launch-alerts',
          mentions: []
        },
        email: {
          recipients: ['engineering@pickleplus.com'],
          subject: '[HIGH] Pickle+ Launch Alert'
        }
      },
      throttleSettings: {
        enabled: true,
        maxPerHour: 10,
        groupSimilar: true
      }
    },
    {
      name: 'Medium Priority Alerts',
      channels: {
        slack: {
          channel: '#launch-monitoring',
          mentions: []
        }
      },
      throttleSettings: {
        enabled: true,
        maxPerHour: 5,
        groupSimilar: true
      }
    }
  ];
  
  // Insert the alert configurations
  for (const config of alertConfigs) {
    await db.execute(sql`
      INSERT INTO monitoring_alert_notifications (
        name,
        channels,
        throttle_settings
      ) VALUES (
        ${config.name},
        ${JSON.stringify(config.channels)},
        ${JSON.stringify(config.throttleSettings)}
      )
    `);
  }
  
  console.log(`Configured ${alertConfigs.length} alert notification configurations`);
}

// Run the setup
setupLaunchMonitoring().catch(err => {
  console.error('Failed to set up launch monitoring:', err);
  process.exit(1);
});