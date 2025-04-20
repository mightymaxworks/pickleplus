/**
 * PKL-278651-XP-0003-PULSE
 * Activity Multiplier Service (Pickle Pulse™)
 * 
 * Handles the dynamic activity multipliers that adjust XP rewards
 * based on platform-wide activity patterns.
 * 
 * @framework Framework5.2
 * @version 1.1.0
 * @lastModified 2025-04-20
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
          adjustmentReason: reason
          // 'created_at' will be auto-generated by the database
          // Note: 'metadata' column doesn't exist in the actual database
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
        orderBy: (fields, { desc }) => [desc(fields.createdAt)],
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
   * 
   * PKL-278651-XP-0003-PULSE-ENH: Enhanced activity analysis
   * Framework 5.2 compliant implementation with improved time factors and detailed activity analysis
   */
  async recalculateMultipliers(): Promise<void> {
    try {
      // Advanced time-based factors analysis
      const timeFactors = this.calculateTimeFactors();
      
      // Get detailed activity metrics
      const activityMetrics = await this.getDetailedActivityMetrics();
      
      // Calculate specific multipliers for each activity type
      const activityMultipliers = await this.calculateActivityTypeMultipliers(timeFactors, activityMetrics);
      
      // Log the calculated multipliers
      console.log(`[XP] Activity-adjusted multipliers:`, 
        Object.entries(activityMultipliers)
          .map(([type, value]) => `${type}: ${value.toFixed(2)}`)
          .join(', ')
      );
      
      // Apply the new multipliers
      for (const [activityType, multiplier] of Object.entries(activityMultipliers)) {
        await this.updateMultiplier(
          activityType, 
          multiplier, 
          `Automated Pickle Pulse™ adjustment (Framework 5.2)`
        );
      }
      
      console.log('[XP] Pickle Pulse™ multipliers recalculated successfully');
    } catch (error) {
      console.error('[XP] Error recalculating multipliers:', error);
    }
  }
  
  /**
   * Calculate time-based factors that influence activity multipliers
   * PKL-278651-XP-0003-PULSE-TIME: Enhanced time-based factors
   */
  private calculateTimeFactors(): {[key: string]: number} {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const date = now.getDate();
    const month = now.getMonth();
    
    // Weekend factor (higher on weekends)
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.5 : 1.0;
    
    // Time of day factors
    // Early morning (midnight - 6AM): Boost communities
    const earlyMorningFactor = (hour >= 0 && hour < 6) ? 1.75 : 1.0;
    
    // Morning (6AM - 10AM): Standard
    const morningFactor = (hour >= 6 && hour < 10) ? 1.1 : 1.0;
    
    // Work day (10AM - 5PM): Slight reduction for matches
    const workDayFactor = (hour >= 10 && hour < 17) ? 0.9 : 1.0;
    
    // Peak evening (5PM - 9PM): Boost for all activities
    const peakEveningFactor = (hour >= 17 && hour < 21) ? 1.25 : 1.0;
    
    // Late night (9PM - midnight): Boost for community
    const lateNightFactor = (hour >= 21 && hour < 24) ? 1.2 : 1.0;
    
    // Special factor: Enhanced lunch hour boost (12-1PM)
    const lunchBoostFactor = (hour === 12) ? 1.15 : 1.0;
    
    // Special factor: Late afternoon dip (3-4PM)
    const afternoonDipFactor = (hour === 15) ? 0.95 : 1.0;
    
    // Special days: End of month boost
    const isEndOfMonth = this.isLastDayOfMonth(now);
    const endOfMonthFactor = isEndOfMonth ? 1.2 : 1.0;
    
    // Calculate compound factors for different activity types
    return {
      match_play: weekendFactor * peakEveningFactor * afternoonDipFactor * endOfMonthFactor,
      match_win: weekendFactor * peakEveningFactor * 1.1 * endOfMonthFactor, // Extra boost for wins
      first_match_of_day: morningFactor * 1.3 * endOfMonthFactor, // Extra boost for first match
      create_post: earlyMorningFactor * lateNightFactor * lunchBoostFactor,
      comment: earlyMorningFactor * peakEveningFactor * lunchBoostFactor,
      create_event: workDayFactor * endOfMonthFactor * 1.1,
      attend_event: weekendFactor * peakEveningFactor * endOfMonthFactor,
      // Consolidated categories for backward compatibility
      match: weekendFactor * peakEveningFactor * afternoonDipFactor * endOfMonthFactor,
      community: earlyMorningFactor * lateNightFactor * lunchBoostFactor,
      achievement: 1.0 // Achievements have fixed multipliers
    };
  }
  
  /**
   * Calculate detailed multipliers for each activity type
   * PKL-278651-XP-0003-PULSE-ACT: Enhanced activity-specific calculations
   */
  private async calculateActivityTypeMultipliers(
    timeFactors: {[key: string]: number}, 
    activityMetrics: {[key: string]: number}
  ): Promise<{[key: string]: number}> {
    const result: {[key: string]: number} = {};
    
    // For each activity type, apply time factors and activity-based adjustments
    for (const [activityType, baseMultiplier] of Object.entries(timeFactors)) {
      const activityLevel = activityMetrics[activityType] || 1.0;
      const adjustedMultiplier = this.applyActivityAdjustment(baseMultiplier, activityLevel);
      
      // Add hysteresis to prevent frequent small changes
      result[activityType] = await this.applyHysteresis(activityType, adjustedMultiplier);
    }
    
    return result;
  }
  
  /**
   * Apply hysteresis to multiplier changes to prevent oscillation
   * Only change multiplier if it differs by more than 10%
   */
  private async applyHysteresis(activityType: string, newMultiplier: number): Promise<number> {
    try {
      // Get current multiplier from database
      const multiplier = await db.query.activityMultipliers.findFirst({
        where: eq(activityMultipliers.activityType, activityType)
      });
      
      if (!multiplier) return newMultiplier;
      
      const currentValue = multiplier.currentMultiplier;
      const percentDifference = Math.abs((newMultiplier - currentValue) / currentValue);
      
      // Only change if difference is significant (>10%)
      if (percentDifference < 0.1) {
        return currentValue;
      }
      
      return newMultiplier;
    } catch (error) {
      console.error(`[XP] Error applying hysteresis for ${activityType}:`, error);
      return newMultiplier;
    }
  }
  
  /**
   * Check if the given date is the last day of the month
   */
  private isLastDayOfMonth(date: Date): boolean {
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    return tomorrow.getMonth() !== date.getMonth();
  }
  
  /**
   * Get detailed activity metrics for all activity types
   * In a production implementation, this would query real activity data
   * PKL-278651-XP-0003-PULSE-METRICS: Enhanced activity metrics collection
   */
  private async getDetailedActivityMetrics(): Promise<{[key: string]: number}> {
    // In a real implementation, we would query actual activity metrics from the database
    // For now, we'll use an enhanced version of the simulation that includes all activity types
    
    const simulationDate = new Date();
    const hour = simulationDate.getHours();
    const dayOfWeek = simulationDate.getDay(); 
    
    // Simulate activity patterns based on time of day and day of week
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isPeakHours = hour >= 17 && hour < 21;
    const isMorning = hour >= 6 && hour < 10;
    const isLunchtime = hour >= 12 && hour < 13;
    const isLateNight = hour >= 21;
    
    return {
      match_play: isPeakHours ? 2.5 : (isWeekend ? 3.2 : 1.0),
      match_win: isPeakHours ? 2.3 : (isWeekend ? 3.0 : 1.0),
      first_match_of_day: isMorning ? 1.8 : 0.9,
      create_post: isLateNight ? 1.7 : (isLunchtime ? 1.5 : 1.0),
      comment: isPeakHours ? 2.1 : (isLateNight ? 1.6 : 1.0),
      create_event: isWeekend ? 0.7 : 1.2,
      attend_event: isWeekend ? 3.5 : (isPeakHours ? 2.0 : 0.8),
      // Consolidated categories for backward compatibility
      match: isPeakHours ? 2.5 : (isWeekend ? 3.2 : 1.0),
      community: isPeakHours ? 2.1 : (isLunchtime ? 1.8 : 1.2),
      achievement: 1.0
    };
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