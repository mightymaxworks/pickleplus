/**
 * PKL-278651-MATCH-0003-DBCONST: Database Constraint Enhancement for Match Recording System
 * This migration script fixes the points_awarded column in the matches table by:
 * 1. Setting existing NULL values to 0
 * 2. Adding a DEFAULT 0 constraint for the column
 * 
 * This ensures data integrity when recording matches and prevents NOT NULL constraint violations.
 */

-- Migrate Up (Apply Changes)
-- First update any existing NULL values to 0
UPDATE matches 
SET points_awarded = 0 
WHERE points_awarded IS NULL;

-- Then alter the column to set a default value of 0
ALTER TABLE matches
ALTER COLUMN points_awarded SET DEFAULT 0;

-- Migrate Down (Rollback Changes)
-- Remove the default constraint
ALTER TABLE matches
ALTER COLUMN points_awarded DROP DEFAULT;