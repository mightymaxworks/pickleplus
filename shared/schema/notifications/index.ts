/**
 * PKL-278651-COMM-0028-NOTIF-SCHEMA - Notification Schema
 * Implementation timestamp: 2025-04-20 10:20 ET
 * 
 * Schema for notifications and notification preferences
 * 
 * Framework 5.2 compliant implementation
 */

import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  integer, 
  text, 
  varchar, 
  timestamp, 
  boolean, 
  json,
  primaryKey
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../../schema';

/**
 * User Notifications Table
 * Stores all notifications for users
 */
export const userNotifications = pgTable('user_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  link: varchar('link', { length: 255 }),
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: integer('reference_id'),
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at')
});

// Relations for user notifications
export const userNotificationsRelations = relations(userNotifications, ({ one }) => ({
  user: one(users, {
    fields: [userNotifications.userId],
    references: [users.id]
  })
}));

/**
 * Notification Preferences Table
 * Stores user preferences for notifications
 */
export const notificationPreferences = pgTable('notification_preferences', {
  userId: integer('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  channels: json('channels').$type<string[]>().notNull().default(['app']),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.type] })
  };
});

// Relations for notification preferences
export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id]
  })
}));

// Insert schemas
export const insertUserNotificationSchema = createInsertSchema(userNotifications);
export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences);

// Add validation
export const insertUserNotificationSchemaValidated = insertUserNotificationSchema.extend({
  // Validate message length
  message: z.string().min(1).max(1000),
  // Validate type from allowed notification types
  type: z.enum([
    'system_message', 
    'match_recorded', 
    'match_invite', 
    'friend_request', 
    'achievement_earned',
    'community_post', 
    'community_comment', 
    'community_event', 
    'event_reminder',
    'event_registration',
    'event_cancellation',
    'xp_earned',
    'level_up',
    'tournament_invite',
    'tournament_update'
  ]),
  // Optional fields
  link: z.string().url().nullable().optional(),
  referenceType: z.string().nullable().optional(),
  referenceId: z.number().int().positive().nullable().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional()
});

// Types
export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;

/**
 * Notification Types
 * Represents all possible notification types in the system
 */
export enum NotificationType {
  SYSTEM_MESSAGE = 'system_message',
  MATCH_RECORDED = 'match_recorded',
  MATCH_INVITE = 'match_invite',
  FRIEND_REQUEST = 'friend_request',
  ACHIEVEMENT_EARNED = 'achievement_earned',
  COMMUNITY_POST = 'community_post',
  COMMUNITY_COMMENT = 'community_comment',
  COMMUNITY_EVENT = 'community_event',
  EVENT_REMINDER = 'event_reminder',
  EVENT_REGISTRATION = 'event_registration',
  EVENT_CANCELLATION = 'event_cancellation',
  XP_EARNED = 'xp_earned',
  LEVEL_UP = 'level_up',
  TOURNAMENT_INVITE = 'tournament_invite',
  TOURNAMENT_UPDATE = 'tournament_update'
}

/**
 * Notification Channels
 * Represents the delivery channels for notifications
 */
export enum NotificationChannel {
  APP = 'app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms'
}