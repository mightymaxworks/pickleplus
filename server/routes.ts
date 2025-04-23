import express, { Request, Response, NextFunction } from "express";
import { Server } from "http";
import * as http from "http";
import { storage } from "./storage";
import { registerAdminRoutes } from "./routes/admin-routes";
import { setupAdminDashboardRoutes } from "./routes/admin-dashboard-routes"; // Added for PKL-278651-ADMIN-0012-PERF
import { registerCommunityRoutes } from "./routes/community-routes";
import { registerEventRoutes } from "./routes/event-routes";
import { registerUserRoutes } from "./routes/user-routes";
import { registerMatchRoutes } from "./routes/match-routes";
import { registerTournamentRoutes } from "./routes/tournament-routes";
import { registerBounceAdminRoutes } from "./routes/admin-bounce-routes";
import { registerBounceGamificationRoutes } from "./routes/bounce-gamification-routes";
import { registerBounceXpRoutes } from "./routes/bounce-xp-routes";
import { registerBounceAutomationRoutes } from "./routes/admin-bounce-automation-routes";
import { registerUserSearchRoutes } from "./routes/user-search-routes"; // PKL-278651-SRCH-0001-UNIFD
import { registerMasteryPathsRoutes } from "./modules/mastery/masteryPathsRoutes"; // PKL-278651-RATE-0004-MADV
import { registerHealthCheckRoutes } from "./routes/health-check-routes"; // Simple health check routes
import { registerPassportVerificationRoutes } from "./routes/passport-verification-routes"; // PKL-278651-CONN-0004-PASS-ADMIN
import securityRoutes from "./routes/security-routes";
import multiRankingsRoutes from "./routes/multi-rankings-routes"; // PKL-278651-PRANK-0008-FWK52
import courtiqRoutes from "./routes/courtiq-routes"; // PKL-278651-CRTIQ-0009-FWK52
import { isAuthenticated } from "./middleware/auth";
import { specialRouter } from "./special-routes"; // Import special critical routes

/**
 * Register all application routes with the Express app
 * @param app Express application
 * @returns HTTP server
 */
export async function registerRoutes(app: express.Express): Promise<Server> {
  console.log("[API][CRITICAL] Registering special direct routes before standard routes");
  // Mount special router first to ensure direct implementation takes precedence
  app.use('/api', specialRouter);
  console.log("[API][CRITICAL] Special routes registered successfully");
  
  // Register route groups
  registerAdminRoutes(app);
  setupAdminDashboardRoutes(app); // Added for PKL-278651-ADMIN-0012-PERF
  registerCommunityRoutes(app);
  registerEventRoutes(app);
  registerUserRoutes(app);
  registerMatchRoutes(app);
  registerTournamentRoutes(app);
  registerBounceAdminRoutes(app); // Add Bounce admin routes
  registerBounceGamificationRoutes(app); // Add Bounce gamification routes
  registerBounceXpRoutes(app); // Add Bounce XP integration routes
  registerBounceAutomationRoutes(app); // Add Bounce automation routes
  registerUserSearchRoutes(app); // PKL-278651-SRCH-0001-UNIFD - Player search routes
  registerMasteryPathsRoutes(app); // PKL-278651-RATE-0004-MADV - CourtIQ Mastery Paths
  registerHealthCheckRoutes(app); // Simple health check route
  registerPassportVerificationRoutes(app); // PKL-278651-CONN-0004-PASS-ADMIN - Passport verification routes
  
  // Mount security routes
  app.use('/api/security', securityRoutes);
  
  // Mount PCP Rankings and CourtIQ API routes - PKL-278651-PRANK-0008-FWK52
  app.use('/api/multi-rankings', multiRankingsRoutes);
  app.use('/api/courtiq', courtiqRoutes);
  
  // Basic user info endpoint
  app.get("/api/me", isAuthenticated, async (req: Request, res: Response) => {
    const user = await storage.getUser(req.user!.id);
    res.json(user);
  });
  
  // PKL-278651-CONN-0004-PASS-REG - Direct implementation of registered events endpoint
  app.get('/api/events/my/registered', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // For now return empty array since this is just for fixing the passport UI
      // In a real implementation, this would fetch the user's registered events from database
      res.json([]);
    } catch (error) {
      console.error('[API] Error getting registered events:', error);
      res.status(500).json({ error: 'Error getting registered events' });
    }
  });
  
  // Default route for API 404s
  app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });
  
  // Create an HTTP server but don't start listening yet, as this will be handled in index.ts
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const server = http.createServer(app);
  console.log(`Server created on port ${PORT}`);
  
  return server;
}