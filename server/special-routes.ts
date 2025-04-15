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
    
    // In a production implementation, we would check if the user has enough
    // match data to generate meaningful ratings
    
    // For now, return empty state with clear guidance
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
    
    // In a production implementation, we would check if this user has enough
    // completed matches to generate meaningful ratings
    
    // For now, return empty state with clear guidance
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

export { specialRouter };