/**
 * PKL-278651-COMM-0022-FEED
 * Community Activity Routes
 * 
 * This module defines the API routes for community activity feeds.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import express, { Request, Response } from 'express';
import { isAuthenticated } from '../../middleware/auth-middleware';
import { getActivities, getUserActivities, createActivity } from './activity-service';
import { z } from 'zod';

const router = express.Router();

/**
 * Get community activities
 * GET /api/community/activities
 */
router.get('/activities', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const communityId = req.query.communityId ? Number(req.query.communityId) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const userId = req.user?.id;
    
    // Validate parameters
    if (communityId && isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }
    
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }
    
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Fetch activities
    const activities = await getActivities({ 
      communityId, 
      limit: limit + 1, // Fetch one extra to determine if there are more
      userId,
      offset
    });
    
    // Check if there are more activities
    const hasMore = activities.length > limit;
    const activitiesToReturn = hasMore ? activities.slice(0, limit) : activities;
    
    res.json({ 
      activities: activitiesToReturn,
      hasMore,
      page,
      limit
    });
  } catch (error) {
    console.error('[API] Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * Get user activities
 * GET /api/community/user/:userId/activities
 */
router.get('/user/:userId/activities', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    // Validate parameters
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }
    
    // Fetch user activities
    const activities = await getUserActivities(userId, limit);
    
    res.json({ activities });
  } catch (error) {
    console.error('[API] Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});

/**
 * Create a new activity
 * POST /api/community/activities
 */
router.post('/activities', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Define validation schema
    const schema = z.object({
      type: z.string().min(1).max(50),
      content: z.string().min(1),
      communityId: z.number().optional(),
      metadata: z.record(z.any()).optional(),
      relatedEntityId: z.number().optional(),
      relatedEntityType: z.string().optional()
    });
    
    // Validate request body
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: result.error.format()
      });
    }
    
    // Create activity
    const activity = await createActivity({
      type: result.data.type,
      userId: req.user!.id,
      content: result.data.content,
      communityId: result.data.communityId,
      metadata: result.data.metadata,
      relatedEntityId: result.data.relatedEntityId,
      relatedEntityType: result.data.relatedEntityType
    });
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('[API] Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

/**
 * Mark an activity as read
 * POST /api/community/activities/:activityId/read
 */
router.post('/activities/:activityId/read', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const activityId = Number(req.params.activityId);
    
    // Validate parameters
    if (isNaN(activityId)) {
      return res.status(400).json({ error: 'Invalid activity ID' });
    }
    
    // TODO: Implement marking activity as read
    // This would be implemented in a future sprint with proper tracking of read status
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Error marking activity as read:', error);
    res.status(500).json({ error: 'Failed to mark activity as read' });
  }
});

export default router;