/**
 * PKL-278651-COMM-0036-MEDIA-QUOTA
 * Community Media Storage Quota Service
 * 
 * Service for tracking and managing community media storage quotas
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Pool } from '@neondatabase/serverless';

// Default quota tiers in bytes
const STORAGE_QUOTAS = {
  free: 50 * 1024 * 1024, // 50MB
  basic: 250 * 1024 * 1024, // 250MB
  premium: 1024 * 1024 * 1024, // 1GB
  enterprise: 10 * 1024 * 1024 * 1024, // 10GB
  default: 100 * 1024 * 1024 // 100MB default
};

// Initialize database connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface StorageQuota {
  bytesUsed: number;
  fileCount: number;
  quotaBytes: number;
  tier: string;
  percentUsed: number;
  lastCalculated: Date;
}

interface QuotaCheck {
  canUpload: boolean;
  currentUsage: number;
  quota: number;
  percentUsed: number;
  percentAfterUpload: number;
}

/**
 * Get current storage usage for a community
 */
export async function getCommunityStorageUsage(communityId: number): Promise<StorageQuota> {
  const client = await pool.connect();
  
  try {
    // Get quota info from communities table
    const communityResult = await client.query(`
      SELECT 
        storage_quota_bytes, 
        storage_tier 
      FROM communities 
      WHERE id = $1
    `, [communityId]);
    
    if (communityResult.rows.length === 0) {
      throw new Error(`Community with ID ${communityId} not found`);
    }
    
    const community = communityResult.rows[0];
    
    // Get usage info from storage_usage table
    const usageResult = await client.query(`
      SELECT 
        bytes_used,
        file_count,
        last_calculated
      FROM community_storage_usage
      WHERE community_id = $1
    `, [communityId]);
    
    // If no storage usage record exists yet, create one with zeros
    if (usageResult.rows.length === 0) {
      await client.query(`
        INSERT INTO community_storage_usage (community_id, bytes_used, file_count)
        VALUES ($1, 0, 0)
      `, [communityId]);
      
      return {
        bytesUsed: 0,
        fileCount: 0,
        quotaBytes: parseInt(community.storage_quota_bytes, 10) || STORAGE_QUOTAS.default,
        tier: community.storage_tier || 'basic',
        percentUsed: 0,
        lastCalculated: new Date()
      };
    }
    
    // Calculate percentage used
    const storageUsage = usageResult.rows[0];
    const bytesUsed = parseInt(storageUsage.bytes_used, 10) || 0;
    const quotaBytes = parseInt(community.storage_quota_bytes, 10) || STORAGE_QUOTAS.default;
    const percentUsed = Math.min(100, Math.round((bytesUsed / quotaBytes) * 100));
    
    return {
      bytesUsed,
      fileCount: parseInt(storageUsage.file_count, 10) || 0,
      quotaBytes,
      tier: community.storage_tier || 'basic',
      percentUsed,
      lastCalculated: new Date(storageUsage.last_calculated)
    };
  } catch (error) {
    console.error(`Error getting storage usage for community ${communityId}:`, error);
    
    // Return default values on error
    return {
      bytesUsed: 0,
      fileCount: 0,
      quotaBytes: STORAGE_QUOTAS.default,
      tier: 'basic',
      percentUsed: 0,
      lastCalculated: new Date()
    };
  } finally {
    client.release();
  }
}

/**
 * Update community storage quota tier and/or custom quota
 */
export async function updateCommunityStorageQuota(
  communityId: number,
  tier: string,
  customQuotaBytes?: number
): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Get quota for the tier
    const lowerTier = tier.toLowerCase();
    // Use safe indexing approach for Framework 5.2 compliance
    let quotaBytes = customQuotaBytes;
    if (!quotaBytes) {
      if (lowerTier === 'free') quotaBytes = STORAGE_QUOTAS.free;
      else if (lowerTier === 'basic') quotaBytes = STORAGE_QUOTAS.basic;
      else if (lowerTier === 'premium') quotaBytes = STORAGE_QUOTAS.premium;
      else if (lowerTier === 'enterprise') quotaBytes = STORAGE_QUOTAS.enterprise;
      else quotaBytes = STORAGE_QUOTAS.default;
    }
    
    // Update communities table using direct SQL
    await client.query(`
      UPDATE communities
      SET 
        storage_quota_bytes = $1,
        storage_tier = $2,
        storage_last_updated = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [quotaBytes, tier, communityId]);
    
  } catch (error) {
    console.error(`Error updating storage quota for community ${communityId}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if a file upload would exceed the community's storage quota
 */
export async function checkQuotaForUpload(
  communityId: number,
  fileSizeBytes: number
): Promise<QuotaCheck> {
  try {
    // Get current usage and quota
    const { bytesUsed, quotaBytes } = await getCommunityStorageUsage(communityId);
    
    // Calculate what usage would be after upload
    const newUsage = bytesUsed + fileSizeBytes;
    const percentUsed = Math.min(100, Math.round((bytesUsed / quotaBytes) * 100));
    const percentAfterUpload = Math.min(100, Math.round((newUsage / quotaBytes) * 100));
    
    return {
      canUpload: newUsage <= quotaBytes,
      currentUsage: bytesUsed,
      quota: quotaBytes,
      percentUsed,
      percentAfterUpload
    };
  } catch (error) {
    console.error(`Error checking quota for upload to community ${communityId}:`, error);
    
    // Default to not allowing upload on error
    return {
      canUpload: false,
      currentUsage: 0,
      quota: 0,
      percentUsed: 0,
      percentAfterUpload: 0
    };
  }
}

/**
 * Update storage usage when files are added or deleted
 */
export async function updateStorageUsage(
  communityId: number,
  bytesChange: number,
  fileCountChange: number
): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Update or insert storage usage record
    await client.query(`
      INSERT INTO community_storage_usage (community_id, bytes_used, file_count, last_calculated)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (community_id) DO UPDATE
      SET 
        bytes_used = GREATEST(0, community_storage_usage.bytes_used + $2),
        file_count = GREATEST(0, community_storage_usage.file_count + $3),
        last_calculated = CURRENT_TIMESTAMP
    `, [communityId, bytesChange, fileCountChange]);
    
  } catch (error) {
    console.error(`Error updating storage usage for community ${communityId}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Recalculate storage usage for a community from scratch
 * This is useful for periodic maintenance or after data migrations
 */
export async function recalculateStorageUsage(communityId: number): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Calculate current usage by summing all media file sizes
    const result = await client.query(`
      SELECT 
        COALESCE(SUM(file_size_bytes), 0) AS total_bytes,
        COUNT(*) AS total_files
      FROM community_media
      WHERE community_id = $1
    `, [communityId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Failed to calculate storage usage for community ${communityId}`);
    }
    
    const totalBytes = parseInt(result.rows[0].total_bytes, 10) || 0;
    const totalFiles = parseInt(result.rows[0].total_files, 10) || 0;
    
    // Update the storage usage record
    await client.query(`
      INSERT INTO community_storage_usage (community_id, bytes_used, file_count, last_calculated)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (community_id) DO UPDATE
      SET 
        bytes_used = $2,
        file_count = $3,
        last_calculated = CURRENT_TIMESTAMP
    `, [communityId, totalBytes, totalFiles]);
    
  } catch (error) {
    console.error(`Error recalculating storage usage for community ${communityId}:`, error);
    throw error;
  } finally {
    client.release();
  }
}