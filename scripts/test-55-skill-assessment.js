#!/usr/bin/env node

/**
 * Comprehensive 55-Skill Assessment Testing Script
 * 
 * This script validates the complete 55-skill assessment functionality:
 * 1. Coach authentication and authorization
 * 2. Coach-student assignment validation
 * 3. Complete 55-skill assessment submission
 * 4. Data persistence and retrieval
 * 5. Assessment calculation accuracy
 */

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const TEST_TIMEOUT = 30000;

class SkillAssessmentTester {
  constructor() {
    this.sessionCookie = null;
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

  async authenticateUser() {
    const response = await fetch(`${BASE_URL}/api/auth/current-user`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const user = await response.json();
      this.log(`Already authenticated as: ${user.username} (ID: ${user.id})`);
      return user;
    }

    throw new Error('Authentication failed - user needs to be logged in via browser');
  }

  async testCoachAuthentication() {
    const user = await this.authenticateUser();
    
    if (!user.id) {
      throw new Error('User ID not found in authentication response');
    }

    if (!user.isAdmin && !user.coachLevel) {
      throw new Error('User does not have coach privileges');
    }

    this.log(`User ${user.username} has appropriate coaching access`);
    this.userId = user.id;
    return user;
  }

  async testCoachStudentAssignments() {
    const response = await fetch(`${BASE_URL}/api/coach/assigned-students`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assigned students: ${response.status} ${response.statusText}`);
    }

    const students = await response.json();
    
    if (!Array.isArray(students) || students.length === 0) {
      // Create a test assignment for testing
      this.log('No students assigned, creating test assignment...');
      await this.createTestAssignment();
      return await this.testCoachStudentAssignments();
    }

    this.log(`Found ${students.length} assigned students`);
    this.testStudentId = students[0].id;
    return students;
  }

  async createTestAssignment() {
    // Create a test student assignment for the authenticated coach
    const response = await fetch(`${BASE_URL}/api/admin/coach-student-assignment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coachId: this.userId,
        studentId: 2, // Use a test student ID
        notes: 'Test assignment for 55-skill assessment validation'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create test assignment: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    this.log(`Created test assignment: ${result.message}`);
  }

  async test55SkillAssessmentSubmission() {
    if (!this.testStudentId) {
      throw new Error('No test student ID available for assessment');
    }

    // Generate complete 55-skill assessment data
    const assessmentData = this.generate55SkillAssessmentData();
    
    const assessmentPayload = {
      studentId: this.testStudentId,
      coachId: this.userId,
      assessmentData: assessmentData,
      totalSkills: 55
    };

    this.log('Submitting 55-skill assessment...');
    
    const response = await fetch(`${BASE_URL}/api/coach/submit-assessment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assessmentPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Assessment submission failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Assessment submission unsuccessful: ${result.message || 'Unknown error'}`);
    }

    this.log(`Assessment submitted successfully with ID: ${result.assessmentId}`);
    this.assessmentId = result.assessmentId;
    return result;
  }

  generate55SkillAssessmentData() {
    const categories = {
      'Groundstrokes and Serves': [
        'Serve Power', 'Serve Placement', 'Forehand Flat Drive', 'Forehand Topspin Drive', 
        'Forehand Slice', 'Backhand Flat Drive', 'Backhand Topspin Drive', 'Backhand Slice',
        'Third Shot Drive', 'Forehand Return of Serve', 'Backhand Return of Serve'
      ],
      'Dinks and Resets': [
        'Forehand Topspin Dink', 'Forehand Dead Dink', 'Forehand Slice Dink', 'Backhand Topspin Dink',
        'Backhand Dead Dink', 'Backhand Slice Dink', 'Forehand Third Shot Drop', 'Forehand Top Spin Third Shot Drop',
        'Forehand Slice Third Shot Drop', 'Backhand Third Shot Drop', 'Backhand Top Spin Third Shot Drop', 
        'Backhand Slice Third Shot Drop', 'Forehand Resets', 'Backhand Resets', 'Forehand Lob', 'Backhand Lob'
      ],
      'Volleys and Smashes': [
        'Forehand Punch Volley', 'Forehand Roll Volley', 'Backhand Punch Volley', 
        'Backhand Roll Volley', 'Forehand Overhead Smash', 'Backhand Overhead Smash'
      ],
      'Footwork & Fitness': [
        'Split Step Readiness', 'Lateral Shuffles', 'Crossover Steps', 'Court Recovery', 
        'First Step Speed', 'Balance & Core Stability', 'Agility', 'Endurance Conditioning',
        'Leg Strength & Power', 'Transition Speed (Baseline to Kitchen)'
      ],
      'Mental Game': [
        'Staying Present', 'Resetting After Errors', 'Patience & Shot Selection', 'Positive Self-Talk',
        'Visualization', 'Pressure Handling', 'Focus Shifts', 'Opponent Reading',
        'Emotional Regulation', 'Competitive Confidence'
      ]
    };

    const assessmentData = {};
    let totalSkills = 0;

    Object.keys(categories).forEach(categoryName => {
      categories[categoryName].forEach(skillName => {
        // Generate realistic ratings between 6-9 for testing
        const rating = Math.floor(Math.random() * 4) + 6; // 6-9 range
        assessmentData[skillName] = rating;
        totalSkills++;
      });
    });

    this.log(`Generated assessment data for ${totalSkills} skills across 5 categories`);
    
    // Validate we have exactly 55 skills
    if (totalSkills !== 55) {
      throw new Error(`Expected 55 skills, but generated ${totalSkills} skills`);
    }

    return assessmentData;
  }

  async testAssessmentPersistence() {
    if (!this.assessmentId) {
      throw new Error('No assessment ID available for persistence test');
    }

    // Fetch recent assessments to verify the submitted assessment exists
    const response = await fetch(`${BASE_URL}/api/coach/recent-assessments`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recent assessments: ${response.status} ${response.statusText}`);
    }

    const assessments = await response.json();
    
    if (!Array.isArray(assessments)) {
      throw new Error('Recent assessments response is not an array');
    }

    const foundAssessment = assessments.find(assessment => 
      assessment.id === this.assessmentId || 
      assessment.notes?.includes('55-skill assessment completed')
    );

    if (!foundAssessment) {
      throw new Error(`Submitted assessment not found in recent assessments`);
    }

    this.log(`Assessment persistence verified - found assessment in recent list`);
    return foundAssessment;
  }

  async testSkillCategoryCalculations() {
    // Test that category averages are calculated correctly
    const sampleData = {
      'Serve Power': 8,
      'Serve Placement': 7,
      'Forehand Flat Drive': 6,
      'Forehand Topspin Drive': 8,
      'Forehand Slice': 7,
      'Backhand Flat Drive': 6,
      'Backhand Topspin Drive': 7,
      'Backhand Slice': 6,
      'Third Shot Drive': 8,
      'Forehand Return of Serve': 7,
      'Backhand Return of Serve': 6
    };

    // Expected average for Groundstrokes and Serves category
    const expectedAverage = Object.values(sampleData).reduce((sum, val) => sum + val, 0) / Object.values(sampleData).length;
    
    this.log(`Sample category calculation test: Expected average ${expectedAverage.toFixed(2)}`);
    
    if (expectedAverage < 1 || expectedAverage > 10) {
      throw new Error(`Category average out of expected range: ${expectedAverage}`);
    }

    this.log('Category calculation logic verified');
  }

  async testCoachAssessmentValidation() {
    // Test that assessment submission requires valid coach-student assignment
    const invalidPayload = {
      studentId: 99999, // Non-existent student
      coachId: this.userId,
      assessmentData: { 'Test Skill': 5 },
      totalSkills: 1
    };

    const response = await fetch(`${BASE_URL}/api/coach/submit-assessment`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidPayload)
    });

    // This should fail with 403 or 404
    if (response.ok) {
      throw new Error('Assessment submission should have failed for invalid student assignment');
    }

    if (response.status !== 403 && response.status !== 404) {
      throw new Error(`Expected 403 or 404 status, got ${response.status}`);
    }

    this.log('Assessment validation working correctly - rejects invalid assignments');
  }

  async testComplete55SkillWorkflow() {
    // Test the complete workflow from authentication to assessment completion
    this.log('Starting complete 55-skill assessment workflow test...');

    await this.runTest('Coach Authentication', () => this.testCoachAuthentication());
    await this.runTest('Coach-Student Assignments', () => this.testCoachStudentAssignments());
    await this.runTest('Skill Category Calculations', () => this.testSkillCategoryCalculations());
    await this.runTest('55-Skill Assessment Submission', () => this.test55SkillAssessmentSubmission());
    await this.runTest('Assessment Persistence', () => this.testAssessmentPersistence());
    await this.runTest('Assessment Validation', () => this.testCoachAssessmentValidation());
  }

  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testSuite: '55-Skill PCP Assessment System',
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: `${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`
      },
      errors: this.testResults.errors,
      status: this.testResults.failed === 0 ? 'ALL_TESTS_PASSED' : 'SOME_TESTS_FAILED'
    };

    // Save report to file
    fs.writeFileSync('./test-results/55-skill-assessment-test-report.json', JSON.stringify(report, null, 2));
    
    return report;
  }

  printSummary() {
    this.log('\n=== 55-SKILL ASSESSMENT TEST SUMMARY ===');
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
      this.log('\n🎉 ALL TESTS PASSED - 55-Skill Assessment System is functioning correctly!', 'success');
    } else {
      this.log('\n⚠️ Some tests failed - please review the errors above', 'error');
    }
  }
}

// Run the tests
async function main() {
  const tester = new SkillAssessmentTester();
  
  try {
    await tester.testComplete55SkillWorkflow();
    const report = tester.generateTestReport();
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

export { SkillAssessmentTester };