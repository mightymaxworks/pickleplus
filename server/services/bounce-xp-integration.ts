/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce XP Integration Service
 * 
 * This service provides integration between the Bounce testing system and the platform XP system,
 * handling XP awards for testing activities, achievement unlocks, and other gamification elements.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from '../db';
import { XP_SOURCE, xpTransactions } from '../../shared/schema/xp';
import { 
  bounceInteractions, 
  BounceInteractionType,
  bounceFindings,
  userBounceAchievements,
  bounceAchievements
} from '@shared/schema';
import { eq, and, sql, sum, desc } from 'drizzle-orm';
import { ServerEventBus } from '../core/events/server-event-bus';

// Import the XpService and create an instance
import { XpService } from '../modules/xp/xp-service';
const xpService = new XpService();

/**
 * Bounce XP Integration Service
 * Provides methods for awarding and tracking XP related to Bounce testing activities
 */
export class BounceXpIntegration {
  constructor() {
    // Register event listeners for Bounce achievements and interactions
    this.registerEventListeners();
    console.log('[XP] BounceXpIntegration initialized with event listeners');
  }

  /**
   * Register event listeners for Bounce-related events
   */
  private registerEventListeners(): void {
    // Listen for achievement unlock events
    ServerEventBus.subscribe('bounce:achievement:unlocked', this.handleAchievementUnlocked.bind(this));
    
    // Listen for new findings being submitted
    ServerEventBus.subscribe('bounce:finding:created', this.handleFindingCreated.bind(this));
    
    // Listen for finding verifications
    ServerEventBus.subscribe('bounce:finding:verified', this.handleFindingVerified.bind(this));
    
    // Listen for testing participation
    ServerEventBus.subscribe('bounce:session:completed', this.handleSessionCompleted.bind(this));
  }

  /**
   * Handle achievement unlocked event
   */
  private async handleAchievementUnlocked(data: any): Promise<void> {
    if (!data || !data.userId || !data.achievementId) {
      console.error('[XP] Invalid Bounce achievement unlock event data:', data);
      return;
    }

    try {
      await this.awardAchievementXp(data.userId, data.achievementId);
    } catch (error) {
      console.error('[XP] Error handling bounce achievement unlock event:', error);
    }
  }

  /**
   * Handle finding created event
   */
  private async handleFindingCreated(data: any): Promise<void> {
    if (!data || !data.userId || !data.findingId || !data.severity) {
      console.error('[XP] Invalid Bounce finding created event data:', data);
      return;
    }

    try {
      await this.awardFindingXp(data.userId, data.findingId, data.severity);
    } catch (error) {
      console.error('[XP] Error handling bounce finding created event:', error);
    }
  }

  /**
   * Handle finding verified event
   */
  private async handleFindingVerified(data: any): Promise<void> {
    if (!data || !data.userId || !data.findingId) {
      console.error('[XP] Invalid Bounce finding verified event data:', data);
      return;
    }

    try {
      await this.awardVerificationXp(data.userId, data.findingId);
    } catch (error) {
      console.error('[XP] Error handling bounce finding verified event:', error);
    }
  }

  /**
   * Handle testing session completed event
   */
  private async handleSessionCompleted(data: any): Promise<void> {
    if (!data || !data.userId || !data.durationMinutes) {
      console.error('[XP] Invalid Bounce session completed event data:', data);
      return;
    }

    try {
      await this.awardParticipationXp(data.userId, data.durationMinutes);
    } catch (error) {
      console.error('[XP] Error handling bounce session completed event:', error);
    }
  }

  /**
   * Award XP for a new Bounce finding
   * @param userId User who discovered the finding
   * @param findingId ID of the finding that was created
   * @param findingSeverity Severity level of the finding
   * @returns The amount of XP awarded
   */
  async awardFindingXp(
    userId: number, 
    findingId: number, 
    findingSeverity: string
  ): Promise<number> {
    try {
      // XP awards based on finding severity
      const severityXpMap: Record<string, number> = {
        'critical': 25,
        'high': 15,
        'medium': 10,
        'low': 5,
        'cosmetic': 2
      };
      
      // Use the severity to determine the XP amount, or default to 5
      const baseXpAmount = severityXpMap[findingSeverity.toLowerCase()] || 5;
      
      // Get the finding details for the description
      const [finding] = await db
        .select({
          title: bounceFindings.title,
          affectedUrl: bounceFindings.affectedUrl
        })
        .from(bounceFindings)
        .where(eq(bounceFindings.id, findingId));
      
      // Award XP
      await xpService.awardXp({
        userId,
        amount: baseXpAmount,
        source: XP_SOURCE.BOUNCE,
        sourceType: 'finding',
        sourceId: findingId.toString(),
        description: `Found issue: ${finding?.title || 'Untitled'} in ${finding?.affectedUrl || 'Unknown area'}`,
        metadata: {
          findingId,
          findingSeverity
        }
      });
      
      console.log(`[XP] Awarded ${baseXpAmount} XP to user ${userId} for finding #${findingId}`);
      
      // Trigger check for any achievements based on findings count
      await this.checkFindingCountAchievements(userId);
      
      return baseXpAmount;
    } catch (error) {
      console.error('[XP] Error awarding XP for finding:', error);
      throw error;
    }
  }
  
  /**
   * Award XP for verifying another user's finding
   * @param userId User who verified the finding
   * @param findingId ID of the finding that was verified
   * @returns The amount of XP awarded
   */
  async awardVerificationXp(
    userId: number,
    findingId: number
  ): Promise<number> {
    try {
      // Get the finding details for the description
      const [finding] = await db
        .select({
          title: bounceFindings.title,
          affectedUrl: bounceFindings.affectedUrl,
          severity: bounceFindings.severity
        })
        .from(bounceFindings)
        .where(eq(bounceFindings.id, findingId));
      
      // XP for verification is typically lower than for finding
      // Base amount is 3 XP, with bonus for higher severity findings
      let baseXpAmount = 3;
      
      if (finding?.severity) {
        if (['critical', 'high'].includes(finding.severity.toLowerCase())) {
          baseXpAmount = 5;
        }
      }
      
      // Award XP
      await xpService.awardXp({
        userId,
        amount: baseXpAmount,
        source: XP_SOURCE.BOUNCE,
        sourceType: 'verification',
        sourceId: findingId.toString(),
        description: `Verified finding: ${finding?.title || 'Untitled'} in ${finding?.affectedUrl || 'Unknown area'}`,
        metadata: {
          findingId,
          findingSeverity: finding?.severity
        }
      });
      
      console.log(`[XP] Awarded ${baseXpAmount} XP to user ${userId} for verifying finding #${findingId}`);
      
      // Trigger check for any achievements based on verification count
      await this.checkVerificationCountAchievements(userId);
      
      return baseXpAmount;
    } catch (error) {
      console.error('[XP] Error awarding XP for verification:', error);
      throw error;
    }
  }
  
  /**
   * Award XP for unlocking a Bounce achievement
   * @param userId User who unlocked the achievement
   * @param achievementId ID of the achievement that was unlocked
   * @returns The amount of XP awarded
   */
  async awardAchievementXp(
    userId: number,
    achievementId: number
  ): Promise<number> {
    try {
      // Get the achievement details
      const [achievement] = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.id, achievementId));
      
      if (!achievement) {
        throw new Error(`Achievement #${achievementId} not found`);
      }
      
      // Use the achievement's XP reward or a default of 10
      const xpAmount = achievement.xpReward || 10;
      
      // Award XP
      await xpService.awardXp({
        userId,
        amount: xpAmount,
        source: XP_SOURCE.BOUNCE,
        sourceType: 'achievement',
        sourceId: achievementId.toString(),
        description: `Unlocked achievement: ${achievement.name}`,
        metadata: {
          achievementId,
          achievementType: achievement.type
        }
      });
      
      console.log(`[XP] Awarded ${xpAmount} XP to user ${userId} for achievement #${achievementId}`);
      
      return xpAmount;
    } catch (error) {
      console.error('[XP] Error awarding XP for achievement:', error);
      throw error;
    }
  }
  
  /**
   * Award XP for testing participation
   * @param userId User who participated in testing
   * @param sessionDurationMinutes Duration of the testing session in minutes
   * @returns The amount of XP awarded
   */
  async awardParticipationXp(
    userId: number,
    sessionDurationMinutes: number
  ): Promise<number> {
    try {
      // Base award is 1 XP per 5 minutes of testing, capped at 20 XP per session
      const baseXpAmount = Math.min(Math.floor(sessionDurationMinutes / 5), 20);
      
      if (baseXpAmount === 0) {
        return 0; // Session too short to award XP
      }
      
      // Award XP
      await xpService.awardXp({
        userId,
        amount: baseXpAmount,
        source: XP_SOURCE.BOUNCE,
        sourceType: 'participation',
        description: `Participated in Bounce testing for ${sessionDurationMinutes} minutes`,
        metadata: {
          sessionDurationMinutes
        }
      });
      
      console.log(`[XP] Awarded ${baseXpAmount} XP to user ${userId} for ${sessionDurationMinutes} minutes of testing`);
      
      // Trigger check for any achievements based on participation time
      await this.checkParticipationTimeAchievements(userId);
      
      return baseXpAmount;
    } catch (error) {
      console.error('[XP] Error awarding XP for participation:', error);
      throw error;
    }
  }
  
  /**
   * Check for achievements based on finding count
   * @param userId User ID to check achievements for
   */
  private async checkFindingCountAchievements(userId: number): Promise<void> {
    try {
      // Count total findings by user
      const [countResult] = await db
        .select({
          total: count()
        })
        .from(bounceInteractions)
        .where(
          and(
            eq(bounceInteractions.userId, userId),
            eq(bounceInteractions.type, BounceInteractionType.REPORT_ISSUE)
          )
        );
      
      const totalFindings = countResult?.total || 0;
      
      // Get all finding count achievements
      const findingCountAchievements = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.type, 'ISSUE_DISCOVERY'));
      
      // Check for each achievement if it should be unlocked
      for (const achievement of findingCountAchievements) {
        // Only process if we have required findings count in the achievement
        if (achievement.requiredInteractions) {
          // Check if user already has this achievement
          const [existingAchievement] = await db
            .select()
            .from(userBounceAchievements)
            .where(
              and(
                eq(userBounceAchievements.userId, userId),
                eq(userBounceAchievements.achievementId, achievement.id)
              )
            );
          
          // If user doesn't have this achievement yet and has enough findings
          if (!existingAchievement && totalFindings >= achievement.requiredInteractions) {
            await this.unlockAchievement(userId, achievement.id);
          }
        }
      }
    } catch (error) {
      console.error('[XP] Error checking finding count achievements:', error);
    }
  }
  
  /**
   * Check for achievements based on verification count
   * @param userId User ID to check achievements for
   */
  private async checkVerificationCountAchievements(userId: number): Promise<void> {
    try {
      // Count total verifications by user
      const [countResult] = await db
        .select({
          total: count()
        })
        .from(bounceInteractions)
        .where(
          and(
            eq(bounceInteractions.userId, userId),
            eq(bounceInteractions.type, BounceInteractionType.CONFIRM_FINDING)
          )
        );
      
      const totalVerifications = countResult?.total || 0;
      
      // Get all verification count achievements
      const verificationCountAchievements = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.type, 'VERIFICATION'));
      
      // Check for each achievement if it should be unlocked
      for (const achievement of verificationCountAchievements) {
        // Only process if we have required verifications count in the achievement
        if (achievement.requiredInteractions) {
          // Check if user already has this achievement
          const [existingAchievement] = await db
            .select()
            .from(userBounceAchievements)
            .where(
              and(
                eq(userBounceAchievements.userId, userId),
                eq(userBounceAchievements.achievementId, achievement.id)
              )
            );
          
          // If user doesn't have this achievement yet and has enough verifications
          if (!existingAchievement && totalVerifications >= achievement.requiredInteractions) {
            await this.unlockAchievement(userId, achievement.id);
          }
        }
      }
    } catch (error) {
      console.error('[XP] Error checking verification count achievements:', error);
    }
  }
  
  /**
   * Check for achievements based on participation time
   * @param userId User ID to check achievements for
   */
  private async checkParticipationTimeAchievements(userId: number): Promise<void> {
    try {
      // Sum total participation time for user
      const [timeResult] = await db
        .select({
          total: sum(bounceInteractions.points) // Assuming points = minutes for PARTICIPATION interactions
        })
        .from(bounceInteractions)
        .where(
          and(
            eq(bounceInteractions.userId, userId),
            eq(bounceInteractions.type, BounceInteractionType.PARTICIPATE)
          )
        );
      
      const totalParticipationMinutes = timeResult?.total || 0;
      
      // Get all participation time achievements
      const participationAchievements = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.type, 'TESTER_PARTICIPATION'));
      
      // Check for each achievement if it should be unlocked
      for (const achievement of participationAchievements) {
        // Only process if we have required points (minutes) in the achievement
        if (achievement.requiredPoints) {
          // Check if user already has this achievement
          const [existingAchievement] = await db
            .select()
            .from(userBounceAchievements)
            .where(
              and(
                eq(userBounceAchievements.userId, userId),
                eq(userBounceAchievements.achievementId, achievement.id)
              )
            );
          
          // If user doesn't have this achievement yet and has enough participation time
          if (!existingAchievement && totalParticipationMinutes >= achievement.requiredPoints) {
            await this.unlockAchievement(userId, achievement.id);
          }
        }
      }
    } catch (error) {
      console.error('[XP] Error checking participation time achievements:', error);
    }
  }
  
  /**
   * Unlock an achievement for a user
   * @param userId User ID who earned the achievement
   * @param achievementId Achievement ID to unlock
   */
  private async unlockAchievement(userId: number, achievementId: number): Promise<void> {
    try {
      const now = new Date();
      
      // Insert user achievement record
      await db.insert(userBounceAchievements).values({
        userId,
        achievementId,
        isComplete: true,
        awardedAt: now,
        createdAt: now,
        updatedAt: now
      });
      
      console.log(`[XP] Unlocked Bounce achievement ${achievementId} for user ${userId}`);
      
      // Get achievement details for the event
      const [achievement] = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.id, achievementId));
      
      // Emit achievement unlocked event
      ServerEventBus.publish('bounce:achievement:unlocked', {
        userId,
        achievementId,
        achievement,
        timestamp: now
      });
      
      // Award XP for the achievement
      await this.awardAchievementXp(userId, achievementId);
    } catch (error) {
      console.error('[XP] Error unlocking Bounce achievement:', error);
    }
  }
  
  /**
   * Get a user's XP summary from Bounce activities
   * @param userId User ID to get summary for
   * @returns Summary of Bounce XP distribution
   */
  async getUserXpSummary(userId: number): Promise<{
    totalBounceXp: number;
    totalUserXp: number;
    xpFromFindings: number;
    xpFromVerifications: number;
    xpFromAchievements: number;
    xpFromParticipation: number;
    bounceXpPercentage: number;
    recentTransactions: any[];
  }> {
    try {
      // Get total user XP - updated for compatibility with XpService
      const userXpInfo = await xpService.getUserXpInfo(userId);
      const totalUserXp = userXpInfo.totalXp || 0;
      
      // Get total Bounce XP
      const totalBounceXpResult = await db
        .select({
          total: sum(xpTransactions.amount)
        })
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            eq(xpTransactions.source, XP_SOURCE.BOUNCE)
          )
        );
      
      // Get XP from findings
      const findingsXpResult = await db
        .select({
          total: sum(xpTransactions.amount)
        })
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            eq(xpTransactions.source, XP_SOURCE.BOUNCE),
            eq(xpTransactions.sourceType, 'finding')
          )
        );
      
      // Get XP from verifications
      const verificationsXpResult = await db
        .select({
          total: sum(xpTransactions.amount)
        })
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            eq(xpTransactions.source, XP_SOURCE.BOUNCE),
            eq(xpTransactions.sourceType, 'verification')
          )
        );
      
      // Get XP from achievements
      const achievementsXpResult = await db
        .select({
          total: sum(xpTransactions.amount)
        })
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            eq(xpTransactions.source, XP_SOURCE.BOUNCE),
            eq(xpTransactions.sourceType, 'achievement')
          )
        );
      
      // Get XP from participation
      const participationXpResult = await db
        .select({
          total: sum(xpTransactions.amount)
        })
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            eq(xpTransactions.source, XP_SOURCE.BOUNCE),
            eq(xpTransactions.sourceType, 'participation')
          )
        );
      
      // Get recent transactions
      const recentTransactions = await db
        .select()
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            eq(xpTransactions.source, XP_SOURCE.BOUNCE)
          )
        )
        .orderBy(desc(xpTransactions.createdAt))
        .limit(10);
      
      // Extract values with defaults in case there's no data
      const totalBounceXp = Number(totalBounceXpResult[0]?.total || 0);
      const xpFromFindings = Number(findingsXpResult[0]?.total || 0);
      const xpFromVerifications = Number(verificationsXpResult[0]?.total || 0);
      const xpFromAchievements = Number(achievementsXpResult[0]?.total || 0);
      const xpFromParticipation = Number(participationXpResult[0]?.total || 0);
      
      // Calculate percentage of total XP that came from Bounce
      const bounceXpPercentage = totalUserXp > 0 
        ? Math.round((totalBounceXp / totalUserXp) * 100) 
        : 0;
      
      return {
        totalBounceXp,
        totalUserXp,
        xpFromFindings,
        xpFromVerifications,
        xpFromAchievements,
        xpFromParticipation,
        bounceXpPercentage,
        recentTransactions
      };
    } catch (error) {
      console.error('Error getting user XP summary from Bounce:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const bounceXpIntegration = new BounceXpIntegration();