/**
 * PKL-278651-BOUNCE-0002-CICD
 * CI/CD Integration Module
 * 
 * This module enables Bounce integration with CI/CD pipelines:
 * 1. Automated test execution in CI environments
 * 2. Severity-based build pass/fail decisions
 * 3. Generation of deployment recommendations
 * 4. GitHub workflow integration
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

import { BugReport, BugFinding, SeverityLevel, TestRun } from './types';
import { formatDuration } from './utils/date-utils';
import { generateBugReportWithPrompts, formatBugReportAsMarkdown } from './reporting/bug-report-generator-with-prompts';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration options for CI/CD integration
 */
interface CICDConfig {
  // Base thresholds for build failure
  failOnCritical: boolean;
  failOnHighCount: number; // Fail if high-severity issues >= this number
  failOnTotalCount: number; // Fail if total issues >= this number
  
  // Report output options
  outputPath: string;
  generateSummary: boolean;
  includeFixPrompts: boolean;
  
  // GitHub options
  createGitHubIssues: boolean;
  githubToken?: string;
  githubRepo?: string;
}

/**
 * Default CI/CD configuration
 */
const defaultCICDConfig: CICDConfig = {
  failOnCritical: true,
  failOnHighCount: 3,
  failOnTotalCount: 10,
  outputPath: './reports',
  generateSummary: true,
  includeFixPrompts: true,
  createGitHubIssues: false
};

/**
 * CI/CD build result
 */
interface CICDBuildResult {
  status: 'pass' | 'fail';
  message: string;
  reportPath: string;
  statistics: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Evaluate test results and determine build pass/fail status
 */
export function evaluateBuildStatus(
  findings: BugFinding[],
  config: Partial<CICDConfig> = {}
): { status: 'pass' | 'fail'; message: string } {
  // Merge with default config
  const fullConfig = { ...defaultCICDConfig, ...config };
  
  // Count issues by severity
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const totalCount = findings.length;
  
  // Check against thresholds
  if (fullConfig.failOnCritical && criticalCount > 0) {
    return {
      status: 'fail',
      message: `Build failed: Found ${criticalCount} critical issue${criticalCount > 1 ? 's' : ''}`
    };
  }
  
  if (highCount >= fullConfig.failOnHighCount) {
    return {
      status: 'fail',
      message: `Build failed: Found ${highCount} high-severity issues (threshold: ${fullConfig.failOnHighCount})`
    };
  }
  
  if (totalCount >= fullConfig.failOnTotalCount) {
    return {
      status: 'fail',
      message: `Build failed: Found ${totalCount} total issues (threshold: ${fullConfig.failOnTotalCount})`
    };
  }
  
  // If all checks pass
  return {
    status: 'pass',
    message: `Build passed with ${totalCount} non-critical issues`
  };
}

/**
 * Process test results and generate CI/CD output
 */
export async function processCICDResults(
  testRun: TestRun,
  findings: BugFinding[],
  config: Partial<CICDConfig> = {}
): Promise<CICDBuildResult> {
  // Merge with default config
  const fullConfig = { ...defaultCICDConfig, ...config };
  
  // Generate bug report
  const report = generateBugReportWithPrompts(testRun, findings);
  
  // Determine build status
  const buildStatus = evaluateBuildStatus(findings, config);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(fullConfig.outputPath)) {
    fs.mkdirSync(fullConfig.outputPath, { recursive: true });
  }
  
  // Generate report files
  const reportFilename = `bounce-report-${testRun.id}.md`;
  const reportPath = path.join(fullConfig.outputPath, reportFilename);
  
  // Save the report
  const markdownReport = formatBugReportAsMarkdown(report);
  fs.writeFileSync(reportPath, markdownReport);
  
  // Generate summary file if requested
  if (fullConfig.generateSummary) {
    const summaryPath = path.join(fullConfig.outputPath, `bounce-summary-${testRun.id}.txt`);
    const summaryContent = generateCICDSummary(report, buildStatus, testRun);
    fs.writeFileSync(summaryPath, summaryContent);
  }
  
  // Create GitHub issues if configured
  if (fullConfig.createGitHubIssues && fullConfig.githubToken && fullConfig.githubRepo) {
    await createGitHubIssuesFromFindings(findings, fullConfig.githubToken, fullConfig.githubRepo);
  }
  
  // Return build result
  return {
    status: buildStatus.status as 'pass' | 'fail',
    message: buildStatus.message,
    reportPath,
    statistics: {
      total: findings.length,
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length
    }
  };
}

/**
 * Generate a CI/CD summary report
 */
function generateCICDSummary(
  report: BugReport,
  buildStatus: { status: string; message: string },
  testRun: TestRun
): string {
  const { statistics } = report;
  const duration = formatDuration(testRun.startTime, testRun.endTime);
  
  let summary = `# Bounce CI/CD Test Results\n\n`;
  summary += `## Build Status: ${buildStatus.status.toUpperCase()}\n\n`;
  summary += `${buildStatus.message}\n\n`;
  
  summary += `## Test Run Information\n\n`;
  summary += `- **Run ID:** ${testRun.id}\n`;
  summary += `- **Name:** ${testRun.name}\n`;
  summary += `- **Duration:** ${duration}\n`;
  summary += `- **Environment:** ${testRun.environment || 'Not specified'}\n\n`;
  
  summary += `## Issue Statistics\n\n`;
  summary += `- **Critical Issues:** ${statistics.critical}\n`;
  summary += `- **High-Severity Issues:** ${statistics.high}\n`;
  summary += `- **Medium-Severity Issues:** ${statistics.medium}\n`;
  summary += `- **Low-Severity Issues:** ${statistics.low}\n`;
  summary += `- **Total Issues:** ${statistics.total}\n\n`;
  
  if (report.findings.length > 0) {
    summary += `## Critical & High-Severity Issues\n\n`;
    
    const importantFindings = report.findings.filter(f => ['critical', 'high'].includes(f.severity));
    
    if (importantFindings.length === 0) {
      summary += `No critical or high-severity issues found.\n\n`;
    } else {
      importantFindings.forEach((finding, index) => {
        summary += `### ${index + 1}. ${finding.title} (${finding.id})\n\n`;
        summary += `**Severity:** ${finding.severity.toUpperCase()}\n\n`;
        summary += `**Description:** ${finding.description}\n\n`;
        
        if (finding.steps) {
          summary += `**Steps to Reproduce:** ${finding.steps.join(' → ')}\n\n`;
        }
        
        summary += `---\n\n`;
      });
    }
  }
  
  summary += `## Deployment Recommendation\n\n`;
  
  if (buildStatus.status === 'fail') {
    summary += `⛔ **DO NOT DEPLOY** - Critical issues must be fixed before deployment.\n`;
  } else if (statistics.high > 0) {
    summary += `⚠️ **USE CAUTION WHEN DEPLOYING** - Non-critical issues should be addressed soon.\n`;
  } else {
    summary += `✅ **SAFE TO DEPLOY** - No critical issues detected.\n`;
  }
  
  return summary;
}

/**
 * Create GitHub issues from test findings
 */
async function createGitHubIssuesFromFindings(
  findings: BugFinding[],
  githubToken: string,
  repo: string
): Promise<void> {
  // This is a placeholder function for GitHub API integration
  // In a real implementation, this would use the GitHub API to create issues
  console.log(`Would create ${findings.length} GitHub issues for ${repo}`);
  
  // Sample implementation would look like:
  /*
  for (const finding of findings) {
    const issueTitle = `[${finding.id}] ${finding.title}`;
    
    let issueBody = `## Description\n\n${finding.description}\n\n`;
    
    if (finding.steps) {
      issueBody += `## Steps to Reproduce\n\n`;
      finding.steps.forEach((step, index) => {
        issueBody += `${index + 1}. ${step}\n`;
      });
      issueBody += '\n';
    }
    
    if (finding.expectedResult) {
      issueBody += `## Expected Result\n\n${finding.expectedResult}\n\n`;
    }
    
    if (finding.actualResult) {
      issueBody += `## Actual Result\n\n${finding.actualResult}\n\n`;
    }
    
    if (finding.fixPrompt) {
      issueBody += `## Fix Recommendation\n\n${finding.fixPrompt}\n\n`;
    }
    
    // Create the GitHub issue using Octokit or similar library
    // This would require additional dependencies
  }
  */
}

/**
 * Generate a GitHub Actions workflow file
 */
export function generateGitHubWorkflow(
  outputPath: string = '.github/workflows/bounce-cicd.yml'
): void {
  const workflowDir = path.dirname(outputPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(workflowDir)) {
    fs.mkdirSync(workflowDir, { recursive: true });
  }
  
  const workflowContent = `# PKL-278651-BOUNCE-0002-CICD
# Bounce Testing GitHub Actions Workflow
#
# This workflow runs the Bounce testing suite for Pickle+
# and reports test results with deployment recommendations.
#
# @framework Framework5.2
# @version 1.0.0
# @lastModified 2025-04-23

name: Bounce CI/CD Testing

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]
  workflow_dispatch:

jobs:
  bounce-tests:
    name: Run Bounce Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chrome
      
      - name: Start server in background
        run: npm run dev &
        env:
          NODE_ENV: test
      
      - name: Wait for server to start
        run: npx wait-on http://localhost:3000 -t 60000
      
      - name: Run Bounce tests
        run: npx tsx run-with-fix-prompts.ts
        env:
          CI: true
      
      - name: Upload test reports
        uses: actions/upload-artifact@v3
        with:
          name: bounce-reports
          path: reports/
          if-no-files-found: error
      
      - name: Check for critical issues
        id: check-issues
        run: |
          if grep -q "BUILD STATUS: FAIL" reports/bounce-summary-*.txt; then
            echo "::set-output name=has_critical::true"
            echo "⛔ Critical issues detected. See test reports for details."
            exit 1
          else
            echo "::set-output name=has_critical::false"
            echo "✅ No critical issues detected."
          fi
`;

  fs.writeFileSync(outputPath, workflowContent);
  console.log(`Generated GitHub Actions workflow at ${outputPath}`);
}