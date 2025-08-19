-- Simplified Coaching System Migration
-- Replace isCoach boolean with coachLevel integer and add coach-student assignments

-- Step 1: Add coachLevel column with default 0 (not a coach)
ALTER TABLE users ADD COLUMN IF NOT EXISTS coach_level INTEGER DEFAULT 0;

-- Step 2: Migrate existing coach data (where isCoach = true, set coachLevel = 1)
UPDATE users SET coach_level = 1 WHERE is_coach = true;

-- Step 3: Create coach-student assignments table
CREATE TABLE IF NOT EXISTS coach_student_assignments (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id),
  student_id INTEGER NOT NULL REFERENCES users(id),
  assigned_by INTEGER NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coach_id, student_id) -- Prevent duplicate assignments
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_student_assignments_coach_id ON coach_student_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_student_assignments_student_id ON coach_student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_coach_student_assignments_active ON coach_student_assignments(is_active);

-- Step 5: Add comments for clarity
COMMENT ON COLUMN users.coach_level IS 'Coach level: 0=not coach, 1-5=coach levels L1-L5';
COMMENT ON TABLE coach_student_assignments IS 'Admin-controlled coach-student relationship assignments for simplified coaching system';