/**
 * PCP Sequential Enforcement Service
 * Phase 4: Critical Gap Implementation
 * Ensures Level 1→2→3→4→5 sequential progression with no level skipping allowed
 */

import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import {
  pcpCoachCertifications,
  pcpLevelRequirements,
  pcpSequentialValidationLog,
  pcpBusinessMetrics,
  type PcpLevelApplication,
  type ValidationResult,
  type PcpCoachCertification,
  type InsertPcpSequentialValidationLog,
  PCP_LEVELS,
  PCP_LEVEL_NAMES
} from "../../shared/schema";
import { certificationApplications } from "../../shared/schema/course-modules";

export class PcpSequentialEnforcementService {
  
  /**
   * Core validation: Ensures sequential progression Level 1→2→3→4→5
   */
  static async validateLevelProgression(application: PcpLevelApplication): Promise<ValidationResult> {
    const { userId, requestedLevel, bypassValidation = false } = application;
    
    try {
      // Get current certification status
      const [certification] = await db
        .select()
        .from(pcpCoachCertifications)
        .where(eq(pcpCoachCertifications.userId, userId))
        .limit(1);
      
      const currentLevel = certification?.currentLevel || PCP_LEVELS.NOT_CERTIFIED;
      const eligibleLevel = certification?.eligibleForLevel || PCP_LEVELS.LEVEL_1;
      
      // Admin bypass for testing/special cases
      if (bypassValidation) {
        await this.logValidationAttempt({
          userId,
          attemptedLevel: requestedLevel,
          currentLevel,
          eligibleLevel,
          validationResult: 'allowed',
          blockingReason: 'admin_bypass',
          requestSource: 'admin_override'
        });
        return {
          allowed: true,
          currentLevel,
          requestedLevel,
          eligibleLevel: requestedLevel
        };
      }
      
      // CRITICAL: Sequential enforcement logic
      const validation = this.enforceSequentialProgression(currentLevel, requestedLevel, eligibleLevel);
      
      // Log the validation attempt
      await this.logValidationAttempt({
        userId,
        attemptedLevel: requestedLevel,
        currentLevel,
        eligibleLevel,
        validationResult: validation.allowed ? 'allowed' : 'blocked',
        blockingReason: validation.blockingReason,
        requestSource: 'application_form'
      });
      
      return validation;
      
    } catch (error) {
      console.error('PCP Sequential Validation Error:', error);
      
      // Log error attempt
      await this.logValidationAttempt({
        userId,
        attemptedLevel: requestedLevel,
        currentLevel: 0,
        eligibleLevel: 1,
        validationResult: 'blocked',
        blockingReason: 'system_error',
        requestSource: 'application_form'
      });
      
      return {
        allowed: false,
        currentLevel: 0,
        requestedLevel,
        eligibleLevel: 1,
        blockingReason: 'system_error'
      };
    }
  }
  
  /**
   * Core business logic: Sequential progression enforcement
   */
  private static enforceSequentialProgression(
    currentLevel: number, 
    requestedLevel: number, 
    eligibleLevel: number
  ): ValidationResult {
    
    // Case 1: Requesting same level (re-certification)
    if (requestedLevel === currentLevel) {
      return {
        allowed: true,
        currentLevel,
        requestedLevel,
        eligibleLevel,
        blockingReason: 'recertification_allowed'
      };
    }
    
    // Case 2: Requesting level higher than eligible (BLOCKED - Level skipping)
    if (requestedLevel > eligibleLevel) {
      const missingLevels = [];
      for (let level = currentLevel + 1; level < requestedLevel; level++) {
        missingLevels.push(PCP_LEVEL_NAMES[level as keyof typeof PCP_LEVEL_NAMES]);
      }
      
      return {
        allowed: false,
        currentLevel,
        requestedLevel,
        eligibleLevel,
        blockingReason: 'level_skip_not_allowed',
        missingRequirements: [
          `Must complete levels sequentially: ${missingLevels.join(' → ')}`,
          `Currently eligible for Level ${eligibleLevel} only`,
          'Level skipping is not permitted in the PCP certification system'
        ]
      };
    }
    
    // Case 3: Requesting level lower than current (BLOCKED - Downgrade)
    if (requestedLevel < currentLevel) {
      return {
        allowed: false,
        currentLevel,
        requestedLevel,
        eligibleLevel,
        blockingReason: 'level_downgrade_not_allowed',
        missingRequirements: [
          `Cannot downgrade from Level ${currentLevel} to Level ${requestedLevel}`,
          'Certifications can only progress forward',
          'Contact support if you need to update your certification status'
        ]
      };
    }
    
    // Case 4: Valid sequential progression (ALLOWED)
    if (requestedLevel === eligibleLevel && requestedLevel === currentLevel + 1) {
      return {
        allowed: true,
        currentLevel,
        requestedLevel,
        eligibleLevel,
        blockingReason: 'sequential_progression_valid'
      };
    }
    
    // Case 5: Any other scenario (BLOCKED - Safety)
    return {
      allowed: false,
      currentLevel,
      requestedLevel,
      eligibleLevel,
      blockingReason: 'invalid_progression_request',
      missingRequirements: [
        'Invalid certification progression request',
        `Current Level: ${currentLevel}, Requested: ${requestedLevel}, Eligible: ${eligibleLevel}`,
        'Please follow sequential progression: Level 1 → 2 → 3 → 4 → 5'
      ]
    };
  }
  
  /**
   * Initialize or get existing certification record
   */
  static async initializeCertification(userId: number): Promise<PcpCoachCertification> {
    const [existing] = await db
      .select()
      .from(pcpCoachCertifications)
      .where(eq(pcpCoachCertifications.userId, userId))
      .limit(1);
    
    if (existing) {
      return existing;
    }
    
    // Create new certification record
    const [newCertification] = await db
      .insert(pcpCoachCertifications)
      .values({
        userId,
        currentLevel: PCP_LEVELS.NOT_CERTIFIED,
        eligibleForLevel: PCP_LEVELS.LEVEL_1,
        completedLevels: [],
        blockedAttempts: [],
        certificationPath: 'standard',
        unlimitedAccessGranted: false
      })
      .returning();
    
    return newCertification;
  }
  
  /**
   * Update certification status after successful completion
   */
  static async updateCertificationLevel(
    userId: number, 
    completedLevel: number,
    sessionData?: { totalSessions?: number; revenue?: number }
  ): Promise<void> {
    const certification = await this.initializeCertification(userId);
    
    // Update completed levels array
    const updatedCompletedLevels = [...(certification.completedLevels || [])];
    if (!updatedCompletedLevels.includes(completedLevel)) {
      updatedCompletedLevels.push(completedLevel);
    }
    
    // Calculate next eligible level
    const nextEligibleLevel = Math.min(completedLevel + 1, PCP_LEVELS.LEVEL_5);
    
    // Grant unlimited access when Level 1+ is achieved
    const unlimitedAccess = completedLevel >= PCP_LEVELS.LEVEL_1;
    
    // Update certification record
    await db
      .update(pcpCoachCertifications)
      .set({
        currentLevel: completedLevel,
        eligibleForLevel: nextEligibleLevel,
        completedLevels: updatedCompletedLevels,
        unlimitedAccessGranted: unlimitedAccess,
        lastLevelUpgradeAt: new Date(),
        totalSessionsCompleted: (certification.totalSessionsCompleted || 0) + (sessionData?.totalSessions || 0),
        revenueGenerated: String((parseFloat(certification.revenueGenerated || '0') + (sessionData?.revenue || 0)).toFixed(2)),
        updatedAt: new Date()
      })
      .where(eq(pcpCoachCertifications.userId, userId));
    
    // Record business metrics
    await this.recordLevelCompletionMetrics(userId, completedLevel);
  }
  
  /**
   * Check if user has unlimited platform access (Level 1+)
   */
  static async hasUnlimitedAccess(userId: number): Promise<boolean> {
    const [certification] = await db
      .select({ unlimitedAccessGranted: pcpCoachCertifications.unlimitedAccessGranted })
      .from(pcpCoachCertifications)
      .where(eq(pcpCoachCertifications.userId, userId))
      .limit(1);
    
    return certification?.unlimitedAccessGranted || false;
  }
  
  /**
   * Get certification status summary
   */
  static async getCertificationStatus(userId: number) {
    const certification = await this.initializeCertification(userId);
    
    const [recentValidations] = await db
      .select()
      .from(pcpSequentialValidationLog)
      .where(eq(pcpSequentialValidationLog.userId, userId))
      .orderBy(desc(pcpSequentialValidationLog.createdAt))
      .limit(5);
    
    return {
      currentLevel: certification.currentLevel,
      eligibleForLevel: certification.eligibleForLevel,
      completedLevels: certification.completedLevels || [],
      unlimitedAccess: certification.unlimitedAccessGranted,
      totalSessions: certification.totalSessionsCompleted,
      revenueGenerated: parseFloat(certification.revenueGenerated || '0'),
      commissionTier: certification.commissionTier,
      premiumToolsAccess: certification.premiumBusinessToolsAccess,
      recentValidations: recentValidations || []
    };
  }
  
  /**
   * Log validation attempts for audit trail
   */
  private static async logValidationAttempt(logData: Omit<InsertPcpSequentialValidationLog, 'createdAt'>): Promise<void> {
    try {
      await db.insert(pcpSequentialValidationLog).values({
        ...logData,
        validationDetails: {
          timestamp: new Date().toISOString(),
          systemVersion: '1.0.0',
          enforcementActive: true
        }
      });
    } catch (error) {
      console.error('Failed to log PCP validation attempt:', error);
    }
  }
  
  /**
   * Record business intelligence metrics
   */
  private static async recordLevelCompletionMetrics(userId: number, level: number): Promise<void> {
    try {
      await db.insert(pcpBusinessMetrics).values({
        userId,
        certificationLevel: level,
        levelAchievedAt: new Date(),
        attemptsToPassLevel: 1, // Will be enhanced with actual attempt tracking
        sessionsCompletedAtLevel: 0,
        revenueGeneratedAtLevel: '0.00',
        studentsAcquiredAtLevel: 0
      });
    } catch (error) {
      console.error('Failed to record PCP business metrics:', error);
    }
  }
  
  /**
   * Admin function: Override enforcement for special cases
   */
  static async adminOverride(
    userId: number, 
    targetLevel: number, 
    adminUserId: number, 
    reason: string
  ): Promise<ValidationResult> {
    await this.logValidationAttempt({
      userId,
      attemptedLevel: targetLevel,
      currentLevel: 0, // Will be updated
      eligibleLevel: targetLevel,
      validationResult: 'allowed',
      blockingReason: 'admin_override',
      requestSource: 'admin_override',
      validationDetails: {
        adminUserId,
        reason,
        timestamp: new Date().toISOString()
      }
    });
    
    await this.updateCertificationLevel(userId, targetLevel);
    
    return {
      allowed: true,
      currentLevel: targetLevel,
      requestedLevel: targetLevel,
      eligibleLevel: targetLevel,
      blockingReason: 'admin_override'
    };
  }
  
  /**
   * Block user from attempting invalid level progressions
   */
  static async recordBlockedAttempt(userId: number, attemptedLevel: number, reason: string): Promise<void> {
    const certification = await this.initializeCertification(userId);
    
    const newBlockedAttempt = {
      level: attemptedLevel,
      reason,
      blockedAt: new Date().toISOString()
    };
    
    const updatedBlockedAttempts = [...(certification.blockedAttempts || []), newBlockedAttempt];
    
    await db
      .update(pcpCoachCertifications)
      .set({
        blockedAttempts: updatedBlockedAttempts,
        // Set cooldown period for repeated invalid attempts
        nextEligibilityDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        updatedAt: new Date()
      })
      .where(eq(pcpCoachCertifications.userId, userId));
  }
}

/**
 * Middleware function for API routes to enforce sequential progression
 */
export async function enforceSequentialProgression(
  userId: number,
  requestedLevel: number,
  requestSource: string = 'api'
): Promise<ValidationResult> {
  return await PcpSequentialEnforcementService.validateLevelProgression({
    userId,
    requestedLevel,
    currentLevel: 0, // Will be fetched from database
    bypassValidation: false,
    reason: `API request from ${requestSource}`
  });
}

/**
 * Business rule constants
 */
export const SEQUENTIAL_ENFORCEMENT_CONFIG = {
  ENABLE_STRICT_ENFORCEMENT: true,
  ALLOW_ADMIN_OVERRIDES: true,
  MAX_BLOCKED_ATTEMPTS_PER_DAY: 3,
  COOLDOWN_PERIOD_HOURS: 24,
  BUSINESS_REVENUE_TRACKING: true,
  COMMISSION_TIER_AUTO_UPGRADE: true
} as const;

export default PcpSequentialEnforcementService;