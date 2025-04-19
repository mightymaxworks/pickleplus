/**
 * PKL-278651-COMM-0021-ENGAGE
 * Community Engagement Metrics Schema
 * 
 * Schema definitions for community engagement metrics tables.
 */

import { relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, serial, text, timestamp, unique, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { communities, users } from './index';

/**
 * Community Engagement Metrics Table
 * Tracks individual user engagement metrics for each community
 */
export const communityEngagementMetrics = pgTable('community_engagement_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  communityId: integer('community_id').notNull().references(() => communities.id),
  totalPoints: integer('total_points').notNull().default(0),
  totalActivities: integer('total_activities').notNull().default(0),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow(),
  streakDays: integer('streak_days').notNull().default(0),
  engagementLevel: varchar('engagement_level', { length: 20 }).default('NEWCOMER'),
  postCount: integer('post_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  eventAttendance: integer('event_attendance').notNull().default(0),
  contributionData: jsonb('contribution_data'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userCommunityUnique: unique().on(table.userId, table.communityId),
  };
});

/**
 * Community Activities Table
 * Records individual user activities within communities
 */
export const communityActivities = pgTable('community_activities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  communityId: integer('community_id').notNull().references(() => communities.id),
  activityType: varchar('activity_type', { length: 50 }).notNull(),
  activityData: jsonb('activity_data'),
  points: integer('points').notNull().default(1),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Community Engagement Levels Table
 * Defines engagement levels and their thresholds for communities
 */
export const communityEngagementLevels = pgTable('community_engagement_levels', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  levelName: varchar('level_name', { length: 50 }).notNull(),
  pointThreshold: integer('point_threshold').notNull(),
  description: text('description'),
  benefits: jsonb('benefits'),
  badgeImageUrl: varchar('badge_image_url', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    communityLevelUnique: unique().on(table.communityId, table.levelName),
  };
});

/**
 * Community Leaderboards Table
 * Stores leaderboard data for communities
 */
export const communityLeaderboards = pgTable('community_leaderboards', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  userId: integer('user_id').notNull().references(() => users.id),
  leaderboardType: varchar('leaderboard_type', { length: 50 }).notNull(),
  points: integer('points').notNull().default(0),
  rank: integer('rank'),
  timePeriod: varchar('time_period', { length: 20 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    communityUserLeaderboardUnique: unique().on(
      table.communityId, 
      table.userId, 
      table.leaderboardType, 
      table.timePeriod
    ),
  };
});

// Relations

export const communityEngagementMetricsRelations = relations(
  communityEngagementMetrics, 
  ({ one }) => ({
    user: one(users, {
      fields: [communityEngagementMetrics.userId],
      references: [users.id],
    }),
    community: one(communities, {
      fields: [communityEngagementMetrics.communityId],
      references: [communities.id],
    }),
  })
);

export const communityActivitiesRelations = relations(
  communityActivities, 
  ({ one }) => ({
    user: one(users, {
      fields: [communityActivities.userId],
      references: [users.id],
    }),
    community: one(communities, {
      fields: [communityActivities.communityId],
      references: [communities.id],
    }),
  })
);

export const communityEngagementLevelsRelations = relations(
  communityEngagementLevels, 
  ({ one }) => ({
    community: one(communities, {
      fields: [communityEngagementLevels.communityId],
      references: [communities.id],
    }),
  })
);

export const communityLeaderboardsRelations = relations(
  communityLeaderboards, 
  ({ one }) => ({
    user: one(users, {
      fields: [communityLeaderboards.userId],
      references: [users.id],
    }),
    community: one(communities, {
      fields: [communityLeaderboards.communityId],
      references: [communities.id],
    }),
  })
);

// Zod schemas for validation

export const insertCommunityEngagementMetricsSchema = createInsertSchema(
  communityEngagementMetrics, 
  {
    contributionData: z.any().optional(),
  }
);

export const insertCommunityActivitySchema = createInsertSchema(
  communityActivities, 
  {
    activityData: z.any().optional(),
  }
);

export const insertCommunityEngagementLevelSchema = createInsertSchema(
  communityEngagementLevels, 
  {
    benefits: z.any().optional(),
  }
);

export const insertCommunityLeaderboardSchema = createInsertSchema(
  communityLeaderboards
);

// Types for TypeScript
export type CommunityEngagementMetrics = typeof communityEngagementMetrics.$inferSelect;
export type InsertCommunityEngagementMetrics = z.infer<typeof insertCommunityEngagementMetricsSchema>;

export type CommunityActivity = typeof communityActivities.$inferSelect;
export type InsertCommunityActivity = z.infer<typeof insertCommunityActivitySchema>;

export type CommunityEngagementLevel = typeof communityEngagementLevels.$inferSelect;
export type InsertCommunityEngagementLevel = z.infer<typeof insertCommunityEngagementLevelSchema>;

export type CommunityLeaderboard = typeof communityLeaderboards.$inferSelect;
export type InsertCommunityLeaderboard = z.infer<typeof insertCommunityLeaderboardSchema>;