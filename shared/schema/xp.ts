/**
 * PKL-278651-XP-0001-FOUND
 * XP System Foundation Schema
 * 
 * This file defines the database schema for the Unified XP System, including
 * XP transactions, level thresholds, and activity sources.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import { pgTable, serial, integer, varchar, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

/**
 * XP Transaction Sources
 * 
 * These are the possible sources of XP transactions.
 * Each source represents a distinct category of activities that can award XP.
 */
export const XP_SOURCE = {
  MATCH: "MATCH",                  // Match play activities
  COMMUNITY: "COMMUNITY",          // Community engagement
  PROFILE: "PROFILE",              // Profile completion
  ACHIEVEMENT: "ACHIEVEMENT",      // Unlocking achievements
  TOURNAMENT: "TOURNAMENT",        // Tournament participation
  TRAINING: "TRAINING",            // Skill development activities
  REFERRAL: "REFERRAL",            // Referring new users
  ADMIN: "ADMIN",                  // Admin-awarded XP
  SYSTEM: "SYSTEM",                // System processes
} as const;

export type XpSource = typeof XP_SOURCE[keyof typeof XP_SOURCE];

/**
 * XP Transactions Table
 * 
 * Tracks all XP awarded or deducted from users.
 * Provides a complete history of XP movements.
 */
export const xpTransactions = pgTable("xp_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // Positive for awards, negative for deductions
  balance: integer("balance").notNull(), // Running XP balance after this transaction
  source: varchar("source", { length: 50 }).notNull(), // From XP_SOURCE
  sourceType: varchar("source_type", { length: 50 }), // Specific type within source category
  sourceId: integer("source_id"), // ID of the source object (if applicable)
  description: text("description"), // Human-readable description
  metadata: jsonb("metadata"), // Additional data related to the transaction
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id), // User who triggered the XP (admin, system)
  isHidden: boolean("is_hidden").default(false), // For administrative purposes
});

/**
 * XP Level Thresholds Table
 * 
 * Defines the XP thresholds required to reach each level.
 * Used for calculating user levels and showing progression.
 */
export const xpLevelThresholds = pgTable("xp_level_thresholds", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull().unique(),
  xpRequired: integer("xp_required").notNull(),
  description: text("description"),
  benefits: jsonb("benefits"), // JSON array of benefits gained at this level
  badgeUrl: text("badge_url"), // URL to the badge image for this level
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Pickle Pulse™ Activity Multipliers Table
 * 
 * Stores the current multipliers for each activity type.
 * Used by the Pickle Pulse™ algorithm to dynamically adjust XP rewards.
 */
export const activityMultipliers = pgTable("activity_multipliers", {
  id: serial("id").primaryKey(),
  activityType: varchar("activity_type", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  currentMultiplier: integer("current_multiplier").notNull().default(100), // Stored as integer (100 = 1.0x)
  targetRatio: integer("target_ratio").notNull(), // Target percentage of total activity (stored as integer, 1000 = 10%)
  currentRatio: integer("current_ratio").notNull().default(0), // Current percentage of total activity
  weeklyTrend: integer("weekly_trend").default(0), // Percentage change from previous week
  lastRecalibration: timestamp("last_recalibration").defaultNow().notNull(),
  baseXpValue: integer("base_xp_value").notNull(), // Standard XP value before multiplier
  isActive: boolean("is_active").default(true),
});

/**
 * Pickle Pulse™ Recalibration History
 * 
 * Tracks the history of multiplier recalibrations.
 * Used for auditing and analyzing the effectiveness of the Pickle Pulse™ algorithm.
 */
export const multiplierRecalibrations = pgTable("multiplier_recalibrations", {
  id: serial("id").primaryKey(),
  activityType: varchar("activity_type", { length: 100 }).notNull(),
  previousMultiplier: integer("previous_multiplier").notNull(),
  newMultiplier: integer("new_multiplier").notNull(),
  adjustmentReason: text("adjustment_reason"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
});

/**
 * Relations
 */
export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, {
    fields: [xpTransactions.userId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [xpTransactions.createdById],
    references: [users.id],
  }),
}));

/**
 * Insert Schemas
 */
export const insertXpTransactionSchema = createInsertSchema(xpTransactions, {
  // Validate that source is one of the expected values
  source: z.enum([
    XP_SOURCE.MATCH,
    XP_SOURCE.COMMUNITY,
    XP_SOURCE.PROFILE,
    XP_SOURCE.ACHIEVEMENT,
    XP_SOURCE.TOURNAMENT,
    XP_SOURCE.TRAINING,
    XP_SOURCE.REFERRAL,
    XP_SOURCE.ADMIN,
    XP_SOURCE.SYSTEM,
  ]),
  // Make metadata a Zod any type to allow flexible structure
  metadata: z.any().optional(),
}).omit({ 
  id: true, 
  createdAt: true 
});

export const insertXpLevelThresholdSchema = createInsertSchema(xpLevelThresholds, {
  // Ensure level is positive
  level: z.number().positive(),
  // Make benefits a Zod any type
  benefits: z.any().optional(),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertActivityMultiplierSchema = createInsertSchema(activityMultipliers, {
  // Ensure multiplier is at least 0
  currentMultiplier: z.number().min(0),
}).omit({ 
  id: true, 
  lastRecalibration: true 
});

export const insertMultiplierRecalibrationSchema = createInsertSchema(multiplierRecalibrations, {
  metadata: z.any().optional(),
}).omit({ 
  id: true, 
  timestamp: true 
});

/**
 * Types
 */
export type XpTransaction = typeof xpTransactions.$inferSelect;
export type InsertXpTransaction = z.infer<typeof insertXpTransactionSchema>;

export type XpLevelThreshold = typeof xpLevelThresholds.$inferSelect;
export type InsertXpLevelThreshold = z.infer<typeof insertXpLevelThresholdSchema>;

export type ActivityMultiplier = typeof activityMultipliers.$inferSelect;
export type InsertActivityMultiplier = z.infer<typeof insertActivityMultiplierSchema>;

export type MultiplierRecalibration = typeof multiplierRecalibrations.$inferSelect;
export type InsertMultiplierRecalibration = z.infer<typeof insertMultiplierRecalibrationSchema>;