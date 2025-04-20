/**
 * PKL-278651-CORE-0003-LOGGER - Shared Logger Utility
 * Implementation timestamp: 2025-04-20 11:00 ET
 * 
 * Common logging utility for consistent logging format across the application
 * 
 * Framework 5.2 compliant implementation
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Environment-based log level (defaults to INFO)
const currentLogLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();

const shouldLog = (level: string): boolean => {
  const levels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };
  
  return levels[level as keyof typeof levels] <= levels[currentLogLevel as keyof typeof levels];
};

// Format date for log timestamp
const formatDate = (): string => {
  const now = new Date();
  return now.toISOString();
};

// Format log message with timestamp and level
const formatLogMessage = (level: string, message: string, ...args: any[]): string => {
  const timestamp = formatDate();
  let logMessage = `${timestamp} [${level}] ${message}`;
  
  if (args.length > 0) {
    // Handle objects and errors
    args.forEach(arg => {
      if (arg instanceof Error) {
        logMessage += `\n  ${arg.stack || arg.message}`;
      } else if (typeof arg === 'object') {
        try {
          logMessage += `\n  ${JSON.stringify(arg, null, 2)}`;
        } catch (e) {
          logMessage += `\n  [Object cannot be stringified]`;
        }
      } else {
        logMessage += ` ${arg}`;
      }
    });
  }
  
  return logMessage;
};

export const logger = {
  error(message: string, ...args: any[]): void {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(formatLogMessage(LOG_LEVELS.ERROR, message, ...args));
    }
  },
  
  warn(message: string, ...args: any[]): void {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(formatLogMessage(LOG_LEVELS.WARN, message, ...args));
    }
  },
  
  info(message: string, ...args: any[]): void {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.info(formatLogMessage(LOG_LEVELS.INFO, message, ...args));
    }
  },
  
  debug(message: string, ...args: any[]): void {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.debug(formatLogMessage(LOG_LEVELS.DEBUG, message, ...args));
    }
  },
  
  // Log with custom level
  log(level: string, message: string, ...args: any[]): void {
    console.log(formatLogMessage(level, message, ...args));
  }
};