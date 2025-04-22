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

  // Get configuration from config service
  const dbConfig = configService.get('database', {});
  
  // Pool configuration with environment-specific settings
  const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: isProd ? (dbConfig.poolSize || 20) : 5, // More connections for production
    idleTimeoutMillis: isProd ? (dbConfig.idleTimeoutMillis || 30000) : 10000,
    connectionTimeoutMillis: isProd ? (dbConfig.connectionTimeoutMillis || 5000) : 2000,
    // Only add SSL in production if configured
    ...(isProd && dbConfig.ssl ? { ssl: dbConfig.ssl } : {})
  };

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