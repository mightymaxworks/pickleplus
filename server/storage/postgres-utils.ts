/**
 * PKL-278651-PERF-0001.4-API
 * PostgreSQL Utilities
 * 
 * This file provides utilities for optimized database operations,
 * particularly focused on supporting batch API requests.
 */

import { db } from '../db';
import { eq, inArray } from 'drizzle-orm';
import NodeCache from 'node-cache';

// Create a cache with auto-expiration
const queryCache = new NodeCache({
  stdTTL: 300, // Default TTL: 5 minutes
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // For better performance
});

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
  // Format the parameters for SQL query
  const paramPlaceholders = params.map((_, i) => `$${i + 1}`).join(', ');
  
  // Build and execute the query
  // We'll need to execute raw SQL here because Drizzle ORM doesn't have a direct
  // method for calling stored procedures
  const result = await db.execute(`SELECT * FROM ${procedureName}(${paramPlaceholders})`, params);
  
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
export async function batchFetchByIds<T extends Record<string, any>>(
  table: string,
  ids: number[],
  idColumn: string = "id"
): Promise<Map<number, T>> {
  // Check if we have any IDs to fetch
  if (!ids.length) {
    return new Map<number, T>();
  }
  
  // Construct query result map
  const resultMap = new Map<number, T>();
  
  try {
    // Since we don't have the schema information here, we need to use SQL directly
    // or use the Drizzle SQL builder dynamically
    const result = await db.execute(
      `SELECT * FROM ${table} WHERE ${idColumn} IN (${ids.join(', ')})`
    );
    
    // Convert result to array if it isn't already
    const records = Array.isArray(result) ? result : [result];
    
    // Populate the result map
    for (const record of records) {
      resultMap.set(record[idColumn], record as T);
    }
  } catch (error) {
    console.error(`Error in batchFetchByIds for table ${table}:`, error);
    throw error;
  }
  
  return resultMap;
}

/**
 * Get records with cached results for frequent queries
 * 
 * @param cacheKey A unique key for this query's cache
 * @param queryFn Function that performs the database query if cache miss
 * @param ttlMs Time to live in milliseconds (default: 5 minutes)
 * @returns The query results
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  // Check if we have a cached result
  const cachedResult = queryCache.get<T>(cacheKey);
  if (cachedResult !== undefined) {
    console.log(`[DB] Cache hit for key: ${cacheKey}`);
    return cachedResult;
  }
  
  // No cache hit, execute the query
  console.log(`[DB] Cache miss for key: ${cacheKey}, executing query`);
  const result = await queryFn();
  
  // Store in cache
  queryCache.set(cacheKey, result, Math.floor(ttlMs / 1000));
  
  return result;
}

/**
 * Invalidate specific cache entries by key prefix
 * 
 * @param keyPrefix The prefix of cache keys to invalidate
 */
export function invalidateCache(keyPrefix: string): void {
  console.log(`[DB] Invalidating cache entries with prefix: ${keyPrefix}`);
  
  // Find all keys that match the prefix
  const allKeys = queryCache.keys();
  const keysToDelete = [];
  
  for (const key of allKeys) {
    if (key.startsWith(keyPrefix)) {
      keysToDelete.push(key);
    }
  }
  
  // Delete the matching keys
  if (keysToDelete.length > 0) {
    console.log(`[DB] Invalidating ${keysToDelete.length} cache entries`);
    queryCache.del(keysToDelete);
  }
}