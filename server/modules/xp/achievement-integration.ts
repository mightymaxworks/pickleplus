/**
 * PKL-278651-XP-0005-ACHIEVE
 * Achievement XP Integration
 * 
 * Provides integration between the Achievement System and XP System,
 * awarding XP for achievement unlocks and checking for XP-based achievements.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { db } from '../../db';
import { ActivityMultiplierService } from './ActivityMultiplierService';
import { XpService } from './xp-service';
import { ServerEventBus } from '../../core/events/server-event-bus';
import { eq, and, gte, sql } from 'drizzle-orm';
import { 
  achievements,
  userAchievements,
  xpTransactions,
  xpLevelThresholds
} from '@shared/schema';

export class AchievementXpIntegration {
  private xpService: XpService;
  private activityMultiplierService: ActivityMultiplierService;
  
  constructor(activityMultiplierService: ActivityMultiplierService) {
    this.activityMultiplierService = activityMultiplierService;
    this.xpService = new XpService();
    
    // Initialize event listeners
    this.registerEventListeners();
    
    console.log('[XP] AchievementXpIntegration initialized');
  }
  
  /**
   * Register event listeners for achievement-related events
   */
  private registerEventListeners(): void {
    // Listen for achievement unlock events
    ServerEventBus.subscribe('achievement:unlocked', this.handleAchievementUnlocked.bind(this));
    
    // Listen for XP awarded events to check for XP-based achievements
    ServerEventBus.subscribe('xp:awarded', this.checkXpBasedAchievements.bind(this));
    
    console.log('[XP] AchievementXpIntegration event listeners registered');
  }
  
  /**
   * Handle achievement unlocked event
   * Award XP based on achievement difficulty
   */
  private async handleAchievementUnlocked(data: any): Promise<void> {
    if (!data || !data.achievementId || !data.userId) {
      console.error('[XP] Invalid achievement unlock event data:', data);
      return;
    }
    
    try {
      // Get achievement details to determine XP reward
      const achievement = await db.query.achievements.findFirst({
        where: eq(achievements.id, data.achievementId)
      });
      
      if (!achievement) {
        console.error(`[XP] Achievement not found for ID: ${data.achievementId}`);
        return;
      }
      
      // Use direct XP reward from achievement if available, otherwise use difficulty
      const xpReward = achievement.xpReward || this.getXpRewardForTier(achievement.difficulty || 'medium');
      
      // Apply any active multipliers
      const multiplier = await this.activityMultiplierService.getCurrentActivityMultiplier('achievement');
      const finalXpReward = Math.round(xpReward * multiplier);
      
      // Award XP to the user
      await this.xpService.awardXp({
        userId: data.userId,
        amount: finalXpReward,
        source: 'achievement',
        sourceId: data.achievementId.toString(),
        sourceType: 'achievement_unlock',
        description: `Unlocked ${achievement.name} achievement`
      });
      
      console.log(`[XP] Awarded ${finalXpReward} XP to user ${data.userId} for achievement unlock: ${achievement.name}`);
    } catch (error) {
      console.error('[XP] Error awarding XP for achievement unlock:', error);
    }
  }
  
  /**
   * Check for XP-based achievements when XP is awarded
   */
  private async checkXpBasedAchievements(data: any): Promise<void> {
    if (!data || !data.userId) {
      return;
    }
    
    try {
      const userId = data.userId;
      
      // Get total XP for the user
      const totalXpResult = await db
        .select({
          totalXp: sql<number>`SUM(${xpTransactions.amount})`
        })
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, userId));
      
      const totalXp = totalXpResult[0]?.totalXp || 0;
      
      // Check for XP milestone achievements
      await this.checkXpMilestoneAchievements(userId, totalXp);
      
      // Check for level milestone achievements
      await this.checkLevelMilestoneAchievements(userId, totalXp);
      
    } catch (error) {
      console.error('[XP] Error checking XP-based achievements:', error);
    }
  }
  
  /**
   * Check for XP milestone achievements (based on total XP accumulated)
   */
  private async checkXpMilestoneAchievements(userId: number, totalXp: number): Promise<void> {
    try {
      // Get all XP milestone achievements
      const xpMilestoneAchievements = await db.query.achievements.findMany({
        where: eq(achievements.category, 'PROGRESSION')
      });
      
      // Check each achievement
      for (const achievement of xpMilestoneAchievements) {
        // Parse requirements as JSON to get the required XP
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
          
        const requiredXp = requirements?.xpRequired || 0;
        
        // If user has enough XP and hasn't unlocked this achievement yet
        if (totalXp >= requiredXp) {
          const existingUserAchievement = await db.query.userAchievements.findFirst({
            where: and(
              eq(userAchievements.userId, userId),
              eq(userAchievements.achievementId, achievement.id)
            )
          });
          
          // If not unlocked yet, unlock it
          if (!existingUserAchievement) {
            await this.unlockAchievement(userId, achievement.id, totalXp, requiredXp);
          }
        }
      }
    } catch (error) {
      console.error('[XP] Error checking XP milestone achievements:', error);
    }
  }
  
  /**
   * Check for level milestone achievements (based on level thresholds)
   */
  private async checkLevelMilestoneAchievements(userId: number, totalXp: number): Promise<void> {
    try {
      // Get user's current level
      const levelThresholds = await db.query.xpLevelThresholds.findMany({
        orderBy: (fields, { asc }) => [asc(fields.xpRequired)]
      });
      
      let currentLevel = 1;
      for (const threshold of levelThresholds) {
        if (totalXp >= threshold.xpRequired) {
          currentLevel = threshold.level;
        } else {
          break;
        }
      }
      
      // Get level milestone achievements
      const levelMilestoneAchievements = await db.query.achievements.findMany({
        where: eq(achievements.category, 'LEVEL')
      });
      
      // Check each achievement
      for (const achievement of levelMilestoneAchievements) {
        // Parse requirements as JSON to get the required level
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
          
        const requiredLevel = requirements?.levelRequired || 0;
        
        // If user has reached the required level and hasn't unlocked this achievement yet
        if (currentLevel >= requiredLevel) {
          const existingUserAchievement = await db.query.userAchievements.findFirst({
            where: and(
              eq(userAchievements.userId, userId),
              eq(userAchievements.achievementId, achievement.id)
            )
          });
          
          // If not unlocked yet, unlock it
          if (!existingUserAchievement) {
            await this.unlockAchievement(userId, achievement.id, currentLevel, requiredLevel);
          }
        }
      }
    } catch (error) {
      console.error('[XP] Error checking level milestone achievements:', error);
    }
  }
  
  /**
   * Unlock an achievement for a user
   */
  private async unlockAchievement(
    userId: number, 
    achievementId: number, 
    currentValue: number,
    requiredValue: number
  ): Promise<void> {
    try {
      const now = new Date();
      
      // Create new user achievement entry
      await db.insert(userAchievements).values({
        userId,
        achievementId,
        progress: currentValue,
        unlockedAt: now,
        completedAt: now,
        createdAt: now,
        updatedAt: now
      });
      
      // Emit achievement unlocked event
      ServerEventBus.publish('achievement:unlocked', {
        userId,
        achievementId,
        timestamp: now
      });
      
      console.log(`[XP] Achievement ${achievementId} unlocked for user ${userId}`);
    } catch (error) {
      console.error('[XP] Error unlocking achievement:', error);
    }
  }
  
  /**
   * Get XP reward amount based on achievement tier
   */
  private getXpRewardForTier(tier: string): number {
    switch (tier.toUpperCase()) {
      case 'BRONZE':
        return 10;
      case 'SILVER':
        return 20;
      case 'GOLD':
        return 35;
      case 'PLATINUM':
        return 50;
      case 'DIAMOND':
        return 75;
      case 'MASTER':
        return 100;
      default:
        return 5; // Basic tier
    }
  }
  
  /**
   * API method to get a user's achievements
   */
  async getUserAchievements(userId: number) {
    try {
      // Get all achievements
      const allAchievements = await db.query.achievements.findMany();
      
      // Get user's unlocked achievements
      const userAchievementsList = await db.query.userAchievements.findMany({
        where: eq(userAchievements.userId, userId)
      });
      
      // Map achievements with unlocked status
      const achievementsWithProgress = allAchievements.map(achievement => {
        const unlockedAchievement = userAchievementsList.find(ua => ua.achievementId === achievement.id);
        
        // Parse requirements as JSON
        const requirements = typeof achievement.requirements === 'string'
          ? JSON.parse(achievement.requirements)
          : achievement.requirements;
          
        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          difficulty: achievement.difficulty,
          category: achievement.category,
          badgeUrl: achievement.badgeUrl,
          xpReward: achievement.xpReward,
          isUnlocked: !!unlockedAchievement,
          unlockedAt: unlockedAchievement?.unlockedAt ? unlockedAchievement.unlockedAt.toISOString() : null,
          progress: unlockedAchievement?.progress || 0,
          requirements
        };
      });
      
      // Get total XP for XP progress achievements
      const totalXpResult = await db
        .select({
          totalXp: sql<number>`SUM(${xpTransactions.amount})`
        })
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, userId));
      
      const totalXp = totalXpResult[0]?.totalXp || 0;
      
      // Get user's current level
      const levelThresholds = await db.query.xpLevelThresholds.findMany({
        orderBy: (fields, { asc }) => [asc(fields.xpRequired)]
      });
      
      let currentLevel = 1;
      let nextLevel = 2;
      let currentLevelXp = 0;
      let nextLevelXp = 100;
      
      for (let i = 0; i < levelThresholds.length; i++) {
        if (totalXp >= levelThresholds[i].xpRequired) {
          currentLevel = levelThresholds[i].level;
          currentLevelXp = levelThresholds[i].xpRequired;
          
          if (i < levelThresholds.length - 1) {
            nextLevel = levelThresholds[i + 1].level;
            nextLevelXp = levelThresholds[i + 1].xpRequired;
          }
        } else {
          if (i > 0) {
            currentLevelXp = levelThresholds[i - 1].xpRequired;
          }
          nextLevelXp = levelThresholds[i].xpRequired;
          nextLevel = levelThresholds[i].level;
          break;
        }
      }
      
      // Calculate XP progress to next level
      const levelProgress = nextLevelXp > currentLevelXp
        ? Math.min(100, Math.floor(((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))
        : 100;
      
      return {
        achievements: achievementsWithProgress,
        stats: {
          totalXp,
          currentLevel,
          nextLevel,
          levelProgress,
          unlockedCount: userAchievementsList.length,
          totalCount: allAchievements.length
        }
      };
    } catch (error) {
      console.error('[XP] Error getting user achievements:', error);
      throw error;
    }
  }
}