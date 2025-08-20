/**
 * Match Points Calculator - Official Implementation
 * Single source of truth for all point calculations in Pickle+
 * References: PICKLE_PLUS_ALGORITHM_DOCUMENT.md
 */

import { calculateOfficialPoints, validatePointCalculation, logCalculationBreakdown, type MatchResult } from './algorithmValidation';

export interface PlayerMatchData {
  playerId: number;
  username: string;
  isWin: boolean;
  ageGroup?: string;
  gender?: 'male' | 'female';
  currentRankingPoints?: number;
  eventType?: 'tournament' | 'league' | 'casual';
  eventMultiplier?: number;
}

export interface MatchPointsResult {
  playerId: number;
  username: string;
  rankingPointsEarned: number;
  picklePointsEarned: number;
  totalRankingPoints: number;
  totalPicklePoints: number;
  calculationDetails: string;
}

/**
 * Calculate points for all players in a match using official algorithm
 */
export function calculateMatchPoints(
  players: PlayerMatchData[],
  matchType: 'singles' | 'doubles' = 'doubles'
): MatchPointsResult[] {
  
  const results: MatchPointsResult[] = [];
  
  for (const player of players) {
    // Determine multipliers based on player data
    const ageMultiplier = getAgeMultiplier(player.ageGroup);
    const genderMultiplier = getGenderMultiplier(player.gender, player.currentRankingPoints || 0);
    const eventMultiplier = player.eventMultiplier || getEventMultiplier(player.eventType);
    
    // Create match result for official calculation
    const matchResult: MatchResult = {
      playerId: player.playerId,
      isWin: player.isWin,
      basePoints: player.isWin ? 3 : 1, // System B
      ageMultiplier,
      genderMultiplier,
      eventMultiplier
    };
    
    // Calculate using official algorithm
    const calculation = calculateOfficialPoints(matchResult);
    
    // Log calculation for verification
    if (process.env.NODE_ENV === 'development') {
      logCalculationBreakdown(matchResult);
    }
    
    results.push({
      playerId: player.playerId,
      username: player.username,
      rankingPointsEarned: calculation.rankingPoints,
      picklePointsEarned: calculation.picklePoints,
      totalRankingPoints: (player.currentRankingPoints || 0) + calculation.rankingPoints,
      totalPicklePoints: 0, // Will be calculated during DB update
      calculationDetails: formatCalculationDetails(matchResult, calculation)
    });
  }
  
  return results;
}

/**
 * Age group multipliers per official algorithm
 */
function getAgeMultiplier(ageGroup?: string): number {
  const multipliers: Record<string, number> = {
    'Pro': 1.0,
    'Open': 1.0,
    'U12': 1.0,
    'U14': 1.0, 
    'U16': 1.0,
    'U18': 1.0,
    '35+': 1.2,
    '50+': 1.3,
    '60+': 1.5,
    '70+': 1.6
  };
  
  return multipliers[ageGroup || 'Open'] || 1.0;
}

/**
 * Gender multipliers for cross-gender matches (women under 1000 points)
 */
function getGenderMultiplier(gender?: 'male' | 'female', currentPoints: number = 0): number {
  // Women under 1000 points get 1.15x bonus in cross-gender matches
  if (gender === 'female' && currentPoints < 1000) {
    return 1.15;
  }
  return 1.0;
}

/**
 * Event type multipliers
 */
function getEventMultiplier(eventType?: string): number {
  const multipliers: Record<string, number> = {
    'tournament': 1.0,
    'league': 1.0,
    'casual': 1.0
  };
  
  return multipliers[eventType || 'casual'] || 1.0;
}

/**
 * Format calculation details for audit trail
 */
function formatCalculationDetails(matchResult: MatchResult, calculation: any): string {
  return `${matchResult.isWin ? 'WIN' : 'LOSS'}: ${matchResult.isWin ? 3 : 1} base × ${matchResult.ageMultiplier || 1.0} age × ${matchResult.genderMultiplier || 1.0} gender × ${matchResult.eventMultiplier || 1.0} event = ${calculation.rankingPoints} ranking, ${calculation.picklePoints} pickle (1.5x)`;
}

/**
 * Validate a batch of match calculations
 */
export function validateBatchCalculations(results: MatchPointsResult[]): {
  isValid: boolean;
  errors: string[];
  summary: string;
} {
  const errors: string[] = [];
  
  // Check each calculation
  for (const result of results) {
    // Re-calculate to verify
    const matchResult: MatchResult = {
      playerId: result.playerId,
      isWin: result.rankingPointsEarned >= 3, // Assume win if earned 3+ points
      basePoints: result.rankingPointsEarned >= 3 ? 3 : 1
    };
    
    const verification = calculateOfficialPoints(matchResult);
    
    // Basic validation
    if (Math.abs(result.rankingPointsEarned - verification.rankingPoints) > 0.01) {
      errors.push(`Player ${result.username}: ranking points mismatch`);
    }
    
    if (result.picklePointsEarned !== verification.picklePoints) {
      errors.push(`Player ${result.username}: pickle points mismatch`);
    }
  }
  
  const totalPlayers = results.length;
  const totalRankingPoints = results.reduce((sum, r) => sum + r.rankingPointsEarned, 0);
  const totalPicklePoints = results.reduce((sum, r) => sum + r.picklePointsEarned, 0);
  
  return {
    isValid: errors.length === 0,
    errors,
    summary: `Processed ${totalPlayers} players: ${totalRankingPoints} ranking points, ${totalPicklePoints} pickle points distributed`
  };
}

/**
 * Quick calculation for simple win/loss scenarios
 */
export function quickMatchPoints(isWin: boolean): { ranking: number; pickle: number } {
  const ranking = isWin ? 3 : 1;
  const pickle = Math.round(ranking * 1.5);
  return { ranking, pickle };
}