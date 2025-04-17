/**
 * PKL-278651-COMM-0007-DB-EVT - Community Event Enhancements
 * Migration Script
 * 
 * This script runs the migration to update the community events table with new fields
 * for event types, skill level requirements, and event status.
 * 
 * Run with: npx tsx run-community-event-enhancements-migration.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

async function migrateEventEnhancements() {
  console.log('Starting Community Event Enhancements migration...');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  
  // Direct SQL client for raw queries
  const pgConnection = postgres(dbUrl);
  const db = drizzle(pgConnection);
  
  try {
    console.log('Checking if columns already exist...');
    const tableInfo = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'community_events'
    `);

    const columns = tableInfo.map((row: any) => row.column_name);
    const columnsToAdd: string[] = [];

    if (!columns.includes('event_type')) {
      columnsToAdd.push("ALTER TABLE community_events ADD COLUMN event_type VARCHAR(50) NOT NULL DEFAULT 'match_play'");
    }
    
    if (!columns.includes('min_skill_level')) {
      columnsToAdd.push("ALTER TABLE community_events ADD COLUMN min_skill_level VARCHAR(10)");
    }
    
    if (!columns.includes('max_skill_level')) {
      columnsToAdd.push("ALTER TABLE community_events ADD COLUMN max_skill_level VARCHAR(10)");
    }
    
    if (!columns.includes('image_url')) {
      columnsToAdd.push("ALTER TABLE community_events ADD COLUMN image_url TEXT");
    }
    
    if (!columns.includes('status')) {
      columnsToAdd.push("ALTER TABLE community_events ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active'");
    }

    if (columnsToAdd.length > 0) {
      console.log(`Adding ${columnsToAdd.length} new columns to community_events table...`);
      
      for (const alterStatement of columnsToAdd) {
        await db.execute(alterStatement);
      }
      
      console.log('Creating indexes for new columns...');
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_community_events_event_type ON community_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_community_events_status ON community_events(status);
      `);
      
      console.log('Migration completed successfully.');
    } else {
      console.log('All required columns already exist in the community_events table. No migration needed.');
    }
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await pgConnection.end();
  }
}

/**
 * Main function to run the migration
 */
async function main() {
  try {
    await migrateEventEnhancements();
    console.log('Community Event Enhancements migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();