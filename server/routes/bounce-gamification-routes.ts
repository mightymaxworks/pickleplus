/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Gamification Routes
 * 
 * This file contains the routes for the Bounce gamification system,
 * handling user achievements, rewards, and game interactions.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express, { Request, Response } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { db } from '../db';
import { 
  bounceAchievements, 
  userBounceAchievements 
} from '@shared/schema';
import { and, eq } from 'drizzle-orm';
import { storage } from '../storage';
import { ServerEventBus } from '../core/events/server-event-bus';

/**
 * Register routes related to Bounce gamification features
 * @param app Express application
 */
export function registerBounceGamificationRoutes(app: express.Express): void {
  /**
   * Get all available Bounce achievements
   * GET /api/bounce/achievements
   */
  app.get('/api/bounce/achievements', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const achievements = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.isActive, true));
      
      res.json(achievements);
    } catch (error) {
      console.error('[API] Error getting Bounce achievements:', error);
      res.status(500).json({ error: 'Failed to retrieve Bounce achievements' });
    }
  });
  
  /**
   * Get a user's Bounce achievements
   * GET /api/bounce/user-achievements
   */
  app.get('/api/bounce/user-achievements', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get user achievements with full achievement details
      const achievements = await db
        .select({
          userAchievement: userBounceAchievements,
          achievement: bounceAchievements
        })
        .from(userBounceAchievements)
        .innerJoin(
          bounceAchievements,
          eq(userBounceAchievements.achievementId, bounceAchievements.id)
        )
        .where(eq(userBounceAchievements.userId, userId));
      
      // Format response
      const formattedAchievements = achievements.map(({ userAchievement, achievement }) => ({
        ...achievement,
        awardedAt: userAchievement.awardedAt,
        isComplete: userAchievement.isComplete
      }));
      
      res.json(formattedAchievements);
    } catch (error) {
      console.error('[API] Error getting user Bounce achievements:', error);
      res.status(500).json({ error: 'Failed to retrieve user Bounce achievements' });
    }
  });
  
  /**
   * Manually award an achievement to a user (admin only)
   * POST /api/admin/bounce/award-achievement
   */
  app.post('/api/admin/bounce/award-achievement', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, achievementId } = req.body;
      
      if (!userId || !achievementId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify achievement exists
      const [achievement] = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.id, achievementId));
      
      if (!achievement) {
        return res.status(404).json({ error: 'Achievement not found' });
      }
      
      // Check if user already has this achievement
      const [existingAchievement] = await db
        .select()
        .from(userBounceAchievements)
        .where(
          and(
            eq(userBounceAchievements.userId, userId),
            eq(userBounceAchievements.achievementId, achievementId)
          )
        );
      
      if (existingAchievement) {
        return res.status(409).json({ error: 'User already has this achievement' });
      }
      
      // Award the achievement
      const now = new Date();
      await db.insert(userBounceAchievements).values({
        userId,
        achievementId,
        isComplete: true,
        awardedAt: now,
        createdAt: now,
        updatedAt: now
      });
      
      // Emit achievement unlocked event
      ServerEventBus.publish('bounce:achievement:unlocked', {
        userId,
        achievementId,
        achievement,
        timestamp: now,
        awardedById: req.user!.id,
        awardedManually: true
      });
      
      res.json({ success: true, message: 'Achievement awarded successfully' });
    } catch (error) {
      console.error('[API] Error awarding Bounce achievement:', error);
      res.status(500).json({ error: 'Failed to award Bounce achievement' });
    }
  });
  
  /**
   * Get Bounce achievement progress for a user
   * GET /api/bounce/achievement-progress
   */
  app.get('/api/bounce/achievement-progress', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get basic achievement progress data
      const progress = await calculateAchievementProgress(userId);
      
      res.json(progress);
    } catch (error) {
      console.error('[API] Error getting Bounce achievement progress:', error);
      res.status(500).json({ error: 'Failed to retrieve Bounce achievement progress' });
    }
  });
}

/**
 * Calculate a user's achievement progress
 * @param userId User ID to calculate progress for
 * @returns Achievement progress data
 */
async function calculateAchievementProgress(userId: number) {
  try {
    // Get total achievements available
    const [totalCountResult] = await db
      .select({
        count: db.fn.count()
      })
      .from(bounceAchievements)
      .where(eq(bounceAchievements.isActive, true));
    
    const totalAchievements = Number(totalCountResult?.count || 0);
    
    // Get user's completed achievements
    const [completedCountResult] = await db
      .select({
        count: db.fn.count()
      })
      .from(userBounceAchievements)
      .where(
        and(
          eq(userBounceAchievements.userId, userId),
          eq(userBounceAchievements.isComplete, true)
        )
      );
    
    const completedAchievements = Number(completedCountResult?.count || 0);
    
    // Calculate completion percentage
    const completionPercentage = totalAchievements > 0
      ? Math.round((completedAchievements / totalAchievements) * 100)
      : 0;
    
    return {
      totalAchievements,
      completedAchievements,
      completionPercentage,
      remainingAchievements: totalAchievements - completedAchievements
    };
  } catch (error) {
    console.error('[API] Error calculating achievement progress:', error);
    throw error;
  }
}