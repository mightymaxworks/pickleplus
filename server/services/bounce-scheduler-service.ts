/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Scheduler Service
 * 
 * This service manages the scheduling and execution of automated Bounce tests.
 * It uses the server event bus to coordinate with other system components.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from '../db';
import {
  bounceSchedules,
  bounceTestRuns,
  bounceTestTemplates,
  type BounceSchedule,
  type BounceTestTemplate,
  SCHEDULE_FREQUENCY
} from '@shared/schema';
import { eq, and, gt, or, isNull, desc } from 'drizzle-orm';
import { ServerEventBus } from '../core/events/server-event-bus';
import { getNextRunDate, formatCronExpression } from '../utils/cron-helpers';
import { v4 as uuidv4 } from '../utils/uuid-helpers'; // Dependency-free UUID implementation

// Define event names
const EVENTS = {
  SCHEDULE_CREATED: 'bounce:schedule:created',
  SCHEDULE_UPDATED: 'bounce:schedule:updated',
  SCHEDULE_DELETED: 'bounce:schedule:deleted',
  TEMPLATE_UPDATED: 'bounce:template:updated',
  TEST_RUN_STARTED: 'bounce:test-run:started',
  TEST_RUN_COMPLETED: 'bounce:test-run:completed',
  TEST_RUN_FAILED: 'bounce:test-run:failed'
};

// Define a timer map to track scheduled tasks
interface ScheduledTask {
  scheduleId: number;
  timerId: NodeJS.Timeout;
}

/**
 * Bounce scheduler service for managing automated test runs
 */
export class BounceSchedulerService {
  private scheduledTasks: Map<number, ScheduledTask> = new Map();
  private isInitialized: boolean = false;
  
  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    console.log('[BounceSchedulerService] Initializing...');
    
    // Set up event listeners
    this.registerEventListeners();
    
    // Load active schedules from the database
    await this.loadActiveSchedules();
    
    this.isInitialized = true;
    console.log('[BounceSchedulerService] Initialized successfully');
  }
  
  /**
   * Register event listeners
   */
  private registerEventListeners(): void {
    // Schedule lifecycle events
    ServerEventBus.subscribe(EVENTS.SCHEDULE_CREATED, this.handleScheduleCreated.bind(this));
    ServerEventBus.subscribe(EVENTS.SCHEDULE_UPDATED, this.handleScheduleUpdated.bind(this));
    ServerEventBus.subscribe(EVENTS.SCHEDULE_DELETED, this.handleScheduleDeleted.bind(this));
    
    // Template events
    ServerEventBus.subscribe(EVENTS.TEMPLATE_UPDATED, this.handleTemplateUpdated.bind(this));
  }
  
  /**
   * Load active schedules from the database
   */
  private async loadActiveSchedules(): Promise<void> {
    try {
      console.log('[BounceSchedulerService] Loading active schedules...');
      
      const activeSchedules = await db.select()
        .from(bounceSchedules)
        .where(
          and(
            eq(bounceSchedules.isActive, true),
            eq(bounceSchedules.isDeleted, false)
          )
        );
      
      console.log(`[BounceSchedulerService] Found ${activeSchedules.length} active schedules`);
      
      // Schedule each active schedule
      for (const schedule of activeSchedules) {
        await this.scheduleTest(schedule);
      }
    } catch (error) {
      console.error('[BounceSchedulerService] Error loading active schedules:', error);
    }
  }
  
  /**
   * Schedule a test based on its configuration
   * @param schedule The schedule to set up
   */
  public async scheduleTest(schedule: BounceSchedule): Promise<void> {
    try {
      // Cancel any existing scheduled task for this schedule
      this.cancelSchedule(schedule.id);
      
      if (!schedule.isActive || schedule.isDeleted) {
        console.log(`[BounceSchedulerService] Schedule ${schedule.id} is inactive or deleted, not scheduling`);
        return;
      }
      
      let cronExpression = schedule.customCronExpression;
      
      // If no custom cron expression is specified, generate one based on the frequency
      if (!cronExpression && schedule.frequency) {
        try {
          cronExpression = bounceSchedules.schema.frequency.enum[schedule.frequency];
        } catch (e) {
          console.error(`[BounceSchedulerService] Invalid frequency: ${schedule.frequency}`, e);
          return;
        }
      }
      
      if (!cronExpression) {
        console.error(`[BounceSchedulerService] No cron expression or frequency for schedule ${schedule.id}`);
        return;
      }
      
      // Calculate the next run time
      let nextRunTime: Date;
      try {
        nextRunTime = getNextRunDate(cronExpression);
      } catch (e) {
        console.error(`[BounceSchedulerService] Invalid cron expression for schedule ${schedule.id}: ${cronExpression}`, e);
        return;
      }
      
      // Calculate milliseconds until next run
      const now = new Date();
      const timeUntilRun = nextRunTime.getTime() - now.getTime();
      
      if (timeUntilRun < 0) {
        console.error(`[BounceSchedulerService] Next run time for schedule ${schedule.id} is in the past: ${nextRunTime}`);
        return;
      }
      
      // Schedule the test run
      console.log(`[BounceSchedulerService] Scheduling test for schedule ${schedule.id} at ${nextRunTime} (in ${Math.round(timeUntilRun / 1000)} seconds)`);
      
      // Update the schedule in the database
      await db.update(bounceSchedules)
        .set({
          nextRunTime,
          updatedAt: new Date()
        })
        .where(eq(bounceSchedules.id, schedule.id));
      
      // Set a timer to run the test
      const timerId = setTimeout(async () => {
        try {
          await this.executeScheduledTest(schedule);
          
          // Re-schedule for the next run
          const updatedSchedule = await db.select()
            .from(bounceSchedules)
            .where(eq(bounceSchedules.id, schedule.id))
            .then(rows => rows[0]);
          
          if (updatedSchedule) {
            await this.scheduleTest(updatedSchedule);
          }
        } catch (error) {
          console.error(`[BounceSchedulerService] Error executing test for schedule ${schedule.id}:`, error);
          
          // Update the schedule with the error
          await db.update(bounceSchedules)
            .set({
              lastError: String(error),
              lastErrorTime: new Date(),
              updatedAt: new Date()
            })
            .where(eq(bounceSchedules.id, schedule.id));
          
          // Re-schedule anyway to keep the schedule alive
          const updatedSchedule = await db.select()
            .from(bounceSchedules)
            .where(eq(bounceSchedules.id, schedule.id))
            .then(rows => rows[0]);
          
          if (updatedSchedule) {
            await this.scheduleTest(updatedSchedule);
          }
        }
      }, timeUntilRun);
      
      // Store the timer ID
      this.scheduledTasks.set(schedule.id, {
        scheduleId: schedule.id,
        timerId
      });
      
      console.log(`[BounceSchedulerService] Schedule ${schedule.id} configured to run at ${nextRunTime.toISOString()}`);
    } catch (error) {
      console.error(`[BounceSchedulerService] Error scheduling test for schedule ${schedule.id}:`, error);
    }
  }
  
  /**
   * Execute a scheduled test
   * @param schedule The schedule to execute
   */
  private async executeScheduledTest(schedule: BounceSchedule): Promise<void> {
    try {
      console.log(`[BounceSchedulerService] Executing scheduled test for schedule ${schedule.id}`);
      
      // Get the test template if specified
      let template: BounceTestTemplate | undefined;
      if (schedule.templateId) {
        template = await db.select()
          .from(bounceTestTemplates)
          .where(eq(bounceTestTemplates.id, schedule.templateId))
          .then(rows => rows[0]);
      }
      
      // Create a test run record
      const testRun = await db.insert(bounceTestRuns)
        .values({
          uuid: uuidv4(),
          name: `${schedule.name} - ${new Date().toISOString()}`,
          description: schedule.description || '',
          status: 'PENDING',
          startedAt: new Date(),
          scheduleId: schedule.id,
          templateId: template?.id,
          userId: schedule.createdBy,
          configuration: schedule.configuration || {},
          isAutomated: true
        })
        .returning();
      
      if (!testRun.length) {
        throw new Error(`Failed to create test run for schedule ${schedule.id}`);
      }
      
      const newTestRun = testRun[0];
      
      // Update the schedule last run time
      await db.update(bounceSchedules)
        .set({
          lastRunTime: new Date(),
          updatedAt: new Date()
        })
        .where(eq(bounceSchedules.id, schedule.id));
      
      // Publish test run started event
      await ServerEventBus.publish(EVENTS.TEST_RUN_STARTED, {
        testRun: newTestRun,
        schedule,
        template
      });
      
      console.log(`[BounceSchedulerService] Started test run ${newTestRun.id} for schedule ${schedule.id}`);
      
      // Note: The actual test execution is handled by subscribers to the TEST_RUN_STARTED event
    } catch (error) {
      console.error(`[BounceSchedulerService] Error executing test for schedule ${schedule.id}:`, error);
      throw error;
    }
  }
  
  /**
   * Cancel a scheduled test
   * @param scheduleId The schedule ID to cancel
   */
  public cancelSchedule(scheduleId: number): void {
    const task = this.scheduledTasks.get(scheduleId);
    if (task) {
      console.log(`[BounceSchedulerService] Cancelling scheduled task for schedule ${scheduleId}`);
      clearTimeout(task.timerId);
      this.scheduledTasks.delete(scheduleId);
    }
  }
  
  /**
   * Trigger an immediate run of a scheduled test
   * @param scheduleId The schedule ID to run immediately
   */
  public async triggerScheduleNow(scheduleId: number): Promise<void> {
    try {
      console.log(`[BounceSchedulerService] Triggering immediate run for schedule ${scheduleId}`);
      
      const schedule = await db.select()
        .from(bounceSchedules)
        .where(eq(bounceSchedules.id, scheduleId))
        .then(rows => rows[0]);
      
      if (!schedule) {
        throw new Error(`Schedule not found: ${scheduleId}`);
      }
      
      await this.executeScheduledTest(schedule);
      
      // Re-schedule for the next run
      await this.scheduleTest(schedule);
    } catch (error) {
      console.error(`[BounceSchedulerService] Error triggering schedule ${scheduleId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get the schedule status
   */
  public async getScheduleStatus(): Promise<any> {
    const scheduledCount = this.scheduledTasks.size;
    const activeSchedules = await db.select()
      .from(bounceSchedules)
      .where(
        and(
          eq(bounceSchedules.isActive, true),
          eq(bounceSchedules.isDeleted, false)
        )
      );
      
    const recentRuns = await db.select()
      .from(bounceTestRuns)
      .where(
        eq(bounceTestRuns.isAutomated, true)
      )
      .orderBy(desc(bounceTestRuns.startedAt))
      .limit(10);
    
    return {
      scheduledTasks: scheduledCount,
      activeSchedules: activeSchedules.length,
      nextRuns: activeSchedules.map(schedule => ({
        id: schedule.id,
        name: schedule.name,
        nextRunTime: schedule.nextRunTime,
        lastRunTime: schedule.lastRunTime,
        lastError: schedule.lastError,
        lastErrorTime: schedule.lastErrorTime
      })),
      recentRuns: recentRuns.map(run => ({
        id: run.id,
        name: run.name,
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        scheduleId: run.scheduleId
      }))
    };
  }
  
  /**
   * Handle schedule created event
   */
  private async handleScheduleCreated(data: { schedule: BounceSchedule }): Promise<void> {
    console.log(`[BounceSchedulerService] Schedule created: ${data.schedule.id}`);
    await this.scheduleTest(data.schedule);
  }
  
  /**
   * Handle schedule updated event
   */
  private async handleScheduleUpdated(data: { schedule: BounceSchedule }): Promise<void> {
    console.log(`[BounceSchedulerService] Schedule updated: ${data.schedule.id}`);
    await this.scheduleTest(data.schedule);
  }
  
  /**
   * Handle schedule deleted event
   */
  private async handleScheduleDeleted(data: { scheduleId: number }): Promise<void> {
    console.log(`[BounceSchedulerService] Schedule deleted: ${data.scheduleId}`);
    this.cancelSchedule(data.scheduleId);
  }
  
  /**
   * Handle template updated event
   */
  private async handleTemplateUpdated(data: { template: BounceTestTemplate }): Promise<void> {
    console.log(`[BounceSchedulerService] Template updated: ${data.template.id}`);
    
    // Get all schedules that use this template
    const affectedSchedules = await db.select()
      .from(bounceSchedules)
      .where(
        and(
          eq(bounceSchedules.templateId, data.template.id),
          eq(bounceSchedules.isActive, true),
          eq(bounceSchedules.isDeleted, false)
        )
      );
    
    // Reschedule each affected schedule
    for (const schedule of affectedSchedules) {
      await this.scheduleTest(schedule);
    }
  }
  
  /**
   * Shutdown the service gracefully
   */
  public shutdown(): void {
    console.log('[BounceSchedulerService] Shutting down...');
    
    // Cancel all scheduled tasks
    for (const [scheduleId, task] of this.scheduledTasks.entries()) {
      console.log(`[BounceSchedulerService] Cancelling scheduled task for schedule ${scheduleId}`);
      clearTimeout(task.timerId);
    }
    
    // Clear the tasks map
    this.scheduledTasks.clear();
    
    console.log('[BounceSchedulerService] Shutdown complete');
  }
}

// Create a singleton instance
export const bounceSchedulerService = new BounceSchedulerService();