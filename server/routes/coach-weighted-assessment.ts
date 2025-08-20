/**
 * Coach Level Weighted Assessment API Routes
 * 
 * Implements the sophisticated coach-weighted PCP assessment system
 * with proper validation, authorization, and quality metrics.
 */

import { Router } from 'express';
import { z } from 'zod';
import { 
  calculateWeightedPCP,
  validateAssessmentRequirements,
  getNextAssessmentRecommendation,
  getAssessmentsRequiringValidation,
  type CoachAssessment 
} from '@shared/utils/coachWeightedAssessment';
import { requireAuth } from '../middleware/auth';
import { requireCoachLevel } from '../middleware/coaching';

const router = Router();

// Validation schemas
const assessmentSubmissionSchema = z.object({
  studentId: z.number(),
  scores: z.object({
    technical: z.number().min(0).max(10),
    tactical: z.number().min(0).max(10),
    physical: z.number().min(0).max(10),
    mental: z.number().min(0).max(10)
  }),
  skillRatings: z.record(z.string(), z.number().min(1).max(10)),
  sessionNotes: z.string().optional()
});

const weightedPCPRequestSchema = z.object({
  studentId: z.number(),
  includeHistorical: z.boolean().default(true),
  maxDaysBack: z.number().default(180)
});

/**
 * Submit a new coach assessment with automatic weighting
 * POST /api/coach-weighted-assessment/submit
 */
router.post('/submit', requireAuth, requireCoachLevel(1), async (req, res) => {
  try {
    const validatedData = assessmentSubmissionSchema.parse(req.body);
    const coachId = req.user!.id;
    const coachLevel = req.user!.coachLevel;

    // Create assessment record
    const newAssessment: CoachAssessment = {
      id: `assessment_${Date.now()}_${coachId}`,
      coachId,
      coachLevel,
      studentId: validatedData.studentId,
      assessmentDate: new Date(),
      scores: validatedData.scores,
      skillRatings: validatedData.skillRatings,
      sessionNotes: validatedData.sessionNotes
    };

    // Store in database (implementation depends on your storage system)
    // await storage.createCoachAssessment(newAssessment);

    // Get all assessments for this student to calculate weighted PCP
    // const studentAssessments = await storage.getStudentAssessments(validatedData.studentId);

    // For demonstration, creating mock data
    const studentAssessments: CoachAssessment[] = [newAssessment];

    // Calculate weighted PCP
    const weightedPCP = calculateWeightedPCP(studentAssessments);

    // Update student's PCP rating in main system
    // await storage.updateStudentPCPRating(validatedData.studentId, weightedPCP.finalPCPRating);

    res.status(201).json({
      success: true,
      assessment: {
        id: newAssessment.id,
        coachLevel,
        submittedAt: newAssessment.assessmentDate
      },
      weightedPCP,
      message: `Assessment submitted successfully. Coach L${coachLevel} weighting applied.`
    });

  } catch (error) {
    console.error('Assessment submission error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof z.ZodError ? 'Validation failed' : 'Assessment submission failed',
      details: error instanceof z.ZodError ? error.errors : error.message
    });
  }
});

/**
 * Calculate weighted PCP for a student based on all coach assessments
 * GET /api/coach-weighted-assessment/calculate/:studentId
 */
router.get('/calculate/:studentId', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    const query = weightedPCPRequestSchema.parse(req.query);

    // Get all assessments for the student
    // const assessments = await storage.getStudentAssessments(
    //   studentId, 
    //   query.includeHistorical, 
    //   query.maxDaysBack
    // );

    // Mock data for demonstration
    const assessments: CoachAssessment[] = [
      {
        id: 'assessment_1',
        coachId: 101,
        coachLevel: 2,
        studentId,
        assessmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        scores: { technical: 7.5, tactical: 6.8, physical: 8.2, mental: 7.0 },
        skillRatings: { serve_execution: 7, return_technique: 8 }
      },
      {
        id: 'assessment_2',
        coachId: 102,
        coachLevel: 4,
        studentId,
        assessmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        scores: { technical: 8.0, tactical: 7.5, physical: 8.0, mental: 7.8 },
        skillRatings: { serve_execution: 8, return_technique: 8 }
      }
    ];

    if (assessments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No assessments found for this student'
      });
    }

    // Validate assessment requirements
    const validation = validateAssessmentRequirements(assessments);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.reason,
        requiresHigherLevelValidation: validation.requiresHigherLevelValidation,
        assessmentsRequiringValidation: getAssessmentsRequiringValidation(assessments)
      });
    }

    // Calculate weighted PCP
    const weightedPCP = calculateWeightedPCP(assessments);

    // Get next assessment recommendation
    const nextAssessment = getNextAssessmentRecommendation(assessments);

    res.json({
      success: true,
      studentId,
      weightedPCP,
      nextAssessment,
      assessmentSummary: {
        totalAssessments: assessments.length,
        coachLevels: assessments.map(a => a.coachLevel),
        dateRange: {
          earliest: Math.min(...assessments.map(a => a.assessmentDate.getTime())),
          latest: Math.max(...assessments.map(a => a.assessmentDate.getTime()))
        }
      }
    });

  } catch (error) {
    console.error('Weighted PCP calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate weighted PCP',
      details: error.message
    });
  }
});

/**
 * Get assessment requirements and validation status for a student
 * GET /api/coach-weighted-assessment/validation-status/:studentId
 */
router.get('/validation-status/:studentId', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);

    // Get student assessments
    // const assessments = await storage.getStudentAssessments(studentId);

    // Mock data
    const assessments: CoachAssessment[] = [
      {
        id: 'assessment_1',
        coachId: 101,
        coachLevel: 1,
        studentId,
        assessmentDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        scores: { technical: 6.5, tactical: 6.0, physical: 7.5, mental: 6.2 },
        skillRatings: {}
      }
    ];

    const validation = validateAssessmentRequirements(assessments);
    const requiresValidation = getAssessmentsRequiringValidation(assessments);
    const nextAssessment = getNextAssessmentRecommendation(assessments);

    res.json({
      success: true,
      studentId,
      validation: {
        isValid: validation.isValid,
        reason: validation.reason,
        requiresHigherLevelValidation: validation.requiresHigherLevelValidation
      },
      assessmentsRequiringValidation: requiresValidation.map(a => ({
        id: a.id,
        coachId: a.coachId,
        coachLevel: a.coachLevel,
        daysSinceAssessment: Math.floor((Date.now() - a.assessmentDate.getTime()) / (1000 * 60 * 60 * 24))
      })),
      nextAssessment,
      currentStatus: {
        totalAssessments: assessments.length,
        highestCoachLevel: Math.max(...assessments.map(a => a.coachLevel)),
        latestAssessmentAge: assessments.length > 0 
          ? Math.floor((Date.now() - Math.max(...assessments.map(a => a.assessmentDate.getTime()))) / (1000 * 60 * 60 * 24))
          : null
      }
    });

  } catch (error) {
    console.error('Validation status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get validation status',
      details: error.message
    });
  }
});

/**
 * Get coach weighting information and capabilities
 * GET /api/coach-weighted-assessment/coach-info
 */
router.get('/coach-info', requireAuth, requireCoachLevel(1), async (req, res) => {
  try {
    const coachLevel = req.user!.coachLevel;
    const coachId = req.user!.id;

    // Get coach's weighting information
    const coachInfo = {
      coachId,
      coachLevel,
      assessmentCapabilities: {
        baseWeight: coachLevel === 1 ? 1.0 : 
                   coachLevel === 2 ? 1.3 :
                   coachLevel === 3 ? 1.6 :
                   coachLevel === 4 ? 2.0 : 2.5,
        confidenceFactors: {
          technical: coachLevel === 1 ? 0.8 : 
                    coachLevel === 2 ? 0.9 :
                    coachLevel === 3 ? 0.95 :
                    coachLevel === 4 ? 0.98 : 1.0,
          tactical: coachLevel === 1 ? 0.7 : 
                   coachLevel === 2 ? 0.8 :
                   coachLevel === 3 ? 0.9 :
                   coachLevel === 4 ? 0.95 : 0.98,
          physical: coachLevel === 1 ? 0.9 : 
                   coachLevel === 2 ? 0.9 :
                   coachLevel === 3 ? 0.9 :
                   coachLevel === 4 ? 0.92 : 0.95,
          mental: coachLevel === 1 ? 0.6 : 
                 coachLevel === 2 ? 0.7 :
                 coachLevel === 3 ? 0.8 :
                 coachLevel === 4 ? 0.9 : 0.95
        },
        validationAuthority: {
          canValidateL1L2: coachLevel >= 3,
          canProvideFinalAssessment: coachLevel >= 3,
          requiresValidation: coachLevel <= 2,
          assessmentValidityDays: coachLevel >= 3 ? 90 : 30
        }
      },
      specializations: coachLevel >= 4 ? [
        'Advanced tactical pattern recognition',
        'High-pressure performance analysis', 
        'Complex technical fault diagnosis'
      ] : coachLevel >= 3 ? [
        'Multi-dimensional skill correlation',
        'Game situation assessment',
        'Strategic development planning'
      ] : [
        'Basic technical execution',
        'Fundamental physical attributes',
        'Observable behavioral traits'
      ]
    };

    res.json({
      success: true,
      coachInfo
    });

  } catch (error) {
    console.error('Coach info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get coach information',
      details: error.message
    });
  }
});

export default router;