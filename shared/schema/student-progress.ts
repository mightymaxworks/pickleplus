import { pgTable, serial, integer, decimal, timestamp, text, varchar, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../schema';
import { drillLibrary } from './curriculum-management';

// Student drill completion tracking
export const studentDrillCompletions = pgTable('student_drill_completions', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  drillId: integer('drill_id').notNull().references(() => drillLibrary.id, { onDelete: 'cascade' }),
  coachId: integer('coach_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  performanceRating: decimal('performance_rating', { precision: 3, scale: 1 }).notNull(), // PCP scale 2.0-8.0
  completionDate: timestamp('completion_date').defaultNow(),
  coachNotes: text('coach_notes'),
  improvementAreas: jsonb('improvement_areas').default('[]'),
  technicalRating: decimal('technical_rating', { precision: 3, scale: 1 }),
  tacticalRating: decimal('tactical_rating', { precision: 3, scale: 1 }),
  physicalRating: decimal('physical_rating', { precision: 3, scale: 1 }),
  mentalRating: decimal('mental_rating', { precision: 3, scale: 1 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Session drill assignments
export const sessionDrillAssignments = pgTable('session_drill_assignments', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').notNull(),
  drillId: integer('drill_id').notNull().references(() => drillLibrary.id, { onDelete: 'cascade' }),
  coachId: integer('coach_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderSequence: integer('order_sequence').notNull(),
  allocatedMinutes: integer('allocated_minutes').notNull().default(10),
  objectives: text('objectives'),
  completionStatus: varchar('completion_status', { length: 20 }).default('pending'), // 'pending', 'completed', 'skipped'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});

// Student progress summary (computed/cached data)
export const studentProgressSummary = pgTable('student_progress_summary', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  coachId: integer('coach_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalDrillsCompleted: integer('total_drills_completed').default(0),
  avgPerformanceRating: decimal('avg_performance_rating', { precision: 3, scale: 1 }),
  avgTechnicalRating: decimal('avg_technical_rating', { precision: 3, scale: 1 }),
  avgTacticalRating: decimal('avg_tactical_rating', { precision: 3, scale: 1 }),
  avgPhysicalRating: decimal('avg_physical_rating', { precision: 3, scale: 1 }),
  avgMentalRating: decimal('avg_mental_rating', { precision: 3, scale: 1 }),
  lastSessionDate: timestamp('last_session_date'),
  totalSessionMinutes: integer('total_session_minutes').default(0),
  improvementTrend: varchar('improvement_trend', { length: 20 }).default('stable'), // 'improving', 'stable', 'declining'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relations
export const studentDrillCompletionsRelations = relations(studentDrillCompletions, ({ one }) => ({
  student: one(users, {
    fields: [studentDrillCompletions.studentId],
    references: [users.id],
  }),
  coach: one(users, {
    fields: [studentDrillCompletions.coachId],
    references: [users.id],
  }),
  drill: one(drillLibrary, {
    fields: [studentDrillCompletions.drillId],
    references: [drillLibrary.id],
  }),
}));

export const sessionDrillAssignmentsRelations = relations(sessionDrillAssignments, ({ one }) => ({
  drill: one(drillLibrary, {
    fields: [sessionDrillAssignments.drillId],
    references: [drillLibrary.id],
  }),
  coach: one(users, {
    fields: [sessionDrillAssignments.coachId],
    references: [users.id],
  }),
}));

export const studentProgressSummaryRelations = relations(studentProgressSummary, ({ one }) => ({
  student: one(users, {
    fields: [studentProgressSummary.studentId],
    references: [users.id],
  }),
  coach: one(users, {
    fields: [studentProgressSummary.coachId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertStudentDrillCompletionSchema = createInsertSchema(studentDrillCompletions, {
  performanceRating: z.coerce.number().min(2.0).max(8.0),
  technicalRating: z.coerce.number().min(2.0).max(8.0).optional(),
  tacticalRating: z.coerce.number().min(2.0).max(8.0).optional(),
  physicalRating: z.coerce.number().min(2.0).max(8.0).optional(),
  mentalRating: z.coerce.number().min(2.0).max(8.0).optional(),
  improvementAreas: z.array(z.string()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectStudentDrillCompletionSchema = createSelectSchema(studentDrillCompletions);

export const insertSessionDrillAssignmentSchema = createInsertSchema(sessionDrillAssignments, {
  orderSequence: z.number().min(1),
  allocatedMinutes: z.number().min(1).max(120),
  completionStatus: z.enum(['pending', 'completed', 'skipped']).optional(),
}).omit({ id: true, createdAt: true });

export const selectSessionDrillAssignmentSchema = createSelectSchema(sessionDrillAssignments);

export const insertStudentProgressSummarySchema = createInsertSchema(studentProgressSummary, {
  totalDrillsCompleted: z.number().min(0).optional(),
  improvementTrend: z.enum(['improving', 'stable', 'declining']).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectStudentProgressSummarySchema = createSelectSchema(studentProgressSummary);

// TypeScript types
export type StudentDrillCompletion = typeof studentDrillCompletions.$inferSelect;
export type InsertStudentDrillCompletion = z.infer<typeof insertStudentDrillCompletionSchema>;

export type SessionDrillAssignment = typeof sessionDrillAssignments.$inferSelect;
export type InsertSessionDrillAssignment = z.infer<typeof insertSessionDrillAssignmentSchema>;

export type StudentProgressSummary = typeof studentProgressSummary.$inferSelect;
export type InsertStudentProgressSummary = z.infer<typeof insertStudentProgressSummarySchema>;

// Progress tracking DTOs
export interface StudentProgressOverview {
  studentId: number;
  studentName: string;
  studentEmail: string;
  totalDrillsCompleted: number;
  avgPerformanceRating: number;
  avgTechnicalRating: number;
  avgTacticalRating: number;
  avgPhysicalRating: number;
  avgMentalRating: number;
  lastSessionDate: string | null;
  totalSessionMinutes: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
  recentCompletions: StudentDrillCompletion[];
}

export interface DrillCompletionRecord {
  id: number;
  drillTitle: string;
  drillCategory: string;
  completionDate: string;
  performanceRating: number;
  technicalRating: number;
  tacticalRating: number;
  physicalRating: number;
  mentalRating: number;
  coachNotes: string;
  improvementAreas: string[];
}

export interface CoachProgressAnalytics {
  totalStudents: number;
  totalDrillsAssigned: number;
  totalCompletions: number;
  avgStudentImprovement: number;
  topPerformingDrills: Array<{
    drillId: number;
    drillTitle: string;
    completionRate: number;
    avgRating: number;
  }>;
  studentProgressTrends: Array<{
    studentId: number;
    studentName: string;
    trend: 'improving' | 'stable' | 'declining';
    recentProgress: number;
  }>;
}