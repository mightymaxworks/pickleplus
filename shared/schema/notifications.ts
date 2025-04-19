/**
 * [PKL-278651-COMM-0028-NOTIF] Community Notifications Schema
 * Implementation timestamp: 2025-04-19 13:30 ET
 * 
 * Schema definitions for community notifications functionality.
 * 
 * Framework 5.2 compliance verified:
 * - Module-specific schema
 * - Clear type definitions
 * - Explicit relationships
 */
import { pgTable, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User notifications
export const userNotifications = pgTable('user_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(), // Reference to users.id
  type: varchar('type', { length: 50 }).notNull(), // 'community_post', 'mention', 'report_status', etc.
  title: varchar('title', { length: 100 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  referenceType: varchar('reference_type', { length: 50 }), // 'post', 'comment', 'event', 'report', etc.
  referenceId: integer('reference_id'),
  communityId: integer('community_id'), // Reference to communities.id
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(), // Reference to users.id
  communityId: integer('community_id'), // Reference to communities.id, null = global preference
  notificationType: varchar('notification_type', { length: 50 }).notNull(), // 'post', 'comment', 'mention', etc.
  channel: varchar('channel', { length: 20 }).notNull(), // 'app', 'email'
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Note: Relations will be defined in the main schema.ts file where all tables are available

// Create insert schemas using drizzle-zod
export const insertUserNotificationSchema = createInsertSchema(userNotifications, {
  type: z.string().min(2).max(50),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  referenceType: z.string().min(1).max(50).optional(),
}).omit({ id: true, isRead: true, createdAt: true, updatedAt: true, deletedAt: true });

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences, {
  notificationType: z.string().min(1).max(50),
  channel: z.enum(['app', 'email']),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Create type definitions
export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;