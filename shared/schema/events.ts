/**
 * PKL-278651-CONN-0003-EVENT - PicklePass™ System
 * PKL-278651-CONN-0004-PASS-REG - Enhanced PicklePass™ with Registration
 * Event, EventCheckIn, and EventRegistration schema definitions
 */

import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../schema';

/**
 * Events table schema
 */
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  location: text('location'),
  startDateTime: timestamp('start_date_time').notNull(),
  endDateTime: timestamp('end_date_time').notNull(),
  maxAttendees: integer('max_attendees'),
  currentAttendees: integer('current_attendees').default(0),
  organizerId: integer('organizer_id').notNull().references(() => users.id),
  isPrivate: boolean('is_private').default(false),
  requiresCheckIn: boolean('requires_check_in').default(true),
  checkInCode: text('check_in_code'),
  eventType: text('event_type').default('regular'), // 'regular', 'tournament', 'workshop', etc.
  status: text('status').default('upcoming'), // 'upcoming', 'ongoing', 'completed', 'cancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * PKL-278651-CONN-0004-PASS-REG: Event Registrations table schema
 * Tracks user registrations for events
 */
export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  userId: integer('user_id').notNull().references(() => users.id),
  registrationTime: timestamp('registration_time').defaultNow().notNull(),
  status: text('status').default('confirmed').notNull(), // 'pending', 'confirmed', 'cancelled', 'waitlisted'
  notes: text('notes'), // For any special requests or information
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * PicklePass™ Event Check-ins table schema
 */
export const eventCheckIns = pgTable('event_check_ins', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  userId: integer('user_id').notNull().references(() => users.id),
  checkInTime: timestamp('check_in_time').defaultNow().notNull(),
  checkInMethod: text('check_in_method').notNull(), // 'qr', 'code', 'manual', etc.
});

// Relations
export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  checkIns: many(eventCheckIns),
  registrations: many(eventRegistrations),
}));

export const eventCheckInsRelations = relations(eventCheckIns, ({ one }) => ({
  event: one(events, {
    fields: [eventCheckIns.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventCheckIns.userId],
    references: [users.id],
  }),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentAttendees: true,
});

export const insertEventCheckInSchema = createInsertSchema(eventCheckIns).omit({
  id: true,
  checkInTime: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  registrationTime: true,
  createdAt: true,
  updatedAt: true,
});

// Types for insertion and selection
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type EventCheckIn = typeof eventCheckIns.$inferSelect;
export type InsertEventCheckIn = z.infer<typeof insertEventCheckInSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export default {
  events,
  eventCheckIns,
  eventRegistrations,
  eventsRelations,
  eventCheckInsRelations,
  eventRegistrationsRelations,
  insertEventSchema,
  insertEventCheckInSchema,
  insertEventRegistrationSchema
};