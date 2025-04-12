/**
 * PKL-278651-TOURN-0003-SEARCH
 * User Search Routes for Tournament Team Creation
 * 
 * This file contains the routes for searching users to create tournament teams.
 * Framework 5.0: Each route includes comprehensive debug logging and error handling.
 */

import express, { Request, Response } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { sql, like } from 'drizzle-orm';
import { users } from '@shared/schema';

export function registerUserSearchRoutes(app: express.Express): void {
  console.log('[API][UserSearch] Registering user search routes');
  
  /**
   * Search users endpoint
   * 
   * @query q - Search query string (required)
   * @query limit - Maximum number of results to return (default: 10)
   * 
   * @returns Array of user objects with basic profile information
   */
  app.get('/api/users/search', isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log(`[API][UserSearch] Received search request with query: "${req.query.q}"`);
      
      if (!req.user) {
        console.error('[API][UserSearch] Unauthorized access attempt');
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const searchQuery = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!searchQuery || searchQuery.length < 2) {
        console.error('[API][UserSearch] Invalid or too short search query');
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }
      
      console.log(`[API][UserSearch] Searching for users matching: "${searchQuery}" with limit: ${limit}`);
      
      // Search users by username, displayName, firstName, or lastName
      const searchPattern = `%${searchQuery}%`;
      const matchingUsers = await storage.searchUsers(searchPattern, limit);
      
      console.log(`[API][UserSearch] Found ${matchingUsers.length} matching users`);
      
      // Map to safe user objects without sensitive info
      const safeUsers = matchingUsers.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatarUrl: user.avatarUrl,
        avatarInitials: user.avatarInitials || user.displayName?.charAt(0) || user.username?.charAt(0) || '?',
        rating: user.rating || null,
      }));
      
      return res.json(safeUsers);
    } catch (error) {
      console.error('[API][UserSearch] Error searching for users:', error);
      
      // Framework 5.0: Enhanced error handling with error types
      if (error instanceof Error) {
        return res.status(500).json({ 
          error: 'Server error searching for users',
          message: error.message,
          type: error.name
        });
      }
      
      return res.status(500).json({ error: 'Server error searching for users' });
    }
  });
}