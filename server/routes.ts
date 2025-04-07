import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, hashPassword } from "./auth";
import { 
  insertTournamentRegistrationSchema, 
  redeemCodeSchema,
  insertMatchSchema,
  insertRedemptionCodeSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { generatePassportId, validatePassportId } from "./utils/passport-id";
import { xpService } from "./services";

// Import CourtIQ and XP systems
import { courtIQService as courtIQSystem } from "./modules/rating/courtiq";
import { xpSystem } from "./modules/xp/xpSystem";
import { multiDimensionalRankingService } from "./modules/ranking/service";

// Import database and query helpers
import { db } from "./db";
import { eq, and, or, sql, desc, asc, inArray, lt, between } from "drizzle-orm";
import { 
  playerRatings, 
  ratingHistory,
  rankingPoints,
  seasons, 
  ratingTiers 
} from "../shared/courtiq-schema";

// Import multi-dimensional ranking types
import {
  PlayFormat,
  AgeDivision,
  PlayerRanking
} from "../shared/multi-dimensional-rankings";

// Define enums for validation
const playFormat = {
  enumValues: ['singles', 'doubles', 'mixed'] as PlayFormat[]
};

const ageDivision = {
  enumValues: ['U12', 'U14', 'U16', 'U19', '19plus', '35plus', '50plus', '60plus', '70plus'] as AgeDivision[]
};

// Session handling is now in auth.ts

export async function registerRoutes(app: Express): Promise<Server> {
  // Trust proxy - important for secure cookies in production
  app.set('trust proxy', 1);

  // Set up authentication (including session, passport initialization, and strategies)
  // This will set up the following routes:
  // - POST /api/auth/register
  // - POST /api/auth/login
  // - POST /api/auth/logout
  // - GET /api/auth/current-user
  setupAuth(app);
  
  // Add a logging middleware for debugging authentication
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/auth')) {
      console.log(`${req.method} ${req.path} - Session ID: ${req.sessionID}`);
      console.log(`Is authenticated: ${req.isAuthenticated()}`);
    }
    next();
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
  
  // XP tier information - user level and XP
  app.get("/api/user/xp-tier", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      
      // Get detailed XP info from our XP system
      const xpDetails = await xpSystem.getUserLevelDetails(userId);
      res.json(xpDetails);
    } catch (error) {
      console.error("Error retrieving XP tier information:", error);
      res.status(500).json({ message: "Error retrieving XP tier information" });
    }
  });
  
  // Get XP tier for any user (public facing with less detail)
  app.get("/api/user/xp-tier/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get basic XP info
      const level = await xpSystem.getUserLevel(userId);
      const xp = await xpSystem.getUserXP(userId);
      const levelDetails = xpSystem.getLevelDetails(level);
      
      res.json({
        level,
        xp,
        levelName: levelDetails.name
      });
    } catch (error) {
      console.error("Error retrieving user XP information:", error);
      res.status(500).json({ message: "Error retrieving user XP information" });
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
  
  // QR Code Connection - Parse connection QR code and get user info
  app.get("/api/connect/:passportId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { passportId } = req.params;
      const { token } = req.query;
      
      if (!passportId || !token) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Validate passport ID format
      if (!validatePassportId(passportId)) {
        return res.status(400).json({ message: "Invalid passport ID format" });
      }
      
      // Validate the token (in a real app, this would be a more secure validation)
      try {
        const decodedToken = Buffer.from(token as string, 'base64').toString();
        const [tokenPassportId, timestamp] = decodedToken.split(':');
        
        // Check if token is valid
        if (tokenPassportId !== passportId) {
          return res.status(400).json({ error: 'Invalid token' });
        }
        
        // Check if token is expired (tokens valid for 5 minutes)
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        if (now - tokenTime > 5 * 60 * 1000) {
          return res.status(400).json({ error: 'Token expired' });
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid token format' });
      }
      
      // Get user by passport ID
      const user = await storage.getUserByPassportId(passportId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't return sensitive user data
      const safeUser = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        skillLevel: user.skillLevel,
        avatarInitials: user.avatarInitials,
        passportId: user.passportId,
        level: user.level
      };
      
      res.status(200).json(safeUser);
    } catch (error) {
      console.error('Error processing connect request:', error);
      res.status(500).json({ error: 'Internal server error' });
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

  // Check tournament eligibility based on player ratings and ranking points
  app.get("/api/tournament/eligibility", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { tournamentId } = req.query;
      
      if (!tournamentId) {
        return res.status(400).json({ message: "Tournament ID is required" });
      }
      
      // Get the tournament
      const tournament = await storage.getTournament(Number(tournamentId));
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      // Get user details including age for age division checks
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Determine player age (default to 30 if yearOfBirth is not set)
      const currentYear = new Date().getFullYear();
      const playerAge = user.yearOfBirth ? currentYear - user.yearOfBirth : 30;
      
      let eligibilityResults;
      
      try {
        // Check eligibility using CourtIQ system
        eligibilityResults = await courtIQSystem.checkTournamentEligibility({
          userId,
          tournamentId: Number(tournamentId),
          tournamentLevel: tournament.level || 'local',
          division: tournament.ageDivision || 'open',
          format: tournament.format || 'singles',
          playerAge,
          // Tournament-specific requirements can be passed here
          minimumRating: tournament.minimumRating, 
          minimumPoints: tournament.minimumPoints,
          tournamentTier: tournament.tier || 'standard'
        });
      } catch (eligibilityError) {
        console.error("Error checking eligibility via CourtIQ:", eligibilityError);
        // Fallback to basic eligibility check
        eligibilityResults = {
          eligible: true,  // Default to eligible if CourtIQ check fails
          pathways: ['system_fallback'],
          currentRating: null,
          currentPoints: null,
          ratingRequirement: tournament.minimumRating || 0,
          pointsRequirement: tournament.minimumPoints || 0,
          message: "Basic eligibility check passed. Advanced criteria could not be verified."
        };
      }
      
      res.json(eligibilityResults);
    } catch (error) {
      console.error("Error checking tournament eligibility:", error);
      res.status(500).json({ message: "Error checking tournament eligibility" });
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
      
      // Verify eligibility before check-in (if tournament requires it)
      if (tournament.enforceEligibility) {
        try {
          // Calculate player age for age-based divisions
          const currentYear = new Date().getFullYear();
          const playerAge = user.yearOfBirth ? currentYear - user.yearOfBirth : 30; // Default to 30 if not set
          
          // Check eligibility using the CourtIQ system
          const eligibilityCheck = await courtIQSystem.checkTournamentEligibility({
            userId: user.id,
            tournamentId,
            tournamentLevel: tournament.level || 'local',
            division: tournament.ageDivision || 'open',
            format: tournament.format || 'singles',
            playerAge,
            minimumRating: tournament.minimumRating,
            minimumPoints: tournament.minimumPoints,
            tournamentTier: tournament.tier || 'standard'
          });
          
          // If not eligible, prevent check-in
          if (!eligibilityCheck.eligible) {
            return res.status(403).json({
              message: "Player does not meet the eligibility requirements for this tournament",
              eligibilityDetails: eligibilityCheck
            });
          }
        } catch (eligibilityError) {
          console.error("Error checking eligibility for tournament check-in:", eligibilityError);
          // Continue with check-in if eligibility check fails to avoid blocking users
        }
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
          
        case 'multiplier':
          // Calculate expiration date based on duration
          const multiplierDurationDays = redemptionCode.multiplierDurationDays || 7; // Default to 7 days
          const multiplierValue = redemptionCode.multiplierValue || 150; // Default to 150% (1.5x)
          const multiplierExpiresAt = new Date();
          multiplierExpiresAt.setDate(multiplierExpiresAt.getDate() + multiplierDurationDays);
          
          // Update the user redemption with multiplier details
          await storage.updateUserRedemption(userId, redemptionCode.id, {
            multiplierExpiresAt,
            isMultiplierActive: true
          });
          
          // Add XP to user (if any XP reward in addition to the multiplier)
          updatedUser = await storage.updateUserXP(userId, redemptionCode.xpReward);
          
          // Set temporary XP multiplier for the user
          await storage.updateUser(userId, {
            temporaryXpMultiplier: multiplierValue,
            temporaryXpMultiplierExpiresAt: multiplierExpiresAt
          });
          
          message = `Congratulations! You've activated a ${multiplierValue/100}x XP multiplier for ${multiplierDurationDays} days!`;
          activityType = 'xp_multiplier_activated';
          activityDescription = `Activated ${multiplierValue/100}x XP multiplier for ${multiplierDurationDays} days`;
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
  
  // Admin dashboard stats endpoint
  app.get("/api/admin/dashboard", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Fetch various stats for the dashboard
      const userCount = await storage.getUserCount();
      const activeUserCount = await storage.getActiveUserCount(); // Users active in the last 30 days
      const activeCodesCount = await storage.getActiveRedemptionCodesCount();
      const totalXpAwarded = await storage.getTotalXpAwarded();
      const recentlyRedeemedCodes = await storage.getRecentlyRedeemedCodes(5);
      
      // Return all stats
      res.json({
        userCount,
        activeUserCount,
        activeCodesCount,
        totalXpAwarded,
        recentlyRedeemedCodes
      });
    } catch (error) {
      console.error('[adminDashboard] Error:', error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });
  
  // Admin User Management Endpoints
  
  // Get users with pagination, filtering and sorting
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sortBy = req.query.sortBy as string || "createdAt";
      const sortDir = req.query.sortDir === "asc" ? "asc" : "desc";
      const search = req.query.search as string || "";
      const filter = req.query.filter as string || "";
      
      const result = await storage.getUsers({
        page,
        limit,
        sortBy,
        sortDir,
        search,
        filter
      });
      
      // Remove sensitive data like passwords from the response
      const usersWithoutPasswords = result.users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json({
        users: usersWithoutPasswords,
        totalUsers: result.totalUsers,
        totalPages: Math.ceil(result.totalUsers / limit),
        currentPage: page
      });
    } catch (error) {
      console.error('[adminGetUsers] Error:', error);
      res.status(500).json({ message: "Error retrieving users" });
    }
  });
  
  // Get a single user with detailed information
  app.get("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get additional user data
      const activities = await storage.getUserActivities(id, 10);
      const achievements = await storage.getUserAchievements(id);
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        activities,
        achievements
      });
    } catch (error) {
      console.error('[adminGetUser] Error:', error);
      res.status(500).json({ message: "Error retrieving user details" });
    }
  });
  
  // Update a user's information (admin)
  app.patch("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // These are the fields that can be updated by an admin
      const { 
        displayName, email, isAdmin: makeAdmin, isCoach, hasCoachAccess,
        isActive, isFoundingMember, level, xp, rankingPoints
      } = req.body;
      
      // Create update object with only the fields that were provided
      const updates: Record<string, any> = {};
      
      if (displayName !== undefined) updates.displayName = displayName;
      if (email !== undefined) updates.email = email;
      if (makeAdmin !== undefined) updates.isAdmin = makeAdmin;
      if (isCoach !== undefined) updates.isCoach = isCoach;
      if (hasCoachAccess !== undefined) updates.hasCoachAccess = hasCoachAccess;
      if (isActive !== undefined) updates.isActive = isActive;
      if (isFoundingMember !== undefined) updates.isFoundingMember = isFoundingMember;
      if (level !== undefined) updates.level = level;
      if (xp !== undefined) updates.xp = xp;
      if (rankingPoints !== undefined) updates.rankingPoints = rankingPoints;
      
      // Update the user
      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Create an admin activity log
      await storage.createActivity({
        userId: (req.user as any).id,
        type: "admin_user_update",
        description: `Updated user ${updatedUser.username}`,
        xpEarned: 0,
        metadata: { 
          targetUserId: id,
          updatedFields: Object.keys(updates)
        }
      });
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('[adminUpdateUser] Error:', error);
      res.status(500).json({ message: "Error updating user" });
    }
  });
  
  // Admin only redemption code routes
  app.get("/api/redemption-codes", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const codes = await storage.getAllRedemptionCodes();
      res.json(codes);
    } catch (error) {
      console.error('[getAllRedemptionCodes] Error:', error);
      res.status(500).json({ message: "Failed to fetch redemption codes" });
    }
  });
  
  // Get a single redemption code by ID
  app.get("/api/redemption-codes/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid code ID" });
      }
      
      const code = await storage.getRedemptionCode(id);
      if (!code) {
        return res.status(404).json({ message: "Redemption code not found" });
      }
      
      res.json(code);
    } catch (error) {
      console.error('[getRedemptionCode] Error:', error);
      res.status(500).json({ message: "Failed to retrieve redemption code" });
    }
  });
  
  // Create a new redemption code
  app.post("/api/redemption-codes", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // Validate the input data
      let codeData;
      try {
        codeData = insertRedemptionCodeSchema.parse(req.body);
      } catch (error) {
        return res.status(400).json({ 
          message: "Invalid redemption code data", 
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      // Create the code
      const code = await storage.createRedemptionCode(codeData);
      res.status(201).json(code);
    } catch (error) {
      console.error('[createRedemptionCode] Error:', error);
      res.status(500).json({ message: "Failed to create redemption code" });
    }
  });

  // Update a redemption code
  app.patch("/api/redemption-codes/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid code ID" });
      }
      
      // Get the code first to check if it exists
      const existingCode = await storage.getRedemptionCode(id);
      if (!existingCode) {
        return res.status(404).json({ message: "Redemption code not found" });
      }
      
      // Validate and sanitize the update fields
      const updates = req.body;
      
      // Update the code
      const updatedCode = await storage.updateRedemptionCode(id, updates);
      if (!updatedCode) {
        return res.status(500).json({ message: "Failed to update redemption code" });
      }
      
      res.json(updatedCode);
    } catch (error) {
      console.error('[updateRedemptionCode] Error:', error);
      res.status(500).json({ message: "Failed to update redemption code" });
    }
  });
  
  // Delete a redemption code
  app.delete("/api/redemption-codes/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid code ID" });
      }
      
      // Get the code first to check if it exists
      const existingCode = await storage.getRedemptionCode(id);
      if (!existingCode) {
        return res.status(404).json({ message: "Redemption code not found" });
      }
      
      // Delete the code
      const success = await storage.deleteRedemptionCode(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete redemption code" });
      }
      
      res.json({ message: "Redemption code deleted successfully" });
    } catch (error) {
      console.error('[deleteRedemptionCode] Error:', error);
      res.status(500).json({ message: "Failed to delete redemption code" });
    }
  });

  // CourtIQ ranking leaderboard route
  app.get("/api/ranking-leaderboard", async (req: Request, res: Response) => {
    try {
      // Extract query parameters
      const division = req.query.division as string || 'open'; // 'open', '35+', '50+', etc.
      const format = req.query.format as string || 'singles'; // 'singles', 'doubles', 'mixed'
      const season = req.query.season as string || 'current'; // 'current', 'all-time', '2025-spring', etc.
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const type = req.query.type as string || 'rating'; // 'rating' or 'points'
      const userId = req.isAuthenticated() ? (req.user as any).id : undefined;
      
      // Get leaderboard from CourtIQ system
      const leaderboardData = await courtIQSystem.getLeaderboard({
        division,
        format,
        season,
        type,
        limit,
        currentUserId: userId
      });
      
      res.json(leaderboardData);
    } catch (error) {
      console.error('Error retrieving CourtIQ leaderboard:', error);
      res.status(500).json({ message: "Error retrieving ranking leaderboard" });
    }
  });
  
  // Get available divisions, formats, and seasons for leaderboard filters
  app.get("/api/leaderboard-filters", async (req: Request, res: Response) => {
    try {
      const filters = await courtIQSystem.getLeaderboardFilters();
      res.json(filters);
    } catch (error) {
      console.error('Error retrieving leaderboard filters:', error);
      res.status(500).json({ message: "Error retrieving leaderboard filters" });
    }
  });
  
  // Get user ranking history
  app.get("/api/user/ranking-history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get data from the multi-dimensional ranking system
      // This is now a redirect to the new API endpoint
      try {
        const history = await multiDimensionalRankingService.getUserRankingHistory(userId);
        
        // Take only the most recent entries if limit is specified
        const limitedHistory = limit ? history.slice(0, limit) : history;
        
        // Format the response to maintain backward compatibility with the old API
        const formattedHistory = limitedHistory.map(entry => ({
          id: entry.id,
          userId: entry.userId,
          oldRanking: entry.oldRanking,
          newRanking: entry.newRanking,
          changeDate: entry.createdAt,
          reason: entry.reason,
          matchId: entry.matchId,
          format: entry.format,
          ageDivision: entry.ageDivision,
          ratingTierId: entry.ratingTierId
        }));
        
        res.json(formattedHistory);
      } catch (err) {
        console.error("Error retrieving multi-dimensional ranking history:", err);
        res.status(500).json({ message: "Error retrieving ranking history" });
      }
    } catch (error) {
      console.error("Error retrieving ranking history:", error);
      res.status(500).json({ message: "Error retrieving ranking history" });
    }
  });
  
  // Multi-Dimensional Ranking System API Routes
  
  // Get multi-dimensional ranking leaderboard
  app.get("/api/multi-rankings/leaderboard", async (req: Request, res: Response) => {
    try {
      // Extract query parameters with defaults
      const format = (req.query.format as PlayFormat) || 'singles';
      const ageDiv = (req.query.ageDivision as AgeDivision) || '19plus';
      const ratingTierId = req.query.ratingTierId ? parseInt(req.query.ratingTierId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // Validate parameters
      if (!playFormat.enumValues.includes(format)) {
        return res.status(400).json({ message: "Invalid format. Must be 'singles', 'doubles', or 'mixed'" });
      }
      
      if (!ageDivision.enumValues.includes(ageDiv)) {
        return res.status(400).json({ message: "Invalid age division. Must be one of the valid age divisions" });
      }
      
      const leaderboard = await multiDimensionalRankingService.getLeaderboard(
        format,
        ageDiv,
        ratingTierId,
        limit,
        offset
      );
      
      res.json(leaderboard);
    } catch (error) {
      console.error('Error retrieving multi-dimensional ranking leaderboard:', error);
      res.status(500).json({ message: "Error retrieving multi-dimensional ranking leaderboard" });
    }
  });
  
  // Get user's multi-dimensional ranking position
  app.get("/api/multi-rankings/position", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : (req.user as any).id;
      const format = (req.query.format as PlayFormat) || 'singles';
      const ageDiv = (req.query.ageDivision as AgeDivision) || '19plus';
      const ratingTierId = req.query.ratingTierId ? parseInt(req.query.ratingTierId as string) : undefined;
      
      // Validate parameters
      if (!playFormat.enumValues.includes(format)) {
        return res.status(400).json({ message: "Invalid format. Must be 'singles', 'doubles', or 'mixed'" });
      }
      
      if (!ageDivision.enumValues.includes(ageDiv)) {
        return res.status(400).json({ message: "Invalid age division. Must be one of the valid age divisions" });
      }
      
      const ranking = await multiDimensionalRankingService.getUserRanking(userId, format, ageDiv, ratingTierId);
      const position = await multiDimensionalRankingService.getUserRankingPosition(userId, format, ageDiv, ratingTierId);
      
      res.json({
        userId,
        format,
        ageDivision: ageDiv,
        ratingTierId,
        rankingPoints: ranking?.rankingPoints || 0,
        rank: position.rank,
        totalPlayers: position.total
      });
    } catch (error) {
      console.error('Error retrieving user ranking position:', error);
      res.status(500).json({ message: "Error retrieving user ranking position" });
    }
  });
  
  // Get user's multi-dimensional ranking history
  app.get("/api/multi-rankings/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : (req.user as any).id;
      
      const history = await multiDimensionalRankingService.getUserRankingHistory(userId);
      
      res.json(history);
    } catch (error) {
      console.error('Error retrieving multi-dimensional ranking history:', error);
      res.status(500).json({ message: "Error retrieving multi-dimensional ranking history" });
    }
  });
  
  // Get all available rating tiers
  app.get("/api/multi-rankings/rating-tiers", async (req: Request, res: Response) => {
    try {
      const tiers = await multiDimensionalRankingService.getRatingTiers();
      res.json(tiers);
    } catch (error) {
      console.error('Error retrieving rating tiers:', error);
      res.status(500).json({ message: "Error retrieving rating tiers" });
    }
  });
  
  // Update user's multi-dimensional ranking (admin only)
  app.patch("/api/multi-rankings/update", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, format, ageDivision: ageDiv, ratingTierId, points, reason } = req.body;
      
      if (!userId || !format || !ageDiv || points === undefined) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Validate parameters
      if (!playFormat.enumValues.includes(format)) {
        return res.status(400).json({ message: "Invalid format. Must be 'singles', 'doubles', or 'mixed'" });
      }
      
      if (!ageDivision.enumValues.includes(ageDiv)) {
        return res.status(400).json({ message: "Invalid age division. Must be one of the valid age divisions" });
      }
      
      // Get current ranking
      const currentRanking = await multiDimensionalRankingService.getUserRanking(userId, format, ageDiv, ratingTierId);
      const oldPoints = currentRanking?.rankingPoints || 0;
      
      // Update ranking
      const updatedRanking = await multiDimensionalRankingService.updateUserRanking(
        userId,
        format,
        ageDiv,
        ratingTierId || null,
        points
      );
      
      // Add history entry
      await multiDimensionalRankingService.addRankingHistoryEntry(
        userId,
        format,
        ageDiv,
        ratingTierId || null,
        oldPoints,
        points,
        reason || 'manual_adjustment'
      );
      
      res.json({
        success: true,
        userId,
        format,
        ageDivision: ageDiv,
        ratingTierId,
        oldPoints,
        newPoints: points,
        updatedRanking
      });
    } catch (error) {
      console.error('Error updating user ranking:', error);
      res.status(500).json({ message: "Error updating user ranking" });
    }
  });
  
// Helper function to generate random reasons for ranking changes
function getRandomReason(pointChange: number): string {
  if (pointChange > 0) {
    const reasons = [
      "Won casual singles match",
      "Won tournament match against higher-rated player",
      "Tournament semi-final victory",
      "Local tournament victory",
      "Regional championship match win",
      "Defeated 5-star rated opponent"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  } else {
    const reasons = [
      "Tournament participation",
      "Rating adjustment",
      "Season reset",
      "Inactive period adjustment",
      "Ranking system calibration"
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
}
  
  // Get a user's CourtIQ ratings (with optional filter parameters)
  app.get("/api/user/ratings", async (req: Request, res: Response) => {
    try {
      // Get userId from query or current user
      let userId: number;
      if (req.query.userId) {
        userId = parseInt(req.query.userId as string);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      } else if (req.isAuthenticated()) {
        userId = (req.user as any).id;
      } else {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Extract optional filters
      const division = req.query.division as string;
      const format = req.query.format as string;
      
      // Mock rating data for demonstration
      const mockRatings = [
        {
          id: 1,
          userId: userId,
          format: "Singles",
          rating: 1825,
          tier: "Gold",
          confidenceLevel: 0.85,
          matchesPlayed: 42,
          lastMatchDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          peakRating: 1875,
          allTimeHighRating: 1875,
          currentSeasonHighRating: 1850,
          currentSeasonLowRating: 1780
        },
        {
          id: 2,
          userId: userId,
          format: "Doubles",
          rating: 1950,
          tier: "Diamond",
          confidenceLevel: 0.92,
          matchesPlayed: 78,
          lastMatchDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          peakRating: 2010,
          allTimeHighRating: 2010,
          currentSeasonHighRating: 2010,
          currentSeasonLowRating: 1920
        },
        {
          id: 3,
          userId: userId,
          format: "Mixed Doubles",
          rating: 1890,
          tier: "Platinum",
          confidenceLevel: 0.78,
          matchesPlayed: 36,
          lastMatchDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          peakRating: 1925,
          allTimeHighRating: 1925,
          currentSeasonHighRating: 1925,
          currentSeasonLowRating: 1840
        }
      ];
      
      // Filter by format if provided
      let ratings = mockRatings;
      if (format) {
        ratings = ratings.filter(r => r.format === format);
      }
      
      res.json(ratings);
    } catch (error) {
      console.error('Error retrieving user ratings:', error);
      res.status(500).json({ message: "Error retrieving user ratings" });
    }
  });
  
  // Get a user's CourtIQ rating details for a specific division and format
  app.get("/api/user/rating-detail", async (req: Request, res: Response) => {
    try {
      // Get userId from query or current user
      let userId: number;
      if (req.query.userId) {
        userId = parseInt(req.query.userId as string);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
        }
      } else if (req.isAuthenticated()) {
        userId = (req.user as any).id;
      } else {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Format is required for detailed view
      const format = req.query.format as string;
      
      if (!format) {
        return res.status(400).json({ message: "Format is required" });
      }
      
      // Find the user's rating for the specified format
      const mockRatings = [
        {
          id: 1,
          userId: userId,
          format: "Singles",
          rating: 1825,
          tier: "Gold",
          confidenceLevel: 0.85,
          matchesPlayed: 42,
          lastMatchDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          peakRating: 1875,
          allTimeHighRating: 1875,
          currentSeasonHighRating: 1850,
          currentSeasonLowRating: 1780
        },
        {
          id: 2,
          userId: userId,
          format: "Doubles",
          rating: 1950,
          tier: "Diamond",
          confidenceLevel: 0.92,
          matchesPlayed: 78,
          lastMatchDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          peakRating: 2010,
          allTimeHighRating: 2010,
          currentSeasonHighRating: 2010,
          currentSeasonLowRating: 1920
        },
        {
          id: 3,
          userId: userId,
          format: "Mixed Doubles",
          rating: 1890,
          tier: "Platinum",
          confidenceLevel: 0.78,
          matchesPlayed: 36,
          lastMatchDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          peakRating: 1925,
          allTimeHighRating: 1925,
          currentSeasonHighRating: 1925,
          currentSeasonLowRating: 1840
        }
      ];
      
      // Find the rating for the requested format
      const rating = mockRatings.find(r => r.format === format);
      
      if (!rating) {
        return res.status(404).json({ message: `No rating found for format: ${format}` });
      }
      
      // Generate mock rating history based on the rating data
      const now = new Date();
      const history = [];
      
      // Generate data points going back in time (oldest first)
      const startRating = rating.rating - 100; // Start 100 points below current
      const totalPoints = 10;
      
      for (let i = 0; i < totalPoints; i++) {
        const daysAgo = 90 - (i * 9); // Spread events over 90 days
        const pointDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        
        // Progressive rating increase with occasional dips
        const progress = i / (totalPoints - 1); // 0 to 1
        const randomFactor = Math.random() * 20 - 5; // -5 to +15
        const pointRating = Math.round(startRating + (progress * 100) + randomFactor);
        
        // Calculate change from last point
        const prevRating = i > 0 ? history[i-1].rating : startRating;
        const change = pointRating - prevRating;
        
        history.push({
          date: pointDate.toISOString(),
          rating: pointRating,
          change: change,
          matchId: 1000 + i
        });
      }
      
      // Add the detailed rating with history
      const ratingDetail = {
        ...rating,
        history: history
      };
      
      res.json(ratingDetail);
    } catch (error) {
      console.error('Error retrieving rating detail:', error);
      res.status(500).json({ message: "Error retrieving rating detail" });
    }
  });
  
  // Get all available divisions and formats
  app.get("/api/courtiq/categories", async (req: Request, res: Response) => {
    try {
      // Mock category data
      const mockCategories = {
        divisions: [
          { id: "open", name: "Open", description: "Open to all ages" },
          { id: "35plus", name: "35+", description: "35 years and older" },
          { id: "50plus", name: "50+", description: "50 years and older" },
          { id: "65plus", name: "65+", description: "65 years and older" },
          { id: "u21", name: "Under 21", description: "21 years and younger" }
        ],
        formats: [
          { id: "Singles", name: "Singles", description: "1 vs 1 format" },
          { id: "Doubles", name: "Doubles", description: "2 vs 2 format, same gender" },
          { id: "Mixed Doubles", name: "Mixed Doubles", description: "2 vs 2 format, mixed gender" }
        ]
      };
      
      res.json(mockCategories);
    } catch (error) {
      console.error('Error retrieving CourtIQ categories:', error);
      res.status(500).json({ message: "Error retrieving categories" });
    }
  });
  
  // Get rating tier information
  app.get("/api/courtiq/tiers", async (req: Request, res: Response) => {
    try {
      // Mock rating tiers data
      const mockTiers = [
        {
          id: 1,
          name: "Grand Master",
          order: 1,
          description: "Elite players at the pinnacle of the sport",
          minRating: 2400,
          maxRating: 2500,
          badgeUrl: null,
          colorCode: "#FFD700",
          protectionLevel: 100
        },
        {
          id: 2,
          name: "Master",
          order: 2,
          description: "Exceptional players with advanced skills",
          minRating: 2200,
          maxRating: 2399,
          badgeUrl: null,
          colorCode: "#9C27B0",
          protectionLevel: 80
        },
        {
          id: 3,
          name: "Diamond",
          order: 3,
          description: "Superior players with well-developed strategies",
          minRating: 2000,
          maxRating: 2199,
          badgeUrl: null,
          colorCode: "#3F51B5",
          protectionLevel: 70
        },
        {
          id: 4,
          name: "Platinum",
          order: 4,
          description: "High-performing players with strong fundamentals",
          minRating: 1900,
          maxRating: 1999,
          badgeUrl: null,
          colorCode: "#607D8B",
          protectionLevel: 60
        },
        {
          id: 5,
          name: "Gold",
          order: 5,
          description: "Skilled players with competitive experience",
          minRating: 1800,
          maxRating: 1899,
          badgeUrl: null,
          colorCode: "#FF9800",
          protectionLevel: 50
        },
        {
          id: 6,
          name: "Silver",
          order: 6,
          description: "Competent players with good technique",
          minRating: 1700,
          maxRating: 1799,
          badgeUrl: null,
          colorCode: "#9E9E9E",
          protectionLevel: 40
        },
        {
          id: 7,
          name: "Bronze",
          order: 7,
          description: "Developing players making progress",
          minRating: 1600,
          maxRating: 1699,
          badgeUrl: null,
          colorCode: "#795548",
          protectionLevel: 30
        },
        {
          id: 8,
          name: "Challenger",
          order: 8,
          description: "Players building their skills and understanding",
          minRating: 1500,
          maxRating: 1599,
          badgeUrl: null,
          colorCode: "#4CAF50",
          protectionLevel: 20
        },
        {
          id: 9,
          name: "Contender",
          order: 9,
          description: "Players learning the fundamentals",
          minRating: 1400,
          maxRating: 1499,
          badgeUrl: null,
          colorCode: "#2196F3",
          protectionLevel: 10
        },
        {
          id: 10,
          name: "Rookie",
          order: 10,
          description: "New players starting their journey",
          minRating: 1000,
          maxRating: 1399,
          badgeUrl: null,
          colorCode: "#00BCD4",
          protectionLevel: 0
        }
      ];
      
      res.json(mockTiers);
    } catch (error) {
      console.error('Error retrieving rating tiers:', error);
      res.status(500).json({ message: "Error retrieving rating tiers" });
    }
  });
  
  // Record match result and update CourtIQ ratings
  app.post("/api/matches", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const isAdmin = user.isAdmin === true;
      
      // Check if the user is authorized to record this type of match
      const matchType = req.body.matchType;
      if ((matchType === 'league' || matchType === 'tournament') && !isAdmin) {
        return res.status(403).json({ 
          message: "Only administrators can record league or tournament matches",
          error: "UNAUTHORIZED_MATCH_TYPE"
        });
      }
      
      // Determine winner from scores before validation
      let winnerId;
      const playerOneScore = parseInt(req.body.scorePlayerOne);
      const playerTwoScore = parseInt(req.body.scorePlayerTwo);
      winnerId = playerOneScore > playerTwoScore ? req.body.playerOneId : req.body.playerTwoId;
      
      // Set match date (defaulting to now if not provided)
      const matchDate = req.body.matchDate ? new Date(req.body.matchDate) : new Date();
      
      // Validate match data against our schema
      const matchData = insertMatchSchema.parse({
        ...req.body,
        matchDate,
        winnerId, // Set winner based on scores
        
        // Ensure required fields are present
        playerOneId: req.body.playerOneId,
        playerTwoId: req.body.playerTwoId,
        scorePlayerOne: req.body.scorePlayerOne,
        scorePlayerTwo: req.body.scorePlayerTwo,
        
        // Handle optional fields with defaults
        playerOnePartnerId: req.body.playerOnePartnerId || undefined,
        playerTwoPartnerId: req.body.playerTwoPartnerId || undefined,
        formatType: req.body.formatType || "singles",
        division: req.body.division || "open",
        scoringSystem: req.body.scoringSystem || "traditional",
        pointsToWin: req.body.pointsToWin || 11,
        matchType: req.body.matchType || "casual",
        eventTier: req.body.eventTier || "local",
        notes: req.body.notes || null,
        location: req.body.location || null,
        
        // Tournament context fields
        tournamentId: req.body.tournamentId || undefined,
        roundNumber: req.body.roundNumber,
        stageType: req.body.stageType,
        
        // Convert game scores to JSON if provided
        gameScores: req.body.gameScores ? JSON.stringify(req.body.gameScores) : undefined
      });
      
      // Ensure the current user is one of the players
      const isCurrentUserInMatch = [
        matchData.playerOneId, 
        matchData.playerOnePartnerId, 
        matchData.playerTwoId, 
        matchData.playerTwoPartnerId
      ].includes(userId);
      
      if (!isCurrentUserInMatch) {
        return res.status(400).json({ 
          message: "Current user must be one of the players in the match" 
        });
      }
      
      // Determine loser for point calculation
      const loserId = matchData.winnerId === matchData.playerOneId ? matchData.playerTwoId : matchData.playerOneId;
      
      // Check if this is a tournament match and fetch additional context if needed
      let tournamentData = null;
      let isTournamentFinal = false;
      let isTournamentSemiFinal = false;
      let participantCount = 0;
      
      if (matchData.tournamentId && matchData.matchType === "tournament") {
        // Fetch tournament info to enrich the match context
        const tournament = await storage.getTournament(matchData.tournamentId);
        if (tournament) {
          tournamentData = tournament;
          participantCount = tournament.currentParticipants || 0;
          
          // Determine special tournament rounds
          if (matchData.stageType === "main" && matchData.roundNumber === 1) {
            isTournamentFinal = true;
          } else if (matchData.stageType === "main" && matchData.roundNumber === 2) {
            isTournamentSemiFinal = true;
          }
          
          // Set event tier from tournament if not provided
          if (!req.body.eventTier) {
            // Map tournament level to event tier
            const tournamentToEventTierMap: Record<string, string> = {
              "local": "local",
              "regional": "regional",
              "national": "national",
              "international": "international"
            };
            
            matchData.eventTier = tournamentToEventTierMap[tournament.level] || "local";
          }
        }
      }
      
      // Create the match record
      const match = await storage.createMatch(matchData);
      
      // Prepare player data for CourtIQ processing
      const players = [
        { 
          userId: matchData.playerOneId, 
          partnerId: matchData.playerOnePartnerId,
          score: matchData.scorePlayerOne,
          isWinner: matchData.winnerId === matchData.playerOneId
        },
        { 
          userId: matchData.playerTwoId, 
          partnerId: matchData.playerTwoPartnerId,
          score: matchData.scorePlayerTwo,
          isWinner: matchData.winnerId === matchData.playerTwoId
        }
      ];
      
      // Initialize objects to store rating and ranking point results
      let ratingResults;
      let rankingPointsResult;
      
      try {
        // Process the match in CourtIQ system
        if (typeof courtIQSystem !== 'undefined') {
          // Create the tournament context object if this is a tournament match
          const tournamentContext = matchData.tournamentId ? {
            tournamentId: matchData.tournamentId,
            stageType: matchData.stageType,
            roundNumber: matchData.roundNumber,
            isFinal: isTournamentFinal,
            isSemiFinal: isTournamentSemiFinal,
            participantCount
          } : undefined;
          
          // Process match in CourtIQ for rating changes
          ratingResults = await courtIQSystem.processMatch({
            matchId: match.id,
            players,
            format: matchData.formatType,
            division: matchData.division,
            matchType: matchData.matchType,
            eventTier: matchData.eventTier,
            tournamentContext
          });
          
          // Calculate ranking points based on match context and rating differential
          if (matchData.formatType === "singles") {
            // For singles matches
            rankingPointsResult = await courtIQSystem.calculateRankingPointsForMatch({
              matchType: matchData.matchType,
              eventTier: matchData.eventTier,
              winner: {
                userId: matchData.winnerId,
                division: matchData.division,
                format: matchData.formatType
              },
              loser: {
                userId: loserId,
                division: matchData.division,
                format: matchData.formatType
              },
              // Tournament context
              isTournamentFinal,
              isTournamentSemiFinal,
              participantCount,
              tournamentContext
            });
            
            // Calculate match outcome significance (decisive vs close)
            const scoreGap = Math.abs(parseInt(matchData.scorePlayerOne) - parseInt(matchData.scorePlayerTwo));
            const isDecisive = scoreGap > Math.floor(matchData.pointsToWin / 3);
            const outcomeType = isDecisive ? "decisive" : "close";
            
            // Award enhanced ranking points to the winner
            await courtIQSystem.awardEnhancedRankingPoints(
              matchData.winnerId,
              rankingPointsResult,
              matchData.division,
              matchData.formatType,
              "match_victory",
              matchData.matchType,
              matchData.eventTier,
              outcomeType,
              match.id,
              ratingResults?.playerOneRatingChange?.ratingDifferential,
              1.0, // No additional multiplier
              `Match victory against player #${loserId}`
            );
          } else {
            // For doubles matches
            rankingPointsResult = await courtIQSystem.calculateRankingPointsForMatch({
              matchType: matchData.matchType,
              eventTier: matchData.eventTier,
              winner: {
                userId: matchData.winnerId,
                division: matchData.division,
                format: matchData.formatType
              },
              loser: {
                userId: loserId,
                division: matchData.division,
                format: matchData.formatType
              },
              isTournamentFinal,
              isTournamentSemiFinal,
              participantCount,
              tournamentContext
            });
            
            // Prepare player representation for the description
            const winningTeam = matchData.winnerId === matchData.playerOneId 
              ? { main: matchData.playerOneId, partner: matchData.playerOnePartnerId }
              : { main: matchData.playerTwoId, partner: matchData.playerTwoPartnerId };
            
            const losingTeam = matchData.winnerId === matchData.playerOneId 
              ? { main: matchData.playerTwoId, partner: matchData.playerTwoPartnerId }
              : { main: matchData.playerOneId, partner: matchData.playerOnePartnerId };
            
            // Award points to both winners
            await courtIQSystem.awardEnhancedRankingPoints(
              winningTeam.main,
              rankingPointsResult,
              matchData.division,
              matchData.formatType,
              "match_victory",
              matchData.matchType,
              matchData.eventTier,
              undefined,
              match.id,
              undefined,
              1.0,
              `Doubles victory with partner #${winningTeam.partner} against team #${losingTeam.main}/${losingTeam.partner || 'solo'}`
            );
            
            // If there's a partner, also award them points
            if (winningTeam.partner) {
              await courtIQSystem.awardEnhancedRankingPoints(
                winningTeam.partner,
                rankingPointsResult,
                matchData.division,
                matchData.formatType,
                "match_victory",
                matchData.matchType,
                matchData.eventTier,
                undefined,
                match.id,
                undefined,
                1.0,
                `Doubles victory with partner #${winningTeam.main} against team #${losingTeam.main}/${losingTeam.partner || 'solo'}`
              );
            }
          }
        }
      } catch (courtiqError) {
        console.error("Error processing match in CourtIQ system:", courtiqError);
        // Continue with legacy point system as fallback
      }
      
      // Default points if CourtIQ system is unavailable or fails
      let pointsForWinner = 10;
      
      // If we have points from CourtIQ, use those
      if (rankingPointsResult) {
        pointsForWinner = rankingPointsResult.total;
      } else {
        // Legacy point system as fallback
        const updatedWinner = await storage.updateUserRankingPoints(matchData.winnerId, pointsForWinner);
        
        // Get the old and new ranking
        const oldRanking = (updatedWinner?.rankingPoints || 0) - pointsForWinner;
        const newRanking = updatedWinner?.rankingPoints || 0;
        
        // Determine opponent text for history
        let opponentText = `player #${loserId}`;
        if (matchData.formatType === "doubles") {
          const loserPartner = matchData.winnerId === matchData.playerOneId 
            ? matchData.playerTwoPartnerId 
            : matchData.playerOnePartnerId;
            
          opponentText = `players #${loserId}${loserPartner ? ` and #${loserPartner}` : ''}`;
        }
        
        // Record ranking change in legacy system
        await storage.recordRankingChange({
          userId: matchData.winnerId,
          oldRanking,
          newRanking,
          reason: `Won ${matchData.matchType} ${matchData.formatType} match against ${opponentText}`,
          matchId: match.id
        });
      }
      
      // Update match counts for all participating players
      const isWinner = userId === matchData.winnerId;
      
      // Update the current user's match stats
      await storage.updateUser(userId, {
        totalMatches: (req.user as any).totalMatches + 1,
        matchesWon: isWinner ? (req.user as any).matchesWon + 1 : (req.user as any).matchesWon,
        lastMatchDate: matchDate
      });
      
      // Create activity for the user recording the match
      await storage.createActivity({
        userId,
        type: "match_played",
        description: isWinner ? "Won a match" : "Played a match",
        xpEarned: 25, // Award XP for playing a match regardless of outcome
        metadata: { 
          matchId: match.id,
          tournamentId: matchData.tournamentId,
          format: matchData.formatType,
          outcome: isWinner ? "won" : "lost"
        }
      });
      
      // Award XP with the XP system
      try {
        // Base XP award for recording a match
        let xpAction = isWinner ? "match_won" : "match_played";
        
        // Special XP actions for tournament matches
        if (matchData.matchType === "tournament") {
          if (isWinner) {
            if (isTournamentFinal) {
              xpAction = "tournament_final_won";
            } else if (isTournamentSemiFinal) {
              xpAction = "tournament_semifinal_won";
            } else {
              xpAction = "tournament_match_won";
            }
          } else {
            xpAction = "tournament_match_played";
          }
        }
        
        // Award XP through the XP system
        await xpSystem.awardXP(
          userId,
          xpAction,
          matchData.tournamentId,
          match.id
        );
      } catch (xpError) {
        console.error("Error awarding XP:", xpError);
        // Continue without XP system - we'll still use the old method
        const baseXP = isWinner ? 50 : 25;
        const tournamentBonus = matchData.matchType === "tournament" ? 25 : 0;
        const finalBonus = isTournamentFinal ? 50 : 0;
        const semiFinalBonus = isTournamentSemiFinal ? 25 : 0;
        
        const totalXP = baseXP + tournamentBonus + finalBonus + semiFinalBonus;
        await storage.updateUserXP(userId, totalXP);
      }
      
      // Prepare response
      const response: any = {
        match,
        pointsAwarded: pointsForWinner,
        xpAwarded: isWinner ? 50 : 25
      };
      
      // Add CourtIQ results if available
      if (ratingResults) {
        response.ratingChanges = ratingResults;
      }
      
      // Add ranking points breakdown if available
      if (rankingPointsResult) {
        response.rankingPoints = {
          total: rankingPointsResult.total,
          basePoints: rankingPointsResult.base,
          ratingBonus: rankingPointsResult.ratingBonus,
          explanation: rankingPointsResult.basePointsExplanation,
          bonusExplanation: rankingPointsResult.bonusExplanation,
          contextualFactors: rankingPointsResult.contextualFactors
        };
      }
      
      // Add tournament context if this was a tournament match
      if (tournamentData) {
        response.tournamentContext = {
          tournamentName: tournamentData.name,
          tournamentLevel: tournamentData.level,
          roundType: matchData.stageType,
          roundNumber: matchData.roundNumber,
          isFinal: isTournamentFinal,
          isSemiFinal: isTournamentSemiFinal
        };
      }
      
      // Publish match recorded event through the event bus
      try {
        // This allows other modules (like achievement system) to react
        await serverEventBus.publish("match:recorded", {
          matchId: match.id,
          winnerId: matchData.winnerId,
          playerOneId: matchData.playerOneId,
          playerTwoId: matchData.playerTwoId,
          playerOnePartnerId: matchData.playerOnePartnerId,
          playerTwoPartnerId: matchData.playerTwoPartnerId,
          formatType: matchData.formatType,
          matchType: matchData.matchType,
          tournamentId: matchData.tournamentId,
          isRated: true,
          ratingChanges: ratingResults
        });
      } catch (eventError) {
        console.error("Error publishing match event:", eventError);
        // Non-critical error, continue
      }
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Error recording match:", error);
      res.status(500).json({ message: "Error recording match", error: (error as Error).message });
    }
  });

  // Connection routes (social features)
  app.post("/api/connections", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { recipientId, type = "friend", message, metadata } = req.body;
      
      if (!recipientId) {
        return res.status(400).json({ message: "Missing recipient ID" });
      }
      
      // Document that coach connections are a paid feature
      if (type === "coach") {
        return res.status(403).json({ 
          message: "Coach connections are a premium feature that will be available in a future update" 
        });
      }
      
      // Check if connection already exists
      const existingConnection = await storage.getConnectionByUsers(userId, recipientId, type);
      if (existingConnection) {
        return res.status(400).json({ 
          message: "Connection already exists", 
          connection: existingConnection 
        });
      }
      
      // Create the connection
      const connection = await storage.createConnection({
        requesterId: userId,
        recipientId,
        type,
        status: "pending",
        notes: message || null,
        metadata: metadata || null
      });
      
      // Create an activity for the requester
      await storage.createActivity({
        userId,
        type: "connection_request_sent",
        description: `Sent ${type} connection request`,
        xpEarned: 5, // Small XP reward for social actions
        metadata: { connectionId: connection.id, recipientId, connectionType: type }
      });
      
      // Create an activity for the recipient
      await storage.createActivity({
        userId: recipientId,
        type: "connection_request_received",
        description: `Received ${type} connection request`,
        xpEarned: 0, // No XP for receiving requests
        metadata: { connectionId: connection.id, requesterId: userId, connectionType: type }
      });
      
      res.status(201).json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(500).json({ message: "Error creating connection" });
    }
  });
  
  app.get("/api/connections/sent", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { type, status } = req.query;
      
      const connections = await storage.getUserSentConnections(
        userId, 
        type as string | undefined, 
        status as string | undefined
      );
      
      res.json(connections);
    } catch (error) {
      console.error("Error retrieving sent connections:", error);
      res.status(500).json({ message: "Error retrieving sent connections" });
    }
  });
  
  app.get("/api/connections/received", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { type, status } = req.query;
      
      const connections = await storage.getUserReceivedConnections(
        userId, 
        type as string | undefined, 
        status as string | undefined
      );
      
      res.json(connections);
    } catch (error) {
      console.error("Error retrieving received connections:", error);
      res.status(500).json({ message: "Error retrieving received connections" });
    }
  });
  
  app.patch("/api/connections/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const connectionId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["accepted", "declined", "ended"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Verify the connection exists and the user is authorized to update it
      const connection = await storage.getConnection(connectionId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Check if user is authorized (must be recipient for accept/decline, either party for ended)
      if (status === "accepted" || status === "declined") {
        if (connection.recipientId !== userId) {
          return res.status(403).json({ message: "Only the recipient can accept or decline a connection" });
        }
      } else if (status === "ended") {
        if (connection.requesterId !== userId && connection.recipientId !== userId) {
          return res.status(403).json({ message: "Only participants can end a connection" });
        }
      }
      
      // Update the connection status
      const updatedConnection = await storage.updateConnectionStatus(connectionId, status);
      
      // Create activities based on the status change
      let requesterActivityType: string, requesterActivityDesc: string, recipientActivityType: string, recipientActivityDesc: string;
      let requesterXP = 0, recipientXP = 0;
      
      if (status === "accepted") {
        requesterActivityType = "connection_accepted";
        requesterActivityDesc = `${connection.type} connection request was accepted`;
        requesterXP = 10; // XP reward for successful connection
        
        recipientActivityType = "connection_accepted";
        recipientActivityDesc = `Accepted ${connection.type} connection request`;
        recipientXP = 10; // Both users get XP for a successful connection
      } else if (status === "declined") {
        requesterActivityType = "connection_declined";
        requesterActivityDesc = `${connection.type} connection request was declined`;
        
        recipientActivityType = "connection_declined";
        recipientActivityDesc = `Declined ${connection.type} connection request`;
      } else if (status === "ended") {
        const actorId = userId;
        const otherId = userId === connection.requesterId ? connection.recipientId : connection.requesterId;
        
        requesterActivityType = "connection_ended";
        requesterActivityDesc = userId === connection.requesterId 
          ? `Ended ${connection.type} connection` 
          : `${connection.type} connection was ended`;
        
        recipientActivityType = "connection_ended";
        recipientActivityDesc = userId === connection.recipientId 
          ? `Ended ${connection.type} connection` 
          : `${connection.type} connection was ended`;
      }
      
      // Create the activity records
      await storage.createActivity({
        userId: connection.requesterId,
        type: requesterActivityType as "connection_accepted" | "connection_declined" | "connection_ended",
        description: requesterActivityDesc,
        xpEarned: requesterXP,
        metadata: { connectionId, status }
      });
      
      await storage.createActivity({
        userId: connection.recipientId,
        type: recipientActivityType as "connection_accepted" | "connection_declined" | "connection_ended",
        description: recipientActivityDesc,
        xpEarned: recipientXP,
        metadata: { connectionId, status }
      });
      
      res.json(updatedConnection);
    } catch (error) {
      console.error("Error updating connection status:", error);
      res.status(500).json({ message: "Error updating connection status" });
    }
  });
  
  app.get("/api/connections/coaching", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      
      try {
        // Get active coaching connections with user info
        const connections = await storage.getActiveCoachingConnections(userId);
        res.json(connections);
      } catch (dbError: any) {
        // Check if this is a "relation does not exist" error (common during initial setup)
        if (dbError.code === '42P01') { // PostgreSQL code for undefined_table
          // Return empty array instead of an error for better UX during development
          console.log("Connections table not yet created, returning empty array");
          return res.json([]);
        }
        // Re-throw for other errors
        throw dbError;
      }
    } catch (error) {
      console.error("Error retrieving coaching connections:", error);
      res.status(500).json({ message: "Error retrieving coaching connections" });
    }
  });

  // Social activity feed (for the dashboard)
  app.get("/api/social/activities", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get social activities from connections and related users
      const activities = await storage.getSocialActivityFeed(userId, limit);
      
      res.json(activities);
    } catch (error) {
      console.error("Error retrieving social activities:", error);
      res.status(500).json({ message: "Error retrieving social activities" });
    }
  });
  
  // User search for connections feature
  app.get("/api/users/search", async (req: Request, res: Response) => {
    try {
      // Get current user from session if available but don't require authentication
      const currentUser = req.isAuthenticated() ? req.user as Express.User : null;
      console.log("User search API - Authentication status:", req.isAuthenticated());
      console.log("User search API - Current user:", currentUser?.username, "ID:", currentUser?.id);
      
      const query = req.query.q as string;
      console.log("User search API - Query:", query);
      
      if (!query || query.length < 2) {
        console.log("Query too short, returning empty array");
        return res.status(200).json([]); // Return empty array instead of 400 error
      }
      
      // Create test users if needed
      if (query.toLowerCase() === "test" && currentUser?.isAdmin) {
        console.log("Creating test users for admin user:", currentUser.username);
        // Only admin users can create test users
        try {
          // Create a simple test user for demo purposes
          const testUserCount = 3;
          const testUsers = [];
          
          for (let i = 0; i < testUserCount; i++) {
            const timestamp = Date.now();
            const randomNum = Math.floor(Math.random() * 10000);
            const hashedPassword = await hashPassword("password123");
            
            const firstName = ["Alex", "Taylor", "Jordan", "Casey", "Morgan"][i % 5];
            const lastName = ["Smith", "Johnson", "Williams", "Jones", "Brown"][i % 5];
            const displayName = `${firstName} ${lastName}`;
            const username = `test_player_${timestamp}_${randomNum}`;
            const avatarInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
            
            try {
              // Create a test user
              const testUser = await storage.createUser({
                username,
                password: hashedPassword,
                displayName,
                email: `${username}@example.com`,
                avatarInitials,
                yearOfBirth: 1985 + Math.floor(Math.random() * 20),
                skillLevel: ["2.5", "3.0", "3.5", "4.0", "4.5"][Math.floor(Math.random() * 5)],
                location: "Test Location",
                playingSince: `${2019 + Math.floor(Math.random() * 5)}`,
                preferredPosition: ["Right", "Left", "Either"][Math.floor(Math.random() * 3)],
                dominantHand: ["Right", "Left"][Math.floor(Math.random() * 2)],
                paddleBrand: ["Selkirk", "Paddletek", "Joola", "Engage"][Math.floor(Math.random() * 4)],
                profileCompletionPct: 80
              });

              const { password, ...userWithoutPassword } = testUser;
              testUsers.push(userWithoutPassword);
            } catch (err) {
              console.error("Error creating test user:", err);
            }
          }
          
          // Return the test users in the search results
          if (testUsers.length > 0) {
            console.log(`Created ${testUsers.length} test users for search`);
            const sanitizedTestUsers = testUsers.map(user => ({
              id: user.id,
              username: user.username,
              displayName: user.displayName || user.username,
              passportId: user.passportId,
              avatarUrl: user.avatarUrl,
              avatarInitials: user.avatarInitials || user.username?.substring(0, 2).toUpperCase()
            }));
            return res.json(sanitizedTestUsers);
          }
        } catch (createError) {
          console.error("Error creating test users:", createError);
        }
      }
      
      // Try regular search
      let users = [];
      try {
        // Pass current user ID as excludeUserId if available
        const currentUserId = currentUser?.id;
        console.log("Calling searchUsers with currentUserId:", currentUserId);
        users = await storage.searchUsers(query, currentUserId);
        console.log("Search results:", users.length, "users found for query:", query);
      } catch (searchError) {
        console.error("Error in searchUsers:", searchError);
        // Return empty array instead of error
        users = [];
      }
      
      if (!users || users.length === 0) {
        // No users found, but return empty array with 200 status
        console.log("No users found for query:", query);
        return res.json([]);
      }
      
      // Return a limited list with specific fields to avoid oversharing data
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        passportId: user.passportId,
        avatarUrl: user.avatarUrl,
        avatarInitials: user.avatarInitials || user.username?.substring(0, 2).toUpperCase()
      }));
      
      console.log("Sending search results for query:", query, sanitizedUsers.length, "users");
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error in search API:", error);
      // Return empty array instead of error to avoid breaking the UI
      res.json([]);
    }
  });

  // Connection statistics for dashboard widget
  app.get("/api/connections/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const stats = await storage.getConnectionStats(userId);
      
      res.json(stats);
    } catch (error) {
      console.error("Error retrieving connection stats:", error);
      res.status(500).json({ message: "Error retrieving connection stats" });
    }
  });

  // Coach Profile API endpoints
  app.get("/api/coach/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      
      try {
        // Get coach profile if exists
        const coachProfile = await storage.getCoachingProfile(userId);
        
        if (!coachProfile) {
          return res.status(404).json({ message: "Coach profile not found" });
        }
        
        res.json(coachProfile);
      } catch (err) {
        // Specific handling for database table not existing
        if (err instanceof Error && 
            (err.message.includes("relation") || 
             err.message.includes("does not exist") ||
             err.message.includes("coaching_profiles"))) {
          console.warn("Coaching profiles table not available:", err.message);
          // Return an empty profile with a specific status code
          return res.status(503).json({ 
            message: "Coaching feature not available yet",
            error: "database_setup_incomplete" 
          });
        }
        throw err; // Re-throw if it's not the specific error we want to handle
      }
    } catch (error) {
      console.error("Error retrieving coach profile:", error);
      res.status(500).json({ message: "Error retrieving coach profile" });
    }
  });
  
  app.post("/api/coach/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const profileData = req.body;
      
      // Check if user is eligible to create a coach profile
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      try {
        // Check if coach profile already exists
        let coachProfile = await storage.getCoachingProfile(userId);
        
        if (coachProfile) {
          // Update existing profile
          coachProfile = await storage.updateCoachingProfile(userId, profileData);
        } else {
          // Create new profile
          const newProfileData = {
            ...profileData,
            userId,
            accessType: "code", // Default access type
            accessGrantedAt: new Date(),
            isActive: true,
          };
          coachProfile = await storage.createCoachingProfile(newProfileData);
        }
        
        res.json(coachProfile);
      } catch (err) {
        // Specific handling for database table not existing
        if (err instanceof Error && 
            (err.message.includes("relation") || 
             err.message.includes("does not exist") ||
             err.message.includes("coaching_profiles"))) {
          console.warn("Coaching profiles table not available:", err.message);
          return res.status(503).json({ 
            message: "Coaching feature not available yet",
            error: "database_setup_incomplete" 
          });
        }
        throw err; // Re-throw if it's not the specific error we want to handle
      }
    } catch (error) {
      console.error("Error creating/updating coach profile:", error);
      res.status(500).json({ message: "Error creating/updating coach profile" });
    }
  });
  
  app.post("/api/coach/redeem-code", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Redemption code is required" });
      }
      
      try {
        // Check if code exists and is valid coach access code
        const redemptionCode = await storage.getRedemptionCodeByCode(code);
        
        if (!redemptionCode || !redemptionCode.isCoachAccessCode) {
          return res.status(400).json({ message: "Invalid coaching access code" });
        }
        
        if (redemptionCode.isActive === false) {
          return res.status(400).json({ message: "This code is no longer active" });
        }
        
        if (redemptionCode.expiresAt && new Date(redemptionCode.expiresAt) < new Date()) {
          return res.status(400).json({ message: "This code has expired" });
        }
        
        if (redemptionCode.maxRedemptions && 
            redemptionCode.currentRedemptions && 
            redemptionCode.currentRedemptions >= redemptionCode.maxRedemptions) {
          return res.status(400).json({ message: "This code has reached its maximum redemptions" });
        }
        
        // Check if user has already redeemed this code
        const hasRedeemed = await storage.hasUserRedeemedCode(userId, redemptionCode.id);
        if (hasRedeemed) {
          return res.status(400).json({ message: "You have already redeemed this code" });
        }
        
        // Get the user to update
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        
        // Update user with coach access flag
        await storage.updateUser(userId, { hasCoachAccess: true });
        
        // Record redemption
        await storage.redeemCode({
          userId,
          redemptionCodeId: redemptionCode.id
        });
        
        // Update redemption count
        await storage.incrementRedemptionCodeCounter(redemptionCode.id);
        
        // Create activity record
        await storage.createActivity({
          userId,
          type: "code_redemption",
          description: "Redeemed coach access code",
          xpEarned: redemptionCode.xpReward || 0,
          metadata: { codeId: redemptionCode.id, codeType: "coach_access" }
        });
        
        res.json({ 
          message: "Coach access code redeemed successfully",
          xpEarned: redemptionCode.xpReward || 0
        });
      } catch (err) {
        // Specific handling for database table not existing
        if (err instanceof Error && 
            (err.message.includes("relation") || 
             err.message.includes("does not exist") ||
             err.message.includes("coaching_profiles") ||
             err.message.includes("code_redemptions"))) {
          console.warn("Coaching database structures not available:", err.message);
          return res.status(503).json({ 
            message: "Coaching feature not available yet",
            error: "database_setup_incomplete" 
          });
        }
        throw err; // Re-throw if it's not the specific error we want to handle
      }
    } catch (error) {
      console.error("Error redeeming coach access code:", error);
      res.status(500).json({ message: "Error redeeming coach access code" });
    }
  });
  
  // Waitlist signup route for coaching
  app.post("/api/waitlist/coaching", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { email, reason } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      try {
        // In a production environment, we would save this to a waitlist table
        // For now, just create an activity record to track interest
        await storage.createActivity({
          userId,
          type: "waitlist_signup",
          description: "Joined coaching profiles waitlist",
          xpEarned: 5, // Small XP reward for showing interest
          metadata: { 
            feature: "coaching_profiles",
            email,
            reason,
            signupDate: new Date().toISOString()
          }
        });
        
        // Could also send an email notification here
        
        res.json({ 
          message: "You've successfully joined the coaching profiles waitlist",
          xpEarned: 5
        });
      } catch (err) {
        // Graceful error handling for tables that might not exist yet
        if (err instanceof Error && 
            (err.message.includes("relation") || 
             err.message.includes("does not exist"))) {
          console.warn("Waitlist database error:", err.message);
          // Just pretend it worked since this is a coming soon feature
          return res.json({ 
            message: "You've successfully joined the coaching profiles waitlist",
            status: "success"
          });
        }
        throw err;
      }
    } catch (error) {
      console.error("Error joining waitlist:", error);
      // Don't show the actual error to users, just a friendly message
      res.status(500).json({ 
        message: "We couldn't add you to the waitlist right now, but we'll be launching soon!",
      });
    }
  });

  // Create test users endpoint (for development purposes only)
  app.post("/api/dev/create-test-users", async (req: Request, res: Response) => {
    try {
      const { count = 5 } = req.body;
      const testUserCount = Math.min(Math.max(1, count), 10); // Limit between 1 and 10
      
      const testUsers = [];
      
      // Create test users with unique usernames
      for (let i = 0; i < testUserCount; i++) {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        const hashedPassword = await hashPassword("password123");
        
        const firstName = ["Alex", "Taylor", "Jordan", "Casey", "Morgan", "Jamie", "Riley", "Quinn", "Avery", "Dakota"][i % 10];
        const lastName = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor"][i % 10];
        const displayName = `${firstName} ${lastName}`;
        const username = `test_player_${timestamp}_${randomNum}`;
        const avatarInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
        
        const skillLevelOptions = ["2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];
        const skillLevel = skillLevelOptions[Math.floor(Math.random() * skillLevelOptions.length)];
        
        // Create a test user
        const testUser = await storage.createUser({
          username,
          password: hashedPassword,
          displayName,
          email: `${username}@example.com`,
          avatarInitials,
          yearOfBirth: 1985 + Math.floor(Math.random() * 20),
          skillLevel,
          location: "Test Location",
          playingSince: `${2019 + Math.floor(Math.random() * 5)}`,
          preferredPosition: ["Right", "Left", "Either"][Math.floor(Math.random() * 3)],
          dominantHand: ["Right", "Left"][Math.floor(Math.random() * 2)],
          paddleBrand: ["Selkirk", "Paddletek", "Joola", "Engage", "ProLite"][Math.floor(Math.random() * 5)],
          profileCompletionPct: 80
        });

        // Add to response array without password
        const { password, ...userWithoutPassword } = testUser;
        testUsers.push(userWithoutPassword);
      }
      
      res.status(201).json({
        message: `Successfully created ${testUsers.length} test users`,
        users: testUsers
      });
    } catch (error) {
      console.error("Error creating test users:", error);
      res.status(500).json({ message: "Error creating test users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
