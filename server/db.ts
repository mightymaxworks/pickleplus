import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { log } from './vite';
import * as schema from '../shared/schema';
import * as courtiqSchema from '../shared/courtiq-schema';
import * as multiRankingSchema from '../shared/multi-dimensional-rankings';

// Create postgres connection
const connectionString = process.env.DATABASE_URL!;
export const client = postgres(connectionString);

// Log for debugging purposes
log(`Connecting to database at ${connectionString}`, 'db');

// Create drizzle instance with schema
export const db = drizzle(client, { 
  schema: { 
    ...schema, 
    ...courtiqSchema,
    ...multiRankingSchema 
  } 
});