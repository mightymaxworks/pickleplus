/**
 * PKL-278651-OAUTH-0001: OAuth Integration Schema
 * 
 * This file defines the database schema for OAuth 2.0 integration,
 * enabling external applications to authenticate users via Pickle+.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import { pgTable, serial, text, timestamp, integer, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../schema';

/**
 * OAuth Client Applications
 * 
 * Represents third-party applications registered to use Pickle+ OAuth.
 * Each application has a unique client ID and secret for authentication.
 */
export const oauthClients = pgTable('oauth_clients', {
  id: serial('id').primaryKey(),
  clientId: text('client_id').notNull().unique(),
  clientSecret: text('client_secret').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  website: text('website'),
  redirectUris: text('redirect_uris').array().notNull(),
  allowedScopes: text('allowed_scopes').array().notNull(),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ownerId: integer('owner_id').references(() => users.id),
  status: text('status').default('pending').notNull(),
  verificationCode: text('verification_code'),
  isVerified: boolean('is_verified').default(false).notNull(),
});

/**
 * Access Tokens
 * 
 * Represents short-lived tokens used to authenticate API requests.
 */
export const accessTokens = pgTable('access_tokens', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clientId: text('client_id').references(() => oauthClients.clientId).notNull(),
  scopes: text('scopes').array().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
});

/**
 * Refresh Tokens
 * 
 * Long-lived tokens used to obtain new access tokens without re-authentication.
 */
export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  accessTokenId: integer('access_token_id').references(() => accessTokens.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
});

/**
 * Authorization Codes
 * 
 * Temporary codes issued during the OAuth flow to be exchanged for tokens.
 */
export const authorizationCodes = pgTable('authorization_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clientId: text('client_id').references(() => oauthClients.clientId).notNull(),
  redirectUri: text('redirect_uri').notNull(),
  scopes: text('scopes').array().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
});

/**
 * User Authorizations
 * 
 * Records of user consent for applications to access their data.
 */
export const userAuthorizations = pgTable('user_authorizations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clientId: text('client_id').references(() => oauthClients.clientId).notNull(),
  scopes: text('scopes').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
});

/**
 * Audit Log for OAuth Activities
 * 
 * Tracks important events in the OAuth system for security and debugging.
 */
export const oauthAuditLogs = pgTable('oauth_audit_logs', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  userId: integer('user_id').references(() => users.id),
  clientId: text('client_id').references(() => oauthClients.clientId),
  ipAddress: text('ip_address'),
  action: text('action').notNull(),
  details: text('details')
});

// Define Zod schemas for validation and type inference

// OAuth Client schemas
export const insertOAuthClientSchema = createInsertSchema(oauthClients).omit({ 
  id: true,
  createdAt: true,
  updatedAt: true
});

export const selectOAuthClientSchema = createSelectSchema(oauthClients);

// Access Token schemas
export const insertAccessTokenSchema = createInsertSchema(accessTokens).omit({ 
  id: true,
  issuedAt: true
});

export const selectAccessTokenSchema = createSelectSchema(accessTokens);

// Refresh Token schemas
export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({ 
  id: true,
  issuedAt: true
});

export const selectRefreshTokenSchema = createSelectSchema(refreshTokens);

// Authorization Code schemas
export const insertAuthorizationCodeSchema = createInsertSchema(authorizationCodes).omit({ 
  id: true,
  issuedAt: true,
  isUsed: true
});

export const selectAuthorizationCodeSchema = createSelectSchema(authorizationCodes);

// User Authorization schemas
export const insertUserAuthorizationSchema = createInsertSchema(userAuthorizations).omit({ 
  id: true,
  createdAt: true,
  lastUsedAt: true
});

export const selectUserAuthorizationSchema = createSelectSchema(userAuthorizations);

// Audit Log schemas
export const insertOAuthAuditLogSchema = createInsertSchema(oauthAuditLogs).omit({ 
  id: true,
  timestamp: true
});

export const selectOAuthAuditLogSchema = createSelectSchema(oauthAuditLogs);

// Type definitions
export type OAuthClient = typeof oauthClients.$inferSelect;
export type InsertOAuthClient = z.infer<typeof insertOAuthClientSchema>;

export type AccessToken = typeof accessTokens.$inferSelect;
export type InsertAccessToken = z.infer<typeof insertAccessTokenSchema>;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;

export type AuthorizationCode = typeof authorizationCodes.$inferSelect;
export type InsertAuthorizationCode = z.infer<typeof insertAuthorizationCodeSchema>;

export type UserAuthorization = typeof userAuthorizations.$inferSelect;
export type InsertUserAuthorization = z.infer<typeof insertUserAuthorizationSchema>;

export type OAuthAuditLog = typeof oauthAuditLogs.$inferSelect;
export type InsertOAuthAuditLog = z.infer<typeof insertOAuthAuditLogSchema>;

// Define available scopes
export const OAUTH_SCOPES = {
  USER_BASIC: 'user:basic',        // Basic profile info (name, email, profile picture)
  USER_ROLES: 'user:roles',        // User's roles (player, coach, etc.)
  USER_RATINGS: 'user:ratings',    // User's CourtIQ ratings and skill levels
  USER_MATCHES: 'user:matches',    // Access to match history
  USER_STATS: 'user:stats',        // Performance statistics
  USER_VERIFIED_ROLES: 'user:verified_roles', // Only verified role information
  OFFLINE_ACCESS: 'offline_access' // Permission to use refresh tokens
} as const;

// Type for scope values
export type OAuthScope = typeof OAUTH_SCOPES[keyof typeof OAUTH_SCOPES];

// OAuth Client statuses
export const OAUTH_CLIENT_STATUSES = {
  PENDING: 'pending',        // Awaiting admin approval
  ACTIVE: 'active',          // Approved and active
  REJECTED: 'rejected',      // Rejected by admin
  SUSPENDED: 'suspended',    // Temporarily suspended
  REVOKED: 'revoked'         // Permanently revoked
} as const;

export type OAuthClientStatus = typeof OAUTH_CLIENT_STATUSES[keyof typeof OAUTH_CLIENT_STATUSES];