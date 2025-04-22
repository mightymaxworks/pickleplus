/**
 * PKL-278651-BOUNCE-0002-CICD - Bounce Identity Core
 * 
 * Core identity functionality for the Bounce testing system
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { db } from '../../server/db';
import { bounceTestRuns, BounceTestRunStatus } from '../../shared/schema/bounce';
import { eq } from 'drizzle-orm';

/**
 * Bounce Identity Service
 * Manages test run identity and tracking
 */
class BounceIdentity {
  /**
   * Create a new test run
   * @param testRun Test run data
   * @returns ID of the created test run
   */
  async createTestRun(testRun: {
    name: string;
    targetUrl?: string;
    testConfig?: string;
    startedAt: Date;
    status: BounceTestRunStatus;
  }): Promise<number> {
    console.log(`[Bounce] Creating test run: ${testRun.name}`);
    
    // Insert the test run into the database
    const [createdTestRun] = await db.insert(bounceTestRuns).values({
      name: testRun.name,
      targetUrl: testRun.targetUrl,
      testConfig: testRun.testConfig,
      startedAt: testRun.startedAt,
      status: testRun.status,
      totalFindings: 0,
      createdAt: new Date()
    }).returning();
    
    if (!createdTestRun || !createdTestRun.id) {
      throw new Error('Failed to create test run');
    }
    
    console.log(`[Bounce] Created test run with ID: ${createdTestRun.id}`);
    
    return createdTestRun.id;
  }

  /**
   * Get a test run by ID
   * @param id Test run ID
   * @returns Test run data
   */
  async getTestRun(id: number) {
    const [testRun] = await db
      .select()
      .from(bounceTestRuns)
      .where(eq(bounceTestRuns.id, id));
    
    return testRun;
  }

  /**
   * Update a test run
   * @param id Test run ID
   * @param updates Updates to apply
   * @returns Updated test run
   */
  async updateTestRun(id: number, updates: Partial<typeof bounceTestRuns.$inferInsert>) {
    console.log(`[Bounce] Updating test run ${id}`);
    
    const [updatedTestRun] = await db
      .update(bounceTestRuns)
      .set(updates)
      .where(eq(bounceTestRuns.id, id))
      .returning();
    
    return updatedTestRun;
  }

  /**
   * List all test runs
   * @param limit Maximum number of test runs to return
   * @param offset Offset for pagination
   * @returns List of test runs
   */
  async listTestRuns(limit = 10, offset = 0) {
    const testRuns = await db
      .select()
      .from(bounceTestRuns)
      .orderBy(bounceTestRuns.createdAt)
      .limit(limit)
      .offset(offset);
    
    return testRuns;
  }
}

// Export singleton instance
export const bounceIdentity = new BounceIdentity();