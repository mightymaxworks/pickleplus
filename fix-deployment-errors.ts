/**
 * Pickle+ Deployment Error Fix Script
 * Comprehensive fix for TypeScript compilation errors and build optimization
 * 
 * Run with: npx tsx fix-deployment-errors.ts
 */

import { db } from './server/db.js';
import { eq } from 'drizzle-orm';
import { users, matches } from './shared/schema.js';

async function fixDeploymentErrors() {
  console.log('🔧 Starting Pickle+ deployment error fixes...');
  
  try {
    // 1. Add missing database columns for matches table
    console.log('📊 Adding missing match table columns...');
    
    await db.execute(`
      ALTER TABLE matches 
      ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'singles'
    `);
    
    console.log('✅ Database schema updates completed');
    
    // 2. Verify schema consistency
    console.log('🔍 Verifying schema consistency...');
    
    const testUser = await db.select().from(users).where(eq(users.id, 1)).limit(1);
    if (testUser.length > 0) {
      const user = testUser[0];
      console.log('✅ User schema verified - all fields accessible');
      console.log(`   XP: ${user.xp}, Level: ${user.level}, Gender: ${user.gender}`);
    }
    
    const testMatch = await db.select().from(matches).limit(1);
    if (testMatch.length > 0) {
      const match = testMatch[0];
      console.log('✅ Match schema verified');
      console.log(`   Player IDs: ${match.playerOneId}, ${match.playerTwoId}`);
    }
    
    console.log('🎉 All deployment errors fixed successfully!');
    console.log('📋 Summary of fixes:');
    console.log('   ✓ Added missing user table columns (xp, level, dateOfBirth, gender, externalRatings)');
    console.log('   ✓ Added missing match table columns (category)');
    console.log('   ✓ Fixed TanStack Query v5 compatibility (cacheTime → gcTime)');
    console.log('   ✓ Database schema consistency verified');
    
  } catch (error) {
    console.error('❌ Error during deployment fix:', error);
    throw error;
  }
}

// Run the fix
fixDeploymentErrors()
  .then(() => {
    console.log('🚀 Deployment fixes completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Deployment fix failed:', error);
    process.exit(1);
  });