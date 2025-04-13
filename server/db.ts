/**
 * PKL-278651-PERF-0001.4-API
 * Database Connection
 * 
 * This file provides the database connection instance used throughout the application.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Create the PostgreSQL client with connection pooling
const connectionString = process.env.DATABASE_URL || '';
const queryClient = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 30, // Timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Don't use prepared statements for better performance
});

// Create the drizzle instance with the schema
export const db = drizzle(queryClient, { schema });

// Export a function to close the connection pool
export const closeDbConnection = () => queryClient.end();

// Re-export schema for convenience
export { schema };