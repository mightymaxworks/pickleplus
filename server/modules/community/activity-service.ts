/**
 * PKL-278651-COMM-0022-FEED
 * Activity Service
 * 
 * This service handles business logic for community activities, including
 * retrieving, creating, and managing community activities.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { db } from '../../db';
import { users } from '@shared/schema';
import * as schema from '@shared/schema/activity-feed';
import { communities, communityMembers } from '@shared/schema/community';
import { 
  eq, 
  desc, 
  and, 
  or, 
  inArray, 
  sql 
} from 'drizzle-orm';
import { ServerEvents } from '../../core/events/server-event-bus';

interface GetActivitiesOptions {
  communityId?: number;
  userId?: number;
  limit?: number;
  offset?: number;
  types?: string[];
}

export interface CreateActivityParams {
  type: string;
  userId: number;
  content: string;
  communityId?: number;
  metadata?: Record<string, any>;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

/**
 * Emit an event to all clients
 */
function emitEvent(topic: string, data: any) {
  // Using ServerEvents enum if it matches
  const eventName = Object.values(ServerEvents).find(event => event === topic);
  
  // If topic is a known ServerEvent, emit it that way, otherwise emit as custom topic
  if (eventName) {
    ServerEventBus.emit(eventName as ServerEvents, data);
  } else {
    // For custom topics that don't match ServerEvents
    // This would typically be implemented with a custom event emitter
    console.log(`[ActivityService] Emitting custom event: ${topic}`, data);
    // Custom implementation would go here
  }
}

/**
 * Get activities for a specific community or all visible communities
 */
export async function getActivities(options: GetActivitiesOptions = {}) {
  try {
    const { 
      communityId, 
      userId, 
      limit = 10, 
      offset = 0,
      types
    } = options;
    
    // Build the query
    let query = db
      .select({
        id: schema.activityFeedEntries.id,
        type: schema.activityFeedEntries.type,
        userId: schema.activityFeedEntries.userId,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatarUrl,
        content: schema.activityFeedEntries.content,
        timestamp: schema.activityFeedEntries.createdAt,
        communityId: schema.activityFeedEntries.communityId,
        communityName: communities.name,
        metadata: schema.activityFeedEntries.metadata,
        relatedEntityId: schema.activityFeedEntries.relatedEntityId,
        relatedEntityType: schema.activityFeedEntries.relatedEntityType,
        isRead: schema.activityFeedEntries.isRead
      })
      .from(schema.activityFeedEntries)
      .leftJoin(users, eq(schema.activityFeedEntries.userId, users.id))
      .leftJoin(communities, eq(schema.activityFeedEntries.communityId, communities.id))
      .orderBy(desc(schema.activityFeedEntries.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Apply filters
    const conditions = [];
    
    // Filter by community if provided
    if (communityId) {
      conditions.push(eq(schema.activityFeedEntries.communityId, communityId));
    } else if (userId) {
      // If no specific community but there is a user, get activities from communities the user belongs to
      // This requires joining with communityMembers to check membership
      query = query.leftJoin(
        communityMembers,
        and(
          eq(schema.activityFeedEntries.communityId, communityMembers.communityId),
          eq(communityMembers.userId, userId)
        )
      );
      
      conditions.push(
        or(
          // Activities without a community (global)
          sql`${schema.activityFeedEntries.communityId} IS NULL`,
          // Activities in public communities
          sql`${communities.isPublic} = true`,
          // Activities in communities the user is a member of
          and(
            sql`${communityMembers.userId} = ${userId}`,
            sql`${communityMembers.status} = 'active'`
          )
        )
      );
    } else {
      // If no community or user, only get activities from public communities or with no community
      conditions.push(
        or(
          sql`${schema.activityFeedEntries.communityId} IS NULL`,
          sql`${communities.isPublic} = true`
        )
      );
    }
    
    // Filter by activity types if provided
    if (types && types.length > 0) {
      conditions.push(inArray(schema.activityFeedEntries.type, types));
    }
    
    // Apply all conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Execute query
    const results = await query;
    
    return results;
  } catch (error) {
    console.error('[ActivityService] Error getting activities:', error);
    throw error;
  }
}

/**
 * Get activities for a specific user
 */
export async function getUserActivities(userId: number, limit: number = 10) {
  try {
    const results = await db
      .select({
        id: schema.activityFeedEntries.id,
        type: schema.activityFeedEntries.type,
        userId: schema.activityFeedEntries.userId,
        username: users.username,
        displayName: users.displayName,
        avatar: users.avatarUrl,
        content: schema.activityFeedEntries.content,
        timestamp: schema.activityFeedEntries.createdAt,
        communityId: schema.activityFeedEntries.communityId,
        communityName: communities.name,
        metadata: schema.activityFeedEntries.metadata,
        relatedEntityId: schema.activityFeedEntries.relatedEntityId,
        relatedEntityType: schema.activityFeedEntries.relatedEntityType,
        isRead: schema.activityFeedEntries.isRead
      })
      .from(schema.activityFeedEntries)
      .leftJoin(users, eq(schema.activityFeedEntries.userId, users.id))
      .leftJoin(communities, eq(schema.activityFeedEntries.communityId, communities.id))
      .where(eq(schema.activityFeedEntries.userId, userId))
      .orderBy(desc(schema.activityFeedEntries.createdAt))
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error('[ActivityService] Error getting user activities:', error);
    throw error;
  }
}

/**
 * Create a new activity
 */
export async function createActivity(params: CreateActivityParams) {
  try {
    const {
      type,
      userId,
      content,
      communityId,
      metadata,
      relatedEntityId,
      relatedEntityType
    } = params;
    
    // Insert the activity
    const [activity] = await db
      .insert(schema.activityFeedEntries)
      .values({
        type,
        userId,
        content,
        communityId,
        metadata,
        relatedEntityId,
        relatedEntityType,
        isRead: false
      })
      .returning();
    
    if (!activity) {
      throw new Error('Failed to create activity');
    }
    
    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    // Get community details if applicable
    let communityName;
    if (communityId) {
      const [community] = await db
        .select({
          name: communities.name
        })
        .from(communities)
        .where(eq(communities.id, communityId));
      
      communityName = community?.name;
    }
    
    // Create enriched activity response
    const enrichedActivity = {
      id: activity.id,
      type: activity.type,
      userId: activity.userId,
      username: user?.username,
      displayName: user?.displayName,
      avatar: user?.avatarUrl,
      content: activity.content,
      timestamp: activity.createdAt?.toISOString() || new Date().toISOString(),
      communityId: activity.communityId,
      communityName,
      metadata: activity.metadata,
      relatedEntityId: activity.relatedEntityId,
      relatedEntityType: activity.relatedEntityType,
      isRead: activity.isRead
    };
    
    // Emit the activity via the event bus for WebSocket broadcasting
    if (communityId) {
      // Community-specific activity
      emitEvent(ServerEvents.COMMUNITY_ACTIVITY_CREATED, {
        ...enrichedActivity,
        communityId
      });
      
      // Also emit to specific community channel for WebSocket
      emitEvent(`community:${communityId}:activities`, enrichedActivity);
    }
    
    // Also emit to global feed
    emitEvent('community:activities', enrichedActivity);
    
    return enrichedActivity;
  } catch (error) {
    console.error('[ActivityService] Error creating activity:', error);
    throw error;
  }
}

/**
 * Mark an activity as read for a specific user
 */
export async function markActivityAsRead(activityId: number, userId: number) {
  try {
    // Check if read status already exists
    const existingStatus = await db
      .select()
      .from(schema.activityReadStatus)
      .where(
        and(
          eq(schema.activityReadStatus.activityId, activityId),
          eq(schema.activityReadStatus.userId, userId)
        )
      )
      .limit(1);
    
    // If not already marked as read, create read status
    if (existingStatus.length === 0) {
      await db
        .insert(schema.activityReadStatus)
        .values({
          activityId,
          userId,
          readAt: new Date()
        });
    }
    
    return { success: true, activityId, userId };
  } catch (error) {
    console.error('[ActivityService] Error marking activity as read:', error);
    throw error;
  }
}