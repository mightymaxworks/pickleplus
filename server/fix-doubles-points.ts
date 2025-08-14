/**
 * Fix doubles ranking points for existing matches
 * This script retroactively awards doubles ranking points to players who participated in doubles matches
 * but didn't receive doubles points due to earlier system issues.
 */

import { db } from './db';
import { matches, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

async function fixDoublesRankingPoints() {
  console.log('🔧 Starting doubles ranking points fix...');
  
  try {
    // Get all doubles matches
    const doublesMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.formatType, 'doubles'));
    
    console.log(`📊 Found ${doublesMatches.length} doubles matches to process`);
    
    let updatedPlayers = 0;
    
    for (const match of doublesMatches) {
      const { playerOneId, playerTwoId, playerOnePartnerId, playerTwoPartnerId, winnerId, pointsAwarded } = match;
      const winnerPoints = pointsAwarded || 3; // Default to 3 points for win
      const loserPoints = 1; // 1 point for loss
      
      // Get all player IDs involved in the match
      const allPlayerIds = [
        playerOneId,
        playerTwoId, 
        playerOnePartnerId,
        playerTwoPartnerId
      ].filter(id => id !== null);
      
      // Determine winning team
      const isTeamOneWinner = winnerId === playerOneId;
      const winningTeam = isTeamOneWinner 
        ? [playerOneId, playerOnePartnerId].filter(id => id !== null)
        : [playerTwoId, playerTwoPartnerId].filter(id => id !== null);
      
      console.log(`🏆 Processing match ${match.id}: Winner team includes player ${winnerId}`);
      
      // Award points to each player
      for (const playerId of allPlayerIds) {
        const isWinner = winningTeam.includes(playerId);
        const doublesPoints = isWinner ? winnerPoints : loserPoints;
        
        // Update doubles ranking points for this player
        await db.update(users)
          .set({ 
            doublesRankingPoints: sql`COALESCE(doubles_ranking_points, 0) + ${doublesPoints}`,
          })
          .where(eq(users.id, playerId));
        
        console.log(`  ✅ Player ${playerId}: +${doublesPoints} doubles points (${isWinner ? 'winner' : 'loser'})`);
        updatedPlayers++;
      }
    }
    
    console.log(`🎉 Successfully updated doubles ranking points for ${updatedPlayers} players across ${doublesMatches.length} matches`);
    
    // Show updated player stats
    const playersWithDoubles = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        doublesRankingPoints: users.doublesRankingPoints
      })
      .from(users)
      .where(sql`doubles_ranking_points > 0`);
    
    console.log('\n📈 Players with doubles ranking points:');
    playersWithDoubles.forEach(player => {
      console.log(`  ${player.displayName}: ${player.doublesRankingPoints} points`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing doubles ranking points:', error);
    throw error;
  }
}

// Run the fix automatically
fixDoublesRankingPoints()
  .then(() => {
    console.log('✨ Doubles ranking points fix completed successfully!');
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error);
  });

export { fixDoublesRankingPoints };