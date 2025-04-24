/**
 * PKL-278651-COMM-0007 - Enhanced Referral System
 * API Routes for the referral system
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */

import express, { Request, Response } from 'express';
import { storage } from '../../storage';
import { isAuthenticated } from '../../middleware/auth';
import { z } from 'zod';
import { recordReferral, getNextAchievement } from './service';

const router = express.Router();

// Get user's referrals
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  console.log('Base referrals API called');
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    const userId = req.user.id;
    const referrals = await storage.getUserReferrals(userId);
    
    return res.json(referrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get user's referral achievements
router.get('/achievements', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    const userId = req.user.id;
    const achievements = await storage.getReferralAchievements(userId);
    
    return res.json(achievements);
  } catch (error) {
    console.error('Error fetching referral achievements:', error);
    return res.status(500).json({ error: 'Failed to fetch referral achievements' });
  }
});

// Get user's referral stats
router.get('/stats', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    const userId = req.user.id;
    const stats = await storage.getReferralStats(userId);
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return res.status(500).json({ error: 'Failed to fetch referral stats' });
  }
});

// Get pickleball tips for status ticker
router.get('/tips', async (req: Request, res: Response) => {
  try {
    const tips = await storage.getReferralTips();
    return res.json(tips);
  } catch (error) {
    console.error('Error fetching referral tips:', error);
    return res.status(500).json({ error: 'Failed to fetch referral tips' });
  }
});

// Get recent referral activity for status ticker
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const activity = await storage.getRecentReferralActivity();
    return res.json(activity);
  } catch (error) {
    console.error('Error fetching referral activity:', error);
    return res.status(500).json({ error: 'Failed to fetch referral activity' });
  }
});

// Record a referral
router.post('/record', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      referrerId: z.number(),
      newUserId: z.number()
    });
    
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request data', details: result.error });
    }
    
    const { referrerId, newUserId } = result.data;
    
    // Check if this referral already exists
    const existingReferral = await storage.getReferralByUsers(referrerId, newUserId);
    if (existingReferral) {
      return res.status(409).json({ error: 'Referral already recorded' });
    }
    
    const success = await recordReferral(referrerId, newUserId);
    
    if (success) {
      return res.status(201).json({ message: 'Referral recorded successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to record referral' });
    }
  } catch (error) {
    console.error('Error recording referral:', error);
    return res.status(500).json({ error: 'Failed to record referral' });
  }
});

// Get a user's next achievement
router.get('/next-achievement', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    const userId = req.user.id;
    const nextAchievement = await getNextAchievement(userId);
    
    return res.json(nextAchievement);
  } catch (error) {
    console.error('Error fetching next achievement:', error);
    return res.status(500).json({ error: 'Failed to fetch next achievement' });
  }
});

// Generate a referral link for a user
router.get('/generate-link', isAuthenticated, async (req: Request, res: Response) => {
  console.log('Generate Link API called');
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    
    const userId = req.user.id;
    const username = req.user.username;
    
    // Create a referral link with user ID encoded
    const referralLink = `${process.env.FRONTEND_URL || 'https://pickleplus.app'}/register?ref=${userId}`;
    
    return res.json({ 
      referralLink,
      shareMessage: `Join me on Pickle+ and level up your pickleball game! Sign up with my referral link: ${referralLink}`
    });
  } catch (error) {
    console.error('Error generating referral link:', error);
    return res.status(500).json({ error: 'Failed to generate referral link' });
  }
});

export default router;