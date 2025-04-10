/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing System Schema
 * 
 * This file defines the database schema for the prize drawing system
 * used in the Tournament Discovery Quest.
 */

import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

/**
 * Prize Drawing Pools Table
 * 
 * Stores information about available prize drawing pools
 */
export const prizeDrawingPools = pgTable("prize_drawing_pools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  campaignId: integer("campaign_id").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  status: text("status", { enum: ["active", "drawing", "completed"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

/**
 * Prize Drawing Entries Table
 * 
 * Tracks user entries in prize drawing pools
 */
export const prizeDrawingEntries = pgTable("prize_drawing_entries", {
  id: serial("id").primaryKey(),
  poolId: integer("pool_id").references(() => prizeDrawingPools.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  isWinner: boolean("is_winner").default(false).notNull(),
  hasBeenNotified: boolean("has_been_notified").default(false).notNull(),
  drawingDate: timestamp("drawing_date"),
  entryMethod: text("entry_method", { enum: ["quest_completion", "admin", "other"] }).notNull()
});

/**
 * Insert schemas for validation
 */
export const insertPrizeDrawingPoolSchema = createInsertSchema(prizeDrawingPools)
  .omit({ id: true, createdAt: true });

export const insertPrizeDrawingEntrySchema = createInsertSchema(prizeDrawingEntries)
  .omit({ id: true, entryDate: true, isWinner: true, hasBeenNotified: true, drawingDate: true });

/**
 * Type definitions based on schemas
 */
export type PrizeDrawingPool = typeof prizeDrawingPools.$inferSelect;
export type NewPrizeDrawingPool = z.infer<typeof insertPrizeDrawingPoolSchema>;

export type PrizeDrawingEntry = typeof prizeDrawingEntries.$inferSelect;
export type NewPrizeDrawingEntry = z.infer<typeof insertPrizeDrawingEntrySchema>;