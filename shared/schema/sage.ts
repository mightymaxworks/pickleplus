/**
 * PKL-278651-SAGE-0001-CORE
 * SAGE Schema Types
 * 
 * Type definitions for the SAGE coaching system and CourtIQ.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { z } from 'zod';
import { pgTable, serial, integer, text, varchar, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { users } from "../schema";

/**
 * CourtIQ Dimension codes
 */
export type DimensionCode = 'TECH' | 'TACT' | 'PHYS' | 'MENT' | 'CONS';
export const DimensionCodes: DimensionCode[] = ['TECH', 'TACT', 'PHYS', 'MENT', 'CONS'];

/**
 * Journal entry types
 */
export enum JournalEntryTypes {
  REFLECTION = 'REFLECTION',
  GOAL = 'GOAL',
  PROGRESS = 'PROGRESS',
  SESSION = 'SESSION',
  OTHER = 'OTHER'
}

/**
 * Mood types
 */
export enum MoodTypes {
  VERY_NEGATIVE = 1,
  NEGATIVE = 2,
  NEUTRAL = 3,
  POSITIVE = 4,
  VERY_POSITIVE = 5
}

/**
 * CourtIQ Dimension names
 */
export const DIMENSION_NAMES: Record<DimensionCode, string> = {
  'TECH': 'Technical Skills',
  'TACT': 'Tactical Awareness',
  'PHYS': 'Physical Fitness',
  'MENT': 'Mental Toughness',
  'CONS': 'Consistency'
};

/**
 * CourtIQ rating
 */
export interface CourtIQRating {
  userId: number;
  technicalRating: number;
  tacticalRating: number;
  physicalRating: number;
  mentalRating: number;
  consistencyRating: number;
  lastUpdated: Date;
}

/**
 * SAGE Journal entry
 */
export interface JournalEntry {
  id: number;
  userId: number;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
}

/**
 * SAGE Journal entry schema for insertion
 */
export const insertJournalEntrySchema = z.object({
  userId: z.number(),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
  mood: z.number().min(1).max(5),
  tags: z.array(z.string()),
  isPrivate: z.boolean().default(true)
});

/**
 * SAGE Journal entry type for insertion
 */
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

/**
 * SAGE emotion analysis result
 */
export interface EmotionAnalysis {
  dominant: string;
  confidence: number;
  emotions: Record<string, number>;
  sentimentScore: number;
  recommendations: string[];
}

/**
 * SAGE coaching topic
 */
export interface CoachingTopic {
  id: string;
  title: string;
  description: string;
  dimensions: DimensionCode[];
  skillLevel: number;
  content: string;
  exercises: CoachingExercise[];
}

/**
 * SAGE coaching exercise
 */
export interface CoachingExercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  steps: string[];
  dimension: DimensionCode;
}

/**
 * Database tables for SAGE coaching system
 */

// Coaching sessions table
export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  topicId: varchar("topic_id", { length: 100 }),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  rating: integer("rating"),
  feedback: text("feedback"),
  status: varchar("status", { length: 20 }).default("active")
});

// Coaching insights table
export const coachingInsights = pgTable("coaching_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => coachingSessions.id),
  dimension: varchar("dimension", { length: 10 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isShared: boolean("is_shared").default(false)
});

// Training plans table
export const trainingPlans = pgTable("training_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  primaryDimension: varchar("primary_dimension", { length: 10 }).notNull(),
  secondaryDimension: varchar("secondary_dimension", { length: 10 }),
  difficulty: integer("difficulty").default(3),
  durationDays: integer("duration_days"),
  createdAt: timestamp("created_at").defaultNow(),
  isVisible: boolean("is_visible").default(true)
});

// Training exercises table
export const trainingExercises = pgTable("training_exercises", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => trainingPlans.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  dimension: varchar("dimension", { length: 10 }).notNull(),
  duration: integer("duration"),
  steps: json("steps"),
  dayNumber: integer("day_number"),
  order: integer("order")
});

// Coaching content library
export const coachingContentLibrary = pgTable("coaching_content_library", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // tip, drill, exercise, etc.
  dimension: varchar("dimension", { length: 10 }),
  difficulty: integer("difficulty").default(3),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isApproved: boolean("is_approved").default(true)
});

// User progress logs
export const userProgressLogs = pgTable("user_progress_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").references(() => trainingPlans.id),
  exerciseId: integer("exercise_id").references(() => trainingExercises.id),
  currentDay: integer("current_day").default(1),
  progress: integer("progress").default(0), // 0-100%
  completedAt: timestamp("completed_at"),
  lastUpdated: timestamp("last_updated").defaultNow()
});

// Coaching conversations
export const coachingConversations = pgTable("coaching_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 100 }),
  startedAt: timestamp("started_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  summary: text("summary")
});

// Coaching messages
export const coachingMessages = pgTable("coaching_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => coachingConversations.id),
  role: varchar("role", { length: 20 }).notNull(), // user, assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  feedback: varchar("feedback", { length: 20 }), // positive, negative
  metadata: json("metadata")
});

// Coaching profiles
export const coachingProfiles = pgTable("coaching_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  goals: json("goals"),
  preferences: json("preferences"),
  experience: varchar("experience", { length: 20 }),
  focusAreas: json("focus_areas"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Journal entries
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  mood: integer("mood"),
  tags: json("tags").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isPrivate: boolean("is_private").default(true)
});

// Journal prompts
export const journalPrompts = pgTable("journal_prompts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  dimension: varchar("dimension", { length: 10 }),
  difficulty: integer("difficulty").default(2),
  isActive: boolean("is_active").default(true)
});

// Journal reflections
export const journalReflections = pgTable("journal_reflections", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull().references(() => journalEntries.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  type: varchar("type", { length: 50 }).default("coaching"), // coaching, self
  isShared: boolean("is_shared").default(false)
});

// Define relationships
export const coachingSessionsRelations = relations(coachingSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [coachingSessions.userId],
    references: [users.id],
  }),
  insights: many(coachingInsights)
}));

export const coachingInsightsRelations = relations(coachingInsights, ({ one }) => ({
  user: one(users, {
    fields: [coachingInsights.userId],
    references: [users.id],
  }),
  session: one(coachingSessions, {
    fields: [coachingInsights.sessionId],
    references: [coachingSessions.id],
  })
}));

export const trainingPlansRelations = relations(trainingPlans, ({ many }) => ({
  exercises: many(trainingExercises),
  userProgress: many(userProgressLogs)
}));

export const trainingExercisesRelations = relations(trainingExercises, ({ one, many }) => ({
  plan: one(trainingPlans, {
    fields: [trainingExercises.planId],
    references: [trainingPlans.id],
  }),
  userProgress: many(userProgressLogs)
}));

export const userProgressLogsRelations = relations(userProgressLogs, ({ one }) => ({
  user: one(users, {
    fields: [userProgressLogs.userId],
    references: [users.id],
  }),
  plan: one(trainingPlans, {
    fields: [userProgressLogs.planId],
    references: [trainingPlans.id],
  }),
  exercise: one(trainingExercises, {
    fields: [userProgressLogs.exerciseId],
    references: [trainingExercises.id],
  })
}));

export const coachingConversationsRelations = relations(coachingConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [coachingConversations.userId],
    references: [users.id],
  }),
  messages: many(coachingMessages)
}));

export const coachingMessagesRelations = relations(coachingMessages, ({ one }) => ({
  conversation: one(coachingConversations, {
    fields: [coachingMessages.conversationId],
    references: [coachingConversations.id],
  })
}));

export const coachingProfilesRelations = relations(coachingProfiles, ({ one }) => ({
  user: one(users, {
    fields: [coachingProfiles.userId],
    references: [users.id],
  })
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
  reflections: many(journalReflections)
}));

export const journalReflectionsRelations = relations(journalReflections, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [journalReflections.entryId],
    references: [journalEntries.id],
  })
}));

// Create insert schemas
export const insertCoachingSessionSchema = createInsertSchema(coachingSessions);
export const insertCoachingInsightSchema = createInsertSchema(coachingInsights);
export const insertTrainingPlanSchema = createInsertSchema(trainingPlans);
export const insertTrainingExerciseSchema = createInsertSchema(trainingExercises);
export const insertCoachingContentLibrarySchema = createInsertSchema(coachingContentLibrary);
export const insertUserProgressLogSchema = createInsertSchema(userProgressLogs);
export const insertCoachingConversationSchema = createInsertSchema(coachingConversations);
export const insertCoachingMessageSchema = createInsertSchema(coachingMessages);
export const insertCoachingProfileSchema = createInsertSchema(coachingProfiles);
export const insertJournalPromptSchema = createInsertSchema(journalPrompts);
export const insertJournalReflectionSchema = createInsertSchema(journalReflections);

// Define types
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;

export type CoachingInsight = typeof coachingInsights.$inferSelect;
export type InsertCoachingInsight = z.infer<typeof insertCoachingInsightSchema>;

export type TrainingPlan = typeof trainingPlans.$inferSelect;
export type InsertTrainingPlan = z.infer<typeof insertTrainingPlanSchema>;

export type TrainingExercise = typeof trainingExercises.$inferSelect;
export type InsertTrainingExercise = z.infer<typeof insertTrainingExerciseSchema>;

export type CoachingContentLibrary = typeof coachingContentLibrary.$inferSelect;
export type InsertCoachingContentLibrary = z.infer<typeof insertCoachingContentLibrarySchema>;

export type UserProgressLog = typeof userProgressLogs.$inferSelect;
export type InsertUserProgressLog = z.infer<typeof insertUserProgressLogSchema>;

export type CoachingConversation = typeof coachingConversations.$inferSelect;
export type InsertCoachingConversation = z.infer<typeof insertCoachingConversationSchema>;

export type CoachingMessage = typeof coachingMessages.$inferSelect;
export type InsertCoachingMessage = z.infer<typeof insertCoachingMessageSchema>;

export type CoachingProfile = typeof coachingProfiles.$inferSelect;
export type InsertCoachingProfile = z.infer<typeof insertCoachingProfileSchema>;

export type JournalPrompt = typeof journalPrompts.$inferSelect;
export type InsertJournalPrompt = z.infer<typeof insertJournalPromptSchema>;