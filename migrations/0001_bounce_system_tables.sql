-- PKL-278651-BOUNCE-0001-CORE - Bounce Automated Testing System
-- Migration: 0001_bounce_system_tables.sql
-- Creates the database tables for the Bounce automated testing system.
-- Framework: Framework5.2
-- Last updated: 2025-04-21

-- Bounce test runs table
CREATE TABLE IF NOT EXISTS "bounce_test_runs" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" VARCHAR(50) NOT NULL DEFAULT 'planned',
  "started_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "user_id" INTEGER REFERENCES "users"("id"),
  "target_url" VARCHAR(255),
  "test_config" JSONB,
  "total_findings" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bounce findings table
CREATE TABLE IF NOT EXISTS "bounce_findings" (
  "id" SERIAL PRIMARY KEY,
  "test_run_id" INTEGER REFERENCES "bounce_test_runs"("id"),
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "severity" VARCHAR(50) NOT NULL DEFAULT 'medium',
  "status" VARCHAR(50) NOT NULL DEFAULT 'new',
  "reproducible_steps" TEXT,
  "affected_url" VARCHAR(255),
  "browser_info" JSONB,
  "assigned_to_user_id" INTEGER REFERENCES "users"("id"),
  "reported_by_user_id" INTEGER REFERENCES "users"("id"),
  "fix_commit_hash" VARCHAR(100),
  "fixed_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bounce evidence table
CREATE TABLE IF NOT EXISTS "bounce_evidence" (
  "id" SERIAL PRIMARY KEY,
  "finding_id" INTEGER REFERENCES "bounce_findings"("id"),
  "type" VARCHAR(50) NOT NULL DEFAULT 'screenshot',
  "content" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bounce schedules table
CREATE TABLE IF NOT EXISTS "bounce_schedules" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "cron_expression" VARCHAR(50),
  "test_config" JSONB NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE,
  "last_run_at" TIMESTAMP,
  "next_run_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bounce interactions table
CREATE TABLE IF NOT EXISTS "bounce_interactions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id"),
  "finding_id" INTEGER REFERENCES "bounce_findings"("id"),
  "type" VARCHAR(50) NOT NULL DEFAULT 'view_report',
  "points" INTEGER DEFAULT 0,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_bounce_test_runs_status ON bounce_test_runs(status);
CREATE INDEX idx_bounce_test_runs_user_id ON bounce_test_runs(user_id);
CREATE INDEX idx_bounce_findings_test_run_id ON bounce_findings(test_run_id);
CREATE INDEX idx_bounce_findings_severity ON bounce_findings(severity);
CREATE INDEX idx_bounce_findings_status ON bounce_findings(status);
CREATE INDEX idx_bounce_findings_assigned_to_user_id ON bounce_findings(assigned_to_user_id);
CREATE INDEX idx_bounce_findings_reported_by_user_id ON bounce_findings(reported_by_user_id);
CREATE INDEX idx_bounce_evidence_finding_id ON bounce_evidence(finding_id);
CREATE INDEX idx_bounce_interactions_user_id ON bounce_interactions(user_id);
CREATE INDEX idx_bounce_interactions_finding_id ON bounce_interactions(finding_id);
CREATE INDEX idx_bounce_schedules_is_active ON bounce_schedules(is_active);

-- Add comments to tables for documentation
COMMENT ON TABLE bounce_test_runs IS 'Tracks automated test executions by the Bounce testing system';
COMMENT ON TABLE bounce_findings IS 'Stores issues discovered during automated testing';
COMMENT ON TABLE bounce_evidence IS 'Stores evidence (screenshots, logs, etc.) related to findings';
COMMENT ON TABLE bounce_schedules IS 'Configures automated test scheduling and recurrence';
COMMENT ON TABLE bounce_interactions IS 'Tracks user interactions with findings for gamification';

-- Add comments to key columns
COMMENT ON COLUMN bounce_test_runs.status IS 'Test run status: planned, running, completed, failed, cancelled';
COMMENT ON COLUMN bounce_test_runs.test_config IS 'Configuration settings used for this test run';
COMMENT ON COLUMN bounce_findings.severity IS 'Finding severity: critical, high, medium, low, info';
COMMENT ON COLUMN bounce_findings.status IS 'Finding status: new, triage, confirmed, in_progress, fixed, wont_fix, duplicate';
COMMENT ON COLUMN bounce_evidence.type IS 'Evidence type: screenshot, console_log, network_request, dom_state, performance_metric';
COMMENT ON COLUMN bounce_interactions.type IS 'Interaction type: report_issue, confirm_finding, dispute_finding, provide_feedback, view_report';