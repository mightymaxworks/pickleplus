/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Engagement Metrics Migration Script
 * 
 * This script creates the necessary database tables for community engagement metrics:
 * - community_engagement_metrics: Tracks user engagement metrics for each community
 * - community_activities: Records user activities within communities
 * - community_engagement_levels: Defines engagement levels and their thresholds
 * - community_leaderboards: Stores leaderboard data for communities
 * 
 * Usage: npm run db:deploy:community-engagement
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-18
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import { sql as drizzleSql } from 'drizzle-orm';

// PostgreSQL connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function runMigration() {
  console.log('[PKL-278651-COMM-0021-ENGAGE] Starting community engagement metrics migration...');

  try {
    // Create community_engagement_metrics table
    console.log('Creating community_engagement_metrics table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_engagement_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER NOT NULL REFERENCES communities(id),
        total_points INTEGER NOT NULL DEFAULT 0,
        total_activities INTEGER NOT NULL DEFAULT 0,
        last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        streak_days INTEGER NOT NULL DEFAULT 0,
        engagement_level VARCHAR(20) DEFAULT 'NEWCOMER',
        post_count INTEGER NOT NULL DEFAULT 0,
        comment_count INTEGER NOT NULL DEFAULT 0,
        event_attendance INTEGER NOT NULL DEFAULT 0,
        contribution_data JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, community_id)
      );
    `);

    // Add indexes for community_engagement_metrics
    console.log('Adding indexes for community_engagement_metrics table...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS community_engagement_metrics_user_community_idx ON community_engagement_metrics(user_id, community_id);
      CREATE INDEX IF NOT EXISTS community_engagement_metrics_total_points_idx ON community_engagement_metrics(total_points);
      CREATE INDEX IF NOT EXISTS community_engagement_metrics_engagement_level_idx ON community_engagement_metrics(engagement_level);
    `);

    // Create community_activities table
    console.log('Creating community_activities table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER NOT NULL REFERENCES communities(id),
        activity_type VARCHAR(50) NOT NULL,
        activity_data JSONB,
        points INTEGER NOT NULL DEFAULT 1,
        is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    // Add indexes for community_activities
    console.log('Adding indexes for community_activities table...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS community_activities_user_idx ON community_activities(user_id);
      CREATE INDEX IF NOT EXISTS community_activities_community_idx ON community_activities(community_id);
      CREATE INDEX IF NOT EXISTS community_activities_type_idx ON community_activities(activity_type);
      CREATE INDEX IF NOT EXISTS community_activities_created_idx ON community_activities(created_at);
    `);

    // Create community_engagement_levels table
    console.log('Creating community_engagement_levels table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_engagement_levels (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        level_name VARCHAR(50) NOT NULL,
        point_threshold INTEGER NOT NULL,
        description TEXT,
        benefits JSONB,
        badge_image_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE(community_id, level_name)
      );
    `);

    // Add indexes for community_engagement_levels
    console.log('Adding indexes for community_engagement_levels table...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS community_engagement_levels_community_idx ON community_engagement_levels(community_id);
    `);

    // Create community_leaderboards table
    console.log('Creating community_leaderboards table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_leaderboards (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        leaderboard_type VARCHAR(50) NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        rank INTEGER,
        time_period VARCHAR(20) NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        UNIQUE(community_id, user_id, leaderboard_type, time_period)
      );
    `);

    // Add indexes for community_leaderboards
    console.log('Adding indexes for community_leaderboards table...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS community_leaderboards_community_idx ON community_leaderboards(community_id);
      CREATE INDEX IF NOT EXISTS community_leaderboards_user_idx ON community_leaderboards(user_id);
      CREATE INDEX IF NOT EXISTS community_leaderboards_type_idx ON community_leaderboards(leaderboard_type);
      CREATE INDEX IF NOT EXISTS community_leaderboards_period_idx ON community_leaderboards(time_period);
    `);

    // Insert default engagement levels for each community
    console.log('Inserting default engagement levels for communities...');
    const allCommunities = await db.select({ id: communities.id }).from(communities);
    
    for (const community of allCommunities) {
      // Check if levels already exist for this community
      const existingLevels = await db.execute(sql`
        SELECT COUNT(*) FROM community_engagement_levels WHERE community_id = ${community.id}
      `);
      
      if (existingLevels.rows[0].count === '0') {
        // Insert default levels
        const defaultLevels = [
          { name: 'NEWCOMER', threshold: 0, description: 'Just joined the community' },
          { name: 'CONTRIBUTOR', threshold: 50, description: 'Regular community contributor' },
          { name: 'ENGAGED', threshold: 200, description: 'Actively engaged community member' },
          { name: 'ADVOCATE', threshold: 500, description: 'Community advocate and leader' },
          { name: 'CHAMPION', threshold: 1000, description: 'Community champion and mentor' }
        ];
        
        for (const level of defaultLevels) {
          await db.execute(sql`
            INSERT INTO community_engagement_levels (
              community_id, level_name, point_threshold, description, benefits
            ) VALUES (
              ${community.id}, 
              ${level.name}, 
              ${level.threshold}, 
              ${level.description},
              ${'[]'}::jsonb
            )
          `);
        }
        
        console.log(`Added default engagement levels for community ID ${community.id}`);
      }
    }

    console.log('[PKL-278651-COMM-0021-ENGAGE] Community engagement metrics migration completed successfully');
  } catch (error) {
    console.error('[PKL-278651-COMM-0021-ENGAGE] Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});