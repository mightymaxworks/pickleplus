/**
 * Session Booking System API Routes
 * Phase 1 Sprint 1.3: Calendar Integration and Session Management
 */

import type { Express } from "express";
import { storage } from "../storage";
import { 
  insertCoachAvailabilitySchema,
  insertBookingSlotSchema, 
  insertBookingSchema,
  insertSessionTemplateSchema,
  insertSessionReviewSchema
} from "@shared/schema/session-booking";

export function registerSessionBookingRoutes(app: Express) {
  console.log('[API] Registering Session Booking System routes');

  // ========================================
  // Coach Availability Management
  // ========================================

  // Get coach availability
  app.get('/api/booking/coaches/:coachId/availability', async (req, res) => {
    try {
      const coachId = parseInt(req.params.coachId);
      const { startDate, endDate } = req.query;
      
      const availability = await storage.getCoachAvailability(
        coachId, 
        startDate as string, 
        endDate as string
      );
      
      res.json({ success: true, data: availability });
    } catch (error) {
      console.error('[Booking][API] Error getting coach availability:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch availability' });
    }
  });

  // Set coach availability (authenticated coach only)
  app.post('/api/booking/availability', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Validate request body
      const validatedData = insertCoachAvailabilitySchema.parse({
        ...req.body,
        coachId
      });

      const availability = await storage.createCoachAvailability(validatedData);
      res.json({ success: true, data: availability });
    } catch (error) {
      console.error('[Booking][API] Error setting availability:', error);
      res.status(500).json({ success: false, error: 'Failed to set availability' });
    }
  });

  // Update coach availability
  app.put('/api/booking/availability/:availabilityId', async (req, res) => {
    try {
      const availabilityId = parseInt(req.params.availabilityId);
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Verify ownership
      const existingAvailability = await storage.getAvailabilityById(availabilityId);
      if (!existingAvailability || existingAvailability.coachId !== coachId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const updatedAvailability = await storage.updateCoachAvailability(availabilityId, req.body);
      res.json({ success: true, data: updatedAvailability });
    } catch (error) {
      console.error('[Booking][API] Error updating availability:', error);
      res.status(500).json({ success: false, error: 'Failed to update availability' });
    }
  });

  // ========================================
  // Booking Slot Management
  // ========================================

  // Get available slots for booking
  app.get('/api/booking/slots/available', async (req, res) => {
    try {
      const { coachId, date, sessionType, skillLevel } = req.query;
      
      const filters = {
        coachId: coachId ? parseInt(coachId as string) : undefined,
        date: date as string,
        sessionType: sessionType as string,
        skillLevel: skillLevel as string
      };

      const availableSlots = await storage.getAvailableBookingSlots(filters);
      res.json({ success: true, data: availableSlots });
    } catch (error) {
      console.error('[Booking][API] Error getting available slots:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch available slots' });
    }
  });

  // Create booking slots from availability (coach only)
  app.post('/api/booking/slots/generate', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { availabilityId, startDate, endDate, sessionTemplate } = req.body;

      // Generate slots based on recurring availability
      const generatedSlots = await storage.generateBookingSlots({
        coachId,
        availabilityId,
        startDate,
        endDate,
        sessionTemplate
      });

      res.json({ success: true, data: generatedSlots });
    } catch (error) {
      console.error('[Booking][API] Error generating slots:', error);
      res.status(500).json({ success: false, error: 'Failed to generate booking slots' });
    }
  });

  // Update specific booking slot
  app.put('/api/booking/slots/:slotId', async (req, res) => {
    try {
      const slotId = parseInt(req.params.slotId);
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Verify ownership
      const existingSlot = await storage.getBookingSlotById(slotId);
      if (!existingSlot || existingSlot.coachId !== coachId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const updatedSlot = await storage.updateBookingSlot(slotId, req.body);
      res.json({ success: true, data: updatedSlot });
    } catch (error) {
      console.error('[Booking][API] Error updating slot:', error);
      res.status(500).json({ success: false, error: 'Failed to update booking slot' });
    }
  });

  // ========================================
  // Student Booking Management
  // ========================================

  // Create new booking (authenticated student)
  app.post('/api/booking/book', async (req, res) => {
    try {
      const studentId = req.user?.id;
      
      if (!studentId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { slotId, paymentMethod, studentNotes } = req.body;

      // Check slot availability
      const slot = await storage.getBookingSlotById(slotId);
      if (!slot || !slot.isAvailable || slot.currentBookings >= slot.maxStudents) {
        return res.status(400).json({ success: false, error: 'Slot not available' });
      }

      // Create booking
      const bookingData = {
        slotId,
        studentId,
        coachId: slot.coachId,
        sessionDate: slot.startTime,
        amountPaid: slot.pricePerStudent,
        paymentMethod,
        goals: studentNotes || null
      };

      const booking = await storage.createBooking(bookingData);
      
      // Update slot availability
      await storage.updateSlotBookingCount(slotId, slot.currentBookings + 1);
      
      // Send confirmation notifications
      await storage.sendBookingConfirmation(booking.id);

      res.json({ success: true, data: booking });
    } catch (error) {
      console.error('[Booking][API] Error creating booking:', error);
      res.status(500).json({ success: false, error: 'Failed to create booking' });
    }
  });

  // Get student's bookings
  app.get('/api/booking/my-bookings', async (req, res) => {
    try {
      const studentId = req.user?.id;
      
      if (!studentId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { status, limit = 20, offset = 0 } = req.query;

      const bookings = await storage.getStudentBookings(studentId, {
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      res.json({ success: true, data: bookings });
    } catch (error) {
      console.error('[Booking][API] Error getting student bookings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
    }
  });

  // Get coach's bookings/schedule
  app.get('/api/booking/coach-schedule', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { startDate, endDate, status } = req.query;

      const schedule = await storage.getCoachSchedule(coachId, {
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string
      });

      res.json({ success: true, data: schedule });
    } catch (error) {
      console.error('[Booking][API] Error getting coach schedule:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch schedule' });
    }
  });

  // Cancel booking
  app.put('/api/booking/:bookingId/cancel', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { reason } = req.body;

      // Verify booking ownership (student or coach)
      const booking = await storage.getBookingById(bookingId);
      if (!booking || (booking.studentId !== userId && booking.coachId !== userId)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      // Process cancellation
      const cancelledBooking = await storage.cancelBooking(bookingId, {
        cancelledBy: userId,
        reason,
        refundEligible: await storage.checkRefundEligibility(bookingId)
      });

      res.json({ success: true, data: cancelledBooking });
    } catch (error) {
      console.error('[Booking][API] Error cancelling booking:', error);
      res.status(500).json({ success: false, error: 'Failed to cancel booking' });
    }
  });

  // ========================================
  // Session Templates Management
  // ========================================

  // Get coach's session templates
  app.get('/api/booking/templates', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const templates = await storage.getCoachSessionTemplates(coachId);
      res.json({ success: true, data: templates });
    } catch (error) {
      console.error('[Booking][API] Error getting session templates:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch templates' });
    }
  });

  // Create session template
  app.post('/api/booking/templates', async (req, res) => {
    try {
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const templateData = insertSessionTemplateSchema.parse({
        ...req.body,
        coachId
      });

      const template = await storage.createSessionTemplate(templateData);
      res.json({ success: true, data: template });
    } catch (error) {
      console.error('[Booking][API] Error creating session template:', error);
      res.status(500).json({ success: false, error: 'Failed to create template' });
    }
  });

  // ========================================
  // Session Management & Check-in
  // ========================================

  // Check-in student to session
  app.post('/api/booking/:bookingId/checkin', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Verify coach ownership
      const booking = await storage.getBookingById(bookingId);
      if (!booking || booking.coachId !== coachId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const checkedInBooking = await storage.checkInStudent(bookingId, {
        checkInTime: new Date(),
        attendanceConfirmed: true
      });

      res.json({ success: true, data: checkedInBooking });
    } catch (error) {
      console.error('[Booking][API] Error checking in student:', error);
      res.status(500).json({ success: false, error: 'Failed to check in student' });
    }
  });

  // Complete session with notes
  app.post('/api/booking/:bookingId/complete', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { 
        performanceNotes, 
        areasImproved, 
        nextSessionRecommendations,
        drillsCompleted,
        sessionRating 
      } = req.body;

      // Verify coach ownership
      const booking = await storage.getBookingById(bookingId);
      if (!booking || booking.coachId !== coachId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const completedBooking = await storage.completeSession(bookingId, {
        performanceNotes,
        areasImproved: JSON.stringify(areasImproved),
        nextSessionRecommendations,
        checkOutTime: new Date(),
        status: 'attended'
      });

      // Update slot with completed drills
      if (drillsCompleted) {
        await storage.updateSlotDrillsCompleted(booking.slotId, drillsCompleted);
      }

      // Create session transaction for payout system
      await storage.createSessionTransaction({
        bookingId,
        coachId,
        studentId: booking.studentId,
        sessionDate: booking.sessionDate,
        grossAmount: booking.amountPaid,
        sessionType: 'individual' // This would come from the slot
      });

      res.json({ success: true, data: completedBooking });
    } catch (error) {
      console.error('[Booking][API] Error completing session:', error);
      res.status(500).json({ success: false, error: 'Failed to complete session' });
    }
  });

  // ========================================
  // Reviews and Feedback
  // ========================================

  // Submit session review
  app.post('/api/booking/:bookingId/review', async (req, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const reviewerId = req.user?.id;
      
      if (!reviewerId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      // Verify booking participation
      const booking = await storage.getBookingById(bookingId);
      if (!booking || (booking.studentId !== reviewerId && booking.coachId !== reviewerId)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const reviewData = insertSessionReviewSchema.parse({
        bookingId,
        reviewerId,
        reviewerType: booking.studentId === reviewerId ? 'student' : 'coach',
        ...req.body
      });

      const review = await storage.createSessionReview(reviewData);
      res.json({ success: true, data: review });
    } catch (error) {
      console.error('[Booking][API] Error submitting review:', error);
      res.status(500).json({ success: false, error: 'Failed to submit review' });
    }
  });

  // ========================================
  // Integration with Drill Library
  // ========================================

  // Get drills for session planning
  app.get('/api/booking/drills/planning', async (req, res) => {
    try {
      const { sessionType, skillLevel, duration, category } = req.query;
      
      const drills = await storage.getDrillsForSessionPlanning({
        sessionType: sessionType as string,
        skillLevel: skillLevel as string,
        duration: duration ? parseInt(duration as string) : undefined,
        category: category as string
      });

      res.json({ success: true, data: drills });
    } catch (error) {
      console.error('[Booking][API] Error getting drills for planning:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch planning drills' });
    }
  });

  // Get recommended session structure based on student profile
  app.get('/api/booking/session-recommendations/:studentId', async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const coachId = req.user?.id;
      
      if (!coachId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const recommendations = await storage.getSessionRecommendations(studentId, coachId);
      res.json({ success: true, data: recommendations });
    } catch (error) {
      console.error('[Booking][API] Error getting session recommendations:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
    }
  });

  console.log('[API] Session Booking System routes registered successfully');
}