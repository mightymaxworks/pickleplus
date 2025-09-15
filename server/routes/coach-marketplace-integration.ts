/**
 * PKL-278651-FACILITY-MGMT-002 - Coach Marketplace Integration API
 * Revenue generation system for coach-facility partnerships
 * 
 * @priority Priority 2: Revenue Generation
 */

import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

const router = Router();

// Get coaches available at a specific facility
router.get("/facilities/:facilityId/coaches", async (req, res) => {
  try {
    const facilityId = parseInt(req.params.facilityId);
    
    if (!facilityId) {
      return res.status(400).json({ error: "Invalid facility ID" });
    }

    const coaches = await storage.getCoachesAtFacility(facilityId);
    res.json({ coaches });

  } catch (error) {
    console.error("Get facility coaches error:", error);
    res.status(500).json({ error: "Failed to fetch facility coaches" });
  }
});

// Get coach partnerships for a specific coach
router.get("/coaches/:coachId/partnerships", isAuthenticated, async (req, res) => {
  try {
    const coachId = parseInt(req.params.coachId);
    
    if (!coachId) {
      return res.status(400).json({ error: "Invalid coach ID" });
    }

    const partnerships = await storage.getCoachPartnerships(coachId);
    res.json({ partnerships });

  } catch (error) {
    console.error("Get coach partnerships error:", error);
    res.status(500).json({ error: "Failed to fetch coach partnerships" });
  }
});

// Create a new coach-facility partnership
router.post("/partnerships", isAuthenticated, async (req, res) => {
  try {
    const partnershipSchema = z.object({
      facilityId: z.number().int().positive(),
      coachId: z.number().int().positive(),
      partnershipType: z.enum(['revenue_share', 'fixed_fee', 'hybrid']),
      commissionRate: z.number().min(0).max(100),
      coachRate: z.number().min(0),
      minimumBookingDuration: z.number().int().positive().default(60),
      isExclusive: z.boolean().default(false),
      specializations: z.array(z.string()).optional(),
      availableSlots: z.object({
        monday: z.array(z.object({
          start: z.string(),
          end: z.string(),
          courtNumber: z.number().optional()
        })).optional(),
        tuesday: z.array(z.object({
          start: z.string(),
          end: z.string(),
          courtNumber: z.number().optional()
        })).optional(),
        wednesday: z.array(z.object({
          start: z.string(),
          end: z.string(),
          courtNumber: z.number().optional()
        })).optional(),
        thursday: z.array(z.object({
          start: z.string(),
          end: z.string(),
          courtNumber: z.number().optional()
        })).optional(),
        friday: z.array(z.object({
          start: z.string(),
          end: z.string(),
          courtNumber: z.number().optional()
        })).optional(),
        saturday: z.array(z.object({
          start: z.string(),
          end: z.string(),
          courtNumber: z.number().optional()
        })).optional(),
        sunday: z.array(z.object({
          start: z.string(),
          end: z.string(),
          courtNumber: z.number().optional()
        })).optional()
      }).optional(),
      terms: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional()
    });

    const partnershipData = partnershipSchema.parse(req.body);
    
    const partnership = await storage.createCoachPartnership(partnershipData);
    
    res.status(201).json({
      success: true,
      partnership
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid partnership data", 
        details: error.errors 
      });
    }
    
    console.error("Partnership creation error:", error);
    res.status(500).json({ error: "Failed to create partnership" });
  }
});

// Book a coach session at a facility
router.post("/bookings", async (req, res) => {
  try {
    const bookingSchema = z.object({
      partnershipId: z.number().int().positive(),
      playerId: z.number().int().positive(),
      sessionDate: z.string(),
      duration: z.number().int().positive().min(30).max(240),
      courtNumber: z.number().int().positive().optional(),
      sessionType: z.enum(['individual', 'group', 'assessment']).default('individual'),
      specialRequests: z.string().optional(),
      playerName: z.string().min(1).max(100),
      playerEmail: z.string().email(),
      playerPhone: z.string().min(10).max(20)
    });

    const bookingData = bookingSchema.parse(req.body);
    
    // Get partnership details to calculate pricing
    const partnership = await storage.getCoachPartnership(bookingData.partnershipId);
    if (!partnership) {
      return res.status(404).json({ error: "Partnership not found" });
    }

    // Calculate revenue split
    const hourlyRate = parseFloat(partnership.coachRate.toString());
    const durationHours = bookingData.duration / 60;
    const totalAmount = hourlyRate * durationHours;
    const facilityCommission = totalAmount * (parseFloat(partnership.commissionRate.toString()) / 100);
    const coachEarnings = totalAmount - facilityCommission;
    const platformFee = totalAmount * 0.03; // 3% platform fee

    const booking = await storage.createCoachBooking({
      ...bookingData,
      coachId: partnership.coachId,
      facilityId: partnership.facilityId,
      totalAmount: totalAmount.toFixed(2),
      coachEarnings: coachEarnings.toFixed(2),
      facilityCommission: facilityCommission.toFixed(2),
      platformFee: platformFee.toFixed(2),
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      booking: {
        id: booking.id,
        confirmationCode: `PKL-COACH-${booking.id.toString().padStart(6, '0')}`,
        totalAmount,
        facilityCommission,
        coachEarnings,
        sessionDate: bookingData.sessionDate,
        duration: bookingData.duration
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid booking data", 
        details: error.errors 
      });
    }
    
    console.error("Coach booking creation error:", error);
    res.status(500).json({ error: "Failed to create coach booking" });
  }
});

// Get revenue analytics for a facility
router.get("/facilities/:facilityId/revenue", isAuthenticated, async (req, res) => {
  try {
    const facilityId = parseInt(req.params.facilityId);
    const { range = 'week' } = req.query;
    
    if (!facilityId) {
      return res.status(400).json({ error: "Invalid facility ID" });
    }

    const revenue = await storage.getFacilityRevenueAnalytics(facilityId, range as string);
    res.json({ revenue });

  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.status(500).json({ error: "Failed to fetch revenue analytics" });
  }
});

// Get coach booking history
router.get("/coaches/:coachId/bookings", isAuthenticated, async (req, res) => {
  try {
    const coachId = parseInt(req.params.coachId);
    const { status, page = '1', limit = '20' } = req.query;
    
    if (!coachId) {
      return res.status(400).json({ error: "Invalid coach ID" });
    }

    const bookings = await storage.getCoachBookings({
      coachId,
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json({ bookings });

  } catch (error) {
    console.error("Coach bookings error:", error);
    res.status(500).json({ error: "Failed to fetch coach bookings" });
  }
});

export default router;