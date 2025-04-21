-- PKL-278651-BOUNCE-0004-GAME - Bounce Gamification System
-- Migration script for creating tables related to Bounce achievements and gamification

-- Create Bounce achievements table
CREATE TABLE IF NOT EXISTS "bounce_achievements" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "icon" VARCHAR(255),
  "badge_image_url" VARCHAR(255),
  "required_points" INTEGER,
  "required_interactions" INTEGER,
  "required_interaction_types" JSONB DEFAULT '[]',
  "xp_reward" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user Bounce achievements table
CREATE TABLE IF NOT EXISTS "user_bounce_achievements" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "achievement_id" INTEGER NOT NULL REFERENCES "bounce_achievements"("id"),
  "progress" INTEGER DEFAULT 0,
  "is_complete" BOOLEAN DEFAULT FALSE,
  "awarded_at" TIMESTAMP,
  "notified" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bounce leaderboard table
CREATE TABLE IF NOT EXISTS "bounce_leaderboard" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "total_points" INTEGER DEFAULT 0,
  "total_interactions" INTEGER DEFAULT 0,
  "total_findings" INTEGER DEFAULT 0,
  "total_verifications" INTEGER DEFAULT 0,
  "last_interaction_at" TIMESTAMP,
  "streak_days" INTEGER DEFAULT 0,
  "rank" INTEGER,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_bounce_achievements_type ON bounce_achievements(type);
CREATE INDEX idx_bounce_achievements_is_active ON bounce_achievements(is_active);
CREATE INDEX idx_user_bounce_achievements_user_id ON user_bounce_achievements(user_id);
CREATE INDEX idx_user_bounce_achievements_achievement_id ON user_bounce_achievements(achievement_id);
CREATE INDEX idx_user_bounce_achievements_is_complete ON user_bounce_achievements(is_complete);
CREATE INDEX idx_bounce_leaderboard_user_id ON bounce_leaderboard(user_id);
CREATE INDEX idx_bounce_leaderboard_total_points ON bounce_leaderboard(total_points);
CREATE INDEX idx_bounce_leaderboard_rank ON bounce_leaderboard(rank);

-- Add default achievements

-- Tester Participation Achievements
INSERT INTO bounce_achievements (name, description, type, icon, required_interactions, xp_reward, required_interaction_types)
VALUES 
('Novice Tester', 'Participate in your first Bounce testing session', 'tester_participation', 'PlayCircle', 1, 50, '["view_report"]'),
('Testing Enthusiast', 'Participate in 5 Bounce testing sessions', 'tester_participation', 'Zap', 5, 100, '["view_report"]'),
('QA Apprentice', 'Participate in 15 Bounce testing sessions', 'tester_participation', 'Award', 15, 200, '["view_report"]'),
('Testing Expert', 'Participate in 30 Bounce testing sessions', 'tester_participation', 'Award', 30, 300, '["view_report"]'),
('Master Tester', 'Participate in 50 Bounce testing sessions', 'tester_participation', 'Trophy', 50, 500, '["view_report"]');

-- Issue Discovery Achievements
INSERT INTO bounce_achievements (name, description, type, icon, required_interactions, xp_reward, required_interaction_types)
VALUES 
('Bug Hunter', 'Report your first issue through Bounce', 'issue_discovery', 'Bug', 1, 100, '["report_issue"]'),
('Defect Detective', 'Report 5 issues through Bounce', 'issue_discovery', 'Search', 5, 200, '["report_issue"]'),
('Issue Investigator', 'Report 15 issues through Bounce', 'issue_discovery', 'Binoculars', 15, 300, '["report_issue"]'),
('Problem Solver', 'Report 25 issues through Bounce', 'issue_discovery', 'Lightbulb', 25, 400, '["report_issue"]'),
('Critical Eye', 'Report a critical severity issue', 'issue_discovery', 'AlertTriangle', 1, 250, '["report_issue"]');

-- Verification Achievements
INSERT INTO bounce_achievements (name, description, type, icon, required_interactions, xp_reward, required_interaction_types)
VALUES 
('First Confirmation', 'Confirm your first Bounce finding', 'verification', 'CheckCircle', 1, 50, '["confirm_finding"]'),
('Verification Specialist', 'Confirm 10 Bounce findings', 'verification', 'CheckSquare', 10, 150, '["confirm_finding"]'),
('Quality Assurance', 'Confirm 25 Bounce findings', 'verification', 'ShieldCheck', 25, 250, '["confirm_finding"]');

-- Feedback Achievements
INSERT INTO bounce_achievements (name, description, type, icon, required_interactions, xp_reward, required_interaction_types)
VALUES 
('Helpful Feedback', 'Provide feedback on a Bounce finding', 'feedback', 'MessageSquare', 1, 50, '["provide_feedback"]'),
('Detailed Reporter', 'Provide feedback on 10 Bounce findings', 'feedback', 'FileEdit', 10, 150, '["provide_feedback"]'),
('Feedback Expert', 'Provide feedback on 25 Bounce findings', 'feedback', 'FileText', 25, 250, '["provide_feedback"]');

-- Fixing Achievements
INSERT INTO bounce_achievements (name, description, type, icon, required_points, xp_reward)
VALUES 
('Bug Squasher', 'Contribute to fixing your first bug reported by Bounce', 'fixing', 'Hammer', 100, 100),
('Fix Master', 'Contribute to fixing 10 bugs reported by Bounce', 'fixing', 'Tool', 1000, 300);

-- Milestone Achievements
INSERT INTO bounce_achievements (name, description, type, icon, required_points, xp_reward)
VALUES 
('Bounce Contributor', 'Earn 500 points in Bounce testing activities', 'milestone', 'Star', 500, 150),
('Bounce Expert', 'Earn 1,500 points in Bounce testing activities', 'milestone', 'Stars', 1500, 300),
('Bounce Legend', 'Earn 5,000 points in Bounce testing activities', 'milestone', 'Crown', 5000, 500);

-- Add comments to tables for documentation
COMMENT ON TABLE bounce_achievements IS 'Achievements that users can earn through participation in the Bounce testing system';
COMMENT ON TABLE user_bounce_achievements IS 'Tracks which Bounce achievements have been earned by which users';
COMMENT ON TABLE bounce_leaderboard IS 'Leaderboard of top contributors to the Bounce testing system';