import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date into a readable string
 * 
 * @param date Date to format
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };

  return new Date(date).toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format a date without time
 * 
 * @param date Date to format
 * @returns Formatted date string without time
 */
export function formatDateOnly(date: Date): string {
  return formatDate(date, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: undefined,
    minute: undefined
  });
}
