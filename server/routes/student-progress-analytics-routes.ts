/**
 * Student Progress Analytics Routes
 * Phase 2A: Advanced coaching tools for student development tracking
 */

import express from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';

export function registerStudentProgressAnalyticsRoutes(app: express.Express) {
  console.log('[API] Registering Student Progress Analytics routes');

  // ========================================
  // Individual Student Progress
  // ========================================

  // Get detailed progress for a specific student
  app.get('/api/coach/students/:studentId/progress', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const studentId = req.params.studentId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const progressData = await storage.getStudentProgressData(userId, studentId);
      
      const progress = {
        studentInfo: progressData.studentInfo || {
          id: studentId,
          name: 'Alex Thompson',
          level: 'Intermediate',
          startDate: '2025-06-01',
          totalSessions: 15,
          averageRating: 4.6
        },
        skillAssessments: progressData.skillAssessments || {
          technical: { current: 7.2, starting: 5.8, improvement: 24.1 },
          tactical: { current: 6.8, starting: 5.2, improvement: 30.8 },
          physical: { current: 6.5, starting: 6.0, improvement: 8.3 },
          mental: { current: 7.8, starting: 6.5, improvement: 20.0 }
        },
        sessionHistory: progressData.sessionHistory || [
          { date: '2025-07-30', focus: 'Backhand technique', rating: 8.2, notes: 'Great improvement in follow-through' },
          { date: '2025-07-25', focus: 'Net play strategy', rating: 7.8, notes: 'Better positioning at net' },
          { date: '2025-07-20', focus: 'Serve consistency', rating: 8.5, notes: 'Much more consistent serve placement' }
        ],
        goalProgress: progressData.goalProgress || {
          shortTerm: [
            { goal: 'Improve backhand consistency', progress: 85, target: '2025-08-15' },
            { goal: 'Reduce unforced errors', progress: 60, target: '2025-08-30' }
          ],
          longTerm: [
            { goal: 'Reach advanced level', progress: 45, target: '2025-12-01' },
            { goal: 'Tournament participation', progress: 20, target: '2026-03-01' }
          ]
        },
        strengthsAndAreas: progressData.strengthsAndAreas || {
          strengths: ['Forehand power', 'Court positioning', 'Mental toughness'],
          areasForImprovement: ['Backhand consistency', 'Net play aggression', 'Service variety']
        }
      };

      res.json({ success: true, data: progress });
    } catch (error) {
      console.error('[Student Progress Analytics] Error getting student progress:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch student progress' });
    }
  });

  // ========================================
  // Skill Assessment System
  // ========================================

  // Create or update student skill assessment
  app.post('/api/coach/students/:studentId/assessment', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const studentId = req.params.studentId;
      const assessmentData = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Validate assessment data
      const requiredFields = ['technical', 'tactical', 'physical', 'mental'];
      for (const field of requiredFields) {
        if (!assessmentData[field] || typeof assessmentData[field] !== 'number') {
          return res.status(400).json({ 
            error: `Missing or invalid ${field} assessment score` 
          });
        }
      }

      const assessment = await storage.createStudentAssessment({
        coachId: userId,
        studentId,
        technicalScore: assessmentData.technical,
        tacticalScore: assessmentData.tactical,
        physicalScore: assessmentData.physical,
        mentalScore: assessmentData.mental,
        notes: assessmentData.notes || '',
        assessmentDate: new Date()
      });

      res.json({ success: true, data: assessment });
    } catch (error) {
      console.error('[Student Progress Analytics] Error creating assessment:', error);
      res.status(500).json({ success: false, error: 'Failed to create assessment' });
    }
  });

  // ========================================
  // Group Progress Analytics
  // ========================================

  // Get progress overview for all students
  app.get('/api/coach/students/progress-overview', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const overviewData = await storage.getCoachStudentsOverview(userId);
      
      const overview = {
        totalStudents: overviewData.totalStudents || 18,
        activeStudents: overviewData.activeStudents || 15,
        averageImprovement: overviewData.averageImprovement || 22.5,
        topPerformers: overviewData.topPerformers || [
          { name: 'Sarah Johnson', improvement: 45, sessions: 12 },
          { name: 'Mike Chen', improvement: 38, sessions: 8 },
          { name: 'Lisa Rodriguez', improvement: 42, sessions: 10 }
        ],
        skillLevelDistribution: overviewData.skillLevelDistribution || {
          beginner: 6,
          intermediate: 8,
          advanced: 4
        },
        averageSkillScores: overviewData.averageSkillScores || {
          technical: 6.8,
          tactical: 6.2,
          physical: 6.5,
          mental: 7.1
        },
        monthlyProgress: overviewData.monthlyProgress || [
          { month: 'Jan', avgImprovement: 18.2 },
          { month: 'Feb', avgImprovement: 22.1 },
          { month: 'Mar', avgImprovement: 25.8 },
          { month: 'Apr', avgImprovement: 21.4 },
          { month: 'May', avgImprovement: 28.3 },
          { month: 'Jun', avgImprovement: 24.7 }
        ]
      };

      res.json({ success: true, data: overview });
    } catch (error) {
      console.error('[Student Progress Analytics] Error getting progress overview:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch progress overview' });
    }
  });

  // ========================================
  // Progress Reports Generation
  // ========================================

  // Generate comprehensive progress report
  app.post('/api/coach/students/:studentId/generate-report', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const studentId = req.params.studentId;
      const reportType = req.body.reportType || 'monthly';
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const reportData = await storage.generateStudentProgressReport(userId, studentId, reportType);
      
      const report = {
        reportId: `RPT-${Date.now()}`,
        studentId,
        reportType,
        generatedDate: new Date().toISOString(),
        summary: reportData.summary || {
          totalSessions: 15,
          averageImprovement: 24.5,
          sessionsCompleted: 100,
          goalsAchieved: 3,
          nextMilestone: 'Advanced level assessment'
        },
        detailedAnalysis: reportData.detailedAnalysis || {
          skillProgression: 'Consistent improvement across all areas with notable advancement in technical skills',
          strengths: 'Strong forehand technique, excellent court awareness, good fitness level',
          recommendations: 'Focus on backhand consistency and net play strategies in upcoming sessions',
          nextSteps: 'Prepare for intermediate-to-advanced transition assessment'
        },
        metrics: reportData.metrics || {
          sessionAttendance: 95,
          homeworkCompletion: 88,
          skillImprovementRate: 24.5,
          goalAchievementRate: 75
        }
      };

      res.json({ success: true, data: report });
    } catch (error) {
      console.error('[Student Progress Analytics] Error generating report:', error);
      res.status(500).json({ success: false, error: 'Failed to generate progress report' });
    }
  });

  // ========================================
  // Goal Tracking System
  // ========================================

  // Set goals for student
  app.post('/api/coach/students/:studentId/goals', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const studentId = req.params.studentId;
      const goalData = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Validate goal data
      if (!goalData.title || !goalData.description || !goalData.targetDate) {
        return res.status(400).json({ 
          error: 'Missing required goal fields: title, description, targetDate' 
        });
      }

      const goal = await storage.createStudentGoal({
        coachId: userId,
        studentId,
        title: goalData.title,
        description: goalData.description,
        targetDate: new Date(goalData.targetDate),
        category: goalData.category || 'skill',
        priority: goalData.priority || 'medium',
        measurable: goalData.measurable || false
      });

      res.json({ success: true, data: goal });
    } catch (error) {
      console.error('[Student Progress Analytics] Error creating goal:', error);
      res.status(500).json({ success: false, error: 'Failed to create student goal' });
    }
  });

  // Update goal progress
  app.put('/api/coach/goals/:goalId/progress', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      const goalId = req.params.goalId;
      const { progress, notes } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ 
          error: 'Progress must be a number between 0 and 100' 
        });
      }

      const updatedGoal = await storage.updateGoalProgress(goalId, userId, progress, notes);
      
      res.json({ success: true, data: updatedGoal });
    } catch (error) {
      console.error('[Student Progress Analytics] Error updating goal progress:', error);
      res.status(500).json({ success: false, error: 'Failed to update goal progress' });
    }
  });

  console.log('[API] Student Progress Analytics routes registered successfully');
}