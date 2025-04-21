import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import * as bounceAutomationSchema from "../shared/schema/bounce-automation";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Merge all schema objects for a complete database schema
const mergedSchema = { ...schema, ...bounceAutomationSchema };

export const db = drizzle(pool, { schema: mergedSchema });