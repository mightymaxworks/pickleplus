// Admin Match Management API Routes
// For creating leagues, tournaments, and casual matches with ranking point allocation

import { Router } from 'express';
import { eq, desc, asc, and, or, sql } from 'drizzle-orm';
import { db } from '../../db';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import {
  competitions,
  adminMatches as matches,
  pointAllocationRules,
  ageGroupMappings,
  users,
  createCompetitionSchema,
  createMatchSchema,
  allocatePointsSchema,
  POINT_ALLOCATION_RULES,
  type Competition,
  type Match,
  type MatchWithPlayers,
  type CompetitionWithMatches
} from '../../../shared/schema';

const router = Router();

// Helper function to calculate and update user age groups
async function updateUserAgeGroup(userId: number) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0] || !user[0].yearOfBirth) {
    return null;
  }

  // Calculate age group from year of birth
  const currentYear = new Date().getFullYear();
  const age = currentYear - user[0].yearOfBirth;
  
  const ageGroup = age < 19 ? '18U' :
                  age < 30 ? '19-29' :
                  age < 40 ? '30-39' :
                  age < 50 ? '40-49' :
                  age < 60 ? '50-59' :
                  age < 70 ? '60-69' : '70+';
  
  // Upsert age group mapping
  await db.insert(ageGroupMappings)
    .values({
      userId,
      ageGroup: ageGroup as any,
      birthDate: birthDate,
      calculatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: ageGroupMappings.userId,
      set: {
        ageGroup: ageGroup as any,
        birthDate: birthDate,
        calculatedAt: new Date()
      }
    });

  return ageGroup;
}

// Get all competitions with filters
router.get('/competitions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;
    
    let query = db.select({
      id: competitions.id,
      name: competitions.name,
      description: competitions.description,
      type: competitions.type,
      startDate: competitions.startDate,
      endDate: competitions.endDate,
      status: competitions.status,
      maxParticipants: competitions.maxParticipants,
      entryFee: competitions.entryFee,
      prizePool: competitions.prizePool,
      pointsMultiplier: competitions.pointsMultiplier,
      createdAt: competitions.createdAt,
      creator: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username
      }
    })
    .from(competitions)
    .leftJoin(users, eq(competitions.createdBy, users.id))
    .orderBy(desc(competitions.createdAt));

    // Apply filters
    const conditions = [];
    if (type) conditions.push(eq(competitions.type, type as any));
    if (status) conditions.push(eq(competitions.status, status as string));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching competitions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch competitions'
    });
  }
});

// Create a new competition
router.post('/competitions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const competitionData = createCompetitionSchema.parse({
      ...req.body,
      createdBy: req.user!.id
    });

    const [newCompetition] = await db.insert(competitions)
      .values(competitionData)
      .returning();

    res.json({
      success: true,
      data: newCompetition
    });
  } catch (error) {
    console.error('Error creating competition:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create competition'
    });
  }
});

// Get competition details with matches
router.get('/competitions/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const competitionId = parseInt(req.params.id);

    // Get competition details
    const competition = await db.select({
      id: competitions.id,
      name: competitions.name,
      description: competitions.description,
      type: competitions.type,
      startDate: competitions.startDate,
      endDate: competitions.endDate,
      status: competitions.status,
      maxParticipants: competitions.maxParticipants,
      entryFee: competitions.entryFee,
      prizePool: competitions.prizePool,
      pointsMultiplier: competitions.pointsMultiplier,
      createdAt: competitions.createdAt,
      creator: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username
      }
    })
    .from(competitions)
    .leftJoin(users, eq(competitions.createdBy, users.id))
    .where(eq(competitions.id, competitionId))
    .limit(1);

    if (!competition[0]) {
      return res.status(404).json({
        success: false,
        error: 'Competition not found'
      });
    }

    // Get matches for this competition
    const matchesData = await db.select({
      id: matches.id,
      matchNumber: matches.matchNumber,
      format: matches.format,
      ageGroup: matches.ageGroup,
      status: matches.status,
      scheduledTime: matches.scheduledTime,
      player1Score: matches.player1Score,
      player2Score: matches.player2Score,
      team1Score: matches.team1Score,
      team2Score: matches.team2Score,
      winnerPoints: matches.winnerPoints,
      loserPoints: matches.loserPoints,
      venue: matches.venue,
      court: matches.court,
      createdAt: matches.createdAt
    })
    .from(matches)
    .where(eq(matches.competitionId, competitionId))
    .orderBy(asc(matches.scheduledTime));

    const result: CompetitionWithMatches = {
      ...competition[0],
      matches: matchesData
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching competition details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch competition details'
    });
  }
});

// Get available players for match pairing
router.get('/players/available', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { gender, ageGroup, format } = req.query;

    // Simple query without complex filtering for now
    const players = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      username: users.username,
      gender: users.gender,
      yearOfBirth: users.yearOfBirth
    })
    .from(users)
    .limit(50);

    // Calculate age groups based on birth year  
    const playersWithAge = players.map(player => {
      let ageGroup = null;
      if (player.yearOfBirth && typeof player.yearOfBirth === 'number') {
        const currentYear = new Date().getFullYear();
        const age = currentYear - player.yearOfBirth;
        
        if (age < 19) ageGroup = '18U';
        else if (age < 30) ageGroup = '19-29';
        else if (age < 40) ageGroup = '30-39';
        else if (age < 50) ageGroup = '40-49';
        else if (age < 60) ageGroup = '50-59';
        else if (age < 70) ageGroup = '60-69';
        else ageGroup = '70+';
      }
      
      return {
        ...player,
        ageGroup
      };
    });

    res.json({
      success: true,
      data: playersWithAge
    });
  } catch (error) {
    console.error('Error fetching available players:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available players'
    });
  }
});

// Create a new match
router.post('/matches', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchData = createMatchSchema.parse({
      ...req.body,
      createdBy: req.user!.id
    });

    // Validate that players exist and calculate age groups if needed
    const playerIds = [
      matchData.player1Id,
      matchData.player2Id,
      matchData.team1Player1Id,
      matchData.team1Player2Id,
      matchData.team2Player1Id,
      matchData.team2Player2Id
    ].filter(Boolean);

    for (const playerId of playerIds) {
      if (playerId) {
        await updateUserAgeGroup(playerId);
      }
    }

    const [newMatch] = await db.insert(matches)
      .values(matchData)
      .returning();

    res.json({
      success: true,
      data: newMatch
    });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create match'
    });
  }
});

// Update match scores and determine winner
router.patch('/matches/:id/scores', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const { player1Score, player2Score, team1Score, team2Score, winnerId, winningTeamPlayer1Id, winningTeamPlayer2Id } = req.body;

    const updateData: any = {
      updatedAt: new Date(),
      status: 'completed'
    };

    // Add scores to update data
    if (player1Score !== undefined) updateData.player1Score = player1Score;
    if (player2Score !== undefined) updateData.player2Score = player2Score;
    if (team1Score !== undefined) updateData.team1Score = team1Score;
    if (team2Score !== undefined) updateData.team2Score = team2Score;
    if (winnerId !== undefined) updateData.winnerId = winnerId;
    if (winningTeamPlayer1Id !== undefined) updateData.winningTeamPlayer1Id = winningTeamPlayer1Id;
    if (winningTeamPlayer2Id !== undefined) updateData.winningTeamPlayer2Id = winningTeamPlayer2Id;

    // Update the match
    const [updatedMatch] = await db.update(matches)
      .set(updateData)
      .where(eq(matches.id, matchId))
      .returning();

    if (!updatedMatch) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    // ENHANCED: Automatically calculate and allocate ranking points 
    // Get competition details for point calculation
    const competition = await db.select().from(competitions)
      .where(eq(competitions.id, updatedMatch.competitionId)).limit(1);
    
    if (competition[0]) {
      const competitionData = competition[0];
      const competitionType = competitionData.type || 'casual';
      const rules = POINT_ALLOCATION_RULES[competitionType as keyof typeof POINT_ALLOCATION_RULES];
      
      if (rules) {
        let winnerPoints = rules.winner_base;
        let loserPoints = rules.loser_base;

        // Apply competition multiplier
        const multiplier = parseFloat(competitionData.pointsMultiplier || '1.0');
        winnerPoints = Math.round(winnerPoints * multiplier);
        loserPoints = Math.round(loserPoints * multiplier);

        // Update match with allocated points
        await db.update(matches)
          .set({
            winnerPoints,
            loserPoints,
            pointsAllocatedBy: req.user!.id,
            pointsAllocatedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(matches.id, matchId));

        // Automatically update user ranking points
        const finalWinnerId = winnerId || winningTeamPlayer1Id;
        const finalLoserId = updatedMatch.player1Id === finalWinnerId ? updatedMatch.player2Id : updatedMatch.player1Id;

        if (finalWinnerId) {
          await db.update(users)
            .set({
              rankingPoints: sql`${users.rankingPoints} + ${winnerPoints}`
            })
            .where(eq(users.id, finalWinnerId));
        }

        if (finalLoserId) {
          await db.update(users)
            .set({
              rankingPoints: sql`${users.rankingPoints} + ${loserPoints}`
            })
            .where(eq(users.id, finalLoserId));
        }

        // For doubles matches, update both team members
        if (winningTeamPlayer2Id) {
          await db.update(users)
            .set({
              rankingPoints: sql`${users.rankingPoints} + ${winnerPoints}`
            })
            .where(eq(users.id, winningTeamPlayer2Id));
        }
      }
    }

    res.json({
      success: true,
      data: updatedMatch,
      message: 'Match completed successfully - ranking points automatically updated'
    });

    // Handle singles match
    if (player1Score !== undefined && player2Score !== undefined) {
      updateData.player1Score = player1Score;
      updateData.player2Score = player2Score;
      if (winnerId) updateData.winnerId = winnerId;
    }

    // Handle doubles match
    if (team1Score !== undefined && team2Score !== undefined) {
      updateData.team1Score = team1Score;
      updateData.team2Score = team2Score;
      if (winningTeamPlayer1Id) updateData.winningTeamPlayer1Id = winningTeamPlayer1Id;
      if (winningTeamPlayer2Id) updateData.winningTeamPlayer2Id = winningTeamPlayer2Id;
    }

    const [updatedMatch] = await db.update(matches)
      .set(updateData)
      .where(eq(matches.id, matchId))
      .returning();

    res.json({
      success: true,
      data: updatedMatch
    });
  } catch (error) {
    console.error('Error updating match scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update match scores'
    });
  }
});

// Allocate ranking points for a match
router.post('/matches/:id/allocate-points', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const pointsData = allocatePointsSchema.parse(req.body);

    // Get match details
    const match = await db.select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!match[0]) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    // Update match with allocated points
    const [updatedMatch] = await db.update(matches)
      .set({
        winnerPoints: pointsData.winnerPoints,
        loserPoints: pointsData.loserPoints,
        pointsAllocatedBy: req.user!.id,
        pointsAllocatedAt: new Date(),
        notes: pointsData.notes,
        updatedAt: new Date()
      })
      .where(eq(matches.id, matchId))
      .returning();

    // Update player ranking points in the users table
    const winnerId = match[0].winnerId || match[0].winningTeamPlayer1Id;
    const loserId = match[0].player1Id === winnerId ? match[0].player2Id : match[0].player1Id;

    if (winnerId) {
      await db.update(users)
        .set({
          rankingPoints: sql`${users.rankingPoints} + ${pointsData.winnerPoints}`
        })
        .where(eq(users.id, winnerId));
    }

    if (loserId) {
      await db.update(users)
        .set({
          rankingPoints: sql`${users.rankingPoints} + ${pointsData.loserPoints}`
        })
        .where(eq(users.id, loserId));
    }

    // For doubles matches, update both team members
    if (match[0].winningTeamPlayer2Id) {
      await db.update(users)
        .set({
          rankingPoints: sql`${users.rankingPoints} + ${pointsData.winnerPoints}`
        })
        .where(eq(users.id, match[0].winningTeamPlayer2Id));
    }

    res.json({
      success: true,
      data: updatedMatch,
      message: 'Points allocated successfully'
    });
  } catch (error) {
    console.error('Error allocating points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to allocate points'
    });
  }
});

// Get point allocation suggestions based on competition type
router.get('/matches/:id/point-suggestions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);

    // Get match and competition details
    const matchData = await db.select({
      id: matches.id,
      format: matches.format,
      ageGroup: matches.ageGroup,
      competitionType: competitions.type,
      pointsMultiplier: competitions.pointsMultiplier
    })
    .from(matches)
    .leftJoin(competitions, eq(matches.competitionId, competitions.id))
    .where(eq(matches.id, matchId))
    .limit(1);

    if (!matchData[0]) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    const match = matchData[0];
    const competitionType = match.competitionType || 'casual';
    const rules = POINT_ALLOCATION_RULES[competitionType as keyof typeof POINT_ALLOCATION_RULES];
    
    let winnerPoints = rules.winner_base;
    let loserPoints = rules.loser_base;

    // Apply age group bonus for league matches
    if (competitionType === 'league' && match.ageGroup) {
      const ageBonus = (rules as any).age_group_bonus?.[match.ageGroup] || 1.0;
      winnerPoints = Math.round(winnerPoints * ageBonus);
      loserPoints = Math.round(loserPoints * ageBonus);
    }

    // Apply competition multiplier
    const multiplier = parseFloat(match.pointsMultiplier || '1.0');
    winnerPoints = Math.round(winnerPoints * multiplier);
    loserPoints = Math.round(loserPoints * multiplier);

    res.json({
      success: true,
      data: {
        suggestedWinnerPoints: winnerPoints,
        suggestedLoserPoints: loserPoints,
        competitionType,
        ageGroup: match.ageGroup,
        format: match.format,
        multiplier
      }
    });
  } catch (error) {
    console.error('Error getting point suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get point suggestions'
    });
  }
});

// Get matches with full player details
router.get('/matches', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { competitionId, status, format, limit = 50, offset = 0 } = req.query;

    // Build the query with flattened columns to avoid nested object issues
    let query = db.select({
      id: matches.id,
      competitionId: matches.competitionId,
      matchNumber: matches.matchNumber,
      format: matches.format,
      status: matches.status,
      scheduledTime: matches.scheduledTime,
      player1Score: matches.player1Score,
      player2Score: matches.player2Score,
      team1Score: matches.team1Score,
      team2Score: matches.team2Score,
      venue: matches.venue,
      court: matches.court,
      createdAt: matches.createdAt,
      player1Id: matches.player1Id,
      player2Id: matches.player2Id,
      player1PartnerId: matches.player1PartnerId,
      player2PartnerId: matches.player2PartnerId,
      winnerId: matches.winnerId,
      competitionName: competitions.name,
      competitionType: competitions.type
    })
    .from(matches)
    .leftJoin(competitions, eq(matches.competitionId, competitions.id));

    // Apply filters
    const conditions = [];
    if (competitionId) conditions.push(eq(matches.competitionId, parseInt(competitionId as string)));
    if (status) conditions.push(eq(matches.status, status as any));
    if (format) conditions.push(eq(matches.format, format as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query
      .orderBy(desc(matches.scheduledTime))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches'
    });
  }
});

export default router;