/**
 * PKL-278651-SAGE-0010-FEEDBACK - Enhanced Feedback System Migration
 * 
 * This migration adds the tables required for the comprehensive feedback system
 * that will drive continuous improvement of drills and training plans in SAGE.
 * 
 * Part of Sprint 5: Social Features & UI Polish
 * Date: 2025-04-25
 */

import { sql } from "drizzle-orm";
import { db } from "../db";

export async function up() {
  console.log('Running migration: Enhanced Feedback System');
  
  // Create enhanced_feedback table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS enhanced_feedback (
      id SERIAL PRIMARY KEY,
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      
      overall_rating INTEGER NOT NULL,
      clarity_rating INTEGER,
      difficulty_rating INTEGER,
      enjoyment_rating INTEGER,
      effectiveness_rating INTEGER,
      
      positive_feedback TEXT,
      improvement_feedback TEXT,
      specific_challenges TEXT,
      suggestions TEXT,
      
      user_skill_level TEXT,
      court_iq_scores JSONB,
      completion_status TEXT,
      attempt_count INTEGER,
      time_spent INTEGER,
      environment JSONB,
      
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'new',
      reviewed_by INTEGER,
      reviewed_at TIMESTAMP,
      
      sentiment TEXT,
      keywords TEXT[],
      actionable_insights TEXT,
      similar_feedback_ids INTEGER[]
    )
  `);
  
  // Create feedback_improvement_plans table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedback_improvement_plans (
      id SERIAL PRIMARY KEY,
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      planned_changes JSONB NOT NULL,
      feedback_ids INTEGER[],
      status TEXT NOT NULL DEFAULT 'planned',
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMP,
      priority_level INTEGER DEFAULT 3
    )
  `);
  
  // Create feedback_implementations table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedback_implementations (
      id SERIAL PRIMARY KEY,
      improvement_plan_id INTEGER NOT NULL,
      implemented_changes JSONB NOT NULL,
      before_state JSONB,
      after_state JSONB,
      implemented_by INTEGER NOT NULL,
      implemented_at TIMESTAMP NOT NULL DEFAULT NOW(),
      notified_users BOOLEAN DEFAULT FALSE
    )
  `);
  
  // Create feedback_analytics table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedback_analytics (
      id SERIAL PRIMARY KEY,
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      
      average_ratings JSONB NOT NULL,
      rating_counts JSONB NOT NULL,
      feedback_count INTEGER NOT NULL,
      sentiment_breakdown JSONB NOT NULL,
      common_themes JSONB,
      improvement_suggestions JSONB,
      
      rating_trend JSONB,
      sentiment_trend JSONB,
      
      last_updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  
  // Create feedback_notifications table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedback_notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      feedback_id INTEGER NOT NULL,
      implementation_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
      read_at TIMESTAMP
    )
  `);
  
  // Create user_feedback_participation table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_feedback_participation (
      user_id INTEGER PRIMARY KEY,
      total_feedback_submitted INTEGER NOT NULL DEFAULT 0,
      helpful_feedback_count INTEGER NOT NULL DEFAULT 0,
      last_feedback_at TIMESTAMP,
      feedback_quality_score INTEGER
    )
  `);
  
  // Create indexes for performance
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_enhanced_feedback_item ON enhanced_feedback(item_type, item_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_enhanced_feedback_user ON enhanced_feedback(user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_enhanced_feedback_status ON enhanced_feedback(status)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_improvement_plans_item ON feedback_improvement_plans(item_type, item_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_feedback_analytics_item ON feedback_analytics(item_type, item_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_feedback_notifications_user ON feedback_notifications(user_id)`);
  
  console.log('Migration completed: Enhanced Feedback System');
}

export async function down() {
  console.log('Reversing migration: Enhanced Feedback System');
  
  // Drop all tables in reverse order
  await db.execute(sql`DROP TABLE IF EXISTS user_feedback_participation`);
  await db.execute(sql`DROP TABLE IF EXISTS feedback_notifications`);
  await db.execute(sql`DROP TABLE IF EXISTS feedback_analytics`);
  await db.execute(sql`DROP TABLE IF EXISTS feedback_implementations`);
  await db.execute(sql`DROP TABLE IF EXISTS feedback_improvement_plans`);
  await db.execute(sql`DROP TABLE IF EXISTS enhanced_feedback`);
  
  console.log('Migration reversal completed: Enhanced Feedback System');
}