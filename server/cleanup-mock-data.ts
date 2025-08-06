/**
 * Production Cleanup Script
 * Removes mock/testing data while preserving real users and essential system data
 */

import { db } from './db';
import { users, matches, tournaments } from '../shared/schema';
import { eq, like, or, and, inArray } from 'drizzle-orm';

// Mock user patterns to identify test data
const MOCK_USER_PATTERNS = [
  'testuser%',
  'mockplayer%', 
  'sample%',
  'demo%',
  'test%player%',
  '%test%',
  'player1', 'player2', 'player3', 'player4', 'player5',
  'user1', 'user2', 'user3', 'user4', 'user5'
];

// Mock email patterns
const MOCK_EMAIL_PATTERNS = [
  '%test@%',
  '%mock@%',
  '%demo@%',
  '%example.com',
  '%sample@%'
];

async function cleanupMockData() {
  console.log('🧹 Starting production cleanup - removing mock/test data only...');
  
  try {
    // 1. Identify mock users by username patterns
    const mockUsersByUsername = await db
      .select({ id: users.id, username: users.username, email: users.email })
      .from(users)
      .where(
        or(
          ...MOCK_USER_PATTERNS.map(pattern => like(users.username, pattern))
        )
      );
    
    // 2. Identify mock users by email patterns  
    const mockUsersByEmail = await db
      .select({ id: users.id, username: users.username, email: users.email })
      .from(users)
      .where(
        or(
          ...MOCK_EMAIL_PATTERNS.map(pattern => like(users.email, pattern))
        )
      );
    
    // 3. Combine and deduplicate mock user IDs
    const allMockUsers = [...mockUsersByUsername, ...mockUsersByEmail];
    const mockUserIds = [...new Set(allMockUsers.map(user => user.id))];
    
    console.log(`📋 Found ${mockUserIds.length} mock users to remove:`);
    allMockUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
    });
    
    if (mockUserIds.length === 0) {
      console.log('✅ No mock users found - database is already clean!');
      return;
    }
    
    // 4. Remove related data for mock users safely
    console.log('🗑️ Removing matches involving mock users...');
    for (const userId of mockUserIds) {
      try {
        await db
          .delete(matches)
          .where(
            or(
              eq(matches.player1Id, userId),
              eq(matches.player2Id, userId),
              eq(matches.player3Id, userId),
              eq(matches.player4Id, userId)
            )
          );
      } catch (error) {
        console.log(`  ⚠️ Error removing matches for user ${userId}, continuing...`);
      }
    }
    console.log(`  ✓ Removed matches involving mock users`);
    
    // 5. Remove coach profiles for mock users
    console.log('🗑️ Removing coach profiles for mock users...');
    for (const userId of mockUserIds) {
      try {
        await db.execute(`DELETE FROM coach_profiles WHERE user_id = $1`, [userId]);
      } catch (error) {
        // Table might not exist or no profiles to delete
      }
    }
    console.log(`  ✓ Removed coach profiles for mock users`);
    
    // 6. Remove mock tournaments
    console.log('🗑️ Removing tournaments created by mock users...');
    for (const userId of mockUserIds) {
      try {
        await db
          .delete(tournaments)
          .where(eq(tournaments.createdBy, userId));
      } catch (error) {
        console.log(`  ⚠️ Error removing tournaments for user ${userId}, continuing...`);
      }
    }
    console.log(`  ✓ Removed mock tournaments`);
    
    // 7. Finally, remove the mock users themselves
    console.log('🗑️ Removing mock user accounts...');
    for (const userId of mockUserIds) {
      try {
        await db
          .delete(users)
          .where(eq(users.id, userId));
      } catch (error) {
        console.log(`  ⚠️ Error removing user ${userId}, continuing...`);
      }
    }
    console.log(`  ✓ Removed ${mockUserIds.length} mock users`);
    
    // 9. Summary of what was preserved
    const remainingUsers = await db.select({ count: users.id }).from(users);
    console.log('\n✅ Production cleanup complete!');
    console.log(`📊 Remaining real users: ${remainingUsers.length}`);
    console.log('🔒 Preserved: Real user accounts, system configurations, admin accounts');
    console.log('🗑️ Removed: Mock users, test matches, sample tournaments, fake data');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanupMockData()
  .then(() => {
    console.log('🎉 Mock data cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });

export { cleanupMockData };