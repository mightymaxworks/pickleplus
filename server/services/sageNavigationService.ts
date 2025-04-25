/**
 * PKL-278651-SAGE-0015-CONCIERGE
 * SAGE Navigation Service
 * 
 * This service handles navigation intent recognition and platform
 * navigation actions for the SAGE concierge functionality.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { DimensionCode } from '../../shared/schema/sage';
import { UserRole, NavigationTypeString, NavigationAction } from '../../shared/schema/sage-concierge';
import { User } from '../../shared/schema';
import { storage } from '../storage';
import { knowledgeBase, PlatformFeature } from './sageKnowledgeBase';

/**
 * SAGE Navigation Service for handling platform navigation
 */
export class SageNavigationService {
  /**
   * Extract keywords from user message for feature matching
   * 
   * @param message The user message to analyze
   * @returns Array of extracted keywords
   */
  private extractKeywords(message: string): string[] {
    const keywords: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Remove common stop words and split into individual words
    const words = lowerMessage
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !['the', 'and', 'for', 'with', 'about', 'from', 'that', 'have', 'this', 'what'].includes(word)
      );
    
    // Add individual words as keywords
    keywords.push(...words);
    
    // Look for specific feature phrases
    const phrases = [
      'training plan',
      'match history',
      'record match',
      'court iq',
      'courtiq',
      'pickleball drills',
      'mastery path',
      'sage coach',
      'skill assessment',
      'performance journal'
    ];
    
    for (const phrase of phrases) {
      if (lowerMessage.includes(phrase)) {
        keywords.push(phrase);
      }
    }
    
    return [...new Set(keywords)]; // Remove duplicates
  }
  
  /**
   * Find the most relevant feature based on extracted keywords
   * 
   * @param keywords The keywords to match against features
   * @returns The most relevant feature or undefined if no match
   */
  private findFeatureByKeywords(keywords: string[]): PlatformFeature | undefined {
    const matchedFeatures = knowledgeBase.findFeaturesByKeywords(keywords);
    return matchedFeatures.length > 0 ? matchedFeatures[0] : undefined;
  }
  
  /**
   * Find a feature related to a specific dimension
   * 
   * @param dimension The dimension code to find features for
   * @returns A feature related to this dimension
   */
  private findFeatureByDimension(dimension: DimensionCode): PlatformFeature | undefined {
    const relatedFeatures = knowledgeBase.findFeaturesByDimension(dimension);
    return relatedFeatures.length > 0 ? relatedFeatures[0] : undefined;
  }
  
  /**
   * Get the user's lowest CourtIQ dimension ratings
   * 
   * @param userId The user ID to check
   * @returns Array of dimension codes sorted by rating (lowest first)
   */
  private async getUserWeakestDimensions(userId: number): Promise<DimensionCode[]> {
    try {
      // Get the user's CourtIQ ratings
      const courtiqRatings = await storage.getCourtIQRatings(userId);
      
      if (!courtiqRatings) {
        return ['TECH']; // Default to technical if no ratings exist
      }
      
      // Convert to array and sort by rating (ascending)
      const dimensionRatings = [
        { dimension: 'TECH' as DimensionCode, rating: courtiqRatings.TECH || 3 },
        { dimension: 'TACT' as DimensionCode, rating: courtiqRatings.TACT || 3 },
        { dimension: 'PHYS' as DimensionCode, rating: courtiqRatings.PHYS || 3 },
        { dimension: 'MENT' as DimensionCode, rating: courtiqRatings.MENT || 3 },
        { dimension: 'CONS' as DimensionCode, rating: courtiqRatings.CONS || 3 }
      ].sort((a, b) => a.rating - b.rating);
      
      // Return dimension codes in ascending rating order
      return dimensionRatings.map(d => d.dimension);
    } catch (error) {
      console.error('Error fetching CourtIQ ratings:', error);
      return ['TECH']; // Default to technical on error
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
  
  /**
   * Determine if a message contains a navigation request
   * 
   * @param message The message to analyze
   * @returns True if message contains navigation intent
   */
  private hasNavigationIntent(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const navigationTriggers = [
      'take me to', 'go to', 'navigate to', 'open',
      'show me', 'find', 'where is', 'how do i get to',
      'access', 'view'
    ];
    
    return navigationTriggers.some(trigger => lowerMessage.includes(trigger));
  }
  
  /**
   * Determine if a message contains an information request
   * 
   * @param message The message to analyze
   * @returns True if message contains information request intent
   */
  private hasInformationIntent(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const infoTriggers = [
      'what is', 'tell me about', 'explain', 'how does',
      'information on', 'details about', 'describe',
      'help me understand', 'how to use'
    ];
    
    return infoTriggers.some(trigger => lowerMessage.includes(trigger));
  }
  
  /**
   * Determine if a message contains a recommendation request
   * 
   * @param message The message to analyze
   * @returns True if message contains recommendation intent
   */
  private hasRecommendationIntent(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const recommendationTriggers = [
      'recommend', 'suggestion', 'what should', 'best for me',
      'help me find', 'what would help me', 'suggest',
      'i need help with', 'what do you recommend'
    ];
    
    return recommendationTriggers.some(trigger => lowerMessage.includes(trigger));
  }
  
  /**
   * Parse navigation intent from a user message and return appropriate action
   * 
   * @param message The user message to analyze
   * @param user The current user
   * @returns A navigation action object
   */
  public async resolveNavigationIntent(message: string, user: User): Promise<NavigationAction> {
    const lowerMessage = message.toLowerCase();
    const keywords = this.extractKeywords(message);
    
    // Check for platform overview request
    if (lowerMessage.includes('platform') && 
        (lowerMessage.includes('overview') || lowerMessage.includes('features') || 
         lowerMessage.includes('capabilities') || lowerMessage.includes('help'))) {
      return {
        type: 'OVERVIEW',
        target: 'platform_overview',
        reason: 'Providing platform overview'
      };
    }
    
    // Check for direct navigation requests
    if (this.hasNavigationIntent(lowerMessage)) {
      const feature = this.findFeatureByKeywords(keywords);
      if (feature) {
        return {
          type: 'NAVIGATE',
          target: feature.path,
          reason: `Navigating to ${feature.name}`,
          feature
        };
      }
    }
    
    // Check for feature information requests
    if (this.hasInformationIntent(lowerMessage)) {
      const feature = this.findFeatureByKeywords(keywords);
      if (feature) {
        return {
          type: 'EXPLAIN',
          target: feature.id,
          reason: `Explaining ${feature.name}`,
          feature
        };
      }
    }
    
    // Check for recommendation requests
    if (this.hasRecommendationIntent(lowerMessage)) {
      // Use CourtIQ to determine recommendations
      const dimensions = await this.getUserWeakestDimensions(user.id);
      if (dimensions.length > 0) {
        const recommendedFeature = this.findFeatureByDimension(dimensions[0]);
        if (recommendedFeature) {
          return {
            type: 'RECOMMEND',
            target: recommendedFeature.path,
            reason: `Based on your ${this.getDimensionName(dimensions[0])} CourtIQ rating`,
            dimension: dimensions[0],
            feature: recommendedFeature
          };
        }
      }
      
      // If no focused dimension, recommend based on keywords
      const feature = this.findFeatureByKeywords(keywords);
      if (feature) {
        return {
          type: 'RECOMMEND',
          target: feature.path,
          reason: `Based on your interests`,
          feature
        };
      }
    }
    
    // If we found keywords but no specific intent, try to find a matching feature
    const feature = this.findFeatureByKeywords(keywords);
    if (feature) {
      // Provide information about the feature as a default action
      return {
        type: 'EXPLAIN',
        target: feature.id,
        reason: `Information about ${feature.name}`,
        feature
      };
    }
    
    // Default response if no intent matched
    return {
      type: 'OVERVIEW',
      target: 'platform_overview',
      reason: 'General platform information'
    };
  }
  
  /**
   * Record a navigation action for analytics
   * 
   * @param userId The user who performed the action
   * @param action The navigation action
   */
  public async recordNavigationAction(
    userId: number, 
    action: NavigationAction, 
    message: string
  ): Promise<void> {
    try {
      await storage.createConciergeInteraction({
        userId,
        messageContent: message,
        navigationType: action.type,
        navigationTarget: action.target,
        dimension: action.dimension || null,
        isCompleted: false
      });
    } catch (error) {
      console.error('Error recording navigation action:', error);
    }
  }
  
  /**
   * Mark a navigation action as completed
   * 
   * @param userId The user ID
   * @param target The navigation target that was completed
   */
  public async completeNavigationAction(userId: number, target: string): Promise<void> {
    try {
      await storage.updateConciergeInteractionStatus(userId, target, true);
    } catch (error) {
      console.error('Error updating navigation completion status:', error);
    }
  }
}

// Export singleton instance for use across the application
export const navigationService = new SageNavigationService();