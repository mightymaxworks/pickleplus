/**
 * PKL-278651-CONFIG-0004-PROD
 * Configuration Service
 * 
 * This module provides a unified way to access configuration settings
 * based on the current environment (development, test, production).
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

// Import configuration dynamically - works in both ESM and CommonJS
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import environment-specific configurations
const defaultConfig = require('../../config/default.js');
const productionConfig = require('../../config/production.js');

// Environment detection
const env = process.env.NODE_ENV || 'development';

// Merge configurations based on current environment
let config;
if (env === 'production') {
  config = { ...defaultConfig, ...productionConfig };
} else {
  config = defaultConfig;
}

/**
 * Configuration service that provides access to environment-specific settings
 */
const configService = {
  /**
   * Gets the current environment (development, test, production)
   */
  getEnvironment: (): string => {
    return env;
  },

  /**
   * Checks if the application is running in production environment
   */
  isProduction: (): boolean => {
    return env === 'production';
  },

  /**
   * Gets a configuration value by its path
   * @param path Dot-notation path to the configuration value
   * @param defaultVal Default value to return if path not found
   */
  get: <T>(path: string, defaultVal?: T): T => {
    const parts = path.split('.');
    let current: any = config;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return defaultVal as T;
      }
      current = current[part];
    }

    return (current === undefined || current === null) ? defaultVal as T : current as T;
  },

  /**
   * Gets the full configuration object
   */
  getAll: () => {
    return { ...config };
  }
};

export default configService;