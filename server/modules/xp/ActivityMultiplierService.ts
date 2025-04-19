/**
 * PKL-278651-XP-0003-PULSE
 * Activity Multiplier Service
 * 
 * This service manages the dynamic multipliers for XP rewards based on platform activity.
 * It implements the PicklePulse™ algorithm for balancing the XP economy.
 * 
 * @framework Framework5.1
 * @version 1.0.1
 */

import { db } from '../../db';
import { activityMultipliers, multiplierRecalibrations, xpTransactions } from '@shared/schema';
import { eq, gte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { DatabaseStorage } from '../../storage';

// Default activity ratios - these represent ideal platform engagement distribution
const DEFAULT_TARGET_RATIOS = {
  match_played: 0.35, // 35% of all activities should be match play
  community_post: 0.20, // 20% should be community posts
  community_comment: 0.15, // 15% should be comments
  event_attendance: 0.20, // 20% should be event attendance
  profile_update: 0.10 // 10% should be profile updates
};

// Acceptable deviation before recalibration is needed
const ACCEPTABLE_DEVIATION = 0.05; // 5% deviation is acceptable

// Maximum multiplier values
const MAX_MULTIPLIER = 2.5;
const MIN_MULTIPLIER = 0.8;

export class ActivityMultiplierService {
  private storage: DatabaseStorage | null;
  
  constructor(storage?: DatabaseStorage) {
    this.storage = storage || null;
    console.log('[PicklePulse] ActivityMultiplierService initialized');
  }
  
  /**
   * Gets the current multiplier for a specific activity type
   */
  async getMultiplier(activityType: string): Promise<number> {
    try {
      const [multiplier] = await db
        .select()
        .from(activityMultipliers)
        .where(eq(activityMultipliers.activityType, activityType));
      
      return multiplier?.currentMultiplier || 1.0;
    } catch (error) {
      console.error(`[PicklePulse] Error getting multiplier for ${activityType}:`, error);
      // Default to 1.0 multiplier if there's an error
      return 1.0;
    }
  }
  
  /**
   * Recalibrates multipliers based on current platform activity patterns
   * This is the core of the PicklePulse™ algorithm
   */
  async recalibrateMultipliers(): Promise<void> {
    try {
      // 1. Get all current multipliers
      const currentMultipliers = await db
        .select()
        .from(activityMultipliers);
      
      // 2. Get activity counts for the last 7 days
      const activityCounts = await this.getActivityDistribution(7);
      const totalActivities = Object.values(activityCounts).reduce((sum, count) => sum + count, 0);
      
      // 3. Calculate current ratios
      const currentRatios: Record<string, number> = {};
      for (const type in activityCounts) {
        currentRatios[type] = totalActivities > 0 ? activityCounts[type] / totalActivities : 0;
      }
      
      // 4. Update multipliers based on deviations from target ratios
      for (const multiplier of currentMultipliers) {
        const activityType = multiplier.activityType;
        const targetRatio = multiplier.targetRatio;
        const currentRatio = currentRatios[activityType] || 0;
        
        // Calculate deviation from target
        const deviation = targetRatio - currentRatio;
        
        // Only adjust if deviation is outside acceptable range
        if (Math.abs(deviation) > ACCEPTABLE_DEVIATION) {
          // If activity happens less than target, increase multiplier
          // If activity happens more than target, decrease multiplier
          const adjustmentFactor = 1 + (deviation * 0.5);
          
          // Calculate new multiplier value
          let newMultiplier = multiplier.currentMultiplier * adjustmentFactor;
          
          // Ensure multiplier stays within bounds
          newMultiplier = Math.min(MAX_MULTIPLIER, Math.max(MIN_MULTIPLIER, newMultiplier));
          
          // Update the multiplier in the database
          await db
            .update(activityMultipliers)
            .set({
              currentMultiplier: newMultiplier,
              currentRatio: currentRatio,
              weeklyTrend: deviation,
              lastRecalibration: new Date()
            })
            .where(eq(activityMultipliers.id, multiplier.id));
          
          // Log the recalibration
          await db
            .insert(multiplierRecalibrations)
            .values({
              activityType: activityType,
              previousMultiplier: multiplier.currentMultiplier,
              newMultiplier: newMultiplier,
              adjustmentReason: `Adjusting for ${(deviation > 0 ? 'under' : 'over')}-representation (Target: ${targetRatio}, Actual: ${currentRatio})`,
              // timestamp field is handled by defaultNow()
            });
          
          console.log(`[PicklePulse] Recalibrated ${activityType}: ${multiplier.currentMultiplier} -> ${newMultiplier}`);
        }
      }
      
      console.log('[PicklePulse] Multiplier recalibration complete');
    } catch (error) {
      console.error('[PicklePulse] Error recalibrating multipliers:', error);
    }
  }
  
  /**
   * Initializes default multipliers if they don't exist
   */
  async initializeDefaultMultipliers(): Promise<void> {
    try {
      // Check if multipliers already exist
      const existingMultipliers = await db
        .select()
        .from(activityMultipliers);
      
      if (existingMultipliers.length > 0) {
        console.log('[PicklePulse] Multipliers already initialized, skipping');
        return;
      }
      
      // Define default multipliers
      const defaultMultipliers = [
        {
          activityType: 'match_played',
          category: 'activity',
          currentMultiplier: 1.0,
          targetRatio: DEFAULT_TARGET_RATIOS.match_played,
          currentRatio: 0,
          weeklyTrend: 0,
          lastRecalibration: new Date(),
          baseXpValue: 5,
          isActive: true
        },
        {
          activityType: 'match_win',
          category: 'achievement',
          currentMultiplier: 1.0,
          targetRatio: 0.15,
          currentRatio: 0,
          weeklyTrend: 0,
          lastRecalibration: new Date(),
          baseXpValue: 2,
          isActive: true
        },
        {
          activityType: 'first_daily_match',
          category: 'engagement',
          currentMultiplier: 1.0,
          targetRatio: 0.10,
          currentRatio: 0,
          weeklyTrend: 0,
          lastRecalibration: new Date(),
          baseXpValue: 3,
          isActive: true
        },
        {
          activityType: 'community_post',
          category: 'community',
          currentMultiplier: 1.0,
          targetRatio: DEFAULT_TARGET_RATIOS.community_post,
          currentRatio: 0,
          weeklyTrend: 0,
          lastRecalibration: new Date(),
          baseXpValue: 1,
          isActive: true
        },
        {
          activityType: 'community_comment',
          category: 'community',
          currentMultiplier: 1.0,
          targetRatio: DEFAULT_TARGET_RATIOS.community_comment,
          currentRatio: 0,
          weeklyTrend: 0,
          lastRecalibration: new Date(),
          baseXpValue: 0.5,
          isActive: true
        },
        {
          activityType: 'event_creation',
          category: 'community',
          currentMultiplier: 1.0,
          targetRatio: 0.05,
          currentRatio: 0,
          weeklyTrend: 0,
          lastRecalibration: new Date(),
          baseXpValue: 3,
          isActive: true
        },
        {
          activityType: 'event_attendance',
          category: 'community',
          currentMultiplier: 1.0,
          targetRatio: DEFAULT_TARGET_RATIOS.event_attendance,
          currentRatio: 0,
          weeklyTrend: 0,
          lastRecalibration: new Date(),
          baseXpValue: 2,
          isActive: true
        },
        {
          activityType: 'profile_update',
          category: 'profile',
          currentMultiplier: 1.0,
          targetRatio: DEFAULT_TARGET_RATIOS.profile_update,
          currentRatio: 0,
          weeklyTrend: 0,
          lastRecalibration: new Date(),
          baseXpValue: 1,
          isActive: true
        }
      ];
      
      // Insert default multipliers
      await db
        .insert(activityMultipliers)
        .values(defaultMultipliers);
      
      console.log('[PicklePulse] Default multipliers initialized');
    } catch (error) {
      console.error('[PicklePulse] Error initializing default multipliers:', error);
    }
  }
  
  /**
   * Gets the distribution of activities over a specified number of days
   */
  private async getActivityDistribution(days: number): Promise<Record<string, number>> {
    try {
      // Calculate the date for the start of the period
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get activity counts from XP transactions
      // In a real implementation, this would query xp_transactions with a group by
      // For simplicity in this implementation, we'll return a mock distribution
      // based on stored ratios
      
      // In a full implementation, this would be:
      // const activityCounts = await db
      //   .select({ 
      //     activityType: xpTransactions.source, 
      //     count: sql<number>`count(*)` 
      //   })
      //   .from(xpTransactions)
      //   .where(gte(xpTransactions.timestamp, startDate))
      //   .groupBy(xpTransactions.source);
      
      const multipliers = await db
        .select()
        .from(activityMultipliers);
      
      // Create a distribution based on current stored ratios
      const distribution: Record<string, number> = {};
      for (const multiplier of multipliers) {
        // Use currentRatio if available, or fallback to a variation of targetRatio
        distribution[multiplier.activityType] = Math.round(
          (multiplier.currentRatio > 0 ? multiplier.currentRatio : multiplier.targetRatio * 0.9) * 1000
        );
      }
      
      return distribution;
    } catch (error) {
      console.error('[PicklePulse] Error getting activity distribution:', error);
      return {};
    }
  }
  
  /**
   * Calculates the XP amount for an activity with current multiplier applied
   */
  async calculateXpForActivity(activityType: string, baseAmount: number): Promise<number> {
    const multiplier = await this.getMultiplier(activityType);
    const xpAmount = Math.round(baseAmount * multiplier * 10) / 10; // Round to 1 decimal place
    
    return xpAmount;
  }
  
  /**
   * Gets all current multipliers for admin dashboard
   */
  async getAllMultipliers() {
    try {
      return await db
        .select()
        .from(activityMultipliers)
        .where(eq(activityMultipliers.isActive, true));
    } catch (error) {
      console.error('[PicklePulse] Error getting all multipliers:', error);
      return [];
    }
  }
}

export default ActivityMultiplierService;