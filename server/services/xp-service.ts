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

import { db } from '../db';
import { 
  xpTransactions, 
  xpLevelThresholds, 
  activityMultipliers, 
  multiplierRecalibrations,
  XP_SOURCE,
  type InsertXpTransaction
} from '../../shared/schema/xp';
import { users } from '../../shared/schema';
import { eq, desc, and, gt, sql, count, sum, max } from 'drizzle-orm';

/**
 * Award XP Parameters
 */
interface AwardXpParams {
  userId: number;
  amount: number;
  source: string;
  sourceType?: string;
  sourceId?: number;
  description?: string;
  metadata?: Record<string, any>;
  createdById?: number;
  matchId?: number;
  communityId?: number;
  achievementId?: number;
  tournamentId?: number;
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
      // Get the current running total of XP for the user
      const userXpResult = await db
        .select({ xp: sum(xpTransactions.amount) })
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, params.userId));
      
      // Calculate new running total
      const currentXp = userXpResult[0]?.xp || 0;
      const newRunningTotal = Number(currentXp) + params.amount;
      
      // Apply Pickle Pulse™ multiplier if applicable
      const { sourceType } = params;
      let finalAmount = params.amount;
      
      if (sourceType) {
        finalAmount = await this.applyPicklePulseMultiplier(params.amount, sourceType);
      }
      
      // Insert XP transaction
      const result = await db.insert(xpTransactions).values({
        userId: params.userId,
        amount: finalAmount,
        source: params.source,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        description: params.description || this.getActivityDescription(params.sourceType || 'unknown'),
        runningTotal: newRunningTotal,
        isHidden: false,
        createdById: params.createdById,
        matchId: params.matchId,
        communityId: params.communityId,
        achievementId: params.achievementId,
        tournamentId: params.tournamentId,
        metadata: params.metadata
      }).returning({ amount: xpTransactions.amount });
      
      console.log(`Awarded ${finalAmount} XP to user ${params.userId} for ${params.sourceType || params.source}`);
      
      return result[0].amount;
    } catch (error) {
      console.error('Error awarding XP:', error);
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
      sourceId: communityId, 
      communityId,
      metadata
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
      matchId,
      metadata
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
      metadata
    });
  }

  /**
   * Get user's XP history
   */
  async getUserXpHistory(userId: number, limit = 10, offset = 0): Promise<typeof xpTransactions.$inferSelect[]> {
    try {
      const history = await db
        .select()
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            eq(xpTransactions.isHidden, false)
          )
        )
        .orderBy(desc(xpTransactions.createdAt))
        .limit(limit)
        .offset(offset);
      
      return history;
    } catch (error) {
      console.error('Error getting XP history:', error);
      throw error;
    }
  }

  /**
   * Get user's current level and progress to next level
   */
  async getUserLevelInfo(userId: number): Promise<{
    currentLevel: number;
    currentXp: number;
    nextLevelXp: number;
    progress: number;
    remainingXp: number;
    lifetimeXp: number;
    benefits: any;
  }> {
    try {
      // Get user's total XP
      const userXpResult = await db
        .select({ xp: sum(xpTransactions.amount) })
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, userId));
      
      const lifetimeXp = Number(userXpResult[0]?.xp || 0);
      
      // Get level thresholds
      const levels = await db
        .select()
        .from(xpLevelThresholds)
        .orderBy(xpLevelThresholds.level);
      
      // Find current level
      let currentLevel = 1;
      let nextLevelXp = 0;
      let benefits = {};
      
      for (let i = 0; i < levels.length; i++) {
        if (lifetimeXp >= levels[i].xpRequired) {
          currentLevel = levels[i].level;
          benefits = levels[i].benefits;
          
          // Set next level threshold
          if (i < levels.length - 1) {
            nextLevelXp = levels[i + 1].xpRequired;
          } else {
            // Max level reached
            nextLevelXp = levels[i].xpRequired;
          }
        } else {
          // Found the next level
          nextLevelXp = levels[i].xpRequired;
          break;
        }
      }
      
      // Calculate progress to next level
      const currentLevelData = levels.find(l => l.level === currentLevel);
      const currentLevelXp = currentLevelData ? currentLevelData.xpRequired : 0;
      const xpInCurrentLevel = lifetimeXp - currentLevelXp;
      const xpRequiredForNextLevel = nextLevelXp - currentLevelXp;
      const progress = Math.min(100, Math.round((xpInCurrentLevel / Math.max(1, xpRequiredForNextLevel)) * 100));
      const remainingXp = nextLevelXp - lifetimeXp;
      
      return {
        currentLevel,
        currentXp: lifetimeXp,
        nextLevelXp,
        progress,
        remainingXp,
        lifetimeXp,
        benefits
      };
    } catch (error) {
      console.error('Error getting user level info:', error);
      throw error;
    }
  }

  /**
   * Calculate level based on XP amount
   */
  async calculateLevelForXp(xpAmount: number): Promise<number> {
    try {
      const levels = await db
        .select()
        .from(xpLevelThresholds)
        .where(
          xpLevelThresholds.xpRequired <= xpAmount
        )
        .orderBy(desc(xpLevelThresholds.level));
      
      return levels.length > 0 ? levels[0].level : 1;
    } catch (error) {
      console.error('Error calculating level for XP:', error);
      throw error;
    }
  }

  /**
   * Get the recommended activities for a user
   * Uses Pickle Pulse™ adjustments to suggest activities with highest current value
   */
  async getRecommendedActivities(userId: number, limit = 5): Promise<{
    activityType: string;
    description: string;
    xpValue: number;
    isNew: boolean;
    category: string;
  }[]> {
    try {
      // Get all activity multipliers, ordered by effective value (base XP × multiplier)
      const activities = await db
        .select({
          activityType: activityMultipliers.activityType,
          category: activityMultipliers.category,
          baseXpValue: activityMultipliers.baseXpValue,
          currentMultiplier: activityMultipliers.currentMultiplier
        })
        .from(activityMultipliers)
        .where(eq(activityMultipliers.isActive, true))
        .orderBy(sql`${activityMultipliers.baseXpValue} * ${activityMultipliers.currentMultiplier} / 100 DESC`);
      
      // Get the user's recent activities (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivities = await db
        .select({
          sourceType: xpTransactions.sourceType,
          count: count()
        })
        .from(xpTransactions)
        .where(
          and(
            eq(xpTransactions.userId, userId),
            gt(xpTransactions.createdAt, sevenDaysAgo)
          )
        )
        .groupBy(xpTransactions.sourceType);
      
      // Convert to a Map for easier lookup
      const activityCounts = new Map<string, number>();
      recentActivities.forEach(a => {
        if (a.sourceType) {
          activityCounts.set(a.sourceType, Number(a.count));
        }
      });
      
      // Build recommended activities list
      // Prioritize activities with high effective value that user hasn't done recently
      const recommended = activities.map(activity => {
        const timesCompleted = activityCounts.get(activity.activityType) || 0;
        const effectiveValue = Math.round((activity.baseXpValue * activity.currentMultiplier) / 100);
        
        return {
          activityType: activity.activityType,
          description: this.getActivityDescription(activity.activityType),
          xpValue: effectiveValue,
          isNew: timesCompleted === 0,
          category: activity.category,
          priority: effectiveValue * (timesCompleted === 0 ? 2 : 1) // Boost new activities
        };
      });
      
      // Sort by priority and take the top 'limit' activities
      return recommended
        .sort((a, b) => b.priority - a.priority)
        .slice(0, limit)
        .map(({ activityType, description, xpValue, isNew, category }) => ({
          activityType, description, xpValue, isNew, category
        }));
    } catch (error) {
      console.error('Error getting recommended activities:', error);
      throw error;
    }
  }

  /**
   * Apply Pickle Pulse™ multiplier to an XP amount
   * This is the core of the dynamic adjustment system
   */
  private async applyPicklePulseMultiplier(baseAmount: number, activityType: string): Promise<number> {
    try {
      // Get the current multiplier for this activity type
      const multiplierResult = await db
        .select({
          currentMultiplier: activityMultipliers.currentMultiplier,
          baseXpValue: activityMultipliers.baseXpValue
        })
        .from(activityMultipliers)
        .where(eq(activityMultipliers.activityType, activityType));
      
      if (multiplierResult.length === 0) {
        // No multiplier defined, use the base amount
        console.log(`No multiplier found for activity type '${activityType}', using base amount`);
        return baseAmount;
      }
      
      const { currentMultiplier, baseXpValue } = multiplierResult[0];
      
      // Use the defined base XP value if available, otherwise use the provided amount
      const baseXp = baseXpValue || baseAmount;
      
      // Apply multiplier (percentage)
      const adjustedAmount = Math.round((baseXp * currentMultiplier) / 100);
      
      console.log(`Applied Pickle Pulse™ multiplier to ${activityType}: ${baseXp} × ${currentMultiplier}% = ${adjustedAmount}`);
      
      return adjustedAmount;
    } catch (error) {
      console.error('Error applying Pickle Pulse multiplier:', error);
      // Fallback to base amount on error
      return baseAmount;
    }
  }

  /**
   * Get base XP value for an activity
   */
  private async getBaseXpForActivity(activityType: string): Promise<number> {
    try {
      const result = await db
        .select({ baseXpValue: activityMultipliers.baseXpValue })
        .from(activityMultipliers)
        .where(eq(activityMultipliers.activityType, activityType));
      
      if (result.length === 0) {
        console.warn(`No base XP value defined for activity type '${activityType}', using default of 1`);
        return 1;
      }
      
      return result[0].baseXpValue;
    } catch (error) {
      console.error('Error getting base XP for activity:', error);
      return 1; // Default fallback value
    }
  }

  /**
   * Get a human-readable description for an activity type
   */
  private getActivityDescription(activityType: string): string {
    const descriptions: Record<string, string> = {
      // Match-related
      'match_play': 'Played a match',
      'match_win': 'Won a match',
      'first_match_of_day': 'First match of the day',
      
      // Community activities
      'create_post': 'Created a community post',
      'add_comment': 'Added a comment',
      'create_event': 'Created a community event',
      'attend_event': 'Attended a community event',
      
      // Profile completion
      'complete_profile_field': 'Completed a profile field',
      'upload_profile_photo': 'Uploaded a profile photo',
      'verify_external_rating': 'Verified external rating',
      
      // Achievement related
      'unlock_achievement': 'Unlocked an achievement'
    };
    
    return descriptions[activityType] || `Earned XP from ${activityType.replace('_', ' ')}`;
  }

  /**
   * Run the weekly Pickle Pulse™ recalibration job
   * This adjusts multipliers based on platform-wide activity distribution
   */
  async runPicklePulseRecalibration(): Promise<void> {
    try {
      console.log('Starting Pickle Pulse™ recalibration...');
      
      // Get all activity types and their target ratios
      const activityTypes = await db
        .select()
        .from(activityMultipliers);
      
      // Get the current activity distribution (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activityCounts = await db
        .select({
          sourceType: xpTransactions.sourceType,
          count: count(),
          totalXp: sum(xpTransactions.amount)
        })
        .from(xpTransactions)
        .where(gt(xpTransactions.createdAt, sevenDaysAgo))
        .groupBy(xpTransactions.sourceType);
      
      // Calculate total activities
      const totalActivities = activityCounts.reduce((sum, act) => sum + Number(act.count), 0);
      
      if (totalActivities === 0) {
        console.log('No activities found in the last 7 days, skipping recalibration');
        return;
      }
      
      // Update each activity multiplier
      for (const activity of activityTypes) {
        const activityData = activityCounts.find(a => a.sourceType === activity.activityType);
        const currentCount = activityData ? Number(activityData.count) : 0;
        const currentRatio = Math.round((currentCount / totalActivities) * 100);
        
        // Calculate new multiplier based on target vs. current ratio
        // If target is higher than current, increase multiplier to encourage activity
        let newMultiplier = activity.currentMultiplier;
        const adjustmentFactor = 5; // How aggressively to adjust (5% per recalibration)
        
        if (activity.targetRatio > currentRatio) {
          // Increase multiplier to encourage this activity
          newMultiplier = Math.min(200, activity.currentMultiplier + adjustmentFactor);
        } else if (activity.targetRatio < currentRatio) {
          // Decrease multiplier to discourage this activity
          newMultiplier = Math.max(50, activity.currentMultiplier - adjustmentFactor);
        }
        
        // Skip if no change
        if (newMultiplier === activity.currentMultiplier) {
          continue;
        }
        
        // Log the change in the recalibrations table
        await db.insert(multiplierRecalibrations).values({
          activityType: activity.activityType,
          previousMultiplier: activity.currentMultiplier,
          newMultiplier,
          adjustmentReason: `Auto-recalibration: target ${activity.targetRatio}%, current ${currentRatio}%`,
          metadata: {
            targetRatio: activity.targetRatio,
            currentRatio,
            totalActivities,
            activityCount: currentCount
          }
        });
        
        // Update the activity multiplier
        await db
          .update(activityMultipliers)
          .set({
            currentMultiplier: newMultiplier,
            currentRatio: currentRatio,
            weeklyTrend: currentRatio - activity.currentRatio,
            lastRecalibration: new Date()
          })
          .where(eq(activityMultipliers.id, activity.id));
        
        console.log(`Recalibrated ${activity.activityType}: ${activity.currentMultiplier}% → ${newMultiplier}% (target: ${activity.targetRatio}%, current: ${currentRatio}%)`);
      }
      
      console.log('Pickle Pulse™ recalibration completed successfully');
    } catch (error) {
      console.error('Error running Pickle Pulse recalibration:', error);
      throw error;
    }
  }
}

export const xpService = new XpService();