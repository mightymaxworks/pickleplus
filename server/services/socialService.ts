/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Sharing Service
 * 
 * This service handles the business logic for social sharing features,
 * enabling community learning and social interactions for SAGE.
 * 
 * Part of Sprint 5: Social Features & UI Polish
 */

import { db } from '../db';
import { 
  sharedContent, 
  contentReactions, 
  contentComments, 
  coachingRecommendations,
  socialFeedItems,
  userConnectionRequests,
  userConnections,
  ContentTypeEnum,
  ContentType,
  VisibilityEnum,
  type SharedContent,
  type ContentReaction,
  type ContentComment,
  type CoachingRecommendation,
  type SocialFeedItem,
  type UserConnectionRequest,
  type UserConnection,
  type InsertSharedContent
} from '@shared/schema/social';
import { eq, and, or, desc, isNull, inArray, sql } from 'drizzle-orm';
import { users } from '@shared/schema';

/**
 * Social Service class - Handles all social sharing operations
 */
export class SocialService {
  /**
   * Share content with the community
   */
  async shareContent(contentData: InsertSharedContent): Promise<SharedContent> {
    // Ensure visibility is a valid value from our enum
    const updatedContentData = {
      ...contentData,
      visibility: (contentData.visibility || 'public') as "public" | "friends" | "private" | "coaches"
    };
    
    const [result] = await db.insert(sharedContent).values(updatedContentData).returning();
    
    // Create a feed item for this shared content
    await this.createFeedItem({
      contentType: contentData.contentType,
      contentId: contentData.contentId,
      activityType: 'shared',
      userId: contentData.userId,
      targetUserId: null,
      title: contentData.title,
      summary: contentData.description || null,
      imageUrl: contentData.customImage || null,
      enrichmentData: null,
      visibility: updatedContentData.visibility,
    });
    
    return result;
  }
  
  /**
   * Get content by ID
   */
  async getContentById(id: number): Promise<SharedContent | undefined> {
    const [content] = await db
      .select()
      .from(sharedContent)
      .where(and(eq(sharedContent.id, id), eq(sharedContent.isRemoved, false)));
    
    return content;
  }
  
  /**
   * Get content based on the original content
   */
  async getContentByOriginal(contentType: 'journal_entry' | 'feedback' | 'drill' | 'training_plan' | 'match_result' | 'achievement' | 'sage_insight' | 'user_connection', contentId: number): Promise<SharedContent[]> {
    return db
      .select()
      .from(sharedContent)
      .where(
        and(
          eq(sharedContent.contentType, contentType),
          eq(sharedContent.contentId, contentId),
          eq(sharedContent.isRemoved, false)
        )
      );
  }
  
  /**
   * Update shared content
   */
  async updateContent(id: number, updates: Partial<SharedContent>): Promise<SharedContent | undefined> {
    const [updated] = await db
      .update(sharedContent)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sharedContent.id, id))
      .returning();
    
    return updated;
  }
  
  /**
   * Soft delete shared content
   */
  async removeContent(id: number): Promise<void> {
    await db
      .update(sharedContent)
      .set({ isRemoved: true, updatedAt: new Date() })
      .where(eq(sharedContent.id, id));
  }
  
  /**
   * Get user's shared content
   */
  async getUserSharedContent(userId: number, limit = 20, offset = 0): Promise<SharedContent[]> {
    return db
      .select()
      .from(sharedContent)
      .where(and(eq(sharedContent.userId, userId), eq(sharedContent.isRemoved, false)))
      .orderBy(desc(sharedContent.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  /**
   * Get public content feed - the main discovery mechanism
   */
  async getPublicContentFeed(userId: number, limit = 20, offset = 0): Promise<SharedContent[]> {
    // Get content visible to the user:
    // 1. Public content
    // 2. Content from connections if visibility is 'friends'
    // 3. Content with 'coaches' visibility if user is a coach (role-based)
    
    // First, get user's connections
    const connections = await db
      .select({ connectedUserId: userConnections.connectedUserId })
      .from(userConnections)
      .where(and(
        eq(userConnections.userId, userId),
        eq(userConnections.status, 'active')
      ));
    
    const connectionIds = connections.map(c => c.connectedUserId);
    
    // Get user roles to check for coach access
    const [userWithRoles] = await db
      .select({
        id: users.id,
        roles: sql<any>`(SELECT json_agg(r.name) FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = ${userId} AND ur.is_active = true)`
      })
      .from(users)
      .where(eq(users.id, userId));
    
    // Check if user has the COACH role
    const roles = userWithRoles?.roles || [];
    const isCoach = Array.isArray(roles) && roles.includes('COACH');
    
    return db
      .select()
      .from(sharedContent)
      .where(and(
        eq(sharedContent.isRemoved, false),
        or(
          eq(sharedContent.visibility, 'public'),
          and(
            eq(sharedContent.visibility, 'friends'),
            inArray(sharedContent.userId, connectionIds)
          ),
          and(
            eq(sharedContent.visibility, 'coaches'),
            sql`${isCoach}`
          )
        )
      ))
      .orderBy(desc(sharedContent.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  /**
   * Add a reaction to content (like, bookmark, etc)
   */
  async addReaction(contentId: number, userId: number, reactionType: string): Promise<void> {
    // Check if reaction already exists
    const [existing] = await db
      .select()
      .from(contentReactions)
      .where(and(
        eq(contentReactions.contentId, contentId),
        eq(contentReactions.userId, userId),
        eq(contentReactions.reactionType, reactionType)
      ));
    
    if (existing) {
      return; // Reaction already exists
    }
    
    // Add the reaction
    await db.insert(contentReactions).values({
      contentId,
      userId,
      reactionType,
    });
    
    // Update the like count on shared content
    if (reactionType === 'like') {
      await db
        .update(sharedContent)
        .set({ 
          likeCount: sql`${sharedContent.likeCount} + 1` 
        })
        .where(eq(sharedContent.id, contentId));
    }
  }
  
  /**
   * Remove a reaction from content
   */
  async removeReaction(contentId: number, userId: number, reactionType: string): Promise<void> {
    await db
      .delete(contentReactions)
      .where(and(
        eq(contentReactions.contentId, contentId),
        eq(contentReactions.userId, userId),
        eq(contentReactions.reactionType, reactionType)
      ));
    
    // Update the like count on shared content
    if (reactionType === 'like') {
      await db
        .update(sharedContent)
        .set({ 
          likeCount: sql`${sharedContent.likeCount} - 1` 
        })
        .where(eq(sharedContent.id, contentId));
    }
  }
  
  /**
   * Get reactions for content
   */
  async getContentReactions(contentId: number): Promise<ContentReaction[]> {
    return db
      .select()
      .from(contentReactions)
      .where(eq(contentReactions.contentId, contentId));
  }
  
  /**
   * Check if user has reacted to content
   */
  async hasUserReacted(contentId: number, userId: number, reactionType: string): Promise<boolean> {
    const [reaction] = await db
      .select()
      .from(contentReactions)
      .where(and(
        eq(contentReactions.contentId, contentId),
        eq(contentReactions.userId, userId),
        eq(contentReactions.reactionType, reactionType)
      ));
    
    return !!reaction;
  }
  
  /**
   * Add comment to content
   */
  async addComment(contentId: number, userId: number, text: string, parentCommentId?: number): Promise<ContentComment> {
    const [comment] = await db
      .insert(contentComments)
      .values({
        contentId,
        userId,
        text,
        parentCommentId: parentCommentId || null,
      })
      .returning();
    
    // Update comment count on shared content
    await db
      .update(sharedContent)
      .set({ 
        commentCount: sql`${sharedContent.commentCount} + 1` 
      })
      .where(eq(sharedContent.id, contentId));
    
    return comment;
  }
  
  /**
   * Get comments for content
   */
  async getContentComments(contentId: number, limit = 20, offset = 0): Promise<ContentComment[]> {
    return db
      .select()
      .from(contentComments)
      .where(and(
        eq(contentComments.contentId, contentId),
        eq(contentComments.isRemoved, false),
        isNull(contentComments.parentCommentId) // Get only top-level comments
      ))
      .orderBy(desc(contentComments.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  /**
   * Get replies to a comment
   */
  async getCommentReplies(commentId: number): Promise<ContentComment[]> {
    return db
      .select()
      .from(contentComments)
      .where(and(
        eq(contentComments.parentCommentId, commentId),
        eq(contentComments.isRemoved, false)
      ))
      .orderBy(contentComments.createdAt);
  }
  
  /**
   * Create a coaching recommendation
   */
  async createRecommendation(recommendation: {
    fromUserId: number;
    toUserId: number;
    contentType: 'journal_entry' | 'feedback' | 'drill' | 'training_plan' | 'match_result' | 'achievement' | 'sage_insight' | 'user_connection';
    contentId: number;
    status: string;
    message?: string;
    relevanceReason?: string;
    skillsTargeted?: string[];
  }): Promise<CoachingRecommendation> {
    const [result] = await db
      .insert(coachingRecommendations)
      .values(recommendation)
      .returning();
    
    // Create a feed item for this recommendation
    await this.createFeedItem({
      contentType: recommendation.contentType,
      contentId: recommendation.contentId,
      activityType: 'recommended',
      userId: recommendation.fromUserId,
      targetUserId: recommendation.toUserId,
      title: `Recommended ${recommendation.contentType.replace('_', ' ')}`,
      summary: recommendation.message || null,
      imageUrl: null,
      enrichmentData: null,
      visibility: 'private', // Recommendations are private by default
    });
    
    return result;
  }
  
  /**
   * Get received recommendations for a user
   */
  async getUserReceivedRecommendations(userId: number): Promise<CoachingRecommendation[]> {
    return db
      .select()
      .from(coachingRecommendations)
      .where(eq(coachingRecommendations.toUserId, userId))
      .orderBy(desc(coachingRecommendations.createdAt));
  }
  
  /**
   * Get sent recommendations by a user
   */
  async getUserSentRecommendations(userId: number): Promise<CoachingRecommendation[]> {
    return db
      .select()
      .from(coachingRecommendations)
      .where(eq(coachingRecommendations.fromUserId, userId))
      .orderBy(desc(coachingRecommendations.createdAt));
  }
  
  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(id: number, status: string, feedbackRating?: number, feedbackComment?: string): Promise<CoachingRecommendation> {
    const updates: any = { status };
    
    if (status === 'completed') {
      updates.completedAt = new Date();
      if (feedbackRating) updates.feedbackRating = feedbackRating;
      if (feedbackComment) updates.feedbackComment = feedbackComment;
    } else if (status === 'accepted' || status === 'declined') {
      updates.respondedAt = new Date();
    }
    
    const [updated] = await db
      .update(coachingRecommendations)
      .set(updates)
      .where(eq(coachingRecommendations.id, id))
      .returning();
    
    return updated;
  }
  
  /**
   * Create a social feed item
   */
  async createFeedItem(feedItem: Omit<SocialFeedItem, 'id' | 'timestamp' | 'isPinned' | 'isHighlighted'>): Promise<SocialFeedItem> {
    const [result] = await db
      .insert(socialFeedItems)
      .values(feedItem)
      .returning();
    
    return result;
  }
  
  /**
   * Get social feed for user
   */
  async getUserFeed(userId: number, limit = 20, offset = 0): Promise<SocialFeedItem[]> {
    // Get user's connections
    const connections = await db
      .select({ connectedUserId: userConnections.connectedUserId })
      .from(userConnections)
      .where(and(
        eq(userConnections.userId, userId),
        eq(userConnections.status, 'active')
      ));
    
    const connectionIds = connections.map(c => c.connectedUserId);
    connectionIds.push(userId); // Include user's own activities
    
    // Get feed items from connections and public items
    return db
      .select()
      .from(socialFeedItems)
      .where(
        or(
          and(
            inArray(socialFeedItems.userId, connectionIds),
            or(
              eq(socialFeedItems.visibility, 'public'),
              eq(socialFeedItems.visibility, 'friends')
            )
          ),
          and(
            eq(socialFeedItems.targetUserId, userId),
            eq(socialFeedItems.visibility, 'private')
          )
        )
      )
      .orderBy(desc(socialFeedItems.timestamp))
      .limit(limit)
      .offset(offset);
  }
  
  /**
   * Request user connection
   */
  async requestConnection(fromUserId: number, toUserId: number, connectionType: string, message?: string): Promise<UserConnectionRequest> {
    // Check if there's already an active connection
    const [existingConnection] = await db
      .select()
      .from(userConnections)
      .where(and(
        eq(userConnections.userId, fromUserId),
        eq(userConnections.connectedUserId, toUserId),
        eq(userConnections.status, 'active')
      ));
    
    if (existingConnection) {
      throw new Error('Connection already exists');
    }
    
    // Check if there's a pending request
    const [existingRequest] = await db
      .select()
      .from(userConnectionRequests)
      .where(and(
        eq(userConnectionRequests.fromUserId, fromUserId),
        eq(userConnectionRequests.toUserId, toUserId),
        eq(userConnectionRequests.status, 'pending')
      ));
    
    if (existingRequest) {
      throw new Error('Connection request already pending');
    }
    
    // Create the request
    const [request] = await db
      .insert(userConnectionRequests)
      .values({
        fromUserId,
        toUserId,
        connectionType,
        message: message || null,
      })
      .returning();
    
    return request;
  }
  
  /**
   * Get pending connection requests for user
   */
  async getPendingConnectionRequests(userId: number): Promise<UserConnectionRequest[]> {
    return db
      .select()
      .from(userConnectionRequests)
      .where(and(
        eq(userConnectionRequests.toUserId, userId),
        eq(userConnectionRequests.status, 'pending')
      ))
      .orderBy(desc(userConnectionRequests.createdAt));
  }
  
  /**
   * Accept connection request
   */
  async acceptConnectionRequest(requestId: number): Promise<UserConnection[]> {
    // Get the request
    const [request] = await db
      .select()
      .from(userConnectionRequests)
      .where(and(
        eq(userConnectionRequests.id, requestId),
        eq(userConnectionRequests.status, 'pending')
      ));
    
    if (!request) {
      throw new Error('Connection request not found or already processed');
    }
    
    // Update request status
    await db
      .update(userConnectionRequests)
      .set({
        status: 'accepted',
        respondedAt: new Date(),
      })
      .where(eq(userConnectionRequests.id, requestId));
    
    // Create bidirectional connection
    const connections = await Promise.all([
      // From requester to recipient
      db.insert(userConnections)
        .values({
          userId: request.fromUserId,
          connectedUserId: request.toUserId,
          connectionType: request.connectionType,
          status: 'active',
          sharingPermissions: { feedItems: true, journalEntries: false, feedback: true },
        })
        .returning(),
      
      // From recipient to requester
      db.insert(userConnections)
        .values({
          userId: request.toUserId,
          connectedUserId: request.fromUserId,
          connectionType: request.connectionType === 'coach' ? 'student' : request.connectionType,
          status: 'active',
          sharingPermissions: { feedItems: true, journalEntries: false, feedback: true },
        })
        .returning(),
    ]);
    
    // Create feed item for the connection
    await this.createFeedItem({
      contentType: 'user_connection' as const,
      contentId: connections[0][0].id,
      activityType: 'connected',
      userId: request.fromUserId,
      targetUserId: request.toUserId,
      title: `Connected with a ${request.connectionType === 'coach' ? 'student' : request.connectionType}`,
      summary: null,
      imageUrl: null,
      enrichmentData: null,
      visibility: 'public',
    });
    
    return [connections[0][0], connections[1][0]];
  }
  
  /**
   * Decline connection request
   */
  async declineConnectionRequest(requestId: number): Promise<void> {
    await db
      .update(userConnectionRequests)
      .set({
        status: 'declined',
        respondedAt: new Date(),
      })
      .where(and(
        eq(userConnectionRequests.id, requestId),
        eq(userConnectionRequests.status, 'pending')
      ));
  }
  
  /**
   * Get user connections
   */
  async getUserConnections(userId: number): Promise<UserConnection[]> {
    return db
      .select()
      .from(userConnections)
      .where(and(
        eq(userConnections.userId, userId),
        eq(userConnections.status, 'active')
      ))
      .orderBy(userConnections.createdAt);
  }
  
  /**
   * Update connection sharing permissions
   */
  async updateConnectionPermissions(connectionId: number, permissions: any): Promise<UserConnection> {
    const [updated] = await db
      .update(userConnections)
      .set({
        sharingPermissions: permissions,
        lastInteractionAt: new Date(),
      })
      .where(eq(userConnections.id, connectionId))
      .returning();
    
    return updated;
  }
  
  /**
   * Remove connection
   */
  async removeConnection(userId: number, connectedUserId: number): Promise<void> {
    await db
      .update(userConnections)
      .set({
        status: 'inactive',
        lastInteractionAt: new Date(),
      })
      .where(and(
        eq(userConnections.userId, userId),
        eq(userConnections.connectedUserId, connectedUserId),
        eq(userConnections.status, 'active')
      ));
    
    // Also update the reverse connection
    await db
      .update(userConnections)
      .set({
        status: 'inactive',
        lastInteractionAt: new Date(),
      })
      .where(and(
        eq(userConnections.userId, connectedUserId),
        eq(userConnections.connectedUserId, userId),
        eq(userConnections.status, 'active')
      ));
  }
}

// Create instance
export const socialService = new SocialService();