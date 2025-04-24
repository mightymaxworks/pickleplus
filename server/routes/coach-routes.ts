/**
 * PKL-278651-COACH-0001-API
 * AI Coach API Routes
 * 
 * This file defines the API routes for the AI Coach feature.
 * It contains endpoints for getting coaching advice, generating training plans,
 * and analyzing matches.
 * 
 * Routes now support graceful fallback to a simplified experience when not authenticated.
 * 
 * @framework Framework5.3
 * @version 1.0.1
 * @lastModified 2025-04-24
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { 
  getCoachingAdviceHandler, 
  getTrainingPlanHandler,
  analyzeMatchHandler
} from '../services/aiCoach';

const router = Router();

/**
 * @route   GET /api/coach/advice
 * @desc    Get personalized coaching advice
 * @access  Private
 * @note    The frontend handles authentication errors by showing default coaching advice
 */
router.get('/advice', isAuthenticated, getCoachingAdviceHandler);

/**
 * @route   POST /api/coach/training-plan
 * @desc    Generate a personalized training plan
 * @access  Private
 * @note    The frontend handles authentication errors by showing a default training plan
 */
router.post('/training-plan', isAuthenticated, getTrainingPlanHandler);

/**
 * @route   GET /api/coach/analyze-match/:matchId
 * @desc    Analyze a specific match
 * @access  Private
 * @note    The frontend handles authentication errors by showing sample match analysis
 */
router.get('/analyze-match/:matchId', isAuthenticated, analyzeMatchHandler);

export default router;