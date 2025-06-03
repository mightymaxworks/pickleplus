/**
 * Update All Users to New 8-Character Passport Codes
 * 
 * This script regenerates passport codes for all existing users using the new
 * 8-character alphanumeric format while ensuring uniqueness.
 * 
 * Run with: npx tsx update-passport-codes.ts
 */

import { db } from './server/db';
import { users } from './shared/schema';
import { generateUniquePassportCode } from './server/utils/passport-generator';
import { eq } from 'drizzle-orm';

async function updateAllPassportCodes() {
  console.log('Starting passport code update for all users...');
  
  try {
    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users to update`);
    
    let updateCount = 0;
    
    for (const user of allUsers) {
      try {
        // Generate new 8-character passport code
        const newPassportCode = await generateUniquePassportCode();
        
        // Update user with new passport code
        await db
          .update(users)
          .set({ passportCode: newPassportCode })
          .where(eq(users.id, user.id));
        
        console.log(`Updated user ${user.username} (ID: ${user.id}) with new passport code: ${newPassportCode}`);
        updateCount++;
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        console.error(`Failed to update user ${user.username} (ID: ${user.id}):`, error);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updateCount} out of ${allUsers.length} users with new 8-character passport codes`);
    
  } catch (error) {
    console.error('❌ Failed to update passport codes:', error);
  }
}

// Run the update
updateAllPassportCodes()
  .then(() => {
    console.log('Passport code update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update failed:', error);
    process.exit(1);
  });