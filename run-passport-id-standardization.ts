/**
 * PKL-278651-SEC-0002-TESTVIS - Passport ID Standardization
 * Migration script to standardize passport IDs to a consistent format
 * 
 * This script updates all passport IDs to follow the standard 7-character alphanumeric format
 * and ensures consistency across the database.
 * 
 * Run with: npx tsx run-passport-id-standardization.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './shared/schema';
import { eq, isNotNull, sql } from 'drizzle-orm';
import { normalizePassportId, generatePassportId } from './shared/utils/passport-utils';

// Standard passport ID format: 7 alphanumeric characters
const STANDARD_FORMAT_REGEX = /^[A-Z0-9]{7}$/i;

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
      
      // Extract a simplified 7-character ID from the existing one if possible
      let standardizedPassportId = normalizePassportId(originalPassportId);
      
      // If we can't extract enough characters, generate a new random ID
      if (standardizedPassportId.length < 7) {
        standardizedPassportId = generatePassportId();
      }
      
      console.log(`[MIGRATION] Updating passport ID for user ${user.username}:`);
      console.log(`  From: ${originalPassportId}`);
      console.log(`  To:   ${standardizedPassportId}`);
      
      // Update the passport ID in the database
      await db.update(users)
        .set({ passportId: standardizedPassportId })
        .where(eq(users.id, user.id));
    }
    
    // Get any users that don't have passport IDs yet
    const usersWithoutPassportIds = await db
      .select({
        id: users.id,
        username: users.username
      })
      .from(users)
      .where(sql`${users.passportId} IS NULL`); // Only those without passport IDs
    
    // Generate new passport IDs for users without them
    if (usersWithoutPassportIds.length > 0) {
      console.log(`[MIGRATION] Found ${usersWithoutPassportIds.length} users without passport IDs`);
      
      for (const user of usersWithoutPassportIds) {
        const newPassportId = generatePassportId();
        
        console.log(`[MIGRATION] Generating new passport ID for user ${user.username}:`);
        console.log(`  ID: ${newPassportId}`);
        
        // Update the passport ID in the database
        await db.update(users)
          .set({ passportId: newPassportId })
          .where(eq(users.id, user.id));
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