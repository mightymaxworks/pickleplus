/**
 * PKL-278651-SRCH-0001-UNIFD
 * Enhanced Unified Player Search Component
 * 
 * This file contains the routes for searching users across the platform.
 * Framework 5.0: Each route includes comprehensive debug logging and error handling.
 */

import express, { Request, Response } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { sql, like, or, and } from 'drizzle-orm';
import { users } from '@shared/schema';
import { db } from '../db';

export function registerUserSearchRoutes(app: express.Express): void {
  console.log('[API][UserSearch] Registering user search routes');
  
  // PKL-278651-SRCH-0001-UNIFD - Enhanced Unified Player Search Component
  // This endpoint deliberately does not use the isAuthenticated middleware
  // to allow for broader usage across modules, especially in public tournament displays
  app.get("/api/player/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      console.log(`[PlayerSearch] Searching for players with query: "${query}"`);
      
      // Import passport utilities
      const { normalizePassportId } = await import("@shared/utils/passport-utils");
      
      // Improve search to include more fields and handle spaces better
      const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      
      // Normalized search for passport IDs
      const normalizedQuery = normalizePassportId(query);
      
      const searchConditions = searchTerms.map(term => 
        or(
          sql`lower(${users.username}) like ${`%${term}%`}`,
          sql`lower(${users.displayName}) like ${`%${term}%`}`,
          sql`lower(${users.firstName}) like ${`%${term}%`}`,
          sql`lower(${users.lastName}) like ${`%${term}%`}`,
          // Flexible passport ID search using normalized form
          sql`${users.passportId} like ${`%${normalizedQuery}%`}`
        )
      );
      
      // If multiple terms, try to match them all
      let whereClause;
      if (searchConditions.length > 1) {
        // Multiple terms - each term should match at least one field
        whereClause = and(...searchConditions);
      } else if (searchConditions.length === 1) {
        // Single term - direct match
        whereClause = searchConditions[0];
      }
      
      const players = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
        avatarInitials: users.avatarInitials,
        isFoundingMember: users.isFoundingMember,
        passportId: users.passportId
      })
      .from(users)
      .where(whereClause)
      .limit(15);
      
      console.log(`[PlayerSearch] Found ${players.length} matching players`);
      
      // Format the player data and include more information
      const formattedPlayers = players.map(player => ({
        id: player.id,
        username: player.username,
        displayName: player.displayName || player.username,
        fullName: player.firstName && player.lastName 
          ? `${player.firstName} ${player.lastName}`
          : null,
        avatarUrl: player.avatarUrl,
        avatarInitials: player.avatarInitials,
        isFoundingMember: player.isFoundingMember,
        passportId: player.passportId,
        rating: player.rating || null
      }));
      
      res.json(formattedPlayers);
      
    } catch (error) {
      console.error("[PlayerSearch] Error searching players:", error);
      res.status(500).json({ error: "Server error searching players" });
    }
  });
  
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