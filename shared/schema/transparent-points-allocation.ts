/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Phase 2: Transparent Points Allocation System
 * 
 * Schema for transparent PCP points allocation with detailed breakdown
 * and coach-match correlation metrics
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-07-17
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, matches } from "../schema";
import { coachingSessions } from "../schema/training-center";
import { coachingSessionMatches } from "./coach-match-integration";

// Transparent points allocation breakdown
export const pointsAllocationBreakdown = pgTable("points_allocation_breakdown", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  coachId: integer("coach_id").references(() => users.id),
  sessionMatchId: integer("session_match_id").references(() => coachingSessionMatches.id),
  
  // Base points from match result
  basePoints: decimal("base_points", { precision: 6, scale: 2 }).notNull(),
  
  // Coaching influence multipliers
  coachingMultiplier: decimal("coaching_multiplier", { precision: 3, scale: 2 }).default("1.00"),
  improvementBonus: decimal("improvement_bonus", { precision: 5, scale: 2 }).default("0.00"),
  consistencyBonus: decimal("consistency_bonus", { precision: 5, scale: 2 }).default("0.00"),
  
  // Skill-specific point allocations
  technicalPoints: decimal("technical_points", { precision: 5, scale: 2 }).notNull(),
  tacticalPoints: decimal("tactical_points", { precision: 5, scale: 2 }).notNull(),
  physicalPoints: decimal("physical_points", { precision: 5, scale: 2 }).notNull(),
  mentalPoints: decimal("mental_points", { precision: 5, scale: 2 }).notNull(),
  
  // Total calculated points
  totalPoints: decimal("total_points", { precision: 6, scale: 2 }).notNull(),
  
  // Transparency details
  calculationMethod: varchar("calculation_method", { length: 50 }).default("standard"),
  factorsConsidered: json("factors_considered").$type<{
    matchResult: boolean;
    opponentRating: boolean;
    coachingPresence: boolean;
    skillImprovement: boolean;
    consistency: boolean;
    matchContext: boolean;
  }>(),
  
  // Detailed breakdown for user transparency
  breakdown: json("breakdown").$type<{
    category: string;
    description: string;
    value: number;
    reasoning: string;
  }[]>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach effectiveness scoring
export const coachEffectivenessScoring = pgTable("coach_effectiveness_scoring", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => users.id),
  sessionMatchId: integer("session_match_id").notNull().references(() => coachingSessionMatches.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  matchId: integer("match_id").notNull().references(() => matches.id),
  
  // Coaching effectiveness metrics
  preMatchEffectiveness: decimal("pre_match_effectiveness", { precision: 3, scale: 1 }).default("0.0"),
  liveCoachingEffectiveness: decimal("live_coaching_effectiveness", { precision: 3, scale: 1 }).default("0.0"),
  postMatchEffectiveness: decimal("post_match_effectiveness", { precision: 3, scale: 1 }).default("0.0"),
  
  // Student improvement correlation
  immediateImprovement: decimal("immediate_improvement", { precision: 3, scale: 1 }).default("0.0"),
  sessionToSessionImprovement: decimal("session_to_session_improvement", { precision: 3, scale: 1 }).default("0.0"),
  
  // Coaching impact on points
  pointsWithoutCoaching: decimal("points_without_coaching", { precision: 6, scale: 2 }).notNull(),
  pointsWithCoaching: decimal("points_with_coaching", { precision: 6, scale: 2 }).notNull(),
  coachingImpact: decimal("coaching_impact", { precision: 5, scale: 2 }).notNull(),
  
  // Effectiveness breakdown
  effectivenessFactors: json("effectiveness_factors").$type<{
    factor: string;
    score: number;
    weight: number;
    description: string;
  }[]>(),
  
  // Overall effectiveness score
  overallEffectiveness: decimal("overall_effectiveness", { precision: 3, scale: 1 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow()
});

// Match-coaching correlation metrics
export const matchCoachingCorrelation = pgTable("match_coaching_correlation", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => users.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  
  // Time period for correlation analysis
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Correlation metrics
  matchesWithCoaching: integer("matches_with_coaching").default(0),
  matchesWithoutCoaching: integer("matches_without_coaching").default(0),
  
  // Performance improvements
  avgPointsWithCoaching: decimal("avg_points_with_coaching", { precision: 6, scale: 2 }).default("0.00"),
  avgPointsWithoutCoaching: decimal("avg_points_without_coaching", { precision: 6, scale: 2 }).default("0.00"),
  improvementDifference: decimal("improvement_difference", { precision: 5, scale: 2 }).default("0.00"),
  
  // Skill progression correlation
  technicalProgression: decimal("technical_progression", { precision: 3, scale: 1 }).default("0.0"),
  tacticalProgression: decimal("tactical_progression", { precision: 3, scale: 1 }).default("0.0"),
  physicalProgression: decimal("physical_progression", { precision: 3, scale: 1 }).default("0.0"),
  mentalProgression: decimal("mental_progression", { precision: 3, scale: 1 }).default("0.0"),
  
  // Statistical significance
  correlationCoefficient: decimal("correlation_coefficient", { precision: 3, scale: 2 }).default("0.00"),
  confidenceLevel: decimal("confidence_level", { precision: 3, scale: 2 }).default("0.00"),
  
  // Trend analysis
  trendAnalysis: json("trend_analysis").$type<{
    period: string;
    trend: string;
    strength: number;
    description: string;
  }[]>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Student performance prediction
export const studentPerformancePrediction = pgTable("student_performance_prediction", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id),
  coachId: integer("coach_id").references(() => users.id),
  
  // Prediction context
  predictionType: varchar("prediction_type", { length: 50 }).notNull(), // next_match, next_session, next_tournament
  targetDate: timestamp("target_date").notNull(),
  confidenceLevel: decimal("confidence_level", { precision: 3, scale: 2 }).notNull(),
  
  // Predicted performance metrics
  predictedPoints: decimal("predicted_points", { precision: 6, scale: 2 }).notNull(),
  predictedRating: decimal("predicted_rating", { precision: 3, scale: 1 }).notNull(),
  
  // Skill predictions
  technicalPrediction: decimal("technical_prediction", { precision: 3, scale: 1 }).notNull(),
  tacticalPrediction: decimal("tactical_prediction", { precision: 3, scale: 1 }).notNull(),
  physicalPrediction: decimal("physical_prediction", { precision: 3, scale: 1 }).notNull(),
  mentalPrediction: decimal("mental_prediction", { precision: 3, scale: 1 }).notNull(),
  
  // Prediction factors
  predictionFactors: json("prediction_factors").$type<{
    factor: string;
    weight: number;
    currentValue: number;
    trendDirection: string;
    impact: number;
  }[]>(),
  
  // Coaching recommendations
  recommendedFocus: json("recommended_focus").$type<string[]>(),
  trainingRecommendations: text("training_recommendations"),
  
  createdAt: timestamp("created_at").defaultNow(),
  actualPerformance: json("actual_performance").$type<{
    actualPoints: number;
    actualRating: number;
    accuracy: number;
    updated: string;
  }>()
});

// Relations
export const pointsAllocationBreakdownRelations = relations(pointsAllocationBreakdown, ({ one }) => ({
  match: one(matches, { fields: [pointsAllocationBreakdown.matchId], references: [matches.id] }),
  player: one(users, { fields: [pointsAllocationBreakdown.playerId], references: [users.id] }),
  coach: one(users, { fields: [pointsAllocationBreakdown.coachId], references: [users.id] }),
  sessionMatch: one(coachingSessionMatches, { fields: [pointsAllocationBreakdown.sessionMatchId], references: [coachingSessionMatches.id] })
}));

export const coachEffectivenessScoringRelations = relations(coachEffectivenessScoring, ({ one }) => ({
  coach: one(users, { fields: [coachEffectivenessScoring.coachId], references: [users.id] }),
  student: one(users, { fields: [coachEffectivenessScoring.studentId], references: [users.id] }),
  match: one(matches, { fields: [coachEffectivenessScoring.matchId], references: [matches.id] }),
  sessionMatch: one(coachingSessionMatches, { fields: [coachEffectivenessScoring.sessionMatchId], references: [coachingSessionMatches.id] })
}));

export const matchCoachingCorrelationRelations = relations(matchCoachingCorrelation, ({ one }) => ({
  coach: one(users, { fields: [matchCoachingCorrelation.coachId], references: [users.id] }),
  student: one(users, { fields: [matchCoachingCorrelation.studentId], references: [users.id] })
}));

export const studentPerformancePredictionRelations = relations(studentPerformancePrediction, ({ one }) => ({
  student: one(users, { fields: [studentPerformancePrediction.studentId], references: [users.id] }),
  coach: one(users, { fields: [studentPerformancePrediction.coachId], references: [users.id] })
}));

// Zod schemas for validation
export const insertPointsAllocationBreakdown = createInsertSchema(pointsAllocationBreakdown);
export const insertCoachEffectivenessScoring = createInsertSchema(coachEffectivenessScoring);
export const insertMatchCoachingCorrelation = createInsertSchema(matchCoachingCorrelation);
export const insertStudentPerformancePrediction = createInsertSchema(studentPerformancePrediction);

// TypeScript types
export type PointsAllocationBreakdown = typeof pointsAllocationBreakdown.$inferSelect;
export type InsertPointsAllocationBreakdown = z.infer<typeof insertPointsAllocationBreakdown>;
export type CoachEffectivenessScoring = typeof coachEffectivenessScoring.$inferSelect;
export type InsertCoachEffectivenessScoring = z.infer<typeof insertCoachEffectivenessScoring>;
export type MatchCoachingCorrelation = typeof matchCoachingCorrelation.$inferSelect;
export type InsertMatchCoachingCorrelation = z.infer<typeof insertMatchCoachingCorrelation>;
export type StudentPerformancePrediction = typeof studentPerformancePrediction.$inferSelect;
export type InsertStudentPerformancePrediction = z.infer<typeof insertStudentPerformancePrediction>;