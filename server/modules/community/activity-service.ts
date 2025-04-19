/**
 * PKL-278651-COMM-0022-FEED
 * Community Activity Service
 * 
 * This service handles community activity tracking and retrieval.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { db } from '../../db';
import { serverEventBus } from '../../core/events';
import { eq, desc, sql, and } from 'drizzle-orm';
import { users } from '../../../shared/schema';
import { communities } from '../../../shared/schema/community';
import { communityMembers } from '../../../shared/schema/community';
import { communityActivityFeed as communityActivities } from '../../../shared/schema/activity-feed';

interface CreateActivityParams {
  type: string;
  userId: number;
  content: string;
  communityId?: number;
  metadata?: Record<string, any>;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

/**
 * Creates a new activity record and emits an event for real-time updates
 */
export async function createActivity(params: CreateActivityParams) {
  try {
    // Insert into database
    const [activity] = await db.insert(communityActivities)
      .values({
        type: params.type,
        userId: params.userId,
        content: params.content,
        communityId: params.communityId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        relatedEntityId: params.relatedEntityId,
        relatedEntityType: params.relatedEntityType,
        timestamp: new Date()
      })
      .returning();
    
    if (!activity) {
      throw new Error('Failed to create activity record');
    }
    
    // Get user details to include in the event
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      avatar: users.avatar
    })
    .from(users)
    .where(eq(users.id, params.userId));
    
    // Get community details if applicable
    let communityName = undefined;
    if (params.communityId) {
      const [community] = await db.select({
        name: communities.name
      })
      .from(communities)
      .where(eq(communities.id, params.communityId));
      
      communityName = community?.name;
    }
    
    // Prepare activity event data
    const activityEvent = {
      ...activity,
      username: user?.username,
      displayName: user?.displayName,
      avatar: user?.avatar,
      communityName
    };
    
    // Publish event for WebSocket broadcast
    serverEventBus.publish('community:activity:created', activityEvent);
    
    // Return the created activity with additional user and community details
    return activityEvent;
  } catch (error) {
    console.error('[Activity Service] Error creating activity:', error);
    throw error;
  }
}

/**
 * Gets activities for all communities or a specific community
 */
export async function getActivities(options: { communityId?: number, limit?: number, userId?: number }) {
  try {
    const query = db.select({
      id: communityActivities.id,
      type: communityActivities.type,
      userId: communityActivities.userId,
      content: communityActivities.content,
      timestamp: communityActivities.timestamp,
      communityId: communityActivities.communityId,
      metadata: communityActivities.metadata,
      relatedEntityId: communityActivities.relatedEntityId,
      relatedEntityType: communityActivities.relatedEntityType,
      username: users.username,
      displayName: users.displayName,
      avatar: users.avatar,
      communityName: communities.name
    })
    .from(communityActivities)
    .leftJoin(users, eq(communityActivities.userId, users.id))
    .leftJoin(communities, eq(communityActivities.communityId, communities.id))
    .orderBy(desc(communityActivities.timestamp));
    
    // Filter by community if specified
    if (options.communityId) {
      query.where(eq(communityActivities.communityId, options.communityId));
    }
    
    // If user ID is provided, only show activities from communities they're a member of
    if (options.userId && !options.communityId) {
      // Get the communities the user is a member of
      const userCommunities = await db.select({ communityId: communityMembers.communityId })
        .from(communityMembers)
        .where(eq(communityMembers.userId, options.userId));
      
      const communityIds = userCommunities.map(c => c.communityId);
      
      // Include activities from the user's communities or public activities
      if (communityIds.length > 0) {
        query.where(
          sql`${communityActivities.communityId} IS NULL OR ${communityActivities.communityId} IN (${communityIds.join(',')})`
        );
      } else {
        // If not in any community, only show public activities
        query.where(sql`${communityActivities.communityId} IS NULL`);
      }
    }
    
    // Apply limit if specified
    if (options.limit && options.limit > 0) {
      query.limit(options.limit);
    }
    
    const activities = await query;
    
    // Transform metadata from string to object
    return activities.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata as string) : undefined
    }));
  } catch (error) {
    console.error('[Activity Service] Error fetching activities:', error);
    throw error;
  }
}

/**
 * Gets activities created by a specific user
 */
export async function getUserActivities(userId: number, limit?: number) {
  try {
    const query = db.select({
      id: communityActivities.id,
      type: communityActivities.type,
      content: communityActivities.content,
      timestamp: communityActivities.timestamp,
      communityId: communityActivities.communityId,
      metadata: communityActivities.metadata,
      relatedEntityId: communityActivities.relatedEntityId,
      relatedEntityType: communityActivities.relatedEntityType,
      communityName: communities.name
    })
    .from(communityActivities)
    .leftJoin(communities, eq(communityActivities.communityId, communities.id))
    .where(eq(communityActivities.userId, userId))
    .orderBy(desc(communityActivities.timestamp));
    
    // Apply limit if specified
    if (limit && limit > 0) {
      query.limit(limit);
    }
    
    const activities = await query;
    
    // Transform metadata from string to object
    return activities.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata as string) : undefined
    }));
  } catch (error) {
    console.error('[Activity Service] Error fetching user activities:', error);
    throw error;
  }
}