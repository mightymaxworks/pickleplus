/**
 * PKL-278651-COMM-0006-HUB-API
 * Community Hub API Routes
 * 
 * This file implements the API routes for community features.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { storage } from '../../storage';
import { isAuthenticated } from '../../auth';

// Custom middleware for community module that allows public GET requests
const communityAuth = (req: Request, res: Response, next: NextFunction) => {
  // Allow all GET requests to proceed without authentication
  if (req.method === 'GET') {
    return next();
  }
  
  // For all other methods (POST, PUT, DELETE, etc.), require authentication
  return isAuthenticated(req, res, next);
};
import {
  communities,
  communityMembers,
  communityPosts,
  communityEvents,
  communityEventAttendees,
  communityPostComments,
  communityPostLikes
} from '../../../shared/schema/community';

// Create a router
const router = Router();

// Create validation schemas using drizzle-zod
const insertCommunitySchema = createInsertSchema(communities, {
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  location: z.string().optional(),
  skillLevel: z.string().optional(),
  tags: z.string().optional(),
  isPrivate: z.boolean().optional().default(false),
  requiresApproval: z.boolean().optional().default(false),
}).omit({ id: true, createdAt: true, updatedAt: true, memberCount: true, postCount: true, eventCount: true });

const insertCommunityPostSchema = createInsertSchema(communityPosts, {
  content: z.string().min(1).max(5000)
}).omit({ id: true, createdAt: true, updatedAt: true, likes: true, comments: true });

const insertCommunityEventSchema = createInsertSchema(communityEvents, {
  title: z.string().min(3).max(255),
  eventDate: z.coerce.date(),
}).omit({ id: true, createdAt: true, updatedAt: true, currentAttendees: true });

const insertCommentSchema = createInsertSchema(communityPostComments, {
  content: z.string().min(1).max(1000),
}).omit({ id: true, createdAt: true, updatedAt: true, likes: true });

/**
 * Get all communities with optional filtering
 * GET /api/communities
 * Public route - no authentication required
 */
router.get('/', communityAuth, async (req: Request, res: Response) => {
  try {
    const { location, skillLevel, tags, search, limit, offset } = req.query;
    
    const filters: any = {};
    
    if (location) filters.location = String(location);
    if (skillLevel) filters.skillLevel = String(skillLevel);
    if (tags) {
      const tagsArray = Array.isArray(tags) 
        ? tags.map(tag => String(tag)) 
        : String(tags).split(',');
      filters.tags = tagsArray;
    }
    if (search) filters.search = String(search);
    if (limit) filters.limit = parseInt(String(limit));
    if (offset) filters.offset = parseInt(String(offset));
    
    const communities = await storage.getCommunities(filters);
    
    res.json(communities);
  } catch (error) {
    console.error('Error getting communities:', error);
    res.status(500).json({ message: 'Failed to fetch communities' });
  }
});

/**
 * Get IDs of communities the current user is a member of
 * GET /api/communities/my-community-ids
 * 
 * IMPORTANT: This route must come BEFORE the /:id route to avoid conflicts!
 */
router.get('/my-community-ids', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log(`[Community API] Getting memberships for user ${userId}`);
    
    // Validate the userId is a number
    const userIdNum = Number(userId);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get all communities where user is a member
    const memberships = await storage.getCommunityMembershipsByUserId(userIdNum);
    
    // Get all communities created by this user
    const createdCommunities = await storage.getCommunitiesByCreator(userIdNum);
    
    console.log(`[Community API] Retrieved memberships for user ${userIdNum}:`, JSON.stringify(memberships));
    console.log(`[Community API] Retrieved created communities for user ${userIdNum}:`, JSON.stringify(createdCommunities));
    
    // Combine both memberships and communities created by the user
    let communityIds = Array.isArray(memberships) 
      ? memberships.map(membership => membership.communityId)
      : [];
    
    // Add IDs of communities created by the user (if not already in the list)
    if (Array.isArray(createdCommunities)) {
      const createdCommunityIds = createdCommunities.map(community => community.id);
      // Add only unique community IDs
      for (const id of createdCommunityIds) {
        if (!communityIds.includes(id)) {
          communityIds.push(id);
        }
      }
    }
    
    return res.status(200).json(communityIds);
  } catch (error) {
    console.error('Error getting user community IDs:', error);
    return res.status(500).json({ message: 'Failed to fetch user community IDs' });
  }
});

/**
 * Get a single community by ID
 * GET /api/communities/:id
 */
router.get('/:id', communityAuth, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    const community = await storage.getCommunityById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Get current user ID if authenticated
    const userId = req.user?.id || null;
    
    // If user is authenticated, determine if they are the creator of this community
    const isCreator = userId !== null && community.createdByUserId === userId;
    
    // Add a flag to indicate if the current user is the creator
    const responseData = {
      ...community,
      isCreator
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error getting community:', error);
    res.status(500).json({ message: 'Failed to fetch community' });
  }
});

/**
 * Create a new community
 * POST /api/communities
 */
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Validate request body
    const validationResult = insertCommunitySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid community data',
        errors: validationResult.error.errors 
      });
    }
    
    // Add createdByUserId to the community data
    const communityData = {
      ...validationResult.data,
      createdByUserId: userId
    };
    
    // Create the community
    const newCommunity = await storage.createCommunity(communityData);
    
    // Also add the creator as an admin member
    await storage.createCommunityMember({
      communityId: newCommunity.id,
      userId,
      role: 'admin'
    });
    
    res.status(201).json(newCommunity);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ message: 'Failed to create community' });
  }
});

/**
 * Update a community
 * PATCH /api/communities/:id
 */
router.patch('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is an admin of the community
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'You must be an admin to update this community' });
    }
    
    // Validate the update data
    const validationResult = insertCommunitySchema.partial().safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid community update data',
        errors: validationResult.error.errors 
      });
    }
    
    // Update the community
    const updatedCommunity = await storage.updateCommunity(communityId, validationResult.data);
    
    if (!updatedCommunity) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(updatedCommunity);
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({ message: 'Failed to update community' });
  }
});

/**
 * Get community members
 * GET /api/communities/:id/members
 */
router.get('/:id/members', communityAuth, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    const members = await storage.getCommunityMembers(communityId);
    
    res.json(members);
  } catch (error) {
    console.error('Error getting community members:', error);
    res.status(500).json({ message: 'Failed to fetch community members' });
  }
});

/**
 * Join a community
 * POST /api/communities/:id/join
 */
router.post('/:id/join', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is already a member
    const existingMembership = await storage.getCommunityMembership(communityId, userId);
    
    if (existingMembership) {
      return res.status(400).json({ message: 'You are already a member of this community' });
    }
    
    // Get community to check if it requires approval
    const community = await storage.getCommunityById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // If community requires approval, create a join request
    if (community.requiresApproval) {
      const message = req.body.message || '';
      
      await storage.createCommunityJoinRequest({
        communityId,
        userId,
        message
      });
      
      return res.status(201).json({ 
        message: 'Join request submitted. An admin will review your request.'
      });
    }
    
    // Otherwise, directly add the user as a member
    const membership = await storage.createCommunityMember({
      communityId,
      userId,
      role: 'member'
    });
    
    res.status(201).json(membership);
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ message: 'Failed to join community' });
  }
});

/**
 * Leave a community
 * POST /api/communities/:id/leave
 */
router.post('/:id/leave', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is a member
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    if (!membership) {
      return res.status(400).json({ message: 'You are not a member of this community' });
    }
    
    // Check if user is the only admin
    if (membership.role === 'admin') {
      const adminCount = await storage.getCommunityAdminCount(communityId);
      
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'You cannot leave as you are the only admin. Transfer admin role to another member first.'
        });
      }
    }
    
    // Remove membership
    const result = await storage.deleteCommunityMembership(communityId, userId);
    
    if (!result) {
      return res.status(404).json({ message: 'Community membership not found' });
    }
    
    res.json({ message: 'You have left the community' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ message: 'Failed to leave community' });
  }
});

/**
 * Get community posts
 * GET /api/communities/:id/posts
 */
router.get('/:id/posts', communityAuth, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get limit and offset from query parameters
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : undefined;
    const offset = req.query.offset ? parseInt(String(req.query.offset)) : undefined;
    
    const posts = await storage.getCommunityPosts(communityId, { limit, offset });
    
    res.json(posts);
  } catch (error) {
    console.error('Error getting community posts:', error);
    res.status(500).json({ message: 'Failed to fetch community posts' });
  }
});

/**
 * Create a post in a community
 * POST /api/communities/:id/posts
 */
router.post('/:id/posts', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is a member
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    if (!membership) {
      return res.status(403).json({ message: 'You must be a member to post in this community' });
    }
    
    // Validate post data
    const validationResult = insertCommunityPostSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid post data',
        errors: validationResult.error.errors 
      });
    }
    
    // Create the post
    const postData = {
      ...validationResult.data,
      communityId,
      userId
    };
    
    const newPost = await storage.createCommunityPost(postData);
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

/**
 * Get a single post
 * GET /api/communities/posts/:postId
 */
router.get('/posts/:postId', communityAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    const post = await storage.getCommunityPostById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

/**
 * Like a post
 * POST /api/communities/posts/:postId/like
 */
router.post('/posts/:postId/like', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user?.id;
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if already liked
    const existingLike = await storage.getPostLike(postId, userId);
    
    if (existingLike) {
      return res.status(400).json({ message: 'You already liked this post' });
    }
    
    // Create the like
    const like = await storage.createPostLike({ postId, userId });
    
    res.status(201).json(like);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
});

/**
 * Unlike a post
 * DELETE /api/communities/posts/:postId/like
 */
router.delete('/posts/:postId/like', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user?.id;
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Remove the like
    const result = await storage.deletePostLike(postId, userId);
    
    if (!result) {
      return res.status(404).json({ message: 'You have not liked this post' });
    }
    
    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Failed to unlike post' });
  }
});

/**
 * Get post comments
 * GET /api/communities/posts/:postId/comments
 */
router.get('/posts/:postId/comments', communityAuth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    const comments = await storage.getPostComments(postId);
    
    res.json(comments);
  } catch (error) {
    console.error('Error getting post comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

/**
 * Add a comment to a post
 * POST /api/communities/posts/:postId/comments
 */
router.post('/posts/:postId/comments', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    const userId = req.user?.id;
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Validate comment data
    const validationResult = insertCommentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid comment data',
        errors: validationResult.error.errors 
      });
    }
    
    // Add comment
    const commentData = {
      ...validationResult.data,
      postId,
      userId
    };
    
    const comment = await storage.createCommunityPostComment(commentData);
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

/**
 * Get community events
 * GET /api/communities/:id/events
 */
router.get('/:id/events', communityAuth, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get limit and offset from query parameters
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : undefined;
    const offset = req.query.offset ? parseInt(String(req.query.offset)) : undefined;
    
    const events = await storage.getCommunityEvents(communityId, { limit, offset });
    
    res.json(events);
  } catch (error) {
    console.error('Error getting community events:', error);
    res.status(500).json({ message: 'Failed to fetch community events' });
  }
});

/**
 * Create a community event
 * POST /api/communities/:id/events
 */
router.post('/:id/events', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is a member
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    if (!membership) {
      return res.status(403).json({ message: 'You must be a member to create events in this community' });
    }
    
    // Validate event data
    const validationResult = insertCommunityEventSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid event data',
        errors: validationResult.error.errors 
      });
    }
    
    // Create the event
    const eventData = {
      ...validationResult.data,
      communityId,
      createdByUserId: userId
    };
    
    const newEvent = await storage.createCommunityEvent(eventData);
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating community event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

/**
 * Register for an event
 * POST /api/communities/events/:eventId/register
 */
router.post('/events/:eventId/register', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const userId = req.user?.id;
    
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if already registered
    const existingAttendance = await storage.getEventAttendance(eventId, userId);
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    
    // Get event to check if it's at capacity
    const event = await storage.getCommunityEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'This event has reached maximum capacity' });
    }
    
    // Register for the event
    const attendance = await storage.createEventAttendance({
      eventId,
      userId,
      status: 'registered',
      notes: req.body.notes
    });
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Failed to register for event' });
  }
});

/**
 * Cancel event registration
 * DELETE /api/communities/events/:eventId/register
 */
router.delete('/events/:eventId/register', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const userId = req.user?.id;
    
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Cancel registration
    const result = await storage.cancelEventAttendance(eventId, userId);
    
    if (!result) {
      return res.status(404).json({ message: 'You are not registered for this event' });
    }
    
    res.json({ message: 'Event registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling event registration:', error);
    res.status(500).json({ message: 'Failed to cancel event registration' });
  }
});

/**
 * Get pending join requests (admin only)
 * GET /api/communities/:id/join-requests
 */
router.get('/:id/join-requests', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user is an admin
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'Only community admins can view join requests' });
    }
    
    const joinRequests = await storage.getCommunityJoinRequests(communityId);
    
    res.json(joinRequests);
  } catch (error) {
    console.error('Error getting join requests:', error);
    res.status(500).json({ message: 'Failed to fetch join requests' });
  }
});

/**
 * Approve or reject a join request (admin only)
 * PATCH /api/communities/join-requests/:requestId
 */
router.patch('/join-requests/:requestId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const userId = req.user?.id;
    const { status } = req.body;
    
    if (isNaN(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return res.status(400).json({ message: 'Status must be either "approved" or "rejected"' });
    }
    
    // Update join request status
    const updatedRequest = await storage.updateJoinRequestStatus(requestId, status, userId);
    
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }
    
    // If approved, add the user as a community member
    if (status === 'approved') {
      await storage.createCommunityMember({
        communityId: updatedRequest.communityId,
        userId: updatedRequest.userId,
        role: 'member'
      });
    }
    
    res.json({ message: `Join request ${status}`, request: updatedRequest });
  } catch (error) {
    console.error('Error updating join request:', error);
    res.status(500).json({ message: 'Failed to update join request' });
  }
});

/**
 * Get IDs of communities the current user is a member of
 * GET /api/communities/my-community-ids
 */
router.get('/my-community-ids', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log(`[Community API] Getting memberships for user ${userId}`);
    
    // Validate the userId is a number
    const userIdNum = Number(userId);
    if (isNaN(userIdNum) || userIdNum <= 0) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get all communities where user is a member
    const memberships = await storage.getCommunityMembershipsByUserId(userIdNum);
    
    // Get all communities created by this user
    const createdCommunities = await storage.getCommunitiesByCreator(userIdNum);
    
    console.log(`[Community API] Retrieved memberships for user ${userIdNum}:`, JSON.stringify(memberships));
    console.log(`[Community API] Retrieved created communities for user ${userIdNum}:`, JSON.stringify(createdCommunities));
    
    // Combine both memberships and communities created by the user
    let communityIds = Array.isArray(memberships) 
      ? memberships.map(membership => membership.communityId)
      : [];
    
    // Add IDs of communities created by the user (if not already in the list)
    if (Array.isArray(createdCommunities)) {
      const createdCommunityIds = createdCommunities.map(community => community.id);
      // Add only unique community IDs
      for (const id of createdCommunityIds) {
        if (!communityIds.includes(id)) {
          communityIds.push(id);
        }
      }
    }
    
    return res.status(200).json(communityIds);
  } catch (error) {
    console.error('Error getting user community IDs:', error);
    return res.status(500).json({ message: 'Failed to fetch user community IDs' });
  }
});

// Export the router
export function registerCommunityRoutes(app: any) {
  console.log('[API] Registering community hub routes (PKL-278651-COMM-0006-HUB-API)');
  app.use('/api/communities', router);
}