import { pgTable, serial, integer, varchar, text, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Forward reference to avoid circular dependency
const usersReference = { name: "users", schema: "" };

// User privacy settings table
export const userPrivacySettings = pgTable("user_privacy_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(usersReference, "id"),
  fieldName: varchar("field_name", { length: 100 }).notNull(),
  visibilityLevel: varchar("visibility_level", { length: 20 }).notNull().default("public"), // "public", "connections", "private"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Privacy profiles (presets) table
export const privacyProfiles = pgTable("privacy_profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  settings: jsonb("settings").notNull(), // JSON object with field -> visibility mappings
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Contact preferences table
export const contactPreferences = pgTable("contact_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  allowMatchRequests: boolean("allow_match_requests").default(true),
  allowDirectMessages: boolean("allow_direct_messages").default(true),
  allowConnectionRequests: boolean("allow_connection_requests").default(true),
  allowMentoring: boolean("allow_mentoring").default(false),
  notificationFrequency: varchar("notification_frequency", { length: 20 }).default("daily"), // "immediate", "daily", "weekly", "none"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Relations
export const userPrivacySettingsRelations = relations(userPrivacySettings, ({ one }) => ({
  user: one(users, {
    fields: [userPrivacySettings.userId],
    references: [users.id]
  })
}));

export const contactPreferencesRelations = relations(contactPreferences, ({ one }) => ({
  user: one(users, {
    fields: [contactPreferences.userId],
    references: [users.id]
  })
}));

// Zod schemas
export const insertUserPrivacySettingSchema = createInsertSchema(userPrivacySettings)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertPrivacyProfileSchema = createInsertSchema(privacyProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertContactPreferenceSchema = createInsertSchema(contactPreferences)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type UserPrivacySetting = typeof userPrivacySettings.$inferSelect;
export type InsertUserPrivacySetting = z.infer<typeof insertUserPrivacySettingSchema>;

export type PrivacyProfile = typeof privacyProfiles.$inferSelect;
export type InsertPrivacyProfile = z.infer<typeof insertPrivacyProfileSchema>;

export type ContactPreference = typeof contactPreferences.$inferSelect;
export type InsertContactPreference = z.infer<typeof insertContactPreferenceSchema>;