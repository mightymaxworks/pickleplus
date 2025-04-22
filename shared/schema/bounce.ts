/**
 * PKL-278651-BOUNCE-0003-CICD - Bounce Schema Definitions
 * 
 * Defines the database schema for the Bounce testing system
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { pgTable, serial, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Test run statuses
 */
export enum BounceTestRunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

/**
 * Finding severity levels
 */
export enum BounceFindingSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  INFO = 'INFO'
}

/**
 * Finding status values
 */
export enum BounceFindingStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  FIXED = 'FIXED',
  WONT_FIX = 'WONT_FIX',
  DUPLICATE = 'DUPLICATE',
  INVALID = 'INVALID'
}

/**
 * Evidence types
 */
export enum BounceEvidenceType {
  SCREENSHOT = 'SCREENSHOT',
  CONSOLE_LOG = 'CONSOLE_LOG',
  NETWORK_LOG = 'NETWORK_LOG',
  HTML = 'HTML',
  CODE_SNIPPET = 'CODE_SNIPPET',
  TEXT = 'TEXT'
}

/**
 * Test run schedule frequencies
 */
export enum BounceScheduleFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM'
}

/**
 * Interaction types for user or system actions during tests
 */
export enum BounceInteractionType {
  CLICK = 'CLICK',
  TYPE = 'TYPE',
  NAVIGATE = 'NAVIGATE',
  SUBMIT = 'SUBMIT',
  HOVER = 'HOVER',
  WAIT = 'WAIT',
  VALIDATE = 'VALIDATE',
  ERROR = 'ERROR',
  API_CALL = 'API_CALL',
  NETWORK_EVENT = 'NETWORK_EVENT',
  CUSTOM = 'CUSTOM'
}

/**
 * Test runs table definition
 */
export const bounceTestRuns = pgTable('bounce_test_runs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull().$type<BounceTestRunStatus>().default(BounceTestRunStatus.PENDING),
  target_url: text('target_url'),
  test_config: text('test_config'),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  total_findings: integer('total_findings').default(0),
  error_message: text('error_message'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
});

/**
 * Findings table definition
 */
export const bounceFindings = pgTable('bounce_findings', {
  id: serial('id').primaryKey(),
  test_run_id: integer('test_run_id').references(() => bounceTestRuns.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity').$type<BounceFindingSeverity>().notNull().default(BounceFindingSeverity.MEDIUM),
  status: text('status').$type<BounceFindingStatus>().notNull().default(BounceFindingStatus.OPEN),
  reproducible_steps: text('reproducible_steps'),
  affected_url: text('affected_url'),
  browser_info: json('browser_info'),
  device_info: json('device_info'),
  area: text('area'),
  fixed_in: text('fixed_in'),
  fixed_at: timestamp('fixed_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
});

/**
 * Evidence table definition
 */
export const bounceEvidence = pgTable('bounce_evidence', {
  id: serial('id').primaryKey(),
  finding_id: integer('finding_id').references(() => bounceFindings.id),
  type: text('type').$type<BounceEvidenceType>().notNull().default(BounceEvidenceType.TEXT),
  content: text('content').notNull(),
  metadata: json('metadata'),
  created_at: timestamp('created_at').defaultNow()
});

/**
 * Test schedules table definition
 */
export const bounceSchedules = pgTable('bounce_schedules', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  target_url: text('target_url').notNull(),
  frequency: text('frequency').$type<BounceScheduleFrequency>().notNull(),
  test_config: json('test_config'),
  is_active: boolean('is_active').default(true),
  last_run_at: timestamp('last_run_at'),
  next_run_at: timestamp('next_run_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at')
});

/**
 * Test interactions table definition
 */
export const bounceInteractions = pgTable('bounce_interactions', {
  id: serial('id').primaryKey(),
  test_run_id: integer('test_run_id').references(() => bounceTestRuns.id),
  finding_id: integer('finding_id').references(() => bounceFindings.id),
  type: text('type').$type<BounceInteractionType>().notNull(),
  selector: text('selector'),
  value: text('value'),
  url: text('url'),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: json('metadata'),
  screenshot: text('screenshot'),
  created_at: timestamp('created_at').defaultNow()
});

// Zod schemas
export const insertBounceTestRunSchema = createInsertSchema(bounceTestRuns, {
  status: z.nativeEnum(BounceTestRunStatus)
}).omit({ id: true });

export const insertBounceFindingSchema = createInsertSchema(bounceFindings, {
  severity: z.nativeEnum(BounceFindingSeverity),
  status: z.nativeEnum(BounceFindingStatus)
}).omit({ id: true });

export const insertBounceEvidenceSchema = createInsertSchema(bounceEvidence, {
  type: z.nativeEnum(BounceEvidenceType)
}).omit({ id: true });

export const insertBounceScheduleSchema = createInsertSchema(bounceSchedules, {
  frequency: z.nativeEnum(BounceScheduleFrequency)
}).omit({ id: true });

export const insertBounceInteractionSchema = createInsertSchema(bounceInteractions, {
  type: z.nativeEnum(BounceInteractionType)
}).omit({ id: true });

// Types
export type BounceTestRun = typeof bounceTestRuns.$inferSelect;
export type InsertBounceTestRun = z.infer<typeof insertBounceTestRunSchema>;

export type BounceFinding = typeof bounceFindings.$inferSelect;
export type InsertBounceFinding = z.infer<typeof insertBounceFindingSchema>;

export type BounceEvidence = typeof bounceEvidence.$inferSelect;
export type InsertBounceEvidence = z.infer<typeof insertBounceEvidenceSchema>;

export type BounceSchedule = typeof bounceSchedules.$inferSelect;
export type InsertBounceSchedule = z.infer<typeof insertBounceScheduleSchema>;

export type BounceInteraction = typeof bounceInteractions.$inferSelect;
export type InsertBounceInteraction = z.infer<typeof insertBounceInteractionSchema>;

// Relations between bounce tables
export const bounceTestRunsRelations = relations(bounceTestRuns, ({ many }) => ({
  findings: many(bounceFindings),
  interactions: many(bounceInteractions)
}));

export const bounceFindingsRelations = relations(bounceFindings, ({ one, many }) => ({
  testRun: one(bounceTestRuns, {
    fields: [bounceFindings.test_run_id],
    references: [bounceTestRuns.id]
  }),
  evidence: many(bounceEvidence),
  interactions: many(bounceInteractions)
}));

export const bounceEvidenceRelations = relations(bounceEvidence, ({ one }) => ({
  finding: one(bounceFindings, {
    fields: [bounceEvidence.finding_id],
    references: [bounceFindings.id]
  })
}));

export const bounceInteractionsRelations = relations(bounceInteractions, ({ one }) => ({
  testRun: one(bounceTestRuns, {
    fields: [bounceInteractions.test_run_id],
    references: [bounceTestRuns.id]
  }),
  finding: one(bounceFindings, {
    fields: [bounceInteractions.finding_id],
    references: [bounceFindings.id]
  })
}));