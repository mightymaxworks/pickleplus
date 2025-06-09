/**
 * PKL-278651-COACH-ADMIN-001 - Admin Coach Management API Routes
 * Backend endpoints for coach application review and management
 */

import express, { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';

const router = Router();

// Get all coach applications for admin review
router.get('/coach-applications', async (req, res) => {
  try {
    const applications = await storage.getAllCoachApplications();
    
    // Transform applications for admin interface
    const transformedApplications = applications.map(app => ({
      id: app.id,
      userId: app.user_id,
      userName: app.user_name || 'Unknown User',
      email: app.user_email || '',
      coachType: app.coach_type,
      applicationStatus: app.application_status,
      submittedAt: app.submitted_at,
      personalInfo: {
        firstName: app.first_name || '',
        lastName: app.last_name || '',
        phone: app.phone || '',
        email: app.user_email || '',
        dateOfBirth: app.dateOfBirth || '',
        emergencyContact: app.emergency_contact || ''
      },
      experience: {
        yearsPlaying: app.yearsPlaying || 0,
        yearsCoaching: app.experience_years || 0,
        previousExperience: app.previous_experience || '',
        achievements: Array.isArray(app.achievements) ? app.achievements : []
      },
      certifications: {
        pcpCertified: app.pcpCertified || false,
        certificationNumber: app.certificationNumber || '',
        otherCertifications: Array.isArray(app.otherCertifications) ? app.otherCertifications : []
      },
      availability: {
        schedule: typeof app.availability_data === 'string' 
          ? JSON.parse(app.availability_data || '{}') 
          : (app.availability_data || {}),
        preferredTimes: Array.isArray(app.preferredTimes) ? app.preferredTimes : []
      },
      rates: {
        hourlyRate: app.hourlyRate || 0,
        packageRates: typeof app.packageRates === 'string'
          ? JSON.parse(app.packageRates || '{}')
          : (app.packageRates || {})
      },
      specializations: Array.isArray(app.specializations) 
        ? app.specializations 
        : (typeof app.specializations === 'string' ? JSON.parse(app.specializations || '[]') : []),
      references: typeof app.ref_contacts === 'string'
        ? JSON.parse(app.ref_contacts || '[]')
        : (Array.isArray(app.ref_contacts) ? app.ref_contacts : []),
      adminNotes: app.adminNotes || '',
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt
    }));

    res.json(transformedApplications);
  } catch (error) {
    console.error('Error fetching coach applications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch coach applications' 
    });
  }
});

// Review a coach application
router.post('/coach-applications/:id/review', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { action, notes } = req.body;
    const adminId = (req as any).user?.id || 1; // Default to admin user ID 1

    if (!action || !['approve', 'reject', 'request_info'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be approve, reject, or request_info'
      });
    }

    // Get the application first
    const application = await storage.getCoachApplication(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Coach application not found'
      });
    }

    // Determine new status based on action
    let newStatus: string;
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'request_info':
        newStatus = 'under_review';
        break;
      default:
        newStatus = 'pending';
    }

    // Update application status
    await storage.updateCoachApplicationStatus(applicationId, {
      status: newStatus,
      adminNotes: notes,
      reviewedBy: adminId,
      reviewedAt: new Date()
    });

    // If approved, create coach profile
    if (action === 'approve') {
      try {
        await storage.createCoachProfile({
          userId: application.userId,
          name: `${application.firstName} ${application.lastName}`,
          bio: application.previousExperience || 'Approved coach',
          specialties: Array.isArray(application.specializations) 
            ? application.specializations 
            : [application.specializations].filter(Boolean),
          certifications: application.pcpCertified ? ['PCP Coaching Certification Programme'] : [],
          experienceYears: application.yearsCoaching || 0,
          rating: 0,
          totalReviews: 0,
          hourlyRate: application.hourlyRate || 0,
          profileImageUrl: null,
          isVerified: true,
          availabilitySchedule: typeof application.availabilityData === 'string'
            ? JSON.parse(application.availabilityData || '{}')
            : (application.availabilityData || {}),
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Log admin action
        await storage.logAdminAction({
          adminId,
          actionType: 'approve_coach_application',
          targetId: applicationId,
          targetType: 'coach_application',
          details: {
            coachUserId: application.userId,
            coachType: application.coachType,
            adminNotes: notes
          }
        });
      } catch (profileError) {
        console.error('Error creating coach profile after approval:', profileError);
        // Continue with the response - application is still marked as approved
      }
    } else {
      // Log admin action for reject/request_info
      await storage.logAdminAction({
        adminId,
        actionType: `${action}_coach_application`,
        targetId: applicationId,
        targetType: 'coach_application',
        details: {
          previousStatus: application.applicationStatus,
          newStatus,
          adminNotes: notes
        }
      });
    }

    res.json({
      success: true,
      message: `Application ${action}d successfully`,
      data: {
        applicationId,
        newStatus,
        action,
        reviewedBy: adminId,
        reviewedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error reviewing coach application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review coach application'
    });
  }
});

// Get coach performance metrics for admin dashboard
router.get('/coach-performance/:coachId', async (req, res) => {
  try {
    const coachId = parseInt(req.params.coachId);
    
    const performance = await storage.getCoachPerformanceMetrics(coachId);
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching coach performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coach performance metrics'
    });
  }
});

// Update coach verification status
router.post('/coaches/:coachId/verification', async (req, res) => {
  try {
    const coachId = parseInt(req.params.coachId);
    const { isVerified, verificationNotes } = req.body;
    const adminId = (req as any).user?.id || 1;

    await storage.updateCoachVerificationStatus(coachId, {
      isVerified,
      verificationNotes,
      verifiedBy: adminId,
      verifiedAt: new Date()
    });

    // Log admin action
    await storage.logAdminAction({
      adminId,
      actionType: 'update_coach_verification',
      targetId: coachId,
      targetType: 'coach',
      details: {
        isVerified,
        verificationNotes
      }
    });

    res.json({
      success: true,
      message: 'Coach verification status updated successfully'
    });

  } catch (error) {
    console.error('Error updating coach verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update coach verification status'
    });
  }
});

// Get all coaches with admin details
router.get('/coaches', async (req, res) => {
  try {
    const coaches = await storage.getAllCoachesWithDetails();
    
    res.json({
      success: true,
      data: coaches
    });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coaches'
    });
  }
});

// Assign coach to facility (dual role management)
router.post('/coaches/:coachId/assign-facility', async (req, res) => {
  try {
    const coachId = parseInt(req.params.coachId);
    const { facilityId, notes } = req.body;
    const adminId = (req as any).user?.id || 1;

    if (!facilityId) {
      return res.status(400).json({
        success: false,
        error: 'Facility ID is required'
      });
    }

    await storage.assignCoachToFacility({
      coachId,
      facilityId,
      assignedBy: adminId,
      assignmentDate: new Date(),
      isActive: true,
      notes: notes || ''
    });

    // Log admin action
    await storage.logAdminAction({
      adminId,
      actionType: 'assign_coach_to_facility',
      targetId: coachId,
      targetType: 'coach',
      details: {
        facilityId,
        notes
      }
    });

    res.json({
      success: true,
      message: 'Coach assigned to facility successfully'
    });

  } catch (error) {
    console.error('Error assigning coach to facility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign coach to facility'
    });
  }
});

// Remove coach from facility
router.delete('/coaches/:coachId/facility/:facilityId', async (req, res) => {
  try {
    const coachId = parseInt(req.params.coachId);
    const facilityId = parseInt(req.params.facilityId);
    const adminId = (req as any).user?.id || 1;

    await storage.removeCoachFromFacility(coachId, facilityId);

    // Log admin action
    await storage.logAdminAction({
      adminId,
      actionType: 'remove_coach_from_facility',
      targetId: coachId,
      targetType: 'coach',
      details: {
        facilityId
      }
    });

    res.json({
      success: true,
      message: 'Coach removed from facility successfully'
    });

  } catch (error) {
    console.error('Error removing coach from facility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove coach from facility'
    });
  }
});

export default router;