/**
 * PKL-278651-SAGE-0013-CONCIERGE
 * SAGE Concierge API Routes
 * 
 * API endpoints for the SAGE Concierge feature that provides platform
 * navigation and recommendations.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../middleware/auth';
import { SageNavigationService } from '../services/sageNavigationService';
import { SageRecommendationEngine } from '../services/sageRecommendationEngine';
import { storage } from '../storage';
import {
  platformFeatures,
  searchFeatures,
  getFeatureById
} from '../services/sageKnowledgeBase';
import { 
  NavigationAction, 
  navigationRequestSchema,
  trackingDataSchema,
  insertConciergeInteractionSchema
} from '@shared/types/sage-concierge';

const router = express.Router();
const navigationService = new SageNavigationService();
const recommendationEngine = new SageRecommendationEngine();

/**
 * Get all platform features for the knowledge base
 * GET /api/coach/sage/concierge/features
 */
router.get('/features', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Return the complete knowledge base of platform features
    res.status(200).json(platformFeatures);
  } catch (error) {
    console.error('Error getting platform features:', error);
    res.status(500).json({ error: 'Failed to retrieve platform features' });
  }
});

/**
 * Search platform features by search terms
 * GET /api/coach/sage/concierge/search?q=searchTerm
 */
router.get('/search', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    
    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({ error: 'Search term must be at least 2 characters' });
    }
    
    // Search for features matching the query
    const results = searchFeatures(searchTerm);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching platform features:', error);
    res.status(500).json({ error: 'Failed to search platform features' });
  }
});

/**
 * Get feature details by ID
 * GET /api/coach/sage/concierge/feature/:id
 */
router.get('/feature/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const featureId = req.params.id;
    
    // Get feature by ID
    const feature = getFeatureById(featureId);
    
    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    
    res.status(200).json(feature);
  } catch (error) {
    console.error('Error getting feature details:', error);
    res.status(500).json({ error: 'Failed to retrieve feature details' });
  }
});

/**
 * Process concierge navigation request
 * POST /api/coach/sage/concierge/navigate
 */
router.post('/navigate', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = navigationRequestSchema.parse(req.body);
    
    // Get user from request
    const user = req.user!;
    
    // Process navigation intent
    const action: NavigationAction = await navigationService.resolveNavigationIntent(
      validatedData.message, 
      user
    );
    
    // Return navigation action
    res.status(200).json({ action });
  } catch (error) {
    console.error('Error processing navigation request:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to process navigation request' });
  }
});

/**
 * Track user interaction with navigation features
 * POST /api/coach/sage/concierge/track
 */
router.post('/track', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = trackingDataSchema.parse(req.body);
    
    // Get user from request
    const user = req.user!;
    
    // Create interaction data for storage
    const interactionData = {
      userId: user.id,
      messageContent: validatedData.messageContent,
      navigationType: validatedData.navigationType,
      navigationTarget: validatedData.navigationTarget,
      dimension: validatedData.dimension,
      isCompleted: validatedData.isCompleted
    };
    
    // Store interaction data
    // Note: This will be implemented in storage in a future task
    console.log('Tracking interaction:', interactionData);
    
    // For now, just return success
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid tracking data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

/**
 * Get personalized recommendations
 * GET /api/coach/sage/concierge/recommendations?type=all
 */
router.get('/recommendations', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const recommendationType = (req.query.type as string) || 'all';
    
    // Get user from request
    const user = req.user!;
    
    // Get recommendations based on type
    const recommendations = await recommendationEngine.getRecommendations(
      user.id,
      recommendationType as 'all' | 'drill' | 'tournament' | 'match' | 'community' | 'training_plan'
    );
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to retrieve recommendations' });
  }
});

export default router;