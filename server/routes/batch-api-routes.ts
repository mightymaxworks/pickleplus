/**
 * PKL-278651-PERF-0001.4-API
 * Batch API Routes
 * 
 * This file implements the server-side component of the request batching system,
 * allowing multiple API requests to be handled in a single HTTP request.
 */

import { Router } from 'express';
import { z } from 'zod';
import fetch from 'node-fetch';
import { executeStoredProcedure } from '../storage/postgres-utils';

const router = Router();

// Define the schema for batch requests
const batchRequestSchema = z.object({
  requests: z.array(z.object({
    id: z.string(),
    endpoint: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    body: z.any().optional(),
  })),
});

// Create a URL for the internal API call
function createInternalApiUrl(endpoint: string): string {
  // Remove the /api prefix for internal routing
  const path = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
  return `http://localhost:${process.env.PORT || 3000}/api/${path}`;
}

// Process a single batch request
async function processBatchRequest(req: any, requestItem: z.infer<typeof batchRequestSchema>['requests'][0]) {
  try {
    const { id, endpoint, method, body } = requestItem;
    
    // Prepare options for the internal fetch request
    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Forward authentication headers
        'Cookie': req.headers.cookie,
        'Authorization': req.headers.authorization,
      },
      credentials: 'include',
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && body) {
      options.body = JSON.stringify(body);
    }
    
    // For database optimization, check if this is a common query pattern that can be 
    // handled with a stored procedure instead of multiple separate queries
    const optimizedResult = await attemptOptimizedDatabaseQuery(endpoint, method, body);
    if (optimizedResult) {
      return {
        id,
        status: 200,
        data: optimizedResult
      };
    }
    
    // Make the internal API request
    const url = createInternalApiUrl(endpoint);
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      id,
      status: response.status,
      data,
      error: response.status >= 400 ? data.message || 'Error processing request' : undefined
    };
  } catch (error) {
    console.error(`Error processing batch request ${requestItem.id}:`, error);
    return {
      id: requestItem.id,
      status: 500,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Attempt to optimize common query patterns by using stored procedures 
 * or consolidated database queries instead of multiple API calls
 */
async function attemptOptimizedDatabaseQuery(
  endpoint: string, 
  method: string, 
  body?: any
): Promise<any | null> {
  // Only optimize GET requests for now
  if (method !== 'GET') return null;
  
  // Example: Optimize multiple user profile requests
  if (endpoint.match(/^\/api\/users\/\d+$/)) {
    const userId = parseInt(endpoint.split('/').pop() || '0', 10);
    if (userId) {
      // This would be handled by a custom function that efficiently gets user data
      // return await getUserById(userId);
    }
  }
  
  // Example: Optimize multiple tournament lookups
  if (endpoint.match(/^\/api\/tournaments\/\d+$/)) {
    const tournamentId = parseInt(endpoint.split('/').pop() || '0', 10);
    if (tournamentId) {
      // This would be handled by a stored procedure
      // return await executeStoredProcedure('get_tournament_details', [tournamentId]);
    }
  }
  
  // No optimization available for this endpoint
  return null;
}

// Handle batch API requests
router.post('/batch', async (req, res) => {
  try {
    // Validate the request body
    const validationResult = batchRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid batch request format',
        errors: validationResult.error.format() 
      });
    }
    
    const { requests } = validationResult.data;
    
    // Process each request in parallel
    const results = await Promise.all(
      requests.map(requestItem => processBatchRequest(req, requestItem))
    );
    
    // Return the combined results
    return res.json(results);
  } catch (error) {
    console.error('Error processing batch request:', error);
    return res.status(500).json({ 
      message: 'Error processing batch request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;