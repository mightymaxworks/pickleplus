/**
 * PKL-278651-BOUNCE-0019-LOCAL - Local Environment Test Runner
 * 
 * This script runs Bounce tests against the local development environment
 * Run with: npx tsx run-local-tests.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { testRunner } from './bounce/runner/test-runner';
import { bugReportGenerator } from './bounce/reporting';
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
    console.log('Bounce Local Tests - Development Environment');
    console.log('==========================================================');
    console.log('Starting local tests...');
    
    // Local URL (assumes the app is running on port 3000)
    const LOCAL_URL = 'http://localhost:3000';
    
    // Run tests with local URL
    const testRunId = await testRunner.runTests({
      baseUrl: LOCAL_URL,
      browser: 'chrome',
      mobile: false,
      coverage: 50, // Lower coverage for faster local tests
      headless: true,
      timeout: 30000
    });
    
    console.log(`\nTest run completed with ID: ${testRunId}`);
    
    // Generate a report
    try {
      const reportPath = await bugReportGenerator.generateReport(testRunId);
      console.log(`Bug report generated: ${reportPath}`);
      
      console.log('\n==========================================================');
      console.log('Testing complete! Check the reports directory for details.');
      console.log('==========================================================');
    } catch (error) {
      console.error(`Error generating report: ${(error as Error).message}`);
    }
    
  } catch (error) {
    console.error(`Error running local tests: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Run the main function
main();