/**
 * PKL-278651-XP-0001-FOUND
 * XP System Schema Definition
 * 
 * This file defines the schema for XP system tables and enums.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { pgTable, serial, integer, text, timestamp, json, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Create insert schemas
export const insertXpLevelThresholdSchema = createInsertSchema(xpLevelThresholds);
export const insertActivityMultiplierSchema = createInsertSchema(activityMultipliers);
export const insertMultiplierRecalibrationSchema = createInsertSchema(multiplierRecalibrations);

// Create types
export type XpLevelThreshold = typeof xpLevelThresholds.$inferSelect;
export type InsertXpLevelThreshold = z.infer<typeof insertXpLevelThresholdSchema>;

export type ActivityMultiplier = typeof activityMultipliers.$inferSelect;
export type InsertActivityMultiplier = z.infer<typeof insertActivityMultiplierSchema>;

export type MultiplierRecalibration = typeof multiplierRecalibrations.$inferSelect;
export type InsertMultiplierRecalibration = z.infer<typeof insertMultiplierRecalibrationSchema>;