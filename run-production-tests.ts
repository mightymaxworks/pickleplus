/**
 * PKL-278651-BOUNCE-0018-MANUAL - Manual Production Test Runner
 * 
 * This script runs Bounce tests against the production platform and generates reports.
 * Run with: npx tsx run-production-tests.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { runCICDTests } from './bounce/ci-cd-integration';
import { getCICDTrend } from './bounce/ci-cd-integration';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Make sure required environment variables are set
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable must be set');
  process.exit(1);
}

async function main() {
  try {
    console.log('==========================================================');
    console.log('Bounce Production Tests - Manual Runner');
    console.log('==========================================================');
    console.log('Starting production tests...');
    
    // Run the tests
    const result = await runCICDTests(true, 3);
    
    console.log('\n==========================================================');
    console.log(`Test Results: ${result.success ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`Test Run ID: ${result.testRunId}`);
    console.log(`Report Path: ${result.reportPath}`);
    console.log(`Critical Issues: ${result.criticalCount}`);
    console.log(`High Issues: ${result.highCount}`);
    console.log(`Moderate Issues: ${result.moderateCount}`);
    console.log(`Low Issues: ${result.lowCount}`);
    console.log(`Total Issues: ${result.totalCount}`);
    console.log('==========================================================');
    
    // Show recent trends if available
    if (result.testRunId > 0) {
      console.log('\nFetching recent testing trends (last 30 days)...');
      const trends = await getCICDTrend(30);
      
      console.log(`Total Test Runs: ${trends.totalRuns}`);
      console.log(`Average Critical Issues: ${trends.averageCritical.toFixed(2)}`);
      console.log(`Average High Issues: ${trends.averageHigh.toFixed(2)}`);
      
      if (trends.findingCounts.length > 0) {
        console.log('\nRecent Test Runs:');
        trends.findingCounts.slice(0, 5).forEach((run: any) => {
          const date = new Date(run.date).toLocaleDateString();
          console.log(`- Run #${run.runId} (${date}): ${run.criticalCount} critical, ${run.highCount} high, ${run.totalCount} total`);
        });
      }
    }
    
    console.log('\n==========================================================');
    console.log('Testing complete! Check the reports directory for details.');
    console.log('==========================================================');
    
    // Exit with appropriate code
    process.exit(result.exitCode);
  } catch (error) {
    console.error(`Error running tests: ${(error as Error).message}`);
    process.exit(2);
  }
}

// Run the main function
main();