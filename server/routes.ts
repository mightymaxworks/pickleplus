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
import securityRoutes from "./routes/security-routes";
import { isAuthenticated } from "./middleware/auth";

/**
 * Register all application routes with the Express app
 * @param app Express application
 * @returns HTTP server
 */
export async function registerRoutes(app: express.Express): Promise<Server> {
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
  
  // Mount security routes
  app.use('/api/security', securityRoutes);
  
  // Basic user info endpoint
  app.get("/api/me", isAuthenticated, async (req: Request, res: Response) => {
    const user = await storage.getUser(req.user!.id);
    res.json(user);
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