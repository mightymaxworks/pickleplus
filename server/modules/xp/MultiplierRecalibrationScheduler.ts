/**
 * PKL-278651-XP-0003-PULSE-SCHED
 * Multiplier Recalibration Scheduler
 * 
 * This service schedules periodic recalibration of activity multipliers
 * using the PicklePulse™ algorithm with adaptive scheduling.
 * 
 * @framework Framework5.2
 * @version 1.1.0
 * @lastModified 2025-04-20
 */

import { ActivityMultiplierService } from './ActivityMultiplierService';
import { DatabaseStorage } from '../../storage';

/**
 * MultiplierRecalibrationScheduler class
 * PKL-278651-XP-0003-PULSE-SCHED - Framework 5.2 compliant implementation
 */
export class MultiplierRecalibrationScheduler {
  private multiplierService: ActivityMultiplierService;
  private recalibrationInterval: NodeJS.Timeout | null = null;
  private intervalHours: number;
  private adaptiveSchedulingEnabled: boolean = false;
  private nextRecalibrations: Map<string, Date> = new Map();
  private lastActivityLevels: Map<string, number> = new Map();
  private adaptiveCheckInterval: NodeJS.Timeout | null = null;
  private lastRecalibrationTime: Date | null = null;
  
  /**
   * Constructor 
   * @param storage - Database storage instance
   * @param intervalHours - Default interval hours (24 by default)
   */
  constructor(storage: DatabaseStorage, intervalHours: number = 24) {
    this.multiplierService = new ActivityMultiplierService(storage);
    this.intervalHours = intervalHours;
  }
  
  /**
   * Starts the scheduler to run recalibration at specified intervals
   * Enhanced with adaptive scheduling option
   */
  start(useAdaptiveScheduling: boolean = false): void {
    // Store adaptive scheduling preference
    this.adaptiveSchedulingEnabled = useAdaptiveScheduling;
    
    // Convert hours to milliseconds
    const intervalMs = this.intervalHours * 60 * 60 * 1000;
    
    console.log(`[PicklePulse] Starting recalibration scheduler (interval: ${this.intervalHours} hours, adaptive: ${useAdaptiveScheduling})`);
    
    // Run immediately once
    this.runRecalibration();
    
    if (useAdaptiveScheduling) {
      // Set up adaptive check interval (every 15 minutes)
      const adaptiveCheckMs = 15 * 60 * 1000; 
      this.adaptiveCheckInterval = setInterval(() => {
        this.checkForAdaptiveRecalibration();
      }, adaptiveCheckMs);
      
      // Still maintain a base interval as a fallback
      this.recalibrationInterval = setInterval(() => {
        this.runRecalibration();
      }, intervalMs * 1.5); // Slightly longer interval as a fallback
    } else {
      // Set up standard fixed interval for future runs
      this.recalibrationInterval = setInterval(() => {
        this.runRecalibration();
      }, intervalMs);
    }
  }
  
  /**
   * Stops the scheduler and all associated timers
   */
  stop(): void {
    if (this.recalibrationInterval) {
      clearInterval(this.recalibrationInterval);
      this.recalibrationInterval = null;
    }
    
    if (this.adaptiveCheckInterval) {
      clearInterval(this.adaptiveCheckInterval);
      this.adaptiveCheckInterval = null;
    }
    
    console.log('[PicklePulse] Recalibration scheduler stopped');
  }
  
  /**
   * Runs a full recalibration of all multipliers
   * PKL-278651-XP-0003-PULSE-FULL: Full recalibration implementation
   */
  private runRecalibration(): void {
    console.log('[PicklePulse] Running scheduled recalibration');
    
    // Update last recalibration time
    this.lastRecalibrationTime = new Date();
    
    this.multiplierService.recalculateMultipliers()
      .then(() => {
        console.log('[PicklePulse] Scheduled recalibration completed successfully');
        
        // If adaptive scheduling is enabled, update next scheduled recalibrations
        if (this.adaptiveSchedulingEnabled) {
          this.scheduleNextAdaptiveRecalibrations();
        }
      })
      .catch(error => {
        console.error('[PicklePulse] Error in scheduled recalibration:', error);
      });
  }
  
  /**
   * Get the current scheduler status
   * PKL-278651-XP-0003-PULSE-STATUS: Scheduler status reporting
   */
  getStatus(): any {
    // Calculate next scheduled full recalibration time
    let nextScheduledRecalibration: Date | null = null;
    if (this.recalibrationInterval !== null) {
      // If scheduler is running, calculate next full run based on interval
      nextScheduledRecalibration = new Date();
      if (this.lastRecalibrationTime) {
        nextScheduledRecalibration = new Date(this.lastRecalibrationTime);
        nextScheduledRecalibration.setHours(
          nextScheduledRecalibration.getHours() + 
          (this.adaptiveSchedulingEnabled ? this.intervalHours * 1.5 : this.intervalHours)
        );
      } else {
        nextScheduledRecalibration.setHours(
          nextScheduledRecalibration.getHours() + 
          (this.adaptiveSchedulingEnabled ? this.intervalHours * 1.5 : this.intervalHours)
        );
      }
    }
    
    // Create status object
    return {
      active: this.recalibrationInterval !== null,
      adaptiveSchedulingEnabled: this.adaptiveSchedulingEnabled,
      intervalHours: this.intervalHours,
      lastRecalibrationTime: this.lastRecalibrationTime?.toISOString() || null,
      nextFullRecalibration: nextScheduledRecalibration?.toISOString() || null,
      adaptiveRecalibrations: this.adaptiveSchedulingEnabled
        ? Array.from(this.nextRecalibrations.entries()).map(([type, date]) => ({
            activityType: type,
            scheduledTime: date.toISOString()
          }))
        : []
    };
  }
  
  /**
   * Force an immediate recalibration
   * PKL-278651-XP-0003-PULSE-FORCE: Manual recalibration trigger 
   */
  forceRecalibration(): void {
    console.log('[PicklePulse] Forcing immediate recalibration');
    this.runRecalibration();
  }
  
  /**
   * Check if any activities need adaptive recalibration
   * PKL-278651-XP-0003-PULSE-ADAPT: Adaptive recalibration checks
   */
  private async checkForAdaptiveRecalibration(): Promise<void> {
    if (!this.adaptiveSchedulingEnabled) return;
    
    const now = new Date();
    let recalibratedAny = false;
    
    // Check each activity type that has a scheduled next recalibration
    Array.from(this.nextRecalibrations.entries()).forEach(async ([activityType, nextDate]) => {
      if (now >= nextDate) {
        await this.recalibrateSpecificActivity(activityType);
        recalibratedAny = true;
      }
    });
    
    if (recalibratedAny) {
      // Reschedule next adaptive recalibrations after making changes
      this.scheduleNextAdaptiveRecalibrations();
    }
  }
  
  /**
   * Recalibrate a specific activity type
   * PKL-278651-XP-0003-PULSE-SPEC: Specific activity recalibration
   */
  private async recalibrateSpecificActivity(activityType: string): Promise<void> {
    try {
      console.log(`[PicklePulse] Running adaptive recalibration for ${activityType}`);
      
      // In a real implementation, this would recalibrate only the specific activity
      // For simplicity, we're doing a full recalibration here
      await this.multiplierService.recalculateMultipliers();
      
      console.log(`[PicklePulse] Adaptive recalibration for ${activityType} completed`);
    } catch (error) {
      console.error(`[PicklePulse] Error in adaptive recalibration for ${activityType}:`, error);
    }
  }
  
  /**
   * Schedule next adaptive recalibrations based on activity volatility
   * PKL-278651-XP-0003-PULSE-SCHED: Adaptive scheduling algorithm
   */
  private async scheduleNextAdaptiveRecalibrations(): Promise<void> {
    try {
      // Get current activity levels for major categories
      const activityMetrics = await this.getActivityMetrics();
      const now = new Date();
      
      // For each activity type, determine when it should next be recalibrated
      for (const [activityType, currentLevel] of Object.entries(activityMetrics)) {
        // Get previous level for comparison, default to current if no history
        const previousLevel = this.lastActivityLevels.get(activityType) || currentLevel;
        
        // Calculate volatility (how much the activity level has changed)
        const volatility = Math.abs(currentLevel - previousLevel) / previousLevel;
        
        // Store current level for next comparison
        this.lastActivityLevels.set(activityType, currentLevel);
        
        // Calculate next recalibration time based on volatility
        // High volatility = more frequent recalibration
        let hoursUntilNext = this.calculateAdaptiveInterval(volatility, currentLevel);
        
        // Add adaptive hours to current time
        const nextRecalibration = new Date(now);
        nextRecalibration.setHours(nextRecalibration.getHours() + hoursUntilNext);
        
        // Store next scheduled recalibration
        this.nextRecalibrations.set(activityType, nextRecalibration);
        
        console.log(`[PicklePulse] Next adaptive recalibration for ${activityType}: ${nextRecalibration.toISOString()} (volatility: ${volatility.toFixed(2)})`);
      }
    } catch (error) {
      console.error('[PicklePulse] Error scheduling adaptive recalibrations:', error);
    }
  }
  
  /**
   * Calculate the adaptive interval based on volatility and current activity level
   * PKL-278651-XP-0003-PULSE-INTVL: Adaptive interval calculation
   */
  private calculateAdaptiveInterval(volatility: number, activityLevel: number): number {
    // Base interval in hours
    const baseInterval = this.intervalHours;
    
    // High volatility = shorter interval
    // Low volatility = longer interval
    let adaptiveInterval;
    
    if (volatility > 0.5) {
      // Very high volatility - check very frequently (minimum 1 hour)
      adaptiveInterval = Math.max(1, baseInterval * 0.1);
    } else if (volatility > 0.25) {
      // High volatility - check frequently
      adaptiveInterval = baseInterval * 0.25;
    } else if (volatility > 0.1) {
      // Moderate volatility - check somewhat frequently
      adaptiveInterval = baseInterval * 0.5;
    } else if (volatility > 0.05) {
      // Low volatility - check less frequently
      adaptiveInterval = baseInterval * 0.75;
    } else {
      // Very low volatility - check at standard interval or slightly longer
      adaptiveInterval = baseInterval * 1.1;
    }
    
    // Also factor in current activity level
    // High activity level = check more frequently
    if (activityLevel > 3.0) {
      adaptiveInterval *= 0.6; // 40% reduction for very high activity
    } else if (activityLevel > 2.0) {
      adaptiveInterval *= 0.8; // 20% reduction for high activity
    }
    
    return adaptiveInterval;
  }
  
  /**
   * Get current activity metrics for adaptive scheduling
   */
  private async getActivityMetrics(): Promise<{[key: string]: number}> {
    // In a real implementation, this would query real metrics
    // For demonstration, we'll use simulated data
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    return {
      match: isWeekend ? 2.5 : (hour >= 17 && hour < 21 ? 1.8 : 1.0),
      community: (hour >= 18 && hour <= 21) ? 2.2 : 1.2,
      achievement: 1.0
    };
  }
  
  /**
   * Changes the recalibration interval
   * @param hours - New interval in hours
   */
  setInterval(hours: number): void {
    this.intervalHours = hours;
    
    // Restart the scheduler if it's running
    const wasRunning = this.recalibrationInterval !== null;
    const wasAdaptive = this.adaptiveSchedulingEnabled;
    
    if (wasRunning) {
      this.stop();
      this.start(wasAdaptive);
    }
    
    console.log(`[PicklePulse] Recalibration interval updated to ${hours} hours`);
  }
}

