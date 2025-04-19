/**
 * PKL-278651-XP-0002-UI
 * XP Service
 * 
 * Core service for XP operations with business logic for
 * awarding XP, tracking levels, and providing recommendations.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { db } from '../../db';
import { and, eq, desc, lte, sql } from 'drizzle-orm';
import {
  xpTransactions,
  xpLevelThresholds,
  activityMultipliers,
  users
} from '@shared/schema';

// Type for XP award parameters
interface AwardXpParams {
  userId: number;
  amount: number;
  source: string;
  sourceType?: string;
  sourceId?: number;
  description?: string;
  createdById?: number;
  matchId?: number;
  communityId?: number;
  achievementId?: number;
  tournamentId?: number;
}

// Type for activity recommendation
interface ActivityRecommendation {
  type: string;
  description: string;
  xpAmount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  url?: string;
  isMultiplierActive?: boolean; // Whether this activity has an active multiplier
}

// Type for level info
interface LevelInfo {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
  progress: number;
  remainingXp: number;
  lifetimeXp: number;
  benefits: {
    perks: string[];
    isKeyMilestone?: boolean;
  };
}

export class XpService {
  /**
   * Award XP to a user
   * Handles application of multipliers
   */
  async awardXp(params: AwardXpParams): Promise<number> {
    try {
      // Apply any active multipliers
      const actualAmount = await this.applyMultipliers(params.amount, params.source, params.userId);
      
      // Insert transaction
      const [transaction] = await db.insert(xpTransactions).values({
        userId: params.userId,
        amount: actualAmount,
        source: params.source,
        sourceType: params.sourceType || null,
        sourceId: params.sourceId || null,
        description: params.description || null,
        createdById: params.createdById || null,
        matchId: params.matchId || null,
        communityId: params.communityId || null,
        achievementId: params.achievementId || null,
        tournamentId: params.tournamentId || null
      }).returning();
      
      // Update user's total XP (optional optimization)
      await this.updateUserTotalXp(params.userId);
      
      // Check for level up event
      await this.checkForLevelUp(params.userId);
      
      return actualAmount;
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  }
  
  /**
   * Get user's current XP and level info
   */
  async getUserLevelInfo(userId: number): Promise<LevelInfo> {
    try {
      // Get user's total XP
      const totalXp = await this.getUserTotalXp(userId);
      
      // Get current level based on XP
      const currentLevel = await this.getUserLevel(userId);
      
      // Get XP required for current level
      const currentLevelData = await db.query.xpLevelThresholds.findFirst({
        where: eq(xpLevelThresholds.level, currentLevel)
      });
      
      // Get XP required for next level
      const nextLevelData = await db.query.xpLevelThresholds.findFirst({
        where: eq(xpLevelThresholds.level, currentLevel + 1)
      });
      
      // Calculate XP needed for next level
      const nextLevelXp = nextLevelData?.xpRequired || Infinity;
      const xpForCurrentLevel = currentLevelData?.xpRequired || 0;
      const xpSinceLastLevel = totalXp - xpForCurrentLevel;
      const xpToNextLevel = nextLevelXp - xpForCurrentLevel;
      const progress = Math.min(Math.floor((xpSinceLastLevel / xpToNextLevel) * 100), 100);
      const remainingXp = nextLevelXp - totalXp;
      
      // Get benefits for current level
      const benefits = await this.getLevelBenefits(currentLevel);
      
      return {
        currentLevel,
        currentXp: totalXp,
        nextLevelXp,
        progress,
        remainingXp,
        lifetimeXp: totalXp,
        benefits
      };
    } catch (error) {
      console.error('Error getting user level info:', error);
      throw error;
    }
  }
  
  /**
   * Get user's XP transaction history
   */
  async getUserXpHistory(userId: number, limit: number, offset: number = 0) {
    try {
      return await db.query.xpTransactions.findMany({
        where: eq(xpTransactions.userId, userId),
        orderBy: [desc(xpTransactions.createdAt)],
        limit,
        offset
      });
    } catch (error) {
      console.error('Error getting XP history:', error);
      throw error;
    }
  }
  
  /**
   * Count user's XP transactions for pagination
   */
  async countUserXpTransactions(userId: number): Promise<number> {
    try {
      const result = await db.select({ count: sql`count(*)` })
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, userId));
      
      return Number(result[0].count) || 0;
    } catch (error) {
      console.error('Error counting XP transactions:', error);
      return 0;
    }
  }
  
  /**
   * Get personalized activity recommendations for earning XP
   */
  async getRecommendedActivities(userId: number, limit: number = 5): Promise<ActivityRecommendation[]> {
    try {
      // Get user's recent activity to personalize recommendations
      const recentTransactions = await db.query.xpTransactions.findMany({
        where: eq(xpTransactions.userId, userId),
        orderBy: [desc(xpTransactions.createdAt)],
        limit: 20
      });
      
      // Get active multipliers for boosted recommendations
      const activeMultipliers = await db.query.activityMultipliers.findMany({
        where: sql`current_timestamp < expiration_date`
      });
      
      // Base recommendations
      const baseRecommendations: ActivityRecommendation[] = [
        {
          type: 'match',
          description: 'Play a match today',
          xpAmount: 5,
          difficulty: 'easy',
          url: '/matches/new'
        },
        {
          type: 'community',
          description: 'Create a post in a community',
          xpAmount: 1,
          difficulty: 'easy',
          url: '/communities'
        },
        {
          type: 'tournament',
          description: 'Join an upcoming tournament',
          xpAmount: 10,
          difficulty: 'medium',
          url: '/tournaments'
        },
        {
          type: 'profile',
          description: 'Complete your profile information',
          xpAmount: 3,
          difficulty: 'easy',
          url: '/profile/edit'
        },
        {
          type: 'match',
          description: 'Win 3 matches this week',
          xpAmount: 15,
          difficulty: 'medium',
          url: '/matches/new'
        },
        {
          type: 'community',
          description: 'Create a community event',
          xpAmount: 3,
          difficulty: 'medium',
          url: '/communities'
        }
      ];
      
      // Apply multipliers to recommendations
      const recommendationsWithMultipliers = baseRecommendations.map(rec => {
        const matchingMultiplier = activeMultipliers.find(m => 
          m.activityType === rec.type
        );
        
        if (matchingMultiplier) {
          return {
            ...rec,
            xpAmount: Math.round(rec.xpAmount * matchingMultiplier.multiplierValue * 10) / 10,
            isMultiplierActive: true
          };
        }
        
        return rec;
      });
      
      // Analyze user patterns to prioritize recommendations
      // Simple algorithm - recommend things they haven't done recently
      const recentActivityTypes = new Set(
        recentTransactions.map(t => t.source)
      );
      
      // Prioritize recommendations for activities the user hasn't done recently
      const prioritizedRecommendations = [
        // First show recommendations with active multipliers
        ...recommendationsWithMultipliers.filter(r => r.isMultiplierActive),
        // Then activities they haven't done recently
        ...recommendationsWithMultipliers.filter(r => 
          !r.isMultiplierActive && !recentActivityTypes.has(r.type)
        ),
        // Then the rest
        ...recommendationsWithMultipliers.filter(r => 
          !r.isMultiplierActive && recentActivityTypes.has(r.type)
        )
      ];
      
      return prioritizedRecommendations.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommended activities:', error);
      // Return some fallback recommendations
      return [
        {
          type: 'match',
          description: 'Play a match today',
          xpAmount: 5,
          difficulty: 'easy'
        },
        {
          type: 'community',
          description: 'Create a post in a community',
          xpAmount: 1,
          difficulty: 'easy'
        }
      ];
    }
  }
  
  /**
   * Calculate and apply multipliers to XP awards
   */
  private async applyMultipliers(
    baseAmount: number, 
    activityType: string, 
    userId: number
  ): Promise<number> {
    try {
      // Get any active multipliers for this activity type
      const activeMultipliers = await db.query.activityMultipliers.findMany({
        where: and(
          eq(activityMultipliers.activityType, activityType),
          sql`current_timestamp < expiration_date`
        )
      });
      
      // Special case - check if this is their first activity of this type today
      const isFirstActivityToday = await this.isFirstActivityOfTypeToday(userId, activityType);
      
      // Apply all applicable multipliers
      let finalAmount = baseAmount;
      
      // Apply global multipliers
      for (const multiplier of activeMultipliers) {
        finalAmount *= multiplier.multiplierValue;
      }
      
      // Apply first-of-day bonus (1.5x)
      if (isFirstActivityToday) {
        finalAmount *= 1.5;
      }
      
      // Round to 1 decimal place
      return Math.round(finalAmount * 10) / 10;
    } catch (error) {
      console.error('Error applying multipliers:', error);
      return baseAmount; // Fallback to base amount if error
    }
  }
  
  /**
   * Check if this is user's first activity of this type today
   */
  private async isFirstActivityOfTypeToday(userId: number, activityType: string): Promise<boolean> {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const recentActivity = await db.query.xpTransactions.findFirst({
        where: and(
          eq(xpTransactions.userId, userId),
          eq(xpTransactions.source, activityType),
          sql`created_at > ${todayStart.toISOString()}`
        )
      });
      
      return !recentActivity;
    } catch (error) {
      console.error('Error checking first activity of the day:', error);
      return false;
    }
  }
  
  /**
   * Update user's total XP in the users table (optimization)
   */
  private async updateUserTotalXp(userId: number): Promise<void> {
    try {
      const totalXp = await this.calculateUserTotalXp(userId);
      
      await db.update(users)
        .set({
          totalXp
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user total XP:', error);
      // Don't throw - this is an optimization, not critical
    }
  }
  
  /**
   * Calculate user's total XP from transactions
   */
  private async calculateUserTotalXp(userId: number): Promise<number> {
    try {
      const result = await db.select({ sum: sql`sum(amount)` })
        .from(xpTransactions)
        .where(eq(xpTransactions.userId, userId));
      
      return Number(result[0].sum) || 0;
    } catch (error) {
      console.error('Error calculating total XP:', error);
      return 0;
    }
  }
  
  /**
   * Get user's current total XP
   */
  private async getUserTotalXp(userId: number): Promise<number> {
    try {
      // Try to get from users table first (optimization)
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          totalXp: true
        }
      });
      
      if (user?.totalXp !== null && user?.totalXp !== undefined) {
        return user.totalXp;
      }
      
      // Fall back to calculating from transactions
      return await this.calculateUserTotalXp(userId);
    } catch (error) {
      console.error('Error getting user total XP:', error);
      return await this.calculateUserTotalXp(userId);
    }
  }
  
  /**
   * Determine user's current level based on XP
   */
  private async getUserLevel(userId: number): Promise<number> {
    try {
      const totalXp = await this.getUserTotalXp(userId);
      
      // Find the highest level threshold that the user has passed
      const levelData = await db.query.xpLevelThresholds.findMany({
        where: sql`xp_required <= ${totalXp}`,
        orderBy: [desc(xpLevelThresholds.level)],
        limit: 1
      });
      
      if (levelData.length > 0) {
        return levelData[0].level;
      }
      
      return 1; // Default to level 1
    } catch (error) {
      console.error('Error getting user level:', error);
      return 1; // Default to level 1
    }
  }
  
  /**
   * Get benefits for a specific level
   */
  private async getLevelBenefits(level: number): Promise<{ perks: string[], isKeyMilestone?: boolean }> {
    try {
      const levelData = await db.query.xpLevelThresholds.findFirst({
        where: eq(xpLevelThresholds.level, level)
      });
      
      if (!levelData || !levelData.benefits) {
        return { perks: [] };
      }
      
      // Parse benefits from JSON
      let benefits;
      try {
        benefits = JSON.parse(levelData.benefits);
      } catch {
        benefits = {};
      }
      
      // Determine if this is a key milestone level (levels 5, 10, 25, 50, 75, 100)
      const isKeyMilestone = [5, 10, 25, 50, 75, 100].includes(level);
      
      // Extract perks or return empty array
      return {
        perks: Array.isArray(benefits.perks) ? benefits.perks : [],
        isKeyMilestone
      };
    } catch (error) {
      console.error('Error getting level benefits:', error);
      return { perks: [] };
    }
  }
  
  /**
   * Check for level up event
   */
  private async checkForLevelUp(userId: number): Promise<boolean> {
    try {
      // Implementation can be added later for level-up notifications
      // This could trigger WebSocket events or store a level-up flag
      return false;
    } catch (error) {
      console.error('Error checking for level up:', error);
      return false;
    }
  }
}