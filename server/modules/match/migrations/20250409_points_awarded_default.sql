/**
 * PKL-278651-MATCH-0003-DBCONST: Database Constraint Enhancement for Match Recording System
 * This migration script fixes both points_awarded and xp_awarded columns in the matches table by:
 * 1. Setting existing NULL values to 0
 * 2. Adding a DEFAULT 0 constraint for both columns
 * 
 * This ensures data integrity when recording matches and prevents NOT NULL constraint violations.
 */

-- Migrate Up (Apply Changes)
-- First update any existing NULL values to 0 for both columns
UPDATE matches 
SET points_awarded = 0 
WHERE points_awarded IS NULL;

UPDATE matches 
SET xp_awarded = 0 
WHERE xp_awarded IS NULL;

-- Then alter the columns to set a default value of 0
ALTER TABLE matches
ALTER COLUMN points_awarded SET DEFAULT 0;

ALTER TABLE matches
ALTER COLUMN xp_awarded SET DEFAULT 0;

-- Migrate Down (Rollback Changes)
-- Remove the default constraints
ALTER TABLE matches
ALTER COLUMN points_awarded DROP DEFAULT;

ALTER TABLE matches
ALTER COLUMN xp_awarded DROP DEFAULT;