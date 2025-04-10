/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Schema Definitions
 * 
 * This file defines the database schema for the golden ticket system.
 */

import { pgTable, serial, text, integer, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

// Enums for database
export const ticketStatusEnum = pgEnum('ticket_status', [
  'draft',
  'active', 
  'paused',
  'completed',
  'cancelled'
]);

export const claimStatusEnum = pgEnum('claim_status', [
  'pending',
  'approved',
  'fulfilled',
  'rejected',
  'expired'
]);

// Sponsors table (companies sponsoring golden tickets)
export const sponsors = pgTable('sponsors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  logoPath: text('logo_path'), // File path to uploaded logo
  website: text('website'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Golden Tickets table (promotional offers that appear randomly)
export const goldenTickets = pgTable('golden_tickets', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  campaignId: text('campaign_id').notNull(),
  sponsorId: integer('sponsor_id').references(() => sponsors.id),
  appearanceRate: integer('appearance_rate').default(5).notNull(), // percentage chance of appearing
  maxAppearances: integer('max_appearances').default(100).notNull(), // limit total appearances
  currentAppearances: integer('current_appearances').default(0).notNull(), // track how many times shown
  maxClaims: integer('max_claims').default(10).notNull(), // maximum number of claims allowed
  currentClaims: integer('current_claims').default(0).notNull(), // current number of claims
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  rewardDescription: text('reward_description').notNull(),
  rewardType: text('reward_type').default('physical'),
  discountCode: text('discount_code'),
  discountValue: text('discount_value'),
  promotionalImageUrl: text('promotional_image_url'), // URL to display the promotional image
  promotionalImagePath: text('promotional_image_path'), // File path to uploaded image
  pagesToAppearOn: text('pages_to_appear_on').array(), // array of page paths where ticket can appear
  status: ticketStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Golden Ticket Claims table (tracks user claims of tickets)
export const goldenTicketClaims = pgTable('golden_ticket_claims', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => goldenTickets.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  claimedAt: timestamp('claimed_at').defaultNow().notNull(),
  status: claimStatusEnum('status').default('pending').notNull(),
  fulfillmentDetails: text('fulfillment_details'),
  shippingAddress: text('shipping_address'),
  shippingTrackingCode: text('shipping_tracking_code'),
  adminNotes: text('admin_notes'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  goldenTickets: many(goldenTickets),
}));

export const goldenTicketsRelations = relations(goldenTickets, ({ one, many }) => ({
  sponsor: one(sponsors, {
    fields: [goldenTickets.sponsorId],
    references: [sponsors.id],
  }),
  claims: many(goldenTicketClaims),
}));

export const goldenTicketClaimsRelations = relations(goldenTicketClaims, ({ one }) => ({
  ticket: one(goldenTickets, {
    fields: [goldenTicketClaims.ticketId],
    references: [goldenTickets.id],
  }),
  user: one(users, {
    fields: [goldenTicketClaims.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertSponsorSchema = createInsertSchema(sponsors, {
  name: z.string().min(2),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  active: z.boolean().default(true),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertGoldenTicketSchema = createInsertSchema(goldenTickets, {
  title: z.string().min(3),
  description: z.string().min(5),
  campaignId: z.string().min(2),
  sponsorId: z.number().optional(),
  appearanceRate: z.number().min(1).max(100),
  maxAppearances: z.number().int().min(1),
  maxClaims: z.number().int().min(1),
  startDate: z.date(),
  endDate: z.date(),
  rewardDescription: z.string().min(5),
  rewardType: z.string().default('physical'),
  discountCode: z.string().optional(),
  discountValue: z.string().optional(),
  pagesToAppearOn: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
}).omit({ id: true, createdAt: true, updatedAt: true, currentAppearances: true, currentClaims: true });

export const insertGoldenTicketClaimSchema = createInsertSchema(goldenTicketClaims, {
  ticketId: z.number(),
  userId: z.number(),
  shippingAddress: z.string().optional(),
  status: z.enum(['pending', 'approved', 'fulfilled', 'rejected', 'expired']).default('pending'),
}).omit({ id: true, claimedAt: true, updatedAt: true, fulfillmentDetails: true, shippingTrackingCode: true, adminNotes: true });

// TypeScript types
export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;

export type GoldenTicket = typeof goldenTickets.$inferSelect;
export type InsertGoldenTicket = z.infer<typeof insertGoldenTicketSchema>;

export type GoldenTicketClaim = typeof goldenTicketClaims.$inferSelect;
export type InsertGoldenTicketClaim = z.infer<typeof insertGoldenTicketClaimSchema>;