/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Schema
 * 
 * This module defines the database schema for the activity feed feature.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-19
 * @framework Framework5.1
 */

import { 
  integer, 
  serial, 
  text, 
  boolean, 
  timestamp, 
  pgTable, 
  json 
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

/**
 * Activity Feed Entries Table
 * Stores activity feed events
 */
export const activityFeedEntries = pgTable('activity_feed_entries', {
  id: serial('id').primaryKey(),
  
  // User who performed the activity
  userId: integer('user_id').notNull(),
  
  // Username (denormalized for performance)
  username: text('username').notNull(),
  
  // Display name (optional)
  displayName: text('display_name'),
  
  // User avatar URL (optional)
  avatar: text('avatar'),
  
  // Type of activity (e.g., match_recorded, achievement_unlocked)
  type: text('type').notNull(),
  
  // Content of the activity
  content: text('content').notNull(),
  
  // Timestamp when the activity occurred
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  
  // Community ID (if activity is related to a community)
  communityId: integer('community_id'),
  
  // Community name (denormalized for performance)
  communityName: text('community_name'),
  
  // Additional metadata (stored as JSON)
  metadata: json('metadata'),
  
  // Related entity (e.g., match ID, achievement ID)
  relatedEntityId: integer('related_entity_id'),
  
  // Type of related entity (e.g., match, achievement)
  relatedEntityType: text('related_entity_type'),
  
  // Target user ID (if activity is directed at a specific user)
  targetUserId: integer('target_user_id'),
  
  // When the activity was created
  createdAt: timestamp('created_at').notNull().defaultNow()
});

/**
 * Activity Read Status Table
 * Tracks which users have read which activities
 */
export const activityReadStatus = pgTable('activity_read_status', {
  id: serial('id').primaryKey(),
  
  // User who read the activity
  userId: integer('user_id').notNull(),
  
  // Activity that was read
  activityId: integer('activity_id').notNull(),
  
  // When the activity was read
  readAt: timestamp('read_at').notNull().defaultNow()
});

/**
 * Activity Feed Settings Table
 * Stores user preferences for activity feeds
 */
export const activityFeedSettings = pgTable('activity_feed_settings', {
  id: serial('id').primaryKey(),
  
  // User ID
  userId: integer('user_id').notNull().unique(),
  
  // Whether to send email notifications for activities
  emailNotifications: boolean('email_notifications').notNull().default(true),
  
  // Whether to send push notifications for activities
  pushNotifications: boolean('push_notifications').notNull().default(true),
  
  // Whether to show read activities in the feed
  showReadActivities: boolean('show_read_activities').notNull().default(false),
  
  // How many activities to display in the feed (default: 50)
  activityDisplayLimit: integer('activity_display_limit').notNull().default(50),
  
  // When the settings were last updated
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Relations
 */
export const activityFeedEntriesRelations = relations(activityFeedEntries, ({ many }) => ({
  readStatus: many(activityReadStatus)
}));

export const activityReadStatusRelations = relations(activityReadStatus, ({ one }) => ({
  activity: one(activityFeedEntries, {
    fields: [activityReadStatus.activityId],
    references: [activityFeedEntries.id]
  })
}));

/**
 * Schemas
 */
export const insertActivityFeedEntrySchema = createInsertSchema(activityFeedEntries)
  .extend({
    // Add validation rules if needed
    content: z.string().min(1).max(500)
  })
  .omit({ id: true });

export const insertActivityReadStatusSchema = createInsertSchema(activityReadStatus)
  .omit({ id: true });

export const insertActivityFeedSettingsSchema = createInsertSchema(activityFeedSettings)
  .omit({ id: true });

/**
 * Types
 */
export type ActivityFeedItem = typeof activityFeedEntries.$inferSelect;
export type InsertActivityFeedItem = z.infer<typeof insertActivityFeedEntrySchema>;

export type ActivityReadStatus = typeof activityReadStatus.$inferSelect;
export type InsertActivityReadStatus = z.infer<typeof insertActivityReadStatusSchema>;

export type ActivityFeedSettings = typeof activityFeedSettings.$inferSelect;
export type InsertActivityFeedSettings = z.infer<typeof insertActivityFeedSettingsSchema>;