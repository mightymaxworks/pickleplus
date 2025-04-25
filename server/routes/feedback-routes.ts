/**
 * PKL-278651-SAGE-0010-FEEDBACK - Enhanced Feedback API Routes
 * 
 * This file defines the API routes for the comprehensive feedback system
 * that will drive continuous improvement of drills and training plans in SAGE.
 * 
 * Part of Sprint 5: Social Features & UI Polish
 */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import { 
  enhancedFeedbackValidationSchema,
  submissionContextSchema,
  FeedbackTypeEnum
} from '../../shared/schema/feedback';
import * as feedbackService from '../services/feedbackService';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Submit feedback for a drill, training plan, or other item
 * POST /api/feedback
 */
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = enhancedFeedbackValidationSchema.parse(req.body);
    
    // Set the user ID from the authenticated user
    validatedData.userId = req.user!.id;
    
    // Set created timestamp
    validatedData.createdAt = new Date();
    
    // Submit the feedback
    const feedback = await feedbackService.submitFeedback(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback data',
        errors: error.errors
      });
    }
    
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting feedback'
    });
  }
});

/**
 * Get feedback by ID
 * GET /api/feedback/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }
    
    const feedback = await feedbackService.getFeedbackById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving feedback'
    });
  }
});

/**
 * Get feedback for an item (drill, training plan, etc.)
 * GET /api/feedback/item/:type/:id
 */
router.get('/item/:type/:id', async (req: Request, res: Response) => {
  try {
    const itemType = req.params.type;
    const itemId = parseInt(req.params.id);
    
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    // Validate item type
    try {
      FeedbackTypeEnum.parse(itemType);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type'
      });
    }
    
    // Parse query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortDirection = (req.query.sortDirection as 'asc' | 'desc') || 'desc';
    
    const { data, total } = await feedbackService.getFeedbackForItem(
      itemType,
      itemId,
      { limit, offset, sortBy, sortDirection }
    );
    
    res.json({
      success: true,
      data,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error retrieving item feedback:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving item feedback'
    });
  }
});

/**
 * Get analytics for an item (drill, training plan, etc.)
 * GET /api/feedback/analytics/:type/:id
 */
router.get('/analytics/:type/:id', async (req: Request, res: Response) => {
  try {
    const itemType = req.params.type;
    const itemId = parseInt(req.params.id);
    
    if (isNaN(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    // Validate item type
    try {
      FeedbackTypeEnum.parse(itemType);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type'
      });
    }
    
    const analytics = await feedbackService.getItemAnalytics(itemType, itemId);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error retrieving item analytics:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving item analytics'
    });
  }
});

/**
 * Update feedback (admin only)
 * PUT /api/feedback/:id
 */
router.put('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }
    
    // Get existing feedback
    const existingFeedback = await feedbackService.getFeedbackById(id);
    
    if (!existingFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Update the feedback
    const updatedFeedback = await feedbackService.updateFeedback(id, {
      ...req.body,
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: updatedFeedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating feedback'
    });
  }
});

/**
 * Create an improvement plan (admin only)
 * POST /api/feedback/improvement-plan
 */
router.post('/improvement-plan', isAdmin, async (req: Request, res: Response) => {
  try {
    // Set the created by user from the authenticated admin
    const planData = {
      ...req.body,
      createdBy: req.user!.id,
      createdAt: new Date()
    };
    
    const plan = await feedbackService.createImprovementPlan(planData);
    
    res.status(201).json({
      success: true,
      message: 'Improvement plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error creating improvement plan:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the improvement plan'
    });
  }
});

/**
 * Implement changes from an improvement plan (admin only)
 * POST /api/feedback/implementation/:planId
 */
router.post('/implementation/:planId', isAdmin, async (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.planId);
    
    if (isNaN(planId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID'
      });
    }
    
    // Set the implemented by user from the authenticated admin
    const implementationData = {
      ...req.body,
      implementedBy: req.user!.id,
      implementedAt: new Date()
    };
    
    const implementation = await feedbackService.implementChanges(planId, implementationData);
    
    res.status(201).json({
      success: true,
      message: 'Changes implemented successfully',
      data: implementation
    });
  } catch (error) {
    console.error('Error implementing changes:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while implementing changes'
    });
  }
});

/**
 * Notify users about implemented changes (admin only)
 * POST /api/feedback/notify/:implementationId
 */
router.post('/notify/:implementationId', isAdmin, async (req: Request, res: Response) => {
  try {
    const implementationId = parseInt(req.params.implementationId);
    
    if (isNaN(implementationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid implementation ID'
      });
    }
    
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Notification message is required'
      });
    }
    
    await feedbackService.notifyUsers(implementationId, message);
    
    res.json({
      success: true,
      message: 'Users notified successfully'
    });
  } catch (error) {
    console.error('Error notifying users:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while notifying users'
    });
  }
});

export default router;