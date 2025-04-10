/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing Routes
 * 
 * API routes for the prize drawing system used in tournament discovery quest
 */

import express, { Request, Response } from 'express';
import { db } from '../db';
import { prizeDrawingPools, prizeDrawingEntries, PrizeDrawingPool, PrizeDrawingEntry, insertPrizeDrawingPoolSchema, insertPrizeDrawingEntrySchema } from '../../shared/prize-drawing.schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { isAdmin, isAuthenticated } from '../auth';
import { users } from '../../shared/schema';

/**
 * Register prize drawing routes
 */
export function registerPrizeDrawingRoutes(app: express.Express) {
  console.log('[Routes] Registering prize drawing routes');
  
  // Get all prize drawing pools
  app.get('/api/prize-drawings/pools', async (req: Request, res: Response) => {
    try {
      const pools = await db.query.prizeDrawingPools.findMany({
        orderBy: [desc(prizeDrawingPools.createdAt)]
      });
      
      res.json(pools);
    } catch (error) {
      console.error('Error getting prize drawing pools:', error);
      res.status(500).json({ error: 'Failed to retrieve prize drawing pools' });
    }
  });
  
  // Get entries for a specific pool
  app.get('/api/prize-drawings/pools/:poolId/entries', isAdmin, async (req: Request, res: Response) => {
    try {
      const poolId = parseInt(req.params.poolId);
      
      if (isNaN(poolId)) {
        return res.status(400).json({ error: 'Invalid pool ID' });
      }
      
      const entries = await db.query.prizeDrawingEntries.findMany({
        where: eq(prizeDrawingEntries.poolId, poolId),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              email: true,
              displayName: true,
              avatarUrl: true
            }
          }
        },
        orderBy: [desc(prizeDrawingEntries.entryDate)]
      });
      
      // Sort entries by date (newest first)
      entries.sort((a, b) => {
        const dateA = new Date(a.entryDate);
        const dateB = new Date(b.entryDate);
        return dateB.getTime() - dateA.getTime();
      });
      
      res.json(entries);
    } catch (error) {
      console.error('Error getting prize drawing entries:', error);
      res.status(500).json({ error: 'Failed to retrieve prize drawing entries' });
    }
  });
  
  // Get user's entries in all pools
  app.get('/api/prize-drawings/my-entries', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const userId = req.user.id;
      
      const entries = await db.query.prizeDrawingEntries.findMany({
        where: eq(prizeDrawingEntries.userId, userId),
        with: {
          pool: true
        },
        orderBy: [desc(prizeDrawingEntries.entryDate)]
      });
      
      res.json(entries);
    } catch (error) {
      console.error('Error getting user prize drawing entries:', error);
      res.status(500).json({ error: 'Failed to retrieve your prize drawing entries' });
    }
  });
  
  // Create a new prize drawing pool (admin only)
  app.post('/api/prize-drawings/pools', isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertPrizeDrawingPoolSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid pool data',
          details: validationResult.error.format()
        });
      }
      
      // Insert new pool
      const newPool = await db.insert(prizeDrawingPools).values(validationResult.data).returning();
      
      res.status(201).json(newPool[0]);
    } catch (error) {
      console.error('Error creating prize drawing pool:', error);
      res.status(500).json({ error: 'Failed to create prize drawing pool' });
    }
  });
  
  // Update an existing prize drawing pool (admin only)
  app.put('/api/prize-drawings/pools/:poolId', isAdmin, async (req: Request, res: Response) => {
    try {
      const poolId = parseInt(req.params.poolId);
      
      if (isNaN(poolId)) {
        return res.status(400).json({ error: 'Invalid pool ID' });
      }
      
      // Validate request body
      const validationResult = insertPrizeDrawingPoolSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid pool data',
          details: validationResult.error.format()
        });
      }
      
      // Update pool
      const updatedPool = await db.update(prizeDrawingPools)
        .set({
          ...validationResult.data,
          updatedAt: new Date()
        })
        .where(eq(prizeDrawingPools.id, poolId))
        .returning();
      
      if (updatedPool.length === 0) {
        return res.status(404).json({ error: 'Prize drawing pool not found' });
      }
      
      res.json(updatedPool[0]);
    } catch (error) {
      console.error('Error updating prize drawing pool:', error);
      res.status(500).json({ error: 'Failed to update prize drawing pool' });
    }
  });
  
  // Get pool details with entry count
  app.get('/api/prize-drawings/pools/:poolId', async (req: Request, res: Response) => {
    try {
      const poolId = parseInt(req.params.poolId);
      
      if (isNaN(poolId)) {
        return res.status(400).json({ error: 'Invalid pool ID' });
      }
      
      // Get pool details
      const pools = await db.select()
        .from(prizeDrawingPools)
        .where(eq(prizeDrawingPools.id, poolId));
      
      if (pools.length === 0) {
        return res.status(404).json({ error: 'Prize drawing pool not found' });
      }
      
      const pool = pools[0];
      
      // Get entry count
      const entryCountResult = await db.select({ count: sql<number>`count(*)` })
        .from(prizeDrawingEntries)
        .where(eq(prizeDrawingEntries.poolId, poolId));
      
      const entryCount = entryCountResult[0]?.count || 0;
      
      // Get winner count
      const winnerCountResult = await db.select({ count: sql<number>`count(*)` })
        .from(prizeDrawingEntries)
        .where(and(
          eq(prizeDrawingEntries.poolId, poolId),
          eq(prizeDrawingEntries.isWinner, true)
        ));
      
      const winnerCount = winnerCountResult[0]?.count || 0;
      
      res.json({
        ...pool,
        entryCount,
        winnerCount
      });
    } catch (error) {
      console.error('Error getting prize drawing pool details:', error);
      res.status(500).json({ error: 'Failed to retrieve prize drawing pool details' });
    }
  });
  
  // Get all pools with entry counts and other summary information
  app.get('/api/prize-drawings/pools-summary', async (req: Request, res: Response) => {
    try {
      // Get all pools
      const pools = await db.select().from(prizeDrawingPools).orderBy(desc(prizeDrawingPools.createdAt));
      
      // Prepare summary data
      const poolSummaries = await Promise.all(pools.map(async (pool) => {
        // Get entry count
        const entryCountResult = await db.select({ count: sql<number>`count(*)` })
          .from(prizeDrawingEntries)
          .where(eq(prizeDrawingEntries.poolId, pool.id));
        
        const entryCount = entryCountResult[0]?.count || 0;
        
        // Get winner count
        const winnerCountResult = await db.select({ count: sql<number>`count(*)` })
          .from(prizeDrawingEntries)
          .where(and(
            eq(prizeDrawingEntries.poolId, pool.id),
            eq(prizeDrawingEntries.isWinner, true)
          ));
        
        const winnerCount = winnerCountResult[0]?.count || 0;
        
        return {
          ...pool,
          entryCount,
          winnerCount
        };
      }));
      
      res.json(poolSummaries);
    } catch (error) {
      console.error('Error getting prize drawing pools summary:', error);
      res.status(500).json({ error: 'Failed to retrieve prize drawing pools summary' });
    }
  });
  
  // Add an entry to a pool
  app.post('/api/prize-drawings/entries', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Set user ID from authenticated user
      const data = {
        ...req.body,
        userId: req.user.id
      };
      
      // Validate request body
      const validationResult = insertPrizeDrawingEntrySchema.safeParse(data);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid entry data',
          details: validationResult.error.format()
        });
      }
      
      // Check if user already has an entry in this pool
      const existingEntry = await db.query.prizeDrawingEntries.findFirst({
        where: and(
          eq(prizeDrawingEntries.poolId, validationResult.data.poolId),
          eq(prizeDrawingEntries.userId, req.user.id)
        )
      });
      
      if (existingEntry) {
        return res.status(409).json({ 
          error: 'User already has an entry in this pool',
          entry: existingEntry
        });
      }
      
      // Check if pool exists and is active
      const pool = await db.query.prizeDrawingPools.findFirst({
        where: eq(prizeDrawingPools.id, validationResult.data.poolId)
      });
      
      if (!pool) {
        return res.status(404).json({ error: 'Prize drawing pool not found' });
      }
      
      if (pool.status !== 'active') {
        return res.status(400).json({ error: 'Prize drawing pool is not active' });
      }
      
      // Insert new entry
      const newEntry = await db.insert(prizeDrawingEntries).values(validationResult.data).returning();
      
      res.status(201).json(newEntry[0]);
    } catch (error) {
      console.error('Error creating prize drawing entry:', error);
      res.status(500).json({ error: 'Failed to create prize drawing entry' });
    }
  });
  
  // Draw winners from a pool (admin only)
  app.post('/api/prize-drawings/pools/:poolId/draw', isAdmin, async (req: Request, res: Response) => {
    try {
      const poolId = parseInt(req.params.poolId);
      
      if (isNaN(poolId)) {
        return res.status(400).json({ error: 'Invalid pool ID' });
      }
      
      // Get the pool to check max winners
      const pool = await db.query.prizeDrawingPools.findFirst({
        where: eq(prizeDrawingPools.id, poolId)
      });
      
      if (!pool) {
        return res.status(404).json({ error: 'Prize drawing pool not found' });
      }
      
      // Get number of winners to draw from request (default to 1)
      const numWinners = req.body.numWinners || 1;
      
      // Ensure request doesn't exceed pool's max winners
      const maxWinners = pool.maxWinners || 1;
      if (numWinners > maxWinners) {
        return res.status(400).json({ 
          error: `Cannot draw more than ${maxWinners} winners from this pool` 
        });
      }
      
      // Get entries that aren't already winners
      const eligibleEntries = await db.query.prizeDrawingEntries.findMany({
        where: and(
          eq(prizeDrawingEntries.poolId, poolId),
          eq(prizeDrawingEntries.isWinner, false)
        ),
        with: {
          user: {
            columns: {
              id: true,
              username: true,
              email: true,
              displayName: true
            }
          }
        }
      });
      
      if (eligibleEntries.length === 0) {
        return res.status(400).json({ error: 'No eligible entries to draw from' });
      }
      
      // Randomly select winners
      const selectedEntries = [];
      const entryIds = [];
      
      // Don't try to draw more winners than available entries
      const drawCount = Math.min(numWinners, eligibleEntries.length);
      
      // Fisher-Yates shuffle algorithm
      const shuffled = [...eligibleEntries];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Select first N entries as winners
      for (let i = 0; i < drawCount; i++) {
        selectedEntries.push(shuffled[i]);
        entryIds.push(shuffled[i].id);
      }
      
      // Update winner status
      const drawingDate = new Date();
      await db.update(prizeDrawingEntries)
        .set({
          isWinner: true,
          drawingDate
        })
        .where(sql`id IN (${entryIds.join(',')})`)
        .returning();
      
      // Update pool status if needed
      if (pool.status === 'active') {
        // Check if we've reached the maximum number of winners
        const totalWinnersResult = await db.select({ count: sql<number>`count(*)` })
          .from(prizeDrawingEntries)
          .where(and(
            eq(prizeDrawingEntries.poolId, poolId),
            eq(prizeDrawingEntries.isWinner, true)
          ));
        
        const totalWinners = totalWinnersResult[0]?.count || 0;
        
        if (totalWinners >= maxWinners) {
          await db.update(prizeDrawingPools)
            .set({
              status: 'completed',
              updatedAt: new Date()
            })
            .where(eq(prizeDrawingPools.id, poolId));
        }
      }
      
      // Format response with winner details
      const winners = selectedEntries.map(entry => ({
        id: entry.id,
        user: {
          id: entry.user.id,
          username: entry.user.username,
          email: entry.user.email,
          displayName: entry.user.displayName
        },
        entryDate: entry.entryDate,
        drawingDate,
        hasBeenNotified: false
      }));
      
      res.json({
        message: `Successfully drew ${winners.length} winner(s)`,
        winners
      });
    } catch (error) {
      console.error('Error drawing winners:', error);
      res.status(500).json({ error: 'Failed to draw winners' });
    }
  });

  // Mark winners as notified (admin only)
  app.post('/api/prize-drawings/entries/:entryId/notify', isAdmin, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.entryId);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ error: 'Invalid entry ID' });
      }
      
      // Update notification status
      const notificationDate = new Date();
      const updatedEntries = await db.update(prizeDrawingEntries)
        .set({
          hasBeenNotified: true,
          notificationDate
        })
        .where(and(
          eq(prizeDrawingEntries.id, entryId),
          eq(prizeDrawingEntries.isWinner, true)
        ))
        .returning();
      
      if (updatedEntries.length === 0) {
        return res.status(404).json({ error: 'Winner entry not found' });
      }
      
      res.json({
        message: 'Winner has been marked as notified',
        entry: updatedEntries[0]
      });
    } catch (error) {
      console.error('Error marking winner as notified:', error);
      res.status(500).json({ error: 'Failed to mark winner as notified' });
    }
  });

  // Mark a token as claimed (admin only)
  app.post('/api/prize-drawings/entries/:entryId/claim', isAdmin, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.entryId);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ error: 'Invalid entry ID' });
      }
      
      // Update notification status
      const claimDate = new Date();
      const updatedEntries = await db.update(prizeDrawingEntries)
        .set({
          tokenClaimed: true,
          claimDate
        })
        .where(and(
          eq(prizeDrawingEntries.id, entryId),
          eq(prizeDrawingEntries.isWinner, true)
        ))
        .returning();
      
      if (updatedEntries.length === 0) {
        return res.status(404).json({ error: 'Winner entry not found' });
      }
      
      res.json({
        message: 'Token has been marked as claimed',
        entry: updatedEntries[0]
      });
    } catch (error) {
      console.error('Error marking token as claimed:', error);
      res.status(500).json({ error: 'Failed to mark token as claimed' });
    }
  });
}