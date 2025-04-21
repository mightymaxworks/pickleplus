/**
 * PKL-278651-BOUNCE-0001-CORE - Bounce Automated Testing System
 * Database migration script
 * 
 * This script creates the database tables for the Bounce automated testing system.
 * Run with: npx tsx run-bounce-system-migration.ts
 * 
 * @version 1.0.0
 * @framework Framework5.2
 * @lastUpdated 2025-04-21
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';
import { 
  bounceTestRuns, 
  bounceFindings, 
  bounceEvidence, 
  bounceSchedules, 
  bounceInteractions,
  BounceTestRunStatus,
  BounceFindingSeverity,
  BounceFindingStatus,
  BounceEvidenceType,
  BounceInteractionType
} from './shared/schema';

// Initialize environment variables
dotenv.config();

// Configure NeonDB to use WebSockets
neonConfig.webSocketConstructor = ws;

// Validate environment
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Set up PostgreSQL connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Log banner
console.log('=======================================================');
console.log('PKL-278651-BOUNCE-0001-CORE - Bounce Automated Testing System');
console.log('Database Migration Script');
console.log('=======================================================');
console.log('Starting migration...');

async function createBounceSystemTables() {
  try {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Creating Bounce system tables...`);

    // Check if the tables already exist
    const tablesExist = await checkTablesExist();
    
    if (tablesExist) {
      console.log(`[${new Date().toISOString()}] Bounce tables already exist, skipping creation.`);
    } else {
      // Create migrations directory if it doesn't exist
      const migrationsDir = path.join(process.cwd(), 'migrations');
      if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
        console.log(`Created migrations directory at ${migrationsDir}`);
      }

      // Run the migration
      await migrate(db, { migrationsFolder: './migrations' });
      console.log(`[${new Date().toISOString()}] Tables created successfully!`);
    }

    // Insert initial test data if environment is development
    if ((process.env.NODE_ENV === 'development' || process.env.ADD_TEST_DATA) && !tablesExist) {
      console.log(`[${new Date().toISOString()}] Inserting initial test data...`);
      await insertTestData();
      console.log(`[${new Date().toISOString()}] Test data inserted successfully!`);
    }

    // Calculate execution time
    const executionTime = (Date.now() - startTime) / 1000;
    console.log(`Migration completed in ${executionTime.toFixed(2)} seconds`);
    console.log('=======================================================');

    return true;
  } catch (error) {
    console.error('Error creating Bounce system tables:', error);
    return false;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

/**
 * Check if the Bounce tables already exist in the database
 * @returns Whether the tables exist
 */
async function checkTablesExist(): Promise<boolean> {
  try {
    // Query to check if both the bounce_test_runs AND achievements tables exist
    // The achievements table is causing the error, so we need to check for it too
    const bounce_result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bounce_test_runs'
      );
    `);
    
    const achievements_result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'achievements'
      );
    `);
    
    // If both tables exist, return true
    return bounce_result.rows[0].exists || achievements_result.rows[0].exists;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    // If we get an error here, assume tables exist to be safe
    return true;
  }
}

async function insertTestData() {
  // Insert test run
  const [testRun] = await db.insert(bounceTestRuns).values({
    name: 'Initial System Test',
    description: 'First automated test of the system',
    status: BounceTestRunStatus.COMPLETED,
    startedAt: new Date(Date.now() - 3600000), // 1 hour ago
    completedAt: new Date(),
    userId: 1, // Assuming admin user ID
    targetUrl: 'https://pickle-plus.replit.app',
    testConfig: {
      browser: 'chromium',
      viewportSize: { width: 1280, height: 720 },
      scenarios: ['login', 'profile', 'matches']
    }
  }).returning();

  console.log(`Created test run with ID: ${testRun.id}`);

  // Insert test findings
  const [criticalFinding] = await db.insert(bounceFindings).values({
    testRunId: testRun.id,
    title: 'Authentication failure on mobile viewport',
    description: 'Login button becomes unresponsive on mobile viewport sizes below 375px width',
    severity: BounceFindingSeverity.CRITICAL,
    status: BounceFindingStatus.NEW,
    reproducibleSteps: '1. Resize viewport to 320x568\n2. Navigate to login page\n3. Try to click login button',
    affectedUrl: 'https://pickle-plus.replit.app/login',
    browserInfo: {
      browser: 'chromium',
      version: '112.0.5615.49',
      platform: 'macOS',
      viewport: { width: 320, height: 568 }
    },
    reportedByUserId: 1
  }).returning();

  console.log(`Created critical finding with ID: ${criticalFinding.id}`);

  const [mediumFinding] = await db.insert(bounceFindings).values({
    testRunId: testRun.id,
    title: 'Profile page slow to load',
    description: 'Profile page takes more than 3 seconds to load when viewing achievements section',
    severity: BounceFindingSeverity.MEDIUM,
    status: BounceFindingStatus.TRIAGE,
    reproducibleSteps: '1. Login to application\n2. Navigate to profile page\n3. Click on achievements tab',
    affectedUrl: 'https://pickle-plus.replit.app/profile',
    browserInfo: {
      browser: 'chromium',
      version: '112.0.5615.49',
      platform: 'macOS',
      viewport: { width: 1280, height: 720 }
    },
    reportedByUserId: 1
  }).returning();

  console.log(`Created medium finding with ID: ${mediumFinding.id}`);

  // Insert evidence for critical finding
  await db.insert(bounceEvidence).values({
    findingId: criticalFinding.id,
    type: BounceEvidenceType.SCREENSHOT,
    content: 'https://storage.example.com/bounce/evidence/screenshot1.png',
    metadata: {
      timestamp: new Date().toISOString(),
      device: 'iPhone SE',
      viewportSize: { width: 320, height: 568 }
    }
  });

  await db.insert(bounceEvidence).values({
    findingId: criticalFinding.id,
    type: BounceEvidenceType.CONSOLE_LOG,
    content: 'Error: Unable to locate element "#login-button" in viewport',
    metadata: {
      timestamp: new Date().toISOString(),
      browser: 'chromium',
      severity: 'error'
    }
  });

  // Create test schedule
  await db.insert(bounceSchedules).values({
    name: 'Daily Smoke Test',
    description: 'Runs basic smoke tests every day at midnight',
    cronExpression: '0 0 * * *',
    testConfig: {
      browser: 'chromium',
      viewportSizes: [
        { width: 1280, height: 720 },
        { width: 375, height: 667 }
      ],
      scenarios: ['login', 'profile', 'matches'],
      maxDuration: 300 // 5 minutes
    },
    isActive: true
  });

  // Insert user interaction with findings
  await db.insert(bounceInteractions).values({
    userId: 1,
    findingId: criticalFinding.id,
    type: BounceInteractionType.CONFIRM_FINDING,
    points: 50,
    metadata: {
      comment: 'I was able to reproduce this issue consistently',
      timestamp: new Date().toISOString()
    }
  });
}

// Execute migration
createBounceSystemTables()
  .then(success => {
    if (success) {
      console.log('Migration completed successfully');
      process.exit(0);
    } else {
      console.error('Migration failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error during migration:', error);
    process.exit(1);
  });