import { pgTable, text, serial, integer, boolean, timestamp, json, date, varchar, decimal, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

/**
 * CourtIQ Rating and Ranking System Schema
 */

// Player ratings table
// Stores the current rating for each player across divisions and formats
export const playerRatings = pgTable("player_ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull().default(1000), // ELO-like rating (1000-2500)
  tier: text("tier").notNull().default("Dink Dabbler"), // Current tier name
  confidenceLevel: integer("confidence_level").notNull().default(0), // 0-100, how confident is the system in this rating
  matchesPlayed: integer("matches_played").notNull().default(0),
  division: text("division").notNull().default("19+"), // "19+", "35+", "50+", "60+", "70+"
  format: text("format").notNull().default("singles"), // "singles", "mens_doubles", "womens_doubles", "mixed_doubles"
  isProvisional: boolean("is_provisional").notNull().default(true),
  lastMatchDate: timestamp("last_match_date"),
  seasonHighRating: integer("season_high_rating"), // Season high watermark
  allTimeHighRating: integer("all_time_high_rating"), // All-time high watermark
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Define a composite unique constraint for user, division and format
export const playerRatingConstraint = pgTable("player_ratings", {
  userId: integer("user_id").notNull().references(() => users.id),
  division: text("division").notNull(),
  format: text("format").notNull()
}, t => ({
  unq: primaryKey({ columns: [t.userId, t.division, t.format] })
}));

// Rating history table
// Tracks all rating changes for historical analysis
export const ratingHistory = pgTable("rating_history", {
  id: serial("id").primaryKey(),
  playerRatingId: integer("player_rating_id").notNull().references(() => playerRatings.id),
  oldRating: integer("old_rating").notNull(),
  newRating: integer("new_rating").notNull(),
  ratingChange: integer("rating_change").notNull(), // Calculated change (can be positive or negative)
  matchId: integer("match_id"), // Can be null for administrative adjustments
  reason: text("reason").notNull(), // "match_result", "tournament", "season_reset", "manual_adjustment"
  kFactor: integer("k_factor"), // The K-factor used for this rating change
  expectedOutcome: decimal("expected_outcome", { precision: 4, scale: 3 }), // The statistical expectation (0-1)
  actualOutcome: decimal("actual_outcome", { precision: 4, scale: 3 }), // The actual outcome (0-1)
  notes: text("notes"), // Any additional details about this rating change
  createdAt: timestamp("created_at").defaultNow()
});

// Ranking points table
// Stores accumulated points for leaderboards
export const rankingPoints = pgTable("ranking_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  points: integer("points").notNull().default(0),
  season: text("season").notNull(), // e.g., "2025-S1" for 2025 Season 1
  division: text("division").notNull().default("19+"),
  format: text("format").notNull().default("singles"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  // New fields
  totalMatches: integer("total_matches").notNull().default(0),
  tournamentCount: integer("tournament_count").notNull().default(0),
  winsCount: integer("wins_count").notNull().default(0),
  lossesCount: integer("losses_count").notNull().default(0),
  decayProtectedUntil: timestamp("decay_protected_until"), // For returning players protection
  tier: text("competitive_tier"), // Competitive tier based on points (different from skill tier)
  seasonHighPoints: integer("season_high_points"), // Season high watermark for points
  allTimeHighPoints: integer("all_time_high_points") // All-time high watermark
});

// Define composite unique constraint for user, season, division and format
export const rankingPointsConstraint = pgTable("ranking_points", {
  userId: integer("user_id").notNull().references(() => users.id),
  season: text("season").notNull(),
  division: text("division").notNull(),
  format: text("format").notNull()
}, t => ({
  unq: primaryKey({ columns: [t.userId, t.season, t.division, t.format] })
}));

// Points history table
// Tracks all point changes
export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  points: integer("points").notNull(), // The points awarded (always positive)
  season: text("season").notNull(),
  division: text("division").notNull(),
  format: text("format").notNull(),
  source: text("source").notNull(), // "match_win", "tournament_placement", "achievement", etc.
  sourceId: integer("source_id"), // ID of the source (match ID, tournament ID, etc.)
  multiplier: decimal("multiplier", { precision: 4, scale: 2 }).default("1.00"), // Any multipliers applied
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  // New fields for enhanced tracking
  basePoints: integer("base_points").notNull().default(0), // Base points before modifiers
  ratingDifferential: integer("rating_differential"), // Rating difference that affected points
  bonusPoints: integer("bonus_points").default(0), // Additional bonus points
  bonusSource: text("bonus_source"), // Source of bonus ("rating_diff", "tournament_size", etc.)
  eventTier: text("event_tier"), // "local", "regional", "national", "international"
  matchType: text("match_type"), // "casual", "league", "tournament"
  winType: text("win_type") // "expected", "upset", "blowout", etc.
});

// Tiers configuration table
// Defines the tier structure
export const ratingTiers = pgTable("rating_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // Tier name (e.g., "Dink Dabbler", "Tournament Titan")
  minRating: integer("min_rating").notNull(), // Minimum rating for this tier
  maxRating: integer("max_rating").notNull(), // Maximum rating for this tier
  badgeUrl: text("badge_url"), // URL to the tier badge image
  colorCode: text("color_code"), // Color code for UI display
  // Protection level indicates how much rating protection this tier has
  // 0 = no protection (full rating changes)
  // 100 = full protection (no rating loss)
  protectionLevel: integer("protection_level").notNull().default(0),
  description: text("description"),
  order: integer("order").notNull() // For sorting (1 = lowest tier, 10 = highest tier)
});

// Seasons table
// Tracks season information
export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., "2025 Season 1"
  code: text("code").notNull().unique(), // e.g., "2025-S1"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  resetPercentage: integer("reset_percentage").notNull().default(50), // How much to reset ratings at season end (as percentage)
  description: text("description")
});

// Player rivals table
// Tracks player rivalries for social features
export const playerRivals = pgTable("player_rivals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  rivalId: integer("rival_id").notNull().references(() => users.id),
  matchesPlayed: integer("matches_played").notNull().default(0),
  userWins: integer("user_wins").notNull().default(0),
  rivalWins: integer("rival_wins").notNull().default(0),
  lastMatchDate: timestamp("last_match_date"),
  isAutoGenerated: boolean("is_auto_generated").notNull().default(true), // If system-generated or manually designated
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Protection overrides table
// Tracks special protection mechanics like challenge matches
export const ratingProtections = pgTable("rating_protections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  protectionType: text("protection_type").notNull(), // "challenge_match", "returning_player", "streak_breaker"
  remainingUses: integer("remaining_uses").notNull(),
  refreshDate: timestamp("refresh_date"), // When more uses will be granted
  expirationDate: timestamp("expiration_date"), // When this protection expires
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tournament eligibility configuration table
// Defines the rating and ranking point requirements for tournament tiers
export const tournamentEligibility = pgTable("tournament_eligibility", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Name of the tournament tier (e.g., "Open", "Regional Championship")
  level: text("level").notNull(), // Level code ("open", "local", "regional", "national", "premier")
  ratingRequirement: integer("rating_requirement"), // Minimum rating required
  pointsRequirement: integer("points_requirement"), // Minimum ranking points required
  // Alternative qualification paths
  exceptionalSkillRatingBonus: integer("exceptional_skill_rating_bonus").default(200), // Rating bonus for exceptional skill path
  exceptionalSkillPointsPercentage: integer("exceptional_skill_points_percentage").default(60), // Percentage of points required for exceptional skill path
  provenCompetitorPointsBonus: integer("proven_competitor_points_bonus").default(150), // Percentage of extra points for proven competitor path
  provenCompetitorRatingPercentage: integer("proven_competitor_rating_percentage").default(80), // Percentage of rating required for proven competitor path
  wildCardSlotsAvailable: integer("wild_card_slots_available").default(0), // Number of wild card slots (director's invitation)
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Define relations

export const playerRatingsRelations = relations(playerRatings, ({ one, many }) => ({
  user: one(users, {
    fields: [playerRatings.userId],
    references: [users.id]
  }),
  ratingHistory: many(ratingHistory)
}));

export const ratingHistoryRelations = relations(ratingHistory, ({ one }) => ({
  playerRating: one(playerRatings, {
    fields: [ratingHistory.playerRatingId],
    references: [playerRatings.id]
  })
}));

export const rankingPointsRelations = relations(rankingPoints, ({ one }) => ({
  user: one(users, {
    fields: [rankingPoints.userId],
    references: [users.id]
  })
}));

export const pointsHistoryRelations = relations(pointsHistory, ({ one }) => ({
  user: one(users, {
    fields: [pointsHistory.userId],
    references: [users.id]
  })
}));

export const playerRivalsRelations = relations(playerRivals, ({ one }) => ({
  user: one(users, {
    fields: [playerRivals.userId],
    references: [users.id],
    relationName: "userRivalries"
  }),
  rival: one(users, {
    fields: [playerRivals.rivalId],
    references: [users.id],
    relationName: "rivalOf"
  })
}));

export const ratingProtectionsRelations = relations(ratingProtections, ({ one }) => ({
  user: one(users, {
    fields: [ratingProtections.userId],
    references: [users.id]
  })
}));

// Create insert schemas for validation

export const insertPlayerRatingSchema = createInsertSchema(playerRatings)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertRatingHistorySchema = createInsertSchema(ratingHistory)
  .omit({ id: true, createdAt: true });

export const insertRankingPointsSchema = createInsertSchema(rankingPoints)
  .omit({ id: true, lastUpdated: true });

export const insertPointsHistorySchema = createInsertSchema(pointsHistory)
  .omit({ id: true, createdAt: true });

export const insertRatingTierSchema = createInsertSchema(ratingTiers)
  .omit({ id: true });

export const insertSeasonSchema = createInsertSchema(seasons)
  .omit({ id: true });

export const insertPlayerRivalSchema = createInsertSchema(playerRivals)
  .omit({ id: true, createdAt: true });

export const insertRatingProtectionSchema = createInsertSchema(ratingProtections)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentEligibilitySchema = createInsertSchema(tournamentEligibility)
  .omit({ id: true, createdAt: true, updatedAt: true });

// XP Levels table
// Defines the level thresholds and unlocks
export const xpLevels = pgTable("xp_levels", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull().unique(),
  name: text("name").notNull(),
  minXP: integer("min_xp").notNull(),
  maxXP: integer("max_xp").notNull(),
  badgeUrl: text("badge_url"),
  colorCode: text("color_code"),
  description: text("description"),
  unlocks: json("unlocks").default([]) // Features or privileges unlocked at this level
});

// XP History table
// Tracks all XP transactions
export const xpHistory = pgTable("xp_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // Can be positive or negative
  source: text("source").notNull(), // "match_played", "match_won", "achievement", "tournament_checkin", "code_redemption", etc.
  sourceId: integer("source_id"), // ID of the source (match ID, achievement ID, etc.)
  multiplier: integer("multiplier").default(100), // 100 = 1.0x, 110 = 1.1x, etc.
  newTotal: integer("new_total").notNull(), // Total XP after this transaction
  newLevel: integer("new_level").notNull(), // Level after this transaction
  wasLevelUp: boolean("was_level_up").default(false), // Whether this transaction caused a level up
  notes: text("notes"),
  metadata: json("metadata").default({}), // Additional context about the transaction
  createdAt: timestamp("created_at").defaultNow()
});

// XP Multipliers table
// Tracks active XP multipliers
export const xpMultipliers = pgTable("xp_multipliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  value: integer("value").notNull().default(100), // 100 = 1.0x, 150 = 1.5x, etc.
  reason: text("reason").notNull(), // "founding_member", "special_code", "event", etc.
  sourceId: integer("source_id"), // ID of the source (code ID, event ID, etc.)
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"), // When the multiplier expires
  isActive: boolean("is_active").default(true),
  stackable: boolean("stackable").default(false), // Whether this multiplier can stack with others
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Create insert schemas for XP tables
export const insertXpLevelSchema = createInsertSchema(xpLevels)
  .omit({ id: true });

export const insertXpHistorySchema = createInsertSchema(xpHistory)
  .omit({ id: true, createdAt: true });
  
export const insertXpMultiplierSchema = createInsertSchema(xpMultipliers)
  .omit({ id: true, createdAt: true });

// Relations for XP tables
export const xpHistoryRelations = relations(xpHistory, ({ one }) => ({
  user: one(users, {
    fields: [xpHistory.userId],
    references: [users.id]
  })
}));

export const xpMultipliersRelations = relations(xpMultipliers, ({ one }) => ({
  user: one(users, {
    fields: [xpMultipliers.userId],
    references: [users.id]
  })
}));

// Types

export type PlayerRating = typeof playerRatings.$inferSelect;
export type InsertPlayerRating = z.infer<typeof insertPlayerRatingSchema>;

export type RatingHistory = typeof ratingHistory.$inferSelect;
export type InsertRatingHistory = z.infer<typeof insertRatingHistorySchema>;

export type RankingPoints = typeof rankingPoints.$inferSelect;
export type InsertRankingPoints = z.infer<typeof insertRankingPointsSchema>;

export type PointsHistory = typeof pointsHistory.$inferSelect;
export type InsertPointsHistory = z.infer<typeof insertPointsHistorySchema>;

export type RatingTier = typeof ratingTiers.$inferSelect;
export type InsertRatingTier = z.infer<typeof insertRatingTierSchema>;

export type Season = typeof seasons.$inferSelect;
export type InsertSeason = z.infer<typeof insertSeasonSchema>;

export type PlayerRival = typeof playerRivals.$inferSelect;
export type InsertPlayerRival = z.infer<typeof insertPlayerRivalSchema>;

export type RatingProtection = typeof ratingProtections.$inferSelect;
export type InsertRatingProtection = z.infer<typeof insertRatingProtectionSchema>;

export type TournamentEligibility = typeof tournamentEligibility.$inferSelect;
export type InsertTournamentEligibility = z.infer<typeof insertTournamentEligibilitySchema>;

export type XpLevel = typeof xpLevels.$inferSelect;
export type InsertXpLevel = z.infer<typeof insertXpLevelSchema>;

export type XpHistory = typeof xpHistory.$inferSelect;
export type InsertXpHistory = z.infer<typeof insertXpHistorySchema>;

export type XpMultiplier = typeof xpMultipliers.$inferSelect;
export type InsertXpMultiplier = z.infer<typeof insertXpMultiplierSchema>;