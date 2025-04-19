/**
 * PKL-278651-XP-0002-UI
 * XP System Routes
 * 
 * API endpoints for the XP system, including progress tracking,
 * history, and XP transactions.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import express, { Request, Response } from 'express';
import { XpService } from './xp-service';
import { isAuthenticated } from '../auth/auth-middleware';

const router = express.Router();
const xpService = new XpService();

/**
 * GET /api/xp/progress
 * Get user's XP progress and level info
 */
router.get('/progress', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Use authenticated user's ID or the one specified in query
    const userId = req.query.userId ? Number(req.query.userId) : req.user!.id;
    
    const levelInfo = await xpService.getUserLevelInfo(userId);
    
    // If requesting another user's info, verify permissions
    if (userId !== req.user!.id) {
      // For now, just allow access - in future, can add privacy or permissions checks
    }
    
    res.json(levelInfo);
  } catch (error) {
    console.error('Error getting XP progress:', error);
    res.status(500).json({ error: 'Failed to retrieve XP progress' });
  }
});

/**
 * GET /api/xp/history
 * Get user's XP history with pagination
 */
router.get('/history', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Use authenticated user's ID or the one specified in query
    const userId = req.query.userId ? Number(req.query.userId) : req.user!.id;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    
    // If requesting another user's info, verify permissions
    if (userId !== req.user!.id) {
      // For now, just allow access - in future, can add privacy or permissions checks
    }
    
    const history = await xpService.getUserXpHistory(userId, limit, offset);
    
    // Check if there are more results
    const totalCount = await xpService.countUserXpTransactions(userId);
    const hasMore = offset + history.length < totalCount;
    
    res.json({
      transactions: history,
      total: totalCount,
      hasMore
    });
  } catch (error) {
    console.error('Error getting XP history:', error);
    res.status(500).json({ error: 'Failed to retrieve XP history' });
  }
});

/**
 * GET /api/xp/recommended
 * Get recommended activities for earning XP
 */
router.get('/recommended', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    
    const recommendations = await xpService.getRecommendedActivities(userId, limit);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting XP recommendations:', error);
    res.status(500).json({ error: 'Failed to retrieve XP recommendations' });
  }
});

/**
 * POST /api/xp/award
 * Award XP to a user (admin or system use only)
 */
router.post('/award', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    // const isAdmin = req.user!.role === 'admin'; // Implement role-based check later
    const isAdmin = true; // For now, allow all authenticated users
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { userId, amount, source, sourceType, description } = req.body;
    
    if (!userId || !amount || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const awardedAmount = await xpService.awardXp({
      userId,
      amount,
      source,
      sourceType,
      description,
      createdById: req.user!.id
    });
    
    res.json({ awarded: awardedAmount });
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

export default router;