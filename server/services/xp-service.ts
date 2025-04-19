/**
 * PKL-278651-XP-0001-FOUND
 * XP Service
 * 
 * This service manages XP awards, level calculations, and integrates with the Pickle Pulse™ 
 * dynamic adjustment algorithm to optimize platform engagement.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  users, 
  xpTransactions, 
  xpLevelThresholds,
  activityMultipliers,
  multiplierRecalibrations,
  XP_SOURCE,
  type XpSource
} from "@shared/schema";

/**
 * Award XP Parameters
 */
interface AwardXpParams {
  userId: number;
  amount: number;
  source: XpSource;
  sourceType?: string;
  sourceId?: number;
  description?: string;
  metadata?: Record<string, any>;
  createdById?: number;
}

/**
 * XP Service
 * Centralized service for all XP-related operations
 */
export class XpService {
  /**
   * Award XP to a user
   * This is the primary method for awarding XP across the platform
   */
  async awardXp(params: AwardXpParams): Promise<number> {
    try {
      // Apply Pickle Pulse™ multiplier if sourceType is provided
      let adjustedAmount = params.amount;
      
      if (params.sourceType) {
        adjustedAmount = await this.applyPicklePulseMultiplier(params.amount, params.sourceType);
      }

      // Get user's current XP
      const user = await db.query.users.findFirst({
        where: eq(users.id, params.userId),
        columns: { xp: true }
      });

      if (!user) {
        throw new Error(`User with ID ${params.userId} not found`);
      }

      // Calculate new XP balance
      const newBalance = (user.xp || 0) + adjustedAmount;

      // Create XP transaction record
      const [transaction] = await db.insert(xpTransactions).values({
        userId: params.userId,
        amount: adjustedAmount,
        balance: newBalance,
        source: params.source,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        description: params.description,
        metadata: params.metadata,
        createdById: params.createdById
      }).returning();

      // Update user's XP in the users table
      await db.update(users)
        .set({ 
          xp: newBalance,
          // Also update the level based on the new XP total
          level: await this.calculateLevelForXp(newBalance)
        })
        .where(eq(users.id, params.userId));

      // Return the new XP balance
      return newBalance;
    } catch (error) {
      console.error("Error awarding XP:", error);
      throw error;
    }
  }

  /**
   * Award community activity XP
   * Specialized method for community engagement activities
   */
  async awardCommunityXp(userId: number, activityType: string, communityId: number, metadata?: any): Promise<number> {
    return this.awardXp({
      userId,
      amount: await this.getBaseXpForActivity(activityType),
      source: XP_SOURCE.COMMUNITY,
      sourceType: activityType,
      metadata: {
        communityId,
        ...metadata
      },
      description: `Community activity: ${activityType}`
    });
  }

  /**
   * Award match play XP
   * Specialized method for match-related activities
   */
  async awardMatchXp(userId: number, activityType: string, matchId: number, metadata?: any): Promise<number> {
    return this.awardXp({
      userId,
      amount: await this.getBaseXpForActivity(activityType),
      source: XP_SOURCE.MATCH,
      sourceType: activityType,
      sourceId: matchId,
      metadata,
      description: `Match play: ${activityType}`
    });
  }

  /**
   * Award profile completion XP
   * Specialized method for profile completion activities
   */
  async awardProfileXp(userId: number, activityType: string, metadata?: any): Promise<number> {
    return this.awardXp({
      userId,
      amount: await this.getBaseXpForActivity(activityType),
      source: XP_SOURCE.PROFILE,
      sourceType: activityType,
      metadata,
      description: `Profile completion: ${activityType}`
    });
  }

  /**
   * Get user's XP history
   */
  async getUserXpHistory(userId: number, limit = 10, offset = 0): Promise<typeof xpTransactions.$inferSelect[]> {
    return db.query.xpTransactions.findMany({
      where: and(
        eq(xpTransactions.userId, userId),
        eq(xpTransactions.isHidden, false)
      ),
      orderBy: [desc(xpTransactions.createdAt)],
      limit,
      offset
    });
  }

  /**
   * Get user's current level and progress to next level
   */
  async getUserLevelInfo(userId: number): Promise<{
    currentLevel: number;
    currentXp: number;
    nextLevelXp: number;
    xpForCurrentLevel: number;
    progress: number;
  }> {
    // Get user's current XP and level
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { xp: true, level: true }
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const currentXp = user.xp || 0;
    const currentLevel = user.level || 1;

    // Get XP thresholds for current and next level
    const [currentLevelInfo, nextLevelInfo] = await Promise.all([
      db.query.xpLevelThresholds.findFirst({
        where: eq(xpLevelThresholds.level, currentLevel)
      }),
      db.query.xpLevelThresholds.findFirst({
        where: eq(xpLevelThresholds.level, currentLevel + 1)
      })
    ]);

    if (!currentLevelInfo) {
      throw new Error(`Level threshold not found for level ${currentLevel}`);
    }

    const xpForCurrentLevel = currentLevelInfo.xpRequired;
    const nextLevelXp = nextLevelInfo ? nextLevelInfo.xpRequired : Infinity;
    const xpNeededForNextLevel = nextLevelXp - xpForCurrentLevel;
    const xpProgressInCurrentLevel = currentXp - xpForCurrentLevel;
    
    // Calculate progress percentage (0-100)
    const progress = Math.min(100, Math.floor((xpProgressInCurrentLevel / xpNeededForNextLevel) * 100));

    return {
      currentLevel,
      currentXp,
      nextLevelXp,
      xpForCurrentLevel,
      progress: isNaN(progress) ? 100 : progress // If at max level, show 100%
    };
  }

  /**
   * Calculate level based on XP amount
   */
  async calculateLevelForXp(xpAmount: number): Promise<number> {
    const levels = await db.query.xpLevelThresholds.findMany({
      orderBy: [desc(xpLevelThresholds.xpRequired)]
    });

    // Start from highest level and work down
    for (const level of levels) {
      if (xpAmount >= level.xpRequired) {
        return level.level;
      }
    }

    // Default to level 1 if no thresholds match
    return 1;
  }

  /**
   * Get the recommended activities for a user
   * Uses Pickle Pulse™ adjustments to suggest activities with highest current value
   */
  async getRecommendedActivities(userId: number, limit = 5): Promise<{
    activityType: string;
    category: string;
    baseXpValue: number;
    adjustedXpValue: number;
    description: string;
  }[]> {
    // Get activities with highest current multipliers
    const multipliers = await db.query.activityMultipliers.findMany({
      where: eq(activityMultipliers.isActive, true),
      orderBy: [desc(activityMultipliers.currentMultiplier)],
      limit
    });

    // Map to recommendation format
    return multipliers.map(m => ({
      activityType: m.activityType,
      category: m.category,
      baseXpValue: m.baseXpValue,
      adjustedXpValue: Math.floor(m.baseXpValue * (m.currentMultiplier / 100)),
      description: this.getActivityDescription(m.activityType)
    }));
  }

  /**
   * Apply Pickle Pulse™ multiplier to an XP amount
   * This is the core of the dynamic adjustment system
   */
  private async applyPicklePulseMultiplier(baseAmount: number, activityType: string): Promise<number> {
    try {
      // Get the current multiplier for this activity
      const activityData = await db.query.activityMultipliers.findFirst({
        where: and(
          eq(activityMultipliers.activityType, activityType),
          eq(activityMultipliers.isActive, true)
        )
      });

      if (!activityData) {
        // If no multiplier exists, return the base amount
        return baseAmount;
      }

      // Apply the multiplier (stored as integer, 100 = 1.0x)
      const multiplier = activityData.currentMultiplier / 100;
      const adjustedAmount = Math.round(baseAmount * multiplier);

      // Return the adjusted amount, minimum 1 XP (never 0 for an activity)
      return Math.max(1, adjustedAmount);
    } catch (error) {
      console.error("Error applying Pickle Pulse multiplier:", error);
      // In case of error, return the base amount to ensure users still get XP
      return baseAmount;
    }
  }

  /**
   * Get base XP value for an activity
   */
  private async getBaseXpForActivity(activityType: string): Promise<number> {
    const activity = await db.query.activityMultipliers.findFirst({
      where: eq(activityMultipliers.activityType, activityType),
      columns: { baseXpValue: true }
    });

    return activity?.baseXpValue || 1; // Default to 1 XP if not found
  }

  /**
   * Get a human-readable description for an activity type
   */
  private getActivityDescription(activityType: string): string {
    const descriptionMap: Record<string, string> = {
      MATCH_COMPLETE: "Complete a match",
      MATCH_WIN: "Win a match",
      FIRST_MATCH_OF_DAY: "Play your first match of the day",
      WEEKLY_MATCH_STREAK: "Play matches 3 days in a row",
      CREATE_POST: "Create a post in a community",
      COMMENT_ON_POST: "Comment on a community post",
      CREATE_EVENT: "Create a community event",
      ATTEND_EVENT: "Attend a community event",
      JOIN_COMMUNITY: "Join a new community",
      COMPLETE_PROFILE: "Complete your profile",
      ADD_PROFILE_PICTURE: "Add a profile picture",
      REGISTER_TOURNAMENT: "Register for a tournament",
      COMPLETE_TOURNAMENT: "Complete a tournament",
      TOURNAMENT_WIN: "Win a tournament"
    };

    return descriptionMap[activityType] || activityType;
  }

  /**
   * Run the weekly Pickle Pulse™ recalibration job
   * This adjusts multipliers based on platform-wide activity distribution
   */
  async runPicklePulseRecalibration(): Promise<void> {
    try {
      console.log("Starting Pickle Pulse™ recalibration job");

      // Get total activity counts for the past week
      const activityCounts = await db.execute(sql`
        SELECT 
          source_type as activity_type, 
          COUNT(*) as count
        FROM xp_transactions
        WHERE created_at > NOW() - INTERVAL '7 days'
        AND source_type IS NOT NULL
        GROUP BY source_type
      `);

      // Calculate total activities
      const totalActivities = activityCounts.reduce((sum, act) => sum + Number(act.count), 0);

      // Get all activity multipliers
      const allMultipliers = await db.query.activityMultipliers.findMany({
        where: eq(activityMultipliers.isActive, true)
      });

      // Update each activity's multiplier
      for (const multiplier of allMultipliers) {
        // Find activity count
        const activityData = activityCounts.find(a => a.activity_type === multiplier.activityType);
        const activityCount = activityData ? Number(activityData.count) : 0;
        
        // Calculate current ratio (as percentage * 100)
        const currentRatio = totalActivities > 0 
          ? Math.round((activityCount / totalActivities) * 10000) 
          : 0;
          
        // Calculate weekly trend
        const weeklyTrend = multiplier.currentRatio > 0 
          ? Math.round(((currentRatio - multiplier.currentRatio) / multiplier.currentRatio) * 100)
          : 0;
          
        // Calculate adjustment factor based on target vs current ratio
        // The further from target, the stronger the adjustment
        const targetRatio = multiplier.targetRatio;
        let rawAdjustment = 0;
        
        if (currentRatio > 0) {
          rawAdjustment = ((targetRatio / currentRatio) - 1) * 0.2; // 0.2 is adjustment strength
        }
        
        // Apply dampening: max 5% change per week
        const cappedAdjustment = Math.max(-0.05, Math.min(0.05, rawAdjustment));
        
        // Calculate new multiplier with adjustment
        const previousMultiplier = multiplier.currentMultiplier;
        let newMultiplier = Math.round(previousMultiplier * (1 + cappedAdjustment));
        
        // Apply bounds (80% to 150%)
        newMultiplier = Math.max(80, Math.min(150, newMultiplier));
        
        // Record the recalibration history
        await db.insert(multiplierRecalibrations).values({
          activityType: multiplier.activityType,
          previousMultiplier,
          newMultiplier,
          adjustmentReason: `Target: ${targetRatio}, Current: ${currentRatio}, Trend: ${weeklyTrend}%`,
          metadata: {
            targetRatio,
            currentRatio,
            weeklyTrend,
            rawAdjustment,
            cappedAdjustment,
            totalActivities
          }
        });
        
        // Update the multiplier
        await db.update(activityMultipliers)
          .set({
            currentMultiplier: newMultiplier,
            currentRatio,
            weeklyTrend,
            lastRecalibration: new Date()
          })
          .where(eq(activityMultipliers.id, multiplier.id));
      }
      
      console.log("Pickle Pulse™ recalibration completed successfully");
    } catch (error) {
      console.error("Error running Pickle Pulse recalibration:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const xpService = new XpService();