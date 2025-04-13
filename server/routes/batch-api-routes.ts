/**
 * PKL-278651-PERF-0001.4-API
 * Batch API Routes
 * 
 * This file defines the batch API endpoints for consolidating multiple API requests
 * into a single request, reducing network overhead and improving performance.
 */

import express, { Request, Response } from 'express';
import { isAuthenticated } from '../auth';
import { db } from '../db';
import { storage } from '../storage';
import { executeStoredProcedure, batchFetchByIds, cachedQuery } from '../storage/postgres-utils';

// Create a router for batch API routes
const router = express.Router();

/**
 * Batch API endpoint
 * 
 * Allows the client to make multiple API requests in a single HTTP request
 * Each request in the batch is processed independently and the results are returned
 * in the same order they were requested.
 * 
 * Request body format:
 * {
 *   requests: [
 *     { url: '/api/match/recent', method: 'GET', params: { limit: 5 } },
 *     { url: '/api/profile/completion', method: 'GET' }
 *   ]
 * }
 */
router.post('/batch', isAuthenticated, async (req: Request, res: Response) => {
  try {
    console.log('[Batch API] Processing batch request');
    
    if (!req.body.requests || !Array.isArray(req.body.requests)) {
      return res.status(400).json({ error: "Invalid batch request format" });
    }
    
    // Process each request in the batch
    const results = await Promise.all(
      req.body.requests.map(async (request: any, index: number) => {
        try {
          const { url, method = 'GET', params = {} } = request;
          
          if (!url) {
            throw new Error(`Request at index ${index} missing required 'url' field`);
          }
          
          console.log(`[Batch API] Processing request ${index + 1}/${req.body.requests.length}: ${method} ${url}`);
          
          // Process the request based on the URL and method
          const result = await processApiRequest(url, method, params, req.user?.id);
          
          return {
            status: 'success',
            data: result,
            originalRequest: request
          };
        } catch (error) {
          console.error(`[Batch API] Error processing request at index ${index}:`, error);
          
          return {
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            originalRequest: request
          };
        }
      })
    );
    
    res.json({ results });
  } catch (error) {
    console.error('[Batch API] Error processing batch request:', error);
    res.status(500).json({ error: 'Failed to process batch request' });
  }
});

/**
 * Process an individual API request within a batch
 */
async function processApiRequest(url: string, method: string, params: any, userId?: number): Promise<any> {
  // Extract the API endpoint path
  const apiPath = url.replace(/^\/api\//, '');
  
  // Process the request based on the API path
  switch (apiPath) {
    case 'me':
      return userId ? await storage.getUser(userId) : null;
      
    case 'profile/completion': {
      if (!userId) return null;
      
      const user = await storage.getUser(userId);
      if (!user) return null;
      
      // Fields to check for completion
      const fieldsToCheck = [
        'firstName', 'lastName', 'email', 'birthYear', 'country', 
        'state', 'city', 'avatarUrl', 'bio', 'experience'
      ];
      
      const completedFields: string[] = [];
      const totalFields = fieldsToCheck.length;
      
      fieldsToCheck.forEach(field => {
        if (user[field as keyof typeof user]) {
          completedFields.push(field);
        }
      });
      
      const completionPercentage = Math.round((completedFields.length / totalFields) * 100);
      
      return { 
        completion: completionPercentage,
        completedFields,
        pendingFields: fieldsToCheck.filter(field => !completedFields.includes(field))
      };
    }
    
    case 'match/recent': {
      const targetUserId = params.userId ? parseInt(params.userId, 10) : userId;
      const limit = params.limit ? parseInt(params.limit, 10) : 10;
      
      if (!targetUserId) return [];
      
      return storage.getRecentMatches(targetUserId, limit);
    }
    
    case 'multi-rankings/leaderboard': {
      const type = params.type || 'general';
      const timeframe = params.timeframe || 'all';
      const limit = params.limit ? parseInt(params.limit, 10) : 10;
      
      return cachedQuery(
        `leaderboard:${type}:${timeframe}:${limit}`,
        async () => await storage.getLeaderboard(type, timeframe, limit),
        5 * 60 * 1000 // Cache for 5 minutes
      );
    }
    
    case 'match/user-stats': {
      const targetUserId = params.userId ? parseInt(params.userId, 10) : userId;
      
      if (!targetUserId) return null;
      
      const cacheKey = `user-stats:${targetUserId}`;
      
      return cachedQuery(
        cacheKey,
        async () => await storage.getUserMatchStats(targetUserId),
        10 * 60 * 1000 // Cache for 10 minutes
      );
    }
    
    case 'users/batch': {
      if (!params.ids || !Array.isArray(params.ids) || params.ids.length === 0) {
        return [];
      }
      
      const userIds = params.ids.map((id: string) => parseInt(id, 10)).filter(Boolean);
      
      if (userIds.length === 0) return [];
      
      const users = await batchFetchByIds(
        'users',
        userIds,
        'id'
      );
      
      // Remove sensitive information
      return Array.from(users.values()).map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
    }
    
    default:
      throw new Error(`Unsupported API endpoint: ${apiPath}`);
  }
}

export default router;