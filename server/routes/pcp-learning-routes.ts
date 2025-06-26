/**
 * PCP Learning Management System Routes
 * Provides online learning materials and knowledge testing for PCP certification participants
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';

const router = Router();

// GET /api/pcp-learning/modules/:certificationLevelId - Get learning modules for a certification level
router.get('/modules/:certificationLevelId', isAuthenticated, async (req, res) => {
  try {
    const { certificationLevelId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get learning modules for the certification level
    const modules = await storage.getPcpLearningModules?.(parseInt(certificationLevelId));
    
    // Get user's progress for each module
    const modulesWithProgress = await Promise.all(
      (modules || []).map(async (module) => {
        const progress = await storage.getPcpModuleProgress?.(userId, module.id);
        return {
          ...module,
          progress: progress || {
            status: 'not_started',
            progressPercentage: 0,
            timeSpent: 0,
            attempts: 0
          }
        };
      })
    );

    res.json({
      success: true,
      modules: modulesWithProgress
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch learning modules' });
  }
});

// GET /api/pcp-learning/module/:moduleId - Get specific module content
router.get('/module/:moduleId', isAuthenticated, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get module details
    const module = await storage.getPcpLearningModule?.(parseInt(moduleId));
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Get user's progress
    const progress = await storage.getPcpModuleProgress?.(userId, parseInt(moduleId));

    // Update last accessed time
    await storage.updatePcpModuleProgress?.(userId, parseInt(moduleId), {
      lastAccessed: new Date()
    });

    res.json({
      success: true,
      module: {
        ...module,
        progress: progress || {
          status: 'not_started',
          progressPercentage: 0,
          timeSpent: 0,
          attempts: 0
        }
      }
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error fetching module:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// POST /api/pcp-learning/module/:moduleId/progress - Update module progress
router.post('/module/:moduleId/progress', isAuthenticated, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { progressPercentage, timeSpent, status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Update progress
    const updatedProgress = await storage.updatePcpModuleProgress?.(userId, parseInt(moduleId), {
      progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
      timeSpent: timeSpent || 0,
      status: status || 'in_progress',
      lastAccessed: new Date(),
      ...(progressPercentage >= 100 && { completedAt: new Date() })
    });

    res.json({
      success: true,
      progress: updatedProgress
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// GET /api/pcp-learning/assessments/:certificationLevelId - Get assessments for certification level
router.get('/assessments/:certificationLevelId', isAuthenticated, async (req, res) => {
  try {
    const { certificationLevelId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get assessments for the certification level
    const assessments = await storage.getPcpAssessments?.(parseInt(certificationLevelId));
    
    // Get user's submissions for each assessment
    const assessmentsWithSubmissions = await Promise.all(
      (assessments || []).map(async (assessment) => {
        const submissions = await storage.getPcpAssessmentSubmissions?.(userId, assessment.id);
        const latestSubmission = submissions?.[0]; // Most recent submission
        
        return {
          ...assessment,
          latestSubmission,
          attemptsRemaining: assessment.maxAttempts - (submissions?.length || 0),
          canAttempt: !submissions || submissions.length < assessment.maxAttempts
        };
      })
    );

    res.json({
      success: true,
      assessments: assessmentsWithSubmissions
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// GET /api/pcp-learning/assessment/:assessmentId - Get specific assessment
router.get('/assessment/:assessmentId', isAuthenticated, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get assessment details
    const assessment = await storage.getPcpAssessment?.(parseInt(assessmentId));
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if user can take this assessment
    const submissions = await storage.getPcpAssessmentSubmissions?.(userId, parseInt(assessmentId));
    const attemptsRemaining = assessment.maxAttempts - (submissions?.length || 0);
    
    if (attemptsRemaining <= 0) {
      return res.status(403).json({ 
        error: 'Maximum attempts reached',
        maxAttempts: assessment.maxAttempts,
        attemptsUsed: submissions?.length || 0
      });
    }

    res.json({
      success: true,
      assessment: {
        ...assessment,
        attemptsRemaining,
        previousSubmissions: submissions?.map(s => ({
          id: s.id,
          score: s.score,
          status: s.status,
          submittedAt: s.submittedAt,
          attemptNumber: s.attemptNumber
        }))
      }
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// POST /api/pcp-learning/assessment/:assessmentId/submit - Submit assessment answers
router.post('/assessment/:assessmentId/submit', isAuthenticated, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { responses, timeSpent } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get assessment details
    const assessment = await storage.getPcpAssessment?.(parseInt(assessmentId));
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check attempt limits
    const existingSubmissions = await storage.getPcpAssessmentSubmissions?.(userId, parseInt(assessmentId));
    const attemptNumber = (existingSubmissions?.length || 0) + 1;
    
    if (attemptNumber > assessment.maxAttempts) {
      return res.status(403).json({ error: 'Maximum attempts exceeded' });
    }

    // Calculate score based on assessment type
    let score = 0;
    if (assessment.assessmentType === 'quiz') {
      score = calculateQuizScore(assessment.questions as any, responses);
    }

    // Determine status
    const status = score >= assessment.passingScore ? 'passed' : 'failed';

    // Create submission
    const submission = await storage.createPcpAssessmentSubmission?.({
      userId,
      assessmentId: parseInt(assessmentId),
      applicationId: 1, // This should come from user's current application
      responses,
      score,
      status,
      attemptNumber,
      timeSpent: timeSpent || 0,
      submittedAt: new Date()
    });

    res.json({
      success: true,
      submission: {
        id: submission?.id,
        score,
        status,
        passed: status === 'passed',
        passingScore: assessment.passingScore,
        attemptNumber,
        attemptsRemaining: assessment.maxAttempts - attemptNumber
      }
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error submitting assessment:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// GET /api/pcp-learning/dashboard/:userId - Get learning dashboard for user
router.get('/dashboard/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user?.id;

    // Users can only view their own dashboard (unless admin)
    if (parseInt(targetUserId) !== currentUserId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user's current certification applications
    const applications = await storage.getPcpApplicationsByUser?.(parseInt(targetUserId));
    
    const dashboardData = await Promise.all(
      (applications || []).map(async (application) => {
        // Get modules progress
        const modules = await storage.getPcpLearningModules?.(application.certificationLevelId);
        const moduleProgress = await Promise.all(
          (modules || []).map(async (module) => {
            const progress = await storage.getPcpModuleProgress?.(parseInt(targetUserId), module.id);
            return { module, progress };
          })
        );

        // Get assessments progress
        const assessments = await storage.getPcpAssessments?.(application.certificationLevelId);
        const assessmentProgress = await Promise.all(
          (assessments || []).map(async (assessment) => {
            const submissions = await storage.getPcpAssessmentSubmissions?.(parseInt(targetUserId), assessment.id);
            const bestSubmission = submissions?.reduce((best, current) => 
              !best || current.score! > best.score! ? current : best
            );
            return { assessment, bestSubmission, totalAttempts: submissions?.length || 0 };
          })
        );

        return {
          application,
          moduleProgress,
          assessmentProgress,
          overallProgress: calculateOverallProgress(moduleProgress, assessmentProgress)
        };
      })
    );

    res.json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch learning dashboard' });
  }
});

// Helper function to calculate quiz score
function calculateQuizScore(questions: any[], responses: any[]): number {
  if (!questions || !responses || questions.length === 0) return 0;
  
  let correctAnswers = 0;
  questions.forEach((question, index) => {
    const userResponse = responses[index];
    if (question.type === 'multiple_choice') {
      if (userResponse === question.correctAnswer) {
        correctAnswers++;
      }
    } else if (question.type === 'multiple_select') {
      const correctSet = new Set(question.correctAnswers);
      const userSet = new Set(userResponse || []);
      if (correctSet.size === userSet.size && 
          [...correctSet].every(answer => userSet.has(answer))) {
        correctAnswers++;
      }
    } else if (question.type === 'true_false') {
      if (userResponse === question.correctAnswer) {
        correctAnswers++;
      }
    }
  });
  
  return Math.round((correctAnswers / questions.length) * 100);
}

// Helper function to calculate overall progress
function calculateOverallProgress(moduleProgress: any[], assessmentProgress: any[]): any {
  const totalModules = moduleProgress.length;
  const completedModules = moduleProgress.filter(mp => mp.progress?.status === 'completed').length;
  
  const totalAssessments = assessmentProgress.length;
  const passedAssessments = assessmentProgress.filter(ap => 
    ap.bestSubmission?.status === 'passed'
  ).length;
  
  const moduleCompletionRate = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  const assessmentPassRate = totalAssessments > 0 ? (passedAssessments / totalAssessments) * 100 : 0;
  
  return {
    moduleCompletionRate: Math.round(moduleCompletionRate),
    assessmentPassRate: Math.round(assessmentPassRate),
    overallProgress: Math.round((moduleCompletionRate + assessmentPassRate) / 2),
    completedModules,
    totalModules,
    passedAssessments,
    totalAssessments
  };
}

export default router;