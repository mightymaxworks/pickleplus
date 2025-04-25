/**
 * PKL-278651-SAGE-0015-CONCIERGE
 * SAGE Recommendation Engine
 * 
 * This service provides personalized recommendations for platform features,
 * drills, and training plans based on the user's CourtIQ ratings and activity.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { DimensionCode } from '../../shared/schema/sage';
import { Recommendation } from '../../shared/schema/sage-concierge';
import { User } from '../../shared/schema';
import { storage } from '../storage';
import { knowledgeBase, PlatformFeature } from './sageKnowledgeBase';

/**
 * SAGE Recommendation Engine for providing intelligent suggestions
 */
export class SageRecommendationEngine {
  /**
   * Get a personalized set of recommendations for a user
   * 
   * @param userId The user ID to generate recommendations for
   * @returns A map of recommendation types to recommendation arrays
   */
  public async getPersonalizedRecommendations(userId: number): Promise<{
    features: Recommendation[];
    drills: Recommendation[];
    trainingPlans: Recommendation[];
    tournaments: Recommendation[];
  }> {
    return {
      features: await this.getFeatureRecommendations(userId),
      drills: await this.getDrillRecommendations(userId),
      trainingPlans: await this.getTrainingPlanRecommendations(userId),
      tournaments: await this.getTournamentRecommendations(userId)
    };
  }
  
  /**
   * Get recommendations based on type
   * 
   * @param userId The user ID to generate recommendations for
   * @param type The type of recommendations to get ('all', 'drill', 'tournament', etc.)
   * @returns Array of recommendations of the requested type
   */
  public async getRecommendations(
    userId: number, 
    type: 'all' | 'drill' | 'tournament' | 'match' | 'community' | 'training_plan' = 'all'
  ): Promise<Recommendation[]> {
    // Get all personalized recommendations
    const allRecommendations = await this.getPersonalizedRecommendations(userId);
    
    // Return the requested type or a combined list
    switch (type) {
      case 'drill':
        return allRecommendations.drills;
      case 'tournament':
        return allRecommendations.tournaments;
      case 'training_plan':
        return allRecommendations.trainingPlans;
      case 'all':
      default:
        // Combine all recommendation types
        return [
          ...allRecommendations.features,
          ...allRecommendations.drills,
          ...allRecommendations.trainingPlans,
          ...allRecommendations.tournaments
        ];
    }
  }
  
  /**
   * Generate recommendations for platform features based on user data
   * 
   * @param userId The user ID to generate recommendations for
   * @returns Array of recommended features
   */
  public async getFeatureRecommendations(userId: number): Promise<Recommendation[]> {
    try {
      // Get the user's CourtIQ ratings and profile completion
      const courtiqRatings = await storage.getCourtIQRatings(userId);
      const profileCompletion = await storage.getProfileCompletion(userId);
      const recentActivity = await storage.getUserRecentActivity(userId);
      
      const recommendations: Recommendation[] = [];
      
      // If profile is incomplete, recommend profile completion
      if (profileCompletion && profileCompletion.percentage < 80) {
        const profileFeature = knowledgeBase.findFeatureById('profile');
        if (profileFeature) {
          recommendations.push({
            id: 'profile_completion',
            type: 'feature',
            name: profileFeature.name,
            description: profileFeature.description,
            path: profileFeature.path,
            reason: 'Complete your profile to get more accurate recommendations'
          });
        }
      }
      
      // If user has CourtIQ ratings, recommend features based on lowest dimension
      if (courtiqRatings) {
        const weakestDimension = this.findWeakestDimension(courtiqRatings);
        const relatedFeatures = knowledgeBase.findFeaturesByDimension(weakestDimension);
        
        // Take top 2 features related to their weakest dimension
        for (let i = 0; i < Math.min(2, relatedFeatures.length); i++) {
          const feature = relatedFeatures[i];
          recommendations.push({
            id: feature.id,
            type: 'feature',
            name: feature.name,
            description: feature.description,
            path: feature.path,
            reason: `Helps improve your ${this.getDimensionName(weakestDimension).toLowerCase()}`,
            dimensionFocus: weakestDimension
          });
        }
      }
      
      // If user has limited recent activity, recommend popular features
      if (!recentActivity || recentActivity.length < 3) {
        // Add SAGE coaching as a recommendation if not already included
        const sageFeature = knowledgeBase.findFeatureById('sage_coaching');
        if (sageFeature && !recommendations.some(r => r.id === 'sage_coaching')) {
          recommendations.push({
            id: 'sage_coaching',
            type: 'feature',
            name: sageFeature.name,
            description: sageFeature.description,
            path: sageFeature.path,
            reason: 'Get personalized coaching advice to improve your game'
          });
        }
        
        // Add drills as a recommendation if not already included
        const drillsFeature = knowledgeBase.findFeatureById('drills');
        if (drillsFeature && !recommendations.some(r => r.id === 'drills')) {
          recommendations.push({
            id: 'drills',
            type: 'feature',
            name: drillsFeature.name,
            description: drillsFeature.description,
            path: drillsFeature.path,
            reason: 'Find specialized drills to practice and improve'
          });
        }
      }
      
      return recommendations.slice(0, 3); // Return top 3 recommendations
    } catch (error) {
      console.error('Error generating feature recommendations:', error);
      return [];
    }
  }
  
  /**
   * Generate recommendations for drills based on user's CourtIQ
   * 
   * @param userId The user ID to generate recommendations for
   * @returns Array of recommended drills
   */
  public async getDrillRecommendations(userId: number): Promise<Recommendation[]> {
    try {
      // Get user's CourtIQ ratings
      const courtiqRatings = await storage.getCourtIQRatings(userId);
      
      // Find the dimension with lowest rating
      const weakestDimension = this.findWeakestDimension(courtiqRatings);
      
      // Get user's skill level (1-5)
      const userSkillLevel = await this.getUserSkillLevel(userId);
      
      // Get appropriate drills for this dimension and skill level
      const drills = await storage.getDrillsByDimensionAndLevel(weakestDimension, userSkillLevel);
      
      // Map drills to recommendations
      return drills.slice(0, 3).map(drill => ({
        id: `drill_${drill.id}`,
        type: 'drill',
        name: drill.name,
        description: drill.description,
        path: `/drills/${drill.id}`,
        reason: `Improves your ${this.getDimensionName(weakestDimension).toLowerCase()}`,
        dimensionFocus: weakestDimension,
        score: drill.difficulty
      }));
    } catch (error) {
      console.error('Error generating drill recommendations:', error);
      return [];
    }
  }
  
  /**
   * Generate recommendations for training plans based on user data
   * 
   * @param userId The user ID to generate recommendations for
   * @returns Array of recommended training plans
   */
  public async getTrainingPlanRecommendations(userId: number): Promise<Recommendation[]> {
    try {
      // Get user's CourtIQ ratings
      const courtiqRatings = await storage.getCourtIQRatings(userId);
      
      // Find the dimension with lowest rating
      const weakestDimension = this.findWeakestDimension(courtiqRatings);
      
      // Get user's current training plans
      const currentPlans = await storage.getUserTrainingPlans(userId);
      
      // Get training plans focused on this dimension
      const trainingPlans = await storage.getTrainingPlansByDimension(weakestDimension);
      
      // Filter out plans the user is already following
      const filteredPlans = trainingPlans.filter(plan => 
        !currentPlans.some(userPlan => userPlan.planId === plan.id)
      );
      
      // Map plans to recommendations
      return filteredPlans.slice(0, 3).map(plan => ({
        id: `plan_${plan.id}`,
        type: 'training_plan',
        name: plan.name,
        description: plan.description,
        path: `/coach/sage?tab=structured&plan=${plan.id}`,
        reason: `Structured training to improve your ${this.getDimensionName(weakestDimension).toLowerCase()}`,
        dimensionFocus: weakestDimension
      }));
    } catch (error) {
      console.error('Error generating training plan recommendations:', error);
      return [];
    }
  }
  
  /**
   * Generate tournament recommendations based on skill level
   * 
   * @param userId The user ID to generate recommendations for
   * @returns Array of recommended tournaments
   */
  public async getTournamentRecommendations(userId: number): Promise<Recommendation[]> {
    try {
      // Get user's skill level
      const userSkillLevel = await this.getUserSkillLevel(userId);
      
      // Map skill level to tournament division (beginner, intermediate, advanced)
      let division = 'beginner';
      if (userSkillLevel >= 4) division = 'advanced';
      else if (userSkillLevel >= 2.5) division = 'intermediate';
      
      // Find tournaments matching skill level
      const tournaments = await storage.getTournamentsByDivision(division);
      
      // Map tournaments to recommendations
      return tournaments.slice(0, 3).map(tournament => ({
        id: `tournament_${tournament.id}`,
        type: 'tournament',
        name: tournament.name,
        description: tournament.description || `${tournament.name} - ${tournament.location}`,
        path: `/tournaments/${tournament.id}`,
        reason: `Tournament matched to your skill level`
      }));
    } catch (error) {
      console.error('Error generating tournament recommendations:', error);
      return [];
    }
  }
  
  /**
   * Find the user's weakest CourtIQ dimension
   * 
   * @param courtiqRatings The user's CourtIQ ratings object
   * @returns The dimension code with the lowest rating
   */
  private findWeakestDimension(courtiqRatings: any): DimensionCode {
    if (!courtiqRatings) {
      return 'TECH'; // Default to technical if no ratings exist
    }
    
    // Initialize with first dimension
    let lowestDimension: DimensionCode = 'TECH';
    let lowestRating = courtiqRatings.TECH || 3;
    
    // Check each dimension
    if ((courtiqRatings.TACT || 3) < lowestRating) {
      lowestDimension = 'TACT';
      lowestRating = courtiqRatings.TACT || 3;
    }
    
    if ((courtiqRatings.PHYS || 3) < lowestRating) {
      lowestDimension = 'PHYS';
      lowestRating = courtiqRatings.PHYS || 3;
    }
    
    if ((courtiqRatings.MENT || 3) < lowestRating) {
      lowestDimension = 'MENT';
      lowestRating = courtiqRatings.MENT || 3;
    }
    
    if ((courtiqRatings.CONS || 3) < lowestRating) {
      lowestDimension = 'CONS';
    }
    
    return lowestDimension;
  }
  
  /**
   * Get the user's overall skill level (1-5 scale)
   * 
   * @param userId The user ID to get skill level for
   * @returns Skill level from 1-5
   */
  private async getUserSkillLevel(userId: number): Promise<number> {
    try {
      // Get the user's CourtIQ ratings
      const courtiqRatings = await storage.getCourtIQRatings(userId);
      
      if (!courtiqRatings) {
        return 3; // Default to medium skill level
      }
      
      // Calculate average across all dimensions
      const dimensions: DimensionCode[] = ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS'];
      let total = 0;
      let count = 0;
      
      for (const dimension of dimensions) {
        if (courtiqRatings[dimension]) {
          total += courtiqRatings[dimension];
          count++;
        }
      }
      
      return count > 0 ? Math.round(total / count) : 3;
    } catch (error) {
      console.error('Error getting user skill level:', error);
      return 3; // Default to medium skill level
    }
  }
  
  /**
   * Get the dimension name for display
   * 
   * @param dimension The dimension code
   * @returns The full dimension name
   */
  private getDimensionName(dimension: DimensionCode): string {
    switch (dimension) {
      case 'TECH': return 'Technical Skills';
      case 'TACT': return 'Tactical Awareness';
      case 'PHYS': return 'Physical Fitness';
      case 'MENT': return 'Mental Toughness';
      case 'CONS': return 'Consistency';
      default: return 'Technical Skills';
    }
  }
}

// Export singleton instance for use across the application
export const recommendationEngine = new SageRecommendationEngine();