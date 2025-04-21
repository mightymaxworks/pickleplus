/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System Schema Definitions
 * 
 * This file defines the database schema and types for the Bounce automated testing system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { pgTable, serial, uuid, timestamp, text, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

/**
 * Test run record - tracks a single execution of the Bounce test suite
 */
export const bounceTestRuns = pgTable("bounce_test_runs", {
  id: serial("id").primaryKey(),
  testId: uuid("test_id").notNull().defaultRandom(),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  browsers: text("browsers").notNull(), // Comma-separated list of browsers used
  testTypes: text("test_types").notNull(), // Comma-separated list of test types
  coverage: real("coverage"), // Test coverage percentage
  status: text("status").notNull().default("running"), // 'running', 'completed', 'failed'
  totalIssues: integer("total_issues").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Finding record - represents a bug or issue discovered during testing
 */
export const bounceFindings = pgTable("bounce_findings", {
  id: serial("id").primaryKey(),
  findingId: text("finding_id").notNull(), // Human-readable ID like "PASSPORT-QR-001"
  testRunId: integer("test_run_id").references(() => bounceTestRuns.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // 'critical', 'moderate', 'low'
  area: text("area").notNull(), // Feature area: 'passport', 'events', etc.
  path: text("path"), // URL path where issue was found
  browser: text("browser").notNull(),
  device: text("device"),
  screenSize: text("screen_size"),
  reproducibility: integer("reproducibility").default(100), // Percentage (0-100)
  status: text("status").notNull().default("open"), // 'open', 'in_progress', 'fixed', 'verified'
  assignedTo: integer("assigned_to").references(() => users.id),
  fixedAt: timestamp("fixed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Evidence record - stores screenshots and other evidence for findings
 */
export const bounceEvidence = pgTable("bounce_evidence", {
  id: serial("id").primaryKey(),
  findingId: integer("finding_id").references(() => bounceFindings.id, { onDelete: "cascade" }),
  evidenceType: text("evidence_type").notNull(), // 'screenshot', 'console', 'video', etc.
  filePath: text("file_path").notNull(), // Path to stored evidence file
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Schedule record - configures automated test scheduling
 */
export const bounceSchedules = pgTable("bounce_schedules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // E.g., "Daily Passport Tests"
  cronExpression: text("cron_expression").notNull(), // Cron expression for scheduling
  browsers: text("browsers").notNull(), // Comma-separated list of browsers to test
  testTypes: text("test_types").notNull(), // Comma-separated list of test types to run
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Interaction record - tracks user interactions with Bounce for gamification
 */
export const bounceInteractions = pgTable("bounce_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  interactionType: text("interaction_type").notNull(), // 'spot', 'challenge', 'report', 'quest'
  points: integer("points").notNull(),
  details: jsonb("details"), // Additional interaction details
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas for validation

export const insertBounceTestRunSchema = createInsertSchema(bounceTestRuns)
  .omit({ id: true, createdAt: true, testId: true });

export const insertBounceFindingSchema = createInsertSchema(bounceFindings)
  .omit({ id: true, createdAt: true });

export const insertBounceEvidenceSchema = createInsertSchema(bounceEvidence)
  .omit({ id: true, createdAt: true });

export const insertBounceScheduleSchema = createInsertSchema(bounceSchedules)
  .omit({ id: true, createdAt: true });

export const insertBounceInteractionSchema = createInsertSchema(bounceInteractions)
  .omit({ id: true, createdAt: true });

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

// Severity and status enums for type safety

export enum BounceFindingSeverity {
  CRITICAL = 'critical',
  MODERATE = 'moderate',
  LOW = 'low'
}

export enum BounceFindingStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  FIXED = 'fixed',
  VERIFIED = 'verified'
}

export enum BounceInteractionType {
  SPOT = 'spot',
  CHALLENGE = 'challenge',
  REPORT = 'report',
  QUEST = 'quest'
}

export enum BounceTestRunStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum BounceEvidenceType {
  SCREENSHOT = 'screenshot',
  CONSOLE = 'console',
  VIDEO = 'video',
  NETWORK = 'network',
  LOG = 'log'
}