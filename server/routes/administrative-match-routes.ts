/**
 * Administrative Match Creation Routes
 * 
 * Provides endpoints for league officials, tournament directors, and referees
 * to create and manage matches with full administrative controls.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-06-03
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { AdministrativeMatchService } from '../services/administrative-match-service';
import type { AdminMatchRequest } from '../services/administrative-match-service';

// Validation schemas
const AdminMatchSchema = z.object({
  // Participants
  playerOneId: z.number().positive(),
  playerTwoId: z.number().positive(),
  playerOnePartnerId: z.number().positive().optional(),
  playerTwoPartnerId: z.number().positive().optional(),
  
  // Match configuration
  formatType: z.enum(['singles', 'doubles']),
  matchType: z.enum(['casual', 'league', 'tournament', 'exhibition']),
  eventTier: z.enum(['local', 'regional', 'national', 'international']),
  
  // Scheduling
  scheduledDate: z.string().datetime(),
  scheduledTime: z.string().optional(),
  estimatedDuration: z.number().min(15).max(480).optional(), // 15 minutes to 8 hours
  courtAssignment: z.string().optional(),
  venue: z.string().optional(),
  
  // Tournament context
  tournamentId: z.number().positive().optional(),
  bracketPosition: z.string().optional(),
  roundNumber: z.number().positive().optional(),
  
  // Administrative settings
  isOfficial: z.boolean().default(true),
  requiresValidation: z.boolean().default(false),
  allowSelfReporting: z.boolean().default(true),
  pointsMultiplier: z.number().min(0.1).max(5.0).optional(),
  
  // Additional details
  notes: z.string().max(500).optional(),
  specialRules: z.string().max(1000).optional(),
  prizeInfo: z.string().max(500).optional()
});

const BulkMatchSchema = z.object({
  matches: z.array(AdminMatchSchema).min(1).max(50), // Max 50 matches at once
  bulkSettings: z.object({
    defaultVenue: z.string().optional(),
    defaultDuration: z.number().optional(),
    startTime: z.string().optional(),
    intervalMinutes: z.number().min(15).max(120).optional()
  }).optional()
});

// Role validation middleware
export function validateAdminRole(req: Request, res: Response, next: Function) {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const allowedRoles = [
    'admin',
    'league_official', 
    'tournament_director',
    'referee'
  ];
  
  // Check if user has any administrative role
  const hasAdminRole = user.isAdmin || 
    allowedRoles.some(role => (user as any)[role] === true);
  
  if (!hasAdminRole) {
    return res.status(403).json({ 
      error: 'Administrative privileges required',
      requiredRoles: allowedRoles
    });
  }
  
  next();
}

/**
 * Create single administrative match
 * POST /api/admin/matches
 */
export async function createAdministrativeMatch(req: Request, res: Response) {
  try {
    // Validate request body
    const validation = AdminMatchSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid match data',
        details: validation.error.format()
      });
    }
    
    const matchData = validation.data;
    
    // Determine creator role
    const creatorRole = req.user?.isAdmin ? 'admin' :
      (req.user as any).tournament_director ? 'tournament_director' :
      (req.user as any).league_official ? 'league_official' :
      (req.user as any).referee ? 'referee' : 'admin';
    
    // Build administrative match request
    const adminRequest: AdminMatchRequest = {
      createdById: req.user!.id,
      creatorRole: creatorRole as any,
      
      // Convert scheduled date string to Date object
      scheduledDate: new Date(matchData.scheduledDate),
      
      ...matchData
    };
    
    // Create the match
    const result = await AdministrativeMatchService.createAdministrativeMatch(adminRequest);
    
    console.log(`[ADMIN-MATCH] Match ${result.matchId} created by ${creatorRole} ${req.user!.id}`);
    
    res.status(201).json({
      success: true,
      match: result,
      message: 'Administrative match created successfully'
    });
    
  } catch (error) {
    console.error('[ADMIN-MATCH] Error creating administrative match:', error);
    res.status(500).json({
      error: 'Failed to create administrative match',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Create multiple matches (bulk creation)
 * POST /api/admin/matches/bulk
 */
export async function createBulkMatches(req: Request, res: Response) {
  try {
    const validation = BulkMatchSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid bulk match data',
        details: validation.error.format()
      });
    }
    
    const { matches, bulkSettings } = validation.data;
    const results = [];
    const errors = [];
    
    // Process each match
    for (let i = 0; i < matches.length; i++) {
      try {
        const matchData = matches[i];
        
        // Apply bulk settings if provided
        if (bulkSettings) {
          if (bulkSettings.defaultVenue && !matchData.venue) {
            matchData.venue = bulkSettings.defaultVenue;
          }
          if (bulkSettings.defaultDuration && !matchData.estimatedDuration) {
            matchData.estimatedDuration = bulkSettings.defaultDuration;
          }
          
          // Stagger match times if interval specified
          if (bulkSettings.intervalMinutes && bulkSettings.startTime) {
            const baseTime = new Date(matchData.scheduledDate);
            baseTime.setMinutes(baseTime.getMinutes() + (i * bulkSettings.intervalMinutes));
            matchData.scheduledDate = baseTime.toISOString();
          }
        }
        
        // Create individual match
        const adminRequest: AdminMatchRequest = {
          createdById: req.user!.id,
          creatorRole: 'admin', // Simplified for bulk operations
          scheduledDate: new Date(matchData.scheduledDate),
          ...matchData
        };
        
        const result = await AdministrativeMatchService.createAdministrativeMatch(adminRequest);
        results.push({ index: i, matchId: result.matchId, status: 'success' });
        
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`[ADMIN-MATCH] Bulk creation: ${results.length} successful, ${errors.length} failed`);
    
    res.status(201).json({
      success: true,
      summary: {
        total: matches.length,
        successful: results.length,
        failed: errors.length
      },
      results,
      errors
    });
    
  } catch (error) {
    console.error('[ADMIN-MATCH] Error in bulk match creation:', error);
    res.status(500).json({
      error: 'Failed to create bulk matches',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get administrative matches with filters
 * GET /api/admin/matches
 */
export async function getAdministrativeMatches(req: Request, res: Response) {
  try {
    const {
      createdBy,
      matchType,
      status,
      tournamentId,
      fromDate,
      toDate,
      page = 1,
      limit = 20
    } = req.query;
    
    // Build filters
    const filters: any = {};
    
    if (createdBy) filters.createdBy = parseInt(createdBy as string);
    if (matchType) filters.matchType = matchType;
    if (status) filters.status = status;
    if (tournamentId) filters.tournamentId = parseInt(tournamentId as string);
    if (fromDate) filters.fromDate = new Date(fromDate as string);
    if (toDate) filters.toDate = new Date(toDate as string);
    
    // This would query an administrative_matches table
    // For now, return a mock response structure
    const matches = [
      {
        id: 1,
        matchId: 123,
        createdById: req.user!.id,
        creatorRole: 'tournament_director',
        players: ['Player A', 'Player B'],
        scheduledDate: new Date(),
        status: 'scheduled',
        venue: 'Court 1',
        isOfficial: true
      }
    ];
    
    res.json({
      matches,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: matches.length,
        pages: Math.ceil(matches.length / parseInt(limit as string))
      },
      filters
    });
    
  } catch (error) {
    console.error('[ADMIN-MATCH] Error fetching administrative matches:', error);
    res.status(500).json({
      error: 'Failed to fetch administrative matches'
    });
  }
}

/**
 * Update administrative match
 * PUT /api/admin/matches/:matchId
 */
export async function updateAdministrativeMatch(req: Request, res: Response) {
  try {
    const matchId = parseInt(req.params.matchId);
    
    if (!matchId) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }
    
    // Validate partial update data
    const updateData = AdminMatchSchema.partial().parse(req.body);
    
    console.log(`[ADMIN-MATCH] Updating match ${matchId} by user ${req.user!.id}`);
    
    // This would update the administrative match record
    // For now, return success response
    
    res.json({
      success: true,
      matchId,
      message: 'Administrative match updated successfully',
      updates: updateData
    });
    
  } catch (error) {
    console.error('[ADMIN-MATCH] Error updating administrative match:', error);
    res.status(500).json({
      error: 'Failed to update administrative match'
    });
  }
}

/**
 * Cancel administrative match
 * DELETE /api/admin/matches/:matchId
 */
export async function cancelAdministrativeMatch(req: Request, res: Response) {
  try {
    const matchId = parseInt(req.params.matchId);
    const reason = req.body.reason || 'Cancelled by administrator';
    
    if (!matchId) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }
    
    console.log(`[ADMIN-MATCH] Cancelling match ${matchId} by user ${req.user!.id}`);
    
    // This would:
    // 1. Update match status to cancelled
    // 2. Send notifications to participants
    // 3. Remove from schedules/brackets
    
    res.json({
      success: true,
      matchId,
      message: 'Administrative match cancelled successfully',
      reason
    });
    
  } catch (error) {
    console.error('[ADMIN-MATCH] Error cancelling administrative match:', error);
    res.status(500).json({
      error: 'Failed to cancel administrative match'
    });
  }
}

/**
 * Get available players for match creation
 * GET /api/admin/matches/available-players
 */
export async function getAvailablePlayers(req: Request, res: Response) {
  try {
    const {
      search,
      ratingMin,
      ratingMax,
      division,
      activeOnly = 'true'
    } = req.query;
    
    // This would query users with filters for match creation
    console.log(`[ADMIN-MATCH] Fetching available players with filters:`, {
      search, ratingMin, ratingMax, division, activeOnly
    });
    
    // Mock response for now
    const players = [
      {
        id: 1,
        displayName: 'Test Player',
        username: 'testdev',
        duprRating: 4.5,
        isActive: true,
        lastMatch: new Date(),
        availability: 'available'
      }
    ];
    
    res.json({
      players,
      total: players.length
    });
    
  } catch (error) {
    console.error('[ADMIN-MATCH] Error fetching available players:', error);
    res.status(500).json({
      error: 'Failed to fetch available players'
    });
  }
}