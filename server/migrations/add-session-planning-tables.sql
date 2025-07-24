-- Sprint 2 Phase 2: Session Planning Integration Tables
-- Create tables for session planning functionality

-- Session Plans table - stores coach-created lesson plans
CREATE TABLE IF NOT EXISTS session_plans (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 60, -- Duration in minutes
  skill_level VARCHAR(50) DEFAULT 'Intermediate',
  objectives JSONB DEFAULT '[]'::jsonb, -- Array of session objectives
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session Drill Assignments - links drills to session plans
CREATE TABLE IF NOT EXISTS session_drill_assignments (
  id SERIAL PRIMARY KEY,
  session_plan_id INTEGER NOT NULL REFERENCES session_plans(id) ON DELETE CASCADE,
  drill_id INTEGER NOT NULL REFERENCES drill_library(id) ON DELETE CASCADE,
  allocated_minutes INTEGER DEFAULT 10,
  order_sequence INTEGER NOT NULL,
  objectives TEXT, -- Specific objectives for this drill in this session
  notes TEXT, -- Coach notes for this drill
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled Sessions - actual sessions scheduled with students
CREATE TABLE IF NOT EXISTS scheduled_sessions (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_plan_id INTEGER NOT NULL REFERENCES session_plans(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  completion_notes TEXT, -- Coach notes after session completion
  student_feedback TEXT, -- Student feedback after session
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session Completion Records - tracks drill performance during actual sessions
CREATE TABLE IF NOT EXISTS session_drill_completions (
  id SERIAL PRIMARY KEY,
  scheduled_session_id INTEGER NOT NULL REFERENCES scheduled_sessions(id) ON DELETE CASCADE,
  drill_id INTEGER NOT NULL REFERENCES drill_library(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  performance_rating DECIMAL(3,1), -- PCP scale 2.0-8.0
  coach_notes TEXT,
  improvement_areas TEXT[],
  time_spent_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_plans_coach_id ON session_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_session_drill_assignments_session_plan_id ON session_drill_assignments(session_plan_id);
CREATE INDEX IF NOT EXISTS idx_session_drill_assignments_drill_id ON session_drill_assignments(drill_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_coach_id ON scheduled_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_student_id ON scheduled_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_date ON scheduled_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_session_drill_completions_session_id ON session_drill_completions(scheduled_session_id);

-- Insert some sample session plans for testing
INSERT INTO session_plans (coach_id, title, description, duration, skill_level, objectives) VALUES
(1, 'Beginner Fundamentals - Serves & Returns', 'Introduction to basic serving technique and return positioning', 90, 'Beginner', '["Master basic serve technique", "Understand return positioning", "Practice serve consistency"]'),
(1, 'Intermediate Dinking Workshop', 'Advanced dinking techniques and kitchen strategy', 75, 'Intermediate', '["Improve dink consistency", "Learn cross-court dinking", "Master kitchen positioning"]'),
(1, 'Advanced Tournament Prep', 'High-intensity match simulation and strategy', 120, 'Advanced', '["Tournament mindset preparation", "Advanced shot selection", "Pressure situation training"]');

-- Link some drills to the session plans (using existing drill IDs)
INSERT INTO session_drill_assignments (session_plan_id, drill_id, allocated_minutes, order_sequence, objectives) VALUES
-- Beginner Fundamentals session
(1, 1, 15, 1, 'Warm up with basic dinking'),
(1, 2, 20, 2, 'Learn proper serve technique'),
(1, 3, 20, 3, 'Practice return positioning'),
(1, 4, 15, 4, 'Apply skills in gameplay'),

-- Intermediate Dinking Workshop
(2, 1, 20, 1, 'Advanced dinking patterns'),
(2, 5, 25, 2, 'Cross-court consistency'),
(2, 6, 15, 3, 'Kitchen strategy application'),

-- Advanced Tournament Prep
(3, 7, 15, 1, 'High-intensity warm-up'),
(3, 8, 30, 2, 'Tournament shot selection'),
(3, 9, 25, 3, 'Pressure situation drills'),
(3, 10, 20, 4, 'Match simulation');

COMMENT ON TABLE session_plans IS 'Sprint 2 Phase 2: Coach session planning templates';
COMMENT ON TABLE session_drill_assignments IS 'Sprint 2 Phase 2: Drill assignments within session plans';
COMMENT ON TABLE scheduled_sessions IS 'Sprint 2 Phase 2: Actual scheduled coaching sessions';
COMMENT ON TABLE session_drill_completions IS 'Sprint 2 Phase 2: Student drill performance tracking';