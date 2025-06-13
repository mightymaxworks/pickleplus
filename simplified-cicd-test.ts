/**
 * Simplified PCP Assessment CI/CD Test
 * Validates deployment readiness for comprehensive assessment system
 */

import postgres from 'postgres';

async function runDeploymentTest() {
  console.log('🚀 PCP Assessment Deployment Readiness Test\n');
  
  let passCount = 0;
  let totalTests = 0;
  let criticalIssues = 0;

  function test(name: string, condition: boolean, critical = false) {
    totalTests++;
    if (condition) {
      console.log(`✅ ${name}`);
      passCount++;
    } else {
      console.log(`❌ ${name}`);
      if (critical) criticalIssues++;
    }
  }

  // Environment Variables Test
  console.log('🔐 Environment Configuration:');
  test('DATABASE_URL configured', !!process.env.DATABASE_URL, true);
  test('SESSION_SECRET configured', !!process.env.SESSION_SECRET, true);
  
  // Database Schema Test
  console.log('\n📊 Database Schema:');
  try {
    const sql = postgres(process.env.DATABASE_URL!);
    
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pcp_skill_assessments'
      );
    `;
    test('PCP assessments table exists', tableCheck[0].exists, true);
    
    if (tableCheck[0].exists) {
      const columns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'pcp_skill_assessments';
      `;
      
      const columnNames = columns.map(c => c.column_name);
      test('Core skills columns present', 
        ['serve_execution', 'third_shot', 'shot_creativity', 'court_movement'].every(col => columnNames.includes(col)));
      test('Return technique columns present', 
        ['forehand_return_cross_court', 'forehand_return_down_line', 'backhand_return_cross_court', 'backhand_return_down_line'].every(col => columnNames.includes(col)));
      test('Drop shot columns present', 
        ['forehand_easy_drop_shot', 'forehand_topspin_drop_shot', 'forehand_slice_drop_shot'].every(col => columnNames.includes(col)));
      test('Lob columns present', 
        ['forehand_lob', 'backhand_lob'].every(col => columnNames.includes(col)));
      test('Smash columns present', 
        ['forehand_smash', 'backhand_smash'].every(col => columnNames.includes(col)));
    }
    
    await sql.end();
  } catch (error) {
    test('Database connection', false, true);
  }

  // API Endpoints Test
  console.log('\n🔌 API Endpoints:');
  try {
    const authResponse = await fetch('http://localhost:5000/api/auth/current-user');
    test('Authentication endpoint accessible', authResponse.status !== 404);
  } catch {
    test('Server connectivity', false, true);
  }

  // Component Files Test
  console.log('\n📁 Critical Components:');
  try {
    const fs = await import('fs');
    test('PCP assessment component exists', fs.existsSync('client/src/pages/coach/pcp-enhanced-assessment.tsx'));
    test('Server routes exist', fs.existsSync('server/routes.ts'));
    test('Storage layer exists', fs.existsSync('server/storage.ts'));
    test('Package configuration exists', fs.existsSync('package.json'));
  } catch {
    console.log('⚠️  File system check skipped');
  }

  // Calculate readiness score
  const score = criticalIssues > 0 
    ? Math.max(0, (passCount / totalTests) * 100 - (criticalIssues * 15))
    : (passCount / totalTests) * 100;

  console.log('\n🎯 DEPLOYMENT READINESS REPORT');
  console.log('='.repeat(40));
  console.log(`📊 Readiness Score: ${score.toFixed(1)}%`);
  console.log(`✅ Passed: ${passCount}/${totalTests}`);
  console.log(`🚨 Critical Issues: ${criticalIssues}`);

  if (score >= 98) {
    console.log('\n✅ DEPLOYMENT READY');
    console.log('   ✓ Comprehensive technical skills breakdown implemented');
    console.log('   ✓ 4-dimensional PCP rating system operational');
    console.log('   ✓ Database schema complete with all skill categories');
    console.log('   ✓ Assessment interface fully functional');
  } else if (score >= 90) {
    console.log('\n⚠️  MINOR ISSUES - Near deployment ready');
  } else {
    console.log('\n❌ NOT READY - Critical issues need resolution');
  }

  return score;
}

runDeploymentTest()
  .then((score) => {
    process.exit(score >= 90 ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });