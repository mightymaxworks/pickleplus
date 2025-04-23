// CourtIQ™ Rating System Database Schema
// PKL-278651-RATINGS-0001-COURTIQ - Multi-dimensional Rating System

import { pgTable, serial, integer, varchar, text, timestamp, json, boolean, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";
import { matches } from "../schema";

// CourtIQ™ Rating Dimensions with tracking for each player
export const courtiqUserRatings = pgTable("courtiq_user_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  
  // Primary CourtIQ™ dimensions (1-5 scale values, stored as integers)
  technicalRating: integer("technical_rating").default(0),  // TECH
  tacticalRating: integer("tactical_rating").default(0),    // TACT
  physicalRating: integer("physical_rating").default(0),    // PHYS
  mentalRating: integer("mental_rating").default(0),        // MENT
  consistencyRating: integer("consistency_rating").default(0), // CONS
  
  // Overall CourtIQ™ score (calculated value, weighted average)
  overallRating: integer("overall_rating").default(0),
  
  // Additional metadata
  confidenceScore: integer("confidence_score").default(0), // How confident the system is in this rating (0-100)
  assessmentCount: integer("assessment_count").default(0), // How many assessments have contributed to this rating
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  
  // Optimistic locking to prevent concurrent updates causing data loss
  version: integer("version").default(1)
}, (table) => {
  return {
    userIdIdx: unique("courtiq_user_ratings_user_id_idx").on(table.userId)
  };
});

// Record of each rating impact event (match assessments, etc.)
export const courtiqRatingImpacts = pgTable("courtiq_rating_impacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  matchId: integer("match_id").references(() => matches.id),
  dimension: varchar("dimension", { length: 10 }).notNull(), // TECH, TACT, PHYS, MENT, CONS
  impactValue: integer("impact_value").notNull(), // The rating value (1-5)
  impactWeight: integer("impact_weight").default(100), // Percentage weight to apply (influenced by context)
  reason: varchar("reason", { length: 50 }).notNull(), // self-assessment, opponent-assessment, coach-assessment, performance-derived
  
  // Additional metadata to provide context
  metadata: json("metadata"), // Additional data specific to the rating impact type
  
  // System fields
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at") // When this impact was processed into the user's rating
});

// Complete player assessment data for a match
export const matchAssessments = pgTable("match_assessments", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  assessorId: integer("assessor_id").notNull().references(() => users.id), // Who made the assessment
  targetId: integer("target_id").notNull().references(() => users.id), // Who was assessed
  
  // Technical Assessment (1-5 scale)
  technicalRating: integer("technical_rating").notNull(),
  
  // Tactical Assessment (1-5 scale)
  tacticalRating: integer("tactical_rating").notNull(),
  
  // Physical Assessment (1-5 scale)
  physicalRating: integer("physical_rating").notNull(),
  
  // Mental Assessment (1-5 scale)
  mentalRating: integer("mental_rating").notNull(),
  
  // Consistency Assessment (1-5 scale)
  consistencyRating: integer("consistency_rating").notNull(),
  
  // Notes and Observations
  notes: text("notes"),
  
  // Assessment Type 
  assessmentType: varchar("assessment_type", { length: 20 }).notNull(), // self, opponent, coach, system
  
  // Match Context (influences weighting)
  matchContext: json("match_context"), // Factors like surface, weather, equipment issues, etc.
  
  // System fields
  isComplete: boolean("is_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Calculation rules and weights for the rating system
export const courtiqCalculationRules = pgTable("courtiq_calculation_rules", {
  id: serial("id").primaryKey(),
  dimension: varchar("dimension", { length: 10 }).notNull(), // TECH, TACT, PHYS, MENT, CONS, OVERALL
  
  // Weighting factors by assessment type (percentages, total should be 100)
  selfAssessmentWeight: integer("self_assessment_weight").default(20),
  opponentAssessmentWeight: integer("opponent_assessment_weight").default(30),
  coachAssessmentWeight: integer("coach_assessment_weight").default(40),
  derivedAssessmentWeight: integer("derived_assessment_weight").default(10),
  
  // Context adjustment factors
  contextWeightingRules: json("context_weighting_rules"), // JSON with rules for adjusting weights based on context
  
  // Decay and confidence factors
  assessmentDecayRate: integer("assessment_decay_rate").default(5), // Percentage per day
  minimumAssessmentsForConfidence: integer("minimum_assessments_for_confidence").default(3),
  
  // Version tracking for updates
  version: integer("version").default(1),
  activeFrom: timestamp("active_from").defaultNow(),
  activeTo: timestamp("active_to"),
  createdAt: timestamp("created_at").defaultNow()
});

// Additional player attributes that influence specific CourtIQ™ dimensions
export const courtiqPlayerAttributes = pgTable("courtiq_player_attributes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  
  // Technical attributes 
  shotMechanics: integer("shot_mechanics").default(0), // 0-100
  footwork: integer("footwork").default(0), // 0-100
  technique: integer("technique").default(0), // 0-100
  
  // Tactical attributes
  courtPositioning: integer("court_positioning").default(0), // 0-100
  decisionMaking: integer("decision_making").default(0), // 0-100
  strategyImplementation: integer("strategy_implementation").default(0), // 0-100
  
  // Physical attributes
  agility: integer("agility").default(0), // 0-100
  endurance: integer("endurance").default(0), // 0-100
  strength: integer("strength").default(0), // 0-100
  
  // Mental attributes
  focusLevel: integer("focus_level").default(0), // 0-100
  pressureHandling: integer("pressure_handling").default(0), // 0-100
  resilience: integer("resilience").default(0), // 0-100
  
  // Consistency attributes
  errorRate: integer("error_rate").default(0), // 0-100
  performanceVariance: integer("performance_variance").default(0), // 0-100
  repeatability: integer("repeatability").default(0), // 0-100
  
  // Last updated and by whom
  lastUpdated: timestamp("last_updated").defaultNow(),
  lastUpdatedById: integer("last_updated_by_id").references(() => users.id),
  
  // System fields
  createdAt: timestamp("created_at").defaultNow()
}, (table) => {
  return {
    userIdIdx: unique("courtiq_player_attributes_user_id_idx").on(table.userId)
  };
});

// Incomplete assessment tracking for auto-save functionality
export const incompleteAssessments = pgTable("incomplete_assessments", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  assessorId: integer("assessor_id").notNull().references(() => users.id),
  targetId: integer("target_id").notNull().references(() => users.id),
  
  // The serialized form data
  formData: json("form_data").notNull(),
  
  // Progress tracking
  currentStep: varchar("current_step", { length: 20 }).default("self"), // self, opponent, context, review
  isComplete: boolean("is_complete").default(false),
  
  // Timestamps
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => {
  return {
    assessmentKey: unique("incomplete_assessments_key_idx").on(table.matchId, table.assessorId, table.targetId)
  };
});

// Relations for the courtiqUserRatings table
export const courtiqUserRatingsRelations = relations(courtiqUserRatings, ({ one }) => ({
  user: one(users, {
    fields: [courtiqUserRatings.userId],
    references: [users.id]
  })
}));

// Relations for the courtiqRatingImpacts table
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

// Relations for the matchAssessments table
export const matchAssessmentsRelations = relations(matchAssessments, ({ one }) => ({
  assessor: one(users, {
    fields: [matchAssessments.assessorId],
    references: [users.id]
  }),
  target: one(users, {
    fields: [matchAssessments.targetId],
    references: [users.id]
  }),
  match: one(matches, {
    fields: [matchAssessments.matchId],
    references: [matches.id]
  })
}));

// Relations for the courtiqPlayerAttributes table
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

// Relations for the incompleteAssessments table
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

// Zod schemas for data validation

// CourtIQ User Ratings schema
export const insertCourtiqUserRatingSchema = createInsertSchema(courtiqUserRatings, {
  // Add Zod validation rules
  technicalRating: z.number().min(0).max(5),
  tacticalRating: z.number().min(0).max(5),
  physicalRating: z.number().min(0).max(5),
  mentalRating: z.number().min(0).max(5),
  consistencyRating: z.number().min(0).max(5),
  confidenceScore: z.number().min(0).max(100)
}).omit({ id: true, createdAt: true, lastUpdated: true });

// CourtIQ Rating Impacts schema
export const insertCourtiqRatingImpactSchema = createInsertSchema(courtiqRatingImpacts, {
  // Add Zod validation rules
  dimension: z.enum(["TECH", "TACT", "PHYS", "MENT", "CONS"]),
  impactValue: z.number().min(1).max(5),
  impactWeight: z.number().min(0).max(200),
  reason: z.string().min(1)
}).omit({ id: true, createdAt: true, processedAt: true });

// Match Assessments schema
export const insertMatchAssessmentSchema = createInsertSchema(matchAssessments, {
  // Add Zod validation rules
  technicalRating: z.number().min(1).max(5),
  tacticalRating: z.number().min(1).max(5),
  physicalRating: z.number().min(1).max(5),
  mentalRating: z.number().min(1).max(5),
  consistencyRating: z.number().min(1).max(5),
  assessmentType: z.enum(["self", "opponent", "coach", "system"])
}).omit({ id: true, createdAt: true, updatedAt: true });

// CourtIQ Calculation Rules schema
export const insertCourtiqCalculationRuleSchema = createInsertSchema(courtiqCalculationRules, {
  // Add Zod validation rules
  dimension: z.enum(["TECH", "TACT", "PHYS", "MENT", "CONS", "OVERALL"]),
  selfAssessmentWeight: z.number().min(0).max(100),
  opponentAssessmentWeight: z.number().min(0).max(100),
  coachAssessmentWeight: z.number().min(0).max(100),
  derivedAssessmentWeight: z.number().min(0).max(100)
}).omit({ id: true, createdAt: true, activeFrom: true, activeTo: true });

// CourtIQ Player Attributes schema
export const insertCourtiqPlayerAttributeSchema = createInsertSchema(courtiqPlayerAttributes, {
  // Add Zod validation rules
  shotMechanics: z.number().min(0).max(100),
  footwork: z.number().min(0).max(100),
  technique: z.number().min(0).max(100),
  courtPositioning: z.number().min(0).max(100),
  decisionMaking: z.number().min(0).max(100),
  strategyImplementation: z.number().min(0).max(100),
  agility: z.number().min(0).max(100),
  endurance: z.number().min(0).max(100),
  strength: z.number().min(0).max(100),
  focusLevel: z.number().min(0).max(100),
  pressureHandling: z.number().min(0).max(100),
  resilience: z.number().min(0).max(100),
  errorRate: z.number().min(0).max(100),
  performanceVariance: z.number().min(0).max(100),
  repeatability: z.number().min(0).max(100)
}).omit({ id: true, createdAt: true, lastUpdated: true });

// Incomplete Assessments schema
export const insertIncompleteAssessmentSchema = createInsertSchema(incompleteAssessments, {
  // Add Zod validation rules
  currentStep: z.enum(["self", "opponent", "context", "review"])
}).omit({ id: true, createdAt: true });

// Type definitions based on the schemas
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