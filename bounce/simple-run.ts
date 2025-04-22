/**
 * PKL-278651-BOUNCE-0011-CICD - Simple Bounce Test Runner
 * 
 * This version doesn't require external dependencies like Playwright
 * It generates a sample bug report to demonstrate the reporting functionality
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { db } from '../server/db';
import { eq } from 'drizzle-orm';
import { 
  bounceTestRuns, 
  bounceFindings,
  bounceEvidence,
  BounceTestRunStatus,
  BounceFindingSeverity,
  BounceEvidenceType
} from '../shared/schema/bounce';
import { bugReportGenerator } from './reporting';
import { actionItemsGenerator } from './action-items-generator';
import fs from 'fs';
import path from 'path';

/**
 * Run a simplified demo of the Bounce testing system
 * @returns The ID of the generated test run
 */
async function runSimpleDemo(): Promise<number> {
  console.log('[Bounce] Starting simple demo run...');
  
  // Create a test run
  const [testRun] = await db.insert(bounceTestRuns).values({
    name: `Bounce Simple Demo - ${new Date().toISOString()}`,
    description: 'A simple demo run that doesn\'t require external dependencies',
    status: BounceTestRunStatus.RUNNING,
    startedAt: new Date(),
    targetUrl: 'http://localhost:3000'
  }).returning();
  
  console.log(`[Bounce] Created test run ${testRun.id}`);
  
  // Simulate finding issues
  const findings = [];
  
  // Add some sample findings
  const [finding1] = await db.insert(bounceFindings).values({
    testRunId: testRun.id,
    title: 'Mobile responsive layout issue on community page',
    description: 'The community page layout breaks on mobile viewport widths below 375px. Text overlaps and buttons become inaccessible.',
    severity: BounceFindingSeverity.HIGH,
    area: 'Community',
    path: '/communities',
    browser: 'Chrome Mobile',
    isModifying: false,
    deviceInfo: JSON.stringify({
      viewport: '320x568',
      userAgent: 'Mobile Safari',
      devicePixelRatio: 2
    })
  }).returning();
  
  findings.push(finding1);
  
  const [finding2] = await db.insert(bounceFindings).values({
    testRunId: testRun.id,
    title: 'Authentication persistence issue after browser refresh',
    description: 'User is logged out when refreshing the profile page. This only happens in Firefox.',
    severity: BounceFindingSeverity.CRITICAL,
    area: 'Authentication',
    path: '/profile',
    browser: 'Firefox',
    isModifying: false,
    deviceInfo: JSON.stringify({
      viewport: '1280x800',
      userAgent: 'Firefox/112.0',
      devicePixelRatio: 1
    })
  }).returning();
  
  findings.push(finding2);
  
  const [finding3] = await db.insert(bounceFindings).values({
    testRunId: testRun.id,
    title: 'Tournament bracket rendering incorrectly',
    description: 'The tournament bracket visualization renders incorrectly when there are more than 16 participants. Some participant names are cut off.',
    severity: BounceFindingSeverity.MODERATE,
    area: 'Tournaments',
    path: '/tournaments/12/bracket',
    browser: 'Chrome',
    isModifying: false,
    deviceInfo: JSON.stringify({
      viewport: '1920x1080',
      userAgent: 'Chrome/111.0',
      devicePixelRatio: 1
    })
  }).returning();
  
  findings.push(finding3);
  
  // Add some evidence
  for (const finding of findings) {
    // Create mock screenshot evidence
    const screenshotDir = path.join(process.cwd(), 'evidence');
    
    // Ensure directory exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotDir, `finding-${finding.id}-screenshot.png`);
    
    // Create an empty file if it doesn't exist
    if (!fs.existsSync(screenshotPath)) {
      fs.writeFileSync(screenshotPath, Buffer.from('Mock screenshot data'));
    }
    
    // Store evidence reference in database
    // This would normally point to actual evidence files
    await db.insert(bounceEvidence).values({
      findingId: finding.id,
      type: 'SCREENSHOT',
      filePath: screenshotPath,
      description: 'Screenshot showing the issue'
    });
  }
  
  // Update the test run as completed
  await db.update(bounceTestRuns)
    .set({
      status: BounceTestRunStatus.COMPLETED,
      completedAt: new Date(),
      totalFindings: findings.length,
      results: JSON.stringify({
        findings: findings.length,
        criticalIssues: findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length,
        highIssues: findings.filter(f => f.severity === BounceFindingSeverity.HIGH).length,
        moderateIssues: findings.filter(f => f.severity === BounceFindingSeverity.MODERATE).length,
        lowIssues: findings.filter(f => f.severity === BounceFindingSeverity.LOW).length
      })
    })
    .where(eq(bounceTestRuns.id, testRun.id));
  
  console.log(`[Bounce] Test run completed with ${findings.length} findings`);
  
  // Generate the bug report
  const reportPath = await bugReportGenerator.generateReport(testRun.id);
  console.log(`[Bounce] Bug report generated: ${reportPath}`);
  
  // Generate action items
  const sprintPath = await actionItemsGenerator.generateActionItems(testRun.id);
  console.log(`[Bounce] Sprint plan generated: ${sprintPath}`);
  
  return testRun.id;
}

export { runSimpleDemo };

// If this script is run directly
if (require.main === module) {
  runSimpleDemo()
    .then((testRunId) => {
      console.log(`\nSimple demo completed with test run ID: ${testRunId}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error running simple demo:', error);
      process.exit(1);
    });
}