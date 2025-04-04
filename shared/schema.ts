import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  location: text("location"),
  playingSince: text("playing_since"),
  skillLevel: text("skill_level"),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  avatarInitials: text("avatar_initials").notNull(),
  totalMatches: integer("total_matches").default(0),
  matchesWon: integer("matches_won").default(0),
  totalTournaments: integer("total_tournaments").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
  tournamentRegistrations: many(tournamentRegistrations),
  userAchievements: many(userAchievements),
  activities: many(activities),
  userRedemptions: many(userRedemptions)
}));

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

// Insert schema definitions using drizzle-zod
// Schema for validating user registration
export const registerUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
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

export const redeemCodeSchema = z.object({
  code: z.string().min(1)
});

export const loginSchema = z.object({
  username: z.string().min(1),
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

export type RedeemCode = z.infer<typeof redeemCodeSchema>;
export type Login = z.infer<typeof loginSchema>;
