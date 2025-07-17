/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Backend API Routes
 * 
 * API endpoints for coach-match integration system including
 * assessment capture and transparent points generation
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-17
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// Validation schemas
const AssessmentSubmissionSchema = z.object({
  matchId: z.number().optional(),
  playerId: z.number(),
  coachId: z.number(),
  assessment: z.object({
    technical: z.number().min(0).max(100),
    tactical: z.number().min(0).max(100),
    physical: z.number().min(0).max(100),
    mental: z.number().min(0).max(100),
    overallImprovement: z.number().min(0).max(100),
    sessionNotes: z.string(),
    keyObservations: z.array(z.string()),
    recommendedFocus: z.array(z.string())
  }),
  pointsData: z.object({
    basePoints: z.number(),
    coachingMultiplier: z.number(),
    improvementBonus: z.number(),
    technicalContribution: z.number(),
    tacticalContribution: z.number(),
    physicalContribution: z.number(),
    mentalContribution: z.number(),
    totalPoints: z.number(),
    calculationDetails: z.array(z.string())
  }),
  capturePhase: z.enum(['pre', 'live', 'post']),
  timestamp: z.string()
});

const TransparentPointsRequestSchema = z.object({
  coachId: z.number(),
  studentId: z.number(),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }).optional()
});

// POST /api/coach-match-integration/submit-assessment
router.post('/submit-assessment', async (req, res) => {
  try {
    const validatedData = AssessmentSubmissionSchema.parse(req.body);
    
    // Calculate final transparent points
    const transparentPoints = calculateTransparentPoints(validatedData);
    
    // Store assessment in database
    const assessmentId = await storage.createCoachAssessment({
      matchId: validatedData.matchId,
      playerId: validatedData.playerId,
      coachId: validatedData.coachId,
      technicalScore: validatedData.assessment.technical,
      tacticalScore: validatedData.assessment.tactical,
      physicalScore: validatedData.assessment.physical,
      mentalScore: validatedData.assessment.mental,
      overallImprovement: validatedData.assessment.overallImprovement,
      sessionNotes: validatedData.assessment.sessionNotes,
      keyObservations: validatedData.assessment.keyObservations,
      recommendedFocus: validatedData.assessment.recommendedFocus,
      capturePhase: validatedData.capturePhase,
      createdAt: new Date(validatedData.timestamp)
    });
    
    // Store transparent points breakdown
    await storage.createTransparentPointsBreakdown({
      assessmentId,
      playerId: validatedData.playerId,
      coachId: validatedData.coachId,
      matchId: validatedData.matchId,
      basePoints: transparentPoints.basePoints,
      coachingMultiplier: transparentPoints.coachingMultiplier,
      improvementBonus: transparentPoints.improvementBonus,
      technicalPoints: transparentPoints.technicalContribution,
      tacticalPoints: transparentPoints.tacticalContribution,
      physicalPoints: transparentPoints.physicalContribution,
      mentalPoints: transparentPoints.mentalContribution,
      totalPoints: transparentPoints.totalPoints,
      calculationMethod: 'pcp_4_dimensional',
      factorsConsidered: {
        matchResult: !!validatedData.matchId,
        opponentRating: true,
        coachingPresence: true,
        skillImprovement: validatedData.assessment.overallImprovement > 0,
        consistency: true,
        matchContext: true
      },
      breakdown: transparentPoints.calculationDetails.map((detail, index) => ({
        category: getBreakdownCategory(index),
        description: detail,
        value: getBreakdownValue(detail),
        reasoning: `Based on coach assessment: ${detail}`
      }))
    });
    
    res.json({
      success: true,
      assessmentId,
      transparentPoints,
      message: 'Assessment submitted and transparent points generated successfully'
    });
    
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit assessment'
    });
  }
});

// GET /api/coach-match-integration/transparent-points
router.get('/transparent-points', async (req, res) => {
  try {
    const { coachId, studentId, dateRange } = req.query;
    
    if (!coachId || !studentId) {
      return res.status(400).json({
        success: false,
        error: 'Coach ID and Student ID are required'
      });
    }
    
    // Get transparent points breakdown
    const pointsBreakdown = await storage.getTransparentPointsBreakdown({
      coachId: Number(coachId),
      studentId: Number(studentId),
      dateRange: dateRange ? {
        start: new Date(dateRange.start as string),
        end: new Date(dateRange.end as string)
      } : undefined
    });
    
    // Get coach effectiveness metrics
    const coachEffectiveness = await storage.getCoachEffectiveness({
      coachId: Number(coachId),
      studentId: Number(studentId)
    });
    
    // Get match-coaching correlation
    const matchCoachingCorrelation = await storage.getMatchCoachingCorrelation({
      coachId: Number(coachId),
      studentId: Number(studentId)
    });
    
    res.json({
      success: true,
      data: {
        pointsBreakdown,
        coachEffectiveness,
        matchCoachingCorrelation,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching transparent points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transparent points data'
    });
  }
});

// GET /api/coach-match-integration/assessment-history/:playerId
router.get('/assessment-history/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { coachId, limit = 10 } = req.query;
    
    const assessmentHistory = await storage.getAssessmentHistory({
      playerId: Number(playerId),
      coachId: coachId ? Number(coachId) : undefined,
      limit: Number(limit)
    });
    
    res.json({
      success: true,
      data: assessmentHistory
    });
    
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessment history'
    });
  }
});

// Utility functions
function calculateTransparentPoints(data: any) {
  const { assessment, pointsData } = data;
  
  // Calculate weighted average of assessments
  const technicalScore = (assessment.technical / 100) * 0.4; // 40% weight
  const tacticalScore = (assessment.tactical / 100) * 0.25; // 25% weight
  const physicalScore = (assessment.physical / 100) * 0.2; // 20% weight
  const mentalScore = (assessment.mental / 100) * 0.15; // 15% weight
  
  const overallScore = technicalScore + tacticalScore + physicalScore + mentalScore;
  
  // Calculate coaching multiplier (1.0 - 1.5x based on overall improvement)
  const coachingMultiplier = 1.0 + (assessment.overallImprovement / 100) * 0.5;
  
  // Calculate improvement bonus (0-3 points)
  const improvementBonus = (assessment.overallImprovement / 100) * 3;
  
  // Calculate dimensional contributions
  const basePoints = 10;
  const technicalContribution = basePoints * technicalScore;
  const tacticalContribution = basePoints * tacticalScore;
  const physicalContribution = basePoints * physicalScore;
  const mentalContribution = basePoints * mentalScore;
  
  const totalPoints = (basePoints * overallScore * coachingMultiplier) + improvementBonus;
  
  const calculationDetails = [
    `Base Points: ${basePoints}`,
    `Technical (40%): ${technicalScore.toFixed(2)} → ${technicalContribution.toFixed(1)} points`,
    `Tactical (25%): ${tacticalScore.toFixed(2)} → ${tacticalContribution.toFixed(1)} points`,
    `Physical (20%): ${physicalScore.toFixed(2)} → ${physicalContribution.toFixed(1)} points`,
    `Mental (15%): ${mentalScore.toFixed(2)} → ${mentalContribution.toFixed(1)} points`,
    `Coaching Multiplier: ${coachingMultiplier.toFixed(2)}x`,
    `Improvement Bonus: +${improvementBonus.toFixed(1)} points`,
    `Total: ${totalPoints.toFixed(1)} points`
  ];
  
  return {
    basePoints,
    coachingMultiplier,
    improvementBonus,
    technicalContribution,
    tacticalContribution,
    physicalContribution,
    mentalContribution,
    totalPoints,
    calculationDetails
  };
}

function getBreakdownCategory(index: number): string {
  const categories = [
    'base_points',
    'technical_assessment',
    'tactical_assessment',
    'physical_assessment',
    'mental_assessment',
    'coaching_multiplier',
    'improvement_bonus',
    'total_calculation'
  ];
  return categories[index] || 'other';
}

function getBreakdownValue(detail: string): number {
  const match = detail.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

export default router;