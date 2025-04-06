import { Router, Request, Response } from "express";
import { getCommunicationPreferencesService } from "./services/communication-preferences-service";
import { getPartnerPreferencesService } from "./services/partner-preferences-service";
import { EventBus } from "../../core/events/event-bus";
import {
  insertUserNotificationPreferenceSchema,
  insertCommunicationChannelSchema,
  insertPartnerCriteriaSchema,
  insertPartnerAvailabilitySchema,
  insertSpecialAvailabilitySchema
} from "../../../shared/schema";
import { z } from "zod";

const router = Router();
const eventBus = new EventBus();

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// ================ COMMUNICATION PREFERENCES ROUTES ================

// Get all notification preferences for the authenticated user
router.get("/communication/notifications", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getCommunicationPreferencesService(eventBus);
    const preferences = await service.getUserNotificationPreferences(req.user!.id);
    res.json(preferences);
  } catch (error) {
    console.error("Error getting user notification preferences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a notification preference
router.patch("/communication/notifications/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const prefId = parseInt(req.params.id);
    const service = getCommunicationPreferencesService(eventBus);
    
    // Validate the data
    const validatedData = insertUserNotificationPreferenceSchema.partial().parse(req.body);
    
    // Check that the preference belongs to the authenticated user
    const preferences = await service.getUserNotificationPreferences(req.user!.id);
    const preference = preferences.find(p => p.id === prefId);
    
    if (!preference) {
      return res.status(404).json({ message: "Notification preference not found" });
    }
    
    const updated = await service.updateUserNotificationPreference(prefId, validatedData);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating notification preference:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all communication channels for the authenticated user
router.get("/communication/channels", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getCommunicationPreferencesService(eventBus);
    const channels = await service.getUserCommunicationChannels(req.user!.id);
    res.json(channels);
  } catch (error) {
    console.error("Error getting user communication channels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add a new communication channel
router.post("/communication/channels", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getCommunicationPreferencesService(eventBus);
    
    // Validate the data
    const validatedData = insertCommunicationChannelSchema.parse({
      ...req.body,
      userId: req.user!.id
    });
    
    const newChannel = await service.addCommunicationChannel(validatedData);
    res.status(201).json(newChannel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error adding communication channel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a communication channel
router.patch("/communication/channels/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);
    const service = getCommunicationPreferencesService(eventBus);
    
    // Validate the data
    const validatedData = insertCommunicationChannelSchema.partial().parse(req.body);
    
    // Check that the channel belongs to the authenticated user
    const channels = await service.getUserCommunicationChannels(req.user!.id);
    const channel = channels.find(c => c.id === channelId);
    
    if (!channel) {
      return res.status(404).json({ message: "Communication channel not found" });
    }
    
    const updated = await service.updateCommunicationChannel(channelId, validatedData);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating communication channel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Deactivate a communication channel
router.delete("/communication/channels/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);
    const service = getCommunicationPreferencesService(eventBus);
    
    // Check that the channel belongs to the authenticated user
    const channels = await service.getUserCommunicationChannels(req.user!.id);
    const channel = channels.find(c => c.id === channelId);
    
    if (!channel) {
      return res.status(404).json({ message: "Communication channel not found" });
    }
    
    const success = await service.deactivateCommunicationChannel(channelId);
    
    if (success) {
      res.status(200).json({ message: "Channel deactivated successfully" });
    } else {
      res.status(500).json({ message: "Failed to deactivate channel" });
    }
  } catch (error) {
    console.error("Error deactivating communication channel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify a communication channel
router.post("/communication/channels/:id/verify", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const channelId = parseInt(req.params.id);
    const { verificationCode } = req.body;
    
    if (!verificationCode) {
      return res.status(400).json({ message: "Verification code is required" });
    }
    
    const service = getCommunicationPreferencesService(eventBus);
    
    // Check that the channel belongs to the authenticated user
    const channels = await service.getUserCommunicationChannels(req.user!.id);
    const channel = channels.find(c => c.id === channelId);
    
    if (!channel) {
      return res.status(404).json({ message: "Communication channel not found" });
    }
    
    const success = await service.verifyCommunicationChannel(channelId, verificationCode);
    
    if (success) {
      res.status(200).json({ message: "Channel verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid verification code" });
    }
  } catch (error) {
    console.error("Error verifying communication channel:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ================ PARTNER PREFERENCES ROUTES ================

// Get all partner criteria for the authenticated user
router.get("/partner/criteria", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getPartnerPreferencesService(eventBus);
    const criteria = await service.getUserPartnerCriteria(req.user!.id);
    res.json(criteria);
  } catch (error) {
    console.error("Error getting user partner criteria:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new partner criteria
router.post("/partner/criteria", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getPartnerPreferencesService(eventBus);
    
    // Validate the data
    const validatedData = insertPartnerCriteriaSchema.parse({
      ...req.body,
      userId: req.user!.id
    });
    
    const newCriteria = await service.createPartnerCriteria(validatedData);
    res.status(201).json(newCriteria);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error creating partner criteria:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a partner criteria
router.patch("/partner/criteria/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const criteriaId = parseInt(req.params.id);
    const service = getPartnerPreferencesService(eventBus);
    
    // Validate the data
    const validatedData = insertPartnerCriteriaSchema.partial().parse(req.body);
    
    // Check that the criteria belongs to the authenticated user
    const criteria = await service.getUserPartnerCriteria(req.user!.id);
    const criterion = criteria.find(c => c.id === criteriaId);
    
    if (!criterion) {
      return res.status(404).json({ message: "Partner criteria not found" });
    }
    
    const updated = await service.updatePartnerCriteria(criteriaId, validatedData);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating partner criteria:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a partner criteria
router.delete("/partner/criteria/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const criteriaId = parseInt(req.params.id);
    const service = getPartnerPreferencesService(eventBus);
    
    // Check that the criteria belongs to the authenticated user
    const criteria = await service.getUserPartnerCriteria(req.user!.id);
    const criterion = criteria.find(c => c.id === criteriaId);
    
    if (!criterion) {
      return res.status(404).json({ message: "Partner criteria not found" });
    }
    
    const success = await service.deletePartnerCriteria(criteriaId);
    
    if (success) {
      res.status(200).json({ message: "Criteria deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete criteria" });
    }
  } catch (error) {
    console.error("Error deleting partner criteria:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all partner availability slots for the authenticated user
router.get("/partner/availability", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getPartnerPreferencesService(eventBus);
    const availability = await service.getUserAvailability(req.user!.id);
    res.json(availability);
  } catch (error) {
    console.error("Error getting user availability slots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new availability slot
router.post("/partner/availability", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getPartnerPreferencesService(eventBus);
    
    // Validate the data
    const validatedData = insertPartnerAvailabilitySchema.parse({
      ...req.body,
      userId: req.user!.id
    });
    
    const newSlot = await service.createAvailabilitySlot(validatedData);
    res.status(201).json(newSlot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error creating availability slot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update an availability slot
router.patch("/partner/availability/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const slotId = parseInt(req.params.id);
    const service = getPartnerPreferencesService(eventBus);
    
    // Get all user availability to check ownership
    const allSlots = await service.getUserAvailability(req.user!.id);
    const slot = allSlots.find(s => s.id === slotId);
    
    if (!slot) {
      return res.status(404).json({ message: "Availability slot not found" });
    }
    
    // Validate the data
    const validatedData = insertPartnerAvailabilitySchema.partial().parse(req.body);
    
    const updated = await service.updateAvailabilitySlot(slotId, validatedData);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating availability slot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete an availability slot
router.delete("/partner/availability/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const slotId = parseInt(req.params.id);
    const service = getPartnerPreferencesService(eventBus);
    
    // Get all user availability to check ownership
    const allSlots = await service.getUserAvailability(req.user!.id);
    const slot = allSlots.find(s => s.id === slotId);
    
    if (!slot) {
      return res.status(404).json({ message: "Availability slot not found" });
    }
    
    const success = await service.deleteAvailabilitySlot(slotId);
    
    if (success) {
      res.status(200).json({ message: "Availability slot deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete availability slot" });
    }
  } catch (error) {
    console.error("Error deleting availability slot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all special availability slots for the authenticated user
router.get("/partner/special-availability", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getPartnerPreferencesService(eventBus);
    const { startDate, endDate } = req.query;
    
    // Parse dates if provided
    const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
    const parsedEndDate = endDate ? new Date(endDate as string) : undefined;
    
    const availability = await service.getUserSpecialAvailability(
      req.user!.id, 
      parsedStartDate, 
      parsedEndDate
    );
    
    res.json(availability);
  } catch (error) {
    console.error("Error getting user special availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new special availability
router.post("/partner/special-availability", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getPartnerPreferencesService(eventBus);
    
    // Validate the data
    const validatedData = insertSpecialAvailabilitySchema.parse({
      ...req.body,
      userId: req.user!.id
    });
    
    const newSlot = await service.createSpecialAvailability(validatedData);
    res.status(201).json(newSlot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error creating special availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a special availability
router.delete("/partner/special-availability/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const slotId = parseInt(req.params.id);
    const service = getPartnerPreferencesService(eventBus);
    
    // Get all user special availability to check ownership
    const allSlots = await service.getUserSpecialAvailability(req.user!.id);
    const slot = allSlots.find(s => s.id === slotId);
    
    if (!slot) {
      return res.status(404).json({ message: "Special availability not found" });
    }
    
    const success = await service.deleteSpecialAvailability(slotId);
    
    if (success) {
      res.status(200).json({ message: "Special availability deleted successfully" });
    } else {
      res.status(500).json({ message: "Failed to delete special availability" });
    }
  } catch (error) {
    console.error("Error deleting special availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get partner suggestions for the authenticated user
router.get("/partner/suggestions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const service = getPartnerPreferencesService(eventBus);
    const { status = 'pending' } = req.query;
    
    const suggestions = await service.getUserPartnerSuggestions(
      req.user!.id, 
      status as string
    );
    
    res.json(suggestions);
  } catch (error) {
    console.error("Error getting partner suggestions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update the status of a partner suggestion
router.patch("/partner/suggestions/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const suggestionId = parseInt(req.params.id);
    const { status, userAction } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    
    const service = getPartnerPreferencesService(eventBus);
    
    // Get suggestions to check ownership
    const allSuggestions = await service.getUserPartnerSuggestions(req.user!.id);
    const suggestion = allSuggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) {
      return res.status(404).json({ message: "Partner suggestion not found" });
    }
    
    const updated = await service.updatePartnerSuggestion(suggestionId, { 
      status, 
      userAction 
    });
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating partner suggestion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;