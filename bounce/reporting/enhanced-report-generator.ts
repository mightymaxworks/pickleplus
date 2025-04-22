/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System Enhanced Report Generator
 * 
 * This module generates formatted reports from test findings including bug reports 
 * and solution prompts for easier debugging and resolution.
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
  BounceEvidenceType
} from "../../shared/schema";
import { eq, and, desc } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

/**
 * Options for generating a report
 */
interface ReportOptions {
  /**
   * Whether to include detailed evidence in the report
   */
  includeEvidence?: boolean;
  
  /**
   * The format of the report (markdown, html, text)
   */
  format?: "markdown" | "html" | "text" | "buglist";
  
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
 * Default report options
 */
const DEFAULT_REPORT_OPTIONS: ReportOptions = {
  includeEvidence: true,
  format: "markdown",
  groupByArea: true,
  sortBySeverity: true,
  includeSolutionPrompts: true,
};

/**
 * Test run summary for a report
 */
interface TestRunSummary {
  id: number;
  testId: string;
  startTime: Date;
  endTime: Date | null;
  browsers: string;
  testTypes: string;
  coverage: number | null;
  status: string;
  totalIssues: number;
  totalCritical: number;
  totalModerate: number;
  totalLow: number;
}

/**
 * Finding with evidence for a report
 */
interface FindingWithEvidence {
  id: number;
  findingId: string;
  description: string;
  severity: string;
  area: string;
  path: string | null;
  browser: string;
  device: string | null;
  screenSize: string | null;
  status: string;
  createdAt: Date;
  evidence: {
    id: number;
    evidenceType: string;
    filePath: string;
    description: string | null;
  }[];
}

/**
 * Generates structured reports from Bounce test findings
 * with enhanced features like solution prompts
 */
export class EnhancedReportGenerator {
  /**
   * Generate a report for a specific test run
   * @param testRunId The ID of the test run
   * @param options Report generation options
   * @returns The generated report as a string
   */
  async generateTestRunReport(
    testRunId: number,
    options: ReportOptions = {}
  ): Promise<string> {
    const mergedOptions = { ...DEFAULT_REPORT_OPTIONS, ...options };
    
    try {
      // Get the test run data
      const testRunData = await this.getTestRunData(testRunId);
      if (!testRunData) {
        throw new Error(`Test run with ID ${testRunId} not found`);
      }
      
      // Get the findings with evidence
      const findings = await this.getFindingsWithEvidence(testRunId);
      
      // Generate the report based on the format
      switch (mergedOptions.format) {
        case "buglist":
          return this.generateBugListReport(testRunData, findings, mergedOptions);
        case "markdown":
          return this.generateMarkdownReport(testRunData, findings, mergedOptions);
        case "html":
          return this.generateHtmlReport(testRunData, findings, mergedOptions);
        case "text":
        default:
          return this.generateTextReport(testRunData, findings, mergedOptions);
      }
    } catch (error) {
      console.error(`[Bounce] Failed to generate report: ${(error as Error).message}`);
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
    const criticalFindings = await db.select({ count: db.fn.count() })
      .from(bounceFindings)
      .where(and(
        eq(bounceFindings.testRunId, testRunId),
        eq(bounceFindings.severity, BounceFindingSeverity.CRITICAL)
      ));
    
    const moderateFindings = await db.select({ count: db.fn.count() })
      .from(bounceFindings)
      .where(and(
        eq(bounceFindings.testRunId, testRunId),
        eq(bounceFindings.severity, BounceFindingSeverity.MODERATE)
      ));
    
    const lowFindings = await db.select({ count: db.fn.count() })
      .from(bounceFindings)
      .where(and(
        eq(bounceFindings.testRunId, testRunId),
        eq(bounceFindings.severity, BounceFindingSeverity.LOW)
      ));
    
    return {
      ...testRun[0],
      totalCritical: parseInt(criticalFindings[0].count.toString()),
      totalModerate: parseInt(moderateFindings[0].count.toString()),
      totalLow: parseInt(lowFindings[0].count.toString()),
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
      
      result.push({
        ...finding,
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
    options: ReportOptions
  ): string {
    // Sort findings if needed
    if (options.sortBySeverity) {
      findings.sort((a, b) => {
        const severityOrder = {
          [BounceFindingSeverity.CRITICAL]: 0,
          [BounceFindingSeverity.MODERATE]: 1,
          [BounceFindingSeverity.LOW]: 2,
        };
        return (severityOrder[a.severity as BounceFindingSeverity] || 3) - 
               (severityOrder[b.severity as BounceFindingSeverity] || 3);
      });
    }
    
    // Build the report
    let report = `# Pickle+ Bug Report\n\n`;
    report += `Generated by Bounce Testing System on ${new Date().toLocaleString()}\n\n`;
    
    // Issues summary
    report += `## Summary\n\n`;
    report += `This report contains ${findings.length} issues detected during automated testing:\n\n`;
    report += `- Critical Issues: ${testRun.totalCritical}\n`;
    report += `- Moderate Issues: ${testRun.totalModerate}\n`;
    report += `- Low Issues: ${testRun.totalLow}\n\n`;
    
    // Bug list with solution prompts
    report += `## Bug List\n\n`;
    
    findings.forEach((finding, index) => {
      const bugNumber = index + 1;
      report += `### Bug #${bugNumber}: ${finding.description}\n\n`;
      
      // Severity and location
      report += `**Severity:** ${this.getSeverityLabel(finding.severity as BounceFindingSeverity)}\n`;
      report += `**Location:** ${finding.area}${finding.path ? ` (${finding.path})` : ''}\n`;
      report += `**Browser:** ${finding.browser}${finding.device ? ` on ${finding.device}` : ''}\n\n`;
      
      // Evidence summary
      if (options.includeEvidence && finding.evidence.length > 0) {
        report += `**Evidence:**\n`;
        finding.evidence.forEach(item => {
          report += `- ${item.evidenceType}${item.description ? `: ${item.description}` : ''}\n`;
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
      else if (severity === BounceFindingSeverity.MODERATE) {
        prompt += `This is a moderate issue that affects functionality. Consider:\n`;
        prompt += `- Reviewing the business logic and user flow\n`;
        prompt += `- Adding validation or error handling\n`;
        prompt += `- Checking related components and dependencies\n`;
        prompt += `- Improving UX feedback for error states\n`;
      }
      else {
        prompt += `This is a low-severity issue that should be addressed when possible. Consider:\n`;
        prompt += `- Improving code quality or performance\n`;
        prompt += `- Enhancing visual design or accessibility\n`;
        prompt += `- Adding additional test coverage\n`;
        prompt += `- Updating documentation\n`;
      }
    }
    
    // Add testing guidance
    prompt += `\nAfter fixing, verify the solution by:\n`;
    prompt += `1. Running focused Bounce tests on this specific area\n`;
    prompt += `2. Testing across multiple browsers (${finding.browser} specifically)\n`;
    prompt += `3. Verifying no regression in related functionality\n`;
    
    return prompt;
  }
  
  /**
   * Generate a Markdown format report
   * @param testRun The test run summary
   * @param findings The findings with evidence
   * @param options Report options
   * @returns Markdown formatted report
   */
  private generateMarkdownReport(
    testRun: TestRunSummary,
    findings: FindingWithEvidence[],
    options: ReportOptions
  ): string {
    // Sort findings if needed
    if (options.sortBySeverity) {
      findings.sort((a, b) => {
        const severityOrder = {
          [BounceFindingSeverity.CRITICAL]: 0,
          [BounceFindingSeverity.MODERATE]: 1,
          [BounceFindingSeverity.LOW]: 2,
        };
        return (severityOrder[a.severity as BounceFindingSeverity] || 3) - 
               (severityOrder[b.severity as BounceFindingSeverity] || 3);
      });
    }
    
    // Group findings by area if needed
    const groupedFindings: Record<string, FindingWithEvidence[]> = {};
    
    if (options.groupByArea) {
      findings.forEach(finding => {
        if (!groupedFindings[finding.area]) {
          groupedFindings[finding.area] = [];
        }
        groupedFindings[finding.area].push(finding);
      });
    }
    
    // Build the report
    let report = `# Bounce Test Report: Run #${testRun.id}\n\n`;
    
    // Test run summary
    report += `## Test Run Summary\n\n`;
    report += `- **Test ID:** ${testRun.testId}\n`;
    report += `- **Start Time:** ${testRun.startTime.toLocaleString()}\n`;
    report += `- **End Time:** ${testRun.endTime ? testRun.endTime.toLocaleString() : "Not completed"}\n`;
    report += `- **Status:** ${testRun.status}\n`;
    report += `- **Browsers Tested:** ${testRun.browsers}\n`;
    report += `- **Test Types:** ${testRun.testTypes}\n`;
    report += `- **Coverage:** ${testRun.coverage ? `${testRun.coverage}%` : "Not calculated"}\n\n`;
    
    // Issues summary
    report += `## Issues Summary\n\n`;
    report += `- **Total Issues:** ${testRun.totalIssues}\n`;
    report += `- **Critical Issues:** ${testRun.totalCritical}\n`;
    report += `- **Moderate Issues:** ${testRun.totalModerate}\n`;
    report += `- **Low Issues:** ${testRun.totalLow}\n\n`;
    
    // Findings
    report += `## Findings\n\n`;
    
    if (options.groupByArea) {
      // Report findings grouped by area
      for (const area in groupedFindings) {
        report += `### Area: ${area}\n\n`;
        
        groupedFindings[area].forEach(finding => {
          report += this.generateFindingMarkdown(finding, options);
        });
      }
    } else {
      // Report all findings sequentially
      findings.forEach(finding => {
        report += this.generateFindingMarkdown(finding, options);
      });
    }
    
    return report;
  }
  
  /**
   * Generate Markdown for a single finding
   * @param finding The finding with evidence
   * @param options Report options
   * @returns Markdown for the finding
   */
  private generateFindingMarkdown(
    finding: FindingWithEvidence,
    options: ReportOptions
  ): string {
    let markdown = `#### ${finding.findingId}: ${finding.description}\n\n`;
    
    // Severity badge
    markdown += `**Severity:** ${this.getSeverityLabel(finding.severity as BounceFindingSeverity)}\n\n`;
    
    // Finding details
    markdown += `**Status:** ${finding.status}\n`;
    markdown += `**Browser:** ${finding.browser}\n`;
    if (finding.device) markdown += `**Device:** ${finding.device}\n`;
    if (finding.screenSize) markdown += `**Screen Size:** ${finding.screenSize}\n`;
    if (finding.path) markdown += `**Path:** ${finding.path}\n`;
    markdown += `**Created:** ${finding.createdAt.toLocaleString()}\n\n`;
    
    // Evidence
    if (options.includeEvidence && finding.evidence.length > 0) {
      markdown += `**Evidence:**\n\n`;
      
      finding.evidence.forEach(item => {
        markdown += `- **${item.evidenceType}**: [View Evidence](${item.filePath})`;
        if (item.description) markdown += ` - ${item.description}`;
        markdown += `\n`;
      });
      
      markdown += `\n`;
    }
    
    // Solution prompt
    if (options.includeSolutionPrompts) {
      markdown += `**Solution Prompt:**\n\n`;
      markdown += `\`\`\`\n${this.generateSolutionPrompt(finding)}\n\`\`\`\n\n`;
    }
    
    markdown += `---\n\n`;
    
    return markdown;
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
      case BounceFindingSeverity.MODERATE:
        return `🟠 Moderate`;
      case BounceFindingSeverity.LOW:
        return `🟡 Low`;
      default:
        return severity;
    }
  }
  
  /**
   * Generate an HTML format report
   * @param testRun The test run summary
   * @param findings The findings with evidence
   * @param options Report options
   * @returns HTML formatted report
   */
  private generateHtmlReport(
    testRun: TestRunSummary,
    findings: FindingWithEvidence[],
    options: ReportOptions
  ): string {
    // For brevity, this is simplified - a real implementation would include
    // a complete HTML report with CSS styling
    
    const markdown = this.generateMarkdownReport(testRun, findings, options);
    
    // Simple HTML wrapper for the markdown content
    // In a real implementation, we would use a proper markdown to HTML converter
    return `<!DOCTYPE html>
<html>
<head>
  <title>Bounce Test Report: Run #${testRun.id}</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; max-width: 1000px; margin: 0 auto; padding: 20px; }
    h1, h2, h3, h4 { color: #333; }
    .critical { color: #e53e3e; }
    .moderate { color: #ed8936; }
    .low { color: #ecc94b; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .solution-prompt { background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 16px; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="report-content">
    ${markdown.replace(/\n/g, '<br>')}
  </div>
</body>
</html>`;
  }
  
  /**
   * Generate a plain text format report
   * @param testRun The test run summary
   * @param findings The findings with evidence
   * @param options Report options
   * @returns Plain text formatted report
   */
  private generateTextReport(
    testRun: TestRunSummary,
    findings: FindingWithEvidence[],
    options: ReportOptions
  ): string {
    // Convert markdown to plain text (simplified)
    const markdown = this.generateMarkdownReport(testRun, findings, options);
    return markdown
      .replace(/#+\s+/g, '')  // Remove markdown headers
      .replace(/\*\*/g, '')   // Remove bold markers
      .replace(/\n\n/g, '\n') // Reduce double line breaks
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)'); // Convert links
  }
  
  /**
   * Save a report to a file
   * @param reportContent The report content
   * @param format The format of the report
   * @param outputPath Optional custom output path
   * @returns The full path to the saved report
   */
  saveReportToFile(
    reportContent: string,
    format: "markdown" | "html" | "text" | "buglist" = "markdown",
    outputPath?: string
  ): string {
    let extension: string;
    switch (format) {
      case "markdown":
      case "buglist":
        extension = ".md";
        break;
      case "html":
        extension = ".html";
        break;
      case "text":
      default:
        extension = ".txt";
        break;
    }
    
    const filename = `bounce_report_${Date.now()}${extension}`;
    const reportPath = outputPath || path.join("./reports", filename);
    
    // Ensure the directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the report to file
    fs.writeFileSync(reportPath, reportContent, "utf8");
    
    console.log(`[Bounce] Report saved to: ${reportPath}`);
    return reportPath;
  }
}

// Export a singleton instance for use throughout the application
export const enhancedReportGenerator = new EnhancedReportGenerator();