/**
 * PKL-278651-OAUTH-0002: OAuth Service
 * 
 * Core service for handling OAuth token generation, validation, and management.
 * Implements the OAuth 2.0 specification for authorization code flow.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import { db } from '../db';
import { 
  accessTokens, 
  refreshTokens, 
  authorizationCodes, 
  oauthClients, 
  userAuthorizations,
  oauthAuditLogs,
  OAUTH_SCOPES,
  InsertAccessToken,
  InsertRefreshToken,
  InsertAuthorizationCode,
  InsertUserAuthorization,
  InsertOAuthAuditLog
} from '@shared/schema/oauth';
import { insertOAuthClientSchema } from '@shared/schema/oauth';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { eq, and, isNull, or } from 'drizzle-orm';
import { users } from '@shared/schema';
import { Request } from 'express';

// Configuration
const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds
const AUTH_CODE_EXPIRY = 10 * 60; // 10 minutes in seconds

// Ensure we have the required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required for OAuth functionality");
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Create a new OAuth client application
 */
export async function createOAuthClient(data: any) {
  try {
    const parsedData = insertOAuthClientSchema.parse({
      ...data,
      clientId: generateSecureToken(16),
      clientSecret: generateSecureToken(32)
    });
    
    const [client] = await db.insert(oauthClients).values(parsedData).returning();
    
    await createAuditLog({
      action: 'client_created',
      clientId: client.clientId,
      userId: client.ownerId,
      details: `OAuth client ${client.name} created`
    });
    
    return client;
  } catch (error) {
    console.error('Error creating OAuth client:', error);
    throw error;
  }
}

/**
 * Validate an OAuth client's credentials
 */
export async function validateClientCredentials(clientId: string, clientSecret: string) {
  const [client] = await db
    .select()
    .from(oauthClients)
    .where(and(
      eq(oauthClients.clientId, clientId),
      eq(oauthClients.clientSecret, clientSecret),
      eq(oauthClients.status, 'active')
    ));
  
  return Boolean(client);
}

/**
 * Create an authorization code
 */
export async function createAuthorizationCode(data: {
  userId: number;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}): Promise<string> {
  try {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + AUTH_CODE_EXPIRY);
    
    const code = generateSecureToken(24);
    
    const insertData: InsertAuthorizationCode = {
      ...data,
      code,
      expiresAt
    };
    
    await db.insert(authorizationCodes).values(insertData);
    
    await createAuditLog({
      action: 'authorization_code_created',
      clientId: data.clientId,
      userId: data.userId,
      details: `Authorization code created for ${data.scopes.join(', ')}`
    });
    
    return code;
  } catch (error) {
    console.error('Error creating authorization code:', error);
    throw error;
  }
}

/**
 * Verify and use an authorization code to create tokens
 */
export async function useAuthorizationCode(
  code: string,
  clientId: string,
  redirectUri: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    // Find the authorization code
    const [authCode] = await db
      .select()
      .from(authorizationCodes)
      .where(and(
        eq(authorizationCodes.code, code),
        eq(authorizationCodes.clientId, clientId),
        eq(authorizationCodes.redirectUri, redirectUri),
        eq(authorizationCodes.isUsed, false)
      ));
    
    if (!authCode) {
      return null;
    }
    
    // Check if code is expired
    if (new Date() > authCode.expiresAt) {
      await db
        .update(authorizationCodes)
        .set({ isUsed: true })
        .where(eq(authorizationCodes.id, authCode.id));
      
      return null;
    }
    
    // Mark code as used
    await db
      .update(authorizationCodes)
      .set({ isUsed: true })
      .where(eq(authorizationCodes.id, authCode.id));
    
    // Create access token and refresh token
    const tokens = await createTokenPair(authCode.userId, clientId, authCode.scopes);
    
    await createAuditLog({
      action: 'authorization_code_used',
      clientId,
      userId: authCode.userId,
      details: `Authorization code exchanged for tokens`
    });
    
    return tokens;
  } catch (error) {
    console.error('Error using authorization code:', error);
    throw error;
  }
}

/**
 * Create an access token and refresh token pair
 */
export async function createTokenPair(
  userId: number,
  clientId: string,
  scopes: string[]
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  try {
    // Create expiry dates
    const accessExpiresAt = new Date();
    accessExpiresAt.setSeconds(accessExpiresAt.getSeconds() + ACCESS_TOKEN_EXPIRY);
    
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setSeconds(refreshExpiresAt.getSeconds() + REFRESH_TOKEN_EXPIRY);
    
    // Generate tokens
    const accessTokenValue = generateJwtToken(userId, clientId, scopes, ACCESS_TOKEN_EXPIRY);
    const refreshTokenValue = generateSecureToken(40);
    
    // Store access token
    const accessTokenData: InsertAccessToken = {
      token: accessTokenValue,
      userId,
      clientId,
      scopes,
      expiresAt: accessExpiresAt
    };
    
    const [accessTokenRecord] = await db
      .insert(accessTokens)
      .values(accessTokenData)
      .returning();
    
    // Store refresh token
    const refreshTokenData: InsertRefreshToken = {
      token: refreshTokenValue,
      accessTokenId: accessTokenRecord.id,
      expiresAt: refreshExpiresAt
    };
    
    await db.insert(refreshTokens).values(refreshTokenData);
    
    // Record user authorization if it doesn't exist
    const [existingAuth] = await db
      .select()
      .from(userAuthorizations)
      .where(and(
        eq(userAuthorizations.userId, userId),
        eq(userAuthorizations.clientId, clientId)
      ));
    
    if (!existingAuth) {
      const authData: InsertUserAuthorization = {
        userId,
        clientId,
        scopes
      };
      
      await db.insert(userAuthorizations).values(authData);
    } else {
      // Update last used time
      await db
        .update(userAuthorizations)
        .set({ lastUsedAt: new Date() })
        .where(and(
          eq(userAuthorizations.userId, userId),
          eq(userAuthorizations.clientId, clientId)
        ));
    }
    
    return {
      accessToken: accessTokenValue,
      refreshToken: refreshTokenValue,
      expiresIn: ACCESS_TOKEN_EXPIRY
    };
  } catch (error) {
    console.error('Error creating token pair:', error);
    throw error;
  }
}

/**
 * Generate a signed JWT token
 */
function generateJwtToken(
  userId: number,
  clientId: string,
  scopes: string[],
  expiresIn: number
): string {
  const payload = {
    sub: userId.toString(),
    client_id: clientId,
    scopes,
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
}

/**
 * Refresh an access token using a refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    // Find the refresh token
    const [token] = await db
      .select()
      .from(refreshTokens)
      .where(and(
        eq(refreshTokens.token, refreshToken),
        isNull(refreshTokens.revokedAt)
      ));
    
    if (!token) {
      return null;
    }
    
    // Check if refresh token is expired
    if (new Date() > token.expiresAt) {
      await revokeRefreshToken(token.token);
      return null;
    }
    
    // Get the associated access token
    const [accessToken] = await db
      .select()
      .from(accessTokens)
      .where(eq(accessTokens.id, token.accessTokenId));
    
    if (!accessToken) {
      await revokeRefreshToken(token.token);
      return null;
    }
    
    // Revoke the old tokens
    await revokeAccessToken(accessToken.token);
    await revokeRefreshToken(token.token);
    
    // Create new token pair
    const tokens = await createTokenPair(
      accessToken.userId,
      accessToken.clientId,
      accessToken.scopes
    );
    
    await createAuditLog({
      action: 'token_refreshed',
      clientId: accessToken.clientId,
      userId: accessToken.userId,
      details: `Access token refreshed for user ${accessToken.userId}`
    });
    
    return tokens;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

/**
 * Revoke an access token
 */
export async function revokeAccessToken(token: string): Promise<boolean> {
  try {
    const [accessToken] = await db
      .select()
      .from(accessTokens)
      .where(eq(accessTokens.token, token));
    
    if (!accessToken) {
      return false;
    }
    
    await db
      .update(accessTokens)
      .set({ revokedAt: new Date() })
      .where(eq(accessTokens.token, token));
    
    await createAuditLog({
      action: 'token_revoked',
      clientId: accessToken.clientId,
      userId: accessToken.userId,
      details: `Access token revoked`
    });
    
    return true;
  } catch (error) {
    console.error('Error revoking access token:', error);
    throw error;
  }
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(token: string): Promise<boolean> {
  try {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, token));
    
    return true;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    throw error;
  }
}

/**
 * Validate an access token
 */
export async function validateAccessToken(token: string): Promise<{
  valid: boolean;
  userId?: number;
  clientId?: string;
  scopes?: string[];
}> {
  try {
    // Verify token validity
    let payload: any;
    
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (e) {
      return { valid: false };
    }
    
    // Check if token is in database and not revoked
    const [accessToken] = await db
      .select()
      .from(accessTokens)
      .where(and(
        eq(accessTokens.token, token),
        isNull(accessTokens.revokedAt)
      ));
    
    if (!accessToken) {
      return { valid: false };
    }
    
    // Verify expiration
    if (new Date() > accessToken.expiresAt) {
      return { valid: false };
    }
    
    return {
      valid: true,
      userId: accessToken.userId,
      clientId: accessToken.clientId,
      scopes: accessToken.scopes
    };
  } catch (error) {
    console.error('Error validating access token:', error);
    return { valid: false };
  }
}

/**
 * Create a user authorization record
 */
export async function createUserAuthorization(data: {
  userId: number;
  clientId: string;
  scopes: string[];
}): Promise<boolean> {
  try {
    // Check if authorization already exists
    const [existing] = await db
      .select()
      .from(userAuthorizations)
      .where(and(
        eq(userAuthorizations.userId, data.userId),
        eq(userAuthorizations.clientId, data.clientId)
      ));
    
    if (existing) {
      // Update scopes and last used time
      await db
        .update(userAuthorizations)
        .set({
          scopes: data.scopes,
          lastUsedAt: new Date()
        })
        .where(and(
          eq(userAuthorizations.userId, data.userId),
          eq(userAuthorizations.clientId, data.clientId)
        ));
    } else {
      // Create new authorization
      const authData: InsertUserAuthorization = data;
      await db.insert(userAuthorizations).values(authData);
    }
    
    await createAuditLog({
      action: 'user_authorization_created',
      clientId: data.clientId,
      userId: data.userId,
      details: `User authorized client for scopes: ${data.scopes.join(', ')}`
    });
    
    return true;
  } catch (error) {
    console.error('Error creating user authorization:', error);
    throw error;
  }
}

/**
 * Get a user's authorizations (connected applications)
 */
export async function getUserAuthorizations(userId: number) {
  try {
    const authorizations = await db
      .select({
        auth: userAuthorizations,
        client: {
          name: oauthClients.name,
          description: oauthClients.description,
          website: oauthClients.website,
          logoUrl: oauthClients.logoUrl
        }
      })
      .from(userAuthorizations)
      .leftJoin(
        oauthClients,
        eq(userAuthorizations.clientId, oauthClients.clientId)
      )
      .where(eq(userAuthorizations.userId, userId));
    
    return authorizations;
  } catch (error) {
    console.error('Error getting user authorizations:', error);
    throw error;
  }
}

/**
 * Revoke a user's authorization for a client
 */
export async function revokeUserAuthorization(userId: number, clientId: string): Promise<boolean> {
  try {
    // Delete the authorization
    await db
      .delete(userAuthorizations)
      .where(and(
        eq(userAuthorizations.userId, userId),
        eq(userAuthorizations.clientId, clientId)
      ));
    
    // Revoke all related access tokens
    const clientTokens = await db
      .select()
      .from(accessTokens)
      .where(and(
        eq(accessTokens.userId, userId),
        eq(accessTokens.clientId, clientId),
        isNull(accessTokens.revokedAt)
      ));
    
    for (const token of clientTokens) {
      await revokeAccessToken(token.token);
    }
    
    await createAuditLog({
      action: 'user_authorization_revoked',
      clientId,
      userId,
      details: `User revoked authorization for client`
    });
    
    return true;
  } catch (error) {
    console.error('Error revoking user authorization:', error);
    throw error;
  }
}

/**
 * Get detailed information about an OAuth client
 */
export async function getOAuthClient(clientId: string) {
  try {
    const [client] = await db
      .select()
      .from(oauthClients)
      .where(eq(oauthClients.clientId, clientId));
    
    if (!client) {
      return null;
    }
    
    return client;
  } catch (error) {
    console.error('Error getting OAuth client:', error);
    throw error;
  }
}

/**
 * Get a specific OAuth client by its ID - alias for getOAuthClient
 */
export async function getClientById(clientId: string): Promise<any> {
  return getOAuthClient(clientId);
}

/**
 * Get all OAuth clients owned by a specific user
 */
export async function getClientsByOwnerId(userId: number): Promise<any[]> {
  try {
    const clients = await db
      .select()
      .from(oauthClients)
      .where(eq(oauthClients.ownerId, userId));
    
    return clients;
  } catch (error) {
    console.error('Error getting OAuth clients by owner ID:', error);
    throw error;
  }
}

/**
 * Update an OAuth client
 */
export async function updateClient(clientId: string, data: any): Promise<any> {
  try {
    const [updatedClient] = await db
      .update(oauthClients)
      .set(data)
      .where(eq(oauthClients.clientId, clientId))
      .returning();
    
    return updatedClient;
  } catch (error) {
    console.error('Error updating OAuth client:', error);
    throw error;
  }
}

/**
 * Create a new OAuth client application
 */
export async function createClient(data: any): Promise<any> {
  try {
    const clientId = generateSecureToken(16);
    const clientSecret = generateSecureToken(32);
    
    const parsedData = insertOAuthClientSchema.parse({
      ...data,
      clientId,
      clientSecret,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const [client] = await db.insert(oauthClients).values(parsedData).returning();
    
    await createAuditLog({
      action: 'client_created',
      clientId: client.clientId,
      userId: client.ownerId,
      details: `OAuth client ${client.name} created`
    });
    
    return client;
  } catch (error) {
    console.error('Error creating OAuth client:', error);
    throw error;
  }
}

/**
 * Regenerate the client secret for an OAuth client
 */
export async function regenerateClientSecret(clientId: string): Promise<string> {
  try {
    const newSecret = generateSecureToken(32);
    
    await db
      .update(oauthClients)
      .set({ 
        clientSecret: newSecret,
        updatedAt: new Date()
      })
      .where(eq(oauthClients.clientId, clientId));
    
    return newSecret;
  } catch (error) {
    console.error('Error regenerating client secret:', error);
    throw error;
  }
}

/**
 * Revoke all access tokens and refresh tokens for a specific client
 */
export async function revokeAllTokensForClient(clientId: string): Promise<void> {
  try {
    // Revoke access tokens
    await db
      .update(accessTokens)
      .set({ 
        revokedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(accessTokens.clientId, clientId),
        isNull(accessTokens.revokedAt)
      ));
    
    // Find all access token IDs for this client
    const clientAccessTokens = await db
      .select()
      .from(accessTokens)
      .where(eq(accessTokens.clientId, clientId));
    
    const accessTokenIds = clientAccessTokens.map(token => token.id);
    
    // Revoke refresh tokens
    if (accessTokenIds.length > 0) {
      for (const accessTokenId of accessTokenIds) {
        await db
          .update(refreshTokens)
          .set({ 
            revokedAt: new Date(),
            updatedAt: new Date()
          })
          .where(and(
            eq(refreshTokens.accessTokenId, accessTokenId),
            isNull(refreshTokens.revokedAt)
          ));
      }
    }
    
    // Revoke authorization codes
    await db
      .update(authorizationCodes)
      .set({ 
        revokedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(authorizationCodes.clientId, clientId),
        isNull(authorizationCodes.revokedAt)
      ));
  } catch (error) {
    console.error('Error revoking all tokens for client:', error);
    throw error;
  }
}

/**
 * Get all OAuth clients (admin function)
 */
export async function getAllClients(): Promise<any[]> {
  try {
    const clients = await db
      .select()
      .from(oauthClients)
      .orderBy(oauthClients.createdAt);
    
    return clients;
  } catch (error) {
    console.error('Error getting all OAuth clients:', error);
    throw error;
  }
}

/**
 * Check if a user has already authorized a client
 */
export async function hasUserAuthorizedClient(userId: number, clientId: string, requestedScopes: string[]): Promise<boolean> {
  try {
    const [authorization] = await db
      .select()
      .from(userAuthorizations)
      .where(and(
        eq(userAuthorizations.userId, userId),
        eq(userAuthorizations.clientId, clientId)
      ));
    
    if (!authorization) {
      return false;
    }
    
    // Check if all requested scopes are already authorized
    return requestedScopes.every(scope => authorization.scopes.includes(scope));
  } catch (error) {
    console.error('Error checking user authorization:', error);
    throw error;
  }
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: {
  action: string;
  clientId?: string;
  userId?: number;
  ipAddress?: string;
  details?: string;
}): Promise<void> {
  try {
    const logData: InsertOAuthAuditLog = {
      action: data.action,
      clientId: data.clientId,
      userId: data.userId,
      ipAddress: data.ipAddress,
      details: data.details
    };
    
    await db.insert(oauthAuditLogs).values(logData);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error for audit logs to avoid disrupting the main flow
  }
}

/**
 * Extract IP address from request
 */
export function getIpFromRequest(req: Request): string {
  return (req.headers['x-forwarded-for'] as string) || 
         req.socket.remoteAddress || 
         'unknown';
}

/**
 * Get user information based on requested scopes
 */
export async function getUserInfoByScopes(userId: number, scopes: string[]) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return null;
    }
    
    // Build response based on authorized scopes
    const userInfo: any = {};
    
    if (scopes.includes(OAUTH_SCOPES.USER_BASIC)) {
      userInfo.id = user.id;
      userInfo.username = user.username;
      userInfo.email = user.email;
      userInfo.name = user.displayName || user.username;
      // Use avatarUrl which is what the frontend references
      userInfo.profileImage = user.avatarUrl || null;
    }
    
    if (scopes.includes(OAUTH_SCOPES.USER_ROLES) || 
        scopes.includes(OAUTH_SCOPES.USER_VERIFIED_ROLES)) {
      // TODO: Add code to fetch roles from user_roles table
      // For now, using placeholder data
      userInfo.roles = ['PLAYER']; // This should be replaced with actual role data
      
      // If verified roles are requested, filter to only verified roles
      if (scopes.includes(OAUTH_SCOPES.USER_VERIFIED_ROLES)) {
        // TODO: Add logic to filter to only verified roles
      }
    }
    
    if (scopes.includes(OAUTH_SCOPES.USER_RATINGS)) {
      // TODO: Add code to fetch ratings from ratings table
      // For now, using placeholder data
      userInfo.ratings = {
        courtiq: 3500,
        dupr: 4.0
      };
    }
    
    return userInfo;
  } catch (error) {
    console.error('Error getting user info by scopes:', error);
    throw error;
  }
}

/**
 * Verify if an application is authorized to access specific scopes for a user
 */
export async function verifyClientAccess(clientId: string, userId: number, requiredScopes: string[]): Promise<boolean> {
  try {
    const [authorization] = await db
      .select()
      .from(userAuthorizations)
      .where(and(
        eq(userAuthorizations.clientId, clientId),
        eq(userAuthorizations.userId, userId)
      ));
    
    if (!authorization) {
      return false;
    }
    
    // Check if all required scopes are authorized
    return requiredScopes.every(scope => authorization.scopes.includes(scope));
  } catch (error) {
    console.error('Error verifying client access:', error);
    throw error;
  }
}