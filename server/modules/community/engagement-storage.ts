/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Engagement Storage Module
 * 
 * This module provides storage methods for tracking and retrieving
 * community engagement metrics.
 * 
 * @version 1.1.0
 * @lastModified 2025-04-19
 * @framework Framework5.1
 */

import { db } from "../../db";
import { eq, and, desc, sql, gte, lte, isNull, count, max, sum, SQL } from "drizzle-orm";
import { 
  communityActivities, 
  communityEngagementMetrics, 
  communityEngagementLevels,
  communityLeaderboards,
  CommunityActivityType,
  InsertCommunityActivity,
  CommunityActivity,
  CommunityEngagementMetrics,
  CommunityEngagementLevel
} from "@shared/schema/community-engagement";
import { ServerEventBus, ServerEvents } from "../../core/events/server-event-bus";

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
}

// Export singleton instance
export const communityEngagementStorage = new CommunityEngagementStorage();