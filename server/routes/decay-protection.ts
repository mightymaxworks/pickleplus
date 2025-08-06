/**
 * Decay Protection API Routes
 * 
 * Provides endpoints for tier-based decay protection with professional enhanced weighting
 * 
 * @framework Framework5.3
 * @version 1.0.0 - PROFESSIONAL TIER ENHANCED WEIGHTING
 * @lastModified 2025-08-06
 */

import { Router } from "express";
import { StandardizedRankingService } from "../services/StandardizedRankingService";
import { DecayProtectionService } from "../services/DecayProtectionService";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * GET /api/decay-protection/status/:userId
 * Get decay protection status for a specific user
 */
router.get("/status/:userId", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Verify user has permission (can only view own status unless admin)
    if ((req as any).user?.id !== userId && (req as any).user?.username !== 'admin') {
      return res.status(403).json({ error: "Permission denied" });
    }

    const status = await StandardizedRankingService.getDecayProtectionStatus(userId);
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error("Error fetching decay protection status:", error);
    res.status(500).json({ error: "Failed to fetch decay protection status" });
  }
});

/**
 * GET /api/decay-protection/activity/:userId
 * Get weighted activity breakdown for a user
 */
router.get("/activity/:userId", requireAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const daysBack = parseInt(req.query.days as string) || 30;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Verify user has permission
    if ((req as any).user?.id !== userId && (req as any).user?.username !== 'admin') {
      return res.status(403).json({ error: "Permission denied" });
    }

    const activity = await StandardizedRankingService.getWeightedActivity(userId, daysBack);
    
    res.json({
      success: true,
      data: activity
    });
    
  } catch (error) {
    console.error("Error fetching weighted activity:", error);
    res.status(500).json({ error: "Failed to fetch weighted activity" });
  }
});

/**
 * GET /api/decay-protection/my-status
 * Get decay protection status for current authenticated user
 */
router.get("/my-status", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const [status, activity] = await Promise.all([
      StandardizedRankingService.getDecayProtectionStatus(userId),
      StandardizedRankingService.getWeightedActivity(userId)
    ]);
    
    res.json({
      success: true,
      data: {
        protection: status,
        activity: activity
      }
    });
    
  } catch (error) {
    console.error("Error fetching user decay status:", error);
    res.status(500).json({ error: "Failed to fetch decay status" });
  }
});

/**
 * POST /api/decay-protection/process-weekly
 * Admin endpoint to manually trigger weekly decay processing
 */
router.post("/process-weekly", requireAuth, async (req, res) => {
  try {
    // Verify admin permission
    if ((req as any).user?.username !== 'admin') {
      return res.status(403).json({ error: "Admin permission required" });
    }

    const result = await StandardizedRankingService.processWeeklyDecay();
    
    res.json({
      success: true,
      message: "Weekly decay processing completed",
      data: result
    });
    
  } catch (error) {
    console.error("Error processing weekly decay:", error);
    res.status(500).json({ error: "Failed to process weekly decay" });
  }
});

/**
 * GET /api/decay-protection/tier-info/:points
 * Get tier information for given ranking points
 */
router.get("/tier-info/:points", async (req, res) => {
  try {
    const points = parseFloat(req.params.points);
    
    if (isNaN(points) || points < 0) {
      return res.status(400).json({ error: "Invalid points value" });
    }

    const tier = DecayProtectionService.getPlayerTier(points);
    const weighting = DecayProtectionService.getMatchWeighting(tier);
    
    res.json({
      success: true,
      data: {
        tier: tier,
        matchWeighting: weighting,
        examples: {
          noDecayActivity: {
            tournamentOnly: `${Math.ceil(4 / weighting.tournament)} tournaments/month`,
            leagueOnly: `${Math.ceil(4 / weighting.league)} league matches/month`,
            casualOnly: `${Math.ceil(4 / weighting.casual)} casual matches/month`,
            mixed: `1 tournament + ${Math.ceil((4 - weighting.tournament) / weighting.casual)} casual matches/month`
          }
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching tier info:", error);
    res.status(500).json({ error: "Failed to fetch tier information" });
  }
});

export default router;