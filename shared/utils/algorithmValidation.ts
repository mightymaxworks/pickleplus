/**
 * Algorithm Validation Utilities
 * Ensures all point calculations follow the official Pickle+ Algorithm Document
 */

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
 * Official Pickle+ Algorithm Point Calculation
 * Source: PICKLE_PLUS_ALGORITHM_DOCUMENT.md
 */
export function calculateOfficialPoints(result: MatchResult): PointCalculation {
  // System B: 3 points win, 1 point loss (CONFIRMED)
  const basePoints = result.isWin ? 3 : 1;
  
  // Apply multipliers (age, gender, event)
  const rankingPoints = basePoints * 
    (result.ageMultiplier || 1.0) * 
    (result.genderMultiplier || 1.0) * 
    (result.eventMultiplier || 1.0);
    
  // Pickle Points: 1.5x multiplier PER MATCH (not total points)
  const picklePoints = Math.round(rankingPoints * 1.5);
  
  return {
    rankingPoints: Math.round(rankingPoints * 100) / 100, // 2 decimal precision
    picklePoints
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