/**
 * PKL-278651-TOURN-0003.1-API
 * Match Result Routes
 * 
 * This file contains API routes for recording and managing match results.
 * Following Framework 5.0 principles for reliability and clean interfaces.
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  tournamentBracketMatches,
  tournamentTeams,
} from '../../shared/schema/tournament-brackets';
import { eq, and } from 'drizzle-orm';
import { recordMatchResult } from '../services/bracket-generator';

const router = Router();

/**
 * Validate token middleware
 * This middleware is used to validate the CSRF token for all match result routes
 */
const validateToken = (req: any, res: any, next: any) => {
  const csrfToken = req.headers['x-csrf-token'];
  
  if (!csrfToken) {
    console.error('[API][Match][PKL-278651-TOURN-0003.1-API] CSRF token missing');
    return res.status(403).json({ 
      code: 'CSRF_TOKEN_MISSING',
      message: 'CSRF token missing' 
    });
  }
  
  // Validate the CSRF token against the one in the session
  if (!req.session || !req.session.csrfToken || req.session.csrfToken !== csrfToken) {
    console.error('[API][Match][PKL-278651-TOURN-0003.1-API] CSRF token validation failed');
    console.error(`[API][Match][PKL-278651-TOURN-0003.1-API] Expected: ${req.session?.csrfToken?.substring(0, 8) || 'undefined'}, Got: ${(csrfToken as string)?.substring(0, 8) || 'undefined'}`);
    return res.status(403).json({ 
      code: 'CSRF_TOKEN_INVALID',
      message: 'CSRF token validation failed' 
    });
  }
  
  console.log('[API][Match][PKL-278651-TOURN-0003.1-API] CSRF token validated successfully');
  next();
};

/**
 * Record a match result
 * POST /api/matches/:id/result
 * 
 * This endpoint records the result of a match and updates the bracket accordingly.
 */
router.post('/matches/:id/result', validateToken, async (req, res) => {
  console.log('[API][Match][PKL-278651-TOURN-0003.1-API] Recording match result for match', req.params.id);
  
  try {
    const matchId = parseInt(req.params.id);
    
    // Get the match to verify it exists
    const match = await db.query.tournamentBracketMatches.findFirst({
      where: eq(tournamentBracketMatches.id, matchId),
    });
    
    if (!match) {
      console.error(`[API][Match][PKL-278651-TOURN-0003.1-API] Match ${matchId} not found`);
      return res.status(404).json({ 
        code: 'MATCH_NOT_FOUND',
        message: `Match with ID ${matchId} not found` 
      });
    }
    
    // Check if the match is already completed
    if (match.status === 'completed') {
      console.error(`[API][Match][PKL-278651-TOURN-0003.1-API] Match ${matchId} already completed`);
      return res.status(409).json({ 
        code: 'MATCH_ALREADY_COMPLETED',
        message: `Match with ID ${matchId} is already completed` 
      });
    }
    
    // Check if both teams are assigned to the match
    if (match.team1Id === null || match.team2Id === null) {
      console.error(`[API][Match][PKL-278651-TOURN-0003.1-API] Match ${matchId} missing team assignments`);
      return res.status(400).json({ 
        code: 'INVALID_TEAMS',
        message: `Match with ID ${matchId} does not have both teams assigned` 
      });
    }
    
    // Validate request body with improved schema
    const recordResultSchema = z.object({
      winnerId: z.number({
        required_error: "Winner ID is required",
        invalid_type_error: "Winner ID must be a number"
      }),
      loserId: z.number({
        required_error: "Loser ID is required",
        invalid_type_error: "Loser ID must be a number"
      }),
      score: z.string({
        required_error: "Score is required",
        invalid_type_error: "Score must be a string"
      }).min(1, "Score cannot be empty"),
      notes: z.string().optional(),
      scoreDetails: z.record(z.any()).optional(),
    });
    
    console.log('[API][Match][PKL-278651-TOURN-0003.1-API] Validating match result data:', req.body);
    const parsedData = recordResultSchema.safeParse(req.body);
    
    if (!parsedData.success) {
      console.error('[API][Match][PKL-278651-TOURN-0003.1-API] Match result data validation failed:', parsedData.error.format());
      return res.status(400).json({ 
        code: 'VALIDATION_ERROR',
        message: 'Invalid match result data', 
        errors: parsedData.error.format() 
      });
    }
    
    const { winnerId, loserId, score, notes, scoreDetails } = parsedData.data;
    
    // Verify that the winner and loser IDs match the teams in the match
    const validTeamIds = [match.team1Id, match.team2Id];
    if (!validTeamIds.includes(winnerId) || !validTeamIds.includes(loserId)) {
      console.error(`[API][Match][PKL-278651-TOURN-0003.1-API] Invalid team IDs: winner=${winnerId}, loser=${loserId}, expected ${validTeamIds}`);
      return res.status(400).json({ 
        code: 'INVALID_TEAMS',
        message: `Winner and loser IDs must match the teams assigned to the match` 
      });
    }
    
    // Record the match result
    console.log(`[API][Match][PKL-278651-TOURN-0003.1-API] Recording result: match=${matchId}, winner=${winnerId}, loser=${loserId}, score=${score}`);
    await recordMatchResult(matchId, winnerId, loserId, score, scoreDetails);
    
    // Get the updated match with team information
    const updatedMatch = await db.query.tournamentBracketMatches.findFirst({
      where: eq(tournamentBracketMatches.id, matchId),
      with: {
        team1: true,
        team2: true,
      },
    });
    
    // Return success response with the updated match
    console.log(`[API][Match][PKL-278651-TOURN-0003.1-API] Successfully recorded result for match ${matchId}`);
    res.json({
      success: true,
      match: updatedMatch,
      message: 'Match result recorded successfully'
    });
  } catch (error) {
    console.error('[API][Match][PKL-278651-TOURN-0003.1-API] Error recording match result:', error);
    
    // Check for specific error messages for better error responses
    if (error instanceof Error) {
      // Match not found
      if (error.message.includes('not found')) {
        return res.status(404).json({ 
          code: 'MATCH_NOT_FOUND',
          message: error.message 
        });
      }
      
      // Invalid teams
      if (error.message.includes('not playing') || 
          error.message.includes('invalid team') ||
          error.message.includes('team not found')) {
        return res.status(400).json({ 
          code: 'INVALID_TEAMS',
          message: error.message 
        });
      }
      
      // Match already completed
      if (error.message.includes('already completed') || 
          error.message.includes('already finished')) {
        return res.status(409).json({ 
          code: 'MATCH_ALREADY_COMPLETED',
          message: error.message 
        });
      }
    }
    
    // Generic error response for unhandled errors
    res.status(500).json({ 
      code: 'SERVER_ERROR',
      message: 'Internal server error recording match result' 
    });
  }
});

/**
 * Get match details
 * GET /api/matches/:id
 * 
 * This endpoint returns the details of a match including team information.
 */
router.get('/matches/:id', async (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    
    // Get the match with team information
    const match = await db.query.tournamentBracketMatches.findFirst({
      where: eq(tournamentBracketMatches.id, matchId),
      with: {
        team1: true,
        team2: true,
      },
    });
    
    if (!match) {
      return res.status(404).json({ 
        code: 'MATCH_NOT_FOUND',
        message: `Match with ID ${matchId} not found` 
      });
    }
    
    res.json(match);
  } catch (error) {
    console.error('[API][Match][PKL-278651-TOURN-0003.1-API] Error fetching match details:', error);
    res.status(500).json({ 
      code: 'SERVER_ERROR',
      message: 'Internal server error' 
    });
  }
});

export default router;