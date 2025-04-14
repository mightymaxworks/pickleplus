/**
 * PKL-278651-SEC-0002-TESTVIS - Passport ID Standardization Preview
 * 
 * This script previews what the standardized passport IDs would look like
 * without actually modifying the database.
 * 
 * Run with: npx tsx preview-passport-standardization.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './shared/schema';
import { isNotNull, eq, sql } from 'drizzle-orm';
import { normalizePassportId, generatePassportId } from './shared/utils/passport-utils';

// Standard passport ID format: 7 alphanumeric characters
const STANDARD_FORMAT_REGEX = /^[A-Z0-9]{7}$/i;

/**
 * Main function to preview passport ID standardization
 */
async function previewPassportStandardization() {
  console.log('[PREVIEW] Starting passport ID standardization preview...');
  
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
    
    console.log(`\n[PREVIEW] Found ${usersWithPassportIds.length} users with passport IDs`);
    
    // Users that need standardization
    const usersToStandardize = usersWithPassportIds.filter(user => 
      !STANDARD_FORMAT_REGEX.test(user.passportId || '')
    );
    
    if (usersToStandardize.length === 0) {
      console.log('\n[PREVIEW] All passport IDs already follow the standard format. No changes needed.');
    } else {
      console.log(`\n[PREVIEW] Found ${usersToStandardize.length} users that need passport ID standardization`);
      console.log('\n----- STANDARDIZATION PREVIEW -----');
      
      // Process each user that needs standardization
      for (const user of usersToStandardize) {
        const originalPassportId = user.passportId || '';
        
        // Extract a simplified 7-character ID from the existing one if possible
        let standardizedPassportId = normalizePassportId(originalPassportId);
        
        // If we can't extract enough characters, generate a new random ID
        if (standardizedPassportId.length < 7) {
          standardizedPassportId = generatePassportId();
          console.log(`\n[PREVIEW] User ${user.username} has insufficient passport ID: ${originalPassportId}`);
          console.log(`  Will generate a new random ID: ${standardizedPassportId}`);
        } else {
          console.log(`\n[PREVIEW] User "${user.username}" (ID: ${user.id}):`);
          console.log(`  Current:  ${originalPassportId}`);
          console.log(`  Standard: ${standardizedPassportId}`);
        }
      }
      
      console.log('\n----- END PREVIEW -----');
    }
    
    // Check for users without passport IDs
    const usersWithoutPassportIds = await db
      .select({
        id: users.id,
        username: users.username
      })
      .from(users)
      .where(sql`${users.passportId} IS NULL`);
    
    if (usersWithoutPassportIds.length > 0) {
      console.log(`\n[PREVIEW] Found ${usersWithoutPassportIds.length} users without passport IDs`);
      console.log('\n----- USERS NEEDING NEW PASSPORT IDS -----');
      
      for (const user of usersWithoutPassportIds) {
        const newPassportId = generatePassportId();
        console.log(`\n[PREVIEW] User "${user.username}" (ID: ${user.id}):`);
        console.log(`  Will generate: ${newPassportId}`);
      }
      
      console.log('\n----- END PREVIEW -----');
    }
    
    console.log('\nTo apply these changes, run the migration script with: npx tsx run-passport-id-standardization.ts');
    
  } catch (error) {
    console.error('\n[PREVIEW] Error previewing passport ID standardization:', error);
  } finally {
    await queryClient.end();
  }
}

// Run the preview
previewPassportStandardization();