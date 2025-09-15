/**
 * PKL-278651-FACILITY-MGMT-002 - Coach-Facility Partnership Revenue System
 * Database schema for coach marketplace integration and revenue sharing
 * 
 * @framework Framework5.3
 * @priority Priority 2: Revenue Generation
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";
import { trainingCenters } from "./training-center";

// Coach-Facility Partnership Agreements
export const coachFacilityPartnerships = pgTable("coach_facility_partnerships", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => trainingCenters.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  partnershipType: varchar("partnership_type", { length: 50 }).notNull(), // 'revenue_share', 'fixed_fee', 'hybrid'
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(), // Facility's commission percentage
  coachRate: decimal("coach_rate", { precision: 6, scale: 2 }).notNull(), // Coach's hourly rate
  minimumBookingDuration: integer("minimum_booking_duration").default(60), // minutes
  isExclusive: boolean("is_exclusive").default(false), // Exclusive partnership with facility
  marketingBudget: decimal("marketing_budget", { precision: 8, scale: 2 }).default("0.00"), // Shared marketing budget
  specializations: json("specializations").$type<string[]>(),
  availableSlots: json("available_slots").$type<{
    monday: Array<{ start: string; end: string; courtNumber?: number }>;
    tuesday: Array<{ start: string; end: string; courtNumber?: number }>;
    wednesday: Array<{ start: string; end: string; courtNumber?: number }>;
    thursday: Array<{ start: string; end: string; courtNumber?: number }>;
    friday: Array<{ start: string; end: string; courtNumber?: number }>;
    saturday: Array<{ start: string; end: string; courtNumber?: number }>;
    sunday: Array<{ start: string; end: string; courtNumber?: number }>;
  }>(),
  terms: text("terms"), // Contract terms
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, paused, terminated
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Coach Bookings with Revenue Tracking
export const coachBookings = pgTable("coach_bookings", {
  id: serial("id").primaryKey(),
  facilityBookingId: integer("facility_booking_id"), // Links to facility_bookings if exists
  partnershipId: integer("partnership_id").notNull().references(() => coachFacilityPartnerships.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  facilityId: integer("facility_id").notNull().references(() => trainingCenters.id),
  sessionDate: timestamp("session_date").notNull(),
  duration: integer("duration").notNull(), // minutes
  courtNumber: integer("court_number"),
  totalAmount: decimal("total_amount", { precision: 8, scale: 2 }).notNull(), // Total booking cost
  coachEarnings: decimal("coach_earnings", { precision: 8, scale: 2 }).notNull(), // Coach's share
  facilityCommission: decimal("facility_commission", { precision: 8, scale: 2 }).notNull(), // Facility's share
  platformFee: decimal("platform_fee", { precision: 8, scale: 2 }).default("0.00"), // Pickle+ platform fee
  sessionType: varchar("session_type", { length: 50 }).notNull(), // individual, group, assessment
  specialRequests: text("special_requests"),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // confirmed, completed, cancelled, refunded
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"), // pending, paid, refunded
  paymentMethod: varchar("payment_method", { length: 50 }), // stripe, cash, transfer
  sessionNotes: text("session_notes"),
  playerRating: integer("player_rating"), // 1-5 rating from player
  coachRating: integer("coach_rating"), // 1-5 rating from coach
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Event Hosting System
export const facilityEvents = pgTable("facility_events", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => trainingCenters.id),
  organizerId: integer("organizer_id").notNull().references(() => users.id), // Could be facility manager or external organizer
  eventType: varchar("event_type", { length: 50 }).notNull(), // tournament, workshop, league, social
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  maxParticipants: integer("max_participants").notNull(),
  currentRegistrations: integer("current_registrations").default(0),
  entryFee: decimal("entry_fee", { precision: 6, scale: 2 }).notNull(),
  facilityRevenue: decimal("facility_revenue", { precision: 6, scale: 2 }).notNull(), // Facility's share
  organizerRevenue: decimal("organizer_revenue", { precision: 6, scale: 2 }).notNull(), // Organizer's share
  prizePool: decimal("prize_pool", { precision: 8, scale: 2 }).default("0.00"),
  courtRequirements: json("court_requirements").$type<{
    courtsNeeded: number;
    specificCourts?: number[];
    surfaceType?: string;
  }>(),
  equipment: json("equipment").$type<string[]>(),
  skillLevel: varchar("skill_level", { length: 50 }), // beginner, intermediate, advanced, all
  ageGroups: json("age_groups").$type<string[]>(),
  registrationDeadline: timestamp("registration_deadline").notNull(),
  cancellationPolicy: text("cancellation_policy"),
  rules: text("rules"),
  imageUrl: varchar("image_url", { length: 500 }),
  status: varchar("status", { length: 20 }).notNull().default("open"), // open, full, cancelled, completed
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Event Registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => facilityEvents.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  registrationDate: timestamp("registration_date").defaultNow(),
  amountPaid: decimal("amount_paid", { precision: 6, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  teamPartners: json("team_partners").$type<number[]>(), // For doubles/team events
  emergencyContact: json("emergency_contact").$type<{
    name: string;
    phone: string;
    relationship: string;
  }>(),
  dietaryRestrictions: text("dietary_restrictions"),
  specialRequests: text("special_requests"),
  status: varchar("status", { length: 20 }).notNull().default("registered"), // registered, waitlisted, cancelled, refunded
  checkInTime: timestamp("check_in_time"),
  placementResult: integer("placement_result"), // Final ranking/placement
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Revenue Analytics Tracking
export const revenueAnalytics = pgTable("revenue_analytics", {
  id: serial("id").primaryKey(),
  facilityId: integer("facility_id").notNull().references(() => trainingCenters.id),
  recordDate: timestamp("record_date").notNull(),
  revenueType: varchar("revenue_type", { length: 50 }).notNull(), // coaching, facility_booking, events, merchandise
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).notNull(),
  coachCommissions: decimal("coach_commissions", { precision: 10, scale: 2 }).default("0.00"),
  platformFees: decimal("platform_fees", { precision: 10, scale: 2 }).default("0.00"),
  netRevenue: decimal("net_revenue", { precision: 10, scale: 2 }).notNull(),
  bookingCount: integer("booking_count").default(0),
  participantCount: integer("participant_count").default(0),
  averageBookingValue: decimal("average_booking_value", { precision: 6, scale: 2 }),
  peakHours: json("peak_hours").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const coachFacilityPartnershipsRelations = relations(coachFacilityPartnerships, ({ one, many }) => ({
  facility: one(trainingCenters, {
    fields: [coachFacilityPartnerships.facilityId],
    references: [trainingCenters.id]
  }),
  coach: one(users, {
    fields: [coachFacilityPartnerships.coachId],
    references: [users.id]
  }),
  bookings: many(coachBookings)
}));

export const coachBookingsRelations = relations(coachBookings, ({ one }) => ({
  partnership: one(coachFacilityPartnerships, {
    fields: [coachBookings.partnershipId],
    references: [coachFacilityPartnerships.id]
  }),
  player: one(users, {
    fields: [coachBookings.playerId],
    references: [users.id]
  }),
  coach: one(users, {
    fields: [coachBookings.coachId],
    references: [users.id]
  }),
  facility: one(trainingCenters, {
    fields: [coachBookings.facilityId],
    references: [trainingCenters.id]
  })
}));

export const facilityEventsRelations = relations(facilityEvents, ({ one, many }) => ({
  facility: one(trainingCenters, {
    fields: [facilityEvents.facilityId],
    references: [trainingCenters.id]
  }),
  organizer: one(users, {
    fields: [facilityEvents.organizerId],
    references: [users.id]
  }),
  registrations: many(eventRegistrations)
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(facilityEvents, {
    fields: [eventRegistrations.eventId],
    references: [facilityEvents.id]
  }),
  player: one(users, {
    fields: [eventRegistrations.playerId],
    references: [users.id]
  })
}));

// Zod Schemas
export const insertCoachFacilityPartnershipSchema = createInsertSchema(coachFacilityPartnerships).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertCoachBookingSchema = createInsertSchema(coachBookings).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertFacilityEventSchema = createInsertSchema(facilityEvents).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertRevenueAnalyticsSchema = createInsertSchema(revenueAnalytics).omit({ 
  id: true, 
  createdAt: true 
});

// Type exports
export type CoachFacilityPartnership = typeof coachFacilityPartnerships.$inferSelect;
export type InsertCoachFacilityPartnership = z.infer<typeof insertCoachFacilityPartnershipSchema>;

export type CoachBooking = typeof coachBookings.$inferSelect;
export type InsertCoachBooking = z.infer<typeof insertCoachBookingSchema>;

export type FacilityEvent = typeof facilityEvents.$inferSelect;
export type InsertFacilityEvent = z.infer<typeof insertFacilityEventSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type RevenueAnalytics = typeof revenueAnalytics.$inferSelect;
export type InsertRevenueAnalytics = z.infer<typeof insertRevenueAnalyticsSchema>;