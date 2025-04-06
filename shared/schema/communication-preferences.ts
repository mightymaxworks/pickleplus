import { pgTable, serial, integer, text, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Notification Preferences table
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  enabled: boolean("enabled").notNull().default(true),
  channelPreferences: json("channel_preferences").$type<{
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  }>().notNull().default({
    email: true,
    sms: false,
    push: true,
    inApp: true
  }),
  frequency: text("frequency").notNull().default("immediate"),
  quietHoursStart: integer("quiet_hours_start"),
  quietHoursEnd: integer("quiet_hours_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Communication Channels table
export const communicationChannels = pgTable("communication_channels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  channelType: text("channel_type").notNull(),
  identifier: text("identifier").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  isPrimary: boolean("is_primary").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
  verificationSentAt: timestamp("verification_sent_at"),
  verificationCode: text("verification_code")
});

// Define the Zod schema for inserting
export const insertUserNotificationPreferenceSchema = createInsertSchema(userNotificationPreferences)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertCommunicationChannelSchema = createInsertSchema(communicationChannels)
  .omit({ id: true, isVerified: true, isActive: true, createdAt: true, updatedAt: true, lastUsedAt: true, verificationSentAt: true, verificationCode: true });

// Define types
export type UserNotificationPreference = typeof userNotificationPreferences.$inferSelect;
export type InsertUserNotificationPreference = z.infer<typeof insertUserNotificationPreferenceSchema>;

export type CommunicationChannel = typeof communicationChannels.$inferSelect;
export type InsertCommunicationChannel = z.infer<typeof insertCommunicationChannelSchema>;