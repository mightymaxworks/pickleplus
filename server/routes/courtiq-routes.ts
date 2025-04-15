/**
 * PKL-278651-STATS-0002-RD: CourtIQ Performance Routes
 * 
 * This file contains API routes for CourtIQ performance data and user rating details.
 * Following Framework 5.0 principles for reliability and clean interfaces.
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../auth';

const router = Router();

/**
 * Get CourtIQ performance data for a user
 * GET /api/courtiq/performance
 */
router.get('/performance', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get userId from query or current user
    let userId: number;
    if (req.query.userId) {
      userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ 
          error: "Invalid user ID",
          message: "The provided user ID is not valid"
        });
      }
    } else if (req.isAuthenticated()) {
      userId = (req.user as any).id;
    } else {
      return res.status(400).json({ 
        error: "Missing user ID",
        message: "User ID is required for performance data"
      });
    }
    
    // Get format and division from query parameters
    const format = req.query.format as string || 'singles';
    const division = req.query.division as string || 'open';
    
    // Here we would normally fetch real data from the database
    // For now, let's create synthesized data based on user data and existing patterns
    
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
    
    // Calculate next tier details
    let nextTier;
    if (tierName !== "Diamond") {
      const nextTierLevels: Record<string, {name: string, rating: number, color: string}> = {
        "Bronze": { name: "Silver", rating: 1700, color: "#C0C0C0" },
        "Silver": { name: "Gold", rating: 1800, color: "#FFD700" },
        "Gold": { name: "Platinum", rating: 1900, color: "#E5E4E2" },
        "Platinum": { name: "Diamond", rating: 2000, color: "#B9F2FF" }
      };
      
      const next = nextTierLevels[tierName];
      nextTier = {
        name: next.name,
        pointsNeeded: next.rating - baseRating,
        colorCode: next.color
      };
    }
    
    // Create trend data
    const recentChange = Math.floor(Math.random() * 40) - 15; // Between -15 and +25
    
    const performanceData = {
      // Overall rating
      overallRating: baseRating,
      tierName,
      tierColorCode,
      
      // Skill breakdown
      skills: {
        power: powerBase,
        speed: speedBase,
        precision: precisionBase,
        strategy: strategyBase,
        control: controlBase,
        consistency: consistencyBase
      },
      
      // Trends
      recentTrends: {
        change: recentChange,
        direction: recentChange > 0 ? 'up' : recentChange < 0 ? 'down' : 'stable',
        matches: 5 + Math.floor(Math.random() * 10) // Between 5 and 14
      },
      
      // Areas
      strongestArea: "control" as const,
      weakestArea: "strategy" as const,
      
      // Percentiles
      percentile: 50 + Math.floor(Math.random() * 40), // Between 50 and 89
      
      // Next tier
      nextTier
    };
    
    res.json(performanceData);
    
  } catch (error) {
    console.error('[API][CourtIQ] Error retrieving performance data:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving CourtIQ performance data"
    });
  }
});

/**
 * Get a user's CourtIQ rating details for a specific division and format
 * GET /api/courtiq/rating-detail
 */
router.get('/rating-detail', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Get userId from query or current user
    let userId: number;
    if (req.query.userId) {
      userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ 
          error: "Invalid user ID",
          message: "The provided user ID is not valid" 
        });
      }
    } else if (req.isAuthenticated()) {
      userId = (req.user as any).id;
    } else {
      return res.status(400).json({ 
        error: "Missing user ID",
        message: "User ID is required for rating details" 
      });
    }
    
    // Format is required for detailed view
    const format = req.query.format as string;
    const division = req.query.division as string || 'open';
    
    if (!format) {
      return res.status(400).json({ 
        error: "Missing format",
        message: "Format is required for rating details" 
      });
    }
    
    // Create a consistent rating based on userId and format
    const baseRating = 1750 + (userId * 17) % 500;
    const formatOffset = format === 'singles' ? 0 : format === 'doubles' ? 100 : 50;
    const rating = baseRating + formatOffset;
    
    // Determine tier based on rating
    let tier = "Bronze";
    
    if (rating >= 2000) {
      tier = "Diamond";
    } else if (rating >= 1900) {
      tier = "Platinum";
    } else if (rating >= 1800) {
      tier = "Gold";
    } else if (rating >= 1700) {
      tier = "Silver";
    }
    
    // Create rating data
    const ratingData = {
      id: userId * 100 + (format === 'singles' ? 1 : format === 'doubles' ? 2 : 3),
      userId: userId,
      format: format,
      division: division,
      rating: rating,
      tier: tier,
      confidenceLevel: 0.75 + (Math.random() * 0.2),
      matchesPlayed: 20 + Math.floor(Math.random() * 60),
      lastMatchDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      peakRating: rating + Math.floor(Math.random() * 50),
      allTimeHighRating: rating + Math.floor(Math.random() * 75),
      currentSeasonHighRating: rating + Math.floor(Math.random() * 40),
      currentSeasonLowRating: rating - Math.floor(Math.random() * 60),
      skillBreakdown: {
        power: 65 + (userId * 3) % 30,
        speed: 70 + (userId * 5) % 25,
        precision: 75 + (userId * 7) % 20,
        strategy: 60 + (userId * 11) % 35,
        control: 80 + (userId * 13) % 15,
        consistency: 68 + (userId * 17) % 27
      },
      recentMatches: 5 + Math.floor(Math.random() * 5),
      recentChange: Math.floor(Math.random() * 40) - 15,
      percentile: 50 + Math.floor(Math.random() * 40)
    };
    
    // Generate rating history
    const now = new Date();
    const history = [];
    
    // Generate data points going back in time (oldest first)
    const startRating = rating - 100; // Start 100 points below current
    const totalPoints = 10;
    
    for (let i = 0; i < totalPoints; i++) {
      const daysAgo = 90 - (i * 9); // Spread events over 90 days
      const pointDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      // Progressive rating increase with occasional dips
      const progress = i / (totalPoints - 1); // 0 to 1
      const randomFactor = Math.random() * 20 - 5; // -5 to +15
      const pointRating = Math.round(startRating + (progress * 100) + randomFactor);
      
      // Calculate change from last point
      const prevRating: number = i > 0 ? history[i-1].rating : startRating;
      const change: number = pointRating - prevRating;
      
      history.push({
        date: pointDate.toISOString(),
        rating: pointRating,
        change: change,
        matchId: 1000 + i
      });
    }
    
    // Add the detailed rating with history
    const ratingDetail = {
      ...ratingData,
      history: history
    };
    
    res.json(ratingDetail);
  } catch (error) {
    console.error('[API][CourtIQ] Error retrieving rating detail:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving rating detail"
    });
  }
});

/**
 * Get CourtIQ rating tiers
 * GET /api/courtiq/tiers
 */
router.get('/tiers', async (req: Request, res: Response) => {
  try {
    // Define the CourtIQ tiers
    const tiers = [
      {
        id: 1,
        name: "Diamond",
        description: "Elite players with exceptional skills",
        minRating: 2000,
        maxRating: 2500,
        colorCode: "#B9F2FF",
        iconUrl: "/assets/tiers/diamond.svg"
      },
      {
        id: 2,
        name: "Platinum",
        description: "Advanced players with outstanding abilities",
        minRating: 1900,
        maxRating: 1999,
        colorCode: "#E5E4E2",
        iconUrl: "/assets/tiers/platinum.svg"
      },
      {
        id: 3,
        name: "Gold",
        description: "Accomplished players with strong fundamentals",
        minRating: 1800,
        maxRating: 1899,
        colorCode: "#FFD700",
        iconUrl: "/assets/tiers/gold.svg"
      },
      {
        id: 4,
        name: "Silver",
        description: "Competent players with good skills",
        minRating: 1700,
        maxRating: 1799,
        colorCode: "#C0C0C0",
        iconUrl: "/assets/tiers/silver.svg"
      },
      {
        id: 5,
        name: "Bronze",
        description: "Developing players building their skills",
        minRating: 1500,
        maxRating: 1699,
        colorCode: "#CD7F32",
        iconUrl: "/assets/tiers/bronze.svg"
      }
    ];
    
    res.json(tiers);
  } catch (error) {
    console.error('[API][CourtIQ] Error retrieving tiers:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving CourtIQ tiers"
    });
  }
});

/**
 * Get available categories (divisions and formats)
 * GET /api/courtiq/categories
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    // Define the available categories
    const categories = {
      divisions: [
        { id: "open", name: "Open", description: "Open to all ages" },
        { id: "35plus", name: "35+", description: "35 years and older" },
        { id: "50plus", name: "50+", description: "50 years and older" },
        { id: "65plus", name: "65+", description: "65 years and older" },
        { id: "u21", name: "Under 21", description: "21 years and younger" }
      ],
      formats: [
        { id: "singles", name: "Singles", description: "1 vs 1 format" },
        { id: "doubles", name: "Doubles", description: "2 vs 2 format, same gender" },
        { id: "mixed", name: "Mixed Doubles", description: "2 vs 2 format, mixed gender" }
      ]
    };
    
    res.json(categories);
  } catch (error) {
    console.error('[API][CourtIQ] Error retrieving categories:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving categories"
    });
  }
});

export default router;