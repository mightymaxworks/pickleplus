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

import express, { Request, Response } from 'express';
import { bounceXpIntegration } from '../services/bounce-xp-integration';
import { isAuthenticated } from '../middleware/auth';

/**
 * Register Bounce XP integration routes
 */
export function registerBounceXpRoutes(app: express.Express): void {
  console.log('[API] Bounce XP integration routes registered');
  
  /**
   * Get a summary of XP earned from Bounce testing activities
   * GET /api/bounce/gamification/xp-summary
   */
  app.get('/api/bounce/gamification/xp-summary', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const summary = await bounceXpIntegration.getUserXpSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error('Error getting Bounce XP summary:', error);
      res.status(500).json({ error: 'Failed to retrieve XP summary' });
    }
  });
  
  /**
   * Award XP for a finding
   * POST /api/bounce/gamification/award-finding-xp
   */
  app.post('/api/bounce/gamification/award-finding-xp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { findingId, findingSeverity } = req.body;
      
      if (!findingId || !findingSeverity) {
        return res.status(400).json({ error: 'Missing required fields: findingId, findingSeverity' });
      }
      
      const userId = req.user!.id;
      const xpAwarded = await bounceXpIntegration.awardFindingXp(userId, findingId, findingSeverity);
      
      res.json({ success: true, xpAwarded });
    } catch (error) {
      console.error('Error awarding finding XP:', error);
      res.status(500).json({ error: 'Failed to award XP for finding' });
    }
  });
  
  /**
   * Award XP for verifying a finding
   * POST /api/bounce/gamification/award-verification-xp
   */
  app.post('/api/bounce/gamification/award-verification-xp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { findingId } = req.body;
      
      if (!findingId) {
        return res.status(400).json({ error: 'Missing required field: findingId' });
      }
      
      const userId = req.user!.id;
      const xpAwarded = await bounceXpIntegration.awardVerificationXp(userId, findingId);
      
      res.json({ success: true, xpAwarded });
    } catch (error) {
      console.error('Error awarding verification XP:', error);
      res.status(500).json({ error: 'Failed to award XP for verification' });
    }
  });
  
  /**
   * Award XP for unlocking an achievement
   * POST /api/bounce/gamification/award-achievement-xp
   */
  app.post('/api/bounce/gamification/award-achievement-xp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { achievementId } = req.body;
      
      if (!achievementId) {
        return res.status(400).json({ error: 'Missing required field: achievementId' });
      }
      
      const userId = req.user!.id;
      const xpAwarded = await bounceXpIntegration.awardAchievementXp(userId, achievementId);
      
      res.json({ success: true, xpAwarded });
    } catch (error) {
      console.error('Error awarding achievement XP:', error);
      res.status(500).json({ error: 'Failed to award XP for achievement' });
    }
  });
  
  /**
   * Award XP for testing participation
   * POST /api/bounce/gamification/award-participation-xp
   */
  app.post('/api/bounce/gamification/award-participation-xp', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { sessionDurationMinutes } = req.body;
      
      if (!sessionDurationMinutes || typeof sessionDurationMinutes !== 'number') {
        return res.status(400).json({ error: 'Missing or invalid required field: sessionDurationMinutes' });
      }
      
      const userId = req.user!.id;
      const xpAwarded = await bounceXpIntegration.awardParticipationXp(userId, sessionDurationMinutes);
      
      res.json({ success: true, xpAwarded });
    } catch (error) {
      console.error('Error awarding participation XP:', error);
      res.status(500).json({ error: 'Failed to award XP for participation' });
    }
  });
}