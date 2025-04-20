/**
 * PKL-278651-COMM-0028-NOTIF-SERVICE - Notification Service
 * Implementation timestamp: 2025-04-20 10:10 ET
 * 
 * Service for managing notifications and emitting notification events
 * 
 * Framework 5.2 compliant implementation
 */

import { storage } from '../../storage';
import { EventBus } from '../../core/events/event-bus';
import { db } from '../../db';
import { 
  userNotifications,
  type UserNotification,
  type InsertUserNotification
} from '../../../shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logger } from '../../utils/logger';

export class NotificationService {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    logger.info('[Notification] NotificationService initialized');
  }

  /**
   * Create a new notification for a user
   */
  async createNotification(notification: InsertUserNotification): Promise<UserNotification> {
    try {
      // Insert notification into database
      const [createdNotification] = await db.insert(userNotifications)
        .values(notification)
        .returning();
      
      if (!createdNotification) {
        throw new Error('Failed to create notification');
      }
      
      // Emit notification created event
      this.eventBus.emit('notification.created', createdNotification);
      
      logger.debug(`[Notification] Created notification for user ${notification.userId}: ${notification.title}`);
      
      return createdNotification;
    } catch (error) {
      logger.error('[Notification] Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Create notifications for multiple users (batch)
   */
  async createNotificationsForUsers(
    userIds: number[], 
    notificationData: Omit<InsertUserNotification, 'userId'>
  ): Promise<number> {
    try {
      // Create notification for each user
      const notifications = userIds.map(userId => ({
        ...notificationData,
        userId
      }));
      
      // Insert all notifications
      const result = await db.insert(userNotifications)
        .values(notifications)
        .returning({ id: userNotifications.id, userId: userNotifications.userId });
      
      // Emit events for each created notification
      result.forEach(notification => {
        this.eventBus.emit('notification.created', notification);
      });
      
      logger.info(`[Notification] Created ${result.length} notifications for ${userIds.length} users`);
      
      return result.length;
    } catch (error) {
      logger.error('[Notification] Error creating notifications for multiple users:', error);
      throw error;
    }
  }
  
  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      // Find notification to get userId
      const [notification] = await db.select()
        .from(userNotifications)
        .where(eq(userNotifications.id, notificationId));
      
      if (!notification) {
        throw new Error(`Notification with ID ${notificationId} not found`);
      }
      
      // Update notification
      await db.update(userNotifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(eq(userNotifications.id, notificationId));
      
      // Emit notification read event
      this.eventBus.emit('notification.read', {
        notificationId,
        userId: notification.userId
      });
      
      logger.debug(`[Notification] Marked notification ${notificationId} as read for user ${notification.userId}`);
      
      return true;
    } catch (error) {
      logger.error(`[Notification] Error marking notification ${notificationId} as read:`, error);
      return false;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: number): Promise<number> {
    try {
      // Find unread notifications
      const unreadNotifications = await db.select({ id: userNotifications.id })
        .from(userNotifications)
        .where(and(
          eq(userNotifications.userId, userId),
          eq(userNotifications.isRead, false),
          isNull(userNotifications.deletedAt)
        ));
      
      // Update all unread notifications
      await db.update(userNotifications)
        .set({ isRead: true, updatedAt: new Date() })
        .where(and(
          eq(userNotifications.userId, userId),
          eq(userNotifications.isRead, false),
          isNull(userNotifications.deletedAt)
        ));
      
      // Emit all read event
      this.eventBus.emit('notification.all_read', { userId });
      
      logger.info(`[Notification] Marked ${unreadNotifications.length} notifications as read for user ${userId}`);
      
      return unreadNotifications.length;
    } catch (error) {
      logger.error(`[Notification] Error marking all notifications as read for user ${userId}:`, error);
      return 0;
    }
  }
  
  /**
   * Delete a notification (soft delete)
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      // Find notification to get userId
      const [notification] = await db.select()
        .from(userNotifications)
        .where(eq(userNotifications.id, notificationId));
      
      if (!notification) {
        throw new Error(`Notification with ID ${notificationId} not found`);
      }
      
      // Soft delete notification
      await db.update(userNotifications)
        .set({ deletedAt: new Date() })
        .where(eq(userNotifications.id, notificationId));
      
      // Emit notification deleted event
      this.eventBus.emit('notification.deleted', {
        notificationId,
        userId: notification.userId
      });
      
      logger.debug(`[Notification] Deleted notification ${notificationId} for user ${notification.userId}`);
      
      return true;
    } catch (error) {
      logger.error(`[Notification] Error deleting notification ${notificationId}:`, error);
      return false;
    }
  }
  
  /**
   * Delete all notifications for a user (soft delete)
   */
  async deleteAllNotifications(userId: number): Promise<number> {
    try {
      // Find active notifications
      const activeNotifications = await db.select({ id: userNotifications.id })
        .from(userNotifications)
        .where(and(
          eq(userNotifications.userId, userId),
          isNull(userNotifications.deletedAt)
        ));
      
      // Soft delete all active notifications
      await db.update(userNotifications)
        .set({ deletedAt: new Date() })
        .where(and(
          eq(userNotifications.userId, userId),
          isNull(userNotifications.deletedAt)
        ));
      
      // Emit notifications deleted event
      activeNotifications.forEach(notification => {
        this.eventBus.emit('notification.deleted', {
          notificationId: notification.id,
          userId
        });
      });
      
      logger.info(`[Notification] Deleted ${activeNotifications.length} notifications for user ${userId}`);
      
      return activeNotifications.length;
    } catch (error) {
      logger.error(`[Notification] Error deleting all notifications for user ${userId}:`, error);
      return 0;
    }
  }
  
  /**
   * Create a system notification (sent to all users)
   */
  async createSystemNotification(
    title: string,
    message: string,
    link?: string
  ): Promise<number> {
    try {
      // Get all active user IDs
      const userIds = await storage.getAllActiveUserIds();
      
      // Create notification data
      const notificationData: Omit<InsertUserNotification, 'userId'> = {
        type: 'system_message',
        title,
        message,
        referenceType: 'system',
        link: link || null
      };
      
      // Create notifications for all users
      const count = await this.createNotificationsForUsers(userIds, notificationData);
      
      logger.info(`[Notification] Created system notification "${title}" for ${count} users`);
      
      return count;
    } catch (error) {
      logger.error('[Notification] Error creating system notification:', error);
      throw error;
    }
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(eventBus?: EventBus): NotificationService {
  if (!notificationService && eventBus) {
    notificationService = new NotificationService(eventBus);
  }
  
  if (!notificationService) {
    throw new Error('NotificationService not initialized');
  }
  
  return notificationService;
}