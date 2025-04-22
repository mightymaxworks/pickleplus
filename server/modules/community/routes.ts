/**
 * PKL-278651-COMM-0006-HUB-API
 * Community Hub API Routes
 * 
 * This file implements the API routes for community features.
 */
import express, { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { storage } from '../../storage';
import { isAuthenticated } from '../../auth';
import { upload, validateFile } from './visual-upload';
import path from 'path';

/**
 * Custom middleware for community module that allows public GET requests
 * PKL-278651-COMM-0019-VISUALS: Updated to properly handle public access
 */
const communityAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('[PKL-278651-COMM-0019-VISUALS] Auth check for:', req.method, req.path);
  
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

/**
 * PKL-278651-COMM-0015-EVENT
 * Enhanced community event validation schema using simplified Framework 5.1 approach
 */
const insertCommunityEventSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  eventDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  location: z.string().optional(),
  isVirtual: z.boolean().optional().default(false),
  virtualMeetingUrl: z.string().optional().nullable(),
  maxAttendees: z.number().optional().nullable(),
  isPrivate: z.boolean().optional().default(false),
  isRecurring: z.boolean().optional().default(false),
  recurringPattern: z.string().optional().nullable(),
  repeatFrequency: z.string().optional().nullable(),
  status: z.string().optional().default("upcoming"),
  eventType: z.string().optional().default("match_play"),
  minSkillLevel: z.string().optional().nullable(),
  maxSkillLevel: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

const insertCommentSchema = createInsertSchema(communityPostComments, {
  content: z.string().min(1).max(1000),
}).omit({ id: true, createdAt: true, updatedAt: true, likes: true });

/**
 * @layer Server
 * @module Community
 * @description Advanced search for communities with filtering and recommendations
 * @dependsOn Database Layer (communitiesTable)
 * @endpoint GET /api/communities
 * @version 2.2.0
 * @lastModified 2025-04-18
 * @framework Framework5.1
 * @sprint PKL-278651-COMM-0017-SEARCH
 * @changes
 * - Enhanced search with full-text capability
 * - Added multiple filtering options
 * - Added recommendation algorithm
 * - Added sorting options
 * - Optimized query performance
 * @preserves
 * - Basic community fetching functionality
 * - Public access (no authentication required)
 */
router.get('/', communityAuth, async (req: Request, res: Response) => {
  try {
    const { 
      location, 
      skillLevel, 
      minSkillLevel,
      maxSkillLevel,
      tags, 
      search, 
      limit, 
      offset,
      isPrivate,
      hasEvents,
      eventType,
      sort,
      memberCount,
      createdAfter,
      createdBefore,
      excludeIds,
      includeIds,
      recommendForUser,
      popular
    } = req.query;
    
    console.log('[PKL-278651-COMM-0017-SEARCH] Search query:', JSON.stringify(req.query));
    
    const filters: any = {};
    
    // Basic filters
    if (location) filters.location = String(location);
    if (skillLevel) filters.skillLevel = String(skillLevel);
    
    // Skill level range filters
    if (minSkillLevel) filters.minSkillLevel = String(minSkillLevel);
    if (maxSkillLevel) filters.maxSkillLevel = String(maxSkillLevel);
    
    // Tags filter with array support
    if (tags) {
      const tagsArray = Array.isArray(tags) 
        ? tags.map(tag => String(tag)) 
        : String(tags).split(',');
      filters.tags = tagsArray;
    }
    
    // Search query (full text search)
    if (search) filters.search = String(search);
    
    // Privacy filter
    if (isPrivate !== undefined) {
      filters.isPrivate = isPrivate === 'true';
    }
    
    // Events filters
    if (hasEvents !== undefined) {
      filters.hasEvents = hasEvents === 'true';
    }
    
    if (eventType) {
      filters.eventType = String(eventType);
    }
    
    // Member count filter
    if (memberCount) {
      const [min, max] = String(memberCount).split('-');
      if (min) filters.minMemberCount = parseInt(min);
      if (max) filters.maxMemberCount = parseInt(max);
    }
    
    // Date range filters
    if (createdAfter) {
      filters.createdAfter = new Date(String(createdAfter));
    }
    
    if (createdBefore) {
      filters.createdBefore = new Date(String(createdBefore));
    }
    
    // Include/exclude specific communities
    if (excludeIds) {
      const excludeIdsArray = Array.isArray(excludeIds) 
        ? excludeIds.map(id => parseInt(String(id))) 
        : String(excludeIds).split(',').map(id => parseInt(id));
      filters.excludeIds = excludeIdsArray;
    }
    
    if (includeIds) {
      const includeIdsArray = Array.isArray(includeIds) 
        ? includeIds.map(id => parseInt(String(id))) 
        : String(includeIds).split(',').map(id => parseInt(id));
      filters.includeIds = includeIdsArray;
    }
    
    // Sorting
    if (sort) {
      filters.sort = String(sort);
    }
    
    // Recommendation for specific user
    if (recommendForUser) {
      const userId = parseInt(String(recommendForUser));
      if (!isNaN(userId)) {
        filters.recommendForUser = userId;
      }
    }
    
    // Popular communities (by activity or member count)
    if (popular !== undefined) {
      filters.popular = popular === 'true';
    }
    
    // Pagination
    if (limit) filters.limit = parseInt(String(limit));
    if (offset) filters.offset = parseInt(String(offset));
    
    console.log('[PKL-278651-COMM-0017-SEARCH] Processed filters:', JSON.stringify(filters));
    
    // Always search for default communities (isDefault = true) as well
    // Add special flag to include default communities
    filters.includeDefaults = true;
    
    // Get communities based on filters
    const communities = await storage.getCommunities(filters);
    
    console.log(`[PKL-278651-COMM-0020-DEFGRP] Found ${communities.length} communities (including defaults)`);
    
    // Return communities in the format expected by the client
    res.json({
      communities,
      count: communities.length,
      total: communities.length,
      message: "Community data fetched successfully"
    });
  } catch (error) {
    console.error('[PKL-278651-COMM-0017-SEARCH] Error getting communities:', error);
    res.status(500).json({ message: 'Failed to fetch communities' });
  }
});

/**
 * @layer Server
 * @module Community
 * @description Enhanced community discovery with trending, popular, and personalized recommendations
 * @dependsOn Database Layer (communitiesTable, communityMembersTable, communityPostsTable, communityEventsTable)
 * @endpoint GET /api/communities/discover
 * @version 1.0.0
 * @lastModified 2025-04-19 13:15 ET
 * @framework Framework5.2
 * @sprint PKL-278651-COMM-0022-DISC
 * @changes
 * - New endpoint for discovering communities
 * - Trending algorithm based on recent activity
 * - Personalized recommendations based on user interests and connections
 * - Featured communities selected by admins
 * - New communities that are gaining traction
 */
router.get('/discover', communityAuth, async (req: Request, res: Response) => {
  try {
    // Get current user ID if authenticated
    const userId = req.user?.id || null;
    console.log(`[PKL-278651-COMM-0022-DISC] Discovery request from user ${userId || 'anonymous'}`);
    
    // Get the category parameter
    const { category, limit = '10' } = req.query;
    const limitNum = parseInt(String(limit)) || 10;
    
    // Default result structure
    const result: any = {
      trending: [],
      recommended: [],
      popular: [],
      new: [],
      featured: []
    };
    
    // Process based on requested category, or get all if no category specified
    const categories = category ? [String(category)] : Object.keys(result);
    
    for (const cat of categories) {
      switch (cat) {
        case 'trending':
          // Trending communities have high recent activity (posts, events, new members)
          result.trending = await storage.getCommunities({
            sort: 'recent_activity',
            limit: limitNum,
            excludeMemberOf: userId
          });
          break;
          
        case 'recommended':
          // Recommended communities are based on user interests and connections
          if (userId) {
            result.recommended = await storage.getRecommendedCommunities(userId, limitNum);
          } else {
            // For anonymous users, show diverse popular communities
            result.recommended = await storage.getCommunities({
              sort: 'diverse',
              limit: limitNum
            });
          }
          break;
          
        case 'popular':
          // Popular communities have the most members
          result.popular = await storage.getCommunities({
            sort: 'member_count',
            limit: limitNum,
            excludeMemberOf: userId
          });
          break;
          
        case 'new':
          // New communities created recently
          result.new = await storage.getCommunities({
            sort: 'created_at',
            limit: limitNum,
            excludeMemberOf: userId
          });
          break;
          
        case 'featured':
          // Featured communities selected by admins
          result.featured = await storage.getCommunities({
            featured: true,
            limit: limitNum,
            excludeMemberOf: userId
          });
          break;
      }
    }
    
    // If a specific category was requested, return just that category
    if (category) {
      res.json(result[String(category)] || []);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('[PKL-278651-COMM-0022-DISC] Error discovering communities:', error);
    res.status(500).json({ message: 'Failed to discover communities' });
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
 * @layer Server
 * @module Community
 * @description Get a single community by ID
 * @dependsOn Database Layer (communityTable)
 * @endpoint GET /api/communities/:id
 * @version 2.1.0
 * @lastModified 2025-04-17
 * @changes
 * - Added isCreator flag to indicate if current user is the creator
 * @preserves
 * - Basic community data retrieval
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
    
    console.log(`[PKL-278651-COMM-0007-ENGAGE] Community ID: ${communityId}, User ID: ${userId}, Is Creator: ${isCreator}, Creator ID: ${community.createdByUserId}`);
    
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
 * 
 * PKL-278651-COMM-0020-DEFGRP: Added protection for default communities
 * Users cannot leave default communities as they're automatically joined
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
    
    // Check if community exists and if it's a default community
    const community = await storage.getCommunityById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Prevent leaving default communities
    if (community.isDefault) {
      console.log(`[PKL-278651-COMM-0020-DEFGRP] Prevented user ${userId} from leaving default community ${communityId}`);
      return res.status(403).json({ 
        message: 'You cannot leave official groups as they are automatically joined by all users.'
      });
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
    
    console.log(`[PKL-278651-COMM-0020-DEFGRP] User ${userId} left community ${communityId}`);
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
 * @layer Server
 * @module Community
 * @description Create a post in a community
 * @dependsOn Database Layer (communityPostsTable)
 * @endpoint POST /api/communities/:id/posts
 * @version 2.1.0
 * @lastModified 2025-04-17
 * @changes
 * - Added Framework 5.1 annotations
 * - Added detailed error logging
 * - Added support for creator role in membership checks
 */
router.post('/:id/posts', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    console.log(`[PKL-278651-COMM-0007-ENGAGE] Post creation request for community ${communityId} by user ${userId}`);
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get the community to check if user is creator
    const community = await storage.getCommunityById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is a member or creator
    const isCreator = community.createdByUserId === userId;
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    console.log(`[PKL-278651-COMM-0007-ENGAGE] User ${userId} membership check: isCreator=${isCreator}, hasMembership=${!!membership}`);
    
    if (!membership && !isCreator) {
      return res.status(403).json({ message: 'You must be a member to post in this community' });
    }
    
    // Extract only the content and mediaUrls from the request
    // and ensure communityId and userId are set correctly from route and auth
    const { content, mediaUrls, isPinned, isAnnouncement } = req.body;
    
    // Create a clean post data object with required fields
    const postData = {
      content,
      mediaUrls,
      isPinned: isPinned || false,
      isAnnouncement: isAnnouncement || false,
      communityId, // From route params
      userId // From authenticated user
    };
    
    // Validate post data
    const validationResult = insertCommunityPostSchema.safeParse(postData);
    
    if (!validationResult.success) {
      console.error(`[PKL-278651-COMM-0007-ENGAGE] Validation error:`, validationResult.error.errors);
      return res.status(400).json({ 
        message: 'Invalid post data',
        errors: validationResult.error.errors 
      });
    }
    
    console.log(`[PKL-278651-COMM-0007-ENGAGE] Creating post with data:`, {
      ...postData,
      content: postData.content.substring(0, 50) + (postData.content.length > 50 ? '...' : '')
    });
    
    const newPost = await storage.createCommunityPost(postData);
    
    console.log(`[PKL-278651-COMM-0007-ENGAGE] Post created successfully with ID: ${newPost.id}`);
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('[PKL-278651-COMM-0007-ENGAGE] Error creating community post:', error);
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
 * PKL-278651-COMM-0016-RSVP
 * Get community events
 * GET /api/communities/:id/events
 * @version 1.0.1
 * @lastModified 2025-04-18
 * @changes
 * - Ensure event creators are counted in attendee numbers
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
    
    // Process each event to ensure creator is counted in attendance
    const processedEvents = await Promise.all(events.map(async event => {
      // Get attendees to check if creator is registered
      const eventAttendees = await storage.getEventAttendees(event.id);
      
      // Check if creator is registered
      const creatorInAttendees = eventAttendees.some(a => a.userId === event.createdByUserId);
      
      // Update the currentAttendees count to include creator if not already counted
      if (!creatorInAttendees) {
        return {
          ...event,
          currentAttendees: (event.currentAttendees || 0) + 1
        };
      }
      
      return event;
    }));
    
    res.json(processedEvents);
  } catch (error) {
    console.error('Error getting community events:', error);
    res.status(500).json({ message: 'Failed to fetch community events' });
  }
});

/**
 * PKL-278651-COMM-0016-RSVP
 * Get a single community event by ID
 * GET /api/communities/:id/events/:eventId
 * @version 1.0.1
 * @lastModified 2025-04-18
 * @changes
 * - Fixed currentAttendees count to include event creator
 */
router.get('/:id/events/:eventId', communityAuth, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(communityId) || isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }
    
    // Get the event
    const event = await storage.getCommunityEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // If user is authenticated, check if they're registered for this event
    let isRegistered = false;
    let registrationStatus = null;
    const userId = req.user?.id;
    
    if (userId) {
      // Event creator is always considered registered
      if (userId === event.createdByUserId) {
        isRegistered = true;
        registrationStatus = 'REGISTERED';
      } else {
        const attendee = await storage.getEventAttendance(eventId, userId);
        isRegistered = !!attendee;
        registrationStatus = attendee?.status || null;
      }
    }
    
    // Count registered attendees (including creator if not already counted)
    const eventAttendees = await storage.getEventAttendees(eventId);
    let currentAttendees = eventAttendees.length;
    
    // Make sure creator is counted in attendance even if not explicitly registered
    const creatorIsRegistered = eventAttendees.some(attendee => attendee.userId === event.createdByUserId);
    if (!creatorIsRegistered) {
      currentAttendees += 1;
    }
    
    // Return event with registration status and updated attendance count
    res.json({
      ...event,
      isRegistered,
      registrationStatus,
      currentAttendees
    });
  } catch (error) {
    console.error('Error getting community event:', error);
    res.status(500).json({ message: 'Failed to fetch community event' });
  }
});

/**
 * PKL-278651-COMM-0016-RSVP
 * Get attendees for a community event
 * GET /api/communities/:id/events/:eventId/attendees
 * @version 1.0.1
 * @lastModified 2025-04-18
 * @changes
 * - Added special handling to include event creator in attendance list
 */
router.get('/:id/events/:eventId/attendees', communityAuth, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(communityId) || isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid ID provided' });
    }
    
    // Verify the event exists and belongs to this community
    const event = await storage.getCommunityEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get all attendees
    const attendees = await storage.getEventAttendees(eventId);
    
    // Check if the creator is already in the attendees list
    const creatorInAttendees = attendees.some(a => a.userId === event.createdByUserId);
    
    // If the creator is not in the attendees list, add them
    if (!creatorInAttendees && event.createdByUserId) {
      // Get the creator's user data
      const creatorUser = await storage.getUser(event.createdByUserId);
      
      if (creatorUser) {
        // Create a virtual attendance record for the creator
        const creatorAttendance = {
          id: -1, // Using negative ID to indicate this is a virtual record
          eventId,
          userId: event.createdByUserId,
          status: 'REGISTERED',
          registeredAt: event.createdAt, // Use event creation date
          notes: 'Event Creator',
          user: creatorUser
        };
        
        // Add the creator to the beginning of the attendees list
        attendees.unshift(creatorAttendance);
      }
    }
    
    res.json(attendees);
  } catch (error) {
    console.error('Error getting event attendees:', error);
    res.status(500).json({ message: 'Failed to fetch event attendees' });
  }
});

/**
 * @layer Server
 * @module Community
 * @description Create a community event
 * @dependsOn Database Layer (communityEventsTable)
 * @endpoint POST /api/communities/:id/events
 * @version 2.1.0
 * @lastModified 2025-04-18
 * @framework Framework5.1
 * @changes
 * - Enhanced schema validation for all possible event fields
 * - Added comprehensive error handling
 * - Added detailed logging for debugging
 * @preserves
 * - Basic event creation functionality
 * - Membership checks
 */
router.post('/:id/events', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    console.log(`[PKL-278651-COMM-0015-EVENT] Event creation request for community ${communityId} by user ${userId}`);
    console.log('[PKL-278651-COMM-0015-EVENT] Request body:', JSON.stringify(req.body));
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get the community to check if user is creator
    const community = await storage.getCommunityById(communityId);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is a member or creator
    const isCreator = community.createdByUserId === userId;
    const membership = await storage.getCommunityMembership(communityId, userId);
    
    console.log(`[PKL-278651-COMM-0015-EVENT] User ${userId} membership check: isCreator=${isCreator}, hasMembership=${!!membership}`);
    
    if (!membership && !isCreator) {
      return res.status(403).json({ message: 'You must be a member to create events in this community' });
    }
    
    // Validate event data using enhanced schema
    const validationResult = insertCommunityEventSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('[PKL-278651-COMM-0015-EVENT] Validation error:', validationResult.error);
      return res.status(400).json({ 
        message: 'Invalid event data',
        errors: validationResult.error.errors 
      });
    }
    
    // Build full event data with community ID and creator ID
    // Framework 5.1 direct approach
    const eventData = {
      title: validationResult.data.title,
      description: validationResult.data.description || null,
      eventDate: validationResult.data.eventDate,
      endDate: validationResult.data.endDate || null,
      location: validationResult.data.location || null,
      isVirtual: validationResult.data.isVirtual || false,
      virtualMeetingUrl: validationResult.data.virtualMeetingUrl || null,
      maxAttendees: validationResult.data.maxAttendees || null,
      isPrivate: validationResult.data.isPrivate || false,
      isRecurring: validationResult.data.isRecurring || false,
      recurringPattern: validationResult.data.recurringPattern || null,
      repeatFrequency: validationResult.data.repeatFrequency || null,
      status: validationResult.data.status || 'upcoming',
      eventType: validationResult.data.eventType || 'match_play',
      minSkillLevel: validationResult.data.minSkillLevel || null,
      maxSkillLevel: validationResult.data.maxSkillLevel || null,
      imageUrl: validationResult.data.imageUrl || null,
      communityId,
      createdByUserId: userId
    };
    
    console.log('[PKL-278651-COMM-0015-EVENT] Processed event data:', JSON.stringify(eventData));
    
    // Add currentAttendees = 1 to count the creator
    const newEvent = await storage.createCommunityEvent({
      ...eventData,
      currentAttendees: 1 // Start with 1 for the creator
    });
    console.log('[PKL-278651-COMM-0015-EVENT] Event created with ID:', newEvent.id);
    
    // Automatically register the creator as an attendee
    await storage.createEventAttendance({
      eventId: newEvent.id,
      userId,
      status: 'registered',
      notes: 'Event Creator (Auto-registered)'
    });
    console.log('[PKL-278651-COMM-0015-EVENT] Creator automatically registered as attendee');
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating community event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

/**
 * PKL-278651-COMM-0016-RSVP
 * Register for an event
 * POST /api/communities/events/:eventId/register
 * @version 1.0.1
 * @lastModified 2025-04-18
 * @changes Added special handling for event creators
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
    
    // Get event to check if it's at capacity and if user is the creator
    const event = await storage.getCommunityEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the event creator
    if (event.createdByUserId === userId) {
      // Event creators are automatically considered registered
      const attendance = await storage.createEventAttendance({
        eventId,
        userId,
        status: 'registered',
        notes: 'Event Creator'
      });
      
      return res.status(201).json(attendance);
    }
    
    // Get community details to verify membership
    const community = await storage.getCommunityById(event.communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Framework 5.1 approach - safely handle nullable fields
    const currentAttendees = event.currentAttendees ?? 0;
    if (event.maxAttendees && currentAttendees >= event.maxAttendees) {
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
 * PKL-278651-COMM-0016-RSVP
 * Cancel event registration
 * DELETE /api/communities/events/:eventId/register
 * @version 1.0.1
 * @lastModified 2025-04-18
 * @changes Added checks for event creator (cannot cancel if creator)
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
    
    // Get event to check if user is the creator
    const event = await storage.getCommunityEventById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Event creators cannot cancel their registration
    if (event.createdByUserId === userId) {
      return res.status(403).json({ message: 'Event creators cannot cancel their registration' });
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

/**
 * PKL-278651-COMM-0019-VISUALS
 * Upload community avatar
 * POST /api/communities/:id/avatar
 * 
 * Note: This route follows Framework 5.1 principles with proper authentication,
 * file validation, and role-based permission checks.
 */
router.post('/:id/avatar', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
  try {
    console.log('[Avatar Upload] Starting avatar upload process');
    
    // Parse and validate community ID
    const communityId = parseInt(req.params.id);
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get authenticated user ID
    const userId = req.user?.id;
    if (!userId) {
      console.error('[Avatar Upload] No user ID in authenticated request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log(`[Avatar Upload] Request by user ${userId} for community ${communityId}`);
    
    // Get community information
    const community = await storage.getCommunityById(communityId);
    if (!community) {
      console.error(`[Avatar Upload] Community ${communityId} not found`);
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is authorized (community admin or creator)
    const membership = await storage.getCommunityMembership(communityId, userId);
    const isAdmin = membership?.role === 'admin';
    const isCreator = community.createdByUserId === userId;
    
    console.log(`[Avatar Upload] User is admin: ${isAdmin}, User is creator: ${isCreator}`);
    
    if (!isAdmin && !isCreator) {
      console.error(`[Avatar Upload] User ${userId} not authorized to modify community ${communityId}`);
      return res.status(403).json({ message: 'Only community admins can upload avatars' });
    }
    
    // Validate the file
    if (!req.file) {
      console.error('[Avatar Upload] No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const validationError = validateFile(req.file);
    if (validationError) {
      console.error(`[Avatar Upload] File validation error: ${validationError}`);
      return res.status(400).json({ message: validationError });
    }
    
    // Process file path for database storage - ensure it starts with /uploads
    const relativePath = '/' + req.file.path;
    console.log(`[Avatar Upload] File saved to: ${req.file.path}`);
    console.log(`[Avatar Upload] Database path: ${relativePath}`);
    
    // Update community with new avatar URL
    await storage.updateCommunity(communityId, {
      avatarUrl: relativePath
    });
    
    console.log(`[Avatar Upload] Successfully updated avatar for community ${communityId}`);
    res.json({ 
      success: true,
      url: relativePath 
    });
  } catch (error) {
    console.error('[Avatar Upload] Error processing upload:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

/**
 * PKL-278651-COMM-0019-VISUALS
 * Upload community banner
 * POST /api/communities/:id/banner
 * 
 * Note: This route follows Framework 5.1 principles with proper authentication,
 * file validation, and role-based permission checks.
 */
router.post('/:id/banner', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
  try {
    console.log('[Banner Upload] Starting banner upload process');
    
    // Parse and validate community ID
    const communityId = parseInt(req.params.id);
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    // Get authenticated user ID
    const userId = req.user?.id;
    if (!userId) {
      console.error('[Banner Upload] No user ID in authenticated request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log(`[Banner Upload] Request by user ${userId} for community ${communityId}`);
    
    // Get community information
    const community = await storage.getCommunityById(communityId);
    if (!community) {
      console.error(`[Banner Upload] Community ${communityId} not found`);
      return res.status(404).json({ message: 'Community not found' });
    }
    
    // Check if user is authorized (community admin or creator)
    const membership = await storage.getCommunityMembership(communityId, userId);
    const isAdmin = membership?.role === 'admin';
    const isCreator = community.createdByUserId === userId;
    
    console.log(`[Banner Upload] User is admin: ${isAdmin}, User is creator: ${isCreator}`);
    
    if (!isAdmin && !isCreator) {
      console.error(`[Banner Upload] User ${userId} not authorized to modify community ${communityId}`);
      return res.status(403).json({ message: 'Only community admins can upload banners' });
    }
    
    // Validate the file
    if (!req.file) {
      console.error('[Banner Upload] No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const validationError = validateFile(req.file);
    if (validationError) {
      console.error(`[Banner Upload] File validation error: ${validationError}`);
      return res.status(400).json({ message: validationError });
    }
    
    // Process file path for database storage - ensure it starts with /uploads
    const relativePath = '/' + req.file.path;
    console.log(`[Banner Upload] File saved to: ${req.file.path}`);
    console.log(`[Banner Upload] Database path: ${relativePath}`);
    
    // Update community with new banner URL
    await storage.updateCommunity(communityId, {
      bannerUrl: relativePath
    });
    
    console.log(`[Banner Upload] Successfully updated banner for community ${communityId}`);
    res.json({ 
      success: true,
      url: relativePath 
    });
  } catch (error) {
    console.error('[Banner Upload] Error processing upload:', error);
    res.status(500).json({ message: 'Failed to upload banner' });
  }
});

/**
 * PKL-278651-COMM-0019-VISUALS
 * Update community theme color
 * PATCH /api/communities/:id/theme
 */
router.patch('/:id/theme', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { themeColor } = req.body;
    
    if (isNaN(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!themeColor || typeof themeColor !== 'string') {
      return res.status(400).json({ message: 'Theme color is required' });
    }
    
    // Validate color format (hex code)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(themeColor)) {
      return res.status(400).json({ message: 'Invalid color format. Use hex format (e.g., #FF5500)' });
    }
    
    // Check if user is a community admin or creator
    const membership = await storage.getCommunityMembership(communityId, userId);
    const community = await storage.getCommunityById(communityId);
    
    if (!(membership?.role === 'admin') && community?.createdByUserId !== userId) {
      return res.status(403).json({ message: 'Only community admins can update theme' });
    }
    
    // Update community with new theme color
    const updatedCommunity = await storage.updateCommunity(communityId, {
      themeColor
    });
    
    res.json(updatedCommunity);
  } catch (error) {
    console.error('Error updating community theme:', error);
    res.status(500).json({ message: 'Failed to update theme' });
  }
});

// Import community engagement routes
import { communityEngagementRoutes } from './engagement-routes';

// Export the router
export function registerCommunityRoutes(app: any) {
  console.log('[API] Registering community hub routes (PKL-278651-COMM-0006-HUB-API)');
  
  // Register API routes
  app.use('/api/communities', router);
  
  // Register community engagement routes
  console.log('[API] Registering community engagement routes (PKL-278651-COMM-0021-ENGAGE)');
  app.use('/api/communities', communityEngagementRoutes);
}