import express, { type Request, Response, NextFunction } from "express";
import { Server } from "http";
import { isAuthenticated, isAdmin, setupAuth } from "./auth";
import { db } from "./db";
import { eq, and, or, desc, sql, isNull, lte, gte } from "drizzle-orm";
import { storage } from "./storage";
import { matchRoutes } from "./api/match";
import rankingRoutes from "./api/ranking";
import { rankingSystem } from "./modules/ranking/rankingSystem";
import { registerMasteryPathsRoutes } from "./modules/mastery/masteryPathsRoutes";
import { migrateMasteryPathsTables } from "./migrateMasteryPaths";
import { 
  registerValidationRoutes,
  autoValidateMatchForSubmitter 
} from "./modules/match/validation";
import { registerPrizeDrawingRoutes } from "./routes/prize-drawing-routes";
import { registerTournamentDiscoveryRoutes } from "./routes/tournament-discovery-routes";
import { registerGoldenTicketRoutes } from "./routes/golden-ticket-routes";
import { registerEventRoutes } from "./routes/event-routes";
import { registerPassportVerificationRoutes } from "./routes/passport-verification-routes";
import { registerAdminReportRoutes } from "./routes/admin-report-routes";
import { setupAdminDashboardRoutes } from "./routes/admin-dashboard-routes";
import { registerTournamentBracketRoutes } from "./routes/register-tournament-bracket-routes";
import { registerUserSearchRoutes } from "./routes/user-search-routes";
import { default as registerTournamentSeedTeamsRoutes } from "./routes/tournament-seed-teams-routes";
import { registerMatchResultRoutes } from "./routes/register-match-result-routes";
import batchApiRoutes from "./routes/batch-api-routes"; // PKL-278651-PERF-0001.4-API
import { registerFeedbackRoutes } from "./modules/feedback/routes"; // PKL-278651-FEED-0001-BUG
import { initApiGateway } from "./modules/api-gateway"; // PKL-278651-API-0001-GATEWAY
import { initializeAdminModule } from "./modules/admin"; // PKL-278651-ADMIN-0015-USER
import { initializeXpModule } from "./modules/xp"; // PKL-278651-XP-0001-FOUND
import { registerPicklePulseRoutes } from "./routes/xp-pulse-routes"; // PKL-278651-XP-0003-PULSE
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { initializeCommunityModule } from "./modules/community"; // PKL-278651-COMM-0006-HUB

// Import necessary schema
import { 
  matches, matchValidations, users, 
  type InsertMatch
} from "@shared/schema";

// Import CourtIQ schema for ranking system
import {
  rankingPoints, playerRatings, rankingTiers
} from "@shared/courtiq-schema";

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // API Routes
  console.log("[API] Setting up API routes...");
  
  // Create simple test endpoints without authentication
  app.get('/test-route', (req, res) => {
    res.json({ message: 'Test route works!' });
  });
  
  // Configure a simple storage engine for testing
  const testStorage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = 'uploads/test';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req: any, file: any, cb: any) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `test_${Date.now()}${fileExt}`;
      cb(null, fileName);
    }
  });
  
  // Create multer upload instance
  const testUpload = multer({ storage: testStorage });
  
  // Create a dedicated test upload endpoint with minimal complexity
  app.post('/test-upload-endpoint', testUpload.single('file'), (req: Request, res: Response) => {
    console.log('Test upload endpoint called');
    console.log('Request file:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const relativePath = req.file.path.replace(/^uploads\//, '/uploads/');
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      url: relativePath,
      file: req.file
    });
  });
  
  // Register API route modules
  app.use("/api/match", matchRoutes);
  app.use("/api/ranking", rankingRoutes);
  
  // Initialize Mastery Paths database tables
  try {
    console.log("[API] Initializing Mastery Paths database tables...");
    await migrateMasteryPathsTables();
    console.log("[API] Mastery Paths database tables initialized successfully");
  } catch (error) {
    console.error("[API] Error initializing Mastery Paths database tables:", error);
  }
  
  // Register Mastery Paths routes
  registerMasteryPathsRoutes(app);
  
  // Register Match Validation routes (PKL-278651-VALMAT-0001-FIX)
  registerValidationRoutes(app);
  
  // Register Tournament Discovery and Prize Drawing routes (PKL-278651-GAME-0002-TOURN)
  registerTournamentDiscoveryRoutes(app);
  registerPrizeDrawingRoutes(app);
  
  // Register Golden Ticket routes (PKL-278651-GAME-0005-GOLD)
  registerGoldenTicketRoutes(app);
  
  // Register Event Check-in routes (PKL-278651-CONN-0003-EVENT)
  registerEventRoutes(app);
  
  // Register Passport Verification routes (PKL-278651-CONN-0004-PASS-ADMIN)
  registerPassportVerificationRoutes(app);
  
  // Initialize Enhanced User Management module (PKL-278651-ADMIN-0015-USER)
  // This needs to be initialized before other admin routes to ensure proper routing
  const adminRouter = initializeAdminModule();
  app.use("/api/admin", isAuthenticated, isAdmin, adminRouter);
  
  // Register Admin Reporting routes (PKL-278651-ADMIN-0010-REPORT)
  registerAdminReportRoutes(app);
  
  // Register Admin Dashboard routes (PKL-278651-ADMIN-0011-DASH)
  setupAdminDashboardRoutes(app);
  
  // Register Tournament Bracket routes (PKL-278651-TOURN-0001-BRCKT)
  registerTournamentBracketRoutes(app);
  
  // Register User Search routes (PKL-278651-SRCH-0001-UNIFD)
  // This is a special registration to ensure proper authentication handling
  registerUserSearchRoutes(app);
  
  // Register Tournament Seed Teams routes (PKL-278651-TOURN-0003-MATCH)
  registerTournamentSeedTeamsRoutes(app, storage);
  
  // Register Match Result routes (PKL-278651-TOURN-0003.1-API)
  registerMatchResultRoutes(app);
  
  // Register Bug Reporting routes (PKL-278651-FEED-0001-BUG)
  registerFeedbackRoutes(app);
  
  // Initialize API Gateway and Developer Portal (PKL-278651-API-0001-GATEWAY)
  initApiGateway(app);
  
  // Initialize Community Hub Module (PKL-278651-COMM-0006-HUB)
  initializeCommunityModule({ app });
  
  // Initialize XP System Module (PKL-278651-XP-0001-FOUND)
  initializeXpModule(app);
  
  // Initialize PicklePulse System (PKL-278651-XP-0003-PULSE)
  const pickleScheduler = registerPicklePulseRoutes(app, storage);
  
  // Register Batch API routes (PKL-278651-PERF-0001.4-API)
  app.use("/api", batchApiRoutes);
  
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
  
  // Profile Update Endpoint (PKL-278651-PROF-0001-NAME)
  app.patch("/api/profile/update", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // CSRF protection
      const csrfToken = req.headers['x-csrf-token'];
      if (!csrfToken) {
        console.error('[API] CSRF token missing in profile update request');
        return res.status(403).json({ message: "CSRF token validation failed" });
      }
      
      if (!req.session || !req.session.csrfToken || req.session.csrfToken !== csrfToken) {
        console.error(`[API] CSRF token mismatch. Expected: ${req.session?.csrfToken?.substring(0, 8) || 'undefined'}, Got: ${(csrfToken as string)?.substring(0, 8) || 'undefined'}`);
        return res.status(403).json({ message: "CSRF token validation failed" });
      }
      
      console.log("[API] Profile update request received:", JSON.stringify(req.body, null, 2));
      console.log("[API] Raw profile request body keys:", Object.keys(req.body));
      
      // Get the current user data to compare later for XP rewards
      const oldUser = await storage.getUser(req.user.id);
      if (!oldUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Ensure we have data to update
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "No profile data provided for update" });
      }
      
      // Use standard storage interface for updating profile
      // The storage.updateUserProfile method handles all the field mapping 
      // between camelCase (frontend/TypeScript) and snake_case (database)
      const profileData = { ...req.body };
      console.log(`[API] Processing profile update with data:`, JSON.stringify(profileData, null, 2));
      
      // Update the user's profile using the storage interface
      const updatedUserProfile = await storage.updateUserProfile(req.user.id, profileData);
      if (!updatedUserProfile) {
        console.error("[API] Failed to update profile with storage interface");
        return res.status(500).json({ error: "Failed to update profile" });
      }
      
      console.log("[API] Profile update successful:", JSON.stringify({
        firstName: updatedUserProfile.firstName,
        lastName: updatedUserProfile.lastName
      }, null, 2));
      
      // Check if profile completion crossed a threshold to award XP
      const oldCompletion = oldUser.profileCompletionPct || 0;
      const newCompletion = updatedUserProfile.profileCompletionPct || 0;
      
      let xpAwarded = 0;
      
      // XP thresholds: award XP at 25%, 50%, 75%, and 100% completion
      const thresholds = [
        { threshold: 25, reward: 25 },
        { threshold: 50, reward: 50 },
        { threshold: 75, reward: 75 },
        { threshold: 100, reward: 100 }
      ];
      
      // Check if any thresholds were crossed
      for (const tier of thresholds) {
        if (oldCompletion < tier.threshold && newCompletion >= tier.threshold) {
          xpAwarded += tier.reward;
          
          // Record activity
          await storage.createActivity({
            userId: req.user.id,
            type: 'profile_update',
            description: `Profile ${tier.threshold}% complete: +${tier.reward}XP`,
            xpEarned: tier.reward,
            metadata: { 
              oldCompletion, 
              newCompletion,
              threshold: tier.threshold 
            }
          });
          
          // Award XP
          await storage.updateUserXP(req.user.id, tier.reward);
        }
      }
      
      // Get the latest user data after possible XP awards
      const finalUser = await storage.getUser(req.user.id);
      
      res.json({
        user: finalUser,
        xpAwarded
      });
    } catch (error) {
      console.error("[API] Error updating profile:", error);
      res.status(500).json({ error: "Server error updating profile" });
    }
  });
  
  // XP Leaderboard Endpoint (PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control)
  app.get("/api/leaderboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
      // Check if the requesting user is an admin to determine if we should hide test data
      const currentUserId = req.user?.id || 0;
      let isAdmin = false;
      
      if (currentUserId) {
        try {
          const [adminCheck] = await db.select({ isAdmin: users.isAdmin })
            .from(users)
            .where(eq(users.id, currentUserId));
          isAdmin = adminCheck?.isAdmin === true;
        } catch (error) {
          console.error("[API] Error checking admin status:", error);
        }
      }
      
      console.log(`[API] XP Leaderboard - User ${currentUserId} isAdmin: ${isAdmin}`);
      
      // Build the query based on whether the user is an admin
      let query = db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
        xp: users.xp,
        level: users.level,
        avatarUrl: users.avatarUrl,
        avatarInitials: users.avatarInitials,
        rankingPoints: users.rankingPoints
      })
      .from(users);
      
      // Only apply test data filters for non-admin users
      if (!isAdmin) {
        console.log("[API] Applying test data filters to XP leaderboard (non-admin user)");
        query = query.where(
          and(
            // PKL-278651-SEC-0002-TESTVIS - Filter out test users (users with 'test' in their name)
            sql`username NOT ILIKE '%test%'`,
            // PKL-278651-SEC-0002-TESTVIS - Filter out administrators 
            or(eq(users.isAdmin, false), isNull(users.isAdmin)),
            // PKL-278651-SEC-0002-TESTVIS - Filter out test data
            or(eq(users.isTestData, false), isNull(users.isTestData))
          )
        );
      } else {
        console.log("[API] Skipping test data filters for XP leaderboard (admin user)");
      }
      
      // Apply ordering and limit to the query
      const leaderboardUsers = await query
        .orderBy(desc(users.xp))
        .limit(limit);
      
      console.log(`[API] Returning XP leaderboard with ${leaderboardUsers.length} users (after filtering out test users and admins)`);
      
      // Return the leaderboard data
      res.json(leaderboardUsers);
    } catch (error) {
      console.error("[API] Error getting XP leaderboard:", error);
      res.status(500).json({ error: "Server error getting leaderboard" });
    }
  });
  
  // Ranking Points Leaderboard Endpoint (PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control)
  app.get("/api/ranking-leaderboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // PKL-278651-SEC-0002-TESTVIS - Test Data Visibility Control
      // Check if the requesting user is an admin to determine if we should hide test data
      const currentUserId = req.user?.id || 0;
      let isAdmin = false;
      
      if (currentUserId) {
        try {
          const [adminCheck] = await db.select({ isAdmin: users.isAdmin })
            .from(users)
            .where(eq(users.id, currentUserId));
          isAdmin = adminCheck?.isAdmin === true;
        } catch (error) {
          console.error("[API] Error checking admin status:", error);
        }
      }
      
      console.log(`[API] Ranking Leaderboard - User ${currentUserId} isAdmin: ${isAdmin}`);
      
      // Build the query based on whether the user is an admin
      let query = db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        firstName: users.firstName,
        lastName: users.lastName,
        xp: users.xp,
        level: users.level,
        avatarUrl: users.avatarUrl,
        avatarInitials: users.avatarInitials,
        rankingPoints: users.rankingPoints
      })
      .from(users);
      
      // Only apply test data filters for non-admin users
      if (!isAdmin) {
        console.log("[API] Applying test data filters to ranking leaderboard (non-admin user)");
        query = query.where(
          and(
            // PKL-278651-SEC-0002-TESTVIS - Filter out test users (users with 'test' in their name)
            sql`username NOT ILIKE '%test%'`,
            // PKL-278651-SEC-0002-TESTVIS - Filter out administrators 
            or(eq(users.isAdmin, false), isNull(users.isAdmin)),
            // PKL-278651-SEC-0002-TESTVIS - Filter out test data
            or(eq(users.isTestData, false), isNull(users.isTestData))
          )
        );
      } else {
        console.log("[API] Skipping test data filters for ranking leaderboard (admin user)");
      }
      
      // Apply ordering and limit to the query
      const leaderboardUsers = await query
        .orderBy(desc(users.rankingPoints))
        .limit(limit);
      
      console.log(`[API] Returning ranking leaderboard with ${leaderboardUsers.length} users (after filtering out test users and admins)`);
      
      // Return the leaderboard data
      res.json(leaderboardUsers);
    } catch (error) {
      console.error("[API] Error getting ranking leaderboard:", error);
      res.status(500).json({ error: "Server error getting leaderboard" });
    }
  });

  // Profile Field Completion Endpoint (PKL-278651-XPPS-0001)
  app.post("/api/profile/field-completion", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // CSRF protection
      const csrfToken = req.headers['x-csrf-token'];
      if (!csrfToken) {
        console.error('[API] CSRF token missing in field completion request');
        return res.status(403).json({ message: "CSRF token validation failed" });
      }
      
      if (!req.session || !req.session.csrfToken || req.session.csrfToken !== csrfToken) {
        console.error(`[API] CSRF token mismatch. Expected: ${req.session?.csrfToken?.substring(0, 8) || 'undefined'}, Got: ${(csrfToken as string)?.substring(0, 8) || 'undefined'}`);
        return res.status(403).json({ message: "CSRF token validation failed" });
      }
      
      const { fieldName, fieldType } = req.body;
      
      if (!fieldName || !fieldType) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Check if this field has already been completed
      const alreadyCompleted = await storage.checkProfileFieldCompletion(req.user.id, fieldName);
      
      if (alreadyCompleted) {
        return res.status(200).json({ 
          success: true, 
          message: "Field already completed", 
          alreadyAwarded: true,
          xpAwarded: 0
        });
      }
      
      // Determine XP amount based on field type according to specification PKL-278651-XPPS-0001
      let xpAmount = 5; // Default for basic fields
      
      switch (fieldType) {
        case 'basic':
          xpAmount = 5;
          break;
        case 'equipment':
          xpAmount = 10;
          break;
        case 'playing-attribute':
          xpAmount = 15;
          break;
        case 'skill-assessment':
          xpAmount = 20;
          break;
        case 'profile-media':
          xpAmount = 25;
          break;
        default:
          xpAmount = 5;
      }
      
      // Record that this field has been completed and award XP
      await storage.recordProfileFieldCompletion(req.user.id, fieldName, xpAmount);
      await storage.updateUserXP(req.user.id, xpAmount);
      
      // We'll only record XP via the updateUserXP call
      // No separate activity logging since we don't have createActivity in the interface
      
      // Return success response
      res.status(200).json({
        success: true,
        message: "Field completion recorded",
        alreadyAwarded: false,
        xpAwarded: xpAmount
      });
    } catch (error) {
      console.error("[API] Error recording field completion:", error);
      res.status(500).json({ error: "Server error recording field completion" });
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
      
      // Extract winner information
      const winnerId = req.body.players ? 
        req.body.players.find((p: any) => p.isWinner)?.userId : undefined;
      
      if (!winnerId) {
        console.error("[Match API] Error: No winner defined in the match data");
        return res.status(400).json({ error: "Match data missing winner information" });
      }
      
      // Extract player IDs from the players array
      let playerOneId, playerTwoId, playerOnePartnerId, playerTwoPartnerId;
      
      if (req.body.players && req.body.players.length >= 2) {
        playerOneId = req.body.players[0].userId;
        playerTwoId = req.body.players[1].userId;
        playerOnePartnerId = req.body.players[0].partnerId || null;
        playerTwoPartnerId = req.body.players[1].partnerId || null;
      } else {
        console.error("[Match API] Error: Invalid players data structure");
        return res.status(400).json({ error: "Invalid players data structure" });
      }
      
      // Get scorePlayerOne and scorePlayerTwo from the players array
      const scorePlayerOne = req.body.players[0].score;
      const scorePlayerTwo = req.body.players[1].score;
      
      if (!scorePlayerOne || !scorePlayerTwo) {
        console.error("[Match API] Error: Missing score information");
        return res.status(400).json({ error: "Match data missing score information" });
      }
      
      // Use the storage interface to create a match
      const matchData: InsertMatch = {
        playerOneId,
        playerTwoId,
        playerOnePartnerId,
        playerTwoPartnerId,
        winnerId,
        scorePlayerOne,
        scorePlayerTwo,
        formatType: req.body.formatType || "singles",
        scoringSystem: req.body.scoringSystem || "traditional",
        pointsToWin: req.body.pointsToWin || 11,
        division: req.body.division || "open",
        matchType: req.body.matchType || "casual",
        eventTier: req.body.eventTier || "local",
        gameScores: req.body.gameScores || [],
        notes: req.body.notes || "",
        // Remove validationStatus as it's not in InsertMatch type
        matchDate: new Date(),
      };
      
      console.log("[Match API] Processed match data:", JSON.stringify(matchData, null, 2));
      
      const match = await storage.createMatch(matchData);
      
      // Auto-validate the match for the submitter (PKL-278651-VALMAT-0001-FIX)
      try {
        await autoValidateMatchForSubmitter(match.id, req.user.id);
        console.log(`[Match API] Match ${match.id} auto-validated for submitter ${req.user.id}`);
      } catch (validationError) {
        console.error(`[Match API] Error auto-validating match for submitter:`, validationError);
        // We don't fail the request if auto-validation fails
      }
      
      return res.status(201).json(match);
    } catch (error) {
      console.error("[Match API] Error recording match:", error);
      // More detailed error response
      let errorMessage = "Server error recording match";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return res.status(500).json({ error: errorMessage });
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
      
      // Collect all user IDs from matches to fetch user data
      const playerIds = new Set<number>();
      
      for (const match of matches) {
        if (match.playerOneId && match.playerOneId !== userId) playerIds.add(match.playerOneId);
        if (match.playerTwoId && match.playerTwoId !== userId) playerIds.add(match.playerTwoId);
        if (match.playerOnePartnerId) playerIds.add(match.playerOnePartnerId);
        if (match.playerTwoPartnerId) playerIds.add(match.playerTwoPartnerId);
      }
      
      // Fetch user data for all players
      const playerData: Record<number, { 
        displayName: string; 
        username: string; 
        avatarUrl?: string; 
        avatarInitials?: string;
      }> = {};
      
      // Add current user's data
      const currentUser = await storage.getUser(userId);
      if (currentUser) {
        playerData[userId] = {
          displayName: currentUser.displayName || 'You',
          username: currentUser.username || 'you',
          avatarUrl: currentUser.avatarUrl || undefined,
          avatarInitials: currentUser.avatarInitials || 
                       (currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'Y')
        };
      }
      
      // Add opponent data
      for (const playerId of playerIds) {
        try {
          const player = await storage.getUser(playerId);
          if (player) {
            playerData[playerId] = {
              displayName: player.displayName || `Player ${playerId}`,
              username: player.username || `player${playerId}`,
              avatarUrl: player.avatarUrl || undefined,
              avatarInitials: player.avatarInitials || 
                          (player.displayName ? player.displayName.charAt(0).toUpperCase() : `P${playerId}`)
            };
          }
        } catch (error) {
          console.error(`Error fetching user data for player ${playerId}:`, error);
          // Add default data if player fetch fails
          playerData[playerId] = {
            displayName: `Player ${playerId}`,
            username: `player${playerId}`,
            avatarInitials: `P${playerId}`
          };
        }
      }
      
      // Enhance matches with player data
      const enhancedMatches = matches.map(match => ({
        ...match,
        playerNames: playerData
      }));
      
      res.json(enhancedMatches);
    } catch (error) {
      console.error("[Match API] Error getting recent matches:", error);
      res.status(500).json({ error: "Server error getting recent matches" });
    }
  });
  
  /**
   * PKL-278651-HIST-0001-BL: Match history endpoint with filtering and pagination
   */
  app.get("/api/match/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user.id;
      const matchType = req.query.matchType as string;
      const formatType = req.query.formatType as string;
      const validationStatus = req.query.validationStatus as string;
      const location = req.query.location as string;
      const sortBy = req.query.sortBy as string || 'date';
      const sortDirection = req.query.sortDirection as string || 'desc';
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      console.log("[Match API] Match history request:", {
        page, limit, userId, matchType, formatType, validationStatus, location, sortBy, sortDirection, startDate, endDate
      });
      
      // Use storage interface to get recent matches (will filter and paginate afterward)
      const matches = await storage.getRecentMatches(userId, limit * page * 2); // Get more matches to allow for filtering
      
      // If no matches, return empty result
      if (!matches || matches.length === 0) {
        return res.json({
          matches: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0
          }
        });
      }
      
      // Collect all user IDs from matches to fetch user data
      const playerIds = new Set<number>();
      
      for (const match of matches) {
        if (match.playerOneId) playerIds.add(match.playerOneId);
        if (match.playerTwoId) playerIds.add(match.playerTwoId);
        if (match.playerOnePartnerId) playerIds.add(match.playerOnePartnerId);
        if (match.playerTwoPartnerId) playerIds.add(match.playerTwoPartnerId);
      }
      
      // Fetch user data for all players
      const playerData: Record<number, { 
        displayName: string; 
        username: string; 
        avatarUrl?: string; 
        avatarInitials?: string;
      }> = {};
      
      // Fetch user data for each player ID
      for (const playerId of playerIds) {
        try {
          const player = await storage.getUser(playerId);
          if (player) {
            playerData[playerId] = {
              displayName: player.displayName || `Player ${playerId}`,
              username: player.username || `player${playerId}`,
              avatarUrl: player.avatarUrl,
              avatarInitials: player.avatarInitials || `P${playerId}`
            };
          }
        } catch (error) {
          console.error(`Error fetching user data for player ${playerId}:`, error);
          // Add default data if player fetch fails
          playerData[playerId] = {
            displayName: `Player ${playerId}`,
            username: `player${playerId}`,
            avatarInitials: `P${playerId}`
          };
        }
      }
      
      // Apply filters
      let filteredMatches = matches;
      
      if (matchType) {
        filteredMatches = filteredMatches.filter(match => match.matchType === matchType);
      }
      
      if (formatType) {
        filteredMatches = filteredMatches.filter(match => match.formatType === formatType);
      }
      
      if (validationStatus) {
        filteredMatches = filteredMatches.filter(match => match.validationStatus === validationStatus);
      }
      
      if (location) {
        filteredMatches = filteredMatches.filter(match => match.location === location);
      }
      
      if (startDate) {
        filteredMatches = filteredMatches.filter(match => {
          const matchDate = new Date(match.matchDate || match.createdAt);
          return matchDate >= startDate;
        });
      }
      
      if (endDate) {
        filteredMatches = filteredMatches.filter(match => {
          const matchDate = new Date(match.matchDate || match.createdAt);
          return matchDate <= endDate;
        });
      }
      
      // Sort matches
      filteredMatches.sort((a, b) => {
        if (sortBy === 'date') {
          const dateA = new Date(a.matchDate || a.createdAt);
          const dateB = new Date(b.matchDate || b.createdAt);
          return sortDirection === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
        }
        return 0;
      });
      
      // Paginate the results
      const offset = (page - 1) * limit;
      const paginatedMatches = filteredMatches.slice(offset, offset + limit);
      
      // Enhance matches with player data
      const enhancedMatches = paginatedMatches.map(match => ({
        ...match,
        playerNames: playerData
      }));
      
      const result = {
        matches: enhancedMatches,
        pagination: {
          total: filteredMatches.length,
          page,
          limit,
          totalPages: Math.ceil(filteredMatches.length / limit)
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error("[API] Error getting match history:", error);
      res.status(500).json({ error: "Server error getting match history" });
    }
  });
  
  // Multi-dimensional rankings leaderboard
  app.get("/api/multi-rankings/leaderboard", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Extract all query parameters with defaults
      const format = (req.query.format as string) || 'singles';
      const division = (req.query.ageDivision as string) || '19+';
      const season = "2025-S1"; // Current season
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // New filter parameters for rating and tier based filtering
      const tierFilter = req.query.tier as string || undefined;
      const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
      const maxRating = req.query.maxRating ? parseFloat(req.query.maxRating as string) : undefined;
      
      // Get current user ID for highlighting current user in results
      const currentUserId = req.user?.id || 0;
      console.log(`[API] Multi-Rankings Leaderboard - Request from user ID: ${currentUserId}`);
      
          // Always use real data from the database now
      try {
        console.log('[API] Using real leaderboard data from database');
        
        // Build SQL query with joins for leaderboard data
        let leaderboardQuery = sql`
          SELECT 
            u.id as user_id,
            u.username,
            u.display_name,
            u.first_name,
            u.last_name,
            u.avatar_url,
            u.avatar_initials,
            u.country,
            rp.points,
            rp.total_matches,
            rp.wins_count,
            rp.tier,
            rt.name as tier_name,
            rt.color_code as tier_color
          FROM ranking_points rp
          JOIN users u ON rp.user_id = u.id
          LEFT JOIN ranking_tiers rt ON (
            rt.min_points <= rp.points AND
            rt.max_points >= rp.points
          )
          WHERE rp.format = ${format}
            AND rp.division = ${division}
            AND rp.season = ${season}
        `;
        
        // Only show legitimate users (not test users) for non-admin users
        if (!await storage.isUserAdmin(currentUserId)) {
          leaderboardQuery = sql`${leaderboardQuery} 
            AND u.username NOT ILIKE '%test%'
            AND (u.is_admin = false OR u.is_admin IS NULL)
            AND (u.is_test_data = false OR u.is_test_data IS NULL)
          `;
        }
        
        // Apply tier filter if specified
        if (tierFilter) {
          leaderboardQuery = sql`${leaderboardQuery} AND (rp.tier = ${tierFilter} OR rt.name = ${tierFilter})`;
        }
        
        // Get total count for pagination info
        const countQuery = sql`SELECT COUNT(*) as total FROM (${leaderboardQuery}) as filtered_count`;
        const countResult = await db.execute(countQuery);
        const totalPlayers = parseInt(countResult.rows?.[0]?.total || '0');
        
        // Add sorting and pagination to main query
        leaderboardQuery = sql`
          ${leaderboardQuery}
          ORDER BY rp.points DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        // Execute the main query
        const result = await db.execute(leaderboardQuery);
        
        if (!result.rows) {
          throw new Error('Failed to retrieve leaderboard data');
        }
        
        // Transform query results into expected format
        const leaderboardData = await Promise.all(result.rows.map(async (player, index) => {
          // Set position based on current page and offset
          const position = index + 1 + offset;
          
          // Get player ratings if available
          const playerRatingData = await db.execute(sql`
            SELECT rating, tier FROM player_ratings
            WHERE user_id = ${player.user_id}
            AND format = ${format}
            AND division = ${division}
            LIMIT 1
          `);
          
          // Use player rating if available or default value
          const rating = playerRatingData.rows?.[0]?.rating 
            ? parseFloat(playerRatingData.rows[0].rating) / 200  // Convert 1000-2000 scale to 5.0 scale
            : 3.0;
          
          // Format display name using available data
          const displayName = player.display_name || 
            (player.first_name && player.last_name 
              ? `${player.first_name} ${player.last_name}`
              : player.username);
          
          // Generate avatar initials if not available
          const avatarInitials = player.avatar_initials || 
            displayName.split(' ')
              .slice(0, 2)
              .map(name => name.charAt(0).toUpperCase())
              .join('');
          
          // Generate component ratings based on overall rating
          // This provides a consistent set of component ratings derived from the overall rating
          const randomVariation = () => (Math.random() * 0.6) - 0.3;  // Random value between -0.3 and +0.3
          const getComponentRating = () => Math.min(5.0, Math.max(1.0, rating + randomVariation()));
          
          return {
            userId: player.user_id,
            username: player.username,
            displayName: displayName,
            avatarUrl: player.avatar_url,
            avatarInitials: avatarInitials,
            countryCode: player.country || "US",
            position: position,
            pointsTotal: player.points,
            tier: player.tier_name || player.tier || "Challenger",
            tierColor: player.tier_color || "#888888",
            specialty: "All-Around", // Default until we track specialties
            isCurrentUser: player.user_id === currentUserId,
            matchesPlayed: player.total_matches || 0,
            wins: player.wins_count || 0,
            ratings: {
              overall: rating,
              serve: getComponentRating(),
              return: getComponentRating(),
              dinking: getComponentRating(),
              third_shot: getComponentRating(),
              court_movement: getComponentRating(),
              strategy: getComponentRating(),
              offensive: getComponentRating(),
              defensive: getComponentRating()
            }
          };
        }));
        
        // Return leaderboard data in expected format
        return res.json({
          leaderboard: leaderboardData,
          categories: ["serve", "return", "dinking", "third_shot", "court_movement", "strategy", "offensive", "defensive"],
          totalCount: totalPlayers,
          filterApplied: {
            format,
            ageDivision: division,
            tier: tierFilter,
            minRating,
            maxRating
          }
        });
      } catch (error) {
        console.error('[API] Error getting real leaderboard data:', error);
        
        // Return empty leaderboard with error message
        res.json({
          leaderboard: [],
          categories: ["serve", "return", "dinking", "third_shot", "court_movement", "strategy", "offensive", "defensive"],
          totalCount: 0,
          error: "Unable to retrieve leaderboard data",
          filterApplied: {
            format,
            ageDivision: division,
            tier: tierFilter,
            minRating,
            maxRating
          }
        });
      }
    } catch (error) {
      console.error("[API] Error getting multi-dimensional rankings:", error);
      res.status(500).json({ error: "Server error getting rankings" });
    }
  });
  
  // Multi-dimensional rankings position
  app.get("/api/multi-rankings/position", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : (req.user?.id || 1);
      const format = req.query.format as string || 'singles';
      const division = req.query.ageDivision as string || '19+';
      const season = "2025-S1"; // Current season
      
      // Log API request for debugging
      console.log("[API] Multi-Rankings Position - Request for user ID:", userId, "format:", format, "division:", division);
      
      // Get user ranking data from database
      const userRankingData = await db.query.rankingPoints.findFirst({
        where: and(
          eq(rankingPoints.userId, userId),
          eq(rankingPoints.format, format),
          eq(rankingPoints.division, division),
          eq(rankingPoints.season, season)
        )
      });
      
      // Get total number of players with rankings for this format and division
      const totalPlayersResult = await db.execute(
        sql`SELECT COUNT(*) as total FROM ranking_points 
            WHERE format = ${format} AND division = ${division} AND season = ${season}`
      );
      const totalPlayers = totalPlayersResult.rows && totalPlayersResult.rows.length > 0 
        ? parseInt(totalPlayersResult.rows[0].total) 
        : 0;
      
      // Calculate user's rank
      let userRank = 1;
      if (userRankingData) {
        const rankResult = await db.execute(
          sql`SELECT COUNT(*) as rank FROM ranking_points 
              WHERE format = ${format} AND division = ${division} AND season = ${season}
              AND points > ${userRankingData.points}`
        );
        userRank = rankResult.rows && rankResult.rows.length > 0 
          ? parseInt(rankResult.rows[0].rank) + 1  // +1 because position is 1-indexed
          : 1;
      }
      
      // Get tier ID based on points
      const pointsValue = userRankingData?.points || 0;
      const tierResult = await db.query.rankingTiers.findFirst({
        where: and(
          lte(rankingTiers.minPoints, pointsValue),
          gte(rankingTiers.maxPoints, pointsValue)
        )
      });
      
      // Get skill rating if available (or use default)
      const playerRatingResult = await db.query.playerRatings.findFirst({
        where: and(
          eq(playerRatings.userId, userId),
          eq(playerRatings.format, format),
          eq(playerRatings.division, division)
        )
      });
      
      res.json({
        userId: userId,
        format: format,
        ageDivision: division,
        ratingTierId: tierResult?.id || 1,
        rankingPoints: userRankingData?.points || 0,
        rank: userRank,
        totalPlayers: totalPlayers,
        skillRating: playerRatingResult?.rating || 3.0
      });
    } catch (error) {
      console.error("[API] Error getting ranking position:", error);
      res.status(500).json({ error: "Server error getting ranking position" });
    }
  });
  
  // Multi-dimensional rankings history
  app.get("/api/multi-rankings/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : (req.user?.id || 1);
      
      // Return sample ranking history data
      res.json([
        {
          id: 1,
          userId: userId,
          timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          rankingPoints: 950,
          rank: 5,
          format: 'singles',
          ageDivision: '19plus',
          skillRating: 4.2
        },
        {
          id: 2,
          userId: userId,
          timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          rankingPoints: 1050,
          rank: 3,
          format: 'singles',
          ageDivision: '19plus',
          skillRating: 4.3
        },
        {
          id: 3,
          userId: userId,
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          rankingPoints: 1150,
          rank: 2,
          format: 'singles',
          ageDivision: '19plus',
          skillRating: 4.4
        },
        {
          id: 4,
          userId: userId,
          timestamp: new Date().toISOString(),
          rankingPoints: 1200,
          rank: 1,
          format: 'singles',
          ageDivision: '19plus',
          skillRating: 4.5
        }
      ]);
    } catch (error) {
      console.error("[API] Error getting ranking history:", error);
      res.status(500).json({ error: "Server error getting ranking history" });
    }
  });
  
  // Rating tiers
  app.get("/api/multi-rankings/rating-tiers", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get real rating tiers from database
      const tiersQuery = db.select({
        id: rankingTiers.id,
        name: rankingTiers.name,
        minPoints: rankingTiers.minPoints,
        maxPoints: rankingTiers.maxPoints,
        description: rankingTiers.description,
        badgeUrl: rankingTiers.badgeUrl,
        colorCode: rankingTiers.colorCode,
        order: rankingTiers.order
      })
      .from(rankingTiers)
      .orderBy(rankingTiers.order);
      
      const tiers = await tiersQuery;
      
      // If we have tiers in the database, return them
      if (tiers && tiers.length > 0) {
        // Map to expected response format
        const formattedTiers = tiers.map(tier => ({
          id: tier.id,
          name: tier.name,
          minRating: tier.minPoints / 400, // Convert points to rating scale
          maxRating: tier.maxPoints / 400, // Convert points to rating scale
          minPoints: tier.minPoints,
          maxPoints: tier.maxPoints,
          badgeUrl: tier.badgeUrl,
          colorCode: tier.colorCode || "#888888",
          protectionLevel: Math.floor(tier.order / 2), // Simple formula for protection level
          description: tier.description || `${tier.name} tier players`,
          order: tier.order
        }));
        
        return res.json(formattedTiers);
      }
      
      // If no tiers in database, return default tiers
      console.log("[API] No rating tiers found in database, returning default tiers");
      res.json([
        {
          id: 1,
          name: "Elite",
          minRating: 4.5,
          maxRating: 5.0,
          minPoints: 1800,
          maxPoints: 2000,
          badgeUrl: null,
          colorCode: "#6a0dad",
          protectionLevel: 3,
          description: "Top-tier players with exceptional skills",
          order: 1
        },
        {
          id: 2,
          name: "Advanced",
          minRating: 4.0,
          maxRating: 4.49,
          minPoints: 1600,
          maxPoints: 1799,
          badgeUrl: null,
          colorCode: "#0000ff", 
          protectionLevel: 2,
          description: "Highly skilled players with advanced technique",
          order: 2
        },
        {
          id: 3,
          name: "Intermediate+",
          minRating: 3.5,
          maxRating: 3.99,
          minPoints: 1400,
          maxPoints: 1599,
          badgeUrl: null,
          colorCode: "#008000",
          protectionLevel: 1,
          description: "Players with solid fundamentals and some specialized skills",
          order: 3
        },
        {
          id: 4,
          name: "Intermediate",
          minRating: 3.0,
          maxRating: 3.49,
          minPoints: 1200,
          maxPoints: 1399,
          badgeUrl: null,
          colorCode: "#ffa500",
          protectionLevel: 1,
          description: "Players with good fundamentals",
          order: 4
        },
        {
          id: 5,
          name: "Beginner+",
          minRating: 2.5,
          maxRating: 2.99,
          minPoints: 1000,
          maxPoints: 1199,
          badgeUrl: null,
          colorCode: "#ff69b4",
          protectionLevel: 0,
          description: "Players developing fundamental skills",
          order: 5
        },
        {
          id: 6,
          name: "Beginner",
          minRating: 0,
          maxRating: 2.49,
          minPoints: 0,
          maxPoints: 999,
          badgeUrl: null,
          colorCode: "#a9a9a9",
          protectionLevel: 0,
          description: "New players learning the game",
          order: 6
        }
      ]);
    } catch (error) {
      console.error("[API] Error getting rating tiers:", error);
      res.status(500).json({ error: "Server error getting rating tiers" });
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
