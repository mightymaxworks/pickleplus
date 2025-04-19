/**
 * PKL-278651-XP-0003-PULSE
 * XP Pulse API Routes
 * 
 * These routes provide API endpoints for the PicklePulse™ activity multiplier system.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import express from 'express';
import { DatabaseStorage } from '../storage';
import ActivityMultiplierService from '../modules/xp/ActivityMultiplierService';
import XpEconomyMonitor from '../modules/xp/XpEconomyMonitor';
import { isAuthenticated, isAdmin } from '../middleware/auth';

export function registerXpPulseRoutes(
  app: express.Express,
  storage: DatabaseStorage
): void {
  const multiplierService = new ActivityMultiplierService(storage);
  const economyMonitor = new XpEconomyMonitor();
  
  // Initialize default multipliers on startup
  multiplierService.initializeDefaultMultipliers().catch(error => {
    console.error('[API] Error initializing default multipliers:', error);
  });
  
  // Endpoints for activity multipliers
  
  /**
   * GET /api/xp/multipliers
   * Gets all current activity multipliers
   * Admin only
   */
  app.get('/api/xp/multipliers', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const multipliers = await multiplierService.getAllMultipliers();
      res.json(multipliers);
    } catch (error) {
      console.error('[API] Error getting multipliers:', error);
      res.status(500).json({ message: 'Error retrieving multipliers' });
    }
  });
  
  /**
   * POST /api/xp/multipliers/recalibrate
   * Triggers a manual recalibration of multipliers
   * Admin only
   */
  app.post('/api/xp/multipliers/recalibrate', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await multiplierService.recalibrateMultipliers();
      res.json({ success: true, message: 'Multipliers recalibrated successfully' });
    } catch (error) {
      console.error('[API] Error recalibrating multipliers:', error);
      res.status(500).json({ message: 'Error recalibrating multipliers' });
    }
  });
  
  /**
   * GET /api/xp/economy/stats
   * Gets XP economy statistics
   * Admin only
   */
  app.get('/api/xp/economy/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const stats = await economyMonitor.getEconomyStats(days);
      res.json(stats);
    } catch (error) {
      console.error('[API] Error getting XP economy stats:', error);
      res.status(500).json({ message: 'Error retrieving XP economy statistics' });
    }
  });
  
  /**
   * GET /api/xp/economy/health
   * Gets XP economy health status
   * Admin only
   */
  app.get('/api/xp/economy/health', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const health = await economyMonitor.getEconomyHealthStatus();
      res.json(health);
    } catch (error) {
      console.error('[API] Error getting XP economy health:', error);
      res.status(500).json({ message: 'Error retrieving XP economy health status' });
    }
  });
  
  /**
   * GET /api/xp/economy/recalibrations
   * Gets recent multiplier recalibrations
   * Admin only
   */
  app.get('/api/xp/economy/recalibrations', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recalibrations = await economyMonitor.getRecentRecalibrations(limit);
      res.json(recalibrations);
    } catch (error) {
      console.error('[API] Error getting recalibrations:', error);
      res.status(500).json({ message: 'Error retrieving recalibrations' });
    }
  });
  
  // Public endpoints
  
  /**
   * GET /api/xp/multipliers/current
   * Gets active multipliers for the current user's activities
   * Authenticated users only
   */
  app.get('/api/xp/multipliers/current', isAuthenticated, async (req, res) => {
    try {
      // Get all multipliers but filter sensitive info for public endpoint
      const allMultipliers = await multiplierService.getAllMultipliers();
      
      // Only return specific fields that are relevant to users
      const publicMultipliers = allMultipliers.map(m => ({
        activityType: m.activityType,
        category: m.category,
        currentMultiplier: m.currentMultiplier,
        baseXpValue: m.baseXpValue
      }));
      
      res.json(publicMultipliers);
    } catch (error) {
      console.error('[API] Error getting current multipliers:', error);
      res.status(500).json({ message: 'Error retrieving current multipliers' });
    }
  });
  
  console.log('[API] XP Pulse routes registered');
}