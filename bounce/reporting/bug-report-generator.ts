/**
 * PKL-278651-BOUNCE-0013-CICD - Bug Report Generator
 * 
 * Generates detailed bug reports from test runs in markdown format
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
 * Bug report generator for the bounce testing system
 */
export class BugReportGenerator {
  /**
   * Generate a bug report for a test run
   * @param testRunId The test run ID to generate a report for
   * @returns Path to the generated report file
   */
  async generateReport(testRunId: number): Promise<string> {
    console.log(`[Bounce] Generating bug report for test run ${testRunId}...`);
    
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
    
    // Generate report header
    const dateStr = testRun.completedAt 
      ? new Date(testRun.completedAt).toLocaleString()
      : new Date().toLocaleString();
      
    let report = `# Bounce Bug Report: ${testRun.name}\n\n`;
    report += `> Generated on ${dateStr}\n\n`;
    report += `## Test Run Summary\n\n`;
    report += `- **Test Run ID:** ${testRun.id}\n`;
    report += `- **Status:** ${testRun.status}\n`;
    report += `- **Started:** ${testRun.startedAt ? new Date(testRun.startedAt).toLocaleString() : 'N/A'}\n`;
    report += `- **Completed:** ${testRun.completedAt ? new Date(testRun.completedAt).toLocaleString() : 'N/A'}\n`;
    report += `- **Target URL:** ${testRun.targetUrl || 'N/A'}\n\n`;
    report += `## Findings Summary\n\n`;
    report += `- **Total Findings:** ${findings.length}\n`;
    report += `- **Critical Issues:** ${criticalCount}\n`;
    report += `- **High Issues:** ${highCount}\n`;
    report += `- **Moderate Issues:** ${moderateCount}\n`;
    report += `- **Low Issues:** ${lowCount}\n\n`;
    
    // Group findings by area
    const areaGroups: Record<string, typeof findings> = {};
    
    for (const finding of findings) {
      const area = finding.area || 'General';
      
      if (!areaGroups[area]) {
        areaGroups[area] = [];
      }
      
      areaGroups[area].push(finding);
    }
    
    // Generate findings by area
    report += `## Findings by Area\n\n`;
    
    for (const [area, areaFindings] of Object.entries(areaGroups)) {
      report += `### ${area}\n\n`;
      
      // Sort by severity
      const sortedFindings = areaFindings.sort((a, b) => {
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
      
      // Generate finding details
      for (const finding of sortedFindings) {
        const severityIcon = this.getSeverityIcon(finding.severity);
        
        report += `#### ${severityIcon} ${finding.title}\n\n`;
        report += `**ID:** ${finding.id}\n\n`;
        report += `**Severity:** ${finding.severity}\n\n`;
        report += `**Browser:** ${finding.browser || 'Not specified'}\n\n`;
        report += `**Path:** ${finding.path || 'Not specified'}\n\n`;
        report += `**Description:**\n\n${finding.description}\n\n`;
        
        if (finding.reproducibleSteps) {
          report += `**Steps to Reproduce:**\n\n${finding.reproducibleSteps}\n\n`;
        }
        
        // Get evidence for this finding
        const evidenceList = await db
          .select()
          .from(bounceEvidence)
          .where(eq(bounceEvidence.findingId, finding.id));
        
        if (evidenceList.length > 0) {
          report += `**Evidence:**\n\n`;
          
          for (const evidence of evidenceList) {
            const relativePath = evidence.filePath 
              ? path.relative(process.cwd(), evidence.filePath).replace(/\\/g, '/')
              : null;
              
            report += `- ${evidence.type}: `;
            
            if (relativePath) {
              report += `[${relativePath}](${relativePath})`;
            } else {
              report += 'No file path available';
            }
            
            if (evidence.description) {
              report += ` - ${evidence.description}`;
            }
            
            report += '\n';
          }
          
          report += '\n';
        }
        
        // Add potential solution (placeholder for future enhancement)
        report += `**Potential Solution:**\n\n`;
        report += `Based on the issues detected, we recommend checking the following:\n\n`;
        
        if (finding.severity === BounceFindingSeverity.CRITICAL) {
          report += `- This is a critical issue that affects core functionality and should be addressed immediately\n`;
          report += `- Consider a hotfix deployment once resolved\n`;
        } else if (finding.severity === BounceFindingSeverity.HIGH) {
          report += `- This is a high priority issue that affects key user journeys\n`;
          report += `- Should be addressed in the current sprint\n`;
        }
        
        if (finding.area === 'Authentication') {
          report += `- Check session persistence and token validation\n`;
          report += `- Verify secure cookie settings and CSRF protection\n`;
        } else if (finding.area === 'Community') {
          report += `- Review responsive CSS breakpoints for mobile layouts\n`;
          report += `- Check container overflow and flex layouts\n`;
        } else if (finding.area === 'Tournaments') {
          report += `- Check bracket rendering logic for large tournament sizes\n`;
          report += `- Verify data truncation and overflow handling\n`;
        }
        
        report += '\n---\n\n';
      }
    }
    
    // Generate detailed findings section
    report += `## Detailed Findings\n\n`;
    
    // Sort by severity first
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
      
      report += `### ${severityIcon} Finding ID: ${finding.id} - ${finding.title}\n\n`;
      report += `**Severity:** ${finding.severity}\n\n`;
      report += `**Area:** ${finding.area || 'Not specified'}\n\n`;
      report += `**Browser:** ${finding.browser || 'Not specified'}\n\n`;
      report += `**Path:** ${finding.path || 'Not specified'}\n\n`;
      
      if (finding.deviceInfo) {
        try {
          const deviceInfo = JSON.parse(finding.deviceInfo);
          report += `**Device Info:**\n\n`;
          
          for (const [key, value] of Object.entries(deviceInfo)) {
            report += `- ${key}: ${value}\n`;
          }
          
          report += '\n';
        } catch (error) {
          report += `**Device Info:** ${finding.deviceInfo}\n\n`;
        }
      }
      
      report += `**Description:**\n\n${finding.description}\n\n`;
      
      if (finding.reproducibleSteps) {
        report += `**Steps to Reproduce:**\n\n${finding.reproducibleSteps}\n\n`;
      }
      
      // Add Framework5.2 ticket ID suggestion
      const areaCode = finding.area ? finding.area.toUpperCase().replace(/\\s+/g, '-') : 'GENERAL';
      const fixId = `PKL-278651-${areaCode}-${String(finding.id).padStart(4, '0')}-FIX`;
      
      report += `**Suggested Framework5.2 Issue ID:** \`${fixId}\`\n\n`;
      
      report += `---\n\n`;
    }
    
    // Add footer
    report += `## Next Steps\n\n`;
    report += `1. Triage findings based on severity and impact\n`;
    report += `2. Create issues in your issue tracking system using the suggested Framework5.2 IDs\n`;
    report += `3. Generate a sprint plan using \`npx tsx bounce/cli.ts plan ${testRunId}\`\n`;
    report += `4. Fix highest severity issues first\n`;
    report += `5. Re-run bounce tests to verify fixes with \`npx tsx bounce/cli.ts run\`\n\n`;
    report += `---\n\n`;
    report += `Generated by Bounce Automated Testing System | Framework5.2 | v1.0.0\n`;
    
    // Ensure report directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Write report to file
    const fileName = `bug-report-${testRunId}-${new Date().toISOString().replace(/:/g, '-')}.md`;
    const filePath = path.join(reportsDir, fileName);
    
    fs.writeFileSync(filePath, report);
    
    console.log(`[Bounce] Bug report generated and saved to ${filePath}`);
    
    return filePath;
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