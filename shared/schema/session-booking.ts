/**
 * Session Booking System Schema
 * Phase 1 Sprint 1.3: Calendar Integration and Session Management
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coach Availability - Define when coaches are available
export const coachAvailability = pgTable("coach_availability", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  
  // Time slot definition
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: varchar("start_time", { length: 8 }).notNull(), // HH:MM:SS format
  endTime: varchar("end_time", { length: 8 }).notNull(),
  
  // Availability configuration
  isRecurring: boolean("is_recurring").default(true), // Weekly recurring
  effectiveDate: timestamp("effective_date").defaultNow(),
  expiryDate: timestamp("expiry_date"), // Optional end date
  
  // Session configuration
  sessionDuration: integer("session_duration_minutes").default(60),
  maxStudents: integer("max_students").default(4),
  sessionType: varchar("session_type", { length: 20 }).default("group"),
  // individual, group, clinic, assessment
  
  // Pricing
  pricePerStudent: decimal("price_per_student", { precision: 8, scale: 2 }).default(95.00),
  groupDiscount: decimal("group_discount_percentage", { precision: 5, scale: 2 }).default(0),
  
  // Location and logistics
  location: varchar("location", { length: 255 }),
  courtNumber: varchar("court_number", { length: 20 }),
  equipmentProvided: text("equipment_provided"), // JSON array
  
  // Status and management
  isActive: boolean("is_active").default(true),
  notes: text("notes"), // Internal coach notes
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking Slots - Specific time slots that can be booked
export const bookingSlots = pgTable("booking_slots", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  availabilityId: integer("availability_id"), // Reference to recurring availability
  
  // Specific date and time
  sessionDate: timestamp("session_date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  
  // Capacity management
  maxStudents: integer("max_students").notNull(),
  currentBookings: integer("current_bookings").default(0),
  isAvailable: boolean("is_available").default(true),
  
  // Session details
  sessionType: varchar("session_type", { length: 20 }).notNull(),
  skillLevel: varchar("skill_level", { length: 50 }), // Target skill level
  focus: varchar("focus", { length: 100 }), // Session focus/theme
  
  // Drill plan integration
  plannedDrills: text("planned_drills"), // JSON array of drill IDs from library
  drillCategories: text("drill_categories"), // JSON array of focus categories
  estimatedIntensity: varchar("estimated_intensity", { length: 20 }), // low, medium, high
  
  // Pricing
  pricePerStudent: decimal("price_per_student", { precision: 8, scale: 2 }).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 8, scale: 2 }).default(0),
  
  // Location and setup
  location: varchar("location", { length: 255 }),
  courtNumber: varchar("court_number", { length: 20 }),
  specialRequirements: text("special_requirements"),
  
  // Status tracking
  status: varchar("status", { length: 30 }).default("available"),
  // available, partially_booked, fully_booked, in_progress, completed, cancelled
  
  // Session outcome (filled after completion)
  actualAttendance: integer("actual_attendance"),
  sessionNotes: text("session_notes"),
  drillsCompleted: text("drills_completed"), // JSON array of completed drill IDs
  studentFeedback: text("student_feedback"), // JSON array of feedback
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings - Individual student bookings for sessions
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  slotId: integer("slot_id").notNull(),
  studentId: integer("student_id").notNull(),
  coachId: integer("coach_id").notNull(), // Denormalized for easier queries
  
  // Booking details
  bookingDate: timestamp("booking_date").defaultNow(),
  sessionDate: timestamp("session_date").notNull(),
  
  // Payment and pricing
  amountPaid: decimal("amount_paid", { precision: 8, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"),
  // pending, paid, refunded, partial_refund
  paymentMethod: varchar("payment_method", { length: 30 }),
  paymentReference: varchar("payment_reference", { length: 100 }),
  
  // Session participation
  status: varchar("status", { length: 30 }).default("confirmed"),
  // confirmed, attended, no_show, cancelled, rescheduled
  
  // Student-specific details
  skillLevel: varchar("skill_level", { length: 50 }),
  goals: text("goals"), // Student's goals for this session
  medicalNotes: text("medical_notes"), // Any health considerations
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  
  // Session tracking
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  attendanceConfirmed: boolean("attendance_confirmed").default(false),
  
  // Post-session data
  performanceNotes: text("performance_notes"), // Coach's assessment
  areasImproved: text("areas_improved"), // JSON array
  nextSessionRecommendations: text("next_session_recommendations"),
  studentSatisfaction: integer("student_satisfaction"), // 1-5 rating
  studentFeedback: text("student_feedback"),
  
  // Rebooking and continuity
  rebookingRequested: boolean("rebooking_requested").default(false),
  preferredNextSession: timestamp("preferred_next_session"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Session Templates - Pre-defined session structures coaches can use
export const sessionTemplates = pgTable("session_templates", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull(),
  
  // Template details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  sessionType: varchar("session_type", { length: 20 }).notNull(),
  
  // Target parameters
  skillLevel: varchar("skill_level", { length: 50 }),
  duration: integer("duration_minutes").default(60),
  maxStudents: integer("max_students").default(4),
  
  // Session structure
  warmupDrills: text("warmup_drills"), // JSON array of drill IDs
  skillDrills: text("skill_drills"), // JSON array of drill IDs
  practiceGames: text("practice_games"), // JSON array of game/drill IDs
  cooldownDrills: text("cooldown_drills"), // JSON array of drill IDs
  
  // Timing breakdown
  warmupDuration: integer("warmup_duration_minutes").default(10),
  skillDuration: integer("skill_duration_minutes").default(30),
  practiceGameDuration: integer("practice_game_duration_minutes").default(15),
  cooldownDuration: integer("cooldown_duration_minutes").default(5),
  
  // Focus areas (PCP 4-dimensional)
  technicalFocus: integer("technical_focus").default(25), // 0-100
  tacticalFocus: integer("tactical_focus").default(25),
  physicalFocus: integer("physical_focus").default(25),
  mentalFocus: integer("mental_focus").default(25),
  
  // Template management
  isPublic: boolean("is_public").default(false), // Available to other coaches
  timesUsed: integer("times_used").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking Notifications - Track communication about bookings
export const bookingNotifications = pgTable("booking_notifications", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  
  // Notification details
  type: varchar("type", { length: 50 }).notNull(),
  // booking_confirmation, reminder_24h, reminder_2h, session_ready, session_completed, feedback_request, rebooking_offer
  
  recipient: varchar("recipient", { length: 20 }).notNull(), // student, coach, both
  
  // Content
  subject: varchar("subject", { length: 255 }),
  message: text("message"),
  
  // Delivery tracking
  status: varchar("status", { length: 20 }).default("pending"),
  // pending, sent, delivered, failed, read
  
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  
  // Communication channel
  channel: varchar("channel", { length: 20 }).default("email"),
  // email, sms, push, in_app
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Session Reviews - Post-session feedback and ratings
export const sessionReviews = pgTable("session_reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().unique(),
  
  // Review details
  reviewerType: varchar("reviewer_type", { length: 20 }).notNull(), // student, coach
  reviewerId: integer("reviewer_id").notNull(),
  
  // Ratings (1-5 scale)
  overallRating: integer("overall_rating").notNull(),
  instructionQuality: integer("instruction_quality"),
  communication: integer("communication"),
  organization: integer("organization"),
  valueForMoney: integer("value_for_money"),
  
  // Detailed feedback
  positiveAspects: text("positive_aspects"),
  improvementAreas: text("improvement_areas"),
  recommendToOthers: boolean("recommend_to_others"),
  
  // Future engagement
  wouldBookAgain: boolean("would_book_again"),
  suggestedFollowUp: text("suggested_follow_up"),
  
  // Admin review
  isVerified: boolean("is_verified").default(true),
  moderationNotes: text("moderation_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const coachAvailabilityRelations = relations(coachAvailability, ({ many }) => ({
  bookingSlots: many(bookingSlots),
}));

export const bookingSlotsRelations = relations(bookingSlots, ({ one, many }) => ({
  availability: one(coachAvailability, {
    fields: [bookingSlots.availabilityId],
    references: [coachAvailability.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  slot: one(bookingSlots, {
    fields: [bookings.slotId],
    references: [bookingSlots.id],
  }),
  notifications: many(bookingNotifications),
  review: one(sessionReviews, {
    fields: [bookings.id],
    references: [sessionReviews.bookingId],
  }),
}));

export const sessionTemplatesRelations = relations(sessionTemplates, ({ many }) => ({
  // Can be linked to booking slots that use this template
}));

export const bookingNotificationsRelations = relations(bookingNotifications, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingNotifications.bookingId],
    references: [bookings.id],
  }),
}));

export const sessionReviewsRelations = relations(sessionReviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [sessionReviews.bookingId],
    references: [bookings.id],
  }),
}));

// Zod Schemas
export const insertCoachAvailabilitySchema = createInsertSchema(coachAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSlotSchema = createInsertSchema(bookingSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionTemplateSchema = createInsertSchema(sessionTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSessionReviewSchema = createInsertSchema(sessionReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript Types
export type CoachAvailability = typeof coachAvailability.$inferSelect;
export type InsertCoachAvailability = z.infer<typeof insertCoachAvailabilitySchema>;

export type BookingSlot = typeof bookingSlots.$inferSelect;
export type InsertBookingSlot = z.infer<typeof insertBookingSlotSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type SessionTemplate = typeof sessionTemplates.$inferSelect;
export type InsertSessionTemplate = z.infer<typeof insertSessionTemplateSchema>;

export type SessionReview = typeof sessionReviews.$inferSelect;
export type InsertSessionReview = z.infer<typeof insertSessionReviewSchema>;

// Utility types for complex operations
export type BookingSlotWithBookings = BookingSlot & {
  bookings: Booking[];
  availableSpots: number;
  revenue: number;
};

export type CoachSchedule = {
  coachId: number;
  date: string;
  slots: BookingSlotWithBookings[];
  totalRevenue: number;
  totalBookings: number;
};

export type StudentBookingHistory = {
  studentId: number;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  averageRating: number;
  totalSpent: number;
  favoriteCoaches: number[];
  preferredSessionTypes: string[];
};