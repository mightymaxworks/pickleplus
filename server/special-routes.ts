/**
 * PKL-278651-API-0001-CRITICAL - Critical API Route Fixes
 * Special direct route implementations for problematic endpoints
 * 
 * Following Framework 5.0 principles: Direct, independent, and highly reliable
 * endpoint implementations with no dependencies on other route handlers
 */

import express, { type Request, Response } from "express";

// Create a standalone router for our critical endpoints
const specialRouter = express.Router();

/**
 * CourtIQ Performance endpoint - Framework 5.0 Direct Implementation
 * GET /api/courtiq/performance
 */
specialRouter.get('/courtiq/performance', (req: Request, res: Response) => {
  console.log("[API][CRITICAL][CourtIQ] Direct handler called, query:", req.query);
  
  try {
    // Get userId from query, default to 1
    let userId: number = 1;
    
    if (req.query.userId) {
      try {
        userId = parseInt(req.query.userId as string);
        if (isNaN(userId)) {
          userId = 1;
        }
      } catch (e) {
        console.log("[API][CRITICAL][CourtIQ] Error parsing userId:", e);
        userId = 1;
      }
    }
    
    // Get format and division from query parameters
    const format = req.query.format as string || 'singles';
    const division = req.query.division as string || 'open';
    
    // Check if demo data is requested
    const includeDemoData = req.query.includeDemoData === 'true';
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Provide demo data when requested (in development mode or when explicitly requested)
    if (includeDemoData || isDevelopment) {
      console.log("[API][CRITICAL][CourtIQ] Returning demo performance data");
      
      return res.json({
        overallRating: 1250,
        tierName: "Advanced",
        tierColorCode: "#8b5cf6", // Purple
        
        // Dimensions breakdown
        dimensions: {
          technique: { score: 4 },
          strategy: { score: 3 },
          consistency: { score: 4 },
          focus: { score: 3 },
          power: { score: 4 },
          speed: { score: 4 }
        },
        
        // Source-specific dimension ratings for multi-source visualization
        sourceRatings: {
          self: {
            technique: 45,
            strategy: 40,
            consistency: 45,
            focus: 35,
            power: 45,
            speed: 45
          },
          opponent: {
            technique: 35,
            strategy: 25,
            consistency: 30,
            focus: 25,
            power: 35,
            speed: 35
          },
          coach: {
            technique: 45,
            strategy: 30,
            consistency: 40,
            focus: 30,
            power: 50,
            speed: 40
          }
        },
        
        // For backwards compatibility
        skills: {
          power: 80,
          speed: 75,
          precision: 65,
          strategy: 60,
          control: 70,
          consistency: 68
        },
        
        // Trends
        recentTrends: {
          change: 25,
          direction: 'up',
          matches: 8
        },
        
        // Areas
        strongestArea: "power",
        weakestArea: "strategy",
        
        // Percentiles
        percentile: 82,
        
        // Next tier
        nextTier: {
          name: "Expert",
          pointsNeeded: 150,
          colorCode: "#7c3aed" // Darker Purple
        }
      });
    }
    
    // Normal response for insufficient data
    res.json({
      status: "insufficient_data",
      message: "Not enough match data to generate performance metrics",
      requiredMatches: 5,
      currentMatches: 0,
      guidance: {
        title: "Start tracking your performance",
        description: "Play at least 5 matches to unlock your CourtIQ™ Performance metrics",
        primaryAction: "Record a match",
        primaryActionPath: "/record-match"
      }
    });
  } catch (error) {
    console.error('[API][CRITICAL][CourtIQ] Error retrieving performance data:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving CourtIQ performance data"
    });
  }
});

/**
 * User Rating Detail endpoint - Framework 5.0 Direct Implementation
 * GET /api/user/rating-detail
 */
specialRouter.get('/user/rating-detail', (req: Request, res: Response) => {
  console.log("[API][CRITICAL][UserRating] Direct handler called, query:", req.query);
  
  try {
    // Get userId from query, default to 1
    let userId: number = 1;
    
    if (req.query.userId) {
      try {
        userId = parseInt(req.query.userId as string);
        if (isNaN(userId)) {
          userId = 1;
        }
      } catch (e) {
        console.log("[API][CRITICAL][UserRating] Error parsing userId:", e);
        userId = 1;
      }
    }
    
    // Format is required for detailed view
    const format = req.query.format as string || 'singles';
    const division = req.query.division as string || 'open';
    
    // Check if demo data is requested
    const includeDemoData = req.query.includeDemoData === 'true';
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Provide demo data when requested (in development mode or when explicitly requested)
    if (includeDemoData || isDevelopment) {
      console.log("[API][CRITICAL][UserRating] Returning demo rating data");
      
      return res.json({
        userId: userId,
        rating: 1250,
        format: format,
        division: division,
        recentChange: 25,
        recentMatches: 5,
        percentile: 78,
        rank: 22,
        rankChange: -3, // Negative means improved
        totalPlayers: 113,
        skillBreakdown: {
          power: 80,
          speed: 75,
          precision: 65,
          strategy: 60,
          control: 70,
          consistency: 68
        }
      });
    }
    
    // Normal response for insufficient data
    res.json({
      status: "insufficient_data",
      message: "Not enough match data to calculate rating details",
      requiredMatches: 5,
      currentMatches: 0,
      format: format,
      division: division,
      guidance: {
        title: "Your rating is waiting",
        description: "Play at least 5 matches to establish your player rating",
        primaryAction: "Find players to match with",
        primaryActionPath: "/players",
        secondaryAction: "Record a match",
        secondaryActionPath: "/record-match"
      }
    });
  } catch (error) {
    console.error('[API][CRITICAL][UserRating] Error retrieving rating detail:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving rating detail"
    });
  }
});

/**
 * Multi-Rankings Position endpoint - Framework 5.0 Direct Implementation
 * GET /api/multi-rankings/position
 */
specialRouter.get('/multi-rankings/position', (req: Request, res: Response) => {
  console.log("[API][CRITICAL][MultiRankings] Direct handler called, query:", req.query);
  
  try {
    // Parse the userId from the query parameters
    let userId = 1;
    
    if (req.query.userId) {
      try {
        userId = parseInt(req.query.userId as string);
        if (isNaN(userId)) {
          userId = 1;
        }
      } catch (e) {
        console.log("[API][CRITICAL][MultiRankings] Error parsing userId:", e);
        userId = 1; 
      }
    }
    
    const format = req.query.format as string || 'singles';
    const ageDivision = req.query.ageDivision as string || '19plus';
    
    // In a production implementation, we would check if the user has completed
    // enough matches or is enrolled in a competitive league to be ranked
    
    // For now, return empty state with clear guidance
    res.json({
      status: "not_ranked",
      message: "Not currently ranked in this division",
      requiresEnrollment: true,
      format: format,
      ageDivision: ageDivision,
      guidance: {
        title: "Join the rankings",
        description: "Participate in an official league or tournament to establish your ranking",
        primaryAction: "Find tournaments",
        primaryActionPath: "/tournaments",
        secondaryAction: "Join a league",
        secondaryActionPath: "/leagues"
      }
    });
  } catch (error) {
    console.error("[API][CRITICAL][MultiRankings] Error getting ranking position:", error);
    res.status(500).json({ error: "Server error getting ranking position" });
  }
});

/**
 * CourtIQ Tiers endpoint - Framework 5.0 Direct Implementation
 * GET /api/courtiq/tiers
 */
specialRouter.get('/courtiq/tiers', (req: Request, res: Response) => {
  console.log("[API][CRITICAL][CourtIQTiers] Direct handler called");
  
  try {
    // Return the CourtIQ tiers data
    res.json([
      {
        id: 1,
        name: "Elite",
        minRating: 1500,
        maxRating: 9999,
        colorCode: "#7C3AED" // Deep purple
      },
      {
        id: 2,
        name: "Expert",
        minRating: 1400,
        maxRating: 1499,
        colorCode: "#8B5CF6" // Medium purple
      },
      {
        id: 3,
        name: "Advanced",
        minRating: 1200,
        maxRating: 1399,
        colorCode: "#A78BFA" // Light purple
      },
      {
        id: 4,
        name: "Competitive",
        minRating: 1000,
        maxRating: 1199,
        colorCode: "#C4B5FD" // Very light purple
      },
      {
        id: 5,
        name: "Intermediate",
        minRating: 800,
        maxRating: 999,
        colorCode: "#4F46E5" // Indigo
      },
      {
        id: 6, 
        name: "Developing",
        minRating: 600,
        maxRating: 799,
        colorCode: "#818CF8" // Light indigo
      },
      {
        id: 7,
        name: "Recreational",
        minRating: 400,
        maxRating: 599,
        colorCode: "#10B981" // Green
      },
      {
        id: 8,
        name: "Beginner",
        minRating: 200,
        maxRating: 399,
        colorCode: "#34D399" // Light green
      },
      {
        id: 9,
        name: "Novice",
        minRating: 0,
        maxRating: 199,
        colorCode: "#6EE7B7" // Very light green
      }
    ]);
  } catch (error) {
    console.error('[API][CRITICAL][CourtIQTiers] Error retrieving tiers:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving CourtIQ tiers data"
    });
  }
});

export { specialRouter };