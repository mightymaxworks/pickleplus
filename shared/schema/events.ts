/**
 * PKL-278651-CONN-0003-EVENT - Event Check-in QR Code System
 * Event and EventCheckIn schema definitions
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Event Check-ins table schema
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

// Types for insertion and selection
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type EventCheckIn = typeof eventCheckIns.$inferSelect;
export type InsertEventCheckIn = z.infer<typeof insertEventCheckInSchema>;

export default {
  events,
  eventCheckIns,
  eventsRelations,
  eventCheckInsRelations,
  insertEventSchema,
  insertEventCheckInSchema
};