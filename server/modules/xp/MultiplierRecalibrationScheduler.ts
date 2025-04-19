/**
 * PKL-278651-XP-0003-PULSE
 * Multiplier Recalibration Scheduler
 * 
 * This service schedules periodic recalibration of activity multipliers
 * using the PicklePulse™ algorithm.
 * 
 * @framework Framework5.1
 * @version 1.0.0
 */

import ActivityMultiplierService from './ActivityMultiplierService';
import { DatabaseStorage } from '../../storage';

export class MultiplierRecalibrationScheduler {
  private multiplierService: ActivityMultiplierService;
  private recalibrationInterval: NodeJS.Timeout | null = null;
  private intervalHours: number;
  
  constructor(storage: DatabaseStorage, intervalHours: number = 24) {
    this.multiplierService = new ActivityMultiplierService(storage);
    this.intervalHours = intervalHours;
  }
  
  /**
   * Starts the scheduler to run recalibration at specified intervals
   */
  start(): void {
    // Convert hours to milliseconds
    const intervalMs = this.intervalHours * 60 * 60 * 1000;
    
    console.log(`[PicklePulse] Starting recalibration scheduler (interval: ${this.intervalHours} hours)`);
    
    // Run immediately once
    this.runRecalibration();
    
    // Set up interval for future runs
    this.recalibrationInterval = setInterval(() => {
      this.runRecalibration();
    }, intervalMs);
  }
  
  /**
   * Stops the scheduler
   */
  stop(): void {
    if (this.recalibrationInterval) {
      clearInterval(this.recalibrationInterval);
      this.recalibrationInterval = null;
      console.log('[PicklePulse] Recalibration scheduler stopped');
    }
  }
  
  /**
   * Runs a recalibration
   */
  private runRecalibration(): void {
    console.log('[PicklePulse] Running scheduled recalibration');
    
    this.multiplierService.recalibrateMultipliers()
      .then(() => {
        console.log('[PicklePulse] Scheduled recalibration completed successfully');
      })
      .catch(error => {
        console.error('[PicklePulse] Error in scheduled recalibration:', error);
      });
  }
  
  /**
   * Changes the recalibration interval
   */
  setInterval(hours: number): void {
    this.intervalHours = hours;
    
    // Restart the scheduler if it's running
    if (this.recalibrationInterval) {
      this.stop();
      this.start();
    }
    
    console.log(`[PicklePulse] Recalibration interval updated to ${hours} hours`);
  }
}

export default MultiplierRecalibrationScheduler;