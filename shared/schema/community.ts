/**
 * PKL-278651-COMM-0006-HUB
 * Community Hub Schema
 * 
 * This file defines the database schema for community-related tables.
 */
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../schema";

// Communities table
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 100 }),
  skillLevel: varchar("skill_level", { length: 50 }),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  bannerPattern: varchar("banner_pattern", { length: 50 }),
  isPrivate: boolean("is_private").default(false),
  requiresApproval: boolean("requires_approval").default(false),
  tags: varchar("tags", { length: 255 }),
  memberCount: integer("member_count").default(0),
  eventCount: integer("event_count").default(0),
  postCount: integer("post_count").default(0),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  rules: text("rules"),
  guidelines: text("guidelines"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community members table
export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  role: varchar("role", { length: 50 }).notNull().default("member"), // admin, moderator, member
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community posts
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  content: text("content").notNull(),
  mediaUrls: json("media_urls"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  isPinned: boolean("is_pinned").default(false),
  isAnnouncement: boolean("is_announcement").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community events
export const communityEvents = pgTable("community_events", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  isVirtual: boolean("is_virtual").default(false),
  virtualMeetingUrl: text("virtual_meeting_url"),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  isPrivate: boolean("is_private").default(false),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern", { length: 50 }),
  repeatFrequency: varchar("repeat_frequency", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community event attendees
export const communityEventAttendees = pgTable("community_event_attendees", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => communityEvents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("registered"), // registered, attending, cancelled
  registeredAt: timestamp("registered_at").defaultNow(),
  checkedInAt: timestamp("checked_in_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community post comments
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

// Community post likes
export const communityPostLikes = pgTable("community_post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Community comment likes
export const communityCommentLikes = pgTable("community_comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull().references(() => communityPostComments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});

// Community invitations
export const communityInvitations = pgTable("community_invitations", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  invitedByUserId: integer("invited_by_user_id").notNull().references(() => users.id),
  invitedUserEmail: varchar("invited_user_email", { length: 255 }),
  invitedUserId: integer("invited_user_id").references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, accepted, rejected, expired
  token: varchar("token", { length: 100 }).notNull(),
  expiresAt: timestamp("expires_at"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Community join requests
export const communityJoinRequests = pgTable("community_join_requests", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  reviewedByUserId: integer("reviewed_by_user_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const communitiesRelations = relations(communities, ({ many, one }: { many: any, one: any }) => ({
  members: many(communityMembers),
  posts: many(communityPosts),
  events: many(communityEvents),
  joinRequests: many(communityJoinRequests),
  invitations: many(communityInvitations),
  createdByUser: one(users, {
    fields: [communities.createdByUserId],
    references: [users.id]
  })
}));

export const communityMembersRelations = relations(communityMembers, ({ one }: { one: any }) => ({
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

export const communityEventAttendeesRelations = relations(communityEventAttendees, ({ one }) => ({
  event: one(communityEvents, {
    fields: [communityEventAttendees.eventId],
    references: [communityEvents.id]
  }),
  user: one(users, {
    fields: [communityEventAttendees.userId],
    references: [users.id]
  })
}));

export const communityPostCommentsRelations = relations(communityPostComments, ({ one, many }) => ({
  post: one(communityPosts, {
    fields: [communityPostComments.postId],
    references: [communityPosts.id]
  }),
  author: one(users, {
    fields: [communityPostComments.userId],
    references: [users.id]
  }),
  parentComment: one(communityPostComments, {
    fields: [communityPostComments.parentCommentId],
    references: [communityPostComments.id]
  }),
  replies: many(communityPostComments, {
    relationName: "comment_replies"
  }),
  likes: many(communityCommentLikes)
}));

export const communityPostLikesRelations = relations(communityPostLikes, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityPostLikes.postId],
    references: [communityPosts.id]
  }),
  user: one(users, {
    fields: [communityPostLikes.userId],
    references: [users.id]
  })
}));

export const communityCommentLikesRelations = relations(communityCommentLikes, ({ one }) => ({
  comment: one(communityPostComments, {
    fields: [communityCommentLikes.commentId],
    references: [communityPostComments.id]
  }),
  user: one(users, {
    fields: [communityCommentLikes.userId],
    references: [users.id]
  })
}));

export const communityInvitationsRelations = relations(communityInvitations, ({ one }) => ({
  community: one(communities, {
    fields: [communityInvitations.communityId],
    references: [communities.id]
  }),
  invitedBy: one(users, {
    fields: [communityInvitations.invitedByUserId],
    references: [users.id]
  }),
  invitedUser: one(users, {
    fields: [communityInvitations.invitedUserId],
    references: [users.id]
  })
}));

export const communityJoinRequestsRelations = relations(communityJoinRequests, ({ one }) => ({
  community: one(communities, {
    fields: [communityJoinRequests.communityId],
    references: [communities.id]
  }),
  user: one(users, {
    fields: [communityJoinRequests.userId],
    references: [users.id]
  }),
  reviewedBy: one(users, {
    fields: [communityJoinRequests.reviewedByUserId],
    references: [users.id]
  })
}));

// Create Zod schemas
export const insertCommunitySchema = createInsertSchema(communities);
export const insertCommunityMemberSchema = createInsertSchema(communityMembers);
export const insertCommunityPostSchema = createInsertSchema(communityPosts);
export const insertCommunityEventSchema = createInsertSchema(communityEvents);
export const insertCommunityEventAttendeeSchema = createInsertSchema(communityEventAttendees);
export const insertCommunityPostCommentSchema = createInsertSchema(communityPostComments);
export const insertCommunityPostLikeSchema = createInsertSchema(communityPostLikes);
export const insertCommunityCommentLikeSchema = createInsertSchema(communityCommentLikes);
export const insertCommunityInvitationSchema = createInsertSchema(communityInvitations);
export const insertCommunityJoinRequestSchema = createInsertSchema(communityJoinRequests);

// Export Typescript Types
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

export type CommunityPostLike = typeof communityPostLikes.$inferSelect;
export type InsertCommunityPostLike = z.infer<typeof insertCommunityPostLikeSchema>;

export type CommunityCommentLike = typeof communityCommentLikes.$inferSelect;
export type InsertCommunityCommentLike = z.infer<typeof insertCommunityCommentLikeSchema>;

export type CommunityInvitation = typeof communityInvitations.$inferSelect;
export type InsertCommunityInvitation = z.infer<typeof insertCommunityInvitationSchema>;

export type CommunityJoinRequest = typeof communityJoinRequests.$inferSelect;
export type InsertCommunityJoinRequest = z.infer<typeof insertCommunityJoinRequestSchema>;