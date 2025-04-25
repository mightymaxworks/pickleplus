/**
 * PKL-278651-SAGE-0009-DRILLS - Pickleball Drill Database Schema
 * 
 * This schema defines the database structure for storing pickleball drills
 * that can be recommended by the SAGE coaching system.
 * 
 * Part of Sprint 4: Enhanced Training Plans & Video Integration
 */

import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Skill level enum
 */
export const SkillLevelEnum = z.enum(['beginner', 'intermediate', 'advanced']);
export type SkillLevel = z.infer<typeof SkillLevelEnum>;

/**
 * Category enum
 */
export const CategoryEnum = z.enum(['technical', 'tactical', 'physical', 'mental', 'consistency']);
export type Category = z.infer<typeof CategoryEnum>;

/**
 * Status enum
 */
export const StatusEnum = z.enum(['active', 'archived', 'draft']);
export type Status = z.infer<typeof StatusEnum>;

/**
 * Source enum
 */
export const SourceEnum = z.enum(['admin', 'imported', 'ai-generated']);
export type Source = z.infer<typeof SourceEnum>;

/**
 * Pickleball drills table
 */
export const pickleballDrills = pgTable("pickleball_drills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").$type<Category>().notNull(),
  skillLevel: text("skill_level").$type<SkillLevel>().notNull(),
  focusAreas: text("focus_areas").array().notNull(),
  duration: integer("duration").notNull(), // in minutes
  participants: integer("participants").notNull(), // 1, 2, or 4
  equipment: text("equipment").array().notNull(),
  setupInstructions: text("setup_instructions").notNull(),
  executionSteps: text("execution_steps").array().notNull(),
  successMetrics: text("success_metrics").array().notNull(),
  progressionOptions: text("progression_options").array(),
  relatedRules: text("related_rules").array(),
  mediaUrls: text("media_urls").array(),
  coachingTips: text("coaching_tips").array(),
  
  // Video content
  youtubeVideoIds: text("youtube_video_ids").array(), // Array of YouTube video IDs
  primaryVideoId: text("primary_video_id"), // Primary YouTube video ID
  videoTimestamps: jsonb("video_timestamps").default({}), // Timestamps for key sections (setup, steps, etc.)
  videoSource: text("video_source").default('youtube'), // 'youtube', 'self-hosted', 'mux', etc.
  
  // Admin metadata
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastModifiedBy: integer("last_modified_by"),
  lastModifiedAt: timestamp("last_modified_at"),
  status: text("status").$type<Status>().notNull().default('active'),
  source: text("source").$type<Source>().notNull(),
  internalNotes: text("internal_notes"),
  
  // Usage statistics
  recommendationCount: integer("recommendation_count").notNull().default(0),
  averageFeedbackRating: integer("average_feedback_rating"),
  lastRecommendedAt: timestamp("last_recommended_at"),
});

/**
 * Drill feedback table
 */
export const drillFeedback = pgTable("drill_feedback", {
  id: serial("id").primaryKey(),
  drillId: integer("drill_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  helpfulnessRating: integer("helpfulness_rating"), // 1-5
  difficultyRating: integer("difficulty_rating"), // 1-5
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Drill recommendations table - tracks which drills were recommended to users
 */
export const drillRecommendations = pgTable("drill_recommendations", {
  id: serial("id").primaryKey(),
  drillId: integer("drill_id").notNull(),
  userId: integer("user_id").notNull(),
  conversationId: text("conversation_id"),
  recommendedAt: timestamp("recommended_at").defaultNow().notNull(),
  context: text("context"), // e.g., "kitchen rule question", "journal analysis"
  viewed: boolean("viewed").notNull().default(false),
  saved: boolean("saved").notNull().default(false),
  completed: boolean("completed").notNull().default(false),
});

/**
 * AI drill generation parameters
 */
export const drillGenerationParams = pgTable("drill_generation_params", {
  id: serial("id").primaryKey(),
  baseDrillId: integer("base_drill_id"), // Optional, for drill extensions
  userId: integer("user_id").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  params: jsonb("params").notNull(), // Store parameters used for generation
  status: text("status").notNull().default('pending'), // pending, completed, failed
  resultDrillId: integer("result_drill_id"), // ID of the generated drill
  error: text("error"), // Error message if generation failed
});

// Types
export type PickleballDrill = typeof pickleballDrills.$inferSelect;
export type InsertPickleballDrill = typeof pickleballDrills.$inferInsert;

export type DrillFeedback = typeof drillFeedback.$inferSelect;
export type InsertDrillFeedback = typeof drillFeedback.$inferInsert;

export type DrillRecommendation = typeof drillRecommendations.$inferSelect;
export type InsertDrillRecommendation = typeof drillRecommendations.$inferInsert;

export type DrillGenerationParam = typeof drillGenerationParams.$inferSelect;
export type InsertDrillGenerationParam = typeof drillGenerationParams.$inferInsert;

// Zod schemas for validation
export const insertPickleballDrillSchema = createInsertSchema(pickleballDrills);
export const insertDrillFeedbackSchema = createInsertSchema(drillFeedback);
export const insertDrillRecommendationSchema = createInsertSchema(drillRecommendations);
export const insertDrillGenerationParamSchema = createInsertSchema(drillGenerationParams);

// Extended validation schema
export const pickleballDrillValidationSchema = insertPickleballDrillSchema.extend({
  name: z.string().min(3, "Drill name must be at least 3 characters").max(100, "Drill name must be less than 100 characters"),
  duration: z.number().min(1, "Duration must be at least 1 minute").max(120, "Duration cannot exceed 120 minutes"),
  participants: z.number().min(1, "Must have at least 1 participant").max(4, "Cannot exceed 4 participants"),
  setupInstructions: z.string().min(10, "Setup instructions must be at least 10 characters"),
  executionSteps: z.array(z.string()).min(1, "Must have at least one execution step"),
  successMetrics: z.array(z.string()).min(1, "Must have at least one success metric"),
});