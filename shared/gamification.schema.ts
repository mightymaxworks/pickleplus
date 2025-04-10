/**
 * PKL-278651-GAME-0001-MOD
 * Gamification Schema
 * 
 * Defines the database schema for the gamification module, including
 * campaigns, discovery points, user progress, and rewards.
 */

import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  json,
  primaryKey
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

/**
 * Gamification Campaigns
 * 
 * A campaign is a collection of discovery points and rewards.
 */
export const gamificationCampaigns = pgTable('gamification_campaigns', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').notNull().default(true),
  config: json('config').$type<{
    theme?: string;
    requiredUserLevel?: number;
    showInList?: boolean;
    featuredImage?: string;
    tags?: string[];
  }>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Define campaign relations
export const campaignRelations = relations(gamificationCampaigns, ({ many }) => ({
  discoveryPoints: many(discoveryPoints),
  rewards: many(gamificationRewards),
  progress: many(campaignProgress),
}));

/**
 * Discovery Points
 * 
 * A discovery point is a specific item or interaction that can be discovered in the application.
 */
export const discoveryPoints = pgTable('discovery_points', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => gamificationCampaigns.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  pointValue: integer('point_value').default(10),
  content: json('content').$type<{
    title?: string;
    details?: string;
    imageUrl?: string;
    videoUrl?: string;
    externalLinks?: { label: string; url: string }[];
  }>().default({}),
  requirements: json('requirements').$type<{
    minUserLevel?: number;
    prerequisiteDiscoveries?: string[];
    userType?: string[];
    dateRestriction?: {
      from?: string;
      to?: string;
    };
  }>().default({}),
  config: json('config').$type<{
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'hidden' | 'educational' | 'game' | 'quiz';
    triggerAction?: string;
    location?: string;
  }>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
});

// Define discovery point relations
export const discoveryPointRelations = relations(discoveryPoints, ({ one, many }) => ({
  campaign: one(gamificationCampaigns, {
    fields: [discoveryPoints.campaignId],
    references: [gamificationCampaigns.id],
  }),
  userDiscoveries: many(userDiscoveries),
}));

/**
 * User Discoveries
 * 
 * Records of discoveries that users have found.
 */
export const userDiscoveries = pgTable('user_discoveries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  discoveryId: integer('discovery_id').references(() => discoveryPoints.id, { onDelete: 'cascade' }).notNull(),
  discoveredAt: timestamp('discovered_at').notNull().defaultNow(),
  rewardClaimed: boolean('reward_claimed').notNull().default(false),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
});

// Define user discoveries relations
export const userDiscoveriesRelations = relations(userDiscoveries, ({ one }) => ({
  user: one(users, {
    fields: [userDiscoveries.userId],
    references: [users.id],
  }),
  discovery: one(discoveryPoints, {
    fields: [userDiscoveries.discoveryId],
    references: [discoveryPoints.id],
  }),
}));

/**
 * Campaign Progress
 * 
 * Tracks a user's progress in a campaign.
 */
export const campaignProgress = pgTable('campaign_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  campaignId: integer('campaign_id').references(() => gamificationCampaigns.id, { onDelete: 'cascade' }).notNull(),
  discoveries: integer('discoveries').notNull().default(0),
  totalPoints: integer('total_points').notNull().default(0),
  progress: json('progress').$type<{
    percentage: number;
    milestones: Record<string, boolean>;
    lastActivity: string;
  }>().default({ percentage: 0, milestones: {}, lastActivity: new Date().toISOString() }),
  updatedAt: timestamp('updated_at'),
});

// Define campaign progress relations
export const campaignProgressRelations = relations(campaignProgress, ({ one }) => ({
  user: one(users, {
    fields: [campaignProgress.userId],
    references: [users.id],
  }),
  campaign: one(gamificationCampaigns, {
    fields: [campaignProgress.campaignId],
    references: [gamificationCampaigns.id],
  }),
}));

/**
 * Gamification Rewards
 * 
 * Rewards that can be earned through the gamification system.
 */
export const gamificationRewards = pgTable('gamification_rewards', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => gamificationCampaigns.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'badge', 'xp', 'feature_unlock', 'physical', etc.
  rarity: text('rarity').default('common'), // 'common', 'uncommon', 'rare', 'epic', 'legendary'
  imageUrl: text('image_url'),
  value: json('value').$type<{
    xpAmount?: number;
    badgeId?: string;
    featureId?: string;
    couponCode?: string;
    physicalItem?: {
      name: string;
      sku: string;
      shippingInfo?: Record<string, any>;
    };
  }>().default({}),
  requirements: json('requirements').$type<{
    discoveryIds?: number[];
    totalPoints?: number;
    totalDiscoveries?: number;
    specificDiscoveries?: string[]; // Discovery codes
  }>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
});

// Define reward relations
export const rewardRelations = relations(gamificationRewards, ({ one, many }) => ({
  campaign: one(gamificationCampaigns, {
    fields: [gamificationRewards.campaignId],
    references: [gamificationCampaigns.id],
  }),
  userRewards: many(userRewards),
}));

/**
 * User Rewards
 * 
 * Rewards that users have earned.
 */
export const userRewards = pgTable('user_rewards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rewardId: integer('reward_id').references(() => gamificationRewards.id, { onDelete: 'cascade' }).notNull(),
  earnedAt: timestamp('earned_at').notNull().defaultNow(),
  isRedeemed: boolean('is_redeemed').notNull().default(false),
  redeemedAt: timestamp('redeemed_at'),
  redemptionInfo: json('redemption_info').$type<Record<string, any>>().default({}),
});

// Define user rewards relations
export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(users, {
    fields: [userRewards.userId],
    references: [users.id],
  }),
  reward: one(gamificationRewards, {
    fields: [userRewards.rewardId],
    references: [gamificationRewards.id],
  }),
}));

/**
 * Discovery Events
 * 
 * Log of discovery events in the system.
 */
export const discoveryEvents = pgTable('discovery_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  discoveryId: integer('discovery_id').references(() => discoveryPoints.id),
  discoveryCode: text('discovery_code'),
  eventType: text('event_type').notNull(), // 'discovered', 'rewarded', 'completed', etc.
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  context: json('context').$type<Record<string, any>>().default({}),
});

// Define discovery events relations
export const discoveryEventsRelations = relations(discoveryEvents, ({ one }) => ({
  user: one(users, {
    fields: [discoveryEvents.userId],
    references: [users.id],
  }),
  discovery: one(discoveryPoints, {
    fields: [discoveryEvents.discoveryId],
    references: [discoveryPoints.id],
  }),
}));

// Zod schemas for insert operations
export const insertCampaignSchema = createInsertSchema(gamificationCampaigns, {
  config: z.any().optional(),
}).omit({ id: true, createdAt: true });

export const insertDiscoveryPointSchema = createInsertSchema(discoveryPoints, {
  content: z.any().optional(),
  requirements: z.any().optional(),
  config: z.any().optional(),
}).omit({ id: true, createdAt: true });

export const insertUserDiscoverySchema = createInsertSchema(userDiscoveries, {
  metadata: z.any().optional(),
}).omit({ id: true });

export const insertCampaignProgressSchema = createInsertSchema(campaignProgress, {
  progress: z.any().optional(),
}).omit({ id: true });

export const insertRewardSchema = createInsertSchema(gamificationRewards, {
  value: z.any().optional(),
  requirements: z.any().optional(),
}).omit({ id: true, createdAt: true });

export const insertUserRewardSchema = createInsertSchema(userRewards, {
  redemptionInfo: z.any().optional(),
}).omit({ id: true });

export const insertDiscoveryEventSchema = createInsertSchema(discoveryEvents, {
  context: z.any().optional(),
}).omit({ id: true });

// Types for insert operations
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type InsertDiscoveryPoint = z.infer<typeof insertDiscoveryPointSchema>;
export type InsertUserDiscovery = z.infer<typeof insertUserDiscoverySchema>;
export type InsertCampaignProgress = z.infer<typeof insertCampaignProgressSchema>;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;
export type InsertDiscoveryEvent = z.infer<typeof insertDiscoveryEventSchema>;

// Types for select operations
export type Campaign = typeof gamificationCampaigns.$inferSelect;
export type DiscoveryPoint = typeof discoveryPoints.$inferSelect;
export type UserDiscovery = typeof userDiscoveries.$inferSelect;
export type CampaignProgress = typeof campaignProgress.$inferSelect;
export type Reward = typeof gamificationRewards.$inferSelect;
export type UserReward = typeof userRewards.$inferSelect;
export type DiscoveryEvent = typeof discoveryEvents.$inferSelect;