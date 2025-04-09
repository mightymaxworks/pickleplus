/**
 * Match Validation Routes
 * 
 * PKL-278651-VALMAT-0001-FIX
 * 
 * This file defines the API routes for the match validation system (VALMAT)
 */

import { Express, Request, Response } from 'express';
import { isAuthenticated } from '../../../auth';
import { ZodError } from 'zod';
import { matchValidationSchema } from '@shared/schema';
import { 
  validateMatch, 
  getMatchValidationDetails 
} from './validationService';

export function registerValidationRoutes(app: Express) {
  // Match validation endpoint
  app.post("/api/match/validate/:matchId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      const matchId = parseInt(req.params.matchId);
      
      if (isNaN(matchId) || matchId < 1) {
        return res.status(400).json({ error: "Invalid match ID" });
      }
      
      // Validate the input against our schema
      const validationData = matchValidationSchema.parse(req.body);
      
      // Validate the match
      const result = await validateMatch(
        matchId,
        userId,
        validationData.status,
        validationData.notes
      );
      
      return res.json(result);
    } catch (error) {
      console.error("[VALMAT] Error validating match:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      
      // Check for specific error messages
      if (error instanceof Error) {
        if (error.message === "Match not found") {
          return res.status(404).json({ error: error.message });
        }
        if (error.message === "You can only validate matches you participated in") {
          return res.status(403).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: "Server error validating match" });
    }
  });
  
  // Get match validation details
  app.get("/api/match/:matchId/validations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const matchId = parseInt(req.params.matchId);
      
      if (isNaN(matchId) || matchId < 1) {
        return res.status(400).json({ error: "Invalid match ID" });
      }
      
      const details = await getMatchValidationDetails(matchId);
      return res.json(details);
    } catch (error) {
      console.error("[VALMAT] Error getting match validation details:", error);
      
      if (error instanceof Error && error.message === "Match not found") {
        return res.status(404).json({ error: error.message });
      }
      
      return res.status(500).json({ error: "Server error getting validation details" });
    }
  });
}