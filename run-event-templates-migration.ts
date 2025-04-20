/**
 * PKL-278651-COMM-0035-EVENT
 * Event Templates Migration
 * 
 * This script creates the database table for event templates
 * which enables community admins to create reusable event templates.
 * 
 * Run with: npx tsx run-event-templates-migration.ts
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

async function migrateEventTemplates() {
  console.log('Starting Event Templates migration...');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  
  // Direct SQL client for raw queries
  const pgConnection = postgres(dbUrl);
  const db = drizzle(pgConnection);
  
  try {
    // Check if table already exists
    const tableExists = await checkTableExists(db, 'event_templates');
    
    if (tableExists) {
      console.log('Event templates table already exists. Skipping migration.');
      return;
    }
    
    console.log('Creating event_templates table...');
    
    // Create the event_templates table
    await db.execute(sql`
      CREATE TABLE event_templates (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        created_by_user_id INTEGER NOT NULL REFERENCES users(id),
        name VARCHAR(50) NOT NULL,
        description TEXT,
        event_type VARCHAR(50) NOT NULL DEFAULT 'match_play',
        duration_minutes INTEGER NOT NULL DEFAULT 120,
        location TEXT,
        is_virtual BOOLEAN DEFAULT FALSE,
        virtual_meeting_url TEXT,
        max_attendees INTEGER,
        min_skill_level VARCHAR(10) DEFAULT 'all',
        max_skill_level VARCHAR(10) DEFAULT 'all',
        recurring_pattern VARCHAR(50),
        is_default BOOLEAN DEFAULT FALSE,
        created_at VARCHAR(50) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at VARCHAR(50) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Successfully created event_templates table');
    
    // Create index for faster lookups by community
    await db.execute(sql`
      CREATE INDEX idx_event_templates_community_id ON event_templates(community_id)
    `);
    
    console.log('Successfully created index on event_templates(community_id)');
    
  } catch (error) {
    console.error('Error during event templates migration:', error);
    throw error;
  } finally {
    await pgConnection.end();
  }
}

/**
 * Helper function to check if a table exists
 */
async function checkTableExists(db: any, tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    )
  `);
  
  return result[0].exists;
}

/**
 * Main function to run the migration
 */
async function main() {
  try {
    await migrateEventTemplates();
    console.log('Event Templates migration completed successfully');
  } catch (error) {
    console.error('Failed to run Event Templates migration:', error);
    process.exit(1);
  }
}

// Run the migration
main();