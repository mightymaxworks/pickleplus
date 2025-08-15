/**
 * Script to fix Pickle Points conversion rate from incorrect implementation to 1.5x
 * 
 * The algorithm document specifies 1.5x conversion rate, but some existing data 
 * may have been calculated with different rates. This script recalculates all 
 * user Pickle Points based on their match history and the correct 1.5x rate.
 */

import { db } from './db';
import { users, matches } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

interface MatchPoints {
  playerId: number;
  rankingPoints: number;
  matchType: 'tournament' | 'league' | 'casual';
  isWinner: boolean;
}

// Correct Pickle Points conversion rate per algorithm document
const PICKLE_POINTS_CONVERSION_RATE = 1.5;

async function calculatePicklePointsForMatch(rankingPoints: number, isWinner: boolean): Promise<number> {
  // Apply 1.5x conversion rate - no additional bonuses per algorithm document
  const picklePointsFromRanking = Math.ceil(rankingPoints * PICKLE_POINTS_CONVERSION_RATE);
  return picklePointsFromRanking;
}

async function getMatchHistoryForUser(userId: number): Promise<MatchPoints[]> {
  // Get all matches for this user from the database
  const userMatches = await db
    .select({
      matchId: matches.id,
      matchType: matches.matchType,
      team1PlayerIds: matches.team1PlayerIds,
      team2PlayerIds: matches.team2PlayerIds,
      winningTeam: matches.winningTeam,
      // We'll need to calculate ranking points based on match data
    })
    .from(matches)
    .where(
      sql`(${matches.team1PlayerIds}::text LIKE '%"${userId}"%' OR ${matches.team2PlayerIds}::text LIKE '%"${userId}"%')`
    );

  const matchPoints: MatchPoints[] = [];

  for (const match of userMatches) {
    // Determine if user was winner and calculate their ranking points
    const isInTeam1 = match.team1PlayerIds?.includes(userId);
    const isWinner = (isInTeam1 && match.winningTeam === 1) || (!isInTeam1 && match.winningTeam === 2);
    
    // Calculate ranking points based on System B (3 points win, 1 point loss)
    const basePoints = isWinner ? 3 : 1;
    
    // Apply match type multiplier
    let multiplier = 1.0;
    switch (match.matchType) {
      case 'tournament':
        multiplier = 1.5; // Tournament multiplier
        break;
      case 'league':
        multiplier = 0.75; // League multiplier  
        break;
      case 'casual':
        multiplier = 1.0; // Casual baseline
        break;
    }
    
    const rankingPoints = Math.round(basePoints * multiplier);
    
    matchPoints.push({
      playerId: userId,
      rankingPoints,
      matchType: match.matchType as 'tournament' | 'league' | 'casual',
      isWinner
    });
  }

  return matchPoints;
}

async function recalculateUserPicklePoints(userId: number): Promise<number> {
  const matchHistory = await getMatchHistoryForUser(userId);
  let totalPicklePoints = 0;

  for (const match of matchHistory) {
    const picklePoints = await calculatePicklePointsForMatch(match.rankingPoints, match.isWinner);
    totalPicklePoints += picklePoints;
  }

  return totalPicklePoints;
}

async function fixAllUserPicklePoints() {
  console.log('🔧 Starting Pickle Points conversion rate fix...');
  console.log(`📊 Using correct conversion rate: ${PICKLE_POINTS_CONVERSION_RATE}x`);
  
  // Get all users
  const allUsers = await db.select({ id: users.id, username: users.username, picklePoints: users.picklePoints }).from(users);
  
  console.log(`👥 Found ${allUsers.length} users to process`);
  
  let updatedCount = 0;
  let totalPointsAdjustment = 0;

  for (const user of allUsers) {
    try {
      const currentPicklePoints = user.picklePoints || 0;
      const correctPicklePoints = await recalculateUserPicklePoints(user.id);
      
      if (currentPicklePoints !== correctPicklePoints) {
        console.log(`🔄 User ${user.username}: ${currentPicklePoints} → ${correctPicklePoints} Pickle Points`);
        
        // Update user's Pickle Points
        await db
          .update(users)
          .set({ picklePoints: correctPicklePoints })
          .where(eq(users.id, user.id));
        
        updatedCount++;
        totalPointsAdjustment += (correctPicklePoints - currentPicklePoints);
      }
    } catch (error) {
      console.error(`❌ Error processing user ${user.username}:`, error);
    }
  }

  console.log('✅ Pickle Points conversion rate fix completed!');
  console.log(`📈 Updated ${updatedCount} users`);
  console.log(`🎯 Total points adjustment: ${totalPointsAdjustment > 0 ? '+' : ''}${totalPointsAdjustment}`);
  
  return {
    usersProcessed: allUsers.length,
    usersUpdated: updatedCount,
    totalAdjustment: totalPointsAdjustment
  };
}

// Export the fix function for use in other scripts or manual execution
export { fixAllUserPicklePoints, PICKLE_POINTS_CONVERSION_RATE };

// Run the fix if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixAllUserPicklePoints()
    .then((result) => {
      console.log('Final result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}