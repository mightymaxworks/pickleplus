/**
 * PKL-278651-BOUNCE-0001-CORE
 * Bounce Testing System Report Generator
 * 
 * This module generates formatted reports from test findings for easy review.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
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
  format?: "markdown" | "html" | "text";
  
  /**
   * Whether to group findings by area
   */
  groupByArea?: boolean;
  
  /**
   * Whether to sort findings by severity (highest first)
   */
  sortBySeverity?: boolean;
}

/**
 * Default report options
 */
const DEFAULT_REPORT_OPTIONS: ReportOptions = {
  includeEvidence: true,
  format: "markdown",
  groupByArea: true,
  sortBySeverity: true,
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
 */
export class ReportGenerator {
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
    markdown += `**Severity:** `;
    switch (finding.severity) {
      case BounceFindingSeverity.CRITICAL:
        markdown += `🔴 Critical`;
        break;
      case BounceFindingSeverity.MODERATE:
        markdown += `🟠 Moderate`;
        break;
      case BounceFindingSeverity.LOW:
        markdown += `🟡 Low`;
        break;
      default:
        markdown += finding.severity;
    }
    markdown += `\n\n`;
    
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
    
    markdown += `---\n\n`;
    
    return markdown;
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
    format: "markdown" | "html" | "text" = "markdown",
    outputPath?: string
  ): string {
    let extension: string;
    switch (format) {
      case "markdown":
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
export const reportGenerator = new ReportGenerator();