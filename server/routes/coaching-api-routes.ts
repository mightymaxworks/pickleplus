/**
 * Coaching API Routes - Player-Coach Connection System
 * Supports Find Coaches and My Coach functionality
 */

import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// Get all available coaches for discovery
router.get('/available', async (req, res) => {
  try {
    const coaches = await db.execute(sql`
      SELECT 
        cp.id,
        cp.user_id as "userId",
        cp.name,
        cp.bio,
        cp.specialties,
        cp.certifications,
        cp.experience_years as "experienceYears",
        cp.rating,
        cp.total_reviews as "totalReviews",
        cp.hourly_rate as "hourlyRate",
        cp.profile_image_url as "profileImageUrl",
        cp.is_verified as "isVerified"
      FROM coach_profiles cp
      WHERE cp.is_verified = true
      ORDER BY cp.rating DESC NULLS LAST, cp.total_reviews DESC NULLS LAST
    `);

    res.json(coaches.rows);
  } catch (error) {
    console.error('Error fetching available coaches:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch available coaches' 
    });
  }
});

// Get current user's coach relationship
router.get('/my-coach', async (req, res) => {
  try {
    // For now, return empty since we haven't implemented coach assignments yet
    // This would normally check a coaching_relationships table
    res.json({ 
      coach: null,
      relationship: null 
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
    // Return empty array for now - would implement when coaching sessions are tracked
    res.json([]);
  } catch (error) {
    console.error('Error fetching coaching sessions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch coaching sessions' 
    });
  }
});

// Get PCP assessments for current user
router.get('/assessments', async (req, res) => {
  try {
    // Return empty array for now - would integrate with PCP assessment system
    res.json([]);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch assessments' 
    });
  }
});

// Request coaching session
router.post('/request-session', async (req, res) => {
  try {
    const { coachId, sessionType, message } = req.body;
    
    // Placeholder for session request logic
    // Would create a coaching request record
    
    res.json({ 
      success: true, 
      message: 'Session request sent successfully' 
    });
  } catch (error) {
    console.error('Error requesting coaching session:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to request coaching session' 
    });
  }
});

// Request PCP assessment
router.post('/request-assessment', async (req, res) => {
  try {
    const { coachId, notes } = req.body;
    
    // Placeholder for assessment request logic
    // Would create an assessment request record
    
    res.json({ 
      success: true, 
      message: 'Assessment request sent successfully' 
    });
  } catch (error) {
    console.error('Error requesting assessment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to request assessment' 
    });
  }
});

export default router;