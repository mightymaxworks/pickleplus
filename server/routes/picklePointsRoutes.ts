/**
 * PICKLE POINTS INTEGRATION API ROUTES
 * 
 * RESTful endpoints for Pickle Points integration with ranking system
 * using official 1.5x multiplier PER MATCH (not blanket conversion)
 * 
 * Version: 1.0.0 - Sprint 1: Pickle Points Integration  
 * Last Updated: September 17, 2025
 * 
 * UDF COMPLIANCE: Uses centralized validation and service layer
 * SECURITY: All endpoints protected with authentication
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { picklePointsService } from '../services/picklePointsService';
import { isAuthenticated } from '../auth';

const router = Router();

// Rate limiting for Pickle Points operations
const picklePointsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: { error: 'Too many Pickle Points requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const awardMatchPointsSchema = z.object({
  matchResults: z.array(z.object({
    playerId: z.number().int().positive('Player ID must be positive'),
    username: z.string().min(1, 'Username required'),
    isWin: z.boolean(),
    rankingPointsEarned: z.number().min(0, 'Ranking points must be non-negative')
  })),
  matchId: z.number().int().positive('Match ID required for idempotency protection')
});

const batchAwardSchema = z.object({
  batchResults: z.array(z.object({
    matchId: z.number().int().positive('Match ID must be positive'),
    players: z.array(z.object({
      playerId: z.number().int().positive('Player ID must be positive'),
      username: z.string().min(1, 'Username required'),
      isWin: z.boolean(),
      rankingPointsEarned: z.number().min(0, 'Ranking points must be non-negative')
    }))
  }))
});

/**
 * POST /api/pickle-points/award-match
 * Award Pickle Points to players after match completion
 * Uses official 1.5x multiplier PER MATCH
 * SECURITY: Admin/System only - prevents self-awarding abuse
 */
router.post('/award-match', isAuthenticated, picklePointsRateLimit, async (req: any, res: any) => {
  // SECURITY CHECK: Only admins or system can award Pickle Points
  if (req.user.role !== 'admin' && req.user.role !== 'system') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only administrators can award Pickle Points.'
    });
  }
  try {
    const validatedData = awardMatchPointsSchema.parse(req.body);
    
    const result = await picklePointsService.awardMatchPicklePoints(
      validatedData.matchResults,
      validatedData.matchId
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to award Pickle Points'
      });
    }

    res.json({
      success: true,
      data: {
        playersRewarded: result.results.length,
        totalPicklePointsAwarded: result.totalPicklePointsAwarded,
        results: result.results.map(r => ({
          playerId: r.playerId,
          username: r.username,
          matchResult: r.isWin ? 'WIN' : 'LOSS',
          picklePointsEarned: r.picklePointsEarned,
          newBalance: r.newPicklePointsBalance,
          rankingPointsEarned: r.rankingPointsEarned
        }))
      },
      message: `Successfully awarded ${result.totalPicklePointsAwarded} Pickle Points to ${result.results.length} players`
    });

  } catch (error) {
    console.error('[PICKLE POINTS API] Award match error:', {
      message: error instanceof Error ? error.message : String(error),
      userId: req.user?.id,
      body: req.body
    });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to award Pickle Points'
    });
  }
});

/**
 * POST /api/pickle-points/award-batch  
 * Award Pickle Points for multiple matches (tournaments/leagues)
 * Handles batch operations with proper UDF compliance
 * SECURITY: Admin/System only - prevents unauthorized batch operations
 */
router.post('/award-batch', isAuthenticated, picklePointsRateLimit, async (req: any, res: any) => {
  // SECURITY CHECK: Only admins or system can award batch Pickle Points
  if (req.user.role !== 'admin' && req.user.role !== 'system') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only administrators can perform batch Pickle Points operations.'
    });
  }
  try {
    const validatedData = batchAwardSchema.parse(req.body);

    const result = await picklePointsService.awardBatchPicklePoints(
      validatedData.batchResults
    );

    if (!result.success && result.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Batch operation partially failed',
        details: result.errors,
        summary: {
          totalMatches: result.totalMatches,
          playersRewarded: result.totalPlayersRewarded,
          totalPicklePointsAwarded: result.totalPicklePointsAwarded
        }
      });
    }

    res.json({
      success: true,
      data: {
        totalMatches: result.totalMatches,
        playersRewarded: result.totalPlayersRewarded,
        totalPicklePointsAwarded: result.totalPicklePointsAwarded,
        errors: result.errors
      },
      message: `Successfully processed ${result.totalMatches} matches and awarded ${result.totalPicklePointsAwarded} Pickle Points`
    });

  } catch (error) {
    console.error('[PICKLE POINTS API] Batch award error:', {
      message: error instanceof Error ? error.message : String(error),
      userId: req.user?.id
    });

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid batch data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process batch Pickle Points award'
    });
  }
});

/**
 * GET /api/pickle-points/player/:playerId
 * Get player's Pickle Points balance and transaction history
 */
router.get('/player/:playerId', isAuthenticated, async (req: any, res: any) => {
  try {
    const playerId = parseInt(req.params.playerId);
    
    if (isNaN(playerId) || playerId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid player ID'
      });
    }

    // Authorization: Users can only view their own Pickle Points or admins can view any
    if (req.user.id !== playerId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const result = await picklePointsService.getPlayerPicklePointsInfo(playerId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to fetch Pickle Points info'
      });
    }

    res.json({
      success: true,
      data: {
        playerId,
        balance: result.balance,
        balanceFormatted: result.balanceFormatted,
        totalEarned: result.totalEarned,
        totalEarnedFormatted: `${result.totalEarned.toFixed(1)} points`,
        recentTransactions: result.recentTransactions.map(txn => ({
          id: txn.id,
          amount: txn.amount,
          amountFormatted: `${txn.amount.toFixed(1)} points`,
          type: txn.type,
          description: txn.description,
          createdAt: txn.createdAt,
          relativeTime: getRelativeTime(txn.createdAt)
        }))
      }
    });

  } catch (error) {
    console.error('[PICKLE POINTS API] Player info error:', {
      playerId: req.params.playerId,
      message: error instanceof Error ? error.message : String(error)
    });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch player Pickle Points info'
    });
  }
});

/**
 * GET /api/pickle-points/my-balance
 * Get current user's Pickle Points balance
 */
router.get('/my-balance', isAuthenticated, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    const result = await picklePointsService.getPlayerPicklePointsInfo(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to fetch balance'
      });
    }

    res.json({
      success: true,
      data: {
        balance: result.balance,
        balanceFormatted: result.balanceFormatted,
        totalEarned: result.totalEarned,
        totalEarnedFormatted: `${result.totalEarned.toFixed(1)} points`,
        recentEarnings: result.recentTransactions.slice(0, 5).map(txn => ({
          amount: txn.amount,
          description: txn.description,
          createdAt: txn.createdAt,
          relativeTime: getRelativeTime(txn.createdAt)
        }))
      }
    });

  } catch (error) {
    console.error('[PICKLE POINTS API] My balance error:', {
      userId: req.user?.id,
      message: error instanceof Error ? error.message : String(error)
    });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch Pickle Points balance'
    });
  }
});

/**
 * POST /api/pickle-points/calculate
 * Calculate Pickle Points for given ranking points (preview calculation)
 */
router.post('/calculate', isAuthenticated, async (req: any, res: any) => {
  try {
    const { rankingPoints } = req.body;
    
    if (typeof rankingPoints !== 'number' || rankingPoints < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid ranking points required'
      });
    }

    const picklePoints = picklePointsService.calculateMatchPicklePoints(rankingPoints);

    res.json({
      success: true,
      data: {
        rankingPoints,
        picklePoints,
        multiplier: 1.5,
        calculation: `${rankingPoints} × 1.5 = ${picklePoints}`,
        formatted: {
          rankingPoints: `${rankingPoints} ranking points`,
          picklePoints: `${picklePoints} Pickle Points`
        }
      }
    });

  } catch (error) {
    console.error('[PICKLE POINTS API] Calculate error:', {
      message: error instanceof Error ? error.message : String(error),
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: 'Failed to calculate Pickle Points'
    });
  }
});

/**
 * Helper function to format relative time
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
}

export { router as picklePointsRoutes };