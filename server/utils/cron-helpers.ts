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
  // Format: <minute> <hour> <day-of-month> <month> <day-of-week>
  switch (frequency) {
    case SCHEDULE_FREQUENCY.HOURLY:
      return '0 * * * *'; // At minute 0 every hour
    
    case SCHEDULE_FREQUENCY.DAILY:
      return '0 0 * * *'; // At 00:00 (midnight) every day
    
    case SCHEDULE_FREQUENCY.WEEKLY:
      return '0 0 * * 1'; // At 00:00 on Monday
    
    case SCHEDULE_FREQUENCY.MONTHLY:
      return '0 0 1 * *'; // At 00:00 on the 1st of every month
    
    case SCHEDULE_FREQUENCY.QUARTERLY:
      return '0 0 1 1,4,7,10 *'; // At 00:00 on the 1st of Jan, Apr, Jul, Oct
    
    case SCHEDULE_FREQUENCY.CUSTOM:
      // For custom frequency, a specific cron expression should be provided
      throw new Error('Custom frequency requires a specific cron expression');
    
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }
}

/**
 * Get the next run date for a cron expression
 * @param cronExpression Cron expression to calculate the next run date for
 * @returns Next run date
 */
export function getNextRunDate(cronExpression: string): Date {
  const now = new Date();
  const parts = cronExpression.trim().split(/\s+/);
  
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: ${cronExpression}. Expected 5 parts but got ${parts.length}.`);
  }
  
  const [minutePart, hourPart, dayOfMonthPart, monthPart, dayOfWeekPart] = parts;
  
  // Start with current date and increment until we find a matching date
  const result = new Date(now);
  // Start from the next minute
  result.setSeconds(0);
  result.setMilliseconds(0);
  result.setMinutes(result.getMinutes() + 1);
  
  // Maximum iterations to prevent infinite loops (1 year worth of minutes)
  const maxIterations = 365 * 24 * 60;
  let iterations = 0;
  
  while (iterations < maxIterations) {
    if (matchesCronExpression(
      result.getMinutes(),
      result.getHours(),
      result.getDate(),
      result.getMonth() + 1, // JavaScript months are 0-based
      result.getDay() === 0 ? 7 : result.getDay() // Convert Sunday (0) to 7 to match cron format
    )) {
      return result;
    }
    
    // Move to the next minute
    result.setMinutes(result.getMinutes() + 1);
    iterations++;
  }
  
  throw new Error(`Failed to find a matching date for cron expression: ${cronExpression} within reasonable iterations`);
  
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
      fieldMatches(minute, minutePart, 0, 59) &&
      fieldMatches(hour, hourPart, 0, 23) &&
      fieldMatches(dayMonth, dayOfMonthPart, 1, 31) &&
      fieldMatches(month, monthPart, 1, 12) &&
      fieldMatches(dayWeek, dayOfWeekPart, 1, 7)
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
    // Wildcard
    if (expr === '*') {
      return true;
    }
    
    // List of values
    if (expr.includes(',')) {
      return expr.split(',').some(item => fieldMatches(value, item, min, max));
    }
    
    // Range
    if (expr.includes('-')) {
      const [start, end] = expr.split('-').map(Number);
      return value >= start && value <= end;
    }
    
    // Step values
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
    
    // Simple value
    return parseInt(expr, 10) === value;
  }
}

/**
 * Format a cron expression in a human-readable format
 * @param cronExpression Cron expression to format
 * @returns Human-readable string
 */
export function formatCronExpression(cronExpression: string): string {
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return `Invalid cron expression: ${cronExpression}`;
  }
  
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  // Common patterns
  if (cronExpression === '0 * * * *') {
    return 'Every hour at the beginning of the hour';
  }
  
  if (cronExpression === '0 0 * * *') {
    return 'Daily at midnight';
  }
  
  if (cronExpression === '0 0 * * 1') {
    return 'Weekly on Monday at midnight';
  }
  
  if (cronExpression === '0 0 1 * *') {
    return 'Monthly on the 1st at midnight';
  }
  
  if (cronExpression === '0 0 1 1,4,7,10 *') {
    return 'Quarterly on the 1st of January, April, July, and October at midnight';
  }
  
  // Fallback to a simpler representation
  let result = '';
  
  // Minute
  if (minute === '*') {
    result += 'Every minute';
  } else if (minute.includes('/')) {
    const [, step] = minute.split('/');
    result += `Every ${step} minutes`;
  } else {
    result += `At minute ${minute}`;
  }
  
  // Hour
  if (hour === '*') {
    result += ' of every hour';
  } else if (hour.includes('/')) {
    const [, step] = hour.split('/');
    result += ` every ${step} hours`;
  } else {
    result += ` of hour ${hour}`;
  }
  
  // Day of month
  if (dayOfMonth !== '*') {
    result += ` on the ${dayOfMonth}${getDaySuffix(parseInt(dayOfMonth, 10))}`;
  }
  
  // Month
  if (month !== '*') {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (month.includes(',')) {
      const months = month.split(',').map(m => monthNames[parseInt(m, 10) - 1]);
      result += ` of ${months.slice(0, -1).join(', ')} and ${months[months.length - 1]}`;
    } else {
      result += ` of ${monthNames[parseInt(month, 10) - 1]}`;
    }
  }
  
  // Day of week
  if (dayOfWeek !== '*') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (dayOfWeek.includes(',')) {
      const days = dayOfWeek.split(',').map(d => dayNames[parseInt(d, 10) % 7]);
      result += ` on ${days.slice(0, -1).join(', ')} and ${days[days.length - 1]}`;
    } else {
      result += ` on ${dayNames[parseInt(dayOfWeek, 10) % 7]}`;
    }
  }
  
  return result;
  
  function getDaySuffix(day: number): string {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}