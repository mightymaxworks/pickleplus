/**
 * PKL-278651-BOUNCE-0005-AUTO - Cron Expression Helpers
 * 
 * Utility functions for working with cron expressions in the Bounce scheduler.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { SCHEDULE_FREQUENCY } from '@shared/schema';
import parser from 'cron-parser';

/**
 * Generate a cron expression based on a frequency type
 */
export function cronExpressionFromFrequency(frequency: SCHEDULE_FREQUENCY): string {
  switch (frequency) {
    case SCHEDULE_FREQUENCY.HOURLY:
      return '0 * * * *'; // At minute 0 of every hour
    
    case SCHEDULE_FREQUENCY.DAILY:
      return '0 0 * * *'; // At 00:00 (midnight) every day
    
    case SCHEDULE_FREQUENCY.WEEKLY:
      return '0 0 * * 0'; // At 00:00 on Sunday
    
    case SCHEDULE_FREQUENCY.MONTHLY:
      return '0 0 1 * *'; // At 00:00 on day-of-month 1
    
    case SCHEDULE_FREQUENCY.CUSTOM:
      // Custom requires an explicit cron expression
      return '';
    
    default:
      return '0 0 * * *'; // Default to daily at midnight
  }
}

/**
 * Calculate the next run date based on a cron expression
 */
export function getNextRunDate(cronExpression: string): Date {
  try {
    const interval = parser.parseExpression(cronExpression);
    return interval.next().toDate();
  } catch (error) {
    console.error(`Error parsing cron expression: ${cronExpression}`, error);
    
    // Default to 24 hours from now if parse fails
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }
}

/**
 * Get a human-readable description of a schedule frequency
 */
export function getFrequencyDescription(frequency: SCHEDULE_FREQUENCY, cronExpression?: string | null): string {
  switch (frequency) {
    case SCHEDULE_FREQUENCY.HOURLY:
      return 'Every hour';
    
    case SCHEDULE_FREQUENCY.DAILY:
      return 'Every day at midnight';
    
    case SCHEDULE_FREQUENCY.WEEKLY:
      return 'Every Sunday at midnight';
    
    case SCHEDULE_FREQUENCY.MONTHLY:
      return 'First day of every month at midnight';
    
    case SCHEDULE_FREQUENCY.CUSTOM:
      if (cronExpression) {
        try {
          // Attempt to create a more readable description
          const parts = cronExpression.split(' ');
          if (parts.length === 5) {
            const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
            
            if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
              return 'Every minute';
            }
            
            if (hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
              if (minute === '0') {
                return 'Every hour on the hour';
              }
              if (minute === '*/5') {
                return 'Every 5 minutes';
              }
              if (minute === '*/15') {
                return 'Every 15 minutes';
              }
              if (minute === '*/30') {
                return 'Every 30 minutes';
              }
            }
            
            if (minute === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
              if (hour === '*/2') {
                return 'Every 2 hours';
              }
              if (hour === '*/4') {
                return 'Every 4 hours';
              }
              if (hour === '*/6') {
                return 'Every 6 hours';
              }
              if (hour === '*/12') {
                return 'Every 12 hours';
              }
            }
            
            // Return the cron expression if we can't simplify it
            return `Custom schedule (${cronExpression})`;
          }
        } catch (error) {
          console.error('Error parsing cron expression for description', error);
        }
      }
      return 'Custom schedule';
    
    default:
      return 'Unknown schedule';
  }
}