/**
 * PKL-278651-BOUNCE-0005-AUTO - Cron Helpers
 * 
 * This file provides utility functions for working with cron expressions without dependencies.
 * It includes functions to calculate next run times and generate expressions based on frequency.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { SCHEDULE_FREQUENCY } from '@shared/schema';

/**
 * Generate a cron expression based on a frequency
 * @param frequency Frequency to generate a cron expression for
 * @returns Cron expression
 */
export function cronExpressionFromFrequency(frequency: SCHEDULE_FREQUENCY): string {
  switch (frequency) {
    case SCHEDULE_FREQUENCY.HOURLY:
      return '0 * * * *'; // Run at minute 0 of every hour
    case SCHEDULE_FREQUENCY.DAILY:
      return '0 0 * * *'; // Run at midnight every day
    case SCHEDULE_FREQUENCY.WEEKLY:
      return '0 0 * * 0'; // Run at midnight every Sunday
    case SCHEDULE_FREQUENCY.MONTHLY:
      return '0 0 1 * *'; // Run at midnight on the 1st of every month
    case SCHEDULE_FREQUENCY.QUARTERLY:
      return '0 0 1 1,4,7,10 *'; // Run at midnight on the 1st of Jan, Apr, Jul, Oct
    case SCHEDULE_FREQUENCY.CUSTOM:
      throw new Error('Custom frequency requires a custom cron expression');
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
}

/**
 * Get the next run date for a cron expression
 * @param cronExpression Cron expression to calculate the next run date for
 * @returns Next run date
 */
export function getNextRunDate(cronExpression: string): Date {
  const now = new Date();
  
  // Parse the cron expression into its components
  // Format: minute hour day month day-of-week
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: ${cronExpression}`);
  }
  
  const [minuteExpr, hourExpr, dayMonthExpr, monthExpr, dayWeekExpr] = parts;
  
  // Start with the current date and time as the candidate
  let candidate = new Date(now);
  candidate.setSeconds(0);
  candidate.setMilliseconds(0);
  
  // Ensure we're looking at a future date
  candidate.setMinutes(candidate.getMinutes() + 1);
  
  // Maximum number of attempts to prevent infinite loops
  const MAX_ATTEMPTS = 1000;
  let attempts = 0;
  
  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    
    // Check if the candidate matches the cron expression
    if (
      matchesCronExpression(
        candidate.getMinutes(),
        candidate.getHours(),
        candidate.getDate(),
        candidate.getMonth() + 1, // JavaScript months are 0-based
        candidate.getDay()
      )
    ) {
      return candidate;
    }
    
    // Move to the next minute
    candidate.setMinutes(candidate.getMinutes() + 1);
  }
  
  throw new Error(`Could not find a matching date for cron expression: ${cronExpression}`);
  
  /**
   * Check if a date/time matches a cron expression
   * @param minute Minute to check
   * @param hour Hour to check
   * @param dayMonth Day of month to check
   * @param month Month to check
   * @param dayWeek Day of week to check
   * @returns Whether the date/time matches the cron expression
   */
  function matchesCronExpression(
    minute: number,
    hour: number,
    dayMonth: number,
    month: number,
    dayWeek: number
  ): boolean {
    return (
      fieldMatches(minute, minuteExpr, 0, 59) &&
      fieldMatches(hour, hourExpr, 0, 23) &&
      fieldMatches(dayMonth, dayMonthExpr, 1, 31) &&
      fieldMatches(month, monthExpr, 1, 12) &&
      fieldMatches(dayWeek, dayWeekExpr, 0, 6)
    );
  }
  
  /**
   * Check if a field matches a cron expression component
   * @param value Value to check
   * @param expr Cron expression component
   * @param min Minimum valid value for this field
   * @param max Maximum valid value for this field
   * @returns Whether the field matches the expression
   */
  function fieldMatches(value: number, expr: string, min: number, max: number): boolean {
    // Handle wildcard (every value)
    if (expr === '*') {
      return true;
    }
    
    // Handle comma-separated values (multiple values)
    if (expr.includes(',')) {
      return expr.split(',').some(part => fieldMatches(value, part, min, max));
    }
    
    // Handle range (value-value)
    if (expr.includes('-')) {
      const [start, end] = expr.split('-').map(Number);
      return value >= start && value <= end;
    }
    
    // Handle step values (*/step or min-max/step)
    if (expr.includes('/')) {
      const [range, step] = expr.split('/');
      const stepNum = parseInt(step, 10);
      
      if (range === '*') {
        return (value - min) % stepNum === 0;
      }
      
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        return value >= start && value <= end && (value - start) % stepNum === 0;
      }
    }
    
    // Handle simple value
    return parseInt(expr, 10) === value;
  }
}

/**
 * Format a cron expression in a human-readable format
 * @param cronExpression Cron expression to format
 * @returns Human-readable string
 */
export function formatCronExpression(cronExpression: string): string {
  // Parse the cron expression
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return 'Invalid cron expression';
  }
  
  const [minute, hour, dayMonth, month, dayWeek] = parts;
  
  // Check for common patterns
  if (minute === '0' && hour === '0' && dayMonth === '*' && month === '*' && dayWeek === '*') {
    return 'Every day at midnight';
  }
  
  if (minute === '0' && hour === '*' && dayMonth === '*' && month === '*' && dayWeek === '*') {
    return 'Every hour on the hour';
  }
  
  if (minute === '0' && hour === '0' && dayMonth === '*' && month === '*' && dayWeek === '0') {
    return 'Every Sunday at midnight';
  }
  
  if (minute === '0' && hour === '0' && dayMonth === '1' && month === '*' && dayWeek === '*') {
    return 'First day of every month at midnight';
  }
  
  if (minute === '0' && hour === '0' && dayMonth === '1' && month === '1,4,7,10' && dayWeek === '*') {
    return 'First day of each quarter at midnight';
  }
  
  // Fall back to a generic description
  return 'Custom schedule';
}