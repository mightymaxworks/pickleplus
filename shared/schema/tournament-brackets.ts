/**
 * PKL-278651-TOURN-0001-BRCKT
 * Tournament Bracket System Schema
 * 
 * This file contains the database schema for the tournament bracket system.
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";
import { tournaments } from "../schema";

/**
 * Tournament Teams - Represents a doubles team in a tournament
 */
export const tournamentTeams = pgTable("tournament_teams", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  playerOneId: integer("player_one_id").notNull().references(() => users.id),
  playerTwoId: integer("player_two_id").notNull().references(() => users.id),
  teamName: varchar("team_name", { length: 100 }),
  seedNumber: integer("seed_number"),
  registrationDate: timestamp("registration_date").defaultNow(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, withdrawn, disqualified
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Brackets - Represents a tournament bracket structure
 */
export const tournamentBrackets = pgTable("tournament_brackets", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  name: varchar("name", { length: 100 }).notNull(),
  bracketType: varchar("bracket_type", { length: 50 }).notNull().default("single_elimination"), // single_elimination, double_elimination, round_robin
  teamsCount: integer("teams_count").notNull(),
  roundsCount: integer("rounds_count").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("created"), // created, in_progress, completed
  seedingMethod: varchar("seeding_method", { length: 50 }).default("manual"), // manual, rating_based, random
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  metadata: json("metadata"), // Additional bracket settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Rounds - Represents rounds within a tournament bracket
 */
export const tournamentRounds = pgTable("tournament_rounds", {
  id: serial("id").primaryKey(),
  bracketId: integer("bracket_id").notNull().references(() => tournamentBrackets.id),
  roundNumber: integer("round_number").notNull(), // 1-based numbering (1 = first round)
  roundName: varchar("round_name", { length: 100 }), // e.g., "Quarter-finals", "Semi-finals", etc.
  matchesCount: integer("matches_count").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Bracket Matches - Represents matches within a tournament bracket
 */
export const tournamentBracketMatches = pgTable("tournament_bracket_matches", {
  id: serial("id").primaryKey(),
  bracketId: integer("bracket_id").notNull().references(() => tournamentBrackets.id),
  roundId: integer("round_id").notNull().references(() => tournamentRounds.id),
  matchNumber: integer("match_number").notNull(), // Sequential number in the bracket
  team1Id: integer("team1_id").references(() => tournamentTeams.id),
  team2Id: integer("team2_id").references(() => tournamentTeams.id),
  winnerId: integer("winner_id").references(() => tournamentTeams.id),
  loserId: integer("loser_id").references(() => tournamentTeams.id),
  nextMatchId: integer("next_match_id"), // Will be manually referenced in relations
  consolationMatchId: integer("consolation_match_id"), // Will be manually referenced in relations
  
  // Match details
  score: varchar("score", { length: 100 }), // Formatted as "21-15, 21-17" for example
  scoreDetails: json("score_details"), // Detailed scoring information
  matchDate: timestamp("match_date"),
  courtNumber: varchar("court_number", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  
  // Ranking points
  rankingPointsAwarded: boolean("ranking_points_awarded").default(false),
  team1PointsAwarded: integer("team1_points_awarded"),
  team2PointsAwarded: integer("team2_points_awarded"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations for tournamentTeams
export const tournamentTeamsRelations = relations(tournamentTeams, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentTeams.tournamentId],
    references: [tournaments.id]
  }),
  playerOne: one(users, {
    fields: [tournamentTeams.playerOneId],
    references: [users.id]
  }),
  playerTwo: one(users, {
    fields: [tournamentTeams.playerTwoId],
    references: [users.id]
  })
}));

// Relations for tournamentBrackets
export const tournamentBracketsRelations = relations(tournamentBrackets, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [tournamentBrackets.tournamentId],
    references: [tournaments.id]
  }),
  rounds: many(tournamentRounds),
  matches: many(tournamentBracketMatches)
}));

// Relations for tournamentRounds
export const tournamentRoundsRelations = relations(tournamentRounds, ({ one, many }) => ({
  bracket: one(tournamentBrackets, {
    fields: [tournamentRounds.bracketId],
    references: [tournamentBrackets.id]
  }),
  matches: many(tournamentBracketMatches)
}));

// Relations for tournamentBracketMatches
export const tournamentBracketMatchesRelations = relations(tournamentBracketMatches, ({ one }) => {
  return {
    bracket: one(tournamentBrackets, {
      fields: [tournamentBracketMatches.bracketId],
      references: [tournamentBrackets.id]
    }),
    round: one(tournamentRounds, {
      fields: [tournamentBracketMatches.roundId],
      references: [tournamentRounds.id]
    }),
    team1: one(tournamentTeams, {
      fields: [tournamentBracketMatches.team1Id],
      references: [tournamentTeams.id]
    }),
    team2: one(tournamentTeams, {
      fields: [tournamentBracketMatches.team2Id],
      references: [tournamentTeams.id]
    }),
    winner: one(tournamentTeams, {
      fields: [tournamentBracketMatches.winnerId],
      references: [tournamentTeams.id]
    }),
    loser: one(tournamentTeams, {
      fields: [tournamentBracketMatches.loserId],
      references: [tournamentTeams.id]
    }),
    nextMatch: one(tournamentBracketMatches, {
      fields: [tournamentBracketMatches.nextMatchId],
      references: [tournamentBracketMatches.id]
    }),
    consolationMatch: one(tournamentBracketMatches, {
      fields: [tournamentBracketMatches.consolationMatchId],
      references: [tournamentBracketMatches.id]
    })
  };
});

// Create insert schemas for validation
export const insertTournamentTeamSchema = createInsertSchema(tournamentTeams)
  .omit({ id: true, createdAt: true, updatedAt: true, registrationDate: true });

export const insertTournamentBracketSchema = createInsertSchema(tournamentBrackets)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentRoundSchema = createInsertSchema(tournamentRounds)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentBracketMatchSchema = createInsertSchema(tournamentBracketMatches)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Define TypeScript types for these tables
export type TournamentTeam = typeof tournamentTeams.$inferSelect;
export type InsertTournamentTeam = z.infer<typeof insertTournamentTeamSchema>;

export type TournamentBracket = typeof tournamentBrackets.$inferSelect;
export type InsertTournamentBracket = z.infer<typeof insertTournamentBracketSchema>;

export type TournamentRound = typeof tournamentRounds.$inferSelect;
export type InsertTournamentRound = z.infer<typeof insertTournamentRoundSchema>;

export type TournamentBracketMatch = typeof tournamentBracketMatches.$inferSelect;
export type InsertTournamentBracketMatch = z.infer<typeof insertTournamentBracketMatchSchema>;