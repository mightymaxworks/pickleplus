/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System Bug Report Generator
 * 
 * This module generates formatted bug reports with solution prompts
 * to help developers fix issues quickly.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { db } from "../../server/db";
import { 
  bounceTestRuns, 
  bounceFindings, 
  bounceEvidence,
  BounceFindingSeverity,
  BounceFindingStatus,
} from "../../shared/schema/bounce";
import { eq, and, desc, or } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

/**
 * Options for generating a bug report
 */
interface BugReportOptions {
  /**
   * Whether to include detailed evidence in the report
   */
  includeEvidence?: boolean;
  
  /**
   * Whether to group findings by area
   */
  groupByArea?: boolean;
  
  /**
   * Whether to sort findings by severity (highest first)
   */
  sortBySeverity?: boolean;
  
  /**
   * Whether to include solution prompts for each finding
   */
  includeSolutionPrompts?: boolean;
}

/**
 * Default bug report options
 */
const DEFAULT_BUG_REPORT_OPTIONS: BugReportOptions = {
  includeEvidence: true,
  groupByArea: true,
  sortBySeverity: true,
  includeSolutionPrompts: true,
};

/**
 * Test run summary for a report
 */
interface TestRunSummary {
  id: number;
  name: string;
  description: string | null;
  status: string;
  startTime: Date | null;
  endTime: Date | null;
  browsers: string;
  testTypes: string;
  coverage: number | null;
  totalIssues: number;
  totalCritical: number;
  totalHigh: number;
  totalModerate: number;
  totalLow: number;
  totalInfo: number;
}

/**
 * Finding with evidence for a report
 */
interface FindingWithEvidence {
  id: number;
  title: string;
  description: string;
  severity: string;
  area: string;
  path: string | null;
  browser: string | null;
  device: string | null;
  screenSize: string | null;
  status: string;
  createdAt: Date | null;
  evidence: {
    id: number;
    type: string;
    content: string;
    description: string | null;
  }[];
}

/**
 * Generates structured bug reports from Bounce test findings
 * with enhanced features like solution prompts
 */
export class BugReportGenerator {
  /**
   * Generate a bug report for a specific test run
   * @param testRunId The ID of the test run
   * @param options Bug report generation options
   * @returns The generated bug report as a string
   */
  async generateBugReport(
    testRunId: number,
    options: BugReportOptions = {}
  ): Promise<string> {
    const mergedOptions = { ...DEFAULT_BUG_REPORT_OPTIONS, ...options };
    
    try {
      // Get the test run data
      const testRunData = await this.getTestRunData(testRunId);
      if (!testRunData) {
        throw new Error(`Test run with ID ${testRunId} not found`);
      }
      
      // Get the findings with evidence
      const findings = await this.getFindingsWithEvidence(testRunId);
      
      // Generate the bug report
      return this.generateBugListReport(testRunData, findings, mergedOptions);
    } catch (error) {
      console.error(`[Bounce] Failed to generate bug report: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Get test run data with issue counts
   * @param testRunId The ID of the test run
   * @returns The test run summary
   */
  private async getTestRunData(testRunId: number): Promise<TestRunSummary | null> {
    const testRun = await db.select().from(bounceTestRuns).where(eq(bounceTestRuns.id, testRunId)).limit(1);
    
    if (testRun.length === 0) {
      return null;
    }
    
    // Count findings by severity
    const criticalFindings = await db.select({ count: db.count() })
      .from(bounceFindings)
      .where(and(
        eq(bounceFindings.testRunId, testRunId),
        eq(bounceFindings.severity, BounceFindingSeverity.CRITICAL)
      ));
    
    const highFindings = await db.select({ count: db.count() })
      .from(bounceFindings)
      .where(and(
        eq(bounceFindings.testRunId, testRunId),
        eq(bounceFindings.severity, BounceFindingSeverity.HIGH)
      ));
    
    // Check both MODERATE and MEDIUM for backward compatibility
    const moderateFindings = await db.select({ count: db.count() })
      .from(bounceFindings)
      .where(and(
        eq(bounceFindings.testRunId, testRunId),
        or(
          eq(bounceFindings.severity, BounceFindingSeverity.MODERATE),
          eq(bounceFindings.severity, BounceFindingSeverity.MEDIUM)
        )
      ));
    
    const lowFindings = await db.select({ count: db.count() })
      .from(bounceFindings)
      .where(and(
        eq(bounceFindings.testRunId, testRunId),
        eq(bounceFindings.severity, BounceFindingSeverity.LOW)
      ));
    
    const infoFindings = await db.select({ count: db.count() })
      .from(bounceFindings)
      .where(and(
        eq(bounceFindings.testRunId, testRunId),
        eq(bounceFindings.severity, BounceFindingSeverity.INFO)
      ));
    
    const totalFindings = await db.select({ count: db.count() })
      .from(bounceFindings)
      .where(eq(bounceFindings.testRunId, testRunId));
    
    // Map database schema to report schema
    return {
      id: testRun[0].id,
      name: testRun[0].name,
      description: testRun[0].description,
      status: testRun[0].status,
      startTime: testRun[0].startedAt,
      endTime: testRun[0].completedAt,
      browsers: testRun[0].targetUrl || "Unknown", // Using targetUrl for browsers info
      testTypes: "Default", // Not stored in current schema
      coverage: null, // Not stored in current schema
      totalIssues: Number(totalFindings[0].count) || 0,
      totalCritical: Number(criticalFindings[0].count) || 0,
      totalHigh: Number(highFindings[0].count) || 0,
      totalModerate: Number(moderateFindings[0].count) || 0,
      totalLow: Number(lowFindings[0].count) || 0,
      totalInfo: Number(infoFindings[0].count) || 0,
    };
  }
  
  /**
   * Get findings with their associated evidence
   * @param testRunId The ID of the test run
   * @returns Array of findings with evidence
   */
  private async getFindingsWithEvidence(testRunId: number): Promise<FindingWithEvidence[]> {
    const findings = await db.select()
      .from(bounceFindings)
      .where(eq(bounceFindings.testRunId, testRunId))
      .orderBy(desc(bounceFindings.createdAt));
    
    const result: FindingWithEvidence[] = [];
    
    for (const finding of findings) {
      const evidence = await db.select()
        .from(bounceEvidence)
        .where(eq(bounceEvidence.findingId, finding.id));
      
      // Extract browser info
      let browser = "Unknown";
      let device = null;
      let screenSize = null;
      
      if (finding.browserInfo) {
        const browserInfo = finding.browserInfo as any;
        browser = browserInfo.name || "Unknown";
        device = browserInfo.device || null;
        screenSize = browserInfo.screenSize || null;
      }
      
      // Extract area from affected URL or first part of title
      const area = finding.affectedUrl || 
                  (finding.title.includes(' - ') ? 
                   finding.title.split(' - ')[0] : 
                   'General');
      
      result.push({
        id: finding.id,
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        area: area,
        path: finding.affectedUrl,
        browser,
        device,
        screenSize,
        status: finding.status,
        createdAt: finding.createdAt,
        evidence,
      });
    }
    
    return result;
  }

  /**
   * Generate a Bug List report with solution prompts
   * @param testRun The test run summary
   * @param findings The findings with evidence
   * @param options Report options
   * @returns Bug list with solution prompts
   */
  private generateBugListReport(
    testRun: TestRunSummary,
    findings: FindingWithEvidence[],
    options: BugReportOptions
  ): string {
    // Sort findings if needed
    if (options.sortBySeverity) {
      findings.sort((a, b) => {
        const severityOrder = {
          [BounceFindingSeverity.CRITICAL]: 0,
          [BounceFindingSeverity.HIGH]: 1,
          [BounceFindingSeverity.MODERATE]: 2,
          [BounceFindingSeverity.MEDIUM]: 2, // Treat medium same as moderate
          [BounceFindingSeverity.LOW]: 3,
          [BounceFindingSeverity.INFO]: 4,
        };
        return (severityOrder[a.severity as BounceFindingSeverity] || 5) - 
               (severityOrder[b.severity as BounceFindingSeverity] || 5);
      });
    }
    
    // Build the report
    let report = `# Pickle+ Bug Report\n\n`;
    report += `Generated by Bounce Testing System on ${new Date().toLocaleString()}\n\n`;
    
    // Issues summary
    report += `## Summary\n\n`;
    report += `This report contains ${findings.length} issues detected during automated testing:\n\n`;
    report += `- Critical Issues: ${testRun.totalCritical}\n`;
    report += `- High Issues: ${testRun.totalHigh}\n`;
    report += `- Moderate Issues: ${testRun.totalModerate}\n`;
    report += `- Low Issues: ${testRun.totalLow}\n`;
    report += `- Info Issues: ${testRun.totalInfo}\n\n`;
    
    // Group findings by area if needed
    if (options.groupByArea) {
      const groupedFindings: Record<string, FindingWithEvidence[]> = {};
      
      findings.forEach(finding => {
        if (!groupedFindings[finding.area]) {
          groupedFindings[finding.area] = [];
        }
        groupedFindings[finding.area].push(finding);
      });
      
      // Bug list with solution prompts by area
      report += `## Bug List\n\n`;
      
      for (const area in groupedFindings) {
        report += `### Area: ${area}\n\n`;
        
        groupedFindings[area].forEach((finding, index) => {
          const bugNumber = index + 1;
          report += `#### Bug #${bugNumber}: ${finding.title}\n\n`;
          
          // Severity and location
          report += `**Severity:** ${this.getSeverityLabel(finding.severity as BounceFindingSeverity)}\n`;
          report += `**Location:** ${finding.area}${finding.path ? ` (${finding.path})` : ''}\n`;
          report += `**Browser:** ${finding.browser || 'Unknown'}${finding.device ? ` on ${finding.device}` : ''}\n\n`;
          
          // Description
          report += `**Description:**\n${finding.description}\n\n`;
          
          // Evidence summary
          if (options.includeEvidence && finding.evidence.length > 0) {
            report += `**Evidence:**\n`;
            finding.evidence.forEach(item => {
              report += `- ${item.type}${item.description ? `: ${item.description}` : ''}\n`;
            });
            report += `\n`;
          }
          
          // Solution prompt
          if (options.includeSolutionPrompts) {
            report += `**Solution Prompt:**\n\n`;
            report += this.generateSolutionPrompt(finding) + `\n\n`;
          }
          
          report += `---\n\n`;
        });
      }
    } else {
      // Bug list with solution prompts without grouping
      report += `## Bug List\n\n`;
      
      findings.forEach((finding, index) => {
        const bugNumber = index + 1;
        report += `### Bug #${bugNumber}: ${finding.title}\n\n`;
        
        // Severity and location
        report += `**Severity:** ${this.getSeverityLabel(finding.severity as BounceFindingSeverity)}\n`;
        report += `**Location:** ${finding.area}${finding.path ? ` (${finding.path})` : ''}\n`;
        report += `**Browser:** ${finding.browser || 'Unknown'}${finding.device ? ` on ${finding.device}` : ''}\n\n`;
        
        // Description
        report += `**Description:**\n${finding.description}\n\n`;
        
        // Evidence summary
        if (options.includeEvidence && finding.evidence.length > 0) {
          report += `**Evidence:**\n`;
          finding.evidence.forEach(item => {
            report += `- ${item.type}${item.description ? `: ${item.description}` : ''}\n`;
          });
          report += `\n`;
        }
        
        // Solution prompt
        if (options.includeSolutionPrompts) {
          report += `**Solution Prompt:**\n\n`;
          report += this.generateSolutionPrompt(finding) + `\n\n`;
        }
        
        report += `---\n\n`;
      });
    }
    
    // Footer
    report += `## Next Steps\n\n`;
    report += `1. Review each bug and its solution prompt\n`;
    report += `2. Implement fixes starting with critical issues first\n`;
    report += `3. Re-run Bounce tests to verify fixes\n`;
    report += `4. Update documentation as needed\n\n`;
    
    return report;
  }
  
  /**
   * Generate a solution prompt for a finding
   * @param finding The finding with evidence
   * @returns A solution prompt for the finding
   */
  private generateSolutionPrompt(finding: FindingWithEvidence): string {
    const severity = finding.severity as BounceFindingSeverity;
    const area = finding.area;
    const path = finding.path || '';
    
    let prompt = `Fix the following issue in the ${area} area`;
    if (path) {
      prompt += ` at path ${path}`;
    }
    prompt += `:\n\n`;
    prompt += `${finding.description}\n\n`;
    
    // Add context-specific guidance based on the type of issue
    if (finding.description.toLowerCase().includes('not found') || 
        finding.description.toLowerCase().includes('404')) {
      prompt += `This appears to be a resource not found issue. Check for:\n`;
      prompt += `- Incorrect path or URL\n`;
      prompt += `- Missing file or resource\n`;
      prompt += `- Route configuration issues\n`;
      prompt += `- API endpoint availability\n`;
    } 
    else if (finding.description.toLowerCase().includes('layout') || 
             finding.description.toLowerCase().includes('responsive') ||
             finding.description.toLowerCase().includes('display')) {
      prompt += `This appears to be a layout or display issue. Check for:\n`;
      prompt += `- CSS styling problems\n`;
      prompt += `- Responsive design breakpoints\n`;
      prompt += `- Element positioning or overflow\n`;
      prompt += `- Browser-specific rendering differences\n`;
    }
    else if (finding.description.toLowerCase().includes('data') || 
             finding.description.toLowerCase().includes('loading') ||
             finding.description.toLowerCase().includes('api')) {
      prompt += `This appears to be a data loading or API issue. Check for:\n`;
      prompt += `- API endpoint correctness\n`;
      prompt += `- Data fetching logic\n`;
      prompt += `- Error handling for data loading\n`;
      prompt += `- State management during loading\n`;
    }
    else if (finding.description.toLowerCase().includes('button') || 
             finding.description.toLowerCase().includes('click') ||
             finding.description.toLowerCase().includes('action')) {
      prompt += `This appears to be an interaction issue. Check for:\n`;
      prompt += `- Event handler implementation\n`;
      prompt += `- Button or interactive element state\n`;
      prompt += `- Action dispatch or callback execution\n`;
      prompt += `- Conditional rendering of interactive elements\n`;
    }
    else {
      // Generic prompts based on severity
      if (severity === BounceFindingSeverity.CRITICAL) {
        prompt += `This is a critical issue that should be addressed immediately. Consider:\n`;
        prompt += `- Looking for recent code changes in this area\n`;
        prompt += `- Checking error logs and stack traces\n`;
        prompt += `- Adding additional logging to pinpoint the issue\n`;
        prompt += `- Verifying dependencies and external services\n`;
      } 
      else if (severity === BounceFindingSeverity.HIGH) {
        prompt += `This is a high-severity issue that significantly impacts functionality. Consider:\n`;
        prompt += `- Reviewing the core business logic in this area\n`;
        prompt += `- Checking for edge cases in data processing\n`;
        prompt += `- Looking for race conditions or timing issues\n`;
        prompt += `- Ensuring proper error boundaries and fallbacks\n`;
      }
      else if (severity === BounceFindingSeverity.MODERATE || severity === BounceFindingSeverity.MEDIUM) {
        prompt += `This is a moderate issue that affects functionality. Consider:\n`;
        prompt += `- Reviewing the business logic and user flow\n`;
        prompt += `- Adding validation or error handling\n`;
        prompt += `- Checking related components and dependencies\n`;
        prompt += `- Improving UX feedback for error states\n`;
      }
      else if (severity === BounceFindingSeverity.LOW) {
        prompt += `This is a low-severity issue that should be addressed when possible. Consider:\n`;
        prompt += `- Improving code quality or performance\n`;
        prompt += `- Enhancing visual design or accessibility\n`;
        prompt += `- Adding additional test coverage\n`;
        prompt += `- Updating documentation\n`;
      }
      else {
        prompt += `This is an informational issue. Consider:\n`;
        prompt += `- Documenting this behavior for future reference\n`;
        prompt += `- Evaluating if this represents a potential future issue\n`;
        prompt += `- Considering UX improvements in this area\n`;
        prompt += `- Adding monitoring or logging for this scenario\n`;
      }
    }
    
    // Add testing guidance
    prompt += `\nAfter fixing, verify the solution by:\n`;
    prompt += `1. Running focused Bounce tests on this specific area\n`;
    prompt += `2. Testing across multiple browsers ${finding.browser ? `(${finding.browser} specifically)` : ''}\n`;
    prompt += `3. Verifying no regression in related functionality\n`;
    
    return prompt;
  }
  
  /**
   * Get a human-readable severity label with emoji
   * @param severity The finding severity
   * @returns Human-readable severity label
   */
  private getSeverityLabel(severity: BounceFindingSeverity): string {
    switch (severity) {
      case BounceFindingSeverity.CRITICAL:
        return `🔴 Critical`;
      case BounceFindingSeverity.HIGH:
        return `🟠 High`;
      case BounceFindingSeverity.MODERATE:
      case BounceFindingSeverity.MEDIUM:
        return `🟡 Moderate`;
      case BounceFindingSeverity.LOW:
        return `🟢 Low`;
      case BounceFindingSeverity.INFO:
        return `🔵 Info`;
      default:
        return severity;
    }
  }
  
  /**
   * Save a report to a file
   * @param reportContent The report content
   * @param outputPath Optional custom output path
   * @returns The full path to the saved report
   */
  saveReportToFile(
    reportContent: string,
    outputPath?: string
  ): string {
    const filename = `bounce_buglist_${Date.now()}.md`;
    const reportPath = outputPath || path.join("./reports", filename);
    
    // Ensure the directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the report to file
    fs.writeFileSync(reportPath, reportContent, "utf8");
    
    console.log(`[Bounce] Bug report saved to: ${reportPath}`);
    return reportPath;
  }
}

// Export a singleton instance for use throughout the application
export const bugReportGenerator = new BugReportGenerator();