/**
 * PKL-278651-OAUTH-001 - OAuth API Database Schema
 * 
 * Defines the database schema for the OAuth server functionality.
 * These tables support client registration, token management, and user consents.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import { pgTable, serial, text, timestamp, integer, uuid, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../schema';

/**
 * OAuth Client Applications
 * Represents third-party applications registered to use Pickle+ authentication
 */
export const oauthClients = pgTable('oauth_clients', {
  id: serial('id').primaryKey(),
  clientId: uuid('client_id').defaultRandom().notNull().unique(),
  clientSecret: text('client_secret').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  websiteUrl: text('website_url'),
  logoUrl: text('logo_url'),
  privacyPolicyUrl: text('privacy_policy_url'),
  termsOfServiceUrl: text('terms_of_service_url'),
  redirectUris: text('redirect_uris').array().notNull(),
  allowedScopes: text('allowed_scopes').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  developerId: integer('developer_id').references(() => users.id).notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'revoked'] }).default('pending').notNull(),
  // JWT signing algorithm
  tokenSigningAlg: text('token_signing_alg', { enum: ['HS256', 'RS256'] }).default('HS256').notNull(),
  // For public clients (no secret)
  isPublicClient: boolean('is_public_client').default(false).notNull(),
  // Verification data
  verificationNotes: text('verification_notes'),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: integer('verified_by').references(() => users.id),
});

/**
 * OAuth Access Tokens
 * Short-lived tokens used to access protected resources
 */
export const accessTokens = pgTable('oauth_access_tokens', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clientId: uuid('client_id').references(() => oauthClients.clientId).notNull(),
  scopes: text('scopes').array().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
});

/**
 * OAuth Refresh Tokens
 * Long-lived tokens used to obtain new access tokens
 */
export const refreshTokens = pgTable('oauth_refresh_tokens', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  accessTokenId: integer('access_token_id').references(() => accessTokens.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
  // Rotation tracking
  replacedByTokenId: integer('replaced_by_token_id').references(() => refreshTokens.id),
});

/**
 * OAuth Authorization Codes
 * Temporary codes used in the authorization code flow
 */
export const authorizationCodes = pgTable('oauth_authorization_codes', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clientId: uuid('client_id').references(() => oauthClients.clientId).notNull(),
  redirectUri: text('redirect_uri').notNull(),
  scopes: text('scopes').array().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  codeChallenge: text('code_challenge'),
  codeChallengeMethod: text('code_challenge_method', { enum: ['S256', 'plain'] }),
  // Security improvements
  nonce: text('nonce'),
  used: boolean('used').default(false).notNull(),
});

/**
 * User Authorizations (user consents)
 * Records of user consent to allow applications to access their data
 */
export const userAuthorizations = pgTable('oauth_user_authorizations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clientId: uuid('client_id').references(() => oauthClients.clientId).notNull(),
  scopes: text('scopes').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  // Additional data
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  // Allows users to revoke specific authorizations
  revokedAt: timestamp('revoked_at'),
  revokedReason: text('revoked_reason'),
});

/**
 * Developer Profiles
 * Extended information about developers who register applications
 */
export const developerProfiles = pgTable('oauth_developer_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  companyName: text('company_name'),
  companyWebsite: text('company_website'),
  contactEmail: text('contact_email').notNull(),
  verificationStatus: text('verification_status', { 
    enum: ['unverified', 'pending', 'verified', 'rejected'] 
  }).default('unverified').notNull(),
  verificationDocumentUrl: text('verification_document_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: integer('verified_by').references(() => users.id),
});

/**
 * OAuth API Usage Logs
 * Records of API usage by third-party applications
 */
export const apiUsageLogs = pgTable('oauth_api_usage_logs', {
  id: serial('id').primaryKey(),
  clientId: uuid('client_id').references(() => oauthClients.clientId).notNull(),
  userId: integer('user_id').references(() => users.id),
  endpoint: text('endpoint').notNull(),
  method: text('method', { enum: ['GET', 'POST', 'PUT', 'DELETE'] }).notNull(),
  statusCode: integer('status_code').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  responseTime: integer('response_time'),
  // For rate limiting and monitoring
  rateLimit: integer('rate_limit'),
  rateLimitRemaining: integer('rate_limit_remaining'),
});

// Zod schemas for type validation

export const insertOAuthClientSchema = createInsertSchema(oauthClients, {
  redirectUris: z.array(z.string().url('Must be a valid URL')),
  allowedScopes: z.array(z.string()),
  status: z.enum(['pending', 'approved', 'rejected', 'revoked']),
  tokenSigningAlg: z.enum(['HS256', 'RS256']),
}).omit({ 
  id: true, 
  clientId: true, 
  clientSecret: true, 
  createdAt: true, 
  updatedAt: true, 
  verifiedAt: true,
  verifiedBy: true
});

export const insertDeveloperProfileSchema = createInsertSchema(developerProfiles, {
  contactEmail: z.string().email('Must be a valid email'),
  companyWebsite: z.string().url('Must be a valid URL').optional(),
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  verifiedAt: true, 
  verifiedBy: true 
});

// Type definitions for TypeScript
export type OAuthClient = typeof oauthClients.$inferSelect;
export type InsertOAuthClient = z.infer<typeof insertOAuthClientSchema>;

export type AccessToken = typeof accessTokens.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type AuthorizationCode = typeof authorizationCodes.$inferSelect;
export type UserAuthorization = typeof userAuthorizations.$inferSelect;

export type DeveloperProfile = typeof developerProfiles.$inferSelect;
export type InsertDeveloperProfile = z.infer<typeof insertDeveloperProfileSchema>;

export type ApiUsageLog = typeof apiUsageLogs.$inferSelect;

// Export available scopes for the OAuth system
export const AVAILABLE_SCOPES = {
  // Basic scopes
  'profile': 'Access to basic profile information',
  'email': 'Access to your email address',
  
  // Extended profile scopes
  'profile.extended': 'Access to detailed profile information',
  'profile.avatar': 'Access to profile picture',
  
  // Ratings and skills
  'ratings.read': 'View your CourtIQ™ ratings',
  'ratings.history': 'Access your historical rating data',
  
  // Roles
  'roles.read': 'View your pickleball roles',
  
  // Match data
  'matches.read': 'View your match history',
  'matches.stats': 'Access detailed match statistics',
  
  // Tournaments
  'tournaments.read': 'View your tournament participation',
  'tournaments.upcoming': 'View your upcoming tournaments',
  
  // Journey data (limited)
  'journey.summary': 'View PickleJourney™ summary data',
  
  // Others as needed
  'offline_access': 'Access to your data when you are not using the application'
};

// Export scope groupings for common use cases
export const SCOPE_GROUPS = {
  'basic': ['profile', 'email'],
  'competitive': ['profile', 'email', 'ratings.read', 'matches.read', 'tournaments.read'],
  'analytics': ['profile', 'ratings.read', 'ratings.history', 'matches.stats'],
  'coaching': ['profile', 'ratings.read', 'matches.read', 'journey.summary']
};