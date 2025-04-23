/**
 * CourtIQ™ Rating System Calculation Engine
 * PKL-278651-RATINGS-0001-COURTIQ - Multi-dimensional Rating System
 * 
 * This service handles the complex calculations for updating player ratings
 * based on match assessments and other rating impacts.
 */

import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  courtiqUserRatings, courtiqRatingImpacts, matchAssessments, courtiqCalculationRules,
  type CourtiqUserRating, type InsertCourtiqUserRating,
  type MatchAssessment, type CourtiqRatingImpact
} from "@shared/schema/courtiq";
import { courtiqStorage } from "./courtiq-storage";

// Define rating dimension types
export type RatingDimension = "TECH" | "TACT" | "PHYS" | "MENT" | "CONS" | "OVERALL";
export type AssessmentType = "self" | "opponent" | "coach" | "system";

/**
 * CourtIQ Calculation Engine
 * Handles all rating calculations for the CourtIQ™ system
 */
class CourtIQCalculationEngine {
  // Default weighting factors if no rules are defined in the database
  private defaultWeights = {
    self: 20,     // Self-assessment (20%)
    opponent: 30,  // Opponent assessment (30%)
    coach: 40,     // Coach assessment (40%)
    system: 10     // System-derived assessments (10%)
  };

  // Default weight for the overall rating calculation
  private dimensionWeights = {
    TECH: 25,   // Technical skills (25%)
    TACT: 25,   // Tactical awareness (25%)
    PHYS: 15,   // Physical fitness (15%)
    MENT: 20,   // Mental toughness (20%)
    CONS: 15    // Consistency (15%)
  };

  /**
   * Get the current calculation rules from the database
   * @param dimension The rating dimension
   * @returns The calculation rules for the dimension
   */
  private async getCalculationRules(dimension: RatingDimension) {
    try {
      const [rules] = await db
        .select()
        .from(courtiqCalculationRules)
        .where(eq(courtiqCalculationRules.dimension, dimension))
        .orderBy(desc(courtiqCalculationRules.activeFrom))
        .limit(1);
      
      return rules;
    } catch (error) {
      console.error(`Error getting calculation rules for ${dimension}:`, error);
      return null;
    }
  }

  /**
   * Get the assessment weights for a specific dimension
   * @param dimension The rating dimension
   * @returns The weight factors for different assessment types
   */
  private async getAssessmentWeights(dimension: RatingDimension) {
    const rules = await this.getCalculationRules(dimension);
    
    if (!rules) {
      return this.defaultWeights;
    }
    
    return {
      self: rules.selfAssessmentWeight,
      opponent: rules.opponentAssessmentWeight,
      coach: rules.coachAssessmentWeight,
      system: rules.derivedAssessmentWeight
    };
  }

  /**
   * Calculate the weighted average for a set of assessments
   * @param assessments Assessment data points
   * @param weights Weight factors for different assessment types
   * @param dimension The rating dimension to extract from assessments
   * @returns The weighted average rating
   */
  private calculateWeightedAverage(
    assessments: MatchAssessment[],
    weights: Record<AssessmentType, number | null>,
    dimension: RatingDimension
  ): number {
    if (assessments.length === 0) {
      return 0;
    }
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    // Group assessments by type
    const assessmentsByType: Record<string, MatchAssessment[]> = {
      self: [],
      opponent: [],
      coach: [],
      system: []
    };
    
    assessments.forEach(assessment => {
      const type = assessment.assessmentType as AssessmentType;
      if (assessmentsByType[type]) {
        assessmentsByType[type].push(assessment);
      }
    });
    
    // Process each assessment type
    Object.entries(assessmentsByType).forEach(([type, typeAssessments]) => {
      if (typeAssessments.length === 0) {
        return;
      }
      
      const typeWeight = weights[type as AssessmentType];
      if (!typeWeight || typeWeight <= 0) {
        return;
      }
      
      // Calculate average rating for this assessment type
      let typeSum = 0;
      typeAssessments.forEach(assessment => {
        // Extract the rating value for the specified dimension
        let rating = 0;
        
        if (dimension === 'TECH') {
          rating = assessment.technicalRating || 0;
        } else if (dimension === 'TACT') {
          rating = assessment.tacticalRating || 0;
        } else if (dimension === 'PHYS') {
          rating = assessment.physicalRating || 0;
        } else if (dimension === 'MENT') {
          rating = assessment.mentalRating || 0;
        } else if (dimension === 'CONS') {
          rating = assessment.consistencyRating || 0;
        }
        
        typeSum += rating;
      });
      
      const typeAverage = typeSum / typeAssessments.length;
      
      // Add to the weighted sum
      weightedSum += typeAverage * (typeWeight || 0);
      totalWeight += (typeWeight || 0);
    });
    
    // Calculate final weighted average
    if (totalWeight === 0) {
      return 0;
    }
    
    return weightedSum / totalWeight;
  }

  /**
   * Calculate overall rating from individual dimension ratings
   * @param ratings Individual dimension ratings
   * @returns Overall CourtIQ™ rating
   */
  private calculateOverallRating(ratings: {
    technical: number;
    tactical: number;
    physical: number;
    mental: number;
    consistency: number;
  }): number {
    // Apply dimension weights to calculate overall rating
    const overall = 
      (ratings.technical * this.dimensionWeights.TECH +
      ratings.tactical * this.dimensionWeights.TACT +
      ratings.physical * this.dimensionWeights.PHYS +
      ratings.mental * this.dimensionWeights.MENT +
      ratings.consistency * this.dimensionWeights.CONS) / 100;
    
    // Round to nearest tenth
    return Math.round(overall * 10) / 10;
  }

  /**
   * Calculate confidence score based on assessment data
   * @param assessmentCounts Number of assessments per type
   * @returns Confidence score (0-100)
   */
  private calculateConfidenceScore(assessmentCounts: {
    self: number;
    opponent: number;
    coach: number;
    system: number;
  }): number {
    // Base confidence factors
    const baseFactor = 20; // At least some data
    const diversityFactor = 40; // Having assessments from multiple sources
    const volumeFactor = 40; // Having sufficient volume of assessments
    
    // Calculate base confidence - having any data at all
    let confidence = 0;
    const totalAssessments = 
      assessmentCounts.self + 
      assessmentCounts.opponent + 
      assessmentCounts.coach + 
      assessmentCounts.system;
    
    if (totalAssessments > 0) {
      confidence += baseFactor;
    }
    
    // Calculate diversity confidence - more diverse sources = higher confidence
    const sourceCount = Object.values(assessmentCounts).filter(count => count > 0).length;
    confidence += (sourceCount / 4) * diversityFactor;
    
    // Calculate volume confidence
    // Define thresholds for "sufficient" data (arbitrary numbers for demonstration)
    const thresholds = {
      self: 1,
      opponent: 5,
      coach: 2,
      system: 10
    };
    
    // Calculate what percentage of each threshold has been met (capped at 100%)
    const percentages = {
      self: Math.min(assessmentCounts.self / thresholds.self, 1),
      opponent: Math.min(assessmentCounts.opponent / thresholds.opponent, 1),
      coach: Math.min(assessmentCounts.coach / thresholds.coach, 1),
      system: Math.min(assessmentCounts.system / thresholds.system, 1)
    };
    
    // Weight the percentages by the assessment weights
    const volumeScore = (
      percentages.self * this.defaultWeights.self +
      percentages.opponent * this.defaultWeights.opponent +
      percentages.coach * this.defaultWeights.coach +
      percentages.system * this.defaultWeights.system
    ) / 100;
    
    confidence += volumeScore * volumeFactor;
    
    // Ensure confidence is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  /**
   * Process a new match assessment and update player ratings
   * @param assessment The match assessment to process
   * @returns The updated player rating data
   */
  async processMatchAssessment(assessment: MatchAssessment): Promise<CourtiqUserRating> {
    try {
      // Get current user rating
      let userRating = await courtiqStorage.getUserRatings(assessment.targetId);
      
      // Get all assessments for this user
      const userAssessments = await courtiqStorage.getUserAssessments(assessment.targetId);
      
      // Add the new assessment if it's not already in the list
      const assessmentExists = userAssessments.some(a => 
        a.matchId === assessment.matchId && 
        a.assessorId === assessment.assessorId && 
        a.targetId === assessment.targetId
      );
      
      if (!assessmentExists) {
        userAssessments.push(assessment);
      }
      
      // Count assessments by type
      const assessmentCounts = {
        self: userAssessments.filter(a => a.assessmentType === 'self').length,
        opponent: userAssessments.filter(a => a.assessmentType === 'opponent').length,
        coach: userAssessments.filter(a => a.assessmentType === 'coach').length,
        system: userAssessments.filter(a => a.assessmentType === 'system').length
      };
      
      // Get weights for each dimension
      const techWeights = await this.getAssessmentWeights('TECH');
      const tactWeights = await this.getAssessmentWeights('TACT');
      const physWeights = await this.getAssessmentWeights('PHYS');
      const mentWeights = await this.getAssessmentWeights('MENT');
      const consWeights = await this.getAssessmentWeights('CONS');
      
      // Calculate ratings for each dimension
      const technicalRating = this.calculateWeightedAverage(userAssessments, techWeights, 'TECH');
      const tacticalRating = this.calculateWeightedAverage(userAssessments, tactWeights, 'TACT');
      const physicalRating = this.calculateWeightedAverage(userAssessments, physWeights, 'PHYS');
      const mentalRating = this.calculateWeightedAverage(userAssessments, mentWeights, 'MENT');
      const consistencyRating = this.calculateWeightedAverage(userAssessments, consWeights, 'CONS');
      
      // Calculate overall rating
      const overallRating = this.calculateOverallRating({
        technical: technicalRating,
        tactical: tacticalRating,
        physical: physicalRating,
        mental: mentalRating,
        consistency: consistencyRating
      });
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(assessmentCounts);
      
      // Create rating data
      const ratingData: InsertCourtiqUserRating = {
        userId: assessment.targetId,
        technicalRating: Math.round(technicalRating * 10) / 10,
        tacticalRating: Math.round(tacticalRating * 10) / 10,
        physicalRating: Math.round(physicalRating * 10) / 10,
        mentalRating: Math.round(mentalRating * 10) / 10,
        consistencyRating: Math.round(consistencyRating * 10) / 10,
        overallRating: Math.round(overallRating * 10) / 10,
        confidenceScore,
        assessmentCount: userAssessments.length
      };
      
      // Save updated rating
      const updatedRating = await courtiqStorage.saveUserRatings(ratingData);
      
      // Record rating impacts for each dimension
      await this.recordRatingImpacts(assessment);
      
      return updatedRating;
    } catch (error) {
      console.error("Error processing match assessment:", error);
      throw error;
    }
  }

  /**
   * Record rating impacts from a match assessment
   * @param assessment The match assessment to record impacts for
   */
  private async recordRatingImpacts(assessment: MatchAssessment): Promise<void> {
    try {
      // Record impact for each dimension
      const dimensions: ("TECH" | "TACT" | "PHYS" | "MENT" | "CONS")[] = ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS'];
      const assessmentType = assessment.assessmentType;
      
      // Calculate the weight for this assessment type
      let weight = 100; // Default
      
      // Adjust weight based on assessment type
      if (assessmentType === 'self') {
        weight = this.defaultWeights.self;
      } else if (assessmentType === 'opponent') {
        weight = this.defaultWeights.opponent;
      } else if (assessmentType === 'coach') {
        weight = this.defaultWeights.coach;
      } else if (assessmentType === 'system') {
        weight = this.defaultWeights.system;
      }
      
      // Create impact records for each dimension
      for (const dimension of dimensions) {
        let ratingValue = 0;
        
        // Extract the appropriate rating value based on dimension
        if (dimension === 'TECH') {
          ratingValue = assessment.technicalRating || 0;
        } else if (dimension === 'TACT') {
          ratingValue = assessment.tacticalRating || 0;
        } else if (dimension === 'PHYS') {
          ratingValue = assessment.physicalRating || 0;
        } else if (dimension === 'MENT') {
          ratingValue = assessment.mentalRating || 0;
        } else if (dimension === 'CONS') {
          ratingValue = assessment.consistencyRating || 0;
        }
        
        // Record the impact
        await courtiqStorage.recordRatingImpact({
          userId: assessment.targetId,
          matchId: assessment.matchId,
          dimension,
          impactValue: ratingValue,
          impactWeight: weight,
          reason: assessment.assessmentType
        });
      }
    } catch (error) {
      console.error("Error recording rating impacts:", error);
      throw error;
    }
  }

  /**
   * Calculate dimension strengths and weaknesses for a player
   * @param userId The user to analyze
   * @returns Analysis of player strengths and weaknesses
   */
  async analyzePlayerStrengthsWeaknesses(userId: number): Promise<{
    strengths: Array<{dimension: RatingDimension, rating: number}>;
    weaknesses: Array<{dimension: RatingDimension, rating: number}>;
    analysis: string;
  }> {
    try {
      // Get user ratings
      const userRating = await courtiqStorage.getUserRatings(userId);
      
      if (!userRating) {
        return {
          strengths: [],
          weaknesses: [],
          analysis: "Insufficient data to analyze player strengths and weaknesses."
        };
      }
      
      // Create array of dimensions and ratings
      const dimensions: Array<{dimension: RatingDimension, rating: number}> = [
        {dimension: 'TECH', rating: userRating.technicalRating || 0},
        {dimension: 'TACT', rating: userRating.tacticalRating || 0},
        {dimension: 'PHYS', rating: userRating.physicalRating || 0},
        {dimension: 'MENT', rating: userRating.mentalRating || 0},
        {dimension: 'CONS', rating: userRating.consistencyRating || 0}
      ];
      
      // Sort by rating (descending for strengths, ascending for weaknesses)
      const sorted = [...dimensions].sort((a, b) => b.rating - a.rating);
      
      // Get top 2 strengths and weaknesses
      const strengths = sorted.slice(0, 2);
      const weaknesses = [...sorted].sort((a, b) => a.rating - b.rating).slice(0, 2);
      
      // Generate analysis text
      let analysis = "";
      
      if (!userRating.confidenceScore || userRating.confidenceScore < 30) {
        analysis = "This analysis is based on limited data and may not fully represent the player's abilities.";
      } else {
        analysis = `Player demonstrates notable strength in ${this.getDimensionName(strengths[0].dimension)} `;
        analysis += `(${strengths[0].rating}/5) and ${this.getDimensionName(strengths[1].dimension)} (${strengths[1].rating}/5). `;
        analysis += `Areas for improvement include ${this.getDimensionName(weaknesses[0].dimension)} `;
        analysis += `(${weaknesses[0].rating}/5) and ${this.getDimensionName(weaknesses[1].dimension)} (${weaknesses[1].rating}/5).`;
      }
      
      return {
        strengths,
        weaknesses,
        analysis
      };
    } catch (error) {
      console.error("Error analyzing player strengths and weaknesses:", error);
      return {
        strengths: [],
        weaknesses: [],
        analysis: "Error analyzing player data."
      };
    }
  }

  /**
   * Get a friendly name for a dimension code
   * @param dimension Dimension code
   * @returns User-friendly dimension name
   */
  private getDimensionName(dimension: RatingDimension): string {
    switch (dimension) {
      case 'TECH': return 'Technical Skills';
      case 'TACT': return 'Tactical Awareness';
      case 'PHYS': return 'Physical Fitness';
      case 'MENT': return 'Mental Toughness';
      case 'CONS': return 'Consistency';
      case 'OVERALL': return 'Overall Rating';
      default: return dimension;
    }
  }

  /**
   * Generate coaching recommendations based on player ratings
   * @param userId The user to generate recommendations for
   * @returns Coaching recommendations
   */
  async generateCoachingRecommendations(userId: number): Promise<{
    priorityArea: string;
    recommendations: Record<RatingDimension, string>;
    overallAdvice: string;
  }> {
    try {
      // Get user ratings
      const userRating = await courtiqStorage.getUserRatings(userId);
      
      if (!userRating) {
        return {
          priorityArea: "Get Rated",
          recommendations: {
            TECH: "Get assessed to receive technical recommendations.",
            TACT: "Get assessed to receive tactical recommendations.",
            PHYS: "Get assessed to receive physical conditioning recommendations.",
            MENT: "Get assessed to receive mental game recommendations.", 
            CONS: "Get assessed to receive consistency recommendations.",
            OVERALL: "Complete your initial assessments to unlock CourtIQ™ coaching recommendations."
          },
          overallAdvice: "Complete your player profile and participate in assessments to unlock personalized coaching recommendations."
        };
      }
      
      // Identify the lowest-rated dimension
      const dimensions: Array<{dimension: RatingDimension, rating: number}> = [
        {dimension: 'TECH', rating: userRating.technicalRating || 0},
        {dimension: 'TACT', rating: userRating.tacticalRating || 0},
        {dimension: 'PHYS', rating: userRating.physicalRating || 0},
        {dimension: 'MENT', rating: userRating.mentalRating || 0},
        {dimension: 'CONS', rating: userRating.consistencyRating || 0}
      ];
      
      // Sort by rating (ascending to get weakest areas first)
      const sorted = [...dimensions].sort((a, b) => a.rating - b.rating);
      const lowestDimension = sorted[0].dimension;
      
      // Generate recommendations for each dimension
      const recommendations: Record<RatingDimension, string> = {
        TECH: this.getTechnicalRecommendation(userRating.technicalRating || 0),
        TACT: this.getTacticalRecommendation(userRating.tacticalRating || 0),
        PHYS: this.getPhysicalRecommendation(userRating.physicalRating || 0),
        MENT: this.getMentalRecommendation(userRating.mentalRating || 0),
        CONS: this.getConsistencyRecommendation(userRating.consistencyRating || 0),
        OVERALL: `Focus on improving your ${this.getDimensionName(lowestDimension).toLowerCase()} to see the biggest overall improvement in your game.`
      };
      
      // Generate overall advice
      const overallAdvice = !userRating.confidenceScore || userRating.confidenceScore < 50
        ? `Continue participating in matches and assessments to improve the accuracy of your CourtIQ™ ratings and receive more tailored recommendations.`
        : `Your ${this.getDimensionName(lowestDimension).toLowerCase()} is your biggest area for improvement. ${recommendations[lowestDimension]}`;
      
      return {
        priorityArea: this.getDimensionName(lowestDimension),
        recommendations,
        overallAdvice
      };
    } catch (error) {
      console.error("Error generating coaching recommendations:", error);
      return {
        priorityArea: "Error",
        recommendations: {
          TECH: "Error generating recommendations.",
          TACT: "Error generating recommendations.",
          PHYS: "Error generating recommendations.",
          MENT: "Error generating recommendations.",
          CONS: "Error generating recommendations.",
          OVERALL: "Error generating recommendations."
        },
        overallAdvice: "An error occurred while generating coaching recommendations."
      };
    }
  }

  /**
   * Get technical skill recommendation based on rating
   * @param rating Technical rating
   * @returns Recommendation for technical improvement
   */
  private getTechnicalRecommendation(rating: number): string {
    // Beginner recommendations
    if (rating < 2) {
      return "Focus on basic paddle grip and swing mechanics. Practice dinking drills to develop touch and control.";
    }
    // Intermediate recommendations
    else if (rating < 3.5) {
      return "Work on third-shot drops and developing consistent serving patterns. Incorporate volley practice into your routine.";
    }
    // Advanced recommendations
    else if (rating < 4.5) {
      return "Refine your attacking shots, including drive volleys and overhead smashes. Add spin variations to your serves and returns.";
    }
    // Expert recommendations
    else {
      return "Focus on subtle technical refinements and shot disguise. Work with a coach on video analysis to identify minor form adjustments.";
    }
  }

  /**
   * Get tactical recommendation based on rating
   * @param rating Tactical rating
   * @returns Recommendation for tactical improvement
   */
  private getTacticalRecommendation(rating: number): string {
    // Beginner recommendations
    if (rating < 2) {
      return "Learn basic court positioning and kitchen rules. Focus on keeping the ball in play rather than going for winners.";
    }
    // Intermediate recommendations
    else if (rating < 3.5) {
      return "Study patterns of play and work on transitioning from baseline to kitchen. Begin learning about stacking strategies.";
    }
    // Advanced recommendations
    else if (rating < 4.5) {
      return "Develop situational awareness and anticipation. Practice offensive and defensive positioning adjustments based on opponents.";
    }
    // Expert recommendations
    else {
      return "Refine advanced strategies like Erne shots, around-the-post techniques, and situation-specific stacking arrangements.";
    }
  }

  /**
   * Get physical recommendation based on rating
   * @param rating Physical fitness rating
   * @returns Recommendation for physical improvement
   */
  private getPhysicalRecommendation(rating: number): string {
    // Beginner recommendations
    if (rating < 2) {
      return "Build basic endurance with regular aerobic exercise and incorporate light agility drills into your routine.";
    }
    // Intermediate recommendations
    else if (rating < 3.5) {
      return "Add specific footwork drills and lateral movement exercises. Begin incorporating pickleball-specific conditioning.";
    }
    // Advanced recommendations
    else if (rating < 4.5) {
      return "Implement a structured strength and conditioning program with focus on explosive movements and recovery techniques.";
    }
    // Expert recommendations
    else {
      return "Work with a sports performance coach on periodized training plans and recovery protocols to maintain peak physical condition.";
    }
  }

  /**
   * Get mental recommendation based on rating
   * @param rating Mental toughness rating
   * @returns Recommendation for mental game improvement
   */
  private getMentalRecommendation(rating: number): string {
    // Beginner recommendations
    if (rating < 2) {
      return "Focus on enjoying the game and staying positive after mistakes. Practice basic visualization techniques before matches.";
    }
    // Intermediate recommendations
    else if (rating < 3.5) {
      return "Develop pre-point routines and work on maintaining focus during longer points. Practice mindfulness techniques for pressure situations.";
    }
    // Advanced recommendations
    else if (rating < 4.5) {
      return "Incorporate structured mental game practice including visualization, self-talk monitoring, and emotional regulation during competitive play.";
    }
    // Expert recommendations
    else {
      return "Work with a sports psychologist on advanced mental performance training and competitive mindset development specific to tournament play.";
    }
  }

  /**
   * Get consistency recommendation based on rating
   * @param rating Consistency rating
   * @returns Recommendation for consistency improvement
   */
  private getConsistencyRecommendation(rating: number): string {
    // Beginner recommendations
    if (rating < 2) {
      return "Practice simple dinking drills focusing on getting 10+ shots in a row. Track your unforced errors during practice sessions.";
    }
    // Intermediate recommendations
    else if (rating < 3.5) {
      return "Implement deliberate practice routines that target consistent shot execution under various conditions and pressure scenarios.";
    }
    // Advanced recommendations
    else if (rating < 4.5) {
      return "Add fatigue and distraction elements to your practice routines to build resilience. Track performance metrics across different match situations.";
    }
    // Expert recommendations
    else {
      return "Fine-tune your adaptation to different playing surfaces, weather conditions, and opponent styles to maintain consistency in all environments.";
    }
  }
}

export const courtiqCalculator = new CourtIQCalculationEngine();