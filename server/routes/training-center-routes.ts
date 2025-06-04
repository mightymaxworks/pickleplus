/**
 * PKL-278651-TRAINING-CENTER-001 - Training Center Management API Routes
 * Sprint 1: Foundation Infrastructure
 * 
 * @framework Framework5.3
 */

import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { 
  insertCoachingSessionSchema,
  insertChallengeCompletionSchema,
  SessionType,
  SessionStatus,
  ChallengeCategory,
  SkillLevel
} from "../../shared/schema";

const router = Router();

// Step 1: Check-in to training center location
router.post("/checkin", async (req, res) => {
  try {
    const checkInSchema = z.object({
      qrCode: z.string().min(1, "QR code is required"),
      playerId: z.number().int().positive("Valid player ID required").optional()
    });

    const { qrCode, playerId = 1 } = checkInSchema.parse(req.body); // Default to user 1 for demo

    // Find training center by QR code
    const center = await storage.getTrainingCenterByQrCode(qrCode);
    if (!center) {
      return res.status(404).json({ error: "Training center not found" });
    }

    // Check if player already has an active session
    const activeSession = await storage.getActiveSessionForPlayer(playerId);
    if (activeSession) {
      return res.status(400).json({ 
        error: "Player already has an active session",
        activeSession 
      });
    }

    // Get available coaches at this center
    const availableCoaches = await storage.getAvailableCoachesAtCenter(center.id);
    
    res.json({
      success: true,
      center: {
        id: center.id,
        name: center.name,
        address: center.address,
        city: center.city
      },
      availableCoaches: availableCoaches.map(coach => ({
        id: coach.id,
        name: coach.displayName || coach.username,
        specializations: coach.specializations || [],
        hourlyRate: coach.hourlyRate
      }))
    });

  } catch (error) {
    console.error("Training center check-in error:", error);
    res.status(500).json({ error: "Failed to check in to training center" });
  }
});

// Step 2: Select coach and start session
router.post("/select-coach", async (req, res) => {
  try {
    const selectCoachSchema = z.object({
      centerId: z.number().int().positive("Valid center ID required"),
      coachId: z.number().int().positive("Valid coach ID required"),
      playerId: z.number().int().positive("Valid player ID required").optional()
    });

    const { centerId, coachId, playerId = 1 } = selectCoachSchema.parse(req.body);

    // Verify center and coach
    const center = await storage.getTrainingCenter(centerId);
    const coach = await storage.getUser(coachId);
    
    if (!center || !coach) {
      return res.status(404).json({ error: "Center or coach not found" });
    }

    // Create new coaching session
    const sessionData = {
      playerId,
      coachId,
      centerId,
      sessionType: 'individual' as any,
      checkInTime: new Date(),
      status: 'active' as any,
      challengesCompleted: 0
    };

    const session = await storage.createCoachingSession(sessionData);

    res.json({
      success: true,
      session: {
        id: session.id,
        center: center.name,
        coach: coach.displayName || coach.username,
        checkInTime: session.checkInTime,
        status: session.status,
        challengesCompleted: 0
      }
    });

  } catch (error) {
    console.error("Coach selection error:", error);
    res.status(500).json({ error: "Failed to select coach and start session" });
  }
});

// Get available training centers
router.get("/locations", async (req, res) => {
  try {
    const centers = await storage.getActiveTrainingCenters();
    
    const formattedCenters = centers.map(center => ({
      id: center.id,
      name: center.name,
      address: center.address,
      city: center.city,
      operatingHours: center.operatingHours,
      courtCount: center.courtCount,
      amenities: center.amenities,
      qrCode: center.qrCode
    }));

    res.json({ centers: formattedCenters });
  } catch (error) {
    console.error("Error fetching training centers:", error);
    res.status(500).json({ error: "Failed to fetch training centers" });
  }
});

// Start coaching session (coach initiates)
router.post("/session/start", async (req, res) => {
  try {
    const sessionStartSchema = z.object({
      sessionId: z.number().int().positive("Valid session ID required"),
      coachId: z.number().int().positive("Valid coach ID required"),
      playerGoals: z.string().optional(),
      skillsFocused: z.array(z.string()).optional()
    });

    const { sessionId, coachId, playerGoals, skillsFocused } = sessionStartSchema.parse(req.body);

    // Verify session exists and coach is assigned
    const session = await storage.getCoachingSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.coachId !== coachId) {
      return res.status(403).json({ error: "Not authorized for this session" });
    }

    // Update session with goals and focus areas
    const updatedSession = await storage.updateCoachingSession(sessionId, {
      playerGoals,
      skillsFocused,
      status: SessionStatus.ACTIVE
    });

    res.json({
      success: true,
      session: updatedSession
    });

  } catch (error) {
    console.error("Error starting coaching session:", error);
    res.status(500).json({ error: "Failed to start coaching session" });
  }
});

// Get challenges by skill level
router.get("/challenges/by-level/:level", async (req, res) => {
  try {
    const { level } = req.params;
    
    if (!Object.values(SkillLevel).includes(level as any)) {
      return res.status(400).json({ error: "Invalid skill level" });
    }

    const challenges = await storage.getChallengesBySkillLevel(level as keyof typeof SkillLevel);
    
    const formattedChallenges = challenges.map(challenge => ({
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      category: challenge.category,
      skillLevel: challenge.skillLevel,
      difficultyRating: challenge.difficultyRating,
      estimatedDuration: challenge.estimatedDuration,
      instructions: challenge.instructions,
      coachingTips: challenge.coachingTips,
      equipmentNeeded: challenge.equipmentNeeded,
      successCriteria: challenge.successCriteria,
      targetMetric: challenge.targetMetric,
      badgeReward: challenge.badgeReward
    }));

    res.json({ challenges: formattedChallenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
});

// Complete a challenge
router.post("/challenge/complete", async (req, res) => {
  try {
    const completionSchema = z.object({
      sessionId: z.number().int().positive(),
      challengeId: z.number().int().positive(),
      playerId: z.number().int().positive(),
      coachId: z.number().int().positive(),
      isCompleted: z.boolean(),
      actualResult: z.object({
        metric: z.string(),
        value: z.number(),
        unit: z.string(),
        notes: z.string().optional()
      }).optional(),
      successRate: z.number().min(0).max(100).optional(),
      timeSpent: z.number().int().positive().optional(),
      coachNotes: z.string().optional(),
      improvementAreas: z.array(z.string()).optional(),
      nextRecommendations: z.string().optional()
    });

    const completionData = completionSchema.parse(req.body);

    // Verify session and challenge exist
    const session = await storage.getCoachingSessionById(completionData.sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const challenge = await storage.getChallengeById(completionData.challengeId);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Create challenge completion record
    const completion = await storage.createChallengeCompletion({
      ...completionData,
      completedAt: new Date()
    });

    // Award badge if challenge was completed successfully
    if (completionData.isCompleted && challenge.badgeReward) {
      await storage.awardPlayerBadge({
        playerId: completionData.playerId,
        badgeName: challenge.badgeReward,
        sessionId: completionData.sessionId,
        challengeId: completionData.challengeId,
        coachId: completionData.coachId,
        earnedAt: new Date()
      });
    }

    res.json({
      success: true,
      completion,
      badgeAwarded: completionData.isCompleted && challenge.badgeReward ? challenge.badgeReward : null
    });

  } catch (error) {
    console.error("Error completing challenge:", error);
    res.status(500).json({ error: "Failed to complete challenge" });
  }
});

// End coaching session
router.post("/session/end", async (req, res) => {
  try {
    const endSessionSchema = z.object({
      sessionId: z.number().int().positive(),
      coachId: z.number().int().positive(),
      coachObservations: z.string().optional(),
      sessionNotes: z.string().optional()
    });

    const { sessionId, coachId, coachObservations, sessionNotes } = endSessionSchema.parse(req.body);

    // Verify session exists and coach is authorized
    const session = await storage.getCoachingSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.coachId !== coachId) {
      return res.status(403).json({ error: "Not authorized for this session" });
    }

    // Calculate actual duration
    const checkInTime = new Date(session.checkInTime);
    const checkOutTime = new Date();
    const actualDuration = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60));

    // Update session with end details
    const updatedSession = await storage.updateCoachingSession(sessionId, {
      checkOutTime,
      actualDuration,
      coachObservations,
      sessionNotes,
      status: SessionStatus.COMPLETED
    });

    // Get session summary with completions
    const sessionSummary = await storage.getSessionSummary(sessionId);

    res.json({
      success: true,
      session: updatedSession,
      summary: sessionSummary
    });

  } catch (error) {
    console.error("Error ending coaching session:", error);
    res.status(500).json({ error: "Failed to end coaching session" });
  }
});

// Get player's training center progress
router.get("/player/:playerId/progress", async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    
    if (!playerId) {
      return res.status(400).json({ error: "Valid player ID required" });
    }

    const progress = await storage.getPlayerTrainingProgress(playerId);

    res.json({
      success: true,
      progress: {
        totalSessions: progress.totalSessions,
        totalChallengesCompleted: progress.totalChallengesCompleted,
        successRate: progress.successRate,
        badgesEarned: progress.badgesEarned,
        recentSessions: progress.recentSessions,
        skillProgression: progress.skillProgression
      }
    });

  } catch (error) {
    console.error("Error fetching player progress:", error);
    res.status(500).json({ error: "Failed to fetch player progress" });
  }
});

// Get current active session for player
router.get("/session/active/:playerId", async (req, res) => {
  try {
    const playerId = parseInt(req.params.playerId);
    
    if (!playerId) {
      return res.status(400).json({ error: "Valid player ID required" });
    }

    const activeSession = await storage.getActiveSessionForPlayer(playerId);
    
    if (!activeSession) {
      return res.json({ activeSession: null });
    }

    res.json({
      success: true,
      activeSession: {
        id: activeSession.id,
        center: activeSession.centerName,
        coach: activeSession.coachName,
        checkInTime: activeSession.checkInTime,
        status: activeSession.status,
        challengesCompleted: activeSession.challengesCompleted || 0
      }
    });

  } catch (error) {
    console.error("Error fetching active session:", error);
    res.status(500).json({ error: "Failed to fetch active session" });
  }
});

export { router as trainingCenterRoutes };