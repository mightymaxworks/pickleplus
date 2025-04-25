/**
 * PKL-278651-SAGE-0009-DRILLS - Drill Management API Routes
 * 
 * This file defines the API endpoints for managing pickleball drills
 * including CRUD operations, recommendations, and feedback.
 */

import express, { Request, Response } from 'express';
import { drillsService } from '../services/drillsService';
import { 
  pickleballDrillValidationSchema, 
  insertDrillFeedbackSchema 
} from '@shared/schema/drills';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { validateWithSchema } from '../middleware/validation';

const router = express.Router();

/**
 * Get all drills with filtering, sorting, and pagination
 * GET /api/drills
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      category, skillLevel, focusArea, minDuration, maxDuration,
      participants, keyword, status, limit, offset
    } = req.query;
    
    const result = await drillsService.searchDrills({
      category: category as any,
      skillLevel: skillLevel as any,
      focusArea: focusArea as string,
      minDuration: minDuration ? parseInt(minDuration as string) : undefined,
      maxDuration: maxDuration ? parseInt(maxDuration as string) : undefined,
      participants: participants ? parseInt(participants as string) : undefined,
      keyword: keyword as string,
      status: status as any || 'active',
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : 0
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error getting drills:', error);
    res.status(500).json({ error: 'Failed to retrieve drills' });
  }
});

/**
 * Get a drill by ID
 * GET /api/drills/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const drill = await drillsService.getDrillById(id);
    
    if (!drill) {
      return res.status(404).json({ error: 'Drill not found' });
    }
    
    res.json(drill);
  } catch (error) {
    console.error(`Error getting drill ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve drill' });
  }
});

/**
 * Create a new drill (admin only)
 * POST /api/drills
 */
router.post('/', 
  isAuthenticated,
  isAdmin,
  validateWithSchema(pickleballDrillValidationSchema),
  async (req: Request, res: Response) => {
    try {
      const newDrill = await drillsService.createDrill({
        ...req.body,
        createdBy: req.user!.id,
        source: req.body.source || 'admin'
      });
      
      res.status(201).json(newDrill);
    } catch (error) {
      console.error('Error creating drill:', error);
      res.status(500).json({ error: 'Failed to create drill' });
    }
  }
);

/**
 * Update a drill (admin only)
 * PATCH /api/drills/:id
 */
router.patch('/:id',
  isAuthenticated,
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const drill = await drillsService.getDrillById(id);
      
      if (!drill) {
        return res.status(404).json({ error: 'Drill not found' });
      }
      
      const updatedDrill = await drillsService.updateDrill(id, {
        ...req.body,
        lastModifiedBy: req.user!.id
      });
      
      res.json(updatedDrill);
    } catch (error) {
      console.error(`Error updating drill ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update drill' });
    }
  }
);

/**
 * Archive a drill (admin only)
 * DELETE /api/drills/:id
 */
router.delete('/:id',
  isAuthenticated,
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const drill = await drillsService.getDrillById(id);
      
      if (!drill) {
        return res.status(404).json({ error: 'Drill not found' });
      }
      
      const success = await drillsService.archiveDrill(id);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: 'Failed to archive drill' });
      }
    } catch (error) {
      console.error(`Error archiving drill ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to archive drill' });
    }
  }
);

/**
 * Submit feedback for a drill
 * POST /api/drills/:id/feedback
 */
router.post('/:id/feedback',
  isAuthenticated,
  validateWithSchema(insertDrillFeedbackSchema),
  async (req: Request, res: Response) => {
    try {
      const drillId = parseInt(req.params.id);
      const drill = await drillsService.getDrillById(drillId);
      
      if (!drill) {
        return res.status(404).json({ error: 'Drill not found' });
      }
      
      const feedback = await drillsService.submitDrillFeedback({
        ...req.body,
        drillId,
        userId: req.user!.id
      });
      
      res.status(201).json(feedback);
    } catch (error) {
      console.error(`Error submitting feedback for drill ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  }
);

/**
 * Update recommendation status (viewed, saved, completed)
 * PATCH /api/drills/recommendations/:id
 */
router.patch('/recommendations/:id',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { viewed, saved, completed } = req.body;
      
      const updated = await drillsService.updateDrillRecommendationStatus(id, {
        viewed,
        saved,
        completed
      });
      
      if (!updated) {
        return res.status(404).json({ error: 'Recommendation not found' });
      }
      
      res.json(updated);
    } catch (error) {
      console.error(`Error updating recommendation ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update recommendation status' });
    }
  }
);

/**
 * Get recommended drills
 * POST /api/drills/recommend
 */
router.post('/recommend',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const {
        skillLevel,
        category,
        focusAreas,
        relatedRules,
        conversationId,
        limit
      } = req.body;
      
      const drills = await drillsService.recommendDrills({
        userId: req.user!.id,
        skillLevel,
        category,
        focusAreas,
        relatedRules,
        conversationId,
        limit
      });
      
      res.json(drills);
    } catch (error) {
      console.error('Error recommending drills:', error);
      res.status(500).json({ error: 'Failed to recommend drills' });
    }
  }
);

export default router;