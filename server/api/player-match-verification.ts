// Player match verification API for both singles and doubles matches
import { Router } from 'express';
import { db } from '../db';
import { eq, and, or, inArray } from 'drizzle-orm';
import { users } from '@shared/schema';
import { POINT_ALLOCATION_RULES, calculateAgeGroup } from '@shared/schema/admin-match-management';
import { 
  playerMatches, 
  matchVerifications, 
  pointAllocationAudits,
  createPlayerMatchSchema,
  recordMatchScoreSchema,
  verifyMatchSchema
} from '@shared/schema/match-verification';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Create a new player match (player initiates)
router.post('/matches', requireAuth, async (req, res) => {
  try {
    const matchData = createPlayerMatchSchema.parse({
      ...req.body,
      recordedById: req.user!.id
    });

    // Create the match
    const [newMatch] = await db.insert(playerMatches)
      .values(matchData)
      .returning();

    // Determine who needs to verify (all other players)
    const verificationPlayers = [];
    
    if (matchData.format === 'singles') {
      // For singles: only the opponent needs to verify
      const opponentId = matchData.player1Id === req.user!.id ? matchData.player2Id : matchData.player1Id;
      verificationPlayers.push(opponentId);
    } else if (matchData.format === 'doubles') {
      // For doubles: all 3 other players need to verify
      const allPlayers = [
        matchData.player1Id,
        matchData.player2Id,
        matchData.player1PartnerId!,
        matchData.player2PartnerId!
      ];
      verificationPlayers.push(...allPlayers.filter(id => id !== req.user!.id));
    }

    // Create verification records
    const verifications = verificationPlayers.map(playerId => ({
      matchId: newMatch.id,
      playerId
    }));

    await db.insert(matchVerifications)
      .values(verifications);

    res.json({
      success: true,
      data: {
        ...newMatch,
        pendingVerifications: verificationPlayers.length,
        verificationStatus: 'pending_verification'
      },
      message: 'Match created. Waiting for opponent verification.'
    });
  } catch (error) {
    console.error('Error creating player match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create match'
    });
  }
});

// Record match score (can be done by any participant)
router.patch('/matches/:id/score', requireAuth, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const scoreData = recordMatchScoreSchema.parse(req.body);

    // Verify user is part of this match
    const match = await db.select()
      .from(playerMatches)
      .where(eq(playerMatches.id, matchId))
      .limit(1);

    if (!match[0]) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    const isParticipant = [
      match[0].player1Id,
      match[0].player2Id,
      match[0].player1PartnerId,
      match[0].player2PartnerId
    ].includes(req.user!.id);

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'You can only record scores for matches you participated in'
      });
    }

    // Update match scores
    const [updatedMatch] = await db.update(playerMatches)
      .set({
        ...scoreData,
        updatedAt: new Date()
      })
      .where(eq(playerMatches.id, matchId))
      .returning();

    res.json({
      success: true,
      data: updatedMatch,
      message: 'Match score recorded successfully'
    });
  } catch (error) {
    console.error('Error recording match score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record match score'
    });
  }
});

// Verify/dispute a match
router.patch('/matches/:id/verify', requireAuth, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const verificationData = verifyMatchSchema.parse(req.body);

    // Find the verification record for this user
    const verification = await db.select()
      .from(matchVerifications)
      .where(and(
        eq(matchVerifications.matchId, matchId),
        eq(matchVerifications.playerId, req.user!.id)
      ))
      .limit(1);

    if (!verification[0]) {
      return res.status(404).json({
        success: false,
        error: 'No verification required from you for this match'
      });
    }

    if (verification[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'You have already responded to this match'
      });
    }

    // Update verification status
    await db.update(matchVerifications)
      .set({
        status: verificationData.status,
        disputeReason: verificationData.disputeReason,
        verifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(matchVerifications.id, verification[0].id));

    // Check if all verifications are complete
    const allVerifications = await db.select()
      .from(matchVerifications)
      .where(eq(matchVerifications.matchId, matchId));

    const pendingCount = allVerifications.filter(v => v.status === 'pending').length;
    const disputedCount = allVerifications.filter(v => v.status === 'disputed').length;

    let matchStatus = 'pending_verification';
    let message = 'Verification recorded';

    if (disputedCount > 0) {
      matchStatus = 'disputed';
      message = 'Match is now disputed and requires admin review';
    } else if (pendingCount === 0) {
      matchStatus = 'verified';
      message = 'Match fully verified! Points will be allocated.';
      
      // Auto-allocate points for verified matches
      await allocatePointsForVerifiedMatch(matchId);
    }

    // Update match status
    await db.update(playerMatches)
      .set({
        status: matchStatus as any,
        verifiedAt: matchStatus === 'verified' ? new Date() : undefined,
        updatedAt: new Date()
      })
      .where(eq(playerMatches.id, matchId));

    res.json({
      success: true,
      data: {
        verificationStatus: verificationData.status,
        matchStatus,
        pendingVerifications: pendingCount
      },
      message
    });
  } catch (error) {
    console.error('Error verifying match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify match'
    });
  }
});

// Get matches requiring verification from current user
router.get('/matches/pending-verification', requireAuth, async (req, res) => {
  try {
    const pendingMatches = await db.select({
      matchId: matchVerifications.matchId,
      match: playerMatches,
      recordedBy: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(matchVerifications)
    .innerJoin(playerMatches, eq(matchVerifications.matchId, playerMatches.id))
    .innerJoin(users, eq(playerMatches.recordedById, users.id))
    .where(and(
      eq(matchVerifications.playerId, req.user!.id),
      eq(matchVerifications.status, 'pending')
    ));

    res.json({
      success: true,
      data: pendingMatches
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending verifications'
    });
  }
});

// Get user's match history with verification status
router.get('/matches/history', requireAuth, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    // Build query for matches where user participated
    let query = db.select()
      .from(playerMatches)
      .where(or(
        eq(playerMatches.player1Id, req.user!.id),
        eq(playerMatches.player2Id, req.user!.id),
        eq(playerMatches.player1PartnerId, req.user!.id),
        eq(playerMatches.player2PartnerId, req.user!.id)
      ));

    if (status) {
      query = query.where(eq(playerMatches.status, status as string));
    }

    const matches = await query
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .orderBy(desc(playerMatches.createdAt));

    // Get verification details for each match
    const matchesWithVerifications = await Promise.all(
      matches.map(async (match) => {
        const verifications = await db.select()
          .from(matchVerifications)
          .where(eq(matchVerifications.matchId, match.id));

        const pendingCount = verifications.filter(v => v.status === 'pending').length;
        
        return {
          ...match,
          verifications,
          pendingVerifications: pendingCount,
          allVerified: pendingCount === 0 && verifications.length > 0
        };
      })
    );

    res.json({
      success: true,
      data: matchesWithVerifications
    });
  } catch (error) {
    console.error('Error fetching match history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch match history'
    });
  }
});

// Auto-allocate points for verified matches
async function allocatePointsForVerifiedMatch(matchId: number) {
  try {
    const matchData = await db.select()
      .from(playerMatches)
      .where(eq(playerMatches.id, matchId))
      .limit(1);

    if (!matchData[0] || matchData[0].pointsAllocated) {
      return; // Already processed or not found
    }

    const match = matchData[0];

    // Get player details for age/gender-based points
    const playerIds = [match.player1Id, match.player2Id];
    if (match.player1PartnerId) playerIds.push(match.player1PartnerId);
    if (match.player2PartnerId) playerIds.push(match.player2PartnerId);

    const players = await db.select()
      .from(users)
      .where(inArray(users.id, playerIds));

    // Determine competition type (casual by default for player matches)
    const competitionType = 'casual';
    const rules = POINT_ALLOCATION_RULES[competitionType];

    // Smart gender-aware point allocation
    let winnerPoints = rules.winner_base;
    let loserPoints = rules.loser_base;

    if (match.format === 'singles') {
      // Singles: Use gender-specific points
      const winner = players.find(p => p.id === match.winnerId);
      if (winner?.gender === 'female') {
        winnerPoints = POINT_ALLOCATION_RULES.casual.winner_base; // Same for now, can customize
      }
    } else if (match.format === 'doubles') {
      // Doubles: Check team gender composition
      const team1 = players.filter(p => [match.player1Id, match.player1PartnerId].includes(p.id));
      const team2 = players.filter(p => [match.player2Id, match.player2PartnerId].includes(p.id));
      
      // This would need more sophisticated gender-aware logic
      // For now, use standard doubles points
    }

    // Update match with allocated points
    await db.update(playerMatches)
      .set({
        winnerPoints,
        loserPoints,
        pointsAllocated: true,
        updatedAt: new Date()
      })
      .where(eq(playerMatches.id, matchId));

    // Create audit trail
    await db.insert(pointAllocationAudits)
      .values({
        matchId,
        matchType: 'player',
        originalWinnerPoints: winnerPoints,
        originalLoserPoints: loserPoints,
        finalWinnerPoints: winnerPoints,
        finalLoserPoints: loserPoints,
        calculationMethod: 'automatic',
        competitionType
      });

    // Update player ranking points
    if (match.winnerId) {
      await db.update(users)
        .set({
          rankingPoints: sql`${users.rankingPoints} + ${winnerPoints}`
        })
        .where(eq(users.id, match.winnerId));
    }

    // Update loser points (subtract from their total or add lesser amount)
    const loserId = match.player1Id === match.winnerId ? match.player2Id : match.player1Id;
    if (loserId) {
      await db.update(users)
        .set({
          rankingPoints: sql`${users.rankingPoints} + ${loserPoints}`
        })
        .where(eq(users.id, loserId));
    }

    // For doubles, update all team members
    if (match.format === 'doubles') {
      const winningTeam = [match.winningTeamPlayer1Id, match.winningTeamPlayer2Id].filter(id => id);
      const losingTeam = playerIds.filter(id => !winningTeam.includes(id));

      // Update winning team members
      for (const playerId of winningTeam) {
        await db.update(users)
          .set({
            rankingPoints: sql`${users.rankingPoints} + ${winnerPoints}`
          })
          .where(eq(users.id, playerId));
      }

      // Update losing team members  
      for (const playerId of losingTeam) {
        await db.update(users)
          .set({
            rankingPoints: sql`${users.rankingPoints} + ${loserPoints}`
          })
          .where(eq(users.id, playerId));
      }
    }

  } catch (error) {
    console.error('Error auto-allocating points:', error);
  }
}

export { router as playerMatchVerificationRouter };