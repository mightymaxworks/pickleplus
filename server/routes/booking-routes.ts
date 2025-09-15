/**
 * PKL-278651-FACILITY-MGMT-001 - Advanced Facility Management System
 * Booking API routes for facility court reservations
 */

import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";

const router = Router();

// Create a new booking
router.post("/", async (req, res) => {
  try {
    const bookingSchema = z.object({
      facilityId: z.number().int().positive(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
      time: z.string().regex(/^\d{1,2}:\d{2}$/), // HH:MM format
      duration: z.number().int().positive().min(30).max(240), // 30min to 4hrs
      participants: z.number().int().positive().max(8),
      courtNumber: z.number().int().positive().optional(),
      coachId: z.number().int().positive().optional(),
      playerName: z.string().min(1).max(100),
      playerEmail: z.string().email(),
      playerPhone: z.string().min(10).max(20),
      specialRequests: z.string().max(500).optional()
    });

    const bookingData = bookingSchema.parse(req.body);
    
    // Check if facility exists and is active
    const facility = await storage.getTrainingCenterById(bookingData.facilityId);
    if (!facility || !facility.isActive) {
      return res.status(404).json({ error: "Facility not found or inactive" });
    }

    // Check availability for the requested time slot
    const availability = await storage.getFacilityAvailability(bookingData.facilityId, bookingData.date);
    const requestedSlot = availability.find((slot: any) => slot.time === bookingData.time);
    
    if (!requestedSlot || !requestedSlot.available) {
      return res.status(400).json({ error: "Requested time slot is not available" });
    }

    // Create the booking
    const booking = await storage.createFacilityBooking({
      facilityId: bookingData.facilityId,
      date: bookingData.date,
      time: bookingData.time,
      duration: bookingData.duration,
      participants: bookingData.participants,
      courtNumber: bookingData.courtNumber,
      coachId: bookingData.coachId,
      playerName: bookingData.playerName,
      playerEmail: bookingData.playerEmail,
      playerPhone: bookingData.playerPhone,
      specialRequests: bookingData.specialRequests,
      status: 'confirmed',
      totalAmount: requestedSlot.price,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      booking: {
        id: booking.id,
        facilityName: facility.name,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        totalAmount: requestedSlot.price,
        status: 'confirmed',
        confirmationCode: `PKL-${booking.id.toString().padStart(6, '0')}`
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid booking data", 
        details: error.errors 
      });
    }
    
    console.error("Booking creation error:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// Get user's bookings
router.get("/my-bookings", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email parameter is required" });
    }

    const bookings = await storage.getUserBookings(email);
    res.json({ bookings });

  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Cancel a booking
router.patch("/:id/cancel", async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (!bookingId) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const booking = await storage.cancelFacilityBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ 
      success: true, 
      message: "Booking cancelled successfully",
      booking 
    });

  } catch (error) {
    console.error("Booking cancellation error:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;