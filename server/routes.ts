import express, { type Request, Response, NextFunction } from "express";
import { Server } from "http";
import { isAuthenticated, isAdmin, setupAuth } from "./auth";
import { db } from "./db";
import { eq, and, or, desc, sql, isNull } from "drizzle-orm";
import { users } from "@shared/schema";
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

// Import necessary schema
import { 
  matches, matchValidations, users, 
  type InsertMatch
} from "@shared/schema";

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // API Routes
  console.log("[API] Setting up API routes...");
  
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
      const ageDivision = (req.query.ageDivision as string) || '19plus';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // New filter parameters for rating and tier based filtering
      const tierFilter = req.query.tier as string || undefined;
      const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
      const maxRating = req.query.maxRating ? parseFloat(req.query.maxRating as string) : undefined;
      
      // PKL-278651-SEC-0002-TESTVIS - Get current user ID for admin check
      const currentUserId = req.user?.id || 0;
      console.log(`[API] Multi-Rankings Leaderboard - Request from user ID: ${currentUserId}`);
      
      // Check if we should use real data from the ranking system
      if (process.env.USE_REAL_LEADERBOARD === 'true') {
        try {
          console.log('[API] Using real leaderboard data from rankingSystem');
          const leaderboardData = await rankingSystem.getLeaderboard(
            ageDivision,
            format,
            'current',
            limit,
            offset,
            tierFilter,
            minRating,
            maxRating,
            currentUserId // PKL-278651-SEC-0002-TESTVIS - Pass user ID for admin check
          );
          
          // Transform the data for the response if needed
          const transformedData = leaderboardData.map((entry: any, index: number) => {
            // Convert internal rating to 0-9 scale if available
            const playerRating = entry.playerRating ? parseFloat((entry.playerRating * 1.8).toFixed(1)) : undefined;
            
            return {
              userId: entry.userId,
              username: entry.username,
              displayName: entry.displayName || entry.username,
              avatarUrl: entry.avatarUrl,
              avatarInitials: entry.avatarInitials || entry.displayName?.substring(0, 2).toUpperCase() || entry.username.substring(0, 2).toUpperCase(),
              countryCode: entry.countryCode || "US",
              position: index + 1 + offset,
              pointsTotal: entry.points,
              tier: entry.tier,
              specialty: entry.specialty || "All-Around",
              ratings: {
                overall: playerRating || 4.5, // Use the player rating if available, or fallback to 4.5
              }
            };
          });
          
          return res.json({
            leaderboard: transformedData,
            categories: ["serve", "return", "dinking", "third_shot", "court_movement", "strategy", "offensive", "defensive"],
            totalCount: transformedData.length + offset, // Calculate total for pagination
            filterApplied: {
              format,
              ageDivision,
              tier: tierFilter,
              minRating,
              maxRating
            }
          });
        } catch (err) {
          console.error('[API] Error getting real leaderboard data:', err);
          // Fall back to sample data if real data fails
        }
      }
      
      // Return sample data with the current user at the top position
      // PKL-278651-SEC-0002-TESTVIS - Ensure we're not using a test user or admin for sample data
      // We already have currentUserId from above
      const userData = await storage.getUser(currentUserId);
      
      // Define the sample leaderboard
      let sampleLeaderboard = [];
      
      // PKL-278651-SEC-0002-TESTVIS - Only include the current user if they're not a test user or admin
      if (userData && !userData.username.toLowerCase().includes('test') && !userData.isAdmin) {
        const username = userData?.username || "mightymax";
        const displayName = userData?.displayName || "MightyMax";
        const avatarUrl = userData?.avatarUrl || null;
        const avatarInitials = userData?.avatarInitials || "MX";
        
        // Add current user to the leaderboard
        sampleLeaderboard.push({
          userId: currentUserId,
          username: username,
          displayName: displayName,
          avatarUrl: avatarUrl,
          avatarInitials: avatarInitials,
          countryCode: "US",
          position: 1,
          pointsTotal: 1200,
          tier: "Advanced",
          specialty: "offensive",
          ratings: {
            overall: 7.2, // 0-9 scale (4.0 * 1.8)
            serve: 4.5,
            return: 4.2,
            dinking: 4.6,
            third_shot: 4.8,
            court_movement: 4.1,
            strategy: 4.7,
            offensive: 4.9,
            defensive: 4.0
          }
        });
      }
      
      // Add sample users (not test users)
      sampleLeaderboard = [
        ...sampleLeaderboard,
        {
          userId: 2,
          username: "jane_smith",
          displayName: "Jane Smith",
          avatarUrl: null,
          avatarInitials: "JS",
          countryCode: "CA",
          position: sampleLeaderboard.length + 1,
          pointsTotal: 1180,
          tier: "Elite",
          specialty: "defensive",
          ratings: {
            overall: 8.1, // 0-9 scale (4.5 * 1.8)
            serve: 4.3,
            return: 4.5,
            dinking: 4.7,
            third_shot: 4.1,
            court_movement: 4.9,
            strategy: 4.6,
            offensive: 4.0,
            defensive: 4.8
          }
        },
        {
          userId: 3,
          username: "alex_johnson",
          displayName: "Alex Johnson",
          avatarUrl: null,
          avatarInitials: "AJ",
          countryCode: "GB",
          position: sampleLeaderboard.length + 2,
          pointsTotal: 980,
          tier: "Intermediate+",
          specialty: "strategy",
          ratings: {
            overall: 6.3, // 0-9 scale (3.5 * 1.8)
            serve: 3.8,
            return: 3.4,
            dinking: 3.6,
            third_shot: 3.3,
            court_movement: 3.7,
            strategy: 4.2,
            offensive: 3.5,
            defensive: 3.4
          }
        },
        {
          userId: 4,
          username: "taylor_lee",
          displayName: "Taylor Lee",
          avatarUrl: null,
          avatarInitials: "TL",
          countryCode: "AU",
          position: sampleLeaderboard.length + 3,
          pointsTotal: 850,
          tier: "Intermediate",
          specialty: "dinking",
          ratings: {
            overall: 5.4, // 0-9 scale (3.0 * 1.8)
            serve: 3.0,
            return: 3.1,
            dinking: 3.7,
            third_shot: 3.2,
            court_movement: 3.0,
            strategy: 3.1,
            offensive: 2.8,
            defensive: 2.9
          }
        }
      ];
      
      // Apply tier filter if provided
      if (tierFilter) {
        sampleLeaderboard = sampleLeaderboard.filter(player => player.tier === tierFilter);
      }
      
      // Apply rating range filters if provided
      if (minRating !== undefined) {
        sampleLeaderboard = sampleLeaderboard.filter(player => player.ratings.overall >= minRating);
      }
      
      if (maxRating !== undefined) {
        sampleLeaderboard = sampleLeaderboard.filter(player => player.ratings.overall <= maxRating);
      }
      
      // Apply pagination
      sampleLeaderboard = sampleLeaderboard.slice(offset, offset + limit);
      
      // Update positions based on filtering
      sampleLeaderboard.forEach((player, index) => {
        player.position = index + 1 + offset;
      });
      
      res.json({
        leaderboard: sampleLeaderboard,
        categories: ["serve", "return", "dinking", "third_shot", "court_movement", "strategy", "offensive", "defensive"],
        filterApplied: {
          format,
          ageDivision,
          tier: tierFilter,
          minRating,
          maxRating
        }
      });
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
      // Return sample rating tiers
      res.json([
        {
          id: 1,
          name: "Elite",
          minRating: 4.5,
          maxRating: 5.0,
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
