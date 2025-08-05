// Admin Match Management System Schema
// For creating leagues, tournaments, and casual matches with ranking point allocation

import { pgTable, serial, integer, varchar, text, boolean, timestamp, date, decimal, pgEnum, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

// Enums for match management
export const matchTypeEnum = pgEnum('match_type', ['league', 'tournament', 'casual']);
export const matchFormatEnum = pgEnum('match_format', ['singles_male', 'singles_female', 'mens_doubles', 'womens_doubles', 'mixed_doubles']);
export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'in_progress', 'completed', 'cancelled']);
export const ageGroupEnum = pgEnum('age_group', ['18_29', '30_39', '40_49', '50_59', '60_69', '70_plus']);

// Competitions (leagues/tournaments/casual events)
export const competitions = pgTable('competitions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: matchTypeEnum('type').notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  registrationDeadline: date('registration_deadline'),
  maxParticipants: integer('max_participants'),
  entryFee: decimal('entry_fee', { precision: 10, scale: 2 }).default('0.00'),
  prizePool: decimal('prize_pool', { precision: 10, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, completed, cancelled
  pointsMultiplier: decimal('points_multiplier', { precision: 3, scale: 2 }).default('1.00'), // For different competition types
  metadata: json('metadata'), // For additional competition settings
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Match instances within competitions
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  competitionId: integer('competition_id').references(() => competitions.id).notNull(),
  matchNumber: varchar('match_number', { length: 50 }), // e.g., "QF-1", "Semi-1", "Final"
  format: matchFormatEnum('format').notNull(),
  ageGroup: ageGroupEnum('age_group').notNull(),
  scheduledTime: timestamp('scheduled_time'),
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  status: matchStatusEnum('status').notNull().default('scheduled'),
  
  // Players/Teams
  player1Id: integer('player1_id').references(() => users.id),
  player2Id: integer('player2_id').references(() => users.id),
  team1Player1Id: integer('team1_player1_id').references(() => users.id), // For doubles
  team1Player2Id: integer('team1_player2_id').references(() => users.id),
  team2Player1Id: integer('team2_player1_id').references(() => users.id),
  team2Player2Id: integer('team2_player2_id').references(() => users.id),
  
  // Scores
  player1Score: integer('player1_score').default(0),
  player2Score: integer('player2_score').default(0),
  team1Score: integer('team1_score').default(0),
  team2Score: integer('team2_score').default(0),
  
  // Winner determination
  winnerId: integer('winner_id').references(() => users.id), // For singles
  winningTeamPlayer1Id: integer('winning_team_player1_id').references(() => users.id), // For doubles
  winningTeamPlayer2Id: integer('winning_team_player2_id').references(() => users.id),
  
  // Points allocation
  winnerPoints: integer('winner_points').default(0),
  loserPoints: integer('loser_points').default(0),
  pointsAllocatedBy: integer('points_allocated_by').references(() => users.id), // Admin who allocated points
  pointsAllocatedAt: timestamp('points_allocated_at'),
  
  // Match details
  venue: varchar('venue', { length: 255 }),
  court: varchar('court', { length: 50 }),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Point allocation rules for different competition types
export const pointAllocationRules = pgTable('point_allocation_rules', {
  id: serial('id').primaryKey(),
  competitionType: matchTypeEnum('competition_type').notNull(),
  format: matchFormatEnum('format').notNull(),
  ageGroup: ageGroupEnum('age_group').notNull(),
  winnerBasePoints: integer('winner_base_points').notNull(),
  loserBasePoints: integer('loser_base_points').notNull(),
  bonusMultiplier: decimal('bonus_multiplier', { precision: 3, scale: 2 }).default('1.00'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Age group determination based on birthdate
export const ageGroupMappings = pgTable('age_group_mappings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  ageGroup: ageGroupEnum('age_group').notNull(),
  calculatedAt: timestamp('calculated_at').defaultNow(),
  birthDate: date('birth_date'), // Stored for calculation reference
});

// Relations
export const competitionsRelations = relations(competitions, ({ one, many }) => ({
  creator: one(users, {
    fields: [competitions.createdBy],
    references: [users.id],
  }),
  matches: many(matches),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  competition: one(competitions, {
    fields: [matches.competitionId],
    references: [competitions.id],
  }),
  player1: one(users, {
    fields: [matches.player1Id],
    references: [users.id],
    relationName: "player1"
  }),
  player2: one(users, {
    fields: [matches.player2Id],
    references: [users.id],
    relationName: "player2"
  }),
  team1Player1: one(users, {
    fields: [matches.team1Player1Id],
    references: [users.id],
    relationName: "team1Player1"
  }),
  team1Player2: one(users, {
    fields: [matches.team1Player2Id],
    references: [users.id],
    relationName: "team1Player2"
  }),
  team2Player1: one(users, {
    fields: [matches.team2Player1Id],
    references: [users.id],
    relationName: "team2Player1"
  }),
  team2Player2: one(users, {
    fields: [matches.team2Player2Id],
    references: [users.id],
    relationName: "team2Player2"
  }),
  winner: one(users, {
    fields: [matches.winnerId],
    references: [users.id],
    relationName: "winner"
  }),
  winningTeamPlayer1: one(users, {
    fields: [matches.winningTeamPlayer1Id],
    references: [users.id],
    relationName: "winningTeamPlayer1"
  }),
  winningTeamPlayer2: one(users, {
    fields: [matches.winningTeamPlayer2Id],
    references: [users.id],
    relationName: "winningTeamPlayer2"
  }),
  creator: one(users, {
    fields: [matches.createdBy],
    references: [users.id],
    relationName: "creator"
  }),
  pointsAllocator: one(users, {
    fields: [matches.pointsAllocatedBy],
    references: [users.id],
    relationName: "pointsAllocator"
  }),
}));

export const ageGroupMappingsRelations = relations(ageGroupMappings, ({ one }) => ({
  user: one(users, {
    fields: [ageGroupMappings.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertCompetitionSchema = createInsertSchema(competitions);
export const insertMatchSchema = createInsertSchema(matches);
export const insertPointAllocationRuleSchema = createInsertSchema(pointAllocationRules);
export const insertAgeGroupMappingSchema = createInsertSchema(ageGroupMappings);

// Custom schemas for admin operations
export const createCompetitionSchema = insertCompetitionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const createMatchSchema = insertMatchSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  pointsAllocatedAt: true
});

export const allocatePointsSchema = z.object({
  matchId: z.number(),
  winnerPoints: z.number().min(0),
  loserPoints: z.number().min(0),
  notes: z.string().optional()
});

// Types
export type Competition = typeof competitions.$inferSelect;
export type InsertCompetition = z.infer<typeof insertCompetitionSchema>;
export type CreateCompetition = z.infer<typeof createCompetitionSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type CreateMatch = z.infer<typeof createMatchSchema>;

export type PointAllocationRule = typeof pointAllocationRules.$inferSelect;
export type InsertPointAllocationRule = z.infer<typeof insertPointAllocationRuleSchema>;

export type AgeGroupMapping = typeof ageGroupMappings.$inferSelect;
export type InsertAgeGroupMapping = z.infer<typeof insertAgeGroupMappingSchema>;

export type AllocatePoints = z.infer<typeof allocatePointsSchema>;

// Utility types for complex operations
export type MatchWithPlayers = Match & {
  player1?: { id: number; firstName: string; lastName: string; username: string; };
  player2?: { id: number; firstName: string; lastName: string; username: string; };
  team1Player1?: { id: number; firstName: string; lastName: string; username: string; };
  team1Player2?: { id: number; firstName: string; lastName: string; username: string; };
  team2Player1?: { id: number; firstName: string; lastName: string; username: string; };
  team2Player2?: { id: number; firstName: string; lastName: string; username: string; };
  competition?: Competition;
};

export type CompetitionWithMatches = Competition & {
  matches?: MatchWithPlayers[];
  creator?: { id: number; firstName: string; lastName: string; username: string; };
};

// Age group calculation utilities
export const calculateAgeGroup = (birthDate: Date): string => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (age < 30) return '18_29';
  if (age < 40) return '30_39';
  if (age < 50) return '40_49';
  if (age < 60) return '50_59';
  if (age < 70) return '60_69';
  return '70_plus';
};

// Point allocation constants
export const POINT_ALLOCATION_RULES = {
  // League matches
  league: {
    winner_base: 50,
    loser_base: 10,
    age_group_bonus: {
      '18_29': 1.0,
      '30_39': 1.1,
      '40_49': 1.2,
      '50_59': 1.3,
      '60_69': 1.4,
      '70_plus': 1.5
    }
  },
  // Tournament matches
  tournament: {
    winner_base: 100,
    loser_base: 25,
    round_multiplier: {
      'first_round': 1.0,
      'second_round': 1.2,
      'quarterfinal': 1.5,
      'semifinal': 2.0,
      'final': 3.0
    }
  },
  // Casual matches
  casual: {
    winner_base: 25,
    loser_base: 5,
    participation_bonus: 10
  }
} as const;