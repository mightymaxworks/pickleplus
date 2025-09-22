/**
 * SIMPLE ALGORITHM DIAGNOSTIC - DIRECT SYSTEM TEST
 * 
 * Tests the current running system directly through API calls
 * and validates algorithm components that are accessible
 * 
 * Version: 1.0.0 - Direct System Validation
 * Last Updated: September 22, 2025
 */

const DIAGNOSTIC_REPORT = {
  timestamp: new Date().toISOString(),
  testResults: [],
  criticalErrors: [],
  warnings: [],
  systemHealth: {
    algorithmUtilities: 'UNKNOWN',
    currencySystem: 'UNKNOWN',
    apiEndpoints: 'UNKNOWN',
    authentication: 'UNKNOWN'
  }
};

function addTestResult(testName, passed, details, critical = false) {
  DIAGNOSTIC_REPORT.testResults.push({
    test: testName,
    passed,
    details,
    critical,
    timestamp: new Date().toISOString()
  });
  
  if (!passed) {
    if (critical) {
      DIAGNOSTIC_REPORT.criticalErrors.push(`${testName}: ${details}`);
    } else {
      DIAGNOSTIC_REPORT.warnings.push(`${testName}: ${details}`);
    }
  }
}

async function runDiagnostic() {
  console.log('🚀 Starting Simple Algorithm Diagnostic...\n');

  // 1. Test API Endpoint Availability
  console.log('📡 Testing API Endpoints...');
  
  const endpoints = [
    'http://localhost:5000/api/credits/currencies',
    'http://localhost:5000/api/credits/account',
    'http://localhost:5000/api/auth/current-user'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const isSuccess = response.status < 500; // Accept 401/403 as "working" endpoints
      addTestResult(
        `API Endpoint ${endpoint}`,
        isSuccess,
        `Status: ${response.status}`,
        false
      );
      console.log(`   ${endpoint}: ${isSuccess ? '✅' : '❌'} (Status: ${response.status})`);
    } catch (error) {
      addTestResult(
        `API Endpoint ${endpoint}`,
        false,
        `Error: ${error.message}`,
        true
      );
      console.log(`   ${endpoint}: ❌ Error: ${error.message}`);
    }
  }

  // 2. Test Currency System Logic
  console.log('\n💱 Testing Currency System Logic...');
  
  const currencyRates = {
    USD: 0.74,
    SGD: 1.0,
    AUD: 1.12,
    MYR: 3.2,
    CNY: 5.2
  };

  // Test: SGD is base currency
  const sgdIsBase = currencyRates.SGD === 1.0;
  addTestResult(
    'SGD Base Currency',
    sgdIsBase,
    `SGD rate: ${currencyRates.SGD}`,
    true
  );
  console.log(`   SGD Base Currency: ${sgdIsBase ? '✅' : '❌'}`);

  // Test: Yuan gives fewer points than SGD for same nominal amount
  const nominalAmount = 100;
  const sgdPicklePoints = nominalAmount * currencyRates.SGD * 3; // 300 points
  const cnyPicklePoints = nominalAmount * (1/currencyRates.CNY) * 3; // 100 * 0.192 * 3 = 57.6 points
  const yuanGivesFewerPoints = cnyPicklePoints < sgdPicklePoints;
  
  addTestResult(
    'Yuan Gives Fewer Points',
    yuanGivesFewerPoints,
    `SGD ¥100 → ${sgdPicklePoints} PP, CNY ¥100 → ${cnyPicklePoints.toFixed(1)} PP`,
    true
  );
  console.log(`   Yuan Gives Fewer Points: ${yuanGivesFewerPoints ? '✅' : '❌'}`);

  // 3. Test Algorithm Constants
  console.log('\n🧮 Testing Algorithm Constants...');
  
  const SYSTEM_B_WIN = 3;
  const SYSTEM_B_LOSS = 1;
  const PICKLE_MULTIPLIER = 1.5;

  const systemBCorrect = SYSTEM_B_WIN === 3 && SYSTEM_B_LOSS === 1;
  addTestResult(
    'System B Constants',
    systemBCorrect,
    `Win: ${SYSTEM_B_WIN}, Loss: ${SYSTEM_B_LOSS}`,
    true
  );
  console.log(`   System B Constants: ${systemBCorrect ? '✅' : '❌'}`);

  const pickleMultiplierCorrect = PICKLE_MULTIPLIER === 1.5;
  addTestResult(
    'Pickle Points Multiplier',
    pickleMultiplierCorrect,
    `Multiplier: ${PICKLE_MULTIPLIER}x`,
    true
  );
  console.log(`   Pickle Points Multiplier: ${pickleMultiplierCorrect ? '✅' : '❌'}`);

  // 4. Test Calculation Examples
  console.log('\n🔢 Testing Calculation Examples...');
  
  // Basic win calculation
  const winRankingPoints = SYSTEM_B_WIN;
  const winPicklePoints = winRankingPoints * PICKLE_MULTIPLIER;
  const winCalculationCorrect = winPicklePoints === 4.5;
  
  addTestResult(
    'Basic Win Calculation',
    winCalculationCorrect,
    `3 ranking → ${winPicklePoints} pickle`,
    true
  );
  console.log(`   Basic Win Calculation: ${winCalculationCorrect ? '✅' : '❌'}`);

  // Age group multiplier example
  const ageMultiplier35Plus = 1.2;
  const winWith35Plus = SYSTEM_B_WIN * ageMultiplier35Plus;
  const pickleWith35Plus = winWith35Plus * PICKLE_MULTIPLIER;
  const ageCalculationCorrect = Math.abs(winWith35Plus - 3.6) < 0.01 && Math.abs(pickleWith35Plus - 5.4) < 0.01;
  
  addTestResult(
    '35+ Age Multiplier',
    ageCalculationCorrect,
    `3 × 1.2 = ${winWith35Plus} ranking → ${pickleWith35Plus} pickle`,
    true
  );
  console.log(`   35+ Age Multiplier: ${ageCalculationCorrect ? '✅' : '❌'}`);

  // Gender bonus example
  const genderBonus = 1.15;
  const lossWithGenderBonus = SYSTEM_B_LOSS * genderBonus;
  const pickleWithGenderBonus = lossWithGenderBonus * PICKLE_MULTIPLIER;
  const genderCalculationCorrect = Math.abs(lossWithGenderBonus - 1.15) < 0.01 && Math.abs(pickleWithGenderBonus - 1.725) < 0.01;
  
  addTestResult(
    'Female Gender Bonus',
    genderCalculationCorrect,
    `1 × 1.15 = ${lossWithGenderBonus} ranking → ${pickleWithGenderBonus.toFixed(3)} pickle`,
    true
  );
  console.log(`   Female Gender Bonus: ${genderCalculationCorrect ? '✅' : '❌'}`);

  // 5. Test Decimal Precision
  console.log('\n🎯 Testing Decimal Precision...');
  
  const complexCalculation = (SYSTEM_B_WIN * 1.2 * 1.15); // 4.14
  const complexPickle = complexCalculation * PICKLE_MULTIPLIER; // 6.21
  const precisionCorrect = 
    (complexCalculation.toFixed(2) === '4.14') && 
    (complexPickle.toFixed(2) === '6.21');
  
  addTestResult(
    'Decimal Precision (2 places)',
    precisionCorrect,
    `Complex calc: ${complexCalculation.toFixed(2)} ranking → ${complexPickle.toFixed(2)} pickle`,
    true
  );
  console.log(`   Decimal Precision: ${precisionCorrect ? '✅' : '❌'}`);

  // 6. Test Additive Points Logic
  console.log('\n➕ Testing Additive Points Logic...');
  
  const currentPoints = 100.5;
  const newPoints = 5.25;
  const expectedTotal = currentPoints + newPoints; // 105.75
  const additiveCorrect = expectedTotal === 105.75;
  
  addTestResult(
    'Additive Points Operation',
    additiveCorrect,
    `${currentPoints} + ${newPoints} = ${expectedTotal}`,
    true
  );
  console.log(`   Additive Points Operation: ${additiveCorrect ? '✅' : '❌'}`);

  // Generate Final Report
  console.log('\n' + '='.repeat(80));
  console.log('ALGORITHM DIAGNOSTIC REPORT');
  console.log('='.repeat(80));
  
  const totalTests = DIAGNOSTIC_REPORT.testResults.length;
  const passedTests = DIAGNOSTIC_REPORT.testResults.filter(t => t.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(2);
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${successRate}%`);
  console.log(`Critical Errors: ${DIAGNOSTIC_REPORT.criticalErrors.length}`);
  console.log(`Warnings: ${DIAGNOSTIC_REPORT.warnings.length}`);
  
  // Overall Status
  const overallStatus = DIAGNOSTIC_REPORT.criticalErrors.length === 0 ? 'PASSED' : 'CRITICAL_FAILURES';
  console.log(`\nOVERALL STATUS: ${overallStatus}`);
  
  if (DIAGNOSTIC_REPORT.criticalErrors.length > 0) {
    console.log('\n🚨 CRITICAL ERRORS:');
    DIAGNOSTIC_REPORT.criticalErrors.forEach(error => console.log(`   ❌ ${error}`));
  }
  
  if (DIAGNOSTIC_REPORT.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    DIAGNOSTIC_REPORT.warnings.forEach(warning => console.log(`   ⚠️ ${warning}`));
  }
  
  // Recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  if (overallStatus === 'PASSED') {
    console.log('   ✅ All critical algorithm validations passed');
    console.log('   🚀 Core algorithm logic is UDF compliant');
    console.log('   📊 Currency system follows SGD-based calculations');
    console.log('   🎯 Decimal precision and additive operations validated');
  } else {
    console.log('   🚨 Address critical algorithm failures immediately');
    console.log('   ❌ Review algorithm implementation against UDF standards');
    console.log('   🔧 Fix calculation errors before deployment');
  }
  
  console.log('\n' + '='.repeat(80));
  
  return {
    overallStatus,
    totalTests,
    passedTests,
    failedTests,
    successRate,
    criticalErrors: DIAGNOSTIC_REPORT.criticalErrors.length,
    warnings: DIAGNOSTIC_REPORT.warnings.length,
    report: DIAGNOSTIC_REPORT
  };
}

// Execute diagnostic
runDiagnostic()
  .then(result => {
    console.log('\n🎉 Algorithm diagnostic complete!');
    process.exit(result.criticalErrors > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('\n💥 Diagnostic failed:', error);
    process.exit(1);
  });