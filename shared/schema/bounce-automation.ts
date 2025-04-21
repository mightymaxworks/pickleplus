/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Automation Schema
 * 
 * This file defines the database schema for Bounce automation features including
 * scheduled tests, test templates, auto-healing capabilities, and CI/CD integration.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { pgTable, serial, integer, text, timestamp, boolean, json, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { users } from '../schema';

/**
 * Schedule frequency types
 */
export enum SCHEDULE_FREQUENCY {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

/**
 * Test run trigger types
 */
export enum TEST_RUN_TRIGGER {
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
  CI_CD = 'ci_cd',
  AUTO_HEAL = 'auto_heal'
}

/**
 * Auto heal status types
 */
export enum AUTO_HEAL_STATUS {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPLIED = 'applied',
  FAILED = 'failed',
  REQUIRES_MANUAL = 'requires_manual'
}

/**
 * Test templates table
 * Stores reusable test configurations
 */
export const testTemplates = pgTable('test_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  configuration: json('configuration').notNull().$type<{
    features: string[];
    params: Record<string, any>;
    settings: Record<string, any>;
  }>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Scheduled tests table
 * Defines recurring test schedules
 */
export const scheduledTests = pgTable('scheduled_tests', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  templateId: integer('template_id').notNull().references(() => testTemplates.id),
  frequency: varchar('frequency', { length: 20 }).notNull().$type<SCHEDULE_FREQUENCY>(),
  cronExpression: varchar('cron_expression', { length: 100 }),
  lastRun: timestamp('last_run'),
  nextRun: timestamp('next_run'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  isActive: boolean('is_active').notNull().default(true),
  notifyOnCompletion: boolean('notify_on_completion').notNull().default(true),
  notifyOnIssue: boolean('notify_on_issue').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * CI/CD integrations table
 * Stores configuration for CI/CD system connections
 */
export const cicdIntegrations = pgTable('cicd_integrations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  system: varchar('system', { length: 50 }).notNull(), // e.g., 'github', 'gitlab', 'jenkins'
  webhookUrl: varchar('webhook_url', { length: 500 }).notNull(),
  webhookSecret: varchar('webhook_secret', { length: 200 }),
  configuration: json('configuration').$type<Record<string, any>>(),
  createdBy: integer('created_by').notNull().references(() => users.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Deployment records table
 * Tracks deployments and associated test runs
 */
export const deploymentRecords = pgTable('deployment_records', {
  id: serial('id').primaryKey(),
  deploymentId: varchar('deployment_id', { length: 100 }).notNull(),
  integrationId: integer('integration_id').references(() => cicdIntegrations.id),
  commitHash: varchar('commit_hash', { length: 100 }),
  branch: varchar('branch', { length: 100 }),
  environment: varchar('environment', { length: 50 }).notNull(), // e.g., 'development', 'staging', 'production'
  status: varchar('status', { length: 20 }).notNull(), // e.g., 'pending', 'running', 'success', 'failed'
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Auto-healing rules table
 * Defines rules for automatic issue resolution
 */
export const autoHealRules = pgTable('auto_heal_rules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  issuePatterns: json('issue_patterns').notNull().$type<string[]>(),
  solution: json('solution').notNull().$type<{
    actionType: string;
    steps: any[];
  }>(),
  createdBy: integer('created_by').notNull().references(() => users.id),
  isActive: boolean('is_active').notNull().default(true),
  successCount: integer('success_count').notNull().default(0),
  failureCount: integer('failure_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Auto-healing history table
 * Records auto-healing attempts and results
 */
export const autoHealHistory = pgTable('auto_heal_history', {
  id: serial('id').primaryKey(),
  ruleId: integer('rule_id').references(() => autoHealRules.id),
  findingId: integer('finding_id').notNull(), // References bounce_findings
  appliedSolution: json('applied_solution').$type<{
    actionType: string;
    steps: any[];
    logs: string[];
  }>(),
  status: varchar('status', { length: 20 }).notNull().$type<AUTO_HEAL_STATUS>(),
  resultDetails: text('result_details'),
  appliedBy: integer('applied_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Relations
 */

// Test templates relations
export const testTemplatesRelations = relations(testTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [testTemplates.createdBy],
    references: [users.id]
  }),
  scheduledTests: many(scheduledTests)
}));

// Scheduled tests relations
export const scheduledTestsRelations = relations(scheduledTests, ({ one, many }) => ({
  template: one(testTemplates, {
    fields: [scheduledTests.templateId],
    references: [testTemplates.id]
  }),
  creator: one(users, {
    fields: [scheduledTests.createdBy],
    references: [users.id]
  })
}));

// CI/CD integrations relations
export const cicdIntegrationsRelations = relations(cicdIntegrations, ({ one, many }) => ({
  creator: one(users, {
    fields: [cicdIntegrations.createdBy],
    references: [users.id]
  }),
  deployments: many(deploymentRecords)
}));

// Deployment records relations
export const deploymentRecordsRelations = relations(deploymentRecords, ({ one }) => ({
  integration: one(cicdIntegrations, {
    fields: [deploymentRecords.integrationId],
    references: [cicdIntegrations.id]
  })
}));

// Auto-healing rules relations
export const autoHealRulesRelations = relations(autoHealRules, ({ one, many }) => ({
  creator: one(users, {
    fields: [autoHealRules.createdBy],
    references: [users.id]
  }),
  healingHistory: many(autoHealHistory)
}));

// Auto-healing history relations
export const autoHealHistoryRelations = relations(autoHealHistory, ({ one }) => ({
  rule: one(autoHealRules, {
    fields: [autoHealHistory.ruleId],
    references: [autoHealRules.id]
  }),
  applier: one(users, {
    fields: [autoHealHistory.appliedBy],
    references: [users.id]
  })
}));

/**
 * Zod schemas for validation
 */
export const insertTestTemplateSchema = createInsertSchema(testTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertScheduledTestSchema = createInsertSchema(scheduledTests).omit({
  id: true,
  lastRun: true,
  createdAt: true,
  updatedAt: true
});

export const insertCicdIntegrationSchema = createInsertSchema(cicdIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDeploymentRecordSchema = createInsertSchema(deploymentRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAutoHealRuleSchema = createInsertSchema(autoHealRules).omit({
  id: true,
  successCount: true,
  failureCount: true,
  createdAt: true,
  updatedAt: true
});

export const insertAutoHealHistorySchema = createInsertSchema(autoHealHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Types
 */
export type TestTemplate = typeof testTemplates.$inferSelect;
export type InsertTestTemplate = z.infer<typeof insertTestTemplateSchema>;

export type ScheduledTest = typeof scheduledTests.$inferSelect;
export type InsertScheduledTest = z.infer<typeof insertScheduledTestSchema>;

export type CicdIntegration = typeof cicdIntegrations.$inferSelect;
export type InsertCicdIntegration = z.infer<typeof insertCicdIntegrationSchema>;

export type DeploymentRecord = typeof deploymentRecords.$inferSelect;
export type InsertDeploymentRecord = z.infer<typeof insertDeploymentRecordSchema>;

export type AutoHealRule = typeof autoHealRules.$inferSelect;
export type InsertAutoHealRule = z.infer<typeof insertAutoHealRuleSchema>;

export type AutoHealHistory = typeof autoHealHistory.$inferSelect;
export type InsertAutoHealHistory = z.infer<typeof insertAutoHealHistorySchema>;