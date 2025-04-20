/**
 * PKL-278651-COMM-0034-MEMBER
 * Enhanced Member Management Migration
 * 
 * This script creates and seeds the database tables for the enhanced
 * member management feature, including custom roles and permissions.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import {
  communityPermissionTypes,
  communityRolePermissions,
  communityCustomRoles,
  communityRoleAssignments,
  communityMemberActionsLog,
} from './shared/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_PERMISSION_TYPES = [
  // Content Management
  {
    name: "create_posts",
    displayName: "Create Posts",
    description: "Can create new posts in the community",
    category: "Content Management"
  },
  {
    name: "edit_posts",
    displayName: "Edit Posts",
    description: "Can edit any post in the community",
    category: "Content Management"
  },
  {
    name: "delete_posts",
    displayName: "Delete Posts",
    description: "Can delete any post in the community",
    category: "Content Management"
  },
  {
    name: "create_events",
    displayName: "Create Events",
    description: "Can create new events for the community",
    category: "Content Management"
  },
  {
    name: "edit_events",
    displayName: "Edit Events",
    description: "Can edit any event in the community",
    category: "Content Management"
  },
  {
    name: "delete_events",
    displayName: "Delete Events",
    description: "Can delete any event in the community",
    category: "Content Management"
  },
  
  // Member Management
  {
    name: "view_members",
    displayName: "View Members",
    description: "Can view the list of community members",
    category: "Member Management"
  },
  {
    name: "manage_members",
    displayName: "Manage Members",
    description: "Can add, remove, and manage community members",
    category: "Member Management"
  },
  {
    name: "assign_roles",
    displayName: "Assign Roles",
    description: "Can assign custom roles to community members",
    category: "Member Management"
  },
  {
    name: "manage_roles",
    displayName: "Manage Roles",
    description: "Can create, edit, and delete custom roles",
    category: "Member Management"
  },
  
  // Moderation
  {
    name: "approve_content",
    displayName: "Approve Content",
    description: "Can approve content in the moderation queue",
    category: "Moderation"
  },
  {
    name: "reject_content",
    displayName: "Reject Content",
    description: "Can reject content in the moderation queue",
    category: "Moderation"
  },
  {
    name: "manage_reports",
    displayName: "Manage Reports",
    description: "Can handle reported content and take action",
    category: "Moderation"
  },
  {
    name: "ban_members",
    displayName: "Ban Members",
    description: "Can ban members from the community",
    category: "Moderation"
  },
  
  // Settings
  {
    name: "edit_community",
    displayName: "Edit Community",
    description: "Can edit community information and settings",
    category: "Settings"
  },
  {
    name: "manage_privacy",
    displayName: "Manage Privacy",
    description: "Can manage community privacy settings",
    category: "Settings"
  },
  {
    name: "view_analytics",
    displayName: "View Analytics",
    description: "Can view community analytics and reports",
    category: "Settings"
  }
];

// Default role permissions mapping
const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    // Admin has all permissions
    create_posts: true,
    edit_posts: true,
    delete_posts: true,
    create_events: true,
    edit_events: true,
    delete_events: true,
    view_members: true,
    manage_members: true,
    assign_roles: true,
    manage_roles: true,
    approve_content: true,
    reject_content: true,
    manage_reports: true,
    ban_members: true,
    edit_community: true,
    manage_privacy: true,
    view_analytics: true
  },
  moderator: {
    // Moderator has content management and moderation permissions
    create_posts: true,
    edit_posts: true,
    delete_posts: true,
    create_events: true,
    edit_events: true,
    delete_events: true,
    view_members: true,
    assign_roles: false,
    manage_members: true,
    manage_roles: false,
    approve_content: true,
    reject_content: true,
    manage_reports: true,
    ban_members: true,
    edit_community: false,
    manage_privacy: false,
    view_analytics: true
  },
  member: {
    // Regular member has basic content creation permissions
    create_posts: true,
    edit_posts: false,
    delete_posts: false,
    create_events: false,
    edit_events: false,
    delete_events: false,
    view_members: true,
    manage_members: false,
    assign_roles: false,
    manage_roles: false,
    approve_content: false,
    reject_content: false,
    manage_reports: false,
    ban_members: false,
    edit_community: false,
    manage_privacy: false,
    view_analytics: false
  }
};

// Example custom roles to seed
const EXAMPLE_CUSTOM_ROLES = [
  {
    name: "Event Coordinator",
    description: "Can create and manage community events",
    color: "#16a34a", // green-600
    icon: "calendar"
  },
  {
    name: "Content Creator",
    description: "Creates official content for the community",
    color: "#2563eb", // blue-600
    icon: "file-text"
  },
  {
    name: "Tournament Director",
    description: "Manages tournaments and competitive events",
    color: "#9333ea", // purple-600
    icon: "trophy"
  },
  {
    name: "VIP Member",
    description: "Special status for distinguished community members",
    color: "#f59e0b", // amber-500
    icon: "star"
  }
];

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const db = drizzle(pool);

  console.log('=====================================================');
  console.log('PKL-278651-COMM-0034-MEMBER - Enhanced Member Management');
  console.log('=====================================================');
  
  try {
    console.log('Creating tables...');
    
    // Create the tables
    await db.execute(`
      -- Create community_permission_types table if it doesn't exist
      CREATE TABLE IF NOT EXISTS community_permission_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Create community_role_permissions table if it doesn't exist
      CREATE TABLE IF NOT EXISTS community_role_permissions (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        permission_type VARCHAR(50) NOT NULL,
        allowed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(community_id, role, permission_type)
      );

      -- Create community_custom_roles table if it doesn't exist
      CREATE TABLE IF NOT EXISTS community_custom_roles (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
        icon VARCHAR(50),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(community_id, name)
      );

      -- Create community_role_assignments table if it doesn't exist
      CREATE TABLE IF NOT EXISTS community_role_assignments (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        custom_role_id INTEGER NOT NULL REFERENCES community_custom_roles(id) ON DELETE CASCADE,
        assigned_by_user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(community_id, user_id, custom_role_id)
      );

      -- Create community_member_actions_log table if it doesn't exist
      CREATE TABLE IF NOT EXISTS community_member_actions_log (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,
        performed_by_user_id INTEGER NOT NULL REFERENCES users(id),
        target_user_ids INTEGER[] NOT NULL,
        action_details JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Tables created successfully.');
    
    // Seed permission types
    console.log('Seeding permission types...');
    
    // Check if permission types already exist
    const existingPermissionTypes = await db
      .select()
      .from(communityPermissionTypes);
    
    if (existingPermissionTypes.length === 0) {
      for (const permType of DEFAULT_PERMISSION_TYPES) {
        await db.insert(communityPermissionTypes).values(permType);
      }
      console.log(`Added ${DEFAULT_PERMISSION_TYPES.length} permission types.`);
    } else {
      console.log(`Permission types already exist. Skipping.`);
    }
    
    // Seed default role permissions for each community
    console.log('Seeding default role permissions for communities...');
    
    // Get all communities
    const communities = await db.execute(`SELECT id FROM communities`);
    
    if (communities.rows.length === 0) {
      console.log('No communities found. Skipping role permissions.');
    } else {
      console.log(`Found ${communities.rows.length} communities.`);
      
      for (const community of communities.rows) {
        const communityId = community.id;
        
        // Check if this community already has role permissions
        const existingRolePermissions = await db
          .select()
          .from(communityRolePermissions)
          .where(eq(communityRolePermissions.communityId, communityId));
        
        if (existingRolePermissions.length === 0) {
          console.log(`Setting up role permissions for community ${communityId}...`);
          
          // For each role (admin, moderator, member)
          for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
            // For each permission
            for (const [permissionType, allowed] of Object.entries(permissions)) {
              await db.insert(communityRolePermissions).values({
                communityId,
                role,
                permissionType,
                allowed
              });
            }
          }
          
          console.log(`Role permissions added for community ${communityId}.`);
        } else {
          console.log(`Role permissions already exist for community ${communityId}. Skipping.`);
        }
        
        // Add example custom roles for the community
        const existingCustomRoles = await db
          .select()
          .from(communityCustomRoles)
          .where(eq(communityCustomRoles.communityId, communityId));
        
        if (existingCustomRoles.length === 0) {
          console.log(`Adding example custom roles for community ${communityId}...`);
          
          for (const roleData of EXAMPLE_CUSTOM_ROLES) {
            await db.insert(communityCustomRoles).values({
              ...roleData,
              communityId
            });
          }
          
          console.log(`Added ${EXAMPLE_CUSTOM_ROLES.length} example custom roles for community ${communityId}.`);
        } else {
          console.log(`Custom roles already exist for community ${communityId}. Skipping.`);
        }
      }
    }
    
    console.log('Enhanced Member Management migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();