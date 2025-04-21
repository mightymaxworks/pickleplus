/**
 * PKL-278651-SEC-0003-CSRF - CSRF Protection Middleware
 * 
 * This middleware implements CSRF protection for the application.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Token expiration time (1 hour in milliseconds)
const TOKEN_EXPIRATION = 60 * 60 * 1000;

// Map to store CSRF tokens by session ID
const tokenStore = new Map<string, { token: string; expires: number }>();

/**
 * Generate a new CSRF token for the given session
 * @param sessionId Session ID
 * @returns CSRF token
 */
export function generateCsrfToken(sessionId: string): string {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store the token with an expiration time
  tokenStore.set(sessionId, {
    token,
    expires: Date.now() + TOKEN_EXPIRATION
  });
  
  return token;
}

/**
 * Validate a CSRF token for the given session
 * @param sessionId Session ID
 * @param token CSRF token to validate
 * @returns Whether the token is valid
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  // Get the stored token for this session
  const storedToken = tokenStore.get(sessionId);
  
  // Check if the token exists and hasn't expired
  if (!storedToken || storedToken.expires < Date.now()) {
    return false;
  }
  
  // Compare the tokens
  return storedToken.token === token;
}

/**
 * Clean up expired tokens
 */
export function cleanupExpiredTokens(): void {
  const now = Date.now();
  
  for (const [sessionId, tokenData] of tokenStore.entries()) {
    if (tokenData.expires < now) {
      tokenStore.delete(sessionId);
    }
  }
}

/**
 * CSRF protection middleware
 * This middleware validates CSRF tokens for non-GET requests
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF validation for GET, HEAD, and OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF validation for API endpoints that don't require it
  // These typically include webhook endpoints and external API callbacks
  const csrfExemptPaths = [
    '/api/webhooks/',
    '/api/callbacks/',
    '/api/auth/'
  ];
  
  if (csrfExemptPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // Check if the session exists
  if (!req.session?.id) {
    return res.status(403).json({ error: 'CSRF validation failed: No session found' });
  }
  
  // Get the CSRF token from the request headers
  const token = req.headers['x-csrf-token'] as string;
  
  // Validate the token
  if (!token || !validateCsrfToken(req.session.id, token)) {
    return res.status(403).json({ error: 'CSRF validation failed: Invalid token' });
  }
  
  // Token is valid, proceed
  next();
}

// Set up a periodic cleanup of expired tokens
setInterval(cleanupExpiredTokens, 15 * 60 * 1000); // Every 15 minutes