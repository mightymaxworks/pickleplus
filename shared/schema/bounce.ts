/**
 * PKL-278651-BOUNCE-0001-CORE - Bounce Automated Testing System
 * Schema definitions for the Bounce testing system.
 * 
 * This module defines the database tables and types for the Bounce testing system,
 * which performs non-destructive automated testing on the application.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 * @lastModified 2025-04-21
 */

import { pgTable, serial, text, integer, timestamp, boolean, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

/**
 * Test run status enum - represents the current state of a test run
 */
export enum BounceTestRunStatus {
  PLANNED = "planned",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

/**
 * Finding severity enum - represents the severity of a test finding
 */
export enum BounceFindingSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MODERATE = "moderate",
  MEDIUM = "medium", // Keeping for backward compatibility
  LOW = "low",
  INFO = "info"
}

/**
 * Finding status enum - represents the current status of a finding
 */
export enum BounceFindingStatus {
  NEW = "new",
  TRIAGE = "triage",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  FIXED = "fixed",
  WONT_FIX = "wont_fix",
  DUPLICATE = "duplicate"
}

/**
 * Evidence type enum - represents the type of evidence collected
 */
export enum BounceEvidenceType {
  SCREENSHOT = "screenshot",
  CONSOLE_LOG = "console_log",
  NETWORK_REQUEST = "network_request",
  DOM_STATE = "dom_state",
  PERFORMANCE_METRIC = "performance_metric"
}

/**
 * Interaction type enum - represents the type of user interaction with Bounce
 */
export enum BounceInteractionType {
  REPORT_ISSUE = "report_issue",
  CONFIRM_FINDING = "confirm_finding",
  DISPUTE_FINDING = "dispute_finding",
  PROVIDE_FEEDBACK = "provide_feedback",
  VIEW_REPORT = "view_report"
}

/**
 * Bounce test runs table - Tracks automated test executions
 */
export const bounceTestRuns = pgTable("bounce_test_runs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 })
    .notNull()
    .default(BounceTestRunStatus.PLANNED),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  userId: integer("user_id").references(() => users.id),
  targetUrl: varchar("target_url", { length: 255 }),
  testConfig: jsonb("test_config"),
  totalFindings: integer("total_findings").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Bounce findings table - Stores issues discovered during testing
 */
export const bounceFindings = pgTable("bounce_findings", {
  id: serial("id").primaryKey(),
  testRunId: integer("test_run_id").references(() => bounceTestRuns.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 50 })
    .notNull()
    .default(BounceFindingSeverity.MEDIUM),
  status: varchar("status", { length: 50 })
    .notNull()
    .default(BounceFindingStatus.NEW),
  reproducibleSteps: text("reproducible_steps"),
  affectedUrl: varchar("affected_url", { length: 255 }),
  browserInfo: jsonb("browser_info"),
  assignedToUserId: integer("assigned_to_user_id").references(() => users.id),
  reportedByUserId: integer("reported_by_user_id").references(() => users.id),
  fixCommitHash: varchar("fix_commit_hash", { length: 100 }),
  fixedAt: timestamp("fixed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Bounce evidence table - Stores evidence related to findings
 */
export const bounceEvidence = pgTable("bounce_evidence", {
  id: serial("id").primaryKey(),
  findingId: integer("finding_id").references(() => bounceFindings.id),
  type: varchar("type", { length: 50 })
    .notNull()
    .default(BounceEvidenceType.SCREENSHOT),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});

/**
 * Bounce schedules table - Configures automated test scheduling
 */
export const bounceSchedules = pgTable("bounce_schedules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cronExpression: varchar("cron_expression", { length: 50 }),
  testConfig: jsonb("test_config").notNull(),
  isActive: boolean("is_active").default(true),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Bounce interactions table - Tracks user interactions with Bounce for gamification
 */
export const bounceInteractions = pgTable("bounce_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  findingId: integer("finding_id").references(() => bounceFindings.id),
  type: varchar("type", { length: 50 })
    .notNull()
    .default(BounceInteractionType.VIEW_REPORT),
  points: integer("points").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations definitions
export const bounceTestRunsRelations = relations(bounceTestRuns, ({ one, many }) => ({
  findings: many(bounceFindings),
  user: one(users, {
    fields: [bounceTestRuns.userId],
    references: [users.id]
  })
}));

export const bounceFindingsRelations = relations(bounceFindings, ({ one, many }) => ({
  testRun: one(bounceTestRuns, {
    fields: [bounceFindings.testRunId],
    references: [bounceTestRuns.id]
  }),
  evidence: many(bounceEvidence),
  assignedTo: one(users, {
    fields: [bounceFindings.assignedToUserId],
    references: [users.id]
  }),
  reportedBy: one(users, {
    fields: [bounceFindings.reportedByUserId],
    references: [users.id]
  }),
  interactions: many(bounceInteractions)
}));

export const bounceEvidenceRelations = relations(bounceEvidence, ({ one }) => ({
  finding: one(bounceFindings, {
    fields: [bounceEvidence.findingId],
    references: [bounceFindings.id]
  })
}));

export const bounceInteractionsRelations = relations(bounceInteractions, ({ one }) => ({
  user: one(users, {
    fields: [bounceInteractions.userId],
    references: [users.id]
  }),
  finding: one(bounceFindings, {
    fields: [bounceInteractions.findingId],
    references: [bounceFindings.id]
  })
}));

// Create insert schemas using Zod
export const insertBounceTestRunSchema = createInsertSchema(bounceTestRuns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalFindings: true
});

export const insertBounceFindingSchema = createInsertSchema(bounceFindings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  fixedAt: true
});

export const insertBounceEvidenceSchema = createInsertSchema(bounceEvidence).omit({
  id: true,
  createdAt: true
});

export const insertBounceScheduleSchema = createInsertSchema(bounceSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRunAt: true,
  nextRunAt: true
});

export const insertBounceInteractionSchema = createInsertSchema(bounceInteractions).omit({
  id: true,
  createdAt: true
});

// Export types derived from schemas
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