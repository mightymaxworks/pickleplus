/**
 * PKL-278651-XP-0001-FOUND
 * XP System API Routes
 * 
 * This file defines the API endpoints for the XP system.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { xpTransactions, xpLevelThresholds, activityMultipliers, XP_SOURCE } from '../../../shared/schema/xp';
import { users } from '../../../shared/schema';
import { isAuthenticated, isAdmin } from '../../middleware/auth';
import { eq, desc, and, sql } from 'drizzle-orm';
import { xpService } from './xp-service';

// Validation schema for XP awarding
const awardXpSchema = z.object({
  userId: z.number(),
  amount: z.number().positive(),
  source: z.enum([
    XP_SOURCE.MATCH, 
    XP_SOURCE.COMMUNITY, 
    XP_SOURCE.PROFILE, 
    XP_SOURCE.ACHIEVEMENT,
    XP_SOURCE.TOURNAMENT,
    XP_SOURCE.REDEMPTION,
    XP_SOURCE.ADMIN
  ]),
  sourceType: z.string().optional(),
  sourceId: z.number().optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Register XP routes
 */
export function registerXpRoutes(app: Express) {
  console.log('[XP] Registering XP system routes...');
  
  /**
   * Get current user's XP history
   * GET /api/xp/history
   */
  app.get("/api/xp/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const history = await xpService.getUserXpHistory(userId, limit, offset);
      
      return res.status(200).json(history);
    } catch (error) {
      console.error("[XP] Error getting XP history:", error);
      return res.status(500).json({ message: "Failed to retrieve XP history" });
    }
  });

  /**
   * Get current user's level info
   * GET /api/xp/level
   */
  app.get("/api/xp/level", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const levelInfo = await xpService.getUserLevelInfo(userId);
      
      return res.status(200).json(levelInfo);
    } catch (error) {
      console.error("[XP] Error getting level info:", error);
      return res.status(500).json({ message: "Failed to retrieve level information" });
    }
  });

  /**
   * Get recommended activities for current user
   * GET /api/xp/recommended-activities
   */
  app.get("/api/xp/recommended-activities", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const limit = parseInt(req.query.limit as string) || 5;
      
      const recommendedActivities = await xpService.getRecommendedActivities(userId, limit);
      
      return res.status(200).json(recommendedActivities);
    } catch (error) {
      console.error("[XP] Error getting recommended activities:", error);
      return res.status(500).json({ message: "Failed to retrieve recommended activities" });
    }
  });

  /**
   * Award XP to a user (admin only)
   * POST /api/admin/xp/award
   */
  app.post("/api/admin/xp/award", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const validation = awardXpSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid award XP request", errors: validation.error.errors });
      }
      
      const data = validation.data;
      
      // Check if user exists
      const userExists = await db.select({ id: users.id }).from(users).where(eq(users.id, data.userId));
      
      if (userExists.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Award XP through the service
      const result = await xpService.awardXp({
        ...data,
        createdById: req.user?.id
      });
      
      return res.status(201).json({ 
        message: `Successfully awarded ${data.amount} XP to user ${data.userId}`,
        xpAwarded: result
      });
    } catch (error) {
      console.error("[XP] Error awarding XP:", error);
      return res.status(500).json({ message: "Failed to award XP" });
    }
  });

  /**
   * Run Pickle Pulse™ recalibration (admin only)
   * POST /api/admin/xp/recalibrate
   */
  app.post("/api/admin/xp/recalibrate", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      await xpService.runPicklePulseRecalibration();
      
      return res.status(200).json({ 
        message: "Successfully recalibrated Pickle Pulse™ multipliers"
      });
    } catch (error) {
      console.error("[XP] Error recalibrating Pickle Pulse:", error);
      return res.status(500).json({ message: "Failed to recalibrate Pickle Pulse™ multipliers" });
    }
  });
  
  console.log('[XP] XP system routes registered successfully');
}