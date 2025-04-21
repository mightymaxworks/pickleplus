/**
 * PKL-278651-COMM-0036-MEDIA-QUOTA
 * Community Media Storage Quota Migration
 * 
 * This script adds storage quota fields to the communities table
 * and creates a storage_usage tracking table for media management.
 * 
 * Run with: npx tsx server/modules/community/run-community-media-quota-migration.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { communities } from '../../../shared/schema/community';
import { eq } from 'drizzle-orm';

/**
 * Main migration function
 */
async function migrateCommunityMediaQuota() {
  // Connect to the database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  try {
    console.log('Starting Community Media Storage Quota migration...');
    
    // 1. Check if storage quota fields already exist in communities table
    const hasQuotaFields = await checkColumnsExist(
      db, 
      'communities', 
      ['storage_quota_bytes', 'storage_tier']
    );
    
    if (!hasQuotaFields) {
      console.log('Adding storage quota fields to communities table...');
      
      // Add storage quota fields to communities table
      await db.execute(`
        ALTER TABLE communities 
        ADD COLUMN IF NOT EXISTS storage_quota_bytes BIGINT DEFAULT 104857600,
        ADD COLUMN IF NOT EXISTS storage_tier VARCHAR(20) DEFAULT 'basic',
        ADD COLUMN IF NOT EXISTS storage_last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      
      console.log('Storage quota fields added to communities table');
    } else {
      console.log('Storage quota fields already exist in communities table');
    }
    
    // 2. Create community_storage_usage table if it doesn't exist
    const hasStorageUsageTable = await checkTableExists(db, 'community_storage_usage');
    
    if (!hasStorageUsageTable) {
      console.log('Creating community_storage_usage table...');
      
      await db.execute(`
        CREATE TABLE IF NOT EXISTS community_storage_usage (
          id SERIAL PRIMARY KEY,
          community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
          bytes_used BIGINT NOT NULL DEFAULT 0,
          file_count INTEGER NOT NULL DEFAULT 0,
          last_calculated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(community_id)
        )
      `);
      
      console.log('community_storage_usage table created');
      
      // Initialize storage usage entries for existing communities
      console.log('Initializing storage usage for existing communities...');
      
      const existingCommunities = await db.select({ id: communities.id }).from(communities);
      
      for (const community of existingCommunities) {
        // Calculate current storage usage for this community
        const { totalBytes, totalFiles } = await calculateCommunityStorageUsage(db, community.id);
        
        // Insert usage record
        await db.execute(`
          INSERT INTO community_storage_usage (community_id, bytes_used, file_count)
          VALUES ($1, $2, $3)
          ON CONFLICT (community_id) DO UPDATE
          SET bytes_used = $2, file_count = $3, last_calculated = CURRENT_TIMESTAMP
        `, [community.id, totalBytes, totalFiles]);
      }
      
      console.log('Storage usage initialized for all communities');
    } else {
      console.log('community_storage_usage table already exists');
    }
    
    console.log('Community Media Storage Quota migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Helper function to check if columns exist in a table
 */
async function checkColumnsExist(db: any, tableName: string, columnNames: string[]): Promise<boolean> {
  try {
    for (const columnName of columnNames) {
      const result = await db.execute(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [tableName, columnName]);
      
      if (result.rows.length === 0) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error(`Error checking if columns exist in ${tableName}:`, error);
    return false;
  }
}

/**
 * Helper function to check if a table exists
 */
async function checkTableExists(db: any, tableName: string): Promise<boolean> {
  try {
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = $1
    `, [tableName]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Calculate current storage usage for a community
 */
async function calculateCommunityStorageUsage(db: any, communityId: number): Promise<{ totalBytes: number, totalFiles: number }> {
  try {
    // Query to sum up file sizes for a community from the community_media table
    const result = await db.execute(`
      SELECT 
        COALESCE(SUM(file_size_bytes), 0) AS total_bytes,
        COUNT(*) AS total_files
      FROM community_media
      WHERE community_id = $1
    `, [communityId]);
    
    if (result.rows.length > 0) {
      return {
        totalBytes: parseInt(result.rows[0].total_bytes, 10) || 0,
        totalFiles: parseInt(result.rows[0].total_files, 10) || 0
      };
    }
    
    return { totalBytes: 0, totalFiles: 0 };
  } catch (error) {
    console.error(`Error calculating storage usage for community ${communityId}:`, error);
    return { totalBytes: 0, totalFiles: 0 };
  }
}

/**
 * Main function to run the migration
 */
async function main() {
  try {
    await migrateCommunityMediaQuota();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  main();
}

export { migrateCommunityMediaQuota };