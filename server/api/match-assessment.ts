/**
 * PKL-278651-COURTIQ-0002-ASSESS
 * Match Assessment API
 * 
 * This file provides endpoints for submitting post-match assessments and
 * performance impacts that will feed into the CourtIQ™ rating system.
 * 
 * Framework 5.3 Implementation
 */
import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { 
  insertPerformanceImpactSchema,
  InsertPerformanceImpact,
  performanceImpacts
} from '@shared/match-statistics-schema';
import { db } from '../db';
import { matches } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * POST /api/match/performance-impact
 * Submit a performance impact assessment for a match
 */
router.post('/performance-impact', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validatedData = insertPerformanceImpactSchema.parse(req.body);
    
    // Verify the match exists
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, validatedData.matchId)
    });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Verify the user has permission to add impact data
    const isMatchParticipant = (
      match.playerOneId === req.user?.id ||
      match.playerTwoId === req.user?.id ||
      match.playerOnePartnerId === req.user?.id ||
      match.playerTwoPartnerId === req.user?.id
    );
    
    const isTargetingOwnUser = validatedData.userId === req.user?.id;
    
    // Allow users to submit their own assessment or assessments of opponents they played against
    if (!isMatchParticipant) {
      return res.status(403).json({ error: 'Not authorized to submit performance impact for this match' });
    }
    
    // Insert the performance impact
    const [result] = await db.insert(performanceImpacts).values(validatedData).returning();
    
    // Return success response
    return res.status(201).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error submitting performance impact:', error);
    return res.status(400).json({ error: 'Invalid request data' });
  }
});

/**
 * GET /api/match/:id/assessments
 * Get all performance impacts/assessments for a match
 */
router.get('/:id/assessments', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id);
    
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }
    
    // Get the match first to verify access
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, matchId)
    });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Verify the user has permission to view assessment data
    const isMatchParticipant = (
      match.playerOneId === req.user?.id ||
      match.playerTwoId === req.user?.id ||
      match.playerOnePartnerId === req.user?.id ||
      match.playerTwoPartnerId === req.user?.id
    );
    
    if (!isMatchParticipant) {
      return res.status(403).json({ error: 'Not authorized to view assessments for this match' });
    }
    
    // Get all performance impacts for this match
    const assessments = await db.query.performanceImpacts.findMany({
      where: eq(performanceImpacts.matchId, matchId)
    });
    
    // Return the assessments
    return res.json({
      matchId,
      assessments
    });
    
  } catch (error) {
    console.error('Error fetching match assessments:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PATCH /api/match/:id
 * Update match metadata (for adding context information)
 */
router.patch('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id);
    
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }
    
    // Get the match first to verify access
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, matchId)
    });
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Verify the user has permission to update the match
    const isMatchParticipant = (
      match.playerOneId === req.user?.id ||
      match.playerTwoId === req.user?.id ||
      match.playerOnePartnerId === req.user?.id ||
      match.playerTwoPartnerId === req.user?.id
    );
    
    if (!isMatchParticipant) {
      return res.status(403).json({ error: 'Not authorized to update this match' });
    }
    
    // Update the match with the provided data
    // Only allow updating metadata to prevent changing core match data
    if (typeof req.body.metadata === 'object') {
      const [updatedMatch] = await db.update(matches)
        .set({ metadata: req.body.metadata })
        .where(eq(matches.id, matchId))
        .returning();
      
      return res.json({
        success: true,
        data: updatedMatch
      });
    } else {
      return res.status(400).json({ error: 'Only metadata updates are allowed' });
    }
    
  } catch (error) {
    console.error('Error updating match:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;