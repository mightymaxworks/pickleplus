/**
 * PKL-278651-COMM-0006-HUB-STORE
 * Community Module Storage Implementation
 * 
 * This file implements the database operations for community features.
 */
import { desc, eq, and, or, like, sql, ilike, inArray } from 'drizzle-orm';
import type { DatabaseStorage } from '../storage';
import {
  communities,
  communityMembers,
  communityPosts,
  communityEvents,
  communityEventAttendees,
  communityPostComments,
  communityPostLikes,
  communityCommentLikes,
  communityInvitations,
  communityJoinRequests,
  type Community,
  type InsertCommunity,
  type CommunityMember,
  type InsertCommunityMember,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityEvent,
  type InsertCommunityEvent,
  type CommunityEventAttendee,
  type InsertCommunityEventAttendee,
  type CommunityPostComment,
  type InsertCommunityPostComment,
  type CommunityPostLike,
  type CommunityCommentLike,
  type CommunityInvitation,
  type CommunityJoinRequest
} from '../../shared/schema/community';
import { users } from '../../shared/schema';

/**
 * Community Storage Interface
 */
export interface CommunityStorage {
  // Helper function to get the database instance
  getDb(): any;
  // Community operations
  getCommunities(filters?: {
    location?: string;
    skillLevel?: string;
    minSkillLevel?: string;
    maxSkillLevel?: string;
    tags?: string[];
    search?: string;
    isPrivate?: boolean;
    hasEvents?: boolean;
    eventType?: string;
    minMemberCount?: number;
    maxMemberCount?: number;
    createdAfter?: Date;
    createdBefore?: Date;
    excludeIds?: number[];
    includeIds?: number[];
    recommendForUser?: number;
    popular?: boolean;
    featured?: boolean;
    excludeMemberOf?: number | null;
    sort?: string;
    
    limit?: number;
    offset?: number;
  }): Promise<Community[]>;
  
  /**
   * Get recommended communities for a specific user based on their interests and connections
   * @param userId - The user ID to get recommendations for
   * @param limit - Maximum number of recommendations to return
   * @returns Promise<Community[]> - A list of recommended communities
   */
  getRecommendedCommunities(userId: number, limit?: number): Promise<Community[]>;
  
  getCommunityById(id: number): Promise<Community | undefined>;
  
  getCommunitiesByCreator(userId: number): Promise<Community[]>;
  
  createCommunity(communityData: InsertCommunity): Promise<Community>;
  
  updateCommunity(id: number, updates: Partial<InsertCommunity>): Promise<Community | undefined>;
  
  incrementCommunityMemberCount(communityId: number): Promise<void>;
  
  decrementCommunityMemberCount(communityId: number): Promise<void>;
  
  incrementCommunityEventCount(communityId: number): Promise<void>;
  
  decrementCommunityEventCount(communityId: number): Promise<void>;
  
  incrementCommunityPostCount(communityId: number): Promise<void>;
  
  decrementCommunityPostCount(communityId: number): Promise<void>;
  
  // Community members operations
  getCommunityMembers(communityId: number): Promise<(CommunityMember & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]>;
  
  getCommunityMembership(communityId: number, userId: number): Promise<CommunityMember | undefined>;
  
  getCommunityMembershipsByUserId(userId: number): Promise<CommunityMember[]>;
  
  createCommunityMember(memberData: InsertCommunityMember): Promise<CommunityMember>;
  
  updateCommunityMembership(communityId: number, userId: number, updates: Partial<InsertCommunityMember>): Promise<CommunityMember | undefined>;
  
  deleteCommunityMembership(communityId: number, userId: number): Promise<boolean>;
  
  getCommunityAdminCount(communityId: number): Promise<number>;
  
  // Community posts operations
  getCommunityPosts(communityId: number, options?: { limit?: number, offset?: number }): Promise<(CommunityPost & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]>;
  
  getCommunityPostById(postId: number): Promise<CommunityPost | undefined>;
  
  createCommunityPost(postData: InsertCommunityPost): Promise<CommunityPost>;
  
  updateCommunityPost(postId: number, updates: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;
  
  deleteCommunityPost(postId: number): Promise<boolean>;
  
  incrementPostCommentCount(postId: number): Promise<void>;
  
  decrementPostCommentCount(postId: number): Promise<void>;
  
  incrementPostLikeCount(postId: number): Promise<void>;
  
  decrementPostLikeCount(postId: number): Promise<void>;
  
  // Community events operations
  getCommunityEvents(communityId: number, options?: { limit?: number, offset?: number }): Promise<CommunityEvent[]>;
  
  getCommunityEventById(eventId: number): Promise<CommunityEvent | undefined>;
  
  createCommunityEvent(eventData: InsertCommunityEvent): Promise<CommunityEvent>;
  
  updateCommunityEvent(eventId: number, updates: Partial<InsertCommunityEvent>): Promise<CommunityEvent | undefined>;
  
  deleteCommunityEvent(eventId: number): Promise<boolean>;
  
  incrementEventAttendeeCount(eventId: number): Promise<void>;
  
  decrementEventAttendeeCount(eventId: number): Promise<void>;
  
  // Event attendance operations
  getEventAttendees(eventId: number): Promise<(CommunityEventAttendee & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]>;
  
  getEventAttendance(eventId: number, userId: number): Promise<CommunityEventAttendee | undefined>;
  
  createEventAttendance(attendanceData: InsertCommunityEventAttendee): Promise<CommunityEventAttendee>;
  
  updateEventAttendance(eventId: number, userId: number, updates: Partial<InsertCommunityEventAttendee>): Promise<CommunityEventAttendee | undefined>;
  
  cancelEventAttendance(eventId: number, userId: number): Promise<boolean>;
  
  // Post comments operations
  getPostComments(postId: number): Promise<(CommunityPostComment & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]>;
  
  createCommunityPostComment(commentData: InsertCommunityPostComment): Promise<CommunityPostComment>;
  
  deleteComment(commentId: number): Promise<boolean>;
  
  // Post likes operations
  getPostLike(postId: number, userId: number): Promise<{ id: number } | undefined>;
  
  createPostLike(likeData: { postId: number, userId: number }): Promise<{ id: number }>;
  
  deletePostLike(postId: number, userId: number): Promise<boolean>;
  
  // Join requests operations
  createCommunityJoinRequest(requestData: { communityId: number, userId: number, message?: string }): Promise<{ id: number, status: string }>;
  
  getCommunityJoinRequests(communityId: number): Promise<any[]>;
  
  updateJoinRequestStatus(requestId: number, status: string, reviewedByUserId: number): Promise<any>;
}

/**
 * Community storage implementation for DatabaseStorage
 */
export const communityStorageImplementation: CommunityStorage = {
  // Database access method, will be overridden in DatabaseStorage constructor
  getDb: () => { throw new Error('getDb must be bound to a DatabaseStorage instance'); },
  // Community operations
  async getCommunities(filters = {}): Promise<Community[]> {
    const db = this.getDb();
    const { location, skillLevel, tags, search, limit = 20, offset = 0 } = filters;
    
    let query = db.select().from(communities);
    
    // Always include default communities in the results (isDefault=true)
    // Create a condition to either match filters OR be a default community
    let hasConditions = false;
    
    if (location) {
      query = query.where(
        or(
          ilike(communities.location, `%${location}%`),
          eq(communities.isDefault, true)
        )
      );
      hasConditions = true;
    }
    
    if (skillLevel) {
      if (hasConditions) {
        query = query.where(
          or(
            eq(communities.skillLevel, skillLevel),
            eq(communities.isDefault, true)
          )
        );
      } else {
        query = query.where(
          or(
            eq(communities.skillLevel, skillLevel),
            eq(communities.isDefault, true)
          )
        );
        hasConditions = true;
      }
    }
    
    if (tags && tags.length > 0) {
      // For simplicity, we'll search for any of the tags in the comma-separated list
      const tagConditions = tags.map(tag => ilike(communities.tags, `%${tag}%`));
      if (hasConditions) {
        query = query.where(
          or(
            or(...tagConditions),
            eq(communities.isDefault, true)
          )
        );
      } else {
        query = query.where(
          or(
            or(...tagConditions),
            eq(communities.isDefault, true)
          )
        );
        hasConditions = true;
      }
    }
    
    if (search) {
      if (hasConditions) {
        query = query.where(
          or(
            or(
              ilike(communities.name, `%${search}%`),
              ilike(communities.description, `%${search}%`)
            ),
            eq(communities.isDefault, true)
          )
        );
      } else {
        query = query.where(
          or(
            or(
              ilike(communities.name, `%${search}%`),
              ilike(communities.description, `%${search}%`)
            ),
            eq(communities.isDefault, true)
          )
        );
        hasConditions = true;
      }
    }
    
    // If no conditions were added yet, add a simple condition to include defaults
    if (!hasConditions) {
      console.log('[PKL-278651-COMM-0020-DEFGRP] No filter conditions, including default communities');
    }
    
    return await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(communities.createdAt));
  },
  
  async getCommunityById(id: number): Promise<Community | undefined> {
    const db = this.getDb();
    const result = await db
      .select()
      .from(communities)
      .where(eq(communities.id, id))
      .limit(1);
    
    return result[0];
  },
  
  async getCommunitiesByCreator(userId: number): Promise<Community[]> {
    try {
      // Convert userId to a proper number and validate it
      const userIdNum = Number(userId);
      if (isNaN(userIdNum) || userIdNum <= 0) {
        console.error(`[Storage] getCommunitiesByCreator called with invalid userId: ${userId} (converted to ${userIdNum})`);
        return [];
      }
      
      console.log(`[Storage] Fetching communities created by user ${userIdNum}`);
      
      const db = this.getDb();
      const result = await db
        .select()
        .from(communities)
        .where(eq(communities.createdByUserId, userIdNum));
      
      console.log(`[Storage] Found ${result?.length || 0} communities created by user ${userIdNum}`);
      return result || [];
    } catch (error) {
      console.error('[Storage] Error in getCommunitiesByCreator:', error);
      return [];
    }
  },
  
  async createCommunity(communityData: InsertCommunity): Promise<Community> {
    const db = this.getDb();
    const result = await db
      .insert(communities)
      .values(communityData)
      .returning();
    
    return result[0];
  },
  
  async updateCommunity(id: number, updates: Partial<InsertCommunity>): Promise<Community | undefined> {
    const db = this.getDb();
    
    // Add updated timestamp
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date()
    };
    
    const result = await db
      .update(communities)
      .set(updatesWithTimestamp)
      .where(eq(communities.id, id))
      .returning();
    
    return result[0];
  },
  
  async incrementCommunityMemberCount(communityId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communities)
      .set({
        memberCount: sql`${communities.memberCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));
  },
  
  async decrementCommunityMemberCount(communityId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communities)
      .set({
        memberCount: sql`GREATEST(${communities.memberCount} - 1, 0)`,
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));
  },
  
  async incrementCommunityEventCount(communityId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communities)
      .set({
        eventCount: sql`${communities.eventCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));
  },
  
  async decrementCommunityEventCount(communityId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communities)
      .set({
        eventCount: sql`GREATEST(${communities.eventCount} - 1, 0)`,
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));
  },
  
  async incrementCommunityPostCount(communityId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communities)
      .set({
        postCount: sql`${communities.postCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));
  },
  
  async decrementCommunityPostCount(communityId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communities)
      .set({
        postCount: sql`GREATEST(${communities.postCount} - 1, 0)`,
        updatedAt: new Date()
      })
      .where(eq(communities.id, communityId));
  },
  
  // Community members operations
  async getCommunityMembers(communityId: number): Promise<(CommunityMember & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    const db = this.getDb();
    return await db
      .select({
        id: communityMembers.id,
        userId: communityMembers.userId,
        communityId: communityMembers.communityId,
        role: communityMembers.role,
        joinedAt: communityMembers.joinedAt,
        isActive: communityMembers.isActive,
        lastActive: communityMembers.lastActive,
        createdAt: communityMembers.createdAt,
        updatedAt: communityMembers.updatedAt,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(communityMembers)
      .innerJoin(users, eq(communityMembers.userId, users.id))
      .where(eq(communityMembers.communityId, communityId))
      .orderBy(desc(communityMembers.joinedAt));
  },
  
  async getCommunityMembership(communityId: number, userId: number): Promise<CommunityMember | undefined> {
    const db = this.getDb();
    const result = await db
      .select()
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId)
        )
      )
      .limit(1);
    
    return result[0];
  },
  
  async getCommunityMembershipsByUserId(userId: number): Promise<CommunityMember[]> {
    try {
      // Convert userId to a proper number and validate it
      const userIdNum = Number(userId);
      if (isNaN(userIdNum) || userIdNum <= 0) {
        console.error(`[Storage] getCommunityMembershipsByUserId called with invalid userId: ${userId} (converted to ${userIdNum})`);
        return [];
      }
      
      console.log(`[Storage] Fetching community memberships for user ${userIdNum}`);
      
      const db = this.getDb();
      const result = await db
        .select()
        .from(communityMembers)
        .where(eq(communityMembers.userId, userIdNum));
      
      console.log(`[Storage] Found ${result?.length || 0} memberships for user ${userIdNum}`);
      return result || [];
    } catch (error) {
      console.error('[Storage] Error in getCommunityMembershipsByUserId:', error);
      return [];
    }
  },
  
  async createCommunityMember(memberData: InsertCommunityMember): Promise<CommunityMember> {
    const db = this.getDb();
    const result = await db
      .insert(communityMembers)
      .values(memberData)
      .returning();
    
    // Update member count
    await this.incrementCommunityMemberCount(memberData.communityId);
    
    return result[0];
  },
  
  async updateCommunityMembership(communityId: number, userId: number, updates: Partial<InsertCommunityMember>): Promise<CommunityMember | undefined> {
    const db = this.getDb();
    
    // Add updated timestamp
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date()
    };
    
    const result = await db
      .update(communityMembers)
      .set(updatesWithTimestamp)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId)
        )
      )
      .returning();
    
    return result[0];
  },
  
  async deleteCommunityMembership(communityId: number, userId: number): Promise<boolean> {
    const db = this.getDb();
    const result = await db
      .delete(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId)
        )
      )
      .returning({ deletedId: communityMembers.id });
    
    if (result.length > 0) {
      // Update member count
      await this.decrementCommunityMemberCount(communityId);
      return true;
    }
    
    return false;
  },
  
  async getCommunityAdminCount(communityId: number): Promise<number> {
    const db = this.getDb();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.role, 'admin')
        )
      );
    
    return result[0]?.count || 0;
  },
  
  // Community posts operations
  async getCommunityPosts(communityId: number, options = {}): Promise<(CommunityPost & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    const db = this.getDb();
    const { limit = 20, offset = 0 } = options;
    
    return await db
      .select({
        id: communityPosts.id,
        userId: communityPosts.userId,
        communityId: communityPosts.communityId,
        content: communityPosts.content,
        mediaUrls: communityPosts.mediaUrls,
        likes: communityPosts.likes,
        comments: communityPosts.comments,
        isPinned: communityPosts.isPinned,
        isAnnouncement: communityPosts.isAnnouncement,
        createdAt: communityPosts.createdAt,
        updatedAt: communityPosts.updatedAt,
        author: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .where(eq(communityPosts.communityId, communityId))
      .orderBy(
        desc(communityPosts.isPinned), 
        desc(communityPosts.isAnnouncement), 
        desc(communityPosts.createdAt)
      )
      .limit(limit)
      .offset(offset);
  },
  
  async getCommunityPostById(postId: number): Promise<CommunityPost | undefined> {
    const db = this.getDb();
    const result = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, postId))
      .limit(1);
    
    return result[0];
  },
  
  async createCommunityPost(postData: InsertCommunityPost): Promise<CommunityPost> {
    const db = this.getDb();
    const result = await db
      .insert(communityPosts)
      .values(postData)
      .returning();
    
    // Update post count
    await this.incrementCommunityPostCount(postData.communityId);
    
    return result[0];
  },
  
  async updateCommunityPost(postId: number, updates: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    const db = this.getDb();
    
    // Add updated timestamp
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date()
    };
    
    const result = await db
      .update(communityPosts)
      .set(updatesWithTimestamp)
      .where(eq(communityPosts.id, postId))
      .returning();
    
    return result[0];
  },
  
  async deleteCommunityPost(postId: number): Promise<boolean> {
    const db = this.getDb();
    
    // First get the post to know its community ID
    const post = await this.getCommunityPostById(postId);
    if (!post) return false;
    
    const result = await db
      .delete(communityPosts)
      .where(eq(communityPosts.id, postId))
      .returning({ deletedId: communityPosts.id });
    
    if (result.length > 0) {
      // Update post count
      await this.decrementCommunityPostCount(post.communityId);
      return true;
    }
    
    return false;
  },
  
  async incrementPostCommentCount(postId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communityPosts)
      .set({
        comments: sql`${communityPosts.comments} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communityPosts.id, postId));
  },
  
  async decrementPostCommentCount(postId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communityPosts)
      .set({
        comments: sql`GREATEST(${communityPosts.comments} - 1, 0)`,
        updatedAt: new Date()
      })
      .where(eq(communityPosts.id, postId));
  },
  
  async incrementPostLikeCount(postId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communityPosts)
      .set({
        likes: sql`${communityPosts.likes} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communityPosts.id, postId));
  },
  
  async decrementPostLikeCount(postId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communityPosts)
      .set({
        likes: sql`GREATEST(${communityPosts.likes} - 1, 0)`,
        updatedAt: new Date()
      })
      .where(eq(communityPosts.id, postId));
  },
  
  // Community events operations
  async getCommunityEvents(communityId: number, options = {}): Promise<CommunityEvent[]> {
    const db = this.getDb();
    const { limit = 20, offset = 0 } = options;
    
    return await db
      .select()
      .from(communityEvents)
      .where(eq(communityEvents.communityId, communityId))
      .orderBy(desc(communityEvents.eventDate))
      .limit(limit)
      .offset(offset);
  },
  
  async getCommunityEventById(eventId: number): Promise<CommunityEvent | undefined> {
    const db = this.getDb();
    const result = await db
      .select()
      .from(communityEvents)
      .where(eq(communityEvents.id, eventId))
      .limit(1);
    
    return result[0];
  },
  
  async createCommunityEvent(eventData: InsertCommunityEvent): Promise<CommunityEvent> {
    const db = this.getDb();
    const result = await db
      .insert(communityEvents)
      .values(eventData)
      .returning();
    
    // Update event count
    await this.incrementCommunityEventCount(eventData.communityId);
    
    return result[0];
  },
  
  async updateCommunityEvent(eventId: number, updates: Partial<InsertCommunityEvent>): Promise<CommunityEvent | undefined> {
    const db = this.getDb();
    
    // Add updated timestamp
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date()
    };
    
    const result = await db
      .update(communityEvents)
      .set(updatesWithTimestamp)
      .where(eq(communityEvents.id, eventId))
      .returning();
    
    return result[0];
  },
  
  async deleteCommunityEvent(eventId: number): Promise<boolean> {
    const db = this.getDb();
    
    // First get the event to know its community ID
    const event = await this.getCommunityEventById(eventId);
    if (!event) return false;
    
    const result = await db
      .delete(communityEvents)
      .where(eq(communityEvents.id, eventId))
      .returning({ deletedId: communityEvents.id });
    
    if (result.length > 0) {
      // Update event count
      await this.decrementCommunityEventCount(event.communityId);
      return true;
    }
    
    return false;
  },
  
  async incrementEventAttendeeCount(eventId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communityEvents)
      .set({
        currentAttendees: sql`${communityEvents.currentAttendees} + 1`,
        updatedAt: new Date()
      })
      .where(eq(communityEvents.id, eventId));
  },
  
  async decrementEventAttendeeCount(eventId: number): Promise<void> {
    const db = this.getDb();
    await db
      .update(communityEvents)
      .set({
        currentAttendees: sql`GREATEST(${communityEvents.currentAttendees} - 1, 0)`,
        updatedAt: new Date()
      })
      .where(eq(communityEvents.id, eventId));
  },
  
  // Event attendance operations
  async getEventAttendees(eventId: number): Promise<(CommunityEventAttendee & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    const db = this.getDb();
    return await db
      .select({
        id: communityEventAttendees.id,
        eventId: communityEventAttendees.eventId,
        userId: communityEventAttendees.userId,
        status: communityEventAttendees.status,
        registeredAt: communityEventAttendees.registeredAt,
        checkedInAt: communityEventAttendees.checkedInAt,
        notes: communityEventAttendees.notes,
        createdAt: communityEventAttendees.createdAt,
        updatedAt: communityEventAttendees.updatedAt,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(communityEventAttendees)
      .innerJoin(users, eq(communityEventAttendees.userId, users.id))
      .where(eq(communityEventAttendees.eventId, eventId))
      .orderBy(desc(communityEventAttendees.registeredAt));
  },
  
  async getEventAttendance(eventId: number, userId: number): Promise<CommunityEventAttendee | undefined> {
    const db = this.getDb();
    const result = await db
      .select()
      .from(communityEventAttendees)
      .where(
        and(
          eq(communityEventAttendees.eventId, eventId),
          eq(communityEventAttendees.userId, userId)
        )
      )
      .limit(1);
    
    return result[0];
  },
  
  async createEventAttendance(attendanceData: InsertCommunityEventAttendee): Promise<CommunityEventAttendee> {
    const db = this.getDb();
    const result = await db
      .insert(communityEventAttendees)
      .values(attendanceData)
      .returning();
    
    // Update attendee count
    await this.incrementEventAttendeeCount(attendanceData.eventId);
    
    return result[0];
  },
  
  async updateEventAttendance(eventId: number, userId: number, updates: Partial<InsertCommunityEventAttendee>): Promise<CommunityEventAttendee | undefined> {
    const db = this.getDb();
    
    // Add updated timestamp
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date()
    };
    
    const result = await db
      .update(communityEventAttendees)
      .set(updatesWithTimestamp)
      .where(
        and(
          eq(communityEventAttendees.eventId, eventId),
          eq(communityEventAttendees.userId, userId)
        )
      )
      .returning();
    
    return result[0];
  },
  
  async cancelEventAttendance(eventId: number, userId: number): Promise<boolean> {
    const db = this.getDb();
    const result = await db
      .delete(communityEventAttendees)
      .where(
        and(
          eq(communityEventAttendees.eventId, eventId),
          eq(communityEventAttendees.userId, userId)
        )
      )
      .returning({ deletedId: communityEventAttendees.id });
    
    if (result.length > 0) {
      // Update attendee count
      await this.decrementEventAttendeeCount(eventId);
      return true;
    }
    
    return false;
  },
  
  // Post comments operations
  async getPostComments(postId: number): Promise<(CommunityPostComment & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    const db = this.getDb();
    return await db
      .select({
        id: communityPostComments.id,
        postId: communityPostComments.postId,
        userId: communityPostComments.userId,
        content: communityPostComments.content,
        likes: communityPostComments.likes,
        parentCommentId: communityPostComments.parentCommentId,
        createdAt: communityPostComments.createdAt,
        updatedAt: communityPostComments.updatedAt,
        author: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(communityPostComments)
      .innerJoin(users, eq(communityPostComments.userId, users.id))
      .where(eq(communityPostComments.postId, postId))
      .orderBy(desc(communityPostComments.createdAt));
  },
  
  async createCommunityPostComment(commentData: InsertCommunityPostComment): Promise<CommunityPostComment> {
    const db = this.getDb();
    const result = await db
      .insert(communityPostComments)
      .values(commentData)
      .returning();
    
    // Update comment count on the post
    await this.incrementPostCommentCount(commentData.postId);
    
    return result[0];
  },
  
  async deleteComment(commentId: number): Promise<boolean> {
    const db = this.getDb();
    
    // First, get the comment to know its post ID
    const comment = await db
      .select()
      .from(communityPostComments)
      .where(eq(communityPostComments.id, commentId))
      .limit(1);
    
    if (!comment.length) return false;
    
    const result = await db
      .delete(communityPostComments)
      .where(eq(communityPostComments.id, commentId))
      .returning({ deletedId: communityPostComments.id });
    
    if (result.length > 0) {
      // Update comment count on the post
      await this.decrementPostCommentCount(comment[0].postId);
      return true;
    }
    
    return false;
  },
  
  // Post likes operations
  async getPostLike(postId: number, userId: number): Promise<{ id: number } | undefined> {
    const db = this.getDb();
    const result = await db
      .select({ id: communityPostLikes.id })
      .from(communityPostLikes)
      .where(
        and(
          eq(communityPostLikes.postId, postId),
          eq(communityPostLikes.userId, userId)
        )
      )
      .limit(1);
    
    return result[0];
  },
  
  async createPostLike(likeData: { postId: number, userId: number }): Promise<{ id: number }> {
    const db = this.getDb();
    const result = await db
      .insert(communityPostLikes)
      .values(likeData)
      .returning({ id: communityPostLikes.id });
    
    // Update like count on the post
    await this.incrementPostLikeCount(likeData.postId);
    
    return result[0];
  },
  
  async deletePostLike(postId: number, userId: number): Promise<boolean> {
    const db = this.getDb();
    const result = await db
      .delete(communityPostLikes)
      .where(
        and(
          eq(communityPostLikes.postId, postId),
          eq(communityPostLikes.userId, userId)
        )
      )
      .returning({ deletedId: communityPostLikes.id });
    
    if (result.length > 0) {
      // Update like count on the post
      await this.decrementPostLikeCount(postId);
      return true;
    }
    
    return false;
  },
  
  // Join requests operations
  async createCommunityJoinRequest(requestData: { communityId: number, userId: number, message?: string }): Promise<{ id: number, status: string }> {
    const db = this.getDb();
    const result = await db
      .insert(communityJoinRequests)
      .values({
        communityId: requestData.communityId,
        userId: requestData.userId,
        message: requestData.message,
        status: 'pending'
      })
      .returning({
        id: communityJoinRequests.id,
        status: communityJoinRequests.status
      });
    
    return result[0];
  },
  
  async getCommunityJoinRequests(communityId: number): Promise<any[]> {
    const db = this.getDb();
    return await db
      .select({
        id: communityJoinRequests.id,
        communityId: communityJoinRequests.communityId,
        userId: communityJoinRequests.userId,
        message: communityJoinRequests.message,
        status: communityJoinRequests.status,
        reviewedByUserId: communityJoinRequests.reviewedByUserId,
        reviewedAt: communityJoinRequests.reviewedAt,
        createdAt: communityJoinRequests.createdAt,
        user: {
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(communityJoinRequests)
      .innerJoin(users, eq(communityJoinRequests.userId, users.id))
      .where(eq(communityJoinRequests.communityId, communityId))
      .orderBy(desc(communityJoinRequests.createdAt));
  },
  
  async updateJoinRequestStatus(requestId: number, status: string, reviewedByUserId: number): Promise<any> {
    const db = this.getDb();
    const result = await db
      .update(communityJoinRequests)
      .set({
        status,
        reviewedByUserId,
        reviewedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(communityJoinRequests.id, requestId))
      .returning();
    
    return result[0];
  },
  
  /**
   * PKL-278651-COMM-0022-DISC
   * Get recommended communities for a user based on their interests and connections
   * 
   * This implementation uses several factors for recommendations:
   * 1. User's skill level
   * 2. User's location
   * 3. Communities with similar tags to those the user is already part of
   * 4. Active communities with recent posts or events
   * 
   * @param userId The user ID to get recommendations for
   * @param limit Maximum number of communities to return (default: 10)
   * @returns Promise<Community[]> List of recommended communities
   */
  async getRecommendedCommunities(userId: number, limit: number = 10): Promise<Community[]> {
    const db = this.getDb();
    console.log(`[PKL-278651-COMM-0022-DISC] Getting recommendations for user ${userId}`);
    
    try {
      // Get user data to determine interests
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!userData) {
        console.error(`[PKL-278651-COMM-0022-DISC] User ${userId} not found`);
        return [];
      }
      
      // Get communities the user is already a member of
      const userMemberships = await db
        .select({
          communityId: communityMembers.communityId
        })
        .from(communityMembers)
        .where(eq(communityMembers.userId, userId));
      
      const userCommunityIds = userMemberships.map(m => m.communityId);
      console.log(`[PKL-278651-COMM-0022-DISC] User ${userId} is a member of ${userCommunityIds.length} communities`);
      
      // If user isn't in any communities yet, recommend popular ones
      if (userCommunityIds.length === 0) {
        console.log(`[PKL-278651-COMM-0022-DISC] User ${userId} is not in any communities, recommending popular ones`);
        return await db
          .select()
          .from(communities)
          .orderBy(desc(communities.memberCount))
          .limit(limit);
      }
      
      // Get tags from communities the user is a part of
      const userCommunities = await db
        .select()
        .from(communities)
        .where(inArray(communities.id, userCommunityIds));
      
      // Extract and analyze tags from user's communities
      const userTags = new Set<string>();
      userCommunities.forEach(community => {
        if (community.tags) {
          const tags = community.tags.split(',').map(tag => tag.trim());
          tags.forEach(tag => userTags.add(tag));
        }
      });
      
      console.log(`[PKL-278651-COMM-0022-DISC] User ${userId} has these community tags:`, Array.from(userTags));
      
      // Get communities with similar tags, skill level, or location, but exclude communities user is already in
      let recommendedCommunities = await db
        .select()
        .from(communities)
        .where(
          and(
            // Exclude communities user is already in
            userCommunityIds.length > 0 
              ? sql`${communities.id} NOT IN (${userCommunityIds.join(',')})` 
              : sql`1=1`,
            
            // Must be active
            eq(communities.isActive, true),
            
            // Public communities only for recommendations
            eq(communities.isPrivate, false),
            
            // Match at least one of these conditions
            or(
              // Similar location
              userData.location && communities.location 
                ? ilike(communities.location, `%${userData.location}%`) 
                : sql`1=0`,
              
              // Similar skill level
              userData.skillLevel && communities.skillLevel 
                ? eq(communities.skillLevel, userData.skillLevel) 
                : sql`1=0`,
              
              // Has events (active community)
              sql`${communities.eventCount} > 0`,
              
              // Has discussions (active community)
              sql`${communities.postCount} > 0`,
              
              // Has similar tags
              Array.from(userTags).length > 0 
                ? or(...Array.from(userTags).map(tag => 
                    ilike(communities.tags, `%${tag}%`)
                  )) 
                : sql`1=0`
            )
          )
        )
        .orderBy(desc(communities.memberCount))
        .limit(limit * 2); // Get more than needed for diversity
      
      console.log(`[PKL-278651-COMM-0022-DISC] Found ${recommendedCommunities.length} potential recommendations`);
      
      // Prioritize results using a scoring system and add diversity
      const scoredCommunities = recommendedCommunities.map(community => {
        let score = 0;
        
        // More members = higher score
        score += Math.min(community.memberCount / 10, 5);
        
        // More posts = higher score
        score += Math.min(community.postCount / 5, 3);
        
        // More events = higher score
        score += Math.min(community.eventCount / 2, 5);
        
        // Recent creation = higher score
        const daysSinceCreation = Math.floor((Date.now() - community.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        score += Math.max(30 - daysSinceCreation, 0) / 10;
        
        // Matching skill level = higher score
        if (userData.skillLevel && community.skillLevel === userData.skillLevel) {
          score += 5;
        }
        
        // Matching location = higher score
        if (userData.location && community.location && 
            community.location.toLowerCase().includes(userData.location.toLowerCase())) {
          score += 5;
        }
        
        // Tag matching = higher score
        if (community.tags) {
          const communityTags = community.tags.split(',').map(tag => tag.trim());
          const matchingTags = communityTags.filter(tag => userTags.has(tag));
          score += matchingTags.length * 2;
        }
        
        return { community, score };
      });
      
      // Sort by score and take top results
      scoredCommunities.sort((a, b) => b.score - a.score);
      
      // Ensure diversity by including some communities based on different criteria
      const topCommunities = scoredCommunities.slice(0, Math.floor(limit * 0.7))
        .map(item => item.community);
      
      // Add some new communities for discovery
      const newCommunityCutoff = new Date();
      newCommunityCutoff.setDate(newCommunityCutoff.getDate() - 30); // Last 30 days
      
      const newCommunities = await db
        .select()
        .from(communities)
        .where(
          and(
            userCommunityIds.length > 0 && topCommunities.length > 0
              ? sql`${communities.id} NOT IN (${[...userCommunityIds, ...topCommunities.map(c => c.id)].join(',')})` 
              : sql`1=1`,
            sql`${communities.createdAt} > ${newCommunityCutoff.toISOString()}`,
            eq(communities.isPrivate, false),
            eq(communities.isActive, true)
          )
        )
        .orderBy(desc(communities.createdAt))
        .limit(Math.ceil(limit * 0.3));
      
      console.log(`[PKL-278651-COMM-0022-DISC] Added ${newCommunities.length} new communities for discovery`);
      
      // Combine results
      return [...topCommunities, ...newCommunities].slice(0, limit);
    } catch (error) {
      console.error('[PKL-278651-COMM-0022-DISC] Error getting recommended communities:', error);
      return [];
    }
  }
};

// The getDb function is already defined on the implementation and will be overridden
// in the DatabaseStorage constructor