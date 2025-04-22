#!/usr/bin/env tsx

/**
 * PKL-278651-BOUNCE-0011-CICD - Bounce CLI
 * 
 * Command-line interface for the Bounce automated testing system
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { testRunner } from './runner/test-runner';
import { bounceIdentity } from './core/bounce-identity';
import { bugReportGenerator, enhancedReportGenerator } from './reporting';
import { actionItemsGenerator } from './action-items-generator';
import { BounceTestRunStatus, BounceFindingSeverity } from '../shared/schema/bounce';
import fs from 'fs';
import path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  // Foreground colors
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  // Background colors
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

/**
 * Print the usage information
 */
function printUsage() {
  console.log(`${colors.bright}Bounce Automated Testing System${colors.reset} - Framework5.2\n`);
  console.log(`${colors.bright}Usage:${colors.reset}`);
  console.log(`  ${colors.fg.cyan}npx tsx bounce/cli.ts${colors.reset} ${colors.fg.yellow}<command>${colors.reset} [options]\n`);
  
  console.log(`${colors.bright}Available Commands:${colors.reset}`);
  console.log(`  ${colors.fg.yellow}run${colors.reset}                Run automated tests`);
  console.log(`  ${colors.fg.yellow}report${colors.reset} <id>        Generate a bug report for a test run`);
  console.log(`  ${colors.fg.yellow}enhanced-report${colors.reset} <id> Generate an enhanced bug report for a test run`);
  console.log(`  ${colors.fg.yellow}plan${colors.reset} <id>          Generate a sprint plan from a test run`);
  console.log(`  ${colors.fg.yellow}list${colors.reset}               List all test runs`);
  console.log(`  ${colors.fg.yellow}simple${colors.reset}             Run a simple demo (no external dependencies)`);
  console.log(`  ${colors.fg.yellow}plan-from-report${colors.reset} <file> Generate a sprint plan from a bug report file`);
  console.log(`  ${colors.fg.yellow}help${colors.reset}               Show this help message\n`);
  
  console.log(`${colors.bright}Options for 'run' command:${colors.reset}`);
  console.log(`  ${colors.fg.yellow}--browser${colors.reset} <name>   Browser to use (default: chromium)`);
  console.log(`  ${colors.fg.yellow}--mobile${colors.reset}           Run tests in mobile mode`);
  console.log(`  ${colors.fg.yellow}--coverage${colors.reset} <pct>   Code coverage percentage (default: 0)`);
  console.log(`  ${colors.fg.yellow}--url${colors.reset} <url>        Base URL to test (default: http://localhost:3000)`);
  console.log(`  ${colors.fg.yellow}--headless${colors.reset}         Run tests in headless mode`);
  console.log(`  ${colors.fg.yellow}--timeout${colors.reset} <ms>     Test timeout in milliseconds (default: 30000)\n`);
  
  console.log(`${colors.bright}Examples:${colors.reset}`);
  console.log(`  ${colors.fg.cyan}npx tsx bounce/cli.ts${colors.reset} ${colors.fg.yellow}run${colors.reset} --browser firefox --mobile`);
  console.log(`  ${colors.fg.cyan}npx tsx bounce/cli.ts${colors.reset} ${colors.fg.yellow}report${colors.reset} 123`);
  console.log(`  ${colors.fg.cyan}npx tsx bounce/cli.ts${colors.reset} ${colors.fg.yellow}plan${colors.reset} 123`);
  console.log(`  ${colors.fg.cyan}npx tsx bounce/cli.ts${colors.reset} ${colors.fg.yellow}simple${colors.reset}`);
}

/**
 * Generate a report from a test run
 * @param testRunId Test run ID
 */
async function generateReport(testRunId: number) {
  console.log(`Generating bug report for test run ${testRunId}...`);
  
  try {
    const reportPath = await bugReportGenerator.generateReport(testRunId);
    console.log(`\nBug report generated: ${reportPath}`);
  } catch (error) {
    console.error(`Error generating report: ${(error as Error).message}`);
    process.exit(1);
  }
}

/**
 * Generate an enhanced report from a test run
 * @param testRunId Test run ID
 */
async function generateEnhancedReport(testRunId: number) {
  console.log(`Generating enhanced report for test run ${testRunId}...`);
  
  try {
    const reportPath = await enhancedReportGenerator.generateEnhancedReport(testRunId);
    console.log(`\nEnhanced report generated: ${reportPath}`);
  } catch (error) {
    console.error(`Error generating enhanced report: ${(error as Error).message}`);
    process.exit(1);
  }
}

/**
 * Generate a sprint plan from a test run
 * @param testRunId Test run ID
 */
async function generatePlan(testRunId: number) {
  console.log(`Generating sprint plan for test run ${testRunId}...`);
  
  try {
    const planPath = await actionItemsGenerator.generateActionItems(testRunId);
    console.log(`\nSprint plan generated: ${planPath}`);
  } catch (error) {
    console.error(`Error generating sprint plan: ${(error as Error).message}`);
    process.exit(1);
  }
}

/**
 * List all test runs
 */
async function listTestRuns() {
  console.log(`Fetching test runs...`);
  
  try {
    const testRuns = await bounceIdentity.getAllTestRuns();
    
    if (testRuns.length === 0) {
      console.log(`\nNo test runs found. Run 'npx tsx bounce/cli.ts run' to create one.`);
      return;
    }
    
    console.log(`\n${colors.bright}Test Runs:${colors.reset}`);
    console.log(`${colors.underscore}ID    Date                 Status     Findings  Name${colors.reset}`);
    
    for (const run of testRuns) {
      const date = run.createdAt ? new Date(run.createdAt).toLocaleString() : 'N/A';
      const statusColor = 
        run.status === BounceTestRunStatus.COMPLETED ? colors.fg.green :
        run.status === BounceTestRunStatus.FAILED ? colors.fg.red :
        run.status === BounceTestRunStatus.RUNNING ? colors.fg.yellow :
        colors.reset;
      
      console.log(
        `${run.id.toString().padEnd(5)} ${date.padEnd(20)} ${statusColor}${run.status.padEnd(10)}${colors.reset} ${run.totalFindings?.toString().padEnd(9) || '0'.padEnd(9)} ${run.name.slice(0, 50)}`
      );
    }
    
    console.log(`\nTo generate a report, use: npx tsx bounce/cli.ts report <id>`);
  } catch (error) {
    console.error(`Error listing test runs: ${(error as Error).message}`);
    process.exit(1);
  }
}

/**
 * Run automated tests
 * @param args Command-line arguments
 */
async function runTests(args: string[]) {
  // Parse command-line arguments
  const options = {
    browser: 'chromium',
    mobile: false,
    coverage: 0,
    url: 'http://localhost:3000',
    headless: false,
    timeout: 30000
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    if (arg === '--browser' && nextArg && !nextArg.startsWith('--')) {
      options.browser = nextArg;
      i++;
    } else if (arg === '--mobile') {
      options.mobile = true;
    } else if (arg === '--coverage' && nextArg && !nextArg.startsWith('--')) {
      options.coverage = parseInt(nextArg, 10);
      i++;
    } else if (arg === '--url' && nextArg && !nextArg.startsWith('--')) {
      options.url = nextArg;
      i++;
    } else if (arg === '--headless') {
      options.headless = true;
    } else if (arg === '--timeout' && nextArg && !nextArg.startsWith('--')) {
      options.timeout = parseInt(nextArg, 10);
      i++;
    }
  }
  
  console.log(`Running tests with options:`, options);
  
  try {
    const testRunId = await testRunner.runTests({
      baseUrl: options.url,
      browser: options.browser,
      mobile: options.mobile,
      coverage: options.coverage,
      headless: options.headless,
      timeout: options.timeout
    });
    
    console.log(`\nTest run completed with ID: ${testRunId}`);
    console.log(`To generate a report, use: npx tsx bounce/cli.ts report ${testRunId}`);
  } catch (error) {
    console.error(`Error running tests: ${(error as Error).message}`);
    process.exit(1);
  }
}

/**
 * Main function that processes command-line arguments
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    printUsage();
    return;
  }
  
  switch (command) {
    case 'run':
      await runTests(args.slice(1));
      break;
    
    case 'report':
      if (!args[1]) {
        console.error('Error: Test run ID is required for the report command');
        printUsage();
        process.exit(1);
      }
      
      await generateReport(parseInt(args[1], 10));
      break;
    
    case 'enhanced-report':
      if (!args[1]) {
        console.error('Error: Test run ID is required for the enhanced-report command');
        printUsage();
        process.exit(1);
      }
      
      await generateEnhancedReport(parseInt(args[1], 10));
      break;
    
    case 'plan':
      if (!args[1]) {
        console.error('Error: Test run ID is required for the plan command');
        printUsage();
        process.exit(1);
      }
      
      await generatePlan(parseInt(args[1], 10));
      break;
    
    case 'list':
      await listTestRuns();
      break;
    
    case 'simple':
      const { runSimpleDemo } = await import('./simple-run');
      const testRunId = await runSimpleDemo();
      console.log(`\nSimple demo completed with test run ID: ${testRunId}`);
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}