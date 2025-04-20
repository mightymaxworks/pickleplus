/**
 * PKL-278651-COMM-0028-SCHEMA - Notification Schema
 * Implementation timestamp: 2025-04-20 10:20 ET
 * 
 * Schema definitions for notifications
 * 
 * Framework 5.2 compliant implementation
 */

import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Notification types enum
export enum NotificationType {
  SYSTEM = 'system',
  MATCH = 'match',
  ACHIEVEMENT = 'achievement',
  COMMUNITY = 'community',
  EVENT = 'event',
  SOCIAL = 'social',
  XP = 'xp',
  RANKING = 'ranking'
}

// Notification channels enum
export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push'
}

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  type: text('type').notNull().default(NotificationType.SYSTEM),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
  metadata: text('metadata') // JSON string for additional data
});

// Notification preferences table
export const notificationPreferences = pgTable('notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  notificationType: text('notification_type').notNull(),
  channel: text('channel').notNull().default(NotificationChannel.IN_APP),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  communityId: integer('community_id')
});

// Define schemas
export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, readAt: true, createdAt: true });

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Define types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;