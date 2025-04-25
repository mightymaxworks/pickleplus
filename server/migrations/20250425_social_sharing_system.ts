/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Sharing System Migration
 * 
 * This migration adds tables for social sharing features implemented in Sprint 5.
 * It enables community collaboration, content sharing, and user connections.
 * 
 * Run with: npx tsx server/migrations/20250425_social_sharing_system.ts
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { pool } from '../db';

async function runMigration() {
  console.log('[Migration] Starting social sharing system migration...');

  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Create shared_content table
    console.log('[Migration] Creating shared_content table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shared_content (
        id SERIAL PRIMARY KEY,
        content_type TEXT NOT NULL,
        content_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        visibility TEXT NOT NULL DEFAULT 'public',
        custom_tags TEXT[],
        highlighted_text TEXT,
        custom_image TEXT,
        view_count INTEGER NOT NULL DEFAULT 0,
        like_count INTEGER NOT NULL DEFAULT 0,
        comment_count INTEGER NOT NULL DEFAULT 0,
        share_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        is_moderation_flagged BOOLEAN NOT NULL DEFAULT FALSE,
        is_removed BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);
    
    // Create content_reactions table
    console.log('[Migration] Creating content_reactions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_reactions (
        id SERIAL,
        content_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        reaction_type TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_reaction UNIQUE (content_id, user_id, reaction_type)
      )
    `);
    
    // Fix the primary key constraint
    await pool.query(`
      ALTER TABLE content_reactions ADD CONSTRAINT content_reactions_pkey PRIMARY KEY (id);
    `);
    
    // Create content_comments table
    console.log('[Migration] Creating content_comments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content_comments (
        id SERIAL PRIMARY KEY,
        content_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        parent_comment_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        like_count INTEGER NOT NULL DEFAULT 0,
        is_edited BOOLEAN NOT NULL DEFAULT FALSE,
        is_removed BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);
    
    // Create coaching_recommendations table
    console.log('[Migration] Creating coaching_recommendations table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coaching_recommendations (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        content_type TEXT NOT NULL,
        content_id INTEGER NOT NULL,
        message TEXT,
        relevance_reason TEXT,
        skills_targeted TEXT[],
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP,
        completed_at TIMESTAMP,
        feedback_rating INTEGER,
        feedback_comment TEXT
      )
    `);
    
    // Create social_feed_items table
    console.log('[Migration] Creating social_feed_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_feed_items (
        id SERIAL PRIMARY KEY,
        content_type TEXT NOT NULL,
        content_id INTEGER NOT NULL,
        activity_type TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        target_user_id INTEGER,
        title TEXT NOT NULL,
        summary TEXT,
        image_url TEXT,
        enrichment_data JSONB,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        visibility TEXT NOT NULL DEFAULT 'public',
        is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
        is_highlighted BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);
    
    // Create user_connection_requests table
    console.log('[Migration] Creating user_connection_requests table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_connection_requests (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        connection_type TEXT NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP
      )
    `);
    
    // Create user_connections table
    console.log('[Migration] Creating user_connections table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_connections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        connected_user_id INTEGER NOT NULL,
        connection_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        sharing_permissions JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_interaction_at TIMESTAMP
      )
    `);
    
    // Add indexes for performance
    console.log('[Migration] Adding performance indexes...');
    
    // Shared content indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_shared_content_user_id ON shared_content(user_id);
      CREATE INDEX IF NOT EXISTS idx_shared_content_content ON shared_content(content_type, content_id);
      CREATE INDEX IF NOT EXISTS idx_shared_content_visibility ON shared_content(visibility) WHERE is_removed = FALSE;
    `);
    
    // Reactions and comments indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_content_reactions_content_id ON content_reactions(content_id);
      CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON content_comments(content_id);
      CREATE INDEX IF NOT EXISTS idx_content_comments_parent ON content_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
    `);
    
    // Recommendations indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_recommendations_to_user ON coaching_recommendations(to_user_id, status);
      CREATE INDEX IF NOT EXISTS idx_recommendations_from_user ON coaching_recommendations(from_user_id);
    `);
    
    // Feed indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_feed_user_id ON social_feed_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_feed_timestamp ON social_feed_items(timestamp);
      CREATE INDEX IF NOT EXISTS idx_feed_visibility ON social_feed_items(visibility) WHERE visibility = 'public';
    `);
    
    // Connection indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_connection_requests_to_user ON user_connection_requests(to_user_id, status);
      CREATE INDEX IF NOT EXISTS idx_connections_user_id ON user_connections(user_id, status);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_connection ON user_connections(user_id, connected_user_id) WHERE status = 'active';
    `);

    // Commit transaction
    await pool.query('COMMIT');
    
    console.log('[Migration] Social sharing system migration completed successfully!');

  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('[Migration] Error during social sharing system migration:', error);
    throw error;
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('[Migration] Social sharing system setup complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Migration] Failed to run social sharing system migration:', err);
    process.exit(1);
  });