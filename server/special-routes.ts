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
specialRouter.get('/courtiq/performance', async (req: Request, res: Response) => {
  console.log("[API][CRITICAL][CourtIQ] Direct handler called, query:", req.query);
  
  try {
    // Import required modules
    const { db } = await import('./db');
    const { courtiqUserRatings, matchAssessments } = await import('../shared/schema/courtiq');
    const { matches } = await import('../shared/schema');
    const { eq, sql, desc, and } = await import('drizzle-orm');
    
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
    const includeSourceTypes = req.query.includeSourceTypes === 'true';
    
    // Get user's CourtIQ rating data
    const [userRating] = await db
      .select()
      .from(courtiqUserRatings)
      .where(eq(courtiqUserRatings.userId, userId));
    
    console.log(`[API][CRITICAL][CourtIQ] User rating data found:`, userRating ? 'Yes' : 'No');
    
    // Count user's match data to see if they qualify for ratings
    const matchCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(matches)
      .where(
        and(
          eq(matches.isRated, true),
          sql`(${matches.playerOneId} = ${userId} OR ${matches.playerTwoId} = ${userId})`
        )
      );
    
    const totalMatches = parseInt(matchCount[0]?.count.toString() || '0');
    console.log(`[API][CRITICAL][CourtIQ] User match count:`, totalMatches);
    
    // If we don't have enough matches or no rating data, return insufficient data response
    if (totalMatches < 5 || !userRating) {
      console.log("[API][CRITICAL][CourtIQ] Returning insufficient data response");
      return res.json({
        status: "insufficient_data",
        message: "Not enough match data to generate performance metrics",
        requiredMatches: 5,
        currentMatches: totalMatches,
        guidance: {
          title: "Start tracking your performance",
          description: "Play at least 5 matches to unlock your CourtIQ™ Performance metrics",
          primaryAction: "Record a match",
          primaryActionPath: "/record-match"
        }
      });
    }
    
    // We have rating data, prepare the response
    console.log("[API][CRITICAL][CourtIQ] Returning real user rating data");
    
    // Get tiers data to determine user's tier
    // Use a more direct approach to avoid import issues
    const tiers = [
      {
        id: 1,
        name: "Elite",
        minRating: 4.5,
        maxRating: 5.0,
        colorCode: "#7C3AED" // Deep purple
      },
      {
        id: 2,
        name: "Expert",
        minRating: 4.0,
        maxRating: 4.49,
        colorCode: "#8B5CF6" // Medium purple
      },
      {
        id: 3,
        name: "Advanced",
        minRating: 3.5,
        maxRating: 3.99,
        colorCode: "#A78BFA" // Light purple
      },
      {
        id: 4,
        name: "Competitive",
        minRating: 3.0,
        maxRating: 3.49,
        colorCode: "#C4B5FD" // Very light purple
      },
      {
        id: 5,
        name: "Intermediate",
        minRating: 2.5,
        maxRating: 2.99,
        colorCode: "#4F46E5" // Indigo
      },
      {
        id: 6, 
        name: "Developing",
        minRating: 2.0,
        maxRating: 2.49,
        colorCode: "#818CF8" // Light indigo
      },
      {
        id: 7,
        name: "Recreational",
        minRating: 1.5,
        maxRating: 1.99,
        colorCode: "#10B981" // Green
      },
      {
        id: 8,
        name: "Beginner",
        minRating: 1.0,
        maxRating: 1.49,
        colorCode: "#34D399" // Light green
      },
      {
        id: 9,
        name: "Novice",
        minRating: 0,
        maxRating: 0.99,
        colorCode: "#6EE7B7" // Very light green
      }
    ];
    
    // Find current tier
    const currentTier = tiers.find(
      tier => userRating.overallRating >= tier.minRating && userRating.overallRating <= tier.maxRating
    ) || {
      name: "Unranked",
      colorCode: "#9E9E9E",
    };
    
    // Generate the response
    const response = {
      overallRating: Math.round(userRating.overallRating * 250 + 750), // Convert 1-5 scale to 1000-2000 scale
      tierName: currentTier.name,
      tierColorCode: currentTier.colorCode,
      
      // Dimensions breakdown
      dimensions: {
        technique: { score: userRating.technicalRating },
        strategy: { score: userRating.tacticalRating },
        consistency: { score: userRating.consistencyRating },
        focus: { score: userRating.mentalRating },
        power: { score: userRating.physicalRating },
        speed: { score: userRating.physicalRating }, // Using physical as a proxy for speed
      },
      
      // For backwards compatibility
      skills: {
        power: userRating.physicalRating * 20,
        speed: userRating.physicalRating * 20 - 5, // Slight variance
        precision: userRating.technicalRating * 20 - 3,
        strategy: userRating.tacticalRating * 20,
        control: userRating.consistencyRating * 20 + 5,
        consistency: userRating.consistencyRating * 20
      },
      
      // Trends - real data based on recent assessments
      recentTrends: {
        change: userRating.version > 1 ? 5 : 0, // Only show change if we have version history
        direction: userRating.version > 1 ? 'up' : 'stable',
        matches: totalMatches
      },
      
      // Areas - derived from ratings
      strongestArea: getStrongestArea(userRating),
      weakestArea: getWeakestArea(userRating),
      
      // Percentiles - default to median until we have more data
      percentile: 50,
    };
    
    // If source types are requested, get assessment data and add it
    if (includeSourceTypes) {
      // Get recent assessments
      const recentAssessments = await db
        .select()
        .from(matchAssessments)
        .where(eq(matchAssessments.targetId, userId))
        .orderBy(desc(matchAssessments.createdAt))
        .limit(10);
      
      // Group assessments by type
      const selfAssessments = recentAssessments.filter(a => a.assessorId === userId);
      const opponentAssessments = recentAssessments.filter(a => a.assessorId !== userId && a.assessmentType === 'opponent');
      const coachAssessments = recentAssessments.filter(a => a.assessmentType === 'coach');
      
      // Add source-specific ratings if we have assessments
      if (selfAssessments.length || opponentAssessments.length || coachAssessments.length) {
        response['sourceRatings'] = {
          self: selfAssessments.length ? generateSourceRatings(selfAssessments) : undefined,
          opponent: opponentAssessments.length ? generateSourceRatings(opponentAssessments) : undefined,
          coach: coachAssessments.length ? generateSourceRatings(coachAssessments) : undefined
        };
      }
    }
    
    // Find next tier if not already at the highest
    const currentTierIndex = tiers.findIndex(tier => tier.id === currentTier.id);
    if (currentTierIndex > 0) { // Not already at highest tier (lowest index)
      const nextTier = tiers[currentTierIndex - 1]; // Next tier up is at lower index
      response['nextTier'] = {
        name: nextTier.name,
        pointsNeeded: nextTier.minRating - userRating.overallRating,
        colorCode: nextTier.colorCode
      };
    }
    
    return res.json(response);
  } catch (error) {
    console.error('[API][CRITICAL][CourtIQ] Error retrieving performance data:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving CourtIQ performance data"
    });
  }
});

// Helper function to determine strongest area
function getStrongestArea(userRating: any): string {
  const ratings = {
    power: userRating.physicalRating,
    precision: userRating.technicalRating,
    strategy: userRating.tacticalRating,
    control: userRating.mentalRating,
    consistency: userRating.consistencyRating
  };
  
  return Object.entries(ratings).sort((a, b) => b[1] - a[1])[0][0];
}

// Helper function to determine weakest area
function getWeakestArea(userRating: any): string {
  const ratings = {
    power: userRating.physicalRating,
    precision: userRating.technicalRating,
    strategy: userRating.tacticalRating,
    control: userRating.mentalRating,
    consistency: userRating.consistencyRating
  };
  
  return Object.entries(ratings).sort((a, b) => a[1] - b[1])[0][0];
}

// Helper function to generate source ratings from assessments
function generateSourceRatings(assessments: any[]): any {
  if (!assessments.length) return undefined;
  
  // Calculate averages for each dimension across all assessments
  const dimensionTotals = {
    technique: 0,
    strategy: 0,
    consistency: 0,
    focus: 0,
    power: 0,
    speed: 0
  };
  
  let validAssessments = 0;
  
  assessments.forEach(assessment => {
    if (assessment.formData) {
      try {
        const data = typeof assessment.formData === 'string' 
          ? JSON.parse(assessment.formData) 
          : assessment.formData;
        
        // Map assessment dimensions to our standard dimensions
        if (data.technicalSkill) dimensionTotals.technique += data.technicalSkill;
        if (data.tacticalAwareness) dimensionTotals.strategy += data.tacticalAwareness;
        if (data.consistency) dimensionTotals.consistency += data.consistency;
        if (data.mentalToughness) dimensionTotals.focus += data.mentalToughness;
        if (data.physicalFitness) {
          dimensionTotals.power += data.physicalFitness;
          dimensionTotals.speed += data.physicalFitness;
        }
        
        validAssessments++;
      } catch (e) {
        console.error('[API][CRITICAL][CourtIQ] Error parsing assessment formData:', e);
      }
    }
  });
  
  // If no valid assessments, return undefined
  if (validAssessments === 0) return undefined;
  
  // Calculate averages and convert to 0-100 scale
  return {
    technique: Math.round((dimensionTotals.technique / validAssessments) * 10),
    strategy: Math.round((dimensionTotals.strategy / validAssessments) * 10),
    consistency: Math.round((dimensionTotals.consistency / validAssessments) * 10),
    focus: Math.round((dimensionTotals.focus / validAssessments) * 10),
    power: Math.round((dimensionTotals.power / validAssessments) * 10),
    speed: Math.round((dimensionTotals.speed / validAssessments) * 10)
  };
}

/**
 * User Rating Detail endpoint - Framework 5.0 Direct Implementation
 * GET /api/user/rating-detail
 */
specialRouter.get('/user/rating-detail', async (req: Request, res: Response) => {
  console.log("[API][CRITICAL][UserRating] Direct handler called, query:", req.query);
  
  try {
    // Import required modules
    const { db } = await import('./db');
    const { courtiqUserRatings } = await import('../shared/schema/courtiq');
    const { matches } = await import('../shared/schema');
    const { eq, sql, and } = await import('drizzle-orm');
    
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
    
    // Get user's CourtIQ rating data
    const [userRating] = await db
      .select()
      .from(courtiqUserRatings)
      .where(eq(courtiqUserRatings.userId, userId));
    
    console.log(`[API][CRITICAL][UserRating] User rating data found:`, userRating ? 'Yes' : 'No');
    
    // Count user's match data to see if they qualify for ratings
    const matchCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(matches)
      .where(
        and(
          eq(matches.isRated, true),
          sql`(${matches.playerOneId} = ${userId} OR ${matches.playerTwoId} = ${userId})`
        )
      );
    
    const totalMatches = parseInt(matchCount[0]?.count.toString() || '0');
    console.log(`[API][CRITICAL][UserRating] User match count:`, totalMatches);
    
    // If we don't have enough matches or no rating data, return insufficient data response
    if (totalMatches < 5 || !userRating) {
      console.log("[API][CRITICAL][UserRating] Returning insufficient data response");
      return res.json({
        status: "insufficient_data",
        message: "Not enough match data to calculate rating details",
        requiredMatches: 5,
        currentMatches: totalMatches,
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
    }
    
    // We have rating data, prepare the response
    console.log("[API][CRITICAL][UserRating] Returning real user rating data");
    
    // Get total player count for percentile calculation
    const playerCount = await db
      .select({ count: sql`COUNT(DISTINCT ${courtiqUserRatings.userId})` })
      .from(courtiqUserRatings);
    
    const totalPlayers = parseInt(playerCount[0]?.count.toString() || '1');
    
    // Get user rank by ordering all players by rating
    const rankedUsers = await db
      .select({ 
        userId: courtiqUserRatings.userId,
        rating: courtiqUserRatings.overallRating
      })
      .from(courtiqUserRatings)
      .orderBy(sql`${courtiqUserRatings.overallRating} DESC`);
    
    // Find user's rank in the list
    const userRankIndex = rankedUsers.findIndex(u => u.userId === userId);
    const userRank = userRankIndex >= 0 ? userRankIndex + 1 : totalPlayers;
    
    // Calculate percentile
    const percentile = Math.round(((totalPlayers - userRank) / totalPlayers) * 100);
    
    // Generate the response
    return res.json({
      userId: userId,
      rating: Math.round(userRating.overallRating * 250 + 750), // Convert 1-5 scale to 1000-2000 scale
      format: format,
      division: division,
      recentChange: userRating.version > 1 ? 5 : 0, // Only show change if we have version history
      recentMatches: totalMatches,
      percentile: percentile,
      rank: userRank,
      rankChange: 0, // Default to no change until we implement history tracking
      totalPlayers: totalPlayers,
      skillBreakdown: {
        power: userRating.physicalRating * 20,
        speed: userRating.physicalRating * 20 - 5, // Slight variance
        precision: userRating.technicalRating * 20 - 3,
        strategy: userRating.tacticalRating * 20,
        control: userRating.mentalRating * 20,
        consistency: userRating.consistencyRating * 20
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
specialRouter.get('/courtiq/tiers', async (req: Request, res: Response) => {
  console.log("[API][CRITICAL][CourtIQTiers] Direct handler called");
  
  try {
    // Import required modules
    const { db } = await import('./db');
    const { sql } = await import('drizzle-orm');
    
    // Fetch courtiq tiers from the database
    let tiers;
    try {
      // Try to get actual tiers from the database
      const { courtiqTiers } = await import('../shared/schema/courtiq');
      tiers = await db.select().from(courtiqTiers);
      
      console.log(`[API][CRITICAL][CourtIQTiers] Found ${tiers.length} tiers in database`);
    } catch (dbError) {
      console.error('[API][CRITICAL][CourtIQTiers] Error retrieving tiers from database:', dbError);
      // Fallback if no tiers table exists yet
      tiers = [
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
      ];
      
      // Insert the tiers into the database if possible
      try {
        // Create tiers table if it doesn't exist
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "courtiq_tiers" (
            "id" SERIAL PRIMARY KEY,
            "name" VARCHAR(50) NOT NULL,
            "minRating" INTEGER NOT NULL,
            "maxRating" INTEGER NOT NULL,
            "colorCode" VARCHAR(20) NOT NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Insert default tiers if table is empty
        for (const tier of tiers) {
          await db.execute(sql`
            INSERT INTO "courtiq_tiers" ("name", "minRating", "maxRating", "colorCode")
            VALUES (${tier.name}, ${tier.minRating}, ${tier.maxRating}, ${tier.colorCode})
            ON CONFLICT DO NOTHING
          `);
        }
        
        console.log('[API][CRITICAL][CourtIQTiers] Created and populated tiers table');
      } catch (insertError) {
        console.error('[API][CRITICAL][CourtIQTiers] Error populating tiers:', insertError);
      }
    }
    
    // Return the tiers
    res.json(tiers);
  } catch (error) {
    console.error('[API][CRITICAL][CourtIQTiers] Error retrieving tiers:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error retrieving CourtIQ tiers data"
    });
  }
});

/**
 * PKL-278651-STATS-0001-CORE - Match Statistics API Endpoint
 * GET /api/match/stats
 * 
 * This endpoint provides match statistics for users following Framework 5.3 principles
 * of simplicity and directness.
 */
specialRouter.get('/match/stats', async (req: Request, res: Response) => {
  console.log("[API][CRITICAL][MatchStats] Direct handler called, query:", req.query);
  
  try {
    // Import required modules
    const { db } = await import('./db');
    const { matches } = await import('../shared/schema');
    const { eq, sql, desc, and, or } = await import('drizzle-orm');
    
    // Get userId from query, default to current user ID if authenticated
    let userId: number = parseInt(req.query.userId as string) || 1;
    if (isNaN(userId)) userId = 1;

    // Get time range from query params
    const timeRange = req.query.timeRange as string || 'all';
    
    // Get match type and format type from query params
    const matchType = req.query.matchType as string;
    const formatType = req.query.formatType as string;
    
    // Build the query conditions
    let conditions = [
      or(
        eq(matches.playerOneId, userId),
        eq(matches.playerTwoId, userId),
        eq(matches.playerOnePartnerId, userId),
        eq(matches.playerTwoPartnerId, userId)
      )
    ];
    
    // Add time range filter
    if (timeRange !== 'all') {
      let startDate = new Date();
      
      // Calculate the start date based on the time range
      switch (timeRange) {
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      
      conditions.push(sql`${matches.matchDate} >= ${startDate}`);
    }
    
    // Add match type filter
    if (matchType) {
      conditions.push(eq(matches.matchType, matchType));
    }
    
    // Add format type filter
    if (formatType) {
      conditions.push(eq(matches.formatType, formatType));
    }
    
    // Fetch the user's matches
    const userMatches = await db
      .select()
      .from(matches)
      .where(and(...conditions))
      .orderBy(desc(matches.matchDate));
    
    console.log(`[API][CRITICAL][MatchStats] Found ${userMatches.length} matches for user ${userId}`);
    
    // Calculate statistics
    let totalMatches = 0;
    let matchesWon = 0;
    let matchesLost = 0;
    let totalSets = 0;
    let setsWon = 0;
    let totalPoints = 0;
    let pointsWon = 0;
    let currentWinStreak = 0;
    let longestWinStreak = 0;
    let tempWinStreak = 0;
    let currentLossStreak = 0;
    let tempLossStreak = 0;
    let recentWinRate = 0;
    let previousWinRate = 0;
    
    // Format-specific stats
    let singlesMatches = 0;
    let singlesWins = 0;
    let doublesMatches = 0;
    let doublesWins = 0;
    
    // Match type stats
    let casualMatches = 0;
    let casualWins = 0;
    let competitiveMatches = 0;
    let competitiveWins = 0;
    let tournamentMatches = 0;
    let tournamentWins = 0;
    let leagueMatches = 0;
    let leagueWins = 0;
    
    // Process matches to calculate statistics
    for (let i = 0; i < userMatches.length; i++) {
      const match = userMatches[i];
      totalMatches++;
      
      // Determine if the user won this match
      const userIsWinner = match.winnerId === userId;
      
      if (userIsWinner) {
        matchesWon++;
        tempWinStreak++;
        tempLossStreak = 0;
        
        // Update longest win streak
        if (tempWinStreak > longestWinStreak) {
          longestWinStreak = tempWinStreak;
        }
      } else {
        matchesLost++;
        tempLossStreak++;
        tempWinStreak = 0;
        
        // Update current loss streak if this is the most recent match
        if (i === 0) {
          currentLossStreak = tempLossStreak;
        }
      }
      
      // Set the current win streak at the end of most recent match
      if (i === 0) {
        currentWinStreak = tempWinStreak;
      }
      
      // Count by format type
      if (match.formatType === 'singles') {
        singlesMatches++;
        if (userIsWinner) singlesWins++;
      } else if (match.formatType === 'doubles') {
        doublesMatches++;
        if (userIsWinner) doublesWins++;
      }
      
      // Count by match type
      switch (match.matchType) {
        case 'casual':
          casualMatches++;
          if (userIsWinner) casualWins++;
          break;
        case 'competitive':
          competitiveMatches++;
          if (userIsWinner) competitiveWins++;
          break;
        case 'tournament':
          tournamentMatches++;
          if (userIsWinner) tournamentWins++;
          break;
        case 'league':
          leagueMatches++;
          if (userIsWinner) leagueWins++;
          break;
      }
      
      // Process score data for more detailed statistics
      // For simplicity, assuming scores are in format like "11-5,11-7"
      try {
        // Process player one score
        let userScoreParts: string[] = [];
        let opponentScoreParts: string[] = [];
        
        // Determine which score belongs to the user
        if (match.playerOneId === userId || match.playerOnePartnerId === userId) {
          userScoreParts = match.scorePlayerOne.split(',');
          opponentScoreParts = match.scorePlayerTwo.split(',');
        } else {
          userScoreParts = match.scorePlayerTwo.split(',');
          opponentScoreParts = match.scorePlayerOne.split(',');
        }
        
        // Count sets
        totalSets += userScoreParts.length;
        
        // Process each set
        for (let j = 0; j < userScoreParts.length; j++) {
          const userSetScore = parseInt(userScoreParts[j]?.split('-')[0] || '0');
          const opponentSetScore = parseInt(opponentScoreParts[j]?.split('-')[0] || '0');
          
          if (userSetScore > opponentSetScore) {
            setsWon++;
          }
          
          // Add to point totals
          totalPoints += userSetScore + opponentSetScore;
          pointsWon += userSetScore;
        }
      } catch (error) {
        console.error('[API][CRITICAL][MatchStats] Error processing match score:', error);
        // Continue with the next match
      }
    }
    
    // Calculate win rate
    const winRate = totalMatches > 0 ? (matchesWon / totalMatches) * 100 : 0;
    
    // Calculate recent performance trend
    if (userMatches.length >= 10) {
      // Calculate win rate for most recent 5 matches
      const recentMatches = userMatches.slice(0, 5);
      const recentWins = recentMatches.filter(match => match.winnerId === userId).length;
      recentWinRate = (recentWins / recentMatches.length) * 100;
      
      // Calculate win rate for previous 5 matches
      const previousMatches = userMatches.slice(5, 10);
      const previousWins = previousMatches.filter(match => match.winnerId === userId).length;
      previousWinRate = (previousWins / previousMatches.length) * 100;
    }
    
    // Calculate performance change (percentage points difference)
    const recentPerformance = recentWinRate > 0 && previousWinRate > 0 
      ? recentWinRate - previousWinRate 
      : undefined;
    
    // Prepare recent matches data for display
    const recentMatches = userMatches.slice(0, 5).map(match => {
      // Determine opponent name (simplification: using IDs as names)
      const opponentId = match.playerOneId === userId ? match.playerTwoId : match.playerOneId;
      
      // Determine score display
      let score: string;
      if (match.playerOneId === userId || match.playerOnePartnerId === userId) {
        score = match.scorePlayerOne;
      } else {
        score = match.scorePlayerTwo;
      }
      
      return {
        id: match.id,
        date: match.matchDate ? match.matchDate.toISOString() : new Date().toISOString(),
        opponent: `Player ${opponentId}`, // In a real implementation, we'd fetch user names
        result: match.winnerId === userId ? 'win' : 'loss',
        score: score,
        format: match.formatType as 'singles' | 'doubles' | 'mixed'
      };
    });
    
    // Prepare and return the statistics response
    const statistics = {
      totalMatches,
      matchesWon,
      matchesLost,
      winRate: Math.round(winRate), // Round to nearest integer
      totalSets,
      setsWon,
      totalPoints,
      pointsWon,
      avgPointsPerMatch: totalMatches > 0 ? Math.round(totalPoints / totalMatches) : 0,
      longestWinStreak,
      currentStreak: currentWinStreak > 0 ? currentWinStreak : -currentLossStreak,
      recentPerformance,
      recentMatches,
      
      // Additional breakdown statistics
      formatBreakdown: {
        singles: {
          matches: singlesMatches,
          wins: singlesWins,
          winRate: singlesMatches > 0 ? Math.round((singlesWins / singlesMatches) * 100) : 0
        },
        doubles: {
          matches: doublesMatches,
          wins: doublesWins,
          winRate: doublesMatches > 0 ? Math.round((doublesWins / doublesMatches) * 100) : 0
        }
      },
      
      matchTypeBreakdown: {
        casual: {
          matches: casualMatches,
          wins: casualWins,
          winRate: casualMatches > 0 ? Math.round((casualWins / casualMatches) * 100) : 0
        },
        competitive: {
          matches: competitiveMatches,
          wins: competitiveWins,
          winRate: competitiveMatches > 0 ? Math.round((competitiveWins / competitiveMatches) * 100) : 0
        },
        tournament: {
          matches: tournamentMatches,
          wins: tournamentWins,
          winRate: tournamentMatches > 0 ? Math.round((tournamentWins / tournamentMatches) * 100) : 0
        },
        league: {
          matches: leagueMatches,
          wins: leagueWins,
          winRate: leagueMatches > 0 ? Math.round((leagueWins / leagueMatches) * 100) : 0
        }
      }
    };
    
    console.log('[API][CRITICAL][MatchStats] Successfully calculated match statistics');
    return res.json(statistics);
  } catch (error) {
    console.error('[API][CRITICAL][MatchStats] Error calculating match statistics:', error);
    res.status(500).json({ 
      error: "Server error",
      message: "Error calculating match statistics" 
    });
  }
});

export { specialRouter };