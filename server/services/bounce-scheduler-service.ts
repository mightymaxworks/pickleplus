/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Scheduler Service
 * 
 * This service provides functionality for scheduling and executing automated tests
 * as part of the Bounce automation capabilities.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from '../db';
import { eq, gte, lte, sql } from 'drizzle-orm';
import { 
  scheduledTests, 
  testTemplates,
  SCHEDULE_FREQUENCY,
  TEST_RUN_TRIGGER
} from '@shared/schema';
import { BounceTestRunnerService } from './bounce-test-runner-service';
import { ServerEventBus } from '../core/events/server-event-bus';
import cron from 'node-cron';
import { getNextRunDate, cronExpressionFromFrequency } from '../utils/cron-helpers';

export class BounceSchedulerService {
  private scheduledJobs: Map<number, cron.ScheduledTask> = new Map();
  private testRunnerService: BounceTestRunnerService;
  
  constructor() {
    this.testRunnerService = new BounceTestRunnerService();
  }

  /**
   * Initialize the scheduler and load all active scheduled tests
   */
  async initialize(): Promise<void> {
    console.log('[BounceScheduler] Initializing scheduler service');
    
    try {
      // Get all active scheduled tests
      const activeSchedules = await db.query.scheduledTests.findMany({
        where: eq(scheduledTests.isActive, true),
        with: {
          template: true
        }
      });
      
      console.log(`[BounceScheduler] Found ${activeSchedules.length} active scheduled tests`);
      
      // Schedule each active test
      for (const schedule of activeSchedules) {
        await this.scheduleTest(schedule.id);
      }
      
      // Set up listeners for scheduled test changes
      this.setupEventListeners();
      
      // Check for and run any missed schedules
      await this.checkForMissedSchedules();
      
      console.log('[BounceScheduler] Scheduler service initialized successfully');
    } catch (error) {
      console.error('[BounceScheduler] Error initializing scheduler service:', error);
    }
  }
  
  /**
   * Set up event listeners for scheduled test changes
   */
  private setupEventListeners(): void {
    // Listen for scheduled test creation
    ServerEventBus.subscribe('scheduledTest:created', async (data: { id: number }) => {
      await this.scheduleTest(data.id);
    });
    
    // Listen for scheduled test updates
    ServerEventBus.subscribe('scheduledTest:updated', async (data: { id: number }) => {
      // Unschedule existing job if exists
      this.unscheduleTest(data.id);
      
      // Reschedule if active
      const schedule = await db.query.scheduledTests.findFirst({
        where: eq(scheduledTests.id, data.id)
      });
      
      if (schedule && schedule.isActive) {
        await this.scheduleTest(data.id);
      }
    });
    
    // Listen for scheduled test deletion
    ServerEventBus.subscribe('scheduledTest:deleted', (data: { id: number }) => {
      this.unscheduleTest(data.id);
    });
  }
  
  /**
   * Check for and run any missed schedules
   */
  private async checkForMissedSchedules(): Promise<void> {
    try {
      const now = new Date();
      
      // Find scheduled tests that have missed their run time
      const missedSchedules = await db.query.scheduledTests.findMany({
        where: (fields, { and }) => 
          and(
            eq(fields.isActive, true),
            lte(fields.nextRun, now),
            sql`${fields.lastRun} IS NULL OR ${fields.lastRun} < ${fields.nextRun}`
          ),
        with: {
          template: true
        }
      });
      
      console.log(`[BounceScheduler] Found ${missedSchedules.length} missed scheduled tests`);
      
      // Run each missed schedule
      for (const schedule of missedSchedules) {
        console.log(`[BounceScheduler] Running missed scheduled test: ${schedule.name} (ID: ${schedule.id})`);
        
        await this.runScheduledTest(schedule.id);
      }
    } catch (error) {
      console.error('[BounceScheduler] Error checking for missed schedules:', error);
    }
  }
  
  /**
   * Schedule a test to run based on its configuration
   */
  async scheduleTest(scheduleId: number): Promise<boolean> {
    try {
      // Get schedule details
      const schedule = await db.query.scheduledTests.findFirst({
        where: eq(scheduledTests.id, scheduleId),
        with: {
          template: true
        }
      });
      
      if (!schedule) {
        console.error(`[BounceScheduler] Scheduled test with ID ${scheduleId} not found`);
        return false;
      }
      
      if (!schedule.isActive) {
        console.log(`[BounceScheduler] Scheduled test '${schedule.name}' (ID: ${scheduleId}) is inactive`);
        return false;
      }
      
      // Unschedule any existing job
      this.unscheduleTest(scheduleId);
      
      // Get cron expression
      let cronExpression: string | null = null;
      
      if (schedule.frequency === SCHEDULE_FREQUENCY.CUSTOM && schedule.cronExpression) {
        cronExpression = schedule.cronExpression;
      } else {
        cronExpression = cronExpressionFromFrequency(schedule.frequency);
      }
      
      if (!cronExpression) {
        console.error(`[BounceScheduler] Invalid cron expression for scheduled test ${scheduleId}`);
        return false;
      }
      
      // Schedule the job
      const job = cron.schedule(cronExpression, async () => {
        await this.runScheduledTest(scheduleId);
      });
      
      // Store the job
      this.scheduledJobs.set(scheduleId, job);
      
      // Calculate and update next run date if not set
      if (!schedule.nextRun) {
        const nextRun = getNextRunDate(cronExpression);
        
        await db.update(scheduledTests)
          .set({ nextRun })
          .where(eq(scheduledTests.id, scheduleId));
      }
      
      console.log(`[BounceScheduler] Scheduled test '${schedule.name}' (ID: ${scheduleId}) with cron: ${cronExpression}`);
      return true;
    } catch (error) {
      console.error(`[BounceScheduler] Error scheduling test ${scheduleId}:`, error);
      return false;
    }
  }
  
  /**
   * Unschedule a previously scheduled test
   */
  unscheduleTest(scheduleId: number): void {
    const job = this.scheduledJobs.get(scheduleId);
    
    if (job) {
      job.stop();
      this.scheduledJobs.delete(scheduleId);
      console.log(`[BounceScheduler] Unscheduled test with ID ${scheduleId}`);
    }
  }
  
  /**
   * Run a scheduled test immediately
   */
  async runScheduledTest(scheduleId: number): Promise<boolean> {
    try {
      // Get schedule details
      const schedule = await db.query.scheduledTests.findFirst({
        where: eq(scheduledTests.id, scheduleId),
        with: {
          template: true
        }
      });
      
      if (!schedule || !schedule.template) {
        console.error(`[BounceScheduler] Scheduled test or template not found for ID ${scheduleId}`);
        return false;
      }
      
      console.log(`[BounceScheduler] Running scheduled test: ${schedule.name} (ID: ${scheduleId})`);
      
      // Get the test configuration from the template
      const testConfig = schedule.template.configuration;
      
      // Run the test
      const testRunId = await this.testRunnerService.startTestRun({
        templateId: schedule.templateId,
        features: testConfig.features,
        params: testConfig.params,
        settings: testConfig.settings,
        trigger: TEST_RUN_TRIGGER.SCHEDULED,
        triggerId: scheduleId.toString()
      });
      
      if (!testRunId) {
        console.error(`[BounceScheduler] Failed to start test run for scheduled test ${scheduleId}`);
        return false;
      }
      
      const now = new Date();
      
      // Update the last run time and calculate next run
      const nextRun = schedule.cronExpression 
        ? getNextRunDate(schedule.cronExpression) 
        : getNextRunDate(cronExpressionFromFrequency(schedule.frequency));
      
      await db.update(scheduledTests)
        .set({ 
          lastRun: now,
          nextRun
        })
        .where(eq(scheduledTests.id, scheduleId));
      
      console.log(`[BounceScheduler] Scheduled test ${scheduleId} run successfully, next run: ${nextRun}`);
      
      // Send notifications if configured
      if (schedule.notifyOnCompletion) {
        ServerEventBus.publish('scheduledTest:ran', {
          scheduleId,
          testRunId,
          name: schedule.name,
          timestamp: now
        });
      }
      
      return true;
    } catch (error) {
      console.error(`[BounceScheduler] Error running scheduled test ${scheduleId}:`, error);
      return false;
    }
  }
  
  /**
   * Create a new scheduled test
   */
  async createScheduledTest(scheduleData: {
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
        where: eq(testTemplates.id, scheduleData.templateId)
      });
      
      if (!template) {
        console.error(`[BounceScheduler] Template not found for ID ${scheduleData.templateId}`);
        return null;
      }
      
      // Calculate next run date
      let cronExpression = scheduleData.cronExpression;
      
      if (!cronExpression && scheduleData.frequency !== SCHEDULE_FREQUENCY.CUSTOM) {
        cronExpression = cronExpressionFromFrequency(scheduleData.frequency);
      }
      
      if (!cronExpression) {
        console.error('[BounceScheduler] No valid cron expression provided');
        return null;
      }
      
      const nextRun = getNextRunDate(cronExpression);
      
      // Insert scheduled test
      const [newSchedule] = await db.insert(scheduledTests)
        .values({
          name: scheduleData.name,
          description: scheduleData.description || null,
          templateId: scheduleData.templateId,
          frequency: scheduleData.frequency,
          cronExpression: scheduleData.cronExpression || null,
          nextRun,
          createdBy: scheduleData.createdBy,
          notifyOnCompletion: scheduleData.notifyOnCompletion ?? true,
          notifyOnIssue: scheduleData.notifyOnIssue ?? true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Schedule the test
      await this.scheduleTest(newSchedule.id);
      
      // Publish event
      ServerEventBus.publish('scheduledTest:created', {
        id: newSchedule.id
      });
      
      return newSchedule.id;
    } catch (error) {
      console.error('[BounceScheduler] Error creating scheduled test:', error);
      return null;
    }
  }
  
  /**
   * Update an existing scheduled test
   */
  async updateScheduledTest(
    scheduleId: number,
    updates: Partial<{
      name: string;
      description: string | null;
      templateId: number;
      frequency: SCHEDULE_FREQUENCY;
      cronExpression: string | null;
      isActive: boolean;
      notifyOnCompletion: boolean;
      notifyOnIssue: boolean;
    }>
  ): Promise<boolean> {
    try {
      // Get current schedule
      const currentSchedule = await db.query.scheduledTests.findFirst({
        where: eq(scheduledTests.id, scheduleId)
      });
      
      if (!currentSchedule) {
        console.error(`[BounceScheduler] Scheduled test not found for ID ${scheduleId}`);
        return false;
      }
      
      // Calculate next run date if frequency or cron changed
      let nextRun = currentSchedule.nextRun;
      
      if (
        (updates.frequency && updates.frequency !== currentSchedule.frequency) ||
        (updates.cronExpression !== undefined && updates.cronExpression !== currentSchedule.cronExpression)
      ) {
        let cronExpression = updates.cronExpression || null;
        
        if (!cronExpression && updates.frequency && updates.frequency !== SCHEDULE_FREQUENCY.CUSTOM) {
          cronExpression = cronExpressionFromFrequency(updates.frequency);
        } else if (!cronExpression && currentSchedule.frequency !== SCHEDULE_FREQUENCY.CUSTOM) {
          cronExpression = cronExpressionFromFrequency(currentSchedule.frequency);
        }
        
        if (cronExpression) {
          nextRun = getNextRunDate(cronExpression);
        }
      }
      
      // Update the scheduled test
      await db.update(scheduledTests)
        .set({
          ...updates,
          nextRun,
          updatedAt: new Date()
        })
        .where(eq(scheduledTests.id, scheduleId));
      
      // Publish event
      ServerEventBus.publish('scheduledTest:updated', {
        id: scheduleId
      });
      
      return true;
    } catch (error) {
      console.error(`[BounceScheduler] Error updating scheduled test ${scheduleId}:`, error);
      return false;
    }
  }
  
  /**
   * Delete a scheduled test
   */
  async deleteScheduledTest(scheduleId: number): Promise<boolean> {
    try {
      // Unschedule the test
      this.unscheduleTest(scheduleId);
      
      // Delete from database
      await db.delete(scheduledTests)
        .where(eq(scheduledTests.id, scheduleId));
      
      // Publish event
      ServerEventBus.publish('scheduledTest:deleted', {
        id: scheduleId
      });
      
      return true;
    } catch (error) {
      console.error(`[BounceScheduler] Error deleting scheduled test ${scheduleId}:`, error);
      return false;
    }
  }
  
  /**
   * Get all scheduled tests
   */
  async getAllScheduledTests(activeOnly = false): Promise<any[]> {
    try {
      // Build query
      const query = activeOnly 
        ? db.query.scheduledTests.findMany({
            where: eq(scheduledTests.isActive, true),
            with: {
              template: true,
              creator: {
                columns: {
                  id: true,
                  username: true,
                  displayName: true
                }
              }
            },
            orderBy: (fields, { desc }) => [desc(fields.createdAt)]
          })
        : db.query.scheduledTests.findMany({
            with: {
              template: true,
              creator: {
                columns: {
                  id: true,
                  username: true,
                  displayName: true
                }
              }
            },
            orderBy: (fields, { desc }) => [desc(fields.createdAt)]
          });
      
      // Execute query
      return await query;
    } catch (error) {
      console.error('[BounceScheduler] Error getting scheduled tests:', error);
      return [];
    }
  }
  
  /**
   * Get details for a specific scheduled test
   */
  async getScheduledTest(scheduleId: number): Promise<any | null> {
    try {
      return await db.query.scheduledTests.findFirst({
        where: eq(scheduledTests.id, scheduleId),
        with: {
          template: true,
          creator: {
            columns: {
              id: true,
              username: true,
              displayName: true
            }
          }
        }
      });
    } catch (error) {
      console.error(`[BounceScheduler] Error getting scheduled test ${scheduleId}:`, error);
      return null;
    }
  }
}

// Create and export a singleton instance
export const bounceSchedulerService = new BounceSchedulerService();