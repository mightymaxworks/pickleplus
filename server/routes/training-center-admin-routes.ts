/**
 * PKL-278651-TRAINING-CENTER-ADMIN-001 - Training Center Admin API Routes
 * API endpoints for training center administration dashboard
 */

import { Router } from 'express';
import { storage } from '../storage';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Apply admin authentication to all routes
router.use(requireAdmin);

/**
 * Get all training centers with stats
 */
router.get('/centers', async (req, res) => {
  try {
    const centers = await storage.getTrainingCentersWithStats();
    res.json({ success: true, data: centers });
  } catch (error) {
    console.error('Error fetching training centers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch training centers' });
  }
});

/**
 * Get all coaches with details
 */
router.get('/coaches', async (req, res) => {
  try {
    const coaches = await storage.getCoachesWithDetails();
    res.json({ success: true, data: coaches });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch coaches' });
  }
});

/**
 * Get all class sessions with enrollment
 */
router.get('/classes', async (req, res) => {
  try {
    const classes = await storage.getClassSessionsWithEnrollment();
    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('Error fetching class sessions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch class sessions' });
  }
});

/**
 * Update coach status
 */
router.patch('/coaches/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await storage.updateCoachStatus(parseInt(id), status);
    res.json({ success: true, message: 'Coach status updated successfully' });
  } catch (error) {
    console.error('Error updating coach status:', error);
    res.status(500).json({ success: false, error: 'Failed to update coach status' });
  }
});

/**
 * Update class session status
 */
router.patch('/classes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await storage.updateClassSessionStatus(parseInt(id), status);
    res.json({ success: true, message: 'Class session status updated successfully' });
  } catch (error) {
    console.error('Error updating class session status:', error);
    res.status(500).json({ success: false, error: 'Failed to update class session status' });
  }
});

/**
 * Create new training center
 */
router.post('/centers', async (req, res) => {
  try {
    const centerData = req.body;
    const newCenter = await storage.createTrainingCenter(centerData);
    res.json({ success: true, data: newCenter });
  } catch (error) {
    console.error('Error creating training center:', error);
    res.status(500).json({ success: false, error: 'Failed to create training center' });
  }
});

/**
 * Update training center
 */
router.patch('/centers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedCenter = await storage.updateTrainingCenter(parseInt(id), updateData);
    res.json({ success: true, data: updatedCenter });
  } catch (error) {
    console.error('Error updating training center:', error);
    res.status(500).json({ success: false, error: 'Failed to update training center' });
  }
});

export default router;