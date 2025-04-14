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
import { isNotNull } from 'drizzle-orm';
import { normalizePassportId } from './shared/utils/passport-utils';

// Standard passport ID format: PKL-AAAA-BBB where:
// - AAAA is a 4-digit numeric or alphanumeric code
// - BBB is a 3-character alphanumeric code
const STANDARD_FORMAT_REGEX = /^PKL-\d{4}-[A-Z0-9]{3}$/i;

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
      return;
    }
    
    console.log(`\n[PREVIEW] Found ${usersToStandardize.length} users that need passport ID standardization`);
    console.log('\n----- STANDARDIZATION PREVIEW -----');
    
    // Process each user that needs standardization
    for (const user of usersToStandardize) {
      const originalPassportId = user.passportId || '';
      
      // Normalize the passport ID components
      const normalizedId = normalizePassportId(originalPassportId);
      
      // Skip if we can't create a proper ID
      if (!normalizedId || normalizedId.length < 5) {
        console.log(`\n[PREVIEW] User ${user.username} has invalid passport ID: ${originalPassportId}`);
        console.log('  Cannot standardize this ID - manual review required');
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
          const firstPart = normalizedCore.slice(0, 4).padEnd(4, '0');
          const secondPart = normalizedCore.slice(4, 7).padEnd(3, 'X');
          idComponents = ['PKL', firstPart, secondPart];
        } else {
          // Missing proper format, create from normalized ID
          const firstPart = normalizedId.slice(0, 4).padEnd(4, '0');
          const secondPart = normalizedId.slice(4, 7).padEnd(3, 'X');
          idComponents = ['PKL', firstPart, secondPart];
        }
      } else {
        // No formatting at all, create from normalized ID
        const firstPart = normalizedId.slice(0, 4).padEnd(4, '0');
        const secondPart = normalizedId.slice(4, 7).padEnd(3, 'X');
        idComponents = ['PKL', firstPart, secondPart];
      }
      
      // Create standardized passport ID
      const standardizedPassportId = idComponents.join('-');
      
      console.log(`\n[PREVIEW] User "${user.username}" (ID: ${user.id}):`);
      console.log(`  Current:  ${originalPassportId}`);
      console.log(`  Standard: ${standardizedPassportId}`);
    }
    
    console.log('\n----- END PREVIEW -----');
    console.log('\nTo apply these changes, run the migration script with: npx tsx run-passport-id-standardization.ts');
    
  } catch (error) {
    console.error('\n[PREVIEW] Error previewing passport ID standardization:', error);
  } finally {
    await queryClient.end();
  }
}

// Run the preview
previewPassportStandardization();