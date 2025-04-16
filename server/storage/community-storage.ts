/**
 * PKL-278651-COMM-0006-HUB
 * Community Module Storage Implementation
 * 
 * This file implements the database operations for community features.
 */
import { db } from '../db';
import { eq, and, or, like, desc, asc, sql, SQL, count } from 'drizzle-orm';
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
  type InsertCommunityPostComment 
} from '../../shared/schema/community';
import { users } from '../../shared/schema';

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
    try {
      const { location, skillLevel, tags, search, limit = 20, offset = 0 } = filters;
      
      let query = db.select().from(communities);
      
      // Apply filters if provided
      if (location) {
        query = query.where(like(communities.location, `%${location}%`));
      }
      
      if (skillLevel) {
        query = query.where(eq(communities.skillLevel, skillLevel));
      }
      
      if (tags && tags.length > 0) {
        // This is a simple implementation that checks for any tag match
        // For more complex tag filtering, a more sophisticated query would be needed
        const tagConditions = tags.map(tag => like(communities.tags, `%${tag}%`));
        query = query.where(or(...tagConditions));
      }
      
      if (search) {
        query = query.where(
          or(
            like(communities.name, `%${search}%`),
            like(communities.description, `%${search}%`),
            like(communities.location, `%${search}%`),
            like(communities.tags, `%${search}%`)
          )
        );
      }
      
      // Apply pagination
      const results = await query
        .orderBy(desc(communities.memberCount))
        .limit(limit)
        .offset(offset);
      
      return results;
    } catch (error) {
      console.error('[Storage] getCommunities error:', error);
      return [];
    }
  },
  
  async getCommunityById(id: number): Promise<Community | undefined> {
    try {
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, id));
      
      return community;
    } catch (error) {
      console.error('[Storage] getCommunityById error:', error);
      return undefined;
    }
  },
  
  async createCommunity(communityData: InsertCommunity): Promise<Community> {
    try {
      const [community] = await db.insert(communities)
        .values(communityData)
        .returning();
      
      return community;
    } catch (error) {
      console.error('[Storage] createCommunity error:', error);
      throw error;
    }
  },
  
  async updateCommunity(id: number, updates: Partial<InsertCommunity>): Promise<Community | undefined> {
    try {
      const [updatedCommunity] = await db.update(communities)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(communities.id, id))
        .returning();
      
      return updatedCommunity;
    } catch (error) {
      console.error('[Storage] updateCommunity error:', error);
      return undefined;
    }
  },
  
  async incrementCommunityMemberCount(communityId: number): Promise<void> {
    try {
      await db.update(communities)
        .set({
          memberCount: sql`${communities.memberCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId));
    } catch (error) {
      console.error('[Storage] incrementCommunityMemberCount error:', error);
      throw error;
    }
  },
  
  async decrementCommunityMemberCount(communityId: number): Promise<void> {
    try {
      await db.update(communities)
        .set({
          memberCount: sql`GREATEST(${communities.memberCount} - 1, 0)`,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId));
    } catch (error) {
      console.error('[Storage] decrementCommunityMemberCount error:', error);
      throw error;
    }
  },
  
  async incrementCommunityEventCount(communityId: number): Promise<void> {
    try {
      await db.update(communities)
        .set({
          eventCount: sql`${communities.eventCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId));
    } catch (error) {
      console.error('[Storage] incrementCommunityEventCount error:', error);
      throw error;
    }
  },
  
  async decrementCommunityEventCount(communityId: number): Promise<void> {
    try {
      await db.update(communities)
        .set({
          eventCount: sql`GREATEST(${communities.eventCount} - 1, 0)`,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId));
    } catch (error) {
      console.error('[Storage] decrementCommunityEventCount error:', error);
      throw error;
    }
  },
  
  // Community members operations
  async getCommunityMembers(communityId: number): Promise<(CommunityMember & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    try {
      const members = await db.select({
        id: communityMembers.id,
        communityId: communityMembers.communityId,
        userId: communityMembers.userId,
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
        .orderBy(desc(communityMembers.role), desc(communityMembers.joinedAt));
      
      return members;
    } catch (error) {
      console.error('[Storage] getCommunityMembers error:', error);
      return [];
    }
  },
  
  async getCommunityMembership(communityId: number, userId: number): Promise<CommunityMember | undefined> {
    try {
      const [membership] = await db.select()
        .from(communityMembers)
        .where(
          and(
            eq(communityMembers.communityId, communityId),
            eq(communityMembers.userId, userId)
          )
        );
      
      return membership;
    } catch (error) {
      console.error('[Storage] getCommunityMembership error:', error);
      return undefined;
    }
  },
  
  async createCommunityMember(memberData: InsertCommunityMember): Promise<CommunityMember> {
    try {
      const [member] = await db.insert(communityMembers)
        .values(memberData)
        .returning();
      
      return member;
    } catch (error) {
      console.error('[Storage] createCommunityMember error:', error);
      throw error;
    }
  },
  
  async updateCommunityMembership(communityId: number, userId: number, updates: Partial<InsertCommunityMember>): Promise<CommunityMember | undefined> {
    try {
      const [updatedMembership] = await db.update(communityMembers)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(communityMembers.communityId, communityId),
            eq(communityMembers.userId, userId)
          )
        )
        .returning();
      
      return updatedMembership;
    } catch (error) {
      console.error('[Storage] updateCommunityMembership error:', error);
      return undefined;
    }
  },
  
  async deleteCommunityMembership(communityId: number, userId: number): Promise<boolean> {
    try {
      const result = await db.delete(communityMembers)
        .where(
          and(
            eq(communityMembers.communityId, communityId),
            eq(communityMembers.userId, userId)
          )
        );
      
      return true;
    } catch (error) {
      console.error('[Storage] deleteCommunityMembership error:', error);
      return false;
    }
  },
  
  async getCommunityAdminCount(communityId: number): Promise<number> {
    try {
      const [result] = await db.select({ count: count() })
        .from(communityMembers)
        .where(
          and(
            eq(communityMembers.communityId, communityId),
            eq(communityMembers.role, 'admin')
          )
        );
      
      return result?.count || 0;
    } catch (error) {
      console.error('[Storage] getCommunityAdminCount error:', error);
      return 0;
    }
  },
  
  // Community posts operations
  async getCommunityPosts(communityId: number, options = {}): Promise<(CommunityPost & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    try {
      const { limit = 20, offset = 0 } = options;
      
      const posts = await db.select({
        id: communityPosts.id,
        communityId: communityPosts.communityId,
        userId: communityPosts.userId,
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
      
      return posts;
    } catch (error) {
      console.error('[Storage] getCommunityPosts error:', error);
      return [];
    }
  },
  
  async getCommunityPostById(postId: number): Promise<CommunityPost | undefined> {
    try {
      const [post] = await db.select()
        .from(communityPosts)
        .where(eq(communityPosts.id, postId));
      
      return post;
    } catch (error) {
      console.error('[Storage] getCommunityPostById error:', error);
      return undefined;
    }
  },
  
  async createCommunityPost(postData: InsertCommunityPost): Promise<CommunityPost> {
    try {
      const [post] = await db.insert(communityPosts)
        .values(postData)
        .returning();
      
      return post;
    } catch (error) {
      console.error('[Storage] createCommunityPost error:', error);
      throw error;
    }
  },
  
  async updateCommunityPost(postId: number, updates: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    try {
      const [updatedPost] = await db.update(communityPosts)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(communityPosts.id, postId))
        .returning();
      
      return updatedPost;
    } catch (error) {
      console.error('[Storage] updateCommunityPost error:', error);
      return undefined;
    }
  },
  
  async deleteCommunityPost(postId: number): Promise<boolean> {
    try {
      // Delete associated likes and comments first
      await db.delete(communityPostLikes)
        .where(eq(communityPostLikes.postId, postId));
      
      await db.delete(communityPostComments)
        .where(eq(communityPostComments.postId, postId));
      
      // Then delete the post
      await db.delete(communityPosts)
        .where(eq(communityPosts.id, postId));
      
      return true;
    } catch (error) {
      console.error('[Storage] deleteCommunityPost error:', error);
      return false;
    }
  },
  
  async incrementPostCommentCount(postId: number): Promise<void> {
    try {
      await db.update(communityPosts)
        .set({
          comments: sql`${communityPosts.comments} + 1`,
          updatedAt: new Date()
        })
        .where(eq(communityPosts.id, postId));
    } catch (error) {
      console.error('[Storage] incrementPostCommentCount error:', error);
      throw error;
    }
  },
  
  async decrementPostCommentCount(postId: number): Promise<void> {
    try {
      await db.update(communityPosts)
        .set({
          comments: sql`GREATEST(${communityPosts.comments} - 1, 0)`,
          updatedAt: new Date()
        })
        .where(eq(communityPosts.id, postId));
    } catch (error) {
      console.error('[Storage] decrementPostCommentCount error:', error);
      throw error;
    }
  },
  
  async incrementPostLikeCount(postId: number): Promise<void> {
    try {
      await db.update(communityPosts)
        .set({
          likes: sql`${communityPosts.likes} + 1`,
          updatedAt: new Date()
        })
        .where(eq(communityPosts.id, postId));
    } catch (error) {
      console.error('[Storage] incrementPostLikeCount error:', error);
      throw error;
    }
  },
  
  async decrementPostLikeCount(postId: number): Promise<void> {
    try {
      await db.update(communityPosts)
        .set({
          likes: sql`GREATEST(${communityPosts.likes} - 1, 0)`,
          updatedAt: new Date()
        })
        .where(eq(communityPosts.id, postId));
    } catch (error) {
      console.error('[Storage] decrementPostLikeCount error:', error);
      throw error;
    }
  },
  
  // Community events operations
  async getCommunityEvents(communityId: number, options = {}): Promise<CommunityEvent[]> {
    try {
      const { limit = 20, offset = 0 } = options;
      
      const events = await db.select()
        .from(communityEvents)
        .where(eq(communityEvents.communityId, communityId))
        .orderBy(asc(communityEvents.eventDate))
        .limit(limit)
        .offset(offset);
      
      return events;
    } catch (error) {
      console.error('[Storage] getCommunityEvents error:', error);
      return [];
    }
  },
  
  async getCommunityEventById(eventId: number): Promise<CommunityEvent | undefined> {
    try {
      const [event] = await db.select()
        .from(communityEvents)
        .where(eq(communityEvents.id, eventId));
      
      return event;
    } catch (error) {
      console.error('[Storage] getCommunityEventById error:', error);
      return undefined;
    }
  },
  
  async createCommunityEvent(eventData: InsertCommunityEvent): Promise<CommunityEvent> {
    try {
      const [event] = await db.insert(communityEvents)
        .values(eventData)
        .returning();
      
      return event;
    } catch (error) {
      console.error('[Storage] createCommunityEvent error:', error);
      throw error;
    }
  },
  
  async updateCommunityEvent(eventId: number, updates: Partial<InsertCommunityEvent>): Promise<CommunityEvent | undefined> {
    try {
      const [updatedEvent] = await db.update(communityEvents)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(communityEvents.id, eventId))
        .returning();
      
      return updatedEvent;
    } catch (error) {
      console.error('[Storage] updateCommunityEvent error:', error);
      return undefined;
    }
  },
  
  async deleteCommunityEvent(eventId: number): Promise<boolean> {
    try {
      // Delete associated attendees first
      await db.delete(communityEventAttendees)
        .where(eq(communityEventAttendees.eventId, eventId));
      
      // Then delete the event
      await db.delete(communityEvents)
        .where(eq(communityEvents.id, eventId));
      
      return true;
    } catch (error) {
      console.error('[Storage] deleteCommunityEvent error:', error);
      return false;
    }
  },
  
  async incrementEventAttendeeCount(eventId: number): Promise<void> {
    try {
      await db.update(communityEvents)
        .set({
          currentAttendees: sql`${communityEvents.currentAttendees} + 1`,
          updatedAt: new Date()
        })
        .where(eq(communityEvents.id, eventId));
    } catch (error) {
      console.error('[Storage] incrementEventAttendeeCount error:', error);
      throw error;
    }
  },
  
  async decrementEventAttendeeCount(eventId: number): Promise<void> {
    try {
      await db.update(communityEvents)
        .set({
          currentAttendees: sql`GREATEST(${communityEvents.currentAttendees} - 1, 0)`,
          updatedAt: new Date()
        })
        .where(eq(communityEvents.id, eventId));
    } catch (error) {
      console.error('[Storage] decrementEventAttendeeCount error:', error);
      throw error;
    }
  },
  
  // Event attendance operations
  async getEventAttendees(eventId: number): Promise<(CommunityEventAttendee & { user: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    try {
      const attendees = await db.select({
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
      
      return attendees;
    } catch (error) {
      console.error('[Storage] getEventAttendees error:', error);
      return [];
    }
  },
  
  async getEventAttendance(eventId: number, userId: number): Promise<CommunityEventAttendee | undefined> {
    try {
      const [attendance] = await db.select()
        .from(communityEventAttendees)
        .where(
          and(
            eq(communityEventAttendees.eventId, eventId),
            eq(communityEventAttendees.userId, userId)
          )
        );
      
      return attendance;
    } catch (error) {
      console.error('[Storage] getEventAttendance error:', error);
      return undefined;
    }
  },
  
  async createEventAttendance(attendanceData: InsertCommunityEventAttendee): Promise<CommunityEventAttendee> {
    try {
      const [attendance] = await db.insert(communityEventAttendees)
        .values(attendanceData)
        .returning();
      
      return attendance;
    } catch (error) {
      console.error('[Storage] createEventAttendance error:', error);
      throw error;
    }
  },
  
  async updateEventAttendance(eventId: number, userId: number, updates: Partial<InsertCommunityEventAttendee>): Promise<CommunityEventAttendee | undefined> {
    try {
      const [updatedAttendance] = await db.update(communityEventAttendees)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(communityEventAttendees.eventId, eventId),
            eq(communityEventAttendees.userId, userId)
          )
        )
        .returning();
      
      return updatedAttendance;
    } catch (error) {
      console.error('[Storage] updateEventAttendance error:', error);
      return undefined;
    }
  },
  
  async cancelEventAttendance(eventId: number, userId: number): Promise<boolean> {
    try {
      await db.delete(communityEventAttendees)
        .where(
          and(
            eq(communityEventAttendees.eventId, eventId),
            eq(communityEventAttendees.userId, userId)
          )
        );
      
      return true;
    } catch (error) {
      console.error('[Storage] cancelEventAttendance error:', error);
      return false;
    }
  },
  
  // Post comments operations
  async getPostComments(postId: number): Promise<(CommunityPostComment & { author: { username: string, displayName: string | null, avatarUrl: string | null } })[]> {
    try {
      const comments = await db.select({
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
        .orderBy(asc(communityPostComments.createdAt));
      
      return comments;
    } catch (error) {
      console.error('[Storage] getPostComments error:', error);
      return [];
    }
  },
  
  async createCommunityPostComment(commentData: InsertCommunityPostComment): Promise<CommunityPostComment> {
    try {
      const [comment] = await db.insert(communityPostComments)
        .values(commentData)
        .returning();
      
      return comment;
    } catch (error) {
      console.error('[Storage] createCommunityPostComment error:', error);
      throw error;
    }
  },
  
  async deleteComment(commentId: number): Promise<boolean> {
    try {
      // Delete associated likes first
      await db.delete(communityCommentLikes)
        .where(eq(communityCommentLikes.commentId, commentId));
      
      // Then delete the comment
      await db.delete(communityPostComments)
        .where(eq(communityPostComments.id, commentId));
      
      return true;
    } catch (error) {
      console.error('[Storage] deleteComment error:', error);
      return false;
    }
  },
  
  // Post likes operations
  async getPostLike(postId: number, userId: number): Promise<{ id: number } | undefined> {
    try {
      const [like] = await db.select({ id: communityPostLikes.id })
        .from(communityPostLikes)
        .where(
          and(
            eq(communityPostLikes.postId, postId),
            eq(communityPostLikes.userId, userId)
          )
        );
      
      return like;
    } catch (error) {
      console.error('[Storage] getPostLike error:', error);
      return undefined;
    }
  },
  
  async createPostLike(likeData: { postId: number, userId: number }): Promise<{ id: number }> {
    try {
      const [like] = await db.insert(communityPostLikes)
        .values(likeData)
        .returning({ id: communityPostLikes.id });
      
      return like;
    } catch (error) {
      console.error('[Storage] createPostLike error:', error);
      throw error;
    }
  },
  
  async deletePostLike(postId: number, userId: number): Promise<boolean> {
    try {
      await db.delete(communityPostLikes)
        .where(
          and(
            eq(communityPostLikes.postId, postId),
            eq(communityPostLikes.userId, userId)
          )
        );
      
      return true;
    } catch (error) {
      console.error('[Storage] deletePostLike error:', error);
      return false;
    }
  },
  
  // Join requests operations
  async createCommunityJoinRequest(requestData: { communityId: number, userId: number, message?: string }): Promise<{ id: number, status: string }> {
    try {
      const { communityId, userId, message = 'I would like to join this community.' } = requestData;
      
      const [joinRequest] = await db.insert(communityJoinRequests)
        .values({
          communityId,
          userId,
          message,
          status: 'pending'
        })
        .returning({ id: communityJoinRequests.id, status: communityJoinRequests.status });
      
      return joinRequest;
    } catch (error) {
      console.error('[Storage] createCommunityJoinRequest error:', error);
      throw error;
    }
  },
  
  async getCommunityJoinRequests(communityId: number): Promise<any[]> {
    try {
      const requests = await db.select({
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
      
      return requests;
    } catch (error) {
      console.error('[Storage] getCommunityJoinRequests error:', error);
      return [];
    }
  },
  
  async updateJoinRequestStatus(requestId: number, status: string, reviewedByUserId: number): Promise<any> {
    try {
      const [updatedRequest] = await db.update(communityJoinRequests)
        .set({
          status,
          reviewedByUserId,
          reviewedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(communityJoinRequests.id, requestId))
        .returning();
      
      return updatedRequest;
    } catch (error) {
      console.error('[Storage] updateJoinRequestStatus error:', error);
      throw error;
    }
  }
};