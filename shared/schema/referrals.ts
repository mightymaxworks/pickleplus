/**
 * PKL-278651-COMM-0007 - Enhanced Referral System
 * Schema definitions for referral system
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */

import { pgTable, serial, integer, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../schema';

// Referrals table - tracks who referred whom
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id').notNull().references(() => users.id),
  referredId: integer('referred_id').notNull().references(() => users.id),
  dateReferred: timestamp('date_referred').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  xpAwarded: integer('xp_awarded').default(0).notNull(),
});

// Type definitions
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;
export const insertReferralSchema = createInsertSchema(referrals);

// Referral achievements table - tracks achievements earned from referrals
export const referralAchievements = pgTable('referral_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  achievementId: varchar('achievement_id', { length: 50 }).notNull(),
  dateEarned: timestamp('date_earned').defaultNow().notNull(),
  xpAwarded: integer('xp_awarded').default(0).notNull(),
});

// Type definitions
export type ReferralAchievement = typeof referralAchievements.$inferSelect;
export type InsertReferralAchievement = typeof referralAchievements.$inferInsert;
export const insertReferralAchievementSchema = createInsertSchema(referralAchievements);

// Pickleball tips table - for the status ticker
export const pickleballTips = pgTable('pickleball_tips', {
  id: serial('id').primaryKey(),
  tip: text('tip').notNull(),
  category: varchar('category', { length: 20 }).default('general').notNull(),
  priority: integer('priority').default(1).notNull(),
});

// Type definitions
export type PickleballTip = typeof pickleballTips.$inferSelect;
export type InsertPickleballTip = typeof pickleballTips.$inferInsert;
export const insertPickleballTipSchema = createInsertSchema(pickleballTips);

// Custom Zod schema for achievement data in the UI
export const achievementSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  xpAwarded: z.number(),
  dateEarned: z.string()
});

export type Achievement = z.infer<typeof achievementSchema>;

// Custom Zod schema for referral data in the UI
export const referralDisplaySchema = z.object({
  id: z.number(),
  username: z.string(),
  displayName: z.string().optional(),
  activityLevel: z.enum(['new', 'casual', 'active']),
  dateReferred: z.string(),
  matchesPlayed: z.number()
});

export type ReferralDisplay = z.infer<typeof referralDisplaySchema>;