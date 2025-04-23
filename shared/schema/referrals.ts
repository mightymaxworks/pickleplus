// PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
// Referral system schema

import { pgTable, serial, integer, varchar, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

// Define activity level enum
export const activityLevelEnum = pgEnum("activity_level", ["new", "casual", "active"]);

// Define referral table
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredUserId: integer("referred_user_id").notNull().references(() => users.id),
  dateReferred: timestamp("date_referred").defaultNow().notNull(),
  registrationDate: timestamp("registration_date"),
  activityLevel: activityLevelEnum("activity_level").default("new"),
  xpAwarded: integer("xp_awarded").default(0),
  // Extra info
  matchesPlayed: integer("matches_played").default(0),
  lastActive: timestamp("last_active"),
});

// Define referral achievement tiers
export const referralAchievements = pgTable("referral_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tierLevel: integer("tier_level").notNull(),
  dateAchieved: timestamp("date_achieved").defaultNow().notNull(),
  bonusXpAwarded: integer("bonus_xp_awarded").default(0),
  achievementName: varchar("achievement_name", { length: 100 }).notNull(),
  achievementDescription: text("achievement_description"),
});

// Define pickleball tips
export const pickleballTips = pgTable("pickleball_tips", {
  id: serial("id").primaryKey(),
  tipText: text("tip_text").notNull(),
  displayPriority: integer("display_priority").default(5),
  category: varchar("category", { length: 50 }).default("general"),
  isActive: boolean("is_active").default(true),
});

// Define relations
export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "user_referrals",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "user_referred_by",
  }),
}));

export const referralAchievementsRelations = relations(referralAchievements, ({ one }) => ({
  user: one(users, {
    fields: [referralAchievements.userId],
    references: [users.id],
    relationName: "user_referral_achievements",
  }),
}));

// Create insert schemas
export const insertReferralSchema = createInsertSchema(referrals);
export const insertReferralAchievementSchema = createInsertSchema(referralAchievements);
export const insertPickleballTipSchema = createInsertSchema(pickleballTips);

// Export types
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type ReferralAchievement = typeof referralAchievements.$inferSelect;
export type InsertReferralAchievement = z.infer<typeof insertReferralAchievementSchema>;
export type PickleballTip = typeof pickleballTips.$inferSelect;
export type InsertPickleballTip = z.infer<typeof insertPickleballTipSchema>;