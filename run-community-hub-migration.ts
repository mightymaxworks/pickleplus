/**
 * PKL-278651-COMM-0006-HUB - Community Hub Implementation
 * Migration Script
 * 
 * This script runs the migration to create the community tables.
 * Run with: npx tsx run-community-hub-migration.ts
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

// Import community schema
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

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

/**
 * Main function to create community tables
 */
async function migrateCommunityHub() {
  console.log('Starting Community Hub migration...');
  
  // Connect to database
  const queryClient = postgres(DATABASE_URL);
  const db = drizzle(queryClient);
  
  try {
    // Check if tables already exist
    const communitiesExists = await checkTableExists('communities');
    if (communitiesExists) {
      console.log('Communities tables already exist. Skipping migration.');
      process.exit(0);
    }
    
    // Create communities table
    console.log('Creating communities table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS communities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        location VARCHAR(255),
        founded_date DATE,
        member_count INTEGER DEFAULT 0,
        is_private BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false,
        avatar_url TEXT,
        banner_url TEXT,
        banner_pattern VARCHAR(50),
        skill_level VARCHAR(50),
        tags TEXT,
        event_count INTEGER DEFAULT 0,
        rating INTEGER DEFAULT 0,
        social_links JSONB DEFAULT '{}',
        featured_tag VARCHAR(50),
        created_by_user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create community members table
    console.log('Creating community_members table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_members (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true,
        last_active TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create community posts table
    console.log('Creating community_posts table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        media_urls JSONB DEFAULT '[]',
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT false,
        is_announcement BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create community events table
    console.log('Creating community_events table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_events (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        created_by_user_id INTEGER NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        location VARCHAR(255),
        max_attendees INTEGER,
        current_attendees INTEGER DEFAULT 0,
        event_type VARCHAR(50) NOT NULL DEFAULT 'casual',
        is_public BOOLEAN DEFAULT true,
        repeat_frequency VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create community event attendees table
    console.log('Creating community_event_attendees table...');
    await db.execute(sql`
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
    `);
    
    // Create community post comments table
    console.log('Creating community_post_comments table...');
    await db.execute(sql`
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
    `);
    
    // Create community post likes table
    console.log('Creating community_post_likes table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES community_posts(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create community comment likes table
    console.log('Creating community_comment_likes table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES community_post_comments(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create community invitations table
    console.log('Creating community_invitations table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_invitations (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        invited_by_user_id INTEGER NOT NULL REFERENCES users(id),
        invited_user_id INTEGER NOT NULL REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        invited_at TIMESTAMP DEFAULT NOW(),
        responded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create community join requests table
    console.log('Creating community_join_requests table...');
    await db.execute(sql`
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
    `);
    
    console.log('Community Hub migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

/**
 * Check if a table exists in the database
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const queryClient = postgres(DATABASE_URL);
  try {
    const result = await queryClient`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      )
    `;
    return result[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  } finally {
    await queryClient.end();
  }
}

// Run the migration
migrateCommunityHub().catch((error) => {
  console.error('Failed to run migration:', error);
  process.exit(1);
});