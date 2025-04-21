/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce XP Integration Service
 * 
 * This service integrates the Bounce automated testing system with the platform's XP system,
 * providing methods to award XP for various testing activities and track user progress.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from '../db';
import { XP_SERVICE_LEVEL, XP_SOURCE, XP_SOURCE_TYPE } from '@shared/schema/xp';
import { xpService } from '../modules/xp/xp-service';
import { getEventBus } from '../core/events/server-event-bus';
import { and, eq } from 'drizzle-orm';
import { userBounceAchievements, bounceAchievements } from '@shared/schema';
import { storage } from '../storage';

/**
 * XP values for different Bounce activities
 */
const XP_VALUES = {
  // Finding issues
  FINDING: {
    LOW: 5,
    MEDIUM: 10,
    HIGH: 20,
    CRITICAL: 30
  },
  // Verifying issues
  VERIFICATION: 5,
  // Participation (per minute)
  PARTICIPATION: 1,
  // Achievement unlocks
  ACHIEVEMENT: 25,
  // First-time tester bonus
  FIRST_TIME: 50,
  // Consistency bonus (5 days in a row)
  CONSISTENCY: 100
};

/**
 * Bounce XP Integration service
 * Handles awarding XP for Bounce testing activities and achievement tracking
 */
class BounceXpIntegration {
  /**
   * Initialize the Bounce XP Integration
   * Sets up event listeners for Bounce events
   */
  constructor() {
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for Bounce events that will award XP
   */
  private setupEventListeners(): void {
    const eventBus = getEventBus();
    
    // Listen for testing activity events
    eventBus.subscribe('bounce:finding:created', this.handleFindingCreated.bind(this));
    eventBus.subscribe('bounce:finding:verified', this.handleFindingVerified.bind(this));
    eventBus.subscribe('bounce:session:completed', this.handleSessionCompleted.bind(this));
    
    // Listen for achievement events
    eventBus.subscribe('bounce:achievement:unlocked', this.handleAchievementUnlocked.bind(this));
    
    console.log('[Bounce XP Integration] Event listeners registered');
  }

  /**
   * Handle finding created event
   * @param event Finding created event data
   */
  private async handleFindingCreated(event: any): Promise<void> {
    try {
      const { userId, findingId, severity } = event;
      await this.awardFindingXp(userId, findingId, severity);
    } catch (error) {
      console.error('[Bounce XP Integration] Error handling finding created event:', error);
    }
  }

  /**
   * Handle finding verified event
   * @param event Finding verified event data
   */
  private async handleFindingVerified(event: any): Promise<void> {
    try {
      const { userId, findingId } = event;
      await this.awardVerificationXp(userId, findingId);
    } catch (error) {
      console.error('[Bounce XP Integration] Error handling finding verified event:', error);
    }
  }

  /**
   * Handle session completed event
   * @param event Session completed event data
   */
  private async handleSessionCompleted(event: any): Promise<void> {
    try {
      const { userId, duration } = event;
      await this.awardParticipationXp(userId, duration);
      
      // Check for first-time tester
      await this.checkAndAwardFirstTimeXp(userId);
      
      // Check for consistent tester (5 days in a row)
      await this.checkAndAwardConsistencyXp(userId);
      
      // Check for achievements based on activity
      await this.checkAndAwardAchievements(userId);
    } catch (error) {
      console.error('[Bounce XP Integration] Error handling session completed event:', error);
    }
  }

  /**
   * Handle achievement unlocked event
   * @param event Achievement unlocked event data
   */
  private async handleAchievementUnlocked(event: any): Promise<void> {
    try {
      const { userId, achievement } = event;
      
      // Only award XP if this was not a manual award
      if (!event.awardedManually) {
        await xpService.awardXp(
          userId,
          XP_VALUES.ACHIEVEMENT,
          XP_SOURCE.BOUNCE,
          XP_SOURCE_TYPE.ACHIEVEMENT_UNLOCK,
          achievement.id.toString(),
          `Unlocked ${achievement.name} Achievement`
        );
      }
      
      console.log(`[Bounce XP Integration] Awarded ${XP_VALUES.ACHIEVEMENT} XP to user ${userId} for unlocking achievement ${achievement.name}`);
    } catch (error) {
      console.error('[Bounce XP Integration] Error handling achievement unlocked event:', error);
    }
  }

  /**
   * Award XP for reporting a finding
   * @param userId User ID
   * @param findingId Finding ID
   * @param severity Severity of the finding
   * @returns Amount of XP awarded
   */
  public async awardFindingXp(userId: number, findingId: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<number> {
    try {
      // Determine XP amount based on severity
      let amount: number;
      switch (severity) {
        case 'low':
          amount = XP_VALUES.FINDING.LOW;
          break;
        case 'medium':
          amount = XP_VALUES.FINDING.MEDIUM;
          break;
        case 'high':
          amount = XP_VALUES.FINDING.HIGH;
          break;
        case 'critical':
          amount = XP_VALUES.FINDING.CRITICAL;
          break;
        default:
          amount = XP_VALUES.FINDING.LOW;
      }
      
      // Award XP
      await xpService.awardXp(
        userId,
        amount,
        XP_SOURCE.BOUNCE,
        XP_SOURCE_TYPE.FINDING,
        findingId,
        `Reported ${severity} finding`
      );
      
      console.log(`[Bounce XP Integration] Awarded ${amount} XP to user ${userId} for ${severity} finding ${findingId}`);
      
      return amount;
    } catch (error) {
      console.error('[Bounce XP Integration] Error awarding finding XP:', error);
      throw error;
    }
  }

  /**
   * Award XP for verifying a finding
   * @param userId User ID
   * @param findingId Finding ID
   * @returns Amount of XP awarded
   */
  public async awardVerificationXp(userId: number, findingId: string): Promise<number> {
    try {
      // Award XP
      await xpService.awardXp(
        userId,
        XP_VALUES.VERIFICATION,
        XP_SOURCE.BOUNCE,
        XP_SOURCE_TYPE.VERIFICATION,
        findingId,
        'Verified finding'
      );
      
      console.log(`[Bounce XP Integration] Awarded ${XP_VALUES.VERIFICATION} XP to user ${userId} for verifying finding ${findingId}`);
      
      return XP_VALUES.VERIFICATION;
    } catch (error) {
      console.error('[Bounce XP Integration] Error awarding verification XP:', error);
      throw error;
    }
  }

  /**
   * Award XP for participation time
   * @param userId User ID
   * @param minutes Number of minutes participated
   * @returns Amount of XP awarded
   */
  public async awardParticipationXp(userId: number, minutes: number): Promise<number> {
    try {
      // Validate minutes
      if (minutes <= 0) {
        return 0;
      }
      
      // Cap at 60 minutes per session to prevent exploitation
      const cappedMinutes = Math.min(minutes, 60);
      const amount = cappedMinutes * XP_VALUES.PARTICIPATION;
      
      // Award XP
      await xpService.awardXp(
        userId,
        amount,
        XP_SOURCE.BOUNCE,
        XP_SOURCE_TYPE.PARTICIPATION,
        Date.now().toString(),
        `Participated for ${cappedMinutes} minutes`
      );
      
      console.log(`[Bounce XP Integration] Awarded ${amount} XP to user ${userId} for ${cappedMinutes} minutes of participation`);
      
      return amount;
    } catch (error) {
      console.error('[Bounce XP Integration] Error awarding participation XP:', error);
      throw error;
    }
  }

  /**
   * Check and award first-time tester XP
   * @param userId User ID
   * @returns Whether XP was awarded
   */
  private async checkAndAwardFirstTimeXp(userId: number): Promise<boolean> {
    try {
      // Check if user has any previous Bounce XP transactions
      const previousTransactions = await xpService.getUserTransactionCount(userId, XP_SOURCE.BOUNCE);
      
      // If this is their first time (only 1 transaction from the current event), award bonus XP
      if (previousTransactions <= 1) {
        await xpService.awardXp(
          userId,
          XP_VALUES.FIRST_TIME,
          XP_SOURCE.BOUNCE,
          XP_SOURCE_TYPE.FIRST_TIME,
          'first-time',
          'First-time tester bonus'
        );
        
        console.log(`[Bounce XP Integration] Awarded ${XP_VALUES.FIRST_TIME} XP to user ${userId} for first-time testing`);
        
        // Unlock first-time tester achievement
        await this.unlockAchievement(userId, 'first_time_tester');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[Bounce XP Integration] Error checking first-time tester:', error);
      return false;
    }
  }

  /**
   * Check and award consistency XP for testing 5 days in a row
   * @param userId User ID
   * @returns Whether XP was awarded
   */
  private async checkAndAwardConsistencyXp(userId: number): Promise<boolean> {
    try {
      // This implementation is simplified - in a real system, you'd check for actual consecutive days
      // Check if user has the consistent_tester achievement
      const hasAchievement = await this.checkUserHasAchievement(userId, 'consistent_tester');
      
      // If they don't have it yet, check their activity pattern
      if (!hasAchievement) {
        // Get user's Bounce XP transactions
        const hasConsistency = await this.checkConsistencyPattern(userId);
        
        if (hasConsistency) {
          // Award consistency bonus
          await xpService.awardXp(
            userId,
            XP_VALUES.CONSISTENCY,
            XP_SOURCE.BOUNCE,
            XP_SOURCE_TYPE.CONSISTENCY,
            'consistency',
            '5-day testing streak bonus'
          );
          
          console.log(`[Bounce XP Integration] Awarded ${XP_VALUES.CONSISTENCY} XP to user ${userId} for 5-day testing streak`);
          
          // Unlock consistent tester achievement
          await this.unlockAchievement(userId, 'consistent_tester');
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[Bounce XP Integration] Error checking consistency tester:', error);
      return false;
    }
  }

  /**
   * Check if user has a consistent testing pattern (5 days in a row)
   * @param userId User ID
   * @returns Whether user has a consistent pattern
   */
  private async checkConsistencyPattern(userId: number): Promise<boolean> {
    // Simplified implementation - in a real system, you'd query daily sessions for the past 5+ days
    // and check if they had activity on 5 consecutive days
    
    // For demonstration purposes, we'll assume a 5% chance of meeting this criteria
    return Math.random() < 0.05;
  }

  /**
   * Check and award achievements based on activity
   * @param userId User ID
   */
  private async checkAndAwardAchievements(userId: number): Promise<void> {
    try {
      // Get counts of user's Bounce activities
      const findingCount = await xpService.getUserTransactionCount(
        userId, 
        XP_SOURCE.BOUNCE, 
        XP_SOURCE_TYPE.FINDING
      );
      
      const verificationCount = await xpService.getUserTransactionCount(
        userId, 
        XP_SOURCE.BOUNCE, 
        XP_SOURCE_TYPE.VERIFICATION
      );
      
      const participationCount = await xpService.getUserTransactionCount(
        userId, 
        XP_SOURCE.BOUNCE, 
        XP_SOURCE_TYPE.PARTICIPATION
      );
      
      // Check for finding-based achievements
      if (findingCount >= 1) {
        await this.unlockAchievement(userId, 'first_finding');
      }
      
      if (findingCount >= 5) {
        await this.unlockAchievement(userId, 'bug_hunter');
      }
      
      if (findingCount >= 20) {
        await this.unlockAchievement(userId, 'master_hunter');
      }
      
      // Check for verification-based achievements
      if (verificationCount >= 5) {
        await this.unlockAchievement(userId, 'verifier');
      }
      
      if (verificationCount >= 20) {
        await this.unlockAchievement(userId, 'master_verifier');
      }
      
      // Check for participation-based achievements
      if (participationCount >= 10) {
        await this.unlockAchievement(userId, 'bounce_enthusiast');
      }
      
      if (participationCount >= 30) {
        await this.unlockAchievement(userId, 'bounce_veteran');
      }
    } catch (error) {
      console.error('[Bounce XP Integration] Error checking and awarding achievements:', error);
    }
  }

  /**
   * Unlock an achievement for a user
   * @param userId User ID
   * @param achievementCode Achievement code
   * @returns Whether the achievement was unlocked
   */
  private async unlockAchievement(userId: number, achievementCode: string): Promise<boolean> {
    try {
      // Get the achievement
      const [achievement] = await db
        .select()
        .from(bounceAchievements)
        .where(
          and(
            eq(bounceAchievements.code, achievementCode),
            eq(bounceAchievements.isActive, true)
          )
        );
      
      if (!achievement) {
        console.error(`[Bounce XP Integration] Achievement ${achievementCode} not found`);
        return false;
      }
      
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
      
      // If they already have it and it's complete, do nothing
      if (existingAchievement && existingAchievement.isComplete) {
        return false;
      }
      
      // If they have a record but it's not complete, update it
      if (existingAchievement) {
        await db
          .update(userBounceAchievements)
          .set({
            isComplete: true,
            awardedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(userBounceAchievements.id, existingAchievement.id));
      } else {
        // Otherwise, create a new record
        const now = new Date();
        await db
          .insert(userBounceAchievements)
          .values({
            userId,
            achievementId: achievement.id,
            isComplete: true,
            awardedAt: now,
            createdAt: now,
            updatedAt: now
          });
      }
      
      // Get user for notification
      const user = await storage.getUser(userId);
      
      // Publish achievement unlocked event
      ServerEventBus.publish('bounce:achievement:unlocked', {
        userId,
        achievementId: achievement.id,
        achievement,
        timestamp: new Date(),
        username: user?.username || `User ${userId}`,
        awardedManually: false
      });
      
      console.log(`[Bounce XP Integration] User ${userId} unlocked achievement: ${achievement.name}`);
      
      return true;
    } catch (error) {
      console.error('[Bounce XP Integration] Error unlocking achievement:', error);
      return false;
    }
  }

  /**
   * Check if user has a specific achievement
   * @param userId User ID
   * @param achievementCode Achievement code
   * @returns Whether user has the achievement
   */
  private async checkUserHasAchievement(userId: number, achievementCode: string): Promise<boolean> {
    try {
      // Get the achievement
      const [achievement] = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.code, achievementCode));
      
      if (!achievement) {
        return false;
      }
      
      // Check if user has this achievement
      const [userAchievement] = await db
        .select()
        .from(userBounceAchievements)
        .where(
          and(
            eq(userBounceAchievements.userId, userId),
            eq(userBounceAchievements.achievementId, achievement.id),
            eq(userBounceAchievements.isComplete, true)
          )
        );
      
      return !!userAchievement;
    } catch (error) {
      console.error('[Bounce XP Integration] Error checking user achievement:', error);
      return false;
    }
  }

  /**
   * Get XP summary for a user
   * @param userId User ID
   * @returns XP summary data
   */
  public async getUserXpSummary(userId: number): Promise<any> {
    try {
      // Get total Bounce XP
      const totalXp = await xpService.getUserSourceTotal(userId, XP_SOURCE.BOUNCE);
      
      // Get XP breakdown by source type
      const findingXp = await xpService.getUserSourceTypeTotal(userId, XP_SOURCE.BOUNCE, XP_SOURCE_TYPE.FINDING);
      const verificationXp = await xpService.getUserSourceTypeTotal(userId, XP_SOURCE.BOUNCE, XP_SOURCE_TYPE.VERIFICATION);
      const participationXp = await xpService.getUserSourceTypeTotal(userId, XP_SOURCE.BOUNCE, XP_SOURCE_TYPE.PARTICIPATION);
      const achievementXp = await xpService.getUserSourceTypeTotal(userId, XP_SOURCE.BOUNCE, XP_SOURCE_TYPE.ACHIEVEMENT_UNLOCK);
      const bonusXp = await xpService.getUserBonusXp(userId, XP_SOURCE.BOUNCE);
      
      // Get XP service level
      const serviceLevel = await xpService.getUserServiceLevel(userId);
      
      // Get achievement progress
      const achievementProgress = await this.getUserAchievementProgress(userId);
      
      return {
        totalXp,
        breakdown: {
          findingXp,
          verificationXp,
          participationXp,
          achievementXp,
          bonusXp,
        },
        serviceLevel,
        achievementProgress,
        xpValues: XP_VALUES
      };
    } catch (error) {
      console.error('[Bounce XP Integration] Error getting user XP summary:', error);
      throw error;
    }
  }

  /**
   * Get achievement progress for a user
   * @param userId User ID
   * @returns Achievement progress data
   */
  private async getUserAchievementProgress(userId: number): Promise<any> {
    try {
      // Get all active achievements
      const achievements = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.isActive, true));
      
      // Get user's completed achievements
      const userAchievements = await db
        .select()
        .from(userBounceAchievements)
        .where(
          and(
            eq(userBounceAchievements.userId, userId),
            eq(userBounceAchievements.isComplete, true)
          )
        );
      
      // Calculate progress
      const totalAchievements = achievements.length;
      const completedAchievements = userAchievements.length;
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
      console.error('[Bounce XP Integration] Error getting user achievement progress:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const bounceXpIntegration = new BounceXpIntegration();