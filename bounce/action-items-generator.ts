/**
 * PKL-278651-BOUNCE-0016-CICD - Action Items Generator
 * 
 * Generates actionable sprint plan items from test run findings
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { db } from '../server/db';
import { eq } from 'drizzle-orm';
import { bounceTestRuns, bounceFindings, BounceFindingSeverity } from '../shared/schema/bounce';
import fs from 'fs';
import path from 'path';

/**
 * Action items generator for the bounce testing system
 */
export class ActionItemsGenerator {
  /**
   * Generate action items from a test run
   * @param testRunId The test run ID to generate action items for
   * @returns Path to the generated action items file
   */
  async generateActionItems(testRunId: number): Promise<string> {
    console.log(`[Bounce] Generating action items for test run ${testRunId}...`);
    
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
    
    // Generate the sprint plan
    const dateStr = new Date().toISOString().split('T')[0];
    const sprint = `Sprint Plan ${dateStr}`;
    
    let md = `# 📋 ${sprint}\n\n`;
    md += `> Generated from Bounce Test Run #${testRunId} (${testRun.name})\n\n`;
    
    // Overview section
    md += `## 📊 Overview\n\n`;
    md += `This sprint plan focuses on addressing issues identified during automated testing. `;
    
    // Count by severity
    const criticalCount = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length;
    const highCount = findings.filter(f => f.severity === BounceFindingSeverity.HIGH).length;
    const moderateCount = findings.filter(f => 
      f.severity === BounceFindingSeverity.MODERATE || 
      f.severity === BounceFindingSeverity.MEDIUM
    ).length;
    
    if (criticalCount > 0) {
      md += `There ${criticalCount === 1 ? 'is' : 'are'} **${criticalCount} critical ${criticalCount === 1 ? 'issue' : 'issues'}** that must be addressed immediately. `;
    }
    
    if (highCount > 0) {
      md += `There ${highCount === 1 ? 'is' : 'are'} **${highCount} high priority ${highCount === 1 ? 'issue' : 'issues'}** to be resolved this sprint. `;
    }
    
    if (moderateCount > 0) {
      md += `Additionally, there ${moderateCount === 1 ? 'is' : 'are'} **${moderateCount} moderate ${moderateCount === 1 ? 'issue' : 'issues'}** that should be addressed if time permits.`;
    }
    
    md += '\n\n';
    
    // Group findings by area
    const areaGroups: Record<string, Array<any>> = {};
    
    for (const finding of findings) {
      const area = finding.area || 'General';
      
      if (!areaGroups[area]) {
        areaGroups[area] = [];
      }
      
      areaGroups[area].push(finding);
    }
    
    // Critical issues section
    if (criticalCount > 0) {
      md += `## 🔴 Critical Issues (Must Fix)\n\n`;
      
      const criticalFindings = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL);
      
      for (const finding of criticalFindings) {
        // Generate task ID
        const areaCode = finding.area ? finding.area.toUpperCase().replace(/\s+/g, '-') : 'GENERAL';
        const taskId = `PKL-278651-${areaCode}-${String(finding.id).padStart(4, '0')}-FIX`;
        
        md += `### ${taskId}: ${finding.title}\n\n`;
        md += `**Priority**: P0 (Critical)\n\n`;
        md += `**Description**: ${finding.description}\n\n`;
        
        if (finding.reproducibleSteps) {
          md += `**Reproduction Steps**:\n${finding.reproducibleSteps}\n\n`;
        }
        
        md += `**Success Criteria**:\n`;
        md += `- [ ] Issue is fixed and verified through manual testing\n`;
        md += `- [ ] Automated test is passing\n`;
        md += `- [ ] No regressions introduced\n\n`;
        
        // Add suggested solution based on the area
        md += `**Implementation Notes**:\n`;
        
        if (finding.area === 'Authentication') {
          md += `- Check session management implementation\n`;
          md += `- Verify secure cookie settings\n`;
          md += `- Review token validation logic\n`;
        } else if (finding.area === 'Community') {
          md += `- Review responsive CSS breakpoints\n`;
          md += `- Check container overflow handling\n`;
          md += `- Fix layout issues on mobile devices\n`;
        } else if (finding.area === 'Tournaments') {
          md += `- Fix bracket rendering for large tournaments\n`;
          md += `- Address data truncation issues\n`;
          md += `- Improve responsive design for tournament UI\n`;
        } else {
          md += `- Analyze root cause\n`;
          md += `- Implement fix following best practices\n`;
          md += `- Add tests to verify the solution\n`;
        }
        
        md += '\n---\n\n';
      }
    }
    
    // High priority issues section
    if (highCount > 0) {
      md += `## 🟠 High Priority Issues (Should Fix)\n\n`;
      
      const highPriorityFindings = findings.filter(f => f.severity === BounceFindingSeverity.HIGH);
      
      for (const finding of highPriorityFindings) {
        // Generate task ID
        const areaCode = finding.area ? finding.area.toUpperCase().replace(/\s+/g, '-') : 'GENERAL';
        const taskId = `PKL-278651-${areaCode}-${String(finding.id).padStart(4, '0')}-FIX`;
        
        md += `### ${taskId}: ${finding.title}\n\n`;
        md += `**Priority**: P1 (High)\n\n`;
        md += `**Description**: ${finding.description}\n\n`;
        
        if (finding.reproducibleSteps) {
          md += `**Reproduction Steps**:\n${finding.reproducibleSteps}\n\n`;
        }
        
        md += `**Success Criteria**:\n`;
        md += `- [ ] Issue is fixed and verified through manual testing\n`;
        md += `- [ ] Automated test is passing\n`;
        md += `- [ ] No regressions introduced\n\n`;
        
        md += '\n---\n\n';
      }
    }
    
    // Moderate issues section (collapsed for readability)
    if (moderateCount > 0) {
      md += `## 🟡 Moderate Issues (Nice to Fix)\n\n`;
      md += `<details>\n<summary>Click to expand moderate issues</summary>\n\n`;
      
      const moderateFindings = findings.filter(f => 
        f.severity === BounceFindingSeverity.MODERATE || 
        f.severity === BounceFindingSeverity.MEDIUM
      );
      
      for (const finding of moderateFindings) {
        // Generate task ID
        const areaCode = finding.area ? finding.area.toUpperCase().replace(/\s+/g, '-') : 'GENERAL';
        const taskId = `PKL-278651-${areaCode}-${String(finding.id).padStart(4, '0')}-FIX`;
        
        md += `### ${taskId}: ${finding.title}\n\n`;
        md += `**Priority**: P2 (Moderate)\n\n`;
        md += `**Description**: ${finding.description}\n\n`;
        
        if (finding.reproducibleSteps) {
          md += `**Reproduction Steps**:\n${finding.reproducibleSteps}\n\n`;
        }
        
        md += '\n---\n\n';
      }
      
      md += `</details>\n\n`;
    }
    
    // Add summary table at the end
    md += `## 📊 Issue Summary\n\n`;
    md += `| Area | Critical | High | Moderate | Total |\n`;
    md += `| ---- | -------- | ---- | -------- | ----- |\n`;
    
    let totalCritical = 0;
    let totalHigh = 0;
    let totalModerate = 0;
    
    for (const [area, areaFindings] of Object.entries(areaGroups)) {
      const criticalAreaCount = areaFindings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length;
      const highAreaCount = areaFindings.filter(f => f.severity === BounceFindingSeverity.HIGH).length;
      const moderateAreaCount = areaFindings.filter(f => 
        f.severity === BounceFindingSeverity.MODERATE || 
        f.severity === BounceFindingSeverity.MEDIUM
      ).length;
      
      totalCritical += criticalAreaCount;
      totalHigh += highAreaCount;
      totalModerate += moderateAreaCount;
      
      md += `| ${area} | ${criticalAreaCount} | ${highAreaCount} | ${moderateAreaCount} | ${areaFindings.length} |\n`;
    }
    
    md += `| **Total** | **${totalCritical}** | **${totalHigh}** | **${totalModerate}** | **${findings.length}** |\n\n`;
    
    // Add footer
    md += `---\n\n`;
    md += `Generated by Bounce Automated Testing System | Framework5.2 | ${new Date().toISOString()}\n`;
    
    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Write plan to file
    const fileName = `sprint-plan-${testRunId}-${new Date().toISOString().replace(/:/g, '-')}.md`;
    const filePath = path.join(reportsDir, fileName);
    
    fs.writeFileSync(filePath, md);
    
    console.log(`[Bounce] Sprint plan generated and saved to ${filePath}`);
    
    return filePath;
  }
}

// Export singleton instance
export const actionItemsGenerator = new ActionItemsGenerator();