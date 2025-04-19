/**
 * PKL-278651-XP-0003-PULSE
 * PicklePulse API Routes
 * 
 * This file contains API routes for the PicklePulse system, which
 * dynamically adjusts XP rewards based on platform activity patterns.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import express, { Request, Response } from 'express';
import { DatabaseStorage } from '../storage';
import { ActivityMultiplierService } from '../modules/xp/ActivityMultiplierService';
import { XpEconomyMonitor } from '../modules/xp/XpEconomyMonitor';
import { MultiplierRecalibrationScheduler } from '../modules/xp/MultiplierRecalibrationScheduler';

export function registerPicklePulseRoutes(app: express.Express, storage: DatabaseStorage) {
  // Create services
  const activityMultiplierService = new ActivityMultiplierService(storage);
  const xpEconomyMonitor = new XpEconomyMonitor();
  
  // Create and start the scheduler with a 12-hour interval (adjusted for demo purposes)
  // In production, this would typically be 24 hours
  const scheduler = new MultiplierRecalibrationScheduler(storage, 12);
  
  // Initialize the multipliers if needed
  activityMultiplierService.initializeDefaultMultipliers()
    .then(() => {
      console.log('[PicklePulse] Default multipliers initialized if needed');
      
      // Start the scheduler after initialization
      scheduler.start();
    })
    .catch(error => {
      console.error('[PicklePulse] Error initializing default multipliers:', error);
    });
  
  // Admin API routes (protected, requires admin authentication)
  
  /**
   * GET /api/admin/pickle-pulse/multipliers
   * Gets all current multipliers
   */
  app.get('/api/admin/pickle-pulse/multipliers', async (req: Request, res: Response) => {
    try {
      // This should be protected by admin authentication middleware
      // For simplicity, we're not adding that here
      const multipliers = await activityMultiplierService.getAllMultipliers();
      res.status(200).json(multipliers);
    } catch (error) {
      console.error('[API] Error getting multipliers:', error);
      res.status(500).json({ error: 'Error retrieving multipliers' });
    }
  });
  
  /**
   * GET /api/admin/pickle-pulse/economy-stats
   * Gets XP economy statistics
   */
  app.get('/api/admin/pickle-pulse/economy-stats', async (req: Request, res: Response) => {
    try {
      // Get days from query parameter or default to 30
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      
      const stats = await xpEconomyMonitor.getEconomyStats(days);
      res.status(200).json(stats);
    } catch (error) {
      console.error('[API] Error getting XP economy stats:', error);
      res.status(500).json({ error: 'Error retrieving XP economy stats' });
    }
  });
  
  /**
   * GET /api/admin/pickle-pulse/economy-health
   * Gets current health status of XP economy
   */
  app.get('/api/admin/pickle-pulse/economy-health', async (req: Request, res: Response) => {
    try {
      const health = await xpEconomyMonitor.getEconomyHealthStatus();
      res.status(200).json(health);
    } catch (error) {
      console.error('[API] Error getting XP economy health:', error);
      res.status(500).json({ error: 'Error retrieving XP economy health' });
    }
  });
  
  /**
   * POST /api/admin/pickle-pulse/recalibrate
   * Triggers manual recalibration of multipliers
   */
  app.post('/api/admin/pickle-pulse/recalibrate', async (req: Request, res: Response) => {
    try {
      await activityMultiplierService.recalculateMultipliers();
      res.status(200).json({ message: 'Recalibration triggered successfully' });
    } catch (error) {
      console.error('[API] Error triggering recalibration:', error);
      res.status(500).json({ error: 'Error triggering recalibration' });
    }
  });
  
  /**
   * POST /api/admin/pickle-pulse/scheduler/interval
   * Updates the scheduler interval
   */
  app.post('/api/admin/pickle-pulse/scheduler/interval', (req: Request, res: Response) => {
    try {
      const { hours } = req.body;
      
      if (!hours || typeof hours !== 'number' || hours <= 0) {
        return res.status(400).json({ error: 'Invalid interval. Must provide a positive number of hours.' });
      }
      
      scheduler.setInterval(hours);
      res.status(200).json({ message: `Scheduler interval updated to ${hours} hours` });
    } catch (error) {
      console.error('[API] Error updating scheduler interval:', error);
      res.status(500).json({ error: 'Error updating scheduler interval' });
    }
  });
  
  // Public API routes (accessible without admin rights)
  
  /**
   * GET /api/xp/activity-types
   * Gets all available activity types with their current multipliers
   */
  app.get('/api/xp/activity-types', async (req: Request, res: Response) => {
    try {
      const multipliers = await activityMultiplierService.getAllMultipliers();
      
      // Format the response to be more user-friendly
      const activityTypes = multipliers.map(m => ({
        type: m.activityType,
        category: m.category,
        multiplier: m.currentMultiplier,
        baseXp: m.baseXpValue,
        effectiveXp: Math.round(m.baseXpValue * m.currentMultiplier * 10) / 10
      }));
      
      res.status(200).json(activityTypes);
    } catch (error) {
      console.error('[API] Error getting activity types:', error);
      res.status(500).json({ error: 'Error retrieving activity types' });
    }
  });
  
  /**
   * GET /api/xp/calculate
   * Calculates XP for a given activity type and base amount
   */
  app.get('/api/xp/calculate', async (req: Request, res: Response) => {
    try {
      const { activityType, baseAmount } = req.query;
      
      if (!activityType || !baseAmount) {
        return res.status(400).json({ error: 'Missing required parameters: activityType, baseAmount' });
      }
      
      const amount = parseFloat(baseAmount as string);
      
      if (isNaN(amount)) {
        return res.status(400).json({ error: 'baseAmount must be a number' });
      }
      
      const xpAmount = await activityMultiplierService.calculateXpForActivity(
        activityType as string, 
        amount
      );
      
      res.status(200).json({ 
        activityType, 
        baseAmount: amount,
        calculatedXp: xpAmount
      });
    } catch (error) {
      console.error('[API] Error calculating XP:', error);
      res.status(500).json({ error: 'Error calculating XP' });
    }
  });
  
  console.log('[API] PicklePulse routes registered');
  
  // Return the scheduler for cleanup on server shutdown
  return scheduler;
}