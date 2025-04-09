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
import { matches } from '@shared/schema';
import { asc, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';

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
 * Using precise path to avoid conflicts with other routes
 */
matchRouter.post('/api/statistics', isAuthenticated, async (req: Request, res: Response) => {
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

/**
 * PKL-278651-MATCH-0003-DS: Match Statistics Dashboard
 * Get aggregated match statistics for a user
 */
matchRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get query parameters for filtering
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const timeRange = req.query.timeRange as string || 'all';
    const matchType = req.query.matchType as 'casual' | 'competitive' | 'tournament' | 'league' | undefined;
    const formatType = req.query.formatType as 'singles' | 'doubles' | 'mixed' | undefined;
    
    console.log('[Match API] Match stats request:', {
      timeRange, matchType, formatType, userId
    });
    
    let timeFilter;
    
    // Calculate the date range based on timeRange
    const now = new Date();
    switch (timeRange) {
      case '30days':
        timeFilter = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        timeFilter = new Date(now.setDate(now.getDate() - 90));
        break;
      case '6months':
        timeFilter = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1year':
        timeFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'all':
      default:
        timeFilter = undefined;
        break;
    }
    
    // Get all matches for the user with filters
    // Build the query with all filters
    let matchesQuery = db.select().from(matches);
    
    // Apply user filter if provided
    if (userId) {
      matchesQuery = matchesQuery.where(
        sql`(${matches.playerOneId} = ${userId} OR ${matches.playerTwoId} = ${userId} OR ${matches.playerOnePartnerId} = ${userId} OR ${matches.playerTwoPartnerId} = ${userId})`
      );
    }
    
    // Apply time filter if provided
    if (timeFilter) {
      matchesQuery = matchesQuery.where(
        sql`${matches.matchDate} >= ${timeFilter}`
      );
    }
    
    // Apply match type filter if provided
    if (matchType) {
      matchesQuery = matchesQuery.where(
        sql`${matches.matchType} = ${matchType}`
      );
    }
    
    // Apply format type filter if provided
    if (formatType) {
      matchesQuery = matchesQuery.where(
        sql`${matches.formatType} = ${formatType}`
      );
    }
    
    // Order by match date descending
    matchesQuery = matchesQuery.orderBy(desc(matches.matchDate));
    
    // Execute the query
    const userMatches = await matchesQuery;
    
    // Calculate basic statistics
    const totalMatches = userMatches.length;
    let matchesWon = 0;
    let singlesMatches = 0;
    let singlesWins = 0;
    let doublesMatches = 0;
    let doublesWins = 0;
    let casualMatches = 0;
    let casualWins = 0;
    let competitiveMatches = 0;
    let competitiveWins = 0;
    let tournamentMatches = 0;
    let tournamentWins = 0;
    let leagueMatches = 0;
    let leagueWins = 0;
    let totalScore = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let bestWinStreak = 0;
    let tempWinStreak = 0;
    
    // Recent match info
    const lastMatchDate = userMatches.length > 0 ? userMatches[0].matchDate?.toISOString() : null;
    const firstMatchDate = userMatches.length > 0 ? userMatches[userMatches.length - 1].matchDate?.toISOString() : null;
    
    // Process match data to calculate statistics
    for (let i = 0; i < userMatches.length; i++) {
      const match = userMatches[i];
      
      // Check if user won this match
      const userIsWinner = userId ? 
        (match.winnerId === userId || 
         (match.formatType === 'doubles' && match.winnerTeam === 'team1' && 
          (match.playerOneId === userId || match.playerOnePartnerId === userId)) ||
         (match.formatType === 'doubles' && match.winnerTeam === 'team2' && 
          (match.playerTwoId === userId || match.playerTwoPartnerId === userId))
        ) : 
        false;
      
      // Count wins
      if (userIsWinner) {
        matchesWon++;
        
        // Update current win streak
        tempWinStreak++;
        currentLossStreak = 0;
        
        // Check if this sets a new best win streak
        if (tempWinStreak > bestWinStreak) {
          bestWinStreak = tempWinStreak;
        }
      } else {
        // Reset win streak counter on loss
        tempWinStreak = 0;
        currentLossStreak++;
      }
      
      // Set the current win streak at the end
      if (i === 0) {
        currentWinStreak = tempWinStreak;
      }
      
      // Count by format type
      if (match.formatType === 'singles') {
        singlesMatches++;
        if (userIsWinner) singlesWins++;
      } else if (match.formatType === 'doubles') {
        doublesMatches++;
        if (userIsWinner) doublesWins++;
      }
      
      // Count by match type
      switch (match.matchType) {
        case 'casual':
          casualMatches++;
          if (userIsWinner) casualWins++;
          break;
        case 'competitive':
          competitiveMatches++;
          if (userIsWinner) competitiveWins++;
          break;
        case 'tournament':
          tournamentMatches++;
          if (userIsWinner) tournamentWins++;
          break;
        case 'league':
          leagueMatches++;
          if (userIsWinner) leagueWins++;
          break;
      }
      
      // Calculate score
      // For simplicity, using the primary score only
      const userScore = userId ? 
        (match.playerOneId === userId || match.playerOnePartnerId === userId) ? 
          parseInt(match.scorePlayerOne.split('-')[0] || '0') : 
          parseInt(match.scorePlayerTwo.split('-')[0] || '0') : 
        0;
      
      totalScore += userScore;
    }
    
    // Calculate averages and percentages
    const winRate = totalMatches > 0 ? Math.round((matchesWon / totalMatches) * 100) : 0;
    const avgScore = totalMatches > 0 ? Number((totalScore / totalMatches).toFixed(1)) : 0;
    const singlesWinRate = singlesMatches > 0 ? Math.round((singlesWins / singlesMatches) * 100) : 0;
    const doublesWinRate = doublesMatches > 0 ? Math.round((doublesWins / doublesMatches) * 100) : 0;
    const casualWinRate = casualMatches > 0 ? Math.round((casualWins / casualMatches) * 100) : 0;
    const competitiveWinRate = competitiveMatches > 0 ? Math.round((competitiveWins / competitiveMatches) * 100) : 0;
    const tournamentWinRate = tournamentMatches > 0 ? Math.round((tournamentWins / tournamentMatches) * 100) : 0;
    const leagueWinRate = leagueMatches > 0 ? Math.round((leagueWins / leagueMatches) * 100) : 0;
    
    // Get the recent matches for the performance trend (limit to last 10)
    const recentMatches = userMatches.slice(0, 10);

    // Generate comprehensive statistics for the dashboard
    const stats = {
      // Basic statistics
      totalMatches,
      matchesWon,
      matchesLost: totalMatches - matchesWon,
      winRate,
      avgScore,
      
      // Streaks
      currentWinStreak,
      bestWinStreak,
      currentLossStreak,
      
      // Format specific
      singlesMatches,
      singlesWins,
      singlesLosses: singlesMatches - singlesWins,
      singlesWinRate,
      singlesAvgScore: singlesMatches > 0 ? Number((totalScore / singlesMatches).toFixed(1)) : 0,
      
      doublesMatches,
      doublesWins,
      doublesLosses: doublesMatches - doublesWins,
      doublesWinRate,
      doublesAvgScore: doublesMatches > 0 ? Number((totalScore / doublesMatches).toFixed(1)) : 0,
      
      // Match type specific
      casualMatches,
      casualWinRate,
      competitiveMatches,
      competitiveWinRate,
      tournamentMatches,
      tournamentWinRate,
      leagueMatches,
      leagueWinRate,
      
      // Time data
      lastMatchDate,
      firstMatchDate,
      
      // Recent matches for performance trend
      recentMatches
    };
    
    res.json(stats);
  } catch (error) {
    console.error('[Match API] Error getting match stats:', error);
    res.status(500).json({ error: 'Failed to get match statistics' });
  }
});

export const matchRoutes = matchRouter;