import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { log } from './vite';

// Create postgres connection
const connectionString = process.env.DATABASE_URL!;
export const client = postgres(connectionString);

// Log for debugging purposes
log(`Connecting to database at ${connectionString}`, 'db');

// Create drizzle instance
export const db = drizzle(client);