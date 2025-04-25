/**
 * PKL-278651-SAGE-0015-CONCIERGE
 * SAGE Concierge Schema
 * 
 * This file defines the database schema and types for the SAGE concierge functionality.
 * 
 * @framework Framework5.3
 * @version 1.0.0
 * @lastModified 2025-04-25
 */

import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";
import { DimensionCode } from "./sage";

/**
 * User roles enum for access control
 */
export enum UserRole {
  PLAYER = "PLAYER",
  COACH = "COACH",
  REFEREE = "REFEREE",
  ADMIN = "ADMIN"
}

/**
 * Concierge interaction types
 */
export enum NavigationType {
  NAVIGATE = "NAVIGATE",
  RECOMMEND = "RECOMMEND",
  EXPLAIN = "EXPLAIN",
  OVERVIEW = "OVERVIEW"
}

// String literal type for type compatibility with services
export type NavigationTypeString = "NAVIGATE" | "RECOMMEND" | "EXPLAIN" | "OVERVIEW";

/**
 * SAGE Concierge interactions table
 * Tracks user interactions with the concierge feature
 */
export const conciergeInteractions = pgTable("sage_concierge_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  messageContent: text("message_content").notNull(),
  navigationType: text("navigation_type"), // NAVIGATE, RECOMMEND, EXPLAIN, OVERVIEW
  navigationTarget: text("navigation_target"), // Feature ID or path
  dimension: text("dimension"), // CourtIQ dimension if relevant
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at", { precision: 6 }).defaultNow()
});

/**
 * Concierge recommendations table
 * Stores personalized recommendations for users
 */
export const conciergeRecommendations = pgTable("sage_concierge_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  recommendationType: text("recommendation_type").notNull(), // feature, drill, training_plan, tournament
  itemId: text("item_id").notNull(), // ID of the recommended item
  dimension: text("dimension"), // CourtIQ dimension if relevant
  reason: text("reason"), // Reason for recommendation
  isViewed: boolean("is_viewed").default(false),
  isActioned: boolean("is_actioned").default(false),
  createdAt: timestamp("created_at", { precision: 6 }).defaultNow(),
  expiresAt: timestamp("expires_at", { precision: 6 })
});

/**
 * Concierge navigation stats table
 * Aggregates statistics about usage of the concierge feature
 */
export const conciergeNavigationStats = pgTable("sage_concierge_navigation_stats", {
  id: serial("id").primaryKey(),
  featureId: text("feature_id").notNull(),
  totalNavigations: integer("total_navigations").default(0),
  uniqueUsers: integer("unique_users").default(0),
  completionRate: integer("completion_rate").default(0), // Percentage 0-100
  lastUpdated: timestamp("last_updated", { precision: 6 }).defaultNow()
});

/**
 * Relations
 */
export const conciergeInteractionsRelations = relations(conciergeInteractions, ({ one }) => ({
  user: one(users, {
    fields: [conciergeInteractions.userId],
    references: [users.id]
  })
}));

export const conciergeRecommendationsRelations = relations(conciergeRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [conciergeRecommendations.userId],
    references: [users.id]
  })
}));

/**
 * Zod schemas for validation
 */
export const insertConciergeInteractionSchema = createInsertSchema(conciergeInteractions);
export const insertConciergeRecommendationSchema = createInsertSchema(conciergeRecommendations);
export const insertConciergeNavigationStatSchema = createInsertSchema(conciergeNavigationStats);

/**
 * Type definitions
 */
export type ConciergeInteraction = typeof conciergeInteractions.$inferSelect;
export type InsertConciergeInteraction = z.infer<typeof insertConciergeInteractionSchema>;

export type ConciergeRecommendation = typeof conciergeRecommendations.$inferSelect;
export type InsertConciergeRecommendation = z.infer<typeof insertConciergeRecommendationSchema>;

export type ConciergeNavigationStat = typeof conciergeNavigationStats.$inferSelect;
export type InsertConciergeNavigationStat = z.infer<typeof insertConciergeNavigationStatSchema>;

/**
 * Interface for navigation actions
 */
export interface NavigationAction {
  type: NavigationTypeString;
  target: string;
  reason?: string;
  feature?: any;
  dimension?: DimensionCode;
}

/**
 * Interface for recommendations
 */
export interface Recommendation {
  id: string;
  type: 'feature' | 'drill' | 'training_plan' | 'tournament';
  name: string;
  description: string;
  path: string;
  reason: string;
  dimensionFocus?: DimensionCode;
  score?: number;
}

/**
 * Navigation intent detection configuration
 */
export const navigationTriggers = {
  navigate: [
    'take me to', 'go to', 'navigate to', 'open',
    'show me', 'find', 'where is', 'how do i get to',
    'access', 'view'
  ],
  explain: [
    'what is', 'tell me about', 'explain', 'how does',
    'information on', 'details about', 'describe',
    'help me understand', 'how to use'
  ],
  recommend: [
    'recommend', 'suggestion', 'what should', 'best for me',
    'help me find', 'what would help me', 'suggest',
    'i need help with', 'what do you recommend'
  ]
};