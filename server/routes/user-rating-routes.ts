/**
 * PKL-278651-STATS-0002-RD: User Rating Routes
 * 
 * This file contains API routes for user rating data.
 * Following Framework 5.0 principles for reliability and clean interfaces.
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../auth';

const router = Router();

/**
 * Get detailed rating information for a user
 * GET /api/user/rating-detail
 */
router.get('/rating-detail', isAuthenticated, async (req: Request, res: Response) => {
  console.log("[UserRating] Rating detail requested, path:", req.path, "baseUrl:", req.baseUrl);
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
    console.error('[API][User] Error retrieving rating detail:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving rating detail"
    });
  }
});

export default router;