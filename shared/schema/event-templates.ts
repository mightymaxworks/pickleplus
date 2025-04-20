/**
 * PKL-278651-COMM-0035-EVENT
 * Event Templates Schema
 * 
 * This schema defines the database tables and relationships for event templates
 * which enable community administrators to create reusable templates for recurring events.
 * 
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { communities } from './community';
import { users } from '../schema';

// Event template table
export const eventTemplates = pgTable('event_templates', {
  id: serial('id').primaryKey(),
  communityId: integer('community_id').notNull().references(() => communities.id),
  createdByUserId: integer('created_by_user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  eventType: varchar('event_type', { length: 50 }).notNull().default('match_play'),
  durationMinutes: integer('duration_minutes').notNull().default(120),
  location: text('location'),
  isVirtual: boolean('is_virtual').default(false),
  virtualMeetingUrl: text('virtual_meeting_url'),
  maxAttendees: integer('max_attendees'),
  minSkillLevel: varchar('min_skill_level', { length: 10 }).default('all'),
  maxSkillLevel: varchar('max_skill_level', { length: 10 }).default('all'),
  recurringPattern: varchar('recurring_pattern', { length: 50 }),
  isDefault: boolean('is_default').default(false),
  createdAt: varchar('created_at', { length: 50 }).notNull().default(new Date().toISOString()),
  updatedAt: varchar('updated_at', { length: 50 }).notNull().default(new Date().toISOString()),
});

// Define relations
export const eventTemplatesRelations = relations(eventTemplates, ({ one }) => ({
  community: one(communities, {
    fields: [eventTemplates.communityId],
    references: [communities.id],
  }),
  creator: one(users, {
    fields: [eventTemplates.createdByUserId],
    references: [users.id],
  }),
}));

// Create insert schema for validation
export const insertEventTemplateSchema = createInsertSchema(eventTemplates, {
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  eventType: z.string().default('match_play'),
  durationMinutes: z.number().int().min(15).max(480),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  virtualMeetingUrl: z.string().url().optional(),
  maxAttendees: z.number().int().positive().optional(),
  minSkillLevel: z.string().optional(),
  maxSkillLevel: z.string().optional(),
  recurringPattern: z.string().optional(),
  isDefault: z.boolean().default(false)
}).omit({ id: true, createdAt: true, updatedAt: true });

// Export types
export type EventTemplate = typeof eventTemplates.$inferSelect;
export type InsertEventTemplate = z.infer<typeof insertEventTemplateSchema>;