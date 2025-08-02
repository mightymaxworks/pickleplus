/**
 * PCP Coaching Certification Programme API Routes
 * Comprehensive certification system for aspiring coaches
 */

import express from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';

const router = express.Router();

// Simple middleware for optional authentication
const optionalAuth = (req: any, res: any, next: any) => {
  // Allow access whether authenticated or not
  next();
};

// Get all certification levels
router.get('/levels', async (req, res) => {
  try {
    const levels = await storage.getPcpCertificationLevels();
    res.json({ success: true, data: levels });
  } catch (error) {
    console.error('Error fetching certification levels:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch certification levels' });
  }
});

// Get specific certification level details
router.get('/levels/:id', async (req, res) => {
  try {
    const levelId = parseInt(req.params.id);
    const level = await storage.getPcpCertificationLevel(levelId);
    
    if (!level) {
      return res.status(404).json({ success: false, error: 'Certification level not found' });
    }

    res.json({ success: true, data: level });
  } catch (error) {
    console.error('Error fetching certification level:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch certification level' });
  }
});

// Get user's certification status (requires authentication)
router.get('/my-status', optionalAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const status = await storage.getUserCertificationStatus(userId);
    res.json({ success: true, data: status });
  } catch (error) {
    console.error('Error fetching user certification status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch certification status' });
  }
});

// Apply for certification level
router.post('/apply/:levelId', optionalAuth, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const levelId = parseInt(req.params.levelId);
    const applicationData = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Check if user is eligible for this level
    const eligibility = await storage.checkCertificationEligibility(userId, levelId);
    if (!eligibility.eligible) {
      return res.status(400).json({ 
        success: false, 
        error: 'Not eligible for this certification level',
        details: eligibility.reason 
      });
    }

    // Create application
    const application = await storage.createPcpCertificationApplication({
      userId,
      certificationLevelId: levelId,
      motivation: applicationData.motivation,
      experienceStatement: applicationData.experienceStatement,
      goals: applicationData.goals,
      applicationStatus: 'pending',
      paymentStatus: 'pending'
    });

    res.json({ success: true, data: application });
  } catch (error) {
    console.error('Error creating certification application:', error);
    res.status(500).json({ success: false, error: 'Failed to create application' });
  }
});

// Get user's applications
router.get('/my-applications', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const applications = await storage.getUserCertificationApplications(userId);
    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

// Get learning modules for a certification level
router.get('/levels/:levelId/modules', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId);
    const modules = await storage.getPcpLearningModules(levelId);
    res.json({ success: true, data: modules });
  } catch (error) {
    console.error('Error fetching learning modules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch learning modules' });
  }
});

// Get user's module progress
router.get('/applications/:applicationId/progress', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const applicationId = parseInt(req.params.applicationId);
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Verify the application belongs to the user
    const application = await storage.getPcpCertificationApplication(applicationId);
    if (!application || application.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const progress = await storage.getUserModuleProgress(userId, applicationId);
    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Error fetching module progress:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch progress' });
  }
});

// Update module progress
router.post('/progress/:moduleId', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const moduleId = parseInt(req.params.moduleId);
    const { applicationId, progressPercentage, timeSpent } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    await storage.updateModuleProgress(userId, moduleId, applicationId, {
      progressPercentage,
      timeSpent
    });

    res.json({ success: true, message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Error updating module progress:', error);
    res.status(500).json({ success: false, error: 'Failed to update progress' });
  }
});

// Get assessments for a certification level
router.get('/levels/:levelId/assessments', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId);
    const assessments = await storage.getPcpAssessments(levelId);
    res.json({ success: true, data: assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch assessments' });
  }
});

// Submit assessment
router.post('/assessments/:assessmentId/submit', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const assessmentId = parseInt(req.params.assessmentId);
    const { applicationId, responses, timeSpent } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const submission = await storage.submitPcpAssessment({
      userId,
      assessmentId,
      applicationId,
      responses,
      timeSpent
    });

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ success: false, error: 'Failed to submit assessment' });
  }
});

// Get practical requirements for certification level
router.get('/levels/:levelId/practical-requirements', async (req, res) => {
  try {
    const levelId = parseInt(req.params.levelId);
    const requirements = await storage.getPcpPracticalRequirements(levelId);
    res.json({ success: true, data: requirements });
  } catch (error) {
    console.error('Error fetching practical requirements:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch practical requirements' });
  }
});

// Submit practical requirement evidence
router.post('/practical/:requirementId/submit', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const requirementId = parseInt(req.params.requirementId);
    const { applicationId, hoursCompleted, description, evidence } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const submission = await storage.submitPcpPracticalRequirement({
      userId,
      requirementId,
      applicationId,
      hoursCompleted,
      description,
      evidence
    });

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error('Error submitting practical requirement:', error);
    res.status(500).json({ success: false, error: 'Failed to submit practical requirement' });
  }
});

// Get user's issued certifications
router.get('/my-certifications', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const certifications = await storage.getUserIssuedCertifications(userId);
    res.json({ success: true, data: certifications });
  } catch (error) {
    console.error('Error fetching user certifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch certifications' });
  }
});

// Get digital certificate
router.get('/certificate/:certificateId', isAuthenticated, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const certificateId = req.params.certificateId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const certificate = await storage.getDigitalCertificate(userId, certificateId);
    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }

    res.json({ success: true, data: certificate });
  } catch (error) {
    console.error('Error fetching digital certificate:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch certificate' });
  }
});

export default router;