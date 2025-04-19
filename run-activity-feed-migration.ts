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

/**
 * Check if a table exists in the database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = ${tableName}
    )
  `);
  
  return result.rows[0].exists;
}

/**
 * Main function to run the migration
 */
async function runMigration() {
  console.log('Starting activity feed migration...');
  
  try {
    // Check if activity feed entries table exists
    const activityFeedTableExists = await checkTableExists('activity_feed_entries');
    
    if (!activityFeedTableExists) {
      console.log('Creating activity_feed_entries table...');
      
      await db.execute(sql`
        CREATE TABLE activity_feed_entries (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
          metadata JSONB,
          related_entity_id INTEGER,
          related_entity_type VARCHAR(100),
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      
      console.log('Creating index on activity_feed_entries (user_id)...');
      await db.execute(sql`
        CREATE INDEX idx_activity_feed_entries_user_id ON activity_feed_entries(user_id)
      `);
      
      console.log('Creating index on activity_feed_entries (community_id)...');
      await db.execute(sql`
        CREATE INDEX idx_activity_feed_entries_community_id ON activity_feed_entries(community_id)
      `);
      
      console.log('Creating index on activity_feed_entries (type)...');
      await db.execute(sql`
        CREATE INDEX idx_activity_feed_entries_type ON activity_feed_entries(type)
      `);
    } else {
      console.log('activity_feed_entries table already exists, skipping...');
    }
    
    // Check if activity read status table exists
    const activityReadStatusTableExists = await checkTableExists('activity_read_status');
    
    if (!activityReadStatusTableExists) {
      console.log('Creating activity_read_status table...');
      
      await db.execute(sql`
        CREATE TABLE activity_read_status (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          activity_id INTEGER NOT NULL REFERENCES activity_feed_entries(id) ON DELETE CASCADE,
          read_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, activity_id)
        )
      `);
      
      console.log('Creating index on activity_read_status (user_id, activity_id)...');
      await db.execute(sql`
        CREATE INDEX idx_activity_read_status_user_activity ON activity_read_status(user_id, activity_id)
      `);
    } else {
      console.log('activity_read_status table already exists, skipping...');
    }
    
    // Check if activity feed settings table exists
    const activityFeedSettingsTableExists = await checkTableExists('activity_feed_settings');
    
    if (!activityFeedSettingsTableExists) {
      console.log('Creating activity_feed_settings table...');
      
      await db.execute(sql`
        CREATE TABLE activity_feed_settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          show_global_activities BOOLEAN DEFAULT TRUE,
          show_community_activities BOOLEAN DEFAULT TRUE,
          show_friend_activities BOOLEAN DEFAULT TRUE,
          show_achievement_activities BOOLEAN DEFAULT TRUE,
          show_match_activities BOOLEAN DEFAULT TRUE,
          show_tournament_activities BOOLEAN DEFAULT TRUE,
          activity_display_limit INTEGER DEFAULT 50,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
    } else {
      console.log('activity_feed_settings table already exists, skipping...');
    }
    
    console.log('Activity feed migration completed successfully!');
  } catch (error) {
    console.error('Error running activity feed migration:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration().then(() => {
  console.log('Migration completed, exiting...');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error during migration:', error);
  process.exit(1);
});