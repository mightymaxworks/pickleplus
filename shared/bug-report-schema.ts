/**
 * PKL-278651-FEED-0001-BUG - In-App Bug Reporting System
 * 
 * This file defines the database schema for the bug reporting system following
 * Framework 5.0 architecture principles.
 */

import { pgTable, serial, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

/**
 * Bug report severity levels
 */
export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Bug report status types
 */
export type BugStatus = 'new' | 'in_progress' | 'resolved' | 'closed' | 'duplicate' | 'cannot_reproduce';

/**
 * Bug reports table schema
 */
export const bugReports = pgTable('bug_reports', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  severity: varchar('severity', { length: 20 })
    .notNull()
    .$type<BugSeverity>(),
  currentPage: varchar('current_page', { length: 255 }),
  userId: integer('user_id').references(() => users.id),
  userAgent: text('user_agent'),
  browserInfo: text('browser_info'),
  screenSize: varchar('screen_size', { length: 50 }),
  ipAddress: varchar('ip_address', { length: 50 }),
  userInfo: text('user_info'),
  screenshotPath: varchar('screenshot_path', { length: 255 }),
  status: varchar('status', { length: 20 })
    .notNull()
    .default('new')
    .$type<BugStatus>(),
  isReproducible: boolean('is_reproducible'),
  stepsToReproduce: text('steps_to_reproduce'),
  adminNotes: text('admin_notes'),
  assignedTo: integer('assigned_to').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Type definitions based on the schema
 */
export type BugReport = typeof bugReports.$inferSelect;
export type InsertBugReport = typeof bugReports.$inferInsert;

/**
 * Zod schema for creating a bug report (form validation)
 */
export const insertBugReportSchema = createInsertSchema(bugReports)
  .omit({
    id: true,
    userAgent: true,
    browserInfo: true,
    screenSize: true,
    ipAddress: true,
    status: true,
    adminNotes: true,
    assignedTo: true,
    resolvedAt: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({
    includeUserInfo: z.boolean().default(true)
  });

/**
 * Type for insert form data
 */
export type InsertBugReportForm = z.infer<typeof insertBugReportSchema>;

/**
 * API response schema for bug reports
 */
export const bugReportResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['new', 'in_progress', 'resolved', 'closed', 'duplicate', 'cannot_reproduce']),
  screenshotUrl: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BugReportResponse = z.infer<typeof bugReportResponseSchema>;