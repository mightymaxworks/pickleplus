/**
 * PKL-278651-SAGE-0009-VIDEO - Drill Videos API Routes
 * 
 * This file defines the API routes for managing YouTube videos for drills
 * Part of Sprint 4: Enhanced Training Plans & Video Integration
 */

import express, { Request, Response } from 'express';
import { drillsService } from '../services/drillsService';
import { youtubeService } from '../services/youtubeService';
import { isAuthenticated, isAdmin } from '../middleware/auth-middleware';
import { z } from 'zod';

const router = express.Router();

// Schema for video URL validation
const videoUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
  isPrimary: z.boolean().optional().default(false)
});

// Schema for timestamps validation
const timestampsSchema = z.record(z.string(), z.number());

/**
 * Add a YouTube video to a drill
 * POST /api/drills/:id/videos
 * Requires authentication and admin privileges
 */
router.post('/:id/videos', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const drillId = parseInt(req.params.id);
    
    // Validate the request body
    const validation = videoUrlSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: validation.error.format()
      });
    }
    
    const { url, isPrimary } = validation.data;
    
    // Extract video ID and validate
    const videoId = youtubeService.extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    // Add the video to the drill
    const updatedDrill = await drillsService.addYoutubeVideoToDrill(drillId, url, isPrimary);
    
    res.status(200).json({
      success: true,
      drill: updatedDrill,
      videoId
    });
  } catch (error: any) {
    console.error('Error adding video to drill:', error);
    res.status(500).json({ 
      error: 'Failed to add video to drill',
      message: error.message || String(error)
    });
  }
});

/**
 * Update video timestamps for a drill
 * PUT /api/drills/:id/videos/timestamps
 * Requires authentication and admin privileges
 */
router.put('/:id/videos/timestamps', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const drillId = parseInt(req.params.id);
    
    // Validate the request body
    const validation = timestampsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid timestamps format',
        details: validation.error.format()
      });
    }
    
    // Update the timestamps
    const updatedDrill = await drillsService.updateVideoTimestamps(drillId, validation.data);
    
    if (!updatedDrill) {
      return res.status(404).json({ error: 'Drill not found' });
    }
    
    res.status(200).json({
      success: true,
      drill: updatedDrill
    });
  } catch (error: any) {
    console.error('Error updating video timestamps:', error);
    res.status(500).json({ 
      error: 'Failed to update video timestamps',
      message: error.message || String(error)
    });
  }
});

/**
 * Set a video as the primary video for a drill
 * PUT /api/drills/:id/videos/primary/:videoId
 * Requires authentication and admin privileges
 */
router.put('/:id/videos/primary/:videoId', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const drillId = parseInt(req.params.id);
    const videoId = req.params.videoId;
    
    // Set as primary video
    const updatedDrill = await drillsService.setPrimaryVideo(drillId, videoId);
    
    res.status(200).json({
      success: true,
      drill: updatedDrill
    });
  } catch (error: any) {
    console.error('Error setting primary video:', error);
    res.status(500).json({ 
      error: 'Failed to set primary video',
      message: error.message || String(error)
    });
  }
});

/**
 * Remove a video from a drill
 * DELETE /api/drills/:id/videos/:videoId
 * Requires authentication and admin privileges
 */
router.delete('/:id/videos/:videoId', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const drillId = parseInt(req.params.id);
    const videoId = req.params.videoId;
    
    // Remove the video
    const updatedDrill = await drillsService.removeVideoFromDrill(drillId, videoId);
    
    res.status(200).json({
      success: true,
      drill: updatedDrill
    });
  } catch (error: any) {
    console.error('Error removing video from drill:', error);
    res.status(500).json({ 
      error: 'Failed to remove video',
      message: error.message || String(error)
    });
  }
});

/**
 * Get video details for a drill
 * GET /api/drills/:id/videos
 * Public endpoint - no authentication required
 */
router.get('/:id/videos', async (req: Request, res: Response) => {
  try {
    const drillId = parseInt(req.params.id);
    
    // Get the drill
    const drill = await drillsService.getDrillById(drillId);
    
    if (!drill) {
      return res.status(404).json({ error: 'Drill not found' });
    }
    
    // Get video details
    const videoDetails = await drillsService.getDrillVideoDetails(drillId);
    
    if (!videoDetails) {
      return res.status(404).json({ error: 'No videos available for this drill' });
    }
    
    res.status(200).json({
      success: true,
      videoDetails,
      drill: {
        id: drill.id,
        name: drill.name,
        primaryVideoId: drill.primaryVideoId,
        youtubeVideoIds: drill.youtubeVideoIds,
        videoTimestamps: drill.videoTimestamps
      }
    });
  } catch (error: any) {
    console.error('Error getting drill video details:', error);
    res.status(500).json({ 
      error: 'Failed to get video details',
      message: error.message || String(error)
    });
  }
});

/**
 * Search drills with videos
 * GET /api/drills/with-videos
 * Public endpoint - no authentication required
 */
router.get('/with-videos', async (req: Request, res: Response) => {
  try {
    const { 
      category, skillLevel, keyword,
      limit = '20', offset = '0' 
    } = req.query;
    
    // Search drills with videos
    const result = await drillsService.searchDrillsWithVideos({
      category: category as any,
      skillLevel: skillLevel as any,
      keyword: keyword as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      status: 'active'
    });
    
    res.status(200).json({
      success: true,
      drills: result.drills,
      total: result.total
    });
  } catch (error: any) {
    console.error('Error searching drills with videos:', error);
    res.status(500).json({ 
      error: 'Failed to search drills with videos',
      message: error.message || String(error)
    });
  }
});

export default router;