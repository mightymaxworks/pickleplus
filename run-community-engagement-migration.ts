/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Engagement Metrics Migration
 * 
 * This script creates the database tables for tracking community engagement metrics,
 * including member activity, participation, and contribution levels.
 * 
 * Run with: npx tsx run-community-engagement-migration.ts
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import * as schema from './shared/schema/community-engagement';
import ws from 'ws';

// Configure Neon to use ws as WebSocket constructor
neonConfig.webSocketConstructor = ws;
import { CommunityActivityType } from './shared/schema/community-engagement';

// Set up database connection
const run = async () => {
  console.log('Starting community engagement metrics database migration...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  
  try {
    // Check if tables already exist
    const tablesExist = await checkTablesExist(db);
    
    if (tablesExist) {
      console.log("Community engagement metrics tables already exist. Skipping migration.");
      process.exit(0);
    }
    
    // Create community activities table
    console.log("Creating community_activities table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER NOT NULL REFERENCES communities(id),
        activity_type VARCHAR(50) NOT NULL,
        activity_data JSONB,
        points INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_hidden BOOLEAN DEFAULT FALSE,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT fk_community FOREIGN KEY (community_id) REFERENCES communities(id)
      );
      
      CREATE INDEX IF NOT EXISTS community_activities_user_id_idx ON community_activities(user_id);
      CREATE INDEX IF NOT EXISTS community_activities_community_id_idx ON community_activities(community_id);
      CREATE INDEX IF NOT EXISTS community_activities_activity_type_idx ON community_activities(activity_type);
      CREATE INDEX IF NOT EXISTS community_activities_created_at_idx ON community_activities(created_at);
    `);
    
    // Create community engagement metrics table
    console.log("Creating community_engagement_metrics table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_engagement_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER NOT NULL REFERENCES communities(id),
        total_points INTEGER NOT NULL DEFAULT 0,
        total_activities INTEGER NOT NULL DEFAULT 0,
        last_activity_at TIMESTAMP DEFAULT NOW(),
        streak_days INTEGER NOT NULL DEFAULT 0,
        engagement_level VARCHAR(20) DEFAULT 'NEWCOMER',
        post_count INTEGER NOT NULL DEFAULT 0,
        comment_count INTEGER NOT NULL DEFAULT 0,
        event_attendance INTEGER NOT NULL DEFAULT 0,
        contribution_data JSONB,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
        CONSTRAINT fk_community FOREIGN KEY (community_id) REFERENCES communities(id),
        CONSTRAINT unique_user_community UNIQUE (user_id, community_id)
      );
      
      CREATE INDEX IF NOT EXISTS community_engagement_metrics_user_community_idx 
        ON community_engagement_metrics(user_id, community_id);
      CREATE INDEX IF NOT EXISTS community_engagement_metrics_total_points_idx 
        ON community_engagement_metrics(total_points);
      CREATE INDEX IF NOT EXISTS community_engagement_metrics_engagement_level_idx 
        ON community_engagement_metrics(engagement_level);
    `);
    
    // Create community engagement levels table
    console.log("Creating community_engagement_levels table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_engagement_levels (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        level_name VARCHAR(50) NOT NULL,
        point_threshold INTEGER NOT NULL,
        description VARCHAR(255),
        benefits JSONB,
        badge_image_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_community FOREIGN KEY (community_id) REFERENCES communities(id)
      );
      
      CREATE INDEX IF NOT EXISTS community_engagement_levels_community_id_idx 
        ON community_engagement_levels(community_id);
      CREATE INDEX IF NOT EXISTS community_engagement_levels_point_threshold_idx 
        ON community_engagement_levels(point_threshold);
    `);
    
    // Create community leaderboards table
    console.log("Creating community_leaderboards table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS community_leaderboards (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        period VARCHAR(20) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        leaderboard_data JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_community FOREIGN KEY (community_id) REFERENCES communities(id)
      );
      
      CREATE INDEX IF NOT EXISTS community_leaderboards_community_period_idx 
        ON community_leaderboards(community_id, period);
      CREATE INDEX IF NOT EXISTS community_leaderboards_date_range_idx 
        ON community_leaderboards(start_date, end_date);
    `);
    
    // Create default engagement levels for communities
    console.log("Setting up default engagement levels...");
    await setupDefaultEngagementLevels(db);
    
    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

/**
 * Check if community engagement tables already exist
 */
async function checkTablesExist(db: any): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'community_activities'
      ) as "exists";
    `);
    
    return result[0]?.exists || false;
  } catch (error) {
    console.error("Error checking if tables exist:", error);
    return false;
  }
}

/**
 * Set up default engagement levels for all communities
 */
async function setupDefaultEngagementLevels(db: any) {
  // Get all communities
  const communities = await db.execute(sql`SELECT id FROM communities`);
  
  for (const community of communities) {
    // Define standard engagement levels
    const defaultLevels = [
      {
        communityId: community.id,
        levelName: "Newcomer",
        pointThreshold: 0,
        description: "Just joined the community",
        benefits: JSON.stringify(["Basic access"]),
        isActive: true
      },
      {
        communityId: community.id,
        levelName: "Contributor",
        pointThreshold: 50,
        description: "Regular contributor to the community",
        benefits: JSON.stringify(["Advanced features", "Special badge"]),
        isActive: true
      },
      {
        communityId: community.id,
        levelName: "Enthusiast",
        pointThreshold: 200,
        description: "Very active community member",
        benefits: JSON.stringify(["Premium features", "Recognition in community"]),
        isActive: true
      },
      {
        communityId: community.id,
        levelName: "Champion",
        pointThreshold: 500,
        description: "Leading community member",
        benefits: JSON.stringify(["All features", "Community leader badge", "Special privileges"]),
        isActive: true
      },
      {
        communityId: community.id,
        levelName: "Maven",
        pointThreshold: 1000,
        description: "Expert and highly respected member",
        benefits: JSON.stringify(["Exclusive content", "Advanced customization", "Special access"]),
        isActive: true
      }
    ];
    
    // Insert default levels
    for (const level of defaultLevels) {
      await db.execute(sql`
        INSERT INTO community_engagement_levels 
        (community_id, level_name, point_threshold, description, benefits, is_active, created_at, updated_at)
        VALUES 
        (${level.communityId}, ${level.levelName}, ${level.pointThreshold}, ${level.description}, 
         ${level.benefits}::jsonb, ${level.isActive}, NOW(), NOW())
      `);
    }
  }
  
  console.log(`Set up default engagement levels for ${communities.length} communities.`);
}

// Run the migration
run()
  .then(() => {
    console.log("Community engagement tables migration completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });