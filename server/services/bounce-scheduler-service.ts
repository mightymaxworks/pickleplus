/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Scheduler Service
 * 
 * This service manages the scheduling and execution of automated tests.
 * It uses the cron-helpers to determine when tests should run and
 * integrates with the TestRunnerService to execute them.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from '../db';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { 
  bounceSchedules, 
  bounceTestRuns,
  bounceTestTemplates, 
  type BounceSchedule,
  type InsertBounceSchedule,
  type BounceTestTemplate
} from '@shared/schema';
import { cronExpressionFromFrequency, getNextRunDate } from '../utils/cron-helpers';
import { ServerEventBus } from '../core/events/server-event-bus';
import { generateClientUuid } from '../utils/uuid-helpers';

/**
 * Handles scheduling, triggering, and managing automated tests
 */
export class BounceSchedulerService {
  private static instance: BounceSchedulerService;
  private scheduledJobs: Map<number, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  /**
   * Get the singleton instance of the scheduler service
   */
  public static getInstance(): BounceSchedulerService {
    if (!BounceSchedulerService.instance) {
      BounceSchedulerService.instance = new BounceSchedulerService();
    }
    return BounceSchedulerService.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Initialize the scheduler service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[BounceSchedulerService] Already initialized');
      return;
    }

    console.log('[BounceSchedulerService] Initializing...');
    
    // Load all active schedules from the database
    const activeSchedules = await db.select()
      .from(bounceSchedules)
      .where(
        and(
          eq(bounceSchedules.isActive, true),
          eq(bounceSchedules.isDeleted, false)
        )
      );
    
    console.log(`[BounceSchedulerService] Loaded ${activeSchedules.length} active schedules`);
    
    // Schedule each active schedule
    for (const schedule of activeSchedules) {
      await this.scheduleTest(schedule);
    }
    
    // Subscribe to events that might require rescheduling
    ServerEventBus.subscribe('bounce:schedule:created', this.handleScheduleCreated.bind(this));
    ServerEventBus.subscribe('bounce:schedule:updated', this.handleScheduleUpdated.bind(this));
    ServerEventBus.subscribe('bounce:schedule:deleted', this.handleScheduleDeleted.bind(this));
    ServerEventBus.subscribe('bounce:template:updated', this.handleTemplateUpdated.bind(this));
    
    this.isInitialized = true;
    console.log('[BounceSchedulerService] Initialization complete');
  }

  /**
   * Schedule a test to run at its next scheduled time
   * @param schedule Schedule to set up
   */
  private async scheduleTest(schedule: BounceSchedule): Promise<void> {
    try {
      // Cancel existing job if any
      this.cancelSchedule(schedule.id);
      
      // If the schedule is not active, don't schedule it
      if (!schedule.isActive || schedule.isDeleted) {
        console.log(`[BounceSchedulerService] Schedule ${schedule.id} is not active or is deleted, skipping`);
        return;
      }
      
      // Get the next run time
      let cronExpression: string;
      if (schedule.frequency === 'CUSTOM' && schedule.customCronExpression) {
        cronExpression = schedule.customCronExpression;
      } else if (schedule.frequency !== 'CUSTOM') {
        cronExpression = cronExpressionFromFrequency(schedule.frequency);
      } else {
        console.error(`[BounceSchedulerService] Schedule ${schedule.id} has CUSTOM frequency but no customCronExpression`);
        return;
      }
      
      const nextRunDate = getNextRunDate(cronExpression);
      const delay = nextRunDate.getTime() - Date.now();
      
      console.log(`[BounceSchedulerService] Schedule ${schedule.id} will run at ${nextRunDate.toISOString()} (in ${Math.floor(delay / 1000 / 60)} minutes)`);
      
      // Schedule the test
      const timeoutId = setTimeout(async () => {
        await this.executeScheduledTest(schedule);
        
        // Schedule the next run
        await this.scheduleTest(schedule);
      }, delay);
      
      // Store the timeout ID so we can cancel it if needed
      this.scheduledJobs.set(schedule.id, timeoutId);
      
      // Update the next run time in the database
      await db.update(bounceSchedules)
        .set({ nextRunTime: nextRunDate })
        .where(eq(bounceSchedules.id, schedule.id));
        
    } catch (error) {
      console.error(`[BounceSchedulerService] Error scheduling test ${schedule.id}:`, error);
    }
  }

  /**
   * Cancel a scheduled test
   * @param scheduleId Schedule ID to cancel
   */
  private cancelSchedule(scheduleId: number): void {
    const timeoutId = this.scheduledJobs.get(scheduleId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledJobs.delete(scheduleId);
      console.log(`[BounceSchedulerService] Cancelled schedule ${scheduleId}`);
    }
  }

  /**
   * Execute a scheduled test
   * @param schedule Schedule to execute
   */
  private async executeScheduledTest(schedule: BounceSchedule): Promise<void> {
    try {
      console.log(`[BounceSchedulerService] Executing schedule ${schedule.id}`);
      
      // Get the test template if one is specified
      let testTemplate: BounceTestTemplate | undefined;
      if (schedule.templateId) {
        const [template] = await db.select()
          .from(bounceTestTemplates)
          .where(eq(bounceTestTemplates.id, schedule.templateId));
        
        testTemplate = template;
      }
      
      // Create a test run
      const [testRun] = await db.insert(bounceTestRuns)
        .values({
          name: schedule.name,
          description: schedule.description || 'Scheduled test run',
          scheduleId: schedule.id,
          templateId: schedule.templateId,
          status: 'PENDING',
          userId: schedule.createdBy,
          startedAt: new Date(),
          uuid: generateClientUuid(),
          // Use template configuration if available, otherwise use schedule configuration
          configuration: testTemplate?.configuration || schedule.configuration || {},
          isAutomated: true
        })
        .returning();
      
      // Publish an event to notify that a test run has been created
      ServerEventBus.publish('bounce:test:created', { testRun });
      
      // Update the last run time in the database
      await db.update(bounceSchedules)
        .set({ lastRunTime: new Date() })
        .where(eq(bounceSchedules.id, schedule.id));
      
      console.log(`[BounceSchedulerService] Schedule ${schedule.id} executed, created test run ${testRun.id}`);
    } catch (error) {
      console.error(`[BounceSchedulerService] Error executing schedule ${schedule.id}:`, error);
      
      // Update the schedule to mark the error
      await db.update(bounceSchedules)
        .set({ lastError: String(error), lastErrorTime: new Date() })
        .where(eq(bounceSchedules.id, schedule.id));
    }
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
   * Create a new schedule
   * @param scheduleData Schedule data to create
   * @returns Created schedule
   */
  public async createSchedule(scheduleData: InsertBounceSchedule): Promise<BounceSchedule> {
    console.log('[BounceSchedulerService] Creating schedule:', scheduleData.name);
    
    // Insert the schedule
    const [schedule] = await db.insert(bounceSchedules)
      .values(scheduleData)
      .returning();
    
    // Schedule the test if it's active
    if (schedule.isActive) {
      await this.scheduleTest(schedule);
    }
    
    // Publish an event to notify that a schedule has been created
    ServerEventBus.publish('bounce:schedule:created', { schedule });
    
    return schedule;
  }

  /**
   * Update an existing schedule
   * @param scheduleId Schedule ID to update
   * @param scheduleData Schedule data to update
   * @returns Updated schedule
   */
  public async updateSchedule(scheduleId: number, scheduleData: Partial<BounceSchedule>): Promise<BounceSchedule> {
    console.log(`[BounceSchedulerService] Updating schedule ${scheduleId}`);
    
    // Update the schedule
    const [schedule] = await db.update(bounceSchedules)
      .set(scheduleData)
      .where(eq(bounceSchedules.id, scheduleId))
      .returning();
    
    // Reschedule the test
    await this.scheduleTest(schedule);
    
    // Publish an event to notify that a schedule has been updated
    ServerEventBus.publish('bounce:schedule:updated', { schedule });
    
    return schedule;
  }

  /**
   * Delete a schedule
   * @param scheduleId Schedule ID to delete
   * @returns Deleted schedule
   */
  public async deleteSchedule(scheduleId: number): Promise<BounceSchedule> {
    console.log(`[BounceSchedulerService] Deleting schedule ${scheduleId}`);
    
    // Mark the schedule as deleted (soft delete)
    const [schedule] = await db.update(bounceSchedules)
      .set({ isDeleted: true, isActive: false })
      .where(eq(bounceSchedules.id, scheduleId))
      .returning();
    
    // Cancel the scheduled job
    this.cancelSchedule(scheduleId);
    
    // Publish an event to notify that a schedule has been deleted
    ServerEventBus.publish('bounce:schedule:deleted', { scheduleId });
    
    return schedule;
  }

  /**
   * Get all schedules
   * @returns Array of schedules
   */
  public async getAllSchedules(): Promise<BounceSchedule[]> {
    return db.select()
      .from(bounceSchedules)
      .where(eq(bounceSchedules.isDeleted, false))
      .orderBy(desc(bounceSchedules.createdAt));
  }

  /**
   * Get a schedule by ID
   * @param scheduleId Schedule ID to get
   * @returns Schedule
   */
  public async getScheduleById(scheduleId: number): Promise<BounceSchedule | undefined> {
    const [schedule] = await db.select()
      .from(bounceSchedules)
      .where(
        and(
          eq(bounceSchedules.id, scheduleId),
          eq(bounceSchedules.isDeleted, false)
        )
      );
    
    return schedule;
  }

  /**
   * Manually trigger a schedule to run immediately
   * @param scheduleId Schedule ID to trigger
   * @returns Test run that was created
   */
  public async triggerSchedule(scheduleId: number): Promise<{ id: number; uuid: string } | undefined> {
    console.log(`[BounceSchedulerService] Triggering schedule ${scheduleId}`);
    
    // Get the schedule
    const [schedule] = await db.select()
      .from(bounceSchedules)
      .where(
        and(
          eq(bounceSchedules.id, scheduleId),
          eq(bounceSchedules.isDeleted, false)
        )
      );
    
    if (!schedule) {
      console.error(`[BounceSchedulerService] Schedule ${scheduleId} not found`);
      return undefined;
    }
    
    // Get the test template if one is specified
    let testTemplate: BounceTestTemplate | undefined;
    if (schedule.templateId) {
      const [template] = await db.select()
        .from(bounceTestTemplates)
        .where(eq(bounceTestTemplates.id, schedule.templateId));
      
      testTemplate = template;
    }
    
    // Create a test run
    const [testRun] = await db.insert(bounceTestRuns)
      .values({
        name: `${schedule.name} (Manual Trigger)`,
        description: schedule.description || 'Manually triggered test run',
        scheduleId: schedule.id,
        templateId: schedule.templateId,
        status: 'PENDING',
        userId: schedule.createdBy,
        startedAt: new Date(),
        uuid: generateClientUuid(),
        // Use template configuration if available, otherwise use schedule configuration
        configuration: testTemplate?.configuration || schedule.configuration || {},
        isAutomated: false
      })
      .returning();
    
    // Publish an event to notify that a test run has been created
    ServerEventBus.publish('bounce:test:created', { testRun });
    
    // Update the last run time in the database
    await db.update(bounceSchedules)
      .set({ lastRunTime: new Date() })
      .where(eq(bounceSchedules.id, schedule.id));
    
    console.log(`[BounceSchedulerService] Schedule ${scheduleId} triggered, created test run ${testRun.id}`);
    
    return { id: testRun.id, uuid: testRun.uuid };
  }

  /**
   * Pause a schedule
   * @param scheduleId Schedule ID to pause
   * @returns Updated schedule
   */
  public async pauseSchedule(scheduleId: number): Promise<BounceSchedule> {
    console.log(`[BounceSchedulerService] Pausing schedule ${scheduleId}`);
    
    // Update the schedule
    const [schedule] = await db.update(bounceSchedules)
      .set({ isActive: false })
      .where(eq(bounceSchedules.id, scheduleId))
      .returning();
    
    // Cancel the scheduled job
    this.cancelSchedule(scheduleId);
    
    // Publish an event to notify that a schedule has been updated
    ServerEventBus.publish('bounce:schedule:updated', { schedule });
    
    return schedule;
  }

  /**
   * Resume a schedule
   * @param scheduleId Schedule ID to resume
   * @returns Updated schedule
   */
  public async resumeSchedule(scheduleId: number): Promise<BounceSchedule> {
    console.log(`[BounceSchedulerService] Resuming schedule ${scheduleId}`);
    
    // Update the schedule
    const [schedule] = await db.update(bounceSchedules)
      .set({ isActive: true })
      .where(eq(bounceSchedules.id, scheduleId))
      .returning();
    
    // Schedule the test
    await this.scheduleTest(schedule);
    
    // Publish an event to notify that a schedule has been updated
    ServerEventBus.publish('bounce:schedule:updated', { schedule });
    
    return schedule;
  }
}