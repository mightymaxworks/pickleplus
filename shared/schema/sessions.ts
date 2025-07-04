/**
 * PKL-278651-SESSION-MGMT - Session Management Schema
 * 
 * Comprehensive session management schema for coach-player interactions
 * including booking, scheduling, payments, and session tracking.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-07-04
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Coaching Sessions Table
 * Manages all coaching sessions between coaches and players
 */
export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  sessionType: varchar("session_type", { length: 50 }).notNull(),
  sessionStatus: varchar("session_status", { length: 50 }).notNull().default("scheduled"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  locationType: varchar("location_type", { length: 50 }),
  locationDetails: text("location_details"),
  priceAmount: decimal("price_amount", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  sessionNotes: text("session_notes"),
  feedbackForStudent: text("feedback_for_student"),
  studentGoals: jsonb("student_goals").default([]),
  sessionSummary: text("session_summary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Session Requests Table
 * Manages initial session requests from players to coaches
 */
export const sessionRequests = pgTable("session_requests", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  coachId: integer("coach_id").notNull(),
  requestType: varchar("request_type", { length: 50 }).notNull().default("individual"),
  preferredSchedule: jsonb("preferred_schedule").default([]),
  message: text("message"),
  requestStatus: varchar("request_status", { length: 50 }).notNull().default("pending"),
  responseMessage: text("response_message"),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

/**
 * Coach Reviews Table
 * Manages reviews and ratings for coaching sessions
 */
export const coachReviews = pgTable("coach_reviews", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  studentId: integer("student_id").notNull(),
  sessionId: integer("session_id"),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  reviewDate: timestamp("review_date").defaultNow(),
  isVerified: boolean("is_verified").default(false),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Session Types Enum
 */
export const SessionType = {
  INDIVIDUAL: "individual",
  GROUP: "group",
  ASSESSMENT: "assessment",
  FOLLOW_UP: "follow_up",
  TOURNAMENT_PREP: "tournament_prep"
} as const;

export type SessionTypeEnum = typeof SessionType[keyof typeof SessionType];

/**
 * Session Status Enum
 */
export const SessionStatus = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show"
} as const;

export type SessionStatusEnum = typeof SessionStatus[keyof typeof SessionStatus];

/**
 * Request Status Enum
 */
export const RequestStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  EXPIRED: "expired"
} as const;

export type RequestStatusEnum = typeof RequestStatus[keyof typeof RequestStatus];

/**
 * Payment Status Enum
 */
export const PaymentStatus = {
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed"
} as const;

export type PaymentStatusEnum = typeof PaymentStatus[keyof typeof PaymentStatus];

/**
 * Schema Relations
 */
export const sessionRelations = relations(coachingSessions, ({ one }) => ({
  coach: one(coachingSessions, {
    fields: [coachingSessions.coachId],
    references: [coachingSessions.id],
  }),
  student: one(coachingSessions, {
    fields: [coachingSessions.studentId],
    references: [coachingSessions.id],
  }),
}));

export const sessionRequestRelations = relations(sessionRequests, ({ one }) => ({
  player: one(sessionRequests, {
    fields: [sessionRequests.playerId],
    references: [sessionRequests.id],
  }),
  coach: one(sessionRequests, {
    fields: [sessionRequests.coachId],
    references: [sessionRequests.id],
  }),
}));

/**
 * Insert Schemas for Validation
 */
export const insertCoachingSessionSchema = createInsertSchema(coachingSessions, {
  sessionType: z.enum(["individual", "group", "assessment", "follow_up", "tournament_prep"]),
  sessionStatus: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]),
  durationMinutes: z.number().min(15).max(240),
  priceAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  scheduledAt: z.string().datetime(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionRequestSchema = createInsertSchema(sessionRequests, {
  requestType: z.enum(["individual", "group", "assessment", "tournament_prep"]),
  requestStatus: z.enum(["pending", "accepted", "declined", "expired"]),
  message: z.string().max(500).optional(),
}).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
});

export const insertCoachReviewSchema = createInsertSchema(coachReviews, {
  rating: z.number().min(1).max(5),
  reviewText: z.string().max(1000).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewDate: true,
});

/**
 * Type Exports
 */
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;

export type SessionRequest = typeof sessionRequests.$inferSelect;
export type InsertSessionRequest = z.infer<typeof insertSessionRequestSchema>;

export type CoachReview = typeof coachReviews.$inferSelect;
export type InsertCoachReview = z.infer<typeof insertCoachReviewSchema>;

/**
 * Session Response Types for API
 */
export interface SessionWithDetails extends CoachingSession {
  coachName: string;
  coachUsername: string;
  studentName: string;
  studentUsername: string;
  studentLevel?: number;
}

export interface SessionRequestWithDetails extends SessionRequest {
  playerName: string;
  playerUsername: string;
  playerLevel?: number;
  coachName: string;
  coachUsername: string;
}

export interface CoachReviewWithDetails extends CoachReview {
  studentName: string;
  studentUsername: string;
  sessionDate?: Date;
}