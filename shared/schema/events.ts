/**
 * PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
 * 
 * This file defines the database schema for the Event Check-in QR Code System,
 * including the events and event check-ins tables.
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, date, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

// Events table - Stores information about all types of events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  venue: varchar("venue", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
  startDateTime: timestamp("start_date_time").notNull(),
  endDateTime: timestamp("end_date_time").notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull().default("social"), // social, tournament, clinic, league, etc.
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  isPrivate: boolean("is_private").default(false),
  requiresCheckIn: boolean("requires_check_in").default(true),
  checkInCode: varchar("check_in_code", { length: 50 }), // Optional custom code
  organizerId: integer("organizer_id").references(() => users.id),
  registrationRequired: boolean("registration_required").default(false),
  registrationStartDate: timestamp("registration_start_date"),
  registrationEndDate: timestamp("registration_end_date"),
  cost: integer("cost"), // In cents, null if free
  costCurrency: varchar("cost_currency", { length: 3 }).default("USD"),
  imageUrl: text("image_url"),
  qrCodeEnabled: boolean("qr_code_enabled").default(true),
  status: varchar("status", { length: 20 }).notNull().default("upcoming"), // upcoming, active, completed, cancelled
  additionalInfo: jsonb("additional_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Event check-ins table - Tracks all event check-ins
export const eventCheckIns = pgTable("event_check_ins", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  checkInTime: timestamp("check_in_time").defaultNow(),
  checkInMethod: varchar("check_in_method", { length: 20 }).notNull().default("qr"), // qr, manual, self
  verifiedById: integer("verified_by_id").references(() => users.id), // Admin who verified check-in
  notes: text("notes"),
  deviceInfo: text("device_info"), // Information about the device used for check-in
  checkInLocation: text("check_in_location"), // Optional GPS coordinates
  xpAwarded: integer("xp_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// Set up relations
export const eventsRelations = relations(events, ({ many, one }) => ({
  checkIns: many(eventCheckIns),
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id]
  })
}));

export const eventCheckInsRelations = relations(eventCheckIns, ({ one }) => ({
  event: one(events, {
    fields: [eventCheckIns.eventId],
    references: [events.id]
  }),
  user: one(users, {
    fields: [eventCheckIns.userId],
    references: [users.id]
  }),
  verifiedBy: one(users, {
    fields: [eventCheckIns.verifiedById],
    references: [users.id]
  })
}));

// Create insert schemas using drizzle-zod
export const insertEventSchema = createInsertSchema(events, {
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  startDateTime: z.string().or(z.date()),
  endDateTime: z.string().or(z.date()),
  eventType: z.string().min(1).max(50),
  // Add more custom validations as needed
}).omit({ id: true, createdAt: true, updatedAt: true, currentAttendees: true });

export const insertEventCheckInSchema = createInsertSchema(eventCheckIns, {
  // Add custom validations as needed
}).omit({ id: true, createdAt: true, checkInTime: true });

// TypeScript types
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventCheckIn = typeof eventCheckIns.$inferSelect;
export type InsertEventCheckIn = z.infer<typeof insertEventCheckInSchema>;