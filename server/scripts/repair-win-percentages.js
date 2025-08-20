#!/usr/bin/env node

/**
 * Win Percentage Data Repair Script
 * 
 * This script recalculates match statistics for all users based on their historical match data.
 * It fixes the issue where users have ranking points but 0% win percentage due to missing
 * totalMatches and matchesWon data.
 * 
 * Run with: node server/scripts/repair-win-percentages.js
 */

import { db } from '../db';
import { users, matches } from '../../shared/schema';
import { eq, or, sql } from 'drizzle-orm';

async function repairWinPercentages() {
  console.log('🔧 Starting win percentage data repair...');
  
  try {
    // Get all users who have ranking points but missing match statistics
    const usersToRepair = await db
      .select()
      .from(users)
      .where(
        or(
          sql`${users.singlesRankingPoints} > 0 OR ${users.doublesRankingPoints} > 0`,
          sql`${users.totalMatches} = 0 AND (${users.singlesRankingPoints} > 0 OR ${users.doublesRankingPoints} > 0)`
        )
      );
    
    console.log(`📊 Found ${usersToRepair.length} users to analyze for match statistics repair`);
    
    let repairedCount = 0;
    
    for (const user of usersToRepair) {
      console.log(`\n🔍 Processing user ${user.id} (${user.displayName || user.username})`);
      
      // Get all matches for this user
      const userMatches = await db
        .select()
        .from(matches)
        .where(
          or(
            eq(matches.playerOneId, user.id),
            eq(matches.playerTwoId, user.id),
            eq(matches.playerOnePartnerId, user.id),
            eq(matches.playerTwoPartnerId, user.id)
          )
        );
      
      const totalMatches = userMatches.length;
      
      // Calculate wins including doubles team wins
      const matchesWon = userMatches.filter(match => {
        // Direct wins (individual or team leader)
        if (match.winnerId === user.id) return true;
        
        // Doubles team wins: if user was on winning team
        if (match.formatType === 'doubles') {
          // Check if user was on team 1 and team 1 won
          if ((match.playerOneId === user.id || match.playerOnePartnerId === user.id) && 
              (match.winnerId === match.playerOneId || match.winnerId === match.playerOnePartnerId)) {
            return true;
          }
          // Check if user was on team 2 and team 2 won
          if ((match.playerTwoId === user.id || match.playerTwoPartnerId === user.id) && 
              (match.winnerId === match.playerTwoId || match.winnerId === match.playerTwoPartnerId)) {
            return true;
          }
        }
        
        return false;
      }).length;
      
      const winPercentage = totalMatches > 0 ? (matchesWon / totalMatches) * 100 : 0;
      
      // Update user statistics if they differ from current values
      if (user.totalMatches !== totalMatches || user.matchesWon !== matchesWon) {
        await db
          .update(users)
          .set({
            totalMatches: totalMatches,
            matchesWon: matchesWon,
            lastMatchDate: userMatches.length > 0 ? new Date(Math.max(...userMatches.map(m => new Date(m.createdAt).getTime()))) : user.lastMatchDate
          })
          .where(eq(users.id, user.id));
        
        console.log(`✅ Updated user ${user.id}: ${totalMatches} total matches, ${matchesWon} wins (${winPercentage.toFixed(1)}% win rate)`);
        repairedCount++;
      } else {
        console.log(`✓ User ${user.id} already has correct statistics: ${totalMatches} matches, ${matchesWon} wins`);
      }
    }
    
    console.log(`\n🎉 Win percentage repair completed!`);
    console.log(`📈 Repaired match statistics for ${repairedCount} users`);
    console.log(`📊 Total users analyzed: ${usersToRepair.length}`);
    
  } catch (error) {
    console.error('❌ Error during win percentage repair:', error);
    throw error;
  }
}

// Run the repair script
repairWinPercentages()
  .then(() => {
    console.log('🏁 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });