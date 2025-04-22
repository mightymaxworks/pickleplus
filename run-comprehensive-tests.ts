/**
 * PKL-278651-BOUNCE-0022-COMP - Comprehensive Test Runner
 * 
 * This script runs a comprehensive test suite and generates multiple report types:
 * 1. Standard bug report
 * 2. Bug report with fix prompts
 * 3. CI/CD summary
 * 
 * Run with: npx tsx run-comprehensive-tests.ts [production|local]
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { startTestRun } from './bounce/production-run';
import { generateReport } from './bounce/reporting/bug-report-generator';
import { generateReportWithPrompts } from './bounce/reporting/bug-report-generator-with-prompts';
import { generateCICDSummary } from './bounce/ci-cd-integration';
import { performance } from 'perf_hooks';

// Default test configuration
const defaultOptions = {
  browser: 'chrome',
  mobile: false,
  coverage: 50,
  headless: true,
  timeout: 30000,
};

async function runComprehensiveTests() {
  console.log('==========================================================');
  console.log('Bounce Comprehensive Test Suite');
  console.log('==========================================================');
  
  // Determine target based on command line argument
  const isProduction = process.argv[2] !== 'local';
  const baseUrl = isProduction ? 'https://pickle-plus.replit.app' : 'http://localhost:3000';
  
  console.log(`Starting comprehensive tests against: ${baseUrl}`);
  console.log('This will generate multiple report types.');
  
  const startTime = performance.now();
  
  // Run the test and get the test run ID
  const testRunId = await startTestRun({
    ...defaultOptions,
    baseUrl,
  });
  
  console.log(`\nTest run completed with ID: ${testRunId}`);
  
  // Generate all report types
  const standardReportPath = await generateReport(testRunId);
  console.log(`Standard bug report generated: ${standardReportPath}`);
  
  const fixPromptsReportPath = await generateReportWithPrompts(testRunId);
  console.log(`Bug report with fix prompts generated: ${fixPromptsReportPath}`);
  
  const cicdSummaryPath = await generateCICDSummary(testRunId);
  console.log(`CI/CD summary generated: ${cicdSummaryPath}`);
  
  const endTime = performance.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n==========================================================');
  console.log(`Testing complete in ${duration}s!`);
  console.log('Check the reports directory for all generated reports:');
  console.log(` - Standard bug report: ${standardReportPath.split('/').pop()}`);
  console.log(` - Bug report with fix prompts: ${fixPromptsReportPath.split('/').pop()}`);
  console.log(` - CI/CD summary: ${cicdSummaryPath.split('/').pop()}`);
  console.log('==========================================================');
  
  return 0;
}

// Run the function if this script is called directly
if (import.meta.url === process.argv[1]) {
  runComprehensiveTests()
    .then((exitCode) => process.exit(exitCode))
    .catch((error) => {
      console.error(`Error running comprehensive tests: ${error.message}`);
      process.exit(1);
    });
}

export { runComprehensiveTests };