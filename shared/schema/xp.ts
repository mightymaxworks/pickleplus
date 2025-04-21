/**
 * PKL-278651-BOUNCE-0004-GAME - XP System Schema
 * 
 * This file defines the database schema for the XP system, including
 * XP transactions, levels, and leaderboards.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

/**
 * XP sources - where XP comes from
 */
export enum XP_SOURCE {
  MATCH = 'match',
  PROFILE = 'profile',
  EVENT = 'event',
  COMMUNITY = 'community',
  TOURNAMENT = 'tournament',
  BOUNCE = 'bounce',
  ADMIN = 'admin'
}

/**
 * XP source types - specific actions within a source
 */
export enum XP_SOURCE_TYPE {
  // Match-related
  MATCH_WIN = 'match_win',
  MATCH_LOSS = 'match_loss',
  MATCH_PLAYED = 'match_played',
  
  // Profile-related
  PROFILE_COMPLETE = 'profile_complete',
  PROFILE_UPDATE = 'profile_update',
  
  // Event-related
  EVENT_REGISTRATION = 'event_registration',
  EVENT_ATTENDANCE = 'event_attendance',
  EVENT_CREATION = 'event_creation',
  
  // Community-related
  COMMUNITY_POST = 'community_post',
  COMMUNITY_COMMENT = 'community_comment',
  COMMUNITY_LIKE = 'community_like',
  
  // Tournament-related
  TOURNAMENT_WIN = 'tournament_win',
  TOURNAMENT_PARTICIPATION = 'tournament_participation',
  
  // Bounce-related
  FINDING = 'finding',
  VERIFICATION = 'verification',
  PARTICIPATION = 'participation',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  FIRST_TIME = 'first_time',
  CONSISTENCY = 'consistency',
  
  // Admin-related
  ADMIN_AWARD = 'admin_award',
  ADMIN_PENALTY = 'admin_penalty'
}

/**
 * XP service levels
 */
export enum XP_SERVICE_LEVEL {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

/**
 * XP transactions table
 * Records all XP awarded to users
 */
export const xpTransactions = pgTable('xp_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  source: varchar('source', { length: 20 }).notNull(),
  sourceType: varchar('source_type', { length: 30 }).notNull(),
  sourceId: varchar('source_id', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * XP service levels table
 * Defines the different service levels and their requirements
 */
export const xpServiceLevels = pgTable('xp_service_levels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  minXp: integer('min_xp').notNull(),
  maxXp: integer('max_xp'),
  description: text('description'),
  benefits: text('benefits'),
  iconPath: varchar('icon_path', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * User XP levels table
 * Records the current XP level of each user
 */
export const userXpLevels = pgTable('user_xp_levels', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  currentXp: integer('current_xp').notNull().default(0),
  lifetimeXp: integer('lifetime_xp').notNull().default(0),
  serviceLevelId: integer('service_level_id').references(() => xpServiceLevels.id),
  lastLevelUp: timestamp('last_level_up'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Relations for XP transactions
 */
export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, {
    fields: [xpTransactions.userId],
    references: [users.id]
  })
}));

/**
 * Relations for XP service levels
 */
export const xpServiceLevelsRelations = relations(xpServiceLevels, ({ many }) => ({
  userLevels: many(userXpLevels)
}));

/**
 * Relations for user XP levels
 */
export const userXpLevelsRelations = relations(userXpLevels, ({ one }) => ({
  user: one(users, {
    fields: [userXpLevels.userId],
    references: [users.id]
  }),
  serviceLevel: one(xpServiceLevels, {
    fields: [userXpLevels.serviceLevelId],
    references: [xpServiceLevels.id]
  })
}));

/**
 * Zod schema for inserting XP transactions
 */
export const insertXpTransactionSchema = createInsertSchema(xpTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Zod schema for inserting XP service levels
 */
export const insertXpServiceLevelSchema = createInsertSchema(xpServiceLevels).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Zod schema for inserting user XP levels
 */
export const insertUserXpLevelSchema = createInsertSchema(userXpLevels).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Type for XP transactions
 */
export type XpTransaction = typeof xpTransactions.$inferSelect;

/**
 * Type for inserting XP transactions
 */
export type InsertXpTransaction = z.infer<typeof insertXpTransactionSchema>;

/**
 * Type for XP service levels
 */
export type XpServiceLevel = typeof xpServiceLevels.$inferSelect;

/**
 * Type for inserting XP service levels
 */
export type InsertXpServiceLevel = z.infer<typeof insertXpServiceLevelSchema>;

/**
 * Type for user XP levels
 */
export type UserXpLevel = typeof userXpLevels.$inferSelect;

/**
 * Type for inserting user XP levels
 */
export type InsertUserXpLevel = z.infer<typeof insertUserXpLevelSchema>;