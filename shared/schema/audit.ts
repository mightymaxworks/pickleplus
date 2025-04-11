/**
 * PKL-278651-ADMIN-0013-SEC
 * Audit Log Schema
 * 
 * This module defines the schema for the audit logging system,
 * including the available actions and resources.
 */

import { pgTable, text, timestamp, integer, boolean, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { nanoid } from 'nanoid';

// Audit action types
export enum AuditAction {
  // User actions
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  
  // Admin actions
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_LOGOUT = 'ADMIN_LOGOUT',
  ADMIN_SETTINGS_UPDATE = 'ADMIN_SETTINGS_UPDATE',
  
  // Match actions
  MATCH_CREATE = 'MATCH_CREATE',
  MATCH_UPDATE = 'MATCH_UPDATE',
  MATCH_DELETE = 'MATCH_DELETE',
  MATCH_VALIDATE = 'MATCH_VALIDATE',
  MATCH_REJECT = 'MATCH_REJECT',
  
  // Event actions
  EVENT_CREATE = 'EVENT_CREATE',
  EVENT_UPDATE = 'EVENT_UPDATE',
  EVENT_DELETE = 'EVENT_DELETE',
  EVENT_CHECK_IN = 'EVENT_CHECK_IN',
  
  // Golden ticket actions
  GOLDEN_TICKET_CREATE = 'GOLDEN_TICKET_CREATE',
  GOLDEN_TICKET_UPDATE = 'GOLDEN_TICKET_UPDATE',
  GOLDEN_TICKET_DELETE = 'GOLDEN_TICKET_DELETE',
  GOLDEN_TICKET_CLAIM = 'GOLDEN_TICKET_CLAIM',
  
  // Passport actions
  PASSPORT_VERIFY = 'PASSPORT_VERIFY',
  PASSPORT_REJECT = 'PASSPORT_REJECT',
  PASSPORT_CREATE = 'PASSPORT_CREATE',
  
  // Security actions
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ACCESS_DENIED = 'ACCESS_DENIED',
  SECURITY_SUSPICIOUS_ACTIVITY = 'SECURITY_SUSPICIOUS_ACTIVITY',
  
  // Admin security actions
  ADMIN_VIEW_LOGS = 'ADMIN_VIEW_LOGS',
  ADMIN_VIEW_SECURITY = 'ADMIN_VIEW_SECURITY',
  
  // API actions
  API_REQUEST = 'API_REQUEST',
  API_ERROR = 'API_ERROR'
}

// Audit resource types
export enum AuditResource {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MATCH = 'MATCH',
  EVENT = 'EVENT',
  GOLDEN_TICKET = 'GOLDEN_TICKET',
  PASSPORT = 'PASSPORT',
  SECURITY = 'SECURITY',
  AUDIT_LOG = 'AUDIT_LOG',
  API = 'API',
  SYSTEM = 'SYSTEM',
  REPORT = 'REPORT',
  DASHBOARD = 'DASHBOARD'
}

// Create the audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  userId: integer('user_id').notNull(),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent'),
  statusCode: integer('status_code'),
  additionalData: json('additional_data')
});

// Create the insert schema
export const insertAuditLogSchema = createInsertSchema(auditLogs)
  .omit({ id: true })
  .extend({
    action: z.nativeEnum(AuditAction),
    resource: z.nativeEnum(AuditResource)
  });

// Define types
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;