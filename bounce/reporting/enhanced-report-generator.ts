/**
 * PKL-278651-BOUNCE-0015-CICD - Enhanced Report Generator
 * 
 * Generates enhanced reports with additional analytics and insights
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { db } from '../../server/db';
import { eq } from 'drizzle-orm';
import { bounceTestRuns, bounceFindings, BounceFindingSeverity } from '../../shared/schema/bounce';
import fs from 'fs';
import path from 'path';

/**
 * Enhanced report generator for the bounce testing system
 */
export class EnhancedReportGenerator {
  /**
   * Generate an enhanced report for a test run
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
    
    // Generate the report in markdown format
    const dateStr = new Date().toLocaleString();
    let markdown = `# 🔍 Enhanced Bounce Analysis - Test Run #${testRunId}\n\n`;
    markdown += `*Generated on: ${dateStr}*\n\n`;
    
    // Add executive summary
    markdown += `## 📋 Executive Summary\n\n`;
    
    if (findings.length === 0) {
      markdown += `No issues were detected during this test run. The application appears to be functioning correctly.\n\n`;
    } else {
      // Group findings by severity
      const criticalFindings = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL);
      const highFindings = findings.filter(f => f.severity === BounceFindingSeverity.HIGH);
      const moderateFindings = findings.filter(f => 
        f.severity === BounceFindingSeverity.MODERATE ||
        f.severity === BounceFindingSeverity.MEDIUM
      );
      const lowFindings = findings.filter(f => 
        f.severity === BounceFindingSeverity.LOW ||
        f.severity === BounceFindingSeverity.INFO
      );
      
      let summaryText = `During this test run, Bounce identified **${findings.length} issues** that require attention. `;
      
      if (criticalFindings.length > 0) {
        summaryText += `**${criticalFindings.length} critical ${criticalFindings.length === 1 ? 'issue' : 'issues'}** must be addressed immediately as ${criticalFindings.length === 1 ? 'it affects' : 'they affect'} core functionality. `;
      }
      
      if (highFindings.length > 0) {
        summaryText += `**${highFindings.length} high priority ${highFindings.length === 1 ? 'issue' : 'issues'}** should be fixed in the current development cycle. `;
      }
      
      if (moderateFindings.length > 0) {
        summaryText += `There ${moderateFindings.length === 1 ? 'is' : 'are'} **${moderateFindings.length} moderate ${moderateFindings.length === 1 ? 'issue' : 'issues'}** that should be addressed when resources permit. `;
      }
      
      if (lowFindings.length > 0) {
        summaryText += `The remaining **${lowFindings.length} low priority ${lowFindings.length === 1 ? 'issue' : 'issues'}** can be considered for future improvements.`;
      }
      
      markdown += `${summaryText}\n\n`;
      
      // Group findings by area
      const areaGroups: Record<string, Array<any>> = {};
      
      for (const finding of findings) {
        const area = finding.area || 'General';
        
        if (!areaGroups[area]) {
          areaGroups[area] = [];
        }
        
        areaGroups[area].push(finding);
      }
      
      // Add area breakdown
      markdown += `### 🔍 Areas Affected\n\n`;
      
      const sortedAreas = Object.entries(areaGroups)
        .sort((a, b) => b[1].length - a[1].length);
      
      markdown += `| Area | Issues | Severity Breakdown |\n`;
      markdown += `| ---- | ------ | ------------------ |\n`;
      
      for (const [area, areaFindings] of sortedAreas) {
        const criticalCount = areaFindings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length;
        const highCount = areaFindings.filter(f => f.severity === BounceFindingSeverity.HIGH).length;
        const moderateCount = areaFindings.filter(f => 
          f.severity === BounceFindingSeverity.MODERATE || 
          f.severity === BounceFindingSeverity.MEDIUM
        ).length;
        const lowCount = areaFindings.filter(f => 
          f.severity === BounceFindingSeverity.LOW || 
          f.severity === BounceFindingSeverity.INFO
        ).length;
        
        let severityBreakdown = '';
        
        if (criticalCount > 0) severityBreakdown += `🔴 ${criticalCount} Critical `;
        if (highCount > 0) severityBreakdown += `🟠 ${highCount} High `;
        if (moderateCount > 0) severityBreakdown += `🟡 ${moderateCount} Moderate `;
        if (lowCount > 0) severityBreakdown += `🔵 ${lowCount} Low`;
        
        markdown += `| ${area} | ${areaFindings.length} | ${severityBreakdown} |\n`;
      }
      
      markdown += '\n';
    }
    
    // Add test run information
    markdown += `## 🔄 Test Run Information\n\n`;
    markdown += `- **Name**: ${testRun.name}\n`;
    markdown += `- **Started**: ${testRun.startedAt ? new Date(testRun.startedAt).toLocaleString() : 'N/A'}\n`;
    markdown += `- **Completed**: ${testRun.completedAt ? new Date(testRun.completedAt).toLocaleString() : 'N/A'}\n`;
    markdown += `- **Status**: ${testRun.status}\n`;
    markdown += `- **Target URL**: ${testRun.targetUrl || 'N/A'}\n`;
    
    if (testRun.testConfig) {
      try {
        const config = JSON.parse(testRun.testConfig);
        markdown += `- **Browser**: ${config.browser || 'N/A'}\n`;
        markdown += `- **Device Type**: ${config.deviceType || 'N/A'}\n`;
      } catch (error) {
        // Ignore parsing errors
      }
    }
    
    markdown += `- **Total Findings**: ${findings.length}\n\n`;
    
    // Add detailed findings
    if (findings.length > 0) {
      markdown += `## 📊 Detailed Findings\n\n`;
      
      // Group findings by severity
      const criticalFindings = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL);
      const highFindings = findings.filter(f => f.severity === BounceFindingSeverity.HIGH);
      const moderateFindings = findings.filter(f => 
        f.severity === BounceFindingSeverity.MODERATE ||
        f.severity === BounceFindingSeverity.MEDIUM
      );
      const lowFindings = findings.filter(f => 
        f.severity === BounceFindingSeverity.LOW ||
        f.severity === BounceFindingSeverity.INFO
      );
      
      // Critical findings
      if (criticalFindings.length > 0) {
        markdown += `### 🔴 Critical Issues\n\n`;
        
        for (const finding of criticalFindings) {
          // Generate Framework5.2 ticket ID suggestion
          const areaCode = finding.area ? finding.area.toUpperCase().replace(/\s+/g, '-') : 'GENERAL';
          const fixId = `PKL-278651-${areaCode}-${String(finding.id).padStart(4, '0')}-FIX`;
          
          markdown += `#### ${finding.title} (${fixId})\n\n`;
          markdown += `**Description**: ${finding.description}\n\n`;
          
          if (finding.reproducibleSteps) {
            markdown += `**Steps to Reproduce**:\n${finding.reproducibleSteps}\n\n`;
          }
          
          // Suggested solution based on the area
          markdown += `**Suggested Solution**:\n`;
          
          if (finding.area === 'Authentication') {
            markdown += `- Review session management implementation\n`;
            markdown += `- Verify secure cookie settings\n`;
            markdown += `- Check token validation logic\n`;
          } else if (finding.area === 'Community') {
            markdown += `- Adjust responsive CSS breakpoints\n`;
            markdown += `- Fix container overflow handling\n`;
            markdown += `- Implement mobile-specific layout for affected components\n`;
          } else if (finding.area === 'Tournaments') {
            markdown += `- Optimize bracket rendering for large participant counts\n`;
            markdown += `- Implement truncation with tooltips for participant names\n`;
            markdown += `- Add responsive design adaptations for tournament UI\n`;
          } else {
            markdown += `- Conduct thorough analysis of the root cause\n`;
            markdown += `- Implement a comprehensive fix following best practices\n`;
            markdown += `- Add automated tests to verify the solution\n`;
          }
          
          markdown += '\n---\n\n';
        }
      }
      
      // High priority findings with less detail
      if (highFindings.length > 0) {
        markdown += `### 🟠 High Priority Issues\n\n`;
        
        for (const finding of highFindings) {
          const areaCode = finding.area ? finding.area.toUpperCase().replace(/\s+/g, '-') : 'GENERAL';
          const fixId = `PKL-278651-${areaCode}-${String(finding.id).padStart(4, '0')}-FIX`;
          
          markdown += `#### ${finding.title} (${fixId})\n\n`;
          markdown += `**Description**: ${finding.description}\n\n`;
          
          if (finding.reproducibleSteps) {
            markdown += `**Steps to Reproduce**:\n${finding.reproducibleSteps}\n\n`;
          }
          
          markdown += `---\n\n`;
        }
      }
      
      // Moderate and low findings in collapsed sections
      if (moderateFindings.length > 0) {
        markdown += `### 🟡 Moderate Issues\n\n`;
        markdown += `<details>\n<summary>Click to expand moderate issues (${moderateFindings.length})</summary>\n\n`;
        
        for (const finding of moderateFindings) {
          const areaCode = finding.area ? finding.area.toUpperCase().replace(/\s+/g, '-') : 'GENERAL';
          const fixId = `PKL-278651-${areaCode}-${String(finding.id).padStart(4, '0')}-FIX`;
          
          markdown += `#### ${finding.title} (${fixId})\n\n`;
          markdown += `**Description**: ${finding.description}\n\n`;
          
          if (finding.reproducibleSteps) {
            markdown += `**Steps to Reproduce**:\n${finding.reproducibleSteps}\n\n`;
          }
          
          markdown += `---\n\n`;
        }
        
        markdown += `</details>\n\n`;
      }
      
      if (lowFindings.length > 0) {
        markdown += `### 🔵 Low Priority Issues\n\n`;
        markdown += `<details>\n<summary>Click to expand low priority issues (${lowFindings.length})</summary>\n\n`;
        
        for (const finding of lowFindings) {
          const areaCode = finding.area ? finding.area.toUpperCase().replace(/\s+/g, '-') : 'GENERAL';
          const fixId = `PKL-278651-${areaCode}-${String(finding.id).padStart(4, '0')}-FIX`;
          
          markdown += `#### ${finding.title} (${fixId})\n\n`;
          markdown += `**Description**: ${finding.description}\n\n`;
          
          markdown += `---\n\n`;
        }
        
        markdown += `</details>\n\n`;
      }
    }
    
    // Add recommendations section
    markdown += `## 🔧 Recommendations\n\n`;
    
    if (findings.length === 0) {
      markdown += `The application passed all tests successfully. Consider adding more test coverage for edge cases and critical user flows.\n\n`;
    } else {
      // Count issues by severity
      const criticalCount = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length;
      const highCount = findings.filter(f => f.severity === BounceFindingSeverity.HIGH).length;
      
      if (criticalCount > 0) {
        markdown += `1. **Immediately address critical issues** that affect core functionality.\n`;
      }
      
      if (highCount > 0) {
        markdown += `${criticalCount > 0 ? '2' : '1'}. **Plan fixes for high priority issues** in the current sprint.\n`;
      }
      
      markdown += `${criticalCount > 0 && highCount > 0 ? '3' : criticalCount > 0 || highCount > 0 ? '2' : '1'}. **Review test coverage** to ensure critical paths are being tested.\n`;
      markdown += `${criticalCount > 0 && highCount > 0 ? '4' : criticalCount > 0 || highCount > 0 ? '3' : '2'}. **Consider implementing automated CI/CD** with Bounce tests to prevent regressions.\n`;
      markdown += `${criticalCount > 0 && highCount > 0 ? '5' : criticalCount > 0 || highCount > 0 ? '4' : '3'}. **Schedule regular Bounce test runs** to maintain quality.\n\n`;
    }
    
    // Add footer
    markdown += `---\n\n`;
    markdown += `*Generated by Bounce Automated Testing System | Framework5.2 | ${new Date().toISOString()}*\n`;
    
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Write report to file
    const fileName = `enhanced-report-${testRunId}-${new Date().toISOString().replace(/:/g, '-')}.md`;
    const filePath = path.join(reportsDir, fileName);
    
    fs.writeFileSync(filePath, markdown);
    
    console.log(`[Bounce] Enhanced report generated and saved to ${filePath}`);
    
    return filePath;
  }
}

// Export singleton instance
export const enhancedReportGenerator = new EnhancedReportGenerator();