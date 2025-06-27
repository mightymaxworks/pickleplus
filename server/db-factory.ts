/**
 * Database Connection
 * 
 * This module provides database connection with Neon Postgres
 * 
 * @framework Framework5.2
 * @version 1.0.0
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import * as bounceAutomationSchema from "../shared/schema/bounce-automation";
import * as courtiqSchema from "../shared/schema/courtiq";

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Simple pool configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reasonable default pool size
};

// Create connection pool
const pool = new Pool(poolConfig);

// Handle unexpected pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error', err);
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

// Merge all schema objects for a complete database schema
const mergedSchema = { ...schema, ...bounceAutomationSchema, ...courtiqSchema };

// Create Drizzle instance
const db = drizzle({ client: pool, schema: mergedSchema });

// Export for use in application
export { pool, db };