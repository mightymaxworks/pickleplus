/**
 * PKL-278651-AUTH-0016-PROLES - Persistent Role Management Schema
 * 
 * This file defines the database schema for the user role management system,
 * following Framework 5.3 principles of simplicity while providing a robust
 * foundation for role-based access control.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-24
 */

import { pgTable, serial, varchar, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

/**
 * Roles table - Defines the available roles in the system
 */
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  label: varchar("label", { length: 100 }).notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  priority: integer("priority").notNull().default(0), // For role hierarchy - higher number = higher priority
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * User roles junction table - Assigns roles to users
 */
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedBy: integer("assigned_by").references(() => users.id), // Admin who assigned this role
  assignedAt: timestamp("assigned_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional expiration date (null means no expiration)
  isActive: boolean("is_active").default(true) // For temporary role suspension without deletion
});

/**
 * Permissions table - Defines granular permissions for roles
 */
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // For grouping permissions
  createdAt: timestamp("created_at").defaultNow()
});

/**
 * Role permissions junction table - Assigns permissions to roles
 */
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: 'cascade' })
});

/**
 * Role audit log - Tracks changes to user roles
 */
export const roleAuditLogs = pgTable("role_audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => roles.id),
  action: varchar("action", { length: 50 }).notNull(), // 'assign', 'revoke', 'expire', 'activate', 'deactivate'
  performedBy: integer("performed_by").references(() => users.id),
  performedAt: timestamp("performed_at").defaultNow(),
  notes: text("notes")
});

/**
 * Relation definitions
 */
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions)
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id]
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id]
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id]
  })
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions)
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id]
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id]
  })
}));

export const roleAuditLogsRelations = relations(roleAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [roleAuditLogs.userId],
    references: [users.id]
  }),
  role: one(roles, {
    fields: [roleAuditLogs.roleId],
    references: [roles.id]
  }),
  performedByUser: one(users, {
    fields: [roleAuditLogs.performedBy],
    references: [users.id]
  })
}));

/**
 * Zod schemas for validation
 */
export const insertRoleSchema = createInsertSchema(roles);
export const insertUserRoleSchema = createInsertSchema(userRoles);
export const insertPermissionSchema = createInsertSchema(permissions);
export const insertRolePermissionSchema = createInsertSchema(rolePermissions);
export const insertRoleAuditLogSchema = createInsertSchema(roleAuditLogs);

/**
 * Type definitions for TypeScript
 */
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type RoleAuditLog = typeof roleAuditLogs.$inferSelect;
export type InsertRoleAuditLog = z.infer<typeof insertRoleAuditLogSchema>;