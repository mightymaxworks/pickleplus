/**
 * PKL-278651-TOURN-SYSTEM
 * Comprehensive Tournament Management System Schema
 * 
 * This file contains enhanced tournament schema to support the comprehensive 
 * tournament management system with ranking points integration.
 */

import { pgTable, serial, integer, varchar, text, boolean, timestamp, json, date, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, tournaments } from "../schema";

/**
 * Tournament Tiers - Represents different tournament importance levels with point multipliers
 */
export const tournamentTiers = pgTable("tournament_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  pointsMultiplier: real("points_multiplier").notNull(),
  description: text("description"),
  badgeUrl: varchar("badge_url", { length: 255 }),
  requiresVerification: boolean("requires_verification").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Round Point Values - Base point awards for each round
 */
export const tournamentRoundPoints = pgTable("tournament_round_points", {
  id: serial("id").primaryKey(),
  roundName: varchar("round_name", { length: 50 }).notNull().unique(), // R64, R32, R16, QF, SF, F, Champion
  displayName: varchar("display_name", { length: 100 }).notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  roundOrder: integer("round_order").notNull(), // For sorting (1 = earliest round)
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Categories - Singles, Doubles, Mixed Doubles
 */
export const tournamentCategories = pgTable("tournament_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  playersPerTeam: integer("players_per_team").notNull(),
  description: text("description"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Age Divisions
 */
export const tournamentAgeDivisions = pgTable("tournament_age_divisions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // 19+, 35+, 50+, 65+
  code: varchar("code", { length: 20 }).notNull().unique(),
  minAge: integer("min_age").notNull(),
  maxAge: integer("max_age"),
  description: text("description"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Team Rules - Defines team composition requirements
 */
export const tournamentTeamRules = pgTable("tournament_team_rules", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  minTeamSize: integer("min_team_size").notNull().default(2),
  maxTeamSize: integer("max_team_size").notNull().default(2),
  minFemaleMembers: integer("min_female_members").default(0),
  minMaleMembers: integer("min_male_members").default(0),
  minAgeTotal: integer("min_age_total").default(0), // For combined age requirements
  maxAgeTotal: integer("max_age_total"), // For combined age requirements
  otherRequirements: text("other_requirements"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Round Robin Groups - For round robin tournament format
 */
export const roundRobinGroups = pgTable("round_robin_groups", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  bracketId: integer("bracket_id"),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Group A"
  teamsCount: integer("teams_count").notNull(),
  advancingTeams: integer("advancing_teams").default(1), // How many teams advance to the next stage
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Round Robin Matches - Matches within round robin groups
 */
export const roundRobinMatches = pgTable("round_robin_matches", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => roundRobinGroups.id),
  team1Id: integer("team1_id"),
  team2Id: integer("team2_id"),
  winnerId: integer("winner_id"),
  loserId: integer("loser_id"),
  score: varchar("score", { length: 100 }), // Formatted as "21-15, 21-17" for example
  scoreDetails: json("score_details"), // Detailed scoring information
  matchDate: timestamp("match_date"),
  courtNumber: varchar("court_number", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  pointsAwarded: boolean("points_awarded").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Points Transactions - Tracks all ranking points awarded from tournaments
 */
export const tournamentPointsTransactions = pgTable("tournament_points_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  points: integer("points").notNull(),
  tierMultiplier: real("tier_multiplier").notNull(),
  basePoints: integer("base_points").notNull(), // Points before multiplier
  reason: varchar("reason", { length: 255 }).notNull(), // e.g., "Semi-finals finish", "Group winner"
  transactionDate: timestamp("transaction_date").defaultNow(),
  expiryDate: timestamp("expiry_date"), // When points will be removed due to decay
  isTournamentTeam: boolean("is_tournament_team").default(false), // Indicates team tournament participation
  teamId: integer("team_id"), // If awarded as part of a team
  
  // Point decay tracking
  decayPercentage: integer("decay_percentage").default(0), // Current decay percentage (0-100)
  effectivePoints: integer("effective_points"), // Points after decay calculation
  lastDecayDate: timestamp("last_decay_date"), // Last time decay was applied
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Waitlist - For managing tournament registration waitlists
 */
export const tournamentWaitlist = pgTable("tournament_waitlist", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  position: integer("position").notNull(),
  requestDate: timestamp("request_date").defaultNow(),
  notificationSent: boolean("notification_sent").default(false),
  status: varchar("status", { length: 50 }).notNull().default("waiting"), // waiting, offered, accepted, declined, expired
  expiryDate: timestamp("expiry_date"), // If offered a spot, when offer expires
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Series - For managing connected tournaments (e.g., "Grand Slam" series)
 */
export const tournamentSeries = pgTable("tournament_series", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  bonusPointsAvailable: boolean("bonus_points_available").default(false),
  maxBonusPoints: integer("max_bonus_points"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Tournament Series Events - Links tournaments to series
 */
export const tournamentSeriesEvents = pgTable("tournament_series_events", {
  id: serial("id").primaryKey(),
  seriesId: integer("series_id").notNull().references(() => tournamentSeries.id),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  eventOrder: integer("event_order").notNull(), // Order in the series (1 = first event)
  pointsWeight: real("points_weight").default(1.0), // Some events might be worth more in the series
  isMajor: boolean("is_major").default(false), // Designates major events in the series
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const tournamentTiersRelations = relations(tournamentTiers, ({ many }) => ({
  tournaments: many(tournaments)
}));

export const tournamentTeamRulesRelations = relations(tournamentTeamRules, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentTeamRules.tournamentId],
    references: [tournaments.id]
  })
}));

export const roundRobinGroupsRelations = relations(roundRobinGroups, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [roundRobinGroups.tournamentId],
    references: [tournaments.id]
  }),
  matches: many(roundRobinMatches)
}));

export const roundRobinMatchesRelations = relations(roundRobinMatches, ({ one }) => ({
  group: one(roundRobinGroups, {
    fields: [roundRobinMatches.groupId],
    references: [roundRobinGroups.id]
  })
}));

export const tournamentPointsTransactionsRelations = relations(tournamentPointsTransactions, ({ one }) => ({
  user: one(users, {
    fields: [tournamentPointsTransactions.userId],
    references: [users.id]
  }),
  tournament: one(tournaments, {
    fields: [tournamentPointsTransactions.tournamentId],
    references: [tournaments.id]
  })
}));

export const tournamentWaitlistRelations = relations(tournamentWaitlist, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [tournamentWaitlist.tournamentId],
    references: [tournaments.id]
  }),
  user: one(users, {
    fields: [tournamentWaitlist.userId],
    references: [users.id]
  })
}));

export const tournamentSeriesRelations = relations(tournamentSeries, ({ many }) => ({
  seriesEvents: many(tournamentSeriesEvents)
}));

export const tournamentSeriesEventsRelations = relations(tournamentSeriesEvents, ({ one }) => ({
  series: one(tournamentSeries, {
    fields: [tournamentSeriesEvents.seriesId],
    references: [tournamentSeries.id]
  }),
  tournament: one(tournaments, {
    fields: [tournamentSeriesEvents.tournamentId],
    references: [tournaments.id]
  })
}));

// Create insert schemas for validation
export const insertTournamentTierSchema = createInsertSchema(tournamentTiers)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentRoundPointsSchema = createInsertSchema(tournamentRoundPoints)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentCategorySchema = createInsertSchema(tournamentCategories)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentAgeDivisionSchema = createInsertSchema(tournamentAgeDivisions)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentTeamRulesSchema = createInsertSchema(tournamentTeamRules)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertRoundRobinGroupSchema = createInsertSchema(roundRobinGroups)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertRoundRobinMatchSchema = createInsertSchema(roundRobinMatches)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentPointsTransactionSchema = createInsertSchema(tournamentPointsTransactions)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentWaitlistSchema = createInsertSchema(tournamentWaitlist)
  .omit({ id: true, createdAt: true, updatedAt: true, requestDate: true });

export const insertTournamentSeriesSchema = createInsertSchema(tournamentSeries)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentSeriesEventSchema = createInsertSchema(tournamentSeriesEvents)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Define TypeScript types for these tables
export type TournamentTier = typeof tournamentTiers.$inferSelect;
export type InsertTournamentTier = z.infer<typeof insertTournamentTierSchema>;

export type TournamentRoundPoint = typeof tournamentRoundPoints.$inferSelect;
export type InsertTournamentRoundPoint = z.infer<typeof insertTournamentRoundPointsSchema>;

export type TournamentCategory = typeof tournamentCategories.$inferSelect;
export type InsertTournamentCategory = z.infer<typeof insertTournamentCategorySchema>;

export type TournamentAgeDivision = typeof tournamentAgeDivisions.$inferSelect;
export type InsertTournamentAgeDivision = z.infer<typeof insertTournamentAgeDivisionSchema>;

export type TournamentTeamRule = typeof tournamentTeamRules.$inferSelect;
export type InsertTournamentTeamRule = z.infer<typeof insertTournamentTeamRulesSchema>;

export type RoundRobinGroup = typeof roundRobinGroups.$inferSelect;
export type InsertRoundRobinGroup = z.infer<typeof insertRoundRobinGroupSchema>;

export type RoundRobinMatch = typeof roundRobinMatches.$inferSelect;
export type InsertRoundRobinMatch = z.infer<typeof insertRoundRobinMatchSchema>;

export type TournamentPointsTransaction = typeof tournamentPointsTransactions.$inferSelect;
export type InsertTournamentPointsTransaction = z.infer<typeof insertTournamentPointsTransactionSchema>;

export type TournamentWaitlistEntry = typeof tournamentWaitlist.$inferSelect;
export type InsertTournamentWaitlistEntry = z.infer<typeof insertTournamentWaitlistSchema>;

export type TournamentSeries = typeof tournamentSeries.$inferSelect;
export type InsertTournamentSeries = z.infer<typeof insertTournamentSeriesSchema>;

export type TournamentSeriesEvent = typeof tournamentSeriesEvents.$inferSelect;
export type InsertTournamentSeriesEvent = z.infer<typeof insertTournamentSeriesEventSchema>;