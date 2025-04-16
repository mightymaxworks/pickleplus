/**
 * PKL-278651-COMM-0006-HUB
 * Community Module Schema
 * 
 * This file defines the database schema for community-related tables.
 */
import { pgTable, serial, integer, varchar, text, boolean, timestamp, date, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../schema";

// Communities table
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  foundedDate: date("founded_date"),
  memberCount: integer("member_count").default(0),
  isPrivate: boolean("is_private").default(false),
  isVerified: boolean("is_verified").default(false),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  bannerPattern: varchar("banner_pattern", { length: 50 }),
  skillLevel: varchar("skill_level", { length: 50 }), // Beginner, Intermediate, Advanced, All Levels
  tags: text("tags"), // Comma-separated tags
  eventCount: integer("event_count").default(0),
  rating: integer("rating").default(0), // 0-100 scale, gets converted to decimal for display
  socialLinks: json("social_links").default({}),
  featuredTag: varchar("featured_tag", { length: 50 }), // Featured, Elite, Popular, etc.
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community members table (many-to-many relationship between users and communities)
export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull().default("member"), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community posts table
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mediaUrls: json("media_urls").default([]),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  isPinned: boolean("is_pinned").default(false),
  isAnnouncement: boolean("is_announcement").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community events table
export const communityEvents = pgTable("community_events", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  location: varchar("location", { length: 255 }),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  eventType: varchar("event_type", { length: 50 }).notNull().default("casual"), // casual, tournament, training, social
  isPublic: boolean("is_public").default(true),
  repeatFrequency: varchar("repeat_frequency", { length: 50 }), // weekly, biweekly, monthly
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community event attendees table
export const communityEventAttendees = pgTable("community_event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => communityEvents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("registered"), // registered, attended, cancelled
  registeredAt: timestamp("registered_at").defaultNow(),
  checkedInAt: timestamp("checked_in_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community post comments table
export const communityPostComments = pgTable("community_post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  parentCommentId: integer("parent_comment_id").references(() => communityPostComments.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community post likes table
export const communityPostLikes = pgTable("community_post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Community comment likes table
export const communityCommentLikes = pgTable("community_comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull().references(() => communityPostComments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Community invitations table
export const communityInvitations = pgTable("community_invitations", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  invitedByUserId: integer("invited_by_user_id").notNull().references(() => users.id),
  invitedUserId: integer("invited_user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, accepted, declined
  invitedAt: timestamp("invited_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community join requests table (for private communities)
export const communityJoinRequests = pgTable("community_join_requests", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, declined
  reviewedByUserId: integer("reviewed_by_user_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Define relationships
export const communitiesRelations = relations(communities, ({ many, one }) => ({
  members: many(communityMembers),
  posts: many(communityPosts),
  events: many(communityEvents),
  invitations: many(communityInvitations),
  joinRequests: many(communityJoinRequests),
  createdBy: one(users, {
    fields: [communities.createdByUserId],
    references: [users.id]
  })
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id]
  }),
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id]
  })
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  community: one(communities, {
    fields: [communityPosts.communityId],
    references: [communities.id]
  }),
  author: one(users, {
    fields: [communityPosts.userId],
    references: [users.id]
  }),
  comments: many(communityPostComments),
  likes: many(communityPostLikes)
}));

export const communityEventsRelations = relations(communityEvents, ({ one, many }) => ({
  community: one(communities, {
    fields: [communityEvents.communityId],
    references: [communities.id]
  }),
  createdBy: one(users, {
    fields: [communityEvents.createdByUserId],
    references: [users.id]
  }),
  attendees: many(communityEventAttendees)
}));

// Create insert schemas
export const insertCommunitySchema = createInsertSchema(communities).omit({ 
  id: true, 
  memberCount: true,
  eventCount: true,
  createdAt: true,
  updatedAt: true
});

export const insertCommunityMemberSchema = createInsertSchema(communityMembers).omit({
  id: true,
  joinedAt: true,
  lastActive: true,
  createdAt: true,
  updatedAt: true
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likes: true,
  comments: true,
  createdAt: true,
  updatedAt: true
});

export const insertCommunityEventSchema = createInsertSchema(communityEvents).omit({
  id: true,
  currentAttendees: true,
  createdAt: true,
  updatedAt: true
});

export const insertCommunityEventAttendeeSchema = createInsertSchema(communityEventAttendees).omit({
  id: true,
  registeredAt: true,
  checkedInAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertCommunityPostCommentSchema = createInsertSchema(communityPostComments).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true
});

// Type definitions
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;

export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = z.infer<typeof insertCommunityMemberSchema>;

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;

export type CommunityEvent = typeof communityEvents.$inferSelect;
export type InsertCommunityEvent = z.infer<typeof insertCommunityEventSchema>;

export type CommunityEventAttendee = typeof communityEventAttendees.$inferSelect;
export type InsertCommunityEventAttendee = z.infer<typeof insertCommunityEventAttendeeSchema>;

export type CommunityPostComment = typeof communityPostComments.$inferSelect;
export type InsertCommunityPostComment = z.infer<typeof insertCommunityPostCommentSchema>;