/**
 * PKL-278651-BOUNCE-0012-CICD - Simple Test Run
 * 
 * Simplified test run that doesn't require Playwright
 * Used for demo purposes or quick validation
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

/**
 * Run a simple demo test
 * This function performs a mockable test run without requiring Playwright
 * 
 * @returns ID of the test run
 */
export async function runSimpleDemo(): Promise<number> {
  console.log('[Bounce] Running simple demo test...');
  
  // Run tests with fallback mode (no Playwright)
  const testRunId = await testRunner.runTests({
    baseUrl: 'http://localhost:3000',
    browser: 'chrome',
    mobile: false,
    coverage: 0,
    headless: true,
    timeout: 30000
  });
  
  console.log(`[Bounce] Simple demo test completed with ID: ${testRunId}`);
  
  // Check if the test run was successful
  const [testRun] = await db
    .select()
    .from(bounceTestRuns)
    .where(eq(bounceTestRuns.id, testRunId));
  
  if (testRun && testRun.status === BounceTestRunStatus.COMPLETED) {
    console.log('[Bounce] Test run was successful');
    
    // Generate a report
    try {
      const reportPath = await bugReportGenerator.generateReport(testRunId);
      console.log(`[Bounce] Bug report generated: ${reportPath}`);
    } catch (error) {
      console.error(`[Bounce] Error generating report: ${(error as Error).message}`);
    }
  } else {
    console.error('[Bounce] Test run failed');
  }
  
  return testRunId;
}

// Direct run if called directly
// In ESM, we can use import.meta.url to check if this is the main module
if (import.meta.url.endsWith(process.argv[1])) {
  runSimpleDemo()
    .then((testRunId) => {
      console.log(`[Bounce] Simple demo completed with test run ID: ${testRunId}`);
    })
    .catch((error) => {
      console.error(`[Bounce] Error running simple demo: ${error.message}`);
      process.exit(1);
    });
}