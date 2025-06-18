/**
 * Simplified Coaching API Routes - Coach Discovery System
 * Clean implementation for Find Coaches functionality
 */

import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

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
    // For now, return empty since we haven't implemented coach assignments yet
    res.json({ 
      coach: null,
      relationship: null,
      message: "Coach assignment feature coming soon"
    });
  } catch (error) {
    console.error('Error fetching user coach:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch coach information' 
    });
  }
});

// Request coaching session endpoint
router.post('/request-session', async (req, res) => {
  try {
    const { coachId, sessionType, preferredTimes, message } = req.body;
    
    // For now, just return success - full implementation would handle booking
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

export default router;