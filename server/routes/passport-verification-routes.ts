/**
 * PKL-278651-CONN-0004-PASS-ADMIN - Passport Verification System
 * Routes for Admin Passport Verification Dashboard
 */

import express, { Request, Response } from "express";
import { isAuthenticated, isAdmin } from "../auth";
import { storage } from "../storage";
import { insertPassportVerificationSchema } from "@shared/schema/events";
import { ZodError } from "zod";

const router = express.Router();

// Route to verify a passport (admin only)
router.post("/verify", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { passportCode, eventId } = req.body;
    
    if (!passportCode) {
      return res.status(400).json({ error: "Passport code is required" });
    }
    
    // Verify the passport
    const result = await storage.verifyPassportForEvent(passportCode, eventId || undefined);
    
    // Log the verification attempt
    await storage.logPassportVerification({
      passportCode,
      eventId: eventId || null,
      userId: result.userId || null,
      verifiedBy: req.user!.id,
      status: result.valid ? 'valid' : 'invalid',
      message: result.message || null,
      timestamp: new Date(),
      ipAddress: req.ip || null
    });
    
    res.json(result);
  } catch (error) {
    console.error("[API] Error verifying passport:", error);
    res.status(500).json({ error: "Server error verifying passport" });
  }
});

// Route to get verification logs (admin only)
router.get("/logs", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Parse filters if provided
    const filters: any = {};
    if (req.query.passportCode) filters.passportCode = req.query.passportCode;
    if (req.query.userId && !isNaN(parseInt(req.query.userId as string))) {
      filters.userId = parseInt(req.query.userId as string);
    }
    if (req.query.eventId && !isNaN(parseInt(req.query.eventId as string))) {
      filters.eventId = parseInt(req.query.eventId as string);
    }
    if (req.query.status) filters.status = req.query.status;
    if (req.query.verifiedBy && !isNaN(parseInt(req.query.verifiedBy as string))) {
      filters.verifiedBy = parseInt(req.query.verifiedBy as string);
    }
    
    const logs = await storage.getPassportVerificationLogs(limit, offset, filters);
    
    res.json(logs);
  } catch (error) {
    console.error("[API] Error getting passport verification logs:", error);
    res.status(500).json({ error: "Server error getting verification logs" });
  }
});

// Route to get verification logs for a specific passport code (admin only)
router.get("/logs/:passportCode", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { passportCode } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    if (!passportCode) {
      return res.status(400).json({ error: "Passport code is required" });
    }
    
    const logs = await storage.getPassportVerificationLogs(limit, offset, { passportCode });
    
    res.json(logs);
  } catch (error) {
    console.error(`[API] Error getting verification logs for passport ${req.params.passportCode}:`, error);
    res.status(500).json({ error: "Server error getting verification logs" });
  }
});

// Route to get verification logs for a specific event (admin only)
router.get("/logs/event/:eventId", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    
    const logs = await storage.getPassportVerificationLogs(limit, offset, { eventId });
    
    res.json(logs);
  } catch (error) {
    console.error(`[API] Error getting verification logs for event ${req.params.eventId}:`, error);
    res.status(500).json({ error: "Server error getting verification logs" });
  }
});

// Route to get verification logs for a specific user (admin only)
router.get("/logs/user/:userId", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const logs = await storage.getPassportVerificationLogs(limit, offset, { userId });
    
    res.json(logs);
  } catch (error) {
    console.error(`[API] Error getting verification logs for user ${req.params.userId}:`, error);
    res.status(500).json({ error: "Server error getting verification logs" });
  }
});

export function registerPassportVerificationRoutes(app: express.Express) {
  console.log("[API] Registering Passport Verification routes (PKL-278651-CONN-0004-PASS-ADMIN)");
  app.use("/api/passport", router);
}