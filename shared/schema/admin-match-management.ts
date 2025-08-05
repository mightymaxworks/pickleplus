// Admin Match Management Schema
// Database tables for competitions, matches, and ranking point allocation

import { pgTable, serial, integer, varchar, text, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for match management
export const competitionTypeEnum = pgEnum('competition_type', ['league', 'tournament', 'casual']);
export const competitionStatusEnum = pgEnum('competition_status', ['draft', 'active', 'paused', 'completed', 'cancelled']);
export const matchFormatEnum = pgEnum('match_format', ['singles', 'doubles', 'mixed_doubles']);
export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'forfeit']);
export const ageGroupEnum = pgEnum('age_group', ['18U', '19-29', '30-39', '40-49', '50-59', '60-69', '70+']);

// Competitions table - leagues, tournaments, casual matches
export const competitions = pgTable('competitions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: competitionTypeEnum('type').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  status: competitionStatusEnum('status').default('draft').notNull(),
  maxParticipants: integer('max_participants'),
  entryFee: decimal('entry_fee', { precision: 10, scale: 2 }),
  prizePool: decimal('prize_pool', { precision: 10, scale: 2 }),
  pointsMultiplier: decimal('points_multiplier', { precision: 3, scale: 2 }).default('1.00'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Admin matches table - individual matches within competitions
export const adminMatches = pgTable('admin_matches', {
  id: serial('id').primaryKey(),
  competitionId: integer('competition_id').notNull(),
  matchNumber: integer('match_number').notNull(),
  format: matchFormatEnum('format').notNull(),
  
  // Player assignments
  player1Id: integer('player1_id').notNull(),
  player2Id: integer('player2_id'),
  player1PartnerId: integer('player1_partner_id'), // For doubles
  player2PartnerId: integer('player2_partner_id'), // For doubles
  
  // Match details
  scheduledTime: timestamp('scheduled_time'),
  status: matchStatusEnum('status').default('scheduled').notNull(),
  
  // Scores
  player1Score: varchar('player1_score', { length: 50 }),
  player2Score: varchar('player2_score', { length: 50 }),
  team1Score: varchar('team1_score', { length: 50 }), // For doubles
  team2Score: varchar('team2_score', { length: 50 }), // For doubles
  
  // Results
  winnerId: integer('winner_id'),
  
  // Venue
  venue: varchar('venue', { length: 255 }),
  court: varchar('court', { length: 50 }),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Individual player results table - each player gets their own record with age-appropriate points
export const playerMatchResults = pgTable('player_match_results', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').notNull(),
  playerId: integer('player_id').notNull(),
  isWinner: boolean('is_winner').notNull(),
  pointsAwarded: integer('points_awarded').notNull(),
  ageGroupAtMatch: ageGroupEnum('age_group_at_match').notNull(),
  ageGroupMultiplier: decimal('age_group_multiplier', { precision: 3, scale: 2 }).default('1.00'),
  basePoints: integer('base_points').notNull(), // Points before age multiplier
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Point allocation rules table
export const pointAllocationRules = pgTable('point_allocation_rules', {
  id: serial('id').primaryKey(),
  competitionType: competitionTypeEnum('competition_type').notNull(),
  matchFormat: matchFormatEnum('match_format').notNull(),
  ageGroup: ageGroupEnum('age_group').notNull(),
  winnerPoints: integer('winner_points').notNull(),
  loserPoints: integer('loser_points').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Age group mappings for users
export const ageGroupMappings = pgTable('age_group_mappings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique(),
  ageGroup: ageGroupEnum('age_group').notNull(),
  birthDate: timestamp('birth_date').notNull(),
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
});

// Relations
export const competitionsRelations = relations(competitions, ({ many }) => ({
  matches: many(adminMatches)
}));

export const adminMatchesRelations = relations(adminMatches, ({ one, many }) => ({
  competition: one(competitions, {
    fields: [adminMatches.competitionId],
    references: [competitions.id]
  }),
  playerResults: many(playerMatchResults)
}));

export const playerMatchResultsRelations = relations(playerMatchResults, ({ one }) => ({
  match: one(adminMatches, {
    fields: [playerMatchResults.matchId],
    references: [adminMatches.id]
  })
}));

export const ageGroupMappingsRelations = relations(ageGroupMappings, ({ one }) => ({
  user: one(ageGroupMappings, {
    fields: [ageGroupMappings.userId],
    references: [ageGroupMappings.id],
  }),
}));

// Zod schemas for validation
export const createCompetitionSchema = createInsertSchema(competitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createMatchSchema = createInsertSchema(adminMatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createPlayerResultSchema = createInsertSchema(playerMatchResults).omit({
  id: true,
  createdAt: true,
});

export const allocatePointsSchema = z.object({
  matchId: z.number(),
  winnerPoints: z.number().min(0),
  loserPoints: z.number().min(0),
});

// Types
export type Competition = typeof competitions.$inferSelect;
export type InsertCompetition = typeof competitions.$inferInsert;
export type Match = typeof adminMatches.$inferSelect;
export type InsertMatch = typeof adminMatches.$inferInsert;
export type PlayerMatchResult = typeof playerMatchResults.$inferSelect;
export type InsertPlayerMatchResult = typeof playerMatchResults.$inferInsert;
export type PointAllocationRule = typeof pointAllocationRules.$inferSelect;
export type InsertPointAllocationRule = typeof pointAllocationRules.$inferInsert;
export type AgeGroupMapping = typeof ageGroupMappings.$inferSelect;
export type InsertAgeGroupMapping = typeof ageGroupMappings.$inferInsert;

// Complex types for API responses
export type MatchWithPlayers = Match & {
  player1: { id: number; username: string; displayName: string | null };
  player2?: { id: number; username: string; displayName: string | null };
  player1Partner?: { id: number; username: string; displayName: string | null };
  player2Partner?: { id: number; username: string; displayName: string | null };
  winner?: { id: number; username: string; displayName: string | null };
};

export type CompetitionWithMatches = Competition & {
  matches: MatchWithPlayers[];
  creator: { id: number; username: string; displayName: string | null };
};

// Helper functions
export function calculateAgeGroup(birthDate: Date): string {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
    ? age - 1 
    : age;

  if (actualAge < 19) return '18U';
  if (actualAge < 30) return '19-29';
  if (actualAge < 40) return '30-39';
  if (actualAge < 50) return '40-49';
  if (actualAge < 60) return '50-59';
  if (actualAge < 70) return '60-69';
  return '70+';
}

// Point allocation rules constants
export const POINT_ALLOCATION_RULES = {
  league: {
    singles: { winner: 25, loser: 10 },
    doubles: { winner: 20, loser: 8 },
    mixed_doubles: { winner: 20, loser: 8 }
  },
  tournament: {
    singles: { winner: 50, loser: 15 },
    doubles: { winner: 40, loser: 12 },
    mixed_doubles: { winner: 40, loser: 12 }
  },
  casual: {
    singles: { winner: 10, loser: 5 },
    doubles: { winner: 8, loser: 4 },
    mixed_doubles: { winner: 8, loser: 4 }
  }
};