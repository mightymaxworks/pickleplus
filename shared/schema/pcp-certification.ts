/**
 * PCP Coaching Certification Programme Schema
 * Comprehensive certification system for aspiring and current coaches
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// PCP Certification Levels
export const pcpCertificationLevels = pgTable('pcp_certification_levels', {
  id: serial('id').primaryKey(),
  levelName: varchar('level_name', { length: 100 }).notNull(), // Level 1, Level 2, Master Coach, etc.
  levelCode: varchar('level_code', { length: 20 }).notNull().unique(), // PCP-L1, PCP-L2, PCP-MC
  description: text('description').notNull(),
  prerequisites: jsonb('prerequisites'), // Previous levels, experience requirements
  requirements: jsonb('requirements'), // Hours, assessments, practical tests
  benefits: jsonb('benefits'), // What this level unlocks
  duration: integer('duration'), // Expected completion time in weeks
  cost: integer('cost'), // Certification cost in cents
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// PCP Certification Applications
export const pcpCertificationApplications = pgTable('pcp_certification_applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  certificationLevelId: integer('certification_level_id').notNull(),
  applicationStatus: varchar('application_status', { length: 50 }).default('pending'), // pending, approved, rejected, in_progress
  motivation: text('motivation'), // Why they want this certification
  experienceStatement: text('experience_statement'), // Their coaching/playing experience
  goals: text('goals'), // What they hope to achieve
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'), // pending, paid, refunded
  paymentId: varchar('payment_id', { length: 100 }), // Stripe payment intent ID
  adminNotes: text('admin_notes'),
  reviewedBy: integer('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  approvedAt: timestamp('approved_at'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// PCP Learning Modules
export const pcpLearningModules = pgTable('pcp_learning_modules', {
  id: serial('id').primaryKey(),
  certificationLevelId: integer('certification_level_id').notNull(),
  moduleName: varchar('module_name', { length: 200 }).notNull(),
  moduleCode: varchar('module_code', { length: 50 }).notNull(),
  description: text('description').notNull(),
  learningObjectives: jsonb('learning_objectives'), // Array of learning goals
  content: jsonb('content'), // Module content structure
  resources: jsonb('resources'), // Videos, documents, links
  estimatedHours: integer('estimated_hours'), // Time to complete
  orderIndex: integer('order_index').default(0), // Module sequence
  isRequired: boolean('is_required').default(true),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// PCP Module Progress Tracking
export const pcpModuleProgress = pgTable('pcp_module_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  moduleId: integer('module_id').notNull(),
  applicationId: integer('application_id').notNull(),
  status: varchar('status', { length: 50 }).default('not_started'), // not_started, in_progress, completed, failed
  progressPercentage: integer('progress_percentage').default(0),
  timeSpent: integer('time_spent').default(0), // Minutes spent on module
  attempts: integer('attempts').default(0),
  lastAccessed: timestamp('last_accessed'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// PCP Assessments
export const pcpAssessments = pgTable('pcp_assessments', {
  id: serial('id').primaryKey(),
  moduleId: integer('module_id'),
  certificationLevelId: integer('certification_level_id').notNull(),
  assessmentName: varchar('assessment_name', { length: 200 }).notNull(),
  assessmentType: varchar('assessment_type', { length: 50 }).notNull(), // quiz, practical, video_submission, peer_review
  description: text('description').notNull(),
  instructions: text('instructions').notNull(),
  questions: jsonb('questions'), // Assessment questions/tasks
  passingScore: integer('passing_score').default(80), // Percentage required to pass
  maxAttempts: integer('max_attempts').default(3),
  timeLimit: integer('time_limit'), // Minutes, null for no limit
  isRequired: boolean('is_required').default(true),
  orderIndex: integer('order_index').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// PCP Assessment Submissions
export const pcpAssessmentSubmissions = pgTable('pcp_assessment_submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  assessmentId: integer('assessment_id').notNull(),
  applicationId: integer('application_id').notNull(),
  responses: jsonb('responses'), // User's answers/submissions
  score: integer('score'), // Percentage score
  status: varchar('status', { length: 50 }).default('submitted'), // submitted, graded, passed, failed
  feedback: text('feedback'), // Instructor feedback
  gradedBy: integer('graded_by'),
  gradedAt: timestamp('graded_at'),
  attemptNumber: integer('attempt_number').default(1),
  timeSpent: integer('time_spent'), // Minutes spent on assessment
  submittedAt: timestamp('submitted_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// PCP Practical Training Requirements
export const pcpPracticalRequirements = pgTable('pcp_practical_requirements', {
  id: serial('id').primaryKey(),
  certificationLevelId: integer('certification_level_id').notNull(),
  requirementName: varchar('requirement_name', { length: 200 }).notNull(),
  description: text('description').notNull(),
  requiredHours: integer('required_hours'), // Training hours needed
  requirementType: varchar('requirement_type', { length: 50 }).notNull(), // coaching_hours, observation_hours, mentorship
  verificationMethod: varchar('verification_method', { length: 50 }).notNull(), // self_reported, mentor_verified, admin_verified
  isRequired: boolean('is_required').default(true),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// PCP Practical Submissions
export const pcpPracticalSubmissions = pgTable('pcp_practical_submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  requirementId: integer('requirement_id').notNull(),
  applicationId: integer('application_id').notNull(),
  hoursCompleted: integer('hours_completed').default(0),
  description: text('description'), // What they did
  evidence: jsonb('evidence'), // Photos, videos, documents
  verifiedBy: integer('verified_by'),
  verificationStatus: varchar('verification_status', { length: 50 }).default('pending'), // pending, approved, rejected
  verificationNotes: text('verification_notes'),
  verifiedAt: timestamp('verified_at'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// PCP Certifications Issued
export const pcpCertificationsIssued = pgTable('pcp_certifications_issued', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  certificationLevelId: integer('certification_level_id').notNull(),
  applicationId: integer('application_id').notNull(),
  certificateNumber: varchar('certificate_number', { length: 100 }).notNull().unique(),
  issuedAt: timestamp('issued_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // Some certifications may expire
  status: varchar('status', { length: 50 }).default('active'), // active, suspended, revoked, expired
  digitalCertificateUrl: varchar('digital_certificate_url', { length: 500 }),
  issuedBy: integer('issued_by').notNull(), // Admin who issued
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// PCP Mentorship Assignments
export const pcpMentorships = pgTable('pcp_mentorships', {
  id: serial('id').primaryKey(),
  menteeId: integer('mentee_id').notNull(), // User pursuing certification
  mentorId: integer('mentor_id').notNull(), // Certified coach mentoring
  certificationLevelId: integer('certification_level_id').notNull(),
  applicationId: integer('application_id').notNull(),
  status: varchar('status', { length: 50 }).default('active'), // active, completed, cancelled
  startDate: timestamp('start_date').defaultNow(),
  endDate: timestamp('end_date'),
  meetingSchedule: jsonb('meeting_schedule'), // How often they meet
  goals: text('goals'), // Mentorship objectives
  progress: jsonb('progress'), // Progress tracking
  feedback: text('feedback'), // Mentor feedback
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relations
export const pcpCertificationRelations = relations(pcpCertificationLevels, ({ hasMany }) => ({
  applications: hasMany(pcpCertificationApplications),
  modules: hasMany(pcpLearningModules),
  assessments: hasMany(pcpAssessments),
  practicalRequirements: hasMany(pcpPracticalRequirements),
  certifications: hasMany(pcpCertificationsIssued)
}));

export const pcpApplicationRelations = relations(pcpCertificationApplications, ({ one, hasMany }) => ({
  certificationLevel: one(pcpCertificationLevels, {
    fields: [pcpCertificationApplications.certificationLevelId],
    references: [pcpCertificationLevels.id]
  }),
  moduleProgress: hasMany(pcpModuleProgress),
  assessmentSubmissions: hasMany(pcpAssessmentSubmissions),
  practicalSubmissions: hasMany(pcpPracticalSubmissions),
  mentorship: hasMany(pcpMentorships)
}));

// Zod schemas
export const insertPcpCertificationLevelSchema = createInsertSchema(pcpCertificationLevels);
export const insertPcpCertificationApplicationSchema = createInsertSchema(pcpCertificationApplications);
export const insertPcpLearningModuleSchema = createInsertSchema(pcpLearningModules);
export const insertPcpModuleProgressSchema = createInsertSchema(pcpModuleProgress);
export const insertPcpAssessmentSchema = createInsertSchema(pcpAssessments);
export const insertPcpAssessmentSubmissionSchema = createInsertSchema(pcpAssessmentSubmissions);
export const insertPcpPracticalRequirementSchema = createInsertSchema(pcpPracticalRequirements);
export const insertPcpPracticalSubmissionSchema = createInsertSchema(pcpPracticalSubmissions);
export const insertPcpCertificationIssuedSchema = createInsertSchema(pcpCertificationsIssued);
export const insertPcpMentorshipSchema = createInsertSchema(pcpMentorships);

// Types
export type PcpCertificationLevel = typeof pcpCertificationLevels.$inferSelect;
export type InsertPcpCertificationLevel = typeof pcpCertificationLevels.$inferInsert;
export type PcpCertificationApplication = typeof pcpCertificationApplications.$inferSelect;
export type InsertPcpCertificationApplication = typeof pcpCertificationApplications.$inferInsert;
export type PcpLearningModule = typeof pcpLearningModules.$inferSelect;
export type InsertPcpLearningModule = typeof pcpLearningModules.$inferInsert;
export type PcpModuleProgress = typeof pcpModuleProgress.$inferSelect;
export type InsertPcpModuleProgress = typeof pcpModuleProgress.$inferInsert;
export type PcpAssessment = typeof pcpAssessments.$inferSelect;
export type InsertPcpAssessment = typeof pcpAssessments.$inferInsert;
export type PcpAssessmentSubmission = typeof pcpAssessmentSubmissions.$inferSelect;
export type InsertPcpAssessmentSubmission = typeof pcpAssessmentSubmissions.$inferInsert;
export type PcpPracticalRequirement = typeof pcpPracticalRequirements.$inferSelect;
export type InsertPcpPracticalRequirement = typeof pcpPracticalRequirements.$inferInsert;
export type PcpPracticalSubmission = typeof pcpPracticalSubmissions.$inferSelect;
export type InsertPcpPracticalSubmission = typeof pcpPracticalSubmissions.$inferInsert;
export type PcpCertificationIssued = typeof pcpCertificationsIssued.$inferSelect;
export type InsertPcpCertificationIssued = typeof pcpCertificationsIssued.$inferInsert;
export type PcpMentorship = typeof pcpMentorships.$inferSelect;
export type InsertPcpMentorship = typeof pcpMentorships.$inferInsert;