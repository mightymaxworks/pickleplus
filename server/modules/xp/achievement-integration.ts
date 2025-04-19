/**
 * PKL-278651-XP-0005-ACHIEVE
 * Achievement System XP Integration Module
 * 
 * This module integrates the Achievement System with the XP System,
 * awarding XP for unlocking achievements and tracking progress
 * toward XP-based achievements.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { db } from '../../db';
import { sql } from 'drizzle-orm';
import { 
  xpTransactions,
  XP_SOURCE
} from '../../../shared/schema/xp';

import { ServerEventBus, ServerEvents } from '../../core/events';
import { ActivityMultiplierService } from './ActivityMultiplierService';

/**
 * XP values for different achievement tiers
 */
export const ACHIEVEMENT_XP_VALUES: Record<string, number> = {
  'BRONZE': 10,
  'SILVER': 20,
  'GOLD': 35,
  'PLATINUM': 50,
  'DIAMOND': 75,
  'MASTER': 100
};

export class AchievementXpIntegration {
  private multiplierService: ActivityMultiplierService;
  
  constructor(multiplierService: ActivityMultiplierService) {
    this.multiplierService = multiplierService;
    this.setupEventListeners();
    
    // Initialize default multipliers for achievement activities
    this.multiplierService.initializeDefaultMultipliers()
      .then(() => console.log('[XP] Achievement multipliers initialized'))
      .catch(err => console.error('[XP] Error initializing achievement multipliers:', err));
      
    console.log('[XP] Achievement XP Integration initialized - Framework 5.1');
  }
  
  /**
   * Set up event listeners for achievement events
   */
  private setupEventListeners() {
    console.log('[XP] Setting up achievement event listeners');

    // Listen for achievement unlocked events
    ServerEventBus.subscribe(ServerEvents.ACHIEVEMENT_UNLOCKED, async (data: {
      userId: number;
      achievementId: number;
      achievementTitle: string;
      achievementTier: string;
      achievementCategory: string;
    }) => {
      console.log(`[XP] Received achievement unlocked event for user ${data.userId}: ${data.achievementTitle} (${data.achievementTier})`);
      
      try {
        // Award XP for the achievement
        await this.awardAchievementXp(
          data.userId,
          data.achievementId,
          data.achievementTier,
          data.achievementTitle,
          data.achievementCategory
        );
      } catch (error) {
        console.error('[XP] Error processing achievement XP:', error);
      }
    });
    
    // Listen for achievement progress events to track XP-based achievements
    ServerEventBus.subscribe(ServerEvents.XP_AWARDED, async (data: {
      userId: number;
      amount: number;
      source: string;
      sourceType: string;
      newTotal: number;
    }) => {
      try {
        // Check for XP-based achievements that might be unlocked
        await this.checkXpBasedAchievements(data.userId, data.newTotal);
      } catch (error) {
        console.error('[XP] Error checking XP-based achievements:', error);
      }
    });
  }
  
  /**
   * Award XP for unlocking an achievement
   */
  private async awardAchievementXp(
    userId: number,
    achievementId: number,
    tier: string,
    title: string,
    category: string
  ): Promise<number> {
    try {
      // Determine base XP based on achievement tier
      const tierUpper = tier.toUpperCase();
      const baseXp = ACHIEVEMENT_XP_VALUES[tierUpper] || 5; // Default to 5 XP if tier not found
      
      // Apply PicklePulse multiplier
      const finalXp = await this.multiplierService.calculateXpForActivity(
        'achievement_unlock', 
        baseXp
      );
      
      // Get user's current XP from users table
      const result = await db.execute(
        sql`SELECT xp FROM users WHERE id = ${userId}`
      );
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error(`User ${userId} not found`);
      }
      
      // Parse the xp value from the result, ensuring it's a number
      const currentXp = (result.rows[0].xp !== null && result.rows[0].xp !== undefined) 
        ? Number(result.rows[0].xp) 
        : 0;
      
      // Add the amount to calculate the new total
      const newTotal = currentXp + finalXp;
      
      // Create XP transaction
      await db.insert(xpTransactions).values({
        userId,
        amount: finalXp,
        source: XP_SOURCE.ACHIEVEMENT,
        sourceType: 'ACHIEVEMENT_UNLOCK',
        sourceId: achievementId,
        runningTotal: newTotal,
        description: `Achievement unlocked: ${title} (${tier})`,
        metadata: {
          achievementTitle: title,
          achievementTier: tier,
          achievementCategory: category
        }
      });
      
      // Update user's XP
      await db.execute(
        sql`UPDATE users SET xp = ${newTotal} WHERE id = ${userId}`
      );
      
      console.log(`[XP] Awarded ${finalXp} XP to user ${userId} for unlocking achievement: ${title} (${tier})`);
      
      return finalXp;
    } catch (error) {
      console.error('[XP] Error awarding achievement XP:', error);
      return 0;
    }
  }
  
  /**
   * Check for XP-based achievements that might be unlocked based on total XP
   */
  private async checkXpBasedAchievements(userId: number, totalXp: number): Promise<void> {
    try {
      // Define XP thresholds for achievements
      const xpThresholds = [
        { threshold: 10, achievementId: 'XP_BEGINNER', title: 'XP Beginner', tier: 'BRONZE', category: 'PROGRESSION' },
        { threshold: 50, achievementId: 'XP_NOVICE', title: 'XP Novice', tier: 'BRONZE', category: 'PROGRESSION' },
        { threshold: 100, achievementId: 'XP_ENTHUSIAST', title: 'XP Enthusiast', tier: 'SILVER', category: 'PROGRESSION' },
        { threshold: 250, achievementId: 'XP_CONTENDER', title: 'XP Contender', tier: 'SILVER', category: 'PROGRESSION' },
        { threshold: 500, achievementId: 'XP_EXPERT', title: 'XP Expert', tier: 'GOLD', category: 'PROGRESSION' },
        { threshold: 1000, achievementId: 'XP_MASTER', title: 'XP Master', tier: 'PLATINUM', category: 'PROGRESSION' },
        { threshold: 2500, achievementId: 'XP_LEGEND', title: 'XP Legend', tier: 'DIAMOND', category: 'PROGRESSION' },
        { threshold: 5000, achievementId: 'XP_GRANDMASTER', title: 'XP Grandmaster', tier: 'MASTER', category: 'PROGRESSION' }
      ];
      
      // Find all thresholds that the user has crossed
      const crossedThresholds = xpThresholds.filter(t => totalXp >= t.threshold);
      
      if (crossedThresholds.length === 0) {
        return; // No thresholds crossed
      }
      
      // Check which achievements the user has already unlocked
      const existingAchievements = await db.execute(
        sql`SELECT achievement_id FROM user_achievements WHERE user_id = ${userId} AND achievement_id IN (${crossedThresholds.map(t => t.achievementId).join(',')})`
      );
      
      const unlockedIds = new Set(existingAchievements.rows?.map(row => row.achievement_id) || []);
      
      // Filter to only new achievements to unlock
      const newAchievements = crossedThresholds.filter(t => !unlockedIds.has(t.achievementId));
      
      // Unlock each new achievement
      for (const achievement of newAchievements) {
        // Find or create the achievement in the achievements table
        const [achievementRecord] = await db.execute(
          sql`SELECT id FROM achievements WHERE code = ${achievement.achievementId}`
        );
        
        let achievementId: number;
        
        if (!achievementRecord) {
          // Create the achievement if it doesn't exist
          const [newAchievement] = await db.execute(
            sql`INSERT INTO achievements (code, title, description, tier, category, created_at, updated_at)
                VALUES (${achievement.achievementId}, ${achievement.title}, 'Reach ${achievement.threshold} XP', 
                        ${achievement.tier}, ${achievement.category}, NOW(), NOW())
                RETURNING id`
          );
          achievementId = newAchievement.id;
        } else {
          achievementId = achievementRecord.id;
        }
        
        // Record that the user has unlocked this achievement
        await db.execute(
          sql`INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
              VALUES (${userId}, ${achievementId}, NOW())`
        );
        
        // Emit achievement unlocked event
        ServerEventBus.emit(ServerEvents.ACHIEVEMENT_UNLOCKED, {
          userId,
          achievementId,
          achievementTitle: achievement.title,
          achievementTier: achievement.tier,
          achievementCategory: achievement.category
        });
        
        console.log(`[XP] Unlocked achievement for user ${userId}: ${achievement.title} (${achievement.tier})`);
      }
    } catch (error) {
      console.error('[XP] Error checking XP-based achievements:', error);
    }
  }
}