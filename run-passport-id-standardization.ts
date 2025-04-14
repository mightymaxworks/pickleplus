/**
 * PKL-278651-SEC-0002-TESTVIS - Passport ID Standardization
 * Migration script to standardize passport IDs to a consistent format
 * 
 * This script updates all passport IDs to follow the standard 7-digit format
 * and ensures consistency across the database.
 * 
 * Run with: npx tsx run-passport-id-standardization.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './shared/schema';
import { eq, isNotNull } from 'drizzle-orm';
import { normalizePassportId, extractPassportCode } from './shared/utils/passport-utils';

// Standard passport ID format: PKL-AAAA-BBB where:
// - AAAA is a 4-digit numeric code
// - BBB is a 3-character alphanumeric code
const STANDARD_FORMAT_REGEX = /^PKL-\d{4}-[A-Z0-9]{3}$/;

/**
 * Main function to standardize passport IDs
 */
async function standardizePassportIds() {
  console.log('[MIGRATION] Starting passport ID standardization...');
  
  // Configure the postgres client and Drizzle ORM
  const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
  const queryClient = postgres(DATABASE_URL);
  const db = drizzle(queryClient);
  
  try {
    // Get all users with passport IDs
    const usersWithPassportIds = await db.select({
      id: users.id,
      username: users.username,
      passportId: users.passportId
    })
    .from(users)
    .where(isNotNull(users.passportId));
    
    console.log(`[MIGRATION] Found ${usersWithPassportIds.length} users with passport IDs`);
    
    // Users that need standardization
    const usersToStandardize = usersWithPassportIds.filter(user => 
      !STANDARD_FORMAT_REGEX.test(user.passportId || '')
    );
    
    console.log(`[MIGRATION] Found ${usersToStandardize.length} users that need passport ID standardization`);
    
    // Process each user that needs standardization
    for (const user of usersToStandardize) {
      const originalPassportId = user.passportId || '';
      
      // Normalize the passport ID components
      const normalizedId = normalizePassportId(originalPassportId);
      
      // Skip if we can't create a proper ID
      if (!normalizedId || normalizedId.length < 5) {
        console.log(`[MIGRATION] Skipping user ${user.username} with invalid passport ID: ${originalPassportId}`);
        continue;
      }
      
      // Extract the standardized 7-digit code
      let idComponents: string[] = [];
      
      if (originalPassportId.includes('-')) {
        // Handle existing formatted IDs - keep the format but standardize
        const parts = originalPassportId.split('-');
        if (parts.length >= 3) {
          // Already has PKL- prefix, standardize the rest
          const normalizedCore = normalizePassportId(originalPassportId);
          const numPart = normalizedCore.slice(0, 4).padEnd(4, '0');
          const alphaPart = normalizedCore.slice(4, 7).padEnd(3, 'X');
          idComponents = ['PKL', numPart, alphaPart];
        } else {
          // Missing proper format, create from normalized ID
          const numPart = normalizedId.slice(0, 4).padEnd(4, '0');
          const alphaPart = normalizedId.slice(4, 7).padEnd(3, 'X');
          idComponents = ['PKL', numPart, alphaPart];
        }
      } else {
        // No formatting at all, create from normalized ID
        const numPart = normalizedId.slice(0, 4).padEnd(4, '0');
        const alphaPart = normalizedId.slice(4, 7).padEnd(3, 'X');
        idComponents = ['PKL', numPart, alphaPart];
      }
      
      // Create standardized passport ID
      const standardizedPassportId = idComponents.join('-');
      
      if (standardizedPassportId !== originalPassportId) {
        console.log(`[MIGRATION] Updating passport ID for user ${user.username}:`);
        console.log(`  From: ${originalPassportId}`);
        console.log(`  To:   ${standardizedPassportId}`);
        
        // Update the passport ID in the database
        await db.update(users)
          .set({ passportId: standardizedPassportId })
          .where(eq(users.id, user.id));
      } else {
        console.log(`[MIGRATION] Passport ID for user ${user.username} already follows standard format`);
      }
    }
    
    console.log('[MIGRATION] Passport ID standardization complete');
  } catch (error) {
    console.error('[MIGRATION] Error standardizing passport IDs:', error);
  } finally {
    await queryClient.end();
  }
}

// Run the standardization
standardizePassportIds();