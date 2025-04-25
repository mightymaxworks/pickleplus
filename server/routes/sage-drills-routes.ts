/**
 * PKL-278651-SAGE-0009-DRILLS - SAGE Drills Integration Routes
 * 
 * This file defines the API endpoints for integrating SAGE with
 * pickleball drill recommendations.
 */

import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { sageDrillsIntegration } from '../services/sageDrillsIntegration';
import { drillsService } from '../services/drillsService';
import { findRulesForQuestion } from '../services/simple-pickleball-rules';
import { storage } from '../storage';
import { JournalEntry } from '@shared/schema/journal';

const router = express.Router();

/**
 * Get drill recommendations based on a query
 * POST /api/sage/drill-recommendations
 */
router.post('/drill-recommendations',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { query, playerLevel, conversationId } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }
      
      // Get user's journals if available
      let journals: JournalEntry[] = [];
      try {
        journals = await storage.getJournalEntriesForUser(req.user!.id, 5);
      } catch (err) {
        console.warn('Could not retrieve journals for drill recommendations:', err);
        // Continue without journals
      }
      
      // Find matching rules
      const matchingRules = findRulesForQuestion(query);
      
      // Get drill recommendations
      const recommendations = await sageDrillsIntegration.getRecommendationsForQuery(
        {
          query,
          playerLevel,
          journals,
          matchingRules
        },
        req.user!.id,
        conversationId
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error('Error getting drill recommendations:', error);
      res.status(500).json({ error: 'Failed to get drill recommendations' });
    }
  }
);

/**
 * Get detailed instructions for a drill
 * GET /api/sage/drills/:id/details
 */
router.get('/drills/:id/details',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const drill = await drillsService.getDrillById(id);
      
      if (!drill) {
        return res.status(404).json({ error: 'Drill not found' });
      }
      
      // Mark drill recommendation as viewed if recommendationId is provided
      const { recommendationId } = req.query;
      if (recommendationId) {
        await drillsService.updateDrillRecommendationStatus(
          parseInt(recommendationId as string),
          { viewed: true }
        );
      }
      
      const instructions = sageDrillsIntegration.getDetailedDrillInstructions(drill);
      
      res.json({ instructions, drill });
    } catch (error) {
      console.error(`Error getting drill details ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to get drill details' });
    }
  }
);

/**
 * Mark a drill recommendation as saved
 * POST /api/sage/drills/:id/save
 */
router.post('/drills/:id/save',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { recommendationId } = req.body;
      
      if (!recommendationId) {
        return res.status(400).json({ error: 'Recommendation ID is required' });
      }
      
      const updated = await drillsService.updateDrillRecommendationStatus(
        parseInt(recommendationId),
        { saved: true }
      );
      
      if (!updated) {
        return res.status(404).json({ error: 'Recommendation not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error saving drill ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to save drill' });
    }
  }
);

/**
 * Mark a drill recommendation as completed
 * POST /api/sage/drills/:id/complete
 */
router.post('/drills/:id/complete',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { recommendationId } = req.body;
      
      if (!recommendationId) {
        return res.status(400).json({ error: 'Recommendation ID is required' });
      }
      
      const updated = await drillsService.updateDrillRecommendationStatus(
        parseInt(recommendationId),
        { completed: true }
      );
      
      if (!updated) {
        return res.status(404).json({ error: 'Recommendation not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error completing drill ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to complete drill' });
    }
  }
);

export default router;