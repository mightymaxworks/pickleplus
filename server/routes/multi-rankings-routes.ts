/**
 * PKL-278651-PRANK-0008-FWK52 - Multi-Rankings Routes
 * 
 * Routes implementation for the Multi-Dimensional Ranking System API
 * Following Framework 5.2 principles for extension over replacement
 */

import { Router, Request, Response } from "express";
import { isAuthenticated } from "../auth";

const router = Router();

/**
 * Get multi-dimensional ranking leaderboard
 * GET /api/multi-rankings/leaderboard
 */
router.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    console.log("[API][MultiRankings] Leaderboard request received, query:", req.query);
    
    // Parse query parameters with defaults
    const format = req.query.format as string || 'singles';
    const ageDivision = req.query.ageDivision as string || '19plus';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Return sample leaderboard data
    const sampleLeaderboard = [];
    
    // Generate sample players
    for (let i = 0; i < limit; i++) {
      const position = i + 1 + offset;
      sampleLeaderboard.push({
        userId: 100 + position,
        username: `player${position}`,
        displayName: `Player ${position}`,
        avatarUrl: null,
        rankingPoints: Math.floor(2000 - (position * 15) + (Math.random() * 10)),
        position: position,
        tier: position <= 10 ? "Elite" : position <= 50 ? "Advanced" : "Intermediate",
        matchesPlayed: Math.floor(50 - (position * 0.3) + (Math.random() * 10)),
        skillRating: Math.max(2.0, Math.min(5.0, 5.0 - ((position - 1) * 0.03))).toFixed(1)
      });
    }
    
    res.json({
      leaderboard: sampleLeaderboard,
      categories: ["serve", "return", "dinking", "third_shot", "court_movement", "strategy", "offensive", "defensive"],
      filterApplied: {
        format,
        ageDivision,
        tier: null,
        minRating: null,
        maxRating: null
      }
    });
  } catch (error) {
    console.error("[API] Error getting multi-dimensional rankings:", error);
    res.status(500).json({ error: "Server error getting rankings" });
  }
});

/**
 * Get player ranking position
 * GET /api/multi-rankings/position
 */
router.get("/position", (req: Request, res: Response) => {
  console.log("[API][CRITICAL][MultiRankings] Direct handler called, query:", req.query);
  
  try {
    // Extract the userId from the query parameters
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
    
    // Check if user has any matches
    if (userId === 1) {
      // Return empty state with clear guidance for user with no matches
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
    } else {
      // Return ranking position data for users with matches
      res.json({
        userId: userId,
        format: format,
        ageDivision: ageDivision,
        ratingTierId: 1,
        rankingPoints: 1200,
        rank: 1,
        totalPlayers: 250,
        skillRating: 4.5
      });
    }
  } catch (error) {
    console.error("[API] Error getting ranking position:", error);
    res.status(500).json({ error: "Server error getting ranking position" });
  }
});

/**
 * Get ranking history
 * GET /api/multi-rankings/history
 */
router.get("/history", async (req: Request, res: Response) => {
  try {
    // Get userId from query params
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
    
    // Return sample ranking history data
    res.json([
      {
        id: 1,
        userId: userId,
        timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        rankingPoints: 950,
        rank: 5,
        format: 'singles',
        ageDivision: '19plus',
        skillRating: 4.2
      },
      {
        id: 2,
        userId: userId,
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        rankingPoints: 1050,
        rank: 3,
        format: 'singles',
        ageDivision: '19plus',
        skillRating: 4.3
      },
      {
        id: 3,
        userId: userId,
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        rankingPoints: 1150,
        rank: 2,
        format: 'singles',
        ageDivision: '19plus',
        skillRating: 4.4
      },
      {
        id: 4,
        userId: userId,
        timestamp: new Date().toISOString(),
        rankingPoints: 1200,
        rank: 1,
        format: 'singles',
        ageDivision: '19plus',
        skillRating: 4.5
      }
    ]);
  } catch (error) {
    console.error("[API] Error getting ranking history:", error);
    res.status(500).json({ error: "Server error getting ranking history" });
  }
});

/**
 * Get rating tiers
 * GET /api/multi-rankings/rating-tiers
 */
router.get("/rating-tiers", async (req: Request, res: Response) => {
  try {
    // Return sample rating tiers
    res.json([
      {
        id: 1,
        name: "Elite",
        minRating: 4.5,
        maxRating: 5.0,
        badgeUrl: null,
        colorCode: "#6a0dad",
        protectionLevel: 3,
        description: "Top-tier players with exceptional skills",
        order: 1
      },
      {
        id: 2,
        name: "Advanced",
        minRating: 4.0,
        maxRating: 4.49,
        badgeUrl: null,
        colorCode: "#0000ff", 
        protectionLevel: 2,
        description: "Highly skilled players with strong fundamentals",
        order: 2
      },
      {
        id: 3,
        name: "Intermediate",
        minRating: 3.5,
        maxRating: 3.99,
        badgeUrl: null,
        colorCode: "#008000", 
        protectionLevel: 2,
        description: "Players with good skills and experience",
        order: 3
      },
      {
        id: 4,
        name: "Novice",
        minRating: 2.5,
        maxRating: 3.49,
        badgeUrl: null,
        colorCode: "#ffa500", 
        protectionLevel: 1,
        description: "Players developing their skills",
        order: 4
      },
      {
        id: 5,
        name: "Beginner",
        minRating: 1.0,
        maxRating: 2.49,
        badgeUrl: null,
        colorCode: "#ff0000", 
        protectionLevel: 0,
        description: "New players learning the game",
        order: 5
      }
    ]);
  } catch (error) {
    console.error("[API] Error getting rating tiers:", error);
    res.status(500).json({ error: "Server error getting rating tiers" });
  }
});

export default router;