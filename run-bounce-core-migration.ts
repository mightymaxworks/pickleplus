/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing Core Infrastructure
 * 
 * This script creates the database tables for the Bounce automated testing system:
 * - bounce_test_runs: Tracks test execution runs
 * - bounce_findings: Stores issues/bugs discovered during testing
 * - bounce_evidence: Manages screenshots and other evidence
 * - bounce_schedules: Configures automated test scheduling
 * - bounce_interactions: Tracks user interactions with Bounce for gamification
 * 
 * Run with: npx tsx run-bounce-core-migration.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Pool } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

// Database connection is from process.env.DATABASE_URL
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function main() {
  console.log("Running PKL-278651-BOUNCE-0001-CORE migration...");
  
  try {
    // Check if tables already exist
    const tablesExist = await checkTablesExist();
    
    if (tablesExist) {
      console.log("Bounce tables already exist, skipping migration");
      return;
    }
    
    // Create bounce tables
    await createBounceTables();
    
    console.log("PKL-278651-BOUNCE-0001-CORE migration completed successfully");
  } catch (error) {
    console.error("Error running migration:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function checkTablesExist(): Promise<boolean> {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'bounce_test_runs'
    );
  `);
  
  return result.rows[0].exists;
}

async function createBounceTables() {
  // Create tables in a transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create bounce_test_runs table
    await client.query(`
      CREATE TABLE bounce_test_runs (
        id SERIAL PRIMARY KEY,
        test_id UUID NOT NULL DEFAULT gen_random_uuid(),
        start_time TIMESTAMP NOT NULL DEFAULT NOW(),
        end_time TIMESTAMP,
        browsers TEXT NOT NULL,
        test_types TEXT NOT NULL,
        coverage REAL,
        status TEXT NOT NULL DEFAULT 'running',
        total_issues INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create bounce_findings table
    await client.query(`
      CREATE TABLE bounce_findings (
        id SERIAL PRIMARY KEY,
        finding_id TEXT NOT NULL,
        test_run_id INTEGER REFERENCES bounce_test_runs(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        area TEXT NOT NULL,
        path TEXT,
        browser TEXT NOT NULL,
        device TEXT,
        screen_size TEXT,
        reproducibility INTEGER DEFAULT 100,
        status TEXT NOT NULL DEFAULT 'open',
        assigned_to INTEGER REFERENCES users(id),
        fixed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create bounce_evidence table
    await client.query(`
      CREATE TABLE bounce_evidence (
        id SERIAL PRIMARY KEY,
        finding_id INTEGER REFERENCES bounce_findings(id) ON DELETE CASCADE,
        evidence_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create bounce_schedules table
    await client.query(`
      CREATE TABLE bounce_schedules (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        cron_expression TEXT NOT NULL,
        browsers TEXT NOT NULL,
        test_types TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_run TIMESTAMP,
        next_run TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create bounce_interactions table for gamification
    await client.query(`
      CREATE TABLE bounce_interactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        interaction_type TEXT NOT NULL,
        points INTEGER NOT NULL,
        details JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create indexes for performance
    await client.query(`
      CREATE INDEX idx_bounce_findings_test_run ON bounce_findings(test_run_id);
      CREATE INDEX idx_bounce_findings_status ON bounce_findings(status);
      CREATE INDEX idx_bounce_findings_severity ON bounce_findings(severity);
      CREATE INDEX idx_bounce_evidence_finding ON bounce_evidence(finding_id);
      CREATE INDEX idx_bounce_interactions_user ON bounce_interactions(user_id);
    `);
    
    await client.query('COMMIT');
    console.log("Created bounce testing tables successfully");
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
main();