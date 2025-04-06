import { pgTable, text, serial, integer, boolean, timestamp, json, date, varchar, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import and re-export communication and partner preference schemas
export * from "./schema/communication-preferences";
export * from "./schema/partner-preferences";

// Import modules
import * as communicationChannels from "./schema/communication-preferences";
import * as partnerPreferences from "./schema/partner-preferences";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  yearOfBirth: integer("year_of_birth"),
  passportId: text("passport_id").unique(), // Unique passport ID in format PKL-XXXX-YYY
  location: text("location"),
  playingSince: text("playing_since"),
  skillLevel: text("skill_level"),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  rankingPoints: integer("ranking_points").default(0),
  lastMatchDate: timestamp("last_match_date"),
  avatarInitials: text("avatar_initials").notNull(),
  totalMatches: integer("total_matches").default(0),
  matchesWon: integer("matches_won").default(0),
  totalTournaments: integer("total_tournaments").default(0),
  isFoundingMember: boolean("is_founding_member").default(false),
  isAdmin: boolean("is_admin").default(false),
  xpMultiplier: integer("xp_multiplier").default(100), // Store as an integer representing percentage (100 = 1.0x, 110 = 1.1x)
  
  // Profile Visual Customization
  avatarUrl: text("avatar_url"), // URL to user's profile avatar image
  profileTheme: text("profile_theme").default("default"), // Theme name or ID
  profileAccentColor: text("profile_accent_color").default("#FF5722"), // Hex color code
  bannerImageUrl: text("banner_image_url"), // URL to profile banner/header image
  badgeDisplayPreference: text("badge_display_preference").default("grid"), // grid, carousel, list, etc.
  profileLayout: text("profile_layout").default("standard"), // standard, compact, featured, etc.
  customCss: text("custom_css"), // Optional custom CSS for premium users
  
  // Pickleball-specific fields
  bio: text("bio"), // Short player bio or status
  preferredPosition: text("preferred_position"), // Forehand, Backhand, Either
  paddleBrand: text("paddle_brand"), // Brand of paddle used
  paddleModel: text("paddle_model"), // Model of paddle
  playingStyle: text("playing_style"), // Aggressive, Defensive, All-court
  shotStrengths: text("shot_strengths"), // Dinking, Third-shot drops, etc.
  preferredFormat: text("preferred_format"), // Singles, Doubles, Mixed Doubles
  dominantHand: text("dominant_hand"), // Left, Right, Ambidextrous
  regularSchedule: text("regular_schedule"), // When they typically play
  lookingForPartners: boolean("looking_for_partners").default(false),
  partnerPreferences: text("partner_preferences"), // What they look for in partners
  playerGoals: text("player_goals"), // Competitive, recreational, etc.
  
  // Social/Community fields
  coach: text("coach"), // Coach or instructor name
  clubs: text("clubs"), // Club memberships
  leagues: text("leagues"), // Leagues they participate in
  socialHandles: json("social_handles"), // JSON object with social media handles
  willingToMentor: boolean("willing_to_mentor").default(false),
  socialMediaConsent: boolean("social_media_consent").default(false), // Consent to share achievements on social media
  
  // Advanced Profile Customization
  bioFormatted: text("bio_formatted"), // Rich text formatted bio (HTML or markdown)
  featuredAchievements: json("featured_achievements"), // Array of achievement IDs to feature
  seasonalPreference: text("seasonal_preference").default("all_time"), // Current, all-time, by year, etc.
  customSections: json("custom_sections"), // User-defined profile sections
  highlightedMatches: json("highlighted_matches"), // Array of match IDs to highlight
  
  // Partner Preferences System (expanded)
  partnerSkillRange: json("partner_skill_range"), // Min/max skill level for partners
  partnerAgeRange: json("partner_age_range"), // Min/max age for partners
  partnerPlayingStyles: json("partner_playing_styles"), // Array of compatible playing styles
  availabilitySchedule: json("availability_schedule"), // Structured weekly availability
  partnerMatchingEnabled: boolean("partner_matching_enabled").default(false), // Allow automatic matching
  partnerLocationMaxDistance: integer("partner_location_max_distance"), // Max distance in miles/km
  partnerLanguages: json("partner_languages"), // Languages spoken
  
  // Physical/Health information
  mobilityLimitations: text("mobility_limitations"),
  preferredMatchDuration: text("preferred_match_duration"), // Short, Medium, Extended
  fitnessLevel: text("fitness_level"), // Casual, Moderate, High
  
  // Privacy and communication settings
  privacySettings: json("privacy_settings").default({
    profileVisibility: "public", // public, connections, private
    locationVisibility: "public",
    skillLevelVisibility: "public",
    matchHistoryVisibility: "connections",
    achievementsVisibility: "public",
    socialHandlesVisibility: "connections"
  }),
  
  communicationPreferences: json("communication_preferences").default({
    matchInvitations: true,
    tournamentNotifications: true,
    achievementAlerts: true,
    connectionRequests: true,
    marketingEmails: false,
    newsAndUpdates: true
  }),
  
  notificationDelivery: json("notification_delivery").default({
    email: true,
    inApp: true,
    pushNotifications: false
  }),
  
  // Profile completion tracking
  profileCompletionPct: integer("profile_completion_pct").default(0), // 0-100
  profileLastUpdated: timestamp("profile_last_updated"),
  profileSetupStep: integer("profile_setup_step").default(0), // For multi-step setup tracking
  
  createdAt: timestamp("created_at").defaultNow()
});

// We'll define the user relations after all tables are defined
// to avoid reference errors

// Tournament table schema
export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  
  // Tournament format fields
  hasQualifying: boolean("has_qualifying").default(false),
  hasRoundRobin: boolean("has_round_robin").default(false),
  hasConsolation: boolean("has_consolation").default(false),
  knockoutRounds: integer("knockout_rounds").default(1),
  
  // Tournament categorization
  eventTier: text("event_tier").default("local"), // local, regional, national, international
  maxParticipants: integer("max_participants")
});

export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  registrations: many(tournamentRegistrations)
}));

// Tournament registrations table schema
export const tournamentRegistrations = pgTable("tournament_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tournamentId: integer("tournament_id").notNull().references(() => tournaments.id),
  division: text("division"),
  status: text("status").default("registered"),
  checkedIn: boolean("checked_in").default(false).notNull(),
  placement: text("placement"),
  createdAt: timestamp("created_at").defaultNow()
});

export const tournamentRegistrationsRelations = relations(tournamentRegistrations, ({ one }) => ({
  user: one(users, {
    fields: [tournamentRegistrations.userId],
    references: [users.id]
  }),
  tournament: one(tournaments, {
    fields: [tournamentRegistrations.tournamentId],
    references: [tournaments.id]
  })
}));

// Achievements table schema
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  xpReward: integer("xp_reward").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  requirement: integer("requirement").notNull()
});

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements)
}));

// User achievements table schema
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow()
});

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id]
  })
}));

// Activity table schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  xpEarned: integer("xp_earned").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata")
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  })
}));

// Redemption codes table schema
export const redemptionCodes = pgTable("redemption_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  xpReward: integer("xp_reward").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  isFoundingMemberCode: boolean("is_founding_member_code").default(false),
  isCoachAccessCode: boolean("is_coach_access_code").default(false),
  codeType: text("code_type").default("xp"), // xp, founding, coach, special, multiplier
  multiplierValue: integer("multiplier_value").default(100), // For "multiplier" type, stored as percentage (e.g., 150 = 1.5x)
  multiplierDurationDays: integer("multiplier_duration_days"), // How many days the multiplier effect lasts
  maxRedemptions: integer("max_redemptions"), // Limit number of redemptions (40 for founding members)
  currentRedemptions: integer("current_redemptions").default(0),
  expiresAt: timestamp("expires_at") // When code itself expires and can no longer be redeemed
});

export const redemptionCodesRelations = relations(redemptionCodes, ({ many }) => ({
  userRedemptions: many(userRedemptions)
}));

// User redemption records table schema
export const userRedemptions = pgTable("user_redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  codeId: integer("code_id").notNull().references(() => redemptionCodes.id),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
  multiplierExpiresAt: timestamp("multiplier_expires_at"), // For multiplier codes, when the effect expires
  isMultiplierActive: boolean("is_multiplier_active").default(false) // Whether the multiplier effect is active
});

export const userRedemptionsRelations = relations(userRedemptions, ({ one }) => ({
  user: one(users, {
    fields: [userRedemptions.userId],
    references: [users.id]
  }),
  redemptionCode: one(redemptionCodes, {
    fields: [userRedemptions.codeId],
    references: [redemptionCodes.id]
  })
}));

// Matches table schema
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  playerOneId: integer("player_one_id").notNull().references(() => users.id),
  playerTwoId: integer("player_two_id").notNull().references(() => users.id),
  playerOnePartnerId: integer("player_one_partner_id").references(() => users.id),
  playerTwoPartnerId: integer("player_two_partner_id").references(() => users.id),
  winnerId: integer("winner_id").notNull().references(() => users.id),
  scorePlayerOne: text("score_player_one").notNull(),
  scorePlayerTwo: text("score_player_two").notNull(),
  pointsAwarded: integer("points_awarded").notNull(),
  xpAwarded: integer("xp_awarded").notNull(),
  matchType: text("match_type").notNull(), // casual, league, tournament
  formatType: text("format_type").notNull().default("singles"), // singles, doubles
  scoringSystem: text("scoring_system").notNull().default("traditional"), // traditional, rally
  pointsToWin: integer("points_to_win").notNull().default(11), // 11, 15, 21
  
  // Tournament-related fields
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  eventTier: text("event_tier"), // local, regional, national, international
  
  // Tournament stage information
  stageType: text("stage_type"), // round_robin, qualifying, knockout, consolation
  roundNumber: integer("round_number"), // 1 for first round, increases with each round
  isFirstRound: boolean("is_first_round").default(false),
  isFinal: boolean("is_final").default(false), 
  isSemiFinal: boolean("is_semi_final").default(false),
  
  // Other match fields
  matchDate: timestamp("match_date").defaultNow(),
  location: text("location"),
  notes: text("notes"),
  gameScores: json("game_scores").default([]), // Array of game scores for multi-game matches
  division: text("division"), // Age division for the match
  
  // Match quality indicators for later analytics
  scorePointDifferential: integer("score_point_differential"), // Final point differential
  matchQualityMultiplier: decimal("match_quality_multiplier", { precision: 3, scale: 2 }).default("1.00"), // 0.9, 1.0, 1.1
});

export const matchesRelations = relations(matches, ({ one }) => ({
  playerOne: one(users, {
    fields: [matches.playerOneId],
    references: [users.id],
    relationName: "playerOne"
  }),
  playerTwo: one(users, {
    fields: [matches.playerTwoId],
    references: [users.id],
    relationName: "playerTwo"
  }),
  playerOnePartner: one(users, {
    fields: [matches.playerOnePartnerId],
    references: [users.id],
    relationName: "playerOnePartner"
  }),
  playerTwoPartner: one(users, {
    fields: [matches.playerTwoPartnerId],
    references: [users.id],
    relationName: "playerTwoPartner"
  }),
  winner: one(users, {
    fields: [matches.winnerId],
    references: [users.id]
  }),
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id]
  })
}));

// Ranking history table schema
export const rankingHistory = pgTable("ranking_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  oldRanking: integer("old_ranking").notNull(),
  newRanking: integer("new_ranking").notNull(),
  reason: text("reason").notNull(), // match_win, tournament_placement, decay
  matchId: integer("match_id").references(() => matches.id),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  createdAt: timestamp("created_at").defaultNow()
});

export const rankingHistoryRelations = relations(rankingHistory, ({ one }) => ({
  user: one(users, {
    fields: [rankingHistory.userId],
    references: [users.id]
  }),
  match: one(matches, {
    fields: [rankingHistory.matchId],
    references: [matches.id]
  }),
  tournament: one(tournaments, {
    fields: [rankingHistory.tournamentId],
    references: [tournaments.id]
  })
}));

// Coaching profiles table schema
export const coachingProfiles = pgTable("coaching_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  isActive: boolean("is_active").default(true),
  
  // Coach access control
  accessType: text("access_type").notNull(), // "paid", "code", "admin"
  accessGrantedAt: timestamp("access_granted_at").defaultNow(),
  
  // Admin verification fields
  isPCPCertified: boolean("is_pcp_certified").default(false),
  isAdminVerified: boolean("is_admin_verified").default(false),
  
  // Qualification details
  yearsCoaching: integer("years_coaching"),
  certifications: json("certifications").default([]), // Array of certification objects
  teachingPhilosophy: text("teaching_philosophy"),
  
  // Service details
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  packagePricing: json("package_pricing").default([]), // Array of package offerings
  specializations: json("specializations").default([]), // Array of specializations
  coachingFormats: json("coaching_formats").default([]), // Array of formats (private, group, clinics)
  
  // Location details
  country: text("country"),
  stateProvince: text("state_province"),
  city: text("city"),
  facilities: json("facilities").default([]), // Array of facility names
  travelRadius: integer("travel_radius"), // in miles/km
  
  // Availability
  availabilitySchedule: json("availability_schedule").default({}), // Structured availability
  
  // Fields for social features
  acceptingNewStudents: boolean("accepting_new_students").default(true),
  studentSuccesses: json("student_successes").default([]),
  contactPreferences: json("contact_preferences").default({}),
  
  // Metadata and timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// User connections table schema (for social features)
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "coach", "partner", "friend", "teammate"
  status: text("status").notNull().default("pending"), // "pending", "accepted", "declined", "ended"
  startDate: timestamp("start_date"), // When the connection was accepted
  endDate: timestamp("end_date"), // When the connection was ended (if applicable)
  notes: text("notes"), // Additional details about the connection
  metadata: json("metadata").default({}), // For type-specific data (coaching rates, playing preferences, etc.)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Connection relations
export const connectionsRelations = relations(connections, ({ one }) => ({
  requester: one(users, {
    fields: [connections.requesterId],
    references: [users.id],
    relationName: "connectionRequests"
  }),
  recipient: one(users, {
    fields: [connections.recipientId],
    references: [users.id],
    relationName: "connectionReceived"
  })
}));

// Profile Themes table schema
export const profileThemes = pgTable("profile_themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  primaryColor: text("primary_color").notNull(),
  secondaryColor: text("secondary_color").notNull(),
  accentColor: text("accent_color"),
  textColor: text("text_color").notNull(),
  backgroundPattern: text("background_pattern"),
  cardStyle: text("card_style"),
  isDefault: boolean("is_default").default(false),
  isEnabled: boolean("is_enabled").default(true),
  previewImageUrl: text("preview_image_url"),
  cssVariables: json("css_variables").default({}),
  customCss: text("custom_css"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const profileThemesRelations = relations(profileThemes, ({ many }) => ({
  users: many(users)
}));

// External Social Accounts table schema
export const externalAccounts = pgTable("external_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(), // instagram, facebook, twitter, tiktok, youtube, etc.
  username: text("username").notNull(),
  displayName: text("display_name"),
  accountId: text("account_id"), // Platform-specific ID 
  accessToken: text("access_token"), // Encrypted token for API access
  refreshToken: text("refresh_token"), // Encrypted refresh token if applicable
  tokenExpiresAt: timestamp("token_expires_at"),
  isVerified: boolean("is_verified").default(false), // Whether the account is verified
  isActive: boolean("is_active").default(true), // Whether the connection is active
  lastSyncAt: timestamp("last_sync_at"), // Last time data was synced
  metadata: json("metadata").default({}), // Additional platform-specific data
  sharingEnabled: boolean("sharing_enabled").default(false), // Whether to share achievements to this account
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const externalAccountsRelations = relations(externalAccounts, ({ one }) => ({
  user: one(users, {
    fields: [externalAccounts.userId],
    references: [users.id]
  })
}));

// User Block List table schema
export const userBlockList = pgTable("user_block_list", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  blockedUserId: integer("blocked_user_id").notNull().references(() => users.id),
  reason: text("reason"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const userBlockListRelations = relations(userBlockList, ({ one }) => ({
  user: one(users, {
    fields: [userBlockList.userId],
    references: [users.id],
    relationName: "userBlocks"
  }),
  blockedUser: one(users, {
    fields: [userBlockList.blockedUserId],
    references: [users.id],
    relationName: "blockedBy"
  })
}));

// Coaching profiles relations
export const coachingProfilesRelations = relations(coachingProfiles, ({ one }) => ({
  user: one(users, {
    fields: [coachingProfiles.userId],
    references: [users.id]
  })
}));

// Insert schema definitions using drizzle-zod
// Schema for validating user registration
export const registerUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, avatarInitials: true, passportId: true })
  .extend({
    confirmPassword: z.string().min(6)
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

// Schema for actually inserting a user into the database
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

export const insertTournamentSchema = createInsertSchema(tournaments).omit({ id: true });

export const insertTournamentRegistrationSchema = createInsertSchema(tournamentRegistrations).omit({ 
  id: true, 
  createdAt: true, 
  placement: true 
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ 
  id: true, 
  unlockedAt: true 
});

export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true, 
  createdAt: true 
});

export const insertRedemptionCodeSchema = createInsertSchema(redemptionCodes).omit({ 
  id: true 
});

export const insertUserRedemptionSchema = createInsertSchema(userRedemptions).omit({ 
  id: true, 
  redeemedAt: true,
  multiplierExpiresAt: true,
  isMultiplierActive: true
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  matchDate: true
});

export const insertRankingHistorySchema = createInsertSchema(rankingHistory).omit({
  id: true,
  createdAt: true
});

export const insertCoachingProfileSchema = createInsertSchema(coachingProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  startDate: true // This is set when the connection is accepted
});

// Schema for validating coach access requests
export const coachAccessRequestSchema = z.object({
  accessMethod: z.enum(["code", "payment"]),
  redemptionCode: z.string().optional(),
  paymentIntentId: z.string().optional(),
});

export const redeemCodeSchema = z.object({
  code: z.string().min(1)
});

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6)
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

export type InsertTournamentRegistration = z.infer<typeof insertTournamentRegistrationSchema>;
export type TournamentRegistration = typeof tournamentRegistrations.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertRedemptionCode = z.infer<typeof insertRedemptionCodeSchema>;
export type RedemptionCode = typeof redemptionCodes.$inferSelect;

export type InsertUserRedemption = z.infer<typeof insertUserRedemptionSchema>;
export type UserRedemption = typeof userRedemptions.$inferSelect;

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

export type InsertRankingHistory = z.infer<typeof insertRankingHistorySchema>;
export type RankingHistory = typeof rankingHistory.$inferSelect;

export type InsertCoachingProfile = z.infer<typeof insertCoachingProfileSchema>;
export type CoachingProfile = typeof coachingProfiles.$inferSelect;
export type CoachAccessRequest = z.infer<typeof coachAccessRequestSchema>;

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

// Insert schemas for the new profile-related tables
export const insertProfileThemeSchema = createInsertSchema(profileThemes).omit({
  id: true,
  createdAt: true
});

export const insertExternalAccountSchema = createInsertSchema(externalAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSyncAt: true
});

export const insertUserBlockListSchema = createInsertSchema(userBlockList).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type RedeemCode = z.infer<typeof redeemCodeSchema>;
export type Login = z.infer<typeof loginSchema>;

export type InsertProfileTheme = z.infer<typeof insertProfileThemeSchema>;
export type ProfileTheme = typeof profileThemes.$inferSelect;

export type InsertExternalAccount = z.infer<typeof insertExternalAccountSchema>;
export type ExternalAccount = typeof externalAccounts.$inferSelect;

export type InsertUserBlockList = z.infer<typeof insertUserBlockListSchema>;
export type UserBlockList = typeof userBlockList.$inferSelect;

// Now define user relations after all tables are defined
// Import CourtIQ relations for users
import { 
  playerRatings, 
  playerRivals, 
  rankingPoints, 
  pointsHistory, 
  ratingProtections 
} from './courtiq-schema';

export const usersRelations = relations(users, ({ many, one }) => ({
  tournamentRegistrations: many(tournamentRegistrations),
  userAchievements: many(userAchievements),
  activities: many(activities),
  userRedemptions: many(userRedemptions),
  matchesAsPlayerOne: many(matches, { relationName: "playerOne" }),
  matchesAsPlayerTwo: many(matches, { relationName: "playerTwo" }),
  matchesAsPlayerOnePartner: many(matches, { relationName: "playerOnePartner" }),
  matchesAsPlayerTwoPartner: many(matches, { relationName: "playerTwoPartner" }),
  rankingHistory: many(rankingHistory),
  coachingProfile: one(coachingProfiles),
  // Communication preferences relations
  communicationChannels: many(communicationChannels.communicationChannels),
  notificationPreferences: many(communicationChannels.userNotificationPreferences),
  communicationLogs: many(communicationChannels.communicationLogs),
  // Partner preferences relations
  partnerCriteria: many(partnerPreferences.partnerCriteria),
  partnerAvailability: many(partnerPreferences.partnerAvailability),
  specialAvailability: many(partnerPreferences.specialAvailability),
  partnerSuggestionsAsUser: many(partnerPreferences.partnerSuggestions, { relationName: "user" }),
  partnerSuggestionsAsPartner: many(partnerPreferences.partnerSuggestions, { relationName: "suggestedPartner" }),
  connectionRequestsSent: many(connections, { relationName: "connectionRequests" }),
  connectionRequestsReceived: many(connections, { relationName: "connectionReceived" }),
  
  // Profile features relations
  externalAccounts: many(externalAccounts),
  blockedUsers: many(userBlockList, { relationName: "userBlocks" }),
  blockedByUsers: many(userBlockList, { relationName: "blockedBy" }),
  
  // CourtIQ relations
  playerRatings: many(playerRatings),
  playerRivalsAsUser: many(playerRivals, { relationName: "userRivalries" }),
  playerRivalsAsRival: many(playerRivals, { relationName: "rivalOf" }),
  rankingPoints: many(rankingPoints),
  pointsHistory: many(pointsHistory),
  ratingProtections: many(ratingProtections)
}));
