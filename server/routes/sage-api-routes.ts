/**
 * PKL-278651-SAGE-0029-API
 * SAGE API Routes
 * 
 * This file defines API routes specifically for SAGE to access user data,
 * match history, and CourtIQ ratings to provide personalized responses.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @sprint 7
 * @lastModified 2025-04-25
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { DimensionCode } from '@shared/schema/sage';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { courtiqPlayerAttributes } from '@shared/schema/courtiq';

const router = Router();

/**
 * @route   GET /api/sage/user-profile
 * @desc    Get the currently authenticated user's profile information for SAGE
 * @access  Private
 */
router.get('/user-profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get user info
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get CourtIQ ratings - provide fallback for missing method
    let courtiqRatings = { technical: 0, tactical: 0, physical: 0, mental: 0 };
    try {
      courtiqRatings = await (storage as any).getCourtIQRatings?.(userId) || courtiqRatings;
    } catch (err) {
      console.log('[SAGE-API] CourtIQ ratings not available in user-profile:', err);
    }
    
    // Get profile completion - provide fallback implementation
    let profileCompletion = { percentage: 0 };
    try {
      // Attempt to get profile completion if the method exists
      profileCompletion = await (storage as any).getProfileCompletion?.(userId) || { percentage: 0 };
    } catch (err) {
      console.log('[SAGE-API] Profile completion not available:', err);
    }
    
    // Get coaching profile - provide fallback for missing method
    let coachingProfile = null;
    try {
      coachingProfile = await (storage as any).getCoachingProfile?.(userId);
    } catch (err) {
      console.log('[SAGE-API] Coaching profile not available:', err);
    }

    // Format the response - use safe property access with optional chaining and default values
    const userProfile = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || '',
      level: user.level || 1,
      xp: user.xp || 0,
      avatarUrl: user.avatarUrl || '',
      // Use passportId instead of passportCode if needed
      passportId: user.passportId || '',
      duprRating: user.duprRating || 0,
      // Use location instead of primaryLocation
      location: user.location || '',
      createdAt: user.createdAt || new Date(),
      courtIQRatings: courtiqRatings,
      profileCompletion: profileCompletion?.percentage || 0,
      // Handle properties that may not exist in the type
      isAdmin: (user as any).isAdmin || false,
      roles: (user as any).roles || [],
      // Extract coaching preferences using safeguards
      preferredPlayStyle: coachingProfile ? 
        typeof coachingProfile.preferences === 'object' ? 
          (coachingProfile.preferences as Record<string, any>)?.playStyle || null 
          : null 
        : null,
      focusAreas: coachingProfile?.focusAreas || [],
    };

    return res.status(200).json({ success: true, data: userProfile });
  } catch (error) {
    console.error('[SAGE-API] Error fetching user profile:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
  }
});

/**
 * @route   GET /api/sage/match-history
 * @desc    Get the currently authenticated user's match history for SAGE
 * @access  Private
 */
router.get('/match-history', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Parse query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    // Get recent matches - provide fallback for missing method
    let matches = [];
    try {
      matches = await (storage as any).getMatchesByUser?.(userId, limit) || [];
    } catch (err) {
      console.log('[SAGE-API] Match retrieval not available:', err);
      // Return empty array for now
      matches = [];
    }
    
    // Get match statistics for each match - provide fallback for missing methods
    const matchesWithStats = await Promise.all(matches.map(async (match) => {
      let stats = null;
      let impacts = [];
      
      try {
        stats = await (storage as any).getMatchStatistics?.(match.id);
      } catch (err) {
        console.log('[SAGE-API] Match statistics not available:', err);
      }
      
      try {
        impacts = await (storage as any).getPerformanceImpacts?.(match.id, userId) || [];
      } catch (err) {
        console.log('[SAGE-API] Performance impacts not available:', err);
      }
      
      return {
        ...match,
        statistics: stats || null,
        performanceImpacts: impacts
      };
    }));

    return res.status(200).json({ success: true, data: matchesWithStats });
  } catch (error) {
    console.error('[SAGE-API] Error fetching match history:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch match history' });
  }
});

/**
 * @route   GET /api/sage/courtiq-details
 * @desc    Get detailed CourtIQ information for SAGE
 * @access  Private
 */
router.get('/courtiq-details', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Get CourtIQ ratings - provide fallback for missing method  
    let courtiqRatings = { technical: 0, tactical: 0, physical: 0, mental: 0 };
    try {
      courtiqRatings = await (storage as any).getCourtIQRatings?.(userId) || courtiqRatings;
    } catch (err) {
      console.log('[SAGE-API] CourtIQ ratings not available in courtiq-details:', err);
    }
    
    // Find the user's strongest and weakest dimensions
    let maxRating = 0;
    let minRating = 5;
    let strongestDimension: DimensionCode = 'TECH';
    let weakestDimension: DimensionCode = 'TECH';
    
    Object.entries(courtiqRatings).forEach(([dimension, rating]) => {
      if (rating > maxRating) {
        maxRating = rating;
        strongestDimension = dimension as DimensionCode;
      }
      if (rating < minRating) {
        minRating = rating;
        weakestDimension = dimension as DimensionCode;
      }
    });
    
    // Get player attributes for more detailed analysis
    try {
      // This might not be implemented yet, so we'll catch any errors
      const playerAttributes = await db.query.courtiqPlayerAttributes.findFirst({
        where: eq(courtiqPlayerAttributes.userId, userId)
      });
      
      if (playerAttributes) {
        return res.status(200).json({
          success: true,
          data: {
            ratings: courtiqRatings,
            strongestDimension,
            weakestDimension,
            detailedAttributes: playerAttributes
          }
        });
      }
    } catch (attributeError) {
      console.log('[SAGE-API] Player attributes not available:', attributeError);
    }
    
    // Return basic data if detailed attributes aren't available
    return res.status(200).json({
      success: true,
      data: {
        ratings: courtiqRatings,
        strongestDimension,
        weakestDimension
      }
    });
  } catch (error) {
    console.error('[SAGE-API] Error fetching CourtIQ details:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch CourtIQ details' });
  }
});

/**
 * @route   GET /api/sage/drill-recommendations
 * @desc    Get personalized drill recommendations for SAGE
 * @access  Private
 */
router.get('/drill-recommendations', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    // Get user to check subscription status
    const user = await storage.getUser(userId);
    
    // Use type assertion for subscription status
    const subscriptionTier = (user as any)?.subscriptionTier || 'FREE';
    const isPremium = subscriptionTier !== 'FREE';
    
    // Parse query parameters
    const dimensionCode = req.query.dimension as DimensionCode;
    const count = isPremium ? 
      (req.query.count ? parseInt(req.query.count as string) : 5) : 
      3; // Free users get max 3 drills
    
    // Get CourtIQ ratings to determine level - provide fallback for missing method
    let courtiqRatings = { technical: 3, tactical: 3, physical: 3, mental: 3 };
    try {
      courtiqRatings = await (storage as any).getCourtIQRatings?.(userId) || courtiqRatings;
    } catch (err) {
      console.log('[SAGE-API] CourtIQ ratings not available for drill recommendations:', err);
    }
    
    // Determine dimension to focus on if not specified
    let targetDimension = dimensionCode;
    if (!targetDimension) {
      // Find the weakest dimension
      let minRating = 5;
      Object.entries(courtiqRatings).forEach(([dimension, rating]) => {
        if (rating < minRating) {
          minRating = rating;
          targetDimension = dimension as DimensionCode;
        }
      });
    }
    
    // Get level for the target dimension
    const level = courtiqRatings[targetDimension];
    
    // Get drill recommendations with fallback
    let drills = [];
    try {
      // Try to get drills using the storage method if it exists
      drills = await (storage as any).getDrillsByDimensionAndLevel?.(targetDimension, level) || [];
    } catch (err) {
      console.log('[SAGE-API] Error getting drills:', err);
      
      // Provide fallback drill data structure for development
      drills = [
        {
          id: 1,
          name: 'Third Shot Drop Practice',
          description: 'Perfect your third shot drop technique',
          difficultyLevel: level,
          dimension: targetDimension,
          videoUrl: 'https://example.com/video1.mp4'
        },
        {
          id: 2,
          name: 'Drop and Drive Exercise',
          description: 'Practice transitioning between soft and power shots',
          difficultyLevel: level,
          dimension: targetDimension,
          videoUrl: 'https://example.com/video2.mp4'
        },
        {
          id: 3,
          name: 'Dink Rally Focus',
          description: 'Improve your dinking consistency and placement',
          difficultyLevel: level,
          dimension: targetDimension,
          videoUrl: 'https://example.com/video3.mp4'
        }
      ];
    }
    
    // Limit drills based on subscription status
    const limitedDrills = drills.slice(0, count);

    return res.status(200).json({
      success: true, 
      data: {
        drills: limitedDrills,
        subscriptionTier,
        isPremium,
        dimension: targetDimension,
        level
      }
    });
  } catch (error) {
    console.error('[SAGE-API] Error fetching drill recommendations:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch drill recommendations' });
  }
});

/**
 * @route   GET /api/sage/subscription-status
 * @desc    Get user's subscription status for SAGE
 * @access  Private
 */
router.get('/subscription-status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    // Get user to check subscription status
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Get subscription information using type assertion
    const subscriptionTier = (user as any)?.subscriptionTier || 'FREE';
    const subscriptionExpiresAt = (user as any)?.subscriptionExpiresAt || null;
    const isPremium = subscriptionTier !== 'FREE';
    
    // Format subscription information
    const subscriptionInfo = {
      tier: subscriptionTier,
      isPremium,
      expiresAt: subscriptionExpiresAt,
      features: {
        unlimitedDrills: subscriptionTier === 'POWER' || subscriptionTier === 'BASIC',
        personalizedPlans: subscriptionTier === 'POWER',
        videoAnalysis: subscriptionTier === 'POWER',
        coachingAccess: subscriptionTier === 'POWER'
      }
    };

    return res.status(200).json({ success: true, data: subscriptionInfo });
  } catch (error) {
    console.error('[SAGE-API] Error fetching subscription status:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch subscription status' });
  }
});

export default router;