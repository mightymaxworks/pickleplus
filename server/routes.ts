import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { z } from "zod";
import { nanoid } from "nanoid";
import { 
  insertUserSchema, 
  insertTournamentSchema, 
  insertTournamentParticipantSchema,
  insertMatchSchema, 
  insertXpCodeSchema
} from "@shared/schema";

// Add session type definition
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup sessions with MemoryStore
  const MemoryStore = createMemoryStore(session);
  app.use(session({
    secret: 'pickle-plus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 86400000 }, // 24 hours
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // User routes
  app.post("/api/users/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Mock session by setting a user ID in the session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/current", async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/logout", (req, res) => {
    if (req.session) {
      req.session.destroy(() => {
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Already logged out" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/playerId/:playerId", async (req, res) => {
    try {
      const { playerId } = req.params;
      
      const user = await storage.getUserByPlayerId(playerId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get user by player ID error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topUsers = await storage.getTopUsers(limit);
      
      // Remove passwords from response
      const leaderboard = topUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json(leaderboard);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Tournament routes
  app.post("/api/tournaments", async (req, res) => {
    try {
      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(validatedData);
      
      res.status(201).json(tournament);
    } catch (error) {
      console.error("Create tournament error:", error);
      res.status(400).json({ message: "Invalid tournament data" });
    }
  });

  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournaments = await storage.getAllTournaments();
      res.status(200).json(tournaments);
    } catch (error) {
      console.error("Get tournaments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tournament ID" });
      }
      
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      res.status(200).json(tournament);
    } catch (error) {
      console.error("Get tournament error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/tournaments/:id/register", async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tournamentId = parseInt(req.params.id);
      
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: "Invalid tournament ID" });
      }
      
      const tournament = await storage.getTournament(tournamentId);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      // Check if user is already registered
      const userTournaments = await storage.getUserTournaments(req.session.userId);
      const alreadyRegistered = userTournaments.some(ut => ut.tournament.id === tournamentId);
      
      if (alreadyRegistered) {
        return res.status(400).json({ message: "Already registered for this tournament" });
      }
      
      const registrationData = {
        tournamentId,
        userId: req.session.userId,
        registrationDate: new Date(),
        status: "registered"
      };
      
      const registration = await storage.registerUserForTournament(registrationData);
      
      res.status(201).json(registration);
    } catch (error) {
      console.error("Register for tournament error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/tournaments/:id/checkin", async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tournamentId = parseInt(req.params.id);
      
      if (isNaN(tournamentId)) {
        return res.status(400).json({ message: "Invalid tournament ID" });
      }
      
      const checkedIn = await storage.checkInUserToTournament(req.session.userId, tournamentId);
      
      if (!checkedIn) {
        return res.status(404).json({ message: "Tournament registration not found" });
      }
      
      res.status(200).json(checkedIn);
    } catch (error) {
      console.error("Tournament check-in error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tournaments/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const userTournaments = await storage.getUserTournaments(userId);
      
      res.status(200).json(userTournaments);
    } catch (error) {
      console.error("Get user tournaments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Match routes
  app.post("/api/matches", async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validatedData);
      
      res.status(201).json(match);
    } catch (error) {
      console.error("Create match error:", error);
      res.status(400).json({ message: "Invalid match data" });
    }
  });

  app.get("/api/matches/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const matches = await storage.getUserMatches(userId);
      
      res.status(200).json(matches);
    } catch (error) {
      console.error("Get user matches error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/matches/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const matches = await storage.getRecentMatches(limit);
      
      res.status(200).json(matches);
    } catch (error) {
      console.error("Get recent matches error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      
      res.status(200).json(achievements);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/achievements/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const userAchievements = await storage.getUserAchievements(userId);
      
      res.status(200).json(userAchievements);
    } catch (error) {
      console.error("Get user achievements error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/achievements/user/:userId/recent", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const recentAchievements = await storage.getRecentAchievements(userId, limit);
      
      res.status(200).json(recentAchievements);
    } catch (error) {
      console.error("Get recent achievements error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // XP Code routes
  app.post("/api/xp-codes", async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const code = nanoid(8).toUpperCase();
      const xpCodeData = {
        ...req.body,
        code,
        createdBy: req.session.userId,
        isUsed: false
      };
      
      const validatedData = insertXpCodeSchema.parse(xpCodeData);
      const xpCode = await storage.createXpCode(validatedData);
      
      res.status(201).json(xpCode);
    } catch (error) {
      console.error("Create XP code error:", error);
      res.status(400).json({ message: "Invalid XP code data" });
    }
  });

  app.post("/api/xp-codes/redeem", async (req, res) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const xpCode = await storage.getXpCodeByCode(code);
      
      if (!xpCode) {
        return res.status(404).json({ message: "Invalid code" });
      }
      
      if (xpCode.isUsed) {
        return res.status(400).json({ message: "Code has already been used" });
      }
      
      if (xpCode.expiryDate && new Date(xpCode.expiryDate) < new Date()) {
        return res.status(400).json({ message: "Code has expired" });
      }
      
      const alreadyRedeemed = await storage.isCodeRedeemedByUser(req.session.userId, code);
      
      if (alreadyRedeemed) {
        return res.status(400).json({ message: "You have already redeemed this code" });
      }
      
      const redemption = await storage.redeemXpCode({
        userId: req.session.userId,
        codeId: xpCode.id,
        redeemedDate: new Date()
      });
      
      // Get updated user with new XP
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        redemption,
        xpValue: xpCode.xpValue,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Redeem XP code error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
