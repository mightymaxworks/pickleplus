/**
 * PKL-278651-BOUNCE-0010-CICD - Bounce CI/CD Command Line Interface
 * 
 * This module provides a command-line interface for running Bounce tests
 * as part of CI/CD workflows directly within Replit.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { Command } from 'commander';
import { bounceIdentity } from './core/bounce-identity';
import { nonDestructiveTester } from './core/non-destructive-tester';
import { reportGenerator, enhancedReportGenerator, bugReportGenerator } from './reporting';
import { RunnerConfig, TestSuite, runTests } from './runner/test-runner';
import { BounceTestRunStatus, BounceFindingSeverity } from '../shared/schema/bounce';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Use built-in terminal colors to avoid unnecessary dependencies
const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text: string) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`
};

// Load environment variables
dotenv.config();

// Create the command-line program
const program = new Command();

program
  .name('bounce-cli')
  .description('Bounce Automated Testing System for CI/CD')
  .version('1.0.0');

// Command for running tests
program
  .command('run')
  .description('Run automated tests')
  .option('-s, --suite <name>', 'Test suite to run (e.g., "api", "ui", "all")', 'all')
  .option('-b, --browsers <list>', 'Comma-separated list of browsers to test', 'chrome')
  .option('-e, --environment <env>', 'Environment to test against', 'development')
  .option('-o, --output <format>', 'Output format (json, markdown, html, buglist)', 'markdown')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--headless', 'Run browser tests in headless mode', true)
  .option('--ci-mode', 'Run in CI mode (fail on critical findings)', false)
  .action(async (options) => {
    try {
      console.log(colors.blue('┌─────────────────────────────────┐'));
      console.log(colors.blue('│      BOUNCE TESTING SYSTEM      │'));
      console.log(colors.blue('└─────────────────────────────────┘'));
      console.log(colors.yellow(`Starting test run for suite: ${options.suite}`));
      console.log(colors.yellow(`Testing environment: ${options.environment}`));
      console.log(colors.yellow(`Browsers: ${options.browsers}`));
      
      // Initialize test run
      const testRunId = await bounceIdentity.startTestRun(
        options.browsers,
        options.suite
      );
      
      // Initialize non-destructive tester
      nonDestructiveTester.initialize(testRunId);
      
      // Set up test configuration
      const config: RunnerConfig = {
        suite: options.suite,
        browsers: options.browsers.split(','),
        environment: options.environment,
        headless: options.headless,
        verbose: options.verbose,
        testRunId
      };
      
      // Run the tests
      const results = await runTests(config);
      
      // Process results
      const criticalFindings = results.findings.filter(
        f => f.severity === BounceFindingSeverity.CRITICAL
      ).length;
      
      const highFindings = results.findings.filter(
        f => f.severity === BounceFindingSeverity.HIGH
      ).length;
      
      const status = results.success 
        ? BounceTestRunStatus.COMPLETED 
        : BounceTestRunStatus.FAILED;
      
      // End the test run
      await bounceIdentity.endTestRun(
        status,
        results.findings.length,
        results.coverage
      );
      
      // Generate report
      let reportContent = '';
      let reportPath = '';
      
      // Use the proper bug report generator for buglist format
      if (options.output === 'buglist') {
        console.log(colors.cyan('\nGenerating detailed bug report with solution prompts...'));
        
        // Use the dedicated bug report generator which properly handles all severity levels
        reportContent = await bugReportGenerator.generateBugReport(
          testRunId,
          { 
            includeEvidence: true,
            includeSolutionPrompts: true,
            sortBySeverity: true,
            groupByArea: true
          }
        );
        
        reportPath = bugReportGenerator.saveReportToFile(
          reportContent,
          path.join('reports', `bounce_buglist_${testRunId}.md`)
        );
        
        console.log(colors.green(`Bug report with solution prompts generated successfully!`));
      } else {
        // Use standard report generator for other formats
        reportContent = await reportGenerator.generateTestRunReport(
          testRunId,
          { format: options.output as any, includeEvidence: true }
        );
        
        reportPath = reportGenerator.saveReportToFile(
          reportContent,
          options.output as any,
          path.join('reports', `bounce_report_${testRunId}.${options.output === 'markdown' ? 'md' : options.output}`)
        );
      }
      
      // Print summary
      console.log(colors.blue('\n┌─────────────────────────────────┐'));
      console.log(colors.blue('│           TEST SUMMARY          │'));
      console.log(colors.blue('└─────────────────────────────────┘'));
      console.log(`Total tests: ${colors.cyan(String(results.total))}`);
      console.log(`Passed: ${colors.green(String(results.passed))}`);
      console.log(`Failed: ${colors.red(String(results.failed))}`);
      console.log(`Skipped: ${colors.yellow(String(results.skipped))}`);
      console.log(`Coverage: ${colors.cyan(String(results.coverage))}%`);
      console.log(colors.yellow('\nFindings:'));
      console.log(`Critical: ${colors.red(String(criticalFindings))}`);
      console.log(`High: ${colors.magenta(String(highFindings))}`);
      console.log(`Other: ${colors.yellow(String(results.findings.length - criticalFindings - highFindings))}`);
      console.log(colors.cyan(`\nReport saved to: ${reportPath}`));
      
      // Exit with appropriate code for CI
      if (options.ciMode && (criticalFindings > 0 || !results.success)) {
        console.log(colors.red('\nCI check failed due to critical issues or test failures'));
        process.exit(1);
      }
      
      console.log(colors.green('\nBounce test run completed successfully'));
    } catch (error) {
      console.error(colors.red(`Error running tests: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Command for initializing test suites
program
  .command('init')
  .description('Initialize test suite configuration')
  .option('-d, --directory <path>', 'Directory to initialize', './bounce/tests')
  .action((options) => {
    try {
      if (!fs.existsSync(options.directory)) {
        fs.mkdirSync(options.directory, { recursive: true });
      }
      
      // Create sample test suite configuration
      const sampleConfig: TestSuite = {
        name: 'default',
        tests: [
          {
            name: 'Basic Functionality',
            description: 'Tests core application functionality',
            paths: ['/', '/communities', '/profile'],
            steps: [
              { action: 'navigate', target: '/' },
              { action: 'assertElementExists', target: 'h1', value: 'Welcome to Pickle+' },
              { action: 'navigate', target: '/communities' },
              { action: 'assertElementCount', target: '.community-card', value: '1' }
            ]
          }
        ]
      };
      
      fs.writeFileSync(
        path.join(options.directory, 'default-suite.json'),
        JSON.stringify(sampleConfig, null, 2),
        'utf8'
      );
      
      console.log(colors.green(`Test suite configuration initialized at ${options.directory}/default-suite.json`));
    } catch (error) {
      console.error(colors.red(`Error initializing test suite: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Schedule management
program
  .command('schedule')
  .description('Manage automated test schedules')
  .option('-l, --list', 'List all schedules')
  .option('-c, --create <name>', 'Create a new schedule')
  .option('-r, --remove <id>', 'Remove a schedule')
  .option('-e, --enable <id>', 'Enable a schedule')
  .option('-d, --disable <id>', 'Disable a schedule')
  .action(async (options) => {
    // This would connect to the bounce-automation system
    // Implementation would use the database to manage schedules
    console.log(colors.yellow('Schedule management not fully implemented yet'));
  });

// Parse command-line arguments
if (require.main === module) {
  program.parse(process.argv);
}

export { program as bounceCli };