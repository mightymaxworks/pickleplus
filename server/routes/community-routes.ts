/**
 * PKL-278651-COMM-0020-DEFGRP
 * Community routes for the application
 */
import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { storage } from '../storage';

/**
 * Register community routes with the Express application
 * @param app Express application
 */
export function registerCommunityRoutes(app: express.Express): void {
  console.log("[API] Registering Community API routes");
  
  /**
   * GET /api/communities
   * Get all communities with optional filters
   */
  app.get('/api/communities', isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("[PKL-278651-COMM-0020-DEFGRP] Fetching communities with query:", req.query);
      
      const filters: any = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };
      
      // Add optional filters from query params
      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.location) filters.location = req.query.location as string;
      if (req.query.skillLevel) filters.skillLevel = req.query.skillLevel as string;
      if (req.query.tags) filters.tags = (req.query.tags as string).split(',');
      if (req.query.hasEvents) filters.hasEvents = req.query.hasEvents === 'true';
      if (req.query.popular) filters.popular = req.query.popular === 'true';
      if (req.query.featured) filters.featured = req.query.featured === 'true';
      
      // Get communities based on filters
      const communities = await storage.getCommunities(filters);
      
      console.log(`[PKL-278651-COMM-0020-DEFGRP] Found ${communities.length} communities`);
      
      // Return communities in response
      res.status(200).json({
        communities,
        count: communities.length,
        total: communities.length,
        message: "Community data fetched successfully"
      });
    } catch (error) {
      console.error("[API] Error fetching communities:", error);
      res.status(500).json({ error: "Failed to fetch communities" });
    }
  });
}