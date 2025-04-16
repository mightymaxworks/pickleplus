/**
 * PKL-278651-COMM-0006-HUB - Community Hub Implementation
 * Migration Script
 * 
 * This script runs the migration to create the community tables.
 * Run with: npx tsx run-community-hub-migration.ts
 */
import { postgres } from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import {
  communities,
  communityMembers,
  communityPosts,
  communityEvents,
  communityEventAttendees,
  communityPostComments,
  communityPostLikes,
  communityCommentLikes,
  communityInvitations,
  communityJoinRequests
} from './shared/schema/community';

dotenv.config();

/**
 * Main function to create community tables
 */
async function migrateCommunityHub() {
  console.log('Starting Community Hub migration...');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const client = postgres(dbUrl);
  const db = drizzle(client);

  try {
    // Check if tables already exist
    if (await checkTableExists('communities')) {
      console.log('Communities tables already exist, skipping migration.');
      process.exit(0);
    }

    // Create all tables
    console.log('Creating communities table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS communities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(100),
        skill_level VARCHAR(50),
        avatar_url TEXT,
        banner_url TEXT,
        banner_pattern VARCHAR(50),
        is_private BOOLEAN DEFAULT FALSE,
        requires_approval BOOLEAN DEFAULT FALSE,
        tags VARCHAR(255),
        member_count INTEGER DEFAULT 0,
        event_count INTEGER DEFAULT 0,
        post_count INTEGER DEFAULT 0,
        created_by_user_id INTEGER NOT NULL REFERENCES users(id),
        rules TEXT,
        guidelines TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating community_members table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS community_members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER NOT NULL REFERENCES communities(id),
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE,
        last_active TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating community_posts table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER NOT NULL REFERENCES communities(id),
        content TEXT NOT NULL,
        media_urls JSONB,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_announcement BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating community_events table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS community_events (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        created_by_user_id INTEGER NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        location TEXT,
        is_virtual BOOLEAN DEFAULT FALSE,
        virtual_meeting_url TEXT,
        max_attendees INTEGER,
        current_attendees INTEGER DEFAULT 0,
        is_private BOOLEAN DEFAULT FALSE,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurring_pattern VARCHAR(50),
        repeat_frequency VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating community_event_attendees table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS community_event_attendees (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES community_events(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'registered',
        registered_at TIMESTAMP DEFAULT NOW(),
        checked_in_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating community_post_comments table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS community_post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES community_posts(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        parent_comment_id INTEGER REFERENCES community_post_comments(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating community_post_likes table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS community_post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES community_posts(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating community_comment_likes table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS community_comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES community_post_comments(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating community_invitations table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS community_invitations (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        invited_by_user_id INTEGER NOT NULL REFERENCES users(id),
        invited_user_email VARCHAR(255),
        invited_user_id INTEGER REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        token VARCHAR(100) NOT NULL,
        expires_at TIMESTAMP,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating community_join_requests table...');
    await db.execute`
      CREATE TABLE IF NOT EXISTS community_join_requests (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        message TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        reviewed_by_user_id INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Creating indexes...');
    
    // Add indexes for performance
    await db.execute`CREATE INDEX idx_comm_members_user_id ON community_members(user_id)`;
    await db.execute`CREATE INDEX idx_comm_members_community_id ON community_members(community_id)`;
    await db.execute`CREATE INDEX idx_comm_posts_user_id ON community_posts(user_id)`;
    await db.execute`CREATE INDEX idx_comm_posts_community_id ON community_posts(community_id)`;
    await db.execute`CREATE INDEX idx_comm_events_community_id ON community_events(community_id)`;
    await db.execute`CREATE INDEX idx_comm_events_created_by ON community_events(created_by_user_id)`;
    await db.execute`CREATE INDEX idx_comm_events_date ON community_events(event_date)`;
    await db.execute`CREATE INDEX idx_comm_attendees_event_id ON community_event_attendees(event_id)`;
    await db.execute`CREATE INDEX idx_comm_attendees_user_id ON community_event_attendees(user_id)`;
    await db.execute`CREATE INDEX idx_comm_comments_post_id ON community_post_comments(post_id)`;
    await db.execute`CREATE INDEX idx_comm_comments_user_id ON community_post_comments(user_id)`;
    await db.execute`CREATE INDEX idx_comm_post_likes_post_id ON community_post_likes(post_id)`;
    await db.execute`CREATE INDEX idx_comm_post_likes_user_id ON community_post_likes(user_id)`;
    await db.execute`CREATE INDEX idx_comm_comment_likes_comment_id ON community_comment_likes(comment_id)`;
    await db.execute`CREATE INDEX idx_comm_comment_likes_user_id ON community_comment_likes(user_id)`;
    await db.execute`CREATE INDEX idx_comm_invitations_community_id ON community_invitations(community_id)`;
    await db.execute`CREATE INDEX idx_comm_join_requests_community_id ON community_join_requests(community_id)`;

    // Create unique constraint on community membership
    await db.execute`CREATE UNIQUE INDEX idx_community_membership_unique ON community_members(community_id, user_id)`;
    await db.execute`CREATE UNIQUE INDEX idx_community_post_like_unique ON community_post_likes(post_id, user_id)`;
    await db.execute`CREATE UNIQUE INDEX idx_community_comment_like_unique ON community_comment_likes(comment_id, user_id)`;
    await db.execute`CREATE UNIQUE INDEX idx_community_event_attendance_unique ON community_event_attendees(event_id, user_id)`;

    console.log('Community Hub Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

/**
 * Check if a table exists in the database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  console.log(`Checking if table '${tableName}' exists...`);
  
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('DATABASE_URL environment variable is not set.');
      process.exit(1);
    }

    const client = postgres(dbUrl);
    const db = drizzle(client);
    
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      )
    `);
    
    await client.end();
    
    return result[0]?.exists === true;
  } catch (error) {
    console.error(`Error checking if table '${tableName}' exists:`, error);
    return false;
  }
}

// Run the migration
migrateCommunityHub().catch(error => {
  console.error('Unhandled error during migration:', error);
  process.exit(1);
});