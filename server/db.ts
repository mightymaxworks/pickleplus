/**
 * PKL-278651-DB-0002-SHAL
 * Database Export Shallowly Re-exports from db-factory
 * 
 * This module re-exports the database connection from db-factory
 * to ensure all database access uses the production-ready connection.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-22
 */

// Import from the factory to ensure production safeguards
import { pool, db } from './db-factory';

// Re-export for use throughout the application
export { pool, db };