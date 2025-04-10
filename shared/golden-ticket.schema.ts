/**
 * PKL-278651-GAME-0005-GOLD
 * Golden Ticket Promotional System Schema
 * 
 * Database schema for the Golden Ticket promotional feature.
 */

import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

/**
 * Golden Ticket campaign status enum
 */
export const goldenTicketStatusEnum = pgEnum('golden_ticket_status', [
  'draft',
  'active',
  'paused',
  'completed',
  'cancelled'
]);

/**
 * Golden Ticket claim status enum
 */
export const goldenTicketClaimStatusEnum = pgEnum('golden_ticket_claim_status', [
  'claimed',
  'entered_drawing',
  'selected',
  'redeemed',
  'expired'
]);

/**
 * Sponsors table for tracking promotional partners
 */
export const sponsors = pgTable('sponsors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  contactEmail: text('contact_email'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * Golden Tickets table for promotional campaigns
 */
export const goldenTickets = pgTable('golden_tickets', {
  id: serial('id').primaryKey(),
  campaignId: text('campaign_id').notNull(),
  sponsorId: integer('sponsor_id').references(() => sponsors.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  prizeDescription: text('prize_description').notNull(),
  discountCode: text('discount_code'),
  discountValue: text('discount_value'),
  status: goldenTicketStatusEnum('status').default('draft').notNull(),
  appearanceRate: integer('appearance_rate').default(5).notNull(), // Percentage: 1-100
  maxClaims: integer('max_claims').notNull(),
  currentClaims: integer('current_claims').default(0).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * Golden Ticket claims by users
 */
export const goldenTicketClaims = pgTable('golden_ticket_claims', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => goldenTickets.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  status: goldenTicketClaimStatusEnum('status').default('claimed').notNull(),
  claimedAt: timestamp('claimed_at').defaultNow().notNull(),
  redemptionCode: text('redemption_code'),
  redemptionDate: timestamp('redemption_date'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

/**
 * Relations configuration
 */
export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  goldenTickets: many(goldenTickets)
}));

export const goldenTicketsRelations = relations(goldenTickets, ({ one, many }) => ({
  sponsor: one(sponsors, {
    fields: [goldenTickets.sponsorId],
    references: [sponsors.id]
  }),
  claims: many(goldenTicketClaims)
}));

export const goldenTicketClaimsRelations = relations(goldenTicketClaims, ({ one }) => ({
  ticket: one(goldenTickets, {
    fields: [goldenTicketClaims.ticketId],
    references: [goldenTickets.id]
  }),
  user: one(users, {
    fields: [goldenTicketClaims.userId],
    references: [users.id]
  })
}));

/**
 * Zod schemas for validation
 */
export const insertSponsorSchema = createInsertSchema(sponsors, {
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional()
});

export const insertGoldenTicketSchema = createInsertSchema(goldenTickets, {
  campaignId: z.string().min(3).max(50),
  sponsorId: z.number().int().positive().optional(),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  imageUrl: z.string().url().optional(),
  prizeDescription: z.string().min(10).max(500),
  discountCode: z.string().max(50).optional(),
  discountValue: z.string().max(50).optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).default('draft'),
  appearanceRate: z.number().int().min(1).max(100).default(5),
  maxClaims: z.number().int().positive(),
  startDate: z.date(),
  endDate: z.date()
}).omit({ id: true, currentClaims: true, createdAt: true, updatedAt: true });

export const insertGoldenTicketClaimSchema = createInsertSchema(goldenTicketClaims, {
  ticketId: z.number().int().positive(),
  userId: z.number().int().positive(),
  status: z.enum(['claimed', 'entered_drawing', 'selected', 'redeemed', 'expired']).default('claimed'),
  redemptionCode: z.string().max(20).optional()
}).omit({ id: true, claimedAt: true, redemptionDate: true, updatedAt: true });

// Infer types from schemas
export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;

export type GoldenTicket = typeof goldenTickets.$inferSelect;
export type InsertGoldenTicket = z.infer<typeof insertGoldenTicketSchema>;

export type GoldenTicketClaim = typeof goldenTicketClaims.$inferSelect;
export type InsertGoldenTicketClaim = z.infer<typeof insertGoldenTicketClaimSchema>;