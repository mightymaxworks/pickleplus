-- Sprint 2 Phase 3: Student Progress Tracking Database Schema
-- Migration: Add student drill completion and progress tracking tables

-- Student drill completion tracking
CREATE TABLE IF NOT EXISTS student_drill_completions (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  drill_id INTEGER NOT NULL REFERENCES drill_library(id) ON DELETE CASCADE,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id INTEGER, -- Optional: link to specific coaching session
  performance_rating DECIMAL(3,1) CHECK (performance_rating >= 2.0 AND performance_rating <= 8.0), -- PCP scale
  completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  coach_notes TEXT,
  improvement_areas TEXT[], -- Array of areas needing improvement
  technical_rating DECIMAL(3,1) CHECK (technical_rating >= 2.0 AND technical_rating <= 8.0),
  tactical_rating DECIMAL(3,1) CHECK (tactical_rating >= 2.0 AND tactical_rating <= 8.0),
  physical_rating DECIMAL(3,1) CHECK (physical_rating >= 2.0 AND physical_rating <= 8.0),
  mental_rating DECIMAL(3,1) CHECK (mental_rating >= 2.0 AND mental_rating <= 8.0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session drill assignments (extends session planning)
CREATE TABLE IF NOT EXISTS session_drill_assignments (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL,
  drill_id INTEGER NOT NULL REFERENCES drill_library(id) ON DELETE CASCADE,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_sequence INTEGER NOT NULL,
  allocated_minutes INTEGER NOT NULL DEFAULT 10,
  objectives TEXT,
  completion_status VARCHAR(20) DEFAULT 'pending' CHECK (completion_status IN ('pending', 'completed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student progress summary (computed/cached data for performance)
CREATE TABLE IF NOT EXISTS student_progress_summary (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_drills_completed INTEGER DEFAULT 0,
  avg_performance_rating DECIMAL(3,1),
  avg_technical_rating DECIMAL(3,1),
  avg_tactical_rating DECIMAL(3,1),
  avg_physical_rating DECIMAL(3,1),
  avg_mental_rating DECIMAL(3,1),
  last_session_date TIMESTAMP,
  total_session_minutes INTEGER DEFAULT 0,
  improvement_trend VARCHAR(20) DEFAULT 'stable' CHECK (improvement_trend IN ('improving', 'stable', 'declining')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, coach_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_student_drill_completions_student_id ON student_drill_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_drill_completions_coach_id ON student_drill_completions(coach_id);
CREATE INDEX IF NOT EXISTS idx_student_drill_completions_drill_id ON student_drill_completions(drill_id);
CREATE INDEX IF NOT EXISTS idx_student_drill_completions_completion_date ON student_drill_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_session_drill_assignments_session_id ON session_drill_assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_session_drill_assignments_coach_id ON session_drill_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_summary_student_coach ON student_progress_summary(student_id, coach_id);