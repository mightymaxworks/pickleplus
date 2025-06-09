/**
 * Training Center Admin Module CI/CD Test Runner
 * Direct validation of API endpoints and functionality
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api/admin/training-centers`;

class TrainingCenterAdminTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Running: ${name}`);
    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS' });
      console.log(`✅ PASS: ${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${name} - ${error.message}`);
    }
  }

  async testHealthCheck() {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
  }

  async testTrainingCentersEndpoint() {
    const response = await fetch(`${API_BASE}/centers`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Centers endpoint failed: ${response.status}`);
    }

    if (!data.hasOwnProperty('success')) {
      throw new Error('Response missing success field');
    }

    if (!Array.isArray(data.data)) {
      throw new Error('Centers data is not an array');
    }

    console.log(`  📊 Found ${data.data.length} training centers`);
  }

  async testCoachesEndpoint() {
    const response = await fetch(`${API_BASE}/coaches`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Coaches endpoint failed: ${response.status}`);
    }

    if (!data.hasOwnProperty('success')) {
      throw new Error('Response missing success field');
    }

    if (!Array.isArray(data.data)) {
      throw new Error('Coaches data is not an array');
    }

    console.log(`  👨‍🏫 Found ${data.data.length} coaches`);
  }

  async testClassesEndpoint() {
    const response = await fetch(`${API_BASE}/classes`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Classes endpoint failed: ${response.status}`);
    }

    if (!data.hasOwnProperty('success')) {
      throw new Error('Response missing success field');
    }

    if (!Array.isArray(data.data)) {
      throw new Error('Classes data is not an array');
    }

    console.log(`  📚 Found ${data.data.length} class sessions`);
  }

  async testResponseFormat() {
    const response = await fetch(`${API_BASE}/centers`);
    const data = await response.json();
    
    if (data.data.length > 0) {
      const center = data.data[0];
      const requiredFields = ['id', 'name', 'address', 'capacity'];
      
      for (const field of requiredFields) {
        if (!center.hasOwnProperty(field)) {
          throw new Error(`Training center missing required field: ${field}`);
        }
      }
    }
  }

  async testErrorHandling() {
    const response = await fetch(`${API_BASE}/invalid-endpoint`);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404 for invalid endpoint, got ${response.status}`);
    }
  }

  async testPerformance() {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/centers`);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    if (responseTime > 5000) {
      throw new Error(`Response time too slow: ${responseTime}ms`);
    }
    
    console.log(`  ⚡ Response time: ${responseTime}ms`);
  }

  async testConcurrentRequests() {
    const requests = Array(5).fill(null).map(() => 
      fetch(`${API_BASE}/centers`)
    );
    
    const responses = await Promise.all(requests);
    
    for (const response of responses) {
      if (!response.ok) {
        throw new Error(`Concurrent request failed: ${response.status}`);
      }
    }
    
    console.log(`  🔄 Successfully handled 5 concurrent requests`);
  }

  async runAllTests() {
    console.log('🚀 Starting Training Center Admin Module CI/CD Tests\n');
    console.log('=' .repeat(60));

    await this.runTest('Health Check', () => this.testHealthCheck());
    await this.runTest('Training Centers Endpoint', () => this.testTrainingCentersEndpoint());
    await this.runTest('Coaches Endpoint', () => this.testCoachesEndpoint());
    await this.runTest('Classes Endpoint', () => this.testClassesEndpoint());
    await this.runTest('Response Format Validation', () => this.testResponseFormat());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Performance Test', () => this.testPerformance());
    await this.runTest('Concurrent Requests', () => this.testConcurrentRequests());

    this.printResults();
  }

  printResults() {
    console.log('\n' + '=' .repeat(60));
    console.log('📋 TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));
    
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.passed + this.results.failed}`);
    
    const successRate = ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🏁 CI/CD Testing Complete');
    
    if (this.results.failed === 0) {
      console.log('🎉 All tests passed! Training Center Admin module is ready for deployment.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix before deployment.');
    }
  }
}

// Run the tests
async function runTests() {
  const tester = new TrainingCenterAdminTester();
  await tester.runAllTests();
  
  // Exit with appropriate code
  process.exit(tester.results.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});

export default TrainingCenterAdminTester;