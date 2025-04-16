/**
 * PKL-278651-COMM-0006-HUB
 * Community Module Routes
 * 
 * This file defines the API routes for community-related functionality.
 */
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { PgStorage } from '../storage';
import { 
  insertCommunitySchema, 
  insertCommunityMemberSchema, 
  insertCommunityPostSchema,
  insertCommunityEventSchema,
  insertCommunityPostCommentSchema
} from '../../shared/schema/community';
import { isAuthenticated } from '../middleware/auth';

// Create slugify helper function
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/[^\w\-]+/g, '')  // Remove all non-word chars
    .replace(/\-\-+/g, '-')    // Replace multiple - with single -
    .trim();                    // Trim - from start and end
}

// Initialize router
const router = express.Router();

/**
 * GET /api/communities
 * List all communities with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    
    // Parse query parameters
    const location = req.query.location as string | undefined;
    const skillLevel = req.query.skillLevel as string | undefined;
    const tags = req.query.tags as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = parseInt(req.query.limit as string || '20');
    const offset = parseInt(req.query.offset as string || '0');
    
    // Get communities from storage with filters
    const communities = await storage.getCommunities({
      location,
      skillLevel,
      tags: tags ? tags.split(',') : undefined,
      search,
      limit,
      offset
    });
    
    res.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ message: 'Failed to fetch communities' });
  }
});

/**
 * GET /api/communities/:id
 * Get a single community by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    const community = await storage.getCommunityById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ message: 'Failed to fetch community' });
  }
});

/**
 * POST /api/communities
 * Create a new community
 */
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    
    // Validate request body
    const validatedData = insertCommunitySchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: 'Invalid community data', 
        errors: validatedData.error.format() 
      });
    }
    
    // Add current user as creator
    const userId = req.session.userId!;
    const communityData = {
      ...validatedData.data,
      createdByUserId: userId,
      // Generate slug if not provided
      slug: validatedData.data.slug || slugify(validatedData.data.name)
    };
    
    // Create community in storage
    const newCommunity = await storage.createCommunity(communityData);
    
    // Also add the creator as an admin member
    await storage.createCommunityMember({
      communityId: newCommunity.id,
      userId,
      role: 'admin',
      isActive: true
    });
    
    res.status(201).json(newCommunity);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ message: 'Failed to create community' });
  }
});

/**
 * PATCH /api/communities/:id
 * Update an existing community
 */
router.patch('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const communityId = parseInt(req.params.id);
    const userId = req.session.userId!;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Check if community exists
    const community = await storage.getCommunityById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is an admin of the community
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'Only community admins can update community details' });
    }
    
    // Update community in storage
    const updatedCommunity = await storage.updateCommunity(communityId, req.body);
    
    res.json(updatedCommunity);
  } catch (error) {
    console.error('Error updating community:', error);
    res.status(500).json({ message: 'Failed to update community' });
  }
});

/**
 * POST /api/communities/:id/join
 * Join a community
 */
router.post('/:id/join', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const communityId = parseInt(req.params.id);
    const userId = req.session.userId!;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Check if community exists
    const community = await storage.getCommunityById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is already a member
    const existingMembership = await storage.getCommunityMembership(communityId, userId);
    
    if (existingMembership) {
      return res.status(400).json({ message: 'You are already a member of this community' });
    }
    
    // If community is private, create a join request instead of direct membership
    if (community.isPrivate) {
      const joinRequest = await storage.createCommunityJoinRequest({
        communityId,
        userId,
        message: req.body.message || 'I would like to join this community.'
      });
      
      return res.status(201).json({ 
        message: 'Join request submitted. An admin will review your request.',
        joinRequest
      });
    }
    
    // Create community membership
    const membership = await storage.createCommunityMember({
      communityId,
      userId,
      role: 'member',
      isActive: true
    });
    
    // Update member count
    await storage.incrementCommunityMemberCount(communityId);
    
    res.status(201).json({ message: 'Successfully joined community', membership });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ message: 'Failed to join community' });
  }
});

/**
 * POST /api/communities/:id/leave
 * Leave a community
 */
router.post('/:id/leave', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const communityId = parseInt(req.params.id);
    const userId = req.session.userId!;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Check if user is a member
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    if (!membership) {
      return res.status(400).json({ message: 'You are not a member of this community' });
    }
    
    // Check if user is the last admin
    if (membership.role === 'admin') {
      const adminCount = await storage.getCommunityAdminCount(communityId);
      
      if (adminCount === 1) {
        return res.status(400).json({ 
          message: 'You are the last admin of this community. Please promote another member to admin before leaving.' 
        });
      }
    }
    
    // Remove membership
    await storage.deleteCommunityMembership(communityId, userId);
    
    // Update member count
    await storage.decrementCommunityMemberCount(communityId);
    
    res.json({ message: 'Successfully left community' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ message: 'Failed to leave community' });
  }
});

/**
 * GET /api/communities/:id/members
 * Get community members
 */
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get community members
    const members = await storage.getCommunityMembers(communityId);
    
    res.json(members);
  } catch (error) {
    console.error('Error fetching community members:', error);
    res.status(500).json({ message: 'Failed to fetch community members' });
  }
});

/**
 * POST /api/communities/:id/posts
 * Create a new post in a community
 */
router.post('/:id/posts', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const communityId = parseInt(req.params.id);
    const userId = req.session.userId!;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Check if user is a member
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    if (!membership) {
      return res.status(403).json({ message: 'Only community members can create posts' });
    }
    
    // Validate request body
    const validatedData = insertCommunityPostSchema.safeParse({
      ...req.body,
      communityId,
      userId
    });
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: 'Invalid post data', 
        errors: validatedData.error.format() 
      });
    }
    
    // Create post
    const post = await storage.createCommunityPost(validatedData.data);
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

/**
 * GET /api/communities/:id/posts
 * Get posts for a community
 */
router.get('/:id/posts', async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Parse query parameters
    const limit = parseInt(req.query.limit as string || '20');
    const offset = parseInt(req.query.offset as string || '0');
    
    // Get posts
    const posts = await storage.getCommunityPosts(communityId, { limit, offset });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

/**
 * GET /api/communities/:id/events
 * Get events for a community
 */
router.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const communityId = parseInt(req.params.id);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Parse query parameters
    const limit = parseInt(req.query.limit as string || '20');
    const offset = parseInt(req.query.offset as string || '0');
    
    // Get events
    const events = await storage.getCommunityEvents(communityId, { limit, offset });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching community events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

/**
 * POST /api/communities/:id/events
 * Create a new event in a community
 */
router.post('/:id/events', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const communityId = parseInt(req.params.id);
    const userId = req.session.userId!;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Check if user is a member
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    if (!membership) {
      return res.status(403).json({ message: 'Only community members can create events' });
    }
    
    // Check if user has permission to create events
    if (membership.role !== 'admin' && membership.role !== 'moderator') {
      return res.status(403).json({ message: 'Only community admins and moderators can create events' });
    }
    
    // Validate request body
    const validatedData = insertCommunityEventSchema.safeParse({
      ...req.body,
      communityId,
      createdByUserId: userId
    });
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: 'Invalid event data', 
        errors: validatedData.error.format() 
      });
    }
    
    // Create event
    const event = await storage.createCommunityEvent(validatedData.data);
    
    // Update event count
    await storage.incrementCommunityEventCount(communityId);
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating community event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

/**
 * POST /api/communities/events/:eventId/attend
 * Register attendance for an event
 */
router.post('/events/:eventId/attend', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const eventId = parseInt(req.params.eventId);
    const userId = req.session.userId!;
    
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    // Check if event exists
    const event = await storage.getCommunityEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if event has reached max attendees
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event has reached maximum capacity' });
    }
    
    // Check if user is already registered
    const existingAttendance = await storage.getEventAttendance(eventId, userId);
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    
    // Register attendance
    const attendance = await storage.createEventAttendance({
      eventId,
      userId,
      status: 'registered'
    });
    
    // Update attendee count
    await storage.incrementEventAttendeeCount(eventId);
    
    res.status(201).json({ message: 'Successfully registered for event', attendance });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Failed to register for event' });
  }
});

/**
 * POST /api/communities/posts/:postId/comments
 * Add a comment to a post
 */
router.post('/posts/:postId/comments', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const postId = parseInt(req.params.postId);
    const userId = req.session.userId!;
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Check if post exists
    const post = await storage.getCommunityPostById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is a member of the community
    const membership = await storage.getCommunityMembership(post.communityId, userId);
    
    if (!membership) {
      return res.status(403).json({ message: 'Only community members can comment on posts' });
    }
    
    // Validate request body
    const validatedData = insertCommunityPostCommentSchema.safeParse({
      ...req.body,
      postId,
      userId
    });
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: 'Invalid comment data', 
        errors: validatedData.error.format() 
      });
    }
    
    // Create comment
    const comment = await storage.createCommunityPostComment(validatedData.data);
    
    // Update comment count
    await storage.incrementPostCommentCount(postId);
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

/**
 * POST /api/communities/posts/:postId/like
 * Like or unlike a post
 */
router.post('/posts/:postId/like', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const storage = req.app.locals.storage as PgStorage;
    const postId = parseInt(req.params.postId);
    const userId = req.session.userId!;
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Check if post exists
    const post = await storage.getCommunityPostById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user has already liked the post
    const existingLike = await storage.getPostLike(postId, userId);
    
    if (existingLike) {
      // Unlike the post
      await storage.deletePostLike(postId, userId);
      await storage.decrementPostLikeCount(postId);
      
      return res.json({ liked: false, message: 'Post unliked' });
    }
    
    // Like the post
    await storage.createPostLike({ postId, userId });
    await storage.incrementPostLikeCount(postId);
    
    res.json({ liked: true, message: 'Post liked' });
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ message: 'Failed to like/unlike post' });
  }
});

export default router;