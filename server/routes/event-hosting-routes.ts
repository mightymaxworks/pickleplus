/**
 * PKL-278651-FACILITY-MGMT-002 - Event Hosting System API
 * Tournament and event management for facilities
 * 
 * @priority Priority 2: Revenue Generation
 */

import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

const router = Router();

// Get events at a specific facility
router.get("/facilities/:facilityId/events", async (req, res) => {
  try {
    const facilityId = parseInt(req.params.facilityId);
    const { status = 'open', upcoming = 'true' } = req.query;
    
    if (!facilityId) {
      return res.status(400).json({ error: "Invalid facility ID" });
    }

    const events = await storage.getFacilityEvents(facilityId, {
      status: status as string,
      upcoming: upcoming === 'true'
    });
    
    res.json({ events });

  } catch (error) {
    console.error("Get facility events error:", error);
    res.status(500).json({ error: "Failed to fetch facility events" });
  }
});

// Create a new event
router.post("/events", isAuthenticated, async (req, res) => {
  try {
    const eventSchema = z.object({
      facilityId: z.number().int().positive(),
      organizerId: z.number().int().positive(),
      eventType: z.enum(['tournament', 'workshop', 'league', 'social']),
      title: z.string().min(1).max(200),
      description: z.string().min(1),
      startDateTime: z.string(),
      endDateTime: z.string(),
      maxParticipants: z.number().int().positive(),
      entryFee: z.number().min(0),
      facilityRevenuePercent: z.number().min(0).max(100).default(30), // Facility's percentage
      prizePool: z.number().min(0).default(0),
      courtRequirements: z.object({
        courtsNeeded: z.number().int().positive(),
        specificCourts: z.array(z.number()).optional(),
        surfaceType: z.string().optional()
      }),
      equipment: z.array(z.string()).optional(),
      skillLevel: z.string().optional(),
      ageGroups: z.array(z.string()).optional(),
      registrationDeadline: z.string(),
      cancellationPolicy: z.string().optional(),
      rules: z.string().optional(),
      imageUrl: z.string().optional()
    });

    const eventData = eventSchema.parse(req.body);
    
    // Calculate revenue split
    const totalRevenue = eventData.entryFee * eventData.maxParticipants;
    const facilityRevenue = totalRevenue * (eventData.facilityRevenuePercent / 100);
    const organizerRevenue = totalRevenue - facilityRevenue - eventData.prizePool;

    const event = await storage.createFacilityEvent({
      ...eventData,
      facilityRevenue: facilityRevenue.toFixed(2),
      organizerRevenue: organizerRevenue.toFixed(2),
      currentRegistrations: 0,
      status: 'open',
      isPublished: false
    });

    res.status(201).json({
      success: true,
      event
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid event data", 
        details: error.errors 
      });
    }
    
    console.error("Event creation error:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Register for an event
router.post("/events/:eventId/register", async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const registrationSchema = z.object({
      playerId: z.number().int().positive(),
      teamPartners: z.array(z.number()).optional(),
      emergencyContact: z.object({
        name: z.string(),
        phone: z.string(),
        relationship: z.string()
      }),
      dietaryRestrictions: z.string().optional(),
      specialRequests: z.string().optional(),
      playerName: z.string().min(1).max(100),
      playerEmail: z.string().email(),
      playerPhone: z.string().min(10).max(20)
    });

    const registrationData = registrationSchema.parse(req.body);
    
    // Get event details to check availability and calculate payment
    const event = await storage.getFacilityEvent(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.currentRegistrations >= event.maxParticipants) {
      return res.status(400).json({ error: "Event is full" });
    }

    if (new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({ error: "Registration deadline has passed" });
    }

    const registration = await storage.createEventRegistration({
      eventId,
      playerId: registrationData.playerId,
      amountPaid: event.entryFee.toString(),
      paymentStatus: 'pending',
      teamPartners: registrationData.teamPartners,
      emergencyContact: registrationData.emergencyContact,
      dietaryRestrictions: registrationData.dietaryRestrictions,
      specialRequests: registrationData.specialRequests,
      status: 'registered'
    });

    // Update event registration count
    await storage.updateEventRegistrationCount(eventId, event.currentRegistrations + 1);

    res.status(201).json({
      success: true,
      registration: {
        id: registration.id,
        confirmationCode: `PKL-EVENT-${registration.id.toString().padStart(6, '0')}`,
        eventTitle: event.title,
        amount: event.entryFee,
        status: 'registered'
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid registration data", 
        details: error.errors 
      });
    }
    
    console.error("Event registration error:", error);
    res.status(500).json({ error: "Failed to register for event" });
  }
});

// Get event registrations (for organizers)
router.get("/events/:eventId/registrations", isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (!eventId) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const registrations = await storage.getEventRegistrations(eventId);
    res.json({ registrations });

  } catch (error) {
    console.error("Get event registrations error:", error);
    res.status(500).json({ error: "Failed to fetch event registrations" });
  }
});

// Update event status
router.patch("/events/:eventId", isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const updateSchema = z.object({
      status: z.enum(['open', 'full', 'cancelled', 'completed']).optional(),
      isPublished: z.boolean().optional(),
      currentRegistrations: z.number().int().min(0).optional()
    });

    const updateData = updateSchema.parse(req.body);
    
    const event = await storage.updateFacilityEvent(eventId, updateData);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ 
      success: true, 
      message: "Event updated successfully",
      event 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid update data", 
        details: error.errors 
      });
    }
    
    console.error("Event update error:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Get event revenue analytics
router.get("/events/:eventId/revenue", isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (!eventId) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const revenue = await storage.getEventRevenueAnalytics(eventId);
    res.json({ revenue });

  } catch (error) {
    console.error("Event revenue analytics error:", error);
    res.status(500).json({ error: "Failed to fetch event revenue analytics" });
  }
});

export default router;