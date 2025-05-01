/**
 * PKL-278651-OAUTH-001 - OAuth Service
 * 
 * Core service layer for OAuth server functionality.
 * This contains the business logic for handling OAuth flows.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-30
 */

import { db } from '../../db';
import { eq, and, isNull } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  accessTokens, 
  refreshTokens, 
  oauthClients, 
  userAuthorizations, 
  authorizationCodes,
  OAuthClient,
  AccessToken,
  RefreshToken,
  AuthorizationCode,
  UserAuthorization,
  AVAILABLE_SCOPES
} from '../../../shared/schema/oauth';
import { users } from '../../../shared/schema';

// Default token expiration times (in seconds)
const ACCESS_TOKEN_EXPIRATION = 60 * 60; // 1 hour
const REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * 60; // 30 days
const AUTHORIZATION_CODE_EXPIRATION = 10 * 60; // 10 minutes

/**
 * Validates that the requested scopes are valid and allowed
 */
function validateScopes(requestedScopes: string[], allowedScopes: string[]): string[] {
  // Filter out any scopes that are invalid or not allowed
  const validScopes = requestedScopes.filter(scope => 
    AVAILABLE_SCOPES[scope] && allowedScopes.includes(scope)
  );
  
  // Return at least the basic profile scope if nothing valid was requested
  return validScopes.length > 0 ? validScopes : ['profile'];
}

/**
 * Creates a secure random string
 */
function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generates a new client secret
 */
function generateClientSecret(): string {
  const secret = generateSecureToken(32);
  // Hash client secret to prevent using it directly
  return bcrypt.hashSync(secret, 10);
  // Note: The original unhashed secret will be returned to the developer once
}

/**
 * Verifies a code challenge (for PKCE)
 */
function verifyCodeChallenge(codeVerifier: string, challenge: string, method: string): boolean {
  if (method === 'S256') {
    const hash = createHash('sha256').update(codeVerifier).digest('base64url');
    return hash === challenge;
  }
  
  // Plain method
  return codeVerifier === challenge;
}

/**
 * Service for managing OAuth clients (applications)
 */
export class OAuthClientService {
  /**
   * Creates a new OAuth client registration
   */
  async createClient(data: any, developerId: number): Promise<{ client: OAuthClient, clientSecret: string }> {
    // Generate client secret (unhashed version to return to developer)
    const rawClientSecret = generateSecureToken(32);
    // Hash the client secret for storage
    const hashedSecret = bcrypt.hashSync(rawClientSecret, 10);
    
    // Insert the new client
    const [client] = await db.insert(oauthClients).values({
      ...data,
      clientSecret: hashedSecret,
      developerId,
      status: 'pending', // Start as pending until approved by admin
    }).returning();
    
    // Return both client data and raw (unhashed) client secret
    return { 
      client,
      clientSecret: rawClientSecret
    };
  }
  
  /**
   * Gets a client by ID
   */
  async getClientById(clientId: string): Promise<OAuthClient | undefined> {
    const [client] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId));
    return client;
  }
  
  /**
   * Verifies that a client secret is valid
   */
  async verifyClientSecret(clientId: string, secret: string): Promise<boolean> {
    const client = await this.getClientById(clientId);
    if (!client) return false;
    
    // Use bcrypt to compare the provided secret with the stored hash
    return bcrypt.compareSync(secret, client.clientSecret);
  }
  
  /**
   * Updates a client's status (approve/reject)
   */
  async updateClientStatus(clientId: string, status: 'approved' | 'rejected' | 'revoked', adminId: number): Promise<OAuthClient> {
    const [updated] = await db.update(oauthClients)
      .set({ 
        status, 
        verifiedAt: new Date(),
        verifiedBy: adminId
      })
      .where(eq(oauthClients.clientId, clientId))
      .returning();
    
    return updated;
  }
  
  /**
   * Lists all clients for a developer
   */
  async getClientsByDeveloper(developerId: number): Promise<OAuthClient[]> {
    return db.select().from(oauthClients).where(eq(oauthClients.developerId, developerId));
  }
  
  /**
   * Lists all pending client registrations (for admin review)
   */
  async getPendingClients(): Promise<OAuthClient[]> {
    return db.select().from(oauthClients).where(eq(oauthClients.status, 'pending'));
  }
}

/**
 * Service for managing authorization codes
 */
export class AuthorizationCodeService {
  /**
   * Creates a new authorization code
   */
  async createAuthorizationCode(
    userId: number, 
    clientId: string,
    redirectUri: string,
    scopes: string[],
    codeChallenge?: string,
    codeChallengeMethod?: string,
    nonce?: string
  ): Promise<AuthorizationCode> {
    const code = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + AUTHORIZATION_CODE_EXPIRATION * 1000);
    
    const [authCode] = await db.insert(authorizationCodes).values({
      code,
      userId,
      clientId,
      redirectUri,
      scopes,
      expiresAt,
      codeChallenge,
      codeChallengeMethod,
      nonce,
      used: false
    }).returning();
    
    return authCode;
  }
  
  /**
   * Validates and consumes an authorization code
   */
  async validateAuthorizationCode(
    code: string,
    clientId: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<AuthorizationCode | null> {
    // Find the authorization code
    const [authCode] = await db.select().from(authorizationCodes).where(
      and(
        eq(authorizationCodes.code, code),
        eq(authorizationCodes.clientId, clientId),
        eq(authorizationCodes.used, false)
      )
    );
    
    if (!authCode) return null;
    
    // Check if code has expired
    if (new Date() > authCode.expiresAt) return null;
    
    // Verify the redirect URI
    if (authCode.redirectUri !== redirectUri) return null;
    
    // Verify PKCE code challenge if present
    if (authCode.codeChallenge && codeVerifier) {
      if (!verifyCodeChallenge(
        codeVerifier, 
        authCode.codeChallenge, 
        authCode.codeChallengeMethod || 'plain'
      )) {
        return null;
      }
    } else if (authCode.codeChallenge && !codeVerifier) {
      // Code challenge was provided during authorization but no verifier during token request
      return null;
    }
    
    // Mark code as used to prevent replay attacks
    await db.update(authorizationCodes)
      .set({ used: true })
      .where(eq(authorizationCodes.id, authCode.id));
    
    return authCode;
  }
}

/**
 * Service for managing tokens
 */
export class TokenService {
  private readonly jwtSecret: string;
  
  constructor() {
    // In production, use environment variable for JWT secret
    this.jwtSecret = process.env.JWT_SECRET || 'pickle-plus-oauth-jwt-secret';
  }
  
  /**
   * Creates a new access token and refresh token pair
   */
  async createTokens(
    userId: number,
    clientId: string,
    scopes: string[],
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: AccessToken, refreshToken: RefreshToken }> {
    // Create expiration dates
    const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRATION * 1000);
    const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION * 1000);
    
    // Generate access token as JWT
    const tokenPayload = {
      sub: userId.toString(),
      client_id: clientId,
      scopes: scopes,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(accessTokenExpiresAt.getTime() / 1000),
      jti: generateSecureToken(16)
    };
    
    const jwtToken = jwt.sign(tokenPayload, this.jwtSecret);
    
    // Store token in database
    const [accessToken] = await db.insert(accessTokens).values({
      token: jwtToken,
      userId,
      clientId,
      scopes,
      expiresAt: accessTokenExpiresAt,
      ipAddress,
      userAgent
    }).returning();
    
    // Create refresh token
    const refreshTokenValue = generateSecureToken(48);
    const [refreshToken] = await db.insert(refreshTokens).values({
      token: refreshTokenValue,
      accessTokenId: accessToken.id,
      expiresAt: refreshTokenExpiresAt
    }).returning();
    
    return { accessToken, refreshToken };
  }
  
  /**
   * Validates an access token
   */
  async validateToken(token: string): Promise<{
    valid: boolean,
    userId?: number,
    clientId?: string,
    scopes?: string[]
  }> {
    try {
      // First verify JWT signature and expiration
      const decoded = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
      
      // Then check if token exists and hasn't been revoked
      const [tokenRecord] = await db.select().from(accessTokens).where(
        and(
          eq(accessTokens.token, token),
          isNull(accessTokens.revokedAt)
        )
      );
      
      if (!tokenRecord) {
        return { valid: false };
      }
      
      return {
        valid: true,
        userId: tokenRecord.userId,
        clientId: tokenRecord.clientId,
        scopes: tokenRecord.scopes
      };
    } catch (error) {
      // JWT validation failed (expired, invalid signature, etc.)
      return { valid: false };
    }
  }
  
  /**
   * Refreshes an access token using a refresh token
   */
  async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: AccessToken, refreshToken: RefreshToken } | null> {
    // Find the refresh token and ensure it's not expired or revoked
    const [refreshTokenRecord] = await db.select().from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, refreshToken),
          isNull(refreshTokens.revokedAt)
        )
      );
    
    if (!refreshTokenRecord || new Date() > refreshTokenRecord.expiresAt) {
      return null;
    }
    
    // Get the associated access token to retrieve userId and scopes
    const [oldAccessToken] = await db.select().from(accessTokens)
      .where(eq(accessTokens.id, refreshTokenRecord.accessTokenId));
    
    if (!oldAccessToken || oldAccessToken.clientId !== clientId) {
      return null;
    }
    
    // Create new tokens
    const tokens = await this.createTokens(
      oldAccessToken.userId,
      clientId,
      oldAccessToken.scopes,
      ipAddress,
      userAgent
    );
    
    // Invalidate the old refresh token and link to the new one
    await db.update(refreshTokens)
      .set({
        revokedAt: new Date(),
        replacedByTokenId: tokens.refreshToken.id
      })
      .where(eq(refreshTokens.id, refreshTokenRecord.id));
    
    return tokens;
  }
  
  /**
   * Revokes an access token and its associated refresh token
   */
  async revokeToken(token: string): Promise<boolean> {
    // First find the access token
    const [accessToken] = await db.select().from(accessTokens)
      .where(eq(accessTokens.token, token));
    
    if (!accessToken) {
      return false;
    }
    
    // Mark the access token as revoked
    await db.update(accessTokens)
      .set({ revokedAt: new Date() })
      .where(eq(accessTokens.id, accessToken.id));
    
    // Also revoke any associated refresh tokens
    await db.update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.accessTokenId, accessToken.id),
          isNull(refreshTokens.revokedAt)
        )
      );
    
    return true;
  }
}

/**
 * Service for managing user authorizations (consents)
 */
export class AuthorizationService {
  /**
   * Records user authorization for an application
   */
  async recordAuthorization(
    userId: number,
    clientId: string,
    scopes: string[],
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserAuthorization> {
    // First check if authorization already exists
    const [existingAuth] = await db.select().from(userAuthorizations).where(
      and(
        eq(userAuthorizations.userId, userId),
        eq(userAuthorizations.clientId, clientId),
        isNull(userAuthorizations.revokedAt)
      )
    );
    
    if (existingAuth) {
      // Update existing authorization with new scopes and usage timestamp
      const [updated] = await db.update(userAuthorizations)
        .set({
          scopes: [...new Set([...existingAuth.scopes, ...scopes])], // Merge and deduplicate scopes
          lastUsedAt: new Date()
        })
        .where(eq(userAuthorizations.id, existingAuth.id))
        .returning();
        
      return updated;
    }
    
    // Create new authorization
    const [authorization] = await db.insert(userAuthorizations).values({
      userId,
      clientId,
      scopes,
      ipAddress,
      userAgent,
      lastUsedAt: new Date()
    }).returning();
    
    return authorization;
  }
  
  /**
   * Checks if user has already authorized an application with specified scopes
   */
  async checkAuthorization(
    userId: number,
    clientId: string,
    scopes: string[]
  ): Promise<{ authorized: boolean, existingScopes: string[] }> {
    const [existingAuth] = await db.select().from(userAuthorizations).where(
      and(
        eq(userAuthorizations.userId, userId),
        eq(userAuthorizations.clientId, clientId),
        isNull(userAuthorizations.revokedAt)
      )
    );
    
    if (!existingAuth) {
      return { authorized: false, existingScopes: [] };
    }
    
    // Check if all requested scopes are already authorized
    const authorized = scopes.every(scope => existingAuth.scopes.includes(scope));
    
    return {
      authorized,
      existingScopes: existingAuth.scopes
    };
  }
  
  /**
   * List all authorizations for a user
   */
  async getUserAuthorizations(userId: number): Promise<{ authorization: UserAuthorization, client: OAuthClient }[]> {
    const authorizations = await db.select({
      authorization: userAuthorizations,
      client: oauthClients
    })
    .from(userAuthorizations)
    .innerJoin(oauthClients, eq(userAuthorizations.clientId, oauthClients.clientId))
    .where(
      and(
        eq(userAuthorizations.userId, userId),
        isNull(userAuthorizations.revokedAt)
      )
    );
    
    return authorizations;
  }
  
  /**
   * Revoke an authorization
   */
  async revokeAuthorization(id: number, reason?: string): Promise<boolean> {
    await db.update(userAuthorizations)
      .set({
        revokedAt: new Date(),
        revokedReason: reason
      })
      .where(eq(userAuthorizations.id, id));
      
    return true;
  }
}

// Export singleton instances
export const oauthClientService = new OAuthClientService();
export const authorizationCodeService = new AuthorizationCodeService();
export const tokenService = new TokenService();
export const authorizationService = new AuthorizationService();