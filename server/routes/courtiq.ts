/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * CourtIQ API Routes
 * 
 * This file implements the API routes for the CourtIQ system
 * including onboarding, rating conversion, and skill dimensions.
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { onboardingService, OnboardingStatus } from "../modules/onboarding/onboardingService";
import { ratingConverter, RATING_SYSTEMS } from "../modules/rating/ratingConverter";
import { isAuthenticated } from "../middleware/auth";

export const courtiqRouter = Router();

// Middleware to ensure user is authenticated
courtiqRouter.use(isAuthenticated);

/**
 * Get onboarding status
 * GET /api/courtiq/onboarding/status
 */
courtiqRouter.get('/onboarding/status', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const status = await onboardingService.getOnboardingStatus(userId);
    
    if (!status) {
      // Start onboarding if not already started
      const newStatus = await onboardingService.startOrResumeOnboarding(userId);
      return res.json(newStatus);
    }
    
    return res.json(status);
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

/**
 * Start or resume onboarding
 * POST /api/courtiq/onboarding/start
 */
courtiqRouter.post('/onboarding/start', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const status = await onboardingService.startOrResumeOnboarding(userId);
    return res.json(status);
  } catch (error) {
    console.error('Error starting onboarding:', error);
    return res.status(500).json({ error: 'Failed to start onboarding' });
  }
});

/**
 * Complete an onboarding step
 * POST /api/courtiq/onboarding/complete-step
 */
courtiqRouter.post('/onboarding/complete-step', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Validate request body
    const schema = z.object({
      step: z.string(),
      data: z.record(z.any()).optional()
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validationResult.error });
    }
    
    const { step, data = {} } = validationResult.data;
    
    const status = await onboardingService.completeStep(userId, step, data);
    return res.json(status);
  } catch (error) {
    console.error('Error completing onboarding step:', error);
    return res.status(500).json({ error: 'Failed to complete onboarding step' });
  }
});

/**
 * Select a rating system and provide initial rating
 * POST /api/courtiq/onboarding/select-rating
 */
courtiqRouter.post('/onboarding/select-rating', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Validate request body
    const schema = z.object({
      system: z.string(),
      rating: z.number()
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validationResult.error });
    }
    
    const { system, rating } = validationResult.data;
    
    const result = await onboardingService.selectRatingSystem(userId, system, rating);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error selecting rating system:', error);
    return res.status(500).json({ error: 'Failed to select rating system' });
  }
});

/**
 * Get supported rating systems
 * GET /api/courtiq/rating-systems
 */
courtiqRouter.get('/rating-systems', async (req: Request, res: Response) => {
  try {
    const systems = await ratingConverter.getSupportedSystems();
    return res.json(systems);
  } catch (error) {
    console.error('Error getting rating systems:', error);
    return res.status(500).json({ error: 'Failed to get rating systems' });
  }
});

/**
 * Convert a rating between systems
 * POST /api/courtiq/convert-rating
 */
courtiqRouter.post('/convert-rating', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const schema = z.object({
      fromSystem: z.string(),
      toSystem: z.string(),
      rating: z.number()
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validationResult.error });
    }
    
    const { fromSystem, toSystem, rating } = validationResult.data;
    
    const result = await ratingConverter.convertRating(fromSystem, toSystem, rating);
    return res.json(result);
  } catch (error) {
    console.error('Error converting rating:', error);
    return res.status(500).json({ error: 'Failed to convert rating' });
  }
});

/**
 * Get user's rating in a specific system
 * GET /api/courtiq/user-rating
 */
courtiqRouter.get('/user-rating', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const system = req.query.system as string;
    const format = req.query.format as string || 'singles';
    const division = req.query.division as string || '19+';
    
    if (!system) {
      return res.status(400).json({ error: 'System parameter is required' });
    }
    
    const result = await ratingConverter.convertUserRatingToSystem(
      userId,
      system,
      format,
      division
    );
    
    return res.json(result);
  } catch (error) {
    console.error('Error getting user rating:', error);
    return res.status(500).json({ error: 'Failed to get user rating' });
  }
});

/**
 * Initialize rating systems and conversion data
 * POST /api/courtiq/initialize-systems (admin only)
 */
courtiqRouter.post('/initialize-systems', async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Administrator access required' });
    }
    
    const systems = await ratingConverter.initializeRatingSystems();
    return res.json({ success: true, systems });
  } catch (error) {
    console.error('Error initializing rating systems:', error);
    return res.status(500).json({ error: 'Failed to initialize rating systems' });
  }
});