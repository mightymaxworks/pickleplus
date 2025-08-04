/**
 * Player-Coach Direct Booking System API
 * Phase 5B - UDF Implementation
 */

import express from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";
import { z } from "zod";

const router = express.Router();

// Validation schemas for booking system
const createBookingSchema = z.object({
  coachId: z.number(),
  sessionDate: z.string(), // YYYY-MM-DD format
  timeSlot: z.string(), // HH:MM format
  sessionType: z.enum(['individual', 'group', 'clinic', 'assessment']),
  duration: z.number().min(30).max(180),
  location: z.enum(['coach_location', 'student_location', 'neutral', 'online']),
  specialRequests: z.string().optional(),
  totalPrice: z.number().min(0)
});

const updateBookingSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  newDate: z.string().optional(),
  newTime: z.string().optional(),
  cancellationReason: z.string().optional()
});

// Create a new booking
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);
    const studentId = req.user.id;

    // Check if coach exists and is available
    const coach = await storage.getCoachProfile(validatedData.coachId);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    // Create booking record
    const booking = await storage.createBooking({
      ...validatedData,
      studentId,
      status: 'confirmed',
      paymentStatus: 'pending',
      bookingDate: new Date(),
      sessionDate: new Date(validatedData.sessionDate + 'T' + validatedData.timeSlot),
      canCancel: true,
      canReschedule: true
    });

    // In real implementation, would trigger:
    // - Payment processing
    // - Email notifications
    // - Calendar updates
    console.log(`[Booking API] New booking created: ${booking.id} for coach ${validatedData.coachId}`);

    res.status(201).json({
      success: true,
      booking: {
        id: booking.id,
        sessionDate: validatedData.sessionDate,
        timeSlot: validatedData.timeSlot,
        coach: {
          id: coach.id,
          firstName: coach.firstName,
          lastName: coach.lastName,
          certificationLevel: coach.certificationLevel
        },
        totalPrice: validatedData.totalPrice,
        status: 'confirmed'
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid booking data', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Get user's bookings
router.get('/my-bookings', isAuthenticated, async (req, res) => {
  try {
    const studentId = req.user.id;
    const bookings = await storage.getUserBookings(studentId);

    // Transform bookings to include coach details
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const coach = await storage.getCoachProfile(booking.coachId);
        return {
          ...booking,
          coach: coach ? {
            id: coach.id,
            firstName: coach.firstName,
            lastName: coach.lastName,
            profileImage: coach.profileImage,
            certificationLevel: coach.certificationLevel
          } : null
        };
      })
    );

    res.json(enrichedBookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Cancel a booking
router.post('/:bookingId/cancel', isAuthenticated, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const studentId = req.user.id;
    const { cancellationReason } = req.body;

    // Verify booking belongs to user
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.studentId !== studentId) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    // Check cancellation policy (24 hours notice)
    const sessionDateTime = new Date(booking.sessionDate);
    const now = new Date();
    const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession < 24) {
      return res.status(400).json({ 
        message: 'Cancellations require 24 hours notice'
      });
    }

    const updatedBooking = await storage.updateBooking(bookingId, {
      status: 'cancelled',
      cancellationReason,
      cancelledAt: new Date()
    });

    // In real implementation, would:
    // - Process refund
    // - Send notifications
    // - Update coach calendar
    console.log(`[Booking API] Booking ${bookingId} cancelled by student ${studentId}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

// Reschedule a booking
router.post('/:bookingId/reschedule', isAuthenticated, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const studentId = req.user.id;
    const { newDate, newTime } = updateBookingSchema.parse(req.body);

    if (!newDate || !newTime) {
      return res.status(400).json({ message: 'New date and time required' });
    }

    // Verify booking belongs to user
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.studentId !== studentId) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking cannot be rescheduled' });
    }

    // Check if new time slot is available
    const newSessionDateTime = new Date(newDate + 'T' + newTime);
    
    const updatedBooking = await storage.updateBooking(bookingId, {
      sessionDate: newSessionDateTime,
      rescheduledAt: new Date(),
      previousSessionDate: booking.sessionDate
    });

    // In real implementation, would:
    // - Check coach availability
    // - Send notifications
    // - Update calendars
    console.log(`[Booking API] Booking ${bookingId} rescheduled to ${newDate} ${newTime}`);

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    res.status(500).json({ message: 'Failed to reschedule booking' });
  }
});

// Get coach availability
router.get('/coaches/:coachId/availability', async (req, res) => {
  try {
    const coachId = parseInt(req.params.coachId);
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date parameter required' });
    }

    // In real implementation, would fetch from coach_availability table
    // For now, generate sample availability
    const availability = generateSampleAvailability(coachId, date as string);

    res.json({
      success: true,
      coachId,
      date,
      availability
    });
  } catch (error) {
    console.error('Error fetching coach availability:', error);
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
});

// Get booking details
router.get('/:bookingId', isAuthenticated, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const userId = req.user.id;

    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has permission to view this booking
    if (booking.studentId !== userId && booking.coachId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Enrich with coach and student details
    const coach = await storage.getCoachProfile(booking.coachId);
    const student = await storage.getUser(booking.studentId);

    res.json({
      ...booking,
      coach: coach ? {
        id: coach.id,
        firstName: coach.firstName,
        lastName: coach.lastName,
        profileImage: coach.profileImage,
        certificationLevel: coach.certificationLevel
      } : null,
      student: student ? {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName
      } : null
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ message: 'Failed to fetch booking details' });
  }
});

// Helper function to generate sample availability
function generateSampleAvailability(coachId: number, date: string) {
  const slots = [];
  const startHour = 8;
  const endHour = 20;

  for (let hour = startHour; hour < endHour; hour++) {
    ['00', '30'].forEach(minute => {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute}`;
      slots.push({
        id: `${date}-${timeString}`,
        time: timeString,
        available: Math.random() > 0.3, // 70% availability
        price: 95 + (hour > 16 ? 10 : 0), // Peak hours cost more
        duration: 60
      });
    });
  }

  return slots;
}

export default router;