/**
 * PKL-278651-GAME-0002-TOURN
 * Prize Drawing System Routes
 * 
 * API routes for the prize drawing system used in the tournament discovery quest.
 */

import { Express, Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { 
  prizeDrawingPools, 
  prizeDrawingEntries,
  insertPrizeDrawingPoolSchema,
  insertPrizeDrawingEntrySchema
} from '../../shared/prize-drawing.schema';
import { isAuthenticated, isAdmin } from '../auth';
import { users } from '../../shared/schema';

/**
 * Register prize drawing routes
 */
export function registerPrizeDrawingRoutes(app: Express) {
  /**
   * Check if a user is a winner in any drawing
   */
  app.get('/api/prize-drawings/check-winner', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }
      
      const winnerEntries = await db.query.prizeDrawingEntries.findMany({
        where: and(
          eq(prizeDrawingEntries.userId, userId),
          eq(prizeDrawingEntries.isWinner, true)
        ),
        with: {
          pool: true
        }
      });
      
      if (winnerEntries.length === 0) {
        return res.json({
          isWinner: false
        });
      }
      
      // Return the most recent winning entry
      const mostRecentWin = winnerEntries.sort((a, b) => {
        return new Date(b.drawingDate!).getTime() - new Date(a.drawingDate!).getTime();
      })[0];
      
      return res.json({
        isWinner: true,
        prizeInfo: {
          entryId: mostRecentWin.id,
          poolId: mostRecentWin.poolId,
          poolName: mostRecentWin.pool.name,
          drawingDate: mostRecentWin.drawingDate,
          hasBeenNotified: mostRecentWin.hasBeenNotified
        }
      });
    } catch (error) {
      console.error('Error checking winner status:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  /**
   * Enter a user into a prize drawing pool
   */
  app.post('/api/prize-drawings/enter', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { campaignId, entryMethod = 'quest_completion' } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }
      
      if (!campaignId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Campaign ID is required' 
        });
      }
      
      // Find active drawing pool for this campaign
      const pool = await db.query.prizeDrawingPools.findFirst({
        where: and(
          eq(prizeDrawingPools.campaignId, campaignId),
          eq(prizeDrawingPools.status, 'active')
        )
      });
      
      if (!pool) {
        return res.status(404).json({ 
          success: false, 
          message: 'No active drawing pool found for this campaign' 
        });
      }
      
      // Check if user is already entered
      const existingEntry = await db.query.prizeDrawingEntries.findFirst({
        where: and(
          eq(prizeDrawingEntries.poolId, pool.id),
          eq(prizeDrawingEntries.userId, userId)
        )
      });
      
      if (existingEntry) {
        return res.json({ 
          success: true, 
          message: 'User is already entered in this drawing',
          alreadyEntered: true,
          entryId: existingEntry.id,
          poolId: pool.id
        });
      }
      
      // Create new entry
      const validatedEntry = insertPrizeDrawingEntrySchema.parse({
        poolId: pool.id,
        userId,
        entryMethod
      });
      
      const [newEntry] = await db.insert(prizeDrawingEntries)
        .values(validatedEntry)
        .returning();
      
      return res.json({
        success: true,
        message: 'Successfully entered drawing',
        entryId: newEntry.id,
        poolId: pool.id
      });
    } catch (error) {
      console.error('Error entering drawing:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  /**
   * List all prize drawing pools (admin only)
   */
  app.get('/api/admin/prize-drawings/pools', isAdmin, async (_req: Request, res: Response) => {
    try {
      const pools = await db.query.prizeDrawingPools.findMany({
        orderBy: (prizeDrawingPools, { desc }) => [desc(prizeDrawingPools.startDate)]
      });
      
      // Count entries for each pool
      const poolsWithCounts = await Promise.all(pools.map(async (pool) => {
        const entries = await db.query.prizeDrawingEntries.findMany({
          where: eq(prizeDrawingEntries.poolId, pool.id)
        });
        
        return {
          ...pool,
          entryCount: entries.length
        };
      }));
      
      return res.json(poolsWithCounts);
    } catch (error) {
      console.error('Error fetching prize pools:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  /**
   * Create a new prize drawing pool (admin only)
   */
  app.post('/api/admin/prize-drawings/pools', isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedPool = insertPrizeDrawingPoolSchema.parse(req.body);
      
      const [newPool] = await db.insert(prizeDrawingPools)
        .values(validatedPool)
        .returning();
      
      return res.json({
        success: true,
        pool: newPool
      });
    } catch (error) {
      console.error('Error creating prize pool:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  /**
   * Perform a random drawing (admin only)
   */
  app.post('/api/admin/prize-drawings/draw', isAdmin, async (req: Request, res: Response) => {
    try {
      const { poolId } = req.body;
      
      if (!poolId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Pool ID is required' 
        });
      }
      
      // Get all eligible entries
      const entries = await db.query.prizeDrawingEntries.findMany({
        where: eq(prizeDrawingEntries.poolId, poolId),
        with: {
          user: true
        }
      });
      
      if (entries.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No entries found in this pool' 
        });
      }
      
      // Select a random winner
      const randomIndex = Math.floor(Math.random() * entries.length);
      const winningEntry = entries[randomIndex];
      
      // Update entry as winner
      await db
        .update(prizeDrawingEntries)
        .set({ 
          isWinner: true,
          drawingDate: new Date()
        })
        .where(eq(prizeDrawingEntries.id, winningEntry.id));
      
      // Return winner info
      return res.json({ 
        success: true, 
        winner: {
          id: winningEntry.id,
          user: {
            id: winningEntry.user.id,
            username: winningEntry.user.username,
            email: winningEntry.user.email
          },
          entryDate: winningEntry.entryDate,
          drawingDate: new Date()
        }
      });
    } catch (error) {
      console.error('Error performing drawing:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  /**
   * Mark a winner as notified (admin only)
   */
  app.post('/api/admin/prize-drawings/notify/:entryId', isAdmin, async (req: Request, res: Response) => {
    try {
      const { entryId } = req.params;
      
      await db
        .update(prizeDrawingEntries)
        .set({ hasBeenNotified: true })
        .where(eq(prizeDrawingEntries.id, parseInt(entryId)));
      
      return res.json({
        success: true,
        message: 'Winner marked as notified'
      });
    } catch (error) {
      console.error('Error marking winner as notified:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  /**
   * List all entries for a specific pool (admin only)
   */
  app.get('/api/admin/prize-drawings/pools/:poolId/entries', isAdmin, async (req: Request, res: Response) => {
    try {
      const { poolId } = req.params;
      
      const entries = await db.query.prizeDrawingEntries.findMany({
        where: eq(prizeDrawingEntries.poolId, parseInt(poolId)),
        with: {
          user: true
        },
        orderBy: (prizeDrawingEntries, { desc }) => [desc(prizeDrawingEntries.entryDate)]
      });
      
      return res.json(entries.map(entry => ({
        id: entry.id,
        userId: entry.userId,
        username: entry.user.username,
        email: entry.user.email,
        entryDate: entry.entryDate,
        entryMethod: entry.entryMethod,
        isWinner: entry.isWinner,
        hasBeenNotified: entry.hasBeenNotified,
        drawingDate: entry.drawingDate
      })));
    } catch (error) {
      console.error('Error fetching pool entries:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
}