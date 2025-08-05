// Match verification system for player-recorded matches
import { pgTable, serial, integer, varchar, text, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Player-recorded matches requiring verification
export const playerMatches = pgTable("player_matches", {
  id: serial("id").primaryKey(),
  recordedById: integer("recorded_by_id").notNull(),
  player1Id: integer("player1_id").notNull(),
  player2Id: integer("player2_id").notNull(),
  player1PartnerId: integer("player1_partner_id"), // For doubles
  player2PartnerId: integer("player2_partner_id"), // For doubles
  format: varchar("format", { length: 20 }).notNull(), // 'singles' | 'doubles'
  player1Score: integer("player1_score"),
  player2Score: integer("player2_score"),
  team1Score: integer("team1_score"), // For doubles
  team2Score: integer("team2_score"), // For doubles
  winnerId: integer("winner_id"),
  winningTeamPlayer1Id: integer("winning_team_player1_id"), // For doubles
  winningTeamPlayer2Id: integer("winning_team_player2_id"), // For doubles
  matchDate: timestamp("match_date").notNull(),
  venue: varchar("venue", { length: 255 }),
  court: varchar("court", { length: 50 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default("pending_verification"), // 'pending_verification' | 'verified' | 'disputed' | 'rejected'
  competitionId: integer("competition_id"), // Optional link to competition
  winnerPoints: integer("winner_points"),
  loserPoints: integer("loser_points"),
  pointsAllocated: boolean("points_allocated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Match verification records - tracks who needs to verify
export const matchVerifications = pgTable("match_verifications", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  playerId: integer("player_id").notNull(), // Player who needs to verify
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending' | 'verified' | 'disputed'
  verifiedAt: timestamp("verified_at"),
  disputeReason: text("dispute_reason"), // If disputed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Point allocation audit trail for admin overrides
export const pointAllocationAudits = pgTable("point_allocation_audits", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  matchType: varchar("match_type", { length: 20 }).notNull(), // 'admin' | 'player'
  originalWinnerPoints: integer("original_winner_points"),
  originalLoserPoints: integer("original_loser_points"),
  finalWinnerPoints: integer("final_winner_points").notNull(),
  finalLoserPoints: integer("final_loser_points").notNull(),
  overriddenBy: integer("overridden_by"), // Admin who made the override
  overrideReason: text("override_reason"),
  calculationMethod: varchar("calculation_method", { length: 50 }).notNull(), // 'automatic' | 'manual_override'
  competitionType: varchar("competition_type", { length: 20 }), // 'casual' | 'league' | 'tournament'
  pointsMultiplier: varchar("points_multiplier", { length: 10 }).default("1.0"),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const playerMatchesRelations = relations(playerMatches, ({ many }) => ({
  verifications: many(matchVerifications),
  auditTrail: many(pointAllocationAudits)
}));

export const matchVerificationsRelations = relations(matchVerifications, ({ one }) => ({
  match: one(playerMatches, {
    fields: [matchVerifications.matchId],
    references: [playerMatches.id]
  })
}));

export const pointAllocationAuditsRelations = relations(pointAllocationAudits, ({ one }) => ({
  playerMatch: one(playerMatches, {
    fields: [pointAllocationAudits.matchId],
    references: [playerMatches.id]
  })
}));

// Schemas
export const createPlayerMatchSchema = createInsertSchema(playerMatches, {
  recordedById: z.number().positive(),
  player1Id: z.number().positive(),
  player2Id: z.number().positive(),
  format: z.enum(["singles", "doubles"]),
  matchDate: z.date(),
  venue: z.string().min(1).max(255).optional(),
  court: z.string().max(50).optional(),
  notes: z.string().max(1000).optional()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true,
  status: true,
  pointsAllocated: true
});

export const recordMatchScoreSchema = createInsertSchema(playerMatches, {
  player1Score: z.number().min(0).max(21),
  player2Score: z.number().min(0).max(21),
  team1Score: z.number().min(0).max(21).optional(),
  team2Score: z.number().min(0).max(21).optional(),
  winnerId: z.number().positive().optional(),
  winningTeamPlayer1Id: z.number().positive().optional(),
  winningTeamPlayer2Id: z.number().positive().optional()
}).pick({
  player1Score: true,
  player2Score: true,
  team1Score: true,
  team2Score: true,
  winnerId: true,
  winningTeamPlayer1Id: true,
  winningTeamPlayer2Id: true
});

export const verifyMatchSchema = z.object({
  status: z.enum(["verified", "disputed"]),
  disputeReason: z.string().max(500).optional()
});

export const auditPointAllocationSchema = createInsertSchema(pointAllocationAudits, {
  matchId: z.number().positive(),
  matchType: z.enum(["admin", "player"]),
  finalWinnerPoints: z.number().min(0),
  finalLoserPoints: z.number().min(0),
  calculationMethod: z.enum(["automatic", "manual_override"]),
  overrideReason: z.string().max(500).optional()
}).omit({
  id: true,
  createdAt: true
});

// Types
export type PlayerMatch = typeof playerMatches.$inferSelect;
export type InsertPlayerMatch = z.infer<typeof createPlayerMatchSchema>;
export type MatchVerification = typeof matchVerifications.$inferSelect;
export type InsertMatchVerification = typeof matchVerifications.$inferInsert;
export type PointAllocationAudit = typeof pointAllocationAudits.$inferSelect;
export type InsertPointAllocationAudit = z.infer<typeof auditPointAllocationSchema>;

// Match with verification details
export type PlayerMatchWithVerifications = PlayerMatch & {
  verifications: MatchVerification[];
  pendingVerifications: number;
  allVerified: boolean;
  auditTrail: PointAllocationAudit[];
};