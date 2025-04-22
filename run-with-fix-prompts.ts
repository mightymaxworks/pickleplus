/**
 * PKL-278651-BOUNCE-0022-FIX-RUN - Run with Fix Prompts
 * 
 * Run tests and generate a report with actionable fix prompts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { testRunner } from './bounce/runner/test-runner';
import { generateReportWithPrompts } from './bounce/reporting/bug-report-generator-with-prompts';
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
    console.log('Bounce Tests With Fix Prompts');
    console.log('==========================================================');
    console.log('Starting tests with fix prompts...');
    
    // Run a simple test
    const testRunId = await testRunner.runTests({
      baseUrl: 'https://pickle-plus.replit.app',
      browser: 'chrome',
      mobile: false,
      coverage: 50,
      headless: true,
      timeout: 30000
    });
    
    console.log(`\nTest run completed with ID: ${testRunId}`);
    
    // Generate a report with fix prompts
    try {
      const reportPath = await generateReportWithPrompts(testRunId);
      console.log(`Bug report with fix prompts generated: ${reportPath}`);
      
      console.log('\n==========================================================');
      console.log('Testing complete! Check the reports directory for your bug report with fix prompts.');
      console.log('==========================================================');
    } catch (error) {
      console.error(`Error generating report: ${(error as Error).message}`);
    }
    
  } catch (error) {
    console.error(`Error running tests: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Run the main function
main();