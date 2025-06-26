/**
 * Mock PCP Learning Management System Routes
 * Demonstrates online learning materials and knowledge testing functionality
 */

import { Router } from 'express';
import { isAuthenticated } from '../auth';

const router = Router();

// Mock learning modules data
const mockLearningModules = [
  {
    id: 1,
    certificationLevelId: 1,
    moduleName: "Pickleball Rules and Regulations",
    moduleCode: "PCP-L1-M1",
    description: "Comprehensive overview of official pickleball rules, court dimensions, and game regulations",
    learningObjectives: [
      "Understand official court dimensions and equipment specifications",
      "Master basic game rules and scoring system",
      "Learn fault types and penalty enforcement",
      "Understand serving rules and rotation"
    ],
    content: {
      sections: [
        {
          title: "Court Setup and Equipment",
          content: "Official pickleball courts measure 20 feet by 44 feet...",
          videoUrl: null,
          documents: []
        },
        {
          title: "Basic Game Rules",
          content: "Pickleball is played with the double bounce rule...",
          videoUrl: null,
          documents: []
        }
      ]
    },
    estimatedHours: 3,
    orderIndex: 1,
    isRequired: true,
    isActive: true
  },
  {
    id: 2,
    certificationLevelId: 1,
    moduleName: "Teaching Fundamentals",
    moduleCode: "PCP-L1-M2",
    description: "Essential coaching techniques and instructional methods for beginner players",
    learningObjectives: [
      "Develop effective communication strategies",
      "Learn progressive skill development methods",
      "Understand different learning styles",
      "Master feedback and correction techniques"
    ],
    content: {
      sections: [
        {
          title: "Communication Strategies",
          content: "Effective coaching begins with clear communication...",
          videoUrl: null,
          documents: []
        }
      ]
    },
    estimatedHours: 4,
    orderIndex: 2,
    isRequired: true,
    isActive: true
  }
];

// Mock assessments data
const mockAssessments = [
  {
    id: 1,
    moduleId: 1,
    certificationLevelId: 1,
    assessmentName: "Pickleball Rules Knowledge Test",
    assessmentType: "quiz",
    description: "Test your understanding of official pickleball rules and regulations",
    instructions: "Answer all questions to the best of your ability. You need 80% to pass.",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "What is the official height of a pickleball net?",
        options: [
          "34 inches at the ends, 36 inches in the middle",
          "36 inches at the ends, 34 inches in the middle",
          "35 inches throughout",
          "32 inches at the ends, 34 inches in the middle"
        ],
        correctAnswer: 1,
        explanation: "The net is 36 inches high at the ends and 34 inches in the middle."
      },
      {
        id: 2,
        type: "true_false",
        question: "The serve must be made underhand in pickleball.",
        correctAnswer: true,
        explanation: "All serves in pickleball must be made with an underhand motion."
      },
      {
        id: 3,
        type: "multiple_choice",
        question: "How many bounces must occur before players can volley the ball?",
        options: [
          "One bounce on each side",
          "Two bounces total",
          "One bounce total",
          "No bounces required"
        ],
        correctAnswer: 0,
        explanation: "The double bounce rule requires one bounce on each side before volleys are allowed."
      },
      {
        id: 4,
        type: "multiple_select",
        question: "Which of the following are considered faults? (Select all that apply)",
        options: [
          "Hitting the ball into the net",
          "Volleying in the non-volley zone",
          "Serving overhand",
          "Ball landing out of bounds"
        ],
        correctAnswers: [0, 1, 2, 3],
        explanation: "All of these actions result in faults according to official rules."
      }
    ],
    passingScore: 80,
    maxAttempts: 3,
    timeLimit: 30,
    isRequired: true,
    orderIndex: 1,
    isActive: true
  },
  {
    id: 2,
    moduleId: 2,
    certificationLevelId: 1,
    assessmentName: "Teaching Methods Assessment",
    assessmentType: "quiz",
    description: "Evaluate your understanding of effective teaching techniques",
    instructions: "This assessment covers fundamental teaching principles and methods.",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "What is the most effective way to teach beginners?",
        options: [
          "Start with advanced techniques",
          "Focus on fundamentals first",
          "Emphasize competition immediately",
          "Skip basic rules"
        ],
        correctAnswer: 1,
        explanation: "Building a strong foundation with fundamentals is essential for new players."
      },
      {
        id: 2,
        type: "true_false",
        question: "Positive reinforcement is more effective than criticism for skill development.",
        correctAnswer: true,
        explanation: "Positive reinforcement builds confidence and encourages continued learning."
      }
    ],
    passingScore: 80,
    maxAttempts: 3,
    timeLimit: 20,
    isRequired: true,
    orderIndex: 2,
    isActive: true
  }
];

// Mock progress tracking
const mockProgressData = new Map();

// GET /api/pcp-learning/modules/:certificationLevelId - Get learning modules
router.get('/modules/:certificationLevelId', isAuthenticated, async (req, res) => {
  try {
    const { certificationLevelId } = req.params;
    const userId = req.user?.id;

    console.log(`[PCP-LEARNING] Fetching modules for certification level ${certificationLevelId}, user ${userId}`);

    const modules = mockLearningModules.filter(m => 
      m.certificationLevelId === parseInt(certificationLevelId)
    );

    const modulesWithProgress = modules.map(module => {
      const progressKey = `${userId}-${module.id}`;
      const progress = mockProgressData.get(progressKey) || {
        status: 'not_started',
        progressPercentage: 0,
        timeSpent: 0,
        attempts: 0
      };

      return { ...module, progress };
    });

    res.json({
      success: true,
      modules: modulesWithProgress
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch learning modules' });
  }
});

// GET /api/pcp-learning/module/:moduleId - Get specific module
router.get('/module/:moduleId', isAuthenticated, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user?.id;

    const module = mockLearningModules.find(m => m.id === parseInt(moduleId));
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const progressKey = `${userId}-${moduleId}`;
    const progress = mockProgressData.get(progressKey) || {
      status: 'not_started',
      progressPercentage: 0,
      timeSpent: 0,
      attempts: 0
    };

    // Update last accessed
    mockProgressData.set(progressKey, {
      ...progress,
      lastAccessed: new Date()
    });

    res.json({
      success: true,
      module: { ...module, progress }
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error fetching module:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// POST /api/pcp-learning/module/:moduleId/progress - Update progress
router.post('/module/:moduleId/progress', isAuthenticated, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { progressPercentage, timeSpent, status } = req.body;
    const userId = req.user?.id;

    const progressKey = `${userId}-${moduleId}`;
    const currentProgress = mockProgressData.get(progressKey) || {};

    const updatedProgress = {
      ...currentProgress,
      progressPercentage: Math.max(0, Math.min(100, progressPercentage || 0)),
      timeSpent: (timeSpent || 0),
      status: status || 'in_progress',
      lastAccessed: new Date(),
      ...(progressPercentage >= 100 && { completedAt: new Date() })
    };

    mockProgressData.set(progressKey, updatedProgress);

    res.json({
      success: true,
      progress: updatedProgress
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// GET /api/pcp-learning/assessments/:certificationLevelId - Get assessments
router.get('/assessments/:certificationLevelId', isAuthenticated, async (req, res) => {
  try {
    const { certificationLevelId } = req.params;
    const userId = req.user?.id;

    const assessments = mockAssessments.filter(a => 
      a.certificationLevelId === parseInt(certificationLevelId)
    );

    const assessmentsWithSubmissions = assessments.map(assessment => {
      const submissionKey = `${userId}-assessment-${assessment.id}`;
      const submissions = mockProgressData.get(submissionKey) || [];
      const latestSubmission = submissions[0];

      return {
        ...assessment,
        latestSubmission,
        attemptsRemaining: assessment.maxAttempts - submissions.length,
        canAttempt: submissions.length < assessment.maxAttempts
      };
    });

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

    const assessment = mockAssessments.find(a => a.id === parseInt(assessmentId));
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const submissionKey = `${userId}-assessment-${assessmentId}`;
    const submissions = mockProgressData.get(submissionKey) || [];
    const attemptsRemaining = assessment.maxAttempts - submissions.length;

    if (attemptsRemaining <= 0) {
      return res.status(403).json({ 
        error: 'Maximum attempts reached',
        maxAttempts: assessment.maxAttempts,
        attemptsUsed: submissions.length
      });
    }

    res.json({
      success: true,
      assessment: {
        ...assessment,
        attemptsRemaining,
        previousSubmissions: submissions.map(s => ({
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

// POST /api/pcp-learning/assessment/:assessmentId/submit - Submit assessment
router.post('/assessment/:assessmentId/submit', isAuthenticated, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { responses, timeSpent } = req.body;
    const userId = req.user?.id;

    const assessment = mockAssessments.find(a => a.id === parseInt(assessmentId));
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const submissionKey = `${userId}-assessment-${assessmentId}`;
    const existingSubmissions = mockProgressData.get(submissionKey) || [];
    const attemptNumber = existingSubmissions.length + 1;

    if (attemptNumber > assessment.maxAttempts) {
      return res.status(403).json({ error: 'Maximum attempts exceeded' });
    }

    // Calculate score
    const score = calculateQuizScore(assessment.questions, responses);
    const status = score >= assessment.passingScore ? 'passed' : 'failed';

    const submission = {
      id: Date.now(),
      userId,
      assessmentId: parseInt(assessmentId),
      responses,
      score,
      status,
      attemptNumber,
      timeSpent: timeSpent || 0,
      submittedAt: new Date()
    };

    existingSubmissions.unshift(submission);
    mockProgressData.set(submissionKey, existingSubmissions);

    res.json({
      success: true,
      submission: {
        id: submission.id,
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

// GET /api/pcp-learning/dashboard/:userId - Get learning dashboard
router.get('/dashboard/:userId', isAuthenticated, async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.user?.id;

    if (parseInt(targetUserId) !== currentUserId && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mock application data
    const mockApplication = {
      id: 1,
      certificationLevelId: 1,
      applicationStatus: 'approved'
    };

    // Get module progress
    const modules = mockLearningModules.filter(m => m.certificationLevelId === 1);
    const moduleProgress = modules.map(module => {
      const progressKey = `${targetUserId}-${module.id}`;
      const progress = mockProgressData.get(progressKey);
      return { module, progress };
    });

    // Get assessment progress
    const assessments = mockAssessments.filter(a => a.certificationLevelId === 1);
    const assessmentProgress = assessments.map(assessment => {
      const submissionKey = `${targetUserId}-assessment-${assessment.id}`;
      const submissions = mockProgressData.get(submissionKey) || [];
      const bestSubmission = submissions.reduce((best, current) => 
        !best || current.score > best.score ? current : best, null
      );
      return { assessment, bestSubmission, totalAttempts: submissions.length };
    });

    const overallProgress = calculateOverallProgress(moduleProgress, assessmentProgress);

    const dashboardData = [{
      application: mockApplication,
      moduleProgress,
      assessmentProgress,
      overallProgress
    }];

    res.json({
      success: true,
      dashboard: dashboardData
    });
  } catch (error) {
    console.error('[PCP-LEARNING] Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch learning dashboard' });
  }
});

// Helper functions
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
          Array.from(correctSet).every(answer => userSet.has(answer))) {
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

// Register PCP Learning routes function
export function registerPCPLearningRoutes(app: any) {
  app.use('/api/pcp-learning', router);
}

export default router;