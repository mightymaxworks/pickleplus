/**
 * PKL-278651-COACH-GOALS-001 - Goal Setting Foundation Schema
 * 
 * Comprehensive goal-setting system for players in the coach-player ecosystem.
 * Integrates with journal system and assessment tracking for personalized development.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-02
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Goal Categories for organized goal tracking
export const GoalCategories = {
  TECHNICAL: "technical",
  COMPETITIVE: "competitive", 
  SOCIAL: "social",
  FITNESS: "fitness",
  MENTAL: "mental"
} as const;

export type GoalCategory = typeof GoalCategories[keyof typeof GoalCategories];

// Goal Status tracking
export const GoalStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  PAUSED: "paused",
  ABANDONED: "abandoned"
} as const;

export type GoalStatusType = typeof GoalStatus[keyof typeof GoalStatus];

// Goal Priority levels
export const GoalPriority = {
  LOW: "low",
  MEDIUM: "medium", 
  HIGH: "high",
  CRITICAL: "critical"
} as const;

export type GoalPriorityType = typeof GoalPriority[keyof typeof GoalPriority];

/**
 * Player Goals table - Core goal tracking system
 */
export const playerGoals = pgTable("player_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // References users.id
  
  // Goal definition
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // technical, competitive, social, fitness, mental
  priority: varchar("priority", { length: 20 }).default("medium").notNull(), // low, medium, high, critical
  
  // Timeline tracking
  targetDate: varchar("target_date"),
  createdDate: timestamp("created_date").defaultNow().notNull(),
  completedDate: timestamp("completed_date"),
  lastActivityDate: timestamp("last_activity_date"),
  
  // Progress tracking
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, completed, paused, abandoned
  progressPercentage: integer("progress_percentage").default(0).notNull(),
  difficultyLevel: integer("difficulty_level"),
  estimatedDurationDays: integer("estimated_duration_days"),
  milestoneCount: integer("milestone_count"),
  
  // Visibility and sharing
  isPublic: boolean("is_public").default(false),
  shareWithCommunity: boolean("share_with_community").default(false),
  
  // Advanced features
  assessmentLinked: boolean("assessment_linked").default(false),
  rewardsEnabled: boolean("rewards_enabled").default(false),
  journalIntegration: boolean("journal_integration").default(false),
  
  // Tags system
  tags: varchar("tags").array(),
  
  // Assessment integration
  relatedDimension: varchar("related_dimension", { length: 10 }), // TECH, TACT, PHYS, MENT for assessment correlation
  baselineAssessmentScore: integer("baseline_assessment_score"), // Initial assessment score for this goal area
  targetAssessmentScore: integer("target_assessment_score"), // Target score for completion
  currentAssessmentScore: integer("current_assessment_score"), // Most recent score
  
  // Coach collaboration
  coachId: integer("coach_id"), // References users.id where isCoach = true
  coachNotes: text("coach_notes"), // Coach input on goal progress
  isCoachApproved: boolean("is_coach_approved").default(false),
  coachLastReviewDate: timestamp("coach_last_review_date"),
  
  // Goal hierarchy and relationships
  parentGoalId: integer("parent_goal_id"), // For sub-goals and goal breakdown
  
  // Metadata and tracking
  metadata: jsonb("metadata").default("{}"), // Additional goal-specific data
  motivationNote: text("motivation_note"), // Why this goal matters to the player
  successCriteria: text("success_criteria"), // What success looks like
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

/**
 * Goal Milestones table - Breaking down goals into achievable steps
 */
export const goalMilestones = pgTable("goal_milestones", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(), // References player_goals.id
  
  // Milestone definition  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0).notNull(), // Order within goal
  
  // Progress tracking
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedDate: timestamp("completed_date"),
  dueDate: date("due_date"),
  
  // Assessment correlation
  requiredAssessmentScore: integer("required_assessment_score"), // Score needed to complete milestone
  
  // Validation and verification
  requiresCoachValidation: boolean("requires_coach_validation").default(false),
  isCoachValidated: boolean("is_coach_validated").default(false),
  coachValidationDate: timestamp("coach_validation_date"),
  coachValidationNotes: text("coach_validation_notes"),
  
  // Celebration and rewards
  celebrationMessage: text("celebration_message"), // Message shown when milestone completed
  xpReward: integer("xp_reward").default(0), // XP points awarded for completion
  badgeReward: varchar("badge_reward", { length: 100 }), // Badge ID awarded
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

/**
 * Goal Journal Entries table - Linking journal entries to goals
 */
export const goalJournalEntries = pgTable("goal_journal_entries", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(), // References player_goals.id
  journalEntryId: integer("journal_entry_id").notNull(), // References journal_entries.id
  
  // Connection metadata
  contributionType: varchar("contribution_type", { length: 50 }).notNull(), // progress, setback, reflection, breakthrough
  contributionNote: text("contribution_note"), // How this entry relates to goal
  progressImpact: integer("progress_impact").default(0), // +/- impact on goal progress (percentage points)
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull()
});

/**
 * Goal Progress Snapshots table - Historical tracking of goal progress
 */
export const goalProgressSnapshots = pgTable("goal_progress_snapshots", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(), // References player_goals.id
  
  // Progress data
  progressPercentage: integer("progress_percentage").notNull(),
  assessmentScore: integer("assessment_score"), // Assessment score at time of snapshot
  milestonesCompleted: integer("milestones_completed").default(0),
  totalMilestones: integer("total_milestones").default(0),
  
  // Context
  snapshotReason: varchar("snapshot_reason", { length: 100 }).notNull(), // assessment, milestone, weekly_review, etc.
  notes: text("notes"), // Progress notes at time of snapshot
  mood: varchar("mood", { length: 20 }), // Player mood when progress recorded
  
  // Timestamps
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Note: Relations will be defined in the main schema file to avoid circular imports

// Create insert schemas for validation
export const insertPlayerGoalSchema = createInsertSchema(playerGoals)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    category: z.enum(["technical", "competitive", "social", "fitness", "mental"]),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    status: z.enum(["active", "completed", "paused", "abandoned"]).default("active"),
    progressPercentage: z.number().min(0).max(100).default(0),
    title: z.string().min(3, "Goal title must be at least 3 characters").max(255, "Goal title too long"),
    description: z.string().optional(),
    targetDate: z.union([z.string(), z.date()]).optional().transform((val) => 
      val && typeof val === 'string' ? new Date(val) : val
    )
  });

export const insertGoalMilestoneSchema = createInsertSchema(goalMilestones)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    title: z.string().min(3, "Milestone title must be at least 3 characters").max(255, "Milestone title too long"),
    orderIndex: z.number().min(0).default(0),
    isCompleted: z.boolean().default(false),
    dueDate: z.union([z.string(), z.date()]).optional().transform((val) =>
      val && typeof val === 'string' ? new Date(val) : val
    )
  });

export const insertGoalJournalEntrySchema = createInsertSchema(goalJournalEntries)
  .omit({ id: true, createdAt: true })
  .extend({
    contributionType: z.enum(["progress", "setback", "reflection", "breakthrough"]),
    progressImpact: z.number().min(-100).max(100).default(0)
  });

export const insertGoalProgressSnapshotSchema = createInsertSchema(goalProgressSnapshots)
  .omit({ id: true, createdAt: true })
  .extend({
    progressPercentage: z.number().min(0).max(100),
    snapshotReason: z.string().min(1, "Snapshot reason required"),
    mood: z.enum(["excellent", "good", "neutral", "low", "poor"]).optional()
  });

// Export types
export type PlayerGoal = typeof playerGoals.$inferSelect;
export type InsertPlayerGoal = z.infer<typeof insertPlayerGoalSchema>;

export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type InsertGoalMilestone = z.infer<typeof insertGoalMilestoneSchema>;

export type GoalJournalEntry = typeof goalJournalEntries.$inferSelect;
export type InsertGoalJournalEntry = z.infer<typeof insertGoalJournalEntrySchema>;

export type GoalProgressSnapshot = typeof goalProgressSnapshots.$inferSelect;
export type InsertGoalProgressSnapshot = z.infer<typeof insertGoalProgressSnapshotSchema>;

