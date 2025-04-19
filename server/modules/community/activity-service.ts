/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Service
 * 
 * This service handles the business logic for activity feeds,
 * including querying activities and emitting events for new activities.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-19
 * @framework Framework5.1
 */

import { db } from '../../db';
import { and, desc, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm';
import { 
  activityFeedEntries, 
  activityReadStatus, 
  activityFeedSettings,
  ActivityFeedItem
} from '@shared/schema/activity-feed';
import { communities, communityMembers, users } from '@shared/schema';
import { ServerEvents, eventEmitter } from '../../core/events/server-event-bus';

interface GetActivitiesOptions {
  limit?: number;
  offset?: number;
  communityId?: number;
}

/**
 * ActivityFeedService class
 * 
 * Manages all activity feed operations
 */
class ActivityFeedService {
  /**
   * Create a new activity in the feed
   */
  async createActivity(activityData: Omit<ActivityFeedItem, 'id' | 'timestamp'>): Promise<ActivityFeedItem> {
    try {
      const [activity] = await db
        .insert(activityFeedEntries)
        .values({
          ...activityData,
          timestamp: new Date()
        })
        .returning();
      
      // Emit WebSocket event for real-time updates
      eventEmitter.emit('activity:created', activity);
      
      // If the activity is associated with a specific community, emit community-specific event
      if (activity.communityId) {
        eventEmitter.emit(`community:${activity.communityId}:activity`, activity);
      }
      
      return activity;
    } catch (error) {
      console.error('[PKL-278651-COMM-0022-FEED] Error creating activity:', error);
      throw error;
    }
  }
  
  /**
   * Get activities for a specific user
   */
  async getActivitiesForUser(
    userId: number,
    options: GetActivitiesOptions = {}
  ): Promise<(ActivityFeedItem & { isRead: boolean })[]> {
    try {
      const { limit = 10, offset = 0, communityId } = options;
      
      // Get the user's community memberships
      const userCommunities = await db
        .select({ communityId: communityMembers.communityId })
        .from(communityMembers)
        .where(eq(communityMembers.userId, userId));
      
      const userCommunityIds = userCommunities.map(c => c.communityId);
      
      // Construct the base query for getting activities relevant to the user
      const baseQuery = db
        .select({
          a: activityFeedEntries,
          isRead: sql<boolean>`CASE WHEN ${activityReadStatus.userId} IS NOT NULL THEN true ELSE false END`
        })
        .from(activityFeedEntries)
        .leftJoin(
          activityReadStatus,
          and(
            eq(activityReadStatus.activityId, activityFeedEntries.id),
            eq(activityReadStatus.userId, userId)
          )
        )
        .where(
          or(
            // Public activities (no community ID)
            isNull(activityFeedEntries.communityId),
            
            // Activities from communities the user is a member of
            inArray(activityFeedEntries.communityId, userCommunityIds),
            
            // Activities about the user
            eq(activityFeedEntries.targetUserId, userId)
          )
        );
      
      // Apply community filter if specified
      const query = communityId
        ? baseQuery.where(eq(activityFeedEntries.communityId, communityId))
        : baseQuery;
      
      // Execute the query with limit, offset, and sorting
      const results = await query
        .orderBy(desc(activityFeedEntries.timestamp))
        .limit(limit)
        .offset(offset);
      
      // Transform the results
      return results.map(({ a, isRead }) => ({
        ...a,
        isRead: isRead ?? false
      }));
    } catch (error) {
      console.error('[PKL-278651-COMM-0022-FEED] Error getting activities for user:', error);
      throw error;
    }
  }
  
  /**
   * Get unread activities for a specific user
   */
  async getUnreadActivitiesForUser(
    userId: number,
    communityId?: number
  ): Promise<ActivityFeedItem[]> {
    try {
      // Get the user's community memberships
      const userCommunities = await db
        .select({ communityId: communityMembers.communityId })
        .from(communityMembers)
        .where(eq(communityMembers.userId, userId));
      
      const userCommunityIds = userCommunities.map(c => c.communityId);
      
      // Find all activities relevant to the user that are not marked as read
      const baseQuery = db
        .select({ activity: activityFeedEntries })
        .from(activityFeedEntries)
        .leftJoin(
          activityReadStatus,
          and(
            eq(activityReadStatus.activityId, activityFeedEntries.id),
            eq(activityReadStatus.userId, userId)
          )
        )
        .where(
          and(
            // Not yet marked as read
            isNull(activityReadStatus.id),
            // Activities relevant to the user
            or(
              // Public activities (no community ID)
              isNull(activityFeedEntries.communityId),
              // Activities from communities the user is a member of
              inArray(activityFeedEntries.communityId, userCommunityIds),
              // Activities about the user
              eq(activityFeedEntries.targetUserId, userId)
            )
          )
        );
      
      // Apply community filter if specified
      const query = communityId
        ? baseQuery.where(eq(activityFeedEntries.communityId, communityId))
        : baseQuery;
      
      // Execute query
      const results = await query.orderBy(desc(activityFeedEntries.timestamp));
      
      return results.map(r => r.activity);
    } catch (error) {
      console.error('[PKL-278651-COMM-0022-FEED] Error getting unread activities:', error);
      throw error;
    }
  }
  
  /**
   * Get the count of unread activities for a user
   */
  async getUnreadActivityCount(
    userId: number,
    communityId?: number
  ): Promise<number> {
    try {
      // Get unread activities
      const unreadActivities = await this.getUnreadActivitiesForUser(userId, communityId);
      
      // Return the count
      return unreadActivities.length;
    } catch (error) {
      console.error('[PKL-278651-COMM-0022-FEED] Error getting unread activity count:', error);
      throw error;
    }
  }
  
  /**
   * Update user's activity feed settings
   */
  async updateActivityFeedSettings(
    userId: number,
    settings: Partial<{
      emailNotifications: boolean;
      pushNotifications: boolean;
      showReadActivities: boolean;
    }>
  ): Promise<any> {
    try {
      // Check if user has settings
      const [existingSettings] = await db
        .select()
        .from(activityFeedSettings)
        .where(eq(activityFeedSettings.userId, userId));
      
      if (existingSettings) {
        // Update existing settings
        const [updated] = await db
          .update(activityFeedSettings)
          .set(settings)
          .where(eq(activityFeedSettings.userId, userId))
          .returning();
        
        return updated;
      } else {
        // Create new settings
        const [created] = await db
          .insert(activityFeedSettings)
          .values({
            userId,
            ...settings
          })
          .returning();
        
        return created;
      }
    } catch (error) {
      console.error('[PKL-278651-COMM-0022-FEED] Error updating activity feed settings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const activityFeedService = new ActivityFeedService();