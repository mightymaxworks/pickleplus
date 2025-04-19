/**
 * PKL-278651-XP-0003-PULSE
 * Activity Multiplier Service (Pickle Pulse™)
 * 
 * Handles the dynamic activity multipliers that adjust XP rewards
 * based on platform-wide activity patterns.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { db } from '../../db';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';
import { 
  activityMultipliers,
  multiplierRecalibrations
} from '@shared/schema';

/**
 * ActivityMultiplierService - Handles Pickle Pulse™ multiplier calculations
 */
export class ActivityMultiplierService {
  // Default multiplier if none set in database
  private DEFAULT_MULTIPLIER = 1.0;
  
  // Cache multiplier values to reduce database load
  private multiplierCache: Map<string, { value: number, expiresAt: number }> = new Map();
  
  // Cache duration in milliseconds (5 minutes)
  private CACHE_DURATION_MS = 5 * 60 * 1000;
  
  constructor(private storage: any) {
    console.log('[XP] ActivityMultiplierService initialized');
  }
  
  /**
   * Initialize default multipliers if they don't exist
   */
  async initializeDefaultMultipliers(): Promise<void> {
    try {
      // Check if any multipliers already exist
      const existingMultipliers = await db.query.activityMultipliers.findMany({
        limit: 1
      });
      
      if (existingMultipliers.length > 0) {
        console.log('[XP] Default multipliers already exist');
        return;
      }
      
      console.log('[XP] Creating default activity multipliers');
      
      // Define default multipliers for various activity types
      const defaultMultipliers = [
        {
          category: 'match',
          activityType: 'match_play',
          currentMultiplier: 1.0,
          targetRatio: 1.0,
          currentRatio: 1.0,
          baseXpValue: 5,
          isActive: true,
          lastRecalibration: new Date()
        },
        {
          category: 'match',
          activityType: 'match_win',
          currentMultiplier: 1.0,
          targetRatio: 1.0,
          currentRatio: 1.0,
          baseXpValue: 2,
          isActive: true,
          lastRecalibration: new Date()
        },
        {
          category: 'match',
          activityType: 'first_match_of_day',
          currentMultiplier: 1.0,
          targetRatio: 1.0,
          currentRatio: 1.0,
          baseXpValue: 3,
          isActive: true,
          lastRecalibration: new Date()
        },
        {
          category: 'community',
          activityType: 'create_post',
          currentMultiplier: 1.0,
          targetRatio: 1.0,
          currentRatio: 1.0,
          baseXpValue: 1,
          isActive: true,
          lastRecalibration: new Date()
        },
        {
          category: 'community',
          activityType: 'comment',
          currentMultiplier: 1.0,
          targetRatio: 1.0,
          currentRatio: 1.0,
          baseXpValue: 0.5,
          isActive: true,
          lastRecalibration: new Date()
        },
        {
          category: 'community',
          activityType: 'create_event',
          currentMultiplier: 1.0,
          targetRatio: 1.0,
          currentRatio: 1.0,
          baseXpValue: 3,
          isActive: true,
          lastRecalibration: new Date()
        },
        {
          category: 'community',
          activityType: 'attend_event',
          currentMultiplier: 1.0,
          targetRatio: 1.0,
          currentRatio: 1.0,
          baseXpValue: 2,
          isActive: true,
          lastRecalibration: new Date()
        }
      ];
      
      // Insert default multipliers
      await db.insert(activityMultipliers).values(defaultMultipliers);
      
      console.log('[XP] Default multipliers created successfully');
    } catch (error) {
      console.error('[XP] Error initializing default multipliers:', error);
      throw error;
    }
  }
  
  /**
   * Get current multiplier for a specific activity type
   */
  async getCurrentActivityMultiplier(activityType: string): Promise<number> {
    try {
      // Check cache first
      const cacheKey = `multiplier:${activityType}`;
      const cachedValue = this.multiplierCache.get(cacheKey);
      
      // Return cached value if valid
      if (cachedValue && cachedValue.expiresAt > Date.now()) {
        return cachedValue.value;
      }
      
      // Query database for current multiplier
      const multiplier = await db.query.activityMultipliers.findFirst({
        where: eq(activityMultipliers.activityType, activityType)
      });
      
      // Use default if not found
      const multiplierValue = multiplier?.currentMultiplier ?? this.DEFAULT_MULTIPLIER;
      
      // Update cache
      this.multiplierCache.set(cacheKey, {
        value: multiplierValue,
        expiresAt: Date.now() + this.CACHE_DURATION_MS
      });
      
      return multiplierValue;
    } catch (error) {
      console.error(`[XP] Error getting multiplier for ${activityType}:`, error);
      return this.DEFAULT_MULTIPLIER;
    }
  }
  
  /**
   * Get all current multipliers
   */
  async getAllMultipliers(): Promise<any[]> {
    try {
      const multipliers = await db.query.activityMultipliers.findMany({
        orderBy: (fields, { asc }) => [asc(fields.activityType)]
      });
      
      return multipliers.map(m => ({
        activityType: m.activityType,
        currentValue: m.currentMultiplier,
        baseValue: m.baseXpValue,
        category: m.category,
        isActive: m.isActive,
        lastRecalibration: m.lastRecalibration
      }));
    } catch (error) {
      console.error('[XP] Error getting all multipliers:', error);
      return [];
    }
  }
  
  /**
   * Update a multiplier value
   * Note: This is called by the automated Pickle Pulse™ algorithm
   */
  async updateMultiplier(activityType: string, newValue: number, reason: string): Promise<boolean> {
    try {
      // Get current multiplier record
      const multiplier = await db.query.activityMultipliers.findFirst({
        where: eq(activityMultipliers.activityType, activityType)
      });
      
      if (!multiplier) {
        // Create new multiplier record if not found
        await db.insert(activityMultipliers).values({
          activityType,
          category: 'default',
          currentMultiplier: newValue,
          baseXpValue: this.DEFAULT_MULTIPLIER,
          targetRatio: 1.0,
          currentRatio: 1.0,
          isActive: true,
          lastRecalibration: new Date()
        });
      } else {
        // Apply bounds check - multipliers can be as low as 0.05 for extreme cases
        const boundedValue = Math.min(Math.max(newValue, 0.05), 2.0);
        
        // Update existing multiplier
        await db.update(activityMultipliers)
          .set({
            currentMultiplier: boundedValue,
            lastRecalibration: new Date()
          })
          .where(eq(activityMultipliers.activityType, activityType));
        
        // Record the recalibration event
        await db.insert(multiplierRecalibrations).values({
          activityType,
          previousMultiplier: multiplier.currentMultiplier,
          newMultiplier: boundedValue,
          reason,
          timestamp: new Date()
        });
      }
      
      // Clear cache for this activity type
      this.multiplierCache.delete(`multiplier:${activityType}`);
      
      return true;
    } catch (error) {
      console.error(`[XP] Error updating multiplier for ${activityType}:`, error);
      return false;
    }
  }
  
  /**
   * Get multiplier history for a specific activity type
   */
  async getMultiplierHistory(activityType: string, limit = 10): Promise<any[]> {
    try {
      const history = await db.query.multiplierRecalibrations.findMany({
        where: eq(multiplierRecalibrations.activityType, activityType),
        orderBy: (fields, { desc }) => [desc(fields.timestamp)],
        limit
      });
      
      return history;
    } catch (error) {
      console.error(`[XP] Error getting multiplier history for ${activityType}:`, error);
      return [];
    }
  }
  
  /**
   * Calculate XP for a specific activity type with current multiplier applied
   */
  async calculateXpForActivity(activityType: string, baseAmount: number): Promise<number> {
    try {
      // Get the current multiplier for this activity
      const multiplier = await this.getCurrentActivityMultiplier(activityType);
      
      // Apply the multiplier to the base amount
      const calculatedXp = Math.round(baseAmount * multiplier * 10) / 10;
      
      return calculatedXp;
    } catch (error) {
      console.error(`[XP] Error calculating XP for ${activityType}:`, error);
      return baseAmount; // If anything fails, just return the base amount
    }
  }
  
  /**
   * Calculate and update multipliers based on recent platform activity
   * This is the core of the Pickle Pulse™ algorithm
   */
  async recalculateMultipliers(): Promise<void> {
    try {
      // This is where the proprietary Pickle Pulse™ algorithm would analyze
      // platform-wide activity patterns and adjust multipliers accordingly.
      
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Weekend boost (Saturday and Sunday)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Peak hours boost (5PM - 9PM)
      const isPeakHours = hour >= 17 && hour < 21;
      
      // Off-hours boost (midnight - 6AM)
      const isOffHours = hour >= 0 && hour < 6;
      
      // Simulating an actual activity monitoring system
      // In a real implementation, these would be calculated from database metrics
      
      // SIMULATION: Get activity levels for different activity types
      const activityLevels = await this.getSimulatedActivityLevels();
      
      // Base multipliers based on time factors
      let baseMatchMultiplier = isWeekend ? 1.5 : isPeakHours ? 1.25 : 1.0;
      let baseCommunityMultiplier = isWeekend ? 1.25 : isPeakHours ? 1.5 : isOffHours ? 1.75 : 1.0;
      let baseAchievementMultiplier = 1.0; // Achievements have fixed multipliers
      
      // Apply activity-based adjustments
      const matchMultiplier = this.applyActivityAdjustment(baseMatchMultiplier, activityLevels.match);
      const communityMultiplier = this.applyActivityAdjustment(baseCommunityMultiplier, activityLevels.community);
      const achievementMultiplier = baseAchievementMultiplier; // Achievements aren't adjusted based on volume
      
      console.log(`[XP] Activity-adjusted multipliers - Match: ${matchMultiplier.toFixed(2)}, Community: ${communityMultiplier.toFixed(2)}`);
      
      // Apply the new multipliers
      await this.updateMultiplier('match', matchMultiplier, 'Automated Pickle Pulse™ adjustment');
      await this.updateMultiplier('community', communityMultiplier, 'Automated Pickle Pulse™ adjustment');
      await this.updateMultiplier('achievement', achievementMultiplier, 'Automated Pickle Pulse™ adjustment');
      
      console.log('[XP] Pickle Pulse™ multipliers recalculated successfully');
    } catch (error) {
      console.error('[XP] Error recalculating multipliers:', error);
    }
  }
  
  /**
   * Apply activity-based adjustment to a base multiplier
   * This reduces the multiplier when activity is very high to prevent XP inflation
   */
  public applyActivityAdjustment(baseMultiplier: number, activityLevel: number): number {
    // activityLevel is a ratio of current activity to normal activity
    // 1.0 = normal activity, 2.0 = twice normal, 0.5 = half normal
    
    if (activityLevel <= 1.0) {
      // Below normal activity - no reduction
      return baseMultiplier;
    } else if (activityLevel <= 2.0) {
      // Up to 2x normal activity - gradual reduction
      const reduction = (activityLevel - 1.0) * 0.3; // Reduce by up to 30%
      return Math.max(baseMultiplier * (1.0 - reduction), 0.5);
    } else if (activityLevel <= 5.0) {
      // 2-5x normal activity - stronger reduction
      const reduction = 0.3 + (activityLevel - 2.0) * 0.15; // 30% to 75% reduction
      return Math.max(baseMultiplier * (1.0 - reduction), 0.2);
    } else {
      // Extreme activity (>5x normal) - severe reduction to prevent farming
      return Math.max(baseMultiplier * 0.1, 0.05);
    }
  }
  
  /**
   * Get simulated activity levels for different activity types
   * In a real implementation, this would query actual activity metrics from the database
   */
  private async getSimulatedActivityLevels(): Promise<{[key: string]: number}> {
    // For demonstration purposes, we're simulating different activity levels:
    
    const simulationDate = new Date();
    const hour = simulationDate.getHours();
    
    // Simulate high community activity during peak social hours (6-9 PM)
    const highCommunityActivity = hour >= 18 && hour <= 21;
    
    // Simulate high match activity during weekend afternoons
    const isWeekend = simulationDate.getDay() === 0 || simulationDate.getDay() === 6;
    const afternoonHours = hour >= 13 && hour <= 17;
    const highMatchActivity = isWeekend && afternoonHours;
    
    // Create simulated activity levels
    // 1.0 = normal, >1.0 = above normal, <1.0 = below normal
    return {
      match: highMatchActivity ? 3.5 : (isWeekend ? 1.8 : 1.0),
      community: highCommunityActivity ? 2.7 : 1.2,
      achievement: 1.0 // Achievement unlocks tend to be more evenly distributed
    };
  }
}