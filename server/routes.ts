import express, { type Request, Response, NextFunction } from "express";
import { Server } from "http";
import { isAuthenticated, isAdmin } from "./auth";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { storage } from "./storage";
import { matchRoutes } from "./api/match";

// Import necessary schema
import { 
  matches, matchValidations, users
} from "@shared/schema";

export async function registerRoutes(app: express.Express): Promise<Server> {
  // API Routes
  console.log("[API] Setting up API routes...");
  
  // Register match API routes
  app.use("/api/match", matchRoutes);
  
  // API routes
  
  // User info endpoint
  app.get("/api/me", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove sensitive information
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("[API] Error getting user info:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Get user profile completion
  app.get("/api/profile/completion", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Fields to check for completion
      const fieldsToCheck = [
        'firstName', 'lastName', 'email', 'birthYear', 'country', 
        'state', 'city', 'avatarUrl', 'bio', 'experience'
      ];
      
      const completedFields: string[] = [];
      let totalFields = fieldsToCheck.length;
      
      fieldsToCheck.forEach(field => {
        if (user[field as keyof typeof user]) {
          completedFields.push(field);
        }
      });
      
      const completionPercentage = Math.round((completedFields.length / totalFields) * 100);
      
      res.json({ 
        completion: completionPercentage,
        completedFields,
        pendingFields: fieldsToCheck.filter(field => !completedFields.includes(field))
      });
    } catch (error) {
      console.error("[API] Error getting profile completion:", error);
      res.status(500).json({ error: "Server error getting profile completion" });
    }
  });
  
  // Match API endpoints
  app.post("/api/match/record", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("[Match API] POST /api/match/record called - MOCK RESPONSE");
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      console.log("[Match API] Request body:", JSON.stringify(req.body, null, 2));
      
      return res.status(201).json({
        id: 999,
        matchDate: new Date(),
        validationStatus: "confirmed",
        playerNames: {},
        formatType: req.body.formatType,
        scoringSystem: req.body.scoringSystem,
        players: req.body.players,
        gameScores: req.body.gameScores
      });
    } catch (error) {
      console.error("[Match API] Error recording match:", error);
      return res.status(500).json({ error: "Server error recording match" });
    }
  });
  
  // Get recent matches
  app.get("/api/match/recent", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : req.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      
      // Return mock data for now
      res.json([
        {
          id: 999,
          date: new Date().toISOString(),
          formatType: "singles",
          scoringSystem: "traditional",
          pointsToWin: 11,
          players: [
            {
              userId: req.user.id,
              score: 11,
              isWinner: true
            },
            {
              userId: 456,
              score: 5,
              isWinner: false
            }
          ],
          playerNames: {
            [req.user.id]: {
              displayName: req.user.displayName || req.user.username,
              username: req.user.username
            },
            456: {
              displayName: "Demo Player",
              username: "demo_player"
            }
          }
        }
      ]);
    } catch (error) {
      console.error("[Match API] Error getting recent matches:", error);
      res.status(500).json({ error: "Server error getting recent matches" });
    }
  });
  
  // Multi-dimensional rankings leaderboard
  app.get("/api/multi-rankings/leaderboard", async (req: Request, res: Response) => {
    try {
      // Return mock data
      res.json({
        leaderboard: [
          {
            userId: 1,
            username: "john_doe",
            displayName: "John Doe",
            avatarUrl: null,
            avatarInitials: "JD",
            countryCode: "US",
            position: 1,
            pointsTotal: 1200,
            specialty: "offensive",
            ratings: {
              serve: 4.5,
              return: 4.2,
              dinking: 4.6,
              third_shot: 4.8,
              court_movement: 4.1,
              strategy: 4.7,
              offensive: 4.9,
              defensive: 4.0
            }
          },
          {
            userId: 2,
            username: "jane_smith",
            displayName: "Jane Smith",
            avatarUrl: null,
            avatarInitials: "JS",
            countryCode: "CA",
            position: 2,
            pointsTotal: 1180,
            specialty: "defensive",
            ratings: {
              serve: 4.3,
              return: 4.5,
              dinking: 4.7,
              third_shot: 4.1,
              court_movement: 4.9,
              strategy: 4.6,
              offensive: 4.0,
              defensive: 4.8
            }
          }
        ],
        categories: ["serve", "return", "dinking", "third_shot", "court_movement", "strategy", "offensive", "defensive"],
        tiers: [
          { name: "Elite", minRating: 4.5, color: "#6a0dad" },
          { name: "Advanced", minRating: 4.0, color: "#0000ff" },
          { name: "Intermediate+", minRating: 3.5, color: "#008000" },
          { name: "Intermediate", minRating: 3.0, color: "#ffa500" },
          { name: "Beginner+", minRating: 2.5, color: "#ff69b4" },
          { name: "Beginner", minRating: 0, color: "#a9a9a9" }
        ]
      });
    } catch (error) {
      console.error("[API] Error getting multi-dimensional rankings:", error);
      res.status(500).json({ error: "Server error getting rankings" });
    }
  });
  
  // Simple HTML response for the test page
  app.get("/test-page", (req: Request, res: Response) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pickle+ Test Page</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #FF5722; }
            .card { border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Pickle+ Test Page</h1>
          <div class="card">
            <h2>API Status</h2>
            <p>The server is running correctly with the following endpoints available:</p>
            <ul>
              <li><a href="/api/health">/api/health</a> - Health check endpoint</li>
              <li><a href="/api/multi-rankings/leaderboard">/api/multi-rankings/leaderboard</a> - Rankings data</li>
            </ul>
          </div>
          <div class="card">
            <h2>Frontend Status</h2>
            <p>If you're seeing this page, the server is working but there may be issues with the Vite middleware or the React application.</p>
            <p>Check the console logs for more information.</p>
          </div>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  });
  
  // Add a root route handler that serves the test page
  app.get("/", (req: Request, res: Response) => {
    console.log("[ROOT] Serving root HTML page");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pickle+ Server Status</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #FF5722; }
            .card { border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .links { margin-top: 30px; }
            .btn { display: inline-block; background: #FF5722; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 4px; margin-right: 10px; }
          </style>
        </head>
        <body>
          <h1>Pickle+ Server</h1>
          <div class="card">
            <h2>Server Status</h2>
            <p>👍 The server is up and running. The API endpoints are available.</p>
            <p>👉 You are seeing this page because the Vite middleware that serves the React application is not working correctly.</p>
          </div>
          <div class="card">
            <h2>Troubleshooting</h2>
            <p>Possible issues:</p>
            <ul>
              <li>The Vite middleware configuration may need adjustment</li>
              <li>The React application may have errors preventing it from loading</li>
              <li>The frontend build process may need to be restarted</li>
            </ul>
          </div>
          <div class="links">
            <a href="/test-page" class="btn">View Test Page</a>
            <a href="/api/health" class="btn">Check API Health</a>
          </div>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  });
  
  // Handle 404 errors
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[404] Route not found: ${req.path}`);
    if (req.path.startsWith('/api')) {
      // For API routes, return JSON
      res.status(404).json({ error: "API endpoint not found", path: req.path });
    } else {
      // For other routes, redirect to the root page
      res.redirect('/');
    }
  });
  
  // Server is started in index.ts, so we just need to return null here
  return null as unknown as Server;
}
