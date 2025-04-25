/**
 * PKL-278651-SAGE-0010-FEEDBACK - Enhanced Feedback System Schema
 * 
 * This schema defines the database structure for the comprehensive feedback system
 * that will drive continuous improvement of drills and training plans in SAGE.
 * 
 * Part of Sprint 5: Social Features & UI Polish
 */

import { pgTable, serial, text, integer, timestamp, jsonb, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Feedback type enum
 */
export const FeedbackTypeEnum = z.enum(['drill', 'training_plan', 'sage_conversation', 'video']);
export type FeedbackType = z.infer<typeof FeedbackTypeEnum>;

/**
 * Feedback status enum
 */
export const FeedbackStatusEnum = z.enum(['new', 'reviewed', 'implemented', 'declined']);
export type FeedbackStatus = z.infer<typeof FeedbackStatusEnum>;

/**
 * Feedback sentiment enum
 */
export const FeedbackSentimentEnum = z.enum(['positive', 'negative', 'neutral', 'mixed']);
export type FeedbackSentiment = z.infer<typeof FeedbackSentimentEnum>;

/**
 * Enhanced feedback table with multiple rating dimensions and contextual data
 */
export const enhancedFeedback = pgTable("enhanced_feedback", {
  id: serial("id").primaryKey(),
  
  // Reference fields
  itemType: text("item_type").$type<FeedbackType>().notNull(),
  itemId: integer("item_id").notNull(), // ID of drill, training plan, etc.
  userId: integer("user_id").notNull(),
  
  // Quantitative ratings (1-5 scale)
  overallRating: integer("overall_rating").notNull(), // Overall satisfaction
  clarityRating: integer("clarity_rating"), // How clear were instructions
  difficultyRating: integer("difficulty_rating"), // Appropriateness of difficulty
  enjoymentRating: integer("enjoyment_rating"), // How fun/engaging was it
  effectivenessRating: integer("effectiveness_rating"), // How effective for skill improvement
  
  // Qualitative feedback
  positiveFeedback: text("positive_feedback"), // What worked well
  improvementFeedback: text("improvement_feedback"), // What could be improved
  specificChallenges: text("specific_challenges"), // Challenges faced
  suggestions: text("suggestions"), // Suggestions for modifications
  
  // Context data
  userSkillLevel: text("user_skill_level"), // User's self-reported skill level at time of feedback
  courtIqScores: jsonb("court_iq_scores"), // User's CourtIQ scores at time of feedback
  completionStatus: text("completion_status"), // completed, partial, attempted
  attemptCount: integer("attempt_count"), // How many times user tried this drill
  timeSpent: integer("time_spent"), // Minutes spent on the activity
  environment: jsonb("environment"), // Court type, available equipment, etc.
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  status: text("status").$type<FeedbackStatus>().default('new').notNull(),
  reviewedBy: integer("reviewed_by"), // Admin who reviewed this feedback
  reviewedAt: timestamp("reviewed_at"),
  
  // Analysis fields (filled by automated processes)
  sentiment: text("sentiment").$type<FeedbackSentiment>(),
  keywords: text("keywords").array(),
  actionableInsights: text("actionable_insights"),
  similarFeedbackIds: integer("similar_feedback_ids").array(),
});

/**
 * Feedback improvement plans - documents changes made based on feedback
 */
export const feedbackImprovementPlans = pgTable("feedback_improvement_plans", {
  id: serial("id").primaryKey(),
  itemType: text("item_type").$type<FeedbackType>().notNull(),
  itemId: integer("item_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  plannedChanges: jsonb("planned_changes").notNull(),
  feedbackIds: integer("feedback_ids").array(), // Associated feedback that prompted this plan
  status: text("status").notNull().default('planned'), // planned, in_progress, completed
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  priorityLevel: integer("priority_level").default(3), // 1-5 (higher = more important)
});

/**
 * Feedback implementation history - tracks actual changes made
 */
export const feedbackImplementations = pgTable("feedback_implementations", {
  id: serial("id").primaryKey(),
  improvementPlanId: integer("improvement_plan_id").notNull(),
  implementedChanges: jsonb("implemented_changes").notNull(),
  beforeState: jsonb("before_state"), // Item state before changes
  afterState: jsonb("after_state"), // Item state after changes
  implementedBy: integer("implemented_by").notNull(),
  implementedAt: timestamp("implemented_at").defaultNow().notNull(),
  notifiedUsers: boolean("notified_users").default(false),
});

/**
 * Feedback analytics - aggregated insights across feedback
 */
export const feedbackAnalytics = pgTable("feedback_analytics", {
  id: serial("id").primaryKey(),
  itemType: text("item_type").$type<FeedbackType>().notNull(),
  itemId: integer("item_id").notNull(),
  
  // Calculated metrics
  averageRatings: jsonb("average_ratings").notNull(), // JSON with avg for each rating dimension
  ratingCounts: jsonb("rating_counts").notNull(), // Distribution of ratings
  feedbackCount: integer("feedback_count").notNull(),
  sentimentBreakdown: jsonb("sentiment_breakdown").notNull(), // % positive, negative, etc.
  commonThemes: jsonb("common_themes"), // Frequently mentioned topics
  improvementSuggestions: jsonb("improvement_suggestions"), // Auto-generated suggestions
  
  // Trends
  ratingTrend: jsonb("rating_trend"), // Change in ratings over time
  sentimentTrend: jsonb("sentiment_trend"), // Change in sentiment over time
  
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
});

/**
 * Feedback notifications - alerts users when their feedback leads to changes
 */
export const feedbackNotifications = pgTable("feedback_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  feedbackId: integer("feedback_id").notNull(),
  implementationId: integer("implementation_id").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

/**
 * User feedback participation - tracks user engagement with the feedback system
 */
export const userFeedbackParticipation = pgTable("user_feedback_participation", {
  user_id: integer("user_id").primaryKey().notNull(),
  totalFeedbackSubmitted: integer("total_feedback_submitted").notNull().default(0),
  helpfulFeedbackCount: integer("helpful_feedback_count").notNull().default(0), // Feedback that led to changes
  lastFeedbackAt: timestamp("last_feedback_at"),
  feedbackQualityScore: integer("feedback_quality_score"), // Calculated score based on helpfulness
});

// Types
export type EnhancedFeedback = typeof enhancedFeedback.$inferSelect;
export type InsertEnhancedFeedback = typeof enhancedFeedback.$inferInsert;

export type FeedbackImprovementPlan = typeof feedbackImprovementPlans.$inferSelect;
export type InsertFeedbackImprovementPlan = typeof feedbackImprovementPlans.$inferInsert;

export type FeedbackImplementation = typeof feedbackImplementations.$inferSelect;
export type InsertFeedbackImplementation = typeof feedbackImplementations.$inferInsert;

export type FeedbackAnalytic = typeof feedbackAnalytics.$inferSelect;
export type InsertFeedbackAnalytic = typeof feedbackAnalytics.$inferInsert;

export type FeedbackNotification = typeof feedbackNotifications.$inferSelect;
export type InsertFeedbackNotification = typeof feedbackNotifications.$inferInsert;

export type UserFeedbackParticipation = typeof userFeedbackParticipation.$inferSelect;
export type InsertUserFeedbackParticipation = typeof userFeedbackParticipation.$inferInsert;

// Zod schemas for validation
export const insertEnhancedFeedbackSchema = createInsertSchema(enhancedFeedback);
export const insertFeedbackImprovementPlanSchema = createInsertSchema(feedbackImprovementPlans);
export const insertFeedbackImplementationSchema = createInsertSchema(feedbackImplementations);
export const insertFeedbackAnalyticSchema = createInsertSchema(feedbackAnalytics);
export const insertFeedbackNotificationSchema = createInsertSchema(feedbackNotifications);
export const insertUserFeedbackParticipationSchema = createInsertSchema(userFeedbackParticipation);

// Extended validation schema with additional constraints
export const enhancedFeedbackValidationSchema = insertEnhancedFeedbackSchema.extend({
  overallRating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  clarityRating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
  difficultyRating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
  enjoymentRating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
  effectivenessRating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
  
  // At least one qualitative feedback field should be provided
  positiveFeedback: z.string().optional(),
  improvementFeedback: z.string().optional(),
  specificChallenges: z.string().optional(),
  suggestions: z.string().optional(),
}).refine(
  (data) => 
    data.positiveFeedback || 
    data.improvementFeedback || 
    data.specificChallenges || 
    data.suggestions,
  {
    message: "At least one feedback comment is required",
    path: ["positiveFeedback"],
  }
);

// Enhanced context feedback validator
export const submissionContextSchema = z.object({
  userSkillLevel: z.string().optional(),
  courtIqScores: z.record(z.string(), z.number()).optional(),
  completionStatus: z.enum(['completed', 'partial', 'attempted']).optional(),
  attemptCount: z.number().int().min(1).optional(),
  timeSpent: z.number().int().min(1).optional(),
  environment: z.record(z.string(), z.any()).optional(),
});