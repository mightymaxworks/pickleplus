/**
 * PKL-278651-BOUNCE-0002-ACTIONS
 * Action Items Generator for Bounce Bug Reports
 * 
 * This module automatically generates actionable sprint items from Bounce bug reports,
 * using Framework 5.2 compliant codes and formatting.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import fs from 'fs';
import path from 'path';

/**
 * Represents a parsed bug from a Bounce report
 */
interface ParsedBug {
  id: string;
  title: string;
  severity: string;
  area: string;
  location: string;
  browser: string;
  description: string;
  evidence: string[];
  solutionPrompt: string;
}

/**
 * Represents an action item for fixing a bug
 */
interface ActionItem {
  id: string;
  sprintCode: string;
  title: string;
  description: string;
  severity: string;
  area: string;
  steps: string[];
  acceptanceCriteria: string[];
  estimatedEffort: string;
}

/**
 * Action Items Generator for Bounce Bug Reports
 */
class ActionItemsGenerator {
  /**
   * Parse a Bounce bug report file and extract the bugs
   * @param reportFilePath Path to the bug report file
   * @returns Array of parsed bugs
   */
  parseReportFile(reportFilePath: string): ParsedBug[] {
    try {
      // Read and parse the markdown report
      const reportContent = fs.readFileSync(reportFilePath, 'utf8');
      return this.parseReportContent(reportContent);
    } catch (error) {
      console.error(`[Bounce] Error parsing report file: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Parse the content of a bug report and extract bugs
   * @param reportContent Content of the bug report in markdown format
   * @returns Array of parsed bugs
   */
  parseReportContent(reportContent: string): ParsedBug[] {
    const bugs: ParsedBug[] = [];
    const bugSections = this.extractBugSections(reportContent);
    
    bugSections.forEach((section, index) => {
      const bug = this.parseBugSection(section, index + 1);
      if (bug) {
        bugs.push(bug);
      }
    });
    
    return bugs;
  }

  /**
   * Extract individual bug sections from the full report
   * @param reportContent Full report content
   * @returns Array of bug section strings
   */
  private extractBugSections(reportContent: string): string[] {
    const sections: string[] = [];
    
    // Find all bug sections (they start with ### Bug or #### Bug)
    const bugSectionRegex = /(?:####|###) Bug #\d+:[\s\S]*?(?=(?:####|###) Bug #\d+:|##(?!#)|$)/g;
    const matches = reportContent.match(bugSectionRegex);
    
    if (matches) {
      return matches;
    }
    
    return sections;
  }

  /**
   * Parse a single bug section into a structured bug object
   * @param section Bug section text
   * @param index Bug index for ID generation
   * @returns Parsed bug or null if parsing failed
   */
  private parseBugSection(section: string, index: number): ParsedBug | null {
    try {
      // Extract basic info
      const titleMatch = section.match(/(?:####|###) Bug #\d+: (.*)/);
      const severityMatch = section.match(/\*\*Severity:\*\* (.*)/);
      const locationMatch = section.match(/\*\*Location:\*\* (.*?)(?:$|\n)/m);
      const browserMatch = section.match(/\*\*Browser:\*\* (.*?)(?:$|\n)/m);
      const descriptionMatch = section.match(/\*\*Description:\*\*([\s\S]*?)(?:\n\n\*\*|$)/m);
      
      // Extract evidence and solution prompts
      const evidenceSection = section.match(/\*\*Evidence:\*\*([\s\S]*?)(?:\n\n\*\*|$)/m);
      const solutionPromptSection = section.match(/\*\*Solution Prompt:\*\*([\s\S]*?)(?:\n\n---|$)/m);
      
      if (!titleMatch || !severityMatch || !locationMatch) {
        console.warn(`[Bounce] Could not parse bug section: ${section.substring(0, 100)}...`);
        return null;
      }
      
      // Extract evidence items
      const evidence: string[] = [];
      if (evidenceSection && evidenceSection[1]) {
        const evidenceLines = evidenceSection[1].trim().split('\n');
        evidenceLines.forEach(line => {
          const item = line.trim().replace(/^- /, '');
          if (item) {
            evidence.push(item);
          }
        });
      }
      
      // Extract area from location
      const location = locationMatch[1].trim();
      let area = location.split(' ')[0]; // First part of location is usually the area
      
      // Clean up area by removing slashes or parentheses
      area = area.replace(/[()]/g, '').trim();
      
      return {
        id: `BUG-${index}`,
        title: titleMatch[1].trim(),
        severity: severityMatch[1].trim(),
        area,
        location,
        browser: browserMatch ? browserMatch[1].trim() : 'Unknown',
        description: descriptionMatch ? descriptionMatch[1].trim() : '',
        evidence,
        solutionPrompt: solutionPromptSection ? solutionPromptSection[1].trim() : ''
      };
    } catch (error) {
      console.error(`[Bounce] Error parsing bug section: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Generate action items from parsed bugs
   * @param bugs Array of parsed bugs
   * @returns Array of action items
   */
  generateActionItems(bugs: ParsedBug[]): ActionItem[] {
    return bugs.map(bug => this.createActionItem(bug));
  }

  /**
   * Create an action item from a parsed bug
   * @param bug Parsed bug
   * @returns Action item
   */
  private createActionItem(bug: ParsedBug): ActionItem {
    // Generate a Framework 5.2 compliant sprint code
    const area = bug.area.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const severityCode = this.getSeverityCode(bug.severity);
    const sprintCode = `PKL-278651-${area}-${severityCode}-${bug.id}`;
    
    // Generate steps from solution prompt
    const steps: string[] = [];
    const solutionLines = bug.solutionPrompt.split('\n');
    
    let inStepsList = false;
    for (const line of solutionLines) {
      if (line.trim().startsWith('-')) {
        inStepsList = true;
        steps.push(line.trim().substring(1).trim());
      } else if (inStepsList && line.trim() === '') {
        inStepsList = false;
      }
    }
    
    // If no steps were found, add a generic step
    if (steps.length === 0) {
      steps.push(`Fix the issue: ${bug.description}`);
    }
    
    // Generate acceptance criteria
    const acceptanceCriteria = [
      `The ${bug.title.toLowerCase()} issue is resolved`,
      `The fix works on ${bug.browser}`,
      `All existing functionality in the ${bug.area} area continues to work correctly`,
      `Bounce tests for this area pass with no regressions`
    ];
    
    // Estimate effort based on severity
    const estimatedEffort = this.estimateEffort(bug.severity);
    
    return {
      id: bug.id,
      sprintCode,
      title: `Fix: ${bug.title}`,
      description: `${bug.description}\n\nOriginal bug found in the ${bug.area} area on ${bug.browser}.`,
      severity: bug.severity,
      area: bug.area,
      steps,
      acceptanceCriteria,
      estimatedEffort
    };
  }

  /**
   * Get a short code for a severity level
   * @param severity Severity level
   * @returns Short code for the severity
   */
  private getSeverityCode(severity: string): string {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return '0001';
      case 'HIGH':
        return '0002';
      case 'MODERATE':
      case 'MEDIUM':
        return '0003';
      case 'LOW':
        return '0004';
      case 'INFO':
        return '0005';
      default:
        return '0000';
    }
  }

  /**
   * Estimate effort based on severity
   * @param severity Severity level
   * @returns Estimated effort
   */
  private estimateEffort(severity: string): string {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'Large (1-2 days)';
      case 'HIGH':
        return 'Medium (4-8 hours)';
      case 'MODERATE':
      case 'MEDIUM':
        return 'Medium (2-4 hours)';
      case 'LOW':
        return 'Small (1-2 hours)';
      case 'INFO':
        return 'XS (less than 1 hour)';
      default:
        return 'Medium (2-4 hours)';
    }
  }

  /**
   * Generate a markdown format sprint planning document from action items
   * @param actionItems Array of action items
   * @param reportDate Date of the report for reference
   * @returns Sprint planning document in markdown format
   */
  generateSprintPlanningDoc(actionItems: ActionItem[], reportDate: string): string {
    let doc = `# Bounce Bug Fixing Sprint Plan\n\n`;
    doc += `Generated from bug report dated ${reportDate}\n\n`;
    
    // Summary section
    doc += `## Sprint Summary\n\n`;
    doc += `This sprint focuses on fixing ${actionItems.length} issues detected by Bounce automated testing:\n\n`;
    
    const criticalCount = actionItems.filter(item => item.severity.toUpperCase() === 'CRITICAL').length;
    const highCount = actionItems.filter(item => item.severity.toUpperCase() === 'HIGH').length;
    const moderateCount = actionItems.filter(item => 
      item.severity.toUpperCase() === 'MODERATE' || item.severity.toUpperCase() === 'MEDIUM'
    ).length;
    const lowCount = actionItems.filter(item => item.severity.toUpperCase() === 'LOW').length;
    
    doc += `- Critical Issues: ${criticalCount}\n`;
    doc += `- High Priority Issues: ${highCount}\n`;
    doc += `- Moderate Issues: ${moderateCount}\n`;
    doc += `- Low Priority Issues: ${lowCount}\n\n`;
    
    // Estimated total effort
    let totalHours = 0;
    actionItems.forEach(item => {
      if (item.estimatedEffort.includes('days')) {
        // Assume 8 hours per day
        const days = parseInt(item.estimatedEffort.match(/(\d+)-(\d+)/)?.[2] || '1', 10);
        totalHours += days * 8;
      } else if (item.estimatedEffort.includes('hours')) {
        const hours = parseInt(item.estimatedEffort.match(/(\d+)-(\d+)/)?.[2] || '1', 10);
        totalHours += hours;
      } else {
        // Default 1 hour for anything else
        totalHours += 1;
      }
    });
    
    doc += `**Estimated Total Effort:** Approximately ${totalHours} hours\n\n`;
    
    // Action items section, sorted by severity
    doc += `## Action Items\n\n`;
    
    // Define the order of severities
    const severityOrder = ['CRITICAL', 'HIGH', 'MODERATE', 'MEDIUM', 'LOW', 'INFO'];
    
    // Sort action items by severity
    const sortedItems = [...actionItems].sort((a, b) => {
      const aIndex = severityOrder.indexOf(a.severity.toUpperCase());
      const bIndex = severityOrder.indexOf(b.severity.toUpperCase());
      return aIndex - bIndex;
    });
    
    // Generate a section for each action item
    sortedItems.forEach(item => {
      doc += `### ${item.sprintCode}: ${item.title}\n\n`;
      doc += `**Severity:** ${item.severity}\n`;
      doc += `**Area:** ${item.area}\n`;
      doc += `**Estimated Effort:** ${item.estimatedEffort}\n\n`;
      
      doc += `**Description:**\n${item.description}\n\n`;
      
      doc += `**Steps to Fix:**\n`;
      item.steps.forEach(step => {
        doc += `1. ${step}\n`;
      });
      doc += `\n`;
      
      doc += `**Acceptance Criteria:**\n`;
      item.acceptanceCriteria.forEach(criteria => {
        doc += `- [ ] ${criteria}\n`;
      });
      doc += `\n`;
      
      doc += `---\n\n`;
    });
    
    // Implementation strategy section
    doc += `## Implementation Strategy\n\n`;
    doc += `1. **Start with Critical Issues:** Begin with critical issues that affect core functionality\n`;
    doc += `2. **Group Related Issues:** Address issues in the same area together to minimize context switching\n`;
    doc += `3. **Verify with Bounce:** Re-run Bounce tests after each fix to verify the issue is resolved\n`;
    doc += `4. **Regression Testing:** Ensure fixes don't introduce new issues\n\n`;
    
    // Dependencies and risks section
    doc += `## Dependencies and Risks\n\n`;
    doc += `- Some fixes may require coordination with other team members\n`;
    doc += `- Critical issues may require more investigation than initially estimated\n`;
    doc += `- Fixing UI-related issues may require design input for optimal solutions\n\n`;
    
    return doc;
  }

  /**
   * Find the latest bug report file in the reports directory
   * @param dateString Optional date string to find specific report
   * @returns Path to the report file or null if not found
   */
  findBugReportFile(dateString?: string): string | null {
    try {
      const reportsDir = path.resolve('./reports');
      
      if (!fs.existsSync(reportsDir)) {
        console.error(`[Bounce] Reports directory not found: ${reportsDir}`);
        return null;
      }
      
      const files = fs.readdirSync(reportsDir)
        .filter(file => file.startsWith('bounce_') && file.endsWith('.md'))
        .map(file => ({
          name: file,
          path: path.join(reportsDir, file),
          time: fs.statSync(path.join(reportsDir, file)).mtime.getTime()
        }));
      
      if (files.length === 0) {
        console.error('[Bounce] No bug report files found');
        return null;
      }
      
      if (dateString) {
        // Try to find a file containing the date string
        const matchingFile = files.find(file => file.name.includes(dateString));
        if (matchingFile) {
          return matchingFile.path;
        }
        
        console.error(`[Bounce] No bug report files found matching date: ${dateString}`);
        return null;
      }
      
      // Otherwise return the latest file
      files.sort((a, b) => b.time - a.time);
      return files[0].path;
    } catch (error) {
      console.error(`[Bounce] Error finding bug report file: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Generate action items from a report file and save to a sprint planning document
   * @param reportFilePath Path to the report file
   * @returns Path to the generated sprint planning document
   */
  generateActionItemsFromReport(reportFilePath: string): string {
    // Parse the report
    const bugs = this.parseReportFile(reportFilePath);
    
    // Generate action items
    const actionItems = this.generateActionItems(bugs);
    
    // Get report date from filename or default to current date
    const reportDateMatch = path.basename(reportFilePath).match(/bounce_.*?_(\d+)/);
    const reportDate = reportDateMatch 
      ? new Date(parseInt(reportDateMatch[1])).toLocaleDateString() 
      : new Date().toLocaleDateString();
    
    // Generate sprint planning document
    const sprintDoc = this.generateSprintPlanningDoc(actionItems, reportDate);
    
    // Save to file
    const outputPath = path.join(
      path.dirname(reportFilePath),
      `bounce_sprint_plan_${Date.now()}.md`
    );
    fs.writeFileSync(outputPath, sprintDoc, 'utf8');
    
    console.log(`[Bounce] Sprint planning document generated: ${outputPath}`);
    return outputPath;
  }
}

export const actionItemsGenerator = new ActionItemsGenerator();