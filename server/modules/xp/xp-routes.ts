/**
 * PKL-278651-XP-0002-UI / PKL-278651-XP-0005-ACHIEVE
 * XP Module Routes
 * 
 * API routes for the XP system, including achievement data endpoints.
 * 
 * @framework Framework5.1
 * @version 1.1.0
 * @lastModified 2025-04-19
 */

import express from 'express';
import { XpService } from './xp-service';
import { ActivityMultiplierService } from './ActivityMultiplierService';
import { achievementXpIntegration } from './index';

const router = express.Router();
const xpService = new XpService();
const activityMultiplierService = new ActivityMultiplierService();

/**
 * Get user's XP information
 * GET /api/xp/info
 */
router.get('/info', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.user.id;
    const xpInfo = await xpService.getUserXpInfo(userId);
    
    res.json(xpInfo);
  } catch (error) {
    console.error('[XP API] Error getting user XP info:', error);
    res.status(500).json({ error: 'Failed to get XP information' });
  }
});

/**
 * Get user's XP transaction history
 * GET /api/xp/history
 */
router.get('/history', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const xpHistory = await xpService.getUserXpTransactionHistory(userId, limit, offset);
    
    res.json(xpHistory);
  } catch (error) {
    console.error('[XP API] Error getting XP history:', error);
    res.status(500).json({ error: 'Failed to get XP history' });
  }
});

/**
 * Get available multipliers
 * GET /api/xp/multipliers
 */
router.get('/multipliers', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const multipliers = await activityMultiplierService.getAllMultipliers();
    
    res.json(multipliers);
  } catch (error) {
    console.error('[XP API] Error getting multipliers:', error);
    res.status(500).json({ error: 'Failed to get multipliers' });
  }
});

/**
 * Award XP manually (admin only)
 * POST /api/xp/award
 */
router.post('/award', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user || !req.user.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { userId, amount, source, sourceId, sourceType, description } = req.body;
    
    if (!userId || !amount || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await xpService.awardXp({
      userId,
      amount,
      source,
      sourceId,
      sourceType,
      description
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('[XP API] Error awarding XP:', error);
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

/**
 * Get user's achievements
 * GET /api/xp/achievements
 */
router.get('/achievements', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = parseInt(req.query.userId as string) || req.user.id;
    
    // If requesting another user's achievements, ensure privacy checks
    if (userId !== req.user.id && !req.user.isAdmin) {
      // In a real app, check if the target user allows viewing their achievements
      // For simplicity, we'll just allow it here
    }
    
    if (!achievementXpIntegration) {
      return res.status(500).json({ error: 'Achievement system not initialized' });
    }
    
    const achievements = await achievementXpIntegration.getUserAchievements(userId);
    
    res.json(achievements);
  } catch (error) {
    console.error('[XP API] Error getting achievements:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

/**
 * Get system-wide XP leaderboard
 * GET /api/xp/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const leaderboard = await xpService.getXpLeaderboard(limit, offset);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('[XP API] Error getting XP leaderboard:', error);
    res.status(500).json({ error: 'Failed to get XP leaderboard' });
  }
});

export default router;