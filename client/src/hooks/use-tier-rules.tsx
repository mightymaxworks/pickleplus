/**
 * Custom hook for accessing tier-based ranking rules
 * Provides tier-specific rule data for the CourtIQ™ rating system
 * Related to sprint PKL-278651-RATE-0003-TIR
 */

import { useMemo } from 'react';
import { useRatingTiers } from './use-multi-dimensional-rankings';

// Convert from 0-5 scale to 0-9 scale
export function convertRatingScale(rating: number | undefined): number {
  if (rating === undefined) return 0;
  // Convert from 0-5 scale to 0-9 scale (multiply by 1.8)
  return parseFloat((rating * 1.8).toFixed(1));
}

// Tier rule configuration type
interface TierRuleConfig {
  allowPointLoss: boolean;
  pointLossMultiplier: number;
  maxPointLossPerMatch: number;
  requiresMinimumMatches: boolean;
  minimumMatchesPerMonth: number;
  bonusPointsForConsistency: number;
  bonusMultiplierForUpsets: number;
  fastTrackMultiplier: number;
  streakBonusThreshold: number;
  streakBonusPoints: number;
}

export function useTierRules() {
  const { data: tiers, isLoading } = useRatingTiers();
  
  // Default tier rule configurations by tier level
  const tierRuleConfigs = useMemo(() => {
    return {
      // Beginner tiers (0-4.4 on 0-9 scale)
      beginner: {
        allowPointLoss: false,
        pointLossMultiplier: 0.0,
        maxPointLossPerMatch: 0,
        requiresMinimumMatches: false,
        minimumMatchesPerMonth: 0,
        bonusPointsForConsistency: 2,
        bonusMultiplierForUpsets: 1.1,
        fastTrackMultiplier: 2.0,
        streakBonusThreshold: 2,
        streakBonusPoints: 10
      } as TierRuleConfig,
      
      // Intermediate tiers (4.5-7.1 on 0-9 scale)
      intermediate: {
        allowPointLoss: false,
        pointLossMultiplier: 0.0,
        maxPointLossPerMatch: 0,
        requiresMinimumMatches: false,
        minimumMatchesPerMonth: 0,
        bonusPointsForConsistency: 5,
        bonusMultiplierForUpsets: 1.2,
        fastTrackMultiplier: 1.5,
        streakBonusThreshold: 3,
        streakBonusPoints: 15
      } as TierRuleConfig,
      
      // Advanced tiers (7.2-8.0 on 0-9 scale)
      advanced: {
        allowPointLoss: true,
        pointLossMultiplier: 0.5,
        maxPointLossPerMatch: 25,
        requiresMinimumMatches: true,
        minimumMatchesPerMonth: 4,
        bonusPointsForConsistency: 7,
        bonusMultiplierForUpsets: 1.3,
        fastTrackMultiplier: 1.2,
        streakBonusThreshold: 5,
        streakBonusPoints: 30
      } as TierRuleConfig,
      
      // Elite tiers (8.1-9.0 on 0-9 scale)
      elite: {
        allowPointLoss: true,
        pointLossMultiplier: 1.0,
        maxPointLossPerMatch: 50,
        requiresMinimumMatches: true,
        minimumMatchesPerMonth: 8,
        bonusPointsForConsistency: 10,
        bonusMultiplierForUpsets: 1.5,
        fastTrackMultiplier: 1.0,
        streakBonusThreshold: 7,
        streakBonusPoints: 50
      } as TierRuleConfig
    };
  }, []);
  
  // Get rule config for a specific tier
  const getRuleConfigForTier = (tierName: string) => {
    if (!tiers) return tierRuleConfigs.intermediate;
    
    const tier = tiers.find(t => t.name === tierName);
    if (!tier) return tierRuleConfigs.intermediate;
    
    // Convert rating to 0-9 scale for rule selection
    const minRating = convertRatingScale(tier.minRating);
    
    if (minRating >= 8.1) {
      return tierRuleConfigs.elite;
    } else if (minRating >= 7.2) {
      return tierRuleConfigs.advanced;
    } else if (minRating >= 4.5) {
      return tierRuleConfigs.intermediate;
    } else {
      return tierRuleConfigs.beginner;
    }
  };
  
  // Get rule config for a player's rating
  const getRuleConfigForRating = (rating: number) => {
    // When using this function, the rating should already be on the 0-9 scale
    if (rating >= 8.1) {
      return tierRuleConfigs.elite;
    } else if (rating >= 7.2) {
      return tierRuleConfigs.advanced;
    } else if (rating >= 4.5) {
      return tierRuleConfigs.intermediate;
    } else {
      return tierRuleConfigs.beginner;
    }
  };
  
  // Generate human-readable explanation of tier rules
  const getTierRuleExplanation = (tierName: string) => {
    const ruleConfig = getRuleConfigForTier(tierName);
    
    const explanations = [];
    
    if (ruleConfig.allowPointLoss) {
      explanations.push(`Can lose up to ${ruleConfig.maxPointLossPerMatch} points on defeat`);
    } else {
      explanations.push("Protected from point loss on defeat");
    }
    
    if (ruleConfig.requiresMinimumMatches) {
      explanations.push(`Requires ${ruleConfig.minimumMatchesPerMonth} matches per month to maintain tier status`);
    }
    
    if (ruleConfig.bonusMultiplierForUpsets > 1.2) {
      explanations.push(`Significant bonus (${Math.round((ruleConfig.bonusMultiplierForUpsets-1)*100)}%) for defeating higher-rated players`);
    }
    
    if (ruleConfig.fastTrackMultiplier > 1.0) {
      explanations.push(`Fast-track advancement multiplier: ${ruleConfig.fastTrackMultiplier.toFixed(1)}x`);
    }
    
    if (ruleConfig.bonusPointsForConsistency > 0) {
      explanations.push(`Consistency bonus: +${ruleConfig.bonusPointsForConsistency} points per match`);
    }
    
    explanations.push(`Streak bonus: +${ruleConfig.streakBonusPoints} points for ${ruleConfig.streakBonusThreshold}+ consecutive wins`);
    
    return explanations;
  };
  
  return {
    tierRuleConfigs,
    getRuleConfigForTier,
    getRuleConfigForRating,
    getTierRuleExplanation,
    convertRatingScale,
    isLoading
  };
}