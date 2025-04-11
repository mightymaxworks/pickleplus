import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date into a human-readable string
 * @param date The date to format
 * @param options Additional formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  options: {
    weekday?: boolean;
    year?: boolean;
    month?: "short" | "long" | "numeric" | "2-digit";
    day?: "numeric" | "2-digit";
    hour?: boolean;
    minute?: boolean;
    second?: boolean;
  } = {}
): string {
  const {
    weekday = false,
    year = true,
    month = "long",
    day = "numeric",
    hour = false,
    minute = false,
    second = false,
  } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    month,
    day,
  };

  if (weekday) formatOptions.weekday = "long";
  if (year) formatOptions.year = "numeric";
  if (hour) formatOptions.hour = "numeric";
  if (minute) formatOptions.minute = "2-digit";
  if (second) formatOptions.second = "2-digit";
  if (hour || minute || second) formatOptions.hour12 = true;

  return new Intl.DateTimeFormat("en-US", formatOptions).format(date);
}

/**
 * Formats a date as a time string
 * @param date The date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Formats a date as a date and time string
 * @param date The date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  return formatDate(date, {
    month: "short",
    day: "numeric",
    year: true,
    hour: true,
    minute: true,
  });
}

/**
 * Formats a date as a date only string (no time)
 * @param date The date to format
 * @returns Formatted date string without time
 */
export function formatDateOnly(date: Date): string {
  return formatDate(date, {
    month: "short",
    day: "numeric",
    year: true,
    hour: false,
    minute: false,
  });
}

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currency The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text The text to truncate
 * @param length The maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Generates a random string for use as a unique ID
 * @param length The length of the string
 * @returns Random string
 */
export function generateRandomString(length: number = 8): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Creates a random alphanumeric check-in code for events
 * @param length The length of the code
 * @returns Random check-in code
 */
export function generateEventCheckInCode(length: number = 6): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar-looking characters
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Formats a phone number to (XXX) XXX-XXXX format
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");
  
  // Check if the number has the right number of digits
  if (cleaned.length !== 10) {
    return phoneNumber; // Return original if not valid
  }
  
  // Format as (XXX) XXX-XXXX
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}

/**
 * Converts a timestamp string to a relative time (e.g., "2 hours ago")
 * @param timestamp The timestamp string or Date object
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: string | Date): string {
  const now = new Date();
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const secondsAgo = Math.round((now.getTime() - date.getTime()) / 1000);
  
  // Handle future dates
  if (secondsAgo < 0) {
    return "in the future";
  }
  
  // Time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  // Determine the appropriate interval
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(secondsAgo / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }
  
  return "just now";
}

/**
 * PKL-278651-CONN-0004-PASS-REG-UI-PHASE2
 * Safely formats a date with error handling
 * @param dateInput Any date input (string, Date, or undefined)
 * @param options Formatting options
 * @returns Formatted date string or fallback message
 */
export function safeFormatDate(
  dateInput: string | Date | number | undefined | null, 
  options: {
    month?: "short" | "long" | "numeric" | "2-digit";
    day?: "numeric" | "2-digit";
    year?: boolean;
    weekday?: boolean;
  } = {}
): string {
  try {
    if (!dateInput) return "Date TBD";
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Date TBD";
    
    return formatDate(date, options);
  } catch (error) {
    console.error("Error safely formatting date:", error);
    return "Date TBD";
  }
}

/**
 * PKL-278651-CONN-0004-PASS-REG-UI-PHASE2
 * Safely formats a time with error handling
 * @param dateInput Any date input (string, Date, or undefined)
 * @returns Formatted time string or fallback message
 */
export function safeFormatTime(
  dateInput: string | Date | number | undefined | null
): string {
  try {
    if (!dateInput) return "Time TBD";
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Time TBD";
    
    return formatTime(date);
  } catch (error) {
    console.error("Error safely formatting time:", error);
    return "Time TBD";
  }
}