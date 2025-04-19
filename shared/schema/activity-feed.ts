/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Schemas
 * 
 * This file defines the database schemas for activity feeds.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { users } from "../schema";
import { communities } from "./community";

/**
 * Activity Feed Entries Table
 */
export const activityFeedEntries = pgTable("activity_feed_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  content: text("content").notNull(),
  communityId: integer("community_id").references(() => communities.id),
  metadata: jsonb("metadata"),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: varchar("related_entity_type", { length: 100 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

/**
 * Activity Feed Entries Relations
 */
export const activityFeedEntriesRelations = relations(activityFeedEntries, ({ one }) => ({
  user: one(users, {
    fields: [activityFeedEntries.userId],
    references: [users.id]
  }),
  community: one(communities, {
    fields: [activityFeedEntries.communityId],
    references: [communities.id]
  })
}));

/**
 * Activity Feed Read Status Table
 * Tracks which users have read which activities
 */
export const activityReadStatus = pgTable("activity_read_status", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityId: integer("activity_id").notNull().references(() => activityFeedEntries.id),
  readAt: timestamp("read_at").defaultNow()
});

/**
 * Activity Read Status Relations
 */
export const activityReadStatusRelations = relations(activityReadStatus, ({ one }) => ({
  user: one(users, {
    fields: [activityReadStatus.userId],
    references: [users.id]
  }),
  activity: one(activityFeedEntries, {
    fields: [activityReadStatus.activityId],
    references: [activityFeedEntries.id]
  })
}));

/**
 * Activity Feed Settings Table
 * User preferences for activity feed
 */
export const activityFeedSettings = pgTable("activity_feed_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  showGlobalActivities: boolean("show_global_activities").default(true),
  showCommunityActivities: boolean("show_community_activities").default(true),
  showFriendActivities: boolean("show_friend_activities").default(true),
  showAchievementActivities: boolean("show_achievement_activities").default(true),
  showMatchActivities: boolean("show_match_activities").default(true),
  showTournamentActivities: boolean("show_tournament_activities").default(true),
  activityDisplayLimit: integer("activity_display_limit").default(50),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Activity Feed Settings Relations
 */
export const activityFeedSettingsRelations = relations(activityFeedSettings, ({ one }) => ({
  user: one(users, {
    fields: [activityFeedSettings.userId],
    references: [users.id]
  })
}));

// Create insert schemas
export const insertActivityFeedEntrySchema = createInsertSchema(activityFeedEntries);
export const insertActivityReadStatusSchema = createInsertSchema(activityReadStatus);
export const insertActivityFeedSettingsSchema = createInsertSchema(activityFeedSettings);

// Define types
export type ActivityFeedEntry = typeof activityFeedEntries.$inferSelect;
export type InsertActivityFeedEntry = typeof activityFeedEntries.$inferInsert;

export type ActivityReadStatus = typeof activityReadStatus.$inferSelect;
export type InsertActivityReadStatus = typeof activityReadStatus.$inferInsert;

export type ActivityFeedSettings = typeof activityFeedSettings.$inferSelect;
export type InsertActivityFeedSettings = typeof activityFeedSettings.$inferInsert;