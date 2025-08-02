/**
 * PCP Coach Onboarding API Routes
 * PKL-278651-PCP-BASIC-TIER - Comprehensive Basic Tier Implementation
 * 
 * Simplified onboarding flow:
 * 1. PCP Certification Verification
 * 2. Automatic Coach Profile Creation
 * 3. Full Platform Access (Comprehensive Basic Tier)
 * 4. Optional Premium Upgrade
 */

import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { 
  PCP_LEVEL_CONFIG, 
  SUBSCRIPTION_TIERS,
  type InsertCoachProfile 
} from '../../shared/schema/coach-management';

const router = Router();

// PCP Coach Registration Schema
const pcpCoachRegistrationSchema = z.object({
  // PCP Certification Details
  pcpLevel: z.number().min(1).max(5),
  pcpCertificationNumber: z.string().min(1),
  pcpCertifiedAt: z.string().transform(str => new Date(str)),
  pcpExpiresAt: z.string().transform(str => new Date(str)).optional(),
  
  // Basic Profile Information
  bio: z.string().min(50).max(1000),
  profileImageUrl: z.string().url().optional(),
  coachingPhilosophy: z.string().min(30).max(500),
  specializations: z.array(z.string()).min(1).max(5),
  teachingStyle: z.string().min(20).max(300),
  languagesSpoken: z.array(z.string()).default(["English"]),
  
  // Session & Pricing Setup
  hourlyRate: z.number().min(5000).max(30000), // $50-$300 in cents
  sessionTypes: z.array(z.enum(['individual', 'group', 'clinic', 'assessment'])).min(1),
  availabilitySchedule: z.record(z.any()).default({}),
  
  // Contact & Emergency Info
  emergencyContact: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    relationship: z.string()
  })
});

// POST /api/pcp-coach/register - Streamlined PCP coach registration
router.post('/register', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const validatedData = pcpCoachRegistrationSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found' });
    }

    // Check if coach profile already exists
    const existingProfile = await storage.getCoachProfile?.(userId);
    if (existingProfile) {
      return res.status(409).json({ 
        message: 'Coach profile already exists',
        profileId: existingProfile.id 
      });
    }

    // Verify PCP certification level and get commission rate
    const pcpConfig = PCP_LEVEL_CONFIG[validatedData.pcpLevel as keyof typeof PCP_LEVEL_CONFIG];
    if (!pcpConfig) {
      return res.status(400).json({ message: 'Invalid PCP level' });
    }

    // Create comprehensive basic tier coach profile
    const coachProfileData: InsertCoachProfile = {
      userId,
      coachType: 'certified-pcp',
      verificationLevel: 'verified', // Auto-verified for PCP coaches
      isActive: true,
      
      // PCP Certification
      pcpLevel: validatedData.pcpLevel,
      pcpCertificationNumber: validatedData.pcpCertificationNumber,
      pcpCertifiedAt: validatedData.pcpCertifiedAt,
      pcpExpiresAt: validatedData.pcpExpiresAt,
      
      // Profile Information
      bio: validatedData.bio,
      profileImageUrl: validatedData.profileImageUrl,
      specializations: validatedData.specializations,
      teachingStyle: validatedData.teachingStyle,
      coachingPhilosophy: validatedData.coachingPhilosophy,
      languagesSpoken: validatedData.languagesSpoken,
      
      // Session Management
      hourlyRate: validatedData.hourlyRate,
      sessionTypes: validatedData.sessionTypes,
      packageOfferings: [], // Can be added later
      availabilitySchedule: validatedData.availabilitySchedule,
      
      // Start with comprehensive basic tier
      subscriptionTier: SUBSCRIPTION_TIERS.BASIC,
      
      // Auto-approve PCP coaches - will be set by storage layer
      lastActiveAt: new Date()
    };

    const coachProfile = await storage.createCoachProfile?.(coachProfileData);

    if (!coachProfile) {
      throw new Error('Failed to create coach profile');
    }

    // Return comprehensive onboarding success
    res.status(201).json({
      success: true,
      message: `Welcome to Pickle+ as a ${pcpConfig.name}! Your profile is active with full platform access.`,
      profile: {
        id: coachProfile.id,
        pcpLevel: coachProfile.pcpLevel,
        pcpBadge: pcpConfig.badge,
        pcpName: pcpConfig.name,
        commissionRate: pcpConfig.commission,
        subscriptionTier: 'basic',
        features: {
          unlimited_sessions: true,
          full_profile: true,
          basic_analytics: true,
          student_messaging: true,
          standard_payments: true,
          mobile_app_access: true,
          community_access: true
        },
        nextSteps: [
          'Complete your availability schedule',
          'Upload additional coaching photos',
          'Set up your first coaching packages',
          'Explore premium business tools ($19.99/month)'
        ]
      }
    });

  } catch (error) {
    console.error('PCP coach registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Registration failed. Please try again.' 
    });
  }
});

// GET /api/pcp-coach/profile - Enhanced coach profile with tier information
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

    const pcpConfig = PCP_LEVEL_CONFIG[profile.pcpLevel as keyof typeof PCP_LEVEL_CONFIG];

    res.json({
      profile: {
        ...profile,
        pcpBadge: pcpConfig?.badge,
        pcpName: pcpConfig?.name,
        commissionRate: pcpConfig?.commission,
        specializations: JSON.parse(profile.specializations as string || '[]'),
        sessionTypes: JSON.parse(profile.sessionTypes as string || '[]'),
        languagesSpoken: JSON.parse(profile.languagesSpoken as string || '["English"]'),
        packageOfferings: JSON.parse(profile.packageOfferings as string || '[]'),
        availabilitySchedule: JSON.parse(profile.availabilitySchedule as string || '{}'),
        tierFeatures: {
          current: profile.subscriptionTier,
          basic: {
            unlimited_sessions: true,
            full_profile: true,
            basic_analytics: true,
            student_messaging: true,
            standard_payments: true,
            mobile_app_access: true,
            community_access: true
          },
          premium: {
            automated_payouts: true,
            advanced_analytics: true,
            marketing_tools: true,
            video_sessions: true,
            custom_packages: true,
            priority_support: true,
            business_reporting: true
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching PCP coach profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// POST /api/pcp-coach/upgrade-premium - Upgrade to premium tier
router.post('/upgrade-premium', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user!.id;
    const profile = await storage.getCoachProfile?.(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    if (profile.subscriptionTier === SUBSCRIPTION_TIERS.PREMIUM) {
      return res.status(409).json({ message: 'Already on premium tier' });
    }

    // Update to premium tier
    const updatedProfile = await storage.updateCoachProfile?.(userId, {
      subscriptionTier: SUBSCRIPTION_TIERS.PREMIUM,
      subscriptionStartedAt: new Date(),
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    if (!updatedProfile) {
      throw new Error('Failed to upgrade subscription');
    }

    res.json({
      success: true,
      message: 'Upgraded to Premium Business Tools!',
      subscription: {
        tier: 'premium',
        price: '$19.99/month',
        startedAt: updatedProfile.subscriptionStartedAt,
        expiresAt: updatedProfile.subscriptionExpiresAt,
        features: [
          'Automated Wise payouts',
          'Advanced analytics dashboard',
          'Marketing & growth tools',
          'Video session capabilities',
          'Custom package creation',
          'Priority customer support'
        ]
      }
    });

  } catch (error) {
    console.error('Premium upgrade error:', error);
    res.status(500).json({ message: 'Upgrade failed. Please try again.' });
  }
});

// GET /api/pcp-coach/dashboard - Comprehensive dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user!.id;
    const profile = await storage.getCoachProfile?.(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Coach profile not found' });
    }

    const pcpConfig = PCP_LEVEL_CONFIG[profile.pcpLevel as keyof typeof PCP_LEVEL_CONFIG];

    // Get recent sessions (mock data for now - replace with real data)
    const dashboardData = {
      profile: {
        pcpLevel: profile.pcpLevel,
        pcpBadge: pcpConfig?.badge,
        pcpName: pcpConfig?.name,
        subscriptionTier: profile.subscriptionTier
      },
      stats: {
        totalSessions: profile.totalSessions || 0,
        totalEarnings: profile.totalEarnings || 0,
        averageRating: profile.averageRating || 0,
        activeStudents: 0, // Calculate from sessions
        thisMonthSessions: 0,
        thisMonthEarnings: 0
      },
      recentActivity: [],
      upcomingSessions: [],
      notifications: [
        {
          type: 'welcome',
          message: `Welcome to your comprehensive basic tier dashboard! As a ${pcpConfig?.name}, you have full access to all coaching features.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

export { router as pcpCoachOnboardingRoutes };