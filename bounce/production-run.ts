/**
 * PKL-278651-BOUNCE-0016-CICD - Production Test Run
 * 
 * Run automated tests against the production platform as part of CI/CD
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { bounceIdentity } from './core/bounce-identity';
import { testRunner } from './runner/test-runner';
import { bugReportGenerator } from './reporting';
import { db } from '../server/db';
import { eq } from 'drizzle-orm';
import { bounceTestRuns, BounceTestRunStatus } from '../shared/schema/bounce';

// The URL of the production application to test
const PRODUCTION_URL = 'https://pickle-plus.replit.app'; // Replace with your actual production URL

/**
 * Run automated tests against the production platform
 * 
 * @returns ID of the test run
 */
export async function runProductionTests(): Promise<number> {
  console.log(`[Bounce] Running production tests against ${PRODUCTION_URL}...`);
  
  // Run tests with production URL
  const testRunId = await testRunner.runTests({
    baseUrl: PRODUCTION_URL,
    browser: 'chrome',
    mobile: false,
    coverage: 80, // Test 80% of critical paths
    headless: true,
    timeout: 60000 // Longer timeout for production tests
  });
  
  console.log(`[Bounce] Production tests completed with ID: ${testRunId}`);
  
  // Check if the test run was successful
  const [testRun] = await db
    .select()
    .from(bounceTestRuns)
    .where(eq(bounceTestRuns.id, testRunId));
  
  if (testRun && testRun.status === BounceTestRunStatus.COMPLETED) {
    console.log('[Bounce] Production test run was successful');
    
    // Generate a report
    try {
      const reportPath = await bugReportGenerator.generateReport(testRunId);
      console.log(`[Bounce] Production bug report generated: ${reportPath}`);
    } catch (error) {
      console.error(`[Bounce] Error generating production report: ${(error as Error).message}`);
    }
  } else {
    console.error('[Bounce] Production test run failed');
    if (testRun && testRun.error_message) {
      console.error(`[Bounce] Error: ${testRun.error_message}`);
    }
  }
  
  return testRunId;
}

// Direct run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  runProductionTests()
    .then((testRunId) => {
      console.log(`[Bounce] Production tests completed with test run ID: ${testRunId}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[Bounce] Error running production tests: ${error.message}`);
      process.exit(1);
    });
}