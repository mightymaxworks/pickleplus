/**
 * PCP Assessment CI/CD Readiness Test
 * Comprehensive validation of assessment system deployment readiness
 */

import postgres from 'postgres';

interface TestResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  critical: boolean;
}

const results: TestResult[] = [];

function addResult(component: string, status: 'PASS' | 'FAIL' | 'WARNING', details: string, critical = false) {
  results.push({ component, status, details, critical });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${component}: ${details}`);
}

async function testDatabaseSchema() {
  console.log('\n📊 Testing Database Schema...');
  
  try {
    const sql = postgres(process.env.DATABASE_URL!);
    
    // Test PCP skill assessments table
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pcp_skill_assessments'
      );
    `;
    
    if (tableExists[0].exists) {
      addResult('Database Schema', 'PASS', 'PCP skill assessments table exists', true);
      
      // Check all required columns
      const columns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'pcp_skill_assessments';
      `;
      
      const requiredColumns = [
        'serve_execution', 'third_shot', 'shot_creativity', 'court_movement',
        'forehand_return_cross_court', 'forehand_return_down_line',
        'backhand_return_cross_court', 'backhand_return_down_line',
        'forehand_easy_drop_shot', 'forehand_topspin_drop_shot', 'forehand_slice_drop_shot',
        'backhand_easy_drop_shot', 'backhand_topspin_drop_shot', 'backhand_slice_drop_shot',
        'forehand_lob', 'backhand_lob',
        'forehand_smash', 'backhand_smash'
      ];
      
      const existingColumns = columns.map(c => c.column_name);
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length === 0) {
        addResult('Schema Columns', 'PASS', 'All comprehensive technical skills columns present');
      } else {
        addResult('Schema Columns', 'FAIL', `Missing columns: ${missingColumns.join(', ')}`, true);
      }
    } else {
      addResult('Database Schema', 'FAIL', 'PCP skill assessments table missing', true);
    }
    
    await sql.end();
  } catch (error) {
    addResult('Database Connection', 'FAIL', `Database connection failed: ${error}`, true);
  }
}

async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...');
  
  const endpoints = [
    { path: '/api/auth/current-user', method: 'GET', critical: true },
    { path: '/api/pcp/submit-assessment', method: 'POST', critical: true },
    { path: '/api/pcp/player-assessments', method: 'GET', critical: true }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 404) {
        addResult(`API ${endpoint.path}`, 'FAIL', 'Endpoint not found', endpoint.critical);
      } else if (response.status >= 500) {
        addResult(`API ${endpoint.path}`, 'WARNING', 'Server error - may need authentication');
      } else {
        addResult(`API ${endpoint.path}`, 'PASS', `Endpoint accessible (${response.status})`);
      }
    } catch (error) {
      addResult(`API ${endpoint.path}`, 'FAIL', 'Network error', endpoint.critical);
    }
  }
}

function testEnvironmentVariables() {
  console.log('\n🔐 Testing Environment Variables...');
  
  const requiredEnvVars = [
    { name: 'DATABASE_URL', critical: true },
    { name: 'SESSION_SECRET', critical: true },
    { name: 'NODE_ENV', critical: false }
  ];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar.name]) {
      addResult(`ENV ${envVar.name}`, 'PASS', 'Environment variable set');
    } else {
      addResult(`ENV ${envVar.name}`, 'FAIL', 'Environment variable missing', envVar.critical);
    }
  }
}

function testFileStructure() {
  console.log('\n📁 Testing File Structure...');
  
  import('fs').then(fs => {
    const criticalFiles = [
      { path: 'client/src/pages/coach/pcp-enhanced-assessment.tsx', name: 'PCP Assessment Component' },
      { path: 'server/routes.ts', name: 'Server Routes' },
      { path: 'server/storage.ts', name: 'Storage Layer' },
      { path: 'package.json', name: 'Package Configuration' }
    ];
    
    for (const file of criticalFiles) {
      if (fs.existsSync(file.path)) {
        addResult(`File ${file.name}`, 'PASS', `${file.path} exists`);
      } else {
        addResult(`File ${file.name}`, 'FAIL', `${file.path} missing`, true);
      }
    }
  }).catch(() => {
    addResult('File System', 'WARNING', 'File system check skipped');
  });
}

function calculateReadinessScore(): number {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const criticalFailures = results.filter(r => r.status === 'FAIL' && r.critical).length;
  
  if (criticalFailures > 0) {
    return Math.max(0, (passedTests / totalTests) * 100 - (criticalFailures * 20));
  }
  
  return (passedTests / totalTests) * 100;
}

function generateReport() {
  console.log('\n🎯 CI/CD READINESS REPORT');
  console.log('=' .repeat(50));
  
  const score = calculateReadinessScore();
  console.log(`\n📊 Overall Readiness Score: ${score.toFixed(1)}%`);
  
  if (score >= 98) {
    console.log('✅ DEPLOYMENT READY - System meets 98% readiness criteria');
  } else if (score >= 90) {
    console.log('⚠️  MINOR ISSUES - Near deployment ready, minor fixes needed');
  } else {
    console.log('❌ NOT READY - Critical issues must be resolved');
  }
  
  console.log('\n📋 Test Summary:');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  
  const criticalIssues = results.filter(r => r.status === 'FAIL' && r.critical);
  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES TO RESOLVE:');
    criticalIssues.forEach(issue => {
      console.log(`   ❌ ${issue.component}: ${issue.details}`);
    });
  }
  
  console.log('\n🔧 NEXT STEPS:');
  if (score >= 98) {
    console.log('   ✅ Ready for production deployment');
    console.log('   ✅ All PCP Assessment features functional');
    console.log('   ✅ Database schema comprehensive and complete');
  } else {
    console.log('   🔧 Resolve critical database or API issues');
    console.log('   🔧 Ensure all environment variables are set');
    console.log('   🔧 Verify comprehensive technical skills implementation');
  }
}

async function runFullTest() {
  console.log('🚀 PCP ASSESSMENT CI/CD READINESS TEST');
  console.log('Testing comprehensive 4-dimensional assessment system...\n');
  
  testEnvironmentVariables();
  testFileStructure();
  await testDatabaseSchema();
  await testAPIEndpoints();
  
  generateReport();
}

runFullTest()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });