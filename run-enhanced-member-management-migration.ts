/**
 * PKL-278651-COMM-0034-MEMBER
 * Enhanced Member Management and Roles Migration
 * 
 * This script creates the database tables for enhanced member management:
 * - community_role_permissions: Defines granular permissions for each role
 * - role_assignments: Tracks custom role assignments to members
 * - member_actions_log: Audit log for bulk actions performed on members
 * 
 * Run with: npx tsx run-enhanced-member-management-migration.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  console.log('[PKL-278651-COMM-0034-MEMBER] Starting Enhanced Member Management migration...');
  
  // Database connection
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);
  
  try {
    // Check if tables already exist
    console.log('Checking if tables already exist...');
    
    const tablesExist = await checkTablesExist(db);
    
    if (tablesExist) {
      console.log('Tables already exist. Skipping migration.');
      return;
    }
    
    // Create permission_types table
    console.log('Creating community_permission_types table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_permission_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    
    // Create role_permissions table
    console.log('Creating community_role_permissions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_role_permissions (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        role VARCHAR(50) NOT NULL,
        permission_type VARCHAR(50) NOT NULL REFERENCES community_permission_types(name),
        is_granted BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE(community_id, role, permission_type)
      );
      
      CREATE INDEX IF NOT EXISTS community_role_permissions_community_role_idx 
        ON community_role_permissions(community_id, role);
    `);
    
    // Create custom_roles table
    console.log('Creating community_custom_roles table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_custom_roles (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        name VARCHAR(50) NOT NULL,
        color VARCHAR(20),
        icon VARCHAR(50),
        display_order INTEGER DEFAULT 0,
        is_assignable BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE(community_id, name)
      );
    `);
    
    // Create role_assignments table
    console.log('Creating community_role_assignments table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_role_assignments (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        custom_role_id INTEGER NOT NULL REFERENCES community_custom_roles(id),
        assigned_by_user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE(community_id, user_id, custom_role_id)
      );
      
      CREATE INDEX IF NOT EXISTS community_role_assignments_user_idx 
        ON community_role_assignments(user_id);
      CREATE INDEX IF NOT EXISTS community_role_assignments_community_idx 
        ON community_role_assignments(community_id);
    `);
    
    // Create member actions log table
    console.log('Creating community_member_actions_log table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_member_actions_log (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        action_type VARCHAR(50) NOT NULL,
        performed_by_user_id INTEGER REFERENCES users(id),
        target_user_ids INTEGER[] NOT NULL,
        action_details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS community_member_actions_log_community_idx 
        ON community_member_actions_log(community_id);
      CREATE INDEX IF NOT EXISTS community_member_actions_log_type_idx 
        ON community_member_actions_log(action_type);
    `);
    
    // Insert default permission types
    console.log('Inserting default permission types...');
    await db.execute(sql`
      INSERT INTO community_permission_types (name, description, category)
      VALUES 
        ('manage_members', 'Add or remove members from the community', 'Members'),
        ('assign_roles', 'Assign roles to community members', 'Members'),
        ('manage_roles', 'Create, edit, or delete roles', 'Members'),
        ('create_events', 'Create community events', 'Events'),
        ('edit_events', 'Edit community events', 'Events'),
        ('delete_events', 'Delete community events', 'Events'),
        ('create_posts', 'Create community posts', 'Content'),
        ('edit_posts', 'Edit community posts', 'Content'),
        ('delete_posts', 'Delete community posts', 'Content'),
        ('pin_posts', 'Pin important posts to the top', 'Content'),
        ('moderate_comments', 'Approve, edit, or delete comments', 'Content'),
        ('manage_settings', 'Change community settings', 'Administration'),
        ('view_analytics', 'View community analytics and statistics', 'Analytics'),
        ('export_data', 'Export community data', 'Analytics'),
        ('manage_invitations', 'Send and manage community invitations', 'Members'),
        ('approve_join_requests', 'Approve or reject join requests', 'Members'),
        ('send_announcements', 'Send community-wide announcements', 'Communication'),
        ('manage_community_profile', 'Edit community profile, banner, and avatar', 'Administration')
      ON CONFLICT (name) DO NOTHING;
    `);
    
    // Define default role permissions for each community
    console.log('Setting up default role permissions...');
    
    // Get all existing communities
    const result = await db.execute(sql`SELECT id FROM communities`);
    const communities = result.rows;
    
    for (const community of communities) {
      const communityId = community.id;
      console.log(`Setting up default role permissions for community ${communityId}...`);
      
      // Insert admin permissions (all granted)
      const adminPermissions = await db.execute(sql`
        SELECT name FROM community_permission_types
      `);
      
      for (const perm of adminPermissions.rows) {
        await db.execute(sql`
          INSERT INTO community_role_permissions 
            (community_id, role, permission_type, is_granted)
          VALUES 
            (${communityId}, 'admin', ${perm.name}, TRUE)
          ON CONFLICT (community_id, role, permission_type) 
          DO UPDATE SET is_granted = TRUE, updated_at = NOW()
        `);
      }
      
      // Insert moderator permissions
      const moderatorPermissions = [
        'manage_members', 'create_events', 'edit_events', 'create_posts', 
        'edit_posts', 'pin_posts', 'moderate_comments', 'view_analytics',
        'approve_join_requests'
      ];
      
      for (const perm of moderatorPermissions) {
        await db.execute(sql`
          INSERT INTO community_role_permissions 
            (community_id, role, permission_type, is_granted)
          VALUES 
            (${communityId}, 'moderator', ${perm}, TRUE)
          ON CONFLICT (community_id, role, permission_type) 
          DO UPDATE SET is_granted = TRUE, updated_at = NOW()
        `);
      }
      
      // Insert member permissions
      const memberPermissions = [
        'create_posts', 'view_analytics'
      ];
      
      for (const perm of memberPermissions) {
        await db.execute(sql`
          INSERT INTO community_role_permissions 
            (community_id, role, permission_type, is_granted)
          VALUES 
            (${communityId}, 'member', ${perm}, TRUE)
          ON CONFLICT (community_id, role, permission_type) 
          DO UPDATE SET is_granted = TRUE, updated_at = NOW()
        `);
      }
      
      // Create default custom roles for each community
      await db.execute(sql`
        INSERT INTO community_custom_roles 
          (community_id, name, color, icon, display_order)
        VALUES 
          (${communityId}, 'VIP Member', '#FFD700', 'award', 10),
          (${communityId}, 'Contributor', '#4287f5', 'gift', 20),
          (${communityId}, 'Event Organizer', '#2ecc71', 'calendar', 30)
        ON CONFLICT (community_id, name) DO NOTHING
      `);
    }
    
    console.log('[PKL-278651-COMM-0034-MEMBER] Migration completed successfully.');
    
  } catch (error) {
    console.error('[PKL-278651-COMM-0034-MEMBER] Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

/**
 * Check if the required tables already exist
 */
async function checkTablesExist(db: any): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'community_role_permissions'
      ) as exists
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking if tables exist:', error);
    return false;
  }
}

// Run the migration
run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });