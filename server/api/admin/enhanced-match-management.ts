// Enhanced Admin Match Management API with Individual Player Point Allocation
// Implements age-specific point allocation per player rather than per match

import { Router } from 'express';
import { eq, desc, asc, and, or, sql } from 'drizzle-orm';
import { db } from '../../db';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import {
  competitions,
  adminMatches,
  playerMatchResults,
  users,
  pointAllocationRules,
  ageGroupMappings,
  createCompetitionSchema,
  createMatchSchema,
  createPlayerResultSchema,
  calculateAgeGroup,
  POINT_ALLOCATION_RULES,
  type Competition,
  type Match,
  type PlayerMatchResult,
  type InsertPlayerMatchResult
} from '../../../shared/schema';

const router = Router();

// Helper function to get user's current age group
async function getUserAgeGroup(userId: number): Promise<string | null> {
  const user = await db.select({
    yearOfBirth: users.yearOfBirth
  }).from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user[0]?.yearOfBirth) {
    return null;
  }
  
  const birthDate = new Date(user[0].yearOfBirth, 0, 1);
  return calculateAgeGroup(birthDate);
}

// Helper function to calculate points for a player based on their age group
async function calculatePlayerPoints(
  playerId: number,
  isWinner: boolean,
  competitionType: string,
  matchFormat: string,
  ageGroupOverride?: string
): Promise<{ basePoints: number; ageGroup: string; multiplier: number; finalPoints: number }> {
  
  // Get player's age group
  const ageGroup = ageGroupOverride || await getUserAgeGroup(playerId);
  if (!ageGroup) {
    throw new Error(`Cannot determine age group for player ${playerId}`);
  }
  
  // Find matching point allocation rule
  const rule = POINT_ALLOCATION_RULES.find(r => 
    r.competitionType === competitionType &&
    r.matchFormat === matchFormat &&
    r.ageGroup === ageGroup
  );
  
  if (!rule) {
    throw new Error(`No point allocation rule found for ${competitionType}/${matchFormat}/${ageGroup}`);
  }
  
  const basePoints = isWinner ? rule.winnerPoints : rule.loserPoints;
  const multiplier = 1.0; // Default multiplier, can be enhanced later
  const finalPoints = Math.round(basePoints * multiplier);
  
  return {
    basePoints,
    ageGroup,
    multiplier,
    finalPoints
  };
}

// Create a new match with individual player point allocation
router.post('/matches', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchData = createMatchSchema.parse(req.body);
    
    // Create the match
    const [newMatch] = await db.insert(adminMatches)
      .values({
        ...matchData,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json(newMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(400).json({ 
      message: 'Failed to create match', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Complete a match and allocate points to individual players
router.post('/matches/:matchId/complete', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const { winnerId, player1Score, player2Score, team1Score, team2Score } = req.body;
    
    // Get match details
    const match = await db.select().from(adminMatches).where(eq(adminMatches.id, matchId)).limit(1);
    if (!match[0]) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    const matchData = match[0];
    
    // Get competition details for point calculation
    const competition = await db.select().from(competitions)
      .where(eq(competitions.id, matchData.competitionId)).limit(1);
    
    if (!competition[0]) {
      return res.status(404).json({ message: 'Competition not found' });
    }
    
    const competitionData = competition[0];
    
    // Update match status and scores
    await db.update(adminMatches)
      .set({
        status: 'completed',
        winnerId,
        player1Score,
        player2Score,
        team1Score,
        team2Score,
        updatedAt: new Date()
      })
      .where(eq(adminMatches.id, matchId));
    
    // Create individual player results
    const playerResults: InsertPlayerMatchResult[] = [];
    
    // Handle different match formats
    if (matchData.format === 'singles') {
      // Singles: player1 vs player2
      const players = [
        { playerId: matchData.player1Id, isWinner: winnerId === matchData.player1Id },
        { playerId: matchData.player2Id!, isWinner: winnerId === matchData.player2Id }
      ];
      
      for (const player of players) {
        const pointData = await calculatePlayerPoints(
          player.playerId,
          player.isWinner,
          competitionData.type,
          matchData.format
        );
        
        playerResults.push({
          matchId,
          playerId: player.playerId,
          isWinner: player.isWinner,
          pointsAwarded: pointData.finalPoints,
          ageGroupAtMatch: pointData.ageGroup as any,
          ageGroupMultiplier: pointData.multiplier.toString(),
          basePoints: pointData.basePoints
        });
      }
    } else {
      // Doubles/Mixed Doubles: team1 vs team2
      const players = [
        { playerId: matchData.player1Id, isWinner: winnerId === matchData.player1Id },
        { playerId: matchData.player1PartnerId!, isWinner: winnerId === matchData.player1Id },
        { playerId: matchData.player2Id!, isWinner: winnerId === matchData.player2Id },
        { playerId: matchData.player2PartnerId!, isWinner: winnerId === matchData.player2Id }
      ];
      
      for (const player of players) {
        const pointData = await calculatePlayerPoints(
          player.playerId,
          player.isWinner,
          competitionData.type,
          matchData.format
        );
        
        playerResults.push({
          matchId,
          playerId: player.playerId,
          isWinner: player.isWinner,
          pointsAwarded: pointData.finalPoints,
          ageGroupAtMatch: pointData.ageGroup as any,
          ageGroupMultiplier: pointData.multiplier.toString(),
          basePoints: pointData.basePoints
        });
      }
    }
    
    // Insert all player results
    await db.insert(playerMatchResults).values(playerResults);
    
    res.json({ 
      message: 'Match completed successfully',
      matchId,
      playerResults: playerResults.length
    });
    
  } catch (error) {
    console.error('Error completing match:', error);
    res.status(400).json({ 
      message: 'Failed to complete match', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get matches with individual player results
router.get('/matches/:matchId/results', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    
    const results = await db.select({
      id: playerMatchResults.id,
      playerId: playerMatchResults.playerId,
      playerName: users.displayName,
      playerUsername: users.username,
      isWinner: playerMatchResults.isWinner,
      pointsAwarded: playerMatchResults.pointsAwarded,
      ageGroupAtMatch: playerMatchResults.ageGroupAtMatch,
      ageGroupMultiplier: playerMatchResults.ageGroupMultiplier,
      basePoints: playerMatchResults.basePoints,
      createdAt: playerMatchResults.createdAt
    })
    .from(playerMatchResults)
    .leftJoin(users, eq(playerMatchResults.playerId, users.id))
    .where(eq(playerMatchResults.matchId, matchId))
    .orderBy(desc(playerMatchResults.pointsAwarded));
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching match results:', error);
    res.status(500).json({ 
      message: 'Failed to fetch match results', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get age group leaderboards
router.get('/leaderboards/:ageGroup', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ageGroup = req.params.ageGroup;
    const { limit = 50, offset = 0 } = req.query;
    
    const leaderboard = await db.select({
      playerId: playerMatchResults.playerId,
      playerName: users.displayName,
      playerUsername: users.username,
      totalPoints: sql<number>`SUM(${playerMatchResults.pointsAwarded})`.as('total_points'),
      matchesPlayed: sql<number>`COUNT(*)`.as('matches_played'),
      matchesWon: sql<number>`SUM(CASE WHEN ${playerMatchResults.isWinner} THEN 1 ELSE 0 END)`.as('matches_won'),
      winPercentage: sql<number>`ROUND(SUM(CASE WHEN ${playerMatchResults.isWinner} THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2)`.as('win_percentage')
    })
    .from(playerMatchResults)
    .leftJoin(users, eq(playerMatchResults.playerId, users.id))
    .where(eq(playerMatchResults.ageGroupAtMatch, ageGroup as any))
    .groupBy(playerMatchResults.playerId, users.displayName, users.username)
    .orderBy(desc(sql`total_points`))
    .limit(parseInt(limit as string))
    .offset(parseInt(offset as string));
    
    res.json({
      ageGroup,
      leaderboard,
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      message: 'Failed to fetch leaderboard', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get mixed-age match analytics
router.get('/analytics/mixed-age-matches', requireAuth, requireAdmin, async (req, res) => {
  try {
    const analytics = await db.select({
      matchId: playerMatchResults.matchId,
      ageGroups: sql<string[]>`ARRAY_AGG(DISTINCT ${playerMatchResults.ageGroupAtMatch})`.as('age_groups'),
      totalPlayers: sql<number>`COUNT(DISTINCT ${playerMatchResults.playerId})`.as('total_players'),
      averagePoints: sql<number>`ROUND(AVG(${playerMatchResults.pointsAwarded}), 2)`.as('average_points'),
      pointsRange: sql<string>`MIN(${playerMatchResults.pointsAwarded}) || '-' || MAX(${playerMatchResults.pointsAwarded})`.as('points_range')
    })
    .from(playerMatchResults)
    .groupBy(playerMatchResults.matchId)
    .having(sql`COUNT(DISTINCT ${playerMatchResults.ageGroupAtMatch}) > 1`)
    .orderBy(desc(sql`total_players`));
    
    res.json({
      mixedAgeMatches: analytics,
      totalMixedAgeMatches: analytics.length
    });
  } catch (error) {
    console.error('Error fetching mixed-age analytics:', error);
    res.status(500).json({ 
      message: 'Failed to fetch analytics', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get all available age groups from active players
router.get('/age-groups', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ageGroups = await db.select({
      ageGroup: playerMatchResults.ageGroupAtMatch,
      playerCount: sql<number>`COUNT(DISTINCT ${playerMatchResults.playerId})`.as('player_count'),
      totalMatches: sql<number>`COUNT(*)`.as('total_matches'),
      totalPoints: sql<number>`SUM(${playerMatchResults.pointsAwarded})`.as('total_points')
    })
    .from(playerMatchResults)
    .groupBy(playerMatchResults.ageGroupAtMatch)
    .orderBy(asc(playerMatchResults.ageGroupAtMatch));
    
    res.json(ageGroups);
  } catch (error) {
    console.error('Error fetching age groups:', error);
    res.status(500).json({ 
      message: 'Failed to fetch age groups', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export { router as enhancedMatchManagementRouter };