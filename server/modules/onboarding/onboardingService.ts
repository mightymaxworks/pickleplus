/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * Onboarding Service
 * 
 * This service manages the user onboarding process for CourtIQ,
 * including rating system selection, initial rating capture,
 * and preference collection.
 */

import { db } from "../../db";
import { eq, and, or, isNull, sql } from "drizzle-orm";
import { 
  onboardingProgress, 
  InsertOnboardingProgress,
  OnboardingProgress
} from "../../../shared/courtiq-schema";
import { ratingConverter, RATING_SYSTEMS } from "../rating/ratingConverter";
import { serverEventBus } from "../../core/events/eventBus";
import { xpSystem } from "../xp/xpSystem";

// Event names for onboarding 
export const OnboardingEvents = {
  STARTED: "onboarding.started",
  STEP_COMPLETED: "onboarding.step_completed",
  COMPLETED: "onboarding.completed",
  RATING_PROVIDED: "onboarding.rating_provided"
} as const;

// Type for formatted onboarding state
export interface OnboardingStatus {
  userId: number;
  progress: {
    profileCompleted: boolean;
    ratingSystemSelected: boolean;
    ratingProvided: boolean;
    experienceSummaryCompleted: boolean;
    equipmentPreferencesSet: boolean;
    playStyleAssessed: boolean;
    initialAssessmentCompleted: boolean;
    tourCompleted: boolean;
  };
  preferences: {
    preferredDivision?: string;
    preferredFormat?: string;
    preferredRatingSystem?: string;
    experienceYears?: number;
  };
  progress_pct: number;
  nextStep: string;
  completed: boolean;
  xpEarned: number;
  completedAt?: Date;
}

// Return type for rating selection step
export interface RatingSelectionResult {
  success: boolean;
  message: string;
  internal_rating?: number;
  selected_system?: string;
  selected_rating?: number;
  confidence?: number;
}

export class OnboardingService {
  /**
   * Start or resume the onboarding process for a user
   */
  async startOrResumeOnboarding(userId: number): Promise<OnboardingStatus> {
    try {
      // Check if user already has onboarding progress
      const progressResult = await db.execute(
        sql`SELECT * FROM onboarding_progress WHERE user_id = ${userId} LIMIT 1`
      );
      let progress = progressResult[0];

      // If not, create a new onboarding progress record
      if (!progress) {
        const newProgress: InsertOnboardingProgress = {
          userId,
          currentStep: 'welcome'
        };

        [progress] = await db.insert(onboardingProgress).values(newProgress).returning();
        
        // Emit onboarding started event
        serverEventBus.publish(OnboardingEvents.STARTED, { userId });
      }

      return this.formatOnboardingStatus(progress);
    } catch (error) {
      console.error("Error starting onboarding:", error);
      throw error;
    }
  }

  /**
   * Save the user's preferred rating system
   */
  async selectRatingSystem(
    userId: number, 
    system: string, 
    initialRating: number
  ): Promise<RatingSelectionResult> {
    try {
      // Validate the rating system
      const supportedSystems = await ratingConverter.getSupportedSystems();
      const isValidSystem = supportedSystems.some(s => s.code === system);
      
      if (!isValidSystem) {
        return {
          success: false,
          message: "Unsupported rating system"
        };
      }

      // Convert the external rating to our internal scale
      const internalRating = await ratingConverter.convertToInternalScale(
        system, 
        initialRating,
        userId
      );

      // Update onboarding progress
      await db.update(onboardingProgress)
        .set({
          preferredRatingSystem: system,
          ratingSystemSelected: true,
          ratingProvided: true,
          lastStepCompleted: 'rating_selection',
          currentStep: 'experience_summary',
          lastStepCompletedAt: new Date(),
          xpEarned: sql`${onboardingProgress.xpEarned} + 50`
        })
        .where(eq(onboardingProgress.userId, userId));

      // Emit event
      serverEventBus.publish(OnboardingEvents.STEP_COMPLETED, { 
        userId, 
        step: 'rating_selection',
        ratingSystem: system,
        externalRating: initialRating,
        internalRating
      });
      
      // Emit rating provided event
      serverEventBus.publish(OnboardingEvents.RATING_PROVIDED, {
        userId,
        system,
        rating: initialRating,
        internalRating
      });
      
      // Give XP for completing this step
      await xpSystem.awardXp(userId, 50, "onboarding_step_completion", "Completed rating selection step in onboarding");

      return {
        success: true,
        message: "Rating system selected successfully",
        internal_rating: internalRating,
        selected_system: system,
        selected_rating: initialRating,
        confidence: 70 // Base confidence for user-provided ratings
      };
    } catch (error) {
      console.error("Error selecting rating system:", error);
      return {
        success: false,
        message: "Error selecting rating system"
      };
    }
  }

  /**
   * Complete a step in the onboarding process
   */
  async completeStep(
    userId: number, 
    step: string, 
    data: Record<string, any> = {}
  ): Promise<OnboardingStatus> {
    try {
      // Get current onboarding progress
      const progressResult = await db.execute(
        sql`SELECT * FROM onboarding_progress WHERE user_id = ${userId} LIMIT 1`
      );
      const progress = progressResult[0];

      if (!progress) {
        throw new Error(`No onboarding progress found for user ${userId}`);
      }

      // Determine next step and updates based on current step
      const updates: Partial<OnboardingProgress> = {
        lastStepCompleted: step,
        lastStepCompletedAt: new Date()
      };
      
      let xpToAward = 25; // Default XP for completing a step
      
      // Process step-specific logic
      switch (step) {
        case 'welcome':
          updates.currentStep = 'profile_completion';
          break;
          
        case 'profile_completion':
          updates.profileCompleted = true;
          updates.currentStep = 'rating_selection';
          xpToAward = 50; // More XP for completing profile
          break;
          
        case 'experience_summary':
          updates.experienceSummaryCompleted = true;
          updates.currentStep = 'equipment_preferences';
          updates.experienceYears = data.experienceYears;
          break;
          
        case 'equipment_preferences':
          updates.equipmentPreferencesSet = true;
          updates.currentStep = 'play_style';
          break;
          
        case 'play_style':
          updates.playStyleAssessed = true;
          updates.currentStep = 'initial_assessment';
          break;
          
        case 'initial_assessment':
          updates.initialAssessmentCompleted = true;
          updates.currentStep = 'tour';
          xpToAward = 75; // More XP for completing assessment
          break;
          
        case 'tour':
          updates.tourCompleted = true;
          updates.currentStep = 'completed';
          updates.completedAt = new Date();
          xpToAward = 100; // Bonus XP for completing all onboarding
          
          // Emit completed event
          serverEventBus.publish(OnboardingEvents.COMPLETED, { userId });
          break;
          
        default:
          throw new Error(`Unknown step: ${step}`);
      }
      
      // Store any additional data provided
      if (Object.keys(data).length > 0) {
        updates.additionalData = {
          ...progress.additionalData,
          [step]: data
        };
      }
      
      // Update XP earned
      updates.xpEarned = (progress.xpEarned || 0) + xpToAward;
      
      // Store preferences if provided
      if (data.preferredDivision) updates.preferredDivision = data.preferredDivision;
      if (data.preferredFormat) updates.preferredFormat = data.preferredFormat;
      
      // Update progress
      await db.update(onboardingProgress)
        .set(updates)
        .where(eq(onboardingProgress.userId, userId));
      
      // Award XP
      await xpSystem.awardXp(
        userId, 
        xpToAward, 
        "onboarding_step_completion", 
        `Completed ${step} step in onboarding`
      );
      
      // Emit step completed event
      serverEventBus.publish(OnboardingEvents.STEP_COMPLETED, { 
        userId, 
        step,
        data
      });
      
      // Get updated onboarding progress
      const updatedProgress = await db.query.onboardingProgress.findFirst({
        where: eq(onboardingProgress.userId, userId)
      });
      
      return this.formatOnboardingStatus(updatedProgress!);
    } catch (error) {
      console.error("Error completing onboarding step:", error);
      throw error;
    }
  }

  /**
   * Check if a user has completed onboarding
   */
  async isOnboardingCompleted(userId: number): Promise<boolean> {
    try {
      const progress = await db.query.onboardingProgress.findFirst({
        where: eq(onboardingProgress.userId, userId)
      });
      
      return progress?.completedAt != null;
    } catch (error) {
      console.error("Error checking onboarding completion:", error);
      return false;
    }
  }

  /**
   * Get onboarding status for a user
   */
  async getOnboardingStatus(userId: number): Promise<OnboardingStatus | null> {
    try {
      const progress = await db.query.onboardingProgress.findFirst({
        where: eq(onboardingProgress.userId, userId)
      });
      
      if (!progress) {
        return null;
      }
      
      return this.formatOnboardingStatus(progress);
    } catch (error) {
      console.error("Error getting onboarding status:", error);
      throw error;
    }
  }

  /**
   * Format onboarding status for API response
   */
  private formatOnboardingStatus(progress: OnboardingProgress): OnboardingStatus {
    // Calculate progress percentage
    const totalSteps = 8; // Total number of steps in onboarding
    const completedSteps = [
      progress.profileCompleted,
      progress.ratingSystemSelected,
      progress.ratingProvided,
      progress.experienceSummaryCompleted,
      progress.equipmentPreferencesSet,
      progress.playStyleAssessed,
      progress.initialAssessmentCompleted,
      progress.tourCompleted
    ].filter(Boolean).length;
    
    const progressPct = Math.round((completedSteps / totalSteps) * 100);
    
    // Determine next step
    let nextStep = progress.currentStep || 'welcome';
    if (progress.completedAt) {
      nextStep = 'completed';
    }
    
    return {
      userId: progress.userId,
      progress: {
        profileCompleted: progress.profileCompleted || false,
        ratingSystemSelected: progress.ratingSystemSelected || false,
        ratingProvided: progress.ratingProvided || false,
        experienceSummaryCompleted: progress.experienceSummaryCompleted || false,
        equipmentPreferencesSet: progress.equipmentPreferencesSet || false,
        playStyleAssessed: progress.playStyleAssessed || false,
        initialAssessmentCompleted: progress.initialAssessmentCompleted || false,
        tourCompleted: progress.tourCompleted || false
      },
      preferences: {
        preferredDivision: progress.preferredDivision,
        preferredFormat: progress.preferredFormat,
        preferredRatingSystem: progress.preferredRatingSystem,
        experienceYears: progress.experienceYears
      },
      progress_pct: progressPct,
      nextStep,
      completed: progress.completedAt != null,
      xpEarned: progress.xpEarned || 0,
      completedAt: progress.completedAt
    };
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();