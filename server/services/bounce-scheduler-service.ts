/**
 * PKL-278651-BOUNCE-0005-AUTO - Bounce Scheduler Service
 * 
 * This service provides functionality for scheduling and managing automated tests.
 * It integrates with the event bus for loose coupling and uses a dependency-free
 * cron implementation for scheduling.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from '../db';
import { 
  bounceSchedules, 
  bounceTestTemplates,
  bounceTestRuns,
  type BounceSchedule,
  type BounceTestRun,
  type InsertBounceTestRun
} from '../../shared/schema/bounce-automation';
import { 
  matchesCronSchedule, 
  calculateNextRunTime, 
  parseCronExpression, 
  type CronSchedule 
} from '../utils/cron-helpers';
import { generateUuidV4 } from '../utils/uuid-helpers';
import { eq, and } from 'drizzle-orm';
import { getEventBus } from '../core/events/server-event-bus';

// Singleton instance
let instance: BounceSchedulerService | null = null;

/**
 * Service for scheduling and managing automated tests
 */
export class BounceSchedulerService {
  private scheduleMap: Map<number, {
    schedule: BounceSchedule;
    cronSchedule: CronSchedule | null;
    nextRunTime: Date;
    timeoutId: NodeJS.Timeout | null;
  }> = new Map();
  
  private checkInterval: NodeJS.Timeout | null = null;
  private eventBus: any; // Using 'any' temporarily to resolve EventBus import issues
  private isInitialized = false;
  
  /**
   * Create a new instance of the scheduler service
   */
  constructor() {
    if (instance) {
      return instance;
    }
    
    this.eventBus = getEventBus();
    instance = this;
  }
  
  /**
   * Initialize the scheduler service
   * Loads all active schedules from the database and sets up the check interval
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    try {
      console.log('BounceSchedulerService: Initializing');
      
      // Load all active schedules
      const activeSchedules = await db.select()
        .from(bounceSchedules)
        .where(eq(bounceSchedules.isActive, true));
      
      console.log(`BounceSchedulerService: Loaded ${activeSchedules.length} active schedules`);
      
      // Schedule each active schedule
      for (const schedule of activeSchedules) {
        await this.scheduleTest(schedule);
      }
      
      // Set up the check interval to run every minute
      this.checkInterval = setInterval(() => this.checkSchedules(), 60 * 1000);
      
      this.isInitialized = true;
      console.log('BounceSchedulerService: Initialized');
    } catch (error) {
      console.error('BounceSchedulerService: Error initializing', error);
    }
  }
  
  /**
   * Check all schedules to see if any need to be run
   * This is a safeguard in case the scheduled timeouts are missed
   */
  private async checkSchedules(): Promise<void> {
    const now = new Date();
    
    for (const [id, { schedule, nextRunTime }] of this.scheduleMap.entries()) {
      // If the next run time has passed, execute the schedule
      if (nextRunTime && nextRunTime <= now) {
        try {
          console.log(`BounceSchedulerService: Running schedule ${id} (${schedule.name})`);
          
          // Run the schedule
          await this.executeSchedule(schedule);
          
          // Calculate the next run time
          await this.updateNextRunTime(schedule);
        } catch (error) {
          console.error(`BounceSchedulerService: Error executing schedule ${id}`, error);
        }
      }
    }
  }
  
  /**
   * Schedule a test to run
   * @param schedule Schedule to run
   * @returns Whether the schedule was successfully scheduled
   */
  public async scheduleTest(schedule: BounceSchedule): Promise<boolean> {
    try {
      // Check if the schedule is already scheduled
      const existing = this.scheduleMap.get(schedule.id);
      
      if (existing) {
        // Remove the existing schedule
        if (existing.timeoutId) {
          clearTimeout(existing.timeoutId);
        }
        
        this.scheduleMap.delete(schedule.id);
      }
      
      // Parse the schedule's cron expression
      let cronSchedule: CronSchedule | null = null;
      
      switch (schedule.frequency) {
        case 'CUSTOM':
          if (schedule.customCronExpression) {
            cronSchedule = parseCronExpression(schedule.customCronExpression);
          }
          break;
        case 'HOURLY':
          cronSchedule = parseCronExpression('0 * * * *');
          break;
        case 'DAILY':
          cronSchedule = parseCronExpression('0 0 * * *');
          break;
        case 'WEEKLY':
          cronSchedule = parseCronExpression('0 0 * * 0');
          break;
        case 'MONTHLY':
          cronSchedule = parseCronExpression('0 0 1 * *');
          break;
        case 'QUARTERLY':
          cronSchedule = parseCronExpression('0 0 1 1,4,7,10 *');
          break;
        default:
          console.error(`BounceSchedulerService: Unknown frequency ${schedule.frequency}`);
          return false;
      }
      
      if (!cronSchedule) {
        console.error(`BounceSchedulerService: Failed to parse cron expression for schedule ${schedule.id}`);
        return false;
      }
      
      // Calculate the next run time
      const now = new Date();
      const nextRunTime = schedule.nextRunTime && schedule.nextRunTime > now 
        ? schedule.nextRunTime 
        : calculateNextRunTime(cronSchedule, now);
      
      console.log(`BounceSchedulerService: Scheduling ${schedule.name} to run at ${nextRunTime.toISOString()}`);
      
      // Calculate the timeout duration in milliseconds
      const timeoutDuration = nextRunTime.getTime() - now.getTime();
      
      // Schedule the test to run at the next run time
      const timeoutId = setTimeout(async () => {
        try {
          // Execute the schedule
          await this.executeSchedule(schedule);
          
          // Update the next run time
          await this.updateNextRunTime(schedule);
        } catch (error) {
          console.error(`BounceSchedulerService: Error executing schedule ${schedule.id}`, error);
        }
      }, timeoutDuration);
      
      // Add the schedule to the map
      this.scheduleMap.set(schedule.id, {
        schedule,
        cronSchedule,
        nextRunTime,
        timeoutId
      });
      
      // Update the schedule's next run time in the database
      if (!schedule.nextRunTime || schedule.nextRunTime.getTime() !== nextRunTime.getTime()) {
        await db.update(bounceSchedules)
          .set({ nextRunTime })
          .where(eq(bounceSchedules.id, schedule.id));
      }
      
      return true;
    } catch (error) {
      console.error(`BounceSchedulerService: Error scheduling test ${schedule.id}`, error);
      return false;
    }
  }
  
  /**
   * Remove a schedule
   * @param scheduleId ID of the schedule to remove
   * @returns Whether the schedule was successfully removed
   */
  public async removeSchedule(scheduleId: number): Promise<boolean> {
    try {
      // Get the schedule from the map
      const scheduleEntry = this.scheduleMap.get(scheduleId);
      
      if (!scheduleEntry) {
        return false;
      }
      
      // Clear the timeout
      if (scheduleEntry.timeoutId) {
        clearTimeout(scheduleEntry.timeoutId);
      }
      
      // Remove the schedule from the map
      this.scheduleMap.delete(scheduleId);
      
      return true;
    } catch (error) {
      console.error(`BounceSchedulerService: Error removing schedule ${scheduleId}`, error);
      return false;
    }
  }
  
  /**
   * Execute a schedule
   * @param schedule Schedule to execute
   * @returns Test run created for the schedule
   */
  private async executeSchedule(schedule: BounceSchedule): Promise<BounceTestRun> {
    try {
      // Get the template configuration if available
      let templateConfig: Record<string, any> = {};
      
      if (schedule.templateId) {
        const [template] = await db.select()
          .from(bounceTestTemplates)
          .where(
            and(
              eq(bounceTestTemplates.id, schedule.templateId),
              eq(bounceTestTemplates.isDeleted, false)
            )
          );
        
        if (template) {
          templateConfig = template.configuration as Record<string, any>;
        }
      }
      
      // Merge template and schedule configurations
      const configuration = {
        ...templateConfig,
        ...(schedule.configuration as Record<string, any>)
      };
      
      // Create a test run
      const runName = `${schedule.name} (${new Date().toISOString()})`;
      
      const insertData: InsertBounceTestRun = {
        name: runName,
        scheduleId: schedule.id,
        templateId: schedule.templateId,
        configuration,
        status: 'RUNNING',
        results: {},
        metadata: {
          scheduleName: schedule.name,
          scheduleFrequency: schedule.frequency,
          executionId: generateUuidV4()
        }
      };
      
      const [testRun] = await db.insert(bounceTestRuns)
        .values(insertData)
        .returning();
      
      // Update the schedule's last run time
      await db.update(bounceSchedules)
        .set({
          lastRunTime: new Date(),
          updatedAt: new Date()
        })
        .where(eq(bounceSchedules.id, schedule.id));
      
      // Publish an event for the test run
      this.eventBus.publish('bounce:testRun:started', {
        testRun,
        schedule
      });
      
      // Execute the test (simulated for now)
      this.simulateTestExecution(testRun);
      
      return testRun;
    } catch (error) {
      console.error(`BounceSchedulerService: Error executing schedule ${schedule.id}`, error);
      throw error;
    }
  }
  
  /**
   * Simulate test execution (placeholder for actual test execution)
   * @param testRun Test run to execute
   */
  private simulateTestExecution(testRun: BounceTestRun): void {
    // In a real implementation, this would initiate the actual test execution
    // For now, we'll simulate completion after a short delay
    
    setTimeout(async () => {
      try {
        // Simulate test completion
        const findingsCount = Math.floor(Math.random() * 5); // Random findings count (0-4)
        
        // Generate sample findings
        const findings = Array.from({ length: findingsCount }, (_, i) => ({
          id: `finding-${i + 1}`,
          title: `Test Finding ${i + 1}`,
          description: `This is a simulated finding #${i + 1} for test run ${testRun.id}`,
          severity: i === 0 ? 'HIGH' : i === 1 ? 'MEDIUM' : 'LOW',
          location: `/somewhere/in/the/app/${i + 1}`,
          timestamp: new Date().toISOString()
        }));
        
        // Update the test run
        const [updatedTestRun] = await db.update(bounceTestRuns)
          .set({
            status: 'COMPLETED',
            completedAt: new Date(),
            findingsCount,
            results: {
              findings,
              summary: {
                totalTests: 10,
                passedTests: 10 - findingsCount,
                failedTests: findingsCount,
                duration: Math.floor(Math.random() * 10000) + 5000 // Random duration between 5-15 seconds
              }
            }
          })
          .where(eq(bounceTestRuns.id, testRun.id))
          .returning();
        
        // Publish an event for the test run completion
        this.eventBus.publish('bounce:testRun:completed', {
          testRun: updatedTestRun
        });
      } catch (error) {
        console.error(`BounceSchedulerService: Error completing test run ${testRun.id}`, error);
        
        // Update the test run with error
        await db.update(bounceTestRuns)
          .set({
            status: 'FAILED',
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          })
          .where(eq(bounceTestRuns.id, testRun.id));
      }
    }, 5000); // Simulate 5-second test execution
  }
  
  /**
   * Update the next run time for a schedule
   * @param schedule Schedule to update
   * @returns Whether the next run time was successfully updated
   */
  private async updateNextRunTime(schedule: BounceSchedule): Promise<boolean> {
    try {
      // Get the schedule from the map
      const scheduleEntry = this.scheduleMap.get(schedule.id);
      
      if (!scheduleEntry || !scheduleEntry.cronSchedule) {
        return false;
      }
      
      // Calculate the next run time
      const now = new Date();
      const nextRunTime = calculateNextRunTime(scheduleEntry.cronSchedule, now);
      
      console.log(`BounceSchedulerService: Next run time for ${schedule.name} is ${nextRunTime.toISOString()}`);
      
      // Calculate the timeout duration in milliseconds
      const timeoutDuration = nextRunTime.getTime() - now.getTime();
      
      // Schedule the test to run at the next run time
      const timeoutId = setTimeout(async () => {
        try {
          // Execute the schedule
          await this.executeSchedule(schedule);
          
          // Update the next run time
          await this.updateNextRunTime(schedule);
        } catch (error) {
          console.error(`BounceSchedulerService: Error executing schedule ${schedule.id}`, error);
        }
      }, timeoutDuration);
      
      // Update the schedule entry in the map
      this.scheduleMap.set(schedule.id, {
        ...scheduleEntry,
        nextRunTime,
        timeoutId
      });
      
      // Update the schedule's next run time in the database
      await db.update(bounceSchedules)
        .set({ nextRunTime })
        .where(eq(bounceSchedules.id, schedule.id));
      
      return true;
    } catch (error) {
      console.error(`BounceSchedulerService: Error updating next run time for schedule ${schedule.id}`, error);
      return false;
    }
  }
  
  /**
   * Run a schedule now, regardless of its next scheduled run time
   * @param schedule Schedule to run
   * @returns Test run created for the schedule
   */
  public async runScheduleNow(schedule: BounceSchedule): Promise<BounceTestRun> {
    try {
      return await this.executeSchedule(schedule);
    } catch (error) {
      console.error(`BounceSchedulerService: Error running schedule ${schedule.id} now`, error);
      throw error;
    }
  }
  
  /**
   * Get the number of active schedules
   * @returns Number of active schedules
   */
  public getScheduleCount(): number {
    return this.scheduleMap.size;
  }
  
  /**
   * Get all scheduled test runs
   * @returns Map of schedule IDs to next run times
   */
  public getScheduledRuns(): Map<number, Date> {
    const result = new Map<number, Date>();
    
    for (const [id, { nextRunTime }] of this.scheduleMap.entries()) {
      result.set(id, nextRunTime);
    }
    
    return result;
  }
  
  /**
   * Get the singleton instance of the scheduler service
   * @returns The singleton instance
   */
  public static getInstance(): BounceSchedulerService {
    if (!instance) {
      instance = new BounceSchedulerService();
    }
    
    return instance;
  }
}

/**
 * Get the singleton instance of the scheduler service
 * Initializes the service if it hasn't been initialized yet
 * 
 * @returns The singleton instance
 */
export function getBounceSchedulerService(): BounceSchedulerService {
  const service = BounceSchedulerService.getInstance();
  
  // Initialize the service if it hasn't been initialized yet
  if (!service["isInitialized"]) {
    // Initialize asynchronously
    service.initialize().catch(error => {
      console.error('Failed to initialize BounceSchedulerService', error);
    });
  }
  
  return service;
}

// Export the service instance
export default getBounceSchedulerService;