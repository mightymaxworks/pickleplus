import { Request, Response, Router } from 'express';
import { z } from 'zod';

/**
 * FRONTEND-DRIVEN FRAMEWORK 5.3 IMPLEMENTATION
 * 
 * This file provides an extremely simple API implementation for user data
 * following Framework 5.3 principles. The frontend completely controls the flow,
 * and the backend simply stores and retrieves data without any flow control logic.
 * 
 * This approach is ideal for UI-heavy applications where the interface is the 
 * primary driver of user experience.
 */

// Simple in-memory storage for development mode
// We'll store by userId to support multiple users
const userDataStore = new Map<number, any>();

// Initialize with default data for our test user
userDataStore.set(1, {
  // General user preferences
  preferences: {},
  
  // Onboarding and wizard state - managed by frontend
  wizardState: {
    currentStep: 'rating_selection',
    completedSteps: []
  },
  
  // Rating data
  ratingData: {
    system: '',
    rating: 0
  }
});

const router = Router();

/**
 * Get user data
 * GET /api/user-data/get
 */
router.get('/get', (req: Request, res: Response) => {
  // Get user ID (use test user ID 1 for development)
  const userId = req.user?.id || 1;
  
  // Get user data or initialize if not found
  const userData = userDataStore.get(userId) || {
    preferences: {},
    wizardState: { currentStep: 'rating_selection', completedSteps: [] },
    ratingData: { system: '', rating: 0 }
  };
  
  console.log(`[User Data API] Retrieved data for user ${userId}:`, userData);
  
  res.json({
    success: true,
    data: userData
  });
});

/**
 * Store any user data (generic storage endpoint)
 * POST /api/user-data/store
 */
router.post('/store', (req: Request, res: Response) => {
  // Basic request validation - we accept any data
  const schema = z.object({
    dataType: z.string(),
    data: z.any()
  });

  try {
    // Parse and validate the request
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.log('[User Data API] Validation error:', validationResult.error);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid data format'
      });
    }

    // Get the validated data
    const { dataType, data } = validationResult.data;
    
    // Get user ID (use test user ID 1 for development)
    const userId = req.user?.id || 1;
    
    // Get existing user data or initialize
    const userData = userDataStore.get(userId) || {
      preferences: {},
      wizardState: { currentStep: 'rating_selection', completedSteps: [] },
      ratingData: { system: '', rating: 0 }
    };
    
    // Log the received data
    console.log(`[User Data API] Storing ${dataType} data for user ${userId}:`, data);
    
    // Update the specific data type
    switch (dataType) {
      case 'ratingData':
        userData.ratingData = data;
        break;
      case 'wizardState':
        userData.wizardState = data;
        break;
      case 'preferences':
        userData.preferences = { ...userData.preferences, ...data };
        break;
      default:
        // For any other data type, store it directly
        userData[dataType] = data;
    }
    
    // Save the updated user data
    userDataStore.set(userId, userData);
    
    // Return success with the saved data
    res.json({
      success: true,
      message: `Successfully stored ${dataType} data`,
      data: userData
    });
  } catch (error) {
    console.error('[User Data API] Error storing data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error storing data'
    });
  }
});

export default router;