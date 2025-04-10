/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing Routes
 * 
 * API routes for the prize drawing feature
 */

import express, { Request, Response } from 'express';
import { isAdmin } from '../auth';
import { db } from '../db';
import { 
  prizeDrawingPools, prizeDrawingEntries, insertPrizeDrawingPoolSchema,
  type PrizeDrawingPool, type PrizeDrawingEntry
} from '../../shared/prize-drawing.schema';
import { users } from '../../shared/schema';
import { eq, asc, sql, and, desc } from 'drizzle-orm';

/**
 * Register prize drawing routes
 */
export function registerPrizeDrawingRoutes(app: express.Express) {
  console.log('[API] Registering Prize Drawing routes');

  /**
   * Get all prize drawing pools with summary data (entry count, winner count)
   */
  app.get('/api/prize-drawings/pools-summary', isAdmin, async (req: Request, res: Response) => {
    try {
      // Get all pools
      const pools = await db.query.prizeDrawingPools.findMany({
        orderBy: [desc(prizeDrawingPools.createdAt)]
      });

      // Prepare the augmented pools with entry counts
      const augmentedPools = await Promise.all(pools.map(async (pool) => {
        // Get entry count for this pool
        const entryCountResult = await db.select({ 
          count: sql<number>`count(*)` 
        }).from(prizeDrawingEntries).where(eq(prizeDrawingEntries.poolId, pool.id));
        
        // Get winner count for this pool
        const winnerCountResult = await db.select({ 
          count: sql<number>`count(*)` 
        }).from(prizeDrawingEntries).where(
          and(
            eq(prizeDrawingEntries.poolId, pool.id),
            eq(prizeDrawingEntries.isWinner, true)
          )
        );
        
        const entryCount = entryCountResult[0]?.count || 0;
        const winnerCount = winnerCountResult[0]?.count || 0;
        
        return {
          ...pool,
          entryCount,
          winnerCount
        };
      }));

      res.json(augmentedPools);
    } catch (error) {
      console.error('Error getting prize drawing pools:', error);
      res.status(500).json({ error: 'Failed to get prize drawing pools' });
    }
  });

  /**
   * Create a new prize drawing pool
   */
  app.post('/api/prize-drawings/pools', isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertPrizeDrawingPoolSchema.parse(req.body);
      
      // Insert new pool
      const newPool = await db.insert(prizeDrawingPools).values(validatedData).returning();
      
      res.status(201).json(newPool[0]);
    } catch (error) {
      console.error('Error creating prize drawing pool:', error);
      res.status(400).json({ error: 'Failed to create prize drawing pool' });
    }
  });

  /**
   * Update an existing prize drawing pool
   */
  app.put('/api/prize-drawings/pools/:id', isAdmin, async (req: Request, res: Response) => {
    try {
      const poolId = parseInt(req.params.id);
      if (isNaN(poolId)) {
        return res.status(400).json({ error: 'Invalid pool ID' });
      }
      
      // Validate request body
      const validatedData = insertPrizeDrawingPoolSchema.parse(req.body);
      
      // Update pool
      const updatedPool = await db.update(prizeDrawingPools)
        .set(validatedData)
        .where(eq(prizeDrawingPools.id, poolId))
        .returning();
      
      if (updatedPool.length === 0) {
        return res.status(404).json({ error: 'Prize drawing pool not found' });
      }
      
      res.json(updatedPool[0]);
    } catch (error) {
      console.error('Error updating prize drawing pool:', error);
      res.status(400).json({ error: 'Failed to update prize drawing pool' });
    }
  });

  /**
   * Get all entries for a prize drawing pool
   */
  app.get('/api/prize-drawings/pools/:id/entries', isAdmin, async (req: Request, res: Response) => {
    try {
      const poolId = parseInt(req.params.id);
      if (isNaN(poolId)) {
        return res.status(400).json({ error: 'Invalid pool ID' });
      }
      
      // Check if pool exists
      const pool = await db.query.prizeDrawingPools.findFirst({
        where: eq(prizeDrawingPools.id, poolId)
      });
      
      if (!pool) {
        return res.status(404).json({ error: 'Prize drawing pool not found' });
      }
      
      // Get all entries for this pool with user information
      const entries = await db.select({
        id: prizeDrawingEntries.id,
        poolId: prizeDrawingEntries.poolId,
        userId: prizeDrawingEntries.userId,
        entryMethod: prizeDrawingEntries.entryMethod,
        entryDate: prizeDrawingEntries.entryDate,
        isWinner: prizeDrawingEntries.isWinner,
        drawingDate: prizeDrawingEntries.drawingDate,
        hasBeenNotified: prizeDrawingEntries.hasBeenNotified,
        notificationDate: prizeDrawingEntries.notificationDate,
        tokenClaimed: prizeDrawingEntries.tokenClaimed,
        claimDate: prizeDrawingEntries.claimDate,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(prizeDrawingEntries)
      .innerJoin(users, eq(prizeDrawingEntries.userId, users.id))
      .where(eq(prizeDrawingEntries.poolId, poolId))
      .orderBy(asc(prizeDrawingEntries.entryDate));
      
      res.json(entries);
    } catch (error) {
      console.error('Error getting prize drawing entries:', error);
      res.status(500).json({ error: 'Failed to get prize drawing entries' });
    }
  });

  /**
   * Draw winners from a prize drawing pool
   */
  app.post('/api/prize-drawings/pools/:id/draw', isAdmin, async (req: Request, res: Response) => {
    try {
      const poolId = parseInt(req.params.id);
      if (isNaN(poolId)) {
        return res.status(400).json({ error: 'Invalid pool ID' });
      }
      
      // Get numWinners from request body
      const { numWinners } = req.body;
      if (!numWinners || isNaN(numWinners) || numWinners < 1) {
        return res.status(400).json({ error: 'Invalid number of winners' });
      }
      
      // Check if pool exists and get max winners
      const pool = await db.query.prizeDrawingPools.findFirst({
        where: eq(prizeDrawingPools.id, poolId)
      });
      
      if (!pool) {
        return res.status(404).json({ error: 'Prize drawing pool not found' });
      }
      
      // Get current winner count
      const winnerCountResult = await db.select({ 
        count: sql<number>`count(*)` 
      }).from(prizeDrawingEntries).where(
        and(
          eq(prizeDrawingEntries.poolId, poolId),
          eq(prizeDrawingEntries.isWinner, true)
        )
      );
      
      const currentWinnerCount = winnerCountResult[0]?.count || 0;
      const maxAllowedWinners = pool.maxWinners - currentWinnerCount;
      
      if (numWinners > maxAllowedWinners) {
        return res.status(400).json({ 
          error: `Cannot select more than ${maxAllowedWinners} additional winners` 
        });
      }
      
      // Get all non-winner entries for this pool
      const eligibleEntries = await db.select()
        .from(prizeDrawingEntries)
        .where(
          and(
            eq(prizeDrawingEntries.poolId, poolId),
            eq(prizeDrawingEntries.isWinner, false)
          )
        );
      
      if (eligibleEntries.length === 0) {
        return res.status(400).json({ error: 'No eligible entries found' });
      }
      
      if (numWinners > eligibleEntries.length) {
        return res.status(400).json({ 
          error: `Cannot select more winners than available entries (${eligibleEntries.length})` 
        });
      }
      
      // Randomly select winners
      const shuffled = [...eligibleEntries].sort(() => 0.5 - Math.random());
      const selectedEntries = shuffled.slice(0, numWinners);
      const now = new Date();
      
      // Update selected entries as winners
      const winners = await Promise.all(selectedEntries.map(async (entry) => {
        const updated = await db.update(prizeDrawingEntries)
          .set({ 
            isWinner: true,
            drawingDate: now
          })
          .where(eq(prizeDrawingEntries.id, entry.id))
          .returning();
        
        // Get user details for the winner
        const user = await db.query.users.findFirst({
          where: eq(users.id, entry.userId),
          columns: {
            id: true,
            username: true,
            email: true
          }
        });
        
        return {
          id: updated[0].id,
          user,
          entryDate: updated[0].entryDate,
          drawingDate: updated[0].drawingDate,
          hasBeenNotified: updated[0].hasBeenNotified
        };
      }));
      
      // Update pool status if all winners have been selected
      const newWinnerCount = currentWinnerCount + numWinners;
      if (newWinnerCount >= pool.maxWinners) {
        await db.update(prizeDrawingPools)
          .set({ 
            drawingDate: now,
            status: 'completed'
          })
          .where(eq(prizeDrawingPools.id, poolId));
      }
      
      res.json({
        message: `Successfully drew ${numWinners} winner(s)`,
        winners
      });
    } catch (error) {
      console.error('Error drawing winners:', error);
      res.status(500).json({ error: 'Failed to draw winners' });
    }
  });

  /**
   * Mark an entry as notified
   */
  app.post('/api/prize-drawings/entries/:id/notify', isAdmin, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ error: 'Invalid entry ID' });
      }
      
      // Check if entry exists and is a winner
      const entry = await db.query.prizeDrawingEntries.findFirst({
        where: eq(prizeDrawingEntries.id, entryId)
      });
      
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      
      if (!entry.isWinner) {
        return res.status(400).json({ error: 'Cannot mark non-winner as notified' });
      }
      
      if (entry.hasBeenNotified) {
        return res.status(400).json({ error: 'Entry has already been notified' });
      }
      
      // Mark entry as notified
      const now = new Date();
      const updated = await db.update(prizeDrawingEntries)
        .set({ 
          hasBeenNotified: true,
          notificationDate: now
        })
        .where(eq(prizeDrawingEntries.id, entryId))
        .returning();
      
      res.json(updated[0]);
    } catch (error) {
      console.error('Error marking entry as notified:', error);
      res.status(500).json({ error: 'Failed to mark entry as notified' });
    }
  });

  /**
   * Mark an entry's token as claimed
   */
  app.post('/api/prize-drawings/entries/:id/claim', isAdmin, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id);
      if (isNaN(entryId)) {
        return res.status(400).json({ error: 'Invalid entry ID' });
      }
      
      // Check if entry exists, is a winner, and has been notified
      const entry = await db.query.prizeDrawingEntries.findFirst({
        where: eq(prizeDrawingEntries.id, entryId)
      });
      
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      
      if (!entry.isWinner) {
        return res.status(400).json({ error: 'Cannot mark non-winner as claimed' });
      }
      
      if (!entry.hasBeenNotified) {
        return res.status(400).json({ error: 'Cannot mark unnotified entry as claimed' });
      }
      
      if (entry.tokenClaimed) {
        return res.status(400).json({ error: 'Token has already been claimed' });
      }
      
      // Mark token as claimed
      const now = new Date();
      const updated = await db.update(prizeDrawingEntries)
        .set({ 
          tokenClaimed: true,
          claimDate: now
        })
        .where(eq(prizeDrawingEntries.id, entryId))
        .returning();
      
      res.json(updated[0]);
    } catch (error) {
      console.error('Error marking token as claimed:', error);
      res.status(500).json({ error: 'Failed to mark token as claimed' });
    }
  });
}