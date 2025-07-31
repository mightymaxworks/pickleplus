import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { db } from "../db";
import { userExternalRatings, ratingSystems } from "../../shared/courtiq-schema";
import { users } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// DUPR Integration API Routes
// These routes handle DUPR rating import, conversion, and coach feedback enhancement

// Schema for DUPR import request
const duprImportSchema = z.object({
  duprId: z.string().min(1, "DUPR ID is required"),
  duprRating: z.number().min(2.0).max(8.0, "DUPR rating must be between 2.0 and 8.0"),  
  verificationMethod: z.enum(["user_provided", "screenshot", "manual_verification"]).optional(),
  notes: z.string().optional()
});

// Schema for coach feedback on DUPR conversion
const coachFeedbackSchema = z.object({
  studentId: z.number(),
  technicalImprovement: z.number().min(-2.0).max(2.0),
  tacticalImprovement: z.number().min(-2.0).max(2.0), 
  physicalImprovement: z.number().min(-1.0).max(1.0),
  mentalImprovement: z.number().min(-1.0).max(1.0),
  sessionNotes: z.string().optional(),
  confidenceAdjustment: z.number().min(-20).max(20).optional()
});

/**
 * DUPR → Pickle+ Rating Conversion Algorithm
 * Converts DUPR 2.0-8.0 scale to Pickle+ 1.0-10.0 scale
 */
function convertDUPRToPicklePlus(duprRating: number): number {
  // Ensure rating is within bounds
  if (duprRating < 2.0) duprRating = 2.0;
  if (duprRating > 8.0) duprRating = 8.0;
  
  // Convert DUPR 2.0-8.0 to Pickle+ 1.0-10.0
  // Using exponential curve to better represent skill gaps
  const normalizedDUPR = (duprRating - 2.0) / 6.0; // 0.0-1.0
  const exponentialCurve = Math.pow(normalizedDUPR, 0.8); // Slight compression at high end
  const picklePlusRating = 1.0 + (exponentialCurve * 9.0);
  
  return Math.round(picklePlusRating * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate coach feedback weight based on coach credentials
 */
function calculateCoachFeedbackWeight(coach: any): number {
  let weight = 1.0;
  
  // Coach certification level impact
  if (coach.pcpLevel) {
    weight += coach.pcpLevel * 0.1; // L1=0.1, L5=0.5 bonus
  }
  
  // Coach experience impact
  if (coach.experienceYears) {
    weight += Math.min(coach.experienceYears / 10, 0.3); // Max 0.3 bonus
  }
  
  // Coach rating/reviews impact
  if (coach.averageRating) {
    weight += (coach.averageRating - 3.0) * 0.1; // 4.5 star = 0.15 bonus
  }
  
  return Math.min(weight, 2.0); // Cap at 2x weight
}

// POST /api/dupr/import - Import user's DUPR rating
router.post("/import", isAuthenticated, async (req, res) => {
  try {
    const validatedData = duprImportSchema.parse(req.body);
    const userId = req.user!.id;
    
    // Convert DUPR to Pickle+ rating
    const picklePlusRating = convertDUPRToPicklePlus(validatedData.duprRating);
    
    // Get DUPR system ID from rating systems table
    const [duprSystem] = await db
      .select()
      .from(ratingSystems)
      .where(eq(ratingSystems.code, "DUPR"))
      .limit(1);
    
    if (!duprSystem) {
      return res.status(500).json({ 
        message: "DUPR rating system not configured" 
      });
    }
    
    // Check if user already has DUPR rating imported
    const existingRating = await db
      .select()
      .from(userExternalRatings)
      .where(and(
        eq(userExternalRatings.userId, userId),
        eq(userExternalRatings.systemId, duprSystem.id)
      ))
      .limit(1);
    
    if (existingRating.length > 0) {
      return res.status(400).json({ 
        message: "DUPR rating already imported. Contact support to update.",
        existingRating: existingRating[0].rating,
        convertedRating: picklePlusRating
      });
    }
    
    // Store DUPR rating in external ratings system using CourtIQ schema
    await db.insert(userExternalRatings).values({
      userId,
      systemId: duprSystem.id,
      rating: validatedData.duprRating.toString(),
      confidence: 85, // High confidence for user-provided DUPR
      isVerified: validatedData.verificationMethod === "screenshot",
      verificationMethod: validatedData.verificationMethod || "user_provided",
      sourceType: "user_provided",
      notes: validatedData.notes
    });
    
    // Store converted rating as user's DUPR field for easy access
    await db
      .update(users)
      .set({ 
        duprRating: validatedData.duprRating.toString(),
        lastUpdated: new Date()
      })
      .where(eq(users.id, userId));
    
    res.json({
      success: true,
      message: "DUPR rating imported successfully",
      duprRating: validatedData.duprRating,
      picklePlusRating,
      conversionDate: new Date(),
      nextSteps: [
        "Connect with a coach to enhance your rating through feedback",
        "Record matches to see performance-based adjustments",
        "Complete PCP assessments for detailed skill breakdown"
      ]
    });
    
  } catch (error) {
    console.error("DUPR import error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid input data",
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Failed to import DUPR rating" });
  }
});

// POST /api/dupr/coach-feedback - Submit coach feedback to enhance rating
router.post("/coach-feedback", isAuthenticated, async (req, res) => {
  try {
    const validatedData = coachFeedbackSchema.parse(req.body);
    const coachId = req.user!.id;
    
    // Verify coach credentials
    const coach = await storage.getCoachProfile(coachId);
    if (!coach) {
      return res.status(403).json({ message: "Only certified coaches can submit feedback" });
    }
    
    // Get student's current data
    const student = await storage.getUser(validatedData.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Calculate feedback weight based on coach credentials
    const coachWeight = calculateCoachFeedbackWeight(coach);
    
    // Calculate rating impact from feedback
    const feedbackImpact = (
      validatedData.technicalImprovement * coachWeight * 0.4 +
      validatedData.tacticalImprovement * coachWeight * 0.3 +
      validatedData.physicalImprovement * coachWeight * 0.2 +
      validatedData.mentalImprovement * coachWeight * 0.1
    );
    
    // Get current DUPR rating as baseline
    const currentDuprRating = student.duprRating ? parseFloat(student.duprRating) : null;
    let newPicklePlusRating = 5.0; // Default rating
    
    if (currentDuprRating) {
      // Convert DUPR to Pickle+ and apply feedback
      const basePicklePlusRating = convertDUPRToPicklePlus(currentDuprRating);
      newPicklePlusRating = Math.max(1.0, Math.min(10.0, basePicklePlusRating + feedbackImpact));
    }
    
    // For now, we'll create a simple activity record instead of complex feedback storage
    await storage.createActivity({
      userId: validatedData.studentId,
      type: "coach_feedback",
      description: `Coach feedback: Technical ${validatedData.technicalImprovement > 0 ? '+' : ''}${validatedData.technicalImprovement}, Tactical ${validatedData.tacticalImprovement > 0 ? '+' : ''}${validatedData.tacticalImprovement}`,
      metadata: {
        coachId,
        feedbackImpact,
        coachWeight,
        technical: validatedData.technicalImprovement,
        tactical: validatedData.tacticalImprovement,
        physical: validatedData.physicalImprovement,
        mental: validatedData.mentalImprovement,
        notes: validatedData.sessionNotes
      }
    });
    
    res.json({
      success: true,
      message: "Coach feedback submitted successfully",
      ratingChange: feedbackImpact,
      newRating: newPicklePlusRating,
      coachWeight,
      breakdown: {
        technical: validatedData.technicalImprovement * coachWeight * 0.4,
        tactical: validatedData.tacticalImprovement * coachWeight * 0.3,
        physical: validatedData.physicalImprovement * coachWeight * 0.2,
        mental: validatedData.mentalImprovement * coachWeight * 0.1
      }
    });
    
  } catch (error) {
    console.error("Coach feedback error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid feedback data",
        errors: error.errors 
      });
    }
    res.status(500).json({ message: "Failed to submit coach feedback" });
  }
});

// GET /api/dupr/conversion-preview - Preview DUPR conversion without saving
router.get("/conversion-preview", isAuthenticated, async (req, res) => {
  try {
    const duprRating = parseFloat(req.query.rating as string);
    
    if (!duprRating || duprRating < 2.0 || duprRating > 8.0) {
      return res.status(400).json({ 
        message: "Valid DUPR rating (2.0-8.0) is required" 
      });
    }
    
    const picklePlusRating = convertDUPRToPicklePlus(duprRating);
    
    // Provide skill level context
    let skillLevel = "Beginner";
    if (picklePlusRating >= 3.0) skillLevel = "Intermediate";
    if (picklePlusRating >= 5.5) skillLevel = "Advanced";
    if (picklePlusRating >= 7.5) skillLevel = "Expert";
    if (picklePlusRating >= 9.0) skillLevel = "Pro";
    
    res.json({
      duprRating,
      picklePlusRating,
      skillLevel,
      conversionFormula: "Exponential curve with skill gap compression",
      coachingBenefits: [
        "Coach feedback can adjust your rating by ±2.0 points in technical/tactical areas",
        "Physical and mental improvements add ±1.0 points each", 
        "Higher certified coaches (L3-L5) have more rating impact",
        "Multiple coaching sessions create stronger rating confidence"
      ]
    });
    
  } catch (error) {
    console.error("Conversion preview error:", error);
    res.status(500).json({ message: "Failed to generate conversion preview" });
  }
});

// GET /api/dupr/rating-history/:userId - Get rating evolution history
router.get("/rating-history/:userId", isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Verify access (user can see own history, coaches can see students)
    if (req.user!.id !== userId) {
      const user = await storage.getUser(req.user!.id);
      if (!user?.isCoach) {
        return res.status(403).json({ message: "Access denied" });
      }
    }
    
    // Get user's external ratings (including DUPR)
    const externalRatings = await db
      .select({
        system: ratingSystems.name,
        rating: userExternalRatings.rating,
        createdAt: userExternalRatings.createdAt,
        isVerified: userExternalRatings.isVerified
      })
      .from(userExternalRatings)
      .innerJoin(ratingSystems, eq(userExternalRatings.systemId, ratingSystems.id))
      .where(eq(userExternalRatings.userId, userId));
    
    // Get coach feedback activities
    const coachFeedbackActivities = await storage.getUserActivities(userId, "coach_feedback");
    
    res.json({
      userId,
      externalRatings,
      coachFeedbackActivities,
      totalCoachSessions: coachFeedbackActivities.length,
      duprIntegration: externalRatings.find(r => r.system === "Dynamic Universal Pickleball Rating")
    });
    
  } catch (error) {
    console.error("Rating history error:", error);
    res.status(500).json({ message: "Failed to get rating history" });
  }
});

export default router;