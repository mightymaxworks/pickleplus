/**
 * PKL-278651-XP-0002-UI
 * XP System Schema Definition
 * 
 * This file defines the schema for XP system tables and enums.
 * Updated with ultra-lean XP values and 100-level progression.
 * 
 * @framework Framework5.1
 * @version 1.1.0
 */

import { pgTable, serial, integer, text, timestamp, json, boolean, varchar, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { users } from "../schema";

// XP Source Enum
export const XP_SOURCE = {
  MATCH: "match",
  COMMUNITY: "community",
  PROFILE: "profile",
  ACHIEVEMENT: "achievement", 
  TOURNAMENT: "tournament",
  REDEMPTION: "redemption",
  ADMIN: "admin"
} as const;

export type XpSource = typeof XP_SOURCE[keyof typeof XP_SOURCE];

// XP Transactions Table
export const xpTransactions = pgTable("xp_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  source: varchar("source", { length: 50 }).notNull(),
  sourceType: varchar("source_type", { length: 100 }),
  sourceId: integer("source_id"),
  description: text("description"),
  runningTotal: integer("running_total").notNull(),
  isHidden: boolean("is_hidden").default(false), // For special events that shouldn't show in the feed
  createdById: integer("created_by_id").references(() => users.id), // If awarded by admin
  matchId: integer("match_id"), // If from a match
  communityId: integer("community_id"), // If from community activity
  achievementId: integer("achievement_id"), // If from achievement
  tournamentId: integer("tournament_id"), // If from tournament
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// XP Level Thresholds Table
export const xpLevelThresholds = pgTable("xp_level_thresholds", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull().unique(),
  xpRequired: integer("xp_required").notNull(),
  description: text("description"),
  benefits: json("benefits"),
  badgeUrl: text("badge_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Activity Multipliers Table (for Pickle Pulse™)
export const activityMultipliers = pgTable("activity_multipliers", {
  id: serial("id").primaryKey(),
  activityType: varchar("activity_type", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  currentMultiplier: integer("current_multiplier").notNull().default(100),
  targetRatio: integer("target_ratio").notNull(),
  currentRatio: integer("current_ratio").notNull().default(0),
  weeklyTrend: integer("weekly_trend").default(0),
  lastRecalibration: timestamp("last_recalibration").notNull().defaultNow(),
  baseXpValue: integer("base_xp_value").notNull(),
  isActive: boolean("is_active").default(true)
});

// Multiplier Recalibrations Table (for Pickle Pulse™ history)
export const multiplierRecalibrations = pgTable("multiplier_recalibrations", {
  id: serial("id").primaryKey(),
  activityType: varchar("activity_type", { length: 100 }).notNull(),
  previousMultiplier: integer("previous_multiplier").notNull(),
  newMultiplier: integer("new_multiplier").notNull(),
  adjustmentReason: text("adjustment_reason"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: json("metadata")
});

// Define relations
export const xpTransactionRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, {
    fields: [xpTransactions.userId],
    references: [users.id]
  }),
  createdBy: one(users, {
    fields: [xpTransactions.createdById],
    references: [users.id]
  })
}));

// Create insert schemas
export const insertXpTransactionSchema = createInsertSchema(xpTransactions)
  .omit({ id: true, createdAt: true });
export const insertXpLevelThresholdSchema = createInsertSchema(xpLevelThresholds);
export const insertActivityMultiplierSchema = createInsertSchema(activityMultipliers);
export const insertMultiplierRecalibrationSchema = createInsertSchema(multiplierRecalibrations);

// Create types
export type XpTransaction = typeof xpTransactions.$inferSelect;
export type InsertXpTransaction = z.infer<typeof insertXpTransactionSchema>;

export type XpLevelThreshold = typeof xpLevelThresholds.$inferSelect;
export type InsertXpLevelThreshold = z.infer<typeof insertXpLevelThresholdSchema>;

export type ActivityMultiplier = typeof activityMultipliers.$inferSelect;
export type InsertActivityMultiplier = z.infer<typeof insertActivityMultiplierSchema>;

export type MultiplierRecalibration = typeof multiplierRecalibrations.$inferSelect;
export type InsertMultiplierRecalibration = z.infer<typeof insertMultiplierRecalibrationSchema>;