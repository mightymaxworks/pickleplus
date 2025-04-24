/**
 * Framework 5.3 Direct Solution: Fix mightymax Admin Privileges
 * 
 * This script directly updates the database to ensure mightymax has admin privileges.
 * Run with: npx tsx fix-mightymax-admin.ts
 */

import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function fixMightymaxAdmin() {
  console.log('🔧 Starting mightymax admin privileges fix...');
  
  try {
    // Find mightymax user
    const [existingUser] = await db.select().from(users).where(eq(users.username, 'mightymax'));
    
    if (!existingUser) {
      console.error('❌ User mightymax not found in database!');
      return;
    }
    
    console.log('✅ Found user:', {
      id: existingUser.id,
      username: existingUser.username,
      currentAdminStatus: existingUser.isAdmin,
      currentFoundingMemberStatus: existingUser.isFoundingMember
    });
    
    // Update mightymax with admin privileges
    const result = await db.update(users)
      .set({ 
        isAdmin: true, 
        isFoundingMember: true 
      })
      .where(eq(users.username, 'mightymax'))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Successfully updated user privileges:');
      console.log({
        id: result[0].id,
        username: result[0].username,
        isAdmin: result[0].isAdmin,
        isFoundingMember: result[0].isFoundingMember
      });
    } else {
      console.error('❌ Failed to update user - no rows returned');
    }
    
    // Verify the update worked
    const [verifiedUser] = await db.select().from(users).where(eq(users.username, 'mightymax'));
    console.log('✅ Verification check:', {
      id: verifiedUser.id,
      username: verifiedUser.username,
      isAdmin: verifiedUser.isAdmin,
      isFoundingMember: verifiedUser.isFoundingMember
    });
    
    console.log('🎉 mightymax admin privileges fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing mightymax admin privileges:', error);
  }
}

// Run the fix function
fixMightymaxAdmin();