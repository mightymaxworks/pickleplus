/**
 * Admin Security Schema
 * 
 * PKL-278651-ADMIN-SEC-001
 * Comprehensive admin role-based access control and audit logging system
 * UDF Rule 19 & 20 Compliance - Hierarchical Admin Security & Mandatory Audit Trails
 */
import { pgTable, serial, varchar, text, boolean, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

// Admin Role Enum - UDF Rule 19 Compliance
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',    // Full system access
  ADMIN = 'admin',               // Feature management  
  MODERATOR = 'moderator',       // Content moderation
  SUPPORT = 'support',           // Read-only + basic actions
  AUDITOR = 'auditor'           // Read-only compliance access
}

// Admin role assignments table
export const adminRoles = pgTable("admin_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull(), // AdminRole enum
  assignedBy: integer("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // Optional role expiration
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions"), // Role-specific permissions override
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin permissions table - Granular permission system
export const adminPermissions = pgTable("admin_permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // e.g., 'users', 'matches', 'finance'
  action: varchar("action", { length: 50 }).notNull(), // e.g., 'create', 'read', 'update', 'delete'
  resource: varchar("resource", { length: 100 }).notNull(), // e.g., 'user_profiles', 'match_results'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Role-Permission mapping
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 50 }).notNull(), // AdminRole enum
  permissionId: integer("permission_id").notNull().references(() => adminPermissions.id),
  isGranted: boolean("is_granted").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin audit log - UDF Rule 20 Compliance
export const adminAuditLog = pgTable("admin_audit_log", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // Action taken
  resource: varchar("resource", { length: 100 }).notNull(), // Resource affected
  resourceId: varchar("resource_id", { length: 100 }), // ID of affected resource
  previousState: jsonb("previous_state"), // State before action
  newState: jsonb("new_state"), // State after action
  metadata: jsonb("metadata"), // Additional context
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4/IPv6 support
  userAgent: text("user_agent"),
  sessionId: varchar("session_id", { length: 128 }),
  success: boolean("success").default(true),
  errorMessage: text("error_message"), // If action failed
  timestamp: timestamp("timestamp").defaultNow(),
  
  // Security and compliance fields
  riskLevel: varchar("risk_level", { length: 20 }).default('low'), // low, medium, high, critical
  complianceFlags: jsonb("compliance_flags"), // GDPR, SOX, etc.
  reviewStatus: varchar("review_status", { length: 20 }).default('pending'), // pending, approved, flagged
});

// Admin session tracking for enhanced security
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  sessionId: varchar("session_id", { length: 128 }).notNull().unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  loginAt: timestamp("login_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  logoutAt: timestamp("logout_at"),
  isActive: boolean("is_active").default(true),
  
  // Enhanced security fields
  mfaVerified: boolean("mfa_verified").default(false),
  deviceFingerprint: varchar("device_fingerprint", { length: 128 }),
  geoLocation: jsonb("geo_location"), // Country, city, etc.
  riskScore: integer("risk_score").default(0), // 0-100 risk assessment
});

// Relations
export const adminRolesRelations = relations(adminRoles, ({ one }) => ({
  user: one(users, {
    fields: [adminRoles.userId],
    references: [users.id]
  }),
  assignedByUser: one(users, {
    fields: [adminRoles.assignedBy],
    references: [users.id]
  }),
}));

export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
  admin: one(users, {
    fields: [adminAuditLog.adminId],
    references: [users.id]
  }),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  admin: one(users, {
    fields: [adminSessions.adminId],
    references: [users.id]
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  permission: one(adminPermissions, {
    fields: [rolePermissions.permissionId],
    references: [adminPermissions.id]
  }),
}));

// Zod schemas for validation
export const insertAdminRoleSchema = createInsertSchema(adminRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminPermissionSchema = createInsertSchema(adminPermissions).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(adminAuditLog).omit({
  id: true,
  timestamp: true,
});

export const insertAdminSessionSchema = createInsertSchema(adminSessions).omit({
  id: true,
  loginAt: true,
  lastActivityAt: true,
});

// Types
export type AdminRoleRecord = typeof adminRoles.$inferSelect;
export type InsertAdminRole = z.infer<typeof insertAdminRoleSchema>;

export type AdminPermission = typeof adminPermissions.$inferSelect;
export type InsertAdminPermission = z.infer<typeof insertAdminPermissionSchema>;

export type AdminAuditLogEntry = typeof adminAuditLog.$inferSelect;
export type InsertAuditLogEntry = z.infer<typeof insertAuditLogSchema>;

export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = z.infer<typeof insertAdminSessionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;

// Permission check helper types
export interface AdminActionContext {
  adminId: number;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AdminPermissionCheck {
  hasPermission: boolean;
  role: AdminRole;
  permissions: string[];
  reason?: string;
}

// Audit action types for consistent logging
export enum AdminActionType {
  // User management
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  SUSPEND_USER = 'suspend_user',
  RESTORE_USER = 'restore_user',
  
  // Match management
  CREATE_MATCH = 'create_match',
  UPDATE_MATCH = 'update_match',
  DELETE_MATCH = 'delete_match',
  APPROVE_MATCH = 'approve_match',
  REJECT_MATCH = 'reject_match',
  
  // System management
  UPDATE_SYSTEM_SETTINGS = 'update_system_settings',
  BULK_DATA_IMPORT = 'bulk_data_import',
  BULK_DATA_EXPORT = 'bulk_data_export',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  
  // Security actions
  GRANT_ADMIN_ROLE = 'grant_admin_role',
  REVOKE_ADMIN_ROLE = 'revoke_admin_role',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_LOCKOUT = 'account_lockout',
  
  // Financial actions
  PROCESS_REFUND = 'process_refund',
  ADJUST_BALANCE = 'adjust_balance',
  VIEW_FINANCIAL_DATA = 'view_financial_data',
}

// Default permissions for each role
export const DEFAULT_ROLE_PERMISSIONS = {
  [AdminRole.SUPER_ADMIN]: [
    'users.*', 'matches.*', 'finance.*', 'system.*', 'admin.*'
  ],
  [AdminRole.ADMIN]: [
    'users.read', 'users.update', 'matches.*', 'system.read', 'admin.read'
  ],
  [AdminRole.MODERATOR]: [
    'users.read', 'users.update', 'matches.read', 'matches.moderate'
  ],
  [AdminRole.SUPPORT]: [
    'users.read', 'matches.read', 'tickets.*'
  ],
  [AdminRole.AUDITOR]: [
    '*.read', 'audit.*', 'reports.*'
  ]
};