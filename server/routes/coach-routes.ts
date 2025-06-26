/**
 * Coach Management API Routes
 * PKL-278651-COACH-001 - Sprint 1: Core Infrastructure & Application Flow
 * PKL-278651-COACH-DUAL-ROLE - Dual Role Assignment Support
 */

import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Coach Application Schema
const coachApplicationSchema = z.object({
  coachType: z.enum(['independent', 'facility', 'volunteer', 'guest']),
  experienceYears: z.number().min(1).max(50),
  teachingPhilosophy: z.string().min(50).max(500),
  specializations: z.array(z.string()).min(1),
  availabilityData: z.record(z.any()).default({}),
  previousExperience: z.string().min(20),
  references: z.array(z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  })).min(1),
  backgroundCheckConsent: z.boolean().refine(val => val === true, {
    message: "Background check consent is required"
  }),
  emergencyContact: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    relationship: z.string().optional()
  }),
  certifications: z.array(z.object({
    certificationType: z.string(),
    issuingOrganization: z.string(),
    certificationNumber: z.string().optional(),
    issuedDate: z.string().optional(),
    expirationDate: z.string().optional()
  })).default([])
});

// POST /api/coach/apply - Submit a new coach application (alias for /applications)
router.post('/apply', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const validatedData = coachApplicationSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    const application = await storage.createCoachApplication({
      userId,
      ...validatedData
    });

    res.status(201).json({
      success: true,
      message: 'Coach application submitted successfully',
      applicationId: application.id
    });
  } catch (error) {
    console.error('Coach application error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
});

// POST /api/coach/applications - Submit a new coach application
router.post('/applications', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user!.id;
    
    // Check if user already has an application
    const existingApplication = await storage.getCoachApplicationByUserId?.(userId);
    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You already have a coach application. Please contact support to update your application.' 
      });
    }

    // Validate request body
    const validatedData = coachApplicationSchema.parse(req.body);
    
    // Create the application
    const applicationData = {
      userId,
      ...validatedData,
      applicationStatus: 'pending' as const,
      submittedAt: new Date(),
      specializations: JSON.stringify(validatedData.specializations),
      availabilityData: JSON.stringify(validatedData.availabilityData),
      references: JSON.stringify(validatedData.references),
      emergencyContact: JSON.stringify(validatedData.emergencyContact)
    };

    const application = await storage.createCoachApplication?.(applicationData);
    
    // Add certifications if provided
    if (validatedData.certifications.length > 0) {
      for (const cert of validatedData.certifications) {
        if (cert.certificationType && cert.issuingOrganization) {
          await storage.addCoachCertification?.({
            applicationId: application!.id,
            ...cert,
            verificationStatus: 'pending',
            issuedDate: cert.issuedDate ? new Date(cert.issuedDate) : null,
            expirationDate: cert.expirationDate ? new Date(cert.expirationDate) : null
          });
        }
      }
    }

    res.status(201).json({
      message: 'Coach application submitted successfully',
      application: {
        id: application!.id,
        status: application!.applicationStatus,
        submittedAt: application!.submittedAt
      }
    });

  } catch (error) {
    console.error('Error creating coach application:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({ 
      message: 'Failed to submit application. Please try again.' 
    });
  }
});

// GET /api/coach/applications/my - Get current user's application
router.get('/applications/my', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user!.id;
    const application = await storage.getCoachApplicationByUserId?.(userId);
    
    if (!application) {
      return res.status(404).json({ message: 'No application found' });
    }

    // Get certifications
    const certifications = await storage.getCoachCertifications?.(application.id) || [];

    res.json({
      application: {
        ...application,
        specializations: JSON.parse(application.specializations as string || '[]'),
        availabilityData: JSON.parse(application.availabilityData as string || '{}'),
        references: JSON.parse(application.references as string || '[]'),
        emergencyContact: JSON.parse(application.emergencyContact as string || '{}')
      },
      certifications
    });

  } catch (error) {
    console.error('Error fetching coach application:', error);
    res.status(500).json({ message: 'Failed to fetch application' });
  }
});

// GET /api/coach/profile - Get current user's coach profile
router.get('/profile', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user!.id;
    const profile = await storage.getCoachProfile?.(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    res.json({
      profile: {
        ...profile,
        specializations: JSON.parse(profile.specializations as string || '[]'),
        sessionTypes: JSON.parse(profile.sessionTypes as string || '[]'),
        languagesSpoken: JSON.parse(profile.languagesSpoken as string || '["English"]'),
        availabilitySchedule: JSON.parse(profile.availabilitySchedule as string || '{}')
      }
    });

  } catch (error) {
    console.error('Error fetching coach profile:', error);
    res.status(500).json({ message: 'Failed to fetch coach profile' });
  }
});

// Temporary stub implementations for missing storage methods
const stubStorage = {
  async createCoachApplication(data: any) {
    console.log('Coach application would be created:', data);
    return { 
      id: Date.now(), 
      ...data, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
  },
  
  async getCoachApplicationByUserId(userId: number) {
    console.log('Would fetch coach application for user:', userId);
    return null; // No existing applications for now
  },
  
  async getCoachCertifications(applicationId: number) {
    console.log('Would fetch certifications for application:', applicationId);
    return [];
  },
  
  async addCoachCertification(data: any) {
    console.log('Would add certification:', data);
    return { id: Date.now(), ...data };
  },
  
  async getCoachProfile(userId: number) {
    console.log('Would fetch coach profile for user:', userId);
    return null;
  }
};

// PUT /api/admin/coaches/:id/roles - Update coach role assignments (Admin only)
router.put('/admin/coaches/:id/roles', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const coachId = parseInt(req.params.id);
    const { roles, facilityId, notes } = req.body;

    // Validate role assignments
    const roleSchema = z.array(z.object({
      roleType: z.enum(['independent', 'facility', 'guest', 'volunteer']),
      isActive: z.boolean(),
      facilityId: z.number().optional(),
      notes: z.string().optional()
    }));

    const validatedRoles = roleSchema.parse(roles);
    const activeRoles = validatedRoles.filter(r => r.isActive);

    if (activeRoles.length === 0) {
      return res.status(400).json({ 
        message: 'A coach must have at least one active role' 
      });
    }

    // Update coach profile with new roles
    await storage.updateCoachRoles?.(coachId, {
      roles: activeRoles,
      facilityId,
      notes,
      updatedBy: req.user.id,
      updatedAt: new Date()
    });

    res.json({
      message: 'Coach roles updated successfully',
      activeRoles: activeRoles.map(r => r.roleType)
    });

  } catch (error) {
    console.error('Error updating coach roles:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({ 
      message: 'Failed to update coach roles' 
    });
  }
});

// GET /api/admin/coaches - Get all coaches for admin management
router.get('/admin/coaches', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const coaches = await storage.getAllCoaches?.() || [];
    
    res.json({
      coaches: coaches.map(coach => ({
        id: coach.id,
        userId: coach.userId,
        name: coach.displayName || coach.username,
        currentRoles: coach.coachType ? [coach.coachType] : [],
        status: coach.isActive ? 'active' : 'inactive',
        averageRating: coach.averageRating || 0,
        totalSessions: coach.totalSessions || 0,
        joinedAt: coach.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ message: 'Failed to fetch coaches' });
  }
});

// Temporarily enhance storage with stub methods if they don't exist
if (!storage.createCoachApplication) {
  Object.assign(storage, stubStorage);
}

export default router;