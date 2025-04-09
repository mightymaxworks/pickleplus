/**
 * PKL-278651-MATCH-0003-DS: Match Statistics API
 * This file contains API endpoints for match-related operations
 */
import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { 
  insertMatchStatisticsSchema, 
  insertPerformanceImpactSchema, 
  insertMatchHighlightSchema,
  InsertMatchStatistics,
  InsertPerformanceImpact,
  InsertMatchHighlight
} from '@shared/match-statistics-schema';

const matchRouter = Router();

/**
 * Get a specific match by ID
 * 
 * Only handles numeric IDs to avoid conflicts with other '/api/match/*' routes
 */
matchRouter.get('/:id([0-9]+)', async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const match = await storage.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('[Match API] Error getting match:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
});

/**
 * Get match statistics for a specific match
 */
matchRouter.get('/:id([0-9]+)/statistics', async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const stats = await storage.getMatchStatistics(matchId);
    if (!stats) {
      return res.status(404).json({ error: 'Match statistics not found' });
    }

    res.json(stats);
  } catch (error) {
    console.error('[Match API] Error getting match statistics:', error);
    res.status(500).json({ error: 'Failed to get match statistics' });
  }
});

/**
 * Create or update match statistics
 */
matchRouter.post('/statistics', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validationResult = insertMatchStatisticsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid match statistics data',
        details: validationResult.error.format()
      });
    }

    const { matchId } = req.body;
    
    // Check if statistics already exist for this match
    const existingStats = await storage.getMatchStatistics(matchId);
    
    let stats;
    if (existingStats) {
      // Update existing statistics
      stats = await storage.updateMatchStatistics(existingStats.id, req.body);
      if (!stats) {
        return res.status(500).json({ error: 'Failed to update match statistics' });
      }
    } else {
      // Create new statistics
      const statsPayload: InsertMatchStatistics = {
        ...req.body
      };
      
      stats = await storage.createMatchStatistics(statsPayload);
    }

    res.json(stats);
  } catch (error) {
    console.error('[Match API] Error creating/updating match statistics:', error);
    res.status(500).json({ error: 'Failed to create/update match statistics' });
  }
});

/**
 * Get performance impacts for a specific match
 */
matchRouter.get('/:id([0-9]+)/impacts', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    // Optional user filter
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

    const impacts = await storage.getPerformanceImpacts(matchId, userId);
    res.json(impacts);
  } catch (error) {
    console.error('[Match API] Error getting performance impacts:', error);
    res.status(500).json({ error: 'Failed to get performance impacts' });
  }
});

/**
 * Create a performance impact for a match
 */
matchRouter.post('/:id([0-9]+)/impacts', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    // Ensure the match exists
    const match = await storage.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Validate the payload
    const validationResult = insertPerformanceImpactSchema.safeParse({
      ...req.body,
      matchId
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid performance impact data',
        details: validationResult.error.format()
      });
    }

    // Create the impact
    const impactPayload: InsertPerformanceImpact = {
      matchId,
      userId: req.body.userId || req.user!.id,
      dimension: req.body.dimension,
      impactValue: req.body.impactValue,
      reason: req.body.reason,
      metadata: req.body.metadata
    };

    const impact = await storage.createPerformanceImpact(impactPayload);
    res.status(201).json(impact);
  } catch (error) {
    console.error('[Match API] Error creating performance impact:', error);
    res.status(500).json({ error: 'Failed to create performance impact' });
  }
});

/**
 * Get highlights for a specific match
 */
matchRouter.get('/:id([0-9]+)/highlights', async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    // Optional user filter
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

    const highlights = await storage.getMatchHighlights(matchId, userId);
    res.json(highlights);
  } catch (error) {
    console.error('[Match API] Error getting match highlights:', error);
    res.status(500).json({ error: 'Failed to get match highlights' });
  }
});

/**
 * Create a highlight for a match
 */
matchRouter.post('/:id([0-9]+)/highlights', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const matchId = parseInt(req.params.id);
    if (isNaN(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    // Ensure the match exists
    const match = await storage.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Validate the payload
    const validationResult = insertMatchHighlightSchema.safeParse({
      ...req.body,
      matchId
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid highlight data',
        details: validationResult.error.format()
      });
    }

    // Create the highlight
    const highlightPayload: InsertMatchHighlight = {
      matchId,
      userId: req.body.userId || req.user!.id,
      highlightType: req.body.highlightType,
      description: req.body.description,
      timestampSeconds: req.body.timestampSeconds,
      metadata: req.body.metadata
    };

    const highlight = await storage.createMatchHighlight(highlightPayload);
    res.status(201).json(highlight);
  } catch (error) {
    console.error('[Match API] Error creating match highlight:', error);
    res.status(500).json({ error: 'Failed to create match highlight' });
  }
});

export const matchRoutes = matchRouter;