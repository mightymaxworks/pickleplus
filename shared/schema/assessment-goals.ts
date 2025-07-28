/**
 * Sprint 3: Assessment-Goal Integration Schema
 * Database schema for linking assessments to goal generation and tracking
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Assessment-generated goals linking table
export const assessmentGeneratedGoals = pgTable("assessment_generated_goals", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull(),
  goalId: integer("goal_id").notNull(),
  generationReason: text("generation_reason"),
  weakAreaAddressed: varchar("weak_area_addressed", { length: 100 }),
  expectedImprovement: integer("expected_improvement"), // Expected rating improvement (0-80 scale)
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced assessment analysis results
export const assessmentAnalysis = pgTable("assessment_analysis", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull().unique(),
  overallRating: integer("overall_rating").notNull(), // 0-80 scale
  technicalRating: integer("technical_rating").notNull(),
  tacticalRating: integer("tactical_rating").notNull(), 
  physicalRating: integer("physical_rating").notNull(),
  mentalRating: integer("mental_rating").notNull(),
  weakAreas: jsonb("weak_areas").$type<WeakArea[]>().notNull(),
  improvementRecommendations: text("improvement_recommendations"),
  priorityFocusAreas: jsonb("priority_focus_areas").$type<string[]>(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Goal progress tracking with assessment correlation
export const goalAssessmentProgress = pgTable("goal_assessment_progress", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  assessmentId: integer("assessment_id").notNull(),
  baselineRating: integer("baseline_rating"), // Rating when goal was created
  currentRating: integer("current_rating"), // Rating from this assessment
  improvementAmount: integer("improvement_amount"), // Current - baseline
  milestoneReached: boolean("milestone_reached").default(false),
  progressPercentage: integer("progress_percentage"), // 0-100
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Assessment trends tracking
export const assessmentTrends = pgTable("assessment_trends", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  dimension: varchar("dimension", { length: 20 }).notNull(), // technical, tactical, physical, mental
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  startingRating: integer("starting_rating").notNull(),
  endingRating: integer("ending_rating").notNull(),
  trendDirection: varchar("trend_direction", { length: 20 }), // improving, declining, stable
  averageImprovement: integer("average_improvement"), // Per assessment
  assessmentCount: integer("assessment_count").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// Type definitions
export interface WeakArea {
  dimension: 'technical' | 'tactical' | 'physical' | 'mental';
  currentRating: number;
  targetRating: number;
  priority: 'high' | 'medium' | 'low';
  suggestedGoal: string;
  improvementPotential: number;
}

export interface GoalRecommendation {
  title: string;
  description: string;
  category: string;
  targetImprovement: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  milestones: MilestoneTemplate[];
}

export interface MilestoneTemplate {
  title: string;
  description: string;
  targetRating: number;
  orderIndex: number;
  validationCriteria: string;
}

// Relations
export const assessmentGeneratedGoalsRelations = relations(assessmentGeneratedGoals, ({ one }) => ({
  // These would reference actual assessment and goal tables when available
}));

export const assessmentAnalysisRelations = relations(assessmentAnalysis, ({ one, many }) => ({
  goalProgressEntries: many(goalAssessmentProgress),
}));

export const goalAssessmentProgressRelations = relations(goalAssessmentProgress, ({ one }) => ({
  analysis: one(assessmentAnalysis, {
    fields: [goalAssessmentProgress.assessmentId],
    references: [assessmentAnalysis.assessmentId],
  }),
}));

// Zod schemas
export const insertAssessmentGeneratedGoalSchema = createInsertSchema(assessmentGeneratedGoals);
export const insertAssessmentAnalysisSchema = createInsertSchema(assessmentAnalysis);
export const insertGoalAssessmentProgressSchema = createInsertSchema(goalAssessmentProgress);
export const insertAssessmentTrendSchema = createInsertSchema(assessmentTrends);

// Types
export type AssessmentGeneratedGoal = typeof assessmentGeneratedGoals.$inferSelect;
export type InsertAssessmentGeneratedGoal = typeof assessmentGeneratedGoals.$inferInsert;
export type AssessmentAnalysis = typeof assessmentAnalysis.$inferSelect;
export type InsertAssessmentAnalysis = typeof assessmentAnalysis.$inferInsert;
export type GoalAssessmentProgress = typeof goalAssessmentProgress.$inferSelect;
export type InsertGoalAssessmentProgress = typeof goalAssessmentProgress.$inferInsert;
export type AssessmentTrend = typeof assessmentTrends.$inferSelect;
export type InsertAssessmentTrend = typeof assessmentTrends.$inferInsert;