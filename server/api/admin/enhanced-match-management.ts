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
  matches,
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
    
    console.log(`[Admin] Attempting to delete match ID: ${matchId}`);
    
    // Verify match exists in the regular matches table (not adminMatches)
    const existingMatch = await db.select().from(matches)
      .where(eq(matches.id, matchId)).limit(1);
      
    if (!existingMatch[0]) {
      console.log(`[Admin] Match ${matchId} not found in matches table`);
      return res.status(404).json({ message: 'Match not found' });
    }
    
    console.log(`[Admin] Found match ${matchId}, checking for player results...`);
    
    // Get player results to reverse points before deletion
    const playerResults = await db.select()
      .from(playerMatchResults)
      .where(eq(playerMatchResults.matchId, matchId));
    
    console.log(`[Admin] Found ${playerResults.length} player results to reverse`);
    
    // Reverse all point allocations
    for (const result of playerResults) {
      await db.update(users)
        .set({
          rankingPoints: sql`${users.rankingPoints} - ${result.pointsAwarded}`
        })
        .where(eq(users.id, result.playerId));
      
      console.log(`[Admin] Reversed ${result.pointsAwarded} points for player ${result.playerId}`);
    }
    
    // Delete player results first (foreign key constraint)
    await db.delete(playerMatchResults)
      .where(eq(playerMatchResults.matchId, matchId));
    
    console.log(`[Admin] Deleted player results for match ${matchId}`);
    
    // Delete the match from the regular matches table
    await db.delete(matches)
      .where(eq(matches.id, matchId));
    
    console.log(`[Admin] Successfully deleted match ${matchId}`);
    
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

// Get list of completed matches with filtering support
router.get('/matches/completed', requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const { playerName, eventName, dateFrom, dateTo, format } = req.query;

    // Build WHERE conditions using simple string concatenation
    let whereConditions = ['m.winner_id IS NOT NULL'];
    
    // Filter by player name
    if (playerName) {
      const playerFilter = `(
        u1.username ILIKE '%${playerName}%' OR u1.first_name ILIKE '%${playerName}%' OR 
        u2.username ILIKE '%${playerName}%' OR u2.first_name ILIKE '%${playerName}%' OR
        u3.username ILIKE '%${playerName}%' OR u3.first_name ILIKE '%${playerName}%' OR
        u4.username ILIKE '%${playerName}%' OR u4.first_name ILIKE '%${playerName}%'
      )`;
      whereConditions.push(playerFilter);
    }

    // Filter by event name - check tournaments, competitions, and match_type
    if (eventName) {
      whereConditions.push(`(
        t.name ILIKE '%${eventName}%' OR 
        m.match_type ILIKE '%${eventName}%'
      )`);
    }

    // Filter by date range
    if (dateFrom) {
      whereConditions.push(`m.match_date >= '${dateFrom}'`);
    }

    if (dateTo) {
      whereConditions.push(`m.match_date <= '${dateTo}'`);
    }

    // Filter by format
    if (format && format !== 'all') {
      whereConditions.push(`m.format_type = '${format}'`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Execute query with direct SQL - Join tournaments and competitions for event names
    const queryString = `
      SELECT 
        m.id,
        m.player_one_id,
        m.player_two_id, 
        m.player_one_partner_id,
        m.player_two_partner_id,
        m.winner_id,
        m.score_player_one,
        m.score_player_two, 
        m.format_type as format,
        COALESCE(t.name, m.match_type, 'Standard Match') as event_name,
        COALESCE(t.description, 'Standard Match') as event_description,
        m.match_date as scheduled_date,
        m.tournament_id,
        m.match_type,
        m.notes,
        m.created_at,
        m.updated_at,
        u1.username as player_one_name,
        u1.first_name as player_one_first_name,
        u2.username as player_two_name,
        u2.first_name as player_two_first_name,
        u3.username as partner_one_name,
        u3.first_name as partner_one_first_name,
        u4.username as partner_two_name,
        u4.first_name as partner_two_first_name
      FROM matches m
      LEFT JOIN users u1 ON m.player_one_id = u1.id
      LEFT JOIN users u2 ON m.player_two_id = u2.id
      LEFT JOIN users u3 ON m.player_one_partner_id = u3.id
      LEFT JOIN users u4 ON m.player_two_partner_id = u4.id
      LEFT JOIN tournaments t ON m.tournament_id = t.id
      WHERE ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT ${limit}
    `;

    const query = sql.raw(queryString);
    
    const result = await db.execute(query);
    const matches = result.rows;

    // Enhanced matches with player results based on PICKLE_PLUS_ALGORITHM_DOCUMENT (System B: 3 points win, 1 point loss)
    const enhancedMatches = matches.map(match => {
      const playerResults = [];
      
      // Player 1
      if (match.player_one_id) {
        const isWinner = match.winner_id === match.player_one_id;
        const basePoints = isWinner ? 3 : 1; // PICKLE_PLUS_ALGORITHM_DOCUMENT System B
        
        playerResults.push({
          playerId: match.player_one_id,
          playerName: match.player_one_first_name ? `${match.player_one_first_name}` : match.player_one_name,
          isWinner,
          pointsAwarded: basePoints,
          basePoints,
          ageGroup: 'Open',
          ageGroupMultiplier: 1.0
        });
      }

      // Player 2  
      if (match.player_two_id) {
        const isWinner = match.winner_id === match.player_two_id;
        const basePoints = isWinner ? 3 : 1;
        
        playerResults.push({
          playerId: match.player_two_id,
          playerName: match.player_two_first_name ? `${match.player_two_first_name}` : match.player_two_name,
          isWinner,
          pointsAwarded: basePoints,
          basePoints,
          ageGroup: 'Open',
          ageGroupMultiplier: 1.0
        });
      }

      // Partner 1 (for doubles)
      if (match.player_one_partner_id) {
        const isWinner = match.winner_id === match.player_one_id; // Same as Player 1's result
        const basePoints = isWinner ? 3 : 1;
        
        playerResults.push({
          playerId: match.player_one_partner_id,
          playerName: match.partner_one_first_name ? `${match.partner_one_first_name}` : match.partner_one_name,
          isWinner,
          pointsAwarded: basePoints,
          basePoints,
          ageGroup: 'Open',
          ageGroupMultiplier: 1.0
        });
      }

      // Partner 2 (for doubles)
      if (match.player_two_partner_id) {
        const isWinner = match.winner_id === match.player_two_id; // Same as Player 2's result
        const basePoints = isWinner ? 3 : 1;
        
        playerResults.push({
          playerId: match.player_two_partner_id,
          playerName: match.partner_two_first_name ? `${match.partner_two_first_name}` : match.partner_two_name,
          isWinner,
          pointsAwarded: basePoints,
          basePoints,
          ageGroup: 'Open',
          ageGroupMultiplier: 1.0
        });
      }

      return {
        id: match.id,
        playerOneId: match.player_one_id,
        playerTwoId: match.player_two_id,
        playerOnePartnerId: match.player_one_partner_id,
        playerTwoPartnerId: match.player_two_partner_id,
        winnerId: match.winner_id,
        scorePlayerOne: match.score_player_one,
        scorePlayerTwo: match.score_player_two,
        category: match.category,
        createdAt: match.created_at,
        updatedAt: match.updated_at,
        playerResults,
        format: match.player_one_partner_id || match.player_two_partner_id ? 'doubles' : 'singles'
      };
    });

    console.log(`Retrieved ${enhancedMatches.length} completed matches successfully`);
    
    res.json({
      matches: enhancedMatches,
      total: enhancedMatches.length,
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

// Update match with points recalculation
router.put('/matches/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const {
      playerOneName,
      playerTwoName,
      playerOnePartnerName,
      playerTwoPartnerName,
      player1Score,
      player2Score,
      eventName,
      format,
      scheduledDate,
      notes
    } = req.body;

    // Get the current match to identify original players for points adjustment
    const currentMatch = await db.select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!currentMatch.length) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Determine winner based on scores
    const winnerId = player1Score > player2Score ? currentMatch[0].playerOneId : currentMatch[0].playerTwoId;
    const winner = player1Score > player2Score ? 'player_one' : 'player_two';

    // Update the match
    await db.update(matches)
      .set({
        scorePlayerOne: player1Score,
        scorePlayerTwo: player2Score,
        winnerId,
        winner,
        matchType: eventName || null,
        formatType: format,
        matchDate: scheduledDate ? new Date(scheduledDate) : null,
        notes: notes || null,
        updatedAt: new Date()
      })
      .where(eq(matches.id, matchId));

    // Recalculate points for affected players using the official PICKLE_PLUS_ALGORITHM_DOCUMENT
    const affectedPlayerIds = [
      currentMatch[0].playerOneId,
      currentMatch[0].playerTwoId,
      currentMatch[0].playerOnePartnerId,
      currentMatch[0].playerTwoPartnerId
    ].filter(Boolean);

    // Recalculate total pickle points for each affected player
    for (const playerId of affectedPlayerIds) {
      await recalculatePlayerPoints(playerId);
    }

    console.log(`Match ${matchId} updated successfully, points recalculated for ${affectedPlayerIds.length} players`);
    res.json({ success: true, message: 'Match updated and points recalculated successfully' });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// Delete match with points recalculation
router.delete('/matches/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);

    // Get the match to identify players for points adjustment
    const matchToDelete = await db.select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!matchToDelete.length) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const affectedPlayerIds = [
      matchToDelete[0].playerOneId,
      matchToDelete[0].playerTwoId,
      matchToDelete[0].playerOnePartnerId,
      matchToDelete[0].playerTwoPartnerId
    ].filter(Boolean);

    // Delete the match
    await db.delete(matches)
      .where(eq(matches.id, matchId));

    // Recalculate points for affected players
    for (const playerId of affectedPlayerIds) {
      await recalculatePlayerPoints(playerId);
    }

    console.log(`Match ${matchId} deleted successfully, points recalculated for ${affectedPlayerIds.length} players`);
    res.json({ success: true, message: 'Match deleted and points recalculated successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

// Helper function to recalculate player points based on all their matches
async function recalculatePlayerPoints(playerId: number) {
  try {
    // Get all completed matches for this player
    const playerMatchesQuery = sql`
      SELECT *
      FROM matches
      WHERE (player_one_id = ${playerId} OR player_two_id = ${playerId} 
             OR player_one_partner_id = ${playerId} OR player_two_partner_id = ${playerId})
        AND winner_id IS NOT NULL
      ORDER BY match_date
    `;

    const result = await db.execute(playerMatchesQuery);
    const playerMatches = result.rows;

    let totalPoints = 0;

    // Calculate points for each match using PICKLE_PLUS_ALGORITHM_DOCUMENT standards (System B: 3 win, 1 loss)
    for (const match of playerMatches) {
      const isWinner = (
        (match.winner_id === match.player_one_id && (playerId === match.player_one_id || playerId === match.player_one_partner_id)) ||
        (match.winner_id === match.player_two_id && (playerId === match.player_two_id || playerId === match.player_two_partner_id))
      );

      // Base points: 3 for win, 1 for loss (System B from PICKLE_PLUS_ALGORITHM_DOCUMENT)
      const basePoints = isWinner ? 3 : 1;

      // Additional factors based on match type
      let multiplier = 1.0;
      
      // Tournament matches get higher weighting
      if (match.match_type && match.match_type.toLowerCase().includes('tournament')) {
        multiplier = 1.5;
      }
      
      // Format-based adjustments
      if (match.format_type === 'doubles') {
        multiplier *= 1.2; // Doubles slightly harder
      }

      const matchPoints = Math.round(basePoints * multiplier);
      totalPoints += matchPoints;
    }

    // Update player's total pickle points
    await db.update(users)
      .set({ 
        picklePoints: totalPoints,
        updatedAt: new Date()
      })
      .where(eq(users.id, playerId));

    console.log(`Player ${playerId} points recalculated: ${totalPoints} total points from ${playerMatches.length} matches`);
  } catch (error) {
    console.error(`Error recalculating points for player ${playerId}:`, error);
  }
}

export { router as enhancedMatchManagementRouter };