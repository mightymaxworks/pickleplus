/**
 * PKL-278651-CONN-0003-EVENT - PicklePass™ System
 * Event Routes for Admin and Check-in Operations
 * 
 * PKL-278651-CONN-0012-SYNC - Event Status Synchronization
 * Real-time event updates via WebSockets integration
 * 
 * @lastModified 2025-04-20
 * @implementation Framework5.2
 */

import express, { Request, Response } from "express";
import { isAuthenticated, isAdmin } from "../auth";
import { storage } from "../storage";
import { insertEventSchema, insertEventCheckInSchema } from "@shared/schema/events";
import { ZodError } from "zod";
import { 
  broadcastEventRegistrationStatusChange, 
  broadcastEventAttendanceUpdate, 
  broadcastEventCancellation, 
  broadcastEventScheduleChange 
} from "./event-websocket-routes"; // PKL-278651-CONN-0012-SYNC

const router = express.Router();

// Route to get all events (admin only)
router.get("/", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Parse filters if provided
    const filters: any = {};
    if (req.query.eventType) filters.eventType = req.query.eventType;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.isPrivate !== undefined) filters.isPrivate = req.query.isPrivate === 'true';
    if (req.query.requiresCheckIn !== undefined) filters.requiresCheckIn = req.query.requiresCheckIn === 'true';
    
    const events = await storage.getEvents(limit, offset, filters);
    
    res.json(events);
  } catch (error) {
    console.error("[API] Error getting events:", error);
    res.status(500).json({ error: "Server error getting events" });
  }
});

// Route to get upcoming events (public)
router.get("/upcoming", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const events = await storage.getUpcomingEvents(limit);
    
    res.json(events);
  } catch (error) {
    console.error("[API] Error getting upcoming events:", error);
    res.status(500).json({ error: "Server error getting upcoming events" });
  }
});

// Route to get a specific event
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    res.json(event);
  } catch (error) {
    console.error(`[API] Error getting event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error getting event" });
  }
});

// Route to create a new event (admin only)
router.post("/", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    // Parse and validate the request body
    const eventData = insertEventSchema.parse(req.body);
    
    // Set the organizer to the current user if not provided
    if (!eventData.organizerId) {
      eventData.organizerId = req.user!.id;
    }
    
    const event = await storage.createEvent(eventData);
    
    res.status(201).json(event);
  } catch (error) {
    console.error("[API] Error creating event:", error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: "Server error creating event" });
  }
});

// Route to update an event (admin only)
router.put("/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    // Check if the event exists
    const existingEvent = await storage.getEvent(eventId);
    
    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Parse and validate the request body
    const updates = insertEventSchema.partial().parse(req.body);
    
    const updatedEvent = await storage.updateEvent(eventId, updates);
    
    // PKL-278651-CONN-0012-SYNC - Broadcast schedule changes if they were updated
    try {
      // Check if startDateTime or endDateTime was updated
      if (updates.startDateTime || updates.endDateTime) {
        // Broadcast schedule change with safe access to event properties
        const startDateTimeStr = updatedEvent && updatedEvent.startDateTime 
          ? updatedEvent.startDateTime.toISOString() 
          : '';
        const endDateTimeStr = updatedEvent && updatedEvent.endDateTime 
          ? updatedEvent.endDateTime.toISOString() 
          : '';
        
        broadcastEventScheduleChange(eventId, startDateTimeStr, endDateTimeStr);
        console.log(`[API][PKL-278651-CONN-0012-SYNC] Schedule change broadcast for event ${eventId}`);
      }
      
      // If event was cancelled, broadcast that too
      if (updates.status === 'cancelled') {
        broadcastEventCancellation(eventId);
        console.log(`[API][PKL-278651-CONN-0012-SYNC] Cancellation broadcast for event ${eventId}`);
      }
    } catch (wsError) {
      // Don't fail the update if WebSocket broadcast fails
      console.error(`[API] WebSocket broadcast error for event ${eventId}:`, wsError);
    }
    
    res.json(updatedEvent);
  } catch (error) {
    console.error(`[API] Error updating event ${req.params.id}:`, error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: "Server error updating event" });
  }
});

// Route to delete an event (admin only)
router.delete("/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    // Check if the event exists
    const existingEvent = await storage.getEvent(eventId);
    
    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const success = await storage.deleteEvent(eventId);
    
    if (success) {
      // PKL-278651-CONN-0012-SYNC - Broadcast event cancellation via WebSocket
      try {
        // Broadcast to all connected WebSocket clients that the event is cancelled
        broadcastEventCancellation(eventId);
        console.log(`[API][PKL-278651-CONN-0012-SYNC] Event deletion broadcast for event ${eventId}`);
      } catch (wsError) {
        // Don't fail the delete if WebSocket broadcast fails
        console.error(`[API] WebSocket broadcast error for event ${eventId}:`, wsError);
      }
      
      res.status(204).end();
    } else {
      res.status(500).json({ error: "Failed to delete event" });
    }
  } catch (error) {
    console.error(`[API] Error deleting event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error deleting event" });
  }
});

// Route to get event attendees (admin only)
router.get("/:id/attendees", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Check if the event exists
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const attendees = await storage.getEventAttendees(eventId, limit, offset);
    
    res.json(attendees);
  } catch (error) {
    console.error(`[API] Error getting attendees for event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error getting event attendees" });
  }
});

// Route to get event check-in count (admin only)
router.get("/:id/check-in-count", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    // Check if the event exists
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const count = await storage.getEventCheckInCounts(eventId);
    
    res.json({ count });
  } catch (error) {
    console.error(`[API] Error getting check-in count for event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error getting event check-in count" });
  }
});

// Route to check a user into an event
router.post("/:id/check-in", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    // Check if the event exists
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // We can check in either:
    // 1. The current user (self check-in)
    // 2. Another user (if admin)
    let userId = req.user!.id;
    let checkInMethod = "self";
    let verifiedById = null;
    
    // If an admin is checking in another user
    if (req.body.userId && req.user!.isAdmin) {
      userId = parseInt(req.body.userId);
      checkInMethod = "manual";
      verifiedById = req.user!.id;
    }
    
    // Handle device info and location if provided
    const deviceInfo = req.body.deviceInfo || null;
    const checkInLocation = req.body.checkInLocation || null;
    
    // Check if the user is already checked in
    const isCheckedIn = await storage.isUserCheckedIntoEvent(eventId, userId);
    
    if (isCheckedIn) {
      return res.status(400).json({ error: "User already has a PicklePass™ for this event" });
    }
    
    // Create the check-in record
    // Only include the fields that are in the schema
    const checkIn = await storage.checkUserIntoEvent({
      eventId,
      userId,
      checkInMethod
      // Removed fields not in schema: verifiedById, deviceInfo, checkInLocation, notes
    });
    
    res.status(201).json(checkIn);
  } catch (error) {
    console.error(`[API] Error checking in to event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error processing PicklePass™ check-in" });
  }
});

// Route to check if a user is checked into an event
router.get("/:id/check-in-status", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user!.id;
    
    // If asking about another user, must be admin
    if (userId !== req.user!.id && !req.user!.isAdmin) {
      return res.status(403).json({ error: "Not authorized to view other users' PicklePass™ status" });
    }
    
    // Check if the event exists
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const isCheckedIn = await storage.isUserCheckedIntoEvent(eventId, userId);
    
    res.json({ isCheckedIn });
  } catch (error) {
    console.error(`[API] Error checking check-in status for event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error checking PicklePass™ status" });
  }
});

// Route to get events for the current user (as organizer)
router.get("/my/organized", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const events = await storage.getEventsByOrganizer(req.user!.id, limit, offset);
    
    res.json(events);
  } catch (error) {
    console.error("[API] Error getting organized events:", error);
    res.status(500).json({ error: "Server error getting organized events" });
  }
});

// Route to get events the current user has checked into
router.get("/my/attended", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const checkIns = await storage.getUserEventCheckIns(req.user!.id, limit, offset);
    
    // Fetch full event details for each check-in
    const events = await Promise.all(
      checkIns.map(async (checkIn) => {
        const event = await storage.getEvent(checkIn.eventId);
        return {
          ...event,
          checkInTime: checkIn.checkInTime,
          checkInMethod: checkIn.checkInMethod
        };
      })
    );
    
    res.json(events);
  } catch (error) {
    console.error("[API] Error getting attended events:", error);
    res.status(500).json({ error: "Server error retrieving your PicklePass™ event history" });
  }
});

// PKL-278651-CONN-0004-PASS-REG - Route to get events the current user has registered for
router.get("/my/registered", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    console.log(`[API] Getting registered events for user ${req.user!.id}`);
    const events = await storage.getRegisteredEvents(req.user!.id, limit, offset);
    
    res.json(events);
  } catch (error) {
    console.error("[API] Error getting registered events:", error);
    res.status(500).json({ error: "Server error retrieving your registered events" });
  }
});

// PKL-278651-CONN-0004-PASS-REG - Route to check if a user is registered for an event
router.get("/:id/registration-status", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    // Check if the event exists
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const isRegistered = await storage.isUserRegisteredForEvent(eventId, req.user!.id);
    console.log(`[API] User ${req.user!.id} registration status for event ${eventId}: ${isRegistered}`);
    
    res.json(isRegistered);
  } catch (error) {
    console.error(`[API] Error checking registration status for event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error checking registration status" });
  }
});

// PKL-278651-CONN-0004-PASS-REG - Route to register for an event
router.post("/:id/register", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    // Check if the event exists
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Check if user is already registered
    const isRegistered = await storage.isUserRegisteredForEvent(eventId, req.user!.id);
    
    if (isRegistered) {
      return res.status(400).json({ error: "You are already registered for this event" });
    }
    
    // Register the user for the event
    const registration = await storage.registerUserForEvent({
      eventId,
      userId: req.user!.id,
      status: 'confirmed',
      notes: req.body.notes || null
    });
    
    console.log(`[API] User ${req.user!.id} successfully registered for event ${eventId}`);
    
    // PKL-278651-CONN-0012-SYNC - Broadcast registration status change via WebSocket
    try {
      // Broadcast to all connected WebSocket clients that need to know
      broadcastEventRegistrationStatusChange(eventId, req.user!.id, true);
      
      // Get the updated registration count
      const count = await storage.getEventRegistrationCount(eventId);
      
      // Broadcast attendance update with the new count
      // Use the maxAttendees property if it exists, or default to 0
      const maxAttendees = event.maxAttendees || 0;
      broadcastEventAttendanceUpdate(eventId, count, maxAttendees);
      
      console.log(`[API][PKL-278651-CONN-0012-SYNC] Registration broadcast complete for event ${eventId}`);
    } catch (wsError) {
      // Don't fail the registration if WebSocket broadcast fails
      console.error(`[API] WebSocket broadcast error for event ${eventId}:`, wsError);
    }
    
    res.status(201).json(registration);
  } catch (error) {
    console.error(`[API] Error registering for event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error registering for event" });
  }
});

// PKL-278651-CONN-0004-PASS-REG - Route to cancel registration for an event
router.post("/:id/cancel-registration", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    // Check if the event exists
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Get the registration if it exists
    const registrations = await storage.getUserEventRegistrations(req.user!.id);
    const registration = registrations.find(reg => reg.eventId === eventId);
    
    if (!registration) {
      return res.status(404).json({ error: "You are not registered for this event" });
    }
    
    // Cancel the registration
    const success = await storage.cancelEventRegistration(registration.id);
    
    if (success) {
      console.log(`[API] User ${req.user!.id} successfully cancelled registration for event ${eventId}`);
      
      // PKL-278651-CONN-0012-SYNC - Broadcast registration status change via WebSocket
      try {
        // Broadcast to all connected WebSocket clients that need to know
        broadcastEventRegistrationStatusChange(eventId, req.user!.id, false);
        
        // Get the updated registration count
        const count = await storage.getEventRegistrationCount(eventId);
        
        // Broadcast attendance update with the new count
        // Use the maxAttendees property if it exists, or default to 0
        const maxAttendees = event.maxAttendees || 0;
        broadcastEventAttendanceUpdate(eventId, count, maxAttendees);
        
        console.log(`[API][PKL-278651-CONN-0012-SYNC] Cancellation broadcast complete for event ${eventId}`);
      } catch (wsError) {
        // Don't fail the cancellation if WebSocket broadcast fails
        console.error(`[API] WebSocket broadcast error for event ${eventId}:`, wsError);
      }
      
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: "Failed to cancel registration" });
    }
  } catch (error) {
    console.error(`[API] Error cancelling registration for event ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: "Server error cancelling registration" });
  }
});

// PKL-278651-CONN-0004-PASS-REG - Route to get registration count for an event
router.get("/:id/registration-count", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    // Check if the event exists
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const count = await storage.getEventRegistrationCount(eventId);
    console.log(`[API] Registration count for event ${eventId}: ${count}`);
    
    res.json(count);
  } catch (error) {
    console.error(`[API] Error getting registration count for event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error getting registration count" });
  }
});

export function registerEventRoutes(app: express.Express) {
  console.log("[API] Registering PicklePass™ routes (PKL-278651-CONN-0003-EVENT)");
  app.use("/api/events", router);
}