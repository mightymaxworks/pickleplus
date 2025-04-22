/**
 * Database Export
 * 
 * This module re-exports the database connection from db-factory.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 */

import { pool, db } from './db-factory';

export { pool, db };