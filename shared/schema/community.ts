/**
 * PKL-278651-COMM-0006-HUB
 * Community Hub Schema
 * 
 * This file defines the database schema for community-related tables.
 */
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, varchar, timestamp, integer, boolean, json, numeric } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "../schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Function to push schema changes to the database
 */
export async function pushSchema() {
  console.log('Using drizzle-orm to push community schema to database...');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  
  // Direct SQL client for raw queries
  const pgConnection = postgres(dbUrl);
  const db = drizzle(pgConnection);
  
  try {
    console.log('Creating community tables...');
    
    // Create tables in order of dependencies
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS communities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(100),
        skill_level VARCHAR(50),
        avatar_url TEXT,
        banner_url TEXT,
        banner_pattern VARCHAR(50),
        is_private BOOLEAN DEFAULT FALSE,
        requires_approval BOOLEAN DEFAULT FALSE,
        tags VARCHAR(255),
        member_count INTEGER DEFAULT 0,
        event_count INTEGER DEFAULT 0,
        post_count INTEGER DEFAULT 0,
        created_by_user_id INTEGER NOT NULL REFERENCES users(id),
        rules TEXT,
        guidelines TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER NOT NULL REFERENCES communities(id),
        role VARCHAR(50) NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE,
        last_active TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        community_id INTEGER NOT NULL REFERENCES communities(id),
        content TEXT NOT NULL,
        media_urls JSONB,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_announcement BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_events (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        created_by_user_id INTEGER NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_type VARCHAR(50) NOT NULL DEFAULT 'match_play',
        event_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        location TEXT,
        is_virtual BOOLEAN DEFAULT FALSE,
        virtual_meeting_url TEXT,
        max_attendees INTEGER,
        current_attendees INTEGER DEFAULT 0,
        is_private BOOLEAN DEFAULT FALSE,
        is_recurring BOOLEAN DEFAULT FALSE,
        recurring_pattern VARCHAR(50),
        repeat_frequency VARCHAR(50),
        min_skill_level VARCHAR(10),
        max_skill_level VARCHAR(10),
        image_url TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_event_attendees (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES community_events(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'registered',
        registered_at TIMESTAMP DEFAULT NOW(),
        checked_in_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_post_comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES community_posts(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        parent_comment_id INTEGER REFERENCES community_post_comments(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES community_posts(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES community_post_comments(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_invitations (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        invited_by_user_id INTEGER NOT NULL REFERENCES users(id),
        invited_user_email VARCHAR(255),
        invited_user_id INTEGER REFERENCES users(id),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        token VARCHAR(100) NOT NULL,
        expires_at TIMESTAMP,
        message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS community_join_requests (
        id SERIAL PRIMARY KEY,
        community_id INTEGER NOT NULL REFERENCES communities(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        message TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        reviewed_by_user_id INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Creating indexes for better performance
    console.log('Creating indexes...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_comm_members_user_id ON community_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_comm_members_community_id ON community_members(community_id);
      CREATE INDEX IF NOT EXISTS idx_comm_posts_user_id ON community_posts(user_id);
      CREATE INDEX IF NOT EXISTS idx_comm_posts_community_id ON community_posts(community_id);
      CREATE INDEX IF NOT EXISTS idx_comm_events_community_id ON community_events(community_id);
      CREATE INDEX IF NOT EXISTS idx_comm_events_created_by ON community_events(created_by_user_id);
      CREATE INDEX IF NOT EXISTS idx_comm_events_date ON community_events(event_date);
      CREATE INDEX IF NOT EXISTS idx_comm_attendees_event_id ON community_event_attendees(event_id);
      CREATE INDEX IF NOT EXISTS idx_comm_attendees_user_id ON community_event_attendees(user_id);
      CREATE INDEX IF NOT EXISTS idx_comm_comments_post_id ON community_post_comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_comm_comments_user_id ON community_post_comments(user_id);
      CREATE INDEX IF NOT EXISTS idx_comm_post_likes_post_id ON community_post_likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_comm_post_likes_user_id ON community_post_likes(user_id);
      CREATE INDEX IF NOT EXISTS idx_comm_comment_likes_comment_id ON community_comment_likes(comment_id);
      CREATE INDEX IF NOT EXISTS idx_comm_comment_likes_user_id ON community_comment_likes(user_id);
      CREATE INDEX IF NOT EXISTS idx_comm_invitations_community_id ON community_invitations(community_id);
      CREATE INDEX IF NOT EXISTS idx_comm_join_requests_community_id ON community_join_requests(community_id);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_community_membership_unique ON community_members(community_id, user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_community_post_like_unique ON community_post_likes(post_id, user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_community_comment_like_unique ON community_comment_likes(comment_id, user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_community_event_attendance_unique ON community_event_attendees(event_id, user_id);
    `);

    console.log('Community schema pushed successfully');
    
  } catch (error) {
    console.error('Error pushing schema:', error);
    throw error;
  } finally {
    await pgConnection.end();
  }
}

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
  themeColor: varchar("theme_color", { length: 50 }),
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

/**
 * PKL-278651-COMM-0007-DB-EVT
 * Enhanced Community Events Table
 * 
 * This schema extends the community events table with additional fields for
 * event types, skill level requirements, and event status.
 * 
 * @version 2.0.0
 * @lastModified 2025-04-17
 */
export const communityEvents = pgTable("community_events", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  createdByUserId: integer("created_by_user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).notNull().default("match_play"), // match_play, league, training, tournament, social, other
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
  minSkillLevel: varchar("min_skill_level", { length: 10 }), // Minimum skill level required for this event (optional)
  maxSkillLevel: varchar("max_skill_level", { length: 10 }), // Maximum skill level for this event (optional)
  imageUrl: text("image_url"), // Optional image for the event
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, cancelled, completed
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