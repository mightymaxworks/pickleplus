/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce XP Integration Routes
 * 
 * API routes for retrieving XP data related to Bounce testing activities
 * and their contribution to the user's overall XP.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express from 'express';
import { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { db } from '../db';
import { sql, eq, and, or, desc, count } from 'drizzle-orm';
import { xpTransactions } from '@shared/schema';
import { xpService } from '../services/xp-service';

/**
 * Register Bounce XP integration routes
 */
export function registerBounceXpRoutes(app: express.Express): void {
  /**
   * Get a summary of XP earned from Bounce testing activities
   * GET /api/bounce/gamification/xp-summary
   */
  app.get('/api/bounce/gamification/xp-summary', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get total user XP
      const userXp = await xpService.getTotalUserXp(userId);
      
      // Get Bounce-related XP transactions
      const bounceXpTransactions = await db
        .select()
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            or(
              eq(xpTransactions.source, 'bounce'),
              eq(xpTransactions.sourceType, 'finding'),
              eq(xpTransactions.sourceType, 'verification'),
              eq(xpTransactions.sourceType, 'achievement')
            )
          )
        )
        .orderBy(desc(xpTransactions.createdAt));
      
      // Calculate totals
      const totalBounceXp = bounceXpTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const xpFromFindings = bounceXpTransactions
        .filter(tx => tx.sourceType === 'finding')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const xpFromVerifications = bounceXpTransactions
        .filter(tx => tx.sourceType === 'verification')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const xpFromAchievements = bounceXpTransactions
        .filter(tx => tx.sourceType === 'achievement')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      // Calculate bounce XP percentage
      const bounceXpPercentage = userXp > 0 
        ? Math.round((totalBounceXp / userXp) * 100) 
        : 0;
      
      // Get recent transactions (limit to 10)
      const recentTransactions = bounceXpTransactions.slice(0, 10);
      
      return res.status(200).json({
        success: true,
        data: {
          totalBounceXp,
          totalUserXp: userXp,
          xpFromFindings,
          xpFromVerifications,
          xpFromAchievements,
          bounceXpPercentage,
          recentTransactions
        }
      });
    } catch (error) {
      console.error('Error getting Bounce XP summary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve Bounce XP summary'
      });
    }
  });
  
  // Log routes registration
  console.log('[API] Bounce XP integration routes registered');
}