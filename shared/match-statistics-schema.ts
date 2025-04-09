/**
 * PKL-278651-MATCH-0003-DS: Match Statistics Schema
 * This file defines the schema for match statistics, performance impacts, and match highlights
 */
import { pgTable, serial, integer, text, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { matches } from "./schema";

// Match Statistics Table
export const matchStatistics = pgTable("match_statistics", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id).notNull(),
  
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
  distanceCoveredMeters: real("distance_covered_meters"),
  avgShotSpeedKph: real("avg_shot_speed_kph"),
  
  // Metadata for additional fields
  metadata: jsonb("metadata"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Performance Impact Table
export const performanceImpacts = pgTable("performance_impacts", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id).notNull(),
  userId: integer("user_id").notNull(),
  dimension: text("dimension").notNull(),
  impactValue: integer("impact_value").notNull(),
  reason: text("reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Match Highlights Table
export const matchHighlights = pgTable("match_highlights", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id).notNull(),
  userId: integer("user_id").notNull(),
  highlightType: text("highlight_type").notNull(),
  description: text("description").notNull(),
  timestampSeconds: integer("timestamp_seconds"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod insert schemas
export const insertMatchStatisticsSchema = createInsertSchema(matchStatistics, {
  matchId: z.number(),
  totalPoints: z.number().int().optional(),
  rallyLengthAvg: z.number().optional(),
  longestRally: z.number().int().optional(),
  unforcedErrors: z.number().int().optional(),
  winners: z.number().int().optional(),
  netPointsWon: z.number().int().optional(),
  netPointsTotal: z.number().int().optional(),
  dinkPointsWon: z.number().int().optional(),
  dinkPointsTotal: z.number().int().optional(),
  servePointsWon: z.number().int().optional(),
  servePointsTotal: z.number().int().optional(),
  returnPointsWon: z.number().int().optional(),
  returnPointsTotal: z.number().int().optional(),
  thirdShotSuccessRate: z.number().optional(),
  timeAtNetPct: z.number().optional(),
  distanceCoveredMeters: z.number().optional(),
  avgShotSpeedKph: z.number().optional(),
  metadata: z.any().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPerformanceImpactSchema = createInsertSchema(performanceImpacts, {
  matchId: z.number(),
  userId: z.number(),
  dimension: z.string().min(1),
  impactValue: z.number().int(),
  reason: z.string().optional(),
  metadata: z.any().optional(),
}).omit({ id: true, createdAt: true });

export const insertMatchHighlightSchema = createInsertSchema(matchHighlights, {
  matchId: z.number(),
  userId: z.number(),
  highlightType: z.string().min(1),
  description: z.string().min(1),
  timestampSeconds: z.number().int().optional(),
  metadata: z.any().optional(),
}).omit({ id: true, createdAt: true });

// TypeScript types for inserts
export type InsertMatchStatistics = z.infer<typeof insertMatchStatisticsSchema>;
export type InsertPerformanceImpact = z.infer<typeof insertPerformanceImpactSchema>;
export type InsertMatchHighlight = z.infer<typeof insertMatchHighlightSchema>;