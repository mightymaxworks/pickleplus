/**
 * PKL-278651-ADMIN-0012-PERF - Admin Dashboard User Count Debug
 * 
 * This script diagnoses the user count issue by directly checking
 * both the database count and the storage service method.
 * 
 * Run with: npx tsx debug-user-count.ts
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @date 2025-04-21
 */

import { db, pool } from './server/db';
import { users } from './shared/schema';
import { storage } from './server/storage';
import { sql } from 'drizzle-orm';

async function debugUserCount() {
  console.log('======== DEBUGGING USER COUNT ========');
  
  try {
    // Method 1: Direct SQL query (raw)
    console.log('\n[Method 1] Raw SQL query');
    const rawQuery = await pool.query('SELECT COUNT(*) FROM users');
    console.log('Raw SQL result:', rawQuery.rows[0]);
    console.log('Raw SQL count type:', typeof rawQuery.rows[0].count);
    console.log('Raw SQL count value:', rawQuery.rows[0].count);
    
    // Method 2: Drizzle ORM query
    console.log('\n[Method 2] Drizzle ORM query');
    const drizzleResult = await db.select({ count: sql`COUNT(*)` }).from(users);
    console.log('Drizzle result:', drizzleResult);
    console.log('Drizzle count type:', typeof drizzleResult[0]?.count);
    console.log('Drizzle count value:', drizzleResult[0]?.count);
    
    // Method 3: Storage interface
    console.log('\n[Method 3] Storage interface');
    const storageCount = await storage.getUserCount();
    console.log('Storage count type:', typeof storageCount);
    console.log('Storage count value:', storageCount);
    
    // Test conversion explicitly
    console.log('\n[Testing conversions]');
    const rawCount = rawQuery.rows[0].count;
    const countAsInt = Number(rawCount);
    console.log('Raw count as Number:', countAsInt, 'type:', typeof countAsInt);
    console.log('Raw count +1 =', rawCount + 1, 'type:', typeof (rawCount + 1));
    console.log('Raw count use in math:', rawCount * 2, 'type:', typeof (rawCount * 2));
  } catch (error) {
    console.error('Error debugging user count:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
  
  console.log('\n======== DEBUG COMPLETE ========');
}

debugUserCount();