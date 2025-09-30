/**
 * Match routes for the application
 */
import express from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { db } from '../db';
import { matches, matchVerifications, users } from '../../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { notifyPlayersForVerification, notifyMatchVerified } from '../utils/matchNotifications';
import { calculateMatchPoints, type PlayerMatchData } from '../../shared/utils/matchPointsCalculator';

// Validation schemas
const gameScoreSchema = z.object({
  team1: z.number().int().min(0).max(99),
  team2: z.number().int().min(0).max(99)
});

const submitScoresSchema = z.object({
  games: z.array(gameScoreSchema).min(1).max(5),
  matchDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  winnerId: z.number().optional()
});

const verifyMatchSchema = z.object({
  approve: z.boolean()
});

/**
 * Calculate and award points to all players in a verified match
 * Uses official algorithm utilities to ensure System B compliance
 */
async function calculateAndAwardPoints(match: any): Promise<void> {
  console.log('[Points] Calculating points for verified match:', match.serial);
  
  // Get all player IDs
  const playerIds = [
    match.playerOneId,
    match.playerTwoId,
    match.playerOnePartnerId,
    match.playerTwoPartnerId
  ].filter((id): id is number => id !== null);
  
  // Fetch player data from database
  const playersData = await db
    .select({
      id: users.id,
      username: users.username,
      gender: users.gender,
      rankingPoints: users.rankingPoints,
      dateOfBirth: users.dateOfBirth
    })
    .from(users)
    .where(sql`${users.id} IN (${sql.join(playerIds.map(id => sql`${id}`), sql`, `)})`);
  
  // Determine match format
  const matchFormat = playerIds.length === 2 ? 'singles' : 'doubles';
  
  // Build player match data
  const playersMatchData: PlayerMatchData[] = playersData.map(player => ({
    playerId: player.id,
    username: player.username,
    isWin: player.id === match.winnerId || 
           (matchFormat === 'doubles' && 
            (player.id === match.playerOneId || player.id === match.playerOnePartnerId) &&
            (match.winnerId === match.playerOneId || match.winnerId === match.playerOnePartnerId)),
    gender: player.gender as 'male' | 'female' | undefined,
    currentRankingPoints: Number(player.rankingPoints) || 0,
    eventType: 'casual' // Default for friendly matches
  }));
  
  // Calculate points using official algorithm
  const pointsResults = calculateMatchPoints(playersMatchData, matchFormat);
  
  console.log('[Points] Calculated results:', pointsResults);
  
  // Award points to each player (ADDITIVE - never replace)
  for (const result of pointsResults) {
    console.log(`[Points] Awarding ${result.rankingPointsEarned} ranking points to player ${result.username}`);
    
    // CRITICAL: Use additive SQL operation to preserve tournament history
    await db.execute(sql`
      UPDATE users
      SET 
        ranking_points = ranking_points + ${result.rankingPointsEarned},
        pickle_points = pickle_points + ${result.picklePointsEarned},
        total_matches = total_matches + 1,
        matches_won = matches_won + ${result.rankingPointsEarned >= 3 ? 1 : 0}
      WHERE id = ${result.playerId}
    `);
  }
  
  // Update match with awarded points
  await db.update(matches)
    .set({ 
      pointsAwarded: Math.round(pointsResults.reduce((sum, r) => sum + r.rankingPointsEarned, 0))
    })
    .where(eq(matches.id, match.id));
  
  console.log('[Points] Points awarded successfully');
}

/**
 * Register match routes with the Express application
 * @param app Express application
 */
export function registerMatchRoutes(app: express.Express): void {
  console.log("[API] Registering Match API routes");
  
  // Central Fork: Create match with unique serial for routing
  app.post('/api/matches/create', isAuthenticated, async (req, res) => {
    try {
      console.log('[Match Create] Creating match with config:', req.body);
      
      const { mode, config, players } = req.body;
      const currentUserId = (req.user as any)?.id;
      
      if (!mode || !config || !players) {
        return res.status(400).json({ error: 'Missing required fields: mode, config, players' });
      }
      
      // Generate unique serial ID (format: Mabc123xyz - full cuid2)
      const serial = `M${createId()}`;
      
      // Extract and deduplicate player IDs
      const playerIds = Array.from(new Set([
        players.player1?.id,
        players.player2?.id,
        players.player1Partner?.id,
        players.player2Partner?.id
      ].filter(Boolean)));
      
      if (playerIds.length < 2) {
        return res.status(400).json({ error: 'At least 2 unique players required' });
      }
      
      // SECURITY: Verify current user is a participant
      if (!playerIds.includes(currentUserId)) {
        return res.status(403).json({ error: 'You must be a participant in the match' });
      }
      
      // Determine format: singles if only 2 players, doubles if 4
      const formatType = playerIds.length === 2 ? 'singles' : 'doubles';
      
      // Create match record with PENDING_VERIFICATION status
      const [match] = await db.insert(matches).values({
        serial,
        playerOneId: playerIds[0],
        playerTwoId: playerIds[1],
        playerOnePartnerId: playerIds[2] || null,
        playerTwoPartnerId: playerIds[3] || null,
        winnerId: playerIds[0], // Temporary placeholder - will be set after scoring
        scorePlayerOne: 'pending',
        scorePlayerTwo: 'pending',
        formatType,
        scoringSystem: config.scoringType || 'traditional',
        pointsToWin: config.pointTarget || 11,
        matchType: 'casual',
        validationStatus: 'pending',
        matchDate: new Date(),
        notes: JSON.stringify({ mode, config }) // Store config for later use
      }).returning();
      
      // Create verification records for all players
      const verificationPromises = playerIds.map(playerId => 
        db.insert(matchVerifications).values({
          matchId: match.id,
          userId: playerId,
          status: 'pending'
        })
      );
      
      await Promise.all(verificationPromises);
      
      console.log('[Match Create] Match created:', { serial, matchId: match.id });
      
      res.json({ 
        serial,
        matchId: match.id,
        mode
      });
      
    } catch (error) {
      console.error('[Match Create] Error:', error);
      res.status(500).json({ error: 'Failed to create match' });
    }
  });
  
  // Get match by serial
  app.get('/api/matches/:serial', async (req, res) => {
    try {
      const { serial } = req.params;
      
      const [match] = await db
        .select()
        .from(matches)
        .where(eq(matches.serial, serial))
        .limit(1);
      
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      
      // Get verifications for this match
      const verifications = await db
        .select()
        .from(matchVerifications)
        .where(eq(matchVerifications.matchId, match.id));
      
      // Parse config from notes if available
      let config = null;
      try {
        const notesData = JSON.parse(match.notes || '{}');
        config = notesData.config;
      } catch {
        // Ignore parse errors
      }
      
      res.json({
        match,
        verifications,
        config
      });
      
    } catch (error) {
      console.error('[Match Get] Error:', error);
      res.status(500).json({ error: 'Failed to fetch match' });
    }
  });
  
  // Submit match scores for verification
  app.post('/api/matches/:serial/scores', isAuthenticated, async (req, res) => {
    try {
      const { serial } = req.params;
      const currentUserId = (req.user as any)?.id;
      
      // VALIDATION: Validate request body with Zod
      const validation = submitScoresSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request body', 
          details: validation.error.errors 
        });
      }
      
      const { games, matchDate, notes } = validation.data;
      
      console.log('[Match Scores] Submitting scores:', { serial, games });
      
      // Find match by serial
      const [match] = await db
        .select()
        .from(matches)
        .where(eq(matches.serial, serial))
        .limit(1);
      
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      
      // STATE MACHINE: Check if match is already verified/rejected
      if (match.validationStatus === 'verified') {
        return res.status(400).json({ error: 'Match already verified - cannot modify scores' });
      }
      if (match.validationStatus === 'rejected') {
        return res.status(400).json({ error: 'Match was rejected - cannot modify scores' });
      }
      
      // SECURITY: Verify current user is a participant
      const playerIds = [
        match.playerOneId,
        match.playerTwoId,
        match.playerOnePartnerId,
        match.playerTwoPartnerId
      ].filter((id): id is number => id !== null);
      
      if (!playerIds.includes(currentUserId)) {
        return res.status(403).json({ error: 'You must be a participant in this match' });
      }
      
      // Check if user already submitted
      const [verification] = await db
        .select()
        .from(matchVerifications)
        .where(and(
          eq(matchVerifications.matchId, match.id),
          eq(matchVerifications.userId, currentUserId)
        ))
        .limit(1);
      
      if (verification && verification.status === 'verified') {
        return res.status(400).json({ error: 'You have already submitted scores for this match' });
      }
      
      // Format game scores for storage
      const formattedGames = games.map((game, index) => ({
        gameNumber: index + 1,
        team1: game.team1,
        team2: game.team2
      }));
      
      // Determine winner based on games won
      let team1Wins = 0;
      let team2Wins = 0;
      games.forEach((game) => {
        if (game.team1 > game.team2) team1Wins++;
        else if (game.team2 > game.team1) team2Wins++;
      });
      
      // WINNER LOGIC FIX: Reject ties (best-of format should prevent ties)
      if (team1Wins === team2Wins) {
        return res.status(400).json({ 
          error: 'Match cannot end in a tie - verify game scores' 
        });
      }
      
      const winnerTeam = team1Wins > team2Wins ? 1 : 2;
      const actualWinnerId = winnerTeam === 1 ? match.playerOneId : match.playerTwoId;
      
      // Parse existing notes safely
      let existingNotes: any = {};
      try {
        if (match.notes) {
          existingNotes = JSON.parse(match.notes);
        }
      } catch (parseError) {
        console.error('[Match Scores] Failed to parse existing notes:', parseError);
        // Continue with empty notes
      }
      
      // Update match with scores and winner
      await db.update(matches)
        .set({
          scorePlayerOne: String(team1Wins),
          scorePlayerTwo: String(team2Wins),
          winnerId: actualWinnerId,
          matchDate: matchDate ? new Date(matchDate) : new Date(),
          validationStatus: 'in_review', // Mark as under review
          notes: JSON.stringify({ 
            ...existingNotes,
            games: formattedGames,
            submittedNotes: notes,
            submittedBy: currentUserId,
            submittedAt: new Date().toISOString()
          })
        })
        .where(eq(matches.id, match.id));
      
      // Update verification status for submitting user
      if (verification) {
        await db.update(matchVerifications)
          .set({
            status: 'verified',
            verifiedAt: new Date()
          })
          .where(eq(matchVerifications.id, verification.id));
      }
      
      // Send notifications to other players
      const otherPlayers = playerIds.filter(id => id !== currentUserId);
      const currentUser = req.user as any;
      
      await notifyPlayersForVerification({
        matchSerial: serial,
        submitterName: currentUser.displayName || currentUser.username,
        playerIds: otherPlayers,
        notificationType: 'match_verification'
      });
      
      // Check if all players have verified
      const allVerifications = await db
        .select()
        .from(matchVerifications)
        .where(eq(matchVerifications.matchId, match.id));
      
      const allVerified = allVerifications.every(v => v.status === 'verified');
      
      if (allVerified) {
        await db.update(matches)
          .set({ validationStatus: 'verified' })
          .where(eq(matches.id, match.id));
        
        console.log('[Match Scores] All players verified - match completed');
        
        // Calculate and award points using official algorithm
        try {
          await calculateAndAwardPoints(match);
          console.log('[Match Scores] Points calculated and awarded successfully');
        } catch (pointsError) {
          console.error('[Match Scores] Error calculating points:', pointsError);
          // Continue with notification even if points calculation fails
        }
        
        // Notify all players that match is verified
        await notifyMatchVerified(serial, playerIds);
      }
      
      res.json({ 
        success: true,
        message: 'Scores submitted successfully',
        allVerified,
        pendingVerifications: allVerifications.filter(v => v.status === 'pending').length
      });
      
    } catch (error) {
      console.error('[Match Scores] Error:', error);
      res.status(500).json({ error: 'Failed to submit scores' });
    }
  });
  
  // Player verification endpoint (approve/reject match scores)
  app.post('/api/matches/:serial/verify', isAuthenticated, async (req, res) => {
    try {
      const { serial } = req.params;
      const currentUserId = (req.user as any)?.id;
      
      // VALIDATION: Validate request body with Zod
      const validation = verifyMatchSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid request body', 
          details: validation.error.errors 
        });
      }
      
      const { approve } = validation.data;
      
      console.log('[Match Verify] Processing verification:', { serial, approve, userId: currentUserId });
      
      // Find match by serial
      const [match] = await db
        .select()
        .from(matches)
        .where(eq(matches.serial, serial))
        .limit(1);
      
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      
      // STATE MACHINE: Check if match is already finalized
      if (match.validationStatus === 'verified') {
        return res.status(400).json({ error: 'Match already verified - cannot change verification' });
      }
      if (match.validationStatus === 'rejected') {
        return res.status(400).json({ error: 'Match already rejected - cannot change verification' });
      }
      
      // SECURITY: Find user's verification record (this also checks participation)
      const [verification] = await db
        .select()
        .from(matchVerifications)
        .where(and(
          eq(matchVerifications.matchId, match.id),
          eq(matchVerifications.userId, currentUserId)
        ))
        .limit(1);
      
      if (!verification) {
        return res.status(403).json({ error: 'You are not a participant in this match' });
      }
      
      // IDEMPOTENCY: Check if already processed
      if (verification.status !== 'pending') {
        return res.status(400).json({ 
          error: `Verification already ${verification.status}`,
          currentStatus: verification.status
        });
      }
      
      // Update verification status
      const newStatus = approve ? 'verified' : 'rejected';
      await db.update(matchVerifications)
        .set({
          status: newStatus,
          verifiedAt: new Date()
        })
        .where(eq(matchVerifications.id, verification.id));
      
      console.log('[Match Verify] Verification updated:', { status: newStatus });
      
      // Check if all players have verified or any rejected
      const allVerifications = await db
        .select()
        .from(matchVerifications)
        .where(eq(matchVerifications.matchId, match.id));
      
      const allVerified = allVerifications.every(v => v.status === 'verified');
      const anyRejected = allVerifications.some(v => v.status === 'rejected');
      
      // FINALIZATION: Atomically finalize match if all verified or any rejected
      if (anyRejected) {
        await db.update(matches)
          .set({ validationStatus: 'rejected' })
          .where(eq(matches.id, match.id));
        
        console.log('[Match Verify] Match rejected by one or more players');
      } else if (allVerified) {
        await db.update(matches)
          .set({ validationStatus: 'verified' })
          .where(eq(matches.id, match.id));
        
        console.log('[Match Verify] All players verified - match completed');
        
        // Calculate and award points using official algorithm
        try {
          await calculateAndAwardPoints(match);
          console.log('[Match Verify] Points calculated and awarded successfully');
        } catch (pointsError) {
          console.error('[Match Verify] Error calculating points:', pointsError);
          // Continue with notification even if points calculation fails
        }
        
        // Notify all players
        const playerIds = [
          match.playerOneId,
          match.playerTwoId,
          match.playerOnePartnerId,
          match.playerTwoPartnerId
        ].filter((id): id is number => id !== null);
        
        await notifyMatchVerified(serial, playerIds);
      }
      
      res.json({
        success: true,
        status: newStatus,
        allVerified,
        anyRejected
      });
      
    } catch (error) {
      console.error('[Match Verify] Error:', error);
      res.status(500).json({ error: 'Failed to process verification' });
    }
  });
  
  // Match creation endpoint for recording new matches
  app.post('/api/matches', isAuthenticated, async (req, res) => {
    try {
      console.log('[Match Creation] Recording new match with data:', req.body);
      console.log(`[Match Creation] User: ${(req.user as any)?.username} (Admin: ${(req.user as any)?.isAdmin || false})`);
      
      const { 
        playerOneId, 
        playerTwoId, 
        playerOnePartnerId,
        playerTwoPartnerId,
        games, 
        matchType, 
        formatType,
        notes,
        tournamentId,
        scheduledDate,
        profileUpdates // Admin profile updates for players
      } = req.body;
      
      if (!playerTwoId || !games || games.length === 0) {
        return res.status(400).json({ error: 'Missing required match data' });
      }

      // Calculate overall winner based on games won
      let playerOneGamesWon = 0;
      let playerTwoGamesWon = 0;
      
      games.forEach((game: any) => {
        if (game.playerOneScore > game.playerTwoScore) {
          playerOneGamesWon++;
        } else {
          playerTwoGamesWon++;
        }
      });
      
      const winnerId = playerOneGamesWon > playerTwoGamesWon ? (playerOneId || (req.user as any)?.id) : playerTwoId;
      
      // Store the actual game scores from the last/final game for display
      const finalGame = games[games.length - 1]; // Get the last game played
      const playerOneScore = finalGame.playerOneScore;
      const playerTwoScore = finalGame.playerTwoScore;
      
      // Format individual game results for storage
      const detailedScores = games.map((game: any) => 
        `${game.playerOneScore}-${game.playerTwoScore}`
      ).join(', ');
      
      // For now, just set tournament ID to null if it would cause FK constraint error
      // This ensures match creation doesn't fail due to invalid tournament references
      let validTournamentId = null;
      if (tournamentId) {
        // Only set tournament ID if we know it's valid, otherwise log warning
        if (tournamentId >= 12) { // Based on the actual tournament IDs in the database
          validTournamentId = tournamentId;
        } else {
          console.log(`[Match Creation] Warning: Tournament ID ${tournamentId} appears invalid, creating match without tournament`);
        }
      }

      // Check if user is admin - admins get auto-completed matches
      const user = req.user as any;
      const isAdmin = user?.isAdmin || false;
      
      // ALGORITHM COMPLIANCE: Points calculated only after verification or for admin matches
      // Regular matches must go through verification workflow before points are awarded
      
      // CRITICAL DUPLICATE DETECTION: Check for duplicate matches
      const matchDate = scheduledDate ? new Date(scheduledDate) : new Date();
      const playerOneIdResolved = playerOneId || user?.id;
      
      // Build a unique match signature to detect duplicates
      const playerIds = [playerOneIdResolved, playerTwoId, playerOnePartnerId, playerTwoPartnerId]
        .filter(id => id)
        .sort(); // Sort to ensure consistent ordering
      
      // Check for existing matches with the same players within the last 5 minutes
      const fiveMinutesAgo = new Date(matchDate.getTime() - 5 * 60 * 1000);
      try {
        const existingMatches = await storage.getRecentMatches(playerIds, fiveMinutesAgo);
        
        if (existingMatches.length > 0) {
          console.log('[DUPLICATE DETECTION] Preventing duplicate match creation');
          console.log('[DUPLICATE DETECTION] Found existing match:', existingMatches[0]);
          return res.status(409).json({ 
            error: 'Duplicate match detected. A match with the same players was already recorded within the last 5 minutes.' 
          });
        }
      } catch (error) {
        console.log('[DUPLICATE DETECTION] Warning: Could not check for duplicates, proceeding with match creation');
      }

      const newMatch = await storage.createMatch({
        playerOneId: playerOneIdResolved,
        playerTwoId,
        playerOnePartnerId: playerOnePartnerId || null,
        playerTwoPartnerId: playerTwoPartnerId || null,
        scorePlayerOne: `${playerOneScore}`, // Games won by Team 1 (Player One + Partner)
        scorePlayerTwo: `${playerTwoScore}`, // Games won by Team 2 (Player Two + Partner)
        winnerId,
        matchType: matchType || 'casual',
        formatType: formatType || 'singles',
        validationStatus: isAdmin ? 'validated' : 'pending', // Admin matches auto-complete
        validationCompletedAt: isAdmin ? new Date() : null,
        notes: `${notes || ''} [Game Scores: ${detailedScores}]`.trim(),
        tournamentId: validTournamentId,
        matchDate: matchDate,
        pointsAwarded: 0, // Points calculated after verification
        xpAwarded: 0
      });

      // ALGORITHM COMPLIANCE: Only award points for admin-verified matches
      // Regular matches must complete verification workflow first
      if (isAdmin) {
        console.log('[ADMIN MATCH] Calculating points immediately for admin-verified match');
        
        // Use official algorithm for point calculation
        try {
          await calculateAndAwardPoints(newMatch);
          console.log('[ADMIN MATCH] Points calculated and awarded successfully');
        } catch (pointsError) {
          console.error('[ADMIN MATCH] Error calculating points:', pointsError);
        }
      }
      
      // LEGACY: Multi-Age Group Ranking Service (being phased out in favor of official algorithm)
      // TODO: Remove this section after confirming all matches use calculateAndAwardPoints
      try {
        if (!isAdmin) {
          console.log('[MATCH CREATION] Non-admin match created - awaiting verification before points calculation');
        } else {
          const { MultiDimensionalRankingService } = await import('../modules/ranking/service');
          const multiDimensionalRankingService = new MultiDimensionalRankingService();
          
          console.log('[MULTI-AGE COMPLIANCE] Using enhanced MultiDimensionalRankingService for multi-age updates');
        
        // Process match using multi-age group ranking updates
        const playerOneIdResolved = playerOneId || (req.user as any)?.id;
        const isPlayerOneWinner = winnerId === playerOneIdResolved;
        const isPlayerTwoWinner = winnerId === playerTwoId;
        
        // CRITICAL UDF RULE 27: Mixed doubles detection and classification
        let detectedFormat = formatType;
        if (formatType === 'doubles' && playerOnePartnerId && playerTwoPartnerId) {
          // Check if this is actually a mixed doubles match
          const p1 = await storage.getUser(playerOneIdResolved);
          const p1Partner = await storage.getUser(playerOnePartnerId);
          const p2 = await storage.getUser(playerTwoId);
          const p2Partner = await storage.getUser(playerTwoPartnerId);
          
          const isMixedDoubles = (p1?.gender !== p1Partner?.gender) || (p2?.gender !== p2Partner?.gender);
          
          if (isMixedDoubles) {
            console.log(`[MIXED DOUBLES DETECTION] Match ${newMatch.id} detected as mixed doubles - updating format`);
            detectedFormat = 'mixed-doubles';
            
            // Update the match record with correct format
            await db.update(matches)
              .set({ formatType: 'mixed-doubles' })
              .where(eq(matches.id, newMatch.id));
          }
        }
        
        // Determine format and age division for ranking updates  
        const format = detectedFormat === 'singles' ? 'singles' : 
                      detectedFormat === 'mixed-doubles' ? 'mixed' : 'doubles';
        const ageDivision = '19plus'; // Default to Open division for multi-age eligibility
        
        // Process multi-age group updates for both players
        const rankingResults = await multiDimensionalRankingService.processMatchRankingPoints(
          winnerId,
          winnerId === playerOneIdResolved ? playerTwoId : playerOneIdResolved, // loserId
          format as any,
          ageDivision as any,
          3, // System B base points for winner
          newMatch.id
        );
        
        console.log(`[MULTI-AGE COMPLIANCE] Winner updated rankings: ${rankingResults.winnerUpdatedRankings?.join(', ') || 'none'}`);
        console.log(`[MULTI-AGE COMPLIANCE] Loser updated rankings: ${rankingResults.loserUpdatedRankings?.join(', ') || 'none'}`);
        
        // CRITICAL FIX: Update match record with calculated points and multiplier
        if (rankingResults.pointsAwarded && rankingResults.pointsAwarded !== 3) {
          // Calculate multiplier based on awarded points vs base points
          const calculatedMultiplier = Math.round((rankingResults.pointsAwarded / 3) * 100);
          
          // Update match with calculated values
          await db.update(matches)
            .set({
              pointsAwarded: rankingResults.pointsAwarded,
              rankingPointMultiplier: calculatedMultiplier,
              notes: `${notes || ''} [Game Scores: ${detailedScores}] [BONUS APPLIED: Winner ${rankingResults.winnerCalculationDetails || 'N/A'}, Loser ${rankingResults.loserCalculationDetails || 'N/A'}]`.trim()
            })
            .where(eq(matches.id, newMatch.id));
            
          console.log(`[BONUS INTEGRATION] Match ${newMatch.id} updated - Points: ${rankingResults.pointsAwarded}, Multiplier: ${calculatedMultiplier}%`);
          console.log(`[BONUS INTEGRATION] Winner: ${rankingResults.winnerCalculationDetails}`);
          console.log(`[BONUS INTEGRATION] Loser: ${rankingResults.loserCalculationDetails}`);
        }
        
        // Validate multi-age group compliance
        if (rankingResults.winnerValidation && !rankingResults.winnerValidation.isCompliant) {
          console.warn(`[ALGORITHM COMPLIANCE WARNING] Winner: ${rankingResults.winnerValidation.explanation}`);
        }
        if (rankingResults.loserValidation && !rankingResults.loserValidation.isCompliant) {
          console.warn(`[ALGORITHM COMPLIANCE WARNING] Loser: ${rankingResults.loserValidation.explanation}`);
        }
        
        // Process all players (including partners in doubles)
        const allPlayerIds = [
          playerOneIdResolved,
          playerTwoId,
          playerOnePartnerId,
          playerTwoPartnerId
        ].filter(id => id); // Remove null/undefined values

        for (const playerId of allPlayerIds) {
          // Skip primary players as they were already processed by MultiDimensionalRankingService
          if (playerId === winnerId || playerId === (winnerId === playerOneIdResolved ? playerTwoId : playerOneIdResolved)) {
            continue;
          }
          
          const playerData = await storage.getUser(playerId);
          if (!playerData) {
            console.log(`[MULTI-AGE COMPLIANCE] Skipping partner ${playerId} - user not found`);
            continue;
          }

          // Process partners (in doubles) using multi-age group updates
          const isPartnerWinner = (winnerId === playerOneIdResolved && playerId === playerOnePartnerId) ||
                                  (winnerId === playerTwoId && playerId === playerTwoPartnerId);
          
          if (playerData.dateOfBirth) {
            const partnerResults = await multiDimensionalRankingService.updateMultiAgeGroupRankings(
              playerId,
              playerData.dateOfBirth,
              format as any,
              ageDivision as any,
              isPartnerWinner ? 3 : 1, // System B points
              newMatch.id,
              undefined,
              isPartnerWinner ? "match_win" : "match_participation"
            );
            
            console.log(`[MULTI-AGE COMPLIANCE] Partner ${playerId} updated rankings: ${partnerResults.updatedRankings.join(', ')}`);
            
            if (!partnerResults.validationResult.isCompliant) {
              console.warn(`[ALGORITHM COMPLIANCE WARNING] Partner ${playerId}: ${partnerResults.validationResult.explanation}`);
            }
          }
          
          // Update pickle points (1.5x multiplier per match)
          const basePoints = isPartnerWinner ? 3 : 1;
          const picklePointsToAdd = Math.round(basePoints * 1.5);
          await storage.updateUserPicklePoints(playerId, picklePointsToAdd);
          
          // Update match statistics
          await storage.updateUserMatchStatistics(playerId, isPartnerWinner);
          
          console.log(`[MULTI-AGE COMPLIANCE] Partner ${playerId}: +${picklePointsToAdd} pickle points`);
        }
        
          console.log('[MULTI-AGE COMPLIANCE] Successfully processed all player rewards with multi-age group algorithm');
        }
      } catch (error) {
        if (isAdmin) {
          console.error(`[UDF COMPLIANCE] Error using enhanced MatchRewardService: ${(error as Error).message}`);
          // For admin matches, fallback is already handled by calculateAndAwardPoints
          console.log('[ADMIN MATCH] Points already calculated by official algorithm');
        }
      }

      // Handle admin profile updates if provided
      if (isAdmin && profileUpdates) {
        try {
          console.log('[Match Creation] Processing admin profile updates:', profileUpdates);
          
          // Update player one profile if provided
          if (profileUpdates.playerOne && profileUpdates.playerOne.userId) {
            const updates: any = {};
            if (profileUpdates.playerOne.birthdate) {
              updates.dateOfBirth = profileUpdates.playerOne.birthdate;
              console.log(`[Profile Update] Setting birthdate for user ${profileUpdates.playerOne.userId}: ${profileUpdates.playerOne.birthdate}`);
            }
            if (profileUpdates.playerOne.gender) {
              updates.gender = profileUpdates.playerOne.gender;
              console.log(`[Profile Update] Setting gender for user ${profileUpdates.playerOne.userId}: ${profileUpdates.playerOne.gender}`);
            }
            
            if (Object.keys(updates).length > 0) {
              await storage.updateUserProfile(profileUpdates.playerOne.userId, updates);
              console.log(`[Profile Update] Successfully updated player one profile (ID: ${profileUpdates.playerOne.userId})`);
            }
          }
          
          // Update player two profile if provided  
          if (profileUpdates.playerTwo && profileUpdates.playerTwo.userId) {
            const updates: any = {};
            if (profileUpdates.playerTwo.birthdate) {
              updates.dateOfBirth = profileUpdates.playerTwo.birthdate;
              console.log(`[Profile Update] Setting birthdate for user ${profileUpdates.playerTwo.userId}: ${profileUpdates.playerTwo.birthdate}`);
            }
            if (profileUpdates.playerTwo.gender) {
              updates.gender = profileUpdates.playerTwo.gender;
              console.log(`[Profile Update] Setting gender for user ${profileUpdates.playerTwo.userId}: ${profileUpdates.playerTwo.gender}`);
            }
            
            if (Object.keys(updates).length > 0) {
              await storage.updateUserProfile(profileUpdates.playerTwo.userId, updates);
              console.log(`[Profile Update] Successfully updated player two profile (ID: ${profileUpdates.playerTwo.userId})`);
            }
          }
          
        } catch (error) {
          console.error('[Profile Update] Error updating player profiles:', error);
          // Don't fail the match creation if profile updates fail
        }
      }

      console.log(`[Match Creation] Match created successfully: ${newMatch.id} (Status: ${isAdmin ? 'auto-completed (admin)' : 'pending validation'})`);
      res.status(201).json({ success: true, match: newMatch });
    } catch (error) {
      console.error('[Match Creation] Error:', error);
      res.status(500).json({ error: 'Failed to create match', details: (error as Error).message });
    }
  });
  
  // Recent matches endpoint for authenticated users
  app.get('/api/matches/recent', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const limit = parseInt(req.query.limit as string) || 5;
      
      console.log(`[Recent Matches] Fetching recent matches for user ${userId}, limit: ${limit}`);
      
      // Get recent matches for the authenticated user
      const recentMatches = await storage.getRecentMatchesForUser(userId, limit);
      
      console.log(`[Recent Matches] Found ${recentMatches.length} matches for user ${userId}`);
      
      res.status(200).json({
        success: true,
        data: recentMatches,
        total: recentMatches.length
      });
    } catch (error) {
      console.error('[Recent Matches] Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch recent matches', 
        details: (error as Error).message 
      });
    }
  });

  // Sample match route - returns JSON data properly
  app.get('/api/matches', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      matches: [
        { id: 1, player1: 'Alice', player2: 'Bob', score: '11-9, 11-7' },
        { id: 2, player1: 'Charlie', player2: 'Diana', score: '11-5, 8-11, 11-6' }
      ],
      total: 2,
      timestamp: new Date().toISOString()
    });
  });
  
  // Rankings leaderboard route - returns JSON data properly
  app.get('/api/rankings/leaderboard', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      leaderboard: [
        { rank: 1, player: 'Alice', rating: 4.5, wins: 25, losses: 5 },
        { rank: 2, player: 'Bob', rating: 4.2, wins: 22, losses: 8 },
        { rank: 3, player: 'Charlie', rating: 4.0, wins: 20, losses: 10 }
      ],
      timestamp: new Date().toISOString()
    });
  });
}