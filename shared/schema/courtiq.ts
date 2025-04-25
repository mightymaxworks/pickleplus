/**
 * PKL-278651-SAGE-0029-API - CourtIQ Schema
 * 
 * Defines the schema for CourtIQ ratings and dimensions
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @sprint 7
 * @lastModified 2025-04-25
 */

import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, varchar, decimal, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, matches } from "../schema";

// Define the dimension codes used throughout the system
export type DimensionCode = 'TECH' | 'TACT' | 'PHYS' | 'MENT' | 'CONS';

// Map dimension codes to their full names
export const DIMENSION_NAMES: Record<DimensionCode, string> = {
  'TECH': 'Technical Skills',
  'TACT': 'Tactical Awareness',
  'PHYS': 'Physical Fitness',
  'MENT': 'Mental Toughness',
  'CONS': 'Consistency'
};

// Define the CourtIQ rating type for a user
export type CourtIQRatings = Record<DimensionCode, number>;

// Define a complete CourtIQ profile
export interface CourtIQProfile {
  userId: number;
  ratings: CourtIQRatings;
  strongestDimension: DimensionCode;
  weakestDimension: DimensionCode;
  lastUpdated: Date;
}

// Define a CourtIQ rating update
export interface CourtIQRatingUpdate {
  dimension: DimensionCode;
  newValue: number;
  reason?: string;
}

// CourtIQ User Ratings table
export const courtiqUserRatings = pgTable("courtiq_user_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  technicalRating: integer("technical_rating").default(0),
  tacticalRating: integer("tactical_rating").default(0),
  physicalRating: integer("physical_rating").default(0),
  mentalRating: integer("mental_rating").default(0),
  consistencyRating: integer("consistency_rating").default(0),
  overallRating: integer("overall_rating").default(0),
  confidenceScore: integer("confidence_score").default(0),
  assessmentCount: integer("assessment_count").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  version: integer("version").default(1)
});

// CourtIQ Rating Impacts table
export const courtiqRatingImpacts = pgTable("courtiq_rating_impacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  matchId: integer("match_id").references(() => matches.id),
  dimension: varchar("dimension", { length: 10 }).notNull(),
  impactValue: integer("impact_value").notNull(),
  impactWeight: integer("impact_weight").default(100),
  reason: varchar("reason", { length: 50 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at")
});

// Match Assessments table
export const matchAssessments = pgTable("match_assessments", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  assessorId: integer("assessor_id").notNull().references(() => users.id),
  targetId: integer("target_id").notNull().references(() => users.id),
  technicalRating: integer("technical_rating").notNull(),
  tacticalRating: integer("tactical_rating").notNull(),
  physicalRating: integer("physical_rating").notNull(),
  mentalRating: integer("mental_rating").notNull(),
  consistencyRating: integer("consistency_rating").notNull(),
  notes: text("notes"),
  assessmentType: varchar("assessment_type", { length: 20 }).notNull(),
  matchContext: jsonb("match_context"),
  isComplete: boolean("is_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// CourtIQ Calculation Rules table
export const courtiqCalculationRules = pgTable("courtiq_calculation_rules", {
  id: serial("id").primaryKey(),
  dimension: varchar("dimension", { length: 10 }).notNull(),
  selfAssessmentWeight: integer("self_assessment_weight").default(20),
  opponentAssessmentWeight: integer("opponent_assessment_weight").default(30),
  coachAssessmentWeight: integer("coach_assessment_weight").default(40),
  derivedAssessmentWeight: integer("derived_assessment_weight").default(10),
  contextWeightingRules: jsonb("context_weighting_rules"),
  assessmentDecayRate: integer("assessment_decay_rate").default(5),
  minimumAssessmentsForConfidence: integer("minimum_assessments_for_confidence").default(3),
  version: integer("version").default(1),
  activeFrom: timestamp("active_from").defaultNow(),
  activeTo: timestamp("active_to"),
  createdAt: timestamp("created_at").defaultNow()
});

// CourtIQ Player Attributes table
export const courtiqPlayerAttributes = pgTable("courtiq_player_attributes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  shotMechanics: integer("shot_mechanics").default(0),
  footwork: integer("footwork").default(0),
  technique: integer("technique").default(0),
  courtPositioning: integer("court_positioning").default(0),
  decisionMaking: integer("decision_making").default(0),
  strategyImplementation: integer("strategy_implementation").default(0),
  agility: integer("agility").default(0),
  endurance: integer("endurance").default(0),
  strength: integer("strength").default(0),
  focusLevel: integer("focus_level").default(0),
  pressureHandling: integer("pressure_handling").default(0),
  resilience: integer("resilience").default(0),
  errorRate: integer("error_rate").default(0),
  performanceVariance: integer("performance_variance").default(0),
  repeatability: integer("repeatability").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  lastUpdatedById: integer("last_updated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Incomplete Assessments table
export const incompleteAssessments = pgTable("incomplete_assessments", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  assessorId: integer("assessor_id").notNull().references(() => users.id),
  targetId: integer("target_id").notNull().references(() => users.id),
  formData: jsonb("form_data").notNull(),
  currentStep: varchar("current_step", { length: 20 }).default("self"),
  isComplete: boolean("is_complete").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const courtiqUserRatingsRelations = relations(courtiqUserRatings, ({ one }) => ({
  user: one(users, {
    fields: [courtiqUserRatings.userId],
    references: [users.id]
  })
}));

export const courtiqRatingImpactsRelations = relations(courtiqRatingImpacts, ({ one }) => ({
  user: one(users, {
    fields: [courtiqRatingImpacts.userId],
    references: [users.id]
  }),
  match: one(matches, {
    fields: [courtiqRatingImpacts.matchId],
    references: [matches.id]
  })
}));

export const matchAssessmentsRelations = relations(matchAssessments, ({ one }) => ({
  match: one(matches, {
    fields: [matchAssessments.matchId],
    references: [matches.id]
  }),
  assessor: one(users, {
    fields: [matchAssessments.assessorId],
    references: [users.id]
  }),
  target: one(users, {
    fields: [matchAssessments.targetId],
    references: [users.id]
  })
}));

export const courtiqPlayerAttributesRelations = relations(courtiqPlayerAttributes, ({ one }) => ({
  user: one(users, {
    fields: [courtiqPlayerAttributes.userId],
    references: [users.id]
  }),
  lastUpdatedBy: one(users, {
    fields: [courtiqPlayerAttributes.lastUpdatedById],
    references: [users.id]
  })
}));

export const incompleteAssessmentsRelations = relations(incompleteAssessments, ({ one }) => ({
  assessor: one(users, {
    fields: [incompleteAssessments.assessorId],
    references: [users.id]
  }),
  target: one(users, {
    fields: [incompleteAssessments.targetId],
    references: [users.id]
  })
}));

// Insert schemas
export const insertCourtiqUserRatingSchema = createInsertSchema(courtiqUserRatings);
export const insertCourtiqRatingImpactSchema = createInsertSchema(courtiqRatingImpacts);
export const insertMatchAssessmentSchema = createInsertSchema(matchAssessments);
export const insertCourtiqCalculationRuleSchema = createInsertSchema(courtiqCalculationRules);
export const insertCourtiqPlayerAttributeSchema = createInsertSchema(courtiqPlayerAttributes);
export const insertIncompleteAssessmentSchema = createInsertSchema(incompleteAssessments);

// Export types
export type CourtiqUserRating = typeof courtiqUserRatings.$inferSelect;
export type InsertCourtiqUserRating = z.infer<typeof insertCourtiqUserRatingSchema>;

export type CourtiqRatingImpact = typeof courtiqRatingImpacts.$inferSelect;
export type InsertCourtiqRatingImpact = z.infer<typeof insertCourtiqRatingImpactSchema>;

export type MatchAssessment = typeof matchAssessments.$inferSelect;
export type InsertMatchAssessment = z.infer<typeof insertMatchAssessmentSchema>;

export type CourtiqCalculationRule = typeof courtiqCalculationRules.$inferSelect;
export type InsertCourtiqCalculationRule = z.infer<typeof insertCourtiqCalculationRuleSchema>;

export type CourtiqPlayerAttribute = typeof courtiqPlayerAttributes.$inferSelect;
export type InsertCourtiqPlayerAttribute = z.infer<typeof insertCourtiqPlayerAttributeSchema>;

export type IncompleteAssessment = typeof incompleteAssessments.$inferSelect;
export type InsertIncompleteAssessment = z.infer<typeof insertIncompleteAssessmentSchema>;