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

// Helper function to calculate points based on player's gender and age group
async function calculatePlayerPoints(
  playerId: number,
  isWinner: boolean,
  competitionType: string,
  matchFormat: string,
  ageGroupOverride?: string
): Promise<{ basePoints: number; ageGroup: string; multiplier: number; finalPoints: number; gender: string }> {
  
  // Get player info
  const user = await db.select({
    yearOfBirth: users.yearOfBirth,
    gender: users.gender
  }).from(users).where(eq(users.id, playerId)).limit(1);
  
  if (!user[0]?.yearOfBirth) {
    throw new Error(`Cannot determine age group for player ${playerId} - missing birth year`);
  }
  
  const birthDate = new Date(user[0].yearOfBirth, 0, 1);
  const ageGroup = ageGroupOverride || calculateAgeGroup(birthDate);
  const gender = user[0].gender || 'unspecified';
  
  // Determine the effective match format based on gender for point calculation
  let effectiveFormat = matchFormat;
  if (matchFormat === 'doubles') {
    // For doubles, points are awarded based on player's gender
    effectiveFormat = gender === 'female' ? 'womens_doubles' : 'mens_doubles';
  } else if (matchFormat === 'singles') {
    // For singles, points are awarded based on player's gender  
    effectiveFormat = gender === 'female' ? 'singles_female' : 'singles_male';
  }
  // mixed_doubles stays as is - all players get mixed doubles points
  
  // Get point allocation rules for the competition type
  const competitionRules = POINT_ALLOCATION_RULES[competitionType as keyof typeof POINT_ALLOCATION_RULES];
  if (!competitionRules) {
    console.warn(`No point allocation rules found for competition type: ${competitionType}, using defaults`);
    const basePoints = isWinner ? 50 : 25;
    const multiplier = 1.0;
    const finalPoints = Math.round(basePoints * multiplier);
    
    return {
      basePoints,
      ageGroup,
      multiplier,
      finalPoints,
      gender
    };
  }

  // Get base points for the effective format
  const formatRules = competitionRules[effectiveFormat as keyof typeof competitionRules];
  if (!formatRules) {
    console.warn(`No rules found for format ${effectiveFormat} in ${competitionType}, using defaults`);
    const basePoints = isWinner ? 50 : 25;
    const multiplier = 1.0; 
    const finalPoints = Math.round(basePoints * multiplier);
    
    return {
      basePoints,
      ageGroup,
      multiplier,
      finalPoints,
      gender
    };
  }
  
  const basePoints = isWinner ? (formatRules as any).winner : (formatRules as any).loser;
  const multiplier = 1.0; // Default multiplier, can be enhanced later
  const finalPoints = Math.round(basePoints * multiplier);
  
  return {
    basePoints,
    ageGroup,
    multiplier,
    finalPoints,
    gender
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
    
    // ENHANCED: Automatically update user ranking points (eliminates manual admin step)
    for (const result of playerResults) {
      await db.update(users)
        .set({
          rankingPoints: sql`${users.rankingPoints} + ${result.pointsAwarded}`
        })
        .where(eq(users.id, result.playerId));
    }
    
    res.json({ 
      message: 'Match completed successfully - ranking points automatically updated',
      matchId,
      playerResults: playerResults.length,
      pointsUpdated: true
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

// CRUD Operations for Completed Matches

// Get completed match details with full player results
router.get('/matches/:matchId/details', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    
    // Get match basic info
    const matchData = await db.select().from(adminMatches)
      .where(eq(adminMatches.id, matchId)).limit(1);
      
    if (!matchData[0]) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Get all player results for this match
    const playerResults = await db.select({
      id: playerMatchResults.id,
      playerId: playerMatchResults.playerId,
      pointsAwarded: playerMatchResults.pointsAwarded,
      isWinner: playerMatchResults.isWinner,
      playerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as('playerName'),
      username: users.username
    })
    .from(playerMatchResults)
    .leftJoin(users, eq(playerMatchResults.playerId, users.id))
    .where(eq(playerMatchResults.matchId, matchId));
    
    res.json({
      match: matchData[0],
      playerResults,
      message: 'Match details retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving match details:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve match details', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Update completed match scores and recalculate points
router.patch('/matches/:matchId/update', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const { 
      player1Score, 
      player2Score, 
      team1Score, 
      team2Score, 
      winnerId,
      notes,
      recalculatePoints = true 
    } = req.body;
    
    // Verify match exists and is completed
    const existingMatch = await db.select().from(adminMatches)
      .where(eq(adminMatches.id, matchId)).limit(1);
      
    if (!existingMatch[0]) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    if (existingMatch[0].status !== 'completed') {
      return res.status(400).json({ message: 'Can only edit completed matches' });
    }
    
    // Get existing player results to reverse previous points
    const existingResults = await db.select()
      .from(playerMatchResults)
      .where(eq(playerMatchResults.matchId, matchId));
    
    // Reverse previous point allocations
    for (const result of existingResults) {
      await db.update(users)
        .set({
          rankingPoints: sql`${users.rankingPoints} - ${result.pointsAwarded}`
        })
        .where(eq(users.id, result.playerId));
    }
    
    // Update match scores
    const updateData: any = { updatedAt: new Date() };
    if (player1Score !== undefined) updateData.player1Score = player1Score;
    if (player2Score !== undefined) updateData.player2Score = player2Score;
    if (team1Score !== undefined) updateData.team1Score = team1Score;
    if (team2Score !== undefined) updateData.team2Score = team2Score;
    if (notes !== undefined) updateData.notes = notes;
    
    const [updatedMatch] = await db.update(adminMatches)
      .set(updateData)
      .where(eq(adminMatches.id, matchId))
      .returning();
    
    // Delete existing results for recalculation
    await db.delete(playerMatchResults)
      .where(eq(playerMatchResults.matchId, matchId));
    
    // Get competition details for recalculation
    const competition = await db.select().from(competitions)
      .where(eq(competitions.id, updatedMatch.competitionId)).limit(1);
    
    let pointAdjustments = [];
    
    if (competition[0] && winnerId) {
      // Get all players in match for point recalculation
      const playerIds = [
        updatedMatch.player1Id,
        updatedMatch.player2Id,
        updatedMatch.team1Player1Id,
        updatedMatch.team1Player2Id,
        updatedMatch.team2Player1Id,
        updatedMatch.team2Player2Id
      ].filter(Boolean);
      
      const playersData = await db.select({
        id: users.id,
        gender: users.gender,
        yearOfBirth: users.yearOfBirth
      }).from(users).where(inArray(users.id, playerIds));
      
      // Recalculate points for each player
      const newPlayerResults = [];
      for (const player of playersData) {
        const isWinner = player.id === winnerId;
        const pointCalculation = calculatePlayerPoints(
          player,
          competition[0],
          updatedMatch,
          isWinner
        );
        
        const resultData: InsertPlayerMatchResult = {
          matchId: matchId,
          playerId: player.id,
          pointsAwarded: pointCalculation.finalPoints,
          isWinner,
          ageGroupAtMatch: pointCalculation.ageGroup as any,
          ageGroupMultiplier: pointCalculation.multiplier.toString(),
          basePoints: pointCalculation.basePoints
        };
        
        newPlayerResults.push(resultData);
        pointAdjustments.push({
          playerId: player.id,
          oldPoints: existingResults.find(r => r.playerId === player.id)?.pointsAwarded || 0,
          newPoints: pointCalculation.finalPoints,
          difference: pointCalculation.finalPoints - (existingResults.find(r => r.playerId === player.id)?.pointsAwarded || 0)
        });
      }
      
      // Insert new player results
      await db.insert(playerMatchResults).values(newPlayerResults);
      
      // Apply new point allocations
      for (const result of newPlayerResults) {
        await db.update(users)
          .set({
            rankingPoints: sql`${users.rankingPoints} + ${result.pointsAwarded}`
          })
          .where(eq(users.id, result.playerId));
      }
    }
    
    res.json({
      message: 'Match updated successfully - points recalculated',
      match: updatedMatch,
      pointAdjustments,
      pointsRecalculated: true
    });
    
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ 
      message: 'Failed to update match', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Delete completed match (with point reversal)
router.delete('/matches/:matchId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const { reason } = req.body;
    
    // Verify match exists
    const existingMatch = await db.select().from(adminMatches)
      .where(eq(adminMatches.id, matchId)).limit(1);
      
    if (!existingMatch[0]) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    // Get player results to reverse points before deletion
    const playerResults = await db.select()
      .from(playerMatchResults)
      .where(eq(playerMatchResults.matchId, matchId));
    
    // Reverse all point allocations
    for (const result of playerResults) {
      await db.update(users)
        .set({
          rankingPoints: sql`${users.rankingPoints} - ${result.pointsAwarded}`
        })
        .where(eq(users.id, result.playerId));
    }
    
    // Delete player results first (foreign key constraint)
    await db.delete(playerMatchResults)
      .where(eq(playerMatchResults.matchId, matchId));
    
    // Delete the match
    await db.delete(adminMatches)
      .where(eq(adminMatches.id, matchId));
    
    res.json({
      message: 'Match deleted successfully - all points reversed',
      pointsReversed: playerResults.length,
      deletionReason: reason || 'No reason provided'
    });
    
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ 
      message: 'Failed to delete match', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get list of completed matches with pagination and filtering
router.get('/matches/completed', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      competitionId, 
      dateFrom, 
      dateTo 
    } = req.query;
    
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const matches = await db.select({
      id: adminMatches.id,
      competitionId: adminMatches.competitionId,
      player1Score: adminMatches.player1Score,
      player2Score: adminMatches.player2Score,
      team1Score: adminMatches.team1Score,
      team2Score: adminMatches.team2Score,
      status: adminMatches.status,
      createdAt: adminMatches.createdAt,
      updatedAt: adminMatches.updatedAt,
      competitionName: competitions.name
    })
    .from(adminMatches)
    .leftJoin(competitions, eq(adminMatches.competitionId, competitions.id))
    .where(eq(adminMatches.status, 'completed'))
    .orderBy(desc(adminMatches.updatedAt))
    .limit(parseInt(limit as string))
    .offset(offset);
    
    // Get total count for pagination
    const totalCount = await db.select({ count: sql`count(*)` })
      .from(adminMatches)
      .where(eq(adminMatches.status, 'completed'));
    
    res.json({
      matches,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount[0].count,
        pages: Math.ceil(Number(totalCount[0].count) / parseInt(limit as string))
      },
      message: 'Completed matches retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error retrieving completed matches:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve completed matches', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export { router as enhancedMatchManagementRouter };