import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  rating: integer("rating").notNull().default(2000), // ELO-like rating system
  skillLevel: text("skill_level").notNull().default("2.5"), // Pickleball skill level
  totalMatches: integer("total_matches").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  profileImage: text("profile_image"),
  playerId: text("player_id").notNull().unique(), // Unique ID for QR code generation
});

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  skillLevel: text("skill_level").notNull(),
  status: text("status").notNull().default("open"), // "open", "ongoing", "completed"
  imageUrl: text("image_url"),
});

export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").notNull(),
  userId: integer("user_id").notNull(),
  registrationDate: timestamp("registration_date").notNull(),
  status: text("status").notNull().default("registered"), // "registered", "checked-in", "completed"
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  matchType: text("match_type").notNull(), // "singles", "doubles"
  matchDate: timestamp("match_date").notNull(),
  tournamentId: integer("tournament_id"), // Null if it's a casual match
  players: jsonb("players").notNull(), // Array of player IDs and team assignments
  scores: jsonb("scores").notNull(), // Array of scores, can be multiple sets
  winnerIds: jsonb("winner_ids").notNull(), // Array of winner user IDs
  loserIds: jsonb("loser_ids").notNull(), // Array of loser user IDs
  xpEarned: integer("xp_earned").notNull(),
  ratingChange: jsonb("rating_change").notNull(), // Object with user IDs and their rating changes
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconClass: text("icon_class").notNull(),
  requiredValue: integer("required_value").notNull(), // Value needed to complete
  category: text("category").notNull(), // "streak", "tournament", "matches", "social", etc.
  xpReward: integer("xp_reward").notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedDate: timestamp("completed_date"),
});

export const xpCodes = pgTable("xp_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  xpValue: integer("xp_value").notNull(),
  description: text("description").notNull(),
  expiryDate: timestamp("expiry_date"),
  isUsed: boolean("is_used").notNull().default(false),
  createdBy: integer("created_by").notNull(), // Admin user ID
});

export const userCodeRedemptions = pgTable("user_code_redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  codeId: integer("code_id").notNull(),
  redeemedDate: timestamp("redeemed_date").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  playerId: true,
  totalMatches: true,
  wins: true,
  losses: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({ id: true });
export const insertTournamentParticipantSchema = createInsertSchema(tournamentParticipants).omit({ id: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true });
export const insertXpCodeSchema = createInsertSchema(xpCodes).omit({ id: true });
export const insertUserCodeRedemptionSchema = createInsertSchema(userCodeRedemptions).omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type InsertTournamentParticipant = z.infer<typeof insertTournamentParticipantSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type InsertXpCode = z.infer<typeof insertXpCodeSchema>;
export type InsertUserCodeRedemption = z.infer<typeof insertUserCodeRedemptionSchema>;

export type User = typeof users.$inferSelect;
export type Tournament = typeof tournaments.$inferSelect;
export type TournamentParticipant = typeof tournamentParticipants.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type XpCode = typeof xpCodes.$inferSelect;
export type UserCodeRedemption = typeof userCodeRedemptions.$inferSelect;
