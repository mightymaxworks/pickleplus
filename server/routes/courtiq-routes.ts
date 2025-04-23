/**
 * PKL-278651-CRTIQ-0009-FWK52 - CourtIQ Routes
 * PKL-278651-COURTIQ-0001-GLOBAL - Global Rating System Integration
 * 
 * Routes implementation for the CourtIQ performance system
 * Following Framework 5.3 principles for extension over replacement
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { isAuthenticated } from "../auth";
import { onboardingService } from "../modules/onboarding/onboardingService";
import { ratingConverter, RATING_SYSTEMS } from "../modules/rating/ratingConverter";

/**
 * Rating system interface for better type safety
 */
interface MockRatingSystem {
  id: number;
  code: string;
  name: string;
  minRating: number;
  maxRating: number;
  decimals: number;
  description: string;
  websiteUrl?: string;
  isActive: boolean;
}

/**
 * Mock rating systems data for development mode
 */
const MOCK_RATING_SYSTEMS: MockRatingSystem[] = [
  {
    id: 1,
    code: 'COURTIQ',
    name: 'CourtIQ Rating',
    minRating: 1000,
    maxRating: 2500,
    decimals: 0,
    description: 'Pickle+ internal rating system (1000-2500)',
    isActive: true
  },
  {
    id: 2,
    code: 'DUPR',
    name: 'Dynamic Universal Pickleball Rating',
    minRating: 2.0,
    maxRating: 7.0,
    decimals: 2,
    description: 'DUPR rating system (2.0-7.0)',
    websiteUrl: 'https://mydupr.com',
    isActive: true
  },
  {
    id: 3,
    code: 'IFP',
    name: 'International Federation of Pickleball',
    minRating: 1.0,
    maxRating: 5.0,
    decimals: 1,
    description: 'IFP rating system (1.0-5.0)',
    websiteUrl: 'https://ifpickleball.org',
    isActive: true
  },
  {
    id: 4,
    code: 'UTPR',
    name: 'USA Pickleball Tournament Player Rating',
    minRating: 2.5,
    maxRating: 6.0,
    decimals: 1,
    description: 'UTPR rating system (2.5-6.0)',
    websiteUrl: 'https://usapickleball.org',
    isActive: true
  },
  {
    id: 5,
    code: 'WPR',
    name: 'World Pickleball Rating',
    minRating: 0.0,
    maxRating: 10.0,
    decimals: 1,
    description: 'WPR rating system (0-10.0)',
    isActive: true
  },
  {
    id: 6,
    code: 'IPTPA',
    name: 'International Pickleball Teaching Professional Association',
    minRating: 1.0,
    maxRating: 5.0,
    decimals: 1,
    description: 'IPTPA rating system (1.0-5.0)',
    websiteUrl: 'https://iptpa.com',
    isActive: true
  }
];

/**
 * SIMPLIFIED APPROACH: Framework 5.3
 * Create a single shared state object for development
 * This is the simplest approach to ensure data is preserved between API calls
 */
const DEV_STATE = {
  // Onboarding status with all possible fields - centralized to one location
  onboarding: {
    userId: 1,
    started: true,
    completed: false,
    completedAt: null,
    progress: {
      profileCompleted: true,
      ratingSystemSelected: false,
      ratingProvided: false,
      experienceSummaryCompleted: false,
      playStyleAssessed: false
    },
    progress_pct: 20,
    preferences: {
      preferredRatingSystem: null,
      initialRating: null,
      experienceYears: null,
      playStyle: null,
      skillFocus: [] as string[]
    },
    nextStep: 'rating_selection',
    xpEarned: 0
  }
};

/**
 * Development-friendly authentication middleware
 * This uses the same development test user as /api/auth/current-user
 */
function devAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // For authenticated requests, continue with the request
  if (req.isAuthenticated()) {
    return next();
  }
  
  // In development mode, use a test user
  if (process.env.NODE_ENV !== 'production') {
    console.log('[CourtIQ API] Using development test user for:', req.path);
    
    // Create a dev user with the minimum required fields
    // This is a cast to any to avoid type errors with the User interface
    req.user = {
      id: 1,
      username: 'testdev',
      email: 'dev@pickle.plus',
      isAdmin: true,
    } as any;
    
    return next();
  }
  
  // For production, return standard 401 Unauthorized
  return res.status(401).json({ message: "Not authenticated" });
}

const router = Router();

/**
 * CourtIQ Performance endpoint
 * GET /api/courtiq/performance
 */
router.get("/performance", (req: Request, res: Response) => {
  console.log("[API][CRITICAL][CourtIQ] Direct handler called, query:", req.query);
  
  try {
    // Parse query parameters with defaults
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 
                   (req.user ? req.user.id : 1);
    const format = req.query.format as string || 'singles';
    const division = req.query.division as string || 'open';
    
    // For users with insufficient data, return guidance message
    if (userId === 1) {
      return res.json({
        status: "insufficient_data",
        message: "Need more match data to generate performance metrics",
        requiredMatches: 5,
        currentMatches: 2,
        guidance: {
          title: "Complete more matches",
          description: "Play and record at least 3 more matches to see your performance metrics",
          primaryAction: "Record a match",
          primaryActionPath: "/matches/record"
        }
      });
    }
    
    // Create a realistic rating value based on userId (for consistency)
    const baseRating = 1750 + (userId * 17) % 500;
    
    // Create skill ratings with some minor variation based on userId
    const powerBase = 65 + (userId * 3) % 30;
    const speedBase = 70 + (userId * 5) % 25;
    const precisionBase = 75 + (userId * 7) % 20;
    const strategyBase = 60 + (userId * 11) % 35;
    const controlBase = 80 + (userId * 13) % 15;
    const consistencyBase = 68 + (userId * 17) % 27;
    
    // Determine tier based on rating
    let tierName = "Bronze";
    let tierColorCode = "#CD7F32";
    
    if (baseRating >= 2000) {
      tierName = "Diamond";
      tierColorCode = "#B9F2FF";
    } else if (baseRating >= 1900) {
      tierName = "Platinum";
      tierColorCode = "#E5E4E2";
    } else if (baseRating >= 1800) {
      tierName = "Gold";
      tierColorCode = "#FFD700";
    } else if (baseRating >= 1700) {
      tierName = "Silver";
      tierColorCode = "#C0C0C0";
    }
    
    const performanceData = {
      userId: userId,
      format: format,
      division: division,
      overallRating: baseRating,
      tierName: tierName,
      tierColorCode: tierColorCode,
      dimensions: {
        technique: {
          score: Math.floor((powerBase + speedBase + precisionBase) / 3),
          components: {
            power: powerBase,
            speed: speedBase,
            precision: precisionBase
          }
        },
        strategy: {
          score: strategyBase,
          components: {
            positioning: strategyBase - 5,
            shotSelection: strategyBase + 3,
            adaptability: strategyBase - 2
          }
        },
        consistency: {
          score: consistencyBase,
          components: {
            errorRate: consistencyBase - 4,
            repeatability: consistencyBase + 5,
            pressure: consistencyBase - 1
          }
        },
        focus: {
          score: controlBase,
          components: {
            mentalStamina: controlBase - 7,
            concentration: controlBase + 4,
            resilience: controlBase + 2
          }
        }
      },
      recentTrends: {
        change: 15,
        direction: 'up',
        matches: 8
      },
      // Add skills property for compatibility with hook interface
      skills: {
        power: powerBase,
        speed: speedBase,
        precision: precisionBase,
        strategy: strategyBase,
        control: controlBase,
        consistency: consistencyBase
      },
      strongestArea: "consistency",
      weakestArea: "strategy",
      percentile: 65,
      strongestSkill: "consistency",
      improvementAreas: ["strategy", "focus"],
      matchesAnalyzed: 15,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(performanceData);
  } catch (error) {
    console.error("[API] Error getting CourtIQ performance:", error);
    res.status(500).json({ error: "Server error getting performance metrics" });
  }
});

/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * Get onboarding status
 * GET /api/courtiq/onboarding/status
 */
router.get('/onboarding/status', devAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Special handling for development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CourtIQ API] Using DEV_STATE for onboarding status');
      // Return the centralized state
      return res.json(DEV_STATE.onboarding);
    }
    
    // Normal flow for production
    const status = await onboardingService.getOnboardingStatus(userId);
    
    if (!status) {
      // Start onboarding if not already started
      const newStatus = await onboardingService.startOrResumeOnboarding(userId);
      return res.json(newStatus);
    }
    
    return res.json(status);
  } catch (error) {
    console.error('[API] Error getting onboarding status:', error);
    return res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

/**
 * Start or resume onboarding
 * POST /api/courtiq/onboarding/start
 */
router.post('/onboarding/start', devAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Special handling for development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CourtIQ API] Using DEV_STATE for onboarding status');
      
      // Ensure the started flag is set to true
      DEV_STATE.onboarding.started = true;
      
      return res.json(DEV_STATE.onboarding);
    }
    
    // Normal flow for production
    const status = await onboardingService.startOrResumeOnboarding(userId);
    return res.json(status);
  } catch (error) {
    console.error('[API] Error starting onboarding:', error);
    return res.status(500).json({ error: 'Failed to start onboarding' });
  }
});

/**
 * Complete an onboarding step
 * POST /api/courtiq/onboarding/complete-step
 */
router.post('/onboarding/complete-step', devAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Validate request body
    const schema = z.object({
      step: z.string(),
      data: z.record(z.any()).optional()
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validationResult.error });
    }
    
    const { step, data = {} } = validationResult.data;
    
    // Special handling for development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CourtIQ API] Using DEV_STATE for step completion in development');
      console.log('[CourtIQ API] Processing step completion:', step, 'with data:', data);
      
      if (step === 'profile_completion') {
        DEV_STATE.onboarding.progress.profileCompleted = true;
        DEV_STATE.onboarding.progress_pct = 20;
        DEV_STATE.onboarding.nextStep = 'rating_selection';
        DEV_STATE.onboarding.xpEarned = 50;
      } else if (step === 'rating_selection') {
        DEV_STATE.onboarding.progress.ratingSystemSelected = true;
        DEV_STATE.onboarding.progress.ratingProvided = true;
        DEV_STATE.onboarding.progress_pct = 40;
        DEV_STATE.onboarding.nextStep = 'experience_summary';
        DEV_STATE.onboarding.xpEarned = 100;
        
        // This is the critical part - we need to preserve rating data
        console.log('[CourtIQ API] Rating step - data before update:', DEV_STATE.onboarding.preferences);
        
        // Check if rating data was passed via /api/courtiq/rating/set-preferred
        // If not, use data from the request
        if (DEV_STATE.onboarding.preferences.preferredRatingSystem === null && data.system) {
          DEV_STATE.onboarding.preferences.preferredRatingSystem = data.system;
        }
        
        if (DEV_STATE.onboarding.preferences.initialRating === null && data.rating) {
          DEV_STATE.onboarding.preferences.initialRating = data.rating;
        }
        
        console.log('[CourtIQ API] Rating step - data after update:', DEV_STATE.onboarding.preferences);
      } else if (step === 'experience_summary') {
        DEV_STATE.onboarding.progress.experienceSummaryCompleted = true;
        DEV_STATE.onboarding.progress_pct = 70;
        DEV_STATE.onboarding.nextStep = 'play_style_assessment';
        DEV_STATE.onboarding.xpEarned = 150;
        if (data.experienceYears) {
          DEV_STATE.onboarding.preferences.experienceYears = data.experienceYears;
        }
      } else if (step === 'play_style_assessment') {
        DEV_STATE.onboarding.progress.playStyleAssessed = true;
        DEV_STATE.onboarding.progress_pct = 100;
        DEV_STATE.onboarding.nextStep = 'completed';
        DEV_STATE.onboarding.completed = true;
        DEV_STATE.onboarding.xpEarned = 200;
        if (data.playStyle) {
          DEV_STATE.onboarding.preferences.playStyle = data.playStyle;
        }
        if (data.skillFocus) {
          DEV_STATE.onboarding.preferences.skillFocus = data.skillFocus;
        }
      }
      
      // Return the updated DEV_STATE.onboarding object
      return res.json(DEV_STATE.onboarding);
    }
    
    // Normal flow for production
    const status = await onboardingService.completeStep(userId, step, data);
    return res.json(status);
  } catch (error) {
    console.error('[API] Error completing onboarding step:', error);
    return res.status(500).json({ error: 'Failed to complete onboarding step' });
  }
});

/**
 * Set preferred rating system
 * POST /api/courtiq/rating/set-preferred
 */
router.post('/rating/set-preferred', devAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Debug log the request body
    console.log('[CourtIQ API] Rating set-preferred request body:', req.body);
    
    // This is the actual schema the frontend is using
    const schema = z.object({
      ratingSystem: z.string(),
      ratingValue: z.union([z.number(), z.string(), z.undefined()]).optional(),
      selfAssessment: z.string().optional()
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      console.log('[CourtIQ API] Validation error:', validationResult.error);
      return res.status(400).json({ error: 'Invalid request body', details: validationResult.error });
    }
    
    // Extract the data with the frontend's field names
    const { ratingSystem, ratingValue, selfAssessment } = validationResult.data;
    
    // Map to our internal field names
    const system = ratingSystem;
    const rating = ratingValue !== undefined ? ratingValue : 
                  (selfAssessment ? selfAssessment : 0);
    
    // Special handling for development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CourtIQ API] Using DEV_STATE for setting preferred rating in development');
      
      // Get mock system data
      const mockSystem = MOCK_RATING_SYSTEMS.find(s => s.code === system) || {
        id: 999,
        code: system,
        name: system.toUpperCase(),
        description: `${system.toUpperCase()} Rating System`,
        minRating: 1.0,
        maxRating: 5.0,
        decimals: 1,
        isActive: true
      } as MockRatingSystem;
      
      // Update the centralized DEV_STATE
      DEV_STATE.onboarding.progress.ratingSystemSelected = true;
      DEV_STATE.onboarding.progress.ratingProvided = true;
      DEV_STATE.onboarding.preferences.preferredRatingSystem = system;
      DEV_STATE.onboarding.preferences.initialRating = rating;
      DEV_STATE.onboarding.progress_pct = 40;
      DEV_STATE.onboarding.nextStep = 'experience_summary';
      
      // Log the changes
      console.log('[CourtIQ API] DEV_STATE updated with rating system:', system, 'and rating:', rating);
      
      return res.json({
        success: true,
        message: `Successfully set ${mockSystem.name} as preferred rating system`,
        userId: userId,
        system: system,
        rating: rating,
        onboardingStatus: DEV_STATE.onboarding
      });
    }
    
    // Normal flow for production
    // Convert string to number if needed
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const result = await onboardingService.selectRatingSystem(userId, system, numericRating);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    return res.json(result);
  } catch (error) {
    console.error('[API] Error setting preferred rating system:', error);
    return res.status(500).json({ error: 'Failed to set preferred rating system' });
  }
});

/**
 * Simple dedicated route for onboarding - SIMPLIFIED FOR FRAMEWORK 5.3
 * POST /api/courtiq/onboarding/next-step
 */
router.post('/onboarding/next-step', devAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Log the request for debugging
    console.log('[CourtIQ API] Onboarding next-step request:', req.body);
    
    // In development, just use DEV_STATE
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CourtIQ API] Using DEV_STATE for onboarding progress');
      
      // Get the current step from the request
      const { step, ratingSystem, ratingValue } = req.body;
      
      // Update preferences based on what step was completed
      if (step === 'rating_selection') {
        // Update the centralized state
        DEV_STATE.onboarding.progress.ratingSystemSelected = true;
        DEV_STATE.onboarding.progress.ratingProvided = true;
        DEV_STATE.onboarding.preferences.preferredRatingSystem = ratingSystem;
        DEV_STATE.onboarding.preferences.initialRating = ratingValue;
        DEV_STATE.onboarding.nextStep = 'experience_summary';
        DEV_STATE.onboarding.progress_pct = 40;
        
        console.log('[CourtIQ API] Updated DEV_STATE for rating selection step:', {
          ratingSystem: DEV_STATE.onboarding.preferences.preferredRatingSystem,
          ratingValue: DEV_STATE.onboarding.preferences.initialRating
        });
      } else if (step === 'experience_summary') {
        // Adjust to move to play style assessment
        DEV_STATE.onboarding.progress.experienceSummaryCompleted = true;
        DEV_STATE.onboarding.nextStep = 'play_style_assessment';
        DEV_STATE.onboarding.progress_pct = 70;
      } else if (step === 'play_style_assessment') {
        // Mark onboarding as complete
        DEV_STATE.onboarding.progress.playStyleAssessed = true;
        DEV_STATE.onboarding.completed = true;
        DEV_STATE.onboarding.progress_pct = 100;
      }
      
      // Return the updated onboarding status with centralized state
      return res.json({
        success: true,
        userId: userId,
        onboardingStatus: DEV_STATE.onboarding
      });
    }
    
    // Production implementation (to be added in future)
    return res.status(500).json({ 
      error: 'Production implementation not available yet'
    });
    
  } catch (error) {
    console.error('[API] Error processing onboarding step:', error);
    return res.status(500).json({ error: 'Failed to process onboarding step' });
  }
});

/**
 * Get supported rating systems
 * GET /api/courtiq/rating-systems
 */
router.get('/rating-systems', async (req: Request, res: Response) => {
  try {
    // Special handling for development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CourtIQ API] Using mock rating systems for development');
      return res.json(MOCK_RATING_SYSTEMS);
    }
    
    // Normal flow for production
    const systems = await ratingConverter.getSupportedSystems();
    return res.json(systems);
  } catch (error) {
    console.error('[API] Error getting rating systems:', error);
    return res.status(500).json({ error: 'Failed to get rating systems' });
  }
});

/**
 * Convert a rating between systems
 * POST /api/courtiq/convert-rating
 */
router.post('/convert-rating', async (req: Request, res: Response) => {
  try {
    // Debug log the request body
    console.log('[CourtIQ API] Convert rating request body:', req.body);
    
    // Validate request body with more flexibility
    const schema = z.object({
      fromSystem: z.string(),
      toSystem: z.string(),
      rating: z.union([z.number(), z.string().transform(val => parseFloat(val))])
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      console.log('[CourtIQ API] Convert rating validation error:', validationResult.error);
      return res.status(400).json({ error: 'Invalid request body', details: validationResult.error });
    }
    
    const { fromSystem, toSystem, rating } = validationResult.data;
    
    // Special handling for development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CourtIQ API] Using mock data for rating conversion in development');
      
      // Get source system data
      const fromSystemData = MOCK_RATING_SYSTEMS.find(s => s.code === fromSystem) || {
        id: 998,
        code: fromSystem,
        name: fromSystem.toUpperCase(),
        minRating: 1.0,
        maxRating: 5.0,
        decimals: 1,
        description: `${fromSystem.toUpperCase()} Rating System`,
        isActive: true
      } as MockRatingSystem;
      
      // Get target system data
      const toSystemData = MOCK_RATING_SYSTEMS.find(s => s.code === toSystem) || {
        id: 999,
        code: toSystem,
        name: toSystem.toUpperCase(),
        minRating: 1.0,
        maxRating: 5.0,
        decimals: 1,
        description: `${toSystem.toUpperCase()} Rating System`,
        isActive: true
      } as MockRatingSystem;
      
      // Simple conversion logic based on relative position within min-max range
      const fromRange = fromSystemData.maxRating - fromSystemData.minRating;
      const toRange = toSystemData.maxRating - toSystemData.minRating;
      
      // Calculate the relative position in the source system's range (0-1)
      const normalizedPosition = (rating - fromSystemData.minRating) / fromRange;
      
      // Calculate the equivalent value in the target system's range
      const convertedRating = toSystemData.minRating + (normalizedPosition * toRange);
      
      // Round to one decimal place for a cleaner result
      const roundedRating = Math.round(convertedRating * 10) / 10;
      
      return res.json({
        rating: roundedRating,
        confidence: 85,
        source: 'mathematical',
        originalRating: rating,
        originalSystem: fromSystem
      });
    }
    
    // Normal flow for production
    const result = await ratingConverter.convertRating(fromSystem, toSystem, rating);
    return res.json(result);
  } catch (error) {
    console.error('[API] Error converting rating:', error);
    return res.status(500).json({ error: 'Failed to convert rating' });
  }
});

/**
 * Get user's rating in a specific system
 * GET /api/courtiq/user-rating
 */
router.get('/user-rating', devAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const system = req.query.system as string;
    const format = req.query.format as string || 'singles';
    const division = req.query.division as string || '19+';
    
    if (!system) {
      return res.status(400).json({ error: 'System parameter is required' });
    }
    
    // Special handling for development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CourtIQ API] Using mock data for user rating in development');
      
      // For test user ID 1, use fixed ratings for consistency
      const baseRating = 1750 + (userId * 17) % 500;
      
      // Default to COURTIQ rating (internal)
      let userRating = baseRating;
      
      // Get target system data
      const targetSystem = MOCK_RATING_SYSTEMS.find(s => s.code === system) || {
        id: 999,
        code: system,
        name: system.toUpperCase(),
        minRating: 1.0,
        maxRating: 5.0,
        decimals: 1,
        description: `${system.toUpperCase()} Rating System`,
        isActive: true
      } as MockRatingSystem;
      
      // For non-COURTIQ systems, convert from internal to target
      if (system !== 'COURTIQ') {
        // Calculate the relative position in CourtIQ range (0-1)
        const courtiqSystem = MOCK_RATING_SYSTEMS.find(s => s.code === 'COURTIQ')!;
        const normalizedPosition = (baseRating - courtiqSystem.minRating) / 
                                  (courtiqSystem.maxRating - courtiqSystem.minRating);
        
        // Translate to target system
        const targetRange = targetSystem.maxRating - targetSystem.minRating;
        userRating = targetSystem.minRating + (normalizedPosition * targetRange);
        
        // Round appropriately based on the system's decimals
        const power = targetSystem.decimals > 0 ? Math.pow(10, targetSystem.decimals) : 1;
        userRating = Math.round(userRating * power) / power;
      }
      
      return res.json({
        rating: userRating,
        confidence: 95,
        source: 'user_record',
        originalRating: baseRating,
        originalSystem: 'COURTIQ',
        playerDetails: {
          userId: userId,
          format: format,
          division: division,
          gamesAnalyzed: 35,
          matchesAnalyzed: 12,
          lastUpdated: new Date().toISOString()
        }
      });
    }
    
    // Normal flow for production
    const result = await ratingConverter.convertUserRatingToSystem(
      userId,
      system,
      format,
      division
    );
    
    return res.json(result);
  } catch (error) {
    console.error('[API] Error getting user rating:', error);
    return res.status(500).json({ error: 'Failed to get user rating' });
  }
});

/**
 * Initialize rating systems and conversion data
 * POST /api/courtiq/initialize-systems (admin only)
 */
router.post('/initialize-systems', devAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Administrator access required' });
    }
    
    // Special handling for development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CourtIQ API] Using mock data for systems initialization in development');
      return res.json({ 
        success: true, 
        systems: MOCK_RATING_SYSTEMS,
        message: 'Rating systems initialized successfully'
      });
    }
    
    // Normal flow for production
    const systems = await ratingConverter.initializeRatingSystems();
    return res.json({ success: true, systems });
  } catch (error) {
    console.error('[API] Error initializing rating systems:', error);
    return res.status(500).json({ error: 'Failed to initialize rating systems' });
  }
});

export default router;