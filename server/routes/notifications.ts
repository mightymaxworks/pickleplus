/**
 * Notifications API Routes
 * Complete notification system implementation
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../auth';

const router = express.Router();

// Notification types
const NotificationType = {
  SYSTEM: 'system',
  MATCH: 'match',
  ACHIEVEMENT: 'achievement',
  COMMUNITY: 'community',
  COACHING: 'coaching',
  TOURNAMENT: 'tournament'
} as const;

// In-memory notification store (in production, this would be a database)
interface Notification {
  id: string;
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: any;
}

class NotificationStore {
  private notifications: Map<string, Notification> = new Map();
  private userNotifications: Map<number, string[]> = new Map();

  addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: Notification = {
      id,
      createdAt: new Date(),
      ...notification
    };

    this.notifications.set(id, fullNotification);
    
    if (!this.userNotifications.has(notification.userId)) {
      this.userNotifications.set(notification.userId, []);
    }
    this.userNotifications.get(notification.userId)!.unshift(id);
    
    return fullNotification;
  }

  getUserNotifications(userId: number, limit = 20, includeRead = false): Notification[] {
    const userNotifIds = this.userNotifications.get(userId) || [];
    const notifications = userNotifIds
      .map(id => this.notifications.get(id))
      .filter((notif): notif is Notification => {
        if (!notif) return false;
        if (!includeRead && notif.isRead) return false;
        if (notif.expiresAt && notif.expiresAt < new Date()) return false;
        return true;
      })
      .slice(0, limit);
    
    return notifications;
  }

  getUnreadCount(userId: number): number {
    return this.getUserNotifications(userId, 100, false).length;
  }

  markAsRead(notificationId: string, userId: number): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.userId === userId) {
      notification.isRead = true;
      return true;
    }
    return false;
  }

  markAllAsRead(userId: number): number {
    const userNotifIds = this.userNotifications.get(userId) || [];
    let markedCount = 0;
    
    userNotifIds.forEach(id => {
      const notification = this.notifications.get(id);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        markedCount++;
      }
    });
    
    return markedCount;
  }
}

const notificationStore = new NotificationStore();

// Initialize with some sample notifications for testing
function initializeSampleNotifications() {
  notificationStore.addNotification({
    userId: 1,
    type: NotificationType.SYSTEM,
    title: 'Welcome to Pickle+',
    message: 'Your pickleball journey starts here! Explore features and connect with players.',
    link: '/features',
    isRead: false
  });

  notificationStore.addNotification({
    userId: 1,
    type: NotificationType.ACHIEVEMENT,
    title: 'First Match Recorded!',
    message: 'Congratulations on recording your first match. Keep up the great play!',
    link: '/dashboard',
    isRead: false
  });

  notificationStore.addNotification({
    userId: 1,
    type: NotificationType.COACHING,
    title: 'Coaching Profile Complete',
    message: 'Your coaching profile is now active and visible to potential students.',
    link: '/profile',
    isRead: false
  });
}

// Initialize sample data
initializeSampleNotifications();

// Get user notifications
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const includeRead = req.query.includeRead === 'true';

    const notifications = notificationStore.getUserNotifications(userId, limit, includeRead);
    
    res.json({
      success: true,
      data: notifications,
      meta: {
        total: notifications.length,
        unreadCount: notificationStore.getUnreadCount(userId)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const unreadCount = notificationStore.getUnreadCount(userId);
    
    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const success = notificationStore.markAsRead(notificationId, userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const markedCount = notificationStore.markAllAsRead(userId);
    
    res.json({
      success: true,
      message: `${markedCount} notifications marked as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Create notification (for system use)
router.post('/create', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const createSchema = z.object({
      userId: z.number(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      link: z.string().optional(),
      expiresAt: z.string().optional()
    });

    const data = createSchema.parse(req.body);
    
    const notification = notificationStore.addNotification({
      ...data,
      isRead: false,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Helper function to create notifications (can be called from other parts of the app)
export function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  expiresAt?: Date;
}): Notification {
  return notificationStore.addNotification({
    ...data,
    isRead: false
  });
}

export default router;