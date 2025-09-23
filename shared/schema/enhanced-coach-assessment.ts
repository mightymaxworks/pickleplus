/**
 * Enhanced Coach Assessment System Schema
 * 
 * Comprehensive database schema for the redeveloped coach assessment tool featuring:
 * - Mobile-first progressive assessment interface
 * - Secure Coach Connect discovery system  
 * - Transparent coach level weighting (L1:0.7x → L5:3.8x)
 * - Quick Mode vs Full Assessment differentiation
 * - PROVISIONAL vs CONFIRMED rating system
 * - Anti-abuse controls and rate limiting
 * - Multi-coach weighted aggregation
 * - Statistical confidence indicators
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, decimal, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced Coach-Student Connections (builds on existing studentCoachConnections)
export const coachStudentDiscovery = pgTable("coach_student_discovery", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  
  // Discovery method
  connectionType: varchar("connection_type", { length: 50 }).notNull(), // 'qr_scan', 'invite_code', 'admin_assign', 'referral'
  discoveryContext: jsonb("discovery_context").default({}), // QR data, facility info, etc.
  
  // Connection workflow
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'approved', 'rejected', 'expired'
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"), // For QR codes and invite codes
  processedAt: timestamp("processed_at"),
  
  // Mutual consent
  coachApproved: boolean("coach_approved").default(false),
  studentApproved: boolean("student_approved").default(false),
  
  // Anti-abuse tracking
  ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint", { length: 64 }),
  facilityContext: integer("facility_id"), // If connection made at facility
  
  // Audit trail
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Indexes for performance
  coachIdIdx: index("coach_student_discovery_coach_idx").on(table.coachId),
  studentIdIdx: index("coach_student_discovery_student_idx").on(table.studentId),
  statusIdx: index("coach_student_discovery_status_idx").on(table.status),
  // Prevent duplicate pending connections
  uniqueActivePairIdx: uniqueIndex("unique_active_coach_student_pair").on(table.coachId, table.studentId).where(sql`status = 'pending'`),
}));

// Coach Invite Codes System
export const coachInviteCodes = pgTable("coach_invite_codes", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  
  // Code details
  inviteCode: varchar("invite_code", { length: 12 }).notNull().unique(), // e.g. "COACH-ABC123"
  codeType: varchar("code_type", { length: 20 }).notNull(), // 'qr_code', 'text_code', 'facility_code'
  
  // Usage limits and anti-abuse
  maxUses: integer("max_uses").default(1), // How many students can use this code
  currentUses: integer("current_uses").default(0),
  dailyLimit: integer("daily_limit").default(5), // Max uses per day
  dailyUsesCount: integer("daily_uses_count").default(0),
  lastDailyReset: timestamp("last_daily_reset").defaultNow(),
  
  // Context and restrictions
  facilityId: integer("facility_id"), // Restrict to specific facility
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  
  // QR code data (if applicable)
  qrCodeData: jsonb("qr_code_data").default({}),
  qrCodeImageUrl: varchar("qr_code_image_url", { length: 500 }),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
}, (table) => ({
  coachIdIdx: index("coach_invite_codes_coach_idx").on(table.coachId),
  activeCodesIdx: index("coach_invite_codes_active_idx").on(table.isActive),
}));

// Assessment Session Tracking (Quick vs Full Mode)
export const assessmentSessions = pgTable("assessment_sessions", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  
  // Session configuration  
  sessionType: varchar("session_type", { length: 20 }).notNull(), // 'quick_mode', 'full_assessment', 'follow_up'
  plannedSkillsCount: integer("planned_skills_count").notNull(), // 10 for quick, 55 for full
  
  // Progress tracking
  status: varchar("status", { length: 20 }).notNull().default("in_progress"), // 'in_progress', 'completed', 'abandoned', 'paused'
  currentSkillIndex: integer("current_skill_index").default(0),
  skillsCompleted: integer("skills_completed").default(0),
  completionPercentage: decimal("completion_percentage", { precision: 5, scale: 2 }).default('0'),
  
  // Autosave and resume data
  sessionData: jsonb("session_data").default({}), // Stores progress for resume capability
  lastAutosaveAt: timestamp("last_autosave_at"),
  
  // Time tracking
  sessionStartedAt: timestamp("session_started_at").notNull().defaultNow(),
  estimatedDuration: integer("estimated_duration"), // Minutes
  actualDuration: integer("actual_duration"), // Minutes
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  sessionCompletedAt: timestamp("session_completed_at"),
  
  // Statistical confidence
  assessmentConfidence: decimal("assessment_confidence", { precision: 3, scale: 2 }), // 0.70 for quick, 0.95 for full
  
  // Coach weighting applied
  coachLevel: integer("coach_level").notNull(),
  coachWeight: decimal("coach_weight", { precision: 3, scale: 2 }).notNull(),
  categoryConfidenceFactors: jsonb("category_confidence_factors").default({}),
  
  // Audit
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  coachIdIdx: index("assessment_sessions_coach_idx").on(table.coachId),
  studentIdIdx: index("assessment_sessions_student_idx").on(table.studentId),
  statusIdx: index("assessment_sessions_status_idx").on(table.status),
  activeSessionIdx: index("assessment_sessions_active_idx").on(table.coachId, table.studentId, table.status),
}));

// Multi-Coach Assessment Weighting History
export const coachAssessmentWeights = pgTable("coach_assessment_weights", {
  id: serial("id").primaryKey(),
  assessmentSessionId: integer("assessment_session_id").notNull(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  
  // Coach weighting details
  coachLevel: integer("coach_level").notNull(),
  baseWeight: decimal("base_weight", { precision: 3, scale: 2 }).notNull(),
  
  // Category confidence factors (by coach level)
  technicalConfidence: decimal("technical_confidence", { precision: 3, scale: 2 }).notNull(),
  tacticalConfidence: decimal("tactical_confidence", { precision: 3, scale: 2 }).notNull(),
  physicalConfidence: decimal("physical_confidence", { precision: 3, scale: 2 }).notNull(),
  mentalConfidence: decimal("mental_confidence", { precision: 3, scale: 2 }).notNull(),
  
  // Time decay factor (for multi-coach aggregation)
  timeWeight: decimal("time_weight", { precision: 3, scale: 2 }).notNull(),
  daysSinceAssessment: integer("days_since_assessment").default(0),
  
  // Assessment mode impact
  assessmentMode: varchar("assessment_mode", { length: 20 }).notNull(), // 'quick', 'full'
  modeConfidencePenalty: decimal("mode_confidence_penalty", { precision: 3, scale: 2 }).notNull(),
  
  // Final calculated weight
  finalWeight: decimal("final_weight", { precision: 4, scale: 3 }).notNull(),
  
  // Contribution to final PCP
  weightedContribution: decimal("weighted_contribution", { precision: 5, scale: 3 }).notNull(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  sessionIdIdx: index("coach_assessment_weights_session_idx").on(table.assessmentSessionId),
  coachStudentIdx: index("coach_assessment_weights_coach_student_idx").on(table.coachId, table.studentId),
}));

// PROVISIONAL vs CONFIRMED Rating System
export const assessmentRatingStatus = pgTable("assessment_rating_status", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().unique(), // One record per student
  
  // Current rating status
  currentStatus: varchar("current_status", { length: 20 }).notNull().default("provisional"), // 'provisional', 'confirmed'
  currentPcpRating: decimal("current_pcp_rating", { precision: 3, scale: 1 }),
  
  // Rating validation details
  highestCoachLevel: integer("highest_coach_level").default(1), // Highest level coach who assessed
  confirmingCoachId: integer("confirming_coach_id"), // L4+ coach who confirmed rating
  confirmingCoachLevel: integer("confirming_coach_level"),
  confirmedAt: timestamp("confirmed_at"),
  
  // Expiry management
  provisionalExpiresAt: timestamp("provisional_expires_at"), // 60-90 days based on coach level
  confirmedExpiresAt: timestamp("confirmed_expires_at"), // 120 days for L4+ confirmations
  
  // Status history
  previousStatus: varchar("previous_status", { length: 20 }),
  lastStatusChange: timestamp("last_status_change").notNull().defaultNow(),
  
  // Assessment aggregation info
  totalAssessments: integer("total_assessments").default(1),
  l4PlusAssessments: integer("l4_plus_assessments").default(0),
  
  // Tournament eligibility flags
  tournamentEligible: boolean("tournament_eligible").default(false),
  eligibilityUpdatedAt: timestamp("eligibility_updated_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  statusIdx: index("assessment_rating_status_status_idx").on(table.currentStatus),
  tournamentEligibleIdx: index("assessment_rating_status_tournament_idx").on(table.tournamentEligible),
}));

// Anti-Abuse Tracking and Rate Limiting
export const coachAssessmentAbuseLog = pgTable("coach_assessment_abuse_log", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  
  // Rate limiting tracking
  activityDate: timestamp("activity_date").notNull().defaultNow(),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // 'assessment', 'connection_request', 'invite_generation'
  dailyCount: integer("daily_count").default(1),
  weeklyCount: integer("weekly_count").default(1),
  monthlyCount: integer("monthly_count").default(1),
  
  // Anomaly detection flags  
  anomalyFlags: jsonb("anomaly_flags").default([]), // ['unusual_rating_pattern', 'rapid_assessments', 'suspicious_device']
  anomalyScore: decimal("anomaly_score", { precision: 4, scale: 2 }).default('0'), // 0-10 risk score
  
  // Context data for analysis
  targetStudentId: integer("target_student_id"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint", { length: 64 }),
  
  // Assessment specific abuse indicators
  ratingDeviation: decimal("rating_deviation", { precision: 4, scale: 2 }), // How far from expected
  assessmentDuration: integer("assessment_duration"), // Too fast/slow indicator
  previousAssessmentGap: integer("previous_assessment_gap"), // Minutes since last
  
  // Admin review status
  reviewStatus: varchar("review_status", { length: 20 }).default("pending"), // 'pending', 'cleared', 'flagged', 'action_taken'
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken", { length: 100 }), // 'warning', 'suspension', 'rate_limit'
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  coachIdIdx: index("coach_assessment_abuse_coach_idx").on(table.coachId),
  dateIdx: index("coach_assessment_abuse_date_idx").on(table.activityDate),
  reviewStatusIdx: index("coach_assessment_abuse_review_idx").on(table.reviewStatus),
  anomalyScoreIdx: index("coach_assessment_abuse_anomaly_idx").on(table.anomalyScore),
}));

// Coach Rate Limiting Configuration
export const coachRateLimits = pgTable("coach_rate_limits", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().unique(),
  coachLevel: integer("coach_level").notNull(),
  
  // Daily limits by coach level
  dailyAssessmentLimit: integer("daily_assessment_limit").notNull(), // L1:3, L2:5, L3:7, L4:10, L5:10
  dailyConnectionLimit: integer("daily_connection_limit").default(5),
  
  // Current usage counters
  dailyAssessmentsUsed: integer("daily_assessments_used").default(0),
  dailyConnectionsUsed: integer("daily_connections_used").default(0),
  
  // Rate limit violations
  violationCount: integer("violation_count").default(0),
  lastViolationAt: timestamp("last_violation_at"),
  isRateLimited: boolean("is_rate_limited").default(false),
  rateLimitExpiresAt: timestamp("rate_limit_expires_at"),
  
  // Reset tracking
  lastDailyReset: timestamp("last_daily_reset").notNull().defaultNow(),
  
  // Override capabilities (for admin intervention)
  temporaryLimitOverride: integer("temporary_limit_override"),
  overrideExpiresAt: timestamp("override_expires_at"),
  overrideReason: text("override_reason"),
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  coachLevelIdx: index("coach_rate_limits_level_idx").on(table.coachLevel),
  rateLimitedIdx: index("coach_rate_limits_limited_idx").on(table.isRateLimited),
}));

// Assessment Statistical Confidence Tracking
export const assessmentConfidenceMetrics = pgTable("assessment_confidence_metrics", {
  id: serial("id").primaryKey(),
  assessmentSessionId: integer("assessment_session_id").notNull(),
  studentId: integer("student_id").notNull(),
  
  // Confidence calculation inputs
  assessmentMode: varchar("assessment_mode", { length: 20 }).notNull(),
  skillsAssessed: integer("skills_assessed").notNull(),
  totalPossibleSkills: integer("total_possible_skills").notNull(),
  categoryBalance: decimal("category_balance", { precision: 3, scale: 2 }).notNull(), // How balanced across categories
  
  // Coach weighting impact on confidence
  coachLevel: integer("coach_level").notNull(),
  coachWeight: decimal("coach_weight", { precision: 3, scale: 2 }).notNull(),
  coachExperienceBonus: decimal("coach_experience_bonus", { precision: 3, scale: 2 }).default('0'),
  
  // Statistical confidence calculations
  baseConfidence: decimal("base_confidence", { precision: 3, scale: 2 }).notNull(), // Before adjustments
  modeAdjustment: decimal("mode_adjustment", { precision: 3, scale: 2 }).notNull(), // Quick mode penalty
  coachAdjustment: decimal("coach_adjustment", { precision: 3, scale: 2 }).notNull(), // Coach level bonus
  samplingError: decimal("sampling_error", { precision: 4, scale: 3 }).notNull(), // Statistical uncertainty
  
  // Final confidence metrics
  finalConfidence: decimal("final_confidence", { precision: 3, scale: 2 }).notNull(),
  marginOfError: decimal("margin_of_error", { precision: 3, scale: 2 }).notNull(),
  confidenceInterval: jsonb("confidence_interval").default({}), // Lower and upper bounds
  
  // Recommendation engine
  recommendUpgrade: boolean("recommend_upgrade").default(false), // Suggest full assessment
  upgradeReason: text("upgrade_reason"),
  nextAssessmentDate: timestamp("next_assessment_date"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  sessionIdIdx: index("assessment_confidence_session_idx").on(table.assessmentSessionId),
  studentIdIdx: index("assessment_confidence_student_idx").on(table.studentId),
  confidenceIdx: index("assessment_confidence_level_idx").on(table.finalConfidence),
}));

// Zod Validation Schemas
export const insertCoachStudentDiscoverySchema = createInsertSchema(coachStudentDiscovery, {
  connectionType: z.enum(['qr_scan', 'invite_code', 'admin_assign', 'referral']),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCoachInviteCodeSchema = createInsertSchema(coachInviteCodes, {
  codeType: z.enum(['qr_code', 'text_code', 'facility_code']),
  maxUses: z.number().min(1).max(100),
}).omit({ id: true, createdAt: true });

export const insertAssessmentSessionSchema = createInsertSchema(assessmentSessions, {
  sessionType: z.enum(['quick_mode', 'full_assessment', 'follow_up']),
  status: z.enum(['in_progress', 'completed', 'abandoned', 'paused']),
  plannedSkillsCount: z.number().min(10).max(55),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertAssessmentRatingStatusSchema = createInsertSchema(assessmentRatingStatus, {
  currentStatus: z.enum(['provisional', 'confirmed']),
  currentPcpRating: z.number().min(2.0).max(8.0).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertCoachRateLimitsSchema = createInsertSchema(coachRateLimits, {
  coachLevel: z.number().min(1).max(5),
  dailyAssessmentLimit: z.number().min(1).max(20),
}).omit({ id: true, updatedAt: true });

// Type Exports
export type CoachStudentDiscovery = typeof coachStudentDiscovery.$inferSelect;
export type InsertCoachStudentDiscovery = z.infer<typeof insertCoachStudentDiscoverySchema>;

export type CoachInviteCode = typeof coachInviteCodes.$inferSelect;
export type InsertCoachInviteCode = z.infer<typeof insertCoachInviteCodeSchema>;

export type AssessmentSession = typeof assessmentSessions.$inferSelect;
export type InsertAssessmentSession = z.infer<typeof insertAssessmentSessionSchema>;

export type CoachAssessmentWeight = typeof coachAssessmentWeights.$inferSelect;
export type InsertCoachAssessmentWeight = typeof coachAssessmentWeights.$inferInsert;

export type AssessmentRatingStatus = typeof assessmentRatingStatus.$inferSelect;
export type InsertAssessmentRatingStatus = z.infer<typeof insertAssessmentRatingStatusSchema>;

export type CoachAssessmentAbuseLog = typeof coachAssessmentAbuseLog.$inferSelect;
export type InsertCoachAssessmentAbuseLog = typeof coachAssessmentAbuseLog.$inferInsert;

export type CoachRateLimit = typeof coachRateLimits.$inferSelect;
export type InsertCoachRateLimit = z.infer<typeof insertCoachRateLimitsSchema>;

export type AssessmentConfidenceMetrics = typeof assessmentConfidenceMetrics.$inferSelect;
export type InsertAssessmentConfidenceMetrics = typeof assessmentConfidenceMetrics.$inferInsert;

// Coach Level Constants
export const COACH_LEVEL_WEIGHTS = {
  1: 0.7,  // L1: Minimal influence
  2: 1.0,  // L2: Standard baseline
  3: 1.8,  // L3: Enhanced weight
  4: 3.2,  // L4: Expert weight
  5: 3.8   // L5: Master weight
} as const;

export const COACH_LEVEL_DAILY_LIMITS = {
  1: 3,   // L1: 3 assessments per day
  2: 5,   // L2: 5 assessments per day  
  3: 7,   // L3: 7 assessments per day
  4: 10,  // L4: 10 assessments per day
  5: 10   // L5: 10 assessments per day
} as const;

export const ASSESSMENT_CONFIDENCE_LEVELS = {
  quick_mode: 0.75,      // Quick mode: 75% confidence
  full_assessment: 0.95  // Full assessment: 95% confidence
} as const;

// Forward declare users table to avoid circular imports
declare const users: any;

// Add missing sql import for unique index
import { sql } from "drizzle-orm";