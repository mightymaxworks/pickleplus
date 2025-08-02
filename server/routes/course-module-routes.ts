/**
 * Course Module System API Routes
 * Phase 1 Sprint 1.1: Interactive Learning Content Management
 */

import type { Express } from "express";
import { storage } from "../storage";
import { 
  insertCourseModuleSchema, 
  insertModuleProgressSchema, 
  insertAssessmentAttemptSchema,
  insertCertificationApplicationSchema 
} from "@shared/schema/course-modules";

export function registerCourseModuleRoutes(app: Express) {
  console.log('[API] Registering Course Module System routes');

  // ========================================
  // Course Module Management
  // ========================================

  // Get all modules for a specific PCP level
  app.get('/api/pcp-cert/modules/:level', async (req, res) => {
    try {
      const pcpLevel = parseInt(req.params.level);
      
      if (pcpLevel < 1 || pcpLevel > 5) {
        return res.status(400).json({ 
          success: false, 
          error: 'PCP level must be between 1 and 5' 
        });
      }

      const modules = await storage.getCourseModulesByLevel(pcpLevel);
      res.json({ success: true, data: modules });
    } catch (error) {
      console.error('[CourseModules][API] Error getting modules by level:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch course modules' });
    }
  });

  // Get specific module with progress (authenticated)
  app.get('/api/pcp-cert/modules/:moduleId/details', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const userId = req.user?.id; // From authentication middleware
      
      const module = await storage.getCourseModuleById(moduleId);
      if (!module) {
        return res.status(404).json({ success: false, error: 'Module not found' });
      }

      let progress = null;
      if (userId) {
        progress = await storage.getModuleProgress(userId, moduleId);
      }

      res.json({ 
        success: true, 
        data: { 
          module,
          progress,
          drills: module.associatedDrills ? JSON.parse(module.associatedDrills) : []
        }
      });
    } catch (error) {
      console.error('[CourseModules][API] Error getting module details:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch module details' });
    }
  });

  // Start module (create initial progress entry)
  app.post('/api/pcp-cert/modules/:moduleId/start', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Check if progress already exists
      const existingProgress = await storage.getModuleProgress(userId, moduleId);
      if (existingProgress) {
        return res.json({ 
          success: true, 
          message: 'Module already started',
          data: existingProgress 
        });
      }

      const progressData = {
        userId,
        moduleId,
        status: 'in_progress' as const,
        startedAt: new Date(),
        timeSpent: 0,
        attempts: 0
      };

      const progress = await storage.createModuleProgress(progressData);
      res.json({ success: true, data: progress });
    } catch (error) {
      console.error('[CourseModules][API] Error starting module:', error);
      res.status(500).json({ success: false, error: 'Failed to start module' });
    }
  });

  // Update module progress
  app.post('/api/pcp-cert/progress', async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const updateData = {
        ...req.body,
        userId,
        lastAccessedAt: new Date()
      };

      const progress = await storage.updateModuleProgress(updateData);
      res.json({ success: true, data: progress });
    } catch (error) {
      console.error('[CourseModules][API] Error updating progress:', error);
      res.status(500).json({ success: false, error: 'Failed to update progress' });
    }
  });

  // Complete module
  app.post('/api/pcp-cert/modules/:moduleId/complete', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { timeSpent, finalScore } = req.body;

      const completionData = {
        userId,
        moduleId,
        status: 'completed' as const,
        completedAt: new Date(),
        timeSpent: timeSpent || 0,
        currentScore: finalScore || null
      };

      const progress = await storage.updateModuleProgress(completionData);
      
      // Check if all modules for the level are completed
      const module = await storage.getCourseModuleById(moduleId);
      if (module) {
        const levelProgress = await storage.getLevelProgress(userId, module.pcpLevel);
        res.json({ 
          success: true, 
          data: progress,
          levelProgress 
        });
      } else {
        res.json({ success: true, data: progress });
      }
    } catch (error) {
      console.error('[CourseModules][API] Error completing module:', error);
      res.status(500).json({ success: false, error: 'Failed to complete module' });
    }
  });

  // ========================================
  // Assessment Management
  // ========================================

  // Get assessments for a module
  app.get('/api/pcp-cert/modules/:moduleId/assessments', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const assessments = await storage.getModuleAssessments(moduleId);
      res.json({ success: true, data: assessments });
    } catch (error) {
      console.error('[CourseModules][API] Error getting assessments:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch assessments' });
    }
  });

  // Submit assessment attempt
  app.post('/api/pcp-cert/assessments/:assessmentId/submit', async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.assessmentId);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { responses, timeSpent } = req.body;

      // Get existing attempts count
      const attemptCount = await storage.getAssessmentAttemptCount(userId, assessmentId);
      
      const attemptData = {
        userId,
        assessmentId,
        attemptNumber: attemptCount + 1,
        responses: JSON.stringify(responses),
        timeSpent: timeSpent || 0,
        status: 'submitted' as const,
        submittedAt: new Date()
      };

      const attempt = await storage.createAssessmentAttempt(attemptData);
      
      // Calculate score (this would be more sophisticated in real implementation)
      const assessment = await storage.getAssessmentById(assessmentId);
      if (assessment) {
        const calculatedScore = await storage.calculateAssessmentScore(attempt.id);
        res.json({ 
          success: true, 
          data: { ...attempt, score: calculatedScore }
        });
      } else {
        res.json({ success: true, data: attempt });
      }
    } catch (error) {
      console.error('[CourseModules][API] Error submitting assessment:', error);
      res.status(500).json({ success: false, error: 'Failed to submit assessment' });
    }
  });

  // ========================================
  // Certification Application Management
  // ========================================

  // Get user's certification progress
  app.get('/api/pcp-cert/progress/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const requestingUserId = req.user?.id;
      
      // Authorization check - users can only view their own progress or admins can view any
      if (requestingUserId !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const certificationSummary = await storage.getCertificationSummary(userId);
      res.json({ success: true, data: certificationSummary });
    } catch (error) {
      console.error('[CourseModules][API] Error getting certification progress:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch certification progress' });
    }
  });

  // Submit certification application (after modules completed)
  app.post('/api/pcp-cert/apply', async (req, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { pcpLevel, documentsSubmitted } = req.body;

      // Verify all required modules are completed
      const levelProgress = await storage.getLevelProgress(userId, pcpLevel);
      if (levelProgress.completionPercentage < 100) {
        return res.status(400).json({ 
          success: false, 
          error: 'All required modules must be completed before applying for certification' 
        });
      }

      const applicationData = {
        userId,
        pcpLevel,
        status: 'under_review' as const,
        requiredModules: JSON.stringify(levelProgress.moduleIds),
        completedModules: JSON.stringify(levelProgress.completedModuleIds),
        moduleCompletionPercentage: levelProgress.completionPercentage,
        overallScore: levelProgress.overallScore,
        documentsSubmitted: JSON.stringify(documentsSubmitted || []),
        paymentStatus: 'completed' as const // Assume payment was made during provisional signup
      };

      const application = await storage.createCertificationApplication(applicationData);
      res.json({ success: true, data: application });
    } catch (error) {
      console.error('[CourseModules][API] Error submitting certification application:', error);
      res.status(500).json({ success: false, error: 'Failed to submit certification application' });
    }
  });

  // ========================================
  // Integration with Drill Library
  // ========================================

  // Get drills associated with a module
  app.get('/api/pcp-cert/modules/:moduleId/drills', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      
      const module = await storage.getCourseModuleById(moduleId);
      if (!module || !module.associatedDrills) {
        return res.json({ success: true, data: [] });
      }

      const drillIds = JSON.parse(module.associatedDrills);
      const drills = await storage.getDrillsByIds(drillIds);
      
      res.json({ success: true, data: drills });
    } catch (error) {
      console.error('[CourseModules][API] Error getting module drills:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch module drills' });
    }
  });

  // Update drill completion in module
  app.post('/api/pcp-cert/modules/:moduleId/drills/:drillId/complete', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const drillId = parseInt(req.params.drillId);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { score, notes } = req.body;

      // Update module progress with drill completion
      const progress = await storage.getModuleProgress(userId, moduleId);
      if (progress) {
        const drillsCompleted = progress.drillsCompleted ? JSON.parse(progress.drillsCompleted) : [];
        const drillCompletion = {
          drillId,
          completedAt: new Date().toISOString(),
          score,
          notes
        };
        
        // Remove existing entry for this drill and add new one
        const updatedDrills = drillsCompleted.filter((d: any) => d.drillId !== drillId);
        updatedDrills.push(drillCompletion);
        
        await storage.updateModuleProgress({
          userId,
          moduleId,
          drillsCompleted: JSON.stringify(updatedDrills),
          lastAccessedAt: new Date()
        });
      }

      res.json({ success: true, message: 'Drill completion recorded' });
    } catch (error) {
      console.error('[CourseModules][API] Error recording drill completion:', error);
      res.status(500).json({ success: false, error: 'Failed to record drill completion' });
    }
  });

  console.log('[API] Course Module System routes registered successfully');
}