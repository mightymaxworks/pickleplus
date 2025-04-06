// Main schema file for Pickle+ global types and tables
import { pgTable, serial, integer, varchar, text, boolean, timestamp, date, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: text("password").notNull(),
  displayName: varchar("display_name", { length: 255 }),
  location: varchar("location", { length: 255 }),
  bio: text("bio"),
  yearOfBirth: integer("year_of_birth"),
  passportId: varchar("passport_id", { length: 50 }).unique(),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  avatarInitials: varchar("avatar_initials", { length: 10 }),
  lastMatchDate: timestamp("last_match_date"),
  totalMatches: integer("total_matches").default(0),
  matchesWon: integer("matches_won").default(0),
  totalTournaments: integer("total_tournaments").default(0),
  isFoundingMember: boolean("is_founding_member").default(false),
  isAdmin: boolean("is_admin").default(false),
  xpMultiplier: integer("xp_multiplier").default(100),
  profileCompletionPct: integer("profile_completion_pct").default(0),
  rankingPoints: integer("ranking_points").default(0),
  playingSince: varchar("playing_since", { length: 50 }),
  skillLevel: varchar("skill_level", { length: 50 }),
  preferredPosition: varchar("preferred_position", { length: 50 }),
  paddleBrand: varchar("paddle_brand", { length: 50 }),
  paddleModel: varchar("paddle_model", { length: 50 }),
  playingStyle: varchar("playing_style", { length: 50 }),
  shotStrengths: varchar("shot_strengths", { length: 100 }),
  preferredFormat: varchar("preferred_format", { length: 50 }),
  dominantHand: varchar("dominant_hand", { length: 20 }),
  regularSchedule: varchar("regular_schedule", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow()
});

// Tournaments table
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationStartDate: timestamp("registration_start_date"),
  registrationEndDate: timestamp("registration_end_date"),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  format: varchar("format", { length: 50 }).notNull(),
  division: varchar("division", { length: 50 }).notNull(),
  minRating: integer("min_rating"),
  maxRating: integer("max_rating"),
  entryFee: integer("entry_fee"),
  prizePool: integer("prize_pool"),
  status: varchar("status", { length: 50 }).notNull().default("upcoming"),
  organizer: varchar("organizer", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tournament registrations table
export const tournamentRegistrations = pgTable("tournament_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  registrationDate: timestamp("registration_date").defaultNow(),
  status: varchar("status", { length: 50 }).notNull().default("registered"),
  checkedIn: boolean("checked_in").default(false),
  checkInTime: timestamp("check_in_time"),
  seedNumber: integer("seed_number"),
  placement: integer("placement"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  badgeUrl: text("badge_url"),
  xpReward: integer("xp_reward").default(0),
  pointsReward: integer("points_reward").default(0),
  requirements: json("requirements"),
  isSecret: boolean("is_secret").default(false),
  difficulty: varchar("difficulty", { length: 50 }).default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(0),
  completedAt: timestamp("completed_at"),
  displayed: boolean("displayed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  metadata: json("metadata"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Redemption codes table
export const redemptionCodes = pgTable("redemption_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  xpBonus: integer("xp_bonus").default(0),
  pointsBonus: integer("points_bonus").default(0),
  multiplier: integer("multiplier").default(100), // 100 = 1.0x, 120 = 1.2x, etc.
  expirationDate: timestamp("expiration_date"),
  maxUses: integer("max_uses").default(1),
  currentUses: integer("current_uses").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User redemptions table
export const userRedemptions = pgTable("user_redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  redemptionCodeId: integer("redemption_code_id").notNull().references(() => redemptionCodes.id),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
  xpGranted: integer("xp_granted").default(0),
  pointsGranted: integer("points_granted").default(0),
  multiplierGranted: integer("multiplier_granted").default(100),
  multiplierExpiration: timestamp("multiplier_expiration"),
  createdAt: timestamp("created_at").defaultNow()
});

// Matches table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  matchDate: timestamp("match_date").notNull(),
  winner1Id: integer("winner_1_id").notNull().references(() => users.id),
  winner2Id: integer("winner_2_id").references(() => users.id),
  loser1Id: integer("loser_1_id").notNull().references(() => users.id),
  loser2Id: integer("loser_2_id").references(() => users.id),
  score: varchar("score", { length: 50 }).notNull(),
  format: varchar("format", { length: 50 }).notNull().default("singles"),
  location: varchar("location", { length: 255 }),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  isRated: boolean("is_rated").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Ranking history table
export const rankingHistory = pgTable("ranking_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  oldRating: integer("old_rating").notNull(),
  newRating: integer("new_rating").notNull(),
  ratingChange: integer("rating_change").notNull(),
  matchId: integer("match_id").references(() => matches.id),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Coaching profiles table
export const coachingProfiles = pgTable("coaching_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio").notNull(),
  experience: integer("experience").notNull(), // Years of experience
  certifications: text("certifications").array(),
  specialties: text("specialties").array(),
  hourlyRate: integer("hourly_rate"),
  availability: json("availability"),
  isActive: boolean("is_active").default(true),
  rating: integer("rating").default(0), // Average rating from students
  reviewCount: integer("review_count").default(0), // Number of reviews
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Connections table (for friend requests and connections)
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, accepted, rejected
  type: varchar("type", { length: 50 }).notNull().default("friend"), // friend, coach, partner
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Profile themes table
export const profileThemes = pgTable("profile_themes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  primaryColor: varchar("primary_color", { length: 50 }).notNull(),
  secondaryColor: varchar("secondary_color", { length: 50 }).notNull(),
  accentColor: varchar("accent_color", { length: 50 }).notNull(),
  backgroundColor: varchar("background_color", { length: 50 }).notNull(),
  textColor: varchar("text_color", { length: 50 }).notNull(),
  borderStyle: varchar("border_style", { length: 50 }).default("solid"),
  bannerUrl: text("banner_url"),
  isDefault: boolean("is_default").default(false),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// External accounts table
export const externalAccounts = pgTable("external_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  provider: varchar("provider", { length: 50 }).notNull(), // instagram, twitter, facebook, etc.
  profileUrl: text("profile_url").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User block list table
export const userBlockList = pgTable("user_block_list", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  blockedUserId: integer("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow()
});

// Define relations
export const userRelations = relations(users, ({ many }) => ({
  tournamentRegistrations: many(tournamentRegistrations),
  userAchievements: many(userAchievements),
  activities: many(activities),
  userRedemptions: many(userRedemptions),
  rankingHistory: many(rankingHistory),
  coachingProfile: many(coachingProfiles),
  sentConnections: many(connections, { relationName: "requester" }),
  receivedConnections: many(connections, { relationName: "recipient" }),
  externalAccounts: many(externalAccounts),
  blockedUsers: many(userBlockList, { relationName: "blocker" }),
  blockedBy: many(userBlockList, { relationName: "blocked" })
}));

// Create insert schema for user validation
export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    passportId: true
  });

// Create insert schemas for validation
export const insertTournamentSchema = createInsertSchema(tournaments)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTournamentRegistrationSchema = createInsertSchema(tournamentRegistrations)
  .omit({ id: true, createdAt: true, updatedAt: true, registrationDate: true });

export const insertAchievementSchema = createInsertSchema(achievements)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserAchievementSchema = createInsertSchema(userAchievements)
  .omit({ id: true, createdAt: true, updatedAt: true, unlockedAt: true });

export const insertActivitySchema = createInsertSchema(activities)
  .omit({ id: true, createdAt: true });

export const insertRedemptionCodeSchema = createInsertSchema(redemptionCodes)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserRedemptionSchema = createInsertSchema(userRedemptions)
  .omit({ id: true, createdAt: true, redeemedAt: true });

export const insertMatchSchema = createInsertSchema(matches)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertRankingHistorySchema = createInsertSchema(rankingHistory)
  .omit({ id: true, createdAt: true });

export const insertCoachingProfileSchema = createInsertSchema(coachingProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertConnectionSchema = createInsertSchema(connections)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertProfileThemeSchema = createInsertSchema(profileThemes)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertExternalAccountSchema = createInsertSchema(externalAccounts)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserBlockListSchema = createInsertSchema(userBlockList)
  .omit({ id: true, createdAt: true });

// Define TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;

export type TournamentRegistration = typeof tournamentRegistrations.$inferSelect;
export type InsertTournamentRegistration = z.infer<typeof insertTournamentRegistrationSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type RedemptionCode = typeof redemptionCodes.$inferSelect;
export type InsertRedemptionCode = z.infer<typeof insertRedemptionCodeSchema>;

export type UserRedemption = typeof userRedemptions.$inferSelect;
export type InsertUserRedemption = z.infer<typeof insertUserRedemptionSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type RankingHistory = typeof rankingHistory.$inferSelect;
export type InsertRankingHistory = z.infer<typeof insertRankingHistorySchema>;

export type CoachingProfile = typeof coachingProfiles.$inferSelect;
export type InsertCoachingProfile = z.infer<typeof insertCoachingProfileSchema>;

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type ProfileTheme = typeof profileThemes.$inferSelect;
export type InsertProfileTheme = z.infer<typeof insertProfileThemeSchema>;

export type ExternalAccount = typeof externalAccounts.$inferSelect;
export type InsertExternalAccount = z.infer<typeof insertExternalAccountSchema>;

export type UserBlockList = typeof userBlockList.$inferSelect;
export type InsertUserBlockList = z.infer<typeof insertUserBlockListSchema>;

// Login schema for authentication
export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6)
});

// Registration schema that extends insertUserSchema with password confirmation
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6)
}).refine(data => {
  if (typeof data.password === 'string' && typeof data.confirmPassword === 'string') {
    return data.password === data.confirmPassword;
  }
  return false;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Redemption code schema
export const redeemCodeSchema = z.object({
  code: z.string().min(6).max(50)
});

// Export everything from the communication preferences schema
export * from './schema/communication-preferences';

// Export everything from the partner preferences schema
export * from './schema/partner-preferences';

// Add additional core schema exports here as the system grows