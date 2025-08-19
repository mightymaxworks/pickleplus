// Progressive Assessment Schema - Individual Skill Tracking and PCP v2.0
import { pgTable, serial, integer, varchar, text, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Individual skill tracking table for progressive assessments
export const playerSkillRatings = pgTable("player_skill_ratings", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => users.id).notNull(),
  skillName: varchar("skill_name", { length: 100 }).notNull(),
  currentRating: decimal("current_rating", { precision: 3, scale: 1 }).notNull(),
  assessmentCount: integer("assessment_count").default(1).notNull(),
  firstAssessed: timestamp("first_assessed").defaultNow().notNull(),
  lastAssessed: timestamp("last_assessed").defaultNow().notNull(),
  lastCoachId: integer("last_coach_id").references(() => users.id),
  trendDirection: varchar("trend_direction", { length: 20 }), // 'improving', 'stable', 'declining'
  monthlyChange: decimal("monthly_change", { precision: 3, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Skill assessment history for audit trail
export const skillAssessmentHistory = pgTable("skill_assessment_history", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => users.id).notNull(),
  skillName: varchar("skill_name", { length: 100 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull(),
  coachId: integer("coach_id").references(() => users.id).notNull(),
  assessmentDate: timestamp("assessment_date").defaultNow().notNull(),
  sessionNotes: text("session_notes"),
  assessmentType: varchar("assessment_type", { length: 50 }), // 'baseline', 'focused', 'comprehensive'
  categoryFocus: varchar("category_focus", { length: 50 }), // Which category this session focused on
  skillsAssessedCount: integer("skills_assessed_count"), // How many skills were assessed in this session
  isPartialSession: boolean("is_partial_session").default(false), // True for focused sessions
});

// Enhanced PCP assessment results with progressive tracking
export const pcpAssessmentResults = pgTable("pcp_assessment_results", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => users.id).notNull(),
  coachId: integer("coach_id").references(() => users.id).notNull(),
  calculatedPcpRating: decimal("calculated_pcp_rating", { precision: 3, scale: 1 }).notNull(),
  rawWeightedScore: decimal("raw_weighted_score", { precision: 4, scale: 2 }).notNull(),
  
  // Category averages
  touchAverage: decimal("touch_average", { precision: 3, scale: 1 }).notNull(),
  technicalAverage: decimal("technical_average", { precision: 3, scale: 1 }).notNull(),
  mentalAverage: decimal("mental_average", { precision: 3, scale: 1 }).notNull(),
  athleticAverage: decimal("athletic_average", { precision: 3, scale: 1 }).notNull(),
  powerAverage: decimal("power_average", { precision: 3, scale: 1 }).notNull(),
  
  // Progressive assessment metrics
  skillsAssessedCount: integer("skills_assessed_count").notNull(),
  isCompleteAssessment: boolean("is_complete_assessment").default(false).notNull(),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }).notNull(),
  
  // Data freshness tracking
  oldestSkillAge: integer("oldest_skill_age"), // Days since oldest skill assessment
  averageSkillAge: decimal("average_skill_age", { precision: 5, scale: 2 }), // Average age of all skills
  staleSkillsCount: integer("stale_skills_count").default(0), // Skills older than 180 days
  
  calculationTimestamp: timestamp("calculation_timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Skill freshness monitoring
export const skillFreshnessMetrics = pgTable("skill_freshness_metrics", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => users.id).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // touch, technical, mental, athletic, power
  oldestAssessment: timestamp("oldest_assessment").notNull(),
  daysSinceOldest: integer("days_since_oldest").notNull(),
  freshnessStatus: varchar("freshness_status", { length: 20 }).notNull(), // current, aging, stale
  skillsNeedingUpdate: text("skills_needing_update"), // JSON array of skill names
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Relations
export const playerSkillRatingsRelations = relations(playerSkillRatings, ({ one }) => ({
  player: one(users, {
    fields: [playerSkillRatings.playerId],
    references: [users.id],
  }),
  lastCoach: one(users, {
    fields: [playerSkillRatings.lastCoachId],
    references: [users.id],
  }),
}));

export const skillAssessmentHistoryRelations = relations(skillAssessmentHistory, ({ one }) => ({
  player: one(users, {
    fields: [skillAssessmentHistory.playerId],
    references: [users.id],
  }),
  coach: one(users, {
    fields: [skillAssessmentHistory.coachId],
    references: [users.id],
  }),
}));

export const pcpAssessmentResultsRelations = relations(pcpAssessmentResults, ({ one }) => ({
  player: one(users, {
    fields: [pcpAssessmentResults.playerId],
    references: [users.id],
  }),
  coach: one(users, {
    fields: [pcpAssessmentResults.coachId],
    references: [users.id],
  }),
}));

export const skillFreshnessMetricsRelations = relations(skillFreshnessMetrics, ({ one }) => ({
  player: one(users, {
    fields: [skillFreshnessMetrics.playerId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertPlayerSkillRatingSchema = createInsertSchema(playerSkillRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  currentRating: z.number().min(1).max(10),
  trendDirection: z.enum(['improving', 'stable', 'declining']).optional(),
});

export const insertSkillAssessmentHistorySchema = createInsertSchema(skillAssessmentHistory).omit({
  id: true,
  assessmentDate: true,
}).extend({
  rating: z.number().min(1).max(10),
  assessmentType: z.enum(['baseline', 'focused', 'comprehensive']).optional(),
});

export const insertPcpAssessmentResultSchema = createInsertSchema(pcpAssessmentResults).omit({
  id: true,
  calculationTimestamp: true,
  createdAt: true,
}).extend({
  calculatedPcpRating: z.number().min(2.0).max(8.0),
  confidenceScore: z.number().min(0).max(1),
});

export const insertSkillFreshnessMetricsSchema = createInsertSchema(skillFreshnessMetrics).omit({
  id: true,
  lastUpdated: true,
}).extend({
  category: z.enum(['touch', 'technical', 'mental', 'athletic', 'power']),
  freshnessStatus: z.enum(['current', 'aging', 'stale']),
});

// Type exports
export type PlayerSkillRating = typeof playerSkillRatings.$inferSelect;
export type InsertPlayerSkillRating = z.infer<typeof insertPlayerSkillRatingSchema>;

export type SkillAssessmentHistory = typeof skillAssessmentHistory.$inferSelect;
export type InsertSkillAssessmentHistory = z.infer<typeof insertSkillAssessmentHistorySchema>;

export type PcpAssessmentResult = typeof pcpAssessmentResults.$inferSelect;
export type InsertPcpAssessmentResult = z.infer<typeof insertPcpAssessmentResultSchema>;

export type SkillFreshnessMetrics = typeof skillFreshnessMetrics.$inferSelect;
export type InsertSkillFreshnessMetrics = z.infer<typeof insertSkillFreshnessMetricsSchema>;

// Forward declaration for users table (avoid circular import)
declare const users: any;