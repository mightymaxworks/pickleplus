import { Request, Response, Router } from 'express';
import { z } from 'zod';

/**
 * ULTRA-SIMPLE FRAMEWORK 5.3 IMPLEMENTATION
 * 
 * This file provides an extremely simple API implementation for the rating
 * system selection feature, following Framework 5.3 principles of simplicity.
 * 
 * Instead of complex state management, this uses a simple in-memory variable
 * that stores exactly what's needed without type constraints or overengineering.
 */

// Simple in-memory storage for development mode
let savedRatingData = {
  system: '',
  rating: 0
};

const router = Router();

/**
 * Get the current rating information
 * GET /api/simple-rating/get
 */
router.get('/get', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: savedRatingData
  });
});

/**
 * Save rating information
 * POST /api/simple-rating/save
 */
router.post('/save', (req: Request, res: Response) => {
  // Basic request validation
  const schema = z.object({
    system: z.string(),
    rating: z.union([z.number(), z.string().transform(val => parseFloat(val))])
  });

  try {
    // Parse and validate the request
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.log('[Simple Rating API] Validation error:', validationResult.error);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid data format'
      });
    }

    // Get the validated data
    const { system, rating } = validationResult.data;
    
    // Log the received data
    console.log(`[Simple Rating API] Saving rating data:`, { system, rating });
    
    // Save the data to our simple variable
    savedRatingData = {
      system,
      rating
    };
    
    // Return success with the saved data
    res.json({
      success: true,
      message: `Successfully saved rating information`,
      data: savedRatingData
    });
  } catch (error) {
    console.error('[Simple Rating API] Error saving rating:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error saving rating information'
    });
  }
});

export default router;