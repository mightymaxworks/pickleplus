/**
 * PKL-278651-BOUNCE-0003-SPRINTS
 * Sprint Plan Generator for Bounce Bug Reports
 * 
 * This script generates actionable sprint planning documents from Bounce bug reports.
 * 
 * To run:
 * npx tsx bounce/generate-sprint-plan.ts [report-date]
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { actionItemsGenerator } from './action-items-generator';

// Colors for console output
const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  magenta: (text: string) => `\x1b[35m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`
};

/**
 * Main function
 */
async function main() {
  try {
    console.log(colors.blue('┌─────────────────────────────────┐'));
    console.log(colors.blue('│      BOUNCE SPRINT GENERATOR    │'));
    console.log(colors.blue('└─────────────────────────────────┘'));
    
    // Get report date from command line argument
    const dateArg = process.argv[2];
    console.log(colors.yellow(`Looking for bug reports${dateArg ? ` from ${dateArg}` : ''}...`));
    
    // Find the bug report file
    const reportFile = actionItemsGenerator.findBugReportFile(dateArg);
    
    if (!reportFile) {
      console.error(colors.red('No bug report files found.'));
      console.log(colors.yellow('Please run Bounce tests first to generate bug reports.'));
      process.exit(1);
    }
    
    console.log(colors.green(`Found bug report: ${reportFile}`));
    console.log(colors.yellow('Generating sprint planning document...'));
    
    // Generate the sprint planning document
    const sprintPlanFile = actionItemsGenerator.generateActionItemsFromReport(reportFile);
    
    console.log(colors.green(`Sprint planning document generated successfully: ${sprintPlanFile}`));
    console.log(colors.cyan('Use this document to plan your bug fixing sprint.'));
    
  } catch (error) {
    console.error(colors.red(`Error generating sprint plan: ${(error as Error).message}`));
    process.exit(1);
  }
}

// Entry point
main();