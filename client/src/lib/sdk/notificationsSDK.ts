/**
 * PKL-278651-COMM-0028-NOTIF - Notifications SDK Service
 * Implementation timestamp: 2025-04-19 15:25 ET
 * 
 * SDK for notifications API interactions
 * 
 * Framework 5.2 compliant implementation
 */

import { apiRequest } from '@/lib/queryClient';

export interface UserNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  referenceType: string | null;
  referenceId: number | null;
  link: string | null;
  communityId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationUnreadCount {
  count: number;
}

export interface GetNotificationsParams {
  limit?: number;
  offset?: number;
  filterType?: string;
  includeRead?: boolean;
}

export interface GetNotificationResponse {
  notifications: UserNotification[];
  total: number;
}

/**
 * Notifications SDK service for API interactions
 */
export const notificationsSDK = {
  /**
   * Get notifications with optional filtering
   */
  async getNotifications(params: GetNotificationsParams = {}): Promise<UserNotification[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
      if (params.filterType) queryParams.append('type', params.filterType);
      if (params.includeRead !== undefined) queryParams.append('includeRead', params.includeRead.toString());
      
      const url = `/api/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await apiRequest('GET', url);
      
      if (!res.ok) {
        console.error('Error fetching notifications:', await res.text());
        return []; // Return empty array as fallback
      }
      
      const data = await res.json();
      return data.notifications || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return []; // Return empty array on error
    }
  },
  
  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<NotificationUnreadCount> {
    try {
      const res = await apiRequest('GET', '/api/notifications/unread-count');
      
      if (!res.ok) {
        console.error('Error fetching notification count:', await res.text());
        return { count: 0 }; // Return zero as fallback
      }
      
      return await res.json();
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      return { count: 0 }; // Return zero on error
    }
  },
  
  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    try {
      const res = await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
      if (!res.ok) {
        console.error('Error marking notification as read:', await res.text());
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },
  
  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      const res = await apiRequest('POST', '/api/notifications/read-all');
      if (!res.ok) {
        console.error('Error marking all notifications as read:', await res.text());
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
  
  /**
   * Get notification by ID
   */
  async getNotification(notificationId: number): Promise<UserNotification | null> {
    try {
      const res = await apiRequest('GET', `/api/notifications/${notificationId}`);
      
      if (!res.ok) {
        console.error('Error fetching notification details:', await res.text());
        return null;
      }
      
      return await res.json();
    } catch (error) {
      console.error('Failed to fetch notification details:', error);
      return null;
    }
  },
  
  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
    try {
      const res = await apiRequest('DELETE', `/api/notifications/${notificationId}`);
      if (!res.ok) {
        console.error('Error deleting notification:', await res.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  },
  
  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<boolean> {
    try {
      const res = await apiRequest('DELETE', '/api/notifications');
      if (!res.ok) {
        console.error('Error clearing all notifications:', await res.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      return false;
    }
  },
};