import { Router } from "express";
import { getCommunicationPreferencesService } from "../services/communication-preferences-service";
import { EventBus } from "../../../core/events/event-bus";
import { z } from "zod";
import {
  insertCommunicationChannelSchema,
  insertUserNotificationPreferenceSchema,
} from "../../../../shared/schema";

const router = Router();
const eventBus = new EventBus();
const communicationPreferencesService = getCommunicationPreferencesService(eventBus);

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

// Get all notification preferences for the authenticated user
router.get("/notification-preferences", ensureAuthenticated, async (req, res) => {
  try {
    const preferences = await communicationPreferencesService.getUserNotificationPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({ error: "Error fetching notification preferences" });
  }
});

// Get a specific notification preference by category
router.get("/notification-preferences/:category", ensureAuthenticated, async (req, res) => {
  try {
    const { category } = req.params;
    const { subcategory } = req.query;
    
    const preference = await communicationPreferencesService.getUserNotificationPreferenceByCategory(
      req.user.id,
      category,
      subcategory as string | undefined
    );
    
    if (!preference) {
      return res.status(404).json({ error: "Notification preference not found" });
    }
    
    res.json(preference);
  } catch (error) {
    console.error("Error fetching notification preference:", error);
    res.status(500).json({ error: "Error fetching notification preference" });
  }
});

// Update a notification preference
router.patch("/notification-preferences/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the request body
    const schema = insertUserNotificationPreferenceSchema.partial();
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    const updated = await communicationPreferencesService.updateUserNotificationPreference(
      Number(id),
      validationResult.data
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Notification preference not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating notification preference:", error);
    res.status(500).json({ error: "Error updating notification preference" });
  }
});

// Create a new notification preference
router.post("/notification-preferences", ensureAuthenticated, async (req, res) => {
  try {
    // Validate the request body
    const schema = insertUserNotificationPreferenceSchema;
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    // Force the userId to be the authenticated user's id
    validationResult.data.userId = req.user.id;
    
    const newPreference = await communicationPreferencesService.createUserNotificationPreference(
      validationResult.data
    );
    
    res.status(201).json(newPreference);
  } catch (error) {
    console.error("Error creating notification preference:", error);
    res.status(500).json({ error: "Error creating notification preference" });
  }
});

// Get all communication channels for the authenticated user
router.get("/channels", ensureAuthenticated, async (req, res) => {
  try {
    const channels = await communicationPreferencesService.getUserCommunicationChannels(req.user.id);
    res.json(channels);
  } catch (error) {
    console.error("Error fetching communication channels:", error);
    res.status(500).json({ error: "Error fetching communication channels" });
  }
});

// Get communication channels by type
router.get("/channels/:type", ensureAuthenticated, async (req, res) => {
  try {
    const { type } = req.params;
    const channels = await communicationPreferencesService.getUserCommunicationChannelsByType(
      req.user.id,
      type
    );
    res.json(channels);
  } catch (error) {
    console.error("Error fetching communication channels:", error);
    res.status(500).json({ error: "Error fetching communication channels" });
  }
});

// Add a new communication channel
router.post("/channels", ensureAuthenticated, async (req, res) => {
  try {
    // Validate the request body
    const schema = insertCommunicationChannelSchema;
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    // Force the userId to be the authenticated user's id
    validationResult.data.userId = req.user.id;
    
    const newChannel = await communicationPreferencesService.addCommunicationChannel(
      validationResult.data
    );
    
    res.status(201).json(newChannel);
  } catch (error) {
    console.error("Error adding communication channel:", error);
    res.status(500).json({ error: "Error adding communication channel" });
  }
});

// Update a communication channel
router.patch("/channels/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the request body
    const schema = insertCommunicationChannelSchema.partial();
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    const updated = await communicationPreferencesService.updateCommunicationChannel(
      Number(id),
      validationResult.data
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Communication channel not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating communication channel:", error);
    res.status(500).json({ error: "Error updating communication channel" });
  }
});

// Deactivate a communication channel
router.delete("/channels/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await communicationPreferencesService.deactivateCommunicationChannel(Number(id));
    
    if (!success) {
      return res.status(404).json({ error: "Communication channel not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deactivating communication channel:", error);
    res.status(500).json({ error: "Error deactivating communication channel" });
  }
});

// Verify a communication channel
router.post("/channels/:id/verify", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationCode } = req.body;
    
    if (!verificationCode) {
      return res.status(400).json({ error: "Verification code is required" });
    }
    
    const success = await communicationPreferencesService.verifyCommunicationChannel(
      Number(id),
      verificationCode
    );
    
    if (!success) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error verifying communication channel:", error);
    res.status(500).json({ error: "Error verifying communication channel" });
  }
});

// Get communication logs for the authenticated user
router.get("/logs", ensureAuthenticated, async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    
    const logs = await communicationPreferencesService.getUserCommunicationLogs(
      req.user.id,
      limit,
      offset
    );
    
    res.json(logs);
  } catch (error) {
    console.error("Error fetching communication logs:", error);
    res.status(500).json({ error: "Error fetching communication logs" });
  }
});

export default router;