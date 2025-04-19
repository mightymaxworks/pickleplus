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
import { 
  contentReports,
  moderationActions,
  communityRoles,
  userNotifications,
  notificationPreferences
} from './shared/schema';

/**
 * Main function to run the migration
 */
async function main() {
  console.log('Starting Community Moderation and Notifications migration...');
  
  try {
    // Check if tables already exist
    const tablesExist = await checkTablesExist(db);
    
    if (tablesExist) {
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
    
    // Add default roles for each community
    console.log('Adding default community roles...');
    await addDefaultCommunityRoles();
    
    // Add default notification preferences for each user
    console.log('Adding default notification preferences...');
    await addDefaultNotificationPreferences();
    
    console.log('Community Moderation and Notifications migration completed successfully');
  } catch (error) {
    console.error('Error during Community Moderation and Notifications migration:', error);
    process.exit(1);
  }
}

/**
 * Check if the Community Moderation and Notifications tables already exist
 */
async function checkTablesExist(db: any): Promise<boolean> {
  try {
    // Query to check if the tables exist
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'content_reports'
      ) AS content_reports_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_notifications'
      ) AS user_notifications_exists
    `);
    
    return result[0].content_reports_exists && result[0].user_notifications_exists;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    return false;
  }
}

/**
 * Add default community roles to each community
 */
async function addDefaultCommunityRoles() {
  // Get all communities
  const communities = await db.query.communities.findMany();
  
  for (const community of communities) {
    // Check if default roles already exist for this community
    const existingRoles = await db.query.communityRoles.findMany({
      where: (roles, { eq }) => eq(roles.communityId, community.id)
    });
    
    if (existingRoles.length > 0) {
      console.log(`Default roles already exist for community ${community.name} (ID: ${community.id})`);
      continue;
    }
    
    // Add default roles
    const defaultRoles = [
      {
        communityId: community.id,
        name: 'Administrator',
        permissions: 'manage_community,manage_members,manage_content,manage_roles,manage_settings',
        color: '#FF5733'
      },
      {
        communityId: community.id,
        name: 'Moderator',
        permissions: 'manage_content,manage_members',
        color: '#33A1FF'
      },
      {
        communityId: community.id,
        name: 'Member',
        permissions: 'view_content,create_content,participate',
        color: '#33FF57'
      }
    ];
    
    for (const role of defaultRoles) {
      await db.insert(communityRoles).values(role);
    }
    
    console.log(`Added default roles for community ${community.name} (ID: ${community.id})`);
  }
}

/**
 * Add default notification preferences for each user
 */
async function addDefaultNotificationPreferences() {
  // Get all users
  const users = await db.query.users.findMany();
  
  for (const user of users) {
    // Check if default preferences already exist for this user
    const existingPreferences = await db.query.notificationPreferences.findMany({
      where: (prefs, { eq }) => eq(prefs.userId, user.id)
    });
    
    if (existingPreferences.length > 0) {
      console.log(`Default notification preferences already exist for user ${user.username} (ID: ${user.id})`);
      continue;
    }
    
    // Add default preferences
    const defaultPreferences = [
      {
        userId: user.id,
        notificationType: 'community_post',
        channel: 'app',
        isEnabled: true
      },
      {
        userId: user.id,
        notificationType: 'mention',
        channel: 'app',
        isEnabled: true
      },
      {
        userId: user.id,
        notificationType: 'event_reminder',
        channel: 'app',
        isEnabled: true
      },
      {
        userId: user.id,
        notificationType: 'moderation_action',
        channel: 'app',
        isEnabled: true
      }
    ];
    
    for (const pref of defaultPreferences) {
      await db.insert(notificationPreferences).values(pref);
    }
    
    console.log(`Added default notification preferences for user ${user.username} (ID: ${user.id})`);
  }
}

// Run the migration
main().catch(console.error);