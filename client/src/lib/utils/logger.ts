/**
 * PKL-278651-COMM-0006-HUB-UTIL
 * Logger Utility
 * 
 * This utility provides controlled logging that can be turned off in production.
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Control which log levels are active
const enabledLogLevels: Record<LogLevel, boolean> = {
  debug: isDevelopment,
  info: true,
  warn: true,
  error: true
};

/**
 * A structured logger that can be controlled in different environments
 */
export const logger = {
  /**
   * Log debug messages - only visible in development
   */
  debug: (...args: any[]) => {
    if (enabledLogLevels.debug) {
      console.debug('[Debug]', ...args);
    }
  },

  /**
   * Log informational messages
   */
  info: (...args: any[]) => {
    if (enabledLogLevels.info) {
      console.info('[Info]', ...args);
    }
  },

  /**
   * Log warning messages
   */
  warn: (...args: any[]) => {
    if (enabledLogLevels.warn) {
      console.warn('[Warning]', ...args);
    }
  },

  /**
   * Log error messages
   */
  error: (...args: any[]) => {
    if (enabledLogLevels.error) {
      console.error('[Error]', ...args);
    }
  }
};

/**
 * Function to replace all console logs with controlled logger
 * Call this early in the application bootstrap
 */
export function setupLogging() {
  if (!isDevelopment) {
    // In production, override the default console methods
    const originalConsole = { ...console };
    
    // Replace console.log to be silent in production
    console.log = (...args: any[]) => {
      if (isDevelopment) {
        originalConsole.log(...args);
      }
    };
    
    // Replace console.debug to be silent in production
    console.debug = (...args: any[]) => {
      if (isDevelopment) {
        originalConsole.debug(...args);
      }
    };
  }
}