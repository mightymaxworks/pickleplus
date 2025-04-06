import { pgTable, serial, integer, text, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Partner Criteria table
export const partnerCriteria = pgTable("partner_criteria", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skillRange: json("skill_range").$type<[number, number]>().notNull().default([2.5, 4.0]),
  ageRange: json("age_range").$type<[number, number] | null>(),
  genderPreference: text("gender_preference"),
  playStyle: text("play_style"),
  experienceLevel: text("experience_level"),
  competitiveness: text("competitiveness").notNull().default("moderate"),
  partnerStability: text("partner_stability").notNull().default("occasional"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Partner Availability (Recurring) table
export const partnerAvailability = pgTable("partner_availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: integer("start_time").notNull(), // Minutes from midnight
  endTime: integer("end_time").notNull(), // Minutes from midnight
  locationPreference: text("location_preference"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Special Availability (One-time) table
export const specialAvailability = pgTable("special_availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: integer("start_time").notNull(), // Minutes from midnight
  endTime: integer("end_time").notNull(), // Minutes from midnight
  locationPreference: text("location_preference"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Partner Suggestions table
export const partnerSuggestions = pgTable("partner_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  suggestedPartnerId: integer("suggested_partner_id").notNull(),
  suggestedPartnerName: text("suggested_partner_name").notNull(),
  suggestedPartnerRating: integer("suggested_partner_rating").notNull(),
  matchScore: integer("match_score").notNull(), // 0-100
  matchReasons: json("match_reasons").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  userAction: text("user_action"), // interested, not_interested, etc.
  partnerAction: text("partner_action"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  metadata: json("metadata")
});

// Define the Zod schema for inserting
export const insertPartnerCriteriaSchema = createInsertSchema(partnerCriteria)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertPartnerAvailabilitySchema = createInsertSchema(partnerAvailability)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertSpecialAvailabilitySchema = createInsertSchema(specialAvailability)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertPartnerSuggestionSchema = createInsertSchema(partnerSuggestions)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Define types
export type PartnerCriteria = typeof partnerCriteria.$inferSelect;
export type InsertPartnerCriteria = z.infer<typeof insertPartnerCriteriaSchema>;

export type PartnerAvailability = typeof partnerAvailability.$inferSelect;
export type InsertPartnerAvailability = z.infer<typeof insertPartnerAvailabilitySchema>;

export type SpecialAvailability = typeof specialAvailability.$inferSelect;
export type InsertSpecialAvailability = z.infer<typeof insertSpecialAvailabilitySchema>;

export type PartnerSuggestion = typeof partnerSuggestions.$inferSelect;
export type InsertPartnerSuggestion = z.infer<typeof insertPartnerSuggestionSchema>;