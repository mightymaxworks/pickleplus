/**
 * PKL-278651-ADMIN-0015-USER
 * Enhanced User Management Schema
 * 
 * This file contains the schema definitions for enhanced user management capabilities
 * including user notes, administrative actions log, and permission records.
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
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
  actionType: varchar("action_type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON stringified additional details
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow()
});

/**
 * User Permission Overrides Table
 * Allows for granular control of user permissions beyond basic role flags
 */
export const userPermissionOverrides = pgTable("user_permission_overrides", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  permissionKey: varchar("permission_key", { length: 100 }).notNull(),
  allowed: boolean("allowed").notNull(),
  reason: text("reason"),
  addedById: integer("added_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at")
});

/**
 * User Login History Table
 * Tracks user login attempts for security monitoring
 */
export const userLoginHistory = pgTable("user_login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  success: boolean("success").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceInfo: text("device_info"),
  loginAt: timestamp("login_at").defaultNow()
});

/**
 * User Account Status Table
 * Tracks changes to user account status (active, suspended, etc.)
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

// Define relations
export const adminUserNotesRelations = relations(adminUserNotes, ({ one }) => ({
  user: one(users, { fields: [adminUserNotes.userId], references: [users.id] }),
  author: one(users, { fields: [adminUserNotes.authorId], references: [users.id] })
}));

export const adminUserActionsRelations = relations(adminUserActions, ({ one }) => ({
  user: one(users, { fields: [adminUserActions.userId], references: [users.id] }),
  admin: one(users, { fields: [adminUserActions.adminId], references: [users.id] })
}));

export const userPermissionOverridesRelations = relations(userPermissionOverrides, ({ one }) => ({
  user: one(users, { fields: [userPermissionOverrides.userId], references: [users.id] }),
  addedBy: one(users, { fields: [userPermissionOverrides.addedById], references: [users.id] })
}));

export const userLoginHistoryRelations = relations(userLoginHistory, ({ one }) => ({
  user: one(users, { fields: [userLoginHistory.userId], references: [users.id] })
}));

export const userAccountStatusRelations = relations(userAccountStatus, ({ one }) => ({
  user: one(users, { fields: [userAccountStatus.userId], references: [users.id] }),
  changedBy: one(users, { fields: [userAccountStatus.changedById], references: [users.id] })
}));

// Create insert schemas for validation
export const insertAdminUserNoteSchema = createInsertSchema(adminUserNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAdminUserActionSchema = createInsertSchema(adminUserActions).omit({
  id: true,
  createdAt: true
});

export const insertUserPermissionOverrideSchema = createInsertSchema(userPermissionOverrides).omit({
  id: true,
  createdAt: true
});

export const insertUserLoginHistorySchema = createInsertSchema(userLoginHistory).omit({
  id: true,
  loginAt: true
});

export const insertUserAccountStatusSchema = createInsertSchema(userAccountStatus).omit({
  id: true,
  createdAt: true
});

// Create types from schemas
export type AdminUserNote = typeof adminUserNotes.$inferSelect;
export type InsertAdminUserNote = z.infer<typeof insertAdminUserNoteSchema>;

export type AdminUserAction = typeof adminUserActions.$inferSelect;
export type InsertAdminUserAction = z.infer<typeof insertAdminUserActionSchema>;

export type UserPermissionOverride = typeof userPermissionOverrides.$inferSelect;
export type InsertUserPermissionOverride = z.infer<typeof insertUserPermissionOverrideSchema>;

export type UserLoginHistory = typeof userLoginHistory.$inferSelect;
export type InsertUserLoginHistory = z.infer<typeof insertUserLoginHistorySchema>;

export type UserAccountStatus = typeof userAccountStatus.$inferSelect;
export type InsertUserAccountStatus = z.infer<typeof insertUserAccountStatusSchema>;