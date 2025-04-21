/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Automation Schema
 * 
 * This file defines the database schema for the Bounce automation system,
 * including test templates, schedules, and test runs.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { pgTable, serial, text, timestamp, json, boolean, integer, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
// Import users table properly to avoid circular references
import { users } from '../schema';

/**
 * Test run status enum
 */
export const TEST_RUN_STATUS = pgEnum('bounce_test_run_status', [
  'PENDING', 
  'RUNNING', 
  'COMPLETED', 
  'FAILED', 
  'CANCELLED'
]);

/**
 * Schedule frequency enum
 */
export const SCHEDULE_FREQUENCY = pgEnum('bounce_schedule_frequency', [
  'HOURLY',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'CUSTOM'
]);

/**
 * Bounce test template table
 * Defines reusable test configurations that can be applied to schedules
 */
export const bounceTestTemplates = pgTable('bounce_test_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  configuration: json('configuration').$type<Record<string, any>>().default({}),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull()
});

/**
 * Bounce test template relations
 */
export const bounceTestTemplatesRelations = relations(bounceTestTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [bounceTestTemplates.createdBy],
    references: [users.id]
  }),
  schedules: many(bounceSchedules)
}));

/**
 * Bounce schedule table
 * Defines automated test schedules
 */
export const bounceSchedules = pgTable('bounce_schedules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  frequency: varchar('frequency', { length: 20 }).notNull(),
  customCronExpression: varchar('custom_cron_expression', { length: 100 }),
  templateId: integer('template_id').references(() => bounceTestTemplates.id),
  isActive: boolean('is_active').default(true).notNull(),
  configuration: json('configuration').$type<Record<string, any>>().default({}),
  lastRunTime: timestamp('last_run_time'),
  nextRunTime: timestamp('next_run_time'),
  lastError: text('last_error'),
  lastErrorTime: timestamp('last_error_time'),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * Bounce schedule relations
 */
export const bounceSchedulesRelations = relations(bounceSchedules, ({ one, many }) => ({
  template: one(bounceTestTemplates, {
    fields: [bounceSchedules.templateId],
    references: [bounceTestTemplates.id]
  }),
  creator: one(users, {
    fields: [bounceSchedules.createdBy],
    references: [users.id]
  }),
  testRuns: many(bounceTestRuns)
}));

/**
 * Bounce test run table
 * Records individual test execution runs
 */
export const bounceTestRuns = pgTable('bounce_test_runs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  scheduleId: integer('schedule_id').references(() => bounceSchedules.id),
  templateId: integer('template_id').references(() => bounceTestTemplates.id),
  configuration: json('configuration').$type<Record<string, any>>().default({}),
  status: TEST_RUN_STATUS('status').notNull().default('PENDING'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  findingsCount: integer('findings_count').default(0),
  errorMessage: text('error_message'),
  triggeredBy: integer('triggered_by').references(() => users.id),
  results: json('results').$type<Record<string, any>>().default({}),
  metadata: json('metadata').$type<Record<string, any>>().default({})
});

/**
 * Bounce test run relations
 */
export const bounceTestRunsRelations = relations(bounceTestRuns, ({ one }) => ({
  schedule: one(bounceSchedules, {
    fields: [bounceTestRuns.scheduleId],
    references: [bounceSchedules.id]
  }),
  template: one(bounceTestTemplates, {
    fields: [bounceTestRuns.templateId],
    references: [bounceTestTemplates.id]
  }),
  triggeredByUser: one(users, {
    fields: [bounceTestRuns.triggeredBy],
    references: [users.id]
  })
}));

// Zod schemas for validations
export const insertBounceTestTemplateSchema = createInsertSchema(bounceTestTemplates, {
  configuration: z.any().optional(),
  isDeleted: z.boolean().default(false)
});

export const insertBounceScheduleSchema = createInsertSchema(bounceSchedules, {
  configuration: z.any().optional(),
  frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM']),
  customCronExpression: z.string().nullable().optional()
});

export const insertBounceTestRunSchema = createInsertSchema(bounceTestRuns, {
  configuration: z.any().optional(),
  results: z.any().optional(),
  metadata: z.any().optional(),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']).default('PENDING')
});

// Types
export type BounceTestTemplate = typeof bounceTestTemplates.$inferSelect;
export type InsertBounceTestTemplate = z.infer<typeof insertBounceTestTemplateSchema>;

export type BounceSchedule = typeof bounceSchedules.$inferSelect;
export type InsertBounceSchedule = z.infer<typeof insertBounceScheduleSchema>;

export type BounceTestRun = typeof bounceTestRuns.$inferSelect;
export type InsertBounceTestRun = z.infer<typeof insertBounceTestRunSchema>;

// Export all tables and schemas
export const bounceAutomationTables = {
  bounceTestTemplates,
  bounceSchedules,
  bounceTestRuns
};

export default bounceAutomationTables;