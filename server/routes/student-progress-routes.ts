import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { 
  insertStudentDrillCompletionSchema,
  insertSessionDrillAssignmentSchema,
  type StudentProgressOverview,
  type DrillCompletionRecord,
  type CoachProgressAnalytics
} from '@shared/schema/student-progress';

const router = Router();

// Record drill completion for a student
router.post('/students/:studentId/drill-completion', async (req, res) => {
  try {
    console.log('[STUDENT-PROGRESS] Recording drill completion for student:', req.params.studentId);
    
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    // Convert string ratings to numbers and validate
    const requestData = {
      ...req.body,
      studentId,
      coachId: req.body.coachId || 1, // Default coach ID for demo
      performanceRating: parseFloat(req.body.performanceRating),
      technicalRating: req.body.technicalRating ? parseFloat(req.body.technicalRating) : undefined,
      tacticalRating: req.body.tacticalRating ? parseFloat(req.body.tacticalRating) : undefined,
      physicalRating: req.body.physicalRating ? parseFloat(req.body.physicalRating) : undefined,
      mentalRating: req.body.mentalRating ? parseFloat(req.body.mentalRating) : undefined,
    };
    
    const validatedData = insertStudentDrillCompletionSchema.parse(requestData);

    const completion = await storage.createStudentDrillCompletion(validatedData);
    
    // Update student progress summary
    await storage.updateStudentProgressSummary(studentId, validatedData.coachId);
    
    console.log('[STUDENT-PROGRESS] Drill completion recorded successfully:', completion.id);
    
    res.json({
      success: true,
      data: completion
    });
  } catch (error) {
    console.error('[STUDENT-PROGRESS] Error recording drill completion:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record drill completion'
    });
  }
});

// Get student progress overview
router.get('/students/:studentId/progress', async (req, res) => {
  try {
    console.log('[STUDENT-PROGRESS] Fetching progress for student:', req.params.studentId);
    
    const studentId = parseInt(req.params.studentId);
    const coachId = parseInt(req.query.coachId as string) || 1; // Default coach ID
    
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    const progressOverview = await storage.getStudentProgressOverview(studentId, coachId);
    
    console.log('[STUDENT-PROGRESS] Progress overview retrieved successfully');
    
    res.json({
      success: true,
      data: progressOverview
    });
  } catch (error) {
    console.error('[STUDENT-PROGRESS] Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch student progress'
    });
  }
});

// Get student drill completion history
router.get('/students/:studentId/drill-history', async (req, res) => {
  try {
    console.log('[STUDENT-PROGRESS] Fetching drill history for student:', req.params.studentId);
    
    const studentId = parseInt(req.params.studentId);
    const coachId = parseInt(req.query.coachId as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    const drillHistory = await storage.getStudentDrillHistory(studentId, coachId, limit);
    
    console.log('[STUDENT-PROGRESS] Drill history retrieved successfully, records:', drillHistory.length);
    
    res.json({
      success: true,
      data: drillHistory
    });
  } catch (error) {
    console.error('[STUDENT-PROGRESS] Error fetching drill history:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch drill history'
    });
  }
});

// Get coach progress analytics
router.get('/progress-analytics', async (req, res) => {
  try {
    console.log('[STUDENT-PROGRESS] Fetching coach progress analytics');
    
    const coachId = parseInt(req.query.coachId as string) || 1; // Default coach ID
    
    const analytics = await storage.getCoachProgressAnalytics(coachId);
    
    console.log('[STUDENT-PROGRESS] Coach analytics retrieved successfully');
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('[STUDENT-PROGRESS] Error fetching coach analytics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch coach analytics'
    });
  }
});

// Assign drills to session
router.post('/sessions/:sessionId/assign-drills', async (req, res) => {
  try {
    console.log('[STUDENT-PROGRESS] Assigning drills to session:', req.params.sessionId);
    
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      return res.status(400).json({ success: false, error: 'Invalid session ID' });
    }

    const { drills, coachId } = req.body;
    
    if (!Array.isArray(drills) || drills.length === 0) {
      return res.status(400).json({ success: false, error: 'Drills array is required' });
    }

    // Validate each drill assignment
    const validatedDrills = drills.map((drill: any, index: number) => 
      insertSessionDrillAssignmentSchema.parse({
        ...drill,
        sessionId,
        coachId: coachId || 1,
        orderSequence: drill.orderSequence || index + 1
      })
    );

    const assignments = await storage.assignDrillsToSession(sessionId, validatedDrills);
    
    console.log('[STUDENT-PROGRESS] Drills assigned to session successfully, count:', assignments.length);
    
    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('[STUDENT-PROGRESS] Error assigning drills to session:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign drills to session'
    });
  }
});

// Get session drill assignments
router.get('/sessions/:sessionId/drills', async (req, res) => {
  try {
    console.log('[STUDENT-PROGRESS] Fetching drills for session:', req.params.sessionId);
    
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      return res.status(400).json({ success: false, error: 'Invalid session ID' });
    }

    const sessionDrills = await storage.getSessionDrillAssignments(sessionId);
    
    console.log('[STUDENT-PROGRESS] Session drills retrieved successfully, count:', sessionDrills.length);
    
    res.json({
      success: true,
      data: sessionDrills
    });
  } catch (error) {
    console.error('[STUDENT-PROGRESS] Error fetching session drills:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch session drills'
    });
  }
});

// Update drill completion status in session
router.patch('/sessions/:sessionId/drills/:drillId/status', async (req, res) => {
  try {
    console.log('[STUDENT-PROGRESS] Updating drill completion status in session');
    
    const sessionId = parseInt(req.params.sessionId);
    const drillId = parseInt(req.params.drillId);
    const { completionStatus, notes } = req.body;
    
    if (isNaN(sessionId) || isNaN(drillId)) {
      return res.status(400).json({ success: false, error: 'Invalid session or drill ID' });
    }

    if (!['pending', 'completed', 'skipped'].includes(completionStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid completion status' });
    }

    const updatedAssignment = await storage.updateSessionDrillStatus(sessionId, drillId, completionStatus, notes);
    
    console.log('[STUDENT-PROGRESS] Drill completion status updated successfully');
    
    res.json({
      success: true,
      data: updatedAssignment
    });
  } catch (error) {
    console.error('[STUDENT-PROGRESS] Error updating drill completion status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update drill completion status'
    });
  }
});

// Get all students for a coach (for progress tracking dashboard)
router.get('/students', async (req, res) => {
  try {
    console.log('[STUDENT-PROGRESS] Fetching students for coach');
    
    const coachId = parseInt(req.query.coachId as string) || 1; // Default coach ID
    
    const students = await storage.getCoachStudents(coachId);
    
    console.log('[STUDENT-PROGRESS] Students retrieved successfully, count:', students.length);
    
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('[STUDENT-PROGRESS] Error fetching coach students:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch students'
    });
  }
});

export default router;