/**
 * Schema for multi-dimensional ranking system
 */
import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { PlayFormat, AgeDivision } from "../../../shared/multi-dimensional-rankings";

/**
 * Player rankings table - stores current ranking points
 */
export const playerRankings = pgTable("player_rankings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  format: text("format").$type<PlayFormat>().notNull(),
  ageDivision: text("age_division").$type<AgeDivision>().notNull(),
  ratingTierId: integer("rating_tier_id"),
  rankingPoints: integer("ranking_points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

/**
 * Ranking history table - stores changes to ranking points
 */
export const rankingHistory = pgTable("multi_ranking_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  format: text("format").$type<PlayFormat>().notNull(),
  ageDivision: text("age_division").$type<AgeDivision>().notNull(),
  ratingTierId: integer("rating_tier_id"),
  oldRanking: integer("old_ranking").notNull(),
  newRanking: integer("new_ranking").notNull(),
  reason: text("reason").notNull(),
  matchId: integer("match_id"),
  tournamentId: integer("tournament_id"),
  createdAt: timestamp("created_at").defaultNow()
});