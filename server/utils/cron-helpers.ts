/**
 * PKL-278651-BOUNCE-0005-AUTO - Cron Helpers
 * 
 * This file provides utilities for working with cron expressions without external dependencies.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

/**
 * Represents a parsed cron schedule
 */
export interface CronSchedule {
  minutes: number[];    // 0-59
  hours: number[];      // 0-23
  daysOfMonth: number[]; // 1-31
  months: number[];     // 1-12
  daysOfWeek: number[]; // 0-6 (Sunday = 0)
}

/**
 * Parse a cron expression into a structured schedule
 * 
 * @param cronExpression Standard cron expression (e.g., "0 9 * * 1-5")
 * @returns Parsed cron schedule or null if invalid
 */
export function parseCronExpression(cronExpression: string): CronSchedule | null {
  try {
    // Split the cron expression into fields
    const fields = cronExpression.trim().split(/\s+/);
    
    // Ensure we have exactly 5 fields
    if (fields.length !== 5) {
      console.error('Invalid cron expression: expected 5 fields, got', fields.length);
      return null;
    }
    
    // Parse each field
    const schedule: CronSchedule = {
      minutes: parseField(fields[0], 0, 59),
      hours: parseField(fields[1], 0, 23),
      daysOfMonth: parseField(fields[2], 1, 31),
      months: parseField(fields[3], 1, 12),
      daysOfWeek: parseField(fields[4], 0, 6)
    };
    
    return schedule;
  } catch (error) {
    console.error('Error parsing cron expression:', error);
    return null;
  }
}

/**
 * Parse a cron field into an array of numbers
 * 
 * @param field Field to parse
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns Array of numbers
 */
function parseField(field: string, min: number, max: number): number[] {
  // If the field is *, return all values
  if (field === '*') {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }
  
  // Handle multiple values separated by commas
  const result = new Set<number>();
  
  for (const part of field.split(',')) {
    // Handle ranges (e.g., 1-5)
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(p => parseInt(p, 10));
      
      if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
        throw new Error(`Invalid range in cron field: ${part}`);
      }
      
      for (let i = start; i <= end; i++) {
        result.add(i);
      }
    }
    // Handle steps (e.g., */5 or 1-30/5)
    else if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      
      if (isNaN(step) || step <= 0) {
        throw new Error(`Invalid step in cron field: ${part}`);
      }
      
      let values: number[] = [];
      
      // Handle */5 (every 5th value)
      if (range === '*') {
        values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      }
      // Handle 1-30/5 (every 5th value from 1 to 30)
      else if (range.includes('-')) {
        const [rangeStart, rangeEnd] = range.split('-').map(p => parseInt(p, 10));
        
        if (isNaN(rangeStart) || isNaN(rangeEnd) || rangeStart < min || rangeEnd > max || rangeStart > rangeEnd) {
          throw new Error(`Invalid range in cron field: ${range}`);
        }
        
        values = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i);
      }
      // Handle single value (e.g., 1/5) which doesn't make sense
      else {
        throw new Error(`Invalid range with step in cron field: ${part}`);
      }
      
      // Apply the step
      for (let i = 0; i < values.length; i += step) {
        result.add(values[i]);
      }
    }
    // Handle single values
    else {
      const value = parseInt(part, 10);
      
      if (isNaN(value) || value < min || value > max) {
        throw new Error(`Invalid value in cron field: ${part}`);
      }
      
      result.add(value);
    }
  }
  
  return Array.from(result).sort((a, b) => a - b);
}

/**
 * Check if a date matches a cron schedule
 * 
 * @param schedule Cron schedule to check against
 * @param date Date to check (defaults to current date)
 * @returns Whether the date matches the schedule
 */
export function matchesCronSchedule(schedule: CronSchedule, date: Date = new Date()): boolean {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const dayOfWeek = date.getDay(); // JavaScript days are 0-indexed (0 = Sunday)
  
  return (
    schedule.minutes.includes(minute) &&
    schedule.hours.includes(hour) &&
    schedule.daysOfMonth.includes(dayOfMonth) &&
    schedule.months.includes(month) &&
    schedule.daysOfWeek.includes(dayOfWeek)
  );
}

/**
 * Calculate the next run time for a cron schedule
 * 
 * @param schedule Cron schedule
 * @param fromDate Date to calculate from (defaults to current date)
 * @returns Next date that matches the schedule
 */
export function calculateNextRunTime(schedule: CronSchedule, fromDate: Date = new Date()): Date {
  // Create a copy of the date to avoid modifying the original
  const date = new Date(fromDate);
  
  // Round to the next minute
  date.setSeconds(0);
  date.setMilliseconds(0);
  
  // Add one minute to start checking from the next minute
  date.setMinutes(date.getMinutes() + 1);
  
  // Try the next 1000 minutes as a safety limit
  for (let i = 0; i < 1000; i++) {
    if (matchesCronSchedule(schedule, date)) {
      return date;
    }
    
    // Move to the next minute
    date.setMinutes(date.getMinutes() + 1);
  }
  
  // Fallback: couldn't find a match
  console.error('Could not find next run time for cron schedule within 1000 minutes');
  const fallbackDate = new Date(fromDate);
  fallbackDate.setDate(fallbackDate.getDate() + 1); // Add one day
  fallbackDate.setHours(9, 0, 0, 0); // Set to 9 AM as a safe default
  return fallbackDate;
}

/**
 * Calculate the previous time a cron schedule would have run
 * 
 * @param schedule Cron schedule
 * @param fromDate Date to calculate from (defaults to current date)
 * @returns Previous date that matches the schedule
 */
export function calculatePreviousRunTime(schedule: CronSchedule, fromDate: Date = new Date()): Date {
  // Create a copy of the date to avoid modifying the original
  const date = new Date(fromDate);
  
  // Round to the current minute
  date.setSeconds(0);
  date.setMilliseconds(0);
  
  // Try the previous 1000 minutes as a safety limit
  for (let i = 0; i < 1000; i++) {
    // Check the current minute
    if (matchesCronSchedule(schedule, date)) {
      return date;
    }
    
    // Move to the previous minute
    date.setMinutes(date.getMinutes() - 1);
  }
  
  // Fallback: couldn't find a match
  console.error('Could not find previous run time for cron schedule within 1000 minutes');
  const fallbackDate = new Date(fromDate);
  fallbackDate.setDate(fallbackDate.getDate() - 1); // Subtract one day
  fallbackDate.setHours(17, 0, 0, 0); // Set to 5 PM as a safe default
  return fallbackDate;
}

/**
 * Get a human-readable description of a cron schedule
 * 
 * @param schedule Cron schedule or cron expression string
 * @returns Human-readable description
 */
export function getCronDescription(schedule: CronSchedule | string): string {
  if (typeof schedule === 'string') {
    const parsedSchedule = parseCronExpression(schedule);
    if (!parsedSchedule) {
      return 'Invalid cron expression';
    }
    schedule = parsedSchedule;
  }
  
  // Check for common patterns
  
  // Every minute
  if (
    schedule.minutes.length === 60 &&
    schedule.hours.length === 24 &&
    schedule.daysOfMonth.length === 31 &&
    schedule.months.length === 12 &&
    schedule.daysOfWeek.length === 7
  ) {
    return 'Every minute';
  }
  
  // Hourly (at minute 0)
  if (
    schedule.minutes.length === 1 && schedule.minutes[0] === 0 &&
    schedule.hours.length === 24 &&
    schedule.daysOfMonth.length === 31 &&
    schedule.months.length === 12 &&
    schedule.daysOfWeek.length === 7
  ) {
    return 'Hourly (at the start of each hour)';
  }
  
  // Daily (at specific time)
  if (
    schedule.minutes.length === 1 &&
    schedule.hours.length === 1 &&
    schedule.daysOfMonth.length === 31 &&
    schedule.months.length === 12 &&
    schedule.daysOfWeek.length === 7
  ) {
    const hour = schedule.hours[0];
    const minute = schedule.minutes[0];
    const hourStr = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    const minuteStr = minute < 10 ? `0${minute}` : minute.toString();
    return `Daily at ${hourStr}:${minuteStr}`;
  }
  
  // Weekly (on specific days at specific time)
  if (
    schedule.minutes.length === 1 &&
    schedule.hours.length === 1 &&
    schedule.daysOfMonth.length === 31 &&
    schedule.months.length === 12 &&
    schedule.daysOfWeek.length < 7
  ) {
    const hour = schedule.hours[0];
    const minute = schedule.minutes[0];
    const hourStr = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    const minuteStr = minute < 10 ? `0${minute}` : minute.toString();
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days = schedule.daysOfWeek.map(day => dayNames[day]);
    
    if (days.length === 1) {
      return `Weekly on ${days[0]} at ${hourStr}:${minuteStr}`;
    } else if (days.length === 5 && days.includes('Monday') && days.includes('Friday')) {
      return `Weekdays at ${hourStr}:${minuteStr}`;
    } else if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
      return `Weekends at ${hourStr}:${minuteStr}`;
    } else {
      return `Weekly on ${days.join(', ')} at ${hourStr}:${minuteStr}`;
    }
  }
  
  // Monthly (on specific day of month)
  if (
    schedule.minutes.length === 1 &&
    schedule.hours.length === 1 &&
    schedule.daysOfMonth.length === 1 &&
    schedule.months.length === 12 &&
    schedule.daysOfWeek.length === 7
  ) {
    const hour = schedule.hours[0];
    const minute = schedule.minutes[0];
    const day = schedule.daysOfMonth[0];
    const hourStr = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    const minuteStr = minute < 10 ? `0${minute}` : minute.toString();
    const dayStr = day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`;
    
    return `Monthly on the ${dayStr} at ${hourStr}:${minuteStr}`;
  }
  
  // Quarterly
  if (
    schedule.minutes.length === 1 &&
    schedule.hours.length === 1 &&
    schedule.daysOfMonth.length === 1 && schedule.daysOfMonth[0] === 1 &&
    schedule.months.length === 4 && 
    schedule.months.includes(1) && schedule.months.includes(4) && 
    schedule.months.includes(7) && schedule.months.includes(10) &&
    schedule.daysOfWeek.length === 7
  ) {
    const hour = schedule.hours[0];
    const minute = schedule.minutes[0];
    const hourStr = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
    const minuteStr = minute < 10 ? `0${minute}` : minute.toString();
    
    return `Quarterly (Jan, Apr, Jul, Oct) on the 1st at ${hourStr}:${minuteStr}`;
  }
  
  // If no pattern matches, return a generic description
  return 'Custom schedule';
}

export default {
  parseCronExpression,
  matchesCronSchedule,
  calculateNextRunTime,
  calculatePreviousRunTime,
  getCronDescription
};