/**
 * CourtIQ™ Mastery Paths API Routes
 * Provides API endpoints for the tier-based ranking system
 * 
 * Sprint: PKL-278651-RATE-0004-MADV
 */

import { Express, Request, Response } from "express";
import { MasteryPathsService } from "./masteryPathsService";
import { MasteryPath, MasteryTierName } from "../../../shared/mastery-paths";
import { z } from 'zod';
import { isAuthenticated } from "../../auth";

// Input validation schemas
const tierNameSchema = z.enum([
  'Explorer', 'Pathfinder', 'Trailblazer',
  'Challenger', 'Innovator', 'Tactician',
  'Virtuoso', 'Luminary', 'Legend'
]) as z.ZodEnum<[MasteryTierName, ...MasteryTierName[]]>;

const pathNameSchema = z.enum(['Foundation', 'Evolution', 'Pinnacle']) as z.ZodEnum<[MasteryPath, ...MasteryPath[]]>;

const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).default('1'),
  pageSize: z.string().transform(val => parseInt(val, 10)).default('20')
});

const updateRatingSchema = z.object({
  rating: z.number(),
  won: z.boolean().optional()
});

/**
 * Register API routes for the Mastery Paths system
 */
export function registerMasteryPathsRoutes(app: Express): void {
  const service = new MasteryPathsService();
  
  // Initialize the Mastery Paths system
  service.initialize().catch(err => {
    console.error("Failed to initialize Mastery Paths system:", err);
  });
  
  /**
   * Get all Mastery Tiers
   */
  app.get("/api/mastery/tiers", async (req: Request, res: Response) => {
    try {
      const tiers = await service.getAllTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching mastery tiers:", error);
      res.status(500).json({ error: "Failed to fetch mastery tiers" });
    }
  });
  
  /**
   * Get tiers for a specific path
   */
  app.get("/api/mastery/paths/:path/tiers", async (req: Request, res: Response) => {
    try {
      const pathResult = pathNameSchema.safeParse(req.params.path);
      
      if (!pathResult.success) {
        return res.status(400).json({ error: "Invalid path name" });
      }
      
      const tiers = await service.getTiersByPath(pathResult.data);
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching tiers for path:", error);
      res.status(500).json({ error: "Failed to fetch tiers for path" });
    }
  });
  
  /**
   * Get a tier by name
   */
  app.get("/api/mastery/tiers/:name", async (req: Request, res: Response) => {
    try {
      const nameResult = tierNameSchema.safeParse(req.params.name);
      
      if (!nameResult.success) {
        return res.status(400).json({ error: "Invalid tier name" });
      }
      
      const tier = await service.getTierByName(nameResult.data);
      
      if (!tier) {
        return res.status(404).json({ error: "Tier not found" });
      }
      
      res.json(tier);
    } catch (error) {
      console.error("Error fetching tier:", error);
      res.status(500).json({ error: "Failed to fetch tier" });
    }
  });
  
  /**
   * Get players in a tier
   */
  app.get("/api/mastery/tiers/:name/players", async (req: Request, res: Response) => {
    try {
      const nameResult = tierNameSchema.safeParse(req.params.name);
      
      if (!nameResult.success) {
        return res.status(400).json({ error: "Invalid tier name" });
      }
      
      const pagination = paginationSchema.parse(req.query);
      
      const { players, total } = await service.getPlayersByTier(
        nameResult.data, 
        pagination.page, 
        pagination.pageSize
      );
      
      res.json({
        players,
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          total,
          pages: Math.ceil(total / pagination.pageSize)
        }
      });
    } catch (error) {
      console.error("Error fetching players for tier:", error);
      res.status(500).json({ error: "Failed to fetch players for tier" });
    }
  });
  
  /**
   * Get current player's tier status
   */
  app.get("/api/mastery/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const status = await service.getPlayerTierStatus(userId);
      
      if (!status) {
        // If no status found, create default one based on rating of 1000
        const newStatus = await service.createOrUpdatePlayerTierStatus(userId, 1000);
        return res.json(newStatus);
      }
      
      res.json(status);
    } catch (error) {
      console.error("Error fetching tier status:", error);
      res.status(500).json({ error: "Failed to fetch tier status" });
    }
  });
  
  /**
   * Get another player's tier status
   */
  app.get("/api/mastery/players/:id/status", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const status = await service.getPlayerTierStatus(userId);
      
      if (!status) {
        return res.status(404).json({ error: "Player tier status not found" });
      }
      
      res.json(status);
    } catch (error) {
      console.error("Error fetching player tier status:", error);
      res.status(500).json({ error: "Failed to fetch player tier status" });
    }
  });
  
  /**
   * Get tier progression history for current player
   */
  app.get("/api/mastery/progressions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const progressions = await service.getPlayerTierProgressions(userId);
      res.json(progressions);
    } catch (error) {
      console.error("Error fetching tier progressions:", error);
      res.status(500).json({ error: "Failed to fetch tier progressions" });
    }
  });
  
  /**
   * Get tier progression history for another player
   */
  app.get("/api/mastery/players/:id/progressions", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const progressions = await service.getPlayerTierProgressions(userId);
      res.json(progressions);
    } catch (error) {
      console.error("Error fetching player tier progressions:", error);
      res.status(500).json({ error: "Failed to fetch player tier progressions" });
    }
  });
  
  /**
   * Get progress needed for next tier
   */
  app.get("/api/mastery/next-tier", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const progress = await service.getNextTierProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching next tier progress:", error);
      res.status(500).json({ error: "Failed to fetch next tier progress" });
    }
  });
  
  /**
   * Update a player's rating and process tier changes
   * This is an internal API used by the rating system
   */
  app.post("/api/mastery/update-rating", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const validatedData = updateRatingSchema.parse(req.body);
      
      // Process the match result
      const result = await service.processMatchResult(
        userId, 
        validatedData.rating,
        validatedData.won || false
      );
      
      // Get updated status
      const updatedStatus = await service.getPlayerTierStatus(userId);
      
      res.json({
        status: updatedStatus,
        tierChanged: result.tierChanged,
        oldTier: result.oldTier,
        newTier: result.newTier,
        oldPath: result.oldPath,
        newPath: result.newPath
      });
    } catch (error) {
      console.error("Error updating rating:", error);
      res.status(500).json({ error: "Failed to update rating" });
    }
  });
}