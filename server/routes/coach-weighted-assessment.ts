/**
 * Coach Level Weighted Assessment API Routes
 * 
 * Implements the sophisticated multi-coach weighted PCP assessment system
 * with proper database integration, validation, authorization, and quality metrics.
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq, desc } from 'drizzle-orm';
import { matchAssessments } from '@shared/schema/courtiq';
import { 
  aggregateMultiCoachRatings,
  getOfficialPCPRating,
  validateNewAssessment,
  type AssessmentRecord 
} from '@shared/utils/multiCoachAggregation';
import { isAuthenticated } from '../auth';

const router = Router();

// Validation schemas
const studentIdSchema = z.string().refine((val) => {
  const num = parseInt(val);
  return !isNaN(num) && num > 0;
}, "Student ID must be a positive integer");

/**
 * Helper function to convert database records to AssessmentRecord format
 */
function mapDbToAssessmentRecord(dbRecord: any): AssessmentRecord {
  return {
    id: dbRecord.id,
    studentId: dbRecord.studentId,
    coachId: dbRecord.coachId,
    coachName: dbRecord.coachName || 'Unknown Coach',
    coachLevel: dbRecord.coachLevel || 2, // Default to L2 if missing
    assessmentMode: dbRecord.assessmentMode as 'quick' | 'full' || 'full',
    pcpRating: dbRecord.pcpRating,
    assessmentData: dbRecord.assessmentData || {},
    assessmentDate: new Date(dbRecord.assessmentDate),
    totalSkills: dbRecord.totalSkills || 55
  };
}

/**
 * Get aggregated PCP rating for a student using multi-coach weighting
 * GET /api/pcp/aggregate/:studentId
 */
router.get('/aggregate/:studentId', isAuthenticated, async (req, res) => {
  try {
    const studentId = studentIdSchema.parse(req.params.studentId);
    const studentIdNum = parseInt(studentId);

    // Query all assessments for the student from database
    const dbAssessments = await db
      .select()
      .from(matchAssessments)
      .where(eq(matchAssessments.studentId, studentIdNum))
      .orderBy(desc(matchAssessments.assessmentDate));

    if (dbAssessments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NO_ASSESSMENTS',
        message: 'No assessments found for this student'
      });
    }

    // Convert database records to AssessmentRecord format
    const assessmentRecords = dbAssessments.map(mapDbToAssessmentRecord);

    // Calculate aggregated rating using multi-coach weighting
    const aggregatedRating = aggregateMultiCoachRatings(assessmentRecords);
    const officialRating = getOfficialPCPRating(aggregatedRating);

    console.log(`[API] Aggregated rating for student ${studentId}: ${aggregatedRating.finalPCPRating} (${aggregatedRating.ratingStatus})`);

    res.json({
      success: true,
      studentId: studentIdNum,
      aggregated: aggregatedRating,
      official: officialRating,
      latestAssessment: {
        pcpRating: dbAssessments[0].pcpRating,
        assessmentDate: dbAssessments[0].assessmentDate,
        coachLevel: dbAssessments[0].coachLevel
      },
      totalAssessments: dbAssessments.length
    });

  } catch (error) {
    console.error('Aggregated rating calculation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STUDENT_ID',
        message: 'Student ID must be a positive integer'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to calculate aggregated rating',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get assessment history for a student
 * GET /api/coach/student-assessment-history/:studentId
 */
router.get('/history/:studentId', isAuthenticated, async (req, res) => {
  try {
    const studentId = studentIdSchema.parse(req.params.studentId);
    const studentIdNum = parseInt(studentId);
    
    // Query assessment history from database
    const dbAssessments = await db
      .select()
      .from(matchAssessments)
      .where(eq(matchAssessments.studentId, studentIdNum))
      .orderBy(desc(matchAssessments.assessmentDate));
    
    // Format assessments for frontend display
    const assessments = dbAssessments.map(assessment => ({
      id: assessment.id,
      coachId: assessment.coachId,
      coachName: assessment.coachName || 'Unknown Coach',
      coachLevel: assessment.coachLevel || 2,
      assessmentMode: assessment.assessmentMode || 'full',
      pcpRating: assessment.pcpRating,
      assessmentDate: assessment.assessmentDate,
      totalSkills: assessment.totalSkills || 55
    }));
    
    // Get latest assessment for summary
    const latestAssessment = assessments[0] || null;
    
    res.json({
      success: true,
      studentId: studentIdNum,
      assessments,
      latestAssessment: latestAssessment ? {
        pcpRating: latestAssessment.pcpRating,
        assessmentDate: latestAssessment.assessmentDate,
        coachLevel: latestAssessment.coachLevel
      } : null,
      summary: {
        totalAssessments: assessments.length,
        uniqueCoaches: [...new Set(assessments.map(a => a.coachId))].length,
        coachLevels: assessments.map(a => a.coachLevel),
        averagePCP: assessments.length > 0 
          ? (assessments.reduce((sum, a) => sum + a.pcpRating, 0) / assessments.length).toFixed(2)
          : null
      }
    });
    
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STUDENT_ID',
        message: 'Student ID must be a positive integer'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessment history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Validate a new assessment before submission
 * POST /api/coach-weighted-assessment/validate
 */
router.post('/validate', isAuthenticated, async (req, res) => {
  try {
    const { studentId, coachId } = req.body;
    
    if (!studentId || !coachId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: 'Student ID and Coach ID are required'
      });
    }

    // Get existing assessments for the student
    const dbAssessments = await db
      .select()
      .from(matchAssessments)
      .where(eq(matchAssessments.studentId, parseInt(studentId)))
      .orderBy(desc(matchAssessments.assessmentDate));

    const existingAssessments = dbAssessments.map(mapDbToAssessmentRecord);

    // Validate the new assessment
    const validation = validateNewAssessment(existingAssessments, {
      coachId,
      studentId: parseInt(studentId)
    });

    res.json({
      success: true,
      validation: {
        valid: validation.valid,
        reason: validation.reason || 'Assessment can proceed'
      },
      existingAssessments: existingAssessments.length,
      recentCoachAssessments: existingAssessments
        .filter(a => a.coachId === coachId)
        .slice(0, 3)
        .map(a => ({
          id: a.id,
          assessmentDate: a.assessmentDate,
          pcpRating: a.pcpRating
        }))
    });

  } catch (error) {
    console.error('Assessment validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate assessment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get coach weighting information and multi-coach system status
 * GET /api/coach-weighted-assessment/system-status
 */
router.get('/system-status', isAuthenticated, async (req, res) => {
  try {
    // Import coach level weights
    const { COACH_LEVEL_WEIGHTS } = await import('@shared/utils/multiCoachAggregation');
    
    const systemStatus = {
      multiCoachAggregationEnabled: true,
      coachLevelWeights: COACH_LEVEL_WEIGHTS,
      ratingSystem: {
        provisional: 'L1-L3 coaches provide provisional ratings',
        verified: 'L4+ coaches provide verified ratings',
        skillFloors: 'Players cannot drop below achieved skill thresholds',
        dynamicWeighting: 'Skill category weights adapt by player level'
      },
      confidenceLevels: {
        LOW: 'Single assessment or low total weight',
        MODERATE: 'Multiple assessments or moderate weight',
        HIGH: 'Strong assessment weight or L4+ validation',
        EXPERT: 'L4+ coach with significant total weight'
      },
      antiAbuseControls: {
        coachCooldown: '24 hours between assessments from same coach',
        minimumAssessments: '1 assessment minimum for rating',
        maxAssessmentAge: 'No expiration on historical assessments'
      }
    };

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      systemStatus
    });

  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;