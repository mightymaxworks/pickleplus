/**
 * PKL-278651-COMM-0022-FEED
 * Activity Feed Schema
 * 
 * Extended schema for the community activity feed with additional fields
 * for real-time updates.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 * @lastModified 2025-04-19
 */

import { relations } from "drizzle-orm";
import { pgTable, serial, integer, varchar, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";
import { communities } from "./community";

/**
 * Community activities table enhanced for the real-time feed.
 * This extends the base communityActivities table from community-engagement.ts
 * with additional fields specific to the activity feed.
 */
export const communityActivityFeed = pgTable("community_activity_feed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  type: varchar("type", { length: 50 }).notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  isPublic: boolean("is_public").default(true),
  isHidden: boolean("is_hidden").default(false),
  impressionCount: integer("impression_count").default(0)
});

/**
 * Relationship between activities and users who have interacted with them
 */
export const activityInteractions = pgTable("activity_interactions", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull().references(() => communityActivityFeed.id),
  userId: integer("user_id").notNull().references(() => users.id),
  interactionType: varchar("interaction_type", { length: 20 }).notNull(), // like, view, share
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata")
});

/**
 * Activity feed settings per user
 */
export const activityFeedSettings = pgTable("activity_feed_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  showPublicActivities: boolean("show_public_activities").default(true),
  showCommunityActivities: boolean("show_community_activities").default(true),
  showFriendActivities: boolean("show_friend_activities").default(true),
  notifyOnMention: boolean("notify_on_mention").default(true),
  notifyOnComment: boolean("notify_on_comment").default(true),
  notifyOnLike: boolean("notify_on_like").default(true),
  activityTypesFilter: jsonb("activity_types_filter"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Relations
export const communityActivityFeedRelations = relations(
  communityActivityFeed, 
  ({ one, many }) => ({
    user: one(users, {
      fields: [communityActivityFeed.userId],
      references: [users.id],
    }),
    community: one(communities, {
      fields: [communityActivityFeed.communityId],
      references: [communities.id],
    }),
    interactions: many(activityInteractions)
  })
);

export const activityInteractionsRelations = relations(
  activityInteractions, 
  ({ one }) => ({
    activity: one(communityActivityFeed, {
      fields: [activityInteractions.activityId],
      references: [communityActivityFeed.id],
    }),
    user: one(users, {
      fields: [activityInteractions.userId],
      references: [users.id],
    }),
  })
);

export const activityFeedSettingsRelations = relations(
  activityFeedSettings, 
  ({ one }) => ({
    user: one(users, {
      fields: [activityFeedSettings.userId],
      references: [users.id],
    }),
  })
);

// Zod validation schemas
export const insertCommunityActivityFeedSchema = createInsertSchema(
  communityActivityFeed, 
  {
    metadata: z.any().optional(),
  }
);

export const insertActivityInteractionSchema = createInsertSchema(
  activityInteractions, 
  {
    metadata: z.any().optional(),
  }
);

export const insertActivityFeedSettingsSchema = createInsertSchema(
  activityFeedSettings, 
  {
    activityTypesFilter: z.any().optional(),
  }
);

// TypeScript types
export type CommunityActivityFeed = typeof communityActivityFeed.$inferSelect;
export type InsertCommunityActivityFeed = z.infer<typeof insertCommunityActivityFeedSchema>;

export type ActivityInteraction = typeof activityInteractions.$inferSelect;
export type InsertActivityInteraction = z.infer<typeof insertActivityInteractionSchema>;

export type ActivityFeedSettings = typeof activityFeedSettings.$inferSelect;
export type InsertActivityFeedSettings = z.infer<typeof insertActivityFeedSettingsSchema>;