import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

// Partner Criteria table - Represents user's detailed partner preferences
export const partnerCriteria = pgTable("partner_criteria", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(), // A name for this criteria set (e.g., "Tournament Partners", "Casual Play")
  skillLevelMin: text("skill_level_min"), // Minimum skill level for matching
  skillLevelMax: text("skill_level_max"), // Maximum skill level for matching
  ageMin: integer("age_min"), // Minimum age preference
  ageMax: integer("age_max"), // Maximum age preference
  preferredPlayingStyles: json("preferred_playing_styles").array(), // Array of compatible playing styles
  preferredFormat: text("preferred_format"), // Singles, Doubles, Mixed Doubles
  maxDistance: integer("max_distance"), // Maximum distance in miles/km
  preferredLocationTypes: json("preferred_location_types").array(), // Indoor, Outdoor, Dedicated courts, etc.
  preferredExperience: json("preferred_experience").array(), // Beginner-friendly, competitive, etc.
  preferredFrequency: text("preferred_frequency"), // How often they want to play
  matchPurpose: text("match_purpose"), // Casual, Practice, Competitive, Training
  languagePreferences: json("language_preferences").array(), // Preferred languages
  timeCommitment: text("time_commitment"), // Short, Medium, Long matches
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Partner Availability table - Detailed user availability schedule
export const partnerAvailability = pgTable("partner_availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday to Saturday
  startTime: integer("start_time").notNull(), // Minutes since midnight (0-1439)
  endTime: integer("end_time").notNull(), // Minutes since midnight (0-1439)
  isRecurring: boolean("is_recurring").default(true),
  location: text("location"), // Optional specific location for this time slot
  notes: text("notes"), // Any notes about this availability
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// One-time or special availability entries
export const specialAvailability = pgTable("special_availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  startTime: integer("start_time").notNull(), // Minutes since midnight
  endTime: integer("end_time").notNull(), // Minutes since midnight
  location: text("location"),
  notes: text("notes"),
  type: text("type").default("one_time"), // one_time, recurring_exception
  status: text("status").default("available"), // available, unavailable (to override regular schedule)
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner Match Suggestions - Auto-generated partner matches
export const partnerSuggestions = pgTable("partner_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  suggestedPartnerId: integer("suggested_partner_id").references(() => users.id).notNull(),
  criteriaId: integer("criteria_id").references(() => partnerCriteria.id),
  matchScore: integer("match_score").notNull(), // 0-100 compatibility score
  reasonCodes: json("reason_codes").array(), // Array of reason codes explaining the match
  suggestedDate: date("suggested_date"),
  suggestedTime: integer("suggested_time"), // Minutes since midnight
  suggestedLocation: text("suggested_location"),
  status: text("status").default("pending"), // pending, accepted, rejected, expired
  userAction: text("user_action"), // viewed, contacted, scheduled
  partnerAction: text("partner_action"), // viewed, contacted, scheduled
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  metadata: json("metadata"), // Additional matching data
});

// Define relations
export const partnerCriteriaRelations = relations(partnerCriteria, ({ one }) => ({
  user: one(users, {
    fields: [partnerCriteria.userId],
    references: [users.id],
  }),
}));

export const partnerAvailabilityRelations = relations(partnerAvailability, ({ one }) => ({
  user: one(users, {
    fields: [partnerAvailability.userId],
    references: [users.id],
  }),
}));

export const specialAvailabilityRelations = relations(specialAvailability, ({ one }) => ({
  user: one(users, {
    fields: [specialAvailability.userId],
    references: [users.id],
  }),
}));

export const partnerSuggestionsRelations = relations(partnerSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [partnerSuggestions.userId],
    references: [users.id],
  }),
  suggestedPartner: one(users, {
    fields: [partnerSuggestions.suggestedPartnerId],
    references: [users.id],
  }),
  criteria: one(partnerCriteria, {
    fields: [partnerSuggestions.criteriaId],
    references: [partnerCriteria.id],
  }),
}));

// Zod schemas for validation and type inference
export const insertPartnerCriteriaSchema = createInsertSchema(partnerCriteria);
export const insertPartnerAvailabilitySchema = createInsertSchema(partnerAvailability);
export const insertSpecialAvailabilitySchema = createInsertSchema(specialAvailability);
export const insertPartnerSuggestionSchema = createInsertSchema(partnerSuggestions);

// Types
export type PartnerCriteria = typeof partnerCriteria.$inferSelect;
export type InsertPartnerCriteria = z.infer<typeof insertPartnerCriteriaSchema>;

export type PartnerAvailability = typeof partnerAvailability.$inferSelect;
export type InsertPartnerAvailability = z.infer<typeof insertPartnerAvailabilitySchema>;

export type SpecialAvailability = typeof specialAvailability.$inferSelect;
export type InsertSpecialAvailability = z.infer<typeof insertSpecialAvailabilitySchema>;

export type PartnerSuggestion = typeof partnerSuggestions.$inferSelect;
export type InsertPartnerSuggestion = z.infer<typeof insertPartnerSuggestionSchema>;