#!/usr/bin/env node
/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce CLI - Command-line interface for the Bounce automated testing system
 * 
 * This module provides a command-line interface for running Bounce tests and
 * generating reports. The CLI can be used to run tests, generate bug reports,
 * and convert bug reports into actionable sprint plans with Framework 5.2 compliant codes.
 * 
 * @framework Framework5.2
 * @version 1.0.1
 * @lastModified 2025-04-22
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { bugReportGenerator } from './reporting';
import { actionItemsGenerator } from './reporting';
import { db } from '../server/db';

// Simple color functions without external dependencies
const colors = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  white: (text: string) => `\x1b[37m${text}\x1b[0m`,
};

// Initialize commander
const program = new Command();

// Set up program info
program
  .name('bounce')
  .description('Bounce automated testing system')
  .version('1.0.1');

// run command - runs automated tests
program
  .command('run')
  .description('Run automated tests')
  .option('-u, --url <url>', 'Base URL to test', 'http://localhost:3000')
  .option('-b, --browser <browser>', 'Browser to use (chrome, firefox, webkit)', 'chrome')
  .option('-m, --mobile', 'Run mobile tests', false)
  .option('-c, --coverage <percent>', 'Coverage target percent', '80')
  .option('-d, --headless', 'Run in headless mode', true)
  .option('-t, --timeout <timeout>', 'Timeout in milliseconds', '30000')
  .action(async (options) => {
    console.log(chalk.blue('┌─────────────────────────────────┐'));
    console.log(chalk.blue('│      BOUNCE TEST RUNNER         │'));
    console.log(chalk.blue('└─────────────────────────────────┘'));
    
    console.log(chalk.yellow('Starting tests with options:'));
    console.log(chalk.cyan('URL:'), options.url);
    console.log(chalk.cyan('Browser:'), options.browser);
    console.log(chalk.cyan('Mobile:'), options.mobile ? 'Yes' : 'No');
    console.log(chalk.cyan('Coverage:'), `${options.coverage}%`);
    console.log(chalk.cyan('Headless:'), options.headless ? 'Yes' : 'No');
    console.log(chalk.cyan('Timeout:'), `${options.timeout}ms`);
    
    try {
      // Import the test runner dynamically to avoid import issues
      const { testRunner } = await import('./runner/test-runner');
      
      // Run the tests
      const testRunId = await testRunner.runTests({
        baseUrl: options.url,
        browser: options.browser,
        mobile: options.mobile,
        coverage: parseInt(options.coverage),
        headless: options.headless,
        timeout: parseInt(options.timeout)
      });
      
      console.log(chalk.green(`\nTests completed with ID: ${testRunId}`));
      console.log(chalk.yellow('\nGenerating bug report...'));
      
      // Generate a bug report
      const report = await bugReportGenerator.generateBugReport(
        testRunId,
        {
          includeEvidence: true,
          includeSolutionPrompts: true,
          sortBySeverity: true,
          groupByArea: true
        }
      );
      
      // Save the report to a file
      const timestamp = Date.now();
      const reportPath = bugReportGenerator.saveReportToFile(
        report,
        `./reports/bounce_report_${timestamp}.md`
      );
      
      console.log(chalk.green(`\nBug report generated: ${reportPath}`));
      
      // Ask if user wants to generate a sprint plan
      console.log(chalk.yellow('\nWould you like to generate a sprint plan from this report? (y/n)'));
      process.stdin.once('data', async (data) => {
        const response = data.toString().trim().toLowerCase();
        
        if (response === 'y' || response === 'yes') {
          console.log(chalk.yellow('\nGenerating sprint plan...'));
          
          // Generate a sprint plan
          const sprintPlanPath = actionItemsGenerator.generateActionItemsFromReport(reportPath);
          
          console.log(chalk.green(`\nSprint plan generated: ${sprintPlanPath}`));
          console.log(chalk.cyan('\nYou can now begin fixing these issues using Framework 5.2 sprint codes.'));
        }
        
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red(`\nError running tests: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// report command - generates a report from a past test run
program
  .command('report')
  .description('Generate a report from a test run')
  .argument('<test-run-id>', 'Test run ID')
  .option('-e, --evidence', 'Include evidence', true)
  .option('-s, --solution', 'Include solution prompts', true)
  .option('-o, --output <filename>', 'Output filename')
  .action(async (testRunId, options) => {
    console.log(chalk.blue('┌─────────────────────────────────┐'));
    console.log(chalk.blue('│      BOUNCE REPORT GENERATOR    │'));
    console.log(chalk.blue('└─────────────────────────────────┘'));
    
    console.log(chalk.yellow(`Generating report for test run: ${testRunId}`));
    
    try {
      // Generate a bug report
      const report = await bugReportGenerator.generateBugReport(
        parseInt(testRunId),
        {
          includeEvidence: options.evidence,
          includeSolutionPrompts: options.solution,
          sortBySeverity: true,
          groupByArea: true
        }
      );
      
      // Determine output filename
      const timestamp = Date.now();
      const outputFilename = options.output || `./reports/bounce_report_${timestamp}.md`;
      
      // Save the report to a file
      const reportPath = bugReportGenerator.saveReportToFile(report, outputFilename);
      
      console.log(chalk.green(`\nBug report generated: ${reportPath}`));
      
      // Ask if user wants to generate a sprint plan
      console.log(chalk.yellow('\nWould you like to generate a sprint plan from this report? (y/n)'));
      process.stdin.once('data', async (data) => {
        const response = data.toString().trim().toLowerCase();
        
        if (response === 'y' || response === 'yes') {
          console.log(chalk.yellow('\nGenerating sprint plan...'));
          
          // Generate a sprint plan
          const sprintPlanPath = actionItemsGenerator.generateActionItemsFromReport(reportPath);
          
          console.log(chalk.green(`\nSprint plan generated: ${sprintPlanPath}`));
          console.log(chalk.cyan('\nYou can now begin fixing these issues using Framework 5.2 sprint codes.'));
        }
        
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red(`\nError generating report: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// sprint command - generates a sprint plan from a bug report
program
  .command('sprint')
  .description('Generate a sprint plan from a bug report')
  .option('-r, --report <filename>', 'Report filename')
  .option('-d, --date <date>', 'Report date (e.g. 2025-04-22)')
  .action(async (options) => {
    console.log(chalk.blue('┌─────────────────────────────────┐'));
    console.log(chalk.blue('│      BOUNCE SPRINT GENERATOR    │'));
    console.log(chalk.blue('└─────────────────────────────────┘'));
    
    try {
      // Find the report file
      let reportFile: string | null = null;
      
      if (options.report) {
        // Use the specified report file
        reportFile = path.resolve(options.report);
        
        if (!fs.existsSync(reportFile)) {
          console.error(chalk.red(`Report file not found: ${reportFile}`));
          process.exit(1);
        }
      } else if (options.date) {
        // Find a report file by date
        console.log(chalk.yellow(`Looking for bug reports from ${options.date}...`));
        reportFile = actionItemsGenerator.findBugReportFile(options.date);
      } else {
        // Find the latest report file
        console.log(chalk.yellow('Looking for the latest bug report...'));
        reportFile = actionItemsGenerator.findBugReportFile();
      }
      
      if (!reportFile) {
        console.error(chalk.red('No bug report files found.'));
        console.log(chalk.yellow('Please run Bounce tests first to generate bug reports.'));
        process.exit(1);
      }
      
      console.log(chalk.green(`Found bug report: ${reportFile}`));
      console.log(chalk.yellow('Generating sprint planning document...'));
      
      // Generate the sprint planning document
      const sprintPlanFile = actionItemsGenerator.generateActionItemsFromReport(reportFile);
      
      console.log(chalk.green(`\nSprint planning document generated: ${sprintPlanFile}`));
      console.log(chalk.cyan('\nYou can now begin fixing these issues using Framework 5.2 sprint codes.'));
      
    } catch (error) {
      console.error(chalk.red(`\nError generating sprint plan: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// demo command - runs the simplified demo
program
  .command('demo')
  .description('Run a simplified demo of the Bounce reporting system')
  .action(async () => {
    console.log(chalk.blue('┌─────────────────────────────────┐'));
    console.log(chalk.blue('│      BOUNCE DEMO                │'));
    console.log(chalk.blue('└─────────────────────────────────┘'));
    
    try {
      // Import the simple-run module dynamically
      const { runSimpleDemo } = await import('./simple-run');
      
      // Run the demo
      await runSimpleDemo();
      
      // Ask if user wants to generate a sprint plan
      console.log(chalk.yellow('\nWould you like to generate a sprint plan from this demo report? (y/n)'));
      process.stdin.once('data', async (data) => {
        const response = data.toString().trim().toLowerCase();
        
        if (response === 'y' || response === 'yes') {
          console.log(chalk.yellow('\nGenerating sprint plan...'));
          
          // Find the demo report
          const reportFile = path.resolve('./reports/bounce_demo_report.md');
          
          // Generate a sprint plan
          const sprintPlanPath = actionItemsGenerator.generateActionItemsFromReport(reportFile);
          
          console.log(chalk.green(`\nSprint plan generated: ${sprintPlanPath}`));
          console.log(chalk.cyan('\nYou can now begin fixing these issues using Framework 5.2 sprint codes.'));
        }
        
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red(`\nError running demo: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// list command - lists test runs
program
  .command('list')
  .description('List test runs')
  .option('-l, --limit <limit>', 'Number of test runs to list', '10')
  .action(async (options) => {
    console.log(chalk.blue('┌─────────────────────────────────┐'));
    console.log(chalk.blue('│      BOUNCE TEST RUNS           │'));
    console.log(chalk.blue('└─────────────────────────────────┘'));
    
    try {
      // Get test runs from database
      const testRuns = await db.query.bounceTestRuns.findMany({
        orderBy: (testRuns, { desc }) => [desc(testRuns.createdAt)],
        limit: parseInt(options.limit)
      });
      
      if (testRuns.length === 0) {
        console.log(chalk.yellow('No test runs found.'));
      } else {
        console.log(chalk.yellow(`Found ${testRuns.length} test runs:`));
        console.log('');
        
        // Display test runs
        testRuns.forEach((testRun) => {
          console.log(chalk.cyan(`ID: ${testRun.id}`));
          console.log(chalk.white(`Name: ${testRun.name}`));
          console.log(chalk.white(`Status: ${testRun.status}`));
          console.log(chalk.white(`Started: ${testRun.startedAt?.toLocaleString() || 'N/A'}`));
          console.log(chalk.white(`Completed: ${testRun.completedAt?.toLocaleString() || 'N/A'}`));
          console.log(chalk.white(`Total Findings: ${testRun.totalFindings || 0}`));
          console.log('');
        });
      }
    } catch (error) {
      console.error(chalk.red(`\nError listing test runs: ${(error as Error).message}`));
    }
  });

// Execute the program
program.parse(process.argv);