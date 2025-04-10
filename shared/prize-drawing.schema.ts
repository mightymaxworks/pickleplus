/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing Schema
 * 
 * This file defines the database schema for the prize drawing system.
 */

import { pgTable, serial, text, boolean, timestamp, integer, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { users } from './schema';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Enums for pool status and entry methods
 */
export const poolStatusEnum = pgEnum('prize_drawing_pool_status', [
  'draft',
  'active',
  'completed',
  'cancelled'
]);

export const entryMethodEnum = pgEnum('prize_drawing_entry_method', [
  'quest_completion',
  'admin_addition',
  'invitation',
  'referral'
]);

/**
 * Prize Drawing Pools Table Schema
 */
export const prizeDrawingPools = pgTable('prize_drawing_pools', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  campaignId: varchar('campaign_id', { length: 50 }).notNull(),
  prizeDescription: text('prize_description'),
  maxWinners: integer('max_winners').default(1),
  startDate: timestamp('start_date').defaultNow(),
  endDate: timestamp('end_date'),
  drawingDate: timestamp('drawing_date'),
  status: poolStatusEnum('status').default('draft'),
  requiresVerification: boolean('requires_verification').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

/**
 * Prize Drawing Entries Table Schema
 */
export const prizeDrawingEntries = pgTable('prize_drawing_entries', {
  id: serial('id').primaryKey(),
  poolId: integer('pool_id').references(() => prizeDrawingPools.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  entryMethod: entryMethodEnum('entry_method').default('quest_completion'),
  entryDate: timestamp('entry_date').defaultNow(),
  isWinner: boolean('is_winner').default(false),
  drawingDate: timestamp('drawing_date'),
  hasBeenNotified: boolean('has_been_notified').default(false),
  notificationDate: timestamp('notification_date'),
  tokenClaimed: boolean('token_claimed').default(false),
  claimDate: timestamp('claim_date')
});

/**
 * Zod Schemas for validation
 */
export const insertPrizeDrawingPoolSchema = createInsertSchema(prizeDrawingPools, {
  name: z.string().min(3).max(100),
  campaignId: z.string().min(1).max(50),
  maxWinners: z.number().positive().default(1),
  description: z.string().nullable().optional(),
  prizeDescription: z.string().nullable().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
  requiresVerification: z.boolean().default(false),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).nullable().optional(),
  drawingDate: z.string().or(z.date()).nullable().optional()
});

export const insertPrizeDrawingEntrySchema = createInsertSchema(prizeDrawingEntries, {
  poolId: z.number().positive(),
  userId: z.number().positive(),
  entryMethod: z.enum(['quest_completion', 'admin_addition', 'invitation', 'referral']).default('quest_completion'),
  isWinner: z.boolean().default(false),
  hasBeenNotified: z.boolean().default(false),
  tokenClaimed: z.boolean().default(false),
  entryDate: z.string().or(z.date()).optional(),
  drawingDate: z.string().or(z.date()).nullable().optional(),
  notificationDate: z.string().or(z.date()).nullable().optional(),
  claimDate: z.string().or(z.date()).nullable().optional()
});

/**
 * Type Definitions
 */
export type PrizeDrawingPool = typeof prizeDrawingPools.$inferSelect;
export type InsertPrizeDrawingPool = z.infer<typeof insertPrizeDrawingPoolSchema>;

export type PrizeDrawingEntry = typeof prizeDrawingEntries.$inferSelect;
export type InsertPrizeDrawingEntry = z.infer<typeof insertPrizeDrawingEntrySchema>;

/**
 * Relations Configuration
 */
export const prizeDrawingRelations = {
  prizeDrawingPools: relations(prizeDrawingPools, ({ many }) => ({
    entries: many(prizeDrawingEntries)
  })),
  prizeDrawingEntries: relations(prizeDrawingEntries, ({ one }) => ({
    pool: one(prizeDrawingPools, {
      fields: [prizeDrawingEntries.poolId],
      references: [prizeDrawingPools.id]
    }),
    user: one(users, {
      fields: [prizeDrawingEntries.userId],
      references: [users.id]
    })
  }))
};