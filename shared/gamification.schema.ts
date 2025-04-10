/**
 * PKL-278651-GAME-0001-MOD
 * Gamification Module Schema
 * 
 * This file defines the database schema for the gamification module,
 * including discoveries, campaigns, rewards, and user progress tracking.
 */

import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  json, 
  primaryKey,
  uniqueIndex 
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

/**
 * Gamification Campaigns
 * Represents a themed collection of discoveries and rewards
 */
export const gamificationCampaigns = pgTable('gamification_campaigns', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull().defaultNow(),
  endDate: timestamp('end_date'),
  isActive: boolean('is_active').notNull().default(true),
  config: json('config').$type<{
    requiredDiscoveriesCount?: number; 
    progressCalculation?: 'count' | 'percentage' | 'points';
    displayOrder?: number;
  }>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Discovery Points
 * Defines the interactive points that users can discover
 */
export const discoveryPoints = pgTable('discovery_points', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => gamificationCampaigns.id).notNull(),
  code: text('code').notNull(), // unique code used in front-end to identify discovery
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // e.g. 'click', 'konami', 'sequence', 'easter_egg'
  location: text('location').notNull(), // e.g. 'landing_page', 'dashboard', 'match_detail'
  content: json('content').$type<{
    title: string;
    message: string;
    imageUrl?: string;
    details?: string;
  }>().notNull(),
  pointValue: integer('point_value').notNull().default(10),
  requirements: json('requirements').$type<{
    prerequisiteDiscoveries?: string[];
    minUserLevel?: number;
    userType?: string[];
    dateRestriction?: {
      from?: string;
      to?: string;
    };
  }>().default({}),
  config: json('config').$type<{
    triggerType: 'click' | 'sequence' | 'konami' | 'timer' | 'scroll' | 'custom';
    triggerConfig?: Record<string, any>;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTimeToFind?: number; // in minutes
  }>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => {
  return {
    codeIdx: uniqueIndex('discovery_points_code_idx').on(table.code),
  };
});

/**
 * User Discoveries
 * Tracks which discovery points each user has found
 */
export const userDiscoveries = pgTable('user_discoveries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  discoveryId: integer('discovery_id').references(() => discoveryPoints.id).notNull(),
  discoveredAt: timestamp('discovered_at').notNull().defaultNow(),
  rewardClaimed: boolean('reward_claimed').notNull().default(false),
  rewardClaimedAt: timestamp('reward_claimed_at'),
  metadata: json('metadata').$type<{
    context?: Record<string, any>;
    deviceInfo?: Record<string, any>;
    locationInApp?: string;
  }>().default({})
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.discoveryId] })
  };
});

/**
 * Gamification Rewards
 * Defines rewards that can be earned through discoveries
 */
export const gamificationRewards = pgTable('gamification_rewards', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // e.g. 'xp', 'badge', 'feature_unlock', 'physical'
  value: json('value').$type<{
    xpAmount?: number;
    badgeId?: string;
    featureCode?: string;
    physicalItem?: {
      sku: string;
      name: string;
      shippingRequired: boolean;
    };
    other?: Record<string, any>;
  }>().notNull(),
  imageUrl: text('image_url'),
  rarity: text('rarity').default('common'), // common, uncommon, rare, epic, legendary
  requirements: json('requirements').$type<{
    discoveryIds?: number[];
    campaignId?: number;
    discoveryCount?: number;
  }>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * User Rewards
 * Tracks rewards earned by users
 */
export const userRewards = pgTable('user_rewards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  rewardId: integer('reward_id').references(() => gamificationRewards.id).notNull(),
  earnedAt: timestamp('earned_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
  isRedeemed: boolean('is_redeemed').notNull().default(false),
  redeemedAt: timestamp('redeemed_at'),
  redemptionInfo: json('redemption_info').$type<{
    code?: string;
    transactionId?: string;
    shippingDetails?: Record<string, any>;
    notes?: string;
  }>().default({})
});

/**
 * Campaign Progress
 * Tracks user progress in each campaign
 */
export const campaignProgress = pgTable('campaign_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  campaignId: integer('campaign_id').references(() => gamificationCampaigns.id).notNull(),
  discoveries: integer('discoveries').notNull().default(0),
  totalPoints: integer('total_points').notNull().default(0),
  completedAt: timestamp('completed_at'),
  progress: json('progress').$type<{
    percentage: number;
    milestones: Record<string, boolean>;
    lastActivity: string;
  }>().default({ percentage: 0, milestones: {}, lastActivity: new Date().toISOString() }),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => {
  return {
    userCampaignIdx: uniqueIndex('campaign_progress_user_campaign_idx').on(
      table.userId, 
      table.campaignId
    )
  };
});

// Zod schemas for validation
export const insertCampaignSchema = createInsertSchema(gamificationCampaigns);
export const insertDiscoveryPointSchema = createInsertSchema(discoveryPoints);
export const insertUserDiscoverySchema = createInsertSchema(userDiscoveries);
export const insertRewardSchema = createInsertSchema(gamificationRewards);
export const insertUserRewardSchema = createInsertSchema(userRewards);
export const insertCampaignProgressSchema = createInsertSchema(campaignProgress);

// Types
export type Campaign = typeof gamificationCampaigns.$inferSelect;
export type InsertCampaign = typeof gamificationCampaigns.$inferInsert;

export type DiscoveryPoint = typeof discoveryPoints.$inferSelect;
export type InsertDiscoveryPoint = typeof discoveryPoints.$inferInsert;

export type UserDiscovery = typeof userDiscoveries.$inferSelect;
export type InsertUserDiscovery = typeof userDiscoveries.$inferInsert;

export type Reward = typeof gamificationRewards.$inferSelect;
export type InsertReward = typeof gamificationRewards.$inferInsert;

export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = typeof userRewards.$inferInsert;

export type CampaignProgress = typeof campaignProgress.$inferSelect;
export type InsertCampaignProgress = typeof campaignProgress.$inferInsert;