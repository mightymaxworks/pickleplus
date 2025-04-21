/**
 * PKL-278651-BOUNCE-0001-CORE - Bounce Automated Testing System
 * Direct Schema Creation Script
 * 
 * This script creates the database tables for the Bounce automated testing system
 * without using SQL migrations.
 * 
 * Run with: npx tsx create-bounce-tables.ts
 * 
 * @version 1.0.0
 * @framework Framework5.2
 * @lastUpdated 2025-04-21
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import { 
  bounceTestRuns, 
  bounceFindings, 
  bounceEvidence, 
  bounceSchedules, 
  bounceInteractions
} from './shared/schema/bounce';

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
console.log('Direct Schema Creation Script');
console.log('=======================================================');

async function createBounceTables() {
  try {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Creating Bounce tables...`);

    // Check if tables exist first
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bounce_test_runs'
      );
    `);
    
    const tablesExist = result.rows[0].exists === true;
    
    if (tablesExist) {
      console.log(`[${new Date().toISOString()}] Bounce tables already exist, skipping creation.`);
    } else {
      console.log(`[${new Date().toISOString()}] Creating bounce_test_runs table...`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "bounce_test_runs" (
          "id" SERIAL PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "status" VARCHAR(50) NOT NULL DEFAULT 'planned',
          "started_at" TIMESTAMP,
          "completed_at" TIMESTAMP,
          "user_id" INTEGER,
          "target_url" VARCHAR(255),
          "test_config" JSONB,
          "total_findings" INTEGER DEFAULT 0,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log(`[${new Date().toISOString()}] Creating bounce_findings table...`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "bounce_findings" (
          "id" SERIAL PRIMARY KEY,
          "test_run_id" INTEGER REFERENCES "bounce_test_runs"("id"),
          "title" VARCHAR(255) NOT NULL,
          "description" TEXT NOT NULL,
          "severity" VARCHAR(50) NOT NULL DEFAULT 'medium',
          "status" VARCHAR(50) NOT NULL DEFAULT 'new',
          "reproducible_steps" TEXT,
          "affected_url" VARCHAR(255),
          "browser_info" JSONB,
          "assigned_to_user_id" INTEGER,
          "reported_by_user_id" INTEGER,
          "fix_commit_hash" VARCHAR(100),
          "fixed_at" TIMESTAMP,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log(`[${new Date().toISOString()}] Creating bounce_evidence table...`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "bounce_evidence" (
          "id" SERIAL PRIMARY KEY,
          "finding_id" INTEGER REFERENCES "bounce_findings"("id"),
          "type" VARCHAR(50) NOT NULL DEFAULT 'screenshot',
          "content" TEXT NOT NULL,
          "metadata" JSONB,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log(`[${new Date().toISOString()}] Creating bounce_schedules table...`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "bounce_schedules" (
          "id" SERIAL PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "cron_expression" VARCHAR(50),
          "test_config" JSONB NOT NULL,
          "is_active" BOOLEAN DEFAULT TRUE,
          "last_run_at" TIMESTAMP,
          "next_run_at" TIMESTAMP,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log(`[${new Date().toISOString()}] Creating bounce_interactions table...`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "bounce_interactions" (
          "id" SERIAL PRIMARY KEY,
          "user_id" INTEGER,
          "finding_id" INTEGER REFERENCES "bounce_findings"("id"),
          "type" VARCHAR(50) NOT NULL DEFAULT 'view_report',
          "points" INTEGER DEFAULT 0,
          "metadata" JSONB,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log(`[${new Date().toISOString()}] Creating indexes...`);
      // Create indexes for performance
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_test_runs_status ON bounce_test_runs(status)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_test_runs_user_id ON bounce_test_runs(user_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_findings_test_run_id ON bounce_findings(test_run_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_findings_severity ON bounce_findings(severity)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_findings_status ON bounce_findings(status)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_findings_assigned_to_user_id ON bounce_findings(assigned_to_user_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_findings_reported_by_user_id ON bounce_findings(reported_by_user_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_evidence_finding_id ON bounce_evidence(finding_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_interactions_user_id ON bounce_interactions(user_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_interactions_finding_id ON bounce_interactions(finding_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bounce_schedules_is_active ON bounce_schedules(is_active)`);
      
      console.log(`[${new Date().toISOString()}] Tables created successfully!`);
    }

    // Calculate execution time
    const executionTime = (Date.now() - startTime) / 1000;
    console.log(`Operation completed in ${executionTime.toFixed(2)} seconds`);
    console.log('=======================================================');

    return true;
  } catch (error) {
    console.error('Error creating Bounce tables:', error);
    return false;
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Execute table creation
createBounceTables()
  .then(success => {
    if (success) {
      console.log('Table creation completed successfully');
      process.exit(0);
    } else {
      console.error('Table creation failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unhandled error during table creation:', error);
    process.exit(1);
  });