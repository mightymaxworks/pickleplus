/**
 * PKL-278651-ADMIN-0015-USER
 * Enhanced User Management Schema
 * 
 * This file contains the schema definitions for enhanced user management capabilities
 * including user notes, administrative actions log, user statuses, and permission records.
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../../schema";

/**
 * Admin User Notes Table
 * Allows administrators to add persistent notes to user accounts
 */
export const adminUserNotes = pgTable("admin_user_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  note: text("note").notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull().default("admin"), // admin, system
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Admin User Actions Table
 * Records administrative actions taken on user accounts
 */
export const adminUserActions = pgTable("admin_user_actions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent")
});

/**
 * User Login History Table
 * Records user login attempts and related information
 */
export const userLoginHistory = pgTable("user_login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
  success: boolean("success").notNull(),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  location: varchar("location", { length: 100 }),
  device: varchar("device", { length: 100 })
});

/**
 * User Account Status Table
 * Tracks user account status changes
 */
export const userAccountStatus = pgTable("user_account_status", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, suspended, restricted, deactivated
  reason: text("reason"),
  changedById: integer("changed_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at")
});

/**
 * User Permission Overrides Table
 * Allows for granting or revoking specific permissions to users
 */
export const userPermissionOverrides = pgTable("user_permission_overrides", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  permission: varchar("permission", { length: 100 }).notNull(),
  granted: boolean("granted").notNull(),
  reason: text("reason"),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at")
});

/**
 * Schema Relations
 */

// Admin User Notes Relations
export const adminUserNotesRelations = relations(adminUserNotes, ({ one }) => ({
  user: one(users, {
    fields: [adminUserNotes.userId],
    references: [users.id],
  }),
  author: one(users, {
    fields: [adminUserNotes.authorId],
    references: [users.id],
  }),
}));

// Admin User Actions Relations
export const adminUserActionsRelations = relations(adminUserActions, ({ one }) => ({
  user: one(users, {
    fields: [adminUserActions.userId],
    references: [users.id],
  }),
  admin: one(users, {
    fields: [adminUserActions.adminId],
    references: [users.id],
  }),
}));

// User Login History Relations
export const userLoginHistoryRelations = relations(userLoginHistory, ({ one }) => ({
  user: one(users, {
    fields: [userLoginHistory.userId],
    references: [users.id],
  }),
}));

// User Account Status Relations
export const userAccountStatusRelations = relations(userAccountStatus, ({ one }) => ({
  user: one(users, {
    fields: [userAccountStatus.userId],
    references: [users.id],
  }),
  changedBy: one(users, {
    fields: [userAccountStatus.changedById],
    references: [users.id],
  }),
}));

// User Permission Overrides Relations
export const userPermissionOverridesRelations = relations(userPermissionOverrides, ({ one }) => ({
  user: one(users, {
    fields: [userPermissionOverrides.userId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [userPermissionOverrides.createdById],
    references: [users.id],
  }),
}));

/**
 * Insert Schemas
 */

// Admin User Notes Insert Schema
export const insertAdminUserNoteSchema = createInsertSchema(adminUserNotes);
export type InsertAdminUserNote = z.infer<typeof insertAdminUserNoteSchema>;

// Admin User Actions Insert Schema
export const insertAdminUserActionSchema = createInsertSchema(adminUserActions);
export type InsertAdminUserAction = z.infer<typeof insertAdminUserActionSchema>;

// User Login History Insert Schema
export const insertUserLoginHistorySchema = createInsertSchema(userLoginHistory);
export type InsertUserLoginHistory = z.infer<typeof insertUserLoginHistorySchema>;

// User Account Status Insert Schema
export const insertUserAccountStatusSchema = createInsertSchema(userAccountStatus);
export type InsertUserAccountStatus = z.infer<typeof insertUserAccountStatusSchema>;

// User Permission Overrides Insert Schema
export const insertUserPermissionOverrideSchema = createInsertSchema(userPermissionOverrides);
export type InsertUserPermissionOverride = z.infer<typeof insertUserPermissionOverrideSchema>;