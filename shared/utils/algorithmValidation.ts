/**
 * PICKLE+ ALGORITHM VALIDATION UTILITIES
 * 
 * MANDATORY IMPORT: All match calculation components MUST import and use these utilities
 * to ensure compliance with the official Pickle+ Algorithm Document.
 * 
 * Version: 2.0.0 - Differential Age Multiplier System
 * Last Updated: August 25, 2025
 * Source of Truth: PICKLE_PLUS_ALGORITHM_DOCUMENT.md
 * 
 * CRITICAL VALIDATION: ALL POINT OPERATIONS MUST BE ADDITIVE
 * - validateAdditivePointsOperation() prevents destructive point replacement
 * - All database operations must use: currentPoints + newPoints
 * - System protects against tournament history loss
 */

import { differenceInYears } from 'date-fns';

// ========================================
// SYSTEM B CONSTANTS (IMMUTABLE)
// ========================================
export const SYSTEM_B_BASE_POINTS = {
  WIN: 3,
  LOSS: 1
} as const;

export const PICKLE_POINTS_MULTIPLIER = 1.5 as const;

// ========================================
// AGE GROUP DEFINITIONS (DIFFERENTIAL SYSTEM)
// ========================================
export enum AgeGroup {
  OPEN = 'Open',
  THIRTY_FIVE_PLUS = '35+',
  FIFTY_PLUS = '50+',
  SIXTY_PLUS = '60+',
  SEVENTY_PLUS = '70+'
}

export const AGE_GROUP_MULTIPLIERS = {
  [AgeGroup.OPEN]: 1.0,
  [AgeGroup.THIRTY_FIVE_PLUS]: 1.2,
  [AgeGroup.FIFTY_PLUS]: 1.3,
  [AgeGroup.SIXTY_PLUS]: 1.5,
  [AgeGroup.SEVENTY_PLUS]: 1.6
} as const;

// ========================================
// ENHANCED PLAYER INTERFACES
// ========================================
export interface EnhancedPlayer {
  id: string;
  dateOfBirth: Date | string;
  gender: 'male' | 'female';
  currentRankingPoints: number;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  return differenceInYears(new Date(), birthDate);
}

/**
 * Determine age group from date of birth
 */
export function getAgeGroup(dateOfBirth: Date | string): AgeGroup {
  const age = calculateAge(dateOfBirth);
  
  if (age >= 70) return AgeGroup.SEVENTY_PLUS;
  if (age >= 60) return AgeGroup.SIXTY_PLUS;
  if (age >= 50) return AgeGroup.FIFTY_PLUS;
  if (age >= 35) return AgeGroup.THIRTY_FIVE_PLUS;
  return AgeGroup.OPEN;
}

/**
 * CRITICAL: Calculate differential age multipliers
 * 
 * RULE: Same age group = 1.0x for all players
 * RULE: Different age groups = individual multipliers apply
 */
export function calculateDifferentialAgeMultipliers(players: EnhancedPlayer[]): Record<string, number> {
  // Get unique age groups in the match
  const ageGroups = players.map(p => getAgeGroup(p.dateOfBirth));
  const uniqueAgeGroups = Array.from(new Set(ageGroups));
  
  // If only one age group: everyone gets 1.0x (equal treatment)
  if (uniqueAgeGroups.length === 1) {
    return players.reduce((acc, player) => {
      acc[player.id] = 1.0;
      return acc;
    }, {} as Record<string, number>);
  }
  
  // Multiple age groups: individual multipliers apply
  return players.reduce((acc, player) => {
    const ageGroup = getAgeGroup(player.dateOfBirth);
    acc[player.id] = AGE_GROUP_MULTIPLIERS[ageGroup];
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Calculate gender bonus for cross-gender matches
 * 
 * RULE: 1.15x for female players in cross-gender matches
 * RULE: Only when player has <1000 ranking points
 */
export function calculateGenderBonus(players: EnhancedPlayer[]): Record<string, number> {
  const genderList = players.map(p => p.gender);
  const genders = Array.from(new Set(genderList));
  const isCrossGender = genders.length > 1;
  
  if (!isCrossGender) {
    return players.reduce((acc, player) => {
      acc[player.id] = 1.0;
      return acc;
    }, {} as Record<string, number>);
  }
  
  return players.reduce((acc, player) => {
    const isEligibleFemale = player.gender === 'female' && player.currentRankingPoints < 1000;
    acc[player.id] = isEligibleFemale ? 1.15 : 1.0;
    return acc;
  }, {} as Record<string, number>);
}

export interface MatchResult {
  playerId: number;
  isWin: boolean;
  basePoints: number; // Should be 3 for win, 1 for loss
  ageMultiplier?: number;
  genderMultiplier?: number;
  eventMultiplier?: number;
}

export interface PointCalculation {
  rankingPoints: number;
  picklePoints: number;
}

/**
 * ENHANCED: Official Pickle+ Algorithm Point Calculation with Differential System
 * Source: PICKLE_PLUS_ALGORITHM_DOCUMENT.md Version 2.0.0
 */
export function calculateOfficialPoints(result: MatchResult): PointCalculation {
  // System B: 3 points win, 1 point loss (CONFIRMED)
  const basePoints = result.isWin ? SYSTEM_B_BASE_POINTS.WIN : SYSTEM_B_BASE_POINTS.LOSS;
  
  // Apply multipliers (age, gender, event)
  const rankingPoints = basePoints * 
    (result.ageMultiplier || 1.0) * 
    (result.genderMultiplier || 1.0) * 
    (result.eventMultiplier || 1.0);
    
  // Pickle Points: 1.5x multiplier PER MATCH (not total points)
  const picklePoints = Number((rankingPoints * PICKLE_POINTS_MULTIPLIER).toFixed(2));
  
  return {
    rankingPoints: Number((rankingPoints).toFixed(2)), // 2 decimal precision
    picklePoints
  };
}

/**
 * ENHANCED: Create validated match calculation using differential system
 */
export function createValidatedMatchCalculation(
  players: EnhancedPlayer[],
  winners: string[],
  matchType: 'singles' | 'doubles',
  tournamentLevel: 'club' | 'regional' | 'national' | 'professional' = 'club'
): { 
  success: boolean; 
  results?: Array<{
    playerId: string;
    isWinner: boolean;
    basePoints: number;
    ageMultiplier: number;
    genderBonus: number;
    finalRankingPoints: number;
    finalPicklePoints: number;
  }>;
  errors?: string[];
} {
  try {
    const ageMultipliers = calculateDifferentialAgeMultipliers(players);
    const genderBonuses = calculateGenderBonus(players);
    
    const results = players.map(player => {
      const isWinner = winners.includes(player.id);
      const basePoints = isWinner ? SYSTEM_B_BASE_POINTS.WIN : SYSTEM_B_BASE_POINTS.LOSS;
      const ageMultiplier = ageMultipliers[player.id];
      const genderBonus = genderBonuses[player.id];
      
      const finalRankingPoints = Number((basePoints * ageMultiplier * genderBonus).toFixed(2));
      const finalPicklePoints = Number((finalRankingPoints * PICKLE_POINTS_MULTIPLIER).toFixed(2));
      
      return {
        playerId: player.id,
        isWinner,
        basePoints,
        ageMultiplier,
        genderBonus,
        finalRankingPoints,
        finalPicklePoints
      };
    });
    
    return { success: true, results };
    
  } catch (error) {
    return { 
      success: false, 
      errors: [`Algorithm validation failed: ${error instanceof Error ? error.message : String(error)}`] 
    };
  }
}

/**
 * ENHANCED: Validate complete match calculation with differential system
 */
export function validateEnhancedMatchCalculation(
  players: EnhancedPlayer[],
  results: Array<{
    playerId: string;
    isWinner: boolean;
    basePoints: number;
    ageMultiplier: number;
    genderBonus: number;
    finalRankingPoints: number;
    finalPicklePoints: number;
  }>
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Validate System B base points
  for (const result of results) {
    const expectedBasePoints = result.isWinner ? SYSTEM_B_BASE_POINTS.WIN : SYSTEM_B_BASE_POINTS.LOSS;
    if (result.basePoints !== expectedBasePoints) {
      errors.push(`Invalid base points: Expected ${expectedBasePoints}, got ${result.basePoints} for player ${result.playerId}`);
    }
  }
  
  // 2. Validate differential age multipliers
  const expectedAgeMultipliers = calculateDifferentialAgeMultipliers(players);
  for (const result of results) {
    const expectedMultiplier = expectedAgeMultipliers[result.playerId];
    if (Math.abs(result.ageMultiplier - expectedMultiplier) > 0.01) {
      errors.push(`Invalid age multiplier: Expected ${expectedMultiplier}, got ${result.ageMultiplier} for player ${result.playerId}`);
    }
  }
  
  // 3. Validate gender bonuses
  const expectedGenderBonuses = calculateGenderBonus(players);
  for (const result of results) {
    const expectedBonus = expectedGenderBonuses[result.playerId];
    if (Math.abs(result.genderBonus - expectedBonus) > 0.01) {
      errors.push(`Invalid gender bonus: Expected ${expectedBonus}, got ${result.genderBonus} for player ${result.playerId}`);
    }
  }
  
  // 4. Validate final calculations
  for (const result of results) {
    const expectedRankingPoints = Number((
      result.basePoints * 
      result.ageMultiplier * 
      result.genderBonus
    ).toFixed(2));
    
    if (Math.abs(result.finalRankingPoints - expectedRankingPoints) > 0.01) {
      errors.push(`Invalid final ranking points: Expected ${expectedRankingPoints}, got ${result.finalRankingPoints} for player ${result.playerId}`);
    }
    
    const expectedPicklePoints = Number((result.finalRankingPoints * PICKLE_POINTS_MULTIPLIER).toFixed(2));
    if (Math.abs(result.finalPicklePoints - expectedPicklePoints) > 0.01) {
      errors.push(`Invalid pickle points: Expected ${expectedPicklePoints}, got ${result.finalPicklePoints} for player ${result.playerId}`);
    }
  }
  
  // 5. Check for decimal precision
  for (const result of results) {
    const rankingDecimalPlaces = (result.finalRankingPoints.toString().split('.')[1] || '').length;
    const pickleDecimalPlaces = (result.finalPicklePoints.toString().split('.')[1] || '').length;
    
    if (rankingDecimalPlaces > 2) {
      warnings.push(`Ranking points precision exceeds 2 decimal places for player ${result.playerId}`);
    }
    if (pickleDecimalPlaces > 2) {
      warnings.push(`Pickle points precision exceeds 2 decimal places for player ${result.playerId}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates point calculations against official algorithm
 */
export function validatePointCalculation(
  calculated: PointCalculation,
  expected: PointCalculation,
  tolerance: number = 0.01
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check ranking points
  if (Math.abs(calculated.rankingPoints - expected.rankingPoints) > tolerance) {
    errors.push(
      `Ranking points mismatch: calculated ${calculated.rankingPoints}, expected ${expected.rankingPoints}`
    );
  }
  
  // Check pickle points (exact match required)
  if (calculated.picklePoints !== expected.picklePoints) {
    errors.push(
      `Pickle points mismatch: calculated ${calculated.picklePoints}, expected ${expected.picklePoints}`
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * CRITICAL VALIDATION: Prevents destructive point replacement operations
 */
export function validateAdditivePointsOperation(
  currentPoints: number,
  newPoints: number,
  operation: 'add' | 'replace'
): { isValid: boolean; error?: string; correctTotal?: number } {
  
  // Prevent any replacement operations
  if (operation === 'replace') {
    return {
      isValid: false,
      error: 'FORBIDDEN: Point replacement operations destroy tournament history. Use additive operations only.',
      correctTotal: currentPoints + newPoints
    };
  }
  
  // Validate additive operation
  if (operation === 'add') {
    const expectedTotal = currentPoints + newPoints;
    return {
      isValid: true,
      correctTotal: expectedTotal
    };
  }
  
  return {
    isValid: false,
    error: 'Invalid operation type. Must be "add" or "replace"'
  };
}

/**
 * Database-safe point update helper
 * Enforces additive-only operations to preserve tournament history
 */
export function createAdditivePointsUpdate(
  currentRankingPoints: number,
  currentPicklePoints: number,
  newRankingPoints: number,
  newPicklePoints: number,
  currentMatches?: number,
  newMatches?: number,
  currentWins?: number,
  newWins?: number
) {
  return {
    ranking_points: currentRankingPoints + newRankingPoints,
    pickle_points: currentPicklePoints + newPicklePoints,
    total_matches: (currentMatches || 0) + (newMatches || 0),
    matches_won: (currentWins || 0) + (newWins || 0),
    
    // For SQL generation
    sql: `
      doubles_ranking_points = doubles_ranking_points + ${newRankingPoints},
      pickle_points = pickle_points + ${newPicklePoints},
      total_matches = total_matches + ${newMatches || 0},
      matches_won = matches_won + ${newWins || 0}
    `
  };
}

/**
 * Batch calculation for multiple match results
 */
export function calculateBatchPoints(results: MatchResult[]): {
  totalRankingPoints: number;
  totalPicklePoints: number;
  individualResults: PointCalculation[];
} {
  const individualResults = results.map(result => calculateOfficialPoints(result));
  
  return {
    totalRankingPoints: individualResults.reduce((sum, calc) => sum + calc.rankingPoints, 0),
    totalPicklePoints: individualResults.reduce((sum, calc) => sum + calc.picklePoints, 0),
    individualResults
  };
}

/**
 * System validation - ensures calculations match algorithm document
 */
export function systemValidationTest(): { passed: boolean; details: string[] } {
  const testCases = [
    // Basic win/loss
    { isWin: true, expected: { rankingPoints: 3, picklePoints: 5 } },
    { isWin: false, expected: { rankingPoints: 1, picklePoints: 2 } },
    
    // Age multipliers
    { isWin: true, ageMultiplier: 1.2, expected: { rankingPoints: 3.6, picklePoints: 5 } },
    { isWin: false, ageMultiplier: 1.5, expected: { rankingPoints: 1.5, picklePoints: 2 } },
    
    // Gender multipliers (women under 1000 points)
    { isWin: true, genderMultiplier: 1.15, expected: { rankingPoints: 3.45, picklePoints: 5 } },
    { isWin: false, genderMultiplier: 1.15, expected: { rankingPoints: 1.15, picklePoints: 2 } }
  ];
  
  const results = testCases.map((testCase, index) => {
    const calculated = calculateOfficialPoints({
      playerId: 1,
      isWin: testCase.isWin,
      basePoints: testCase.isWin ? 3 : 1,
      ageMultiplier: testCase.ageMultiplier,
      genderMultiplier: testCase.genderMultiplier
    });
    
    const validation = validatePointCalculation(calculated, testCase.expected);
    
    return {
      testIndex: index,
      passed: validation.isValid,
      errors: validation.errors
    };
  });
  
  const failedTests = results.filter(r => !r.passed);
  
  return {
    passed: failedTests.length === 0,
    details: failedTests.length === 0 
      ? ['All algorithm validation tests passed']
      : failedTests.map(test => `Test ${test.testIndex} failed: ${test.errors.join(', ')}`)
  };
}

/**
 * Helper for manual point calculation verification
 */
export function logCalculationBreakdown(result: MatchResult): void {
  const calculation = calculateOfficialPoints(result);
  
  console.log('=== OFFICIAL ALGORITHM CALCULATION ===');
  console.log(`Player ID: ${result.playerId}`);
  console.log(`Match Result: ${result.isWin ? 'WIN' : 'LOSS'}`);
  console.log(`Base Points: ${result.isWin ? 3 : 1} (System B)`);
  console.log(`Age Multiplier: ${result.ageMultiplier || 1.0}x`);
  console.log(`Gender Multiplier: ${result.genderMultiplier || 1.0}x`);
  console.log(`Event Multiplier: ${result.eventMultiplier || 1.0}x`);
  console.log(`Ranking Points: ${calculation.rankingPoints}`);
  console.log(`Pickle Points: ${calculation.picklePoints} (1.5x per match)`);
  console.log('=====================================');
}

/**
 * DATA INTEGRITY VALIDATION UTILITIES
 * Added August 25, 2025 - UDF Critical Safeguards Implementation
 */

export interface DataIntegrityAuditResult {
  passed: boolean;
  criticalIssues: string[];
  warnings: string[];
  mustFixBeforeDeployment: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  correctOperation?: string;
  correctRange?: string;
  maxExpected?: string;
}

/**
 * RULE 12: Enhanced additive points system protection
 */
export function validateAdditivePointUpdate(
  currentPoints: number,
  newPoints: number, 
  playerId: string,
  operation: 'add' | 'replace' = 'add'
): ValidationResult {
  
  // CRITICAL: Block any non-additive operations
  if (operation === 'replace') {
    return {
      isValid: false,
      error: 'FORBIDDEN: Point replacement operations destroy tournament history',
      correctOperation: `Use additive: ${currentPoints} + ${newPoints} = ${currentPoints + newPoints}`
    };
  }
  
  // VALIDATION: Ensure new points are reasonable
  if (newPoints < 0) {
    return {
      isValid: false,
      error: 'INVALID: Negative point additions not allowed',
      correctRange: 'Points must be positive integers'
    };
  }
  
  if (newPoints > 100) {
    return {
      isValid: false,
      error: 'SUSPICIOUS: Single match point addition exceeds maximum expected value',
      maxExpected: 'Tournament matches typically award ≤30 points'
    };
  }
  
  return { isValid: true };
}

/**
 * RULE 10: User match statistics consistency validation
 */
export function validateUserMatchConsistency(
  userTotalMatches: number,
  userWinsCount: number,
  actualMatchCount: number,
  actualWinsCount: number,
  userId: string
): ValidationResult {
  
  const issues: string[] = [];
  
  if (userTotalMatches !== actualMatchCount) {
    issues.push(`Total matches mismatch: User table shows ${userTotalMatches}, actual matches: ${actualMatchCount}`);
  }
  
  if (userWinsCount !== actualWinsCount) {
    issues.push(`Wins count mismatch: User table shows ${userWinsCount}, actual wins: ${actualWinsCount}`);
  }
  
  if (userWinsCount > userTotalMatches) {
    issues.push(`Impossible data: Wins (${userWinsCount}) cannot exceed total matches (${userTotalMatches})`);
  }
  
  return {
    isValid: issues.length === 0,
    error: issues.length > 0 ? `User ${userId} statistics corrupted: ${issues.join('; ')}` : undefined
  };
}

/**
 * RULE 9: Column name consistency validation
 */
export function validateColumnNameConsistency(
  queryResult: any,
  expectedFields: string[]
): ValidationResult {
  
  const missingFields: string[] = [];
  const unexpectedFields: string[] = [];
  
  // Check for missing expected fields
  for (const field of expectedFields) {
    if (!(field in queryResult)) {
      missingFields.push(field);
    }
  }
  
  // Check for unexpected snake_case fields (indicating mapping issues)
  const snakeCasePattern = /^[a-z]+(_[a-z]+)+$/;
  for (const field in queryResult) {
    if (snakeCasePattern.test(field) && !expectedFields.includes(field)) {
      unexpectedFields.push(field);
    }
  }
  
  const issues: string[] = [];
  if (missingFields.length > 0) {
    issues.push(`Missing fields: ${missingFields.join(', ')}`);
  }
  if (unexpectedFields.length > 0) {
    issues.push(`Unmapped snake_case fields detected: ${unexpectedFields.join(', ')}`);
  }
  
  return {
    isValid: issues.length === 0,
    error: issues.length > 0 ? `Column mapping issues: ${issues.join('; ')}` : undefined
  };
}

/**
 * RULE 8: Database schema consistency enforcement
 */
export function validateRankingDataSource(
  dataSource: 'users_table' | 'ranking_points_table',
  legacyCount: number,
  currentCount: number
): ValidationResult {
  
  if (dataSource === 'users_table' && legacyCount > currentCount) {
    return {
      isValid: false,
      error: `CRITICAL: Reading from deprecated users table while ${legacyCount} users are trapped in legacy system`,
      correctOperation: 'Must migrate to ranking_points table and use current ranking system'
    };
  }
  
  if (dataSource === 'users_table') {
    return {
      isValid: false,
      error: 'DEPRECATED: Using legacy users.ranking_points columns',
      correctOperation: 'Switch to ranking_points table for all ranking displays'
    };
  }
  
  return { isValid: true };
}

/**
 * RULE 11: Pre-deployment data migration audit
 */
export function createDataIntegrityAudit(): DataIntegrityAuditResult {
  // This would be implemented with actual database queries in a real system
  // For now, providing the structure for implementation
  
  return {
    passed: false, // Will be determined by actual audit results
    criticalIssues: [
      'DATA MIGRATION INCOMPLETE: Users trapped in legacy system detected',
      'USER STATS CORRUPTION: Match count inconsistencies found',
      'POINT CALCULATION ERRORS: Invalid point totals detected'
    ],
    warnings: [
      'Column name mapping inconsistencies detected',
      'Performance degradation from dual system queries'
    ],
    mustFixBeforeDeployment: true
  };
}

/**
 * Comprehensive point calculation validation
 */
export function validatePointCalculationAccuracy(
  playerId: string,
  expectedPoints: number,
  actualPoints: number,
  matchHistory: { wins: number; losses: number }
): ValidationResult {
  
  // Calculate expected points using System B
  const expectedCalculation = (matchHistory.wins * SYSTEM_B_BASE_POINTS.WIN) + 
                             (matchHistory.losses * SYSTEM_B_BASE_POINTS.LOSS);
  
  if (Math.abs(actualPoints - expectedCalculation) > 0.01) {
    return {
      isValid: false,
      error: `Point calculation error for player ${playerId}: Expected ${expectedCalculation}, found ${actualPoints}`,
      correctOperation: `Recalculate: ${matchHistory.wins} wins × 3 + ${matchHistory.losses} losses × 1 = ${expectedCalculation} points`
    };
  }
  
  return { isValid: true };
}