/**
 * Admin Approval Workflow Schema
 * Phase 1 Sprint 1.2: Certification Review and Approval System
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin Users - System administrators who can review certifications
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // Reference to main users table
  
  // Admin permissions and roles
  role: varchar("role", { length: 50 }).notNull().default("reviewer"), 
  // reviewer, senior_reviewer, certification_manager, system_admin
  
  permissions: text("permissions").notNull(), // JSON array of permission strings
  
  // Specializations for targeted reviews
  certificationLevels: text("certification_levels"), // JSON array [1,2,3,4,5]
  specializations: text("specializations"), // JSON array of expertise areas
  
  // Activity tracking
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at"),
  
  // Performance metrics
  totalReviews: integer("total_reviews").default(0),
  averageReviewTime: integer("average_review_time_hours").default(0),
  approvalRate: decimal("approval_rate", { precision: 5, scale: 2 }).default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Types - Define required documents for each certification level
export const documentTypes = pgTable("document_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  
  // Applicability
  pcpLevels: text("pcp_levels").notNull(), // JSON array of applicable levels
  isRequired: boolean("is_required").default(true),
  
  // Validation requirements
  acceptedFormats: text("accepted_formats"), // JSON array: ["pdf", "jpg", "png"]
  maxFileSize: integer("max_file_size_mb").default(10),
  validationRules: text("validation_rules"), // JSON object with validation criteria
  
  // Processing
  reviewOrder: integer("review_order").default(0), // Order of review
  averageReviewTime: integer("average_review_time_minutes").default(30),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Submissions - Files submitted by applicants
export const documentSubmissions = pgTable("document_submissions", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(), // Reference to certification_applications
  documentTypeId: integer("document_type_id").notNull(),
  
  // File information
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size_bytes").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  
  // Submission details
  submittedAt: timestamp("submitted_at").defaultNow(),
  submittedBy: integer("submitted_by").notNull(), // User ID
  
  // Review status
  reviewStatus: varchar("review_status", { length: 30 }).default("pending"),
  // pending, under_review, approved, rejected, requires_resubmission
  
  reviewedBy: integer("reviewed_by"), // Admin user ID
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Version control
  version: integer("version").default(1),
  previousVersionId: integer("previous_version_id"), // For resubmissions
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Review Tasks - Individual review items for applications
export const reviewTasks = pgTable("review_tasks", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  
  // Task details
  taskType: varchar("task_type", { length: 50 }).notNull(),
  // document_review, module_verification, practical_assessment, final_approval
  
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  
  // Assignment and status
  assignedTo: integer("assigned_to"), // Admin user ID
  assignedAt: timestamp("assigned_at"),
  status: varchar("status", { length: 30 }).default("pending"),
  // pending, in_progress, completed, requires_clarification, escalated
  
  // Dependencies and order
  dependsOn: text("depends_on"), // JSON array of task IDs that must be completed first
  reviewOrder: integer("review_order").default(0),
  
  // Time tracking
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 2 }).default(1),
  actualHours: decimal("actual_hours", { precision: 4, scale: 2 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  
  // Results
  outcome: varchar("outcome", { length: 30 }), // approved, rejected, needs_revision
  feedback: text("feedback"),
  actionItems: text("action_items"), // JSON array of required actions
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Review Comments - Communication thread for reviews
export const reviewComments = pgTable("review_comments", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  taskId: integer("task_id"), // Optional - specific to a task
  
  // Comment details
  authorId: integer("author_id").notNull(), // User ID (admin or applicant)
  authorType: varchar("author_type", { length: 20 }).notNull(), // admin, applicant
  
  comment: text("comment").notNull(),
  commentType: varchar("comment_type", { length: 30 }).default("general"),
  // general, question, clarification, feedback, approval, rejection
  
  // Visibility and notifications
  isPublic: boolean("is_public").default(true), // Visible to applicant
  isInternal: boolean("is_internal").default(false), // Admin-only notes
  
  // References
  referencedDocumentId: integer("referenced_document_id"), // Specific document
  referencedTaskId: integer("referenced_task_id"), // Specific task
  
  // Status tracking
  requiresResponse: boolean("requires_response").default(false),
  respondedAt: timestamp("responded_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Approval Workflows - Define review processes for different certification levels
export const approvalWorkflows = pgTable("approval_workflows", {
  id: serial("id").primaryKey(),
  pcpLevel: integer("pcp_level").notNull(),
  
  // Workflow configuration
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 20 }).default("1.0"),
  
  // Process definition
  requiredDocuments: text("required_documents").notNull(), // JSON array of document type IDs
  reviewSteps: text("review_steps").notNull(), // JSON array of step definitions
  
  // Timing and SLA
  targetReviewTime: integer("target_review_time_hours").default(72), // 3 business days
  escalationTime: integer("escalation_time_hours").default(120), // 5 business days
  
  // Approval criteria
  minimumScore: decimal("minimum_score", { precision: 5, scale: 2 }).default(80),
  requiredApprovals: integer("required_approvals").default(1), // Number of approvers needed
  
  // Auto-approval rules
  autoApprovalEnabled: boolean("auto_approval_enabled").default(false),
  autoApprovalCriteria: text("auto_approval_criteria"), // JSON criteria for auto-approval
  
  isActive: boolean("is_active").default(true),
  effectiveDate: timestamp("effective_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Certification Decisions - Final approval/rejection records
export const certificationDecisions = pgTable("certification_decisions", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().unique(),
  
  // Decision details
  decision: varchar("decision", { length: 30 }).notNull(),
  // approved, rejected, conditional_approval, requires_resubmission
  
  decisionDate: timestamp("decision_date").defaultNow(),
  decidedBy: integer("decided_by").notNull(), // Admin user ID
  
  // Scoring and evaluation
  finalScore: decimal("final_score", { precision: 5, scale: 2 }),
  passThreshold: decimal("pass_threshold", { precision: 5, scale: 2 }),
  
  // Feedback and requirements
  publicFeedback: text("public_feedback"), // Sent to applicant
  internalNotes: text("internal_notes"), // Admin-only notes
  
  // Conditional approval details
  conditions: text("conditions"), // JSON array of conditions to meet
  conditionsDueDate: timestamp("conditions_due_date"),
  
  // Certificate generation
  certificateGenerated: boolean("certificate_generated").default(false),
  certificateNumber: varchar("certificate_number", { length: 50 }),
  certificateValidUntil: timestamp("certificate_valid_until"),
  
  // Appeals process
  appealable: boolean("appealable").default(true),
  appealDeadline: timestamp("appeal_deadline"),
  appealSubmitted: boolean("appeal_submitted").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const documentSubmissionsRelations = relations(documentSubmissions, ({ one }) => ({
  documentType: one(documentTypes, {
    fields: [documentSubmissions.documentTypeId],
    references: [documentTypes.id],
  }),
}));

export const reviewTasksRelations = relations(reviewTasks, ({ one, many }) => ({
  assignedAdmin: one(adminUsers, {
    fields: [reviewTasks.assignedTo],
    references: [adminUsers.id],
  }),
  comments: many(reviewComments),
}));

export const reviewCommentsRelations = relations(reviewComments, ({ one }) => ({
  task: one(reviewTasks, {
    fields: [reviewComments.taskId],
    references: [reviewTasks.id],
  }),
  referencedDocument: one(documentSubmissions, {
    fields: [reviewComments.referencedDocumentId],
    references: [documentSubmissions.id],
  }),
}));

// Zod Schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentTypeSchema = createInsertSchema(documentTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSubmissionSchema = createInsertSchema(documentSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewTaskSchema = createInsertSchema(reviewTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewCommentSchema = createInsertSchema(reviewComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApprovalWorkflowSchema = createInsertSchema(approvalWorkflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificationDecisionSchema = createInsertSchema(certificationDecisions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript Types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;

export type DocumentSubmission = typeof documentSubmissions.$inferSelect;
export type InsertDocumentSubmission = z.infer<typeof insertDocumentSubmissionSchema>;

export type ReviewTask = typeof reviewTasks.$inferSelect;
export type InsertReviewTask = z.infer<typeof insertReviewTaskSchema>;

export type ReviewComment = typeof reviewComments.$inferSelect;
export type InsertReviewComment = z.infer<typeof insertReviewCommentSchema>;

export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect;
export type InsertApprovalWorkflow = z.infer<typeof insertApprovalWorkflowSchema>;

export type CertificationDecision = typeof certificationDecisions.$inferSelect;
export type InsertCertificationDecision = z.infer<typeof insertCertificationDecisionSchema>;

// Utility types for complex operations
export type ReviewTaskWithAdmin = ReviewTask & {
  assignedAdmin?: AdminUser;
  comments?: ReviewComment[];
};

export type ApplicationReview = {
  applicationId: number;
  applicantName: string;
  pcpLevel: number;
  status: string;
  submittedDate: Date;
  assignedReviewer?: string;
  estimatedCompletionDate?: Date;
  documents: DocumentSubmission[];
  tasks: ReviewTaskWithAdmin[];
  comments: ReviewComment[];
};

export type AdminDashboard = {
  pendingReviews: number;
  inProgressReviews: number;
  completedToday: number;
  averageReviewTime: number;
  upcomingDeadlines: ReviewTask[];
  recentActivity: ReviewComment[];
};