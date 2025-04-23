/**
 * PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
 * Referrals Schema
 * 
 * This file defines the database schema for the referral system.
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */
import { pgTable, serial, integer, timestamp, text, varchar, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';
import { users } from '../schema';

/**
 * Activity level enum for tracking user engagement
 */
export const activityLevelEnum = pgEnum("activity_level", ["new", "casual", "active"]);

/**
 * Referrals table
 * Tracks when users refer other users to the platform
 */
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => users.id),
  referredUserId: integer("referred_user_id").notNull().references(() => users.id),
  dateReferred: timestamp("date_referred").notNull().defaultNow(),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  activityLevel: activityLevelEnum("activity_level").notNull().default("new"),
  xpAwarded: integer("xp_awarded").notNull().default(20),
  matchesPlayed: integer("matches_played").notNull().default(0),
  lastActive: timestamp("last_active").notNull().defaultNow()
});

/**
 * Referral achievements table
 * Tracks different achievement levels and bonuses earned through referrals
 */
export const referralAchievements = pgTable("referral_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tierLevel: integer("tier_level").notNull(),
  dateAchieved: timestamp("date_achieved").notNull().defaultNow(),
  bonusXpAwarded: integer("bonus_xp_awarded").notNull().default(0),
  achievementName: varchar("achievement_name", { length: 100 }).notNull(),
  achievementDescription: text("achievement_description").notNull()
});

/**
 * Pickleball tips table
 * Stores tips to be displayed in the community ticker
 */
export const pickleballTips = pgTable("pickleball_tips", {
  id: serial("id").primaryKey(),
  tipContent: text("tip_content").notNull(),
  source: varchar("source", { length: 255 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  displayPriority: integer("display_priority").notNull().default(10)
});

/**
 * Relations
 */
export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "user_made_referrals"
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "user_referred_by"
  })
}));

export const referralAchievementsRelations = relations(referralAchievements, ({ one }) => ({
  user: one(users, {
    fields: [referralAchievements.userId],
    references: [users.id]
  })
}));

/**
 * Zod schemas for validation
 */
export const insertReferralSchema = createInsertSchema(referrals);
export const insertReferralAchievementSchema = createInsertSchema(referralAchievements);
export const insertPickleballTipSchema = createInsertSchema(pickleballTips);

/**
 * TypeScript types
 */
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type ReferralAchievement = typeof referralAchievements.$inferSelect;
export type InsertReferralAchievement = z.infer<typeof insertReferralAchievementSchema>;

export type PickleballTip = typeof pickleballTips.$inferSelect;
export type InsertPickleballTip = z.infer<typeof insertPickleballTipSchema>;