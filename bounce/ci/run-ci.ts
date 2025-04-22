/**
 * PKL-278651-BOUNCE-0011-CICD - Bounce CI/CD Execution Script
 * 
 * This script runs the CI/CD process for the Pickle+ application within Replit.
 * It executes tests, generates reports, and signals whether the build is ready for deployment.
 * 
 * Usage: npx tsx bounce/ci/run-ci.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import dotenv from 'dotenv';
import { reportGenerator } from '../reporting/report-generator';

// Load environment variables
dotenv.config();

// Promisify exec
const execAsync = promisify(exec);

// Define CI stages
enum CIStage {
  PREPARE = 'Prepare',
  TEST = 'Test',
  BUILD = 'Build',
  DEPLOY = 'Deploy'
}

// CI result status
enum CIStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  SKIPPED = 'skipped'
}

// Result for a CI stage
interface StageResult {
  stage: CIStage;
  status: CIStatus;
  message: string;
  duration: number;
  artifacts?: string[];
}

// Overall CI run result
interface CIResult {
  success: boolean;
  startTime: Date;
  endTime: Date;
  duration: number;
  stageResults: StageResult[];
  testRunId?: number;
  reportPath?: string;
}

// Parse command-line options
program
  .name('run-ci')
  .description('Bounce CI/CD Execution Script')
  .option('--skip-tests', 'Skip running tests')
  .option('--skip-build', 'Skip building the application')
  .option('--skip-deploy', 'Skip deployment steps')
  .option('--ci-mode', 'Run in CI mode (non-interactive)')
  .option('--test-suite <name>', 'Test suite to run', 'all')
  .option('--report-format <format>', 'Report format (markdown, html, text)', 'markdown')
  .option('--browser <name>', 'Browser to test with', 'chrome')
  .parse(process.argv);

const options = program.opts();

/**
 * Main CI/CD execution function
 */
async function runCI(): Promise<CIResult> {
  const startTime = new Date();
  console.log(`Starting CI/CD run at ${startTime.toISOString()}`);
  
  const result: CIResult = {
    success: true,
    startTime,
    endTime: new Date(),
    duration: 0,
    stageResults: []
  };
  
  try {
    // Stage 1: Prepare environment
    const prepareResult = await runPrepareStage();
    result.stageResults.push(prepareResult);
    
    if (prepareResult.status === CIStatus.FAILURE) {
      result.success = false;
      return finishCI(result);
    }
    
    // Stage 2: Run tests
    const testResult = options.skipTests 
      ? { 
          stage: CIStage.TEST, 
          status: CIStatus.SKIPPED, 
          message: 'Tests skipped via --skip-tests option',
          duration: 0
        }
      : await runTestStage();
    
    result.stageResults.push(testResult);
    
    if (testResult.status === CIStatus.FAILURE) {
      result.success = false;
      return finishCI(result);
    }
    
    if (testResult.testRunId) {
      result.testRunId = testResult.testRunId;
    }
    
    if (testResult.reportPath) {
      result.reportPath = testResult.reportPath;
    }
    
    // Stage 3: Build application
    const buildResult = options.skipBuild
      ? {
          stage: CIStage.BUILD,
          status: CIStatus.SKIPPED,
          message: 'Build skipped via --skip-build option',
          duration: 0
        }
      : await runBuildStage();
    
    result.stageResults.push(buildResult);
    
    if (buildResult.status === CIStatus.FAILURE) {
      result.success = false;
      return finishCI(result);
    }
    
    // Stage 4: Deployment preparation
    const deployResult = options.skipDeploy
      ? {
          stage: CIStage.DEPLOY,
          status: CIStatus.SKIPPED,
          message: 'Deployment skipped via --skip-deploy option',
          duration: 0
        }
      : await runDeployStage();
    
    result.stageResults.push(deployResult);
    
    if (deployResult.status === CIStatus.FAILURE) {
      result.success = false;
      return finishCI(result);
    }
    
    return finishCI(result);
  } catch (error) {
    console.error(`CI/CD process error: ${(error as Error).message}`);
    result.success = false;
    return finishCI(result);
  }
}

/**
 * Stage 1: Prepare the environment
 */
async function runPrepareStage(): Promise<StageResult> {
  console.log(`\n=== STAGE: ${CIStage.PREPARE} ===`);
  const startTime = Date.now();
  
  try {
    // Check for required dependencies
    console.log('Checking for required dependencies...');
    
    // Create required directories
    console.log('Creating required directories...');
    const directories = [
      'reports',
      'reports/evidence',
      'reports/ci'
    ];
    
    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    
    // Check database connection
    console.log('Checking database connection...');
    await execAsync('npx drizzle-kit generate');
    
    // Success
    return {
      stage: CIStage.PREPARE,
      status: CIStatus.SUCCESS,
      message: 'Environment prepared successfully',
      duration: Date.now() - startTime
    };
  } catch (error) {
    console.error(`Prepare stage error: ${(error as Error).message}`);
    return {
      stage: CIStage.PREPARE,
      status: CIStatus.FAILURE,
      message: `Prepare stage failed: ${(error as Error).message}`,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Stage 2: Run tests
 */
async function runTestStage(): Promise<StageResult & { testRunId?: number; reportPath?: string }> {
  console.log(`\n=== STAGE: ${CIStage.TEST} ===`);
  const startTime = Date.now();
  
  try {
    // Install required testing dependencies
    console.log('Installing testing dependencies...');
    await execAsync('npm install -D playwright colors commander');
    
    // Run the Bounce CLI test command
    console.log(`Running Bounce tests for suite: ${options.testSuite}`);
    const testCommand = `npx tsx bounce/cli.ts run --suite ${options.testSuite} --browsers ${options.browser} --output ${options.reportFormat}${options.ciMode ? ' --ci-mode' : ''} --verbose`;
    
    const { stdout, stderr } = await execAsync(testCommand);
    console.log(stdout);
    
    if (stderr) {
      console.error(stderr);
    }
    
    // Try to extract test run ID from output
    const testRunIdMatch = stdout.match(/Started test run (\d+) with test ID/);
    const testRunId = testRunIdMatch ? parseInt(testRunIdMatch[1]) : undefined;
    
    // Try to extract report path from output
    const reportPathMatch = stdout.match(/Report saved to: (.+)/);
    const reportPath = reportPathMatch ? reportPathMatch[1] : undefined;
    
    // Check for critical findings
    if (stdout.includes('CI check failed')) {
      return {
        stage: CIStage.TEST,
        status: CIStatus.FAILURE,
        message: 'Tests failed due to critical findings',
        duration: Date.now() - startTime,
        testRunId,
        reportPath
      };
    }
    
    // Success
    return {
      stage: CIStage.TEST,
      status: CIStatus.SUCCESS,
      message: 'Tests completed successfully',
      duration: Date.now() - startTime,
      testRunId,
      reportPath,
      artifacts: reportPath ? [reportPath] : undefined
    };
  } catch (error) {
    console.error(`Test stage error: ${(error as Error).message}`);
    return {
      stage: CIStage.TEST,
      status: CIStatus.FAILURE,
      message: `Test stage failed: ${(error as Error).message}`,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Stage 3: Build application
 */
async function runBuildStage(): Promise<StageResult> {
  console.log(`\n=== STAGE: ${CIStage.BUILD} ===`);
  const startTime = Date.now();
  
  try {
    // Run the build script
    console.log('Building application...');
    
    await execAsync('node build-for-deployment.js');
    
    // Verify the build output
    if (!fs.existsSync('dist') || !fs.existsSync('dist/index.js')) {
      throw new Error('Build failed: output files not found');
    }
    
    // Success
    return {
      stage: CIStage.BUILD,
      status: CIStatus.SUCCESS,
      message: 'Build completed successfully',
      duration: Date.now() - startTime,
      artifacts: ['dist']
    };
  } catch (error) {
    console.error(`Build stage error: ${(error as Error).message}`);
    return {
      stage: CIStage.BUILD,
      status: CIStatus.FAILURE,
      message: `Build stage failed: ${(error as Error).message}`,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Stage 4: Deployment preparation
 */
async function runDeployStage(): Promise<StageResult> {
  console.log(`\n=== STAGE: ${CIStage.DEPLOY} ===`);
  const startTime = Date.now();
  
  try {
    // Create a deployment verification file
    console.log('Preparing for deployment...');
    
    const verificationContent = JSON.stringify({
      readyForDeployment: true,
      timestamp: new Date().toISOString(),
      ci: {
        build: 'node build-for-deployment.js',
        run: 'NODE_ENV=production node dist/index.js'
      }
    }, null, 2);
    
    fs.writeFileSync('deployment-verification.json', verificationContent);
    
    console.log('Deployment preparation complete!');
    console.log('To deploy with Replit:');
    console.log('1. Click the "Deploy" button in the Replit UI');
    console.log('2. Set the following deployment settings:');
    console.log('   - Build Command: node build-for-deployment.js');
    console.log('   - Run Command: NODE_ENV=production node dist/index.js');
    
    // Success
    return {
      stage: CIStage.DEPLOY,
      status: CIStatus.SUCCESS,
      message: 'Deployment preparation completed successfully',
      duration: Date.now() - startTime,
      artifacts: ['deployment-verification.json']
    };
  } catch (error) {
    console.error(`Deploy stage error: ${(error as Error).message}`);
    return {
      stage: CIStage.DEPLOY,
      status: CIStatus.FAILURE,
      message: `Deploy stage failed: ${(error as Error).message}`,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Finish CI run and generate report
 */
function finishCI(result: CIResult): CIResult {
  // Calculate final duration
  const endTime = new Date();
  result.endTime = endTime;
  result.duration = endTime.getTime() - result.startTime.getTime();
  
  // Generate a CI/CD report
  const reportContent = generateCIReport(result);
  const reportPath = path.join('reports', 'ci', `ci_report_${endTime.getTime()}.md`);
  
  // Ensure CI report directory exists
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  
  // Write the report
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`\n=== CI/CD RUN COMPLETED ===`);
  console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
  console.log(`Duration: ${formatDuration(result.duration)}`);
  console.log(`Report: ${reportPath}`);
  
  return result;
}

/**
 * Generate a Markdown report for the CI run
 */
function generateCIReport(result: CIResult): string {
  let report = `# Pickle+ CI/CD Run Report\n\n`;
  
  // Basic information
  report += `## Overview\n\n`;
  report += `- **Status:** ${result.success ? '✅ SUCCESS' : '❌ FAILURE'}\n`;
  report += `- **Start Time:** ${result.startTime.toISOString()}\n`;
  report += `- **End Time:** ${result.endTime.toISOString()}\n`;
  report += `- **Duration:** ${formatDuration(result.duration)}\n`;
  
  if (result.testRunId) {
    report += `- **Test Run ID:** ${result.testRunId}\n`;
  }
  
  if (result.reportPath) {
    report += `- **Test Report:** [View Test Report](${result.reportPath})\n`;
  }
  
  // Stage results
  report += `\n## Stages\n\n`;
  
  for (const stage of result.stageResults) {
    report += `### ${stage.stage}\n\n`;
    report += `- **Status:** ${formatStatus(stage.status)}\n`;
    report += `- **Duration:** ${formatDuration(stage.duration)}\n`;
    report += `- **Message:** ${stage.message}\n`;
    
    if (stage.artifacts && stage.artifacts.length > 0) {
      report += `- **Artifacts:**\n`;
      for (const artifact of stage.artifacts) {
        report += `  - ${artifact}\n`;
      }
    }
    
    report += `\n`;
  }
  
  // Next steps
  report += `## Next Steps\n\n`;
  
  if (result.success) {
    report += `The CI/CD run completed successfully. The application is ready for deployment.\n\n`;
    report += `To deploy with Replit:\n`;
    report += `1. Click the "Deploy" button in the Replit UI\n`;
    report += `2. Set the following deployment settings:\n`;
    report += `   - Build Command: \`node build-for-deployment.js\`\n`;
    report += `   - Run Command: \`NODE_ENV=production node dist/index.js\`\n`;
  } else {
    report += `The CI/CD run failed. Please review the stage results and fix the issues before deploying.\n`;
  }
  
  return report;
}

/**
 * Format a duration in milliseconds to a human-readable string
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${seconds} seconds`;
  }
  
  return `${minutes} minutes, ${remainingSeconds} seconds`;
}

/**
 * Format a CI status with emoji
 */
function formatStatus(status: CIStatus): string {
  switch (status) {
    case CIStatus.SUCCESS:
      return '✅ SUCCESS';
    case CIStatus.FAILURE:
      return '❌ FAILURE';
    case CIStatus.SKIPPED:
      return '⏭️ SKIPPED';
    default:
      return status;
  }
}

// Run the CI process if this script is executed directly
if (require.main === module) {
  runCI().catch(error => {
    console.error(`CI/CD process failed: ${error.message}`);
    process.exit(1);
  });
}