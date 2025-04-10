/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing Schema
 * 
 * Database schema for prize drawing system used in tournament discovery quest
 */

import { z } from 'zod';
import { 
  varchar, 
  pgTable, 
  serial, 
  integer, 
  text, 
  boolean,
  timestamp,
  pgEnum 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { users } from './schema';

// Prize drawing pool status enum
export const poolStatusEnum = pgEnum('prize_drawing_pool_status', [
  'draft',
  'active',
  'completed',
  'cancelled'
]);

// Entry method enum
export const entryMethodEnum = pgEnum('prize_drawing_entry_method', [
  'quest_completion',
  'admin_addition',
  'invitation',
  'referral'
]);

/**
 * Prize Drawing Pools Table
 * 
 * Stores information about drawing pools for prizes
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
 * Prize Drawing Entries Table
 * 
 * Stores entries from users into drawing pools
 */
export const prizeDrawingEntries = pgTable('prize_drawing_entries', {
  id: serial('id').primaryKey(),
  poolId: integer('pool_id').notNull().references(() => prizeDrawingPools.id),
  userId: integer('user_id').notNull().references(() => users.id),
  entryMethod: entryMethodEnum('entry_method').default('quest_completion'),
  entryDate: timestamp('entry_date').defaultNow(),
  isWinner: boolean('is_winner').default(false),
  drawingDate: timestamp('drawing_date'),
  hasBeenNotified: boolean('has_been_notified').default(false),
  notificationDate: timestamp('notification_date'),
  tokenClaimed: boolean('token_claimed').default(false),
  claimDate: timestamp('claim_date')
});

// Define relations 
export const prizeDrawingPoolsRelations = relations(prizeDrawingPools, ({ many }) => ({
  entries: many(prizeDrawingEntries)
}));

export const prizeDrawingEntriesRelations = relations(prizeDrawingEntries, ({ one }) => ({
  pool: one(prizeDrawingPools, {
    fields: [prizeDrawingEntries.poolId],
    references: [prizeDrawingPools.id]
  }),
  user: one(users, {
    fields: [prizeDrawingEntries.userId],
    references: [users.id]
  })
}));

// Zod schemas for validation
export const insertPrizeDrawingPoolSchema = createInsertSchema(prizeDrawingPools, {
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  campaignId: z.string().min(3).max(50),
  prizeDescription: z.string().optional(),
  maxWinners: z.number().int().positive().default(1),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  drawingDate: z.date().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
  requiresVerification: z.boolean().default(false)
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPrizeDrawingEntrySchema = createInsertSchema(prizeDrawingEntries, {
  poolId: z.number().int().positive(),
  userId: z.number().int().positive(),
  entryMethod: z.enum(['quest_completion', 'admin_addition', 'invitation', 'referral']).default('quest_completion'),
  isWinner: z.boolean().default(false),
  hasBeenNotified: z.boolean().default(false),
  tokenClaimed: z.boolean().default(false)
}).omit({ id: true, entryDate: true, drawingDate: true, notificationDate: true, claimDate: true });

// TypeScript types
export type PrizeDrawingPool = typeof prizeDrawingPools.$inferSelect;
export type InsertPrizeDrawingPool = z.infer<typeof insertPrizeDrawingPoolSchema>;

export type PrizeDrawingEntry = typeof prizeDrawingEntries.$inferSelect;
export type InsertPrizeDrawingEntry = z.infer<typeof insertPrizeDrawingEntrySchema>;

// Type for drawing winner data
export interface DrawingWinner {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
  };
  entryDate: Date;
  drawingDate: Date;
  hasBeenNotified: boolean;
}