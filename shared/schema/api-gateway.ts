/**
 * PKL-278651-API-0001-GATEWAY
 * API Gateway and Developer Portal Schema
 * 
 * This file defines the database schema for the API Gateway module,
 * including API keys, usage tracking, and developer accounts.
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

// API developer account table - Extends the regular user account with developer-specific fields
export const apiDeveloperAccounts = pgTable("api_developer_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: varchar("company_name", { length: 255 }),
  website: varchar("website", { length: 255 }),
  developerBio: text("developer_bio"),
  isApproved: boolean("is_approved").default(false),
  approvalDate: timestamp("approval_date"),
  termsAccepted: boolean("terms_accepted").default(false),
  termsAcceptedDate: timestamp("terms_accepted_date"),
  monthlyQuota: integer("monthly_quota").default(10000),
  developerTier: varchar("developer_tier", { length: 50 }).default("free"),
  isTestAccount: boolean("is_test_account").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// API applications table - Represents an application created by a developer
export const apiApplications = pgTable("api_applications", {
  id: serial("id").primaryKey(),
  developerId: integer("developer_id").notNull().references(() => apiDeveloperAccounts.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  applicationUrl: varchar("application_url", { length: 255 }),
  callbackUrl: varchar("callback_url", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, approved, rejected, revoked
  appType: varchar("app_type", { length: 50 }).default("client").notNull(), // client, server, mobile
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// API keys table - API keys generated for applications
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => apiApplications.id),
  keyPrefix: varchar("key_prefix", { length: 10 }).notNull(), // Visible part of the key
  keyHash: varchar("key_hash", { length: 255 }).notNull(), // Hashed full key
  name: varchar("name", { length: 100 }).default("Default"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  lastUsed: timestamp("last_used"),
  scopes: text("scopes").notNull(), // Comma-separated list of allowed scopes
  createdAt: timestamp("created_at").defaultNow(),
  createdByIp: varchar("created_by_ip", { length: 50 })
});

// API usage logs table - Tracks API usage for rate limiting and analytics
export const apiUsageLogs = pgTable("api_usage_logs", {
  id: serial("id").primaryKey(),
  keyId: integer("key_id").references(() => apiKeys.id),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: integer("status_code").notNull(),
  requestSize: integer("request_size"), // Size in bytes
  responseSize: integer("response_size"), // Size in bytes
  processingTime: integer("processing_time"), // Time in milliseconds
  requestIp: varchar("request_ip", { length: 50 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  errorCode: varchar("error_code", { length: 50 }),
  parameters: jsonb("parameters"), // Request parameters (sanitized)
});

// API rate limits table - Configurable rate limits for different plans/endpoints
export const apiRateLimits = pgTable("api_rate_limits", {
  id: serial("id").primaryKey(),
  developerTier: varchar("developer_tier", { length: 50 }).notNull(),
  endpoint: varchar("endpoint", { length: 255 }), // NULL means global limit for the tier
  requestLimit: integer("request_limit").notNull(),
  timeWindow: integer("time_window").notNull(), // Time window in seconds
  concurrentLimit: integer("concurrent_limit"), // Max concurrent requests
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// API documentation table - Stores API endpoint documentation
export const apiDocumentation = pgTable("api_documentation", {
  id: serial("id").primaryKey(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  summary: varchar("summary", { length: 255 }).notNull(),
  description: text("description"),
  requestSchema: jsonb("request_schema"), // JSON schema for request validation
  responseSchema: jsonb("response_schema"), // JSON schema for response
  authRequired: boolean("auth_required").default(true),
  requiredScopes: text("required_scopes"), // Comma-separated list of required scopes
  deprecated: boolean("deprecated").default(false),
  version: varchar("version", { length: 20 }).default("1.0"),
  tags: text("tags"), // Comma-separated tags for documentation grouping
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// API webhooks table - Configured webhook endpoints for applications
export const apiWebhooks = pgTable("api_webhooks", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => apiApplications.id),
  url: varchar("url", { length: 255 }).notNull(),
  events: text("events").notNull(), // Comma-separated list of events to subscribe to
  isActive: boolean("is_active").default(true),
  secret: varchar("secret", { length: 255 }).notNull(), // Secret for webhook signature verification
  failureCount: integer("failure_count").default(0),
  lastFailure: timestamp("last_failure"),
  lastSuccess: timestamp("last_success"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// API webhook delivery logs table - Tracks webhook delivery attempts
export const apiWebhookDeliveryLogs = pgTable("api_webhook_delivery_logs", {
  id: serial("id").primaryKey(),
  webhookId: integer("webhook_id").notNull().references(() => apiWebhooks.id),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  payloadSnapshot: jsonb("payload_snapshot"), // Snapshot of the delivered payload
  statusCode: integer("status_code"),
  success: boolean("success").default(false),
  errorMessage: text("error_message"),
  attemptCount: integer("attempt_count").default(1),
  deliveredAt: timestamp("delivered_at").defaultNow()
});

// Relations
export const apiDeveloperAccountsRelations = relations(apiDeveloperAccounts, ({ one }) => ({
  user: one(users, {
    fields: [apiDeveloperAccounts.userId],
    references: [users.id]
  })
}));

export const apiApplicationsRelations = relations(apiApplications, ({ one, many }) => ({
  developer: one(apiDeveloperAccounts, {
    fields: [apiApplications.developerId],
    references: [apiDeveloperAccounts.id]
  }),
  apiKeys: many(apiKeys)
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  application: one(apiApplications, {
    fields: [apiKeys.applicationId],
    references: [apiApplications.id]
  }),
  usageLogs: many(apiUsageLogs)
}));

export const apiUsageLogsRelations = relations(apiUsageLogs, ({ one }) => ({
  apiKey: one(apiKeys, {
    fields: [apiUsageLogs.keyId],
    references: [apiKeys.id]
  })
}));

export const apiWebhooksRelations = relations(apiWebhooks, ({ one, many }) => ({
  application: one(apiApplications, {
    fields: [apiWebhooks.applicationId],
    references: [apiApplications.id]
  }),
  deliveryLogs: many(apiWebhookDeliveryLogs)
}));

export const apiWebhookDeliveryLogsRelations = relations(apiWebhookDeliveryLogs, ({ one }) => ({
  webhook: one(apiWebhooks, {
    fields: [apiWebhookDeliveryLogs.webhookId],
    references: [apiWebhooks.id]
  })
}));

// Insert schemas for each table
export const insertApiDeveloperAccountSchema = createInsertSchema(apiDeveloperAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApiApplicationSchema = createInsertSchema(apiApplications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true });
export const insertApiUsageLogSchema = createInsertSchema(apiUsageLogs).omit({ id: true, timestamp: true });
export const insertApiRateLimitSchema = createInsertSchema(apiRateLimits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApiDocumentationSchema = createInsertSchema(apiDocumentation).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApiWebhookSchema = createInsertSchema(apiWebhooks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApiWebhookDeliveryLogSchema = createInsertSchema(apiWebhookDeliveryLogs).omit({ id: true, deliveredAt: true });

// Type definitions for insert and select operations
export type ApiDeveloperAccount = typeof apiDeveloperAccounts.$inferSelect;
export type InsertApiDeveloperAccount = z.infer<typeof insertApiDeveloperAccountSchema>;

export type ApiApplication = typeof apiApplications.$inferSelect;
export type InsertApiApplication = z.infer<typeof insertApiApplicationSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type ApiUsageLog = typeof apiUsageLogs.$inferSelect;
export type InsertApiUsageLog = z.infer<typeof insertApiUsageLogSchema>;

export type ApiRateLimit = typeof apiRateLimits.$inferSelect;
export type InsertApiRateLimit = z.infer<typeof insertApiRateLimitSchema>;

export type ApiDocumentation = typeof apiDocumentation.$inferSelect;
export type InsertApiDocumentation = z.infer<typeof insertApiDocumentationSchema>;

export type ApiWebhook = typeof apiWebhooks.$inferSelect;
export type InsertApiWebhook = z.infer<typeof insertApiWebhookSchema>;

export type ApiWebhookDeliveryLog = typeof apiWebhookDeliveryLogs.$inferSelect;
export type InsertApiWebhookDeliveryLog = z.infer<typeof insertApiWebhookDeliveryLogSchema>;