/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Automation Schema Extensions
 * 
 * This file extends the existing bounce schema with additional automation features,
 * including schedule frequency enums and test templates for advanced scheduling.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, bounceSchedules, bounceTestRuns } from "../schema";

/**
 * Enum for schedule frequency
 */
export enum SCHEDULE_FREQUENCY {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  CUSTOM = 'CUSTOM'
}

/**
 * Bounce test templates table
 * Stores reusable test configurations that can be applied to schedules
 */
export const bounceTestTemplates = pgTable('bounce_test_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  configuration: jsonb('configuration').notNull().default({}),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false)
});

/**
 * Define relations between the tables
 */
export const bounceTestTemplatesRelations = relations(bounceTestTemplates, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [bounceTestTemplates.createdBy],
    references: [users.id]
  })
}));

/**
 * Zod schemas for insert operations
 */
export const insertBounceTestTemplateSchema = createInsertSchema(bounceTestTemplates, {
  description: z.string().optional(),
  configuration: z.record(z.any()).default({})
});

/**
 * Types derived from insert schemas
 */
export type BounceTestTemplate = typeof bounceTestTemplates.$inferSelect;
export type InsertBounceTestTemplate = z.infer<typeof insertBounceTestTemplateSchema>;