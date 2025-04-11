/**
 * PKL-278651-ADMIN-0013-SEC
 * Audit Logging Schema
 * 
 * This defines the schema for the audit logging system used to track admin actions.
 * It follows PKL-278651 Framework 5.0 and modular architecture principles.
 */

import { createId } from '@paralleldrive/cuid2';
import { pgTable, text, timestamp, integer, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Audit log table to record admin actions
 */
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
  timestamp: timestamp('timestamp', { mode: 'date' }).defaultNow().notNull(),
  userId: integer('user_id').notNull(),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  statusCode: integer('status_code'),
  additionalData: json('additional_data')
});

/**
 * Audit action types
 */
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS = 'access',
  EXPORT = 'export',
  CONFIG = 'config',
  BULK_ACTION = 'bulk_action'
}

/**
 * Audit resource types
 */
export enum AuditResource {
  USER = 'user',
  MATCH = 'match',
  EVENT = 'event',
  TOURNAMENT = 'tournament',
  ADMIN_DASHBOARD = 'admin_dashboard',
  SYSTEM_SETTINGS = 'system_settings',
  USER_ROLE = 'user_role',
  GOLDEN_TICKET = 'golden_ticket',
  REDEMPTION_CODE = 'redemption_code'
}

// Schema for inserting a new audit log
export const insertAuditLogSchema = createInsertSchema(auditLogs, {
  timestamp: z.coerce.date(),
  userId: z.number().int().positive(),
  action: z.nativeEnum(AuditAction),
  resource: z.nativeEnum(AuditResource),
  resourceId: z.string().optional(),
  ipAddress: z.string(),
  userAgent: z.string().optional(),
  statusCode: z.number().int().optional(),
  additionalData: z.record(z.any()).optional()
});

// Schema for selecting an audit log
export const selectAuditLogSchema = createSelectSchema(auditLogs, {
  timestamp: z.coerce.date(),
  userId: z.number().int().positive(),
  action: z.nativeEnum(AuditAction),
  resource: z.nativeEnum(AuditResource)
});

// Type definitions
export type AuditLog = z.infer<typeof selectAuditLogSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;