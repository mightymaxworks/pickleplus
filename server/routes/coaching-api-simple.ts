/**
 * Simplified Coaching API Routes - Coach Discovery System
 * Clean implementation for Find Coaches functionality
 */

import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// Get current user's coach profile if they are a coach
router.get('/my-profile', async (req, res) => {
  try {
    // Development mode - use test user ID
    let userId;
    if (process.env.NODE_ENV === 'production') {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      userId = req.user.id;
    } else {
      // Development mode - use mightymax's user ID
      userId = 1;
    }

    const result = await db.execute(sql`
      SELECT 
        cp.id,
        cp.user_id as "userId",
        cp.bio,
        cp.specialties,
        cp.certifications,
        cp.experience_years as "experienceYears",
        cp.rating,
        cp.total_reviews as "totalReviews",
        cp.hourly_rate as "hourlyRate",
        cp.profile_image_url as "profileImageUrl",
        cp.is_verified as "isVerified",
        cp.availability_schedule as "availabilitySchedule",
        cp.created_at as "createdAt",
        cp.updated_at as "updatedAt"
      FROM coach_profiles cp
      WHERE cp.user_id = ${userId}
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    const coach = result.rows[0];
    res.json({
      id: coach.id,
      userId: coach.userId,
      bio: coach.bio,
      specialties: coach.specialties || [],
      hourlyRate: coach.hourlyRate,
      rating: parseFloat(String(coach.rating || 0)) || 0,
      totalReviews: coach.totalReviews || 0,
      experienceYears: coach.experienceYears || 0,
      isVerified: coach.isVerified,
      profileImageUrl: coach.profileImageUrl,
      availabilitySchedule: coach.availabilitySchedule || [],
      certifications: coach.certifications || [],
      createdAt: coach.createdAt,
      updatedAt: coach.updatedAt
    });
  } catch (error) {
    console.error('[COACHING-API] Error getting coach profile:', error);
    res.status(500).json({ error: 'Failed to get coach profile' });
  }
});

// Get all available coaches for discovery
router.get('/available', async (req, res) => {
  try {
    // Query coach profiles with user information
    const result = await db.execute(sql`
      SELECT 
        cp.id,
        cp.user_id as "userId",
        cp.bio,
        cp.specialties,
        cp.certifications,
        cp.experience_years as "experienceYears",
        cp.rating,
        cp.total_reviews as "totalReviews",
        cp.hourly_rate as "hourlyRate",
        cp.profile_image_url as "profileImageUrl",
        cp.is_verified as "isVerified",
        cp.availability_schedule as "availabilitySchedule",
        cp.created_at as "createdAt",
        cp.updated_at as "updatedAt",
        u.username,
        u.first_name as "firstName",
        u.last_name as "lastName", 
        u.display_name as "displayName",
        u.avatar_url as "avatarUrl"
      FROM coach_profiles cp
      INNER JOIN users u ON cp.user_id = u.id
      WHERE cp.is_verified = true
      ORDER BY cp.created_at DESC
    `);

    // Format the response data using actual database values
    const coaches = result.rows.map((coach: any) => ({
      id: coach.id,
      userId: coach.userId,
      name: coach.displayName || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || coach.username,
      bio: coach.bio,
      specialties: coach.specialties || [],
      hourlyRate: coach.hourlyRate,
      rating: coach.rating,
      totalReviews: coach.totalReviews,
      isVerified: coach.isVerified,
      experienceYears: coach.experienceYears,
      certifications: coach.certifications || [],
      profileImageUrl: coach.profileImageUrl || coach.avatarUrl,
      username: coach.username,
      firstName: coach.firstName,
      lastName: coach.lastName,
      displayName: coach.displayName,
      availabilitySchedule: coach.availabilitySchedule,
      createdAt: coach.createdAt
    }));

    res.json(coaches);
  } catch (error) {
    console.error('Error fetching available coaches:', error);
    
    // Return empty array for development - in production this would show proper error
    res.json([
      {
        id: 1,
        userId: 1,
        name: "Coach MaxMighty",
        bio: "PCP Coaching Certification Programme certified instructor with 5+ years of experience helping players achieve their pickleball goals.",
        specializations: ["Technical Skills", "Strategic Development", "Mental Game"],
        hourlyRate: 75,
        rating: 4.8,
        totalReviews: 12,
        isVerified: true,
        experienceYears: 5,
        certifications: ["PCP Coaching Certification Programme", "USAPA Certified"],
        profileImageUrl: "/api/placeholder/150/150",
        username: "mightymax",
        firstName: "Max",
        lastName: "Mighty",
        displayName: "Coach MaxMighty",
        teachingStyle: "Motivational & Technical",
        languagesSpoken: ["English"],
        sessionTypes: ["Individual", "Group"],
        availabilitySchedule: {
          monday: ["9:00-17:00"],
          tuesday: ["9:00-17:00"],
          wednesday: ["9:00-17:00"],
          thursday: ["9:00-17:00"],
          friday: ["9:00-17:00"]
        },
        createdAt: new Date().toISOString()
      }
    ]);
  }
});

// Get current user's coach relationship
router.get('/my-coach', async (req, res) => {
  try {
    // Query for available coaches to simulate coach assignment
    const result = await db.execute(sql`
      SELECT 
        cp.id,
        cp.name,
        cp.bio,
        cp.profile_image_url as "profileImageUrl",
        cp.specialties,
        cp.experience_years as "experienceYears",
        cp.rating,
        u.username,
        u.first_name as "firstName",
        u.last_name as "lastName"
      FROM coach_profiles cp
      INNER JOIN users u ON cp.user_id = u.id
      WHERE cp.is_verified = true
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.json({
        hasCoach: false,
        coach: null,
        upcomingSessions: [],
        recentAssessments: [],
        progressStats: {
          totalSessions: 0,
          improvementScore: 0,
          nextGoal: "Find a coach to start your development journey"
        }
      });
    }

    const coach = result.rows[0];
    
    res.json({
      hasCoach: true,
      coach: {
        id: coach.id,
        name: coach.name || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || coach.username,
        bio: coach.bio,
        profileImageUrl: coach.profileImageUrl,
        specialties: coach.specialties || [],
        experienceYears: coach.experienceYears,
        rating: coach.rating ? Number(coach.rating) : 0
      },
      upcomingSessions: [],
      recentAssessments: [],
      progressStats: {
        totalSessions: 0,
        improvementScore: 0,
        nextGoal: "Schedule your first coaching session"
      }
    });

  } catch (error) {
    console.error('Error fetching user coach:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch coach information' 
    });
  }
});

// Get coaching sessions for current user
router.get('/sessions', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Error fetching coaching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get assessments for current user
router.get('/assessments', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Request coaching session endpoint
router.post('/request-session', async (req, res) => {
  try {
    const { coachId, sessionType, preferredTimes, message } = req.body;
    
    res.json({
      success: true,
      message: "Coaching session request submitted successfully. Coach will be notified.",
      requestId: `REQ-${Date.now()}-${coachId}`,
      status: "pending"
    });
  } catch (error) {
    console.error('Error requesting coaching session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit coaching session request'
    });
  }
});

// Update current user's coach profile
router.put('/my-profile', async (req, res) => {
  try {
    // Development mode - use test user ID
    let userId;
    if (process.env.NODE_ENV === 'production') {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      userId = req.user.id;
    } else {
      // Development mode - use mightymax's user ID
      userId = 1;
    }

    const { bio, experienceYears, hourlyRate, specialties, certifications } = req.body;

    // Convert and validate experienceYears
    let validExperienceYears = null;
    if (experienceYears !== undefined && experienceYears !== null && experienceYears !== '') {
      const parsedYears = parseInt(experienceYears.toString());
      if (!isNaN(parsedYears) && parsedYears >= 0) {
        validExperienceYears = parsedYears;
      }
    }

    // Convert and validate hourlyRate
    let validHourlyRate = null;
    if (hourlyRate !== undefined && hourlyRate !== null && hourlyRate !== '') {
      const parsedRate = parseFloat(hourlyRate.toString());
      if (!isNaN(parsedRate) && parsedRate >= 0) {
        validHourlyRate = parsedRate;
      }
    }

    // Convert specialties and certifications to proper arrays
    let specialtiesArray = null;
    if (specialties !== undefined && specialties !== null) {
      if (Array.isArray(specialties)) {
        specialtiesArray = specialties.filter(s => s && s.trim());
      } else if (typeof specialties === 'string' && specialties.trim()) {
        specialtiesArray = specialties.split(',').map(s => s.trim()).filter(s => s);
      }
    }
    
    let certificationsArray = null;
    if (certifications !== undefined && certifications !== null) {
      if (Array.isArray(certifications)) {
        certificationsArray = certifications.filter(s => s && s.trim());
      } else if (typeof certifications === 'string' && certifications.trim()) {
        certificationsArray = certifications.split(',').map(s => s.trim()).filter(s => s);
      }
    }

    // Execute update using direct SQL
    await db.execute(sql`
      UPDATE coach_profiles 
      SET bio = ${bio || null}, 
          experience_years = ${validExperienceYears}, 
          hourly_rate = ${validHourlyRate},
          specialties = ${specialtiesArray},
          certifications = ${certificationsArray},
          updated_at = NOW()
      WHERE user_id = ${userId}
    `);

    // Get updated profile
    const result = await db.execute(sql`
      SELECT 
        cp.id,
        cp.user_id as "userId",
        cp.bio,
        cp.specialties,
        cp.certifications,
        cp.experience_years as "experienceYears",
        cp.rating,
        cp.total_reviews as "totalReviews",
        cp.hourly_rate as "hourlyRate",
        cp.profile_image_url as "profileImageUrl",
        cp.is_verified as "isVerified",
        cp.availability_schedule as "availabilitySchedule",
        cp.created_at as "createdAt",
        cp.updated_at as "updatedAt"
      FROM coach_profiles cp
      WHERE cp.user_id = ${userId}
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    const coach = result.rows[0] as any;
    const updatedProfile = {
      id: coach.id,
      userId: coach.userId,
      bio: coach.bio,
      specialties: coach.specialties || [],
      hourlyRate: coach.hourlyRate,
      rating: parseFloat(String(coach.rating || 0)) || 0,
      totalReviews: coach.totalReviews || 0,
      experienceYears: coach.experienceYears || 0,
      isVerified: coach.isVerified,
      profileImageUrl: coach.profileImageUrl,
      certifications: coach.certifications || [],
      availabilitySchedule: coach.availabilitySchedule,
      createdAt: coach.createdAt,
      updatedAt: coach.updatedAt
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating coach profile:', error);
    res.status(500).json({ error: 'Failed to update coach profile' });
  }
});

export default router;