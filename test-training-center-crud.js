/**
 * PKL-278651-TRAINING-CENTER-ADMIN-001-CRUD-TEST
 * Comprehensive CI/CD Testing Suite for Training Center CRUD Operations
 * 
 * This test suite validates all Create, Read, Update, Delete operations
 * for the Training Center admin module with full API coverage.
 * 
 * Run with: node test-training-center-crud.js
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-11
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';
const ADMIN_AUTH = {
  'Cookie': 'pickle_session_id=admin_test_session',
  'Content-Type': 'application/json'
};

// Test configuration
const TEST_CONFIG = {
  timeout: 5000,
  retries: 3,
  endpoints: {
    centers: '/api/admin/training-centers/centers',
    coaches: '/api/admin/training-centers/coaches', 
    classes: '/api/admin/training-centers/classes',
    students: '/api/admin/training-centers/students',
    operations: '/api/admin/training-centers/operations'
  }
};

// Test data templates
const TEST_DATA = {
  center: {
    name: 'CI/CD Test Training Center',
    address: '123 Test Street, Test City, TC 12345',
    capacity: 50,
    facilities: ['Indoor Courts', 'Equipment Storage'],
    contact_email: 'test@trainingcenter.com',
    phone: '555-0123'
  },
  coach: {
    first_name: 'Test',
    last_name: 'Coach',
    email: 'testcoach@example.com',
    phone: '555-0124',
    specialties: ['Beginner Training', 'Advanced Strategy'],
    hourly_rate: 75,
    pcp_certified: true,
    bio: 'Experienced test coach for CI/CD validation'
  },
  class: {
    name: 'CI/CD Test Class',
    description: 'Automated test class for validation',
    level: 'Beginner',
    capacity: 12,
    duration: 90,
    price: 25.00,
    recurring_schedule: 'weekly'
  },
  student: {
    first_name: 'Test',
    last_name: 'Student',
    email: 'teststudent@example.com',
    phone: '555-0125',
    skill_level: 'Beginner',
    emergency_contact: 'Test Parent - 555-0126'
  }
};

// Utility functions
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: { ...ADMIN_AUTH },
      timeout: TEST_CONFIG.timeout
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
            headers: res.headers
          };
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const statusSymbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '○';
  console.log(`[${timestamp}] ${statusSymbol} ${testName} - ${status}${details ? ': ' + details : ''}`);
}

function logSuite(suiteName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 CRUD TEST SUITE: ${suiteName}`);
  console.log(`${'='.repeat(80)}`);
}

async function retryRequest(requestFn, retries = TEST_CONFIG.retries) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Test suites
async function testCentersCRUD() {
  logSuite('TRAINING CENTERS');
  
  let createdCenterId = null;
  
  try {
    // CREATE - Test center creation
    logTest('Centers CREATE', 'RUNNING');
    const createResponse = await retryRequest(() => 
      makeRequest('POST', TEST_CONFIG.endpoints.centers, TEST_DATA.center)
    );
    
    if (createResponse.status === 201 && createResponse.data?.success) {
      createdCenterId = createResponse.data.data?.id;
      logTest('Centers CREATE', 'PASS', `Created center ID: ${createdCenterId}`);
    } else {
      logTest('Centers CREATE', 'FAIL', `Status: ${createResponse.status}`);
    }

    // READ - Test getting all centers
    logTest('Centers READ (All)', 'RUNNING');
    const readAllResponse = await retryRequest(() => 
      makeRequest('GET', TEST_CONFIG.endpoints.centers)
    );
    
    if (readAllResponse.status === 200 && Array.isArray(readAllResponse.data?.data)) {
      logTest('Centers READ (All)', 'PASS', `Found ${readAllResponse.data.data.length} centers`);
    } else {
      logTest('Centers READ (All)', 'FAIL', `Status: ${readAllResponse.status}`);
    }

    // READ - Test getting specific center
    if (createdCenterId) {
      logTest('Centers READ (Single)', 'RUNNING');
      const readSingleResponse = await retryRequest(() => 
        makeRequest('GET', `${TEST_CONFIG.endpoints.centers}/${createdCenterId}`)
      );
      
      if (readSingleResponse.status === 200 && readSingleResponse.data?.success) {
        logTest('Centers READ (Single)', 'PASS', `Retrieved center: ${readSingleResponse.data.data?.name}`);
      } else {
        logTest('Centers READ (Single)', 'FAIL', `Status: ${readSingleResponse.status}`);
      }

      // UPDATE - Test center update
      logTest('Centers UPDATE', 'RUNNING');
      const updateData = { ...TEST_DATA.center, name: 'Updated CI/CD Test Center', capacity: 75 };
      const updateResponse = await retryRequest(() => 
        makeRequest('PUT', `${TEST_CONFIG.endpoints.centers}/${createdCenterId}`, updateData)
      );
      
      if (updateResponse.status === 200 && updateResponse.data?.success) {
        logTest('Centers UPDATE', 'PASS', 'Center updated successfully');
      } else {
        logTest('Centers UPDATE', 'FAIL', `Status: ${updateResponse.status}`);
      }

      // DELETE - Test center deletion
      logTest('Centers DELETE', 'RUNNING');
      const deleteResponse = await retryRequest(() => 
        makeRequest('DELETE', `${TEST_CONFIG.endpoints.centers}/${createdCenterId}`)
      );
      
      if (deleteResponse.status === 200 && deleteResponse.data?.success) {
        logTest('Centers DELETE', 'PASS', 'Center deleted successfully');
      } else {
        logTest('Centers DELETE', 'FAIL', `Status: ${deleteResponse.status}`);
      }
    }

  } catch (error) {
    logTest('Centers CRUD', 'FAIL', error.message);
  }
}

async function testCoachesCRUD() {
  logSuite('COACHES');
  
  let createdCoachId = null;
  
  try {
    // CREATE
    logTest('Coaches CREATE', 'RUNNING');
    const createResponse = await retryRequest(() => 
      makeRequest('POST', TEST_CONFIG.endpoints.coaches, TEST_DATA.coach)
    );
    
    if (createResponse.status === 201 && createResponse.data?.success) {
      createdCoachId = createResponse.data.data?.id;
      logTest('Coaches CREATE', 'PASS', `Created coach ID: ${createdCoachId}`);
    } else {
      logTest('Coaches CREATE', 'FAIL', `Status: ${createResponse.status}`);
    }

    // READ
    logTest('Coaches READ (All)', 'RUNNING');
    const readAllResponse = await retryRequest(() => 
      makeRequest('GET', TEST_CONFIG.endpoints.coaches)
    );
    
    if (readAllResponse.status === 200 && Array.isArray(readAllResponse.data?.data)) {
      logTest('Coaches READ (All)', 'PASS', `Found ${readAllResponse.data.data.length} coaches`);
    } else {
      logTest('Coaches READ (All)', 'FAIL', `Status: ${readAllResponse.status}`);
    }

    if (createdCoachId) {
      // READ Single
      logTest('Coaches READ (Single)', 'RUNNING');
      const readSingleResponse = await retryRequest(() => 
        makeRequest('GET', `${TEST_CONFIG.endpoints.coaches}/${createdCoachId}`)
      );
      
      if (readSingleResponse.status === 200 && readSingleResponse.data?.success) {
        logTest('Coaches READ (Single)', 'PASS', `Retrieved coach: ${readSingleResponse.data.data?.first_name}`);
      } else {
        logTest('Coaches READ (Single)', 'FAIL', `Status: ${readSingleResponse.status}`);
      }

      // UPDATE
      logTest('Coaches UPDATE', 'RUNNING');
      const updateData = { ...TEST_DATA.coach, hourly_rate: 85, specialties: ['Advanced Training'] };
      const updateResponse = await retryRequest(() => 
        makeRequest('PUT', `${TEST_CONFIG.endpoints.coaches}/${createdCoachId}`, updateData)
      );
      
      if (updateResponse.status === 200 && updateResponse.data?.success) {
        logTest('Coaches UPDATE', 'PASS', 'Coach updated successfully');
      } else {
        logTest('Coaches UPDATE', 'FAIL', `Status: ${updateResponse.status}`);
      }

      // DELETE
      logTest('Coaches DELETE', 'RUNNING');
      const deleteResponse = await retryRequest(() => 
        makeRequest('DELETE', `${TEST_CONFIG.endpoints.coaches}/${createdCoachId}`)
      );
      
      if (deleteResponse.status === 200 && deleteResponse.data?.success) {
        logTest('Coaches DELETE', 'PASS', 'Coach deleted successfully');
      } else {
        logTest('Coaches DELETE', 'FAIL', `Status: ${deleteResponse.status}`);
      }
    }

  } catch (error) {
    logTest('Coaches CRUD', 'FAIL', error.message);
  }
}

async function testClassesCRUD() {
  logSuite('CLASSES');
  
  let createdClassId = null;
  
  try {
    // CREATE
    logTest('Classes CREATE', 'RUNNING');
    const createResponse = await retryRequest(() => 
      makeRequest('POST', TEST_CONFIG.endpoints.classes, TEST_DATA.class)
    );
    
    if (createResponse.status === 201 && createResponse.data?.success) {
      createdClassId = createResponse.data.data?.id;
      logTest('Classes CREATE', 'PASS', `Created class ID: ${createdClassId}`);
    } else {
      logTest('Classes CREATE', 'FAIL', `Status: ${createResponse.status}`);
    }

    // READ
    logTest('Classes READ (All)', 'RUNNING');
    const readAllResponse = await retryRequest(() => 
      makeRequest('GET', TEST_CONFIG.endpoints.classes)
    );
    
    if (readAllResponse.status === 200 && Array.isArray(readAllResponse.data?.data)) {
      logTest('Classes READ (All)', 'PASS', `Found ${readAllResponse.data.data.length} classes`);
    } else {
      logTest('Classes READ (All)', 'FAIL', `Status: ${readAllResponse.status}`);
    }

    if (createdClassId) {
      // READ Single
      logTest('Classes READ (Single)', 'RUNNING');
      const readSingleResponse = await retryRequest(() => 
        makeRequest('GET', `${TEST_CONFIG.endpoints.classes}/${createdClassId}`)
      );
      
      if (readSingleResponse.status === 200 && readSingleResponse.data?.success) {
        logTest('Classes READ (Single)', 'PASS', `Retrieved class: ${readSingleResponse.data.data?.name}`);
      } else {
        logTest('Classes READ (Single)', 'FAIL', `Status: ${readSingleResponse.status}`);
      }

      // UPDATE
      logTest('Classes UPDATE', 'RUNNING');
      const updateData = { ...TEST_DATA.class, price: 30.00, capacity: 15 };
      const updateResponse = await retryRequest(() => 
        makeRequest('PUT', `${TEST_CONFIG.endpoints.classes}/${createdClassId}`, updateData)
      );
      
      if (updateResponse.status === 200 && updateResponse.data?.success) {
        logTest('Classes UPDATE', 'PASS', 'Class updated successfully');
      } else {
        logTest('Classes UPDATE', 'FAIL', `Status: ${updateResponse.status}`);
      }

      // DELETE
      logTest('Classes DELETE', 'RUNNING');
      const deleteResponse = await retryRequest(() => 
        makeRequest('DELETE', `${TEST_CONFIG.endpoints.classes}/${createdClassId}`)
      );
      
      if (deleteResponse.status === 200 && deleteResponse.data?.success) {
        logTest('Classes DELETE', 'PASS', 'Class deleted successfully');
      } else {
        logTest('Classes DELETE', 'FAIL', `Status: ${deleteResponse.status}`);
      }
    }

  } catch (error) {
    logTest('Classes CRUD', 'FAIL', error.message);
  }
}

async function testStudentsCRUD() {
  logSuite('STUDENTS');
  
  let createdStudentId = null;
  
  try {
    // CREATE
    logTest('Students CREATE', 'RUNNING');
    const createResponse = await retryRequest(() => 
      makeRequest('POST', TEST_CONFIG.endpoints.students, TEST_DATA.student)
    );
    
    if (createResponse.status === 201 && createResponse.data?.success) {
      createdStudentId = createResponse.data.data?.id;
      logTest('Students CREATE', 'PASS', `Created student ID: ${createdStudentId}`);
    } else {
      logTest('Students CREATE', 'FAIL', `Status: ${createResponse.status}`);
    }

    // READ
    logTest('Students READ (All)', 'RUNNING');
    const readAllResponse = await retryRequest(() => 
      makeRequest('GET', TEST_CONFIG.endpoints.students)
    );
    
    if (readAllResponse.status === 200 && Array.isArray(readAllResponse.data?.data)) {
      logTest('Students READ (All)', 'PASS', `Found ${readAllResponse.data.data.length} students`);
    } else {
      logTest('Students READ (All)', 'FAIL', `Status: ${readAllResponse.status}`);
    }

    if (createdStudentId) {
      // READ Single
      logTest('Students READ (Single)', 'RUNNING');
      const readSingleResponse = await retryRequest(() => 
        makeRequest('GET', `${TEST_CONFIG.endpoints.students}/${createdStudentId}`)
      );
      
      if (readSingleResponse.status === 200 && readSingleResponse.data?.success) {
        logTest('Students READ (Single)', 'PASS', `Retrieved student: ${readSingleResponse.data.data?.first_name}`);
      } else {
        logTest('Students READ (Single)', 'FAIL', `Status: ${readSingleResponse.status}`);
      }

      // UPDATE
      logTest('Students UPDATE', 'RUNNING');
      const updateData = { ...TEST_DATA.student, skill_level: 'Intermediate' };
      const updateResponse = await retryRequest(() => 
        makeRequest('PUT', `${TEST_CONFIG.endpoints.students}/${createdStudentId}`, updateData)
      );
      
      if (updateResponse.status === 200 && updateResponse.data?.success) {
        logTest('Students UPDATE', 'PASS', 'Student updated successfully');
      } else {
        logTest('Students UPDATE', 'FAIL', `Status: ${updateResponse.status}`);
      }

      // DELETE
      logTest('Students DELETE', 'RUNNING');
      const deleteResponse = await retryRequest(() => 
        makeRequest('DELETE', `${TEST_CONFIG.endpoints.students}/${createdStudentId}`)
      );
      
      if (deleteResponse.status === 200 && deleteResponse.data?.success) {
        logTest('Students DELETE', 'PASS', 'Student deleted successfully');
      } else {
        logTest('Students DELETE', 'FAIL', `Status: ${deleteResponse.status}`);
      }
    }

  } catch (error) {
    logTest('Students CRUD', 'FAIL', error.message);
  }
}

async function testOperationsDashboard() {
  logSuite('OPERATIONS DASHBOARD');
  
  try {
    // Test analytics endpoint
    logTest('Operations Analytics', 'RUNNING');
    const analyticsResponse = await retryRequest(() => 
      makeRequest('GET', `${TEST_CONFIG.endpoints.operations}/analytics`)
    );
    
    if (analyticsResponse.status === 200 && analyticsResponse.data?.success) {
      logTest('Operations Analytics', 'PASS', 'Analytics data retrieved');
    } else {
      logTest('Operations Analytics', 'FAIL', `Status: ${analyticsResponse.status}`);
    }

    // Test reports endpoint
    logTest('Operations Reports', 'RUNNING');
    const reportsResponse = await retryRequest(() => 
      makeRequest('GET', `${TEST_CONFIG.endpoints.operations}/reports`)
    );
    
    if (reportsResponse.status === 200 && reportsResponse.data?.success) {
      logTest('Operations Reports', 'PASS', 'Reports data retrieved');
    } else {
      logTest('Operations Reports', 'FAIL', `Status: ${reportsResponse.status}`);
    }

    // Test revenue metrics
    logTest('Operations Revenue', 'RUNNING');
    const revenueResponse = await retryRequest(() => 
      makeRequest('GET', `${TEST_CONFIG.endpoints.operations}/revenue`)
    );
    
    if (revenueResponse.status === 200 && revenueResponse.data?.success) {
      logTest('Operations Revenue', 'PASS', 'Revenue metrics retrieved');
    } else {
      logTest('Operations Revenue', 'FAIL', `Status: ${revenueResponse.status}`);
    }

  } catch (error) {
    logTest('Operations Dashboard', 'FAIL', error.message);
  }
}

// Test performance under load
async function testPerformance() {
  logSuite('PERFORMANCE & LOAD TESTING');
  
  try {
    // Concurrent requests test
    logTest('Concurrent Requests', 'RUNNING');
    const concurrentRequests = Array.from({ length: 10 }, () => 
      makeRequest('GET', TEST_CONFIG.endpoints.centers)
    );
    
    const startTime = Date.now();
    const results = await Promise.allSettled(concurrentRequests);
    const endTime = Date.now();
    
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
    const avgResponseTime = (endTime - startTime) / results.length;
    
    if (successCount >= 8 && avgResponseTime < 2000) {
      logTest('Concurrent Requests', 'PASS', `${successCount}/10 succeeded, avg ${avgResponseTime}ms`);
    } else {
      logTest('Concurrent Requests', 'FAIL', `${successCount}/10 succeeded, avg ${avgResponseTime}ms`);
    }

  } catch (error) {
    logTest('Performance Testing', 'FAIL', error.message);
  }
}

// Main test execution
async function runAllTests() {
  console.log(`\n🚀 PKL-278651-TRAINING-CENTER-ADMIN-001-CRUD-TEST`);
  console.log(`📅 Test Execution: ${new Date().toISOString()}`);
  console.log(`🔧 Framework: 5.3`);
  console.log(`🎯 Target: ${BASE_URL}`);
  
  const startTime = Date.now();
  
  try {
    await testCentersCRUD();
    await testCoachesCRUD(); 
    await testClassesCRUD();
    await testStudentsCRUD();
    await testOperationsDashboard();
    await testPerformance();
    
    const totalTime = Date.now() - startTime;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎉 CRUD TEST SUITE COMPLETED`);
    console.log(`⏱️  Total execution time: ${totalTime}ms`);
    console.log(`📊 All CRUD operations tested for Training Center admin module`);
    console.log(`${'='.repeat(80)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, testCentersCRUD, testCoachesCRUD, testClassesCRUD, testStudentsCRUD };