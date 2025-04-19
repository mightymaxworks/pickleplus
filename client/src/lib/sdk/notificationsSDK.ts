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
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.filterType) queryParams.append('type', params.filterType);
    if (params.includeRead !== undefined) queryParams.append('includeRead', params.includeRead.toString());
    
    const url = `/api/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const res = await apiRequest('GET', url);
    const data = await res.json();
    return data.notifications;
  },
  
  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<NotificationUnreadCount> {
    const res = await apiRequest('GET', '/api/notifications/unread-count');
    return await res.json();
  },
  
  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    await apiRequest('PATCH', `/api/notifications/${notificationId}/read`);
  },
  
  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiRequest('PATCH', '/api/notifications/mark-all-read');
  },
  
  /**
   * Get notification by ID
   */
  async getNotification(notificationId: number): Promise<UserNotification> {
    const res = await apiRequest('GET', `/api/notifications/${notificationId}`);
    return await res.json();
  },
  
  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    await apiRequest('DELETE', `/api/notifications/${notificationId}`);
  },
  
  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await apiRequest('DELETE', '/api/notifications');
  },
};