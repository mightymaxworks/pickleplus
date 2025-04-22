/**
 * PKL-278651-BOUNCE-0003-CORE - Bounce Identity
 * 
 * Manages core identity and state for the Bounce testing system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { db } from '../../server/db';
import { eq } from 'drizzle-orm';
import { 
  bounceTestRuns, 
  BounceTestRunStatus, 
  BounceFindingSeverity, 
  bounceFindings 
} from '../../shared/schema/bounce';

/**
 * Class that manages core identity and state for the Bounce testing system
 */
class BounceIdentity {
  private testRunId: number | null = null;
  
  /**
   * Start a new test run
   * @param browser Browser being used
   * @param deviceType Device type (mobile or desktop)
   * @returns ID of the created test run
   */
  async startTestRun(browser: string, deviceType: string): Promise<number> {
    console.log(`[Bounce] Starting new test run (${browser}, ${deviceType})`);
    
    const [testRun] = await db.insert(bounceTestRuns).values({
      name: `Bounce Test Run - ${browser} - ${deviceType} - ${new Date().toISOString()}`,
      description: `Automated test run using ${browser} on ${deviceType}`,
      status: BounceTestRunStatus.RUNNING,
      startedAt: new Date(),
      targetUrl: 'http://localhost:3000',
      testConfig: JSON.stringify({
        browser,
        deviceType,
        timestamp: new Date().toISOString()
      })
    }).returning();
    
    this.testRunId = testRun.id;
    console.log(`[Bounce] Created test run with ID ${testRun.id}`);
    
    return testRun.id;
  }
  
  /**
   * End a test run with status and finding count
   * @param status Status of the test run
   * @param findingCount Number of findings
   * @param coverage Percentage of code covered (if available)
   */
  async endTestRun(
    status: BounceTestRunStatus,
    findingCount: number,
    coverage?: number
  ): Promise<void> {
    if (!this.testRunId) {
      throw new Error('[Bounce] No active test run');
    }
    
    console.log(`[Bounce] Ending test run ${this.testRunId} with status ${status} and ${findingCount} findings`);
    
    const results: Record<string, any> = {
      findingCount,
      coverage: coverage || 0,
      completedAt: new Date().toISOString()
    };
    
    // Get counts by severity
    const findings = await db
      .select()
      .from(bounceFindings)
      .where(eq(bounceFindings.testRunId, this.testRunId));
    
    results.criticalCount = findings.filter(f => f.severity === BounceFindingSeverity.CRITICAL).length;
    results.highCount = findings.filter(f => f.severity === BounceFindingSeverity.HIGH).length;
    results.moderateCount = findings.filter(f => 
      f.severity === BounceFindingSeverity.MODERATE || 
      f.severity === BounceFindingSeverity.MEDIUM
    ).length;
    results.lowCount = findings.filter(f => 
      f.severity === BounceFindingSeverity.LOW || 
      f.severity === BounceFindingSeverity.INFO
    ).length;
    
    // Update the test run
    await db.update(bounceTestRuns)
      .set({
        status,
        completedAt: new Date(),
        totalFindings: findingCount,
        results: JSON.stringify(results)
      })
      .where(eq(bounceTestRuns.id, this.testRunId));
    
    console.log(`[Bounce] Test run ${this.testRunId} completed with status ${status}`);
    
    // Reset the test run ID
    this.testRunId = null;
  }
  
  /**
   * Get the current test run ID
   * @returns Current test run ID
   */
  getTestRunId(): number | null {
    return this.testRunId;
  }
  
  /**
   * Set the current test run ID manually
   * @param id Test run ID to set
   */
  setTestRunId(id: number): void {
    this.testRunId = id;
  }
  
  /**
   * Get information about a test run
   * @param id Test run ID
   * @returns Test run information
   */
  async getTestRun(id: number): Promise<any> {
    const [testRun] = await db
      .select()
      .from(bounceTestRuns)
      .where(eq(bounceTestRuns.id, id));
    
    if (!testRun) {
      throw new Error(`[Bounce] Test run ${id} not found`);
    }
    
    return testRun;
  }
  
  /**
   * Get all test runs
   * @returns List of all test runs
   */
  async getAllTestRuns(): Promise<any[]> {
    return db
      .select()
      .from(bounceTestRuns)
      .orderBy(bounceTestRuns.createdAt);
  }
  
  /**
   * Get all findings for a test run
   * @param testRunId Test run ID
   * @returns List of findings
   */
  async getFindings(testRunId: number): Promise<any[]> {
    return db
      .select()
      .from(bounceFindings)
      .where(eq(bounceFindings.testRunId, testRunId));
  }
}

// Export singleton instance
export const bounceIdentity = new BounceIdentity();