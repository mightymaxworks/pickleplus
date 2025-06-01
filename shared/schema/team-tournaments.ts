/**
 * PKL-278651-TEAM-0001 - Team Tournament Database Schema
 * 
 * Database schema for team tournaments with flexible match formats
 * and comprehensive eligibility controls.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastUpdated 2025-06-01
 */

import { pgTable, serial, text, integer, decimal, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Team Tournaments Table
export const teamTournaments = pgTable('team_tournaments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  level: text('level').notNull(), // 'club', 'district', 'city', etc.
  location: text('location').notNull(),
  venueAddress: text('venue_address'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  registrationEndDate: timestamp('registration_end_date').notNull(),
  entryFee: decimal('entry_fee', { precision: 10, scale: 2 }).default('0'),
  maxTeams: integer('max_teams').notNull(),
  status: text('status').notNull().default('upcoming'), // 'upcoming', 'registration_open', 'active', 'completed', 'cancelled'
  organizerId: integer('organizer_id').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  
  // Team Structure Configuration
  teamStructure: jsonb('team_structure').notNull(), // TeamStructureConfig
  
  // Match Format Configuration  
  matchStructure: jsonb('match_structure').notNull(), // MatchStructureConfig
  
  // Eligibility Criteria
  eligibilityCriteria: jsonb('eligibility_criteria').notNull(), // EligibilityConfig
  
  // Tournament Format
  tournamentFormat: jsonb('tournament_format').notNull(), // TournamentFormatConfig
  
  // Lineup Rules
  lineupRules: jsonb('lineup_rules').notNull(), // LineupRulesConfig
  
  // Prize and Awards
  prizePool: decimal('prize_pool', { precision: 10, scale: 2 }).default('0'),
  prizeDistribution: text('prize_distribution'),
  
  // Administrative
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Teams Table
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').notNull(),
  teamName: text('team_name').notNull(),
  captainId: integer('captain_id').notNull(),
  teamDescription: text('team_description'),
  teamLogo: text('team_logo'),
  homeClub: text('home_club'),
  sponsorship: text('sponsorship'),
  registrationDate: timestamp('registration_date').defaultNow(),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected', 'withdrawn'
  
  // Team Statistics (calculated)
  totalDUPR: decimal('total_dupr', { precision: 5, scale: 2 }),
  averageDUPR: decimal('average_dupr', { precision: 4, scale: 2 }),
  totalRankingPoints: integer('total_ranking_points'),
  averageRankingPoints: decimal('average_ranking_points', { precision: 8, scale: 2 }),
  playerCount: integer('player_count').default(0),
  
  // Administrative
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Team Players Table
export const teamPlayers = pgTable('team_players', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull(),
  userId: integer('user_id').notNull(),
  role: text('role').notNull(), // 'captain', 'player', 'substitute'
  playerNumber: integer('player_number'),
  position: text('position'),
  
  // Player Stats at Registration
  duprRating: decimal('dupr_rating', { precision: 4, scale: 2 }),
  rankingPoints: integer('ranking_points').default(0),
  verifiedRating: boolean('verified_rating').default(false),
  tournamentsPlayed: integer('tournaments_played').default(0),
  
  // Administrative
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Team Matches Table (team vs team)
export const teamMatches = pgTable('team_matches', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').notNull(),
  team1Id: integer('team1_id').notNull(),
  team2Id: integer('team2_id').notNull(),
  round: integer('round').notNull(),
  matchNumber: integer('match_number'),
  scheduledTime: timestamp('scheduled_time'),
  
  // Match Status
  status: text('status').notNull().default('scheduled'), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  
  // Team Results
  team1Score: integer('team1_score').default(0),
  team2Score: integer('team2_score').default(0),
  winnerId: integer('winner_id'),
  
  // Match Details
  venue: text('venue'),
  court: text('court'),
  refereeId: integer('referee_id'),
  
  // Administrative
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Individual Matches Within Team Matches
export const individualMatches = pgTable('individual_matches', {
  id: serial('id').primaryKey(),
  teamMatchId: integer('team_match_id').notNull(),
  matchType: text('match_type').notNull(), // 'singles', 'doubles', 'mixed_doubles'
  matchPosition: integer('match_position').notNull(), // Order within team match
  pointValue: integer('point_value').notNull().default(1),
  
  // Players
  team1Players: jsonb('team1_players').notNull(), // Array of user IDs
  team2Players: jsonb('team2_players').notNull(), // Array of user IDs
  
  // Match Result
  winner: text('winner'), // 'team1', 'team2'
  score: text('score'),
  games: jsonb('games'), // Array of game scores
  
  // Match Details
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  duration: integer('duration'), // Minutes
  
  // Administrative
  createdAt: timestamp('created_at').defaultNow(),
});

// Team Lineups Table
export const teamLineups = pgTable('team_lineups', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id').notNull(),
  teamMatchId: integer('team_match_id'),
  lineupName: text('lineup_name').notNull().default('Default'),
  
  // Lineup Configuration
  lineup: jsonb('lineup').notNull(), // MatchPosition -> PlayerIds mapping
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  
  // Submission Details
  submittedAt: timestamp('submitted_at').defaultNow(),
  submittedBy: integer('submitted_by').notNull(),
  
  // Administrative
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const teamTournamentsRelations = relations(teamTournaments, ({ many }) => ({
  teams: many(teams),
  teamMatches: many(teamMatches),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  tournament: one(teamTournaments, {
    fields: [teams.tournamentId],
    references: [teamTournaments.id],
  }),
  players: many(teamPlayers),
  team1Matches: many(teamMatches, { relationName: 'team1' }),
  team2Matches: many(teamMatches, { relationName: 'team2' }),
  lineups: many(teamLineups),
}));

export const teamPlayersRelations = relations(teamPlayers, ({ one }) => ({
  team: one(teams, {
    fields: [teamPlayers.teamId],
    references: [teams.id],
  }),
}));

export const teamMatchesRelations = relations(teamMatches, ({ one, many }) => ({
  tournament: one(teamTournaments, {
    fields: [teamMatches.tournamentId],
    references: [teamTournaments.id],
  }),
  team1: one(teams, {
    fields: [teamMatches.team1Id],
    references: [teams.id],
    relationName: 'team1',
  }),
  team2: one(teams, {
    fields: [teamMatches.team2Id],
    references: [teams.id],
    relationName: 'team2',
  }),
  individualMatches: many(individualMatches),
}));

export const individualMatchesRelations = relations(individualMatches, ({ one }) => ({
  teamMatch: one(teamMatches, {
    fields: [individualMatches.teamMatchId],
    references: [teamMatches.id],
  }),
}));

export const teamLineupsRelations = relations(teamLineups, ({ one }) => ({
  team: one(teams, {
    fields: [teamLineups.teamId],
    references: [teams.id],
  }),
  teamMatch: one(teamMatches, {
    fields: [teamLineups.teamMatchId],
    references: [teamMatches.id],
  }),
}));

// Zod Schemas
export const insertTeamTournamentSchema = createInsertSchema(teamTournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamPlayerSchema = createInsertSchema(teamPlayers).omit({
  id: true,
  joinedAt: true,
});

export const insertTeamMatchSchema = createInsertSchema(teamMatches).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertIndividualMatchSchema = createInsertSchema(individualMatches).omit({
  id: true,
  createdAt: true,
});

export const insertTeamLineupSchema = createInsertSchema(teamLineups).omit({
  id: true,
  createdAt: true,
});

// Types
export type TeamTournament = typeof teamTournaments.$inferSelect;
export type InsertTeamTournament = z.infer<typeof insertTeamTournamentSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamPlayer = typeof teamPlayers.$inferSelect;
export type InsertTeamPlayer = z.infer<typeof insertTeamPlayerSchema>;

export type TeamMatch = typeof teamMatches.$inferSelect;
export type InsertTeamMatch = z.infer<typeof insertTeamMatchSchema>;

export type IndividualMatch = typeof individualMatches.$inferSelect;
export type InsertIndividualMatch = z.infer<typeof insertIndividualMatchSchema>;

export type TeamLineup = typeof teamLineups.$inferSelect;
export type InsertTeamLineup = z.infer<typeof insertTeamLineupSchema>;

// Configuration Type Definitions
export interface TeamStructureConfig {
  minPlayers: number;
  maxPlayers: number;
  requiredMales?: number;
  requiredFemales?: number;
  allowSubstitutes: boolean;
  maxSubstitutes?: number;
}

export interface MatchStructureConfig {
  totalMatches: number;
  matchTypes: Array<{
    type: 'singles' | 'doubles' | 'mixed_doubles';
    count: number;
    order: number;
    pointValue: number;
    description: string;
  }>;
  scoringSystem: 'match_wins' | 'total_points' | 'weighted_points';
  tiebreakRules: string[];
}

export interface EligibilityConfig {
  teamRatingLimits: {
    maxTotalDUPR?: number;
    maxAverageDUPR?: number;
    minAverageDUPR?: number;
    allowUnratedPlayers: boolean;
    unratedPlayerDUPRAssumption?: number;
  };
  teamRankingLimits: {
    maxTotalRankingPoints?: number;
    maxAverageRankingPoints?: number;
    minTotalRankingPoints?: number;
    allowNewPlayers: boolean;
  };
  individualPlayerCriteria: {
    minDUPR?: number;
    maxDUPR?: number;
    minRankingPoints?: number;
    maxRankingPoints?: number;
    requireVerifiedRating: boolean;
    allowSelfRating: boolean;
    minTournamentsPlayed?: number;
  };
  advancedRestrictions: {
    residencyRequirement?: string;
    membershipRequirement?: string;
    ageRestrictions?: {
      minAge?: number;
      maxAge?: number;
      averageAgeLimit?: number;
    };
    professionalStatus: 'amateur_only' | 'semi_pro_allowed' | 'professional_allowed' | 'mixed';
    genderRequirements?: 'men_only' | 'women_only' | 'mixed_required' | 'open';
  };
}

export interface TournamentFormatConfig {
  format: 'round_robin' | 'single_elimination' | 'double_elimination' | 'swiss' | 'pool_play_playoff';
  poolSettings?: {
    teamsPerPool: number;
    poolAdvancement: number;
  };
  playoffSettings?: {
    playoffFormat: 'single_elimination' | 'double_elimination';
    numberOfRounds: number;
  };
}

export interface LineupRulesConfig {
  lineupSubmissionDeadline: 'tournament_start' | 'day_before' | 'round_start' | 'match_start';
  allowLineupChanges: boolean;
  lineupChangeDeadline?: string;
  playingTimeRequirements?: {
    minMatchesPerPlayer?: number;
    maxMatchesPerPlayer?: number;
    mustRotatePlayers: boolean;
  };
  strengthOrderRequirements?: {
    enforceStrengthOrder: boolean;
    keyPositions?: number[];
  };
}