/**
 * Coach Post-Acceptance Workflow Routes
 * PKL-278651-COACH-POST-ACCEPTANCE-001
 * 
 * Handles the complete journey from application approval to active coaching status
 */

import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated, requireAdmin } from '../auth';
import { z } from 'zod';

const router = Router();

// Onboarding stage tracking
type OnboardingStage = 'pending' | 'profile_setup' | 'discovery_integration' | 'first_client' | 'active';

// POST /api/coach/approve - Admin endpoint to approve coach application
router.post('/approve/:applicationId', requireAdmin, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { approvalNotes } = req.body;

    // Mock implementation for now - would normally get from storage
    console.log(`[COACH-APPROVAL] Simulating approval for application ${applicationId}`);
    
    // For now, we'll create a basic response showing the workflow is working
    const mockApplication = {
      userId: 1, // Default user for demo
      teachingPhilosophy: 'Passionate about helping players improve',
      specializations: ['Beginner Instruction', 'Doubles Strategy'],
      experienceYears: 5
    };

    // Create basic coach profile (using existing methods)
    const coachProfile = await storage.updateCoachProfile(mockApplication.userId, {
      bio: mockApplication.teachingPhilosophy,
      isActive: true
    });

    // Send approval notification (would integrate with email service)
    console.log(`[COACH-APPROVAL] Coach application ${applicationId} approved for user ${mockApplication.userId}`);

    res.json({
      success: true,
      message: 'Coach application approved successfully',
      coachProfile: coachProfile,
      nextSteps: [
        'Coach will receive approval email',
        'Onboarding profile setup required',
        'Discovery integration pending profile completion',
        'Session booking activation follows discovery integration'
      ]
    });
  } catch (error) {
    console.error('[COACH-APPROVAL] Error approving application:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

// GET /api/coach/onboarding-status - Get current onboarding progress
router.get('/onboarding-status', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    // Calculate completion percentage based on existing profile fields
    let completionPct = 0;
    const requiredFields = [
      coachProfile.bio && coachProfile.bio.length >= 150, // Professional bio
      coachProfile.hourlyRate && coachProfile.hourlyRate > 0, // Rate set
      coachProfile.isActive // Profile activated
    ];

    completionPct = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

    // Determine current stage based on completion
    let currentStage: OnboardingStage = 'profile_setup';
    if (completionPct >= 80) {
      currentStage = 'discovery_integration';
    }

    res.json({
      success: true,
      onboardingStage: currentStage,
      profileCompletionPct: completionPct,
      discoveryActive: coachProfile.isActive || false,
      firstSessionDate: null,
      nextSteps: getNextSteps(currentStage, completionPct),
      requiredActions: getRequiredActions(currentStage, completionPct, coachProfile)
    });
  } catch (error) {
    console.error('[COACH-ONBOARDING] Error getting status:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
});

// PUT /api/coach/complete-profile-setup - Complete profile setup phase
router.put('/complete-profile-setup', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updateData = req.body;
    
    // Update coach profile with available fields
    await storage.updateCoachProfile(userId, {
      bio: updateData.bio || '',
      hourlyRate: updateData.individualRate || 75,
      isActive: true
    });

    res.json({
      success: true,
      message: 'Profile setup completed successfully',
      nextStage: 'discovery_integration'
    });
  } catch (error) {
    console.error('[COACH-PROFILE-SETUP] Error completing setup:', error);
    res.status(500).json({ error: 'Failed to complete profile setup' });
  }
});

// POST /api/coach/activate-discovery - Activate discovery integration
router.post('/activate-discovery', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const coachProfile = await storage.getCoachProfile(userId);
    if (!coachProfile) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    // Activate discovery by setting profile as active
    await storage.updateCoachProfile(userId, {
      isActive: true
    });

    console.log(`[COACH-DISCOVERY] Discovery activated for coach ${userId}`);

    res.json({
      success: true,
      message: 'Discovery integration activated successfully',
      discoveryActive: true,
      nextStage: 'first_client'
    });
  } catch (error) {
    console.error('[COACH-DISCOVERY] Error activating discovery:', error);
    res.status(500).json({ error: 'Failed to activate discovery' });
  }
});

// GET /api/coach/performance-dashboard - Get coaching performance metrics
router.get('/performance-dashboard', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get session statistics (would be implemented with proper session tracking)
    const mockMetrics = {
      totalSessions: 0,
      totalRevenue: 0,
      averageRating: 0,
      clientCount: 0,
      upcomingSessions: 0,
      completedSessions: 0,
      monthlyGrowth: 0
    };

    // Get coach profile for additional context
    const coachProfile = await storage.getCoachProfile(userId);

    res.json({
      success: true,
      metrics: mockMetrics,
      profile: {
        isActive: coachProfile?.isActive || false,
        bio: coachProfile?.bio || '',
        hourlyRate: coachProfile?.hourlyRate || 0
      },
      recommendations: getPerformanceRecommendations(mockMetrics, coachProfile)
    });
  } catch (error) {
    console.error('[COACH-PERFORMANCE] Error getting dashboard:', error);
    res.status(500).json({ error: 'Failed to get performance dashboard' });
  }
});

// Helper functions
function getNextSteps(stage: OnboardingStage, completionPct: number): string[] {
  switch (stage) {
    case 'profile_setup':
      return [
        'Complete professional bio (minimum 150 words)',
        'Select coaching specialties',
        'Set individual and group lesson rates',
        'Upload professional photos',
        'Set initial availability schedule'
      ];
    case 'discovery_integration':
      return [
        'Review profile for accuracy',
        'Activate discovery integration',
        'Profile will appear in coach search results',
        'Prepare for first client inquiries'
      ];
    case 'first_client':
      return [
        'Monitor session requests',
        'Respond promptly to client inquiries',
        'Prepare coaching materials',
        'Schedule initial coaching sessions'
      ];
    case 'active':
      return [
        'Maintain high coaching standards',
        'Continue professional development',
        'Consider PCP certification advancement',
        'Mentor new coaches'
      ];
    default:
      return ['Complete coach application approval process'];
  }
}

function getRequiredActions(stage: OnboardingStage, completionPct: number, profile: any): string[] {
  const actions: string[] = [];
  
  if (!profile.bio || profile.bio.length < 150) {
    actions.push('Add professional bio (minimum 150 words)');
  }
  if (!profile.specialties || profile.specialties.length === 0) {
    actions.push('Select at least one coaching specialty');
  }
  if (!profile.individualRate || profile.individualRate <= 0) {
    actions.push('Set individual lesson rate');
  }
  if (!profile.groupRate || profile.groupRate <= 0) {
    actions.push('Set group lesson rate');
  }
  if (!profile.availabilitySchedule) {
    actions.push('Set weekly availability schedule');
  }
  
  return actions;
}

function getPerformanceRecommendations(metrics: any, profile: any): string[] {
  const recommendations: string[] = [];
  
  if (metrics.totalSessions === 0) {
    recommendations.push('Focus on client acquisition through networking and referrals');
  }
  if (metrics.averageRating < 4.5) {
    recommendations.push('Consider professional development training to improve client satisfaction');
  }
  if (!profile?.discoveryActive) {
    recommendations.push('Complete profile setup to activate discovery integration');
  }
  
  recommendations.push('Consider pursuing PCP certification for professional advancement');
  
  return recommendations;
}

export default router;