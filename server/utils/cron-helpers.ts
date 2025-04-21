/**
 * PKL-278651-BOUNCE-0005-AUTO - Cron Helpers
 * 
 * This file provides utility functions for working with cron expressions.
 * It implements a simple parser and next run date calculator without external dependencies.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { SCHEDULE_FREQUENCY } from '@shared/schema';

/**
 * Convert a schedule frequency to a cron expression
 * @param frequency Schedule frequency
 * @returns Cron expression
 */
export function cronExpressionFromFrequency(frequency: SCHEDULE_FREQUENCY): string {
  switch (frequency) {
    case SCHEDULE_FREQUENCY.HOURLY:
      return '0 * * * *'; // Run at minute 0 of every hour
    case SCHEDULE_FREQUENCY.DAILY:
      return '0 0 * * *'; // Run at midnight every day
    case SCHEDULE_FREQUENCY.WEEKLY:
      return '0 0 * * MON'; // Run at midnight every Monday
    case SCHEDULE_FREQUENCY.MONTHLY:
      return '0 0 1 * *'; // Run at midnight on the 1st of every month
    case SCHEDULE_FREQUENCY.QUARTERLY:
      return '0 0 1 1,4,7,10 *'; // Run at midnight on the 1st of Jan, Apr, Jul, Oct
    case SCHEDULE_FREQUENCY.CUSTOM:
      return ''; // Custom frequency requires explicit cron expression
    default:
      throw new Error(`Unknown schedule frequency: ${frequency}`);
  }
}

/**
 * Get the next run date for a cron expression
 * This is a simple implementation that only supports a subset of cron expressions
 * @param cronExpression Cron expression
 * @returns Next run date
 */
export function getNextRunDate(cronExpression: string): Date {
  // Split the cron expression into its components
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parseCronExpression(cronExpression);
  
  // Start with the current date
  const now = new Date();
  const nextRun = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes() + 1, // Start from the next minute
    0,
    0
  );
  
  // Find the next valid run date
  while (true) {
    // Check if the date matches the cron expression
    if (
      matchesMinute(nextRun.getMinutes(), minute) &&
      matchesHour(nextRun.getHours(), hour) &&
      matchesDayOfMonth(nextRun.getDate(), dayOfMonth) &&
      matchesMonth(nextRun.getMonth() + 1, month) && // JavaScript months are 0-indexed
      matchesDayOfWeek(nextRun.getDay(), dayOfWeek)
    ) {
      // This date matches the cron expression
      return nextRun;
    }
    
    // Move to the next minute
    nextRun.setMinutes(nextRun.getMinutes() + 1);
  }
}

/**
 * Parse a cron expression into its components
 * @param cronExpression Cron expression
 * @returns Array of cron components [minute, hour, dayOfMonth, month, dayOfWeek]
 */
function parseCronExpression(cronExpression: string): [number[], number[], number[], number[], number[]] {
  // Split the cron expression by spaces
  const parts = cronExpression.trim().split(/\s+/);
  
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: ${cronExpression}. Expected 5 components.`);
  }
  
  // Parse each component
  const minute = parseCronComponent(parts[0], 0, 59);
  const hour = parseCronComponent(parts[1], 0, 23);
  const dayOfMonth = parseCronComponent(parts[2], 1, 31);
  const month = parseCronComponent(parts[3], 1, 12);
  const dayOfWeek = parseCronComponent(parts[4], 0, 6);
  
  return [minute, hour, dayOfMonth, month, dayOfWeek];
}

/**
 * Parse a cron component into an array of numbers
 * @param component Cron component
 * @param min Minimum value
 * @param max Maximum value
 * @returns Array of numbers
 */
function parseCronComponent(component: string, min: number, max: number): number[] {
  // Handle '*' (all values)
  if (component === '*') {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }
  
  // Handle day of week names (only basic support)
  if (component.toUpperCase().includes('MON')) {
    return [1]; // Monday
  } else if (component.toUpperCase().includes('TUE')) {
    return [2]; // Tuesday
  } else if (component.toUpperCase().includes('WED')) {
    return [3]; // Wednesday
  } else if (component.toUpperCase().includes('THU')) {
    return [4]; // Thursday
  } else if (component.toUpperCase().includes('FRI')) {
    return [5]; // Friday
  } else if (component.toUpperCase().includes('SAT')) {
    return [6]; // Saturday
  } else if (component.toUpperCase().includes('SUN')) {
    return [0]; // Sunday
  }
  
  // Handle comma-separated values and ranges
  const values = new Set<number>();
  
  for (const part of component.split(',')) {
    if (part.includes('-')) {
      // Range
      const [rangeStart, rangeEnd] = part.split('-').map(p => parseInt(p, 10));
      for (let i = rangeStart; i <= rangeEnd; i++) {
        values.add(i);
      }
    } else if (part.includes('/')) {
      // Step values
      const [range, step] = part.split('/');
      const stepSize = parseInt(step, 10);
      const rangeValues = range === '*' 
        ? Array.from({ length: max - min + 1 }, (_, i) => min + i)
        : [parseInt(range, 10)];
      
      for (let i = 0; i < rangeValues.length; i += stepSize) {
        values.add(rangeValues[i]);
      }
    } else {
      // Single value
      values.add(parseInt(part, 10));
    }
  }
  
  return Array.from(values).sort((a, b) => a - b);
}

/**
 * Check if a minute matches a cron minute component
 * @param minute Minute to check (0-59)
 * @param cronMinute Cron minute component
 * @returns Whether the minute matches
 */
function matchesMinute(minute: number, cronMinute: number[]): boolean {
  return cronMinute.includes(minute);
}

/**
 * Check if an hour matches a cron hour component
 * @param hour Hour to check (0-23)
 * @param cronHour Cron hour component
 * @returns Whether the hour matches
 */
function matchesHour(hour: number, cronHour: number[]): boolean {
  return cronHour.includes(hour);
}

/**
 * Check if a day of month matches a cron day of month component
 * @param day Day to check (1-31)
 * @param cronDay Cron day of month component
 * @returns Whether the day matches
 */
function matchesDayOfMonth(day: number, cronDay: number[]): boolean {
  return cronDay.includes(day);
}

/**
 * Check if a month matches a cron month component
 * @param month Month to check (1-12)
 * @param cronMonth Cron month component
 * @returns Whether the month matches
 */
function matchesMonth(month: number, cronMonth: number[]): boolean {
  return cronMonth.includes(month);
}

/**
 * Check if a day of week matches a cron day of week component
 * @param day Day to check (0-6, 0 = Sunday)
 * @param cronDay Cron day of week component
 * @returns Whether the day matches
 */
function matchesDayOfWeek(day: number, cronDay: number[]): boolean {
  return cronDay.includes(day);
}