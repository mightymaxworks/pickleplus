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
  // Community operations
  getCommunities(filters?: {
    location?: string;
    skillLevel?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Community[]>;
  
  getCommunityById(id: number): Promise<Community | undefined>;
  
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
  // Community operations
  async getCommunities(filters = {}): Promise<Community[]> {
    const db = this.getDb();
    const { location, skillLevel, tags, search, limit = 20, offset = 0 } = filters;
    
    let query = db.select().from(communities);
    
    if (location) {
      query = query.where(ilike(communities.location, `%${location}%`));
    }
    
    if (skillLevel) {
      query = query.where(eq(communities.skillLevel, skillLevel));
    }
    
    if (tags && tags.length > 0) {
      // For simplicity, we'll search for any of the tags in the comma-separated list
      const tagConditions = tags.map(tag => ilike(communities.tags, `%${tag}%`));
      query = query.where(or(...tagConditions));
    }
    
    if (search) {
      query = query.where(
        or(
          ilike(communities.name, `%${search}%`),
          ilike(communities.description, `%${search}%`)
        )
      );
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
  }
};

/**
 * Helper function to get the database instance from this context
 */
function getDb() {
  // @ts-ignore - this will be bound to DatabaseStorage instance when used
  return this.db;
}

// Attach helper functions to the implementation
communityStorageImplementation.getDb = getDb;