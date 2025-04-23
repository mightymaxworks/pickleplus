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
  type InsertOnboardingProgress,
  type OnboardingProgress
} from "../../../shared/courtiq-schema";
import { ratingConverter, RATING_SYSTEMS } from "../rating/ratingConverter";
import { serverEventBus } from "../../core/events/eventBus";
import { xpSystem } from "../xp/xpSystem";

// Helper types for SQL query results
type SqlRecord = Record<string, unknown>;
type SqlResult = any[] & { [key: number]: SqlRecord };
type SqlResultRow = SqlRecord;

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
      let progress = (progressResult as unknown as SqlResult)[0] as SqlResultRow;

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

      // Convert to OnboardingProgress if from SQL result
      const formattedProgress = this.convertToOnboardingProgress(progress);
      return this.formatOnboardingStatus(formattedProgress);
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
      await xpSystem.awardXP(userId.toString(), 50, "onboarding_step_completion", "Completed rating selection step in onboarding");

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
      const progress = (progressResult as unknown as SqlResult)[0] as SqlResultRow;

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
        const currentAdditionalData = (progress.additionalData || {}) as Record<string, any>;
        updates.additionalData = {
          ...currentAdditionalData,
          [step]: data
        };
      }
      
      // Update XP earned
      const currentXp = typeof progress.xpEarned === 'number' ? progress.xpEarned : 0;
      updates.xpEarned = currentXp + xpToAward;
      
      // Store preferences if provided
      if (data.preferredDivision) updates.preferredDivision = data.preferredDivision;
      if (data.preferredFormat) updates.preferredFormat = data.preferredFormat;
      
      // Update progress
      await db.update(onboardingProgress)
        .set(updates)
        .where(eq(onboardingProgress.userId, userId));
      
      // Award XP
      await xpSystem.awardXP(
        userId.toString(), 
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
      const updatedProgressResult = await db.execute(
        sql`SELECT * FROM onboarding_progress WHERE user_id = ${userId} LIMIT 1`
      );
      const updatedProgress = (updatedProgressResult as unknown as SqlResult)[0] as SqlResultRow;
      
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
      const progressResult = await db.execute(
        sql`SELECT completed_at FROM onboarding_progress WHERE user_id = ${userId} LIMIT 1`
      );
      const progress = (progressResult as unknown as SqlResult)[0] as SqlResultRow;
      
      return progress?.completed_at != null;
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
      const progressResult = await db.execute(
        sql`SELECT * FROM onboarding_progress WHERE user_id = ${userId} LIMIT 1`
      );
      const progress = (progressResult as unknown as SqlResult)[0] as SqlResultRow;
      
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
   * Convert a SQL record to OnboardingProgress type
   */
  private convertToOnboardingProgress(record: SqlResultRow | OnboardingProgress): OnboardingProgress {
    // If it's already an OnboardingProgress type, return it directly
    if ('userId' in record && 'profileCompleted' in record) {
      return record as OnboardingProgress;
    }
    
    // Convert from SQL row to OnboardingProgress
    const sqlRecord = record as Record<string, unknown>;
    return {
      id: Number(sqlRecord.id),
      userId: Number(sqlRecord.user_id),
      startedAt: sqlRecord.started_at ? new Date(sqlRecord.started_at as string) : null,
      completedAt: sqlRecord.completed_at ? new Date(sqlRecord.completed_at as string) : null,
      currentStep: sqlRecord.current_step as string | null,
      lastStepCompleted: sqlRecord.last_step_completed as string | null,
      lastStepCompletedAt: sqlRecord.last_step_completed_at ? new Date(sqlRecord.last_step_completed_at as string) : null,
      profileCompleted: Boolean(sqlRecord.profile_completed),
      ratingSystemSelected: Boolean(sqlRecord.rating_system_selected),
      ratingProvided: Boolean(sqlRecord.rating_provided),
      experienceSummaryCompleted: Boolean(sqlRecord.experience_summary_completed),
      equipmentPreferencesSet: Boolean(sqlRecord.equipment_preferences_set),
      playStyleAssessed: Boolean(sqlRecord.play_style_assessed),
      initialAssessmentCompleted: Boolean(sqlRecord.initial_assessment_completed),
      tourCompleted: Boolean(sqlRecord.tour_completed),
      preferredDivision: sqlRecord.preferred_division as string | null,
      preferredFormat: sqlRecord.preferred_format as string | null,
      preferredRatingSystem: sqlRecord.preferred_rating_system as string | null,
      experienceYears: sqlRecord.experience_years ? Number(sqlRecord.experience_years) : null,
      additionalData: sqlRecord.additional_data as Record<string, any> | null,
      deviceInfo: sqlRecord.device_info as string | null,
      referredBy: sqlRecord.referred_by as string | null,
      totalTimeSpentSeconds: sqlRecord.total_time_spent_seconds ? Number(sqlRecord.total_time_spent_seconds) : 0,
      xpEarned: sqlRecord.xp_earned ? Number(sqlRecord.xp_earned) : 0
    };
  }
  
  /**
   * Format onboarding status for API response
   */
  private formatOnboardingStatus(progress: SqlResultRow | OnboardingProgress): OnboardingStatus {
    // Convert to OnboardingProgress if it's a SQL record
    const formattedProgress = this.convertToOnboardingProgress(progress);
    // Calculate progress percentage
    const totalSteps = 8; // Total number of steps in onboarding
    const completedSteps = [
      formattedProgress.profileCompleted,
      formattedProgress.ratingSystemSelected,
      formattedProgress.ratingProvided,
      formattedProgress.experienceSummaryCompleted,
      formattedProgress.equipmentPreferencesSet,
      formattedProgress.playStyleAssessed,
      formattedProgress.initialAssessmentCompleted,
      formattedProgress.tourCompleted
    ].filter(Boolean).length;
    
    const progressPct = Math.round((completedSteps / totalSteps) * 100);
    
    // Determine next step
    let nextStep = formattedProgress.currentStep || 'welcome';
    if (formattedProgress.completedAt) {
      nextStep = 'completed';
    }
    
    return {
      userId: formattedProgress.userId,
      progress: {
        profileCompleted: formattedProgress.profileCompleted || false,
        ratingSystemSelected: formattedProgress.ratingSystemSelected || false,
        ratingProvided: formattedProgress.ratingProvided || false,
        experienceSummaryCompleted: formattedProgress.experienceSummaryCompleted || false,
        equipmentPreferencesSet: formattedProgress.equipmentPreferencesSet || false,
        playStyleAssessed: formattedProgress.playStyleAssessed || false,
        initialAssessmentCompleted: formattedProgress.initialAssessmentCompleted || false,
        tourCompleted: formattedProgress.tourCompleted || false
      },
      preferences: {
        preferredDivision: formattedProgress.preferredDivision ?? undefined,
        preferredFormat: formattedProgress.preferredFormat ?? undefined,
        preferredRatingSystem: formattedProgress.preferredRatingSystem ?? undefined,
        experienceYears: formattedProgress.experienceYears ?? undefined
      },
      progress_pct: progressPct,
      nextStep,
      completed: formattedProgress.completedAt != null,
      xpEarned: formattedProgress.xpEarned || 0,
      completedAt: formattedProgress.completedAt ?? undefined
    };
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();