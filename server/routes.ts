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
  redeemCodeSchema,
  insertMatchSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { generatePassportId, validatePassportId } from "./utils/passport-id";

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
    new LocalStrategy({
      usernameField: 'identifier', // Use the 'identifier' field from the login request
      passwordField: 'password'
    }, async (identifier, password, done) => {
      try {
        // Try to find user by either username or email
        const user = await storage.getUserByIdentifier(identifier);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        // Verify password
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
      console.log("Registration payload:", JSON.stringify(req.body));
      
      // Validate the full registration data (including password confirmation)
      const registrationData = await (async () => {
        try {
          const data = registerUserSchema.parse(req.body);
          
          // Check if username already exists
          const existingUser = await storage.getUserByUsername(data.username);
          if (existingUser) {
            res.status(400).json({ message: "Username already exists" });
            return null;
          }
          return data;
        } catch (validationError) {
          console.error("Validation error:", validationError);
          throw validationError;
        }
      })();
      
      // If validation failed or user already exists, exit early
      if (!registrationData) return;

      // Hash the password
      const hashedPassword = await bcrypt.hash(registrationData.password, 10);
      
      // Generate a unique passport ID
      const passportId = await generatePassportId();
      
      // Generate avatar initials from display name (first letter of each word, up to 2)
      const nameParts = registrationData.displayName.trim().split(/\s+/);
      const avatarInitials = nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : (nameParts[0].length > 1 
            ? (nameParts[0][0] + nameParts[0][1]).toUpperCase() 
            : nameParts[0][0].toUpperCase());
      
      // Create the user with hashed password, removing the confirmPassword field
      // Extract only the fields needed for the database and replace with hashed password
      const newUser = await storage.createUser({
        username: registrationData.username,
        email: registrationData.email,
        password: hashedPassword,
        displayName: registrationData.displayName,
        passportId, // Add the passport ID
        yearOfBirth: registrationData.yearOfBirth || null,
        location: registrationData.location || null,
        playingSince: registrationData.playingSince || null,
        skillLevel: registrationData.skillLevel || null,
        level: registrationData.level || 1,
        xp: registrationData.xp || 0,
        avatarInitials: avatarInitials,
        totalMatches: registrationData.totalMatches || 0,
        matchesWon: registrationData.matchesWon || 0,
        totalTournaments: registrationData.totalTournaments || 0
      });

      // Remove password from the response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof ZodError) {
        console.error("Validation errors:", error.errors);
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Failed to register user:", error instanceof Error ? error.message : String(error));
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
  
  // Profile operations
  app.get("/api/profile/completion", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const percentage = await storage.calculateProfileCompletion(req.user.id);
    const completedFields = await storage.getCompletedProfileFields(req.user.id);
    
    // Field name mapping for more user-friendly display
    const fieldNameMapping: Record<string, string> = {
      'bio': 'Bio',
      'location': 'Location',
      'skillLevel': 'Skill Level',
      'playingSince': 'Playing Since',
      'preferredPosition': 'Court Position',
      'paddleBrand': 'Paddle Brand',
      'paddleModel': 'Paddle Model',
      'playingStyle': 'Playing Style',
      'shotStrengths': 'Shot Strengths',
      'preferredFormat': 'Game Format',
      'dominantHand': 'Dominant Hand',
      'regularSchedule': 'Playing Schedule',
      'lookingForPartners': 'Partner Status',
      'partnerPreferences': 'Partner Preferences',
      'playerGoals': 'Goals',
      'coach': 'Coach',
      'clubs': 'Clubs',
      'leagues': 'Leagues',
      'socialHandles': 'Social Media',
      'mobilityLimitations': 'Mobility Considerations',
      'preferredMatchDuration': 'Match Duration',
      'fitnessLevel': 'Fitness Level'
    };
    
    // Get all possible profile fields
    const allFields = Object.keys(fieldNameMapping);
    
    // Determine incomplete fields
    const incompleteFields = allFields.filter(field => !completedFields.includes(field));
    
    // Map the field names to their user-friendly versions
    const mappedCompletedFields = completedFields.map(field => fieldNameMapping[field] || field);
    const mappedIncompleteFields = incompleteFields.map(field => fieldNameMapping[field] || field);
    
    res.json({
      completionPercentage: percentage,
      completedFields: mappedCompletedFields,
      incompleteFields: mappedIncompleteFields,
      xpEarned: 0, // Will be calculated in a future implementation
      potentialXp: 250 // Total possible XP for completing profile
    });
  });
  
  app.patch("/api/profile/update", isAuthenticated, async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      // Get the current user data to compare later for XP rewards
      const oldUser = await storage.getUser(req.user.id);
      if (!oldUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update the user's profile
      const updatedUser = await storage.updateUserProfile(req.user.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: "Failed to update profile" });
      }
      
      // Check if profile completion crossed a threshold to award XP
      const oldCompletion = oldUser.profileCompletionPct || 0;
      const newCompletion = updatedUser.profileCompletionPct || 0;
      
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
      console.error('Error updating profile:', error);
      res.status(500).json({ error: "Failed to update profile" });
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
  
  // Get user by passport ID
  app.get("/api/passport/:passportId", async (req: Request, res: Response) => {
    try {
      const { passportId } = req.params;
      
      // Validate passport ID format
      if (!passportId || !validatePassportId(passportId)) {
        return res.status(400).json({ message: "Invalid passport ID format" });
      }
      
      const user = await storage.getUserByPassportId(passportId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return limited public info for the passport ID lookup
      const publicUserInfo = {
        id: user.id,
        displayName: user.displayName,
        passportId: user.passportId,
        avatarInitials: user.avatarInitials,
        level: user.level,
        rankingPoints: user.rankingPoints
      };
      
      res.json(publicUserInfo);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user by passport ID" });
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
      const { tournamentId, passportId } = req.body;
      
      if (!tournamentId) {
        return res.status(400).json({ message: "Tournament ID is required" });
      }
      
      if (!passportId) {
        return res.status(400).json({ message: "Passport ID is required" });
      }
      
      // Verify the tournament exists
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      // Find user by passport ID
      const user = await storage.getUserByPassportId(passportId);
      if (!user) {
        return res.status(404).json({ message: "User not found. Invalid passport ID" });
      }
      
      // Check if user is registered for the tournament
      const registration = await storage.getTournamentRegistration(user.id, tournamentId);
      if (!registration) {
        return res.status(400).json({ message: "User is not registered for this tournament" });
      }
      
      // Check if already checked in
      if (registration.checkedIn) {
        return res.status(400).json({ message: "User is already checked in to this tournament" });
      }
      
      // Check-in the user
      const updatedRegistration = await storage.checkInUserForTournament(user.id, tournamentId);
      
      if (!updatedRegistration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      // Create an activity record for the check-in
      await storage.createActivity({
        userId: user.id,
        type: "tournament_check_in",
        description: `Checked in to tournament: ${tournament.name}`,
        xpEarned: 50, // Award some XP for checking in
        metadata: { tournamentId, tournamentName: tournament.name }
      });
      
      res.json(updatedRegistration);
    } catch (error) {
      console.error("Error checking in user:", error);
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
      
      console.log(`[redemption] Attempting to redeem code: ${code} for user ID: ${userId}`);
      
      // Find the redemption code
      const redemptionCode = await storage.getRedemptionCodeByCode(code);
      
      console.log(`[redemption] Code lookup result:`, redemptionCode);
      
      if (!redemptionCode) {
        console.log(`[redemption] Code not found: ${code}`);
        return res.status(404).json({ message: "Invalid or expired code" });
      }
      
      // Check if code is active
      if (!redemptionCode.isActive) {
        return res.status(400).json({ message: "This code is no longer active" });
      }
      
      // Check if the code has expired
      if (redemptionCode.expiresAt && new Date(redemptionCode.expiresAt) < new Date()) {
        return res.status(400).json({ message: "This code has expired" });
      }
      
      // Check if the code has reached its maximum number of redemptions
      const currentRedemptions = redemptionCode.currentRedemptions || 0;
      if (redemptionCode.maxRedemptions && redemptionCode.maxRedemptions <= currentRedemptions) {
        return res.status(400).json({ message: "This code has reached its maximum number of redemptions" });
      }
      
      // Check if user has already redeemed this code
      const hasRedeemed = await storage.hasUserRedeemedCode(userId, redemptionCode.id);
      
      if (hasRedeemed) {
        return res.status(400).json({ message: "Code already redeemed" });
      }
      
      // Get the code type and founding status
      const codeType = redemptionCode.codeType || 'xp';  // Default to 'xp' if not specified
      const isFoundingMemberCode = redemptionCode.isFoundingMemberCode || codeType === 'founding';
      
      // Update redemption code counter
      await storage.incrementRedemptionCodeCounter(redemptionCode.id);
      
      // Redeem the code
      await storage.redeemCode({
        userId,
        codeId: redemptionCode.id
      });
      
      let updatedUser;
      let message = '';
      let activityType = 'code_redemption';
      let activityDescription = `Redeemed code: ${redemptionCode.description || code}`;
      
      // Handle different code types
      switch (codeType) {
        case 'founding':
          // Update founding member status
          await storage.updateUser(userId, {
            isFoundingMember: true,
            xpMultiplier: 110 // 1.1x multiplier (stored as percentage)
          });
          
          // Add XP to user
          updatedUser = await storage.updateUserXP(userId, redemptionCode.xpReward);
          
          message = `Congratulations! You are now a Founding Member with a permanent 1.1x XP boost!`;
          activityType = 'founding_member';
          activityDescription = 'Became a Founding Member!';
          break;
          
        case 'coach':
          // Grant coach access if this is a coach access code
          if (redemptionCode.isCoachAccessCode) {
            // Create/update coaching profile
            const coachingProfile = await storage.getCoachingProfile(userId);
            
            if (!coachingProfile) {
              await storage.createCoachingProfile({
                userId,
                accessType: 'code',
                isActive: true
              });
            } else {
              await storage.updateCoachingProfile(userId, { 
                accessType: 'code',
                isActive: true
              });
            }
            
            // Add XP as well
            updatedUser = await storage.updateUserXP(userId, redemptionCode.xpReward);
            
            message = `Congratulations! You now have coach access to the platform!`;
            activityType = 'coach_access_granted';
            activityDescription = 'Gained coach access to platform';
          } else {
            // If not a proper coach code, just add XP
            updatedUser = await storage.updateUserXP(userId, redemptionCode.xpReward);
            message = `Successfully redeemed code for ${redemptionCode.xpReward} XP`;
          }
          break;
          
        case 'xp':
        default:
          // Just add XP for regular codes
          updatedUser = await storage.updateUserXP(userId, redemptionCode.xpReward);
          message = `Successfully redeemed code for ${redemptionCode.xpReward} XP`;
          break;
      }
      
      // Create an activity for this redemption
      await storage.createActivity({
        userId,
        type: activityType,
        description: activityDescription,
        xpEarned: redemptionCode.xpReward,
        metadata: { code, codeType }
      });
      
      // Remove password from the response
      const { password, ...userWithoutPassword } = updatedUser!;
      
      res.json({
        message,
        user: userWithoutPassword,
        xpEarned: redemptionCode.xpReward,
        isFoundingMember: isFoundingMemberCode,
        codeType
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error('[redemption] Error redeeming code:', error);
        res.status(500).json({ message: "Error redeeming code" });
      }
    }
  });

  // Leaderboard routes
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
  
  app.get("/api/redemption-codes", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      if (!(req.user as any).isAdmin) {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      const codes = await storage.getAllRedemptionCodes();
      res.json(codes);
    } catch (error) {
      console.error('[getAllRedemptionCodes] Error:', error);
      res.status(500).json({ message: "Failed to fetch redemption codes" });
    }
  });

  // Ranking leaderboard route (sorted by ranking points instead of XP)
  app.get("/api/ranking-leaderboard", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const leaderboard = await storage.getRankingLeaderboard(limit);
      
      // Remove passwords from the response
      const leaderboardWithoutPasswords = leaderboard.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(leaderboardWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving ranking leaderboard" });
    }
  });
  
  // Get user ranking history
  app.get("/api/user/ranking-history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const rankingHistory = await storage.getUserRankingHistory(userId, limit);
      res.json(rankingHistory);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving ranking history" });
    }
  });
  
  // Record match result and update ranking points
  app.post("/api/matches", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      
      // Determine winner from scores before validation
      let winnerId;
      const playerOneScore = parseInt(req.body.scorePlayerOne);
      const playerTwoScore = parseInt(req.body.scorePlayerTwo);
      winnerId = playerOneScore > playerTwoScore ? req.body.playerOneId : req.body.playerTwoId;
      
      // Validate match data against our schema
      const matchData = insertMatchSchema.parse({
        ...req.body,
        // Set default values for optional fields if not provided
        playerOnePartnerId: req.body.playerOnePartnerId || undefined,
        playerTwoPartnerId: req.body.playerTwoPartnerId || undefined,
        formatType: req.body.formatType || "singles",
        scoringSystem: req.body.scoringSystem || "traditional",
        pointsToWin: req.body.pointsToWin || 11,
        matchType: "casual", // Always casual for this version
        notes: req.body.notes || null,
        location: req.body.location || null,
        pointsAwarded: 10, // Fixed points for casual matches
        xpAwarded: 25, // Standard XP for playing a match
        winnerId: winnerId // Set winner based on scores
      });
      
      // Ensure the current user is either player one or player one's partner
      if (matchData.playerOneId !== userId && matchData.playerOnePartnerId !== userId) {
        return res.status(400).json({ 
          message: "Current user must be player one or player one's partner" 
        });
      }
      
      // Winner is already determined before validation
      
      const loserId = matchData.winnerId === matchData.playerOneId ? matchData.playerTwoId : matchData.playerOneId;
      
      // Create the match record
      const match = await storage.createMatch({
        ...matchData,
        pointsAwarded: 10, // Fixed points for casual matches
        xpAwarded: 25 // Standard XP for playing a match
      });
      
      // Fixed points for casual matches
      const pointsForWinner = 10;
      
      // Update winner's ranking points and create ranking history
      const updatedWinner = await storage.updateUserRankingPoints(matchData.winnerId, pointsForWinner);
      
      // Get the old and new ranking
      const oldRanking = (updatedWinner?.rankingPoints || 0) - pointsForWinner;
      const newRanking = updatedWinner?.rankingPoints || 0;
      
      // Determine opponent(s) for the ranking history reason text
      let opponentText = `player #${loserId}`;
      if (matchData.formatType === "doubles") {
        opponentText = `players #${loserId}${matchData.playerTwoPartnerId ? ` and #${matchData.playerTwoPartnerId}` : ''}`;
      }
      
      await storage.recordRankingChange({
        userId: matchData.winnerId,
        oldRanking,
        newRanking,
        reason: `Won casual ${matchData.formatType} match against ${opponentText}`,
        matchId: match.id
      });
      
      // Update match counts for the current user
      const isWinner = userId === matchData.winnerId;
      
      await storage.updateUser(userId, {
        totalMatches: (req.user as any).totalMatches + 1,
        matchesWon: isWinner ? (req.user as any).matchesWon + 1 : (req.user as any).matchesWon
      });
      
      // Create activity for the user recording the match
      await storage.createActivity({
        userId,
        type: "match_played",
        description: isWinner ? "Won a match" : "Played a match",
        xpEarned: 25, // Award XP for playing a match regardless of outcome
        metadata: { matchId: match.id }
      });
      
      // Update user XP
      await storage.updateUserXP(userId, 25);
      
      res.status(201).json({
        match,
        pointsAwarded: pointsForWinner,
        xpAwarded: 25
      });
    } catch (error) {
      console.error("Error recording match:", error);
      res.status(500).json({ message: "Error recording match" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
