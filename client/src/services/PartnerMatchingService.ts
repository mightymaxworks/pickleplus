/**
 * PKL-278651-PROF-0026-MATCH - Partner Matching Service
 * 
 * This service implements algorithms to find compatible pickleball partners
 * based on CourtIQ ratings, play styles, and preferences.
 * 
 * Part of Sprint 4 - Engagement & Discovery
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-04-27
 */

import { type DimensionRatings } from "./DataCalculationService";
import { EnhancedUser } from "@/types/enhanced-user";
import { apiRequest } from "@/lib/queryClient";

// Re-export the dimension type
export type CourtIQDimension = 'TECH' | 'TACT' | 'PHYS' | 'MENT' | 'CONS';

// Define play styles
export type PlayStyle = 'aggressive' | 'defensive' | 'all-court' | 'net-focused' | 'baseline';

// Court position preferences
export type CourtPosition = 'right' | 'left' | 'both';

// Playing frequency
export type PlayingFrequency = 'daily' | 'several_times_week' | 'weekly' | 'biweekly' | 'monthly' | 'occasionally';

// Partner preferences
export interface PartnerPreferences {
  // Match skills level preference
  skillMatchPreference: 'similar' | 'stronger' | 'any';
  
  // Complementary playstyle preference
  playstylePreference: 'complementary' | 'similar' | 'any';
  
  // Court position preference
  positionPreference: CourtPosition | 'any';
  
  // Playing frequency preference
  frequencyPreference: PlayingFrequency | 'any';
  
  // Age group preference
  ageGroupPreference: 'similar' | 'any';
  
  // Preferred CourtIQ dimensions to prioritize in partners
  prioritizedDimensions: CourtIQDimension[];
}

// Match result with compatibility score and reasons
export interface PartnerCompatibility {
  // The matched user
  user: EnhancedUser;
  
  // Overall compatibility score (0-100)
  compatibilityScore: number;
  
  // Breakdown of compatibility by categories
  breakdown: {
    skillCompatibility: number;
    playstyleCompatibility: number;
    positionCompatibility: number;
    frequencyCompatibility: number;
    dimensionalCompatibility: number;
  };
  
  // Specific strengths that make this a good match
  matchStrengths: string[];
  
  // Areas where the match might need adjustment
  matchChallenges: string[];
}

/**
 * Calculate the compatibility between two users based on dimensions
 * Higher values indicate dimensions where they complement each other
 */
function calculateDimensionalCompatibility(
  userDimensions: DimensionRatings,
  otherDimensions: DimensionRatings
): Record<CourtIQDimension, number> {
  const result: Partial<Record<CourtIQDimension, number>> = {};
  
  // For each dimension, calculate complementary score
  // We're looking for cases where one player's strengths
  // complement another player's weaknesses
  
  const dimensions: CourtIQDimension[] = ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS'];
  
  dimensions.forEach(dim => {
    // Calculate difference but ensure a minimum score
    // if both players are strong in a dimension
    const userScore = userDimensions[dim];
    const otherScore = otherDimensions[dim];
    
    // If both players are strong (>3.5), that's good
    if (userScore > 3.5 && otherScore > 3.5) {
      result[dim] = 90; // Strong compatibility
    } 
    // If both players are weak (<2.5), that's challenging
    else if (userScore < 2.5 && otherScore < 2.5) {
      result[dim] = 40; // Weaker compatibility
    }
    // If one player is strong where the other is weak, good complementary fit
    else if (Math.abs(userScore - otherScore) > 1) {
      result[dim] = 75; // Complementary compatibility
    }
    // Otherwise moderate compatibility
    else {
      result[dim] = 60; // Average compatibility
    }
  });
  
  return result as Record<CourtIQDimension, number>;
}

/**
 * Check if playstyles complement each other
 */
function calculatePlaystyleCompatibility(
  userStyle: PlayStyle,
  otherStyle: PlayStyle
): number {
  // Complementary playstyles matrix
  const complementaryStyles: Record<PlayStyle, PlayStyle[]> = {
    'aggressive': ['defensive', 'baseline'],
    'defensive': ['aggressive', 'net-focused'],
    'all-court': ['all-court', 'aggressive', 'defensive'],
    'net-focused': ['baseline', 'defensive'],
    'baseline': ['net-focused', 'aggressive']
  };
  
  // Check if playstyles directly complement each other
  if (complementaryStyles[userStyle].includes(otherStyle)) {
    return 90; // Strong compatibility
  }
  
  // If both have the same playstyle
  if (userStyle === otherStyle) {
    // All-court with all-court works well
    if (userStyle === 'all-court') {
      return 85;
    }
    // Other same-style pairs may have some redundancy
    return 65;
  }
  
  // Otherwise moderate compatibility
  return 50;
}

/**
 * Check if court positions are compatible
 */
function calculatePositionCompatibility(
  userPosition: CourtPosition,
  otherPosition: CourtPosition
): number {
  // If both prefer the same side and it's not 'both'
  if (userPosition === otherPosition && userPosition !== 'both') {
    return 30; // Low compatibility - position conflict
  }
  
  // If one prefers 'both' and the other has a specific preference
  if (userPosition === 'both' || otherPosition === 'both') {
    return 90; // High compatibility - flexible
  }
  
  // If they prefer different sides
  if (
    (userPosition === 'left' && otherPosition === 'right') ||
    (userPosition === 'right' && otherPosition === 'left')
  ) {
    return 100; // Perfect compatibility - complementary positions
  }
  
  return 70; // Default moderate compatibility
}

/**
 * Calculate if playing frequencies are compatible
 */
function calculateFrequencyCompatibility(
  userFrequency: PlayingFrequency,
  otherFrequency: PlayingFrequency
): number {
  // Convert frequencies to numerical values for comparison
  const frequencyValues: Record<PlayingFrequency, number> = {
    'daily': 6,
    'several_times_week': 5,
    'weekly': 4,
    'biweekly': 3,
    'monthly': 2,
    'occasionally': 1
  };
  
  const userValue = frequencyValues[userFrequency];
  const otherValue = frequencyValues[otherFrequency];
  
  // Calculate difference in frequency
  const difference = Math.abs(userValue - otherValue);
  
  // Map difference to compatibility score
  if (difference === 0) {
    return 100; // Perfect match
  } else if (difference === 1) {
    return 80; // Very good match
  } else if (difference === 2) {
    return 60; // Good match
  } else if (difference === 3) {
    return 40; // Moderate match
  } else {
    return 20; // Poor match - very different frequencies
  }
}

/**
 * Calculate skill level compatibility
 */
function calculateSkillCompatibility(
  userRating: number,
  otherRating: number,
  preferenceType: 'similar' | 'stronger' | 'any'
): number {
  const difference = otherRating - userRating;
  
  switch (preferenceType) {
    case 'similar':
      // Prefer players within 0.5 points
      if (Math.abs(difference) <= 0.5) {
        return 90;
      } else if (Math.abs(difference) <= 1.0) {
        return 70;
      } else {
        return 40;
      }
    
    case 'stronger':
      // Prefer slightly stronger players (0.5-1.0 points higher)
      if (difference >= 0.5 && difference <= 1.0) {
        return 90;
      } else if (difference > 1.0 && difference <= 1.5) {
        return 70;
      } else if (difference > 0) {
        return 60;
      } else {
        return 40;
      }
    
    case 'any':
      // More tolerant but still prefer reasonably close skills
      if (Math.abs(difference) <= 1.0) {
        return 80;
      } else if (Math.abs(difference) <= 2.0) {
        return 60;
      } else {
        return 40;
      }
      
    default:
      return 50;
  }
}

/**
 * Generate match strengths and challenges based on compatibility breakdown
 */
function generateMatchInsights(
  user: EnhancedUser,
  match: EnhancedUser,
  dimensionalCompatibility: Record<CourtIQDimension, number>,
  breakdown: PartnerCompatibility['breakdown']
): {strengths: string[], challenges: string[]} {
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  // Add insights based on dimensional compatibility
  const dimensionStrengths = Object.entries(dimensionalCompatibility)
    .filter(([_, score]) => score >= 75)
    .map(([dim]) => dim as CourtIQDimension);
  
  const dimensionChallenges = Object.entries(dimensionalCompatibility)
    .filter(([_, score]) => score <= 50)
    .map(([dim]) => dim as CourtIQDimension);
  
  // Add playstyle insights
  if (breakdown.playstyleCompatibility >= 80) {
    strengths.push(`Your ${user.playingStyle || 'playing style'} complements their ${match.playingStyle || 'approach'}`);
  } else if (breakdown.playstyleCompatibility <= 50) {
    challenges.push(`You may need to adjust your ${user.playingStyle || 'playing style'} to work with their ${match.playingStyle || 'approach'}`);
  }
  
  // Add position insights
  if (breakdown.positionCompatibility >= 90) {
    strengths.push(`Court position preferences align perfectly`);
  } else if (breakdown.positionCompatibility <= 40) {
    challenges.push(`You both prefer the same side of the court`);
  }
  
  // Add frequency insights
  if (breakdown.frequencyCompatibility >= 80) {
    strengths.push(`Similar playing frequency`);
  } else if (breakdown.frequencyCompatibility <= 40) {
    challenges.push(`Different playing schedules may be challenging`);
  }
  
  // Add dimension-specific insights
  if (dimensionStrengths.includes('TECH')) {
    strengths.push(`Good technical skill balance`);
  }
  if (dimensionStrengths.includes('TACT')) {
    strengths.push(`Complementary tactical awareness`);
  }
  if (dimensionStrengths.includes('PHYS')) {
    strengths.push(`Physical attributes work well together`);
  }
  if (dimensionStrengths.includes('MENT')) {
    strengths.push(`Strong mental game compatibility`);
  }
  if (dimensionStrengths.includes('CONS')) {
    strengths.push(`Consistency levels match well`);
  }
  
  // Add dimension challenges
  if (dimensionChallenges.includes('TECH')) {
    challenges.push(`May need to work on technical coordination`);
  }
  if (dimensionChallenges.includes('TACT')) {
    challenges.push(`Could improve tactical communication`);
  }
  if (dimensionChallenges.includes('PHYS')) {
    challenges.push(`Physical game styles may need adjustment`);
  }
  if (dimensionChallenges.includes('MENT')) {
    challenges.push(`Mental approach differences to consider`);
  }
  if (dimensionChallenges.includes('CONS')) {
    challenges.push(`Consistency levels vary between players`);
  }
  
  return {
    strengths: strengths.slice(0, 3), // Limit to top 3
    challenges: challenges.slice(0, 2) // Limit to top 2
  };
}

/**
 * Calculate overall compatibility between current user and a potential partner
 */
export function calculateCompatibility(
  user: EnhancedUser,
  potentialPartner: EnhancedUser,
  preferences: PartnerPreferences
): PartnerCompatibility {
  // Get dimension ratings for both users
  // This would normally come from the user's courtIQ property
  // For demo purposes, we'll use the calculations directly
  
  // Create a standardized format for dimensions
  const normalizeDimensions = (dimensions: any): DimensionRatings => {
    if (!dimensions) {
      return {
        TECH: 3.0,
        TACT: 3.0,
        PHYS: 3.0,
        MENT: 3.0,
        CONS: 3.0,
        overall: 1000 // Default overall value
      };
    }
    
    // Check if we already have the right format
    if (dimensions.TECH !== undefined) {
      if (dimensions.overall !== undefined) {
        return dimensions as DimensionRatings;
      } else {
        return {
          ...dimensions,
          overall: 1000 // Add missing overall value
        };
      }
    }
    
    // Convert from legacy format if needed
    if (dimensions.technical !== undefined) {
      return {
        TECH: dimensions.technical,
        TACT: dimensions.tactical,
        PHYS: dimensions.physical,
        MENT: dimensions.mental,
        CONS: dimensions.consistency,
        overall: dimensions.overall || 1000 // Use existing or default
      };
    }
    
    // Default empty values
    return {
      TECH: 3.0,
      TACT: 3.0,
      PHYS: 3.0,
      MENT: 3.0,
      CONS: 3.0,
      overall: 1000 // Default overall value
    };
  };
  
  const userDimensions = normalizeDimensions(user.courtIQ);
  const partnerDimensions = normalizeDimensions(potentialPartner.courtIQ);
  
  // Calculate dimensional compatibility
  const dimensionalCompatibility = calculateDimensionalCompatibility(
    userDimensions,
    partnerDimensions
  );
  
  // Calculate overall dimensional score based on priorities
  const dimensionalScore = preferences.prioritizedDimensions.length > 0
    ? preferences.prioritizedDimensions.reduce((sum, dim) => sum + dimensionalCompatibility[dim], 0) / 
      preferences.prioritizedDimensions.length
    : Object.values(dimensionalCompatibility).reduce((sum, score) => sum + score, 0) / 5;
  
  // Calculate playstyle compatibility
  const playstyleScore = calculatePlaystyleCompatibility(
    user.playingStyle as PlayStyle || 'all-court',
    potentialPartner.playingStyle as PlayStyle || 'all-court'
  );
  
  // Calculate position compatibility
  const positionScore = calculatePositionCompatibility(
    user.preferredPosition as CourtPosition || 'both',
    potentialPartner.preferredPosition as CourtPosition || 'both'
  );
  
  // Calculate frequency compatibility
  const frequencyScore = calculateFrequencyCompatibility(
    user.playingFrequency as PlayingFrequency || 'weekly',
    potentialPartner.playingFrequency as PlayingFrequency || 'weekly'
  );
  
  // Calculate skill compatibility
  const skillScore = calculateSkillCompatibility(
    user.duprRating || 3.0,
    potentialPartner.duprRating || 3.0,
    preferences.skillMatchPreference
  );
  
  // Create compatibility breakdown
  const breakdown = {
    skillCompatibility: skillScore,
    playstyleCompatibility: playstyleScore,
    positionCompatibility: positionScore,
    frequencyCompatibility: frequencyScore,
    dimensionalCompatibility: dimensionalScore
  };
  
  // Calculate weighted overall score
  const overallScore = Math.round(
    (skillScore * 0.2) +
    (playstyleScore * 0.25) +
    (positionScore * 0.15) +
    (frequencyScore * 0.15) +
    (dimensionalScore * 0.25)
  );
  
  // Generate match insights
  const { strengths, challenges } = generateMatchInsights(
    user,
    potentialPartner,
    dimensionalCompatibility,
    breakdown
  );
  
  return {
    user: potentialPartner,
    compatibilityScore: overallScore,
    breakdown,
    matchStrengths: strengths,
    matchChallenges: challenges
  };
}

/**
 * Find compatible partners based on user preferences
 */
export async function findCompatiblePartners(
  userId: number,
  preferences: PartnerPreferences,
  limit: number = 10
): Promise<PartnerCompatibility[]> {
  try {
    // First get the current user
    const currentUserRes = await apiRequest('GET', '/api/me');
    const currentUser = await currentUserRes.json();
    
    // Then get potential matches
    const matchesRes = await apiRequest('GET', '/api/partners/potential-matches');
    const potentialMatches: EnhancedUser[] = await matchesRes.json();
    
    // Calculate compatibility for each
    const compatibilities = potentialMatches
      .map(partner => calculateCompatibility(currentUser, partner, preferences))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore) // Sort by highest score
      .slice(0, limit); // Limit results
    
    return compatibilities;
  } catch (error) {
    console.error("Error finding compatible partners:", error);
    return [];
  }
}

/**
 * Update user's partner preferences
 */
export async function updatePartnerPreferences(
  userId: number,
  preferences: PartnerPreferences
): Promise<boolean> {
  try {
    const response = await apiRequest('POST', '/api/partners/preferences', preferences);
    return response.ok;
  } catch (error) {
    console.error("Error updating partner preferences:", error);
    return false;
  }
}

/**
 * Get the current user's partner preferences
 */
export async function getPartnerPreferences(
  userId: number
): Promise<PartnerPreferences | null> {
  try {
    const response = await apiRequest('GET', '/api/partners/preferences');
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error getting partner preferences:", error);
    return null;
  }
}

// Default preferences for new users
export const DEFAULT_PARTNER_PREFERENCES: PartnerPreferences = {
  skillMatchPreference: 'similar',
  playstylePreference: 'complementary',
  positionPreference: 'any',
  frequencyPreference: 'any',
  ageGroupPreference: 'any',
  prioritizedDimensions: ['TECH', 'TACT']
};