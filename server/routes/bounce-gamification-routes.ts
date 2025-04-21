/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Gamification Routes
 * 
 * This file defines the API routes for the Bounce gamification system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import express from "express";
import { bounceGamificationService } from "../services/bounce-gamification-service";
import { isAuthenticated, isAdmin } from "../middleware/auth";
import { BounceInteractionType } from "@shared/schema";

export function registerBounceGamificationRoutes(app: express.Express): void {
  // Get achievements for current user
  app.get(
    "/api/bounce/gamification/achievements",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user!.id;
        const achievements = await bounceGamificationService.getUserAchievements(userId);
        
        res.json({
          success: true,
          data: achievements
        });
      } catch (error) {
        console.error("Error fetching user bounce achievements:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch achievements"
        });
      }
    }
  );
  
  // Get leaderboard
  app.get(
    "/api/bounce/gamification/leaderboard",
    async (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        
        const leaderboard = await bounceGamificationService.getLeaderboard(limit, offset);
        
        res.json({
          success: true,
          data: leaderboard
        });
      } catch (error) {
        console.error("Error fetching bounce leaderboard:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch leaderboard"
        });
      }
    }
  );
  
  // Get recent achievements
  app.get(
    "/api/bounce/gamification/recent-achievements",
    async (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 5;
        
        const recentAchievements = await bounceGamificationService.getRecentAchievements(limit);
        
        res.json({
          success: true,
          data: recentAchievements
        });
      } catch (error) {
        console.error("Error fetching recent bounce achievements:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch recent achievements"
        });
      }
    }
  );
  
  // Get user's leaderboard position
  app.get(
    "/api/bounce/gamification/my-position",
    isAuthenticated,
    async (req, res) => {
      try {
        const userId = req.user!.id;
        const position = await bounceGamificationService.getUserLeaderboardPosition(userId);
        
        res.json({
          success: true,
          data: position
        });
      } catch (error) {
        console.error("Error fetching user bounce leaderboard position:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch leaderboard position"
        });
      }
    }
  );
  
  // Record a user interaction (for admins/testing only)
  app.post(
    "/api/bounce/gamification/record-interaction",
    isAdmin,
    async (req, res) => {
      try {
        const { userId, findingId, interactionType, points, metadata } = req.body;
        
        if (!userId || !findingId || !interactionType) {
          return res.status(400).json({
            success: false,
            error: "Missing required fields"
          });
        }
        
        // Validate interaction type
        if (!Object.values(BounceInteractionType).includes(interactionType)) {
          return res.status(400).json({
            success: false,
            error: "Invalid interaction type"
          });
        }
        
        const result = await bounceGamificationService.processInteraction(
          userId,
          findingId,
          interactionType,
          points || getDefaultPointsForInteraction(interactionType),
          metadata
        );
        
        res.json({
          success: true,
          data: result
        });
      } catch (error) {
        console.error("Error recording bounce interaction:", error);
        res.status(500).json({
          success: false,
          error: "Failed to record interaction"
        });
      }
    }
  );
}

/**
 * Get default points for an interaction type
 */
function getDefaultPointsForInteraction(type: BounceInteractionType): number {
  switch (type) {
    case BounceInteractionType.REPORT_ISSUE:
      return 50;
    case BounceInteractionType.CONFIRM_FINDING:
      return 25;
    case BounceInteractionType.DISPUTE_FINDING:
      return 10;
    case BounceInteractionType.PROVIDE_FEEDBACK:
      return 30;
    case BounceInteractionType.VIEW_REPORT:
      return 5;
    default:
      return 10;
  }
}