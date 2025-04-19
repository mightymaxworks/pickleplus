/**
 * PKL-278651-COMM-0028-NOTIF - Community Notifications SDK
 * Implementation timestamp: 2025-04-19 14:45 ET
 * 
 * SDK for interacting with notification API endpoints
 * 
 * Framework 5.2 compliant implementation
 */

import { apiRequest } from '../queryClient';
import { z } from 'zod';

// Notification types from schema
export interface UserNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  referenceType?: string;
  referenceId?: number;
  communityId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface NotificationPreference {
  id: number;
  userId: number;
  communityId?: number;
  notificationType: string;
  channel: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// SDK Functions
export const notificationsSDK = {
  /**
   * Get all notifications for the current user
   */
  getNotifications: async (params?: { limit?: number; offset?: number }): Promise<UserNotification[]> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await apiRequest('GET', `/api/notifications${query}`);
    return await res.json();
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    const res = await apiRequest('GET', '/api/notifications/unread-count');
    return await res.json();
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId: number): Promise<void> => {
    await apiRequest('POST', `/api/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await apiRequest('POST', '/api/notifications/read-all');
  },

  /**
   * Get notification preferences
   */
  getPreferences: async (communityId?: number): Promise<NotificationPreference[]> => {
    const query = communityId ? `?communityId=${communityId}` : '';
    const res = await apiRequest('GET', `/api/notifications/preferences${query}`);
    return await res.json();
  },

  /**
   * Update notification preference
   */
  updatePreference: async (data: {
    notificationType: string;
    channel: string;
    enabled: boolean;
    communityId?: number;
  }): Promise<void> => {
    await apiRequest('POST', '/api/notifications/preferences', data);
  }
};