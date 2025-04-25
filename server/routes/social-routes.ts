/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Sharing Routes
 * 
 * API routes for social sharing features enabling community learning
 * and user collaboration.
 * 
 * Part of Sprint 5: Social Features & UI Polish
 */

import express, { Request, Response } from 'express';
import { socialService } from '../services/socialService';
import { isAuthenticated } from '../middleware/auth';
import { 
  ContentTypeEnum, 
  VisibilityEnum,
  insertSharedContentSchema,
  contentCommentValidationSchema,
  sharedContentValidationSchema,
  type SharedContent
} from '@shared/schema/social';
import { z } from 'zod';

// Helper function to safely access user ID from authenticated requests
// This can be used wherever the isAuthenticated middleware is applied
const getUserId = (req: Request): number => {
  // The isAuthenticated middleware guarantees req.user exists
  return req.user!.id;
};

// Extend Express Request type to include content
declare global {
  namespace Express {
    interface Request {
      content?: SharedContent;
    }
  }
}

// Create router
const router = express.Router();

// Middleware to check content authorization
async function checkContentOwnership(req: Request, res: Response, next: express.NextFunction) {
  const contentId = parseInt(req.params.id);
  if (isNaN(contentId)) {
    return res.status(400).json({ success: false, message: 'Invalid content ID' });
  }
  
  try {
    const content = await socialService.getContentById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    // Check if user is the owner of the content
    if (content.userId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this content' });
    }
    
    // Store content in request for later use
    req.content = content;
    next();
  } catch (error) {
    console.error('Error checking content ownership:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Share content API routes
// ------------------------

/**
 * Share content with the community
 * POST /api/social/content
 */
router.post('/content', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validation = sharedContentValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: validation.error.flatten() 
      });
    }
    
    // Add authenticated user ID and ensure contentType and visibility are valid enum values
    const contentData = {
      ...validation.data,
      userId: getUserId(req),
      // Cast contentType to one of the valid enum values
      contentType: validation.data.contentType as "journal_entry" | "feedback" | "drill" | 
        "training_plan" | "match_result" | "achievement" | "sage_insight" | "user_connection",
      // Ensure visibility is a valid enum type if provided
      visibility: validation.data.visibility ? 
        (validation.data.visibility as "public" | "friends" | "private" | "coaches") : 
        "public"
    };
    
    // Create shared content
    const result = await socialService.shareContent(contentData);
    
    res.status(201).json({
      success: true,
      message: 'Content shared successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Error sharing content:', error);
    res.status(500).json({ success: false, message: 'Failed to share content' });
  }
});

/**
 * Get shared content by ID
 * GET /api/social/content/:id
 */
router.get('/content/:id', async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    
    const content = await socialService.getContentById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    // For private/friends content, check if user is authorized to view
    if (content.visibility !== 'public') {
      // Public content is visible to all
      if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      
      // Private content is only visible to the owner
      if (content.visibility === 'private' && content.userId !== getUserId(req)) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this content' });
      }
      
      // Friends content requires checking connections
      if (content.visibility === 'friends' && content.userId !== getUserId(req)) {
        const connections = await socialService.getUserConnections(getUserId(req));
        const isConnected = connections.some(conn => conn.connectedUserId === content.userId);
        
        if (!isConnected) {
          return res.status(403).json({ success: false, message: 'Not authorized to view this content' });
        }
      }
      
      // Coaches content requires checking role
      if (content.visibility === 'coaches') {
        // Check if user has COACH role by examining roles array
        const userRoles = (req.user as any)?.roles || [];
        const isCoach = Array.isArray(userRoles) && userRoles.some(r => r.name === 'COACH');
        
        if (!isCoach) {
          return res.status(403).json({ success: false, message: 'Not authorized to view this content' });
        }
      }
    }
    
    // Increment view count
    await socialService.updateContent(contentId, { viewCount: content.viewCount + 1 });
    
    res.json({
      success: true,
      data: content
    });
    
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Update shared content
 * PATCH /api/social/content/:id
 */
router.patch('/content/:id', isAuthenticated, checkContentOwnership, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const updateSchema = z.object({
      title: z.string().min(3).max(100).optional(),
      description: z.string().max(500).optional(),
      visibility: z.enum(['public', 'friends', 'private', 'coaches']).optional(),
      customTags: z.array(z.string()).max(10).optional(),
      highlightedText: z.string().optional(),
      customImage: z.string().optional(),
    });
    
    const validation = updateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid update data', 
        errors: validation.error.flatten() 
      });
    }
    
    // Update content
    const contentId = parseInt(req.params.id);
    const updated = await socialService.updateContent(contentId, validation.data);
    
    res.json({
      success: true,
      message: 'Content updated successfully',
      data: updated
    });
    
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
});

/**
 * Delete shared content
 * DELETE /api/social/content/:id
 */
router.delete('/content/:id', isAuthenticated, checkContentOwnership, async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    await socialService.removeContent(contentId);
    
    res.json({
      success: true,
      message: 'Content removed successfully'
    });
    
  } catch (error) {
    console.error('Error removing content:', error);
    res.status(500).json({ success: false, message: 'Failed to remove content' });
  }
});

/**
 * Get user's shared content
 * GET /api/social/content/user/:userId
 */
router.get('/content/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const content = await socialService.getUserSharedContent(userId, limit, offset);
    
    // Filter private content if not the owner
    const filteredContent = !req.isAuthenticated() || req.user?.id !== userId
      ? content.filter(item => item.visibility === 'public')
      : content;
    
    res.json({
      success: true,
      data: filteredContent
    });
    
  } catch (error) {
    console.error('Error getting user content:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Get content feed (discovery)
 * GET /api/social/feed/content
 */
router.get('/feed/content', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // isAuthenticated middleware ensures req.user exists
    const content = await socialService.getPublicContentFeed(req.user!.id, limit, offset);
    
    res.json({
      success: true,
      data: content
    });
    
  } catch (error) {
    console.error('Error getting content feed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Content reactions API routes
// ---------------------------

/**
 * Add reaction to content
 * POST /api/social/content/:id/reactions
 */
router.post('/content/:id/reactions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    
    // Validate request body
    const reactionSchema = z.object({
      reactionType: z.string().min(1).max(20)
    });
    
    const validation = reactionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reaction data',
        errors: validation.error.flatten()
      });
    }
    
    // Check if content exists
    const content = await socialService.getContentById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    // Add reaction
    await socialService.addReaction(contentId, req.user!.id, validation.data.reactionType);
    
    res.status(201).json({
      success: true,
      message: 'Reaction added successfully'
    });
    
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ success: false, message: 'Failed to add reaction' });
  }
});

/**
 * Remove reaction from content
 * DELETE /api/social/content/:id/reactions/:type
 */
router.delete('/content/:id/reactions/:type', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    const reactionType = req.params.type;
    
    if (isNaN(contentId)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    
    // Remove reaction
    await socialService.removeReaction(contentId, getUserId(req), reactionType);
    
    res.json({
      success: true,
      message: 'Reaction removed successfully'
    });
    
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ success: false, message: 'Failed to remove reaction' });
  }
});

/**
 * Get reactions for content
 * GET /api/social/content/:id/reactions
 */
router.get('/content/:id/reactions', async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    
    const reactions = await socialService.getContentReactions(contentId);
    
    res.json({
      success: true,
      data: reactions
    });
    
  } catch (error) {
    console.error('Error getting reactions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Check if user has reacted to content
 * GET /api/social/content/:id/reactions/:type/check
 */
router.get('/content/:id/reactions/:type/check', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    const reactionType = req.params.type;
    
    if (isNaN(contentId)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    
    const hasReacted = await socialService.hasUserReacted(contentId, getUserId(req), reactionType);
    
    res.json({
      success: true,
      data: { hasReacted }
    });
    
  } catch (error) {
    console.error('Error checking reaction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Comments API routes
// ------------------

/**
 * Add comment to content
 * POST /api/social/content/:id/comments
 */
router.post('/content/:id/comments', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    
    // Validate request body
    const commentSchema = z.object({
      text: z.string().min(1).max(1000),
      parentCommentId: z.number().optional()
    });
    
    const validation = commentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid comment data',
        errors: validation.error.flatten()
      });
    }
    
    // Check if content exists
    const content = await socialService.getContentById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    // Add comment
    const comment = await socialService.addComment(
      contentId, 
      getUserId(req), 
      validation.data.text,
      validation.data.parentCommentId
    );
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
    
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

/**
 * Get comments for content
 * GET /api/social/content/:id/comments
 */
router.get('/content/:id/comments', async (req: Request, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    if (isNaN(contentId)) {
      return res.status(400).json({ success: false, message: 'Invalid content ID' });
    }
    
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const comments = await socialService.getContentComments(contentId, limit, offset);
    
    res.json({
      success: true,
      data: comments
    });
    
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Get replies to a comment
 * GET /api/social/comments/:id/replies
 */
router.get('/comments/:id/replies', async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id);
    if (isNaN(commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }
    
    const replies = await socialService.getCommentReplies(commentId);
    
    res.json({
      success: true,
      data: replies
    });
    
  } catch (error) {
    console.error('Error getting comment replies:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Recommendations API routes
// -------------------------

/**
 * Create coaching recommendation
 * POST /api/social/recommendations
 */
router.post('/recommendations', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const recommendationSchema = z.object({
      toUserId: z.number(),
      contentType: ContentTypeEnum,
      contentId: z.number(),
      message: z.string().max(500).optional(),
      relevanceReason: z.string().max(500).optional(),
      skillsTargeted: z.array(z.string()).optional()
    });
    
    const validation = recommendationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid recommendation data',
        errors: validation.error.flatten()
      });
    }
    
    // Create recommendation
    const recommendation = await socialService.createRecommendation({
      ...validation.data,
      fromUserId: getUserId(req),
      status: 'pending',
    });
    
    res.status(201).json({
      success: true,
      message: 'Recommendation sent successfully',
      data: recommendation
    });
    
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ success: false, message: 'Failed to create recommendation' });
  }
});

/**
 * Get received recommendations
 * GET /api/social/recommendations/received
 */
router.get('/recommendations/received', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const recommendations = await socialService.getUserReceivedRecommendations(getUserId(req));
    
    res.json({
      success: true,
      data: recommendations
    });
    
  } catch (error) {
    console.error('Error getting received recommendations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Get sent recommendations
 * GET /api/social/recommendations/sent
 */
router.get('/recommendations/sent', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const recommendations = await socialService.getUserSentRecommendations(getUserId(req));
    
    res.json({
      success: true,
      data: recommendations
    });
    
  } catch (error) {
    console.error('Error getting sent recommendations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Update recommendation status
 * PATCH /api/social/recommendations/:id
 */
router.patch('/recommendations/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const recommendationId = parseInt(req.params.id);
    if (isNaN(recommendationId)) {
      return res.status(400).json({ success: false, message: 'Invalid recommendation ID' });
    }
    
    // Validate request body
    const updateSchema = z.object({
      status: z.enum(['accepted', 'declined', 'completed']),
      feedbackRating: z.number().min(1).max(5).optional(),
      feedbackComment: z.string().max(500).optional()
    });
    
    const validation = updateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid update data',
        errors: validation.error.flatten()
      });
    }
    
    // Update recommendation
    const updated = await socialService.updateRecommendationStatus(
      recommendationId,
      validation.data.status,
      validation.data.feedbackRating,
      validation.data.feedbackComment
    );
    
    res.json({
      success: true,
      message: 'Recommendation updated successfully',
      data: updated
    });
    
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ success: false, message: 'Failed to update recommendation' });
  }
});

// User feed API routes
// -------------------

/**
 * Get social feed for user
 * GET /api/social/feed
 */
router.get('/feed', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const feed = await socialService.getUserFeed(getUserId(req), limit, offset);
    
    res.json({
      success: true,
      data: feed
    });
    
  } catch (error) {
    console.error('Error getting user feed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// User connections API routes
// --------------------------

/**
 * Request connection with another user
 * POST /api/social/connections/request
 */
router.post('/connections/request', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const requestSchema = z.object({
      toUserId: z.number(),
      connectionType: z.enum(['friend', 'coach', 'mentor']),
      message: z.string().max(500).optional()
    });
    
    const validation = requestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data',
        errors: validation.error.flatten()
      });
    }
    
    // Create connection request
    const request = await socialService.requestConnection(
      getUserId(req),
      validation.data.toUserId,
      validation.data.connectionType,
      validation.data.message
    );
    
    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: request
    });
    
  } catch (error) {
    console.error('Error requesting connection:', error);
    
    // Special error handling for specific cases
    if (error instanceof Error && 
        (error.message === 'Connection already exists' || error.message === 'Connection request already pending')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    
    res.status(500).json({ success: false, message: 'Failed to request connection' });
  }
});

/**
 * Get pending connection requests
 * GET /api/social/connections/requests
 */
router.get('/connections/requests', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const requests = await socialService.getPendingConnectionRequests(getUserId(req));
    
    res.json({
      success: true,
      data: requests
    });
    
  } catch (error) {
    console.error('Error getting connection requests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Accept connection request
 * POST /api/social/connections/requests/:id/accept
 */
router.post('/connections/requests/:id/accept', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID' });
    }
    
    const connections = await socialService.acceptConnectionRequest(requestId);
    
    res.json({
      success: true,
      message: 'Connection request accepted',
      data: connections
    });
    
  } catch (error) {
    console.error('Error accepting connection request:', error);
    
    if (error instanceof Error && 
        error.message === 'Connection request not found or already processed') {
      return res.status(404).json({ success: false, message: error.message });
    }
    
    res.status(500).json({ success: false, message: 'Failed to accept connection request' });
  }
});

/**
 * Decline connection request
 * POST /api/social/connections/requests/:id/decline
 */
router.post('/connections/requests/:id/decline', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID' });
    }
    
    await socialService.declineConnectionRequest(requestId);
    
    res.json({
      success: true,
      message: 'Connection request declined'
    });
    
  } catch (error) {
    console.error('Error declining connection request:', error);
    res.status(500).json({ success: false, message: 'Failed to decline connection request' });
  }
});

/**
 * Get user connections
 * GET /api/social/connections
 */
router.get('/connections', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const connections = await socialService.getUserConnections(getUserId(req));
    
    res.json({
      success: true,
      data: connections
    });
    
  } catch (error) {
    console.error('Error getting user connections:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Update connection permissions
 * PATCH /api/social/connections/:id
 */
router.patch('/connections/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const connectionId = parseInt(req.params.id);
    if (isNaN(connectionId)) {
      return res.status(400).json({ success: false, message: 'Invalid connection ID' });
    }
    
    // Validate request body
    const permissionsSchema = z.object({
      sharingPermissions: z.record(z.string(), z.boolean())
    });
    
    const validation = permissionsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid permissions data',
        errors: validation.error.flatten()
      });
    }
    
    // Update connection permissions
    const updated = await socialService.updateConnectionPermissions(
      connectionId,
      validation.data.sharingPermissions
    );
    
    res.json({
      success: true,
      message: 'Connection permissions updated',
      data: updated
    });
    
  } catch (error) {
    console.error('Error updating connection permissions:', error);
    res.status(500).json({ success: false, message: 'Failed to update connection permissions' });
  }
});

/**
 * Remove connection with user
 * DELETE /api/social/connections/:userId
 */
router.delete('/connections/:userId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const connectedUserId = parseInt(req.params.userId);
    if (isNaN(connectedUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    await socialService.removeConnection(getUserId(req), connectedUserId);
    
    res.json({
      success: true,
      message: 'Connection removed successfully'
    });
    
  } catch (error) {
    console.error('Error removing connection:', error);
    res.status(500).json({ success: false, message: 'Failed to remove connection' });
  }
});

export default router;