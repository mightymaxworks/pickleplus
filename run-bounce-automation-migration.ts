/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Automation Migration
 * 
 * Run this script to create the database tables needed for the Bounce automation system
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';
import { bounceAutomationTables } from './shared/schema/bounce-automation';
import { pgEnum, pgTable, serial, text, boolean, timestamp, integer, json } from 'drizzle-orm/pg-core';

// Configure NeonDB
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

async function main() {
  try {
    // Connect to the database
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    console.log('Creating Bounce automation tables...');
    
    // Create the SCHEDULE_FREQUENCY enum
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bounce_schedule_frequency') THEN
          CREATE TYPE bounce_schedule_frequency AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM');
        END IF;
      END
      $$;
    `);
    
    // Create the TEST_RUN_STATUS enum
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bounce_test_run_status') THEN
          CREATE TYPE bounce_test_run_status AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
        END IF;
      END
      $$;
    `);
    
    // Create bounce_test_templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bounce_test_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        configuration JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_deleted BOOLEAN NOT NULL DEFAULT false,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);
    
    // Create bounce_schedules table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bounce_schedules (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        frequency bounce_schedule_frequency NOT NULL,
        custom_cron_expression TEXT,
        template_id INTEGER REFERENCES bounce_test_templates(id),
        configuration JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_by INTEGER REFERENCES users(id),
        next_run_time TIMESTAMP,
        last_run_time TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);
    
    // Create bounce_test_runs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bounce_test_runs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        schedule_id INTEGER REFERENCES bounce_schedules(id),
        template_id INTEGER REFERENCES bounce_test_templates(id),
        configuration JSONB NOT NULL DEFAULT '{}',
        status bounce_test_run_status NOT NULL DEFAULT 'PENDING',
        findings_count INTEGER DEFAULT 0,
        start_time TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        results JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        error_message TEXT
      );
    `);
    
    // Create bounce_achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bounce_achievements (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        icon TEXT,
        requirements JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP
      );
    `);
    
    // Create bounce_user_achievements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bounce_user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        achievement_id INTEGER NOT NULL REFERENCES bounce_achievements(id),
        unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
        progress JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}'
      );
    `);
    
    // Create bounce_findings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bounce_findings (
        id SERIAL PRIMARY KEY,
        test_run_id INTEGER REFERENCES bounce_test_runs(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN',
        location TEXT,
        reporter_id INTEGER REFERENCES users(id),
        verifier_id INTEGER REFERENCES users(id),
        verified_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        metadata JSONB NOT NULL DEFAULT '{}'
      );
    `);
    
    // Create bounce_test_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bounce_test_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        start_time TIMESTAMP NOT NULL DEFAULT NOW(),
        end_time TIMESTAMP,
        duration_minutes INTEGER,
        findings_count INTEGER DEFAULT 0,
        metadata JSONB NOT NULL DEFAULT '{}'
      );
    `);
    
    console.log('All Bounce automation tables created successfully!');
    
    // Add some initial test templates
    const templateCount = await db.execute(sql`SELECT COUNT(*) FROM bounce_test_templates`);
    if (templateCount.rows[0].count === '0') {
      console.log('Adding initial test templates...');
      
      await db.execute(sql`
        INSERT INTO bounce_test_templates 
        (name, description, configuration, created_at) 
        VALUES 
        ('Full Site Scan', 'Comprehensive scan of all site functionality', '{"scan_depth": "deep", "include_api": true}', NOW()),
        ('Quick Check', 'Fast check of critical functionality', '{"scan_depth": "shallow", "include_api": false}', NOW()),
        ('API Endpoints', 'Test all API endpoints for errors', '{"target": "api", "include_auth": true}', NOW()),
        ('User Journey', 'Test main user flows and journeys', '{"flows": ["registration", "profile", "match_recording"]}', NOW())
      `);
      
      console.log('Initial test templates added');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Import SQL for raw queries if needed
import { sql } from 'drizzle-orm';

main().then(() => {
  console.log('Done');
  process.exit(0);
}).catch((error) => {
  console.error('Error in main function:', error);
  process.exit(1);
});