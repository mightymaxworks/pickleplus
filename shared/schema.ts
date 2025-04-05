import { pgTable, text, serial, integer, boolean, timestamp, json, date, varchar, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  xpMultiplier: integer("xp_multiplier").default(100), // Store as an integer representing percentage (100 = 1.0x, 110 = 1.1x)
  
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
  
  // Physical/Health information
  mobilityLimitations: text("mobility_limitations"),
  preferredMatchDuration: text("preferred_match_duration"), // Short, Medium, Extended
  fitnessLevel: text("fitness_level"), // Casual, Moderate, High
  
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
  imageUrl: text("image_url")
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
  codeType: text("code_type").default("xp"), // xp, founding, coach, special
  maxRedemptions: integer("max_redemptions"), // Limit number of redemptions (40 for founding members)
  currentRedemptions: integer("current_redemptions").default(0),
  expiresAt: timestamp("expires_at")
});

export const redemptionCodesRelations = relations(redemptionCodes, ({ many }) => ({
  userRedemptions: many(userRedemptions)
}));

// User redemption records table schema
export const userRedemptions = pgTable("user_redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  codeId: integer("code_id").notNull().references(() => redemptionCodes.id),
  redeemedAt: timestamp("redeemed_at").defaultNow()
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
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  matchDate: timestamp("match_date").defaultNow(),
  location: text("location"),
  notes: text("notes"),
  gameScores: json("game_scores").default([]), // Array of game scores for multi-game matches
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
  
  // Success stories and profiles
  studentSuccesses: json("student_successes").default([]),
  
  // Contact and booking preferences
  contactPreferences: json("contact_preferences").default({}),
  
  // Metadata and timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

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
  redeemedAt: true 
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

export type RedeemCode = z.infer<typeof redeemCodeSchema>;
export type Login = z.infer<typeof loginSchema>;

// Now define user relations after all tables are defined
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
  coachingProfile: one(coachingProfiles)
}));
