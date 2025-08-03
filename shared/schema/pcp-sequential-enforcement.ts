/**
 * PCP Sequential Enforcement System Schema
 * Phase 4: Critical Gap - Prevents coaches from skipping certification levels
 * Ensures Level 1→2→3→4→5 sequential progression with no level skipping allowed
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// PCP Coach Certification Status - Tracks current certification level and eligibility
export const pcpCoachCertifications = pgTable("pcp_coach_certifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  // Current certification status
  currentLevel: integer("current_level").notNull().default(0), // 0 = not certified, 1-5 = certified levels
  eligibleForLevel: integer("eligible_for_level").notNull().default(1), // Next level they can apply for
  
  // Sequential enforcement tracking
  completedLevels: jsonb("completed_levels").$type<number[]>().default([]), // [1, 2, 3] for sequential tracking
  blockedAttempts: jsonb("blocked_attempts").$type<{ level: number; reason: string; blockedAt: string }[]>().default([]),
  
  // Certification metadata
  certificationPath: varchar("certification_path", { length: 50 }).notNull().default("standard"), // standard, accelerated, international
  totalSessionsCompleted: integer("total_sessions_completed").default(0),
  unlimitedAccessGranted: boolean("unlimited_access_granted").default(false), // True when Level 1+ achieved
  
  // Business metrics
  revenueGenerated: decimal("revenue_generated", { precision: 10, scale: 2 }).default("0.00"),
  commissionTier: varchar("commission_tier", { length: 20 }).default("bronze"), // bronze, silver, gold, platinum
  premiumBusinessToolsAccess: boolean("premium_business_tools_access").default(false), // $19.99/month upgrade
  
  // Status tracking
  lastLevelUpgradeAt: timestamp("last_level_upgrade_at"),
  nextEligibilityDate: timestamp("next_eligibility_date"), // Cooldown period for failed attempts
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PCP Level Requirements - Defines what's needed to progress to each level
export const pcpLevelRequirements = pgTable("pcp_level_requirements", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull().unique(), // 1-5
  
  // Prerequisites 
  prerequisiteLevel: integer("prerequisite_level"), // Must complete this level first
  minimumSessionsRequired: integer("minimum_sessions_required").default(0),
  minimumRating: decimal("minimum_rating", { precision: 3, scale: 1 }).default("0.0"),
  
  // Course and assessment requirements
  requiredCourseModules: jsonb("required_course_modules").$type<number[]>().default([]),
  requiredAssessments: jsonb("required_assessments").$type<number[]>().default([]),
  passingScore: integer("passing_score").default(80),
  
  // Business requirements  
  minimumStudentCoaching: integer("minimum_student_coaching").default(0), // Hours coached
  portfolioSubmissionRequired: boolean("portfolio_submission_required").default(false),
  practicalDemonstrationRequired: boolean("practical_demonstration_required").default(false),
  
  // Certification benefits unlocked at this level
  unlockFeatures: jsonb("unlock_features").$type<string[]>().default([]),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("70.00"), // Percentage
  
  // Timing constraints
  minimumWaitPeriod: integer("minimum_wait_period_days").default(0), // Days between levels
  maxRetryAttempts: integer("max_retry_attempts").default(3),
  retryCooldownPeriod: integer("retry_cooldown_period_days").default(30),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PCP Sequential Validation Log - Audit trail of all enforcement actions
export const pcpSequentialValidationLog = pgTable("pcp_sequential_validation_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  // Validation attempt details
  attemptedLevel: integer("attempted_level").notNull(),
  currentLevel: integer("current_level").notNull(),
  eligibleLevel: integer("eligible_level").notNull(),
  
  // Validation result
  validationResult: varchar("validation_result", { length: 20 }).notNull(), // allowed, blocked, warning
  blockingReason: varchar("blocking_reason", { length: 100 }), // level_skip_not_allowed, prerequisites_not_met, etc.
  
  // Context and metadata
  requestSource: varchar("request_source", { length: 50 }).notNull(), // application_form, direct_api, admin_override
  userAgent: varchar("user_agent", { length: 500 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  sessionId: varchar("session_id", { length: 100 }),
  
  // Additional validation data
  validationDetails: jsonb("validation_details").$type<Record<string, any>>().default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// PCP Business Intelligence - Analytics for certification progression
export const pcpBusinessMetrics = pgTable("pcp_business_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  certificationLevel: integer("certification_level").notNull(),
  
  // Progression timing
  levelAchievedAt: timestamp("level_achieved_at").notNull(),
  timeToCompleteLevel: integer("time_to_complete_level_days"),
  attemptsToPassLevel: integer("attempts_to_pass_level").default(1),
  
  // Business performance at this level
  sessionsCompletedAtLevel: integer("sessions_completed_at_level").default(0),
  revenueGeneratedAtLevel: decimal("revenue_generated_at_level", { precision: 10, scale: 2 }).default("0.00"),
  studentsAcquiredAtLevel: integer("students_acquired_at_level").default(0),
  averageSessionRating: decimal("average_session_rating", { precision: 3, scale: 2 }),
  
  // Retention metrics
  stillActiveAfter30Days: boolean("still_active_after_30_days"),
  stillActiveAfter90Days: boolean("still_active_after_90_days"),
  upgradedToPremiumTools: boolean("upgraded_to_premium_tools").default(false),
  
  // Performance indicators  
  clientRetentionRate: decimal("client_retention_rate", { precision: 5, scale: 2 }),
  recommendationScore: decimal("recommendation_score", { precision: 3, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const pcpCoachCertificationsRelations = relations(pcpCoachCertifications, ({ many }) => ({
  validationLogs: many(pcpSequentialValidationLog),
  businessMetrics: many(pcpBusinessMetrics),
}));

export const pcpSequentialValidationLogRelations = relations(pcpSequentialValidationLog, ({ one }) => ({
  certification: one(pcpCoachCertifications, {
    fields: [pcpSequentialValidationLog.userId],
    references: [pcpCoachCertifications.userId],
  }),
}));

export const pcpBusinessMetricsRelations = relations(pcpBusinessMetrics, ({ one }) => ({
  certification: one(pcpCoachCertifications, {
    fields: [pcpBusinessMetrics.userId],
    references: [pcpCoachCertifications.userId],
  }),
}));

// Zod Schemas
export const insertPcpCoachCertificationSchema = createInsertSchema(pcpCoachCertifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPcpLevelRequirementSchema = createInsertSchema(pcpLevelRequirements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPcpSequentialValidationLogSchema = createInsertSchema(pcpSequentialValidationLog).omit({
  id: true,
  createdAt: true,
});

export const insertPcpBusinessMetricsSchema = createInsertSchema(pcpBusinessMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript Types
export type PcpCoachCertification = typeof pcpCoachCertifications.$inferSelect;
export type InsertPcpCoachCertification = z.infer<typeof insertPcpCoachCertificationSchema>;

export type PcpLevelRequirement = typeof pcpLevelRequirements.$inferSelect;
export type InsertPcpLevelRequirement = z.infer<typeof insertPcpLevelRequirementSchema>;

export type PcpSequentialValidationLog = typeof pcpSequentialValidationLog.$inferSelect;
export type InsertPcpSequentialValidationLog = z.infer<typeof insertPcpSequentialValidationLogSchema>;

export type PcpBusinessMetrics = typeof pcpBusinessMetrics.$inferSelect;
export type InsertPcpBusinessMetrics = z.infer<typeof insertPcpBusinessMetricsSchema>;

// Validation Schema for Level Application
export const pcpLevelApplicationSchema = z.object({
  userId: z.number(),
  requestedLevel: z.number().min(1).max(5),
  currentLevel: z.number().min(0).max(5),
  bypassValidation: z.boolean().default(false), // Admin override only
  reason: z.string().optional(),
});

export type PcpLevelApplication = z.infer<typeof pcpLevelApplicationSchema>;

// Sequential Enforcement Constants
export const PCP_LEVELS = {
  NOT_CERTIFIED: 0,
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
  LEVEL_4: 4,
  LEVEL_5: 5,
} as const;

export const PCP_LEVEL_NAMES = {
  0: "Not Certified",
  1: "Clear Communication - Entry Coach",
  2: "Structured Coaching - Development Coach", 
  3: "Advanced Strategies - Senior Coach",
  4: "Leadership Excellence - Master Coach",
  5: "Innovation & Mastery - Expert Coach",
} as const;

export const COMMISSION_TIERS = {
  BRONZE: "bronze",
  SILVER: "silver", 
  GOLD: "gold",
  PLATINUM: "platinum",
} as const;

export type PcpLevel = keyof typeof PCP_LEVEL_NAMES;
export type CommissionTier = (typeof COMMISSION_TIERS)[keyof typeof COMMISSION_TIERS];

// Validation Result Types
export type ValidationResult = {
  allowed: boolean;
  currentLevel: number;
  requestedLevel: number;
  eligibleLevel: number;
  blockingReason?: string;
  nextEligibilityDate?: Date;
  missingRequirements?: string[];
};

// Business Intelligence Types
export type PcpProgressionAnalytics = {
  userId: number;
  currentLevel: number;
  totalRevenue: number;
  totalSessions: number;
  averageProgressionTime: number; // Days between levels
  conversionRates: Record<string, number>; // Level completion rates
  retentionMetrics: {
    thirtyDay: boolean;
    ninetyDay: boolean;
  };
};