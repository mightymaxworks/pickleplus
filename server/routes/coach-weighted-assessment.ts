/**
 * Coach Level Weighted Assessment API Routes
 * 
 * Implements the sophisticated multi-coach weighted PCP assessment system
 * with proper database integration, validation, authorization, and quality metrics.
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { eq, desc, sql, and, or } from 'drizzle-orm';
import { pcpAssessmentResults } from '@shared/schema/progressive-assessment';
import { users } from '@shared/schema';
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
    id: dbRecord.id.toString(),
    studentId: dbRecord.playerId,
    coachId: dbRecord.coachId,
    coachName: dbRecord.coachDisplayName || `Coach ${dbRecord.coachId}`,
    coachLevel: dbRecord.coachLevel || 2, // Default to L2 if missing
    assessmentMode: dbRecord.isCompleteAssessment ? 'full' : 'quick',
    pcpRating: parseFloat(dbRecord.calculatedPcpRating),
    assessmentData: {}, // Will be populated from skill data if needed
    assessmentDate: new Date(dbRecord.createdAt),
    totalSkills: dbRecord.skillsAssessedCount || 55
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

    // Query all assessments for the student from database with coach info
    const dbAssessments = await db
      .select({
        id: pcpAssessmentResults.id,
        playerId: pcpAssessmentResults.playerId,
        coachId: pcpAssessmentResults.coachId,
        calculatedPcpRating: pcpAssessmentResults.calculatedPcpRating,
        skillsAssessedCount: pcpAssessmentResults.skillsAssessedCount,
        isCompleteAssessment: pcpAssessmentResults.isCompleteAssessment,
        createdAt: pcpAssessmentResults.createdAt,
        coachDisplayName: users.displayName,
        coachLevel: users.coachLevel
      })
      .from(pcpAssessmentResults)
      .leftJoin(users, eq(pcpAssessmentResults.coachId, users.id))
      .where(eq(pcpAssessmentResults.playerId, studentIdNum))
      .orderBy(desc(pcpAssessmentResults.createdAt));

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
        pcpRating: parseFloat(dbAssessments[0].calculatedPcpRating),
        assessmentDate: dbAssessments[0].createdAt,
        coachLevel: dbAssessments[0].coachLevel || 2
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
    
    // Query assessment history from database with coach info
    const dbAssessments = await db
      .select({
        id: pcpAssessmentResults.id,
        playerId: pcpAssessmentResults.playerId,
        coachId: pcpAssessmentResults.coachId,
        calculatedPcpRating: pcpAssessmentResults.calculatedPcpRating,
        skillsAssessedCount: pcpAssessmentResults.skillsAssessedCount,
        isCompleteAssessment: pcpAssessmentResults.isCompleteAssessment,
        createdAt: pcpAssessmentResults.createdAt,
        coachDisplayName: users.displayName,
        coachLevel: users.coachLevel
      })
      .from(pcpAssessmentResults)
      .leftJoin(users, eq(pcpAssessmentResults.coachId, users.id))
      .where(eq(pcpAssessmentResults.playerId, studentIdNum))
      .orderBy(desc(pcpAssessmentResults.createdAt));
    
    // Format assessments for frontend display
    const assessments = dbAssessments.map(assessment => ({
      id: assessment.id,
      coachId: assessment.coachId,
      coachName: assessment.coachDisplayName || `Coach ${assessment.coachId}`,
      coachLevel: assessment.coachLevel || 2,
      assessmentMode: assessment.isCompleteAssessment ? 'full' : 'quick',
      pcpRating: parseFloat(assessment.calculatedPcpRating),
      assessmentDate: assessment.createdAt,
      totalSkills: assessment.skillsAssessedCount || 55
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
        uniqueCoaches: Array.from(new Set(assessments.map(a => a.coachId))).length,
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
      .select({
        id: pcpAssessmentResults.id,
        playerId: pcpAssessmentResults.playerId,
        coachId: pcpAssessmentResults.coachId,
        calculatedPcpRating: pcpAssessmentResults.calculatedPcpRating,
        skillsAssessedCount: pcpAssessmentResults.skillsAssessedCount,
        isCompleteAssessment: pcpAssessmentResults.isCompleteAssessment,
        createdAt: pcpAssessmentResults.createdAt,
      })
      .from(pcpAssessmentResults)
      .where(eq(pcpAssessmentResults.playerId, parseInt(studentId)))
      .orderBy(desc(pcpAssessmentResults.createdAt));

    const existingAssessments = dbAssessments.map(mapDbToAssessmentRecord);

    // Validate the new assessment
    const validation = validateNewAssessment(existingAssessments, {
      coachId,
      studentId: studentId
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

/**
 * Get recent assessments for a coach (replaces the empty endpoint)
 * GET /api/coach/recent-assessments
 */
router.get('/recent-assessments', isAuthenticated, async (req, res) => {
  try {
    const coachId = (req.user as any)?.id;
    
    if (!coachId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Coach authentication required'
      });
    }

    // Get recent assessments from both new and legacy tables
    
    // New assessments from pcp_assessment_results table
    const newAssessments = await db
      .select({
        id: pcpAssessmentResults.id,
        playerId: pcpAssessmentResults.playerId,
        coachId: pcpAssessmentResults.coachId,
        calculatedPcpRating: pcpAssessmentResults.calculatedPcpRating,
        skillsAssessedCount: pcpAssessmentResults.skillsAssessedCount,
        isCompleteAssessment: pcpAssessmentResults.isCompleteAssessment,
        createdAt: pcpAssessmentResults.createdAt,
        studentName: users.displayName,
        source: sql<string>`'new'`
      })
      .from(pcpAssessmentResults)
      .leftJoin(users, eq(pcpAssessmentResults.playerId, users.id))
      .where(
        and(
          eq(pcpAssessmentResults.coachId, coachId),
          or(eq(users.isTestData, false), sql`${users.isTestData} IS NULL`)
        )
      )
      .orderBy(desc(pcpAssessmentResults.createdAt));

    // Legacy assessments from match_assessments table (your actual student assessments)
    const legacyAssessments = await db
      .select({
        id: matchAssessments.id,
        playerId: matchAssessments.targetId,
        coachId: matchAssessments.assessorId,
        calculatedPcpRating: sql<string>`((${matchAssessments.technicalRating} + ${matchAssessments.tacticalRating} + ${matchAssessments.physicalRating} + ${matchAssessments.mentalRating} + ${matchAssessments.consistencyRating}) / 5.0)::text`,
        skillsAssessedCount: sql<number>`55`,
        isCompleteAssessment: sql<boolean>`true`,
        createdAt: matchAssessments.createdAt,
        studentName: users.displayName,
        source: sql<string>`'legacy'`
      })
      .from(matchAssessments)
      .leftJoin(users, eq(matchAssessments.targetId, users.id))
      .where(
        and(
          eq(matchAssessments.assessorId, coachId),
          or(eq(users.isTestData, false), sql`${users.isTestData} IS NULL`)
        )
      )
      .orderBy(desc(matchAssessments.createdAt));

    // Combine and sort all assessments by date
    const recentAssessments = [...newAssessments, ...legacyAssessments]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);

    const formattedAssessments = recentAssessments.map(assessment => ({
      id: assessment.id,
      studentId: assessment.playerId,
      studentName: assessment.studentName || `Student ${assessment.playerId}`,
      pcpRating: parseFloat(assessment.calculatedPcpRating),
      assessmentMode: assessment.isCompleteAssessment ? 'full' : 'quick',
      skillsAssessed: assessment.skillsAssessedCount,
      assessmentDate: assessment.createdAt,
      daysAgo: Math.floor((Date.now() - new Date(assessment.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    }));

    console.log(`[RECENT ASSESSMENTS] Coach ${coachId} has ${formattedAssessments.length} recent assessments`);

    res.json(formattedAssessments);
    
  } catch (error) {
    console.error('Error fetching recent assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent assessments',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get assessment history for current player (allows players to see their own assessments)
 * GET /api/player/my-assessment-history
 */
router.get('/player/my-assessment-history', isAuthenticated, async (req, res) => {
  try {
    const playerId = (req.user as any)?.id;
    
    if (!playerId) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Player authentication required'
      });
    }

    // Get all assessments for the current player with coach info
    const playerAssessments = await db
      .select({
        id: pcpAssessmentResults.id,
        playerId: pcpAssessmentResults.playerId,
        coachId: pcpAssessmentResults.coachId,
        calculatedPcpRating: pcpAssessmentResults.calculatedPcpRating,
        skillsAssessedCount: pcpAssessmentResults.skillsAssessedCount,
        isCompleteAssessment: pcpAssessmentResults.isCompleteAssessment,
        createdAt: pcpAssessmentResults.createdAt,
        coachDisplayName: users.displayName,
        coachLevel: users.coachLevel
      })
      .from(pcpAssessmentResults)
      .leftJoin(users, eq(pcpAssessmentResults.coachId, users.id))
      .where(eq(pcpAssessmentResults.playerId, playerId))
      .orderBy(desc(pcpAssessmentResults.createdAt));

    const assessments = playerAssessments.map(assessment => ({
      id: assessment.id,
      coachId: assessment.coachId,
      coachName: assessment.coachDisplayName || `Coach ${assessment.coachId}`,
      coachLevel: assessment.coachLevel || 2,
      assessmentMode: assessment.isCompleteAssessment ? 'full' : 'quick',
      pcpRating: parseFloat(assessment.calculatedPcpRating),
      assessmentDate: assessment.createdAt,
      skillsAssessed: assessment.skillsAssessedCount || 55,
      daysAgo: Math.floor((Date.now() - new Date(assessment.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    }));

    // Get aggregated rating using multi-coach weighting if multiple assessments exist
    let aggregatedInfo = null;
    if (assessments.length > 0) {
      try {
        const assessmentRecords = playerAssessments.map(mapDbToAssessmentRecord);
        const aggregatedRating = aggregateMultiCoachRatings(assessmentRecords);
        const officialRating = getOfficialPCPRating(aggregatedRating);
        
        aggregatedInfo = {
          currentPCPRating: aggregatedRating.finalPCPRating,
          ratingStatus: aggregatedRating.ratingStatus,
          confidenceLevel: aggregatedRating.confidenceLevel,
          totalAssessments: aggregatedRating.contributingAssessments,
          isOfficial: officialRating.isOfficial
        };
      } catch (error) {
        console.error('Error calculating aggregated rating for player:', error);
      }
    }

    console.log(`[PLAYER ASSESSMENTS] Player ${playerId} has ${assessments.length} assessments`);

    res.json({
      success: true,
      playerId,
      assessments,
      aggregatedInfo,
      summary: {
        totalAssessments: assessments.length,
        uniqueCoaches: Array.from(new Set(assessments.map(a => a.coachId))).length,
        latestAssessment: assessments[0] || null,
        averagePCP: assessments.length > 0 
          ? (assessments.reduce((sum, a) => sum + a.pcpRating, 0) / assessments.length).toFixed(2)
          : null
      }
    });
    
  } catch (error) {
    console.error('Error fetching player assessment history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch player assessment history',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;