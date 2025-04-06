import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

// Communication Channel table schema
export const communicationChannels = pgTable("communication_channels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  channelType: text("channel_type").notNull(), // email, sms, push, in-app
  identifier: text("identifier").notNull(), // email address, phone number, device token
  isVerified: boolean("is_verified").default(false),
  isPrimary: boolean("is_primary").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastUsedAt: timestamp("last_used_at"),
  verificationSentAt: timestamp("verification_sent_at"),
  verificationCode: text("verification_code"), // Stored temporarily for verification purposes
});

// Notification Templates table schema
export const notificationTemplates = pgTable("notification_templates", {
  id: serial("id").primaryKey(),
  templateKey: text("template_key").notNull().unique(), // Unique identifier for the template
  title: text("title").notNull(),
  body: text("body").notNull(),
  channelType: text("channel_type").notNull(), // email, sms, push, in-app
  category: text("category").notNull(), // match, tournament, achievement, social, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: json("metadata"), // Additional parameters for template
  htmlVersion: text("html_version"), // HTML version for email templates
});

// User Notification Preferences table schema
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  category: text("category").notNull(), // match, tournament, achievement, social, etc.
  subcategory: text("subcategory"), // More specific category (e.g., match_invitation, tournament_reminder)
  enabled: boolean("enabled").default(true),
  channelPreferences: json("channel_preferences").default({
    email: true,
    sms: false,
    push: true,
    inApp: true
  }),
  frequency: text("frequency").default("immediate"), // immediate, daily_digest, weekly_digest
  quietHoursStart: integer("quiet_hours_start"), // Hour of day (0-23) to start quiet hours
  quietHoursEnd: integer("quiet_hours_end"), // Hour of day (0-23) to end quiet hours
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Communication Logs table schema
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  templateId: integer("template_id").references(() => notificationTemplates.id),
  channelType: text("channel_type").notNull(),
  channelId: integer("channel_id").references(() => communicationChannels.id),
  sentAt: timestamp("sent_at").defaultNow(),
  status: text("status").default("pending"), // pending, sent, delivered, failed, opened
  failureReason: text("failure_reason"),
  messageData: json("message_data"), // The actual content and parameters sent
  externalId: text("external_id"), // ID from external service (e.g., email provider)
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
});

// Define relations
export const communicationChannelsRelations = relations(communicationChannels, ({ one }) => ({
  user: one(users, {
    fields: [communicationChannels.userId],
    references: [users.id],
  }),
}));

export const userNotificationPreferencesRelations = relations(userNotificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userNotificationPreferences.userId],
    references: [users.id],
  }),
}));

export const communicationLogsRelations = relations(communicationLogs, ({ one }) => ({
  user: one(users, {
    fields: [communicationLogs.userId],
    references: [users.id],
  }),
  template: one(notificationTemplates, {
    fields: [communicationLogs.templateId],
    references: [notificationTemplates.id],
  }),
  channel: one(communicationChannels, {
    fields: [communicationLogs.channelId],
    references: [communicationChannels.id],
  }),
}));

// Zod schemas for validation and type inference
export const insertCommunicationChannelSchema = createInsertSchema(communicationChannels);
export const insertNotificationTemplateSchema = createInsertSchema(notificationTemplates);
export const insertUserNotificationPreferenceSchema = createInsertSchema(userNotificationPreferences);
export const insertCommunicationLogSchema = createInsertSchema(communicationLogs);

// Types
export type CommunicationChannel = typeof communicationChannels.$inferSelect;
export type InsertCommunicationChannel = z.infer<typeof insertCommunicationChannelSchema>;

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = z.infer<typeof insertNotificationTemplateSchema>;

export type UserNotificationPreference = typeof userNotificationPreferences.$inferSelect;
export type InsertUserNotificationPreference = z.infer<typeof insertUserNotificationPreferenceSchema>;

export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;