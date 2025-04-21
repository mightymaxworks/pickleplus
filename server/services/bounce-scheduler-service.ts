/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Scheduler Service
 * 
 * This service handles the scheduling and management of automated tests for the Bounce system.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from '../db';
import { eq, and, desc, asc, isNull, gte, sql } from 'drizzle-orm';
import { scheduledTests, testTemplates, SCHEDULE_FREQUENCY } from '@shared/schema';
import { cronExpressionFromFrequency, getNextRunDate } from '../utils/cron-helpers';
import { BounceTestRunnerService } from './bounce-test-runner-service';
import { TEST_RUN_TRIGGER } from '@shared/schema';
import { ServerEventBus } from '../core/events/server-event-bus';

class BounceSchedulerService {
  private testRunnerService: BounceTestRunnerService;
  private activeSchedules: Map<number, NodeJS.Timeout> = new Map();
  
  constructor(testRunnerService: BounceTestRunnerService) {
    this.testRunnerService = testRunnerService;
    this.setupEventListeners();
  }
  
  /**
   * Initialize the scheduler service
   */
  async initialize(): Promise<void> {
    try {
      console.log('[BounceScheduler] Initializing scheduler service');
      
      // Load all active scheduled tests
      const schedules = await this.getAllScheduledTests(true);
      
      // Schedule each active test
      for (const schedule of schedules) {
        await this.scheduleTest(schedule.id);
      }
      
      console.log(`[BounceScheduler] Initialized ${schedules.length} scheduled tests`);
    } catch (error) {
      console.error('[BounceScheduler] Error initializing scheduler service:', error);
    }
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for scheduled test run completion
    ServerEventBus.subscribe('testRun:completed', async (data: { runId: string, triggerId?: string }) => {
      if (data.triggerId) {
        try {
          const scheduleId = parseInt(data.triggerId);
          
          if (!isNaN(scheduleId)) {
            // Update the last run time for the schedule
            await db.update(scheduledTests)
              .set({
                lastRunAt: new Date(),
                updatedAt: new Date()
              })
              .where(eq(scheduledTests.id, scheduleId));
            
            console.log(`[BounceScheduler] Updated lastRunAt for schedule ${scheduleId}`);
          }
        } catch (error) {
          console.error(`[BounceScheduler] Error updating lastRunAt for schedule:`, error);
        }
      }
    });
  }
  
  /**
   * Get all scheduled tests
   */
  async getAllScheduledTests(activeOnly: boolean = false): Promise<any[]> {
    try {
      let query = db.select()
        .from(scheduledTests)
        .leftJoin(testTemplates, eq(scheduledTests.templateId, testTemplates.id))
        .orderBy(desc(scheduledTests.updatedAt));
      
      if (activeOnly) {
        query = query.where(eq(scheduledTests.isActive, true));
      }
      
      const results = await query;
      
      // Transform the results
      return results.map(row => ({
        id: row.scheduled_tests.id,
        name: row.scheduled_tests.name,
        description: row.scheduled_tests.description,
        frequency: row.scheduled_tests.frequency,
        cronExpression: row.scheduled_tests.cronExpression,
        isActive: row.scheduled_tests.isActive,
        createdAt: row.scheduled_tests.createdAt,
        updatedAt: row.scheduled_tests.updatedAt,
        lastRunAt: row.scheduled_tests.lastRunAt,
        nextRunAt: row.scheduled_tests.nextRunAt,
        createdBy: row.scheduled_tests.createdBy,
        templateId: row.scheduled_tests.templateId,
        notifyOnCompletion: row.scheduled_tests.notifyOnCompletion,
        notifyOnIssue: row.scheduled_tests.notifyOnIssue,
        template: row.test_templates ? {
          id: row.test_templates.id,
          name: row.test_templates.name,
          description: row.test_templates.description,
          configuration: row.test_templates.configuration,
          isActive: row.test_templates.isActive,
          createdAt: row.test_templates.createdAt,
          updatedAt: row.test_templates.updatedAt,
          createdBy: row.test_templates.createdBy
        } : null
      }));
    } catch (error) {
      console.error('[BounceScheduler] Error getting scheduled tests:', error);
      return [];
    }
  }
  
  /**
   * Get a specific scheduled test
   */
  async getScheduledTest(id: number): Promise<any | null> {
    try {
      const [result] = await db.select()
        .from(scheduledTests)
        .leftJoin(testTemplates, eq(scheduledTests.templateId, testTemplates.id))
        .where(eq(scheduledTests.id, id));
      
      if (!result) {
        return null;
      }
      
      // Transform the result
      return {
        id: result.scheduled_tests.id,
        name: result.scheduled_tests.name,
        description: result.scheduled_tests.description,
        frequency: result.scheduled_tests.frequency,
        cronExpression: result.scheduled_tests.cronExpression,
        isActive: result.scheduled_tests.isActive,
        createdAt: result.scheduled_tests.createdAt,
        updatedAt: result.scheduled_tests.updatedAt,
        lastRunAt: result.scheduled_tests.lastRunAt,
        nextRunAt: result.scheduled_tests.nextRunAt,
        createdBy: result.scheduled_tests.createdBy,
        templateId: result.scheduled_tests.templateId,
        notifyOnCompletion: result.scheduled_tests.notifyOnCompletion,
        notifyOnIssue: result.scheduled_tests.notifyOnIssue,
        template: result.test_templates ? {
          id: result.test_templates.id,
          name: result.test_templates.name,
          description: result.test_templates.description,
          configuration: result.test_templates.configuration,
          isActive: result.test_templates.isActive,
          createdAt: result.test_templates.createdAt,
          updatedAt: result.test_templates.updatedAt,
          createdBy: result.test_templates.createdBy
        } : null
      };
    } catch (error) {
      console.error(`[BounceScheduler] Error getting scheduled test ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new scheduled test
   */
  async createScheduledTest(data: {
    name: string;
    description?: string;
    templateId: number;
    frequency: SCHEDULE_FREQUENCY;
    cronExpression?: string;
    createdBy: number;
    notifyOnCompletion?: boolean;
    notifyOnIssue?: boolean;
  }): Promise<number | null> {
    try {
      // Validate the template exists
      const template = await db.query.testTemplates.findFirst({
        where: eq(testTemplates.id, data.templateId)
      });
      
      if (!template) {
        console.error(`[BounceScheduler] Template ${data.templateId} not found`);
        return null;
      }
      
      // Generate cron expression if not provided
      let cronExpression = data.cronExpression;
      
      if (!cronExpression && data.frequency !== SCHEDULE_FREQUENCY.CUSTOM) {
        cronExpression = cronExpressionFromFrequency(data.frequency);
      }
      
      if (!cronExpression) {
        console.error(`[BounceScheduler] Cron expression is required for custom frequency`);
        return null;
      }
      
      // Calculate next run time
      const nextRunAt = getNextRunDate(cronExpression);
      
      // Create the scheduled test
      const [result] = await db.insert(scheduledTests)
        .values({
          name: data.name,
          description: data.description || null,
          templateId: data.templateId,
          frequency: data.frequency,
          cronExpression,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          nextRunAt,
          createdBy: data.createdBy,
          notifyOnCompletion: data.notifyOnCompletion || false,
          notifyOnIssue: data.notifyOnIssue || false
        })
        .returning({ id: scheduledTests.id });
      
      const scheduleId = result.id;
      
      // Schedule the test
      await this.scheduleTest(scheduleId);
      
      console.log(`[BounceScheduler] Created scheduled test ${scheduleId} with next run at ${nextRunAt}`);
      
      return scheduleId;
    } catch (error) {
      console.error('[BounceScheduler] Error creating scheduled test:', error);
      return null;
    }
  }
  
  /**
   * Update a scheduled test
   */
  async updateScheduledTest(id: number, data: {
    name?: string;
    description?: string | null;
    templateId?: number;
    frequency?: SCHEDULE_FREQUENCY;
    cronExpression?: string | null;
    isActive?: boolean;
    notifyOnCompletion?: boolean;
    notifyOnIssue?: boolean;
  }): Promise<boolean> {
    try {
      // Get the current scheduled test
      const currentSchedule = await this.getScheduledTest(id);
      
      if (!currentSchedule) {
        console.error(`[BounceScheduler] Scheduled test ${id} not found`);
        return false;
      }
      
      // Build the update object
      const updateData: any = {
        updatedAt: new Date()
      };
      
      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      
      if (data.description !== undefined) {
        updateData.description = data.description;
      }
      
      if (data.templateId !== undefined) {
        // Validate the template exists
        const template = await db.query.testTemplates.findFirst({
          where: eq(testTemplates.id, data.templateId)
        });
        
        if (!template) {
          console.error(`[BounceScheduler] Template ${data.templateId} not found`);
          return false;
        }
        
        updateData.templateId = data.templateId;
      }
      
      // Handle frequency and cron expression
      if (data.frequency !== undefined) {
        updateData.frequency = data.frequency;
        
        // Generate cron expression if not provided and not custom
        if (data.frequency !== SCHEDULE_FREQUENCY.CUSTOM) {
          updateData.cronExpression = cronExpressionFromFrequency(data.frequency);
        }
      }
      
      if (data.cronExpression !== undefined) {
        updateData.cronExpression = data.cronExpression;
      }
      
      if (data.notifyOnCompletion !== undefined) {
        updateData.notifyOnCompletion = data.notifyOnCompletion;
      }
      
      if (data.notifyOnIssue !== undefined) {
        updateData.notifyOnIssue = data.notifyOnIssue;
      }
      
      // Calculate next run time if frequency or cron expression changed
      if (updateData.cronExpression !== undefined || data.frequency !== undefined) {
        const cronExpression = updateData.cronExpression || currentSchedule.cronExpression;
        
        if (cronExpression) {
          updateData.nextRunAt = getNextRunDate(cronExpression);
        }
      }
      
      // Handle active state
      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }
      
      // Update the scheduled test
      await db.update(scheduledTests)
        .set(updateData)
        .where(eq(scheduledTests.id, id));
      
      // Reschedule or unschedule the test if needed
      if (data.isActive !== undefined || updateData.nextRunAt !== undefined) {
        if (this.activeSchedules.has(id)) {
          // Clear existing schedule
          clearTimeout(this.activeSchedules.get(id)!);
          this.activeSchedules.delete(id);
        }
        
        // Schedule if active
        if (data.isActive === true || (data.isActive === undefined && currentSchedule.isActive)) {
          await this.scheduleTest(id);
        }
      }
      
      console.log(`[BounceScheduler] Updated scheduled test ${id}`);
      
      return true;
    } catch (error) {
      console.error(`[BounceScheduler] Error updating scheduled test ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Delete a scheduled test
   */
  async deleteScheduledTest(id: number): Promise<boolean> {
    try {
      // Check if the scheduled test exists
      const schedule = await this.getScheduledTest(id);
      
      if (!schedule) {
        console.error(`[BounceScheduler] Scheduled test ${id} not found`);
        return false;
      }
      
      // Clear any active schedule
      if (this.activeSchedules.has(id)) {
        clearTimeout(this.activeSchedules.get(id)!);
        this.activeSchedules.delete(id);
      }
      
      // Delete the scheduled test
      await db.delete(scheduledTests)
        .where(eq(scheduledTests.id, id));
      
      console.log(`[BounceScheduler] Deleted scheduled test ${id}`);
      
      return true;
    } catch (error) {
      console.error(`[BounceScheduler] Error deleting scheduled test ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Schedule a test to run at its next run time
   */
  private async scheduleTest(id: number): Promise<boolean> {
    try {
      // Get the scheduled test
      const schedule = await this.getScheduledTest(id);
      
      if (!schedule || !schedule.isActive) {
        return false;
      }
      
      // Clear any existing schedule
      if (this.activeSchedules.has(id)) {
        clearTimeout(this.activeSchedules.get(id)!);
        this.activeSchedules.delete(id);
      }
      
      // Calculate the delay until the next run
      const now = new Date();
      const nextRun = schedule.nextRunAt || getNextRunDate(schedule.cronExpression);
      
      let delay = nextRun.getTime() - now.getTime();
      
      // If the next run is in the past, schedule it for the next occurrence
      if (delay < 0) {
        const newNextRun = getNextRunDate(schedule.cronExpression);
        
        delay = newNextRun.getTime() - now.getTime();
        
        // Update the next run time in the database
        await db.update(scheduledTests)
          .set({
            nextRunAt: newNextRun,
            updatedAt: new Date()
          })
          .where(eq(scheduledTests.id, id));
      }
      
      // Schedule the test run
      const timeout = setTimeout(async () => {
        await this.runScheduledTest(id);
      }, delay);
      
      // Store the timeout
      this.activeSchedules.set(id, timeout);
      
      console.log(`[BounceScheduler] Scheduled test ${id} to run at ${nextRun} (in ${Math.floor(delay / 1000 / 60)} minutes)`);
      
      return true;
    } catch (error) {
      console.error(`[BounceScheduler] Error scheduling test ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Run a scheduled test immediately
   */
  async runScheduledTest(id: number): Promise<boolean> {
    try {
      // Get the scheduled test with template
      const schedule = await this.getScheduledTest(id);
      
      if (!schedule || !schedule.template) {
        console.error(`[BounceScheduler] Scheduled test ${id} or its template not found`);
        return false;
      }
      
      // Start the test run
      const runId = await this.testRunnerService.startTestRun({
        features: schedule.template.configuration.features,
        params: schedule.template.configuration.params || {},
        settings: schedule.template.configuration.settings || {},
        trigger: TEST_RUN_TRIGGER.SCHEDULED,
        triggerId: id.toString(),
        templateId: schedule.templateId
      });
      
      if (!runId) {
        console.error(`[BounceScheduler] Failed to start test run for scheduled test ${id}`);
        return false;
      }
      
      // Calculate and set the next run time
      const nextRunAt = getNextRunDate(schedule.cronExpression);
      
      await db.update(scheduledTests)
        .set({
          lastRunAt: new Date(),
          nextRunAt,
          updatedAt: new Date()
        })
        .where(eq(scheduledTests.id, id));
      
      // Schedule the next run
      await this.scheduleTest(id);
      
      console.log(`[BounceScheduler] Started test run ${runId} for scheduled test ${id}`);
      
      return true;
    } catch (error) {
      console.error(`[BounceScheduler] Error running scheduled test ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Check for scheduled tests that are due to run
   * This is a safety check to ensure tests run even if the process was restarted
   */
  async checkForDueScheduledTests(): Promise<void> {
    try {
      const now = new Date();
      
      // Find active scheduled tests that are due to run
      const dueSchedules = await db.select()
        .from(scheduledTests)
        .where(
          and(
            eq(scheduledTests.isActive, true),
            gte(scheduledTests.nextRunAt, now)
          )
        );
      
      // Run each due schedule
      for (const schedule of dueSchedules) {
        await this.runScheduledTest(schedule.id);
      }
    } catch (error) {
      console.error('[BounceScheduler] Error checking for due scheduled tests:', error);
    }
  }
}

// Create a singleton instance of the test runner service
const bounceTestRunnerService = new BounceTestRunnerService();

// Create a singleton instance of the scheduler service
const bounceSchedulerService = new BounceSchedulerService(bounceTestRunnerService);

// Initialize the scheduler service when the server starts
(async () => {
  await bounceSchedulerService.initialize();
  
  // Set up periodic checks for due scheduled tests
  // This ensures tests run even if the process was restarted
  setInterval(async () => {
    await bounceSchedulerService.checkForDueScheduledTests();
  }, 15 * 60 * 1000); // Every 15 minutes
})();

export { bounceSchedulerService };