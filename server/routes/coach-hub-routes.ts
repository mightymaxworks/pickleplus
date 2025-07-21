import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { CoachApplication, CoachProfile } from '../../shared/schema';

export function registerCoachHubRoutes(app: express.Express) {
  
  // Get coach application status
  app.get('/api/coach/application-status', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const application = await storage.getCoachApplication(userId);
      
      if (!application) {
        return res.json({
          success: true,
          data: {
            status: 'none'
          }
        });
      }

      res.json({
        success: true,
        data: {
          id: application.id,
          status: application.applicationStatus,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt,
          feedback: application.rejectionReason
        }
      });
    } catch (error) {
      console.error('Error getting coach application status:', error);
      res.status(500).json({ error: 'Failed to get application status' });
    }
  });

  // Submit coach application
  app.post('/api/coach/application/submit', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const applicationData = req.body;
      
      // Validate required fields  
      const requiredFields = [
        'coachType', 'experienceYears', 'teachingPhilosophy',
        'specializations', 'availabilityData'
      ];

      for (const field of requiredFields) {
        if (!applicationData[field]) {
          return res.status(400).json({ 
            error: `Missing required field: ${field}` 
          });
        }
      }

      // Check for existing application
      const existingApplication = await storage.getCoachApplication(userId);
      if (existingApplication && existingApplication.applicationStatus === 'pending') {
        return res.status(400).json({ 
          error: 'You already have a pending application' 
        });
      }

      // Create the application
      const application = await storage.createCoachApplication({
        userId,
        coachType: applicationData.coachType || 'independent',
        applicationStatus: 'pending',
        experienceYears: applicationData.experienceYears,
        teachingPhilosophy: applicationData.teachingPhilosophy,
        specializations: applicationData.specializations || [],
        availabilityData: applicationData.availabilityData || {},
        previousExperience: applicationData.previousExperience || '',
        references: applicationData.references || [],
        backgroundCheckConsent: applicationData.backgroundCheckConsent || false,
        insuranceDetails: applicationData.insuranceDetails || {},
        emergencyContact: applicationData.emergencyContact || {}
      });

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error submitting coach application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // Get coach profile (for active coaches)
  app.get('/api/coaches/my-profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const coachProfile = await storage.getCoachProfile(userId);
      
      if (!coachProfile) {
        return res.status(404).json({ 
          error: 'Coach profile not found',
          data: {
            profileComplete: false,
            isActiveCoach: false
          }
        });
      }

      res.json({
        success: true,
        data: {
          id: coachProfile.id,
          bio: coachProfile.bio,
          specializations: coachProfile.specializations || [],
          sessionTypes: coachProfile.sessionTypes || [],
          profileComplete: !!(coachProfile.bio && coachProfile.specializations?.length),
          isActiveCoach: coachProfile.isActive
        }
      });
    } catch (error) {
      console.error('Error getting coach profile:', error);
      res.status(500).json({ error: 'Failed to get coach profile' });
    }
  });

  // Admin endpoint - Approve coach application
  app.post('/api/admin/coach/approve/:applicationId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user is admin
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const applicationId = parseInt(req.params.applicationId);
      const { feedback } = req.body;

      const application = await storage.updateCoachApplicationStatus(applicationId, {
        applicationStatus: 'approved',
        reviewedAt: new Date(),
        rejectionReason: feedback
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Create coach profile for approved applicant
      await storage.createCoachProfile({
        userId: application.userId,
        coachType: application.coachType,
        bio: '',
        specializations: [],
        isActive: false // Will be activated after Level 1 certification
      });

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error approving coach application:', error);
      res.status(500).json({ error: 'Failed to approve application' });
    }
  });

  // Admin endpoint - Reject coach application
  app.post('/api/admin/coach/reject/:applicationId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user is admin
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const applicationId = parseInt(req.params.applicationId);
      const { feedback } = req.body;

      const application = await storage.updateCoachApplicationStatus(applicationId, {
        applicationStatus: 'rejected',
        reviewedAt: new Date(),
        rejectionReason: feedback
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error rejecting coach application:', error);
      res.status(500).json({ error: 'Failed to reject application' });
    }
  });

  // Admin endpoint - Get all pending applications
  app.get('/api/admin/coach/applications/pending', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if user is admin
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const applications = await storage.getPendingCoachApplications();

      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error getting pending applications:', error);
      res.status(500).json({ error: 'Failed to get pending applications' });
    }
  });

  console.log('[API] Coach Hub routes registered successfully');
}