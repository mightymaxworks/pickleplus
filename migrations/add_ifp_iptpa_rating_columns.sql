-- Add IFP and IPTPA rating columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS ifp_rating VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS ifp_profile_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS iptpa_rating VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS iptpa_profile_url VARCHAR(255);