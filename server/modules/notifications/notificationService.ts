/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - Notification Service
 * Implementation timestamp: 2025-04-20 11:10 ET
 * 
 * Core service for managing notifications with EventBus integration
 * 
 * Framework 5.2 compliant implementation
 */

import { db } from '../../db';
import { storage } from '../../storage';
import { 
  type UserNotification as Notification,
  type InsertUserNotification as InsertNotification, 
  userNotifications as notifications 
} from '@shared/schema';
import { eq, and, desc, not, sql } from 'drizzle-orm';
import { EventBus } from '../../core/events/event-bus';
import { logger } from '../../utils/logger';

class NotificationService {
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
  /**
   * Create a new notification
   * @param data Notification data to insert
   * @returns Created notification
   */
  public async createNotification(data: InsertNotification): Promise<Notification> {
    try {
      logger.debug('[Notification] Creating notification:', data);
      
      // Insert notification into database
      const [notification] = await db.insert(notifications)
        .values(data)
        .returning();
      
      // Emit notification event
      this.eventBus.emit('notification.new', {
        userId: notification.userId,
        notification
      });
      
      logger.info(`[Notification] Notification ${notification.id} created for user ${notification.userId}`);
      
      return notification;
    } catch (error) {
      logger.error('[Notification] Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }
  
  /**
   * Create multiple notifications at once (for bulk operations)
   * @param dataList Array of notification data to insert
   * @returns Created notifications
   */
  public async createMultipleNotifications(dataList: InsertNotification[]): Promise<Notification[]> {
    if (!dataList.length) {
      return [];
    }
    
    try {
      logger.debug(`[Notification] Creating ${dataList.length} notifications`);
      
      // Insert notifications into database
      const createdNotifications = await db.insert(notifications)
        .values(dataList)
        .returning();
      
      // Group notifications by user for efficient event emission
      const notificationsByUser = createdNotifications.reduce((acc, notification) => {
        if (!acc[notification.userId]) {
          acc[notification.userId] = [];
        }
        acc[notification.userId].push(notification);
        return acc;
      }, {} as Record<number, Notification[]>);
      
      // Emit events for each user
      Object.entries(notificationsByUser).forEach(([userId, userNotifications]) => {
        this.eventBus.emit('notification.batch', {
          userId: parseInt(userId),
          notifications: userNotifications
        });
      });
      
      logger.info(`[Notification] ${createdNotifications.length} notifications created`);
      
      return createdNotifications;
    } catch (error) {
      logger.error('[Notification] Error creating multiple notifications:', error);
      throw new Error('Failed to create multiple notifications');
    }
  }
  
  /**
   * Get a notification by ID
   * @param id Notification ID
   * @returns Notification or null if not found
   */
  public async getNotification(id: number): Promise<Notification | undefined> {
    try {
      const [notification] = await db.select()
        .from(notifications)
        .where(eq(notifications.id, id));
      
      return notification;
    } catch (error) {
      logger.error(`[Notification] Error getting notification ${id}:`, error);
      throw new Error('Failed to get notification');
    }
  }
  
  /**
   * Get notifications for a user
   * @param userId User ID
   * @param options Query options
   * @returns Array of notifications
   */
  public async getUserNotifications(
    userId: number,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      includeRead?: boolean;
      types?: string[];
    } = {}
  ): Promise<Notification[]> {
    const {
      limit = 20,
      offset = 0,
      unreadOnly = false,
      includeRead = true,
      types
    } = options;
    
    try {
      logger.debug(`[Notification] Getting notifications for user ${userId}`);
      
      let query = db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId));
      
      // Add filter for read/unread status
      if (unreadOnly) {
        query = query.where(eq(notifications.isRead, false));
      } else if (!includeRead) {
        query = query.where(eq(notifications.isRead, false));
      }
      
      // Add filter for notification types
      if (types && types.length > 0) {
        query = query.where(sql`${notifications.type} IN (${types.join(',')})`);
      }
      
      // Add order by, limit and offset
      const result = await query
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);
      
      return result;
    } catch (error) {
      logger.error(`[Notification] Error getting notifications for user ${userId}:`, error);
      throw new Error('Failed to get user notifications');
    }
  }
  
  /**
   * Get unread notification count for a user
   * @param userId User ID
   * @returns Count of unread notifications
   */
  public async getUnreadCount(userId: number): Promise<number> {
    try {
      const result = await db.select({ count: sql`COUNT(*)` })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));
      
      return parseInt(result[0].count.toString(), 10) || 0;
    } catch (error) {
      logger.error(`[Notification] Error getting unread count for user ${userId}:`, error);
      throw new Error('Failed to get unread notification count');
    }
  }
  
  /**
   * Mark a notification as read
   * @param id Notification ID
   * @param userId User ID (for verification)
   * @returns Updated notification
   */
  public async markAsRead(id: number, userId: number): Promise<Notification> {
    try {
      logger.debug(`[Notification] Marking notification ${id} as read for user ${userId}`);
      
      const [updatedNotification] = await db.update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(
          eq(notifications.id, id),
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .returning();
      
      if (!updatedNotification) {
        throw new Error('Notification not found or already read');
      }
      
      // Emit notification read event
      this.eventBus.emit('notification.read', {
        userId,
        notificationId: id
      });
      
      logger.info(`[Notification] Notification ${id} marked as read for user ${userId}`);
      
      return updatedNotification;
    } catch (error) {
      logger.error(`[Notification] Error marking notification ${id} as read:`, error);
      throw new Error('Failed to mark notification as read');
    }
  }
  
  /**
   * Mark all notifications as read for a user
   * @param userId User ID
   * @returns Count of notifications marked as read
   */
  public async markAllAsRead(userId: number): Promise<number> {
    try {
      logger.debug(`[Notification] Marking all notifications as read for user ${userId}`);
      
      // Find all unread notifications
      const unreadNotifications = await db.select({ id: notifications.id })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));
      
      if (!unreadNotifications.length) {
        return 0;
      }
      
      // Update all unread notifications
      const result = await db.update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));
      
      const count = unreadNotifications.length;
      
      // Emit all read event
      this.eventBus.emit('notification.all_read', { userId });
      
      logger.info(`[Notification] ${count} notifications marked as read for user ${userId}`);
      
      return count;
    } catch (error) {
      logger.error(`[Notification] Error marking all notifications as read for user ${userId}:`, error);
      throw new Error('Failed to mark all notifications as read');
    }
  }
  
  /**
   * Delete a notification
   * @param id Notification ID
   * @param userId User ID (for verification)
   * @returns Boolean indicating success
   */
  public async deleteNotification(id: number, userId: number): Promise<boolean> {
    try {
      logger.debug(`[Notification] Deleting notification ${id} for user ${userId}`);
      
      // Verify notification exists and belongs to user
      const [notification] = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        ));
      
      if (!notification) {
        return false;
      }
      
      // Delete notification
      await db.delete(notifications)
        .where(and(
          eq(notifications.id, id),
          eq(notifications.userId, userId)
        ));
      
      // Emit notification deleted event
      this.eventBus.emit('notification.deleted', {
        userId,
        notificationId: id
      });
      
      logger.info(`[Notification] Notification ${id} deleted for user ${userId}`);
      
      return true;
    } catch (error) {
      logger.error(`[Notification] Error deleting notification ${id}:`, error);
      throw new Error('Failed to delete notification');
    }
  }
  
  /**
   * Create a system-wide notification for all users
   * @param data Base notification data (without userId)
   * @returns Created notifications
   */
  public async createSystemNotification(data: Omit<InsertNotification, 'userId'>): Promise<Notification[]> {
    try {
      logger.debug('[Notification] Creating system-wide notification');
      
      // Get all active users
      const users = await storage.getAllActiveUsers();
      
      if (!users.length) {
        logger.warn('[Notification] No active users found for system notification');
        return [];
      }
      
      // Create notifications for each user
      const notificationsToCreate = users.map(user => ({
        ...data,
        userId: user.id
      }));
      
      return this.createMultipleNotifications(notificationsToCreate);
    } catch (error) {
      logger.error('[Notification] Error creating system notification:', error);
      throw new Error('Failed to create system notification');
    }
  }
  
  /**
   * Create notifications for multiple users
   * @param userIds Array of user IDs
   * @param data Base notification data (without userId)
   * @returns Created notifications
   */
  public async createNotificationForUsers(
    userIds: number[],
    data: Omit<InsertNotification, 'userId'>
  ): Promise<Notification[]> {
    if (!userIds.length) {
      return [];
    }
    
    try {
      logger.debug(`[Notification] Creating notification for ${userIds.length} users`);
      
      // Create notifications for each user
      const notificationsToCreate = userIds.map(userId => ({
        ...data,
        userId
      }));
      
      return this.createMultipleNotifications(notificationsToCreate);
    } catch (error) {
      logger.error('[Notification] Error creating notifications for multiple users:', error);
      throw new Error('Failed to create notifications for users');
    }
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

/**
 * Get the NotificationService instance
 */
export function getNotificationService(eventBus: EventBus): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService(eventBus);
  }
  
  return notificationService;
}