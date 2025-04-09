import express, { type Request, Response, NextFunction } from "express";
import { Server } from "http";
import { isAuthenticated, isAdmin } from "./auth";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { storage } from "./storage";
import { matchRoutes } from "./api/match";

// Import necessary schema
import { 
  matches, matchValidations, users, 
  type InsertMatch
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
      console.log("[Match API] POST /api/match/record called");
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      console.log("[Match API] Request body:", JSON.stringify(req.body, null, 2));
      
      // Use the storage interface to create a match
      const matchData: InsertMatch = {
        ...req.body,
        submitterId: req.user.id,
        validationStatus: "pending", // Initially pending until validated
        matchDate: new Date(),
      };
      
      const match = await storage.createMatch(matchData);
      return res.status(201).json(match);
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
      
      // Use storage interface to get recent matches
      const matches = await storage.getRecentMatches(userId, limit);
      
      // If no matches, return empty array
      if (!matches || matches.length === 0) {
        return res.json([]);
      }
      
      res.json(matches);
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
          <script>
            // Add client-side debugging
            console.log("Test page loaded");
            
            // Try to diagnose frontend loading issue
            window.addEventListener('load', () => {
              console.log("Window loaded. Checking src folder access...");
              
              // Check if we can fetch the main.tsx file
              fetch('/src/main.tsx')
                .then(response => {
                  console.log("main.tsx fetch status:", response.status);
                  if (response.ok) {
                    console.log("Successfully fetched main.tsx");
                  } else {
                    console.error("Failed to fetch main.tsx");
                  }
                })
                .catch(error => {
                  console.error("Error fetching main.tsx:", error);
                });
                
              // Check if we can fetch index.html directly
              fetch('/index.html')
                .then(response => {
                  console.log("index.html fetch status:", response.status);
                  if (response.ok) {
                    console.log("Successfully fetched index.html");
                  } else {
                    console.error("Failed to fetch index.html");
                  }
                })
                .catch(error => {
                  console.error("Error fetching index.html:", error);
                });
            });
          </script>
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
            <p>Check the browser console logs for diagnostic information.</p>
          </div>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  });
  
  // Remove the root route handler to allow Vite to handle it
  // This ensures the Vite middleware can correctly serve the React application
  
  // Handle 404 errors for API routes only
  // Let Vite handle other routes for the React app
  app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
    console.log(`[404] API route not found: ${req.path}`);
    res.status(404).json({ error: "API endpoint not found", path: req.path });
  });
  
  // Server is started in index.ts, so we just need to return null here
  return null as unknown as Server;
}
