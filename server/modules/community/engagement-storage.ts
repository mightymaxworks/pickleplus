/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Engagement Storage Module
 * 
 * This module provides storage methods for tracking and retrieving
 * community engagement metrics.
 * 
 * @version 1.2.0
 * @lastModified 2025-04-20
 * @framework Framework5.2
 */

import { db } from "../../db";
import { eq, and, desc, sql, gte, lte, isNull, count, max, sum, SQL, asc } from "drizzle-orm";
import { 
  communityActivities, 
  communityEngagementMetrics, 
  communityEngagementLevels,
  communityLeaderboards,
  CommunityActivityType,
  InsertCommunityActivity,
  CommunityActivity,
  CommunityEngagementMetrics,
  CommunityEngagementLevel,
  CommunityLeaderboard,
  InsertCommunityLeaderboard
} from "@shared/schema/community-engagement";
import { ServerEventBus, ServerEvents } from "../../core/events";
import { users } from "@shared/schema";

/**
 * Community Engagement Storage Interface
 */
export class CommunityEngagementStorage {
  
  /**
   * Record a user activity in a community
   * PKL-278651-COMM-0022-XP: Updated to emit activity events for XP integration
   */
  async recordActivity(activity: InsertCommunityActivity): Promise<CommunityActivity> {
    // Insert activity
    const [newActivity] = await db.insert(communityActivities)
      .values(activity)
      .returning();
    
    // Update metrics after recording activity
    await this.updateEngagementMetrics(activity.userId, activity.communityId, activity.activityType);
    
    // PKL-278651-COMM-0022-XP: Emit event for XP integration
    await ServerEventBus.emit(ServerEvents.COMMUNITY_ACTIVITY_CREATED, {
      userId: activity.userId,
      communityId: activity.communityId,
      activityType: activity.activityType as any, // Cast to any to work with the event bus
      activityId: newActivity.id,
      metadata: activity.activityData || {}
    });
    
    return newActivity;
  }
  
  /**
   * Update user's engagement metrics after an activity
   */
  async updateEngagementMetrics(
    userId: number,
    communityId: number,
    activityType: string
  ): Promise<void> {
    // Check if metrics record exists
    const [existingMetrics] = await db.select()
      .from(communityEngagementMetrics)
      .where(
        and(
          eq(communityEngagementMetrics.userId, userId),
          eq(communityEngagementMetrics.communityId, communityId)
        )
      );
      
    const updateData: Record<string, any> = {
      totalActivities: sql`${communityEngagementMetrics.totalActivities} + 1`,
      totalPoints: sql`${communityEngagementMetrics.totalPoints} + 1`,
      lastActivityAt: new Date()
    };
    
    // Update specific activity counter based on type
    if (activityType === CommunityActivityType.POST_CREATED) {
      updateData.postCount = sql`${communityEngagementMetrics.postCount} + 1`;
    } else if (activityType === CommunityActivityType.COMMENT_ADDED) {
      updateData.commentCount = sql`${communityEngagementMetrics.commentCount} + 1`;
    } else if (activityType === CommunityActivityType.EVENT_ATTENDED) {
      updateData.eventAttendance = sql`${communityEngagementMetrics.eventAttendance} + 1`;
    }
    
    // Calculate new engagement level
    const engagementLevel = await this.calculateEngagementLevel(
      communityId,
      existingMetrics?.totalPoints + 1 || 1
    );
    
    if (engagementLevel) {
      updateData.engagementLevel = engagementLevel;
    }
    
    // Calculate streak
    const lastActivity = existingMetrics?.lastActivityAt;
    if (lastActivity) {
      const today = new Date();
      const lastActivityDate = new Date(lastActivity);
      
      // Check if last activity was yesterday
      const diffTime = Math.abs(today.getTime() - lastActivityDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Continuing streak
        updateData.streakDays = sql`${communityEngagementMetrics.streakDays} + 1`;
      } else if (diffDays > 1) {
        // Reset streak
        updateData.streakDays = 1;
      }
      // If same day, don't change streak
    }
    
    // Insert or update metrics
    if (existingMetrics) {
      await db.update(communityEngagementMetrics)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(communityEngagementMetrics.userId, userId),
            eq(communityEngagementMetrics.communityId, communityId)
          )
        );
    } else {
      // Initialize new metrics record
      await db.insert(communityEngagementMetrics)
        .values({
          userId,
          communityId,
          totalPoints: 1,
          totalActivities: 1,
          lastActivityAt: new Date(),
          streakDays: 1,
          engagementLevel: "NEWCOMER",
          postCount: activityType === CommunityActivityType.POST_CREATED ? 1 : 0,
          commentCount: activityType === CommunityActivityType.COMMENT_ADDED ? 1 : 0,
          eventAttendance: activityType === CommunityActivityType.EVENT_ATTENDED ? 1 : 0,
          updatedAt: new Date()
        });
    }
  }
  
  /**
   * Calculate the user's engagement level based on points
   */
  async calculateEngagementLevel(
    communityId: number,
    points: number
  ): Promise<string | null> {
    // Get all levels for this community, ordered by threshold
    const levels = await db.select()
      .from(communityEngagementLevels)
      .where(eq(communityEngagementLevels.communityId, communityId))
      .orderBy(desc(communityEngagementLevels.pointThreshold));
    
    // Find the highest level the user qualifies for
    for (const level of levels) {
      if (points >= level.pointThreshold) {
        return level.levelName;
      }
    }
    
    return "NEWCOMER"; // Default level
  }
  
  /**
   * Get top contributors for a community
   */
  async getTopContributors(
    communityId: number,
    limit: number = 10
  ): Promise<CommunityEngagementMetrics[]> {
    return db.select()
      .from(communityEngagementMetrics)
      .where(eq(communityEngagementMetrics.communityId, communityId))
      .orderBy(desc(communityEngagementMetrics.totalPoints))
      .limit(limit);
  }
  
  /**
   * Get recent activities in a community
   */
  async getRecentActivities(
    communityId: number,
    limit: number = 20
  ): Promise<CommunityActivity[]> {
    return db.select()
      .from(communityActivities)
      .where(
        and(
          eq(communityActivities.communityId, communityId),
          eq(communityActivities.isHidden, false)
        )
      )
      .orderBy(desc(communityActivities.createdAt))
      .limit(limit);
  }
  
  /**
   * Get user's engagement metrics for a community
   */
  async getUserEngagement(
    userId: number,
    communityId: number
  ): Promise<CommunityEngagementMetrics | undefined> {
    const [metrics] = await db.select()
      .from(communityEngagementMetrics)
      .where(
        and(
          eq(communityEngagementMetrics.userId, userId),
          eq(communityEngagementMetrics.communityId, communityId)
        )
      );
      
    return metrics;
  }
  
  /**
   * Get engagement levels for a community
   */
  async getEngagementLevels(
    communityId: number
  ): Promise<CommunityEngagementLevel[]> {
    return db.select()
      .from(communityEngagementLevels)
      .where(eq(communityEngagementLevels.communityId, communityId))
      .orderBy(communityEngagementLevels.pointThreshold);
  }
  
  /**
   * Get community activity summary (counts by type)
   */
  async getCommunityActivitySummary(communityId: number): Promise<Record<string, number>> {
    const result = await db.select({
      activityType: communityActivities.activityType,
      count: count(communityActivities.id)
    })
    .from(communityActivities)
    .where(eq(communityActivities.communityId, communityId))
    .groupBy(communityActivities.activityType);
    
    // Convert to record
    const summary: Record<string, number> = {};
    result.forEach(item => {
      summary[item.activityType] = Number(item.count);
    });
    
    return summary;
  }
  
  /**
   * Get community activity trends (daily counts)
   */
  async getCommunityActivityTrends(
    communityId: number,
    days: number = 30
  ): Promise<{ date: string; count: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = await db.select({
      date: sql<string>`date_trunc('day', ${communityActivities.createdAt})::date::text`,
      count: count(communityActivities.id)
    })
    .from(communityActivities)
    .where(
      and(
        eq(communityActivities.communityId, communityId),
        gte(communityActivities.createdAt, startDate)
      )
    )
    .groupBy(sql`date_trunc('day', ${communityActivities.createdAt})::date::text`)
    .orderBy(sql`date_trunc('day', ${communityActivities.createdAt})::date::text`);
    
    return result;
  }
  
  /**
   * Get community leaderboard data
   * PKL-278651-COMM-0021-ENGAGE: Leaderboard implementation
   */
  async getCommunityLeaderboard(
    communityId: number,
    leaderboardType: string = 'overall',
    timePeriod: string = 'week',
    limit: number = 20
  ): Promise<any[]> {
    // Try to find existing leaderboard data first
    const existingLeaderboard = await this.getExistingLeaderboard(
      communityId, 
      leaderboardType, 
      timePeriod
    );
    
    if (existingLeaderboard.length > 0) {
      // Return leaderboard with user details
      return this.addUserDetailsToLeaderboard(existingLeaderboard, limit);
    }
    
    // If no leaderboard data exists or it's outdated, generate it
    await this.generateLeaderboard(communityId, leaderboardType, timePeriod);
    
    // Get the newly generated leaderboard
    const freshLeaderboard = await this.getExistingLeaderboard(
      communityId, 
      leaderboardType, 
      timePeriod
    );
    
    // Return leaderboard with user details
    return this.addUserDetailsToLeaderboard(freshLeaderboard, limit);
  }
  
  /**
   * Get existing leaderboard data from the database
   */
  private async getExistingLeaderboard(
    communityId: number,
    leaderboardType: string,
    timePeriod: string
  ): Promise<CommunityLeaderboard[]> {
    // Get the time period range
    const { startDate, endDate } = this.getTimePeriodDates(timePeriod);
    
    // Find an existing, current leaderboard
    return db.select()
      .from(communityLeaderboards)
      .where(
        and(
          eq(communityLeaderboards.communityId, communityId),
          eq(communityLeaderboards.leaderboardType, leaderboardType),
          eq(communityLeaderboards.timePeriod, timePeriod),
          gte(communityLeaderboards.endDate, new Date()) // Still valid
        )
      )
      .orderBy(asc(communityLeaderboards.rank))
  }
  
  /**
   * Add user details to leaderboard entries
   */
  private async addUserDetailsToLeaderboard(
    leaderboard: CommunityLeaderboard[],
    limit: number
  ): Promise<any[]> {
    // Limit the number of entries
    const limitedLeaderboard = leaderboard.slice(0, limit);
    
    // Add user details to each leaderboard entry
    return Promise.all(
      limitedLeaderboard.map(async (entry) => {
        const [user] = await db.select({
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl
        })
        .from(users)
        .where(eq(users.id, entry.userId));
        
        return {
          ...entry,
          user: user || null
        };
      })
    );
  }
  
  /**
   * Generate a new leaderboard for the community
   */
  async generateLeaderboard(
    communityId: number,
    leaderboardType: string = 'overall',
    timePeriod: string = 'week'
  ): Promise<void> {
    // Get the time period range
    const { startDate, endDate } = this.getTimePeriodDates(timePeriod);
    
    // Get all users with engagement metrics in this community
    let metricsQuery = db.select()
      .from(communityEngagementMetrics)
      .where(eq(communityEngagementMetrics.communityId, communityId))
      .orderBy(desc(communityEngagementMetrics.totalPoints));
    
    // Filter or adjust based on leaderboard type
    if (leaderboardType === 'posts') {
      metricsQuery = db.select()
        .from(communityEngagementMetrics)
        .where(eq(communityEngagementMetrics.communityId, communityId))
        .orderBy(desc(communityEngagementMetrics.postCount));
    } else if (leaderboardType === 'comments') {
      metricsQuery = db.select()
        .from(communityEngagementMetrics)
        .where(eq(communityEngagementMetrics.communityId, communityId))
        .orderBy(desc(communityEngagementMetrics.commentCount));
    } else if (leaderboardType === 'events') {
      metricsQuery = db.select()
        .from(communityEngagementMetrics)
        .where(eq(communityEngagementMetrics.communityId, communityId))
        .orderBy(desc(communityEngagementMetrics.eventAttendance));
    }
    
    const metrics = await metricsQuery;
    
    // Delete any existing leaderboard for this period
    await db.delete(communityLeaderboards)
      .where(
        and(
          eq(communityLeaderboards.communityId, communityId),
          eq(communityLeaderboards.leaderboardType, leaderboardType),
          eq(communityLeaderboards.timePeriod, timePeriod)
        )
      );
    
    // Create new leaderboard entries
    const leaderboardEntries: InsertCommunityLeaderboard[] = metrics.map((metric, index) => {
      let points = metric.totalPoints;
      
      if (leaderboardType === 'posts') {
        points = metric.postCount;
      } else if (leaderboardType === 'comments') {
        points = metric.commentCount;
      } else if (leaderboardType === 'events') {
        points = metric.eventAttendance;
      }
      
      return {
        communityId,
        userId: metric.userId,
        leaderboardType,
        points,
        rank: index + 1,
        timePeriod,
        startDate,
        endDate,
        createdAt: new Date()
      };
    });
    
    // Insert new leaderboard data if there are entries
    if (leaderboardEntries.length > 0) {
      await db.insert(communityLeaderboards).values(leaderboardEntries);
    }
  }
  
  /**
   * Get start and end dates for a time period
   */
  private getTimePeriodDates(timePeriod: string): { startDate: Date, endDate: Date } {
    const now = new Date();
    const startDate = new Date();
    let endDate = new Date();
    
    if (timePeriod === 'day') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (timePeriod === 'week') {
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (timePeriod === 'month') {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (timePeriod === 'year') {
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate.getFullYear(), 11, 31);
      endDate.setHours(23, 59, 59, 999);
    } else if (timePeriod === 'all-time') {
      // Use a far past date for all-time
      startDate.setFullYear(2020, 0, 1);
      startDate.setHours(0, 0, 0, 0);
      
      // Use a far future date for end
      endDate.setFullYear(endDate.getFullYear() + 10);
    }
    
    return { startDate, endDate };
  }
  
  /**
   * Get user's position in a community leaderboard
   */
  async getUserLeaderboardPosition(
    userId: number,
    communityId: number,
    leaderboardType: string = 'overall',
    timePeriod: string = 'week'
  ): Promise<{ rank: number; total: number; points: number; } | null> {
    // Get the user's leaderboard entry
    const [userEntry] = await db.select()
      .from(communityLeaderboards)
      .where(
        and(
          eq(communityLeaderboards.userId, userId),
          eq(communityLeaderboards.communityId, communityId),
          eq(communityLeaderboards.leaderboardType, leaderboardType),
          eq(communityLeaderboards.timePeriod, timePeriod)
        )
      );
    
    if (!userEntry) {
      return null;
    }
    
    // Get the total number of entries in this leaderboard
    const [{ total }] = await db.select({
      total: count()
    })
    .from(communityLeaderboards)
    .where(
      and(
        eq(communityLeaderboards.communityId, communityId),
        eq(communityLeaderboards.leaderboardType, leaderboardType),
        eq(communityLeaderboards.timePeriod, timePeriod)
      )
    );
    
    return {
      rank: typeof userEntry.rank === 'number' ? userEntry.rank : 0,
      total: Number(total),
      points: userEntry.points
    };
  }
}

// Export singleton instance
export const communityEngagementStorage = new CommunityEngagementStorage();