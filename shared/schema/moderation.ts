/**
 * [PKL-278651-COMM-0029-MOD] Community Moderation Schema
 * Implementation timestamp: 2025-04-19 18:07 ET
 * 
 * Schema definitions for community moderation functionality.
 * Enhanced with content approval workflows and filtering.
 * 
 * Framework 5.2 compliance verified:
 * - Module-specific schema
 * - Clear type definitions
 * - Explicit relationships
 */
import { pgTable, serial, integer, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Content reports for moderation
export const contentReports = pgTable('content_reports', {
  id: serial('id').primaryKey(),
  reporterId: integer('reporter_id').notNull(), // Reference to users.id
  communityId: integer('community_id').notNull(), // Reference to communities.id
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'post', 'comment', 'event'
  contentId: integer('content_id').notNull(),
  reason: varchar('reason', { length: 100 }).notNull(),
  details: text('details'),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'reviewed', 'resolved', 'rejected'
  reviewerId: integer('reviewer_id'), // Reference to users.id
  reviewNotes: text('review_notes'),
  reviewedAt: timestamp('reviewed_at'),
  action: varchar('action', { length: 50 }), // 'no_action', 'warning', 'remove_content', 'mute_user', 'ban_user'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Community moderation actions
export const moderationActions = pgTable('moderation_actions', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull(), // Reference to communities.id
  moderatorId: integer('moderator_id').notNull(), // Reference to users.id
  targetUserId: integer('target_user_id').notNull(), // Reference to users.id
  actionType: varchar('action_type', { length: 50 }).notNull(), // 'warning', 'mute', 'ban', 'unban'
  reason: text('reason'),
  expiresAt: timestamp('expires_at'), // For temporary actions
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// Community role management
export const communityRoles = pgTable('community_roles', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull(), // Reference to communities.id
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  permissions: text('permissions').notNull(), // JSON string of permissions
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Content approval queue for communities with pre-moderation
export const contentApprovalQueue = pgTable('content_approval_queue', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull(), // Reference to communities.id
  userId: integer('user_id').notNull(), // Reference to users.id (content creator)
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'post', 'comment', 'event'
  content: text('content').notNull(), // The actual content to approve
  metadata: jsonb('metadata'), // Additional content data (images, links, etc.)
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'approved', 'rejected'
  moderatorId: integer('moderator_id'), // Reference to users.id (reviewer)
  moderationNotes: text('moderation_notes'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Content filtering settings for communities
export const contentFilterSettings = pgTable('content_filter_settings', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().unique(), // Reference to communities.id
  enabledFilters: jsonb('enabled_filters').default('[]').notNull(), // Array of filter types enabled
  bannedKeywords: text('banned_keywords').default('[]').notNull(), // JSON array of banned keywords
  sensitiveContentTypes: text('sensitive_content_types').default('[]').notNull(), // JSON array of content types requiring approval
  requireApproval: boolean('require_approval').default(false).notNull(), // Whether all content requires pre-approval
  autoModEnabled: boolean('auto_mod_enabled').default(true).notNull(), // Whether automated moderation is enabled
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Note: Relations will be defined in the main schema.ts file where all tables are available

// Create insert schemas using drizzle-zod
export const insertContentReportSchema = createInsertSchema(contentReports, {
  reason: z.string().min(3).max(100),
  details: z.string().max(1000).optional(),
}).omit({ id: true, reviewedAt: true, createdAt: true, updatedAt: true });

export const insertModerationActionSchema = createInsertSchema(moderationActions, {
  actionType: z.enum(['warning', 'mute', 'ban', 'unban']),
  reason: z.string().min(3).max(500).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCommunityRoleSchema = createInsertSchema(communityRoles, {
  name: z.string().min(2).max(50),
  permissions: z.string().min(2),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertContentApprovalSchema = createInsertSchema(contentApprovalQueue, {
  contentType: z.enum(['post', 'comment', 'event']),
  content: z.string().min(1).max(5000),
  metadata: z.any().optional(),
}).omit({ id: true, reviewedAt: true, createdAt: true, updatedAt: true });

export const insertContentFilterSettingsSchema = createInsertSchema(contentFilterSettings, {
  enabledFilters: z.any().default([]),
  bannedKeywords: z.string().default('[]'),
  sensitiveContentTypes: z.string().default('[]'),
  requireApproval: z.boolean().default(false),
  autoModEnabled: z.boolean().default(true),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Create type definitions
export type ContentReport = typeof contentReports.$inferSelect;
export type InsertContentReport = z.infer<typeof insertContentReportSchema>;

export type ModerationAction = typeof moderationActions.$inferSelect;
export type InsertModerationAction = z.infer<typeof insertModerationActionSchema>;

export type CommunityRole = typeof communityRoles.$inferSelect;
export type InsertCommunityRole = z.infer<typeof insertCommunityRoleSchema>;

export type ContentApproval = typeof contentApprovalQueue.$inferSelect;
export type InsertContentApproval = z.infer<typeof insertContentApprovalSchema>;

export type ContentFilterSettings = typeof contentFilterSettings.$inferSelect;
export type InsertContentFilterSettings = z.infer<typeof insertContentFilterSettingsSchema>;