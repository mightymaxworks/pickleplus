/**
 * PKL-278651-PROF-0030-API - Partner Matching API Routes
 * 
 * This file contains API routes for partner matching functionality,
 * including preferences and partner search.
 * 
 * Part of Sprint 4 - Engagement & Discovery
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';

// Create router
const router = Router();

// Partner preferences schema validation
const partnerPreferencesSchema = z.object({
  skillMatchPreference: z.enum(['similar', 'stronger', 'any']),
  playstylePreference: z.enum(['complementary', 'similar', 'any']),
  positionPreference: z.enum(['right', 'left', 'both', 'any']),
  frequencyPreference: z.enum(['daily', 'several_times_week', 'weekly', 'biweekly', 'monthly', 'occasionally', 'any']),
  ageGroupPreference: z.enum(['similar', 'any']),
  prioritizedDimensions: z.array(
    z.enum(['TECH', 'TACT', 'PHYS', 'MENT', 'CONS'])
  ).min(0).max(5)
});

// Default preferences
const DEFAULT_PREFERENCES = {
  skillMatchPreference: 'similar',
  playstylePreference: 'complementary',
  positionPreference: 'any',
  frequencyPreference: 'any',
  ageGroupPreference: 'any',
  prioritizedDimensions: ['TECH', 'TACT']
};

/**
 * GET /api/partners/preferences
 * 
 * Get the current user's partner preferences
 */
router.get('/preferences', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get preferences from database
    const preferences = await storage.getPartnerPreferences(userId);
    
    if (!preferences) {
      // Return default preferences if none exist
      return res.json(DEFAULT_PREFERENCES);
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Error getting partner preferences:', error);
    res.status(500).json({ error: 'Failed to get partner preferences' });
  }
});

/**
 * POST /api/partners/preferences
 * 
 * Save/update the current user's partner preferences
 */
router.post('/preferences', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Validate request body
    const validationResult = partnerPreferencesSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid preferences format',
        details: validationResult.error.format()
      });
    }
    
    const preferences = validationResult.data;
    
    // Save to database
    await storage.savePartnerPreferences(userId, preferences);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving partner preferences:', error);
    res.status(500).json({ error: 'Failed to save partner preferences' });
  }
});

/**
 * GET /api/partners/potential-matches
 * 
 * Get list of potential partner matches for the current user
 */
router.get('/potential-matches', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Get potential matches
    const matches = await storage.getPotentialPartnerMatches(userId, limit);
    
    res.json(matches);
  } catch (error) {
    console.error('Error getting potential partner matches:', error);
    res.status(500).json({ error: 'Failed to get potential matches' });
  }
});

export default router;