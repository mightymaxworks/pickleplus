/**
 * PKL-278651-BOUNCE-0003-CORE - Bounce Identity Module
 * 
 * This module handles the identity management for the Bounce testing system,
 * including test run tracking and user association.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { db } from '../../server/db';
import { eq } from 'drizzle-orm';
import { 
  bounceTestRuns, 
  BounceTestRunStatus 
} from '../../shared/schema/bounce';
import { randomUUID } from 'crypto';

/**
 * Bounce Identity Service
 * Manages identities for automated testing, including test run creation and tracking
 */
class BounceIdentity {
  /**
   * Current test run ID
   */
  private currentTestRunId: number = 0;
  
  /**
   * User ID associated with the test run
   */
  private userId: number | null = null;
  
  /**
   * Whether the identity service is in CI mode
   */
  private ciMode: boolean = false;
  
  /**
   * Start a new test run
   * @param browsers Comma-separated list of browsers being tested
   * @param testTypes Types of tests being run
   * @param userId Optional user ID to associate with the test run
   * @returns The ID of the created test run
   */
  async startTestRun(
    browsers: string,
    testTypes: string,
    userId?: number
  ): Promise<number> {
    try {
      // Generate a unique test ID
      const testId = randomUUID();
      
      // Create a new test run record
      const [testRun] = await db.insert(bounceTestRuns).values({
        name: `Bounce Test Run - ${new Date().toISOString()}`,
        description: `Automated test run for browsers: ${browsers}, test types: ${testTypes}`,
        status: BounceTestRunStatus.RUNNING,
        startedAt: new Date(),
        userId: userId || null,
        targetUrl: process.env.APP_URL || 'http://localhost:3000',
        testConfig: JSON.stringify({
          browsers: browsers.split(','),
          testTypes: testTypes.split(','),
          ciMode: this.ciMode,
          timestamp: new Date().toISOString()
        })
      }).returning();
      
      // Store the current test run ID
      this.currentTestRunId = testRun.id;
      this.userId = userId || null;
      
      console.log(`[Bounce] Started test run ${testRun.id} with test ID ${testId}`);
      return testRun.id;
    } catch (error) {
      console.error(`[Bounce] Error starting test run: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * End a test run
   * @param status Status of the test run
   * @param findingsCount Number of findings discovered
   * @param coveragePercent Coverage percentage achieved
   * @returns The updated test run
   */
  async endTestRun(
    status: BounceTestRunStatus,
    findingsCount: number,
    coveragePercent: number
  ): Promise<any> {
    if (!this.currentTestRunId) {
      throw new Error('No active test run. Call startTestRun() first.');
    }
    
    try {
      // Update the test run record
      const [testRun] = await db
        .update(bounceTestRuns)
        .set({
          status,
          completedAt: new Date(),
          totalFindings: findingsCount,
          updatedAt: new Date()
        })
        .where(eq(bounceTestRuns.id, this.currentTestRunId))
        .returning();
      
      console.log(`[Bounce] Ended test run ${testRun.id} with status ${status}`);
      console.log(`[Bounce] Findings: ${findingsCount}, Coverage: ${coveragePercent}%`);
      
      // Reset the current test run
      this.currentTestRunId = 0;
      
      return testRun;
    } catch (error) {
      console.error(`[Bounce] Error ending test run: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Get the current test run ID
   * @returns The current test run ID
   */
  getCurrentTestRunId(): number {
    return this.currentTestRunId;
  }
  
  /**
   * Get the user ID associated with the test run
   * @returns The user ID
   */
  getUserId(): number | null {
    return this.userId;
  }
  
  /**
   * Set CI mode
   * @param enabled Whether CI mode is enabled
   */
  setCIMode(enabled: boolean): void {
    this.ciMode = enabled;
    console.log(`[Bounce] CI mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Check if CI mode is enabled
   * @returns Whether CI mode is enabled
   */
  isCIMode(): boolean {
    return this.ciMode;
  }
  
  /**
   * Reset the identity service
   */
  reset(): void {
    this.currentTestRunId = 0;
    this.userId = null;
    this.ciMode = false;
    console.log('[Bounce] Identity service reset');
  }
  
  /**
   * Create a new test run with specific configuration
   * @param config Test run configuration
   * @returns The ID of the created test run
   */
  async createTestRun(config: {
    name: string;
    status: BounceTestRunStatus;
    configuration?: Record<string, any>;
  }): Promise<number> {
    try {
      // Create a new test run record
      const [testRun] = await db.insert(bounceTestRuns).values({
        name: config.name,
        status: config.status,
        startedAt: new Date(),
        configuration: config.configuration ? JSON.stringify(config.configuration) : null
      }).returning();
      
      // Store the current test run ID
      this.currentTestRunId = testRun.id;
      
      console.log(`[Bounce] Created test run ${testRun.id} with name "${config.name}"`);
      return testRun.id;
    } catch (error) {
      console.error(`[Bounce] Error creating test run: ${(error as Error).message}`);
      throw error;
    }
  }
  
  /**
   * Update an existing test run
   * @param testRunId ID of the test run to update
   * @param updateData Data to update
   * @returns The updated test run
   */
  async updateTestRun(
    testRunId: number,
    updateData: {
      status?: BounceTestRunStatus;
      completedAt?: Date;
      results?: Record<string, any>;
      totalFindings?: number;
    }
  ): Promise<any> {
    try {
      // Update the test run record
      const [testRun] = await db
        .update(bounceTestRuns)
        .set({
          ...updateData,
          results: updateData.results ? JSON.stringify(updateData.results) : undefined,
          updatedAt: new Date()
        })
        .where(eq(bounceTestRuns.id, testRunId))
        .returning();
      
      console.log(`[Bounce] Updated test run ${testRun.id} with status ${updateData.status || 'unchanged'}`);
      
      return testRun;
    } catch (error) {
      console.error(`[Bounce] Error updating test run: ${(error as Error).message}`);
      throw error;
    }
  }
}

// Export a singleton instance
export const bounceIdentity = new BounceIdentity();