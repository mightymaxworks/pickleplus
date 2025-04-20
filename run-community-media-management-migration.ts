/**
 * PKL-278651-COMM-0036-MEDIA
 * Community Media Management Migration
 * 
 * This script creates the database schema for community media management:
 * - community_media: Stores individual media items
 * - community_galleries: Manages collections of media
 * - gallery_items: Maps media items to galleries with ordering
 * 
 * Run with: npx tsx run-community-media-management-migration.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure WebSocket for Neon database
neonConfig.webSocketConstructor = ws;

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

/**
 * Helper function to check if a table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    )
  `, [tableName]);
  
  return result.rows[0].exists;
}

/**
 * Helper function to check if a column exists in a table
 */
async function checkColumnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      AND column_name = $2
    )
  `, [tableName, columnName]);
  
  return result.rows[0].exists;
}

/**
 * Main migration function
 */
async function migrateCommunityMediaManagement() {
  console.log('[PKL-278651-COMM-0036-MEDIA] Starting community media management migration...');
  
  // Create community_media table if it doesn't exist
  if (!(await checkTableExists('community_media'))) {
    console.log('Creating community_media table...');
    await pool.query(`
      CREATE TABLE community_media (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        title VARCHAR(255),
        description TEXT,
        media_type VARCHAR(50) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        thumbnail_path VARCHAR(500),
        created_by_user_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        file_size_bytes INTEGER,
        width INTEGER,
        height INTEGER,
        is_featured BOOLEAN DEFAULT FALSE,
        tags TEXT[],
        metadata JSONB
      )
    `);
    console.log('community_media table created successfully');
  } else {
    console.log('community_media table already exists, skipping creation');
  }
  
  // Create community_galleries table if it doesn't exist
  if (!(await checkTableExists('community_galleries'))) {
    console.log('Creating community_galleries table...');
    await pool.query(`
      CREATE TABLE community_galleries (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by_user_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        event_id INTEGER REFERENCES community_events(id) ON DELETE SET NULL,
        cover_image_id INTEGER,
        is_featured BOOLEAN DEFAULT FALSE,
        privacy_level VARCHAR(50) DEFAULT 'public',
        sort_order INTEGER DEFAULT 0
      )
    `);
    console.log('community_galleries table created successfully');
  } else {
    console.log('community_galleries table already exists, skipping creation');
  }
  
  // Create gallery_items table if it doesn't exist
  if (!(await checkTableExists('gallery_items'))) {
    console.log('Creating gallery_items table...');
    await pool.query(`
      CREATE TABLE gallery_items (
        id SERIAL PRIMARY KEY,
        gallery_id INTEGER NOT NULL REFERENCES community_galleries(id) ON DELETE CASCADE,
        media_id INTEGER NOT NULL REFERENCES community_media(id) ON DELETE CASCADE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        caption TEXT,
        UNIQUE(gallery_id, media_id)
      )
    `);
    console.log('gallery_items table created successfully');
  } else {
    console.log('gallery_items table already exists, skipping creation');
  }
  
  // Add indexes for performance
  console.log('Creating indexes...');
  
  // Index for community_media
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_community_media_community_id ON community_media(community_id);
    CREATE INDEX IF NOT EXISTS idx_community_media_created_by ON community_media(created_by_user_id);
    CREATE INDEX IF NOT EXISTS idx_community_media_featured ON community_media(is_featured);
  `);
  
  // Index for community_galleries
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_community_galleries_community_id ON community_galleries(community_id);
    CREATE INDEX IF NOT EXISTS idx_community_galleries_event_id ON community_galleries(event_id);
    CREATE INDEX IF NOT EXISTS idx_community_galleries_featured ON community_galleries(is_featured);
  `);
  
  // Index for gallery_items
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_gallery_items_gallery_id ON gallery_items(gallery_id);
    CREATE INDEX IF NOT EXISTS idx_gallery_items_media_id ON gallery_items(media_id);
    CREATE INDEX IF NOT EXISTS idx_gallery_items_display_order ON gallery_items(display_order);
  `);
  
  console.log('Indexes created successfully');
  
  // Set foreign key constraint for cover_image_id after all tables exist
  if (await checkColumnExists('community_galleries', 'cover_image_id')) {
    const constraintExists = await pool.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'community_galleries' 
        AND column_name = 'cover_image_id'
        AND constraint_name = 'community_galleries_cover_image_id_fkey'
      )
    `);
    
    if (!constraintExists.rows[0].exists) {
      console.log('Adding foreign key constraint for cover_image_id...');
      await pool.query(`
        ALTER TABLE community_galleries 
        ADD CONSTRAINT community_galleries_cover_image_id_fkey 
        FOREIGN KEY (cover_image_id) REFERENCES community_media(id) ON DELETE SET NULL
      `);
      console.log('Foreign key constraint added successfully');
    }
  }
  
  console.log('[PKL-278651-COMM-0036-MEDIA] Community media management migration completed successfully');
}

/**
 * Main function to run the migration
 */
async function main() {
  try {
    await migrateCommunityMediaManagement();
    process.exit(0);
  } catch (error) {
    console.error('[PKL-278651-COMM-0036-MEDIA] Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the migration
main();