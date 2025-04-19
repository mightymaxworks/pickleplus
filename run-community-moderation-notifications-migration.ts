/**
 * PKL-278651-COMM-0027-MOD & PKL-278651-COMM-0028-NOTIF
 * Community Moderation and Notifications Migration Runner
 * 
 * This script runs the migration for creating the community moderation and notifications tables
 * Run with: npx tsx run-community-moderation-notifications-migration.ts
 * 
 * Implementation timestamp: 2025-04-19 12:30 ET
 */
import { db } from './server/db';
import { sql } from 'drizzle-orm';

/**
 * Main function to run the migration
 */
async function main() {
  console.log('Starting Community Moderation and Notifications migration...');
  
  try {
    // Check if tables already exist using simpler approach
    const tableExists = await checkTableExists(db, 'content_reports');
    
    if (tableExists) {
      console.log('Community Moderation and Notifications tables already exist. Exiting...');
      process.exit(0);
    }
    
    // Create moderation tables (PKL-278651-COMM-0027-MOD)
    console.log('Creating Community Moderation tables...');
    
    // Create the content_reports table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS content_reports (
        id SERIAL PRIMARY KEY,
        reporter_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER NOT NULL REFERENCES communities(id),
        content_type VARCHAR(50) NOT NULL,
        content_id INTEGER NOT NULL,
        reason VARCHAR(100) NOT NULL,
        details TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        reviewer_id INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create the moderation_actions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS moderation_actions (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        moderator_id INTEGER NOT NULL REFERENCES users(id),
        target_user_id INTEGER NOT NULL REFERENCES users(id),
        action_type VARCHAR(20) NOT NULL,
        reason TEXT,
        duration_hours INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Create the community_roles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_roles (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        name VARCHAR(50) NOT NULL,
        permissions TEXT NOT NULL,
        color VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(community_id, name)
      )
    `);
    
    console.log('Community Moderation tables created successfully');
    
    // Create notification tables (PKL-278651-COMM-0028-NOTIF)
    console.log('Creating Community Notification tables...');
    
    // Create the user_notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER REFERENCES communities(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        reference_id INTEGER,
        reference_type VARCHAR(50),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP
      )
    `);
    
    // Create the notification_preferences table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER REFERENCES communities(id),
        notification_type VARCHAR(50) NOT NULL,
        channel VARCHAR(20) NOT NULL,
        is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Community Notification tables created successfully');
    
    // Insert default community roles for admin community
    console.log('Adding default community roles for admin community (id=1)...');
    
    // Add default roles for admin community (id=1)
    await db.execute(sql`
      INSERT INTO community_roles (community_id, name, permissions, color)
      VALUES 
        (1, 'Administrator', 'manage_community,manage_members,manage_content,manage_roles,manage_settings', '#FF5733'),
        (1, 'Moderator', 'manage_content,manage_members', '#33A1FF'),
        (1, 'Member', 'view_content,create_content,participate', '#33FF57')
      ON CONFLICT (community_id, name) DO NOTHING
    `);
    
    // Insert default notification preferences for first user
    console.log('Adding default notification preferences for first user (id=1)...');
    
    await db.execute(sql`
      INSERT INTO notification_preferences (user_id, notification_type, channel, is_enabled)
      VALUES 
        (1, 'community_post', 'app', TRUE),
        (1, 'mention', 'app', TRUE),
        (1, 'event_reminder', 'app', TRUE),
        (1, 'moderation_action', 'app', TRUE)
    `);
    
    console.log('Community Moderation and Notifications migration completed successfully');
  } catch (error) {
    console.error('Error during Community Moderation and Notifications migration:', error);
    process.exit(1);
  }
}

/**
 * Simple function to check if a table exists
 */
async function checkTableExists(db: any, tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    `);
    
    return result[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Run the migration
main().catch(console.error);