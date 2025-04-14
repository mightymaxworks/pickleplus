/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * Bug Report Schema
 * 
 * This file defines the database schema for the bug reporting system.
 */

import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

/**
 * Bug report database table schema
 */
export const bugReports = pgTable('bug_reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull().default('medium'),
  status: text('status', { enum: ['new', 'in_progress', 'resolved', 'wont_fix', 'duplicate'] }).notNull().default('new'),
  currentPage: text('current_page'),
  userId: integer('user_id').references(() => users.id),
  assignedTo: integer('assigned_to').references(() => users.id),
  screenshotPath: text('screenshot_path'),
  userAgent: text('user_agent'),
  browserInfo: text('browser_info'),
  screenSize: text('screen_size'),
  ipAddress: text('ip_address'),
  userInfo: text('user_info'),
  stepsToReproduce: text('steps_to_reproduce'),
  isReproducible: boolean('is_reproducible').default(false),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

/**
 * Bug report insert schema
 */
export const insertBugReportSchema = createInsertSchema(bugReports)
  .omit({ id: true, createdAt: true, updatedAt: true, resolvedAt: true })
  .extend({
    severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    includeUserInfo: z.boolean().optional().default(true),
  });

/**
 * Bug report insert type
 * We extend this to make includeUserInfo optional in the actual implementation
 * since it's just used for form validation and not stored in the database
 */
export type InsertBugReport = Omit<z.infer<typeof insertBugReportSchema>, 'includeUserInfo'> & {
  includeUserInfo?: boolean;
};

/**
 * Bug report select type
 */
export type BugReport = typeof bugReports.$inferSelect;