// Main schema file for Pickle+ global types and tables
import { pgTable, serial, integer, varchar, text, boolean, timestamp, date, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Privacy-related tables are defined in ./schema/privacy.ts
import {
  userPrivacySettings,
  privacyProfiles,
  contactPreferences,
  insertUserPrivacySettingSchema,
  insertPrivacyProfileSchema,
  insertContactPreferenceSchema,
  type UserPrivacySetting,
  type InsertUserPrivacySetting,
  type PrivacyProfile,
  type InsertPrivacyProfile,
  type ContactPreference,
  type InsertContactPreference
} from "./schema/privacy";

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
  // Note: rankingTier is calculated at runtime based on ranking points
  // rankingTier: varchar("ranking_tier", { length: 20 }).default("bronze"),
  // Note: consecutiveWins doesn't exist in the database
  // consecutiveWins: integer("consecutive_wins").default(0),
  
  // Basic profile fields
  playingSince: varchar("playing_since", { length: 50 }),
  skillLevel: varchar("skill_level", { length: 50 }),
  
  // Enhanced profile fields - Physical attributes
  height: integer("height"), // in cm
  reach: integer("reach"), // in cm
  
  // Equipment preferences
  preferredPosition: varchar("preferred_position", { length: 50 }),
  paddleBrand: varchar("paddle_brand", { length: 50 }),
  paddleModel: varchar("paddle_model", { length: 50 }),
  backupPaddleBrand: varchar("backup_paddle_brand", { length: 50 }),
  backupPaddleModel: varchar("backup_paddle_model", { length: 50 }),
  apparelBrand: varchar("apparel_brand", { length: 50 }),
  shoesBrand: varchar("shoes_brand", { length: 50 }),
  otherEquipment: text("other_equipment"),
  
  // Playing style and preferences
  playingStyle: varchar("playing_style", { length: 50 }),
  shotStrengths: varchar("shot_strengths", { length: 100 }),
  preferredFormat: varchar("preferred_format", { length: 50 }),
  dominantHand: varchar("dominant_hand", { length: 20 }),
  regularSchedule: varchar("regular_schedule", { length: 255 }),
  
  // Performance self-assessment (1-10 scale)
  forehandStrength: integer("forehand_strength"),
  backhandStrength: integer("backhand_strength"),
  servePower: integer("serve_power"),
  dinkAccuracy: integer("dink_accuracy"),
  thirdShotConsistency: integer("third_shot_consistency"),
  courtCoverage: integer("court_coverage"),
  
  // Match preferences
  preferredSurface: varchar("preferred_surface", { length: 50 }),
  indoorOutdoorPreference: varchar("indoor_outdoor_preference", { length: 20 }),
  competitiveIntensity: integer("competitive_intensity"),
  lookingForPartners: boolean("looking_for_partners").default(false),
  mentorshipInterest: boolean("mentorship_interest").default(false),
  
  // Location data
  homeCourtLocations: text("home_court_locations"), // Comma-separated or JSON string
  travelRadiusKm: integer("travel_radius_km"),
  
  // Privacy settings - Default visibility profiles
  privacyProfile: varchar("privacy_profile", { length: 30 }).default("standard"),
  
  // Profile customization
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  bannerPattern: varchar("banner_pattern", { length: 50 }),
  
  // System fields
  createdAt: timestamp("created_at").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow()
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
  level: varchar("level", { length: 50 }).notNull().default("club"), // club, district, city, provincial, national, regional, international
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

// XP transactions table - Tracks all XP awards
export const xpTransactions = pgTable("xp_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
  matchId: integer("match_id").references(() => matches.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  achievementId: integer("achievement_id").references(() => achievements.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Profile completion tracking table - Tracks which profile fields have been completed
export const profileCompletionTracking = pgTable("profile_completion_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fieldName: varchar("field_name", { length: 100 }).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  xpAwarded: integer("xp_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// Ranking transactions table - Tracks all ranking point awards
export const rankingTransactions = pgTable("ranking_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  source: varchar("source", { length: 100 }).notNull(),
  matchId: integer("match_id").references(() => matches.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow()
});

// Ranking tier history table - Tracks tier changes over time
export const rankingTierHistory = pgTable("ranking_tier_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  oldTier: varchar("old_tier", { length: 20 }).notNull(),
  newTier: varchar("new_tier", { length: 20 }).notNull(),
  rankingPoints: integer("ranking_points").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Matches table
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  matchDate: timestamp("match_date"),
  // Player information
  playerOneId: integer("player_one_id").notNull().references(() => users.id),
  playerTwoId: integer("player_two_id").notNull().references(() => users.id),
  playerOnePartnerId: integer("player_one_partner_id").references(() => users.id),
  playerTwoPartnerId: integer("player_two_partner_id").references(() => users.id),
  winnerId: integer("winner_id").notNull().references(() => users.id),
  
  // Score information
  scorePlayerOne: varchar("score_player_one", { length: 50 }).notNull(),
  scorePlayerTwo: varchar("score_player_two", { length: 50 }).notNull(),
  gameScores: json("game_scores"), // Array of game scores for multi-game matches
  
  // Match metadata
  formatType: varchar("format_type", { length: 50 }).notNull().default("singles"), // singles, doubles
  scoringSystem: varchar("scoring_system", { length: 50 }).notNull().default("traditional"), // traditional, rally
  pointsToWin: integer("points_to_win").notNull().default(11), // 11, 15, 21
  division: varchar("division", { length: 50 }).default("open"), // open, 19+, 35+, 50+, etc.
  matchType: varchar("match_type", { length: 50 }).notNull().default("casual"), // casual, league, tournament
  eventTier: varchar("event_tier", { length: 50 }).default("local"), // local, regional, national, international
  
  // Context information
  location: varchar("location", { length: 255 }),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  // Note: roundNumber and stageType don't exist in the database
  // roundNumber: integer("round_number"), // For tournament matches
  // stageType: varchar("stage_type", { length: 50 }), // main, qualifying, consolation
  isRated: boolean("is_rated").default(true),
  isVerified: boolean("is_verified").default(false), // Whether opponents have verified the result
  
  // VALMAT - Match Validation
  validationStatus: varchar("validation_status", { length: 50 }).notNull().default("pending"), // pending, validated, disputed, rejected
  validationCompletedAt: timestamp("validation_completed_at"),
  validationRequiredBy: timestamp("validation_required_by").defaultNow(),
  rankingPointMultiplier: integer("ranking_point_multiplier").default(100), // Percentage multiplier for ranking points
  dailyMatchCount: integer("daily_match_count").default(1), // Which match of the day is this
  
  // Additional information
  notes: text("notes"),
  xpAwarded: integer("xp_awarded").default(0),
  pointsAwarded: integer("points_awarded").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
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
  xpTransactions: many(xpTransactions),
  rankingTransactions: many(rankingTransactions),
  rankingTierHistory: many(rankingTierHistory),
  coachingProfile: many(coachingProfiles),
  sentConnections: many(connections, { relationName: "requester" }),
  receivedConnections: many(connections, { relationName: "recipient" }),
  externalAccounts: many(externalAccounts),
  blockedUsers: many(userBlockList, { relationName: "blocker" }),
  // Add privacy-related relations
  privacySettings: many(userPrivacySettings),
  contactPreferences: many(contactPreferences),
  blockedBy: many(userBlockList, { relationName: "blocked" }),
  playerOneMatches: many(matches, { relationName: "playerOne" }),
  playerTwoMatches: many(matches, { relationName: "playerTwo" }),
  playerOnePartnerMatches: many(matches, { relationName: "playerOnePartner" }),
  playerTwoPartnerMatches: many(matches, { relationName: "playerTwoPartner" }),
  wonMatches: many(matches, { relationName: "winner" })
}));

// Tournament relations
export const tournamentRelations = relations(tournaments, ({ many }) => ({
  registrations: many(tournamentRegistrations),
  matches: many(matches),
  xpTransactions: many(xpTransactions),
  rankingTransactions: many(rankingTransactions)
}));

// Match relations
export const matchRelations = relations(matches, ({ one, many }) => ({
  playerOne: one(users, { fields: [matches.playerOneId], references: [users.id], relationName: "playerOne" }),
  playerTwo: one(users, { fields: [matches.playerTwoId], references: [users.id], relationName: "playerTwo" }),
  playerOnePartner: one(users, { fields: [matches.playerOnePartnerId], references: [users.id], relationName: "playerOnePartner" }),
  playerTwoPartner: one(users, { fields: [matches.playerTwoPartnerId], references: [users.id], relationName: "playerTwoPartner" }),
  winner: one(users, { fields: [matches.winnerId], references: [users.id], relationName: "winner" }),
  tournament: one(tournaments, { fields: [matches.tournamentId], references: [tournaments.id] }),
  xpTransactions: many(xpTransactions),
  rankingTransactions: many(rankingTransactions)
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
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    level: z.enum(['club', 'district', 'city', 'provincial', 'national', 'regional', 'international']).default('club')
  });

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

// Create a more detailed match insert schema with validation
export const insertMatchSchema = createInsertSchema(matches)
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true, 
    isVerified: true, 
    xpAwarded: true, 
    pointsAwarded: true,
    // VALMAT omissions - these are managed by the system
    validationStatus: true,
    validationCompletedAt: true,
    validationRequiredBy: true,
    rankingPointMultiplier: true,
    dailyMatchCount: true
  })
  .extend({
    // Make sure these fields are present
    playerOneId: z.number().int().positive(),
    playerTwoId: z.number().int().positive(),
    
    // Optional fields for doubles
    playerOnePartnerId: z.number().int().positive().optional(),
    playerTwoPartnerId: z.number().int().positive().optional(),
    
    // Match format validation
    formatType: z.enum(["singles", "doubles"]).default("singles"),
    scoringSystem: z.enum(["traditional", "rally"]).default("traditional"),
    pointsToWin: z.number().int().refine(value => [11, 15, 21].includes(value), {
      message: "Points to win must be 11, 15, or 21",
    }),
    
    // Match type validation
    matchType: z.enum(["casual", "league", "tournament"]).default("casual"),
    
    // Division validation
    division: z.enum(["open", "19+", "35+", "50+", "60+", "70+"]).default("open"),
  })
  .refine(data => {
    // Doubles matches must have partners
    if (data.formatType === "doubles") {
      return !!data.playerOnePartnerId && !!data.playerTwoPartnerId;
    }
    return true;
  }, {
    message: "Doubles matches require partner IDs",
    path: ["playerOnePartnerId"],
  })
  .refine(data => {
    // All players must be unique
    const players = [
      data.playerOneId, 
      data.playerTwoId, 
      data.playerOnePartnerId, 
      data.playerTwoPartnerId
    ].filter(Boolean);
    const uniquePlayers = new Set(players);
    return uniquePlayers.size === players.length;
  }, {
    message: "Each player can only appear once in a match",
    path: ["playerTwoId"],
  });

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

export const insertProfileCompletionTrackingSchema = createInsertSchema(profileCompletionTracking)
  .omit({ id: true, createdAt: true, completedAt: true });

// Define TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ProfileCompletionTracking = typeof profileCompletionTracking.$inferSelect;
export type InsertProfileCompletionTracking = z.infer<typeof insertProfileCompletionTrackingSchema>;

// Re-export privacy types from the schema/privacy.ts
export {
  UserPrivacySetting,
  InsertUserPrivacySetting,
  PrivacyProfile,
  InsertPrivacyProfile,
  ContactPreference,
  InsertContactPreference
};

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

// VALMAT - Match validation schemas
export const matchValidationSchema = z.object({
  matchId: z.number().int().positive(),
  status: z.enum(["confirmed", "disputed"]),
  notes: z.string().optional()
});

export const matchFeedbackSchema = z.object({
  matchId: z.number().int().positive(),
  enjoymentRating: z.number().int().min(1).max(5).optional(),
  skillMatchRating: z.number().int().min(1).max(5).optional(),
  comments: z.string().optional()
});

// External schema modules
import './schema/communication-preferences';
import './schema/partner-preferences';

// VALMAT - Match Validation System
// Match validation table to track individual participants' validations
export const matchValidations = pgTable("match_validations", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, confirmed, disputed
  validatedAt: timestamp("validated_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Match feedback table to collect optional player feedback
export const matchFeedback = pgTable("match_feedback", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  userId: integer("user_id").notNull().references(() => users.id),
  enjoymentRating: integer("enjoyment_rating"), // 1-5 star rating
  skillMatchRating: integer("skill_match_rating"), // 1-5 star rating
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow()
});

// User daily match count table to track diminishing returns
export const userDailyMatches = pgTable("user_daily_matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  matchCount: integer("match_count").notNull().default(0), // How many matches played today
  matchDate: date("match_date").notNull(), // The date in question
  createdAt: timestamp("created_at").defaultNow()
});

// Define relations for VALMAT tables
export const matchValidationRelations = relations(matchValidations, ({ one }) => ({
  match: one(matches, { fields: [matchValidations.matchId], references: [matches.id] }),
  user: one(users, { fields: [matchValidations.userId], references: [users.id] })
}));

export const matchFeedbackRelations = relations(matchFeedback, ({ one }) => ({
  match: one(matches, { fields: [matchFeedback.matchId], references: [matches.id] }),
  user: one(users, { fields: [matchFeedback.userId], references: [users.id] })
}));

export const userDailyMatchesRelations = relations(userDailyMatches, ({ one }) => ({
  user: one(users, { fields: [userDailyMatches.userId], references: [users.id] })
}));

// Update match relations to include VALMAT tables
export const matchRelationsExtended = relations(matches, ({ one, many }) => ({
  playerOne: one(users, { fields: [matches.playerOneId], references: [users.id], relationName: "playerOne" }),
  playerTwo: one(users, { fields: [matches.playerTwoId], references: [users.id], relationName: "playerTwo" }),
  playerOnePartner: one(users, { fields: [matches.playerOnePartnerId], references: [users.id], relationName: "playerOnePartner" }),
  playerTwoPartner: one(users, { fields: [matches.playerTwoPartnerId], references: [users.id], relationName: "playerTwoPartner" }),
  winner: one(users, { fields: [matches.winnerId], references: [users.id], relationName: "winner" }),
  tournament: one(tournaments, { fields: [matches.tournamentId], references: [tournaments.id] }),
  validations: many(matchValidations),
  feedback: many(matchFeedback),
  xpTransactions: many(xpTransactions),
  rankingTransactions: many(rankingTransactions)
}));

// Create insert schemas for VALMAT tables
export const insertMatchValidationSchema = createInsertSchema(matchValidations)
  .omit({ id: true, createdAt: true, validatedAt: true });

export const insertMatchFeedbackSchema = createInsertSchema(matchFeedback)
  .omit({ id: true, createdAt: true });

export const insertUserDailyMatchesSchema = createInsertSchema(userDailyMatches)
  .omit({ id: true, createdAt: true });

// Define TypeScript types for VALMAT
export type MatchValidation = typeof matchValidations.$inferSelect;
export type InsertMatchValidation = z.infer<typeof insertMatchValidationSchema>;

export type MatchFeedback = typeof matchFeedback.$inferSelect;
export type InsertMatchFeedback = z.infer<typeof insertMatchFeedbackSchema>;

export type UserDailyMatches = typeof userDailyMatches.$inferSelect;
export type InsertUserDailyMatches = z.infer<typeof insertUserDailyMatchesSchema>;

// Relations for XP and Ranking tables
export const xpTransactionRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, { fields: [xpTransactions.userId], references: [users.id] }),
  match: one(matches, { fields: [xpTransactions.matchId], references: [matches.id] }),
  tournament: one(tournaments, { fields: [xpTransactions.tournamentId], references: [tournaments.id] }),
  achievement: one(achievements, { fields: [xpTransactions.achievementId], references: [achievements.id] })
}));

export const rankingTransactionRelations = relations(rankingTransactions, ({ one }) => ({
  user: one(users, { fields: [rankingTransactions.userId], references: [users.id] }),
  match: one(matches, { fields: [rankingTransactions.matchId], references: [matches.id] }),
  tournament: one(tournaments, { fields: [rankingTransactions.tournamentId], references: [tournaments.id] })
}));

export const rankingTierHistoryRelations = relations(rankingTierHistory, ({ one }) => ({
  user: one(users, { fields: [rankingTierHistory.userId], references: [users.id] })
}));

// XP and Ranking schemas
export const insertXpTransactionSchema = createInsertSchema(xpTransactions)
  .omit({ id: true, createdAt: true, timestamp: true });

export const insertRankingTransactionSchema = createInsertSchema(rankingTransactions)
  .omit({ id: true, createdAt: true, timestamp: true });

export const insertRankingTierHistorySchema = createInsertSchema(rankingTierHistory)
  .omit({ id: true, createdAt: true, timestamp: true });

// XP and Ranking types
export type XpTransaction = typeof xpTransactions.$inferSelect;
export type InsertXpTransaction = z.infer<typeof insertXpTransactionSchema>;

export type RankingTransaction = typeof rankingTransactions.$inferSelect;
export type InsertRankingTransaction = z.infer<typeof insertRankingTransactionSchema>;

export type RankingTierHistory = typeof rankingTierHistory.$inferSelect;
export type InsertRankingTierHistory = z.infer<typeof insertRankingTierHistorySchema>;

// Define the privacy settings relations after users table is defined
export const userPrivacySettingsRelations = relations(userPrivacySettings, ({ one }) => ({
  user: one(users, {
    fields: [userPrivacySettings.userId],
    references: [users.id]
  })
}));

export const contactPreferencesRelations = relations(contactPreferences, ({ one }) => ({
  user: one(users, {
    fields: [contactPreferences.userId],
    references: [users.id]
  })
}));

// Add additional core schema exports here as the system grows