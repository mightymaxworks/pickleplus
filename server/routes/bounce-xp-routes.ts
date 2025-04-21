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
import { sql, eq, and, or, desc } from 'drizzle-orm';
import { xpTransactions } from '@shared/schema';
import { bounceXpIntegration } from '../services/bounce-xp-integration';

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
      
      // Get XP summary from the integration service
      const summary = await bounceXpIntegration.getUserXpSummary(userId);
      
      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting Bounce XP summary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve Bounce XP summary'
      });
    }
  });
  
  /**
   * Award XP for a finding
   * POST /api/bounce/gamification/award-finding-xp
   */
  app.post('/api/bounce/gamification/award-finding-xp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { findingId, findingSeverity } = req.body;
      
      if (!findingId || !findingSeverity) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: findingId and findingSeverity'
        });
      }
      
      const xpAwarded = await bounceXpIntegration.awardFindingXp(
        userId,
        findingId,
        findingSeverity
      );
      
      return res.status(200).json({
        success: true,
        data: {
          xpAwarded,
          findingId,
          findingSeverity
        }
      });
    } catch (error) {
      console.error('Error awarding XP for finding:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to award XP for finding'
      });
    }
  });
  
  /**
   * Award XP for verifying a finding
   * POST /api/bounce/gamification/award-verification-xp
   */
  app.post('/api/bounce/gamification/award-verification-xp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { findingId } = req.body;
      
      if (!findingId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: findingId'
        });
      }
      
      const xpAwarded = await bounceXpIntegration.awardVerificationXp(
        userId,
        findingId
      );
      
      return res.status(200).json({
        success: true,
        data: {
          xpAwarded,
          findingId
        }
      });
    } catch (error) {
      console.error('Error awarding XP for verification:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to award XP for verification'
      });
    }
  });
  
  /**
   * Award XP for unlocking an achievement
   * POST /api/bounce/gamification/award-achievement-xp
   */
  app.post('/api/bounce/gamification/award-achievement-xp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { achievementId } = req.body;
      
      if (!achievementId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: achievementId'
        });
      }
      
      const xpAwarded = await bounceXpIntegration.awardAchievementXp(
        userId,
        achievementId
      );
      
      return res.status(200).json({
        success: true,
        data: {
          xpAwarded,
          achievementId
        }
      });
    } catch (error) {
      console.error('Error awarding XP for achievement:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to award XP for achievement'
      });
    }
  });
  
  /**
   * Award XP for testing participation
   * POST /api/bounce/gamification/award-participation-xp
   */
  app.post('/api/bounce/gamification/award-participation-xp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { sessionDurationMinutes } = req.body;
      
      if (!sessionDurationMinutes) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameter: sessionDurationMinutes'
        });
      }
      
      const xpAwarded = await bounceXpIntegration.awardParticipationXp(
        userId,
        sessionDurationMinutes
      );
      
      return res.status(200).json({
        success: true,
        data: {
          xpAwarded,
          sessionDurationMinutes
        }
      });
    } catch (error) {
      console.error('Error awarding XP for participation:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to award XP for participation'
      });
    }
  });
  
  // Log routes registration
  console.log('[API] Bounce XP integration routes registered');
}