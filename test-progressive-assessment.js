#!/usr/bin/env node

/**
 * Progressive Assessment System Test Suite
 * Tests the enhanced CoachingAssessmentValidator with Progressive Assessment Model
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
let authCookie = null;

// Test data
const testCoachId = 283; // admin_test user
const testStudentId = 1; // Default test student
const testSkillsData = [
  {
    skillName: 'Serve Power',
    category: 'Groundstrokes and Serves',
    rating: 8,
    notes: 'Excellent power development'
  },
  {
    skillName: 'Forehand Topspin Dink',
    category: 'Dinks and Resets', 
    rating: 7,
    notes: 'Good consistency'
  },
  {
    skillName: 'Split Step Readiness',
    category: 'Footwork & Fitness',
    rating: 6,
    notes: 'Needs improvement in timing'
  }
];

async function authenticate() {
  console.log('🔐 Authenticating admin_test user...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin_test',
      password: 'admin123'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      authCookie = response.headers['set-cookie'];
      console.log('✅ Authentication successful');
      return true;
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error.response?.data || error.message);
    return false;
  }
}

async function createCoachStudentAssignment() {
  console.log('👥 Creating coach-student assignment...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/coach-student-assignment`, {
      coachId: testCoachId,
      studentId: testStudentId,
      notes: 'Progressive Assessment Test Assignment'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie?.join('; ') || ''
      }
    });

    if (response.status === 200) {
      console.log('✅ Coach-student assignment created successfully');
      return true;
    }
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️ Coach-student assignment already exists');
      return true;
    }
    console.error('❌ Failed to create assignment:', error.response?.data || error.message);
    return false;
  }
}

async function testProgressiveAssessmentAPI() {
  console.log('🧪 Testing Progressive Assessment API endpoint...');
  
  try {
    const progressiveAssessmentData = {
      coachId: testCoachId,
      studentId: testStudentId,
      assessmentType: 'Focused Session',
      skills: testSkillsData,
      sessionNotes: 'Progressive assessment test - focused on specific skills for development',
      pcpRating: 6.8
    };

    const response = await axios.post(`${BASE_URL}/api/coaching/progressive-assessment`, 
      progressiveAssessmentData, 
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie?.join('; ') || ''
        }
      }
    );

    if (response.status === 200) {
      const result = response.data;
      console.log('✅ Progressive Assessment API Test Passed');
      console.log(`   Assessment ID: ${result.assessmentId}`);
      console.log(`   Skills Assessed: ${result.skillsAssessed}`);
      console.log(`   Assessment Type: ${result.assessmentType}`);
      console.log(`   PCP Rating: ${result.pcpRating}`);
      return result.assessmentId;
    }
  } catch (error) {
    console.error('❌ Progressive Assessment API Test Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testValidationSystem() {
  console.log('🔒 Testing validation system...');
  
  try {
    // Test with invalid coach ID
    const invalidResponse = await axios.post(`${BASE_URL}/api/coaching/progressive-assessment`, {
      coachId: 999, // Non-existent coach
      studentId: testStudentId,
      assessmentType: 'Focused Session',
      skills: testSkillsData,
      sessionNotes: 'This should fail',
      pcpRating: 5.0
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie?.join('; ') || ''
      }
    });

    console.error('❌ Validation test failed - should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Validation system working - properly rejected unauthorized coach');
      return true;
    }
    console.error('❌ Unexpected validation error:', error.response?.data || error.message);
    return false;
  }
}

async function testDataIntegrity(assessmentId) {
  console.log('📊 Testing data integrity...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/coach/recent-assessments`, {
      withCredentials: true,
      headers: {
        'Cookie': authCookie?.join('; ') || ''
      }
    });

    if (response.status === 200) {
      const assessments = response.data;
      const foundAssessment = assessments.find(a => a.id === assessmentId);
      
      if (foundAssessment) {
        console.log('✅ Data integrity test passed - assessment found in recent assessments');
        console.log(`   Assessment Notes: ${foundAssessment.notes?.substring(0, 50)}...`);
        return true;
      } else {
        console.error('❌ Data integrity test failed - assessment not found in recent assessments');
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Data integrity test error:', error.response?.data || error.message);
    return false;
  }
}

async function runFullTest() {
  console.log('🚀 Starting Progressive Assessment System Test Suite\n');
  
  let passed = 0;
  let total = 0;

  // Test 1: Authentication
  total++;
  if (await authenticate()) {
    passed++;
  }

  // Test 2: Coach-Student Assignment
  total++;
  if (await createCoachStudentAssignment()) {
    passed++;
  }

  // Test 3: Progressive Assessment API
  total++;
  const assessmentId = await testProgressiveAssessmentAPI();
  if (assessmentId) {
    passed++;
  }

  // Test 4: Validation System
  total++;
  if (await testValidationSystem()) {
    passed++;
  }

  // Test 5: Data Integrity
  if (assessmentId) {
    total++;
    if (await testDataIntegrity(assessmentId)) {
      passed++;
    }
  }

  console.log('\n📋 Test Results Summary:');
  console.log(`✅ Passed: ${passed}/${total} tests`);
  console.log(`${passed === total ? '🎉 All tests passed!' : '⚠️  Some tests failed'}`);

  if (passed === total) {
    console.log('\n🎯 Progressive Assessment System is fully functional:');
    console.log('   • Authentication working correctly');
    console.log('   • Coach-student validation enforced');
    console.log('   • Progressive assessment API operational');
    console.log('   • Security controls functioning');
    console.log('   • Data persistence verified');
  }

  return passed === total;
}

// Run the test suite  
runFullTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });