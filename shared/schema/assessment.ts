import { pgTable, serial, varchar, text, integer, boolean, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Assessment Templates (Created by Admin)
export const assessmentTemplates = pgTable('assessment_templates', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  pcpLevel: integer('pcp_level').notNull(), // 1-5
  assessmentType: varchar('assessment_type', { length: 50 }).notNull(), // 'practical', 'written', 'video', 'combined'
  skillCategories: jsonb('skill_categories').$type<string[]>().default([]), // Technical, Tactical, Physical, Mental
  totalQuestions: integer('total_questions').default(0),
  passingScore: integer('passing_score').default(70), // Percentage
  timeLimit: integer('time_limit'), // Minutes
  maxAttempts: integer('max_attempts').default(3),
  instructions: text('instructions'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Assessment Questions
export const assessmentQuestions = pgTable('assessment_questions', {
  id: serial('id').primaryKey(),
  templateId: integer('template_id').references(() => assessmentTemplates.id).notNull(),
  questionType: varchar('question_type', { length: 50 }).notNull(), // 'multiple_choice', 'practical', 'video_analysis'
  questionText: text('question_text').notNull(),
  options: jsonb('options').$type<string[]>().default([]), // For multiple choice
  correctAnswer: text('correct_answer'),
  points: integer('points').default(1),
  skillCategory: varchar('skill_category', { length: 50 }), // Technical, Tactical, Physical, Mental
  difficultyLevel: integer('difficulty_level').default(1), // 1-5
  mediaUrl: varchar('media_url', { length: 500 }), // Video/image for question
  explanation: text('explanation'),
  orderIndex: integer('order_index').default(0),
  isActive: boolean('is_active').default(true)
});

// User Assessment Attempts
export const assessmentAttempts = pgTable('assessment_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  templateId: integer('template_id').references(() => assessmentTemplates.id).notNull(),
  attemptNumber: integer('attempt_number').default(1),
  status: varchar('status', { length: 50 }).default('in_progress'), // 'in_progress', 'completed', 'abandoned'
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  timeSpent: integer('time_spent').default(0), // Minutes
  totalScore: decimal('total_score', { precision: 5, scale: 2 }).default('0'),
  maxPossibleScore: integer('max_possible_score').default(0),
  percentageScore: decimal('percentage_score', { precision: 5, scale: 2 }).default('0'),
  passed: boolean('passed').default(false),
  feedback: text('feedback'),
  skillScores: jsonb('skill_scores').$type<Record<string, number>>().default({}) // Technical: 85, Tactical: 90, etc.
});

// User Answers
export const assessmentAnswers = pgTable('assessment_answers', {
  id: serial('id').primaryKey(),
  attemptId: integer('attempt_id').references(() => assessmentAttempts.id).notNull(),
  questionId: integer('question_id').references(() => assessmentQuestions.id).notNull(),
  userAnswer: text('user_answer'),
  isCorrect: boolean('is_correct').default(false),
  pointsEarned: decimal('points_earned', { precision: 5, scale: 2 }).default('0'),
  timeSpent: integer('time_spent').default(0), // Seconds
  submittedAt: timestamp('submitted_at').defaultNow()
});

// Practical Assessment Results (Video uploads, etc.)
export const practicalAssessments = pgTable('practical_assessments', {
  id: serial('id').primaryKey(),
  attemptId: integer('attempt_id').references(() => assessmentAttempts.id).notNull(),
  assessmentType: varchar('assessment_type', { length: 50 }).notNull(), // 'video_demo', 'skill_test', 'form_analysis'
  mediaUrl: varchar('media_url', { length: 500 }), // Video/image upload
  evaluatorNotes: text('evaluator_notes'),
  score: decimal('score', { precision: 5, scale: 2 }),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'evaluated', 'needs_revision'
  evaluatedBy: integer('evaluated_by'), // Admin/instructor user ID
  evaluatedAt: timestamp('evaluated_at'),
  submittedAt: timestamp('submitted_at').defaultNow()
});

// Type exports
export type AssessmentTemplate = typeof assessmentTemplates.$inferSelect;
export type InsertAssessmentTemplate = typeof assessmentTemplates.$inferInsert;
export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type InsertAssessmentQuestion = typeof assessmentQuestions.$inferInsert;
export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type InsertAssessmentAttempt = typeof assessmentAttempts.$inferInsert;
export type AssessmentAnswer = typeof assessmentAnswers.$inferSelect;
export type InsertAssessmentAnswer = typeof assessmentAnswers.$inferInsert;
export type PracticalAssessment = typeof practicalAssessments.$inferSelect;
export type InsertPracticalAssessment = typeof practicalAssessments.$inferInsert;

// Zod schemas
export const insertAssessmentTemplateSchema = createInsertSchema(assessmentTemplates);
export const insertAssessmentQuestionSchema = createInsertSchema(assessmentQuestions);
export const insertAssessmentAttemptSchema = createInsertSchema(assessmentAttempts);
export const insertAssessmentAnswerSchema = createInsertSchema(assessmentAnswers);
export const insertPracticalAssessmentSchema = createInsertSchema(practicalAssessments);

// Assessment submission schema
export const assessmentSubmissionSchema = z.object({
  templateId: z.number(),
  answers: z.array(z.object({
    questionId: z.number(),
    answer: z.string(),
    timeSpent: z.number().optional()
  }))
});

export type AssessmentSubmission = z.infer<typeof assessmentSubmissionSchema>;