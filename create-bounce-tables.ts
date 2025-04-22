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
 * @lastUpdated 2025-04-22
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as bounceSchema from './shared/schema/bounce';
import { sql as sqlWrapper } from 'drizzle-orm';
import ws from 'ws';

// Configure neon to use ws
neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable must be set');
  process.exit(1);
}

async function createBounceTables() {
  console.log("=======================================================");
  console.log("PKL-278651-BOUNCE-0001-CORE - Bounce Automated Testing System");
  console.log("Direct Schema Creation Script");
  console.log("=======================================================");
  
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Creating Bounce tables...`);
  
  // Create a connection pool to the database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  try {
    // Check if tables already exist
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'bounce_test_runs'
      )
    `);
    
    if (tableCheck[0] && tableCheck[0].exists) {
      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;
      console.log(`[${endTime.toISOString()}] Bounce tables already exist, skipping creation.`);
      console.log(`Operation completed in ${duration.toFixed(2)} seconds`);
      console.log("=======================================================");
      console.log("Table creation completed successfully");
      pool.end();
      return;
    }
    
    // Create the tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bounce_test_runs (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        target_url TEXT,
        test_config TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        total_findings INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bounce_findings (
        id SERIAL PRIMARY KEY,
        test_run_id INTEGER REFERENCES bounce_test_runs(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        status TEXT NOT NULL DEFAULT 'OPEN',
        reproducible_steps TEXT,
        affected_url TEXT,
        browser_info JSONB,
        device_info JSONB,
        area TEXT,
        fixed_in TEXT,
        fixed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bounce_evidence (
        id SERIAL PRIMARY KEY,
        finding_id INTEGER REFERENCES bounce_findings(id),
        type TEXT NOT NULL DEFAULT 'TEXT',
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bounce_schedules (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        target_url TEXT NOT NULL,
        frequency TEXT NOT NULL,
        test_config JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        last_run_at TIMESTAMP,
        next_run_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bounce_interactions (
        id SERIAL PRIMARY KEY,
        test_run_id INTEGER REFERENCES bounce_test_runs(id),
        finding_id INTEGER REFERENCES bounce_findings(id),
        type TEXT NOT NULL,
        selector TEXT,
        value TEXT,
        url TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB,
        screenshot TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(`[${endTime.toISOString()}] Bounce tables created successfully.`);
    console.log(`Operation completed in ${duration.toFixed(2)} seconds`);
    console.log("=======================================================");
    console.log("Table creation completed successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    console.log("=======================================================");
    console.log("Table creation failed");
    process.exit(1);
  } finally {
    pool.end();
  }
}

// Use the imported sqlWrapper instead of a custom sql function
const sql = sqlWrapper;

// Run the function
createBounceTables().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});