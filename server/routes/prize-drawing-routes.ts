/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing Routes
 * 
 * API routes for the prize drawing feature
 */

import express, { Request, Response } from 'express';
import { isAuthenticated, isAdmin } from '../auth';
import { db } from '../db';
import { sql, eq, and, desc, count, SQL } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { 
  prizeDrawingPools, 
  prizeDrawingEntries, 
  insertPrizeDrawingPoolSchema,
  insertPrizeDrawingEntrySchema,
  PrizeDrawingPool,
  PrizeDrawingEntry
} from '@shared/prize-drawing.schema';
import { users } from '@shared/schema';
import { migratePrizeDrawingTables } from '../../migrations/prize-drawing-migration';

/**
 * Register prize drawing routes
 */
export function registerPrizeDrawingRoutes(app: express.Express) {
  console.log('[API] Registering Prize Drawing routes');
  
  // Ensure prize drawing tables exist
  migratePrizeDrawingTables().catch(error => {
    console.error('[API] Error migrating prize drawing tables:', error);
  });

  /**
   * Get all prize drawing pools with summary data (entry count, winner count)
   */
  app.get('/api/prize-drawings/pools-summary', isAdmin, async (req: Request, res: Response) => {
    try {
      const poolsWithCounts = await db.execute(sql`
        SELECT 
          p.*,
          COUNT(DISTINCT e.id) AS entry_count,
          COUNT(DISTINCT CASE WHEN e.is_winner = true THEN e.id END) AS winner_count
        FROM prize_drawing_pools p
        LEFT JOIN prize_drawing_entries e ON p.id = e.pool_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `);

      // Format dates properly
      const formattedPools = poolsWithCounts.map((pool: any) => ({
        ...pool,
        startDate: pool.start_date,
        endDate: pool.end_date,
        drawingDate: pool.drawing_date,
        createdAt: pool.created_at,
        updatedAt: pool.updated_at,
        entryCount: parseInt(pool.entry_count),
        winnerCount: parseInt(pool.winner_count)
      }));

      res.json(formattedPools);
    } catch (error) {
      console.error('[API] Error getting prize drawing pools:', error);
      res.status(500).json({ error: 'Error fetching prize drawing pools' });
    }
  });

  /**
   * Create a new prize drawing pool
   */
  app.post('/api/prize-drawings/pools', isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request
      const validationResult = insertPrizeDrawingPoolSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid prize drawing pool data', details: validationResult.error });
      }

      // Convert string dates to Date objects
      const data = {
        ...validationResult.data,
        startDate: validationResult.data.startDate ? new Date(validationResult.data.startDate) : new Date(),
        endDate: validationResult.data.endDate ? new Date(validationResult.data.endDate) : null,
        drawingDate: validationResult.data.drawingDate ? new Date(validationResult.data.drawingDate) : null
      };

      // Insert pool
      const [newPool] = await db.insert(prizeDrawingPools).values(data).returning();
      res.status(201).json(newPool);
    } catch (error) {
      console.error('[API] Error creating prize drawing pool:', error);
      res.status(500).json({ error: 'Error creating prize drawing pool' });
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

      // Validate request
      const validationResult = insertPrizeDrawingPoolSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid prize drawing pool data', details: validationResult.error });
      }

      // Convert string dates to Date objects
      const data = {
        ...validationResult.data,
        startDate: validationResult.data.startDate ? new Date(validationResult.data.startDate) : new Date(),
        endDate: validationResult.data.endDate ? new Date(validationResult.data.endDate) : null,
        drawingDate: validationResult.data.drawingDate ? new Date(validationResult.data.drawingDate) : null,
        updatedAt: new Date()
      };

      // Update pool
      const [updatedPool] = await db.update(prizeDrawingPools)
        .set(data)
        .where(eq(prizeDrawingPools.id, poolId))
        .returning();

      if (!updatedPool) {
        return res.status(404).json({ error: 'Prize drawing pool not found' });
      }

      res.json(updatedPool);
    } catch (error) {
      console.error('[API] Error updating prize drawing pool:', error);
      res.status(500).json({ error: 'Error updating prize drawing pool' });
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

      // Query entries with user info
      const entries = await db
        .select({
          entry: prizeDrawingEntries,
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
        .orderBy(desc(prizeDrawingEntries.entryDate));

      // Format entries for client
      const formattedEntries = entries.map(({ entry, user }) => ({
        id: entry.id,
        poolId: entry.poolId,
        userId: entry.userId,
        entryMethod: entry.entryMethod,
        entryDate: entry.entryDate,
        isWinner: entry.isWinner,
        drawingDate: entry.drawingDate,
        hasBeenNotified: entry.hasBeenNotified,
        notificationDate: entry.notificationDate,
        tokenClaimed: entry.tokenClaimed,
        claimDate: entry.claimDate,
        user
      }));

      res.json(formattedEntries);
    } catch (error) {
      console.error('[API] Error getting prize drawing entries:', error);
      res.status(500).json({ error: 'Error fetching prize drawing entries' });
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

      const numWinners = req.body.numWinners || 1;
      if (numWinners < 1) {
        return res.status(400).json({ error: 'Number of winners must be at least 1' });
      }

      // Get the pool to check if we can draw winners
      const [pool] = await db
        .select()
        .from(prizeDrawingPools)
        .where(eq(prizeDrawingPools.id, poolId));

      if (!pool) {
        return res.status(404).json({ error: 'Prize drawing pool not found' });
      }

      // Get entries that are not already winners
      const availableEntries = await db
        .select()
        .from(prizeDrawingEntries)
        .where(
          and(
            eq(prizeDrawingEntries.poolId, poolId),
            eq(prizeDrawingEntries.isWinner, false)
          )
        );

      if (availableEntries.length === 0) {
        return res.status(400).json({ error: 'No eligible entries available for drawing' });
      }

      if (availableEntries.length < numWinners) {
        return res.status(400).json({ 
          error: `Only ${availableEntries.length} eligible entries available, cannot draw ${numWinners} winners` 
        });
      }

      // Randomly select winners
      const winnerIndices: number[] = [];
      while (winnerIndices.length < numWinners) {
        const randomIndex = Math.floor(Math.random() * availableEntries.length);
        if (!winnerIndices.includes(randomIndex)) {
          winnerIndices.push(randomIndex);
        }
      }

      const drawingDate = new Date();
      const winners = [];

      // Update each winner in the database
      for (const index of winnerIndices) {
        const entry = availableEntries[index];
        
        const [updatedEntry] = await db
          .update(prizeDrawingEntries)
          .set({
            isWinner: true,
            drawingDate
          })
          .where(eq(prizeDrawingEntries.id, entry.id))
          .returning();

        // Get user info for the winner
        const [user] = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
            displayName: users.displayName
          })
          .from(users)
          .where(eq(users.id, entry.userId));

        winners.push({
          id: updatedEntry.id,
          user,
          entryDate: updatedEntry.entryDate,
          drawingDate: updatedEntry.drawingDate,
          hasBeenNotified: updatedEntry.hasBeenNotified
        });
      }

      // Update the pool drawing date
      await db
        .update(prizeDrawingPools)
        .set({
          drawingDate,
          status: 'completed',
          updatedAt: new Date()
        })
        .where(eq(prizeDrawingPools.id, poolId));

      res.json({
        message: `Successfully drew ${winners.length} winner${winners.length !== 1 ? 's' : ''}`,
        winners
      });
    } catch (error) {
      console.error('[API] Error drawing winners:', error);
      res.status(500).json({ error: 'Error drawing winners' });
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

      // Update the entry
      const notificationDate = new Date();
      const [updatedEntry] = await db
        .update(prizeDrawingEntries)
        .set({
          hasBeenNotified: true,
          notificationDate
        })
        .where(eq(prizeDrawingEntries.id, entryId))
        .returning();

      if (!updatedEntry) {
        return res.status(404).json({ error: 'Prize drawing entry not found' });
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error('[API] Error marking entry as notified:', error);
      res.status(500).json({ error: 'Error marking entry as notified' });
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

      // Update the entry
      const claimDate = new Date();
      const [updatedEntry] = await db
        .update(prizeDrawingEntries)
        .set({
          tokenClaimed: true,
          claimDate
        })
        .where(eq(prizeDrawingEntries.id, entryId))
        .returning();

      if (!updatedEntry) {
        return res.status(404).json({ error: 'Prize drawing entry not found' });
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error('[API] Error marking token as claimed:', error);
      res.status(500).json({ error: 'Error marking token as claimed' });
    }
  });
}