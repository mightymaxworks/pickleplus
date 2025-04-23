-- PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
-- Migration to create the required tables for the referral system

-- Create activity_level enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_level') THEN
        CREATE TYPE activity_level AS ENUM ('new', 'casual', 'active');
    END IF;
END
$$;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES users(id),
    referred_user_id INTEGER NOT NULL REFERENCES users(id),
    date_referred TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activity_level activity_level NOT NULL DEFAULT 'new',
    xp_awarded INTEGER NOT NULL DEFAULT 20,
    matches_played INTEGER NOT NULL DEFAULT 0,
    last_active TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create referral_achievements table
CREATE TABLE IF NOT EXISTS referral_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    tier_level INTEGER NOT NULL,
    date_achieved TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    bonus_xp_awarded INTEGER NOT NULL DEFAULT 0,
    achievement_name VARCHAR(100) NOT NULL,
    achievement_description TEXT NOT NULL
);

-- Create pickleball_tips table
CREATE TABLE IF NOT EXISTS pickleball_tips (
    id SERIAL PRIMARY KEY,
    tip_content TEXT NOT NULL,
    source VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    display_priority INTEGER NOT NULL DEFAULT 10
);

-- Insert default pickleball tips
INSERT INTO pickleball_tips (tip_content, source, is_active, display_priority)
VALUES 
    ('For better control, hold your paddle with a continental grip.', NULL, TRUE, 10),
    ('Keep your non-dominant hand up for balance during shots.', NULL, TRUE, 10),
    ('When serving, aim deep to push your opponent back.', NULL, TRUE, 10),
    ('The third shot drop is essential for transitioning to the net.', 'Coach Mike''s Tips', TRUE, 10),
    ('Practice dinking to improve your soft game at the kitchen line.', NULL, TRUE, 10),
    ('To win in pickleball, master the art of patience at the kitchen line.', NULL, TRUE, 9),
    ('Work on your footwork - being in position is half the battle.', 'Pro Tips', TRUE, 9),
    ('Communication with your partner is crucial in doubles play.', NULL, TRUE, 8),
    ('When hitting a backhand, keep your paddle face slightly open.', NULL, TRUE, 8),
    ('Use the corner-to-corner strategy to move your opponents around the court.', NULL, TRUE, 7);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_achievements_user_id ON referral_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_pickleball_tips_is_active ON pickleball_tips(is_active);