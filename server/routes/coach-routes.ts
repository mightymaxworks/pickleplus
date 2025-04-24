/**
 * PKL-278651-COACH-0001-API
 * AI Coach API Routes
 * 
 * This file defines the API routes for the AI Coach feature.
 * It contains endpoints for getting coaching advice, generating training plans,
 * and analyzing matches.
 * 
 * @framework Framework5.3
 * @version 1.0.0
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
 */
router.get('/advice', isAuthenticated, getCoachingAdviceHandler);

/**
 * @route   POST /api/coach/training-plan
 * @desc    Generate a personalized training plan
 * @access  Private
 */
router.post('/training-plan', isAuthenticated, getTrainingPlanHandler);

/**
 * @route   GET /api/coach/analyze-match/:matchId
 * @desc    Analyze a specific match
 * @access  Private
 */
router.get('/analyze-match/:matchId', isAuthenticated, analyzeMatchHandler);

export default router;