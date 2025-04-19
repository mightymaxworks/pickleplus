/**
 * PKL-278651-COMM-0028-NOTIF - Community Notifications Routes
 * Implementation timestamp: 2025-04-19 12:40 ET
 * 
 * API routes for community notifications system
 * 
 * Framework 5.2 compliant implementation
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, desc, isNull, gt } from 'drizzle-orm';
import { 
  userNotifications, 
  notificationPreferences,
  insertUserNotificationSchema,
  insertNotificationPreferenceSchema
} from '../../shared/schema';
import { isAuthenticated } from '../auth';

const router = express.Router();

export function registerCommunityNotificationsRoutes(app: express.Express) {
  console.log('[ROUTES] Registering Community Notifications Routes (PKL-278651-COMM-0028-NOTIF)');
  app.use('/api', router);
  return router;
}

/**
 * Get all notifications for the authenticated user
 * GET /api/notifications
 */
router.get('/notifications',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      // Optional query parameters
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const unreadOnly = req.query.unreadOnly === 'true';
      
      // Build query conditions
      let conditions = eq(userNotifications.userId, userId);
      
      if (unreadOnly) {
        conditions = and(
          conditions,
          eq(userNotifications.isRead, false)
        );
      }
      
      // Add condition to exclude deleted notifications
      conditions = and(
        conditions,
        isNull(userNotifications.deletedAt)
      );
      
      const notifications = await db.query.userNotifications.findMany({
        where: conditions,
        orderBy: [desc(userNotifications.createdAt)],
        limit: limit,
        offset: offset,
        with: {
          community: true
        }
      });
      
      // Get total count for pagination
      const totalResult = await db
        .select({ count: db.fn.count() })
        .from(userNotifications)
        .where(conditions);
      
      const total = parseInt(totalResult[0].count.toString());
      
      res.status(200).json({
        notifications,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      });
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get unread notification count
 * GET /api/notifications/count
 */
router.get('/notifications/count',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      console.log(`[API] Fetching unread notification count for user ${userId}`);
      
      // Get unread count
      const result = await db
        .select({ count: db.fn.count() })
        .from(userNotifications)
        .where(
          and(
            eq(userNotifications.userId, userId),
            eq(userNotifications.isRead, false),
            isNull(userNotifications.deletedAt)
          )
        );
      
      const count = parseInt(result[0].count.toString());
      
      console.log(`[API] Unread notification count for user ${userId}: ${count}`);
      
      res.status(200).json({ count });
    } catch (error) {
      console.error('Error fetching notification count:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Mark notification as read
 * PATCH /api/notifications/:notificationId/read
 */
router.patch('/notifications/:notificationId/read',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      const userId = req.user?.id;
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: 'Invalid notification ID' });
      }
      
      // Update notification
      const [updatedNotification] = await db
        .update(userNotifications)
        .set({
          isRead: true,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(userNotifications.id, notificationId),
            eq(userNotifications.userId, userId)
          )
        )
        .returning();
      
      if (!updatedNotification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      res.status(200).json(updatedNotification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Mark all notifications as read
 * POST /api/notifications/read-all
 */
router.post('/notifications/read-all',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      // Update all unread notifications
      await db
        .update(userNotifications)
        .set({
          isRead: true,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(userNotifications.userId, userId),
            eq(userNotifications.isRead, false),
            isNull(userNotifications.deletedAt)
          )
        );
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Mark notification as deleted (soft delete)
 * DELETE /api/notifications/:notificationId
 */
router.delete('/notifications/:notificationId',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      const userId = req.user?.id;
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ error: 'Invalid notification ID' });
      }
      
      // Soft delete notification
      const [updatedNotification] = await db
        .update(userNotifications)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(userNotifications.id, notificationId),
            eq(userNotifications.userId, userId)
          )
        )
        .returning();
      
      if (!updatedNotification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get notification preferences for the authenticated user
 * GET /api/notification-preferences
 */
router.get('/notification-preferences',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const communityId = req.query.communityId ? parseInt(req.query.communityId as string) : undefined;
      
      let conditions = eq(notificationPreferences.userId, userId);
      
      if (communityId) {
        if (isNaN(communityId)) {
          return res.status(400).json({ error: 'Invalid community ID' });
        }
        
        conditions = and(
          conditions,
          eq(notificationPreferences.communityId, communityId)
        );
      }
      
      const preferences = await db.query.notificationPreferences.findMany({
        where: conditions,
        with: {
          community: communityId ? true : undefined
        }
      });
      
      res.status(200).json(preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Update notification preferences
 * PUT /api/notification-preferences/:preferenceId
 */
router.put('/notification-preferences/:preferenceId',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const preferenceId = parseInt(req.params.preferenceId);
      const userId = req.user?.id;
      
      if (isNaN(preferenceId)) {
        return res.status(400).json({ error: 'Invalid preference ID' });
      }
      
      // Validate request body
      const updateSchema = z.object({
        isEnabled: z.boolean().optional(),
        channel: z.enum(['app', 'email']).optional(),
      });
      
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Update preference
      const [updatedPreference] = await db
        .update(notificationPreferences)
        .set({
          ...validationResult.data,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(notificationPreferences.id, preferenceId),
            eq(notificationPreferences.userId, userId)
          )
        )
        .returning();
      
      if (!updatedPreference) {
        return res.status(404).json({ error: 'Preference not found' });
      }
      
      res.status(200).json(updatedPreference);
    } catch (error) {
      console.error('Error updating notification preference:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Create a new notification preference
 * POST /api/notification-preferences
 */
router.post('/notification-preferences',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      // Validate request body
      const validationResult = insertNotificationPreferenceSchema.safeParse({
        ...req.body,
        userId
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.errors });
      }
      
      // Check if preference already exists
      const existingPreference = await db.query.notificationPreferences.findFirst({
        where: and(
          eq(notificationPreferences.userId, userId),
          eq(notificationPreferences.notificationType, validationResult.data.notificationType),
          validationResult.data.communityId 
            ? eq(notificationPreferences.communityId, validationResult.data.communityId)
            : isNull(notificationPreferences.communityId)
        )
      });
      
      if (existingPreference) {
        return res.status(400).json({ error: 'Preference already exists' });
      }
      
      // Create preference
      const [preference] = await db.insert(notificationPreferences)
        .values(validationResult.data)
        .returning();
      
      res.status(201).json(preference);
    } catch (error) {
      console.error('Error creating notification preference:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Create a new notification (internal API, not exposed directly)
 * This will be used by other services to create notifications
 */
export async function createNotification(notificationData: any) {
  try {
    // Validate notification data
    const validationResult = insertUserNotificationSchema.safeParse(notificationData);
    
    if (!validationResult.success) {
      throw new Error(`Invalid notification data: ${JSON.stringify(validationResult.error.errors)}`);
    }
    
    // Check user notification preferences
    const preference = await db.query.notificationPreferences.findFirst({
      where: and(
        eq(notificationPreferences.userId, notificationData.userId),
        eq(notificationPreferences.notificationType, notificationData.type),
        notificationData.communityId 
          ? eq(notificationPreferences.communityId, notificationData.communityId)
          : isNull(notificationPreferences.communityId)
      )
    });
    
    // If preference exists and is disabled, don't create notification
    if (preference && !preference.isEnabled) {
      return null;
    }
    
    // Create notification
    const [notification] = await db.insert(userNotifications)
      .values(validationResult.data)
      .returning();
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export default router;