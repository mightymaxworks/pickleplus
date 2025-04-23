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
      if (typeWeight <= 0) {
        return;
      }
      
      // Calculate average rating for this assessment type
      let typeSum = 0;
      typeAssessments.forEach(assessment => {
        // Extract the rating value for the specified dimension
        let rating = 0;
        
        if (dimension === 'TECH') {
          rating = assessment.technicalRating;
        } else if (dimension === 'TACT') {
          rating = assessment.tacticalRating;
        } else if (dimension === 'PHYS') {
          rating = assessment.physicalRating;
        } else if (dimension === 'MENT') {
          rating = assessment.mentalRating;
        } else if (dimension === 'CONS') {
          rating = assessment.consistencyRating;
        }
        
        typeSum += rating;
      });
      
      const typeAverage = typeSum / typeAssessments.length;
      
      // Add to the weighted sum
      weightedSum += typeAverage * typeWeight;
      totalWeight += typeWeight;
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
      const dimensions: RatingDimension[] = ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS'];
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
          ratingValue = assessment.technicalRating;
        } else if (dimension === 'TACT') {
          ratingValue = assessment.tacticalRating;
        } else if (dimension === 'PHYS') {
          ratingValue = assessment.physicalRating;
        } else if (dimension === 'MENT') {
          ratingValue = assessment.mentalRating;
        } else if (dimension === 'CONS') {
          ratingValue = assessment.consistencyRating;
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
        {dimension: 'TECH', rating: userRating.technicalRating},
        {dimension: 'TACT', rating: userRating.tacticalRating},
        {dimension: 'PHYS', rating: userRating.physicalRating},
        {dimension: 'MENT', rating: userRating.mentalRating},
        {dimension: 'CONS', rating: userRating.consistencyRating}
      ];
      
      // Sort by rating (descending for strengths, ascending for weaknesses)
      const sorted = [...dimensions].sort((a, b) => b.rating - a.rating);
      
      // Get top 2 strengths and weaknesses
      const strengths = sorted.slice(0, 2);
      const weaknesses = [...sorted].sort((a, b) => a.rating - b.rating).slice(0, 2);
      
      // Generate analysis text
      let analysis = "";
      
      if (userRating.confidenceScore < 30) {
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
      throw error;
    }
  }

  /**
   * Get the full name of a rating dimension
   * @param dimension The dimension code
   * @returns The full dimension name
   */
  private getDimensionName(dimension: RatingDimension): string {
    const names: Record<RatingDimension, string> = {
      TECH: "Technical Skills",
      TACT: "Tactical Awareness",
      PHYS: "Physical Fitness",
      MENT: "Mental Toughness",
      CONS: "Consistency",
      OVERALL: "Overall Rating"
    };
    
    return names[dimension] || dimension;
  }

  /**
   * Generate coaching recommendations based on player ratings
   * @param userId The user to generate recommendations for
   * @returns Coaching recommendations
   */
  async generateCoachingRecommendations(userId: number): Promise<{
    recommendations: Array<{dimension: RatingDimension, recommendation: string}>;
    priorityArea: RatingDimension;
    overallAdvice: string;
  }> {
    try {
      // Get user ratings
      const userRating = await courtiqStorage.getUserRatings(userId);
      
      if (!userRating) {
        return {
          recommendations: [],
          priorityArea: 'OVERALL',
          overallAdvice: "Complete at least 3 match assessments to receive coaching recommendations."
        };
      }
      
      // Create array of dimensions and ratings
      const dimensions: Array<{dimension: RatingDimension, rating: number}> = [
        {dimension: 'TECH', rating: userRating.technicalRating},
        {dimension: 'TACT', rating: userRating.tacticalRating},
        {dimension: 'PHYS', rating: userRating.physicalRating},
        {dimension: 'MENT', rating: userRating.mentalRating},
        {dimension: 'CONS', rating: userRating.consistencyRating}
      ];
      
      // Sort by rating (ascending to find the weakest areas)
      const sorted = [...dimensions].sort((a, b) => a.rating - b.rating);
      
      // Find the priority area (weakest dimension)
      const priorityArea = sorted[0].dimension;
      
      // Generate recommendations for each dimension
      const recommendations = dimensions.map(({dimension, rating}) => {
        return {
          dimension,
          recommendation: this.getRecommendationForDimension(dimension, rating)
        };
      });
      
      // Generate overall advice
      let overallAdvice = "";
      
      if (userRating.confidenceScore < 30) {
        overallAdvice = "These recommendations are based on limited data. Continue completing match assessments to receive more accurate coaching advice.";
      } else {
        overallAdvice = `Focus on improving ${this.getDimensionName(priorityArea)} as your primary development area. `;
        overallAdvice += `Your current overall CourtIQ™ rating is ${userRating.overallRating}/5, `;
        overallAdvice += `which indicates ${this.getSkillLevelDescription(userRating.overallRating)}.`;
      }
      
      return {
        recommendations,
        priorityArea,
        overallAdvice
      };
    } catch (error) {
      console.error("Error generating coaching recommendations:", error);
      throw error;
    }
  }

  /**
   * Get a recommendation for a specific dimension and rating level
   * @param dimension The dimension to get a recommendation for
   * @param rating The current rating level
   * @returns A coaching recommendation
   */
  private getRecommendationForDimension(dimension: RatingDimension, rating: number): string {
    // Basic recommendations based on rating level
    if (rating < 2) {
      // Beginner recommendations
      if (dimension === 'TECH') {
        return "Focus on fundamental stroke mechanics and proper grip techniques. Practice basic dinks and drives.";
      } else if (dimension === 'TACT') {
        return "Learn the basic strategies of the game, including court positioning and the 'third shot drop'.";
      } else if (dimension === 'PHYS') {
        return "Work on basic movement patterns and quick directional changes to improve court coverage.";
      } else if (dimension === 'MENT') {
        return "Practice maintaining focus during basic rallies and develop a pre-serve routine.";
      } else if (dimension === 'CONS') {
        return "Focus on making clean contact with the ball and keeping simple shots in play consistently.";
      }
    } else if (rating < 3.5) {
      // Intermediate recommendations
      if (dimension === 'TECH') {
        return "Refine your shot arsenal with targeted practice on spin control and placement accuracy.";
      } else if (dimension === 'TACT') {
        return "Develop awareness of opponent patterns and practice adjusting your strategy mid-match.";
      } else if (dimension === 'PHYS') {
        return "Incorporate agility drills and reaction time exercises into your training regimen.";
      } else if (dimension === 'MENT') {
        return "Work on resilience after errors and maintain positive self-talk throughout matches.";
      } else if (dimension === 'CONS') {
        return "Practice pressure situations to improve consistency when it matters most.";
      }
    } else {
      // Advanced recommendations
      if (dimension === 'TECH') {
        return "Fine-tune advanced shots like around-the-post winners and specialized serves.";
      } else if (dimension === 'TACT') {
        return "Develop multi-step strategic thinking and work on disguising your shot intentions.";
      } else if (dimension === 'PHYS') {
        return "Optimize explosive movements and recovery techniques for maximum court coverage.";
      } else if (dimension === 'MENT') {
        return "Master strategic timeout usage and develop routines for maintaining focus in high-pressure situations.";
      } else if (dimension === 'CONS') {
        return "Work on maintaining performance quality across different playing conditions and match durations.";
      }
    }
    
    return "Continue practicing regularly to further develop your skills.";
  }

  /**
   * Get a description of a player's skill level based on overall rating
   * @param rating The overall rating
   * @returns A description of the skill level
   */
  private getSkillLevelDescription(rating: number): string {
    if (rating < 1.5) {
      return "beginner level play with significant room for improvement";
    } else if (rating < 2.5) {
      return "developing fundamentals with some core skills established";
    } else if (rating < 3.5) {
      return "intermediate play with solid fundamentals and developing advanced skills";
    } else if (rating < 4.5) {
      return "advanced play with well-rounded abilities and few weaknesses";
    } else {
      return "elite level play with exceptional skill across all dimensions";
    }
  }
}

// Export a singleton instance
export const courtiqCalculator = new CourtIQCalculationEngine();