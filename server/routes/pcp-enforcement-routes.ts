/**
 * PCP Sequential Enforcement API Routes
 * Phase 4: Critical Gap Implementation - API endpoints for PCP sequential enforcement
 */

import { Router } from "express";
import { z } from "zod";
import PcpSequentialEnforcementService from "../services/pcp-sequential-enforcement";
import { pcpLevelApplicationSchema } from "../../shared/schema";

const router = Router();

/**
 * POST /api/pcp/validate-level-application
 * Core validation endpoint - checks if user can apply for requested PCP level
 */
router.post("/validate-level-application", async (req, res) => {
  try {
    const validationRequest = pcpLevelApplicationSchema.parse(req.body);
    const result = await PcpSequentialEnforcementService.validateLevelProgression(validationRequest);
    
    res.json({
      success: true,
      validation: result,
      message: result.allowed 
        ? `Level ${result.requestedLevel} application validated successfully`
        : `Level ${result.requestedLevel} application blocked: ${result.blockingReason}`
    });
  } catch (error) {
    console.error("PCP validation error:", error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : "Validation failed",
      message: "Invalid application request"
    });
  }
});

/**
 * GET /api/pcp/certification-status/:userId
 * Get current certification status and eligibility
 */
router.get("/certification-status/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }
    
    const status = await PcpSequentialEnforcementService.getCertificationStatus(userId);
    
    res.json({
      success: true,
      certification: status,
      sequentialEnforcement: {
        enabled: true,
        currentLevel: status.currentLevel,
        eligibleForLevel: status.eligibleForLevel,
        completedLevels: status.completedLevels,
        unlimitedAccess: status.unlimitedAccess
      }
    });
  } catch (error) {
    console.error("Get certification status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve certification status"
    });
  }
});

/**
 * POST /api/pcp/complete-level
 * Update certification after successful level completion
 */
router.post("/complete-level", async (req, res) => {
  try {
    const schema = z.object({
      userId: z.number(),
      completedLevel: z.number().min(1).max(5),
      sessionData: z.object({
        totalSessions: z.number().optional(),
        revenue: z.number().optional()
      }).optional()
    });
    
    const { userId, completedLevel, sessionData } = schema.parse(req.body);
    
    // Validate the completion is allowed
    const validation = await PcpSequentialEnforcementService.validateLevelProgression({
      userId,
      requestedLevel: completedLevel,
      currentLevel: 0, // Will be fetched
      bypassValidation: false
    });
    
    if (!validation.allowed) {
      return res.status(403).json({
        success: false,
        error: "Level completion not allowed",
        blockingReason: validation.blockingReason,
        missingRequirements: validation.missingRequirements
      });
    }
    
    await PcpSequentialEnforcementService.updateCertificationLevel(userId, completedLevel, sessionData);
    
    const updatedStatus = await PcpSequentialEnforcementService.getCertificationStatus(userId);
    
    res.json({
      success: true,
      message: `Level ${completedLevel} certification completed successfully`,
      certification: updatedStatus,
      unlimitedAccessGranted: updatedStatus.unlimitedAccess
    });
  } catch (error) {
    console.error("Complete level error:", error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : "Failed to complete level"
    });
  }
});

/**
 * GET /api/pcp/unlimited-access/:userId
 * Check if user has unlimited platform access (Level 1+)
 */
router.get("/unlimited-access/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }
    
    const hasAccess = await PcpSequentialEnforcementService.hasUnlimitedAccess(userId);
    
    res.json({
      success: true,
      unlimitedAccess: hasAccess,
      message: hasAccess 
        ? "Unlimited platform access granted (PCP Level 1+)"
        : "Limited access - PCP certification required"
    });
  } catch (error) {
    console.error("Check unlimited access error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check access status"
    });
  }
});

/**
 * POST /api/pcp/admin/override-level
 * Admin-only: Override sequential enforcement for special cases
 */
router.post("/admin/override-level", async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const schema = z.object({
      userId: z.number(),
      targetLevel: z.number().min(0).max(5),
      adminUserId: z.number(),
      reason: z.string().min(10)
    });
    
    const { userId, targetLevel, adminUserId, reason } = schema.parse(req.body);
    
    const result = await PcpSequentialEnforcementService.adminOverride(
      userId, 
      targetLevel, 
      adminUserId, 
      reason
    );
    
    res.json({
      success: true,
      message: `Admin override: User ${userId} set to Level ${targetLevel}`,
      validation: result,
      adminAction: {
        adminUserId,
        reason,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Admin override error:", error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? error.errors : "Admin override failed"
    });
  }
});

/**
 * POST /api/pcp/block-attempt
 * Record blocked attempt for analytics and rate limiting
 */
router.post("/block-attempt", async (req, res) => {
  try {
    const schema = z.object({
      userId: z.number(),
      attemptedLevel: z.number().min(1).max(5),
      reason: z.string()
    });
    
    const { userId, attemptedLevel, reason } = schema.parse(req.body);
    
    await PcpSequentialEnforcementService.recordBlockedAttempt(userId, attemptedLevel, reason);
    
    res.json({
      success: true,
      message: "Blocked attempt recorded",
      cooldownActive: true
    });
  } catch (error) {
    console.error("Block attempt error:", error);
    res.status(400).json({
      success: false,
      error: "Failed to record blocked attempt"
    });
  }
});

/**
 * GET /api/pcp/enforcement-status
 * System status endpoint - shows if sequential enforcement is active
 */
router.get("/enforcement-status", async (req, res) => {
  res.json({
    success: true,
    enforcement: {
      enabled: true,
      version: "1.0.0",
      description: "PCP Sequential Enforcement System - Phase 4 Implementation",
      rules: [
        "Level progression must be sequential: 1→2→3→4→5",
        "Level skipping is not allowed",
        "Level downgrading is not permitted",
        "Unlimited platform access granted at Level 1+",
        "Business optimization tools available as premium upgrade"
      ],
      levels: {
        0: "Not Certified",
        1: "Clear Communication - Entry Coach", 
        2: "Structured Coaching - Development Coach",
        3: "Advanced Strategies - Senior Coach", 
        4: "Leadership Excellence - Master Coach",
        5: "Innovation & Mastery - Expert Coach"
      }
    }
  });
});

export default router;