/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce XP Integration Routes
 * 
 * This file contains the routes for integrating Bounce with the platform's XP system,
 * providing endpoints for XP transactions, achievement unlocks, and progress tracking.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express, { Request, Response } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { bounceXpIntegration } from '../services/bounce-xp-integration';
import { XP_SOURCE } from '@shared/schema/xp';
import { db } from '../db';
import { and, eq, desc } from 'drizzle-orm';
import { xpTransactions } from '@shared/schema/xp';

/**
 * Register routes related to Bounce XP integration
 * @param app Express application
 */
export function registerBounceXpRoutes(app: express.Express): void {
  /**
   * Get Bounce XP data for current user
   * GET /api/bounce/xp
   */
  app.get('/api/bounce/xp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get XP summary from Bounce XP Integration service
      const xpSummary = await bounceXpIntegration.getUserXpSummary(userId);
      
      res.json(xpSummary);
    } catch (error) {
      console.error('[API] Error getting Bounce XP data:', error);
      res.status(500).json({ error: 'Failed to retrieve Bounce XP data' });
    }
  });
  
  /**
   * Get recent Bounce XP transactions for current user
   * GET /api/bounce/xp/history
   */
  app.get('/api/bounce/xp/history', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      // Get recent transactions
      const transactions = await db
        .select()
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            eq(xpTransactions.source, XP_SOURCE.BOUNCE)
          )
        )
        .orderBy(desc(xpTransactions.createdAt))
        .limit(limit);
      
      res.json(transactions);
    } catch (error) {
      console.error('[API] Error getting Bounce XP history:', error);
      res.status(500).json({ error: 'Failed to retrieve Bounce XP history' });
    }
  });
  
  /**
   * Award XP for a specific Bounce action (admin only)
   * POST /api/admin/bounce/award-xp
   */
  app.post('/api/admin/bounce/award-xp', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, amount, sourceType, sourceId, description } = req.body;
      
      if (!userId || !amount || !sourceType) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      let xpAwarded = 0;
      
      // Award XP based on the source type
      switch (sourceType) {
        case 'finding':
          if (!sourceId) {
            return res.status(400).json({ error: 'Missing sourceId for finding XP award' });
          }
          xpAwarded = await bounceXpIntegration.awardFindingXp(userId, sourceId, 'medium');
          break;
          
        case 'verification':
          if (!sourceId) {
            return res.status(400).json({ error: 'Missing sourceId for verification XP award' });
          }
          xpAwarded = await bounceXpIntegration.awardVerificationXp(userId, sourceId);
          break;
          
        case 'participation':
          // For participation, the amount is treated as minutes
          xpAwarded = await bounceXpIntegration.awardParticipationXp(userId, amount);
          break;
          
        default:
          return res.status(400).json({ error: 'Invalid sourceType' });
      }
      
      res.json({ 
        success: true, 
        xpAwarded,
        message: `Successfully awarded ${xpAwarded} XP to user ${userId} for ${sourceType}`
      });
    } catch (error) {
      console.error('[API] Error awarding Bounce XP:', error);
      res.status(500).json({ error: 'Failed to award Bounce XP' });
    }
  });
  
  /**
   * Get Bounce XP leaderboard
   * GET /api/bounce/xp/leaderboard
   */
  app.get('/api/bounce/xp/leaderboard', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get top users by Bounce XP
      const leaderboardData = await db.execute(`
        SELECT 
          u.id, 
          u.username, 
          u.display_name, 
          u.profile_image_url,
          SUM(xt.amount) AS total_bounce_xp,
          COUNT(xt.id) AS transaction_count
        FROM 
          users u
        JOIN 
          xp_transactions xt ON u.id = xt.user_id
        WHERE 
          xt.source = '${XP_SOURCE.BOUNCE}'
        GROUP BY 
          u.id, u.username, u.display_name, u.profile_image_url
        ORDER BY 
          total_bounce_xp DESC
        LIMIT ${limit}
      `);
      
      // Format response
      const leaderboard = leaderboardData.rows.map((row: any, index: number) => ({
        rank: index + 1,
        userId: row.id,
        username: row.username,
        displayName: row.display_name,
        profileImageUrl: row.profile_image_url,
        totalBounceXp: parseInt(row.total_bounce_xp),
        transactionCount: parseInt(row.transaction_count)
      }));
      
      res.json(leaderboard);
    } catch (error) {
      console.error('[API] Error getting Bounce XP leaderboard:', error);
      res.status(500).json({ error: 'Failed to retrieve Bounce XP leaderboard' });
    }
  });
}