/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Engagement Metrics Schema
 * 
 * This schema defines database tables for tracking community engagement,
 * including member activity, participation metrics, and contribution levels.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-18
 * @framework Framework5.1
 */

import { integer, pgTable, serial, timestamp, varchar, index, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";
import { communities } from "./community";

/**
 * Community Activity Types
 * Different types of activities that contribute to engagement metrics
 */
export enum CommunityActivityType {
  POST_CREATED = "POST_CREATED",
  COMMENT_ADDED = "COMMENT_ADDED",
  EVENT_CREATED = "EVENT_CREATED",
  EVENT_ATTENDED = "EVENT_ATTENDED",
  RESOURCE_SHARED = "RESOURCE_SHARED",
  QUESTION_ASKED = "QUESTION_ASKED",
  QUESTION_ANSWERED = "QUESTION_ANSWERED",
  REACTION_ADDED = "REACTION_ADDED",
  POLL_CREATED = "POLL_CREATED",
  POLL_VOTED = "POLL_VOTED"
}

/**
 * Community Member Activities
 * Tracks individual activities performed by community members
 */
export const communityActivities = pgTable("community_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  activityData: json("activity_data"),
  points: integer("points").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isHidden: boolean("is_hidden").default(false),
}, (table) => {
  return {
    userIdIdx: index("community_activities_user_id_idx").on(table.userId),
    communityIdIdx: index("community_activities_community_id_idx").on(table.communityId),
    activityTypeIdx: index("community_activities_activity_type_idx").on(table.activityType),
    createdAtIdx: index("community_activities_created_at_idx").on(table.createdAt)
  };
});

/**
 * Community Engagement Metrics
 * Aggregated metrics for each user in a community
 */
export const communityEngagementMetrics = pgTable("community_engagement_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  totalPoints: integer("total_points").notNull().default(0),
  totalActivities: integer("total_activities").notNull().default(0),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  streakDays: integer("streak_days").notNull().default(0),
  engagementLevel: varchar("engagement_level", { length: 20 }).default("NEWCOMER"),
  postCount: integer("post_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  eventAttendance: integer("event_attendance").notNull().default(0),
  contributionData: json("contribution_data"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    userCommunityIdx: index("community_engagement_metrics_user_community_idx").on(table.userId, table.communityId),
    totalPointsIdx: index("community_engagement_metrics_total_points_idx").on(table.totalPoints),
    engagementLevelIdx: index("community_engagement_metrics_engagement_level_idx").on(table.engagementLevel),
  };
});

/**
 * Community Engagement Levels
 * Defines different levels of engagement with thresholds and benefits
 */
export const communityEngagementLevels = pgTable("community_engagement_levels", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  levelName: varchar("level_name", { length: 50 }).notNull(),
  pointThreshold: integer("point_threshold").notNull(),
  description: varchar("description", { length: 255 }),
  benefits: json("benefits"),
  badgeImageUrl: varchar("badge_image_url", { length: 255 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    communityIdIdx: index("community_engagement_levels_community_id_idx").on(table.communityId),
    pointThresholdIdx: index("community_engagement_levels_point_threshold_idx").on(table.pointThreshold),
  };
});

/**
 * Community Activity Leaderboard
 * Weekly/monthly leaderboards for community engagement
 */
export const communityLeaderboards = pgTable("community_leaderboards", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  period: varchar("period", { length: 20 }).notNull(), // WEEKLY, MONTHLY, ALL_TIME
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  leaderboardData: json("leaderboard_data").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    communityPeriodIdx: index("community_leaderboards_community_period_idx").on(table.communityId, table.period),
    dateRangeIdx: index("community_leaderboards_date_range_idx").on(table.startDate, table.endDate),
  };
});

// Insert Schemas and Types using Drizzle-Zod

// Community Activity Insert Schema
export const insertCommunityActivitySchema = createInsertSchema(communityActivities, {
  activityType: z.nativeEnum(CommunityActivityType),
  activityData: z.record(z.any()).optional(),
}).omit({ id: true });

export type InsertCommunityActivity = z.infer<typeof insertCommunityActivitySchema>;
export type CommunityActivity = typeof communityActivities.$inferSelect;

// Community Engagement Metrics Insert Schema
export const insertCommunityEngagementMetricSchema = createInsertSchema(communityEngagementMetrics, {
  contributionData: z.record(z.any()).optional(),
}).omit({ id: true, updatedAt: true });

export type InsertCommunityEngagementMetric = z.infer<typeof insertCommunityEngagementMetricSchema>;
export type CommunityEngagementMetric = typeof communityEngagementMetrics.$inferSelect;

// Community Engagement Level Insert Schema
export const insertCommunityEngagementLevelSchema = createInsertSchema(communityEngagementLevels, {
  benefits: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertCommunityEngagementLevel = z.infer<typeof insertCommunityEngagementLevelSchema>;
export type CommunityEngagementLevel = typeof communityEngagementLevels.$inferSelect;

// Community Leaderboard Insert Schema
export const insertCommunityLeaderboardSchema = createInsertSchema(communityLeaderboards, {
  leaderboardData: z.array(z.record(z.any())).or(z.record(z.any())).optional(),
}).omit({ id: true, createdAt: true });

export type InsertCommunityLeaderboard = z.infer<typeof insertCommunityLeaderboardSchema>;
export type CommunityLeaderboard = typeof communityLeaderboards.$inferSelect;