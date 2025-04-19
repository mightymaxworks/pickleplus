/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed API Routes
 * 
 * This module defines API routes for accessing the activity feed,
 * including fetching activities and marking them as read.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-19
 * @framework Framework5.1
 */

import express, { Request, Response } from 'express';
import { isAuthenticated } from '../../auth';
import { activityFeedService } from './activity-service';
import { db } from '../../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { activityFeedEntries, activityReadStatus, insertActivityFeedEntrySchema } from '@shared/schema/activity-feed';
import { ServerEvents, eventEmitter } from '../../core/events/server-event-bus';

// Create router
const router = express.Router();

/**
 * Get activities for user
 * GET /api/activities
 * 
 * Query parameters:
 * - limit: number (default: 10)
 * - offset: number (default: 0)
 * - communityId: number (optional) - Filter by community
 */
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const communityId = req.query.communityId ? parseInt(req.query.communityId as string) : undefined;
    
    const activities = await activityFeedService.getActivitiesForUser(userId, {
      limit,
      offset,
      communityId
    });
    
    res.json(activities);
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0022-FEED] Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

/**
 * Create a new activity
 * POST /api/activities/create
 * 
 * Body:
 * - content: string - The content of the activity
 * - type: string - The type of activity (e.g., "comment", "match_recorded", etc.)
 * - communityId: number | null - The ID of the community the activity belongs to (optional)
 * - relatedEntityId: number | null - The ID of a related entity (optional)
 * - relatedEntityType: string | null - The type of the related entity (optional)
 * - metadata: object | null - Additional metadata for the activity (optional)
 */
router.post('/create', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id;
    const { content, type, communityId, relatedEntityId, relatedEntityType, metadata } = req.body;

    // Validate required fields
    if (!content || !type) {
      return res.status(400).json({ message: 'Content and type are required' });
    }

    // Create the activity
    const [activity] = await db.insert(activityFeedEntries).values({
      userId,
      username: req.user.username,
      displayName: req.user.displayName || req.user.username,
      avatar: req.user.avatar || null,
      content,
      type,
      communityId: communityId || null,
      relatedEntityId: relatedEntityId || null,
      relatedEntityType: relatedEntityType || null,
      metadata: metadata || null,
      timestamp: new Date()
    }).returning();

    // Emit event to notify subscribers via WebSocket
    if (activity) {
      // Emit to global activity feed
      eventEmitter.emit('community:activities', activity);

      // If this activity is associated with a community, emit to that community's feed as well
      if (activity.communityId) {
        eventEmitter.emit(`community:${activity.communityId}:activities`, activity);
      }
    }

    res.status(201).json({ 
      success: true, 
      activity,
      message: 'Activity created successfully' 
    });
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0022-FEED] Error creating activity:', error);
    res.status(500).json({ message: 'Failed to create activity' });
  }
});

/**
 * Mark activity as read
 * POST /api/activities/:id/read
 */
router.post('/:id/read', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const activityId = parseInt(req.params.id);
    
    // Check if activity exists
    const [activity] = await db
      .select()
      .from(activityFeedEntries)
      .where(eq(activityFeedEntries.id, activityId))
      .limit(1);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    // Check if activity is already marked as read
    const [readStatus] = await db
      .select()
      .from(activityReadStatus)
      .where(
        and(
          eq(activityReadStatus.userId, userId),
          eq(activityReadStatus.activityId, activityId)
        )
      )
      .limit(1);
    
    if (readStatus) {
      // Already marked as read
      return res.status(200).json({ 
        success: true, 
        activityId,
        message: 'Activity already marked as read' 
      });
    }
    
    // Mark activity as read
    await db.insert(activityReadStatus).values({
      userId,
      activityId,
      readAt: new Date()
    });
    
    res.status(200).json({ 
      success: true, 
      activityId,
      message: 'Activity marked as read' 
    });
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0022-FEED] Error marking activity as read:', error);
    res.status(500).json({ message: 'Failed to mark activity as read' });
  }
});

/**
 * Mark all activities as read
 * POST /api/activities/mark-all-read
 * 
 * Query parameters:
 * - communityId: number (optional) - Filter by community
 */
router.post('/mark-all-read', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const communityId = req.query.communityId ? parseInt(req.query.communityId as string) : undefined;
    
    // Get all unread activities for user
    const unreadActivities = await activityFeedService.getUnreadActivitiesForUser(userId, communityId);
    
    // Mark all as read
    if (unreadActivities.length > 0) {
      await db.insert(activityReadStatus).values(
        unreadActivities.map(activity => ({
          userId,
          activityId: activity.id,
          readAt: new Date()
        }))
      );
    }
    
    res.status(200).json({ 
      success: true, 
      count: unreadActivities.length,
      message: `${unreadActivities.length} activities marked as read` 
    });
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0022-FEED] Error marking all activities as read:', error);
    res.status(500).json({ message: 'Failed to mark all activities as read' });
  }
});

/**
 * Get unread activity count
 * GET /api/activities/unread-count
 * 
 * Query parameters:
 * - communityId: number (optional) - Filter by community
 */
router.get('/unread-count', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const communityId = req.query.communityId ? parseInt(req.query.communityId as string) : undefined;
    
    const count = await activityFeedService.getUnreadActivityCount(userId, communityId);
    
    res.status(200).json({ count });
  } catch (error: any) {
    console.error('[PKL-278651-COMM-0022-FEED] Error getting unread activity count:', error);
    res.status(500).json({ message: 'Failed to get unread activity count' });
  }
});

// Export router
export const activityFeedRoutes = router;