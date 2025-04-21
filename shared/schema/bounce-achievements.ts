/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Achievements Schema
 * 
 * This file defines the database schema for Bounce achievements and user achievement tracking.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Bounce achievements table
 * Stores achievement definitions for the Bounce gamification system
 */
export const bounceAchievements = pgTable('bounce_achievements', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description').notNull(),
  xpValue: integer('xp_value').notNull().default(0),
  iconPath: varchar('icon_path', { length: 255 }),
  displayOrder: integer('display_order').notNull().default(0),
  category: varchar('category', { length: 50 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  rarity: varchar('rarity', { length: 20 }).notNull().default('Common'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * User bounce achievements table
 * Links users to their earned Bounce achievements
 */
export const userBounceAchievements = pgTable('user_bounce_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: integer('achievement_id').notNull().references(() => bounceAchievements.id, { onDelete: 'cascade' }),
  isComplete: boolean('is_complete').notNull().default(false),
  progress: integer('progress').notNull().default(0),
  awardedAt: timestamp('awarded_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Relations for bounce achievements
 */
export const bounceAchievementsRelations = relations(bounceAchievements, ({ many }) => ({
  userAchievements: many(userBounceAchievements)
}));

/**
 * Relations for user bounce achievements
 */
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

/**
 * Zod schema for inserting bounce achievements
 */
export const insertBounceAchievementSchema = createInsertSchema(bounceAchievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Zod schema for inserting user bounce achievements
 */
export const insertUserBounceAchievementSchema = createInsertSchema(userBounceAchievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Type for bounce achievements
 */
export type BounceAchievement = typeof bounceAchievements.$inferSelect;

/**
 * Type for inserting bounce achievements
 */
export type InsertBounceAchievement = z.infer<typeof insertBounceAchievementSchema>;

/**
 * Type for user bounce achievements
 */
export type UserBounceAchievement = typeof userBounceAchievements.$inferSelect;

/**
 * Type for inserting user bounce achievements
 */
export type InsertUserBounceAchievement = z.infer<typeof insertUserBounceAchievementSchema>;

// Import users to complete the reference
import { users } from "../schema";