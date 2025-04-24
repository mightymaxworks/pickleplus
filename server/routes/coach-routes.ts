/**
 * PKL-278651-COACH-0001-CORE
 * S.A.G.E. (Skills Assessment & Growth Engine) Coaching Routes
 * 
 * @imports Import the sageEngine service for rule-based coaching
 * 
 * This file defines the API routes for the SAGE coaching feature.
 * It contains endpoints for creating and managing coaching sessions, training plans,
 * insights, and user progress tracking.
 * 
 * Routes now support a rule-based approach for generating coaching advice without
 * requiring external AI dependencies.
 * 
 * @framework Framework5.3
 * @version 2.0.0
 * @lastModified 2025-04-24
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { 
  getCoachingAdviceHandler, 
  getTrainingPlanHandler,
  analyzeMatchHandler
} from '../services/aiCoach';
import { storage } from '../storage';
import { Request, Response } from 'express';
import { DimensionCode, SessionType } from '@shared/schema/sage';
import { sageEngine } from '../services/sageEngine';

const router = Router();

// --------------- Legacy AI Coach Routes ---------------

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

// --------------- S.A.G.E. Routes ---------------

/**
 * @route   POST /api/coach/sage/sessions
 * @desc    Create a new coaching session
 * @access  Private
 */
router.post('/sage/sessions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await storage.createCoachingSession({
      ...req.body,
      userId
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error('[SAGE] Create session error:', error);
    return res.status(500).json({ error: 'Failed to create coaching session' });
  }
});

/**
 * @route   GET /api/coach/sage/sessions
 * @desc    Get all coaching sessions for the authenticated user
 * @access  Private
 */
router.get('/sage/sessions', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sessions = await storage.getCoachingSessionsByUserId(userId);
    return res.json(sessions);
  } catch (error) {
    console.error('[SAGE] Get sessions error:', error);
    return res.status(500).json({ error: 'Failed to retrieve coaching sessions' });
  }
});

/**
 * @route   GET /api/coach/sage/sessions/:id
 * @desc    Get a specific coaching session with its insights and plans
 * @access  Private
 */
router.get('/sage/sessions/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await storage.getCoachingSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get insights for this session
    const insights = await storage.getCoachingInsightsBySessionId(sessionId);
    
    return res.json({
      session,
      insights
    });
  } catch (error) {
    console.error('[SAGE] Get session details error:', error);
    return res.status(500).json({ error: 'Failed to retrieve coaching session details' });
  }
});

/**
 * @route   POST /api/coach/sage/sessions/:id/insights
 * @desc    Add a new insight to a coaching session
 * @access  Private
 */
router.post('/sage/sessions/:id/insights', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await storage.getCoachingSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const insight = await storage.createCoachingInsight({
      ...req.body,
      sessionId
    });

    return res.status(201).json(insight);
  } catch (error) {
    console.error('[SAGE] Create insight error:', error);
    return res.status(500).json({ error: 'Failed to create coaching insight' });
  }
});

/**
 * @route   POST /api/coach/sage/sessions/:id/training-plan
 * @desc    Create a training plan for a coaching session
 * @access  Private
 */
router.post('/sage/sessions/:id/training-plan', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await storage.getCoachingSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const plan = await storage.createTrainingPlan({
      ...req.body,
      sessionId
    });

    return res.status(201).json(plan);
  } catch (error) {
    console.error('[SAGE] Create training plan error:', error);
    return res.status(500).json({ error: 'Failed to create training plan' });
  }
});

/**
 * @route   GET /api/coach/sage/training-plans/:id
 * @desc    Get a specific training plan with its exercises
 * @access  Private
 */
router.get('/sage/training-plans/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const plan = await storage.getTrainingPlan(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }
    
    // Get the session to verify ownership
    const session = await storage.getCoachingSession(plan.sessionId);
    
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get exercises for this plan
    const exercises = await storage.getTrainingExercisesByPlanId(planId);
    
    return res.json({
      plan,
      exercises
    });
  } catch (error) {
    console.error('[SAGE] Get training plan details error:', error);
    return res.status(500).json({ error: 'Failed to retrieve training plan details' });
  }
});

/**
 * @route   POST /api/coach/sage/training-plans/:id/exercises
 * @desc    Add a new exercise to a training plan
 * @access  Private
 */
router.post('/sage/training-plans/:id/exercises', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const plan = await storage.getTrainingPlan(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }
    
    // Get the session to verify ownership
    const session = await storage.getCoachingSession(plan.sessionId);
    
    if (!session || session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const exercise = await storage.createTrainingExercise({
      ...req.body,
      planId
    });

    return res.status(201).json(exercise);
  } catch (error) {
    console.error('[SAGE] Create exercise error:', error);
    return res.status(500).json({ error: 'Failed to create exercise' });
  }
});

/**
 * @route   PATCH /api/coach/sage/exercises/:id/complete
 * @desc    Mark an exercise as complete or incomplete
 * @access  Private
 */
router.patch('/sage/exercises/:id/complete', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const exerciseId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { completed } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed status must be a boolean' });
    }

    const updatedExercise = await storage.markExerciseComplete(exerciseId, completed);
    
    // Log the progress
    await storage.logUserProgress({
      userId,
      sessionId: null,
      planId: updatedExercise.planId,
      exerciseId: updatedExercise.id,
      progressType: completed ? 'EXERCISE_COMPLETED' : 'EXERCISE_UNCOMPLETED',
      notes: `Exercise ${completed ? 'completed' : 'marked as incomplete'}: ${updatedExercise.title}`,
      dimensionCode: updatedExercise.dimensionCode as DimensionCode
    });

    return res.json(updatedExercise);
  } catch (error) {
    console.error('[SAGE] Mark exercise complete error:', error);
    return res.status(500).json({ error: 'Failed to update exercise completion status' });
  }
});

/**
 * @route   GET /api/coach/sage/content
 * @desc    Get coaching content from the library based on filters
 * @access  Private
 */
router.get('/sage/content', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { contentType, dimensionCode, skillLevel, tags, limit } = req.query;
    
    const content = await storage.getCoachingContent({
      contentType: contentType as string,
      dimensionCode: dimensionCode as DimensionCode,
      skillLevel: skillLevel as string,
      tags: tags ? (tags as string).split(',') : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });
    
    return res.json(content);
  } catch (error) {
    console.error('[SAGE] Get coaching content error:', error);
    return res.status(500).json({ error: 'Failed to retrieve coaching content' });
  }
});

// --------------- SAGE Rule-Based Engine Routes ---------------

/**
 * @route   POST /api/coach/sage/generate-session
 * @desc    Generate a coaching session with insights using the rule-based engine
 * @access  Private
 */
router.post('/sage/generate-session', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sessionType, dimensionFocus } = req.body;
    
    // Generate the coaching session and insights using the SAGE engine
    const result = await sageEngine.generateCoachingSession(
      userId, 
      sessionType as SessionType,
      dimensionFocus as DimensionCode
    );
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('[SAGE] Generate session error:', error);
    return res.status(500).json({ error: 'Failed to generate coaching session' });
  }
});

/**
 * @route   POST /api/coach/sage/sessions/:id/generate-plan
 * @desc    Generate a training plan for a session using the rule-based engine
 * @access  Private
 */
router.post('/sage/sessions/:id/generate-plan', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await storage.getCoachingSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { durationDays } = req.body;
    
    // Generate the training plan and exercises using the SAGE engine
    const result = await sageEngine.generateTrainingPlan(
      sessionId,
      durationDays || 7
    );
    
    return res.status(201).json(result);
  } catch (error) {
    console.error('[SAGE] Generate training plan error:', error);
    return res.status(500).json({ error: 'Failed to generate training plan' });
  }
});

export default router;