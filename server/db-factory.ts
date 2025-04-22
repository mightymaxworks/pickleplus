/**
 * PKL-278651-DB-0001-PROD
 * Database Connection Factory
 * 
 * This module provides a factory for creating database connections
 * with appropriate settings based on the current environment.
 * 
 * It creates a connection with production-specific safeguards when
 * running in production and development-friendly settings otherwise.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import configService from './config';

// WebSocket support for Neon
neonConfig.webSocketConstructor = ws;

// Environment detection
const isProd = configService.isProduction();

/**
 * Creates a database connection with appropriate settings for the current environment
 */
export function createDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  // Default database configuration
  const defaultPoolSize = isProd ? 20 : 5;
  const defaultIdleTimeoutMillis = isProd ? 30000 : 10000;
  const defaultConnectionTimeoutMillis = isProd ? 5000 : 2000;
  
  // Get configuration from config service with safe fallbacks
  let dbPoolSize = defaultPoolSize;
  let dbIdleTimeoutMillis = defaultIdleTimeoutMillis;
  let dbConnectionTimeoutMillis = defaultConnectionTimeoutMillis;
  let dbSsl: any = undefined;
  
  try {
    // Attempt to get database configuration safely
    const dbConfig = configService.get('database', {});
    if (typeof dbConfig === 'object' && dbConfig !== null) {
      if ('poolSize' in dbConfig && typeof dbConfig.poolSize === 'number') {
        dbPoolSize = dbConfig.poolSize;
      }
      if ('idleTimeoutMillis' in dbConfig && typeof dbConfig.idleTimeoutMillis === 'number') {
        dbIdleTimeoutMillis = dbConfig.idleTimeoutMillis;
      }
      if ('connectionTimeoutMillis' in dbConfig && typeof dbConfig.connectionTimeoutMillis === 'number') {
        dbConnectionTimeoutMillis = dbConfig.connectionTimeoutMillis;
      }
      if ('ssl' in dbConfig && typeof dbConfig.ssl === 'object' && dbConfig.ssl !== null) {
        dbSsl = dbConfig.ssl;
      }
    }
  } catch (error) {
    console.warn('Error reading database configuration, using defaults:', error);
  }
  
  // Pool configuration with environment-specific settings
  const poolConfig: any = {
    connectionString: process.env.DATABASE_URL,
    max: dbPoolSize,
    idleTimeoutMillis: dbIdleTimeoutMillis,
    connectionTimeoutMillis: dbConnectionTimeoutMillis,
  };
  
  // Only add SSL in production if configured
  if (isProd && dbSsl) {
    poolConfig.ssl = dbSsl;
  }

  // Create connection pool
  const pool = new Pool(poolConfig);

  // Add production safeguards
  if (isProd) {
    // Handle unexpected pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error', err);
      // In production, you might want to notify your error tracking service here
    });
    
    // Ensure pool is closed on application shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, closing database pool');
      pool.end();
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, closing database pool');
      pool.end();
    });
  }

  // Create and return Drizzle instance
  return {
    pool,
    db: drizzle({ client: pool, schema })
  };
}

// Create singleton instances
const { pool, db } = createDatabaseConnection();

// Export for use in application
export { pool, db };