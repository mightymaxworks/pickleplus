// Coach Marketplace Discovery System Schema
// UDF Development Request: Coach Marketplace Discovery
// Dependencies: Coach profiles, PCP certification system, Session booking

import { pgTable, serial, integer, varchar, text, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Coach Marketplace Profiles - Extended coach data for discovery
export const coachMarketplaceProfiles = pgTable('coach_marketplace_profiles', {
  id: serial('id').primaryKey(),
  coachId: integer('coach_id').notNull(), // References coachProfiles.id
  userId: integer('user_id').notNull(), // References users.id
  
  // Discovery & Search Fields
  displayName: varchar('display_name', { length: 100 }).notNull(),
  tagline: varchar('tagline', { length: 200 }),
  specialties: jsonb('specialties').$type<string[]>().default([]),
  location: varchar('location', { length: 100 }),
  radius: integer('radius').default(25), // Service radius in miles
  
  // Availability & Pricing
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  packageRates: jsonb('package_rates').$type<{
    sessionCount: number;
    price: number;
    description: string;
  }[]>().default([]),
  availableTimeSlots: jsonb('available_time_slots').$type<{
    day: string;
    startTime: string;
    endTime: string;
  }[]>().default([]),
  
  // Rating & Reviews
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  totalSessions: integer('total_sessions').default(0),
  
  // Discovery Features
  isDiscoverable: boolean('is_discoverable').default(true),
  isPremiumListed: boolean('is_premium_listed').default(false),
  featuredUntil: timestamp('featured_until'),
  
  // AI Matching Data
  teachingStyle: jsonb('teaching_style').$type<{
    approach: 'technical' | 'strategic' | 'mental' | 'mixed';
    intensity: 'relaxed' | 'moderate' | 'intense';
    focus: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  }>(),
  playerPreferences: jsonb('player_preferences').$type<{
    ageGroups: string[];
    skillLevels: string[];
    sessionTypes: string[];
  }>().default({ ageGroups: [], skillLevels: [], sessionTypes: [] }),
  
  // Performance Metrics
  responseTime: integer('response_time').default(24), // Average response time in hours
  bookingRate: decimal('booking_rate', { precision: 5, scale: 2 }).default('0'), // Conversion rate
  retentionRate: decimal('retention_rate', { precision: 5, scale: 2 }).default('0'),
  
  // SEO & Discovery
  seoKeywords: text('seo_keywords'),
  profileViews: integer('profile_views').default(0),
  searchRank: decimal('search_rank', { precision: 10, scale: 2 }).default('0'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Coach Search History - Track search patterns for AI improvement
export const coachSearchHistory = pgTable('coach_search_history', {
  id: serial('id').primaryKey(),
  searcherId: integer('searcher_id'), // References users.id (can be null for anonymous)
  
  // Search Parameters
  searchQuery: text('search_query'),
  location: varchar('location', { length: 100 }),
  radius: integer('radius'),
  specialties: jsonb('specialties').$type<string[]>().default([]),
  priceRange: jsonb('price_range').$type<{
    min: number;
    max: number;
  }>(),
  availability: jsonb('availability').$type<{
    days: string[];
    timePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
  }>(),
  
  // Results & Interactions
  resultsCount: integer('results_count').default(0),
  topResults: jsonb('top_results').$type<number[]>().default([]), // Coach IDs
  clickedProfiles: jsonb('clicked_profiles').$type<number[]>().default([]),
  bookingsMade: jsonb('bookings_made').$type<number[]>().default([]),
  
  searchedAt: timestamp('searched_at').defaultNow()
});

// Coach Marketplace Reviews - Enhanced review system for discovery
export const coachMarketplaceReviews = pgTable('coach_marketplace_reviews', {
  id: serial('id').primaryKey(),
  coachId: integer('coach_id').notNull(), // References coachMarketplaceProfiles.coachId
  reviewerId: integer('reviewer_id').notNull(), // References users.id
  
  // Review Content
  rating: integer('rating').notNull(), // 1-5 stars
  title: varchar('title', { length: 100 }),
  content: text('content'),
  
  // Detailed Ratings
  technicalSkills: integer('technical_skills'), // 1-5
  communication: integer('communication'), // 1-5
  reliability: integer('reliability'), // 1-5
  valueForMoney: integer('value_for_money'), // 1-5
  
  // Review Tags
  tags: jsonb('tags').$type<string[]>().default([]),
  
  // Verification
  isVerifiedBooking: boolean('is_verified_booking').default(false),
  sessionDate: timestamp('session_date'),
  
  // Moderation
  isApproved: boolean('is_approved').default(true),
  isReported: boolean('is_reported').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Coach Discovery Analytics - Track discovery performance
export const coachDiscoveryAnalytics = pgTable('coach_discovery_analytics', {
  id: serial('id').primaryKey(),
  coachId: integer('coach_id').notNull(),
  
  // Daily Metrics
  date: timestamp('date').notNull(),
  profileViews: integer('profile_views').default(0),
  searchAppearances: integer('search_appearances').default(0),
  clickThroughRate: decimal('click_through_rate', { precision: 5, scale: 2 }).default('0'),
  
  // Booking Metrics
  inquiries: integer('inquiries').default(0),
  bookings: integer('bookings').default(0),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }).default('0'),
  
  // Performance Scores
  discoveryScore: decimal('discovery_score', { precision: 10, scale: 2 }).default('0'),
  matchingScore: decimal('matching_score', { precision: 10, scale: 2 }).default('0'),
  
  createdAt: timestamp('created_at').defaultNow()
});

// Coach Favorite Lists - Player saved coaches
export const coachFavoriteLists = pgTable('coach_favorite_lists', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull(), // References users.id
  coachId: integer('coach_id').notNull(), // References coachMarketplaceProfiles.coachId
  
  // Organization
  listName: varchar('list_name', { length: 50 }).default('Favorites'),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow()
});

// Relations
export const coachMarketplaceProfilesRelations = relations(coachMarketplaceProfiles, ({ many }) => ({
  reviews: many(coachMarketplaceReviews),
  analytics: many(coachDiscoveryAnalytics),
  favorites: many(coachFavoriteLists)
}));

export const coachSearchHistoryRelations = relations(coachSearchHistory, ({ one }) => ({
  // Relations can be added when user schema is available
}));

export const coachMarketplaceReviewsRelations = relations(coachMarketplaceReviews, ({ one }) => ({
  coach: one(coachMarketplaceProfiles, {
    fields: [coachMarketplaceReviews.coachId],
    references: [coachMarketplaceProfiles.coachId]
  })
}));

export const coachDiscoveryAnalyticsRelations = relations(coachDiscoveryAnalytics, ({ one }) => ({
  coach: one(coachMarketplaceProfiles, {
    fields: [coachDiscoveryAnalytics.coachId],
    references: [coachMarketplaceProfiles.coachId]
  })
}));

export const coachFavoriteListsRelations = relations(coachFavoriteLists, ({ one }) => ({
  coach: one(coachMarketplaceProfiles, {
    fields: [coachFavoriteLists.coachId],
    references: [coachMarketplaceProfiles.coachId]
  })
}));

// Zod Schemas
export const insertCoachMarketplaceProfileSchema = createInsertSchema(coachMarketplaceProfiles);
export const insertCoachSearchHistorySchema = createInsertSchema(coachSearchHistory);
export const insertCoachMarketplaceReviewSchema = createInsertSchema(coachMarketplaceReviews);
export const insertCoachDiscoveryAnalyticsSchema = createInsertSchema(coachDiscoveryAnalytics);
export const insertCoachFavoriteListSchema = createInsertSchema(coachFavoriteLists);

// Enhanced search schema with validation
export const coachSearchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  radius: z.number().min(1).max(100).default(25),
  specialties: z.array(z.string()).default([]),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  availability: z.object({
    days: z.array(z.string()).optional(),
    timePreference: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional()
  }).optional(),
  rating: z.number().min(1).max(5).optional(),
  sortBy: z.enum(['relevance', 'rating', 'price', 'distance', 'popularity']).default('relevance'),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0)
});

// Types
export type CoachMarketplaceProfile = typeof coachMarketplaceProfiles.$inferSelect;
export type InsertCoachMarketplaceProfile = z.infer<typeof insertCoachMarketplaceProfileSchema>;
export type CoachSearchHistory = typeof coachSearchHistory.$inferSelect;
export type InsertCoachSearchHistory = z.infer<typeof insertCoachSearchHistorySchema>;
export type CoachMarketplaceReview = typeof coachMarketplaceReviews.$inferSelect;
export type InsertCoachMarketplaceReview = z.infer<typeof insertCoachMarketplaceReviewSchema>;
export type CoachDiscoveryAnalytics = typeof coachDiscoveryAnalytics.$inferSelect;
export type InsertCoachDiscoveryAnalytics = z.infer<typeof insertCoachDiscoveryAnalyticsSchema>;
export type CoachFavoriteList = typeof coachFavoriteLists.$inferSelect;
export type InsertCoachFavoriteList = z.infer<typeof insertCoachFavoriteListSchema>;
export type CoachSearchParams = z.infer<typeof coachSearchSchema>;

// Enhanced coach profile with marketplace data
export type CoachWithMarketplaceData = CoachMarketplaceProfile & {
  reviews: CoachMarketplaceReview[];
  recentAnalytics: CoachDiscoveryAnalytics[];
  isFavorited?: boolean;
};