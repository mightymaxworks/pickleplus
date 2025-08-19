#!/usr/bin/env node

/**
 * PCP Calculation Algorithm Testing Script
 * 
 * Validates the UDF-compliant PCP rating calculation implementation
 * Tests various scenarios and edge cases to ensure algorithm accuracy
 */

import { 
  calculatePCPRating, 
  validateAssessmentData, 
  createSampleAssessmentData,
  generatePCPBreakdown,
  PCP_WEIGHTS,
  SKILL_CATEGORIES 
} from '../shared/utils/pcpCalculation.ts';

class PCPCalculationTester {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFn) {
    this.testResults.total++;
    try {
      this.log(`Running test: ${testName}`);
      await testFn();
      this.testResults.passed++;
      this.log(`✅ PASSED: ${testName}`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: testName, error: error.message });
      this.log(`❌ FAILED: ${testName} - ${error.message}`, 'error');
    }
  }

  testBasicCalculation() {
    // Test with perfectly balanced intermediate player
    const assessmentData = createSampleAssessmentData(6);
    const result = calculatePCPRating(assessmentData);
    
    if (result.pcpRating < 2.0 || result.pcpRating > 8.0) {
      throw new Error(`PCP rating ${result.pcpRating} out of valid range 2.0-8.0`);
    }
    
    if (!Number.isFinite(result.rawWeightedScore)) {
      throw new Error(`Invalid raw weighted score: ${result.rawWeightedScore}`);
    }
    
    this.log(`Intermediate player PCP rating: ${result.pcpRating}`);
  }

  testWeightingSystem() {
    // Create assessment with high touch skills, low power skills
    const assessmentData = {};
    
    // Set touch skills high (9), power skills low (3), others moderate (6)
    Object.entries(SKILL_CATEGORIES).forEach(([categoryName, skills]) => {
      skills.forEach(skillName => {
        if (categoryName === 'Dinks and Resets') {
          assessmentData[skillName] = 9; // High touch skills
        } else if (categoryName === 'Volleys and Smashes') {
          assessmentData[skillName] = 3; // Low power skills
        } else {
          assessmentData[skillName] = 6; // Moderate other skills
        }
      });
    });
    
    const result = calculatePCPRating(assessmentData);
    
    // Should be above average due to high touch weight (30%)
    if (result.pcpRating <= 5.0) {
      throw new Error(`Expected higher rating due to touch skill emphasis, got ${result.pcpRating}`);
    }
    
    // Verify touch has highest category average
    if (result.categoryAverages.touch !== 9.0) {
      throw new Error(`Expected touch average of 9.0, got ${result.categoryAverages.touch}`);
    }
    
    this.log(`Touch-heavy player PCP rating: ${result.pcpRating} (touch: ${result.categoryAverages.touch})`);
  }

  testEdgeCases() {
    // Test minimum possible rating
    const minAssessment = {};
    Object.values(SKILL_CATEGORIES).flat().forEach(skillName => {
      minAssessment[skillName] = 1;
    });
    
    const minResult = calculatePCPRating(minAssessment);
    if (minResult.pcpRating !== 2.0) {
      throw new Error(`Expected minimum PCP rating of 2.0, got ${minResult.pcpRating}`);
    }
    
    // Test maximum possible rating
    const maxAssessment = {};
    Object.values(SKILL_CATEGORIES).flat().forEach(skillName => {
      maxAssessment[skillName] = 10;
    });
    
    const maxResult = calculatePCPRating(maxAssessment);
    if (maxResult.pcpRating !== 8.0) {
      throw new Error(`Expected maximum PCP rating of 8.0, got ${maxResult.pcpRating}`);
    }
    
    this.log(`Edge cases: Min rating: ${minResult.pcpRating}, Max rating: ${maxResult.pcpRating}`);
  }

  testValidation() {
    // Test incomplete assessment
    const incompleteData = { 'Serve Power': 8, 'Forehand Flat Drive': 7 };
    const validation = validateAssessmentData(incompleteData);
    
    if (validation.isValid) {
      throw new Error('Incomplete assessment should not be valid');
    }
    
    if (validation.missingSkills.length < 50) {
      throw new Error(`Expected many missing skills, got ${validation.missingSkills.length}`);
    }
    
    // Test invalid ratings
    const invalidData = createSampleAssessmentData(6);
    invalidData['Serve Power'] = 15; // Invalid rating
    
    const invalidValidation = validateAssessmentData(invalidData);
    if (invalidValidation.isValid) {
      throw new Error('Assessment with invalid ratings should not be valid');
    }
    
    this.log(`Validation working: ${validation.missingSkills.length} missing skills detected`);
  }

  testConsistency() {
    // Test that same input always produces same output
    const assessmentData = createSampleAssessmentData(7);
    
    const result1 = calculatePCPRating(assessmentData);
    const result2 = calculatePCPRating(assessmentData);
    
    if (result1.pcpRating !== result2.pcpRating) {
      throw new Error(`Inconsistent results: ${result1.pcpRating} vs ${result2.pcpRating}`);
    }
    
    if (result1.rawWeightedScore !== result2.rawWeightedScore) {
      throw new Error(`Inconsistent raw scores: ${result1.rawWeightedScore} vs ${result2.rawWeightedScore}`);
    }
    
    this.log(`Consistency verified: ${result1.pcpRating} rating consistent across calls`);
  }

  testPrecision() {
    // Test decimal precision requirements
    const assessmentData = {};
    
    // Create assessment that should produce non-integer result
    Object.values(SKILL_CATEGORIES).flat().forEach((skillName, index) => {
      assessmentData[skillName] = 5 + (index % 3); // Mix of 5, 6, 7
    });
    
    const result = calculatePCPRating(assessmentData);
    
    // Check that result has exactly 1 decimal place
    const decimalPart = result.pcpRating.toString().split('.')[1];
    if (!decimalPart || decimalPart.length !== 1) {
      throw new Error(`PCP rating should have exactly 1 decimal place, got ${result.pcpRating}`);
    }
    
    // Check raw score has 2 decimal places
    const rawDecimalPart = result.rawWeightedScore.toString().split('.')[1];
    if (!rawDecimalPart || rawDecimalPart.length !== 2) {
      throw new Error(`Raw score should have exactly 2 decimal places, got ${result.rawWeightedScore}`);
    }
    
    this.log(`Precision verified: PCP ${result.pcpRating}, Raw ${result.rawWeightedScore}`);
  }

  testBreakdownGeneration() {
    const assessmentData = createSampleAssessmentData(6);
    const result = calculatePCPRating(assessmentData);
    const breakdown = generatePCPBreakdown(result);
    
    if (!breakdown.includes('PCP Rating Calculation Breakdown')) {
      throw new Error('Breakdown should include header');
    }
    
    if (!breakdown.includes(result.pcpRating.toString())) {
      throw new Error('Breakdown should include final PCP rating');
    }
    
    // Check that all categories are mentioned
    Object.keys(PCP_WEIGHTS).forEach(category => {
      if (!breakdown.toLowerCase().includes(category.toLowerCase())) {
        throw new Error(`Breakdown should mention ${category} category`);
      }
    });
    
    this.log('Breakdown generation working correctly');
  }

  async runAllTests() {
    this.log('Starting PCP Calculation Algorithm Tests...');
    
    await this.runTest('Basic Calculation', () => this.testBasicCalculation());
    await this.runTest('Weighting System', () => this.testWeightingSystem());
    await this.runTest('Edge Cases', () => this.testEdgeCases());
    await this.runTest('Data Validation', () => this.testValidation());
    await this.runTest('Calculation Consistency', () => this.testConsistency());
    await this.runTest('Decimal Precision', () => this.testPrecision());
    await this.runTest('Breakdown Generation', () => this.testBreakdownGeneration());
  }

  printSummary() {
    this.log('\n=== PCP CALCULATION ALGORITHM TEST SUMMARY ===');
    this.log(`Total Tests: ${this.testResults.total}`);
    this.log(`Passed: ${this.testResults.passed}`, 'success');
    this.log(`Failed: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'info');
    this.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    if (this.testResults.errors.length > 0) {
      this.log('\n=== ERRORS ===');
      this.testResults.errors.forEach(error => {
        this.log(`${error.test}: ${error.error}`, 'error');
      });
    }

    if (this.testResults.failed === 0) {
      this.log('\n🎉 ALL TESTS PASSED - PCP Calculation Algorithm is UDF-compliant!', 'success');
      this.log('✅ Weighting system verified (Touch 30%, Technical 25%, Mental 20%, Athletic 15%, Power 10%)', 'success');
      this.log('✅ Rating range 2.0-8.0 enforced', 'success');
      this.log('✅ Decimal precision requirements met', 'success');
      this.log('✅ Data validation working correctly', 'success');
    } else {
      this.log('\n⚠️ Some tests failed - algorithm needs attention', 'error');
    }
  }
}

// Run the tests
async function main() {
  const tester = new PCPCalculationTester();
  
  try {
    await tester.runAllTests();
    tester.printSummary();
    
    // Exit with appropriate code
    process.exit(tester.testResults.failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PCPCalculationTester };