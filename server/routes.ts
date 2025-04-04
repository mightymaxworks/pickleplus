import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { 
  insertUserSchema,
  registerUserSchema,
  loginSchema, 
  insertTournamentRegistrationSchema, 
  redeemCodeSchema 
} from "@shared/schema";
import { ZodError } from "zod";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "pickle-plus-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Set up passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Define passport strategies
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        // In a real app, use proper password hashing like bcrypt
        // For this demo, we're comparing directly (not recommended in production)
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        // Remove password before returning user object
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      // Remove password before returning user object
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate the full registration data (including password confirmation)
      const registrationData = registerUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(registrationData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(registrationData.password, 10);
      
      // Create the user with hashed password, removing the confirmPassword field
      // Extract only the fields needed for the database and replace with hashed password
      const newUser = await storage.createUser({
        username: registrationData.username,
        password: hashedPassword,
        displayName: registrationData.displayName,
        location: registrationData.location || null,
        playingSince: registrationData.playingSince || null,
        skillLevel: registrationData.skillLevel || null,
        level: registrationData.level || 1,
        xp: registrationData.xp || 0,
        avatarInitials: registrationData.avatarInitials,
        totalMatches: registrationData.totalMatches || 0,
        matchesWon: registrationData.matchesWon || 0,
        totalTournaments: registrationData.totalTournaments || 0
      });

      // Remove password from the response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next: any) => {
    try {
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Authentication failed" });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.json(user);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Login error" });
      }
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/current-user", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not logged in" });
    }
  });

  // User routes
  app.get("/api/users/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from the response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user" });
    }
  });

  // Tournament routes
  app.get("/api/tournaments", async (req: Request, res: Response) => {
    try {
      const tournaments = await storage.getAllTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving tournaments" });
    }
  });

  app.get("/api/tournaments/:id", async (req: Request, res: Response) => {
    try {
      const tournament = await storage.getTournament(parseInt(req.params.id));
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving tournament" });
    }
  });

  // Tournament registration routes
  app.post("/api/tournament-registrations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const registrationData = insertTournamentRegistrationSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if user is already registered
      const existingRegistration = await storage.getTournamentRegistration(
        registrationData.userId, 
        registrationData.tournamentId
      );
      
      if (existingRegistration) {
        return res.status(400).json({ message: "Already registered for this tournament" });
      }
      
      const registration = await storage.registerForTournament(registrationData);
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error registering for tournament" });
      }
    }
  });

  app.get("/api/user/tournaments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const userTournaments = await storage.getUserTournaments(userId);
      res.json(userTournaments);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user tournaments" });
    }
  });

  app.post("/api/tournament-check-in", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { tournamentId } = req.body;
      
      if (!tournamentId) {
        return res.status(400).json({ message: "Tournament ID is required" });
      }
      
      const registration = await storage.checkInUserForTournament(userId, tournamentId);
      
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json(registration);
    } catch (error) {
      res.status(500).json({ message: "Error checking in to tournament" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (req: Request, res: Response) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving achievements" });
    }
  });

  app.get("/api/user/achievements", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user achievements" });
    }
  });

  // Activity routes
  app.get("/api/user/activities", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user activities" });
    }
  });

  // Redemption code routes
  app.post("/api/redeem-code", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { code } = redeemCodeSchema.parse(req.body);
      
      // Find the redemption code
      const redemptionCode = await storage.getRedemptionCodeByCode(code);
      
      if (!redemptionCode) {
        return res.status(404).json({ message: "Invalid or expired code" });
      }
      
      // Check if user has already redeemed this code
      const hasRedeemed = await storage.hasUserRedeemedCode(userId, redemptionCode.id);
      
      if (hasRedeemed) {
        return res.status(400).json({ message: "Code already redeemed" });
      }
      
      // Redeem the code
      await storage.redeemCode({
        userId,
        codeId: redemptionCode.id
      });
      
      // Add XP to user
      const updatedUser = await storage.updateUserXP(userId, redemptionCode.xpReward);
      
      // Create an activity for this redemption
      await storage.createActivity({
        userId,
        type: "code_redemption",
        description: `Redeemed code: ${redemptionCode.description || code}`,
        xpEarned: redemptionCode.xpReward,
        metadata: { code }
      });
      
      // Remove password from the response
      const { password, ...userWithoutPassword } = updatedUser!;
      
      res.json({
        message: `Successfully redeemed code for ${redemptionCode.xpReward} XP`,
        user: userWithoutPassword,
        xpEarned: redemptionCode.xpReward
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error redeeming code" });
      }
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const leaderboard = await storage.getLeaderboard(limit);
      
      // Remove passwords from the response
      const leaderboardWithoutPasswords = leaderboard.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(leaderboardWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
