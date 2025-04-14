/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Migration Script
 * 
 * This script creates the bug_reports table in the database
 * Run with: npx tsx migrations/bug-reports-migration.ts
 */

import { createClient } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { bugReports } from '../shared/bug-report-schema';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

async function migrateBugReportingSystem() {
  console.log('[Migration] Starting bug reporting system migration...');
  
  // Initialize database connection
  const dbURL = process.env.DATABASE_URL;
  if (!dbURL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }
  
  const client = createClient({ connectionString: dbURL });
  await client.connect();
  const db = drizzle(client);
  
  // Check if the table already exists
  const tableExists = await checkTableExists('bug_reports');
  
  if (tableExists) {
    console.log('[Migration] Bug reports table already exists. No changes made.');
    await client.end();
    return;
  }
  
  try {
    // Create the bug_reports table
    const createTable = sql`
    CREATE TABLE IF NOT EXISTS bug_reports (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      severity VARCHAR(20) NOT NULL,
      current_page VARCHAR(255),
      user_id INTEGER REFERENCES users(id),
      user_agent TEXT,
      browser_info TEXT,
      screen_size VARCHAR(50),
      ip_address VARCHAR(50),
      user_info TEXT,
      screenshot_path VARCHAR(255),
      status VARCHAR(20) NOT NULL DEFAULT 'new',
      is_reproducible BOOLEAN,
      steps_to_reproduce TEXT,
      admin_notes TEXT,
      assigned_to INTEGER REFERENCES users(id),
      resolved_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`;
    
    await db.execute(createTable);
    
    console.log('[Migration] Bug reports table created successfully.');
    console.log('[Migration] Bug reporting system migration completed.');
  } catch (error) {
    console.error('[Migration] Error creating bug reports table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Helper function to check if a table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const client = createClient({ connectionString: process.env.DATABASE_URL! });
  await client.connect();
  
  try {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName]);
    
    return result.rows[0].exists;
  } finally {
    await client.end();
  }
}

// Execute the migration
migrateBugReportingSystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });