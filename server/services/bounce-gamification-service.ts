/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Gamification Service
 * 
 * This service handles the gamification aspects of the Bounce testing system,
 * including achievement tracking, progress updates, and leaderboard maintenance.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from "../db";
import { eq, and, sql, desc, count } from "drizzle-orm";
import {
  bounceInteractions,
  userBounceAchievements,
  bounceAchievements,
  bounceLeaderboard,
  BounceInteractionType,
  BounceAchievementType,
  type UserBounceAchievement,
  type BounceAchievement
} from "@shared/schema";
import { xpService } from "./xp-service";

/**
 * Class handling all Bounce gamification features
 */
export class BounceGamificationService {
  /**
   * Process a user interaction with the Bounce system
   * @param userId User ID
   * @param findingId Finding ID
   * @param interactionType Type of interaction
   * @param points Points earned for the interaction
   * @param metadata Additional metadata about the interaction
   */
  async processInteraction(
    userId: number,
    findingId: number,
    interactionType: BounceInteractionType,
    points: number,
    metadata: any = {}
  ): Promise<{
    success: boolean;
    achievements?: UserBounceAchievement[];
    error?: string;
  }> {
    try {
      // 1. Record the interaction
      await db.insert(bounceInteractions).values({
        userId,
        findingId,
        type: interactionType,
        points,
        metadata
      });
      
      // 2. Award XP based on points (1 point = 1 XP)
      await xpService.awardXp(userId, points, "Bounce Testing");
      
      // 3. Update the user's leaderboard entry
      await this.updateLeaderboard(userId);
      
      // 4. Check for achievements
      const newAchievements = await this.checkForAchievements(userId, interactionType);
      
      return {
        success: true,
        achievements: newAchievements
      };
    } catch (error) {
      console.error("Error processing Bounce interaction:", error);
      return {
        success: false,
        error: "Failed to process interaction"
      };
    }
  }
  
  /**
   * Update the user's position on the Bounce leaderboard
   * @param userId User ID
   */
  async updateLeaderboard(userId: number): Promise<boolean> {
    try {
      // Calculate user's points and interaction totals
      const [pointsResult] = await db
        .select({
          totalPoints: sql<number>`sum(points)`,
          totalInteractions: count()
        })
        .from(bounceInteractions)
        .where(eq(bounceInteractions.userId, userId));
        
      // Calculate findings total
      const [findingsResult] = await db
        .select({
          totalFindings: count()
        })
        .from(bounceInteractions)
        .where(
          and(
            eq(bounceInteractions.userId, userId),
            eq(bounceInteractions.type, BounceInteractionType.REPORT_ISSUE)
          )
        );
        
      // Calculate verifications total
      const [verificationsResult] = await db
        .select({
          totalVerifications: count()
        })
        .from(bounceInteractions)
        .where(
          and(
            eq(bounceInteractions.userId, userId),
            eq(bounceInteractions.type, BounceInteractionType.CONFIRM_FINDING)
          )
        );
      
      // Check if user already has a leaderboard entry
      const [existingEntry] = await db
        .select()
        .from(bounceLeaderboard)
        .where(eq(bounceLeaderboard.userId, userId));
      
      const now = new Date();
      const totalPoints = pointsResult.totalPoints || 0;
      const totalInteractions = pointsResult.totalInteractions || 0;
      const totalFindings = findingsResult.totalFindings || 0;
      const totalVerifications = verificationsResult.totalVerifications || 0;
      
      if (existingEntry) {
        // Update existing entry
        await db
          .update(bounceLeaderboard)
          .set({
            totalPoints,
            totalInteractions,
            totalFindings,
            totalVerifications,
            lastInteractionAt: now,
            updatedAt: now
          })
          .where(eq(bounceLeaderboard.userId, userId));
      } else {
        // Create new entry
        await db
          .insert(bounceLeaderboard)
          .values({
            userId,
            totalPoints,
            totalInteractions,
            totalFindings,
            totalVerifications,
            lastInteractionAt: now
          });
      }
      
      // Update ranks for all users
      await this.updateLeaderboardRanks();
      
      return true;
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      return false;
    }
  }
  
  /**
   * Update rank positions for all users on the leaderboard
   */
  async updateLeaderboardRanks(): Promise<void> {
    try {
      // Get all users ordered by points
      const leaderboardEntries = await db
        .select()
        .from(bounceLeaderboard)
        .orderBy(desc(bounceLeaderboard.totalPoints));
      
      // Update ranks
      for (let i = 0; i < leaderboardEntries.length; i++) {
        const entry = leaderboardEntries[i];
        const rank = i + 1;
        
        await db
          .update(bounceLeaderboard)
          .set({ rank })
          .where(eq(bounceLeaderboard.id, entry.id));
      }
    } catch (error) {
      console.error("Error updating leaderboard ranks:", error);
    }
  }
  
  /**
   * Check if the user has earned any new achievements
   * @param userId User ID
   * @param interactionType Type of interaction
   * @returns Array of newly earned achievements
   */
  async checkForAchievements(
    userId: number,
    interactionType: BounceInteractionType
  ): Promise<UserBounceAchievement[]> {
    try {
      // Get all achievements for this interaction type
      const achievements = await db
        .select()
        .from(bounceAchievements)
        .where(
          and(
            sql`${bounceAchievements.requiredInteractionTypes}::jsonb @> $1::jsonb`,
            [JSON.stringify([interactionType])],
            eq(bounceAchievements.isActive, true)
          )
        );
      
      // Get user's current progress for these achievements
      const existingProgress = await db
        .select()
        .from(userBounceAchievements)
        .where(
          and(
            eq(userBounceAchievements.userId, userId),
            sql`${userBounceAchievements.achievementId} IN (${achievements.map(a => a.id).join(',')})`
          )
        );
      
      // Create map of existing progress
      const progressMap = new Map<number, UserBounceAchievement>();
      existingProgress.forEach(progress => {
        progressMap.set(progress.achievementId, progress);
      });
      
      // Get interaction counts
      const [interactionCounts] = await db
        .select({
          totalInteractions: count(),
          interactionType
        })
        .from(bounceInteractions)
        .where(
          and(
            eq(bounceInteractions.userId, userId),
            eq(bounceInteractions.type, interactionType as any)
          )
        )
        .groupBy(bounceInteractions.type);
      
      // Get total points
      const [pointsResult] = await db
        .select({
          totalPoints: sql<number>`sum(points)`
        })
        .from(bounceInteractions)
        .where(eq(bounceInteractions.userId, userId));
      
      const totalPoints = pointsResult.totalPoints || 0;
      const totalInteractions = interactionCounts?.totalInteractions || 0;
      
      // Check each achievement
      const newlyEarnedAchievements: UserBounceAchievement[] = [];
      const now = new Date();
      
      for (const achievement of achievements) {
        const existingUserAchievement = progressMap.get(achievement.id);
        
        if (existingUserAchievement && existingUserAchievement.isComplete) {
          // Already completed this achievement
          continue;
        }
        
        let progress = 0;
        let isComplete = false;
        
        // Check if achievement requirements are met
        if (achievement.requiredPoints && totalPoints >= achievement.requiredPoints) {
          progress = totalPoints;
          isComplete = true;
        } else if (achievement.requiredInteractions && totalInteractions >= achievement.requiredInteractions) {
          progress = totalInteractions;
          isComplete = true;
        }
        
        if (existingUserAchievement) {
          // Update existing progress
          if (isComplete && !existingUserAchievement.isComplete) {
            // Achievement newly completed
            await db
              .update(userBounceAchievements)
              .set({
                progress,
                isComplete,
                awardedAt: now,
                updatedAt: now
              })
              .where(eq(userBounceAchievements.id, existingUserAchievement.id));
            
            // Award XP for completing the achievement
            if (achievement.xpReward) {
              await xpService.awardXp(
                userId,
                achievement.xpReward,
                `Achievement: ${achievement.name}`
              );
            }
            
            // Add to newly earned achievements
            newlyEarnedAchievements.push({
              ...existingUserAchievement,
              progress,
              isComplete,
              awardedAt: now
            });
          } else if (progress > existingUserAchievement.progress) {
            // Just update progress
            await db
              .update(userBounceAchievements)
              .set({
                progress,
                updatedAt: now
              })
              .where(eq(userBounceAchievements.id, existingUserAchievement.id));
          }
        } else {
          // Create new progress record
          const [newUserAchievement] = await db
            .insert(userBounceAchievements)
            .values({
              userId,
              achievementId: achievement.id,
              progress,
              isComplete,
              awardedAt: isComplete ? now : undefined
            })
            .returning();
          
          // Award XP if completed immediately
          if (isComplete && achievement.xpReward) {
            await xpService.awardXp(
              userId,
              achievement.xpReward,
              `Achievement: ${achievement.name}`
            );
          }
          
          // Add to newly earned achievements if completed
          if (isComplete) {
            newlyEarnedAchievements.push(newUserAchievement);
          }
        }
      }
      
      return newlyEarnedAchievements;
    } catch (error) {
      console.error("Error checking for achievements:", error);
      return [];
    }
  }
  
  /**
   * Get all achievements for a user
   * @param userId User ID
   * @returns User achievements with progress
   */
  async getUserAchievements(userId: number): Promise<{
    achievements: Array<BounceAchievement & { progress: number; isComplete: boolean; awardedAt?: Date }>;
    stats: {
      totalEarned: number;
      totalAvailable: number;
      percentComplete: number;
    };
  }> {
    try {
      // Get all Bounce achievements
      const allAchievements = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.isActive, true));
      
      // Get user's progress for these achievements
      const userProgress = await db
        .select()
        .from(userBounceAchievements)
        .where(eq(userBounceAchievements.userId, userId));
      
      // Create map of user progress
      const progressMap = new Map<number, UserBounceAchievement>();
      userProgress.forEach(progress => {
        progressMap.set(progress.achievementId, progress);
      });
      
      // Combine achievements with progress
      const achievementsWithProgress = allAchievements.map(achievement => {
        const progress = progressMap.get(achievement.id);
        
        return {
          ...achievement,
          progress: progress?.progress || 0,
          isComplete: progress?.isComplete || false,
          awardedAt: progress?.awardedAt
        };
      });
      
      // Calculate stats
      const totalEarned = userProgress.filter(p => p.isComplete).length;
      const totalAvailable = allAchievements.length;
      const percentComplete = totalAvailable > 0 
        ? Math.round((totalEarned / totalAvailable) * 100) 
        : 0;
      
      return {
        achievements: achievementsWithProgress,
        stats: {
          totalEarned,
          totalAvailable,
          percentComplete
        }
      };
    } catch (error) {
      console.error("Error getting user achievements:", error);
      return {
        achievements: [],
        stats: {
          totalEarned: 0,
          totalAvailable: 0,
          percentComplete: 0
        }
      };
    }
  }
  
  /**
   * Get the Bounce leaderboard
   * @param limit Number of entries to return
   * @param offset Offset for pagination
   * @returns Leaderboard entries with user info
   */
  async getLeaderboard(limit = 10, offset = 0): Promise<{
    leaderboard: Array<{
      rank: number;
      userId: number;
      username: string;
      displayName?: string;
      avatarUrl?: string;
      totalPoints: number;
      totalFindings: number;
      lastInteractionAt?: Date;
    }>;
    totalUsers: number;
  }> {
    try {
      // Get leaderboard entries with user information
      const leaderboardEntries = await db
        .select({
          rank: bounceLeaderboard.rank,
          userId: bounceLeaderboard.userId,
          username: sql<string>`users.username`,
          displayName: sql<string>`users.display_name`,
          avatarUrl: sql<string>`users.avatar_url`,
          totalPoints: bounceLeaderboard.totalPoints,
          totalFindings: bounceLeaderboard.totalFindings,
          lastInteractionAt: bounceLeaderboard.lastInteractionAt
        })
        .from(bounceLeaderboard)
        .innerJoin("users", eq(bounceLeaderboard.userId, sql`users.id`))
        .orderBy(bounceLeaderboard.rank)
        .limit(limit)
        .offset(offset);
      
      // Get total count
      const [totalCount] = await db
        .select({ count: count() })
        .from(bounceLeaderboard);
      
      return {
        leaderboard: leaderboardEntries,
        totalUsers: totalCount.count
      };
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return {
        leaderboard: [],
        totalUsers: 0
      };
    }
  }
  
  /**
   * Get a user's position on the leaderboard
   * @param userId User ID
   * @returns User's leaderboard position
   */
  async getUserLeaderboardPosition(userId: number): Promise<{
    found: boolean;
    rank?: number;
    totalPoints?: number;
    totalUsers?: number;
  }> {
    try {
      // Get user's leaderboard entry
      const [userEntry] = await db
        .select()
        .from(bounceLeaderboard)
        .where(eq(bounceLeaderboard.userId, userId));
      
      if (!userEntry) {
        return { found: false };
      }
      
      // Get total count
      const [totalCount] = await db
        .select({ count: count() })
        .from(bounceLeaderboard);
      
      return {
        found: true,
        rank: userEntry.rank,
        totalPoints: userEntry.totalPoints,
        totalUsers: totalCount.count
      };
    } catch (error) {
      console.error("Error getting user leaderboard position:", error);
      return { found: false };
    }
  }
  
  /**
   * Get recently earned achievements by all users
   * @param limit Number of entries to return
   * @returns Recent achievements with user info
   */
  async getRecentAchievements(limit = 5): Promise<Array<{
    achievementId: number;
    achievementName: string;
    achievementDescription: string;
    achievementIcon?: string;
    userId: number;
    username: string;
    displayName?: string;
    awardedAt: Date;
  }>> {
    try {
      const recentAchievements = await db
        .select({
          achievementId: userBounceAchievements.achievementId,
          achievementName: sql<string>`bounce_achievements.name`,
          achievementDescription: sql<string>`bounce_achievements.description`,
          achievementIcon: sql<string>`bounce_achievements.icon`,
          userId: userBounceAchievements.userId,
          username: sql<string>`users.username`,
          displayName: sql<string>`users.display_name`,
          awardedAt: userBounceAchievements.awardedAt
        })
        .from(userBounceAchievements)
        .innerJoin("bounce_achievements", eq(userBounceAchievements.achievementId, sql`bounce_achievements.id`))
        .innerJoin("users", eq(userBounceAchievements.userId, sql`users.id`))
        .where(
          and(
            eq(userBounceAchievements.isComplete, true),
            sql`${userBounceAchievements.awardedAt} IS NOT NULL`
          )
        )
        .orderBy(desc(userBounceAchievements.awardedAt))
        .limit(limit);
      
      return recentAchievements;
    } catch (error) {
      console.error("Error getting recent achievements:", error);
      return [];
    }
  }
}

// Export singleton instance
export const bounceGamificationService = new BounceGamificationService();