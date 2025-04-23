/**
 * PKL-278651-BOUNCE-0027-RUNPROD - Production Test Runner Script
 * 
 * This script runs Bounce tests against the production environment and
 * generates a detailed report.
 * 
 * Run with: npx tsx run-production-tests.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { startTestRun } from './bounce/production-run';
import { generateReport } from './bounce/reporting/bug-report-generator';
import { generateCICDSummary } from './bounce/ci-cd-integration';
import { BounceTestRunOptions } from './bounce/types';
import { getFindings } from './bounce/storage';

// Default options for production tests
const productionOptions: BounceTestRunOptions = {
  baseUrl: 'https://pickle-plus.replit.app',
  browser: 'chrome',
  mobile: false,
  coverage: 50,
  headless: true,
  timeout: 30000,
};

/**
 * Runs production tests
 */
async function runProductionTests() {
  console.log('==========================================================');
  console.log('Bounce Production Tests');
  console.log('==========================================================');
  
  console.log(`Starting tests against: ${productionOptions.baseUrl}`);
  
  // Run the test and get the test run ID
  try {
    const testRunId = await startTestRun(productionOptions);
    console.log(`\nTest run completed with ID: ${testRunId}`);
    
    // Generate a report
    const reportPath = await generateReport(testRunId);
    console.log(`Bug report generated: ${reportPath}`);
    
    // Generate a CI/CD summary
    const summaryPath = await generateCICDSummary(testRunId);
    console.log(`CI/CD summary generated: ${summaryPath}`);
    
    // Get findings to display statistics
    const findings = await getFindings(testRunId);
    
    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const highCount = findings.filter(f => f.severity === 'HIGH').length;
    const moderateCount = findings.filter(f => f.severity === 'MODERATE').length;
    const lowCount = findings.filter(f => f.severity === 'LOW').length;
    const totalCount = findings.length;
    
    console.log('\nTest Results:');
    console.log(`Total Issues Found: ${totalCount}`);
    console.log(`Critical Issues: ${criticalCount}`);
    console.log(`High Priority Issues: ${highCount}`);
    console.log(`Moderate Issues: ${moderateCount}`);
    console.log(`Low Priority Issues: ${lowCount}`);
    
    console.log('\n==========================================================');
    console.log('Testing complete! Check the reports directory for your bug report.');
    console.log('==========================================================');
    
    return {
      success: criticalCount === 0,
      exitCode: criticalCount > 0 ? 1 : 0
    };
  } catch (error) {
    console.error(`Error running production tests: ${error.message}`);
    return {
      success: false,
      exitCode: 1
    };
  }
}

// Run the function if this script is called directly
if (import.meta.url === process.argv[1]) {
  runProductionTests()
    .then(result => process.exit(result.exitCode))
    .catch(error => {
      console.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}

export { runProductionTests };