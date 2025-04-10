/**
 * PKL-278651-GAME-0001-MOD
 * Discovery Engine
 * 
 * Core logic for handling discoveries and requirements.
 */

import { DiscoveryContext, RequirementCheckResult, DiscoveryPoint } from '../api/types';

/**
 * Check if a user meets the requirements for a discovery
 */
export function checkDiscoveryRequirements(
  discovery: DiscoveryPoint,
  context: DiscoveryContext
): RequirementCheckResult {
  const requirements = discovery.requirements;
  
  // If no requirements, always met
  if (!requirements || Object.keys(requirements).length === 0) {
    return { met: true };
  }
  
  // Check user level requirements
  if (
    requirements.minUserLevel !== undefined && 
    context.userLevel !== undefined &&
    context.userLevel < requirements.minUserLevel
  ) {
    return {
      met: false,
      reason: `User level is too low. Required: ${requirements.minUserLevel}, Current: ${context.userLevel}`
    };
  }
  
  // Check user type requirements
  if (
    requirements.userType && 
    requirements.userType.length > 0 && 
    context.userType && 
    !requirements.userType.includes(context.userType)
  ) {
    return {
      met: false,
      reason: `User type does not match. Required: one of [${requirements.userType.join(', ')}], Current: ${context.userType}`
    };
  }
  
  // Check prerequisite discoveries
  if (
    requirements.prerequisiteDiscoveries && 
    requirements.prerequisiteDiscoveries.length > 0
  ) {
    const missingPrerequisites = requirements.prerequisiteDiscoveries.filter(
      code => !context.previousDiscoveries?.includes(code)
    );
    
    if (missingPrerequisites.length > 0) {
      return {
        met: false,
        reason: `Missing prerequisite discoveries: ${missingPrerequisites.join(', ')}`
      };
    }
  }
  
  // Check date restrictions
  if (requirements.dateRestriction) {
    const now = new Date();
    
    if (requirements.dateRestriction.from) {
      const fromDate = new Date(requirements.dateRestriction.from);
      if (now < fromDate) {
        return {
          met: false,
          reason: `Discovery not available until ${fromDate.toLocaleDateString()}`
        };
      }
    }
    
    if (requirements.dateRestriction.to) {
      const toDate = new Date(requirements.dateRestriction.to);
      if (now > toDate) {
        return {
          met: false,
          reason: `Discovery expired on ${toDate.toLocaleDateString()}`
        };
      }
    }
  }
  
  // All requirements met
  return { met: true };
}

/**
 * Format educational content for a discovery
 */
export function formatEducationalContent(
  discovery: DiscoveryPoint,
  context?: Record<string, any>
): string {
  if (!discovery.content || !discovery.content.details) {
    return '';
  }
  
  let content = discovery.content.details;
  
  // Replace variables in the content
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
  }
  
  return content;
}

/**
 * Calculate rewards for a discovery
 */
export function calculateDiscoveryRewards(
  discovery: DiscoveryPoint,
  context?: Record<string, any>
): { xp: number; achievementPoints: number } {
  // Start with base values from discovery
  const basePoints = discovery.pointValue || 10;
  
  // Apply difficulty multiplier
  let difficultyMultiplier = 1;
  if (discovery.config.difficulty === 'medium') {
    difficultyMultiplier = 1.5;
  } else if (discovery.config.difficulty === 'hard') {
    difficultyMultiplier = 2.5;
  }
  
  // Apply special context-based bonuses
  let contextBonus = 0;
  if (context) {
    // First discovery of the session bonus
    if (context.isFirstDiscoveryOfSession) {
      contextBonus += 5;
    }
    
    // Combo bonus for discoveries found in sequence
    if (context.comboCount && context.comboCount > 1) {
      contextBonus += Math.min(context.comboCount * 2, 20); // Cap at +20 bonus
    }
  }
  
  return {
    xp: Math.round(basePoints * difficultyMultiplier + contextBonus),
    achievementPoints: Math.round(basePoints / 2)
  };
}