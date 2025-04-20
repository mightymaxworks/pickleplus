/**
 * PKL-278651-COMM-0028-NOTIF-REALTIME - Logger Utility
 * Implementation timestamp: 2025-04-20 10:15 ET
 * 
 * Simple logger utility for consistent logging
 * 
 * Framework 5.2 compliant implementation
 */

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Current log level - can be set via environment variable
let currentLogLevel: LogLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;

// Order of log levels for comparison
const logLevelOrder = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3
};

// Determine if a log level should be shown
function shouldLog(level: LogLevel): boolean {
  return logLevelOrder[level] >= logLevelOrder[currentLogLevel];
}

// Format date for logs
function formatDate(): string {
  return new Date().toISOString();
}

// Format log message
function formatMessage(level: LogLevel, message: string, ...args: any[]): string {
  const timestamp = formatDate();
  let formattedMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
  if (args.length > 0) {
    // Handle objects and arrays in args
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    });
    
    formattedMessage += ` ${formattedArgs.join(' ')}`;
  }
  
  return formattedMessage;
}

// Logger implementation
export const logger = {
  setLogLevel(level: LogLevel): void {
    currentLogLevel = level;
    console.log(`Log level set to ${level}`);
  },
  
  debug(message: string, ...args: any[]): void {
    if (shouldLog(LogLevel.DEBUG)) {
      console.debug(formatMessage(LogLevel.DEBUG, message, ...args));
    }
  },
  
  info(message: string, ...args: any[]): void {
    if (shouldLog(LogLevel.INFO)) {
      console.info(formatMessage(LogLevel.INFO, message, ...args));
    }
  },
  
  warn(message: string, ...args: any[]): void {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatMessage(LogLevel.WARN, message, ...args));
    }
  },
  
  error(message: string, ...args: any[]): void {
    if (shouldLog(LogLevel.ERROR)) {
      console.error(formatMessage(LogLevel.ERROR, message, ...args));
    }
  }
};