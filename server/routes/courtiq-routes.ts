/**
 * CourtIQ™ Rating System API Routes
 * PKL-278651-RATINGS-0001-COURTIQ - Multi-dimensional Rating System
 * 
 * This module defines the API routes for the CourtIQ™ rating system.
 */

import { Router } from "express";
import { z } from "zod";
import { 
  insertMatchAssessmentSchema,
  insertIncompleteAssessmentSchema
} from "@shared/schema/courtiq";
import { courtiqStorage } from "../services/courtiq-storage";
import { courtiqCalculator } from "../services/courtiq-calculator-fixed";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// Get user CourtIQ™ ratings
router.get("/ratings/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const ratings = await courtiqStorage.getUserRatings(userId);
    
    if (!ratings) {
      return res.status(404).json({ 
        error: "Ratings not found",
        message: "The specified user does not have any CourtIQ™ ratings yet."
      });
    }
    
    res.json(ratings);
  } catch (error) {
    console.error("Error getting user ratings:", error);
    res.status(500).json({ error: "Failed to retrieve user ratings" });
  }
});

// Get user assessment history
router.get("/assessments/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "Invalid limit parameter" });
    }
    
    const assessments = await courtiqStorage.getUserAssessments(userId, limit);
    res.json(assessments);
  } catch (error) {
    console.error("Error getting user assessments:", error);
    res.status(500).json({ error: "Failed to retrieve user assessments" });
  }
});

// Get match assessments
router.get("/match-assessments/:matchId", async (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    
    if (isNaN(matchId)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }
    
    const assessments = await courtiqStorage.getMatchAssessments(matchId);
    res.json(assessments);
  } catch (error) {
    console.error("Error getting match assessments:", error);
    res.status(500).json({ error: "Failed to retrieve match assessments" });
  }
});

// Save a match assessment (protected route)
router.post("/assessment", isAuthenticated, async (req, res) => {
  try {
    // Validate request body
    const validationResult = insertMatchAssessmentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid assessment data",
        details: validationResult.error.format()
      });
    }
    
    // Save the assessment
    const assessment = await courtiqStorage.saveMatchAssessment(validationResult.data);
    
    // Process the assessment to update player ratings
    const updatedRating = await courtiqCalculator.processMatchAssessment(assessment);
    
    // Delete any incomplete assessment now that it's complete
    await courtiqStorage.deleteIncompleteAssessment(
      assessment.matchId,
      assessment.assessorId,
      assessment.targetId
    );
    
    res.status(201).json({ 
      assessment,
      updatedRating,
      message: "Assessment saved and player ratings updated successfully."
    });
  } catch (error) {
    console.error("Error saving match assessment:", error);
    res.status(500).json({ error: "Failed to save match assessment" });
  }
});

// Save an incomplete assessment (auto-save) (protected route)
router.post("/incomplete-assessment", isAuthenticated, async (req, res) => {
  try {
    // Validate request body
    const validationResult = insertIncompleteAssessmentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid incomplete assessment data",
        details: validationResult.error.format()
      });
    }
    
    // Save the incomplete assessment
    const savedAssessment = await courtiqStorage.saveIncompleteAssessment(validationResult.data);
    
    res.status(201).json({ 
      savedAssessment,
      message: "Incomplete assessment saved successfully"
    });
  } catch (error) {
    console.error("Error saving incomplete assessment:", error);
    res.status(500).json({ error: "Failed to save incomplete assessment" });
  }
});

// Get an incomplete assessment (protected route)
router.get("/incomplete-assessment", isAuthenticated, async (req, res) => {
  try {
    const matchId = parseInt(req.query.matchId as string);
    const assessorId = parseInt(req.query.assessorId as string);
    const targetId = parseInt(req.query.targetId as string);
    
    if (isNaN(matchId) || isNaN(assessorId) || isNaN(targetId)) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    
    const assessment = await courtiqStorage.getIncompleteAssessment(matchId, assessorId, targetId);
    
    if (!assessment) {
      return res.status(404).json({ 
        error: "Incomplete assessment not found",
        message: "No saved draft found for this assessment."
      });
    }
    
    res.json(assessment);
  } catch (error) {
    console.error("Error getting incomplete assessment:", error);
    res.status(500).json({ error: "Failed to retrieve incomplete assessment" });
  }
});

// Get user rating progression
router.get("/progression/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const dimension = req.query.dimension as string || 'OVERALL';
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    // Validate dimension
    const validDimensions = ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS', 'OVERALL'];
    if (!validDimensions.includes(dimension)) {
      return res.status(400).json({ error: "Invalid dimension" });
    }
    
    // Parse optional date parameters
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ error: "Invalid start date" });
      }
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ error: "Invalid end date" });
      }
    }
    
    const progression = await courtiqStorage.getUserRatingProgression(
      userId,
      dimension,
      startDate,
      endDate
    );
    
    res.json(progression);
  } catch (error) {
    console.error("Error getting user rating progression:", error);
    res.status(500).json({ error: "Failed to retrieve user rating progression" });
  }
});

// Get top rated players
router.get("/top-players", async (req, res) => {
  try {
    const dimension = req.query.dimension as string || 'OVERALL';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // Validate dimension
    const validDimensions = ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS', 'OVERALL'];
    if (!validDimensions.includes(dimension)) {
      return res.status(400).json({ error: "Invalid dimension" });
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ error: "Invalid limit parameter" });
    }
    
    const topPlayers = await courtiqStorage.getTopRatedPlayers(dimension, limit);
    res.json(topPlayers);
  } catch (error) {
    console.error("Error getting top rated players:", error);
    res.status(500).json({ error: "Failed to retrieve top rated players" });
  }
});

// Get similar players
router.get("/similar-players/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    if (isNaN(limit) || limit < 1 || limit > 20) {
      return res.status(400).json({ error: "Invalid limit parameter" });
    }
    
    const similarPlayers = await courtiqStorage.getSimilarPlayers(userId, limit);
    res.json(similarPlayers);
  } catch (error) {
    console.error("Error getting similar players:", error);
    res.status(500).json({ error: "Failed to retrieve similar players" });
  }
});

// Get player strengths and weaknesses analysis
router.get("/analysis/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const analysis = await courtiqCalculator.analyzePlayerStrengthsWeaknesses(userId);
    res.json(analysis);
  } catch (error) {
    console.error("Error getting player analysis:", error);
    res.status(500).json({ error: "Failed to analyze player strengths and weaknesses" });
  }
});

// Get coaching recommendations
router.get("/recommendations/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const recommendations = await courtiqCalculator.generateCoachingRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error("Error getting coaching recommendations:", error);
    res.status(500).json({ error: "Failed to generate coaching recommendations" });
  }
});

// Get performance data for the performance chart
router.get("/performance", async (req, res) => {
  try {
    console.log("[API][CRITICAL][CourtIQ] Direct handler called, query:", req.query);
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const format = req.query.format as string;
    const division = req.query.division as string;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid or missing user ID" });
    }
    
    // Check match requirements first
    const matchCount = 0; // TODO: Get actual match count for the user
    
    if (matchCount < 5) {
      return res.json({
        status: "insufficient_data",
        message: "Not enough match data to generate performance metrics",
        requiredMatches: 5,
        currentMatches: matchCount,
        guidance: {
          title: "Start tracking your performance",
          description: "Play at least 5 matches to unlock your CourtIQ™ Performance metrics",
          primaryAction: "Record a match",
          primaryActionPath: "/record-match"
        }
      });
    }
    
    // Get user ratings
    const ratings = await courtiqStorage.getUserRatings(userId);
    
    if (!ratings || (ratings.assessmentCount !== null && ratings.assessmentCount < 3)) {
      return res.json({
        status: "insufficient_data",
        message: "Not enough assessments to generate performance chart.",
        requiredAssessments: 3,
        currentAssessments: ratings?.assessmentCount || 0,
        guidance: {
          title: "Get assessed to view your ratings",
          description: "Request assessments from coaches or peers to unlock your CourtIQ™ Performance metrics",
          primaryAction: "Request Assessment",
          primaryActionPath: "/request-assessment"
        }
      });
    }
    
    // Extract the radar chart data
    const radarData = {
      technical: ratings.technicalRating || 0,
      tactical: ratings.tacticalRating || 0,
      physical: ratings.physicalRating || 0,
      mental: ratings.mentalRating || 0,
      consistency: ratings.consistencyRating || 0,
      overall: ratings.overallRating || 0
    };
    
    // Get top players data for comparison (if format and division specified)
    let comparisonData = null;
    if (format && division) {
      // In a real implementation, this would filter by format and division
      // For now, we'll just return the top overall player for demonstration
      const [topPlayer] = await courtiqStorage.getTopRatedPlayers('OVERALL', 1);
      
      if (topPlayer) {
        comparisonData = {
          playerId: topPlayer.userId,
          playerName: topPlayer.displayName || topPlayer.username,
          technical: topPlayer.rating, // This would be specific to dimension in a real implementation
          tactical: topPlayer.rating,
          physical: topPlayer.rating,
          mental: topPlayer.rating,
          consistency: topPlayer.rating,
          overall: topPlayer.rating
        };
      }
    }
    
    // Get recommendations for areas of improvement
    const recommendations = await courtiqCalculator.generateCoachingRecommendations(userId);
    
    res.json({
      status: "success",
      message: "Performance data retrieved successfully.",
      data: {
        radarData,
        comparisonData,
        confidenceScore: ratings.confidenceScore || 0,
        assessmentCount: ratings.assessmentCount || 0,
        priorityImprovement: recommendations.priorityArea,
        recommendationSummary: recommendations.overallAdvice
      }
    });
  } catch (error) {
    console.error("Error getting performance data:", error);
    res.status(500).json({ error: "Failed to retrieve performance data" });
  }
});

export default router;