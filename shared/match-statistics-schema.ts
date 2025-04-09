/**
 * PKL-278651-MATCH-0002-XR - Enhanced Match Recording System
 * Match Statistics Schema - Extends the core match system with detailed statistics tracking
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, json, jsonb, date, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { matches, users } from './schema';

/**
 * Match Statistics table - Tracks detailed performance metrics for each match
 * 
 * Note: This schema has been updated to match the actual database structure
 */
export const matchStatistics = pgTable("match_statistics", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  
  // General statistics
  totalPoints: integer("total_points"),
  rallyLengthAvg: real("rally_length_avg"),
  longestRally: integer("longest_rally"),
  
  // Shot statistics
  unforcedErrors: integer("unforced_errors"),
  winners: integer("winners"),
  
  // Point-specific statistics
  netPointsWon: integer("net_points_won"),
  netPointsTotal: integer("net_points_total"),
  dinkPointsWon: integer("dink_points_won"),
  dinkPointsTotal: integer("dink_points_total"),
  servePointsWon: integer("serve_points_won"),
  servePointsTotal: integer("serve_points_total"),
  returnPointsWon: integer("return_points_won"),
  returnPointsTotal: integer("return_points_total"),
  
  // Technical statistics
  thirdShotSuccessRate: real("third_shot_success_rate"),
  timeAtNetPct: real("time_at_net_pct"),
  
  // Physical statistics
  distanceCoveredMeters: real("distance_covered_meters"),
  avgShotSpeedKph: real("avg_shot_speed_kph"),
  
  // Additional data
  metadata: jsonb("metadata"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

/**
 * Player Performance Impact - Tracks how match performances affect player skill dimensions
 * 
 * Note: This schema has been updated to match the actual database structure
 */
export const performanceImpacts = pgTable("performance_impacts", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  userId: integer("user_id").notNull().references(() => users.id),
  
  // The skill dimension being impacted
  dimension: varchar("dimension", { length: 50 }).notNull(),
  
  // The impact value (positive or negative)
  impactValue: integer("impact_value").notNull(),
  
  // Explanation for the impact
  reason: text("reason"),
  
  // Additional metadata
  metadata: jsonb("metadata"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at")
});

/**
 * Match Performance Highlights - Notable moments or achievements during the match
 */
export const matchHighlights = pgTable("match_highlights", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull().references(() => matches.id),
  userId: integer("user_id").notNull().references(() => users.id),
  
  highlightType: varchar("highlight_type", { length: 50 }).notNull(), // "exceptional_play", "critical_moment", etc.
  description: text("description").notNull(),
  timestampSeconds: integer("timestamp_seconds"), // Timestamp within the match when the highlight occurred
  
  metadata: jsonb("metadata"), // Any additional structured data
  
  createdAt: timestamp("created_at").defaultNow()
});

// Create relationships
export const matchStatisticsRelations = relations(matchStatistics, ({ one }) => ({
  match: one(matches, { fields: [matchStatistics.matchId], references: [matches.id] })
}));

export const performanceImpactsRelations = relations(performanceImpacts, ({ one }) => ({
  match: one(matches, { fields: [performanceImpacts.matchId], references: [matches.id] }),
  user: one(users, { fields: [performanceImpacts.userId], references: [users.id] })
}));

export const matchHighlightsRelations = relations(matchHighlights, ({ one }) => ({
  match: one(matches, { fields: [matchHighlights.matchId], references: [matches.id] }),
  user: one(users, { fields: [matchHighlights.userId], references: [users.id] })
}));

// Create insert schemas
export const insertMatchStatisticsSchema = createInsertSchema(matchStatistics)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertPerformanceImpactsSchema = createInsertSchema(performanceImpacts)
  .omit({ id: true, createdAt: true, processedAt: true });

export const insertMatchHighlightsSchema = createInsertSchema(matchHighlights)
  .omit({ id: true, createdAt: true });

// Define types using the schemas
export type InsertMatchStatistics = z.infer<typeof insertMatchStatisticsSchema>;
export type InsertPerformanceImpact = z.infer<typeof insertPerformanceImpactsSchema>;
export type InsertMatchHighlight = z.infer<typeof insertMatchHighlightsSchema>;

// Export table types as well
export type MatchStatistics = typeof matchStatistics.$inferSelect;
export type PerformanceImpact = typeof performanceImpacts.$inferSelect;
export type MatchHighlight = typeof matchHighlights.$inferSelect;