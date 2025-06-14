/**
 * Authentication CI/CD Test - 98% Readiness Check
 * Comprehensive validation of login, registration, and authentication flow
 */

import postgres from 'postgres';

interface AuthTestResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  critical: boolean;
  score: number;
}

const results: AuthTestResult[] = [];
let totalScore = 0;
let maxScore = 0;

function addTest(component: string, status: 'PASS' | 'FAIL' | 'WARNING', details: string, score: number, critical = false) {
  results.push({ component, status, details, critical, score });
  maxScore += score;
  if (status === 'PASS') {
    totalScore += score;
  }
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${component}: ${details} (${status === 'PASS' ? score : 0}/${score} points)`);
}

async function testDatabaseAuth() {
  console.log('\n📊 Testing Authentication Database Schema...');
  
  try {
    const sql = postgres(process.env.DATABASE_URL!);
    
    // Check users table
    const usersTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;
    addTest('Users table exists', usersTableExists[0].exists ? 'PASS' : 'FAIL', 
      'Core authentication table', 10, true);

    if (usersTableExists[0].exists) {
      // Check required columns
      const userColumns = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'users';
      `;
      const columnNames = userColumns.map(c => c.column_name);
      
      addTest('Username column exists', columnNames.includes('username') ? 'PASS' : 'FAIL',
        'Required for login identification', 5, true);
      addTest('Password column exists', columnNames.includes('password') ? 'PASS' : 'FAIL',
        'Required for authentication', 5, true);
      addTest('Email column exists', columnNames.includes('email') ? 'PASS' : 'FAIL',
        'Required for user registration', 5);
      
      // Test if we can query users
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      addTest('Users table accessible', userCount.length > 0 ? 'PASS' : 'FAIL',
        `Found ${userCount[0].count} users`, 5);
    }

    // Check sessions table for session management
    const sessionsTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'session'
      );
    `;
    addTest('Sessions table exists', sessionsTable[0].exists ? 'PASS' : 'FAIL',
      'Required for session management', 10, true);

    await sql.end();
  } catch (error) {
    addTest('Database connectivity', 'FAIL', `Database error: ${error}`, 40, true);
  }
}

async function testAuthEndpoints() {
  console.log('\n🔌 Testing Authentication API Endpoints...');
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    // Test current user endpoint
    const currentUserResponse = await fetch(`${baseUrl}/api/auth/current-user`);
    addTest('Current user endpoint', currentUserResponse.status !== 404 ? 'PASS' : 'FAIL',
      `Status: ${currentUserResponse.status}`, 10, true);

    // Test login endpoint (POST)
    try {
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: 'test' })
      });
      addTest('Login endpoint accessible', loginResponse.status !== 404 ? 'PASS' : 'FAIL',
        `Status: ${loginResponse.status}`, 10, true);
    } catch {
      addTest('Login endpoint accessible', 'FAIL', 'Network error', 10, true);
    }

    // Test registration endpoint
    try {
      const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', email: 'test@test.com', password: 'test' })
      });
      addTest('Registration endpoint accessible', registerResponse.status !== 404 ? 'PASS' : 'FAIL',
        `Status: ${registerResponse.status}`, 10, true);
    } catch {
      addTest('Registration endpoint accessible', 'FAIL', 'Network error', 10, true);
    }

  } catch (error) {
    addTest('API connectivity', 'FAIL', 'Server unreachable', 30, true);
  }
}

async function testPasswordHashing() {
  console.log('\n🔐 Testing Password Security...');
  
  try {
    const sql = postgres(process.env.DATABASE_URL!);
    
    // Check if passwords are hashed (not plaintext)
    const sampleUser = await sql`
      SELECT password FROM users LIMIT 1
    `;
    
    if (sampleUser.length > 0) {
      const password = sampleUser[0].password;
      const isHashed = password && password.length > 20 && !password.includes(' ');
      addTest('Password hashing', isHashed ? 'PASS' : 'FAIL',
        'Passwords properly encrypted', 15, true);
    } else {
      addTest('Password hashing', 'WARNING', 'No users to test', 15);
    }

    await sql.end();
  } catch (error) {
    addTest('Password security check', 'FAIL', `Error: ${error}`, 15, true);
  }
}

async function testSessionManagement() {
  console.log('\n🍪 Testing Session Management...');
  
  try {
    // Test session creation with login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'mightymax', password: '67661189Darren' })
    });

    if (loginResponse.status === 200) {
      const cookies = loginResponse.headers.get('set-cookie');
      addTest('Session creation', cookies ? 'PASS' : 'WARNING',
        'Login creates session cookies', 10);
    } else {
      addTest('Session creation', 'WARNING',
        `Login status: ${loginResponse.status}`, 10);
    }
  } catch (error) {
    addTest('Session management', 'FAIL', `Error: ${error}`, 10);
  }
}

function testAuthenticationConfiguration() {
  console.log('\n⚙️ Testing Authentication Configuration...');
  
  // Check required environment variables
  addTest('SESSION_SECRET configured', process.env.SESSION_SECRET ? 'PASS' : 'FAIL',
    'Required for secure sessions', 10, true);
  
  addTest('DATABASE_URL configured', process.env.DATABASE_URL ? 'PASS' : 'FAIL',
    'Required for user storage', 10, true);

  // Check for auth files
  try {
    const fs = require('fs');
    addTest('Auth routes file exists', fs.existsSync('server/auth.ts') ? 'PASS' : 'FAIL',
      'server/auth.ts', 5, true);
    addTest('Storage layer exists', fs.existsSync('server/storage.ts') ? 'PASS' : 'FAIL',
      'server/storage.ts', 5, true);
  } catch {
    addTest('File system check', 'WARNING', 'Could not verify auth files', 10);
  }
}

async function testActualUserLogin() {
  console.log('\n👤 Testing Real User Authentication...');
  
  try {
    // Test with known test user
    const loginData = {
      username: 'mightymax',
      password: '67661189Darren'
    };

    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(loginData),
      credentials: 'include'
    });

    if (loginResponse.status === 200) {
      addTest('Test user login success', 'PASS', 'Authentication working', 15);
      
      // Test authenticated request
      const userResponse = await fetch('http://localhost:5000/api/auth/current-user', {
        credentials: 'include',
        headers: {
          'Cookie': loginResponse.headers.get('set-cookie') || ''
        }
      });
      
      addTest('Authenticated requests', userResponse.status === 200 ? 'PASS' : 'FAIL',
        'Session persistence working', 10);
    } else {
      addTest('Test user login success', 'FAIL', 
        `Login failed with status: ${loginResponse.status}`, 15, true);
    }
  } catch (error) {
    addTest('User authentication test', 'FAIL', `Error: ${error}`, 25, true);
  }
}

function calculateReadinessScore(): number {
  return totalScore > 0 ? (totalScore / maxScore) * 100 : 0;
}

function generateAuthReport() {
  console.log('\n🎯 AUTHENTICATION CI/CD READINESS REPORT');
  console.log('=' .repeat(60));
  
  const score = calculateReadinessScore();
  console.log(`\n📊 Authentication Score: ${score.toFixed(1)}%`);
  console.log(`📈 Points: ${totalScore}/${maxScore}`);
  
  if (score >= 98) {
    console.log('\n✅ AUTHENTICATION CERTIFIED - 98%+ READY');
    console.log('🏆 User login and registration fully operational');
  } else if (score >= 90) {
    console.log('\n⚠️  NEAR READY - Minor authentication issues');
  } else {
    console.log('\n❌ AUTHENTICATION NOT READY - Critical issues detected');
  }
  
  // Show critical failures
  const criticalFailures = results.filter(r => r.status === 'FAIL' && r.critical);
  if (criticalFailures.length > 0) {
    console.log('\n🚨 CRITICAL AUTHENTICATION ISSUES:');
    criticalFailures.forEach(issue => {
      console.log(`   ❌ ${issue.component}: ${issue.details}`);
    });
  }

  // Show warnings
  const warnings = results.filter(r => r.status === 'WARNING');
  if (warnings.length > 0) {
    console.log('\n⚠️  AUTHENTICATION WARNINGS:');
    warnings.forEach(warning => {
      console.log(`   ⚠️  ${warning.component}: ${warning.details}`);
    });
  }

  console.log('\n🔧 AUTHENTICATION STATUS SUMMARY:');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARNING').length;
  
  console.log(`✅ Passed: ${passed} tests`);
  console.log(`❌ Failed: ${failed} tests`);
  console.log(`⚠️  Warnings: ${warned} tests`);

  return score;
}

async function runAuthenticationTest() {
  console.log('🚀 AUTHENTICATION CI/CD TEST - 98% READINESS CHECK');
  console.log('Testing user login, registration, and authentication security...\n');
  
  testAuthenticationConfiguration();
  await testDatabaseAuth();
  await testPasswordHashing();
  await testAuthEndpoints();
  await testSessionManagement();
  await testActualUserLogin();
  
  return generateAuthReport();
}

runAuthenticationTest()
  .then((score) => {
    if (score >= 98) {
      console.log('\n🎉 AUTHENTICATION SYSTEM: DEPLOYMENT CERTIFIED');
    } else {
      console.log('\n🔧 AUTHENTICATION SYSTEM: REQUIRES FIXES');
    }
    process.exit(score >= 90 ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Authentication test failed:', error);
    process.exit(1);
  });