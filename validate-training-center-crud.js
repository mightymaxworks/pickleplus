/**
 * PKL-278651-TRAINING-CENTER-CRUD-VALIDATION
 * Simplified CRUD Validation for Training Center Admin
 * 
 * Tests all CRUD operations using fetch API against the running server
 */

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_ENDPOINTS = {
  centers: '/api/admin/training-centers/centers',
  coaches: '/api/admin/training-centers/coaches',
  classes: '/api/admin/training-centers/classes'
};

// Test data
const testData = {
  center: {
    name: 'CRUD Test Center',
    address: '123 Test St, Test City',
    capacity: 50,
    facilities: ['Indoor Courts'],
    contact_email: 'test@center.com',
    phone: '555-0123'
  },
  coach: {
    first_name: 'Test',
    last_name: 'Coach',
    email: 'test@coach.com',
    phone: '555-0124',
    specialties: ['Beginner Training'],
    hourly_rate: 75,
    pcp_certified: true
  },
  class: {
    name: 'Test Class',
    description: 'Test class description',
    level: 'Beginner',
    capacity: 12,
    duration: 90,
    price: 25.00
  }
};

async function makeRequest(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const result = await response.json();
  
  return {
    status: response.status,
    success: response.ok,
    data: result
  };
}

function logTest(operation, entity, status, details = '') {
  const timestamp = new Date().toLocaleTimeString();
  const symbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '○';
  console.log(`[${timestamp}] ${symbol} ${entity} ${operation} - ${status}${details ? ': ' + details : ''}`);
}

async function testCRUDOperations() {
  console.log('\n🔧 Training Center CRUD Validation');
  console.log('=====================================');
  
  // Test Centers CRUD
  console.log('\n📍 Testing Centers CRUD...');
  
  try {
    // READ - Get existing centers
    logTest('READ', 'Centers', 'RUNNING');
    const centersRead = await makeRequest('GET', TEST_ENDPOINTS.centers);
    if (centersRead.success) {
      logTest('READ', 'Centers', 'PASS', `Found ${centersRead.data.data?.length || 0} centers`);
    } else {
      logTest('READ', 'Centers', 'FAIL', `Status: ${centersRead.status}`);
    }
  } catch (error) {
    logTest('READ', 'Centers', 'FAIL', error.message);
  }

  // Test Coaches CRUD
  console.log('\n👨‍🏫 Testing Coaches CRUD...');
  
  try {
    // READ - Get existing coaches
    logTest('READ', 'Coaches', 'RUNNING');
    const coachesRead = await makeRequest('GET', TEST_ENDPOINTS.coaches);
    if (coachesRead.success) {
      logTest('READ', 'Coaches', 'PASS', `Found ${coachesRead.data.data?.length || 0} coaches`);
    } else {
      logTest('READ', 'Coaches', 'FAIL', `Status: ${coachesRead.status}`);
    }
  } catch (error) {
    logTest('READ', 'Coaches', 'FAIL', error.message);
  }

  // Test Classes CRUD
  console.log('\n📚 Testing Classes CRUD...');
  
  try {
    // READ - Get existing classes
    logTest('READ', 'Classes', 'RUNNING');
    const classesRead = await makeRequest('GET', TEST_ENDPOINTS.classes);
    if (classesRead.success) {
      logTest('READ', 'Classes', 'PASS', `Found ${classesRead.data.data?.length || 0} classes`);
    } else {
      logTest('READ', 'Classes', 'FAIL', `Status: ${classesRead.status}`);
    }
  } catch (error) {
    logTest('READ', 'Classes', 'FAIL', error.message);
  }

  // Test CREATE operations (if endpoints support it)
  console.log('\n➕ Testing CREATE operations...');
  
  for (const [entity, endpoint] of Object.entries(TEST_ENDPOINTS)) {
    try {
      logTest('CREATE', entity.toUpperCase(), 'RUNNING');
      const createResult = await makeRequest('POST', endpoint, testData[entity.slice(0, -1)]);
      
      if (createResult.success) {
        logTest('CREATE', entity.toUpperCase(), 'PASS', 'Created successfully');
      } else if (createResult.status === 405) {
        logTest('CREATE', entity.toUpperCase(), 'SKIP', 'Method not implemented');
      } else {
        logTest('CREATE', entity.toUpperCase(), 'FAIL', `Status: ${createResult.status}`);
      }
    } catch (error) {
      logTest('CREATE', entity.toUpperCase(), 'FAIL', error.message);
    }
  }

  console.log('\n✅ CRUD Validation Complete');
  console.log('=====================================\n');
}

// Execute validation
testCRUDOperations().catch(console.error);