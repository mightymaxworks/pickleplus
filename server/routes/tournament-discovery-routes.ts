/**
 * PKL-278651-GAME-0002-TOURN
 * Tournament Discovery Routes
 * 
 * API routes for the tournament discovery quest feature
 */

import express, { Request, Response } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { isAdmin, isAuthenticated } from '../auth';
import { prizeDrawingPools, prizeDrawingEntries } from '../../shared/prize-drawing.schema';

// Array with tournament discovery points (these would typically be stored in a database table)
// For now we'll use a static array for the initial implementation
const TOURNAMENT_DISCOVERY_POINTS = [
  {
    id: 'tournament-bracket',
    name: 'Tournament Bracket',
    description: 'Discover how tournament brackets will work in Pickle+',
    points: 15,
    tier: 'scout'
  },
  {
    id: 'tournament-scoring',
    name: 'Scoring System',
    description: 'Learn about the advanced scoring system for tournaments',
    points: 15,
    tier: 'scout'
  },
  {
    id: 'tournament-registration',
    name: 'Tournament Registration',
    description: 'Explore how tournament registration will work',
    points: 15,
    tier: 'strategist'
  },
  {
    id: 'seeding-algorithm',
    name: 'Seeding Algorithm',
    description: 'Discover how players will be seeded in tournaments',
    points: 15,
    tier: 'strategist'
  },
  {
    id: 'tournament-rewards',
    name: 'Tournament Rewards',
    description: 'Learn about tournament rewards and prizes',
    points: 15,
    tier: 'pioneer'
  }
];

// User discoveries storage (we'll use a Map for now, but this would be in the database)
const userDiscoveries = new Map<number, string[]>();

/**
 * Register tournament discovery routes
 */
export function registerTournamentDiscoveryRoutes(app: express.Express) {
  console.log('[Routes] Registering tournament discovery routes');
  
  // Get all tournament discovery points
  app.get('/api/tournament-discovery/points', async (req: Request, res: Response) => {
    try {
      res.json(TOURNAMENT_DISCOVERY_POINTS);
    } catch (error) {
      console.error('Error getting tournament discovery points:', error);
      res.status(500).json({ error: 'Failed to retrieve tournament discovery points' });
    }
  });
  
  // Get a specific discovery point
  app.get('/api/tournament-discovery/points/:id', async (req: Request, res: Response) => {
    try {
      const pointId = req.params.id;
      const point = TOURNAMENT_DISCOVERY_POINTS.find(p => p.id === pointId);
      
      if (!point) {
        return res.status(404).json({ error: 'Discovery point not found' });
      }
      
      res.json(point);
    } catch (error) {
      console.error('Error getting discovery point:', error);
      res.status(500).json({ error: 'Failed to retrieve discovery point' });
    }
  });
  
  // Get user's discoveries
  app.get('/api/tournament-discovery/my-discoveries', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const discoveries = userDiscoveries.get(userId) || [];
      
      // Calculate total points and tier information
      const discoveredPoints = TOURNAMENT_DISCOVERY_POINTS.filter(p => discoveries.includes(p.id));
      const totalPoints = discoveredPoints.reduce((sum, p) => sum + p.points, 0);
      
      // Calculate completion percentage
      const completionPercentage = Math.round((discoveries.length / TOURNAMENT_DISCOVERY_POINTS.length) * 100);
      
      // Determine current tier based on discoveries
      let currentTier = 'none';
      if (discoveries.length > 0) {
        const tiers = ['scout', 'strategist', 'pioneer'];
        const tierCounts = {
          scout: discoveredPoints.filter(p => p.tier === 'scout').length,
          strategist: discoveredPoints.filter(p => p.tier === 'strategist').length,
          pioneer: discoveredPoints.filter(p => p.tier === 'pioneer').length
        };
        
        if (tierCounts.pioneer > 0) {
          currentTier = 'pioneer';
        } else if (tierCounts.strategist > 0) {
          currentTier = 'strategist';
        } else if (tierCounts.scout > 0) {
          currentTier = 'scout';
        }
      }
      
      res.json({
        discoveries,
        discoveredDetails: discoveredPoints,
        totalPoints,
        completionPercentage,
        currentTier,
        isComplete: completionPercentage === 100
      });
    } catch (error) {
      console.error('Error getting user discoveries:', error);
      res.status(500).json({ error: 'Failed to retrieve user discoveries' });
    }
  });
  
  // Record a new discovery
  app.post('/api/tournament-discovery/discover', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      const pointId = req.body.pointId;
      
      if (!pointId) {
        return res.status(400).json({ error: 'Missing discovery point ID' });
      }
      
      // Check if the discovery point exists
      const point = TOURNAMENT_DISCOVERY_POINTS.find(p => p.id === pointId);
      if (!point) {
        return res.status(404).json({ error: 'Discovery point not found' });
      }
      
      // Get user's current discoveries
      const discoveries = userDiscoveries.get(userId) || [];
      
      // Check if already discovered
      if (discoveries.includes(pointId)) {
        return res.json({
          success: true,
          isNew: false,
          message: 'Point already discovered',
          discovery: point
        });
      }
      
      // Add new discovery
      discoveries.push(pointId);
      userDiscoveries.set(userId, discoveries);
      
      // Check if all points are discovered to trigger prize drawing entry
      const isAllDiscovered = TOURNAMENT_DISCOVERY_POINTS.every(p => discoveries.includes(p.id));
      let prizeDrawingEntry = null;
      
      if (isAllDiscovered) {
        // Check if we need to add to a prize drawing pool
        try {
          // Get the active "Tournament Discovery" pool
          const pools = await db.query.prizeDrawingPools.findMany({
            where: sql => sql`campaign_id = 'tournament-discovery' AND status = 'active'`
          });
          
          if (pools.length > 0) {
            const activePool = pools[0];
            
            // Check if user already has an entry
            const existingEntry = await db.query.prizeDrawingEntries.findFirst({
              where: sql => sql`pool_id = ${activePool.id} AND user_id = ${userId}`
            });
            
            if (!existingEntry) {
              // Create new entry
              const newEntries = await db.insert(prizeDrawingEntries)
                .values({
                  poolId: activePool.id,
                  userId,
                  entryMethod: 'quest_completion'
                })
                .returning();
              
              if (newEntries.length > 0) {
                prizeDrawingEntry = newEntries[0];
              }
            } else {
              prizeDrawingEntry = existingEntry;
            }
          }
        } catch (poolError) {
          // Log but don't fail the discovery record
          console.error('Error adding to prize drawing pool:', poolError);
        }
      }
      
      // Return success with new discovery data
      res.json({
        success: true,
        isNew: true,
        message: 'New point discovered',
        discovery: point,
        reward: {
          type: 'xp',
          amount: point.points,
          name: `${point.name} Discovery`
        },
        prizeDrawingEntry,
        isComplete: isAllDiscovered
      });
    } catch (error) {
      console.error('Error recording discovery:', error);
      res.status(500).json({ error: 'Failed to record discovery' });
    }
  });
  
  // Reset a user's discoveries (admin only, for testing)
  app.post('/api/tournament-discovery/reset', isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId;
      
      if (!userId) {
        return res.status(400).json({ error: 'Missing user ID' });
      }
      
      // Reset user's discoveries
      userDiscoveries.delete(userId);
      
      // Also delete any prize drawing entries related to tournament discovery
      try {
        const pools = await db.query.prizeDrawingPools.findMany({
          where: sql => sql`campaign_id = 'tournament-discovery'`
        });
        
        if (pools.length > 0) {
          const poolIds = pools.map(p => p.id);
          
          await db.delete(prizeDrawingEntries)
            .where(sql => sql`pool_id IN (${poolIds.join(',')}) AND user_id = ${userId}`);
        }
      } catch (deleteError) {
        console.error('Error deleting prize drawing entries:', deleteError);
        // Don't fail the reset operation
      }
      
      res.json({
        success: true,
        message: `Discoveries reset for user ${userId}`
      });
    } catch (error) {
      console.error('Error resetting discoveries:', error);
      res.status(500).json({ error: 'Failed to reset discoveries' });
    }
  });
}