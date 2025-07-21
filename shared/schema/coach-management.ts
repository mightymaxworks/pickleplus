import { pgTable, integer, varchar, text, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coach Applications Table
export const coachApplications = pgTable("coach_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coachType: varchar("coach_type", { length: 50 }).default("facility"),
  applicationStatus: varchar("application_status", { length: 50 }).default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewerId: integer("reviewer_id"),
  rejectionReason: text("rejection_reason"),
  experienceYears: integer("experience_years").notNull(),
  teachingPhilosophy: text("teaching_philosophy").notNull(),
  specializations: jsonb("specializations").notNull(), // Array of strings
  availabilityData: jsonb("availability_data").notNull(), // Object with schedule data
  previousExperience: text("previous_experience"),
  refContacts: jsonb("ref_contacts").default([]), // Array of contact objects
  backgroundCheckConsent: boolean("background_check_consent").notNull(),
  insuranceDetails: jsonb("insurance_details").default({}),
  emergencyContact: jsonb("emergency_contact").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Profiles Table
export const coachProfiles = pgTable("coach_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coachType: varchar("coach_type", { length: 50 }).notNull(),
  verificationLevel: varchar("verification_level", { length: 50 }).default("pending"),
  isActive: boolean("is_active").default(true),
  bio: text("bio"),
  specializations: jsonb("specializations").notNull(), // Array of strings
  teachingStyle: text("teaching_style"),
  languagesSpoken: jsonb("languages_spoken").default(["English"]), // Array of strings
  hourlyRate: integer("hourly_rate"), // In cents
  sessionTypes: jsonb("session_types").default(["individual"]), // Array of strings
  availabilitySchedule: jsonb("availability_schedule").default({}),
  averageRating: integer("average_rating").default(0), // Out of 100
  totalReviews: integer("total_reviews").default(0),
  totalSessions: integer("total_sessions").default(0),
  studentRetentionRate: integer("student_retention_rate").default(0), // Percentage
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by"),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Certifications Table
export const coachCertifications = pgTable("coach_certifications", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  certificationType: varchar("certification_type", { length: 100 }).notNull(),
  issuingOrganization: varchar("issuing_organization", { length: 200 }).notNull(),
  certificationNumber: varchar("certification_number", { length: 100 }),
  issuedDate: timestamp("issued_date"),
  expirationDate: timestamp("expiration_date"),
  documentUrl: text("document_url"),
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending"),
  verifiedBy: integer("verified_by"),
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Reviews Table
export const coachReviews = pgTable("coach_reviews", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  sessionId: integer("session_id"),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  technicalRating: integer("technical_rating"), // 1-5
  communicationRating: integer("communication_rating"), // 1-5
  punctualityRating: integer("punctuality_rating"), // 1-5
  overallSatisfaction: integer("overall_satisfaction"), // 1-5
  wouldRecommend: boolean("would_recommend"),
  tags: jsonb("tags").default([]), // Array of review tags
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Zod schemas for validation
export const insertCoachApplicationSchema = createInsertSchema(coachApplications).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  reviewerId: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true
});

export const insertCoachProfileSchema = createInsertSchema(coachProfiles).omit({
  id: true,
  averageRating: true,
  totalReviews: true,
  totalSessions: true,
  studentRetentionRate: true,
  approvedAt: true,
  approvedBy: true,
  lastActiveAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertCoachCertificationSchema = createInsertSchema(coachCertifications).omit({
  id: true,
  verificationStatus: true,
  verifiedBy: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertCoachReviewSchema = createInsertSchema(coachReviews).omit({
  id: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true
});

// TypeScript types
export type CoachApplication = typeof coachApplications.$inferSelect;
export type InsertCoachApplication = z.infer<typeof insertCoachApplicationSchema>;

export type CoachProfile = typeof coachProfiles.$inferSelect;
export type InsertCoachProfile = z.infer<typeof insertCoachProfileSchema>;

export type CoachCertification = typeof coachCertifications.$inferSelect;
export type InsertCoachCertification = z.infer<typeof insertCoachCertificationSchema>;

export type CoachReview = typeof coachReviews.$inferSelect;
export type InsertCoachReview = z.infer<typeof insertCoachReviewSchema>;

// Coach status enums
export const COACH_APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under_review'
} as const;

export const COACH_VERIFICATION_LEVEL = {
  PENDING: 'pending',
  BASIC: 'basic',
  VERIFIED: 'verified',
  ELITE: 'elite'
} as const;

export const CERTIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  EXPIRED: 'expired',
  REJECTED: 'rejected'
} as const;

// Coach Sessions Table
export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  sessionType: varchar("session_type", { length: 50 }).default("individual"),
  sessionStatus: varchar("session_status", { length: 50 }).default("scheduled"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(60),
  locationType: varchar("location_type", { length: 50 }),
  locationDetails: text("location_details"),
  priceAmount: integer("price_amount"), // In cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  sessionNotes: text("session_notes"),
  feedbackForStudent: text("feedback_for_student"),
  studentGoals: jsonb("student_goals").default([]),
  sessionSummary: text("session_summary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Payments Table
export const coachPayments = pgTable("coach_payments", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  sessionId: integer("session_id"),
  paymentType: varchar("payment_type", { length: 50 }).notNull(),
  amount: integer("amount").notNull(), // In cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 100 }),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Facility Assignments Table
export const coachFacilityAssignments = pgTable("coach_facility_assignments", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  facilityId: integer("facility_id").notNull(),
  assignmentStatus: varchar("assignment_status", { length: 50 }).default("active"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  maxStudentsPerSession: integer("max_students_per_session").default(8),
  hourlyRate: integer("hourly_rate"), // In cents
  commissionRate: integer("commission_rate").default(15), // Percentage
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Additional Zod schemas for new tables
export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCoachPaymentSchema = createInsertSchema(coachPayments).omit({
  id: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertCoachFacilityAssignmentSchema = createInsertSchema(coachFacilityAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Additional TypeScript types
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;

export type CoachPayment = typeof coachPayments.$inferSelect;
export type InsertCoachPayment = z.infer<typeof insertCoachPaymentSchema>;

export type CoachFacilityAssignment = typeof coachFacilityAssignments.$inferSelect;
export type InsertCoachFacilityAssignment = z.infer<typeof insertCoachFacilityAssignmentSchema>;

// Relations (for Drizzle ORM)
import { relations } from "drizzle-orm";

export const coachApplicationsRelations = relations(coachApplications, ({ one, many }) => ({
  certifications: many(coachCertifications),
  profile: one(coachProfiles, {
    fields: [coachApplications.userId],
    references: [coachProfiles.userId]
  })
}));

export const coachCertificationsRelations = relations(coachCertifications, ({ one }) => ({
  application: one(coachApplications, {
    fields: [coachCertifications.applicationId],
    references: [coachApplications.id]
  })
}));

export const coachProfilesRelations = relations(coachProfiles, ({ one, many }) => ({
  application: one(coachApplications, {
    fields: [coachProfiles.userId],
    references: [coachApplications.userId]
  }),
  reviews: many(coachReviews),
  sessions: many(coachingSessions),
  payments: many(coachPayments),
  facilityAssignments: many(coachFacilityAssignments)
}));

export const coachReviewsRelations = relations(coachReviews, ({ one }) => ({
  coach: one(coachProfiles, {
    fields: [coachReviews.coachId],
    references: [coachProfiles.id]
  }),
  session: one(coachingSessions, {
    fields: [coachReviews.sessionId],
    references: [coachingSessions.id]
  })
}));

export const coachingSessionsRelations = relations(coachingSessions, ({ one, many }) => ({
  coach: one(coachProfiles, {
    fields: [coachingSessions.coachId],
    references: [coachProfiles.id]
  }),
  reviews: many(coachReviews),
  payments: many(coachPayments)
}));

// Coach type enums for validation
export const CoachApplicationStatus = z.enum(['pending', 'approved', 'rejected', 'under_review']);
export const CoachType = z.enum(['facility', 'independent', 'traveling']);
export const VerificationLevel = z.enum(['pending', 'basic', 'verified', 'elite']);

export type CoachApplicationStatusType = z.infer<typeof CoachApplicationStatus>;
export type CoachTypeType = z.infer<typeof CoachType>;
export type VerificationLevelType = z.infer<typeof VerificationLevel>;