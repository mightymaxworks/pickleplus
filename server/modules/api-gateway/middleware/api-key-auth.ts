/**
 * PKL-278651-API-0001-GATEWAY
 * API Key Authentication Middleware
 * 
 * This middleware authenticates API requests using API keys and enforces proper authorization.
 */

import { Request, Response, NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../../../db';
import { apiKeys, apiApplications, apiDeveloperAccounts } from '../../../../shared/schema/api-gateway';
import { logApiUsage } from '../utils/usage-tracking';

// Define middleware interface
export interface ApiKeyAuthOptions {
  requiredScopes?: string[];
  allowExpiredKeys?: boolean;
}

/**
 * Extract API key from various locations in the request
 */
const extractApiKey = (req: Request): string | null => {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check custom X-API-Key header
  const apiKeyHeader = req.headers['x-api-key'];
  if (apiKeyHeader) {
    return Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
  }
  
  // Check query parameter
  if (req.query.api_key) {
    return req.query.api_key as string;
  }
  
  return null;
};

/**
 * Validate the API key against stored keys
 */
const validateApiKey = async (keyValue: string): Promise<{
  isValid: boolean;
  keyId?: number;
  applicationId?: number;
  developerId?: number;
  scopes?: string[];
}> => {
  // Extract key prefix (first 8 characters)
  const keyPrefix = keyValue.substring(0, 8);
  
  // Find keys with matching prefix
  const potentialKeys = await db.select()
    .from(apiKeys)
    .where(eq(apiKeys.keyPrefix, keyPrefix))
    .innerJoin(apiApplications, eq(apiKeys.applicationId, apiApplications.id))
    .innerJoin(apiDeveloperAccounts, eq(apiApplications.developerId, apiDeveloperAccounts.id));
  
  // No matching keys found
  if (potentialKeys.length === 0) {
    return { isValid: false };
  }
  
  // Check each potential key
  for (const keyRecord of potentialKeys) {
    // Only check active keys from approved developers
    if (!keyRecord.api_keys.isActive || !keyRecord.api_developer_accounts.isApproved) {
      continue;
    }
    
    // Check if key is expired
    if (keyRecord.api_keys.expiresAt && new Date() > keyRecord.api_keys.expiresAt) {
      continue;
    }
    
    // Verify key hash
    const isMatch = await bcrypt.compare(keyValue, keyRecord.api_keys.keyHash);
    if (isMatch) {
      return {
        isValid: true,
        keyId: keyRecord.api_keys.id,
        applicationId: keyRecord.api_keys.applicationId,
        developerId: keyRecord.api_developer_accounts.id,
        scopes: keyRecord.api_keys.scopes.split(',')
      };
    }
  }
  
  return { isValid: false };
};

/**
 * Check if the API key has all required scopes
 */
const hasRequiredScopes = (keyScopes: string[], requiredScopes: string[]): boolean => {
  if (!requiredScopes || requiredScopes.length === 0) {
    return true;
  }
  
  return requiredScopes.every(scope => keyScopes.includes(scope));
};

/**
 * API Key authentication middleware
 */
export const apiKeyAuth = (options: ApiKeyAuthOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract API key
      const apiKey = extractApiKey(req);
      if (!apiKey) {
        return res.status(401).json({
          error: 'access_denied',
          error_description: 'API key is required'
        });
      }
      
      // Validate API key
      const validation = await validateApiKey(apiKey);
      if (!validation.isValid) {
        return res.status(401).json({
          error: 'invalid_key',
          error_description: 'API key is invalid or expired'
        });
      }
      
      // Check scopes
      if (options.requiredScopes && validation.scopes) {
        if (!hasRequiredScopes(validation.scopes, options.requiredScopes)) {
          return res.status(403).json({
            error: 'insufficient_scope',
            error_description: 'API key does not have the required scopes',
            required_scopes: options.requiredScopes
          });
        }
      }
      
      // Add API information to request for downstream use
      req.apiKey = {
        id: validation.keyId!,
        applicationId: validation.applicationId!,
        developerId: validation.developerId!,
        scopes: validation.scopes || []
      };
      
      // Update last used timestamp
      if (validation.keyId) {
        db.update(apiKeys)
          .set({ lastUsed: new Date() })
          .where(eq(apiKeys.id, validation.keyId))
          .execute()
          .catch(err => console.error('Failed to update API key last used timestamp:', err));
      }
      
      // Log API usage (async, don't wait for completion)
      logApiUsage(req, res, validation.keyId)
        .catch(err => console.error('Failed to log API usage:', err));
      
      next();
    } catch (error) {
      console.error('API key authentication error:', error);
      res.status(500).json({
        error: 'server_error',
        error_description: 'An error occurred during API key authentication'
      });
    }
  };
};

// Extend Express Request interface to include API key information
declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: number;
        applicationId: number;
        developerId: number;
        scopes: string[];
      };
    }
  }
}