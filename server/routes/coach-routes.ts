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
      // PKL-278651-AUTH-0017-DEBUG - Development test mode support for SAGE
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Returning development test data for coaching sessions');
        return res.json([
          {
            id: 1,
            userId: 1,
            title: 'Technical Skills Focus',
            description: 'A coaching session focused on improving your technical skills.',
            sessionType: 'GENERAL',
            dimensionFocus: 'TECH',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            userId: 1,
            title: 'Mental Game Improvement',
            description: 'Strategies to strengthen your mental toughness on the court.',
            sessionType: 'GENERAL',
            dimensionFocus: 'MENT',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
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
      // PKL-278651-AUTH-0017-DEBUG - Development test mode support for SAGE session details
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Returning development test data for coaching session details');
        
        // Simulate different responses based on requested session ID
        const sessionId = parseInt(req.params.id);
        
        if (sessionId === 1) {
          return res.json({
            session: {
              id: 1,
              userId: 1,
              title: 'Technical Skills Focus',
              description: 'A coaching session focused on improving your technical skills.',
              sessionType: 'GENERAL',
              dimensionFocus: 'TECH',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            insights: [
              {
                id: 1,
                sessionId: 1,
                title: 'Dink Technique Improvement',
                content: 'Your dink technique could be improved by focusing on wrist stability and paddle angle control.',
                dimensionCode: 'TECH',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 2,
                sessionId: 1,
                title: 'Serve Consistency',
                content: 'Work on maintaining a consistent serve motion to improve your first serve percentage.',
                dimensionCode: 'TECH',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]
          });
        } else if (sessionId === 2) {
          return res.json({
            session: {
              id: 2,
              userId: 1,
              title: 'Mental Game Improvement',
              description: 'Strategies to strengthen your mental toughness on the court.',
              sessionType: 'GENERAL',
              dimensionFocus: 'MENT',
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              updatedAt: new Date(Date.now() - 86400000).toISOString()
            },
            insights: [
              {
                id: 3,
                sessionId: 2,
                title: 'Focus Under Pressure',
                content: 'Practice mindfulness techniques to maintain focus during critical points.',
                dimensionCode: 'MENT',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString()
              }
            ]
          });
        } else {
          return res.status(404).json({ error: 'Session not found' });
        }
      }
      
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

// --------------- SAGE Conversation UI Routes ---------------

/**
 * @route   GET /api/coach/sage/conversation
 * @desc    Get the user's active conversation with SAGE
 * @access  Private
 */
router.get('/sage/conversation', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      // PKL-278651-AUTH-0017-DEBUG - Development test mode support for SAGE conversation
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Returning development test data for SAGE conversation');
        
        // Return a simple conversation
        return res.json({
          sessionId: 999,
          topic: 'Technical Skills Improvement',
          dimensionFocus: 'TECH',
          startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          messages: [
            {
              id: 'system-welcome',
              type: 'system',
              content: 'Welcome to S.A.G.E. (Skills Assessment & Growth Engine), your personal pickleball coach. How can I help you improve your game today?',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'user-1',
              type: 'user',
              content: 'I want to improve my dinking technique',
              timestamp: new Date(Date.now() - 3540000).toISOString() // 59 minutes ago
            },
            {
              id: 'sage-1',
              type: 'sage',
              content: 'Your dinking technique is crucial for controlling the game. For better third shots and dinks, focus on paddle angle and keeping your wrist firm. Would you like me to create a training plan focused on your technical skills?',
              timestamp: new Date(Date.now() - 3530000).toISOString(), // 58.8 minutes ago
              metadata: {
                recommendationType: 'training',
                dimensionFocus: 'TECH'
              }
            }
          ]
        });
      }
      
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real implementation, we would fetch the user's active conversation
    // from the database. For this sprint, we'll use the development test data.
    const conversation = await storage.getActiveConversation(userId);
    return res.json(conversation);
  } catch (error) {
    console.error('[SAGE] Get conversation error:', error);
    return res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

/**
 * @route   POST /api/coach/sage/conversation
 * @desc    Send a message to SAGE and get a response
 * @access  Private
 */
router.post('/sage/conversation', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { message, conversationId } = req.body;
    
    if (!userId) {
      // PKL-278651-AUTH-0017-DEBUG - Development test mode support for SAGE conversation
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Returning development test data for SAGE conversation response');
        
        // Validate input
        if (!message || typeof message !== 'string') {
          return res.status(400).json({ error: 'Message is required' });
        }
        
        // Create new conversation or use existing
        const sessionId = conversationId || 999;
        const newUserMessageId = `user-${Date.now()}`;
        const newSageMessageId = `sage-${Date.now() + 1}`;
        
        // Create SAGE response based on user message
        const lowerMessage = message.toLowerCase();
        let sageResponse, dimensionFocus, recommendationType;
        
        if (lowerMessage.includes('dink') || lowerMessage.includes('third shot')) {
          sageResponse = 'Your dinking technique is crucial for controlling the game. For better third shots and dinks, focus on paddle angle and keeping your wrist firm. Would you like me to create a training plan focused on your technical skills?';
          dimensionFocus = 'TECH';
          recommendationType = 'training';
        } else if (lowerMessage.includes('strategy') || lowerMessage.includes('position')) {
          sageResponse = 'Court positioning and strategy are key tactical elements. I notice you might benefit from working on your tactical awareness. Remember to return to the middle after each shot and communicate clearly with your partner.';
          dimensionFocus = 'TACT';
          recommendationType = 'insight';
        } else if (lowerMessage.includes('nervous') || lowerMessage.includes('pressure')) {
          sageResponse = 'Mental toughness is often overlooked but critically important. When feeling pressure, use deep breathing and focus on one point at a time. Would you like to work on some mental exercises to improve performance under pressure?';
          dimensionFocus = 'MENT';
          recommendationType = 'training';
        } else if (lowerMessage.includes('tired') || lowerMessage.includes('stamina')) {
          sageResponse = 'Physical conditioning directly impacts your game, especially in long tournaments. I recommend incorporating more pickleball-specific movement drills to improve your on-court stamina.';
          dimensionFocus = 'PHYS';
          recommendationType = 'insight';
        } else if (lowerMessage.includes('training') || lowerMessage.includes('practice')) {
          sageResponse = 'Consistent practice leads to consistent play. I can create a structured training schedule to help you improve systematically. Would you like me to generate a weekly practice plan?';
          dimensionFocus = 'CONS';
          recommendationType = 'schedule';
        } else {
          sageResponse = 'I understand you want to improve your pickleball skills. To offer more specific guidance, could you tell me which aspect of your game you want to focus on? Technical skills, tactical awareness, physical fitness, mental toughness, or consistency?';
          dimensionFocus = null;
          recommendationType = null;
        }
        
        // Return new messages
        return res.json({
          sessionId,
          newMessages: [
            {
              id: newUserMessageId,
              type: 'user',
              content: message,
              timestamp: new Date().toISOString()
            },
            {
              id: newSageMessageId,
              type: 'sage',
              content: sageResponse,
              timestamp: new Date(Date.now() + 1000).toISOString(), // 1 second later
              metadata: recommendationType ? {
                recommendationType,
                dimensionFocus
              } : undefined
            }
          ]
        });
      }
      
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real implementation, we would process the message and generate a response
    // using the SAGE engine. For this sprint, we'll use the development test data.
    const result = await sageEngine.processConversationMessage(userId, message, conversationId);
    return res.json(result);
  } catch (error) {
    console.error('[SAGE] Process conversation message error:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * @route   POST /api/coach/sage/feedback
 * @desc    Record user feedback on a SAGE message
 * @access  Private
 */
router.post('/sage/feedback', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { messageId, feedbackType, conversationId } = req.body;
    
    if (!userId) {
      // PKL-278651-AUTH-0017-DEBUG - Development test mode support for SAGE feedback
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Returning development test data for SAGE feedback');
        
        // Validate input
        if (!messageId || typeof messageId !== 'string') {
          return res.status(400).json({ error: 'MessageId is required' });
        }
        
        if (!feedbackType || (feedbackType !== 'positive' && feedbackType !== 'negative')) {
          return res.status(400).json({ error: 'FeedbackType must be "positive" or "negative"' });
        }
        
        // Return dummy success response
        return res.json({
          messageId,
          feedbackType,
          success: true
        });
      }
      
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real implementation, we would record the feedback in the database
    // and use it to improve the SAGE engine. For this sprint, we'll use the development test data.
    const result = await storage.recordSageFeedback(userId, messageId, feedbackType, conversationId);
    return res.json(result);
  } catch (error) {
    console.error('[SAGE] Record feedback error:', error);
    return res.status(500).json({ error: 'Failed to record feedback' });
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
      // PKL-278651-AUTH-0017-DEBUG - Development test mode support for SAGE session generation
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Returning development test data for session generation');
        
        const { dimensionFocus } = req.body;
        
        // Create a new session with generated insights based on the dimension focus
        const sessionId = Math.floor(Math.random() * 1000) + 10; // Random ID that won't conflict with test data
        
        return res.status(201).json({
          session: {
            id: sessionId,
            userId: 1,
            title: `${dimensionFocus === 'TECH' ? 'Technical' : 
                    dimensionFocus === 'TACT' ? 'Tactical' : 
                    dimensionFocus === 'PHYS' ? 'Physical' : 
                    dimensionFocus === 'MENT' ? 'Mental' : 
                    dimensionFocus === 'CONS' ? 'Consistency' : 'General'} Focus Session`,
            description: `This session focuses on improving your ${
              dimensionFocus === 'TECH' ? 'technical skills and shot execution' : 
              dimensionFocus === 'TACT' ? 'tactical awareness and decision making' : 
              dimensionFocus === 'PHYS' ? 'physical conditioning and court movement' : 
              dimensionFocus === 'MENT' ? 'mental toughness and focus' : 
              dimensionFocus === 'CONS' ? 'consistency and error reduction' : 'pickleball skills'
            }.`,
            sessionType: 'GENERAL',
            dimensionFocus: dimensionFocus as DimensionCode || 'TECH',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          insights: [
            {
              id: sessionId * 10 + 1,
              sessionId: sessionId,
              title: dimensionFocus === 'TECH' ? 'Shot Selection Analysis' :
                     dimensionFocus === 'TACT' ? 'Court Positioning' :
                     dimensionFocus === 'PHYS' ? 'Endurance Assessment' :
                     dimensionFocus === 'MENT' ? 'Focus Under Pressure' :
                     dimensionFocus === 'CONS' ? 'Error Pattern Analysis' : 'General Skill Assessment',
              content: `Based on your recent play patterns, we've identified areas where your ${
                dimensionFocus === 'TECH' ? 'technical skills' : 
                dimensionFocus === 'TACT' ? 'tactical awareness' : 
                dimensionFocus === 'PHYS' ? 'physical fitness' : 
                dimensionFocus === 'MENT' ? 'mental game' : 
                dimensionFocus === 'CONS' ? 'consistency' : 'overall game'
              } can improve with focused practice.`,
              dimensionCode: dimensionFocus as DimensionCode || 'TECH',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: sessionId * 10 + 2,
              sessionId: sessionId,
              title: 'Development Path',
              content: 'The S.A.G.E. coaching system has mapped out a development path to help you progress in this area through structured training.',
              dimensionCode: dimensionFocus as DimensionCode || 'TECH',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        });
      }
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
      // PKL-278651-AUTH-0017-DEBUG - Development test mode support for training plan generation
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV MODE] Returning development test data for training plan generation');
        
        // Create a new training plan with exercises
        const planId = Math.floor(Math.random() * 1000) + 100; // Random ID that won't conflict with test data
        const { durationDays = 7 } = req.body;
        
        // Find the mock session to get its dimension focus
        let dimensionFocus = 'TECH';
        if (sessionId === 1) {
          dimensionFocus = 'TECH';
        } else if (sessionId === 2) {
          dimensionFocus = 'MENT';
        }
        
        const planTitle = dimensionFocus === 'TECH' ? 'Shot Improvement Plan' :
                         dimensionFocus === 'TACT' ? 'Strategic Development Plan' :
                         dimensionFocus === 'PHYS' ? 'Fitness Enhancement Plan' :
                         dimensionFocus === 'MENT' ? 'Mental Toughness Plan' :
                         dimensionFocus === 'CONS' ? 'Consistency Building Plan' : 'Skill Development Plan';
        
        // Create exercises for each day of the plan
        const exercises = [];
        for (let day = 1; day <= durationDays; day++) {
          // Create 2-3 exercises per day
          const exercisesPerDay = Math.floor(Math.random() * 2) + 2; // 2-3 exercises
          
          for (let i = 1; i <= exercisesPerDay; i++) {
            const exerciseId = planId * 100 + (day * 10) + i;
            
            // Create different types of exercises based on dimension focus
            let exerciseTitle, exerciseDescription, exerciseInstructions;
            
            if (dimensionFocus === 'TECH') {
              if (i === 1) {
                exerciseTitle = 'Dink Accuracy Drill';
                exerciseDescription = 'Improve your dinking accuracy with this targeted practice drill.';
                exerciseInstructions = 'Set up targets in the kitchen area. Practice dinking to hit each target 10 times in a row.';
              } else if (i === 2) {
                exerciseTitle = 'Third Shot Drop Practice';
                exerciseDescription = 'Focus on perfecting your third shot drop technique.';
                exerciseInstructions = 'With a partner, practice serving, return, and then executing a controlled third shot drop. Repeat 20 times.';
              } else {
                exerciseTitle = 'Volley Reaction Drill';
                exerciseDescription = 'Improve your volley reactions at the net.';
                exerciseInstructions = 'Stand at the kitchen line while a partner feeds balls to your forehand and backhand sides. Focus on quick paddle preparation.';
              }
            } else if (dimensionFocus === 'MENT') {
              if (i === 1) {
                exerciseTitle = 'Pressure Point Simulation';
                exerciseDescription = 'Simulate high-pressure points to build mental toughness.';
                exerciseInstructions = 'Play practice points where you start at 9-10 in a game to 11. Focus on staying calm and executing your shots.';
              } else if (i === 2) {
                exerciseTitle = 'Mindfulness Practice';
                exerciseDescription = 'Develop your ability to stay present during play.';
                exerciseInstructions = 'Before each point, take a deep breath and focus on your pre-point routine. Practice this for 15 minutes.';
              } else {
                exerciseTitle = 'Distraction Management';
                exerciseDescription = 'Improve your focus amid distractions.';
                exerciseInstructions = 'Have partners create noise or movement while you practice serving accurately to targets.';
              }
            } else {
              // Generic exercises for other dimensions
              exerciseTitle = `${dimensionFocus} Exercise ${i}`;
              exerciseDescription = `A focused exercise to improve your ${dimensionFocus} skills.`;
              exerciseInstructions = `Complete 3 sets of this training activity focusing on proper form and technique.`;
            }
            
            exercises.push({
              id: exerciseId,
              planId: planId,
              title: exerciseTitle,
              description: exerciseDescription,
              instructions: exerciseInstructions,
              durationMinutes: 15 + (Math.floor(Math.random() * 4) * 5), // 15, 20, 25, or 30 minutes
              dimensionCode: dimensionFocus,
              dayNumber: day,
              orderInDay: i,
              isCompleted: false,
              difficultyLevel: Math.random() > 0.5 ? 'INTERMEDIATE' : 'BEGINNER',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        }
        
        return res.status(201).json({
          plan: {
            id: planId,
            sessionId: sessionId,
            title: planTitle,
            description: `A ${durationDays}-day training plan focused on improving your ${dimensionFocus} skills with structured exercises.`,
            durationDays: durationDays,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false,
            completionPercentage: 0
          },
          exercises: exercises
        });
      }
      
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