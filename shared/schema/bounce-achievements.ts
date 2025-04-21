/**
 * PKL-278651-BOUNCE-0004-GAME
 * Bounce Achievements & Gamification Schema
 * 
 * Defines the database schema for Bounce achievements and gamification features.
 * This connects the automated testing system with the gamification framework.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { pgTable, serial, varchar, text, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { bounceInteractions, bounceFindings, users } from "../schema";

/**
 * Achievement types specifically for the Bounce system
 */
export enum BounceAchievementType {
  TESTER_PARTICIPATION = "tester_participation",
  ISSUE_DISCOVERY = "issue_discovery", 
  VERIFICATION = "verification",
  FEEDBACK = "feedback",
  FIXING = "fixing",
  MILESTONE = "milestone"
}

/**
 * Bounce Achievements - Defines achievements that users can earn through Bounce testing
 */
export const bounceAchievements = pgTable("bounce_achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  badgeImageUrl: varchar("badge_image_url", { length: 255 }),
  requiredPoints: integer("required_points"),
  requiredInteractions: integer("required_interactions"),
  requiredInteractionTypes: json("required_interaction_types").default([]),
  xpReward: integer("xp_reward").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * User Bounce Achievements - Tracks the achievements earned by users
 */
export const userBounceAchievements = pgTable("user_bounce_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => bounceAchievements.id),
  progress: integer("progress").default(0),
  isComplete: boolean("is_complete").default(false),
  awardedAt: timestamp("awarded_at"),
  notified: boolean("notified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Bounce leaderboard - Tracks top contributors to Bounce testing
 */
export const bounceLeaderboard = pgTable("bounce_leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalPoints: integer("total_points").default(0),
  totalInteractions: integer("total_interactions").default(0),
  totalFindings: integer("total_findings").default(0),
  totalVerifications: integer("total_verifications").default(0),
  lastInteractionAt: timestamp("last_interaction_at"),
  streakDays: integer("streak_days").default(0),
  rank: integer("rank"),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations definitions
export const bounceAchievementsRelations = relations(bounceAchievements, ({ many }) => ({
  userAchievements: many(userBounceAchievements)
}));

export const userBounceAchievementsRelations = relations(userBounceAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userBounceAchievements.userId],
    references: [users.id]
  }),
  achievement: one(bounceAchievements, {
    fields: [userBounceAchievements.achievementId],
    references: [bounceAchievements.id]
  })
}));

export const bounceLeaderboardRelations = relations(bounceLeaderboard, ({ one }) => ({
  user: one(users, {
    fields: [bounceLeaderboard.userId],
    references: [users.id]
  })
}));

// Create insert schemas using Zod
export const insertBounceAchievementSchema = createInsertSchema(bounceAchievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserBounceAchievementSchema = createInsertSchema(userBounceAchievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBounceLeaderboardSchema = createInsertSchema(bounceLeaderboard).omit({
  id: true,
  updatedAt: true
});

// Export types derived from schemas
export type BounceAchievement = typeof bounceAchievements.$inferSelect;
export type InsertBounceAchievement = z.infer<typeof insertBounceAchievementSchema>;

export type UserBounceAchievement = typeof userBounceAchievements.$inferSelect;
export type InsertUserBounceAchievement = z.infer<typeof insertUserBounceAchievementSchema>;

export type BounceLeaderboardEntry = typeof bounceLeaderboard.$inferSelect;
export type InsertBounceLeaderboardEntry = z.infer<typeof insertBounceLeaderboardSchema>;