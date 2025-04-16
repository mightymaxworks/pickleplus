/**
 * PKL-278651-API-0001-GATEWAY
 * API Rate Limiting Middleware
 * 
 * This middleware enforces rate limits for API requests based on developer tier and endpoint.
 */

import { Request, Response, NextFunction } from 'express';
import { eq, and, or, isNull } from 'drizzle-orm';
import NodeCache from 'node-cache';
import { db } from '../../../db';
import { apiRateLimits, apiDeveloperAccounts } from '../../../../shared/schema/api-gateway';

// Cache rate limit configurations to reduce database queries
const rateLimitCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Cache to track API request counts
const requestCountCache = new NodeCache({ stdTTL: 60 }); // Default TTL of 60 seconds

// Interface for rate limiting options
export interface RateLimitOptions {
  defaultLimit?: number;
  defaultTimeWindow?: number; // in seconds
  excludePaths?: string[];
}

/**
 * Get rate limit configuration for a developer tier and endpoint
 */
const getRateLimit = async (developerTier: string, endpoint: string) => {
  const cacheKey = `${developerTier}:${endpoint}`;
  
  // Check cache first
  let rateLimit = rateLimitCache.get(cacheKey);
  if (rateLimit) {
    return rateLimit as { requestLimit: number; timeWindow: number; concurrentLimit?: number };
  }
  
  // Query database for specific endpoint limit
  const endpointLimit = await db.select()
    .from(apiRateLimits)
    .where(
      and(
        eq(apiRateLimits.developerTier, developerTier),
        eq(apiRateLimits.endpoint, endpoint)
      )
    )
    .limit(1);
  
  if (endpointLimit.length > 0) {
    const result = {
      requestLimit: endpointLimit[0].requestLimit,
      timeWindow: endpointLimit[0].timeWindow,
      concurrentLimit: endpointLimit[0].concurrentLimit
    };
    rateLimitCache.set(cacheKey, result);
    return result;
  }
  
  // No specific endpoint limit, query for global tier limit
  const globalLimit = await db.select()
    .from(apiRateLimits)
    .where(
      and(
        eq(apiRateLimits.developerTier, developerTier),
        isNull(apiRateLimits.endpoint)
      )
    )
    .limit(1);
  
  if (globalLimit.length > 0) {
    const result = {
      requestLimit: globalLimit[0].requestLimit,
      timeWindow: globalLimit[0].timeWindow,
      concurrentLimit: globalLimit[0].concurrentLimit
    };
    rateLimitCache.set(cacheKey, result);
    return result;
  }
  
  // Default fallback limit
  const defaultLimit = {
    requestLimit: 100,
    timeWindow: 60,
    concurrentLimit: 5
  };
  rateLimitCache.set(cacheKey, defaultLimit);
  return defaultLimit;
};

/**
 * Get developer tier for API key
 */
const getDeveloperTier = async (developerId: number): Promise<string> => {
  const cacheKey = `developer_tier:${developerId}`;
  
  // Check cache first
  const cachedTier = rateLimitCache.get(cacheKey);
  if (cachedTier) {
    return cachedTier as string;
  }
  
  // Query database
  const developer = await db.select({ tier: apiDeveloperAccounts.developerTier })
    .from(apiDeveloperAccounts)
    .where(eq(apiDeveloperAccounts.id, developerId))
    .limit(1);
  
  if (developer.length > 0) {
    rateLimitCache.set(cacheKey, developer[0].tier);
    return developer[0].tier;
  }
  
  // Default tier
  return 'free';
};

/**
 * API rate limiting middleware
 */
export const apiRateLimiter = (options: RateLimitOptions = {}) => {
  const defaultLimit = options.defaultLimit || 100;
  const defaultTimeWindow = options.defaultTimeWindow || 60;
  const excludePaths = options.excludePaths || [];
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip rate limiting for excluded paths
      if (excludePaths.some(path => req.path.startsWith(path))) {
        return next();
      }
      
      // Require API key authentication
      if (!req.apiKey) {
        return res.status(401).json({
          error: 'unauthorized',
          error_description: 'API key authentication required for rate limiting'
        });
      }
      
      const { developerId } = req.apiKey;
      const endpoint = req.path;
      
      // Get developer tier
      const developerTier = await getDeveloperTier(developerId);
      
      // Get rate limit configuration
      const rateLimit = await getRateLimit(developerTier, endpoint);
      const { requestLimit, timeWindow, concurrentLimit } = rateLimit;
      
      // Create unique key for this developer and endpoint
      const rateLimitKey = `${developerId}:${endpoint}`;
      
      // Get current request count
      let currentCount = requestCountCache.get(rateLimitKey) as number || 0;
      
      // Check rate limit
      if (currentCount >= requestLimit) {
        return res.status(429).json({
          error: 'rate_limit_exceeded',
          error_description: 'API rate limit exceeded',
          limit: requestLimit,
          time_window_seconds: timeWindow,
          retry_after: Math.ceil(timeWindow - (requestCountCache.getTtl(rateLimitKey) || 0) / 1000)
        });
      }
      
      // Increment request count
      currentCount++;
      requestCountCache.set(rateLimitKey, currentCount, timeWindow);
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', requestLimit.toString());
      res.setHeader('X-RateLimit-Remaining', (requestLimit - currentCount).toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil((requestCountCache.getTtl(rateLimitKey) || 0) / 1000).toString());
      
      next();
    } catch (error) {
      console.error('API rate limiting error:', error);
      next(); // Continue in case of error to avoid breaking the API
    }
  };
};