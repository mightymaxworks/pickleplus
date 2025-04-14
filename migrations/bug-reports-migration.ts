/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Reports Table Migration
 * 
 * This migration script creates the bug_reports table in the database.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

export async function migrateBugReportsTable() {
  console.log("[Migration] Starting bug reports table migration...");
  
  // Get database URL from environment variable
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  // Connect to the database
  const client = postgres(DATABASE_URL);
  const db = drizzle(client);
  
  try {
    // Check if the table already exists
    const tableExists = await checkTableExists(db, 'bug_reports');
    
    if (tableExists) {
      console.log("[Migration] bug_reports table already exists, skipping creation");
    } else {
      // Create the bug reports table
      await db.execute(sql`
        CREATE TABLE bug_reports (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          severity TEXT NOT NULL DEFAULT 'medium',
          status TEXT NOT NULL DEFAULT 'new',
          current_page TEXT,
          user_id INTEGER REFERENCES users(id),
          assigned_to INTEGER REFERENCES users(id),
          screenshot_path TEXT,
          user_agent TEXT,
          browser_info TEXT,
          screen_size TEXT,
          ip_address TEXT,
          user_info TEXT,
          steps_to_reproduce TEXT,
          is_reproducible BOOLEAN DEFAULT FALSE,
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          resolved_at TIMESTAMP
        )
      `);
      
      console.log("[Migration] bug_reports table created successfully");
    }
    
    // Add indices for better query performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS bug_reports_user_id_idx ON bug_reports(user_id);
      CREATE INDEX IF NOT EXISTS bug_reports_assigned_to_idx ON bug_reports(assigned_to);
      CREATE INDEX IF NOT EXISTS bug_reports_status_idx ON bug_reports(status);
      CREATE INDEX IF NOT EXISTS bug_reports_severity_idx ON bug_reports(severity);
      CREATE INDEX IF NOT EXISTS bug_reports_created_at_idx ON bug_reports(created_at);
    `);
    
    console.log("[Migration] Bug reports table indices created successfully");
    
    console.log("[Migration] Bug reports table migration completed successfully");
  } catch (error) {
    console.error("[Migration] Error during bug reports table migration:", error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
  }
}

/**
 * Check if a table exists in the database
 */
async function checkTableExists(db: any, tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ${tableName}
    )
  `);
  
  return result[0]?.exists || false;
}

// Note: This file is now imported from run-bug-reports-migration.ts
// We don't need to check if it's the main module in ES modules