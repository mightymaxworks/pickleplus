/**
 * PKL-278651-BOUNCE-0012-CICD - Action Items Generator
 * 
 * Generates actionable sprint plan items from bug reports in Framework 5.2 format.
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

// Define sprint planning interfaces
interface SprintItem {
  id: string;
  title: string;
  description: string;
  severity: string;
  area: string;
  assignedTo?: string;
  estimatedTime?: string;
  priority: number;
  testRunId: number;
  findingId: number;
}

interface SprintPlan {
  name: string;
  date: string;
  testRunId: number;
  items: SprintItem[];
  totalCritical: number;
  totalHigh: number;
  totalModerate: number;
  totalLow: number;
}

class ActionItemsGenerator {
  /**
   * Generate action items from a test run
   * @param testRunId ID of the test run
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
    
    // Create sprint items from findings
    const sprintItems: SprintItem[] = findings.map((finding, index) => {
      // Calculate priority based on severity
      const priorityMap: Record<string, number> = {
        [BounceFindingSeverity.CRITICAL]: 1,
        [BounceFindingSeverity.HIGH]: 2,
        [BounceFindingSeverity.MODERATE]: 3,
        [BounceFindingSeverity.MEDIUM]: 3, // For backward compatibility
        [BounceFindingSeverity.LOW]: 4,
        [BounceFindingSeverity.INFO]: 5
      };
      
      // Calculate estimated time based on severity
      const estimatedTimeMap: Record<string, string> = {
        [BounceFindingSeverity.CRITICAL]: '1d',
        [BounceFindingSeverity.HIGH]: '4h',
        [BounceFindingSeverity.MODERATE]: '2h',
        [BounceFindingSeverity.MEDIUM]: '2h', // For backward compatibility
        [BounceFindingSeverity.LOW]: '1h',
        [BounceFindingSeverity.INFO]: '30m'
      };
      
      // Generate Framework5.2 compliant ID
      const area = finding.area || 'UNKNOWN';
      const areaUpper = area.toUpperCase().replace(/\\s+/g, '-');
      const id = `PKL-278651-${areaUpper}-${String(index + 1).padStart(4, '0')}-FIX`;
      
      return {
        id,
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        area: finding.area || 'General',
        estimatedTime: estimatedTimeMap[finding.severity] || '2h',
        priority: priorityMap[finding.severity] || 3,
        testRunId,
        findingId: finding.id
      };
    });
    
    // Sort items by priority
    sprintItems.sort((a, b) => a.priority - b.priority);
    
    // Create the sprint plan
    const sprintPlan: SprintPlan = {
      name: `Sprint Plan for Test Run: ${testRun.name}`,
      date: new Date().toISOString(),
      testRunId,
      items: sprintItems,
      totalCritical: findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length,
      totalHigh: findings.filter(f => f.severity === BounceFindingSeverity.HIGH).length,
      totalModerate: findings.filter(f => 
        f.severity === BounceFindingSeverity.MODERATE || 
        f.severity === BounceFindingSeverity.MEDIUM
      ).length,
      totalLow: findings.filter(f => 
        f.severity === BounceFindingSeverity.LOW || 
        f.severity === BounceFindingSeverity.INFO
      ).length
    };
    
    // Generate the markdown report
    const markdownReport = this.generateMarkdownPlan(sprintPlan);
    
    // Ensure directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Write the report to a file
    const fileName = `sprint-plan-${testRunId}-${new Date().toISOString().replace(/:/g, '-')}.md`;
    const filePath = path.join(reportsDir, fileName);
    fs.writeFileSync(filePath, markdownReport);
    
    console.log(`[Bounce] Action items generated and saved to ${filePath}`);
    
    return filePath;
  }
  
  /**
   * Generate a markdown report from a sprint plan
   * @param plan Sprint plan
   * @returns Markdown report
   */
  private generateMarkdownPlan(plan: SprintPlan): string {
    const dateStr = new Date(plan.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    let markdown = `# ${plan.name}\n\n`;
    markdown += `> Generated on ${dateStr}\n\n`;
    markdown += `## Overview\n\n`;
    markdown += `**Test Run ID:** ${plan.testRunId}\n\n`;
    markdown += `**Issue Counts:**\n\n`;
    markdown += `- Critical: ${plan.totalCritical}\n`;
    markdown += `- High: ${plan.totalHigh}\n`;
    markdown += `- Moderate: ${plan.totalModerate}\n`;
    markdown += `- Low: ${plan.totalLow}\n\n`;
    markdown += `## Action Items\n\n`;
    
    // Group by area
    const areaGroups: Record<string, SprintItem[]> = {};
    
    for (const item of plan.items) {
      if (!areaGroups[item.area]) {
        areaGroups[item.area] = [];
      }
      areaGroups[item.area].push(item);
    }
    
    // Generate markdown for each area
    for (const [area, items] of Object.entries(areaGroups)) {
      markdown += `### ${area}\n\n`;
      
      for (const item of items) {
        const priorityLabels: Record<number, string> = {
          1: '🔴 IMMEDIATE',
          2: '🟠 HIGH',
          3: '🟡 MEDIUM',
          4: '🟢 LOW',
          5: '🔵 INFO'
        };
        
        markdown += `#### ${item.id}: ${item.title}\n\n`;
        markdown += `> ${priorityLabels[item.priority]} | Est: ${item.estimatedTime}\n\n`;
        markdown += `${item.description}\n\n`;
        
        if (item.assignedTo) {
          markdown += `Assigned to: ${item.assignedTo}\n\n`;
        }
        
        markdown += `Finding ID: ${item.findingId}\n\n`;
        markdown += `---\n\n`;
      }
    }
    
    return markdown;
  }
}

export const actionItemsGenerator = new ActionItemsGenerator();