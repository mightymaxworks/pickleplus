import { Router } from "express";
import { getPartnerPreferencesService } from "../services/partner-preferences-service";
import { EventBus } from "../../../core/events/event-bus";
import { z } from "zod";
import {
  insertPartnerCriteriaSchema,
  insertPartnerAvailabilitySchema,
  insertSpecialAvailabilitySchema,
} from "../../../../shared/schema";

const router = Router();
const eventBus = new EventBus();
const partnerPreferencesService = getPartnerPreferencesService(eventBus);

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

// Get all partner criteria for the authenticated user
router.get("/criteria", ensureAuthenticated, async (req, res) => {
  try {
    const criteria = await partnerPreferencesService.getUserPartnerCriteria(req.user.id);
    res.json(criteria);
  } catch (error) {
    console.error("Error fetching partner criteria:", error);
    res.status(500).json({ error: "Error fetching partner criteria" });
  }
});

// Get primary partner criteria for the authenticated user
router.get("/criteria/primary", ensureAuthenticated, async (req, res) => {
  try {
    const criteria = await partnerPreferencesService.getUserPrimaryPartnerCriteria(req.user.id);
    
    if (!criteria) {
      return res.status(404).json({ error: "No primary criteria found" });
    }
    
    res.json(criteria);
  } catch (error) {
    console.error("Error fetching primary partner criteria:", error);
    res.status(500).json({ error: "Error fetching primary partner criteria" });
  }
});

// Create new partner criteria
router.post("/criteria", ensureAuthenticated, async (req, res) => {
  try {
    // Validate the request body
    const schema = insertPartnerCriteriaSchema;
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    // Force the userId to be the authenticated user's id
    validationResult.data.userId = req.user.id;
    
    const newCriteria = await partnerPreferencesService.createPartnerCriteria(
      validationResult.data
    );
    
    res.status(201).json(newCriteria);
  } catch (error) {
    console.error("Error creating partner criteria:", error);
    res.status(500).json({ error: "Error creating partner criteria" });
  }
});

// Update partner criteria
router.patch("/criteria/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the request body
    const schema = insertPartnerCriteriaSchema.partial();
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    const updated = await partnerPreferencesService.updatePartnerCriteria(
      Number(id),
      validationResult.data
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Partner criteria not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating partner criteria:", error);
    res.status(500).json({ error: "Error updating partner criteria" });
  }
});

// Delete partner criteria
router.delete("/criteria/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await partnerPreferencesService.deletePartnerCriteria(Number(id));
    
    if (!success) {
      return res.status(404).json({ error: "Partner criteria not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner criteria:", error);
    res.status(500).json({ error: "Error deleting partner criteria" });
  }
});

// Get all availability slots for the authenticated user
router.get("/availability", ensureAuthenticated, async (req, res) => {
  try {
    const availability = await partnerPreferencesService.getUserAvailability(req.user.id);
    res.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Error fetching availability" });
  }
});

// Create a new availability slot
router.post("/availability", ensureAuthenticated, async (req, res) => {
  try {
    // Validate the request body
    const schema = insertPartnerAvailabilitySchema;
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    // Force the userId to be the authenticated user's id
    validationResult.data.userId = req.user.id;
    
    const newSlot = await partnerPreferencesService.createAvailabilitySlot(
      validationResult.data
    );
    
    res.status(201).json(newSlot);
  } catch (error) {
    console.error("Error creating availability slot:", error);
    res.status(500).json({ error: "Error creating availability slot" });
  }
});

// Update an availability slot
router.patch("/availability/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate the request body
    const schema = insertPartnerAvailabilitySchema.partial();
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    const updated = await partnerPreferencesService.updateAvailabilitySlot(
      Number(id),
      validationResult.data
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Availability slot not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating availability slot:", error);
    res.status(500).json({ error: "Error updating availability slot" });
  }
});

// Delete an availability slot
router.delete("/availability/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await partnerPreferencesService.deleteAvailabilitySlot(Number(id));
    
    if (!success) {
      return res.status(404).json({ error: "Availability slot not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting availability slot:", error);
    res.status(500).json({ error: "Error deleting availability slot" });
  }
});

// Get all special availability slots for the authenticated user
router.get("/special-availability", ensureAuthenticated, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const availability = await partnerPreferencesService.getUserSpecialAvailability(
      req.user.id,
      startDate,
      endDate
    );
    
    res.json(availability);
  } catch (error) {
    console.error("Error fetching special availability:", error);
    res.status(500).json({ error: "Error fetching special availability" });
  }
});

// Create a new special availability slot
router.post("/special-availability", ensureAuthenticated, async (req, res) => {
  try {
    // Validate the request body
    const schema = insertSpecialAvailabilitySchema;
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    // Force the userId to be the authenticated user's id
    validationResult.data.userId = req.user.id;
    
    const newSlot = await partnerPreferencesService.createSpecialAvailability(
      validationResult.data
    );
    
    res.status(201).json(newSlot);
  } catch (error) {
    console.error("Error creating special availability slot:", error);
    res.status(500).json({ error: "Error creating special availability slot" });
  }
});

// Delete a special availability slot
router.delete("/special-availability/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await partnerPreferencesService.deleteSpecialAvailability(Number(id));
    
    if (!success) {
      return res.status(404).json({ error: "Special availability slot not found" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting special availability slot:", error);
    res.status(500).json({ error: "Error deleting special availability slot" });
  }
});

// Get all partner suggestions for the authenticated user
router.get("/suggestions", ensureAuthenticated, async (req, res) => {
  try {
    const status = (req.query.status as string) || 'pending';
    
    const suggestions = await partnerPreferencesService.getUserPartnerSuggestions(
      req.user.id,
      status
    );
    
    res.json(suggestions);
  } catch (error) {
    console.error("Error fetching partner suggestions:", error);
    res.status(500).json({ error: "Error fetching partner suggestions" });
  }
});

// Update a partner suggestion
router.patch("/suggestions/:id", ensureAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userAction, partnerAction } = req.body;
    
    // Validate the request body
    const schema = z.object({
      status: z.string().optional(),
      userAction: z.string().optional(),
      partnerAction: z.string().optional()
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ error: "Invalid data", details: validationResult.error.errors });
    }
    
    const updated = await partnerPreferencesService.updatePartnerSuggestion(
      Number(id),
      validationResult.data
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Partner suggestion not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating partner suggestion:", error);
    res.status(500).json({ error: "Error updating partner suggestion" });
  }
});

// Manually trigger partner suggestion generation (admin only)
router.post("/generate-suggestions", ensureAuthenticated, async (req, res) => {
  try {
    // Ensure user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const count = await partnerPreferencesService.generatePartnerSuggestions();
    
    res.json({ success: true, count });
  } catch (error) {
    console.error("Error generating partner suggestions:", error);
    res.status(500).json({ error: "Error generating partner suggestions" });
  }
});

export default router;