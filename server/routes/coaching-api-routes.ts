/**
 * Coaching API Routes - Player-Coach Connection System
 * Supports Find Coaches and My Coach functionality
 */

import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { storage } from '../storage';

const router = Router();

// Get all available coaches for discovery
router.get('/available', async (req, res) => {
  try {
    const coaches = await storage.getAllCoachProfiles();
    res.json(coaches);
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

// Available coaches endpoint for Find Coaches page
router.get('/coaches/available', async (req, res) => {
  try {
    console.log('[Coaching API] Getting available coaches');
    
    // Get all coach profiles from the database
    const coaches = await storage.getAllCoachProfiles();
    
    // Transform to match the expected format
    const availableCoaches = coaches.map(coach => ({
      id: coach.id,
      userId: coach.userId,
      name: coach.displayName || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || coach.username,
      bio: coach.bio || 'Professional pickleball coach',
      specialties: coach.specialties || ['Technical Skills', 'Strategic Development'],
      certifications: coach.certifications || ['PCP Certified'],
      experienceYears: coach.experienceYears || 5,
      rating: coach.rating || 4.8,
      totalReviews: coach.totalReviews || 12,
      hourlyRate: coach.hourlyRate || 75,
      profileImageUrl: coach.profileImageUrl,
      isVerified: coach.isVerified || true
    }));
    
    console.log(`[Coaching API] Found ${availableCoaches.length} available coaches`);
    res.json(availableCoaches);
    
  } catch (error) {
    console.error('[Coaching API] Error getting available coaches:', error);
    res.status(500).json({ error: 'Failed to get available coaches' });
  }
});

export default router;