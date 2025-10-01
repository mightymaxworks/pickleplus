// Match Challenges Schema (Sprint 2 - Gaming HUD Enhancement)
// Handles player-to-player match challenges with multi-ranking support

import { pgTable, serial, integer, varchar, text, timestamp, json, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

export const matchChallenges = pgTable("match_challenges", {
  id: serial("id").primaryKey(),
  
  // Challenge participants
  challengerId: integer("challenger_id").notNull().references(() => users.id),
  challengedId: integer("challenged_id").notNull().references(() => users.id),
  
  // Match configuration
  matchType: varchar("match_type", { length: 20 }).notNull(), // 'singles', 'doubles', 'mixed'
  
  // Partner information for doubles/mixed
  challengerPartnerId: integer("challenger_partner_id").references(() => users.id),
  challengedPartnerId: integer("challenged_partner_id").references(() => users.id),
  
  // Challenge status
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'accepted', 'declined', 'expired', 'completed', 'cancelled'
  
  // Ready status for gaming lobby (added Sprint 2 - Task 7)
  challengerReady: boolean("challenger_ready").notNull().default(false),
  challengedReady: boolean("challenged_ready").notNull().default(false),
  challengerPartnerReady: boolean("challenger_partner_ready").notNull().default(false),
  challengedPartnerReady: boolean("challenged_partner_ready").notNull().default(false),
  
  // Source tracking
  createdVia: varchar("created_via", { length: 30 }).notNull(), // 'leaderboard', 'profile', 'match-arena', 'direct'
  sourceContext: json("source_context").$type<{
    leaderboardTab?: 'singles' | 'doubles' | 'mixed';
    regionFilter?: 'local' | 'regional' | 'national' | 'global';
    challengerRank?: number;
    challengedRank?: number;
    rankDifference?: number;
  }>(),
  
  // Timing
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // Default 24h from creation
  respondedAt: timestamp("responded_at"),
  completedAt: timestamp("completed_at"),
  
  // Optional message from challenger
  message: text("message"),
  
  // Match outcome (if completed)
  matchId: integer("match_id"), // References matches table after match is recorded
  winnerTeam: varchar("winner_team", { length: 10 }), // 'challenger', 'challenged', null if not completed
}, (table) => ({
  challengerIdx: index("challenges_challenger_idx").on(table.challengerId),
  challengedIdx: index("challenges_challenged_idx").on(table.challengedId),
  statusIdx: index("challenges_status_idx").on(table.status),
  createdAtIdx: index("challenges_created_at_idx").on(table.createdAt),
  expiresAtIdx: index("challenges_expires_at_idx").on(table.expiresAt),
}));

// Relations
export const matchChallengesRelations = relations(matchChallenges, ({ one }) => ({
  challenger: one(users, {
    fields: [matchChallenges.challengerId],
    references: [users.id],
    relationName: "challenges_sent"
  }),
  challenged: one(users, {
    fields: [matchChallenges.challengedId],
    references: [users.id],
    relationName: "challenges_received"
  }),
  challengerPartner: one(users, {
    fields: [matchChallenges.challengerPartnerId],
    references: [users.id],
    relationName: "challenges_as_partner"
  }),
  challengedPartner: one(users, {
    fields: [matchChallenges.challengedPartnerId],
    references: [users.id],
    relationName: "challenges_partner_needed"
  }),
}));

// Insert schema with validation
export const insertMatchChallengeSchema = createInsertSchema(matchChallenges)
  .omit({
    id: true,
    createdAt: true,
    respondedAt: true,
    completedAt: true,
    matchId: true,
    winnerTeam: true
  })
  .extend({
    matchType: z.enum(['singles', 'doubles', 'mixed']),
    status: z.enum(['pending', 'accepted', 'declined', 'expired', 'completed', 'cancelled']).default('pending'),
    createdVia: z.enum(['leaderboard', 'profile', 'match-arena', 'direct']),
    expiresAt: z.date().optional(), // Will default to 24h from now if not provided
  })
  .refine(data => {
    // Doubles/mixed challenges must have challenger partner
    if ((data.matchType === 'doubles' || data.matchType === 'mixed') && !data.challengerPartnerId) {
      return false;
    }
    return true;
  }, {
    message: "Doubles and mixed challenges require challenger partner ID",
    path: ["challengerPartnerId"],
  });

// Response schema for accepting/declining challenges
export const respondToChallengeSchema = z.object({
  challengeId: z.number().int().positive(),
  action: z.enum(['accept', 'decline']),
  partnerId: z.number().int().positive().optional(), // Required for doubles/mixed when accepting
  message: z.string().optional(),
});

// Types
export type MatchChallenge = typeof matchChallenges.$inferSelect;
export type InsertMatchChallenge = z.infer<typeof insertMatchChallengeSchema>;
export type RespondToChallenge = z.infer<typeof respondToChallengeSchema>;

// Extended type with user details for frontend display
export type MatchChallengeWithUsers = MatchChallenge & {
  challenger: {
    id: number;
    username: string;
    displayName: string | null;
    passportCode: string | null;
  };
  challenged: {
    id: number;
    username: string;
    displayName: string | null;
    passportCode: string | null;
  };
  challengerPartner?: {
    id: number;
    username: string;
    displayName: string | null;
  } | null;
  challengedPartner?: {
    id: number;
    username: string;
    displayName: string | null;
  } | null;
};
