/**
 * PKL-278651-BOUNCE-0001-UTILS
 * Date Utility Functions
 * 
 * This file provides utilities for date and time handling:
 * 1. Formatting dates in a consistent way
 * 2. Calculating time differences
 * 3. Converting timestamps to human-readable forms
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-23
 */

/**
 * Formats a date object into a consistent string format
 * @param date The date to format
 * @returns Formatted date string (e.g., "April 23, 2025")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats a timestamp into a readable time string
 * @param timestamp Timestamp in milliseconds
 * @returns Formatted time string (e.g., "14:30:25")
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Formats a timestamp into a full date and time string
 * @param timestamp Timestamp in milliseconds
 * @returns Formatted date and time string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return `${formatDate(date)} at ${formatTime(timestamp)}`;
}

/**
 * Calculates the duration between two timestamps and formats as human-readable
 * @param startTime Start timestamp in milliseconds
 * @param endTime End timestamp in milliseconds
 * @returns Formatted duration string (e.g., "2 minutes 30 seconds")
 */
export function formatDuration(startTime: number, endTime: number): string {
  const durationMs = endTime - startTime;
  
  // For very short durations
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  
  // For durations less than a minute
  if (durationMs < 60000) {
    const seconds = Math.floor(durationMs / 1000);
    const ms = durationMs % 1000;
    return `${seconds}.${ms.toString().padStart(3, '0')}s`;
  }
  
  // For longer durations
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  if (seconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${seconds}s`;
}

/**
 * Creates a timestamp for the current time
 * @returns Current timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Formats a date as an ISO string without milliseconds
 * @param date The date to format
 * @returns ISO formatted string without milliseconds
 */
export function toISOWithoutMs(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}