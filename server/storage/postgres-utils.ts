/**
 * PKL-278651-PERF-0001.4-API
 * PostgreSQL Utilities
 * 
 * This file provides utilities for optimized database operations,
 * particularly focused on supporting batch API requests.
 */

import { sql } from 'drizzle-orm';
import { db } from '../db';

/**
 * Execute a Postgres stored procedure/function with parameters
 * and return the results.
 * 
 * @param procedureName The name of the stored procedure
 * @param params Array of parameters to pass to the procedure
 * @returns The result of the stored procedure
 */
export async function executeStoredProcedure<T>(
  procedureName: string,
  params: any[] = []
): Promise<T> {
  // Build the parameter placeholders
  const paramPlaceholders = params.map((_, i) => `$${i + 1}`).join(', ');
  
  // Build the SQL statement
  const statement = sql.raw(`SELECT * FROM ${procedureName}(${paramPlaceholders})`);
  
  // Execute the query with parameters
  const result = await db.execute(statement);
  
  return result as T;
}

/**
 * Batch fetch multiple records by their IDs in a single query
 * 
 * @param table The table to query
 * @param ids Array of IDs to fetch
 * @param idColumn The name of the ID column (default: "id")
 * @returns Map of ID to record
 */
export async function batchFetchByIds<T>(
  table: any,
  ids: number[],
  idColumn: string = 'id'
): Promise<Map<number, T>> {
  // Early return if no IDs
  if (ids.length === 0) {
    return new Map();
  }
  
  // Execute a single query to fetch all records
  const records = await db
    .select()
    .from(table)
    .where(sql`${sql.identifier(idColumn)} IN (${ids.join(',')})`)
    .execute();
  
  // Convert result to a Map for O(1) lookup
  return new Map(
    records.map((record: any) => [record[idColumn], record])
  );
}

/**
 * Get records with cached results for frequent queries
 * 
 * @param cacheKey A unique key for this query's cache
 * @param queryFn Function that performs the database query if cache miss
 * @param ttlMs Time to live in milliseconds (default: 5 minutes)
 * @returns The query results
 */
const queryCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL
): Promise<T> {
  // Check cache
  const cached = queryCache.get(cacheKey);
  const now = Date.now();
  
  // Return cached result if it exists and is not expired
  if (cached && (now - cached.timestamp) < ttlMs) {
    return cached.data as T;
  }
  
  // Cache miss - execute the query
  const result = await queryFn();
  
  // Store in cache
  queryCache.set(cacheKey, {
    data: result,
    timestamp: now
  });
  
  return result;
}

/**
 * Invalidate specific cache entries by key prefix
 * 
 * @param keyPrefix The prefix of cache keys to invalidate
 */
export function invalidateCache(keyPrefix: string): void {
  for (const key of queryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      queryCache.delete(key);
    }
  }
}