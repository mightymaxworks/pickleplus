/**
 * PKL-278651-BOUNCE-0001-CORE - Bounce Automated Testing System
 * API Handlers
 * 
 * This module provides the database access layer for the Bounce testing system.
 * 
 * @version 1.0.0
 * @framework Framework5.2
 * @lastModified 2025-04-21
 */

import { db } from '../../db';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import { 
  bounceTestRuns,
  bounceFindings,
  bounceEvidence,
  bounceSchedules,
  bounceInteractions,
  BounceTestRunStatus,
  BounceFindingSeverity,
  BounceFindingStatus,
  BounceInteractionType
} from '@shared/schema';

/**
 * Creates a new test run in the database
 * @param testRunData The test run data to create
 * @returns The created test run record
 */
export async function createTestRun(testRunData: any) {
  try {
    const [newTestRun] = await db.insert(bounceTestRuns)
      .values({
        name: testRunData.name,
        description: testRunData.description,
        status: BounceTestRunStatus.PLANNED,
        targetUrl: testRunData.targetUrl,
        testConfig: testRunData.testConfig,
        userId: testRunData.userId
      })
      .returning();
    
    return { success: true, testRun: newTestRun };
  } catch (error) {
    console.error('Error creating test run:', error);
    return { success: false, error: 'Failed to create test run' };
  }
}

/**
 * Retrieves all test runs from the database
 * @param limit Optional limit on the number of records to return
 * @param offset Optional offset for pagination
 * @returns List of test runs
 */
export async function getTestRuns(limit = 10, offset = 0) {
  try {
    const testRuns = await db.select()
      .from(bounceTestRuns)
      .orderBy(desc(bounceTestRuns.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { success: true, testRuns };
  } catch (error) {
    console.error('Error retrieving test runs:', error);
    return { success: false, error: 'Failed to retrieve test runs' };
  }
}

/**
 * Retrieves a specific test run by ID
 * @param id The test run ID
 * @returns The test run record
 */
export async function getTestRunById(id: number) {
  try {
    const [testRun] = await db.select()
      .from(bounceTestRuns)
      .where(eq(bounceTestRuns.id, id));
    
    if (!testRun) {
      return { success: false, error: 'Test run not found' };
    }
    
    return { success: true, testRun };
  } catch (error) {
    console.error(`Error retrieving test run with ID ${id}:`, error);
    return { success: false, error: 'Failed to retrieve test run' };
  }
}

/**
 * Updates the status of a test run
 * @param id The test run ID
 * @param status The new status
 * @returns The updated test run
 */
export async function updateTestRunStatus(id: number, status: BounceTestRunStatus) {
  try {
    const [updatedTestRun] = await db.update(bounceTestRuns)
      .set({ 
        status,
        ...(status === BounceTestRunStatus.RUNNING ? { startedAt: new Date() } : {}),
        ...(status === BounceTestRunStatus.COMPLETED || status === BounceTestRunStatus.FAILED ? { completedAt: new Date() } : {})
      })
      .where(eq(bounceTestRuns.id, id))
      .returning();
    
    if (!updatedTestRun) {
      return { success: false, error: 'Test run not found' };
    }
    
    return { success: true, testRun: updatedTestRun };
  } catch (error) {
    console.error(`Error updating test run status for ID ${id}:`, error);
    return { success: false, error: 'Failed to update test run status' };
  }
}

/**
 * Creates a new finding in the database
 * @param findingData The finding data to create
 * @returns The created finding record
 */
export async function createFinding(findingData: any) {
  try {
    const [newFinding] = await db.insert(bounceFindings)
      .values({
        testRunId: findingData.testRunId,
        title: findingData.title,
        description: findingData.description,
        severity: findingData.severity || BounceFindingSeverity.MEDIUM,
        status: findingData.status || BounceFindingStatus.NEW,
        reproducibleSteps: findingData.reproducibleSteps,
        affectedUrl: findingData.affectedUrl,
        browserInfo: findingData.browserInfo,
        reportedByUserId: findingData.reportedByUserId
      })
      .returning();
    
    // Update the test run's finding count
    await updateTestRunFindingCount(findingData.testRunId);
    
    return { success: true, finding: newFinding };
  } catch (error) {
    console.error('Error creating finding:', error);
    return { success: false, error: 'Failed to create finding' };
  }
}

/**
 * Updates the total findings count for a test run
 * @param testRunId The test run ID
 */
async function updateTestRunFindingCount(testRunId: number) {
  try {
    // Count findings for this test run
    const [result] = await db.select({ count: count() })
      .from(bounceFindings)
      .where(eq(bounceFindings.testRunId, testRunId));
    
    // Update the test run with the count
    await db.update(bounceTestRuns)
      .set({ totalFindings: result.count })
      .where(eq(bounceTestRuns.id, testRunId));
  } catch (error) {
    console.error(`Error updating finding count for test run ${testRunId}:`, error);
  }
}

/**
 * Retrieves findings with pagination and filtering options
 * @param options Filtering and pagination options
 * @returns List of findings and pagination metadata
 */
export async function getFindings(options: {
  testRunId?: number;
  severity?: BounceFindingSeverity;
  status?: BounceFindingStatus;
  limit?: number;
  offset?: number;
}) {
  try {
    const { testRunId, severity, status, limit = 10, offset = 0 } = options;
    
    // Build where clauses
    let whereClause = true as any;
    
    if (testRunId) {
      whereClause = and(whereClause, eq(bounceFindings.testRunId, testRunId));
    }
    
    if (severity) {
      whereClause = and(whereClause, eq(bounceFindings.severity, severity));
    }
    
    if (status) {
      whereClause = and(whereClause, eq(bounceFindings.status, status));
    }
    
    // Get findings with pagination
    const findings = await db.select()
      .from(bounceFindings)
      .where(whereClause)
      .orderBy(desc(bounceFindings.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    const [totalCount] = await db.select({ count: count() })
      .from(bounceFindings)
      .where(whereClause);
    
    return { 
      success: true, 
      findings,
      pagination: {
        totalItems: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit),
        currentPage: Math.floor(offset / limit) + 1,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    console.error('Error retrieving findings:', error);
    return { success: false, error: 'Failed to retrieve findings' };
  }
}

/**
 * Retrieves a specific finding by ID
 * @param id The finding ID
 * @returns The finding
 */
export async function getFindingById(id: number) {
  try {
    const [finding] = await db.select()
      .from(bounceFindings)
      .where(eq(bounceFindings.id, id));
    
    if (!finding) {
      return { success: false, error: 'Finding not found' };
    }
    
    return { success: true, finding };
  } catch (error) {
    console.error(`Error retrieving finding with ID ${id}:`, error);
    return { success: false, error: 'Failed to retrieve finding' };
  }
}

/**
 * Updates the status of a finding
 * @param id The finding ID
 * @param status The new status
 * @param assignedToUserId Optional user ID to assign the finding to
 * @returns The updated finding
 */
export async function updateFindingStatus(id: number, status: BounceFindingStatus, assignedToUserId?: number) {
  try {
    const [updatedFinding] = await db.update(bounceFindings)
      .set({ 
        status,
        ...(assignedToUserId ? { assignedToUserId } : {}),
        ...(status === BounceFindingStatus.FIXED ? { fixedAt: new Date() } : {})
      })
      .where(eq(bounceFindings.id, id))
      .returning();
    
    if (!updatedFinding) {
      return { success: false, error: 'Finding not found' };
    }
    
    return { success: true, finding: updatedFinding };
  } catch (error) {
    console.error(`Error updating finding status for ID ${id}:`, error);
    return { success: false, error: 'Failed to update finding status' };
  }
}

/**
 * Creates a new evidence record for a finding
 * @param evidenceData The evidence data to create
 * @returns The created evidence record
 */
export async function createEvidence(evidenceData: any) {
  try {
    const [newEvidence] = await db.insert(bounceEvidence)
      .values({
        findingId: evidenceData.findingId,
        type: evidenceData.type || 'screenshot',
        content: evidenceData.content,
        metadata: evidenceData.metadata
      })
      .returning();
    
    return { success: true, evidence: newEvidence };
  } catch (error) {
    console.error('Error creating evidence:', error);
    return { success: false, error: 'Failed to create evidence' };
  }
}

/**
 * Retrieves evidence for a specific finding
 * @param findingId The finding ID
 * @returns List of evidence for the finding
 */
export async function getEvidenceForFinding(findingId: number) {
  try {
    const evidence = await db.select()
      .from(bounceEvidence)
      .where(eq(bounceEvidence.findingId, findingId))
      .orderBy(bounceEvidence.createdAt);
    
    return { success: true, evidence };
  } catch (error) {
    console.error(`Error retrieving evidence for finding ${findingId}:`, error);
    return { success: false, error: 'Failed to retrieve evidence' };
  }
}

/**
 * Creates a new test schedule
 * @param scheduleData The schedule data to create
 * @returns The created schedule record
 */
export async function createTestSchedule(scheduleData: any) {
  try {
    const [newSchedule] = await db.insert(bounceSchedules)
      .values({
        name: scheduleData.name,
        description: scheduleData.description,
        cronExpression: scheduleData.cronExpression,
        testConfig: scheduleData.testConfig,
        isActive: scheduleData.isActive !== undefined ? scheduleData.isActive : true
      })
      .returning();
    
    return { success: true, schedule: newSchedule };
  } catch (error) {
    console.error('Error creating test schedule:', error);
    return { success: false, error: 'Failed to create test schedule' };
  }
}

/**
 * Records a user interaction with a finding for gamification
 * @param interactionData The interaction data to record
 * @returns The created interaction record
 */
export async function recordUserInteraction(interactionData: any) {
  try {
    const [newInteraction] = await db.insert(bounceInteractions)
      .values({
        userId: interactionData.userId,
        findingId: interactionData.findingId,
        type: interactionData.type || BounceInteractionType.VIEW_REPORT,
        points: interactionData.points || getDefaultPointsForInteraction(interactionData.type),
        metadata: interactionData.metadata
      })
      .returning();
    
    return { success: true, interaction: newInteraction };
  } catch (error) {
    console.error('Error recording user interaction:', error);
    return { success: false, error: 'Failed to record user interaction' };
  }
}

/**
 * Gets the default points value for an interaction type
 * @param type The interaction type
 * @returns The default points value
 */
function getDefaultPointsForInteraction(type: BounceInteractionType): number {
  switch (type) {
    case BounceInteractionType.REPORT_ISSUE:
      return 50;
    case BounceInteractionType.CONFIRM_FINDING:
      return 25;
    case BounceInteractionType.DISPUTE_FINDING:
      return 10;
    case BounceInteractionType.PROVIDE_FEEDBACK:
      return 30;
    case BounceInteractionType.VIEW_REPORT:
      return 5;
    default:
      return 10;
  }
}

/**
 * Gets statistics about the Bounce system
 * @returns Various statistics about test runs and findings
 */
export async function getSystemStatistics() {
  try {
    // Get total test runs
    const [testRunsCount] = await db.select({ count: count() })
      .from(bounceTestRuns);
    
    // Get total findings
    const [findingsCount] = await db.select({ count: count() })
      .from(bounceFindings);
    
    // Get counts by severity
    const severityCounts = await Promise.all([
      db.select({ count: count() })
        .from(bounceFindings)
        .where(eq(bounceFindings.severity, BounceFindingSeverity.CRITICAL)),
      db.select({ count: count() })
        .from(bounceFindings)
        .where(eq(bounceFindings.severity, BounceFindingSeverity.HIGH)),
      db.select({ count: count() })
        .from(bounceFindings)
        .where(eq(bounceFindings.severity, BounceFindingSeverity.MEDIUM)),
      db.select({ count: count() })
        .from(bounceFindings)
        .where(eq(bounceFindings.severity, BounceFindingSeverity.LOW))
    ]);
    
    // Get findings in triage
    const [triageFindingsCount] = await db.select({ count: count() })
      .from(bounceFindings)
      .where(eq(bounceFindings.status, BounceFindingStatus.TRIAGE));
    
    // Get fixed findings
    const [fixedFindingsCount] = await db.select({ count: count() })
      .from(bounceFindings)
      .where(eq(bounceFindings.status, BounceFindingStatus.FIXED));
    
    // Get the most recent test run
    const [lastTestRun] = await db.select()
      .from(bounceTestRuns)
      .orderBy(desc(bounceTestRuns.createdAt))
      .limit(1);
    
    return { 
      success: true, 
      statistics: {
        totalTestRuns: testRunsCount.count,
        totalFindings: findingsCount.count,
        criticalFindings: severityCounts[0][0].count,
        highFindings: severityCounts[1][0].count,
        mediumFindings: severityCounts[2][0].count,
        lowFindings: severityCounts[3][0].count,
        triageFindings: triageFindingsCount.count,
        fixedFindings: fixedFindingsCount.count,
        lastTestRun
      }
    };
  } catch (error) {
    console.error('Error getting system statistics:', error);
    return { success: false, error: 'Failed to retrieve system statistics' };
  }
}