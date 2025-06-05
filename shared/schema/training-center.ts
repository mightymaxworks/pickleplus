/**
 * PKL-278651-TRAINING-CENTER-001 - Training Center Management System
 * Database schema for comprehensive player development platform
 * 
 * @framework Framework5.3
 * @sprint Sprint 1: Foundation Infrastructure
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

// Training Centers - Physical locations where coaching occurs
export const trainingCenters = pgTable("training_centers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 50 }).notNull(),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }).notNull().default("Singapore"),
  postalCode: varchar("postal_code", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  email: varchar("email", { length: 100 }),
  website: varchar("website", { length: 200 }),
  operatingHours: json("operating_hours").$type<{
    monday: { open: string; close: string; closed?: boolean };
    tuesday: { open: string; close: string; closed?: boolean };
    wednesday: { open: string; close: string; closed?: boolean };
    thursday: { open: string; close: string; closed?: boolean };
    friday: { open: string; close: string; closed?: boolean };
    saturday: { open: string; close: string; closed?: boolean };
    sunday: { open: string; close: string; closed?: boolean };
  }>(),
  courtCount: integer("court_count").default(4),
  courtSurface: varchar("court_surface", { length: 50 }).default("outdoor"),
  amenities: json("amenities").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  qrCode: varchar("qr_code", { length: 50 }).unique(),
  managerUserId: integer("manager_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Training Center Coaches - Coaches assigned to specific centers
export const trainingCenterCoaches = pgTable("training_center_coaches", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").notNull().references(() => trainingCenters.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  specializations: json("specializations").$type<string[]>(),
  availableHours: json("available_hours").$type<{
    monday: { start: string; end: string; available?: boolean };
    tuesday: { start: string; end: string; available?: boolean };
    wednesday: { start: string; end: string; available?: boolean };
    thursday: { start: string; end: string; available?: boolean };
    friday: { start: string; end: string; available?: boolean };
    saturday: { start: string; end: string; available?: boolean };
    sunday: { start: string; end: string; available?: boolean };
  }>(),
  hourlyRate: decimal("hourly_rate", { precision: 6, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Certifications - Track coach qualifications
export const coachCertifications = pgTable("coach_certifications", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => users.id),
  certificationType: varchar("certification_type", { length: 100 }).notNull(),
  issuingOrganization: varchar("issuing_organization", { length: 100 }).notNull(),
  issueDate: timestamp("issue_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  certificationNumber: varchar("certification_number", { length: 100 }),
  isActive: boolean("is_active").default(true),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Coaching Sessions - Individual training sessions
export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  centerId: integer("center_id").notNull().references(() => trainingCenters.id),
  sessionType: varchar("session_type", { length: 50 }).notNull().default("individual"), // individual, group, assessment
  checkInTime: timestamp("check_in_time").notNull(),
  checkOutTime: timestamp("check_out_time"),
  plannedDuration: integer("planned_duration").default(60), // minutes
  actualDuration: integer("actual_duration"), // minutes
  courtNumber: integer("court_number"),
  sessionNotes: text("session_notes"),
  playerGoals: text("player_goals"),
  coachObservations: text("coach_observations"),
  skillsFocused: json("skills_focused").$type<string[]>(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Challenges - Skill assessment tasks
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // serving, groundstrokes, net_play, strategy, movement
  skillLevel: varchar("skill_level", { length: 10 }).notNull(), // beginner, intermediate, advanced, expert
  difficultyRating: decimal("difficulty_rating", { precision: 3, scale: 1 }).notNull(), // 1.0-5.0
  estimatedDuration: integer("estimated_duration").notNull(), // minutes
  instructions: text("instructions").notNull(),
  coachingTips: text("coaching_tips"),
  equipmentNeeded: json("equipment_needed").$type<string[]>(),
  successCriteria: text("success_criteria").notNull(),
  assessmentMethod: varchar("assessment_method", { length: 50 }).notNull(), // count, percentage, time, subjective
  targetMetric: json("target_metric").$type<{
    type: string; // attempts, successes, time, score
    target: number;
    unit: string;
  }>(),
  prerequisiteChallenges: json("prerequisite_challenges").$type<number[]>(),
  badgeReward: varchar("badge_reward", { length: 100 }),
  ratingImpact: decimal("rating_impact", { precision: 3, scale: 2 }).default("0.1"), // potential rating increase
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").notNull().references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Challenge Completions - Track player progress
export const challengeCompletions = pgTable("challenge_completions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => coachingSessions.id),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  attemptNumber: integer("attempt_number").default(1),
  isCompleted: boolean("is_completed").notNull(),
  actualResult: json("actual_result").$type<{
    metric: string;
    value: number;
    unit: string;
    notes?: string;
  }>(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // percentage
  timeSpent: integer("time_spent"), // minutes
  coachNotes: text("coach_notes"),
  playerFeedback: text("player_feedback"),
  improvementAreas: json("improvement_areas").$type<string[]>(),
  nextRecommendations: text("next_recommendations"),
  mediaUrls: json("media_urls").$type<string[]>(), // photos/videos
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Session Notes - Detailed coaching observations
export const sessionNotes = pgTable("session_notes", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => coachingSessions.id),
  noteType: varchar("note_type", { length: 50 }).notNull(), // observation, instruction, feedback, goal
  content: text("content").notNull(),
  skillArea: varchar("skill_area", { length: 50 }), // serving, forehand, backhand, volley, etc.
  timestamp: timestamp("timestamp").notNull(),
  isPrivate: boolean("is_private").default(false), // coach-only notes
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Class Templates - Recurring class schedules with enhanced details
export const classTemplates = pgTable("class_templates", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").notNull().references(() => trainingCenters.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  detailedDescription: text("detailed_description"), // Rich text with full class information
  category: varchar("category", { length: 50 }).notNull(), // fundamentals, advanced, power, strategy
  skillLevel: varchar("skill_level", { length: 20 }).notNull(), // beginner, intermediate, advanced
  intensityLevel: varchar("intensity_level", { length: 20 }).default("moderate"), // light, moderate, high, intense
  classFormat: varchar("class_format", { length: 20 }).default("group"), // individual, group, team
  maxParticipants: integer("max_participants").default(8),
  minEnrollment: integer("min_enrollment").default(1), // Minimum required for class to proceed
  optimalCapacity: integer("optimal_capacity").default(6), // Target enrollment for best experience
  duration: integer("duration").default(60), // minutes
  pricePerSession: decimal("price_per_session", { precision: 6, scale: 2 }),
  goals: json("goals").$type<string[]>(),
  prerequisites: json("prerequisites").$type<string[]>(), // Required skills or prior classes
  equipmentRequired: json("equipment_required").$type<string[]>(), // Equipment students must bring
  equipmentProvided: json("equipment_provided").$type<string[]>(), // Equipment facility provides
  skillsFocused: json("skills_focused").$type<string[]>(), // Primary skills covered
  teachingMethods: json("teaching_methods").$type<string[]>(), // Drilling, games, theory, etc.
  cancellationPolicy: text("cancellation_policy"), // Class cancellation rules
  makeupPolicy: text("makeup_policy"), // Make-up class policies
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: varchar("start_time", { length: 8 }).notNull(), // HH:mm format
  endTime: varchar("end_time", { length: 8 }).notNull(),
  autoCancelHours: integer("auto_cancel_hours").default(24), // Hours before class to auto-cancel if min not met
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Class Instances - Specific occurrences of classes
export const classInstances = pgTable("class_instances", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => classTemplates.id),
  centerId: integer("center_id").notNull().references(() => trainingCenters.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  classDate: timestamp("class_date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxParticipants: integer("max_participants").default(8),
  currentEnrollment: integer("current_enrollment").default(0),
  courtNumber: integer("court_number"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, in_progress, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Class Enrollments - Student bookings for classes
export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  classInstanceId: integer("class_instance_id").notNull().references(() => classInstances.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  enrollmentType: varchar("enrollment_type", { length: 20 }).default("advance"), // advance, walk_in
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  attendanceStatus: varchar("attendance_status", { length: 20 }).default("enrolled"), // enrolled, attended, no_show, cancelled
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"), // pending, paid, refunded
  notes: text("notes"),
  checkedInAt: timestamp("checked_in_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Class Waitlist - Queue management for full classes
export const classWaitlist = pgTable("class_waitlist", {
  id: serial("id").primaryKey(),
  classInstanceId: integer("class_instance_id").notNull().references(() => classInstances.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  position: integer("position").notNull(), // Position in waitlist queue
  joinedAt: timestamp("joined_at").defaultNow(),
  notifiedAt: timestamp("notified_at"), // When spot became available
  expiresAt: timestamp("expires_at"), // When notification expires
  status: varchar("status", { length: 20 }).default("waiting"), // waiting, notified, expired, enrolled, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Enhanced Coach Profiles - Detailed coach information
export const coachProfiles = pgTable("coach_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  professionalBio: text("professional_bio"),
  yearsExperience: integer("years_experience").default(0),
  certifications: json("certifications").$type<string[]>(),
  specializations: json("specializations").$type<string[]>(), // singles, doubles, beginners, advanced, fitness
  teachingStyle: varchar("teaching_style", { length: 50 }), // technical, motivational, analytical, fun
  languages: json("languages").$type<string[]>(),
  hourlyRate: decimal("hourly_rate", { precision: 6, scale: 2 }),
  profileImageUrl: varchar("profile_image_url", { length: 200 }),
  coverImageUrl: varchar("cover_image_url", { length: 200 }),
  personalMotto: varchar("personal_motto", { length: 200 }),
  achievements: json("achievements").$type<string[]>(),
  playingBackground: text("playing_background"), // Competitive history
  coachingPhilosophy: text("coaching_philosophy"),
  availabilityNotes: text("availability_notes"),
  isVerified: boolean("is_verified").default(false),
  verificationLevel: varchar("verification_level", { length: 20 }).default("basic"), // basic, certified, expert
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Reviews - Student feedback and ratings
export const coachReviews = pgTable("coach_reviews", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => users.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => coachingSessions.id),
  classInstanceId: integer("class_instance_id").references(() => classInstances.id),
  overallRating: decimal("overall_rating", { precision: 2, scale: 1 }).notNull(), // 1.0-5.0
  technicalSkillRating: decimal("technical_skill_rating", { precision: 2, scale: 1 }),
  communicationRating: decimal("communication_rating", { precision: 2, scale: 1 }),
  enthusiasmRating: decimal("enthusiasm_rating", { precision: 2, scale: 1 }),
  organizationRating: decimal("organization_rating", { precision: 2, scale: 1 }),
  reviewTitle: varchar("review_title", { length: 100 }),
  reviewText: text("review_text"),
  improvementAreas: json("improvement_areas").$type<string[]>(),
  wouldRecommend: boolean("would_recommend"),
  isVerified: boolean("is_verified").default(false), // Verified attendance
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Digital Badges - Achievement rewards
export const digitalBadges = pgTable("digital_badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  iconUrl: varchar("icon_url", { length: 200 }),
  backgroundColor: varchar("background_color", { length: 7 }).default("#FF6B35"),
  criteria: text("criteria").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Player Badges - Earned achievements
export const playerBadges = pgTable("player_badges", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => digitalBadges.id),
  sessionId: integer("session_id").references(() => coachingSessions.id),
  challengeId: integer("challenge_id").references(() => challenges.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  earnedAt: timestamp("earned_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Rating Progressions - Track skill level changes
export const ratingProgressions = pgTable("rating_progressions", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  previousRating: decimal("previous_rating", { precision: 3, scale: 1 }).notNull(),
  suggestedRating: decimal("suggested_rating", { precision: 3, scale: 1 }).notNull(),
  approvedRating: decimal("approved_rating", { precision: 3, scale: 1 }),
  coachId: integer("coach_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => coachingSessions.id),
  challengesBasis: json("challenges_basis").$type<number[]>(), // challenge IDs that led to suggestion
  justification: text("justification").notNull(),
  coachApproval: boolean("coach_approval"),
  approvalNotes: text("approval_notes"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const trainingCenterRelations = relations(trainingCenters, ({ one, many }) => ({
  manager: one(users, {
    fields: [trainingCenters.managerUserId],
    references: [users.id]
  }),
  sessions: many(coachingSessions)
}));

export const coachCertificationRelations = relations(coachCertifications, ({ one }) => ({
  coach: one(users, {
    fields: [coachCertifications.coachId],
    references: [users.id]
  }),
  verifier: one(users, {
    fields: [coachCertifications.verifiedBy],
    references: [users.id]
  })
}));

export const coachingSessionRelations = relations(coachingSessions, ({ one, many }) => ({
  player: one(users, {
    fields: [coachingSessions.playerId],
    references: [users.id]
  }),
  coach: one(users, {
    fields: [coachingSessions.coachId],
    references: [users.id]
  }),
  center: one(trainingCenters, {
    fields: [coachingSessions.centerId],
    references: [trainingCenters.id]
  }),
  completions: many(challengeCompletions),
  notes: many(sessionNotes)
}));

export const challengeRelations = relations(challenges, ({ one, many }) => ({
  creator: one(users, {
    fields: [challenges.createdBy],
    references: [users.id]
  }),
  approver: one(users, {
    fields: [challenges.approvedBy],
    references: [users.id]
  }),
  completions: many(challengeCompletions)
}));

export const challengeCompletionRelations = relations(challengeCompletions, ({ one }) => ({
  session: one(coachingSessions, {
    fields: [challengeCompletions.sessionId],
    references: [coachingSessions.id]
  }),
  challenge: one(challenges, {
    fields: [challengeCompletions.challengeId],
    references: [challenges.id]
  }),
  player: one(users, {
    fields: [challengeCompletions.playerId],
    references: [users.id]
  }),
  coach: one(users, {
    fields: [challengeCompletions.coachId],
    references: [users.id]
  })
}));

export const sessionNotesRelations = relations(sessionNotes, ({ one }) => ({
  session: one(coachingSessions, {
    fields: [sessionNotes.sessionId],
    references: [coachingSessions.id]
  }),
  author: one(users, {
    fields: [sessionNotes.createdBy],
    references: [users.id]
  })
}));

export const digitalBadgeRelations = relations(digitalBadges, ({ many }) => ({
  playerBadges: many(playerBadges)
}));

export const playerBadgeRelations = relations(playerBadges, ({ one }) => ({
  player: one(users, {
    fields: [playerBadges.playerId],
    references: [users.id]
  }),
  badge: one(digitalBadges, {
    fields: [playerBadges.badgeId],
    references: [digitalBadges.id]
  }),
  session: one(coachingSessions, {
    fields: [playerBadges.sessionId],
    references: [coachingSessions.id]
  }),
  challenge: one(challenges, {
    fields: [playerBadges.challengeId],
    references: [challenges.id]
  }),
  coach: one(users, {
    fields: [playerBadges.coachId],
    references: [users.id]
  })
}));

export const ratingProgressionRelations = relations(ratingProgressions, ({ one }) => ({
  player: one(users, {
    fields: [ratingProgressions.playerId],
    references: [users.id]
  }),
  coach: one(users, {
    fields: [ratingProgressions.coachId],
    references: [users.id]
  }),
  approver: one(users, {
    fields: [ratingProgressions.approvedBy],
    references: [users.id]
  }),
  session: one(coachingSessions, {
    fields: [ratingProgressions.sessionId],
    references: [coachingSessions.id]
  })
}));

export const classTemplateRelations = relations(classTemplates, ({ one, many }) => ({
  center: one(trainingCenters, {
    fields: [classTemplates.centerId],
    references: [trainingCenters.id]
  }),
  coach: one(users, {
    fields: [classTemplates.coachId],
    references: [users.id]
  }),
  instances: many(classInstances)
}));

export const classInstanceRelations = relations(classInstances, ({ one, many }) => ({
  template: one(classTemplates, {
    fields: [classInstances.templateId],
    references: [classTemplates.id]
  }),
  center: one(trainingCenters, {
    fields: [classInstances.centerId],
    references: [trainingCenters.id]
  }),
  coach: one(users, {
    fields: [classInstances.coachId],
    references: [users.id]
  }),
  enrollments: many(classEnrollments),
  waitlist: many(classWaitlist)
}));

export const classEnrollmentRelations = relations(classEnrollments, ({ one }) => ({
  classInstance: one(classInstances, {
    fields: [classEnrollments.classInstanceId],
    references: [classInstances.id]
  }),
  player: one(users, {
    fields: [classEnrollments.playerId],
    references: [users.id]
  })
}));

export const classWaitlistRelations = relations(classWaitlist, ({ one }) => ({
  classInstance: one(classInstances, {
    fields: [classWaitlist.classInstanceId],
    references: [classInstances.id]
  }),
  player: one(users, {
    fields: [classWaitlist.playerId],
    references: [users.id]
  })
}));

export const coachProfileRelations = relations(coachProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [coachProfiles.userId],
    references: [users.id]
  }),
  reviews: many(coachReviews)
}));

export const coachReviewRelations = relations(coachReviews, ({ one }) => ({
  coach: one(users, {
    fields: [coachReviews.coachId],
    references: [users.id]
  }),
  reviewer: one(users, {
    fields: [coachReviews.reviewerId],
    references: [users.id]
  }),
  session: one(coachingSessions, {
    fields: [coachReviews.sessionId],
    references: [coachingSessions.id]
  }),
  classInstance: one(classInstances, {
    fields: [coachReviews.classInstanceId],
    references: [classInstances.id]
  })
}));

// Zod schemas for validation
export const insertTrainingCenterSchema = createInsertSchema(trainingCenters);
export const insertCoachCertificationSchema = createInsertSchema(coachCertifications);
export const insertCoachingSessionSchema = createInsertSchema(coachingSessions);
export const insertChallengeSchema = createInsertSchema(challenges);
export const insertChallengeCompletionSchema = createInsertSchema(challengeCompletions);
export const insertSessionNotesSchema = createInsertSchema(sessionNotes);
export const insertClassTemplateSchema = createInsertSchema(classTemplates);
export const insertClassInstanceSchema = createInsertSchema(classInstances);
export const insertClassEnrollmentSchema = createInsertSchema(classEnrollments);
export const insertClassWaitlistSchema = createInsertSchema(classWaitlist);
export const insertCoachProfileSchema = createInsertSchema(coachProfiles);
export const insertCoachReviewSchema = createInsertSchema(coachReviews);
export const insertDigitalBadgeSchema = createInsertSchema(digitalBadges);
export const insertPlayerBadgeSchema = createInsertSchema(playerBadges);
export const insertRatingProgressionSchema = createInsertSchema(ratingProgressions);

// TypeScript types
export type TrainingCenter = typeof trainingCenters.$inferSelect;
export type InsertTrainingCenter = typeof trainingCenters.$inferInsert;
export type ClassTemplate = typeof classTemplates.$inferSelect;
export type InsertClassTemplate = typeof classTemplates.$inferInsert;
export type ClassInstance = typeof classInstances.$inferSelect;
export type InsertClassInstance = typeof classInstances.$inferInsert;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
export type InsertClassEnrollment = typeof classEnrollments.$inferInsert;
export type ClassWaitlist = typeof classWaitlist.$inferSelect;
export type InsertClassWaitlist = typeof classWaitlist.$inferInsert;
export type CoachProfile = typeof coachProfiles.$inferSelect;
export type InsertCoachProfile = typeof coachProfiles.$inferInsert;
export type CoachReview = typeof coachReviews.$inferSelect;
export type InsertCoachReview = typeof coachReviews.$inferInsert;
export type CoachCertification = typeof coachCertifications.$inferSelect;
export type InsertCoachCertification = typeof coachCertifications.$inferInsert;
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = typeof coachingSessions.$inferInsert;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;
export type ChallengeCompletion = typeof challengeCompletions.$inferSelect;
export type InsertChallengeCompletion = typeof challengeCompletions.$inferInsert;
export type SessionNotes = typeof sessionNotes.$inferSelect;
export type InsertSessionNotes = typeof sessionNotes.$inferInsert;
export type DigitalBadge = typeof digitalBadges.$inferSelect;
export type InsertDigitalBadge = typeof digitalBadges.$inferInsert;
export type PlayerBadge = typeof playerBadges.$inferSelect;
export type InsertPlayerBadge = typeof playerBadges.$inferInsert;
export type RatingProgression = typeof ratingProgressions.$inferSelect;
export type InsertRatingProgression = typeof ratingProgressions.$inferInsert;

// Enums for type safety
export const SessionType = {
  INDIVIDUAL: "individual",
  GROUP: "group", 
  ASSESSMENT: "assessment",
  TOURNAMENT_PREP: "tournament_prep"
} as const;

export const ChallengeCategory = {
  SERVING: "serving",
  GROUNDSTROKES: "groundstrokes", 
  NET_PLAY: "net_play",
  STRATEGY: "strategy",
  MOVEMENT: "movement",
  MENTAL_GAME: "mental_game"
} as const;

export const SkillLevel = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced", 
  EXPERT: "expert"
} as const;

export const SessionStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
} as const;