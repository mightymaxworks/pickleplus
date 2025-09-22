/**
 * COMPREHENSIVE PICKLE POINTS & RANKING ALGORITHM VALIDATION SUITE
 * 
 * Complete end-to-end testing of the UDF-compliant algorithm system
 * Tests all critical requirements from PICKLE_PLUS_ALGORITHM_DOCUMENT.md
 * 
 * Version: 1.0.0 - Full UDF Compliance Suite
 * Last Updated: September 22, 2025
 */

import {
  SYSTEM_B_BASE_POINTS,
  PICKLE_POINTS_MULTIPLIER,
  calculateOfficialPoints,
  validatePointCalculation,
  systemValidationTest,
  validateAdditivePointsOperation,
  createValidatedMatchCalculation,
  validateEnhancedMatchCalculation,
  calculateAge,
  getAgeGroup,
  calculateDifferentialAgeMultipliers,
  calculateGenderBonus,
  AgeGroup,
  AGE_GROUP_MULTIPLIERS
} from '../shared/utils/algorithmValidation.js';

import { calculateMatchPoints, validateBatchCalculations } from '../shared/utils/matchPointsCalculator.js';

// ========================================
// DIAGNOSTIC REPORT DATA COLLECTION
// ========================================

class DiagnosticReporter {
  constructor() {
    this.testResults = [];
    this.criticalErrors = [];
    this.warnings = [];
    this.passedTests = 0;
    this.totalTests = 0;
  }

  addTest(testName, passed, details, critical = false) {
    this.totalTests++;
    if (passed) {
      this.passedTests++;
    } else {
      if (critical) {
        this.criticalErrors.push(`CRITICAL: ${testName} - ${details}`);
      } else {
        this.warnings.push(`WARNING: ${testName} - ${details}`);
      }
    }
    
    this.testResults.push({
      test: testName,
      passed,
      details,
      critical,
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(2);
    
    return {
      summary: {
        totalTests: this.totalTests,
        passedTests: this.passedTests,
        failedTests: this.totalTests - this.passedTests,
        successRate: `${successRate}%`,
        criticalErrors: this.criticalErrors.length,
        warnings: this.warnings.length,
        overallStatus: this.criticalErrors.length === 0 ? 'PASSED' : 'CRITICAL_FAILURES'
      },
      criticalErrors: this.criticalErrors,
      warnings: this.warnings,
      detailedResults: this.testResults,
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.criticalErrors.length > 0) {
      recommendations.push('🚨 IMMEDIATE ACTION REQUIRED: Critical algorithm failures detected');
      recommendations.push('❌ DO NOT DEPLOY until all critical errors are resolved');
    }
    
    if (this.warnings.length > 0) {
      recommendations.push('⚠️ Review warnings for potential issues');
    }
    
    if (this.passedTests === this.totalTests) {
      recommendations.push('✅ All tests passed - Algorithm is UDF compliant');
      recommendations.push('🚀 Ready for production deployment');
    }
    
    return recommendations;
  }
}

// ========================================
// TEST SUITE IMPLEMENTATION
// ========================================

describe('PICKLE+ ALGORITHM COMPREHENSIVE VALIDATION', () => {
  let reporter;

  beforeEach(() => {
    reporter = new DiagnosticReporter();
  });

  afterEach(() => {
    console.log('\n' + '='.repeat(80));
    console.log('DIAGNOSTIC REPORT - ALGORITHM VALIDATION');
    console.log('='.repeat(80));
    const report = reporter.generateReport();
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(80));
  });

  // ========================================
  // 1. SYSTEM B BASE POINTS VALIDATION
  // ========================================
  
  describe('1. SYSTEM B BASE POINTS VALIDATION', () => {
    test('System B constants are correct', () => {
      const winPointsCorrect = SYSTEM_B_BASE_POINTS.WIN === 3;
      const lossPointsCorrect = SYSTEM_B_BASE_POINTS.LOSS === 1;
      
      reporter.addTest(
        'System B Base Points Constants',
        winPointsCorrect && lossPointsCorrect,
        `Win: ${SYSTEM_B_BASE_POINTS.WIN}, Loss: ${SYSTEM_B_BASE_POINTS.LOSS}`,
        true
      );
      
      expect(SYSTEM_B_BASE_POINTS.WIN).toBe(3);
      expect(SYSTEM_B_BASE_POINTS.LOSS).toBe(1);
    });

    test('Basic win calculation', () => {
      const result = calculateOfficialPoints({
        playerId: 1,
        isWin: true,
        basePoints: 3
      });
      
      const correct = result.rankingPoints === 3 && result.picklePoints === 4.5;
      
      reporter.addTest(
        'Basic Win Calculation',
        correct,
        `Ranking: ${result.rankingPoints}, Pickle: ${result.picklePoints}`,
        true
      );
      
      expect(result.rankingPoints).toBe(3);
      expect(result.picklePoints).toBe(4.5); // 3 * 1.5
    });

    test('Basic loss calculation', () => {
      const result = calculateOfficialPoints({
        playerId: 1,
        isWin: false,
        basePoints: 1
      });
      
      const correct = result.rankingPoints === 1 && result.picklePoints === 1.5;
      
      reporter.addTest(
        'Basic Loss Calculation',
        correct,
        `Ranking: ${result.rankingPoints}, Pickle: ${result.picklePoints}`,
        true
      );
      
      expect(result.rankingPoints).toBe(1);
      expect(result.picklePoints).toBe(1.5); // 1 * 1.5
    });
  });

  // ========================================
  // 2. PICKLE POINTS MULTIPLIER VALIDATION
  // ========================================
  
  describe('2. PICKLE POINTS MULTIPLIER VALIDATION', () => {
    test('Pickle Points multiplier is exactly 1.5x', () => {
      const correct = PICKLE_POINTS_MULTIPLIER === 1.5;
      
      reporter.addTest(
        'Pickle Points Multiplier',
        correct,
        `Multiplier: ${PICKLE_POINTS_MULTIPLIER}x`,
        true
      );
      
      expect(PICKLE_POINTS_MULTIPLIER).toBe(1.5);
    });

    test('Pickle Points applied PER MATCH (not total)', () => {
      const match1 = calculateOfficialPoints({
        playerId: 1,
        isWin: true,
        basePoints: 3
      });
      
      const match2 = calculateOfficialPoints({
        playerId: 1,
        isWin: false,
        basePoints: 1
      });
      
      // Each match should get individual 1.5x multiplier
      const match1Correct = match1.picklePoints === 4.5; // 3 * 1.5
      const match2Correct = match2.picklePoints === 1.5; // 1 * 1.5
      const totalCorrect = (match1.picklePoints + match2.picklePoints) === 6.0;
      
      reporter.addTest(
        'Per-Match Pickle Points Application',
        match1Correct && match2Correct && totalCorrect,
        `Match1: ${match1.picklePoints}, Match2: ${match2.picklePoints}, Total: ${match1.picklePoints + match2.picklePoints}`,
        true
      );
      
      expect(match1.picklePoints).toBe(4.5);
      expect(match2.picklePoints).toBe(1.5);
    });
  });

  // ========================================
  // 3. AGE GROUP MULTIPLIER VALIDATION
  // ========================================
  
  describe('3. AGE GROUP MULTIPLIER VALIDATION', () => {
    test('Age group calculations are accurate', () => {
      const testCases = [
        { birthYear: 2024 - 30, expected: AgeGroup.OPEN },
        { birthYear: 2024 - 40, expected: AgeGroup.THIRTY_FIVE_PLUS },
        { birthYear: 2024 - 55, expected: AgeGroup.FIFTY_PLUS },
        { birthYear: 2024 - 65, expected: AgeGroup.SIXTY_PLUS },
        { birthYear: 2024 - 75, expected: AgeGroup.SEVENTY_PLUS }
      ];
      
      let allCorrect = true;
      const results = [];
      
      testCases.forEach(testCase => {
        const birthDate = new Date(testCase.birthYear, 0, 1);
        const ageGroup = getAgeGroup(birthDate);
        const correct = ageGroup === testCase.expected;
        allCorrect = allCorrect && correct;
        results.push(`Age ${2024 - testCase.birthYear}: ${ageGroup} (expected: ${testCase.expected})`);
      });
      
      reporter.addTest(
        'Age Group Calculations',
        allCorrect,
        results.join(', '),
        true
      );
      
      expect(allCorrect).toBe(true);
    });

    test('Age multipliers are correct', () => {
      const expectedMultipliers = {
        [AgeGroup.OPEN]: 1.0,
        [AgeGroup.THIRTY_FIVE_PLUS]: 1.2,
        [AgeGroup.FIFTY_PLUS]: 1.3,
        [AgeGroup.SIXTY_PLUS]: 1.5,
        [AgeGroup.SEVENTY_PLUS]: 1.6
      };
      
      let allCorrect = true;
      const results = [];
      
      Object.entries(expectedMultipliers).forEach(([ageGroup, expectedMultiplier]) => {
        const actualMultiplier = AGE_GROUP_MULTIPLIERS[ageGroup];
        const correct = actualMultiplier === expectedMultiplier;
        allCorrect = allCorrect && correct;
        results.push(`${ageGroup}: ${actualMultiplier}x`);
      });
      
      reporter.addTest(
        'Age Group Multipliers',
        allCorrect,
        results.join(', '),
        true
      );
      
      expect(allCorrect).toBe(true);
    });
  });

  // ========================================
  // 4. GENDER BONUS VALIDATION
  // ========================================
  
  describe('4. GENDER BONUS VALIDATION', () => {
    test('Female players under 1000 points get 1.15x bonus in cross-gender matches', () => {
      const players = [
        { id: '1', dateOfBirth: new Date(1990, 0, 1), gender: 'male', currentRankingPoints: 800 },
        { id: '2', dateOfBirth: new Date(1992, 0, 1), gender: 'female', currentRankingPoints: 600 }
      ];
      
      const genderBonuses = calculateGenderBonus(players);
      
      const maleCorrect = genderBonuses['1'] === 1.0;
      const femaleCorrect = genderBonuses['2'] === 1.15;
      
      reporter.addTest(
        'Cross-Gender Female Bonus (<1000 pts)',
        maleCorrect && femaleCorrect,
        `Male: ${genderBonuses['1']}x, Female: ${genderBonuses['2']}x`,
        true
      );
      
      expect(genderBonuses['1']).toBe(1.0);
      expect(genderBonuses['2']).toBe(1.15);
    });

    test('Female players over 1000 points get no bonus', () => {
      const players = [
        { id: '1', dateOfBirth: new Date(1990, 0, 1), gender: 'male', currentRankingPoints: 1200 },
        { id: '2', dateOfBirth: new Date(1992, 0, 1), gender: 'female', currentRankingPoints: 1500 }
      ];
      
      const genderBonuses = calculateGenderBonus(players);
      
      const bothCorrect = genderBonuses['1'] === 1.0 && genderBonuses['2'] === 1.0;
      
      reporter.addTest(
        'No Female Bonus (>1000 pts)',
        bothCorrect,
        `Male: ${genderBonuses['1']}x, Female: ${genderBonuses['2']}x`,
        false
      );
      
      expect(genderBonuses['1']).toBe(1.0);
      expect(genderBonuses['2']).toBe(1.0);
    });
  });

  // ========================================
  // 5. ADDITIVE POINTS VALIDATION
  // ========================================
  
  describe('5. ADDITIVE POINTS VALIDATION', () => {
    test('Additive operations are validated correctly', () => {
      const result = validateAdditivePointsOperation(100, 5, 'add');
      
      const correct = result.isValid && result.correctTotal === 105;
      
      reporter.addTest(
        'Additive Points Operation',
        correct,
        `Current: 100, New: 5, Total: ${result.correctTotal}`,
        true
      );
      
      expect(result.isValid).toBe(true);
      expect(result.correctTotal).toBe(105);
    });

    test('Replacement operations are forbidden', () => {
      const result = validateAdditivePointsOperation(100, 50, 'replace');
      
      const correct = !result.isValid && result.error && result.correctTotal === 150;
      
      reporter.addTest(
        'Replacement Operations Forbidden',
        correct,
        `Operation blocked: ${result.error}`,
        true
      );
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('FORBIDDEN');
      expect(result.correctTotal).toBe(150);
    });
  });

  // ========================================
  // 6. DECIMAL PRECISION VALIDATION
  // ========================================
  
  describe('6. DECIMAL PRECISION VALIDATION', () => {
    test('All calculations maintain 2 decimal precision', () => {
      const testCases = [
        { basePoints: 3, ageMultiplier: 1.2, genderMultiplier: 1.15 },
        { basePoints: 1, ageMultiplier: 1.3, genderMultiplier: 1.0 },
        { basePoints: 3, ageMultiplier: 1.6, genderMultiplier: 1.15 }
      ];
      
      let allCorrect = true;
      const results = [];
      
      testCases.forEach((testCase, index) => {
        const result = calculateOfficialPoints({
          playerId: index,
          isWin: testCase.basePoints === 3,
          basePoints: testCase.basePoints,
          ageMultiplier: testCase.ageMultiplier,
          genderMultiplier: testCase.genderMultiplier
        });
        
        const rankingDecimals = (result.rankingPoints.toString().split('.')[1] || '').length;
        const pickleDecimals = (result.picklePoints.toString().split('.')[1] || '').length;
        
        const precisionCorrect = rankingDecimals <= 2 && pickleDecimals <= 2;
        allCorrect = allCorrect && precisionCorrect;
        
        results.push(`Test ${index + 1}: Ranking ${result.rankingPoints} (${rankingDecimals}dp), Pickle ${result.picklePoints} (${pickleDecimals}dp)`);
      });
      
      reporter.addTest(
        'Decimal Precision (≤2 places)',
        allCorrect,
        results.join('; '),
        true
      );
      
      expect(allCorrect).toBe(true);
    });
  });

  // ========================================
  // 7. INTEGRATED ALGORITHM VALIDATION
  // ========================================
  
  describe('7. INTEGRATED ALGORITHM VALIDATION', () => {
    test('Complete match calculation with all multipliers', () => {
      const players = [
        { 
          id: '1', 
          dateOfBirth: new Date(1970, 0, 1), // 54 years old - 50+ category
          gender: 'male', 
          currentRankingPoints: 800 
        },
        { 
          id: '2', 
          dateOfBirth: new Date(1985, 0, 1), // 39 years old - 35+ category
          gender: 'female', 
          currentRankingPoints: 600 
        }
      ];
      
      const winners = ['1'];
      const result = createValidatedMatchCalculation(players, winners, 'doubles');
      
      const validationPassed = result.success && result.results && result.results.length === 2;
      
      let calculationCorrect = false;
      if (result.results) {
        const winner = result.results.find(r => r.playerId === '1');
        const loser = result.results.find(r => r.playerId === '2');
        
        // Winner: 3 (base) * 1.3 (50+) * 1.0 (male) = 3.9 ranking, 5.85 pickle
        // Loser: 1 (base) * 1.2 (35+) * 1.15 (female <1000) = 1.38 ranking, 2.07 pickle
        calculationCorrect = winner && loser &&
          Math.abs(winner.finalRankingPoints - 3.9) < 0.01 &&
          Math.abs(winner.finalPicklePoints - 5.85) < 0.01 &&
          Math.abs(loser.finalRankingPoints - 1.38) < 0.01 &&
          Math.abs(loser.finalPicklePoints - 2.07) < 0.01;
      }
      
      reporter.addTest(
        'Complete Match Calculation',
        validationPassed && calculationCorrect,
        result.success ? 'All calculations validated' : `Errors: ${result.errors?.join(', ')}`,
        true
      );
      
      expect(result.success).toBe(true);
      expect(calculationCorrect).toBe(true);
    });
  });

  // ========================================
  // 8. SYSTEM VALIDATION TEST
  // ========================================
  
  describe('8. SYSTEM VALIDATION TEST', () => {
    test('Built-in system validation passes', () => {
      const systemTest = systemValidationTest();
      
      reporter.addTest(
        'Built-in System Validation',
        systemTest.passed,
        systemTest.details.join(', '),
        true
      );
      
      expect(systemTest.passed).toBe(true);
    });
  });
});

// ========================================
// EXPORT FOR EXTERNAL TESTING
// ========================================

export { DiagnosticReporter };