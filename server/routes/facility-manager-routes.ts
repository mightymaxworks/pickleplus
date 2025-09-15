/**
 * PKL-278651-FACILITY-MGMT-001 - Advanced Facility Management System
 * Facility manager API routes for dashboard analytics and management
 */

import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

const router = Router();

// Apply authentication middleware to all facility manager routes
router.use(isAuthenticated);

// Get facility booking summary and metrics
router.get("/summary", async (req, res) => {
  try {
    const querySchema = z.object({
      range: z.enum(['today', 'week', 'month']).default('week'),
      facilityId: z.coerce.number().optional()
    });

    const { range, facilityId } = querySchema.parse(req.query);
    
    // For demo purposes, generate realistic mock data
    // In production, this would query actual booking data
    const summary = await storage.getFacilityBookingSummary(facilityId, range);

    res.json(summary);

  } catch (error) {
    console.error("Facility summary error:", error);
    res.status(500).json({ error: "Failed to fetch facility summary" });
  }
});

// Get detailed facility statistics and analytics
router.get("/stats", async (req, res) => {
  try {
    const querySchema = z.object({
      range: z.enum(['today', 'week', 'month']).default('week'),
      facilityId: z.coerce.number().optional()
    });

    const { range, facilityId } = querySchema.parse(req.query);
    
    const stats = await storage.getFacilityDetailedStats(facilityId, range);

    res.json(stats);

  } catch (error) {
    console.error("Facility stats error:", error);
    res.status(500).json({ error: "Failed to fetch facility statistics" });
  }
});

// Get facility bookings with filtering and pagination
router.get("/bookings", async (req, res) => {
  try {
    const querySchema = z.object({
      facilityId: z.coerce.number().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      status: z.enum(['confirmed', 'cancelled', 'completed', 'pending']).optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20)
    });

    const { facilityId, date, status, page, limit } = querySchema.parse(req.query);
    
    const bookings = await storage.getFacilityBookings({
      facilityId,
      date,
      status,
      page,
      limit
    });

    res.json(bookings);

  } catch (error) {
    console.error("Facility bookings error:", error);
    res.status(500).json({ error: "Failed to fetch facility bookings" });
  }
});

// Update booking status
router.patch("/bookings/:id", async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const updateSchema = z.object({
      status: z.enum(['confirmed', 'cancelled', 'completed', 'pending']),
      notes: z.string().max(500).optional()
    });

    const updateData = updateSchema.parse(req.body);
    
    const booking = await storage.updateFacilityBookingStatus(bookingId, updateData);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ 
      success: true, 
      message: "Booking updated successfully",
      booking 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid update data", 
        details: error.errors 
      });
    }
    
    console.error("Booking update error:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

export default router;