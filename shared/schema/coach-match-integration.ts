/**
 * PKL-278651-COACH-MATCH-INTEGRATION - Phase 1: Unified Coach-Match Workflow
 * 
 * Schema extensions to integrate coaching sessions with match recording system
 * This creates seamless connection between coaching and competitive play
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

// Extended coaching sessions with match integration
export const coachingSessionMatches = pgTable("coaching_session_matches", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => coachingSessions.id),
  matchId: integer("match_id").notNull().references(() => matches.id),
  matchContext: varchar("match_context", { length: 50 }).notNull().default("practice"), // practice, assessment, tournament, casual
  isLiveCoaching: boolean("is_live_coaching").default(false), // Coach providing real-time input
  coachingFocus: json("coaching_focus").$type<string[]>(), // Skills being worked on during match
  preMatchNotes: text("pre_match_notes"), // Coach notes before match
  liveNotes: json("live_notes").$type<{
    timestamp: string;
    point: number;
    note: string;
    skillFocus: string;
    improvement: string;
  }[]>(), // Real-time coaching notes during match
  postMatchAnalysis: text("post_match_analysis"), // Coach analysis after match
  skillsImproved: json("skills_improved").$type<string[]>(), // Skills that showed improvement
  areasForImprovement: json("areas_for_improvement").$type<string[]>(), // Areas needing work
  nextSessionFocus: text("next_session_focus"), // What to work on next
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach real-time match input
export const coachMatchInput = pgTable("coach_match_input", {
  id: serial("id").primaryKey(),
  sessionMatchId: integer("session_match_id").notNull().references(() => coachingSessionMatches.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  matchId: integer("match_id").notNull().references(() => matches.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  pointNumber: integer("point_number"), // Point during which input was given
  inputType: varchar("input_type", { length: 50 }).notNull(), // observation, correction, encouragement, strategy
  skillCategory: varchar("skill_category", { length: 50 }), // technical, tactical, physical, mental
  content: text("content").notNull(),
  rating: integer("rating"), // 1-5 rating for this moment
  isPositive: boolean("is_positive").default(true),
  actionable: boolean("actionable").default(true), // Can student immediately act on this?
  createdAt: timestamp("created_at").defaultNow()
});

// PCP Assessment integration with matches
export const matchPcpAssessments = pgTable("match_pcp_assessments", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  coachId: integer("coach_id").references(() => users.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  sessionMatchId: integer("session_match_id").references(() => coachingSessionMatches.id),
  
  // 4-dimensional PCP assessment based on match performance
  technicalRating: decimal("technical_rating", { precision: 3, scale: 1 }).notNull(), // 1.0-5.0
  tacticalRating: decimal("tactical_rating", { precision: 3, scale: 1 }).notNull(),
  physicalRating: decimal("physical_rating", { precision: 3, scale: 1 }).notNull(),
  mentalRating: decimal("mental_rating", { precision: 3, scale: 1 }).notNull(),
  
  // Detailed assessment notes
  technicalNotes: text("technical_notes"),
  tacticalNotes: text("tactical_notes"),
  physicalNotes: text("physical_notes"),
  mentalNotes: text("mental_notes"),
  
  // Performance metrics
  overallPerformance: decimal("overall_performance", { precision: 3, scale: 1 }).notNull(),
  improvementFromLastMatch: decimal("improvement_from_last_match", { precision: 3, scale: 1 }),
  coachingEffectiveness: decimal("coaching_effectiveness", { precision: 3, scale: 1 }), // How well coaching translated to performance
  
  // Recommendations
  strengthsIdentified: json("strengths_identified").$type<string[]>(),
  weaknessesIdentified: json("weaknesses_identified").$type<string[]>(),
  recommendedFocus: json("recommended_focus").$type<string[]>(),
  nextGoals: json("next_goals").$type<string[]>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Points allocation transparency
export const pointsAllocationExplanation = pgTable("points_allocation_explanation", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  coachId: integer("coach_id").references(() => users.id),
  
  // Point calculation breakdown
  basePoints: integer("base_points").notNull(),
  competitiveMultiplier: decimal("competitive_multiplier", { precision: 3, scale: 2 }).notNull(),
  tournamentBonus: integer("tournament_bonus").default(0),
  skillImprovementBonus: integer("skill_improvement_bonus").default(0),
  coachingBonus: integer("coaching_bonus").default(0),
  consistencyBonus: integer("consistency_bonus").default(0),
  totalPoints: integer("total_points").notNull(),
  
  // Explanation details
  calculationExplanation: text("calculation_explanation").notNull(),
  coachCommentary: text("coach_commentary"), // Coach adds context to point allocation
  improvementHighlights: json("improvement_highlights").$type<string[]>(),
  reasonForPoints: text("reason_for_points").notNull(),
  
  // Ranking impact
  oldRankingPoints: integer("old_ranking_points").notNull(),
  newRankingPoints: integer("new_ranking_points").notNull(),
  rankingChange: integer("ranking_change").notNull(),
  percentileChange: decimal("percentile_change", { precision: 5, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow()
});

// Coach dashboard student progress
export const coachStudentProgress = pgTable("coach_student_progress", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => users.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  
  // Progress metrics
  sessionsCompleted: integer("sessions_completed").default(0),
  matchesPlayed: integer("matches_played").default(0),
  currentRankingPoints: integer("current_ranking_points").default(0),
  rankingPointsGained: integer("ranking_points_gained").default(0),
  currentPercentile: decimal("current_percentile", { precision: 5, scale: 2 }),
  
  // PCP progression
  technicalProgression: decimal("technical_progression", { precision: 3, scale: 1 }),
  tacticalProgression: decimal("tactical_progression", { precision: 3, scale: 1 }),
  physicalProgression: decimal("physical_progression", { precision: 3, scale: 1 }),
  mentalProgression: decimal("mental_progression", { precision: 3, scale: 1 }),
  
  // Coaching effectiveness
  coachingEffectivenessScore: decimal("coaching_effectiveness_score", { precision: 3, scale: 1 }),
  studentSatisfactionScore: decimal("student_satisfaction_score", { precision: 3, scale: 1 }),
  goalsAchieved: integer("goals_achieved").default(0),
  totalGoalsSet: integer("total_goals_set").default(0),
  
  // Timeline tracking
  firstSession: timestamp("first_session"),
  lastSession: timestamp("last_session"),
  nextRecommendedSession: timestamp("next_recommended_session"),
  
  // Notes and recommendations
  overallNotes: text("overall_notes"),
  currentFocus: json("current_focus").$type<string[]>(),
  upcomingGoals: json("upcoming_goals").$type<string[]>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const coachingSessionMatchesRelations = relations(coachingSessionMatches, ({ one, many }) => ({
  session: one(coachingSessions, {
    fields: [coachingSessionMatches.sessionId],
    references: [coachingSessions.id]
  }),
  match: one(matches, {
    fields: [coachingSessionMatches.matchId],
    references: [matches.id]
  }),
  coachInputs: many(coachMatchInput),
  pcpAssessment: one(matchPcpAssessments, {
    fields: [coachingSessionMatches.id],
    references: [matchPcpAssessments.sessionMatchId]
  })
}));

export const coachMatchInputRelations = relations(coachMatchInput, ({ one }) => ({
  sessionMatch: one(coachingSessionMatches, {
    fields: [coachMatchInput.sessionMatchId],
    references: [coachingSessionMatches.id]
  }),
  coach: one(users, {
    fields: [coachMatchInput.coachId],
    references: [users.id]
  }),
  student: one(users, {
    fields: [coachMatchInput.studentId],
    references: [users.id]
  }),
  match: one(matches, {
    fields: [coachMatchInput.matchId],
    references: [matches.id]
  })
}));

export const matchPcpAssessmentsRelations = relations(matchPcpAssessments, ({ one }) => ({
  match: one(matches, {
    fields: [matchPcpAssessments.matchId],
    references: [matches.id]
  }),
  coach: one(users, {
    fields: [matchPcpAssessments.coachId],
    references: [users.id]
  }),
  player: one(users, {
    fields: [matchPcpAssessments.playerId],
    references: [users.id]
  }),
  sessionMatch: one(coachingSessionMatches, {
    fields: [matchPcpAssessments.sessionMatchId],
    references: [coachingSessionMatches.id]
  })
}));

export const pointsAllocationExplanationRelations = relations(pointsAllocationExplanation, ({ one }) => ({
  match: one(matches, {
    fields: [pointsAllocationExplanation.matchId],
    references: [matches.id]
  }),
  player: one(users, {
    fields: [pointsAllocationExplanation.playerId],
    references: [users.id]
  }),
  coach: one(users, {
    fields: [pointsAllocationExplanation.coachId],
    references: [users.id]
  })
}));

export const coachStudentProgressRelations = relations(coachStudentProgress, ({ one }) => ({
  coach: one(users, {
    fields: [coachStudentProgress.coachId],
    references: [users.id]
  }),
  student: one(users, {
    fields: [coachStudentProgress.studentId],
    references: [users.id]
  })
}));

// Insert schemas
export const insertCoachingSessionMatchSchema = createInsertSchema(coachingSessionMatches);
export const insertCoachMatchInputSchema = createInsertSchema(coachMatchInput);
export const insertMatchPcpAssessmentSchema = createInsertSchema(matchPcpAssessments);
export const insertPointsAllocationExplanationSchema = createInsertSchema(pointsAllocationExplanation);
export const insertCoachStudentProgressSchema = createInsertSchema(coachStudentProgress);

// Types
export type CoachingSessionMatch = typeof coachingSessionMatches.$inferSelect;
export type InsertCoachingSessionMatch = typeof coachingSessionMatches.$inferInsert;
export type CoachMatchInput = typeof coachMatchInput.$inferSelect;
export type InsertCoachMatchInput = typeof coachMatchInput.$inferInsert;
export type MatchPcpAssessment = typeof matchPcpAssessments.$inferSelect;
export type InsertMatchPcpAssessment = typeof matchPcpAssessments.$inferInsert;
export type PointsAllocationExplanation = typeof pointsAllocationExplanation.$inferSelect;
export type InsertPointsAllocationExplanation = typeof pointsAllocationExplanation.$inferInsert;
export type CoachStudentProgress = typeof coachStudentProgress.$inferSelect;
export type InsertCoachStudentProgress = typeof coachStudentProgress.$inferInsert;

// Match context enum
export enum MatchContext {
  PRACTICE = "practice",
  ASSESSMENT = "assessment", 
  TOURNAMENT = "tournament",
  CASUAL = "casual",
  LESSON = "lesson"
}

// Coach input types
export enum CoachInputType {
  OBSERVATION = "observation",
  CORRECTION = "correction",
  ENCOURAGEMENT = "encouragement",
  STRATEGY = "strategy",
  TECHNICAL = "technical",
  TACTICAL = "tactical"
}

// Skill categories
export enum SkillCategory {
  TECHNICAL = "technical",
  TACTICAL = "tactical", 
  PHYSICAL = "physical",
  MENTAL = "mental"
}