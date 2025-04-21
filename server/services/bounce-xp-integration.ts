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
import { xpService } from './xp-service';
import { XP_SOURCE, xpTransactions } from '../../shared/schema/xp';
import { 
  bounceInteractions, 
  BounceInteractionType,
  bounceFindings,
  userBounceAchievements,
  bounceAchievements
} from '@shared/schema';
import { eq, and, count, sum, desc } from 'drizzle-orm';

/**
 * Bounce XP Integration Service
 * Provides methods for awarding and tracking XP related to Bounce testing activities
 */
export class BounceXpIntegration {
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
          area: bounceFindings.area
        })
        .from(bounceFindings)
        .where(eq(bounceFindings.id, findingId));
      
      // Award XP
      const xpAwarded = await xpService.awardXp({
        userId,
        amount: baseXpAmount,
        source: XP_SOURCE.BOUNCE,
        sourceType: 'finding',
        sourceId: findingId,
        description: `Found issue: ${finding?.title || 'Untitled'} in ${finding?.area || 'Unknown area'}`,
        metadata: {
          findingId,
          findingSeverity
        }
      });
      
      console.log(`Awarded ${xpAwarded} XP to user ${userId} for finding #${findingId}`);
      
      return xpAwarded;
    } catch (error) {
      console.error('Error awarding XP for finding:', error);
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
          area: bounceFindings.area,
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
      const xpAwarded = await xpService.awardXp({
        userId,
        amount: baseXpAmount,
        source: XP_SOURCE.BOUNCE,
        sourceType: 'verification',
        sourceId: findingId,
        description: `Verified finding: ${finding?.title || 'Untitled'} in ${finding?.area || 'Unknown area'}`,
        metadata: {
          findingId,
          findingSeverity: finding?.severity
        }
      });
      
      console.log(`Awarded ${xpAwarded} XP to user ${userId} for verifying finding #${findingId}`);
      
      return xpAwarded;
    } catch (error) {
      console.error('Error awarding XP for verification:', error);
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
      const xpAwarded = await xpService.awardXp({
        userId,
        amount: xpAmount,
        source: XP_SOURCE.BOUNCE,
        sourceType: 'achievement',
        sourceId: achievementId,
        achievementId,
        description: `Unlocked achievement: ${achievement.name}`,
        metadata: {
          achievementId,
          achievementType: achievement.type
        }
      });
      
      console.log(`Awarded ${xpAwarded} XP to user ${userId} for achievement #${achievementId}`);
      
      return xpAwarded;
    } catch (error) {
      console.error('Error awarding XP for achievement:', error);
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
      const xpAwarded = await xpService.awardXp({
        userId,
        amount: baseXpAmount,
        source: XP_SOURCE.BOUNCE,
        sourceType: 'participation',
        description: `Participated in Bounce testing for ${sessionDurationMinutes} minutes`,
        metadata: {
          sessionDurationMinutes
        }
      });
      
      console.log(`Awarded ${xpAwarded} XP to user ${userId} for ${sessionDurationMinutes} minutes of testing`);
      
      return xpAwarded;
    } catch (error) {
      console.error('Error awarding XP for participation:', error);
      throw error;
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
    bounceXpPercentage: number;
    recentTransactions: any[];
  }> {
    try {
      // Get total user XP
      const totalUserXp = await xpService.getTotalUserXp(userId);
      
      // Get Bounce-specific XP totals
      const bounceXpTotals = await db
        .select({
          totalBounceXp: sum(xpTransactions.amount),
          xpFromFindings: sum(
            and(
              eq(xpTransactions.sourceType, 'finding'),
              eq(xpTransactions.userId, userId)
            ) ? xpTransactions.amount : 0
          ),
          xpFromVerifications: sum(
            and(
              eq(xpTransactions.sourceType, 'verification'),
              eq(xpTransactions.userId, userId)
            ) ? xpTransactions.amount : 0
          ),
          xpFromAchievements: sum(
            and(
              eq(xpTransactions.sourceType, 'achievement'),
              eq(xpTransactions.userId, userId)
            ) ? xpTransactions.amount : 0
          )
        })
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            eq(xpTransactions.source, XP_SOURCE.BOUNCE)
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
      
      // Default values in case there's no data
      const totalBounceXp = Number(bounceXpTotals[0]?.totalBounceXp || 0);
      const xpFromFindings = Number(bounceXpTotals[0]?.xpFromFindings || 0);
      const xpFromVerifications = Number(bounceXpTotals[0]?.xpFromVerifications || 0);
      const xpFromAchievements = Number(bounceXpTotals[0]?.xpFromAchievements || 0);
      
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