/**
 * PKL-278651-BOUNCE-0015-CICD - Enhanced Report Generator
 * 
 * Generates detailed, categorized bug reports with solution guidance
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { db } from '../../server/db';
import { eq } from 'drizzle-orm';
import { bounceTestRuns, bounceFindings, bounceEvidence, BounceFindingSeverity } from '../../shared/schema/bounce';
import fs from 'fs';
import path from 'path';

/**
 * Enhanced report generator with additional categorization and actionable solution prompts
 */
export class EnhancedReportGenerator {
  /**
   * Generate an enhanced report for a test run with more structured data
   * @param testRunId The test run ID to generate a report for
   * @returns Path to the generated report file
   */
  async generateEnhancedReport(testRunId: number): Promise<string> {
    console.log(`[Bounce] Generating enhanced report for test run ${testRunId}...`);
    
    // Get the test run
    const [testRun] = await db
      .select()
      .from(bounceTestRuns)
      .where(eq(bounceTestRuns.id, testRunId));
    
    if (!testRun) {
      throw new Error(`Test run ${testRunId} not found`);
    }
    
    // Get all findings for this test run
    const findings = await db
      .select()
      .from(bounceFindings)
      .where(eq(bounceFindings.testRunId, testRunId));
    
    // Count findings by severity
    const criticalCount = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length;
    const highCount = findings.filter(f => f.severity === BounceFindingSeverity.HIGH).length;
    const moderateCount = findings.filter(f => 
      f.severity === BounceFindingSeverity.MODERATE || 
      f.severity === BounceFindingSeverity.MEDIUM // For backward compatibility
    ).length;
    const lowCount = findings.filter(f => 
      f.severity === BounceFindingSeverity.LOW || 
      f.severity === BounceFindingSeverity.INFO
    ).length;
    
    // Generate report header with enhanced styling
    const dateStr = testRun.completedAt 
      ? new Date(testRun.completedAt).toLocaleString()
      : new Date().toLocaleString();
      
    let report = `# 🔍 Enhanced Bounce Test Report: ${testRun.name}\n\n`;
    report += `> 📅 Generated on ${dateStr}\n\n`;
    
    // Add executive summary
    report += `## 📊 Executive Summary\n\n`;
    report += `This report contains the findings from automated testing run #${testRun.id}. `;
    
    if (criticalCount > 0) {
      report += `**${criticalCount} critical issues** were identified that require immediate attention. `;
    }
    
    if (highCount > 0) {
      report += `**${highCount} high priority issues** were found that should be addressed soon. `;
    }
    
    report += `The test run covered the application at ${testRun.targetUrl || 'the target URL'} `;
    report += `and was completed on ${testRun.completedAt ? new Date(testRun.completedAt).toLocaleString() : 'N/A'}.\n\n`;
    
    // Add impact assessment
    report += `### 🎯 Impact Assessment\n\n`;
    
    const totalIssues = criticalCount + highCount + moderateCount + lowCount;
    
    if (totalIssues === 0) {
      report += `✅ No issues were found during this test run. Excellent work!\n\n`;
    } else if (criticalCount > 0) {
      report += `⚠️ **Critical Impact**: The application has ${criticalCount} critical issues that are likely blocking key user journeys or presenting security vulnerabilities. These should be addressed immediately.\n\n`;
    } else if (highCount > 5) {
      report += `🚨 **High Impact**: While no critical issues were found, there are ${highCount} high priority issues that cumulatively create a significant impact on user experience. These should be addressed in the current sprint.\n\n`;
    } else if (highCount > 0) {
      report += `⚠️ **Moderate Impact**: There are ${highCount} high priority issues that should be addressed soon, but they don't appear to block critical user journeys.\n\n`;
    } else {
      report += `📝 **Low Impact**: Only minor issues were identified that don't significantly impact the user experience.\n\n`;
    }
    
    // Add statistics
    report += `### 📈 Test Run Statistics\n\n`;
    report += `| Metric | Value |\n`;
    report += `| ------ | ----- |\n`;
    report += `| Test Run ID | ${testRun.id} |\n`;
    report += `| Status | ${testRun.status} |\n`;
    report += `| Started | ${testRun.startedAt ? new Date(testRun.startedAt).toLocaleString() : 'N/A'} |\n`;
    report += `| Completed | ${testRun.completedAt ? new Date(testRun.completedAt).toLocaleString() : 'N/A'} |\n`;
    report += `| Target URL | ${testRun.targetUrl || 'N/A'} |\n`;
    report += `| Total Findings | ${findings.length} |\n`;
    report += `| Critical Issues | ${criticalCount} |\n`;
    report += `| High Issues | ${highCount} |\n`;
    report += `| Moderate Issues | ${moderateCount} |\n`;
    report += `| Low Issues | ${lowCount} |\n\n`;
    
    // Add finding categories summary
    const areas = new Set<string>();
    findings.forEach(f => areas.add(f.area || 'General'));
    
    report += `### 🏷️ Finding Categories\n\n`;
    report += `Findings were identified in the following areas:\n\n`;
    
    for (const area of areas) {
      const areaFindings = findings.filter(f => (f.area || 'General') === area);
      const criticalAreaCount = areaFindings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length;
      const highAreaCount = areaFindings.filter(f => f.severity === BounceFindingSeverity.HIGH).length;
      
      report += `- **${area}**: ${areaFindings.length} issues`;
      
      if (criticalAreaCount > 0) {
        report += ` (${criticalAreaCount} critical)`;
      } else if (highAreaCount > 0) {
        report += ` (${highAreaCount} high priority)`;
      }
      
      report += '\n';
    }
    
    report += '\n';
    
    // Add critical findings section
    if (criticalCount > 0) {
      report += `## 🔴 Critical Findings\n\n`;
      
      const criticalFindings = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL);
      
      for (const finding of criticalFindings) {
        report += this.generateFindingMarkdown(finding, true);
      }
    }
    
    // Add high priority findings section
    if (highCount > 0) {
      report += `## 🟠 High Priority Findings\n\n`;
      
      const highPriorityFindings = findings.filter(f => f.severity === BounceFindingSeverity.HIGH);
      
      for (const finding of highPriorityFindings) {
        report += this.generateFindingMarkdown(finding, false);
      }
    }
    
    // Add complete findings list
    report += `## 📋 Complete Findings List\n\n`;
    report += `| ID | Title | Severity | Area | Browser |\n`;
    report += `| -- | ----- | -------- | ---- | ------- |\n`;
    
    // Sort by severity
    const sortedFindings = [...findings].sort((a, b) => {
      const severityMap: Record<string, number> = {
        [BounceFindingSeverity.CRITICAL]: 1,
        [BounceFindingSeverity.HIGH]: 2,
        [BounceFindingSeverity.MODERATE]: 3,
        [BounceFindingSeverity.MEDIUM]: 3, // For backward compatibility
        [BounceFindingSeverity.LOW]: 4,
        [BounceFindingSeverity.INFO]: 5
      };
      
      return severityMap[a.severity] - severityMap[b.severity];
    });
    
    for (const finding of sortedFindings) {
      const severityIcon = this.getSeverityIcon(finding.severity);
      report += `| ${finding.id} | ${finding.title} | ${severityIcon} ${finding.severity} | ${finding.area || 'General'} | ${finding.browser || 'Not specified'} |\n`;
    }
    
    report += '\n';
    
    // Add next steps
    report += `## 🚀 Next Steps\n\n`;
    report += `1. **Prioritize**: Address critical and high priority issues first\n`;
    report += `2. **Plan**: Generate a sprint plan using \`npx tsx bounce/cli.ts plan ${testRunId}\`\n`;
    report += `3. **Implement**: Fix the issues following the suggested solutions\n`;
    report += `4. **Verify**: Re-run tests after fixes are implemented\n`;
    report += `5. **Monitor**: Keep track of fixed findings and monitor for regressions\n\n`;
    
    // Add framework compliance footer
    report += `---\n\n`;
    report += `Generated by Bounce Enhanced Reporting System | Framework5.2 | v1.0.0\n`;
    
    // Ensure report directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Write report to file
    const fileName = `enhanced-report-${testRunId}-${new Date().toISOString().replace(/:/g, '-')}.md`;
    const filePath = path.join(reportsDir, fileName);
    
    fs.writeFileSync(filePath, report);
    
    console.log(`[Bounce] Enhanced report generated and saved to ${filePath}`);
    
    return filePath;
  }
  
  /**
   * Generate markdown for a single finding
   * @param finding The finding to generate markdown for
   * @param isDetailed Whether to include detailed information
   * @returns Markdown string for the finding
   */
  private generateFindingMarkdown(finding: any, isDetailed: boolean): string {
    const severityIcon = this.getSeverityIcon(finding.severity);
    let markdown = `### ${severityIcon} ${finding.title}\n\n`;
    
    // Generate Framework5.2 ticket ID suggestion
    const areaCode = finding.area ? finding.area.toUpperCase().replace(/\\s+/g, '-') : 'GENERAL';
    const fixId = `PKL-278651-${areaCode}-${String(finding.id).padStart(4, '0')}-FIX`;
    
    markdown += `**Framework5.2 ID**: \`${fixId}\`\n\n`;
    markdown += `**Severity**: ${finding.severity}\n\n`;
    markdown += `**Area**: ${finding.area || 'General'}\n\n`;
    markdown += `**Path**: ${finding.path || 'Not specified'}\n\n`;
    markdown += `**Browser**: ${finding.browser || 'Not specified'}\n\n`;
    
    if (finding.deviceInfo && isDetailed) {
      try {
        const deviceInfo = JSON.parse(finding.deviceInfo);
        markdown += `**Device Info**:\n\n`;
        
        for (const [key, value] of Object.entries(deviceInfo)) {
          markdown += `- ${key}: ${value}\n`;
        }
        
        markdown += '\n';
      } catch (error) {
        markdown += `**Device Info**: ${finding.deviceInfo}\n\n`;
      }
    }
    
    markdown += `**Description**:\n\n${finding.description}\n\n`;
    
    if (finding.reproducibleSteps) {
      markdown += `**Steps to Reproduce**:\n\n${finding.reproducibleSteps}\n\n`;
    }
    
    // Add solution guidance
    markdown += `**Solution Guidance**:\n\n`;
    
    if (finding.area === 'Authentication') {
      markdown += `- Check session management implementation for persistence issues\n`;
      markdown += `- Verify secure cookie settings and CSRF protection\n`;
      markdown += `- Ensure token validation is working across page refreshes\n`;
    } else if (finding.area === 'Community') {
      markdown += `- Review responsive breakpoints in CSS for mobile layouts\n`;
      markdown += `- Check flex layouts and container overflow handling\n`;
      markdown += `- Verify text truncation for long content\n`;
    } else if (finding.area === 'Tournaments') {
      markdown += `- Inspect bracket rendering logic for large tournament sizes\n`;
      markdown += `- Verify data truncation and overflow handling\n`;
      markdown += `- Check responsive design for tournament brackets\n`;
    } else {
      markdown += `- Fix the issue following standard best practices\n`;
      markdown += `- Ensure proper error handling is implemented\n`;
      markdown += `- Add tests to verify the fix and prevent regression\n`;
    }
    
    markdown += '\n---\n\n';
    return markdown;
  }
  
  /**
   * Get an icon representing severity
   * @param severity Severity level
   * @returns Icon string
   */
  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case BounceFindingSeverity.CRITICAL:
        return '🔴';
      case BounceFindingSeverity.HIGH:
        return '🟠';
      case BounceFindingSeverity.MODERATE:
      case BounceFindingSeverity.MEDIUM: // For backward compatibility
        return '🟡';
      case BounceFindingSeverity.LOW:
        return '🟢';
      case BounceFindingSeverity.INFO:
        return '🔵';
      default:
        return '⚪';
    }
  }
}