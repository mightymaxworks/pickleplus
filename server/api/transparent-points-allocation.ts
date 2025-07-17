/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Phase 2: Transparent Points Allocation API
 * 
 * API routes for transparent PCP points allocation system with detailed breakdown
 * and coach-match correlation metrics
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-17
 */

import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// Request schemas
const pointsAllocationSchema = z.object({
  matchId: z.number(),
  playerId: z.number(),
  coachId: z.number().optional(),
  sessionMatchId: z.number().optional(),
  basePoints: z.number(),
  coachingMultiplier: z.number().default(1.0),
  improvementBonus: z.number().default(0.0),
  consistencyBonus: z.number().default(0.0),
  technicalPoints: z.number(),
  tacticalPoints: z.number(),
  physicalPoints: z.number(),
  mentalPoints: z.number(),
  totalPoints: z.number(),
  calculationMethod: z.string().default('standard'),
  factorsConsidered: z.object({
    matchResult: z.boolean(),
    opponentRating: z.boolean(),
    coachingPresence: z.boolean(),
    skillImprovement: z.boolean(),
    consistency: z.boolean(),
    matchContext: z.boolean()
  }).optional(),
  breakdown: z.array(z.object({
    category: z.string(),
    description: z.string(),
    value: z.number(),
    reasoning: z.string()
  })).optional()
});

const coachEffectivenessSchema = z.object({
  coachId: z.number(),
  sessionMatchId: z.number(),
  studentId: z.number(),
  matchId: z.number(),
  preMatchEffectiveness: z.number().default(0.0),
  liveCoachingEffectiveness: z.number().default(0.0),
  postMatchEffectiveness: z.number().default(0.0),
  immediateImprovement: z.number().default(0.0),
  sessionToSessionImprovement: z.number().default(0.0),
  pointsWithoutCoaching: z.number(),
  pointsWithCoaching: z.number(),
  coachingImpact: z.number(),
  effectivenessFactors: z.array(z.object({
    factor: z.string(),
    score: z.number(),
    weight: z.number(),
    description: z.string()
  })).optional(),
  overallEffectiveness: z.number()
});

const correlationSchema = z.object({
  coachId: z.number(),
  studentId: z.number(),
  periodStart: z.string().transform(str => new Date(str)),
  periodEnd: z.string().transform(str => new Date(str)),
  matchesWithCoaching: z.number().default(0),
  matchesWithoutCoaching: z.number().default(0),
  avgPointsWithCoaching: z.number().default(0.0),
  avgPointsWithoutCoaching: z.number().default(0.0),
  improvementDifference: z.number().default(0.0),
  technicalProgression: z.number().default(0.0),
  tacticalProgression: z.number().default(0.0),
  physicalProgression: z.number().default(0.0),
  mentalProgression: z.number().default(0.0),
  correlationCoefficient: z.number().default(0.0),
  confidenceLevel: z.number().default(0.0),
  trendAnalysis: z.array(z.object({
    period: z.string(),
    trend: z.string(),
    strength: z.number(),
    description: z.string()
  })).optional()
});

const performancePredictionSchema = z.object({
  studentId: z.number(),
  coachId: z.number().optional(),
  predictionType: z.string(),
  targetDate: z.string().transform(str => new Date(str)),
  confidenceLevel: z.number(),
  predictedPoints: z.number(),
  predictedRating: z.number(),
  technicalPrediction: z.number(),
  tacticalPrediction: z.number(),
  physicalPrediction: z.number(),
  mentalPrediction: z.number(),
  predictionFactors: z.array(z.object({
    factor: z.string(),
    weight: z.number(),
    currentValue: z.number(),
    trendDirection: z.string(),
    impact: z.number()
  })).optional(),
  recommendedFocus: z.array(z.string()).optional(),
  trainingRecommendations: z.string().optional()
});

export const transparentPointsAllocationRoutes = {
  // POST /api/transparent-points/allocation - Create transparent points allocation breakdown
  async createPointsAllocation(req: Request, res: Response) {
    try {
      const validatedData = pointsAllocationSchema.parse(req.body);
      
      const allocation = await storage.createPointsAllocationBreakdown(validatedData);
      
      res.status(201).json({
        success: true,
        data: allocation,
        message: 'Points allocation breakdown created successfully'
      });
    } catch (error) {
      console.error('Error creating points allocation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create points allocation breakdown'
      });
    }
  },

  // GET /api/transparent-points/allocation/:matchId/:playerId - Get points allocation breakdown
  async getPointsAllocation(req: Request, res: Response) {
    try {
      const { matchId, playerId } = req.params;
      
      const allocation = await storage.getPointsAllocationBreakdown(
        parseInt(matchId),
        parseInt(playerId)
      );
      
      if (!allocation) {
        return res.status(404).json({
          success: false,
          error: 'Points allocation breakdown not found'
        });
      }
      
      res.json({
        success: true,
        data: allocation
      });
    } catch (error) {
      console.error('Error getting points allocation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get points allocation breakdown'
      });
    }
  },

  // POST /api/transparent-points/coach-effectiveness - Create coach effectiveness scoring
  async createCoachEffectiveness(req: Request, res: Response) {
    try {
      const validatedData = coachEffectivenessSchema.parse(req.body);
      
      const effectiveness = await storage.createCoachEffectivenessScoring(validatedData);
      
      res.status(201).json({
        success: true,
        data: effectiveness,
        message: 'Coach effectiveness scoring created successfully'
      });
    } catch (error) {
      console.error('Error creating coach effectiveness:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create coach effectiveness scoring'
      });
    }
  },

  // GET /api/transparent-points/coach-effectiveness/:coachId - Get coach effectiveness scoring
  async getCoachEffectiveness(req: Request, res: Response) {
    try {
      const { coachId } = req.params;
      const { studentId } = req.query;
      
      const effectiveness = await storage.getCoachEffectivenessScoring(
        parseInt(coachId),
        studentId ? parseInt(studentId as string) : undefined
      );
      
      res.json({
        success: true,
        data: effectiveness
      });
    } catch (error) {
      console.error('Error getting coach effectiveness:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get coach effectiveness scoring'
      });
    }
  },

  // POST /api/transparent-points/correlation - Create match-coaching correlation
  async createMatchCoachingCorrelation(req: Request, res: Response) {
    try {
      const validatedData = correlationSchema.parse(req.body);
      
      const correlation = await storage.createMatchCoachingCorrelation(validatedData);
      
      res.status(201).json({
        success: true,
        data: correlation,
        message: 'Match-coaching correlation created successfully'
      });
    } catch (error) {
      console.error('Error creating correlation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create match-coaching correlation'
      });
    }
  },

  // GET /api/transparent-points/correlation/:coachId/:studentId - Get match-coaching correlation
  async getMatchCoachingCorrelation(req: Request, res: Response) {
    try {
      const { coachId, studentId } = req.params;
      
      const correlation = await storage.getMatchCoachingCorrelation(
        parseInt(coachId),
        parseInt(studentId)
      );
      
      if (!correlation) {
        return res.status(404).json({
          success: false,
          error: 'Match-coaching correlation not found'
        });
      }
      
      res.json({
        success: true,
        data: correlation
      });
    } catch (error) {
      console.error('Error getting correlation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get match-coaching correlation'
      });
    }
  },

  // PUT /api/transparent-points/correlation/:coachId/:studentId - Update match-coaching correlation
  async updateMatchCoachingCorrelation(req: Request, res: Response) {
    try {
      const { coachId, studentId } = req.params;
      const updates = req.body;
      
      const correlation = await storage.updateMatchCoachingCorrelation(
        parseInt(coachId),
        parseInt(studentId),
        updates
      );
      
      res.json({
        success: true,
        data: correlation,
        message: 'Match-coaching correlation updated successfully'
      });
    } catch (error) {
      console.error('Error updating correlation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update match-coaching correlation'
      });
    }
  },

  // POST /api/transparent-points/performance-prediction - Create student performance prediction
  async createPerformancePrediction(req: Request, res: Response) {
    try {
      const validatedData = performancePredictionSchema.parse(req.body);
      
      const prediction = await storage.createStudentPerformancePrediction(validatedData);
      
      res.status(201).json({
        success: true,
        data: prediction,
        message: 'Student performance prediction created successfully'
      });
    } catch (error) {
      console.error('Error creating performance prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create student performance prediction'
      });
    }
  },

  // GET /api/transparent-points/performance-prediction/:studentId - Get student performance predictions
  async getPerformancePrediction(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const { predictionType } = req.query;
      
      const predictions = await storage.getStudentPerformancePrediction(
        parseInt(studentId),
        predictionType as string
      );
      
      res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      console.error('Error getting performance prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get student performance prediction'
      });
    }
  },

  // PUT /api/transparent-points/performance-prediction/:id - Update student performance prediction
  async updatePerformancePrediction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const prediction = await storage.updateStudentPerformancePrediction(
        parseInt(id),
        updates
      );
      
      res.json({
        success: true,
        data: prediction,
        message: 'Student performance prediction updated successfully'
      });
    } catch (error) {
      console.error('Error updating performance prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update student performance prediction'
      });
    }
  },

  // GET /api/transparent-points/analytics/:coachId - Get comprehensive analytics for coach
  async getCoachAnalytics(req: Request, res: Response) {
    try {
      const { coachId } = req.params;
      
      // Get coach effectiveness across all students
      const effectiveness = await storage.getCoachEffectivenessScoring(parseInt(coachId));
      
      // Calculate overall metrics
      const overallMetrics = {
        totalSessions: effectiveness.length,
        averageEffectiveness: effectiveness.reduce((sum, e) => sum + parseFloat(e.overallEffectiveness.toString()), 0) / effectiveness.length || 0,
        totalImpact: effectiveness.reduce((sum, e) => sum + parseFloat(e.coachingImpact.toString()), 0),
        improvementRate: effectiveness.reduce((sum, e) => sum + parseFloat(e.immediateImprovement.toString()), 0) / effectiveness.length || 0
      };
      
      res.json({
        success: true,
        data: {
          overallMetrics,
          effectiveness,
          insights: {
            strongestArea: 'Technical coaching',
            improvementArea: 'Mental coaching',
            recommendedFocus: 'Develop mental game coaching techniques'
          }
        }
      });
    } catch (error) {
      console.error('Error getting coach analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get coach analytics'
      });
    }
  }
};