/**
 * PKL-278651-XP-0001-FOUND
 * XP System API Routes
 * 
 * This file defines the API endpoints for the XP system.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { xpService } from "../services/xp-service";
import { z } from "zod";
import { isAdmin, isAuthenticated } from "../middleware/auth";

/**
 * Register XP routes
 */
export function registerXpRoutes(app: any) {
  /**
   * Get current user's XP history
   * GET /api/xp/history
   */
  app.get("/api/xp/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const history = await xpService.getUserXpHistory(userId, limit, offset);
      res.json(history);
    } catch (error) {
      console.error("Error fetching XP history:", error);
      res.status(500).json({ error: "Failed to retrieve XP history" });
    }
  });

  /**
   * Get current user's level info
   * GET /api/xp/level
   */
  app.get("/api/xp/level", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const levelInfo = await xpService.getUserLevelInfo(userId);
      res.json(levelInfo);
    } catch (error) {
      console.error("Error fetching level info:", error);
      res.status(500).json({ error: "Failed to retrieve level information" });
    }
  });

  /**
   * Get recommended activities for current user
   * GET /api/xp/recommended-activities
   */
  app.get("/api/xp/recommended-activities", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const activities = await xpService.getRecommendedActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recommended activities:", error);
      res.status(500).json({ error: "Failed to retrieve recommended activities" });
    }
  });

  /**
   * Award XP to a user (admin only)
   * POST /api/admin/xp/award
   */
  app.post("/api/admin/xp/award", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        userId: z.number(),
        amount: z.number().min(1).max(1000),
        source: z.string(),
        sourceType: z.string().optional(),
        description: z.string().optional(),
        metadata: z.record(z.any()).optional()
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid request data", details: validationResult.error });
      }

      const data = validationResult.data;
      const newBalance = await xpService.awardXp({
        userId: data.userId,
        amount: data.amount,
        source: data.source as any,
        sourceType: data.sourceType,
        description: data.description,
        metadata: data.metadata,
        createdById: req.user!.id
      });

      res.json({ success: true, newBalance });
    } catch (error) {
      console.error("Error awarding XP:", error);
      res.status(500).json({ error: "Failed to award XP" });
    }
  });

  /**
   * Run Pickle Pulse™ recalibration (admin only)
   * POST /api/admin/xp/recalibrate
   */
  app.post("/api/admin/xp/recalibrate", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      await xpService.runPicklePulseRecalibration();
      res.json({ success: true, message: "Pickle Pulse™ recalibration completed successfully" });
    } catch (error) {
      console.error("Error running recalibration:", error);
      res.status(500).json({ error: "Failed to run Pickle Pulse™ recalibration" });
    }
  });
}