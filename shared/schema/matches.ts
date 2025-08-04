// Match Recording and Ranking System Schema
import { pgTable, serial, integer, varchar, text, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Age Groups for automatic ranking calculation
export const AGE_GROUPS = {
  '18-29': { multiplier: 1.0, picklePointsMultiplier: 1.0 },
  '30-39': { multiplier: 1.1, picklePointsMultiplier: 1.1 },
  '40-49': { multiplier: 1.2, picklePointsMultiplier: 1.2 },
  '50-59': { multiplier: 1.3, picklePointsMultiplier: 1.3 },
  '60+': { multiplier: 1.5, picklePointsMultiplier: 1.5 }
} as const;

// Event Types for ranking points calculation
export const EVENT_TYPES = {
  'recreational_singles': { winPoints: 10, lossPoints: 2, picklePointsWin: 50, picklePointsLoss: 20 },
  'recreational_doubles': { winPoints: 8, lossPoints: 2, picklePointsWin: 45, picklePointsLoss: 20 },
  'competitive_singles': { winPoints: 25, lossPoints: 5, picklePointsWin: 75, picklePointsLoss: 25 },
  'competitive_doubles': { winPoints: 20, lossPoints: 5, picklePointsWin: 70, picklePointsLoss: 25 },
  'tournament_singles': { winPoints: 50, lossPoints: 10, picklePointsWin: 150, picklePointsLoss: 30 },
  'tournament_doubles': { winPoints: 40, lossPoints: 10, picklePointsWin: 140, picklePointsLoss: 30 }
} as const;

export type AgeGroup = keyof typeof AGE_GROUPS;
export type EventType = keyof typeof EVENT_TYPES;

// Matches table - core match recording
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  
  // Match details
  matchType: varchar('match_type', { length: 50 }).notNull(), // 'singles' or 'doubles'
  eventType: varchar('event_type', { length: 50 }).notNull(), // recreational_singles, competitive_doubles, etc.
  
  // Players (for singles: player2Id and player4Id will be null)
  player1Id: integer('player1_id').notNull(),
  player2Id: integer('player2_id'), // null for singles
  player3Id: integer('player3_id').notNull(), // opponent 1
  player4Id: integer('player4_id'), // opponent 2 (null for singles)
  
  // Match results
  team1Score: json('team1_score').$type<number[]>().notNull(), // array of game scores [11, 8, 11]
  team2Score: json('team2_score').$type<number[]>().notNull(), // array of game scores [9, 11, 6]
  winnerId: integer('winner_id').notNull(), // user ID of winner (for doubles, represents winning team)
  winningTeam: varchar('winning_team', { length: 10 }).notNull(), // 'team1' or 'team2'
  
  // Points awarded
  rankingPointsAwarded: json('ranking_points_awarded').$type<{
    player1: number;
    player2?: number;
    player3: number;
    player4?: number;
  }>().notNull(),
  
  picklePointsAwarded: json('pickle_points_awarded').$type<{
    player1: number;
    player2?: number;
    player3: number;
    player4?: number;
  }>().notNull(),
  
  // Match metadata
  location: varchar('location', { length: 255 }),
  notes: text('notes'),
  matchDate: timestamp('match_date').notNull().defaultNow(),
  createdBy: integer('created_by').notNull(), // admin user who recorded the match
  verified: boolean('verified').notNull().default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Player Rankings table - current ranking status
export const playerRankings = pgTable('player_rankings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique(),
  
  // Ranking points by category
  totalRankingPoints: decimal('total_ranking_points', { precision: 10, scale: 2 }).notNull().default('0'),
  singlesRankingPoints: decimal('singles_ranking_points', { precision: 10, scale: 2 }).notNull().default('0'),
  doublesRankingPoints: decimal('doubles_ranking_points', { precision: 10, scale: 2 }).notNull().default('0'),
  
  // Pickle Points
  totalPicklePoints: integer('total_pickle_points').notNull().default(0),
  
  // Match statistics
  totalMatches: integer('total_matches').notNull().default(0),
  matchesWon: integer('matches_won').notNull().default(0),
  matchesLost: integer('matches_lost').notNull().default(0),
  winPercentage: decimal('win_percentage', { precision: 5, scale: 2 }).notNull().default('0'),
  
  // Current rankings
  overallRank: integer('overall_rank'),
  singlesRank: integer('singles_rank'),
  doublesRank: integer('doubles_rank'),
  ageGroupRank: integer('age_group_rank'),
  
  // Player age group for ranking calculations
  ageGroup: varchar('age_group', { length: 10 }),
  
  // Last match information
  lastMatchDate: timestamp('last_match_date'),
  currentStreak: integer('current_streak').notNull().default(0), // positive for wins, negative for losses
  longestWinStreak: integer('longest_win_streak').notNull().default(0),
  
  // Timestamps
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Match History table - detailed match records for analytics
export const matchHistory = pgTable('match_history', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id').notNull(),
  userId: integer('user_id').notNull(),
  
  // Player's performance in this match
  isWinner: boolean('is_winner').notNull(),
  isPartner: boolean('is_partner').notNull().default(false), // true if this player was in a doubles team
  partnerId: integer('partner_id'), // partner's user ID for doubles
  
  // Points earned from this match
  rankingPointsEarned: decimal('ranking_points_earned', { precision: 10, scale: 2 }).notNull(),
  picklePointsEarned: integer('pickle_points_earned').notNull(),
  
  // Match context
  opponentIds: json('opponent_ids').$type<number[]>().notNull(),
  matchType: varchar('match_type', { length: 50 }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  
  // Timestamps
  matchDate: timestamp('match_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Relations
export const matchesRelations = relations(matches, ({ one, many }) => ({
  player1: one(users, {
    fields: [matches.player1Id],
    references: [users.id],
    relationName: 'player1'
  }),
  player2: one(users, {
    fields: [matches.player2Id],
    references: [users.id],
    relationName: 'player2'
  }),
  player3: one(users, {
    fields: [matches.player3Id],
    references: [users.id],
    relationName: 'player3'
  }),
  player4: one(users, {
    fields: [matches.player4Id],
    references: [users.id],
    relationName: 'player4'
  }),
  creator: one(users, {
    fields: [matches.createdBy],
    references: [users.id],
    relationName: 'creator'
  }),
  history: many(matchHistory)
}));

export const playerRankingsRelations = relations(playerRankings, ({ one }) => ({
  user: one(users, {
    fields: [playerRankings.userId],
    references: [users.id]
  })
}));

export const matchHistoryRelations = relations(matchHistory, ({ one }) => ({
  match: one(matches, {
    fields: [matchHistory.matchId],
    references: [matches.id]
  }),
  user: one(users, {
    fields: [matchHistory.userId],
    references: [users.id]
  }),
  partner: one(users, {
    fields: [matchHistory.partnerId],
    references: [users.id],
    relationName: 'partner'
  })
}));

// Zod schemas
export const insertMatchSchema = createInsertSchema(matches).extend({
  team1Score: z.array(z.number().min(0).max(15)),
  team2Score: z.array(z.number().min(0).max(15)),
  eventType: z.enum(['recreational_singles', 'recreational_doubles', 'competitive_singles', 'competitive_doubles', 'tournament_singles', 'tournament_doubles']),
  matchType: z.enum(['singles', 'doubles'])
});

export const insertPlayerRankingSchema = createInsertSchema(playerRankings).extend({
  ageGroup: z.enum(['18-29', '30-39', '40-49', '50-59', '60+']).optional()
});

export const insertMatchHistorySchema = createInsertSchema(matchHistory);

// Types
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type PlayerRanking = typeof playerRankings.$inferSelect;
export type InsertPlayerRanking = z.infer<typeof insertPlayerRankingSchema>;
export type MatchHistory = typeof matchHistory.$inferSelect;
export type InsertMatchHistory = z.infer<typeof insertMatchHistorySchema>;

// Helper types for frontend
export type MatchWithPlayers = Match & {
  player1: { id: number; username: string; firstName: string; lastName: string };
  player2?: { id: number; username: string; firstName: string; lastName: string };
  player3: { id: number; username: string; firstName: string; lastName: string };
  player4?: { id: number; username: string; firstName: string; lastName: string };
  creator: { id: number; username: string };
};

export type LeaderboardEntry = {
  rank: number;
  userId: number;
  username: string;
  displayName: string;
  totalRankingPoints: number;
  totalPicklePoints: number;
  totalMatches: number;
  matchesWon: number;
  winPercentage: number;
  ageGroup?: string;
  lastMatchDate?: Date;
  currentStreak: number;
};