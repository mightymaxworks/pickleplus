// Coach Management System Schema
// PKL-278651-COACH-001 - Comprehensive Coach Application and Management System

import { pgTable, serial, integer, varchar, text, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coach Applications Table
export const coachApplications = pgTable("coach_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coachType: varchar("coach_type", { length: 50 }).notNull(), // 'independent', 'facility', 'guest', 'volunteer'
  applicationStatus: varchar("application_status", { length: 50 }).notNull().default('pending'), // 'pending', 'under_review', 'approved', 'rejected'
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewerId: integer("reviewer_id"),
  rejectionReason: text("rejection_reason"),
  
  // Application Details
  experienceYears: integer("experience_years").notNull(),
  teachingPhilosophy: text("teaching_philosophy").notNull(),
  specializations: jsonb("specializations").notNull().default('[]'), // ['singles', 'doubles', 'beginners', 'advanced']
  availabilityData: jsonb("availability_data").notNull().default('{}'), // weekly schedule preferences
  previousExperience: text("previous_experience"),
  references: jsonb("references").default('[]'), // contact information for references
  
  // Legal and Compliance
  backgroundCheckConsent: boolean("background_check_consent").notNull().default(false),
  insuranceDetails: jsonb("insurance_details").default('{}'),
  emergencyContact: jsonb("emergency_contact").default('{}'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Certifications Table
export const coachCertifications = pgTable("coach_certifications", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  certificationType: varchar("certification_type", { length: 100 }).notNull(), // 'PTR', 'USAPA', 'IPF', 'custom'
  issuingOrganization: varchar("issuing_organization", { length: 200 }).notNull(),
  certificationNumber: varchar("certification_number", { length: 100 }),
  issuedDate: timestamp("issued_date"),
  expirationDate: timestamp("expiration_date"),
  documentUrl: varchar("document_url", { length: 500 }),
  verificationStatus: varchar("verification_status", { length: 50 }).notNull().default('pending'), // 'pending', 'verified', 'rejected', 'expired'
  verifiedBy: integer("verified_by"),
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Profiles Table (Active Coaches)
export const coachProfiles = pgTable("coach_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  coachType: varchar("coach_type", { length: 50 }).notNull(),
  verificationLevel: varchar("verification_level", { length: 50 }).notNull().default('basic'), // 'basic', 'certified', 'premium', 'master'
  isActive: boolean("is_active").notNull().default(true),
  
  // Profile Information
  bio: text("bio"),
  specializations: jsonb("specializations").notNull().default('[]'),
  teachingStyle: varchar("teaching_style", { length: 100 }), // 'technical', 'motivational', 'analytical', 'fun-focused'
  languagesSpoken: jsonb("languages_spoken").default('["English"]'),
  
  // Pricing and Availability
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  sessionTypes: jsonb("session_types").default('[]'), // ['private', 'group', 'clinic']
  availabilitySchedule: jsonb("availability_schedule").default('{}'),
  
  // Performance Metrics
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer("total_reviews").notNull().default(0),
  totalSessions: integer("total_sessions").notNull().default(0),
  studentRetentionRate: decimal("student_retention_rate", { precision: 5, scale: 2 }).default('0'),
  
  // Administrative
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Payments Table
export const coachPayments = pgTable("coach_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  applicationId: integer("application_id"),
  paymentType: varchar("payment_type", { length: 50 }).notNull(), // 'application_fee', 'monthly_fee', 'commission'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default('USD'),
  stripePaymentId: varchar("stripe_payment_id", { length: 200 }),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull(), // 'pending', 'completed', 'failed', 'refunded'
  paymentMethod: varchar("payment_method", { length: 50 }), // 'card', 'bank_transfer'
  
  processedAt: timestamp("processed_at"),
  refundedAt: timestamp("refunded_at"),
  refundReason: text("refund_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Facility Assignments Table
export const coachFacilityAssignments = pgTable("coach_facility_assignments", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  facilityId: integer("facility_id").notNull(),
  assignedBy: integer("assigned_by").notNull(),
  role: varchar("role", { length: 100 }).notNull().default('instructor'), // 'instructor', 'head_coach', 'assistant', 'specialist'
  permissions: jsonb("permissions").default('[]'), // ['schedule_classes', 'manage_students', 'access_reports']
  isActive: boolean("is_active").notNull().default(true),
  
  assignedAt: timestamp("assigned_at").defaultNow(),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: integer("deactivated_by"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Reviews Table
export const coachReviews = pgTable("coach_reviews", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  sessionId: integer("session_id"),
  
  // Ratings (1-5 scale)
  overallRating: integer("overall_rating").notNull(),
  teachingRating: integer("teaching_rating").notNull(),
  communicationRating: integer("communication_rating").notNull(),
  valueRating: integer("value_rating").notNull(),
  
  // Review Content
  writtenFeedback: text("written_feedback"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  
  // Coach Response
  coachResponse: text("coach_response"),
  responseDate: timestamp("response_date"),
  
  // Moderation
  isFlagged: boolean("is_flagged").notNull().default(false),
  moderatedBy: integer("moderated_by"),
  moderatedAt: timestamp("moderated_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coaching Sessions Table
export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  facilityId: integer("facility_id"),
  
  sessionDate: timestamp("session_date").notNull(),
  duration: integer("duration").notNull(), // minutes
  sessionType: varchar("session_type", { length: 50 }).notNull(), // 'private', 'group', 'clinic'
  sessionStatus: varchar("session_status", { length: 50 }).notNull().default('scheduled'), // 'scheduled', 'completed', 'cancelled', 'no_show'
  
  // Pricing
  agreedRate: decimal("agreed_rate", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  paymentStatus: varchar("payment_status", { length: 50 }).default('pending'),
  
  // Session Notes
  coachNotes: text("coach_notes"),
  studentNotes: text("student_notes"),
  skillsWorkedOn: jsonb("skills_worked_on").default('[]'),
  homeworkAssigned: text("homework_assigned"),
  
  // Review Status
  reviewSubmitted: boolean("review_submitted").notNull().default(false),
  reviewReminderSent: boolean("review_reminder_sent").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const coachApplicationsRelations = relations(coachApplications, ({ many, one }) => ({
  certifications: many(coachCertifications),
  payments: many(coachPayments)
}));

export const coachCertificationsRelations = relations(coachCertifications, ({ one }) => ({
  application: one(coachApplications, {
    fields: [coachCertifications.applicationId],
    references: [coachApplications.id]
  })
}));

export const coachProfilesRelations = relations(coachProfiles, ({ many }) => ({
  reviews: many(coachReviews),
  sessions: many(coachingSessions),
  facilityAssignments: many(coachFacilityAssignments)
}));

export const coachReviewsRelations = relations(coachReviews, ({ one }) => ({
  session: one(coachingSessions, {
    fields: [coachReviews.sessionId],
    references: [coachingSessions.id]
  })
}));

export const coachingSessionsRelations = relations(coachingSessions, ({ one, many }) => ({
  reviews: many(coachReviews)
}));

// Zod Schemas
export const insertCoachApplicationSchema = createInsertSchema(coachApplications)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertCoachCertificationSchema = createInsertSchema(coachCertifications)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertCoachProfileSchema = createInsertSchema(coachProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertCoachPaymentSchema = createInsertSchema(coachPayments)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertCoachReviewSchema = createInsertSchema(coachReviews)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertCoachingSessionSchema = createInsertSchema(coachingSessions)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Type Exports
export type CoachApplication = typeof coachApplications.$inferSelect;
export type InsertCoachApplication = z.infer<typeof insertCoachApplicationSchema>;

export type CoachCertification = typeof coachCertifications.$inferSelect;
export type InsertCoachCertification = z.infer<typeof insertCoachCertificationSchema>;

export type CoachProfile = typeof coachProfiles.$inferSelect;
export type InsertCoachProfile = z.infer<typeof insertCoachProfileSchema>;

export type CoachPayment = typeof coachPayments.$inferSelect;
export type InsertCoachPayment = z.infer<typeof insertCoachPaymentSchema>;

export type CoachReview = typeof coachReviews.$inferSelect;
export type InsertCoachReview = z.infer<typeof insertCoachReviewSchema>;

export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;

// Coach Application Status Enum
export const CoachApplicationStatus = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export type CoachApplicationStatusType = typeof CoachApplicationStatus[keyof typeof CoachApplicationStatus];

// Coach Type Enum
export const CoachType = {
  INDEPENDENT: 'independent',
  FACILITY: 'facility',
  GUEST: 'guest',
  VOLUNTEER: 'volunteer'
} as const;

export type CoachTypeType = typeof CoachType[keyof typeof CoachType];

// Verification Level Enum
export const VerificationLevel = {
  BASIC: 'basic',
  CERTIFIED: 'certified',
  PREMIUM: 'premium',
  MASTER: 'master'
} as const;

export type VerificationLevelType = typeof VerificationLevel[keyof typeof VerificationLevel];