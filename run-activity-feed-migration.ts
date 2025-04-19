/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Migration Script
 * 
 * This script creates the necessary database tables for the activity feed feature:
 * - activity_feed_entries: Stores activity feed events
 * - activity_read_status: Tracks which users have read which activities
 * - activity_feed_settings: Stores user preferences for activity feeds
 * 
 * Run with: npx tsx run-activity-feed-migration.ts
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { db } from './server/db';
import { sql } from 'drizzle-orm';
import { activityFeedEntries, activityReadStatus, activityFeedSettings } from './shared/schema/activity-feed';
import { createId } from '@paralleldrive/cuid2';

/**
 * Check if a table exists in the database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
    );
  `);
  
  return result.rows[0]?.exists === true;
}

/**
 * Main function to run the migration
 */
async function runMigration() {
  console.log('[PKL-278651-COMM-0022-FEED] Starting activity feed migration...');
  
  try {
    // Check if tables already exist
    const activityTableExists = await checkTableExists('activity_feed_entries');
    const readStatusTableExists = await checkTableExists('activity_read_status');
    const settingsTableExists = await checkTableExists('activity_feed_settings');
    
    if (activityTableExists && readStatusTableExists && settingsTableExists) {
      console.log('[PKL-278651-COMM-0022-FEED] Activity feed tables already exist, skipping migration.');
      return;
    }
    
    // Create the tables
    // Note: Drizzle creates tables in the correct order based on dependencies
    await db.execute(sql`
      -- Create activity_feed_entries table if it doesn't exist
      CREATE TABLE IF NOT EXISTS "activity_feed_entries" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "username" TEXT NOT NULL,
        "display_name" TEXT,
        "avatar" TEXT,
        "type" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
        "community_id" INTEGER,
        "community_name" TEXT,
        "metadata" JSONB,
        "related_entity_id" INTEGER,
        "related_entity_type" TEXT,
        "target_user_id" INTEGER,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Create activity_read_status table if it doesn't exist
      CREATE TABLE IF NOT EXISTS "activity_read_status" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "activity_id" INTEGER NOT NULL,
        "read_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "activity_read_status_activity_fk"
          FOREIGN KEY ("activity_id") REFERENCES "activity_feed_entries" ("id")
          ON DELETE CASCADE
      );
      
      -- Create activity_feed_settings table if it doesn't exist
      CREATE TABLE IF NOT EXISTS "activity_feed_settings" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL UNIQUE,
        "email_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
        "push_notifications" BOOLEAN NOT NULL DEFAULT TRUE,
        "show_read_activities" BOOLEAN NOT NULL DEFAULT FALSE,
        "activity_display_limit" INTEGER NOT NULL DEFAULT 50,
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS "activity_feed_entries_user_id_idx" ON "activity_feed_entries" ("user_id");
      CREATE INDEX IF NOT EXISTS "activity_feed_entries_community_id_idx" ON "activity_feed_entries" ("community_id");
      CREATE INDEX IF NOT EXISTS "activity_feed_entries_timestamp_idx" ON "activity_feed_entries" ("timestamp" DESC);
      CREATE INDEX IF NOT EXISTS "activity_read_status_user_id_idx" ON "activity_read_status" ("user_id");
      CREATE INDEX IF NOT EXISTS "activity_read_status_activity_id_idx" ON "activity_read_status" ("activity_id");
      CREATE UNIQUE INDEX IF NOT EXISTS "activity_read_status_user_activity_idx" ON "activity_read_status" ("user_id", "activity_id");
    `);
    
    console.log('[PKL-278651-COMM-0022-FEED] Activity feed tables created successfully!');
    
    // Insert some sample data
    const adminUserId = 1; // System/admin user ID
    
    // Create a sample activity for system announcements
    await db.insert(activityFeedEntries).values({
      userId: adminUserId,
      username: 'system',
      displayName: 'Pickle+ System',
      type: 'system_announcement',
      content: 'Welcome to the new Activity Feed! You will now receive real-time updates about matches, achievements, and community events.',
      timestamp: new Date(),
      metadata: { 
        icon: 'bell',
        color: 'blue',
        priority: 'high'
      }
    });
    
    console.log('[PKL-278651-COMM-0022-FEED] Sample activity created successfully!');
    console.log('[PKL-278651-COMM-0022-FEED] Migration completed successfully!');
    
  } catch (error) {
    console.error('[PKL-278651-COMM-0022-FEED] Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('[PKL-278651-COMM-0022-FEED] Activity feed migration completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('[PKL-278651-COMM-0022-FEED] Migration failed:', error);
    process.exit(1);
  });