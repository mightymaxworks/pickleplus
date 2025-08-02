/**
 * Course Module System Schema
 * Phase 1 Sprint 1.1: Interactive Learning Content for PCP Certification
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Course Modules - Interactive learning content for each PCP level
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  pcpLevel: integer("pcp_level").notNull(), // 1-5 for PCP levels
  moduleNumber: integer("module_number").notNull(), // Order within level
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  
  // Content delivery
  content: text("content").notNull(), // Rich text/HTML content
  videoUrl: varchar("video_url", { length: 500 }), // YouTube/XiaoHongShu
  estimatedDuration: integer("estimated_duration_minutes").notNull(),
  
  // Learning objectives and outcomes
  learningObjectives: text("learning_objectives").notNull(), // JSON array
  skillsRequired: text("skills_required"), // Prerequisites
  skillsGained: text("skills_gained"), // Learning outcomes
  
  // Assessment and certification
  hasAssessment: boolean("has_assessment").default(false),
  passingScore: integer("passing_score").default(80), // Percentage
  maxAttempts: integer("max_attempts").default(3),
  
  // Integration with drill library
  associatedDrills: text("associated_drills"), // JSON array of drill IDs
  practicalExercises: text("practical_exercises"), // JSON array
  
  // Module status and versioning
  isActive: boolean("is_active").default(true),
  version: varchar("version", { length: 20 }).default("1.0"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module Progress - Track student progress through modules
export const moduleProgress = pgTable("module_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  moduleId: integer("module_id").notNull(),
  
  // Progress tracking
  status: varchar("status", { length: 20 }).notNull().default("not_started"), // not_started, in_progress, completed, failed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Performance metrics
  timeSpent: integer("time_spent_minutes").default(0),
  attempts: integer("attempts").default(0),
  bestScore: decimal("best_score", { precision: 5, scale: 2 }), // Assessment score
  currentScore: decimal("current_score", { precision: 5, scale: 2 }),
  
  // Learning analytics
  videosWatched: text("videos_watched"), // JSON array of watched video timestamps
  drillsCompleted: text("drills_completed"), // JSON array of completed drill IDs
  notesAndBookmarks: text("notes_and_bookmarks"), // JSON student notes
  
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module Assessments - Quizzes and practical evaluations
export const moduleAssessments = pgTable("module_assessments", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  
  // Assessment configuration
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assessmentType: varchar("assessment_type", { length: 50 }).notNull(), // quiz, practical, video_submission, peer_review
  
  // Questions and content
  questions: text("questions").notNull(), // JSON array of questions
  totalQuestions: integer("total_questions").notNull(),
  passingScore: integer("passing_score").default(80),
  timeLimit: integer("time_limit_minutes"), // Optional time limit
  
  // Practical assessment details
  practicalInstructions: text("practical_instructions"), // For hands-on assessments
  requiredDrills: text("required_drills"), // JSON array of drill IDs to demonstrate
  evaluationCriteria: text("evaluation_criteria"), // JSON rubric
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assessment Attempts - Student assessment submissions
export const assessmentAttempts = pgTable("assessment_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  assessmentId: integer("assessment_id").notNull(),
  
  // Attempt details
  attemptNumber: integer("attempt_number").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("in_progress"), // in_progress, submitted, graded, failed
  
  // Responses and scoring
  responses: text("responses").notNull(), // JSON array of answers
  score: decimal("score", { precision: 5, scale: 2 }),
  maxScore: decimal("max_score", { precision: 5, scale: 2 }),
  passed: boolean("passed").default(false),
  
  // Practical assessment data
  videoSubmissionUrl: varchar("video_submission_url", { length: 500 }), // For video assessments
  practicalNotes: text("practical_notes"), // Coach evaluation notes
  
  // Timing and completion
  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  gradedAt: timestamp("graded_at"),
  timeSpent: integer("time_spent_minutes"),
  
  // Review and feedback
  reviewerId: integer("reviewer_id"), // Coach/admin who reviewed
  feedback: text("feedback"),
  improvementAreas: text("improvement_areas"), // JSON array
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Certification Applications - Link modules to certification process
export const certificationApplications = pgTable("certification_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  pcpLevel: integer("pcp_level").notNull(),
  
  // Application status
  status: varchar("status", { length: 30 }).notNull().default("submitted"), 
  // submitted, modules_in_progress, modules_completed, under_review, approved, rejected
  
  // Module completion tracking
  requiredModules: text("required_modules").notNull(), // JSON array of module IDs
  completedModules: text("completed_modules"), // JSON array of completed module IDs
  moduleCompletionPercentage: decimal("module_completion_percentage", { precision: 5, scale: 2 }).default(0),
  
  // Assessment results
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  practicalAssessmentScore: decimal("practical_assessment_score", { precision: 5, scale: 2 }),
  theoreticalAssessmentScore: decimal("theoretical_assessment_score", { precision: 5, scale: 2 }),
  
  // Admin review process
  submitDate: timestamp("submit_date").defaultNow(),
  reviewStartDate: timestamp("review_start_date"),
  reviewCompletionDate: timestamp("review_completion_date"),
  reviewerId: integer("reviewer_id"), // Admin who reviewed
  
  // Documents and verification
  documentsSubmitted: text("documents_submitted"), // JSON array of file paths
  verificationNotes: text("verification_notes"),
  
  // Final certification
  certificateIssued: boolean("certificate_issued").default(false),
  certificateNumber: varchar("certificate_number", { length: 50 }),
  certificateIssuedDate: timestamp("certificate_issued_date"),
  
  // Payment tracking
  paymentStatus: varchar("payment_status", { length: 20 }).default("completed"), // provisional status
  paymentReference: varchar("payment_reference", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const courseModulesRelations = relations(courseModules, ({ many }) => ({
  moduleProgress: many(moduleProgress),
  assessments: many(moduleAssessments),
}));

export const moduleProgressRelations = relations(moduleProgress, ({ one }) => ({
  module: one(courseModules, {
    fields: [moduleProgress.moduleId],
    references: [courseModules.id],
  }),
}));

export const moduleAssessmentsRelations = relations(moduleAssessments, ({ one, many }) => ({
  module: one(courseModules, {
    fields: [moduleAssessments.moduleId],
    references: [courseModules.id],
  }),
  attempts: many(assessmentAttempts),
}));

export const assessmentAttemptsRelations = relations(assessmentAttempts, ({ one }) => ({
  assessment: one(moduleAssessments, {
    fields: [assessmentAttempts.assessmentId],
    references: [moduleAssessments.id],
  }),
}));

export const certificationApplicationsRelations = relations(certificationApplications, ({ one }) => ({
  // Relations can be added to users table when needed
}));

// Zod Schemas
export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModuleProgressSchema = createInsertSchema(moduleProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModuleAssessmentSchema = createInsertSchema(moduleAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentAttemptSchema = createInsertSchema(assessmentAttempts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificationApplicationSchema = createInsertSchema(certificationApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript Types
export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;

export type ModuleProgress = typeof moduleProgress.$inferSelect;
export type InsertModuleProgress = z.infer<typeof insertModuleProgressSchema>;

export type ModuleAssessment = typeof moduleAssessments.$inferSelect;
export type InsertModuleAssessment = z.infer<typeof insertModuleAssessmentSchema>;

export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type InsertAssessmentAttempt = z.infer<typeof insertAssessmentAttemptSchema>;

export type CertificationApplication = typeof certificationApplications.$inferSelect;
export type InsertCertificationApplication = z.infer<typeof insertCertificationApplicationSchema>;

// Utility types for complex operations
export type ModuleWithProgress = CourseModule & {
  progress?: ModuleProgress;
  assessments?: ModuleAssessment[];
};

export type LevelProgress = {
  pcpLevel: number;
  totalModules: number;
  completedModules: number;
  completionPercentage: number;
  overallScore?: number;
  canProgressToNext: boolean;
};

export type CertificationSummary = {
  userId: number;
  currentLevel: number;
  eligibleForLevel: number;
  completedLevels: number[];
  inProgressApplications: CertificationApplication[];
  nextRequirements: string[];
};