/**
 * Session Booking System - PKL-278651-SESSION-BOOKING
 * Complete booking workflow for coach-student sessions
 */

import express from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { z } from "zod";

const router = express.Router();

// Validation schemas
const createSessionRequestSchema = z.object({
  coachId: z.number(),
  sessionType: z.string(),
  preferredDate: z.string(),
  preferredTime: z.string(),
  durationMinutes: z.number().min(30).max(180),
  locationType: z.enum(['online', 'coach_location', 'student_location', 'neutral']),
  locationDetails: z.string().optional(),
  specialRequests: z.string().optional(),
  maxPrice: z.number().optional()
});

const updateSessionRequestSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'cancelled', 'completed']),
  coachResponse: z.string().optional(),
  proposedPrice: z.number().optional(),
  alternativeDateTime: z.string().optional()
});

// Student creates a session request
router.post('/request', isAuthenticated, async (req, res) => {
  try {
    const validatedData = createSessionRequestSchema.parse(req.body);
    const studentId = req.user.id;

    // Check if coach exists and is available
    const coach = await storage.getCoachProfile(validatedData.coachId);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    const sessionRequest = await storage.createSessionRequest({
      ...validatedData,
      studentId,
      status: 'pending',
      requestedAt: new Date()
    });

    // Send notification to coach (placeholder for notification system)
    console.log(`[Session Booking] New session request from student ${studentId} to coach ${validatedData.coachId}`);

    res.status(201).json(sessionRequest);
  } catch (error) {
    console.error('Error creating session request:', error);
    res.status(400).json({ message: 'Invalid session request data' });
  }
});

// Coach responds to session request
router.patch('/request/:requestId/respond', isAuthenticated, async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const coachId = req.user.id;
    const validatedData = updateSessionRequestSchema.parse(req.body);

    // Verify coach owns this request
    const request = await storage.getSessionRequest(requestId);
    if (!request || request.coachId !== coachId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedRequest = await storage.updateSessionRequest(requestId, {
      ...validatedData,
      respondedAt: new Date()
    });

    // If accepted, create coaching session
    if (validatedData.status === 'accepted') {
      const session = await storage.createCoachingSession({
        coachId: request.coachId,
        studentId: request.studentId,
        sessionType: request.sessionType,
        sessionStatus: 'scheduled',
        scheduledAt: new Date(request.preferredDate + 'T' + request.preferredTime),
        durationMinutes: request.durationMinutes,
        locationType: request.locationType,
        locationDetails: request.locationDetails,
        priceAmount: validatedData.proposedPrice || 95, // Default $95
        currency: 'USD',
        paymentStatus: 'pending'
      });

      console.log(`[Session Booking] Session ${session.id} created for coach ${coachId} and student ${request.studentId}`);
      
      return res.json({ request: updatedRequest, session });
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error responding to session request:', error);
    res.status(400).json({ message: 'Invalid response data' });
  }
});

// Get session requests for coach
router.get('/coach/requests', isAuthenticated, async (req, res) => {
  try {
    const coachId = req.user.id;
    const status = req.query.status as string;
    
    const requests = await storage.getSessionRequestsByCoach(coachId, status);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching coach session requests:', error);
    res.status(500).json({ message: 'Failed to fetch session requests' });
  }
});

// Get session requests for student
router.get('/student/requests', isAuthenticated, async (req, res) => {
  try {
    const studentId = req.user.id;
    const status = req.query.status as string;
    
    const requests = await storage.getSessionRequestsByStudent(studentId, status);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching student session requests:', error);
    res.status(500).json({ message: 'Failed to fetch session requests' });
  }
});

// Get upcoming sessions for user
router.get('/upcoming', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await storage.getUpcomingSessions(userId);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming sessions' });
  }
});

// Cancel session
router.patch('/session/:sessionId/cancel', isAuthenticated, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const userId = req.user.id;
    const { reason } = req.body;

    const session = await storage.getCoachingSession(sessionId);
    if (!session || (session.coachId !== userId && session.studentId !== userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedSession = await storage.updateCoachingSession(sessionId, {
      sessionStatus: 'cancelled',
      sessionNotes: reason || 'Cancelled by user'
    });

    console.log(`[Session Booking] Session ${sessionId} cancelled by user ${userId}`);
    res.json(updatedSession);
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(400).json({ message: 'Failed to cancel session' });
  }
});

// Complete session and add feedback
router.patch('/session/:sessionId/complete', isAuthenticated, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const userId = req.user.id;
    const { sessionNotes, feedbackForStudent, rating } = req.body;

    const session = await storage.getCoachingSession(sessionId);
    if (!session || session.coachId !== userId) {
      return res.status(403).json({ message: 'Only coaches can complete sessions' });
    }

    const updatedSession = await storage.updateCoachingSession(sessionId, {
      sessionStatus: 'completed',
      sessionNotes,
      feedbackForStudent,
      completedAt: new Date()
    });

    // Update payment status to completed (trigger payout)
    await storage.updateCoachingSession(sessionId, {
      paymentStatus: 'completed'
    });

    console.log(`[Session Booking] Session ${sessionId} completed by coach ${userId}`);
    res.json(updatedSession);
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(400).json({ message: 'Failed to complete session' });
  }
});

export default router;