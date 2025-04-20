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
import { sql } from 'drizzle-orm/sql';
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
  
  // The routes are registered with the app directly to avoid path prefix issues
  // Each route in the router already starts with '/api/notifications'
  app.use(router);
  
  // Add a direct test endpoint to verify the routes are being registered
  app.get('/api/notifications/test', (req, res) => {
    console.log('[API] Notifications test endpoint called');
    res.status(200).json({ message: 'Notifications API routes are working' });
  });
  
  // Add a testing endpoint to generate sample notifications
  app.post('/api/notifications/generate-test', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      console.log(`[API] Generating test notifications for user ${userId}`);
      
      // Define test notifications that point to existing pages only
      const notificationTypes = [
        {
          type: 'system_message',
          title: 'Welcome to Pickle+',
          message: 'Thanks for joining Pickle+! Your account is now active',
          referenceType: 'page',
          referenceId: 0, // No specific reference
          link: '/dashboard' // Direct link to dashboard
        },
        {
          type: 'new_achievement',
          title: 'New Achievement Unlocked',
          message: 'You earned the "First Steps" achievement - welcome to the community!',
          referenceType: 'page',
          referenceId: 0,
          link: '/achievements'  // Link to achievements page
        },
        {
          type: 'match_recorded',
          title: 'Match Successfully Recorded',
          message: 'Your match against PicklePro has been recorded',
          referenceType: 'page',
          referenceId: 0,
          link: '/profile' // Link to profile page
        },
        {
          type: 'rating_update',
          title: 'Your Rating Has Been Updated',
          message: 'Congratulations! Your performance rating increased to 4.2',
          referenceType: 'page',
          referenceId: 0,
          link: '/ranking' // Link to ranking page
        },
        {
          type: 'system_update',
          title: 'New Platform Features',
          message: 'Check out the new Pickle+ features in our latest update',
          referenceType: 'page',
          referenceId: 0,
          link: '/dashboard' // Link back to dashboard
        }
      ];
      
      // Create multiple test notifications
      const createdNotifications = [];
      
      for (const notifData of notificationTypes) {
        const notification = await createNotification({
          userId,
          type: notifData.type,
          title: notifData.title,
          message: notifData.message,
          referenceType: notifData.referenceType,
          referenceId: notifData.referenceId,
          link: notifData.link // Add direct link to existing pages
        });
        
        if (notification) {
          createdNotifications.push(notification);
        }
      }
      
      console.log(`[API] Created ${createdNotifications.length} test notifications for user ${userId}`);
      
      res.status(201).json({ 
        message: `Successfully created ${createdNotifications.length} test notifications`,
        notifications: createdNotifications
      });
    } catch (error) {
      console.error('Error generating test notifications:', error);
      res.status(500).json({ error: 'Failed to generate test notifications' });
    }
  });
  
  return router;
}

/**
 * Get all notifications for the authenticated user
 * GET /api/notifications
 */
router.get('/api/notifications',
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
      
      // Use standard select instead of relations query which is causing an error
      const notifications = await db
        .select()
        .from(userNotifications)
        .where(conditions)
        .orderBy(desc(userNotifications.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Get total count for pagination
      const totalResult = await db
        .select({ count: sql`count(*)` })
        .from(userNotifications)
        .where(conditions);
      
      const total = parseInt(String(totalResult[0].count));
      
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
router.get('/api/notifications/count',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      console.log(`[API] Fetching unread notification count for user ${userId}`);
      
      // Use SQL count directly instead of database function
      const result = await db
        .select({ count: sql`count(*)` })
        .from(userNotifications)
        .where(
          and(
            eq(userNotifications.userId, userId),
            eq(userNotifications.isRead, false),
            isNull(userNotifications.deletedAt)
          )
        );
      
      const count = parseInt(String(result[0].count));
      
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
router.patch('/api/notifications/:notificationId/read',
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
router.post('/api/notifications/read-all',
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
router.delete('/api/notifications/:notificationId',
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
router.get('/api/notification-preferences',
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
router.put('/api/notification-preferences/:preferenceId',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const preferenceId = parseInt(req.params.preferenceId);
      const userId = req.user?.id;
      
      if (isNaN(preferenceId)) {
        return res.status(400).json({ error: 'Invalid preference ID' });
      }
      
      // Validate request body
      // Note: Database column is 'is_enabled' but mapped to 'enabled' in code
      const updateSchema = z.object({
        enabled: z.boolean().optional(),
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
router.post('/api/notification-preferences',
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
    // Note: DB column is 'is_enabled' but field is accessed as 'enabled' in the code
    if (preference && preference.enabled === false) {
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