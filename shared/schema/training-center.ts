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

// Zod schemas for validation
export const insertTrainingCenterSchema = createInsertSchema(trainingCenters);
export const insertCoachCertificationSchema = createInsertSchema(coachCertifications);
export const insertCoachingSessionSchema = createInsertSchema(coachingSessions);
export const insertChallengeSchema = createInsertSchema(challenges);
export const insertChallengeCompletionSchema = createInsertSchema(challengeCompletions);
export const insertSessionNotesSchema = createInsertSchema(sessionNotes);
export const insertDigitalBadgeSchema = createInsertSchema(digitalBadges);
export const insertPlayerBadgeSchema = createInsertSchema(playerBadges);
export const insertRatingProgressionSchema = createInsertSchema(ratingProgressions);

// TypeScript types
export type TrainingCenter = typeof trainingCenters.$inferSelect;
export type InsertTrainingCenter = typeof trainingCenters.$inferInsert;
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