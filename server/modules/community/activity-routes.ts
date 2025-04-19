/**
 * PKL-278651-COMM-0022-FEED
 * Community Activity Routes
 * 
 * API routes for community activities and real-time feeds.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createActivity, getActivities, getUserActivities } from './activity-service';
import { isAuthenticated } from '../../auth';

const router = Router();

// Schema for creating an activity
const createActivitySchema = z.object({
  type: z.string(),
  content: z.string(),
  communityId: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  relatedEntityId: z.number().optional(),
  relatedEntityType: z.string().optional()
});

/**
 * GET /api/community/activities
 * Returns activities from all communities the user is a member of
 */
router.get('/activities', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const activities = await getActivities({ 
      limit,
      userId: req.user?.id 
    });
    res.json(activities);
  } catch (error) {
    console.error('[API] Error fetching community activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * GET /api/community/:communityId/activities
 * Returns activities for a specific community
 */
router.get('/:communityId/activities', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const communityId = parseInt(req.params.communityId);
    if (isNaN(communityId)) {
      return res.status(400).json({ error: 'Invalid community ID' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const activities = await getActivities({ 
      communityId,
      limit 
    });
    
    res.json(activities);
  } catch (error) {
    console.error('[API] Error fetching community activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * GET /api/community/user/:userId/activities
 * Returns activities created by a specific user
 */
router.get('/user/:userId/activities', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const activities = await getUserActivities(userId, limit);
    
    res.json(activities);
  } catch (error) {
    console.error('[API] Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * POST /api/community/activity
 * Creates a new activity
 */
router.post('/activity', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validatedData = createActivitySchema.parse(req.body);
    
    const activity = await createActivity({
      ...validatedData,
      userId: req.user!.id
    });
    
    res.status(201).json(activity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error('[API] Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

export default router;