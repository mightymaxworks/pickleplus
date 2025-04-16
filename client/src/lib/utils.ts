/**
 * Utility functions for the application
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts initials from a full name
 * @param name The full name to extract initials from
 * @returns The first letter of the first and last names, or the first letter of the name if only one name
 */
export function getInitials(name?: string | null): string {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Formats a date into a readable string
 * @param date The date to format
 * @returns A formatted date string
 */
export function formatDate(date?: Date | string | null): string {
  if (!date) return "—";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date-time into a readable string
 * @param date The date to format
 * @returns A formatted date-time string
 */
export function formatDateTime(date?: Date | string | null): string {
  if (!date) return "—";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 * @param str The string to truncate
 * @param maxLength The maximum length of the returned string
 * @returns The truncated string with ellipsis if needed
 */
export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
}

/**
 * Formats a number as a percentage
 * @param value The number to format
 * @param decimalPlaces The number of decimal places to include
 * @returns A formatted percentage string
 */
export function formatPercent(value: number, decimalPlaces = 0): string {
  return value.toFixed(decimalPlaces) + "%";
}