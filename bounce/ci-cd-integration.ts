/**
 * PKL-278651-BOUNCE-0017-CICD - CI/CD Integration
 * 
 * Integrates Bounce testing with CI/CD pipelines
 * Provides functions for automated testing in deployment pipelines
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { runProductionTests } from './production-run';
import { bugReportGenerator } from './reporting';
import { db } from '../server/db';
import { eq, desc, and, lte, gte } from 'drizzle-orm';
import { 
  bounceTestRuns, 
  bounceFindings, 
  BounceFindingSeverity, 
  BounceTestRunStatus 
} from '../shared/schema/bounce';
import fs from 'fs';
import path from 'path';

/**
 * Interface for CI/CD pipeline results
 */
interface CICDResult {
  testRunId: number;
  reportPath: string;
  success: boolean;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  totalCount: number;
  exitCode: number;
}

/**
 * Run tests and determine if CI/CD should proceed
 * @param failOnCritical Whether to fail the build if critical issues are found
 * @param maxHighIssues Maximum number of high issues allowed before failing build
 * @returns CI/CD result object
 */
export async function runCICDTests(
  failOnCritical: boolean = true,
  maxHighIssues: number = 3
): Promise<CICDResult> {
  try {
    console.log('[Bounce CI/CD] Starting automated testing as part of CI/CD pipeline');
    
    // Run production tests
    const testRunId = await runProductionTests();
    
    // Get the findings for this test run
    const findings = await db
      .select()
      .from(bounceFindings)
      .where(eq(bounceFindings.test_run_id, testRunId));
    
    // Count by severity
    const criticalCount = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length;
    const highCount = findings.filter(f => f.severity === BounceFindingSeverity.HIGH).length;
    const moderateCount = findings.filter(f => 
      f.severity === BounceFindingSeverity.MODERATE || 
      f.severity === BounceFindingSeverity.MEDIUM
    ).length;
    const lowCount = findings.filter(f => 
      f.severity === BounceFindingSeverity.LOW || 
      f.severity === BounceFindingSeverity.INFO
    ).length;
    
    // Generate report
    const reportPath = await bugReportGenerator.generateReport(testRunId);
    
    // Generate Summary Report for CI/CD
    const summaryPath = generateCICDSummary(testRunId, findings, criticalCount, highCount, moderateCount, lowCount);
    
    // Determine if CI/CD should fail based on finding severity
    const shouldFail = (failOnCritical && criticalCount > 0) || (highCount > maxHighIssues);
    
    console.log(`[Bounce CI/CD] Test run ${testRunId} complete`);
    console.log(`[Bounce CI/CD] Critical issues: ${criticalCount}`);
    console.log(`[Bounce CI/CD] High issues: ${highCount}`);
    console.log(`[Bounce CI/CD] Moderate issues: ${moderateCount}`);
    console.log(`[Bounce CI/CD] Low issues: ${lowCount}`);
    console.log(`[Bounce CI/CD] Full report: ${reportPath}`);
    console.log(`[Bounce CI/CD] CI/CD summary: ${summaryPath}`);
    console.log(`[Bounce CI/CD] CI/CD result: ${shouldFail ? 'FAIL' : 'PASS'}`);
    
    return {
      testRunId,
      reportPath,
      success: !shouldFail,
      criticalCount,
      highCount,
      moderateCount,
      lowCount,
      totalCount: findings.length,
      exitCode: shouldFail ? 1 : 0
    };
  } catch (error) {
    console.error(`[Bounce CI/CD] Error running CI/CD tests: ${(error as Error).message}`);
    
    return {
      testRunId: -1,
      reportPath: '',
      success: false,
      criticalCount: 0,
      highCount: 0,
      moderateCount: 0,
      lowCount: 0,
      totalCount: 0,
      exitCode: 2 // Error exit code
    };
  }
}

/**
 * Generate a summary report specifically for CI/CD
 * @param testRunId The test run ID
 * @param findings The findings from the test run
 * @param criticalCount Number of critical issues
 * @param highCount Number of high priority issues
 * @param moderateCount Number of moderate issues
 * @param lowCount Number of low priority issues
 * @returns Path to the generated summary file
 */
function generateCICDSummary(
  testRunId: number,
  findings: any[],
  criticalCount: number,
  highCount: number,
  moderateCount: number,
  lowCount: number
): string {
  const dateStr = new Date().toLocaleString();
  let summary = `# Bounce CI/CD Summary - Test Run #${testRunId}\n\n`;
  summary += `Generated on: ${dateStr}\n\n`;
  
  // Add summary section
  summary += `## Summary\n\n`;
  summary += `- **Critical Issues**: ${criticalCount}\n`;
  summary += `- **High Priority Issues**: ${highCount}\n`;
  summary += `- **Moderate Issues**: ${moderateCount}\n`;
  summary += `- **Low Priority Issues**: ${lowCount}\n`;
  summary += `- **Total Issues**: ${findings.length}\n\n`;
  
  // Add CI/CD recommendations
  summary += `## CI/CD Recommendations\n\n`;
  
  if (criticalCount > 0) {
    summary += `⚠️ **FAIL**: ${criticalCount} critical issues found. Fix before deploying.\n\n`;
  } else if (highCount > 3) {
    summary += `⚠️ **WARN**: ${highCount} high priority issues found. Consider fixing before deploying.\n\n`;
  } else if (findings.length > 0) {
    summary += `✅ **PASS**: No critical issues. ${highCount} high priority issues found (within acceptable limits).\n\n`;
  } else {
    summary += `✅ **PASS**: No issues found.\n\n`;
  }
  
  // Create reports directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Write summary to file
  const fileName = `cicd-summary-${testRunId}-${new Date().toISOString().replace(/:/g, '-')}.md`;
  const filePath = path.join(reportsDir, fileName);
  
  fs.writeFileSync(filePath, summary);
  
  return filePath;
}

/**
 * Get test run trend over a time period
 * @param days Number of days to look back
 * @returns Test run trend data
 */
export async function getCICDTrend(days: number = 30): Promise<any> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const testRuns = await db
    .select()
    .from(bounceTestRuns)
    .where(
      and(
        gte(bounceTestRuns.created_at, cutoffDate),
        eq(bounceTestRuns.status, BounceTestRunStatus.COMPLETED)
      )
    )
    .orderBy(desc(bounceTestRuns.created_at));
  
  const trend = {
    totalRuns: testRuns.length,
    findingCounts: [] as any[],
    averageCritical: 0,
    averageHigh: 0
  };
  
  // Get findings counts for each test run
  for (const run of testRuns) {
    const findings = await db
      .select()
      .from(bounceFindings)
      .where(eq(bounceFindings.test_run_id, run.id));
    
    const criticalCount = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length;
    const highCount = findings.filter(f => f.severity === BounceFindingSeverity.HIGH).length;
    
    trend.findingCounts.push({
      runId: run.id,
      date: run.created_at,
      criticalCount,
      highCount,
      totalCount: findings.length
    });
  }
  
  // Calculate averages
  if (trend.findingCounts.length > 0) {
    trend.averageCritical = trend.findingCounts.reduce((sum, item) => sum + item.criticalCount, 0) / trend.findingCounts.length;
    trend.averageHigh = trend.findingCounts.reduce((sum, item) => sum + item.highCount, 0) / trend.findingCounts.length;
  }
  
  return trend;
}

// Direct run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  runCICDTests()
    .then((result) => {
      console.log(`[Bounce CI/CD] Tests completed with result: ${result.success ? 'PASS' : 'FAIL'}`);
      process.exit(result.exitCode);
    })
    .catch((error) => {
      console.error(`[Bounce CI/CD] Error: ${error.message}`);
      process.exit(2);
    });
}