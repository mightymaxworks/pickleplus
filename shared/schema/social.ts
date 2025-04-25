/**
 * PKL-278651-SAGE-0011-SOCIAL - Social Sharing Schema
 * 
 * This schema defines the database structure for social sharing features
 * that enable community learning and user collaboration in SAGE.
 * 
 * Part of Sprint 5: Social Features & UI Polish
 */

import { pgTable, serial, text, integer, timestamp, boolean, primaryKey, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Content type enum for shared items
 */
export const ContentTypeEnum = z.enum([
  'journal_entry', 
  'feedback', 
  'drill', 
  'training_plan', 
  'match_result',
  'achievement',
  'sage_insight',
  'user_connection' // Added for connection-related feed items
]);
export type ContentType = z.infer<typeof ContentTypeEnum>;

/**
 * Visibility level enum
 */
export const VisibilityEnum = z.enum(['public', 'friends', 'private', 'coaches']);
export type Visibility = z.infer<typeof VisibilityEnum>;

/**
 * Shared content table - tracks content shared with the community
 */
export const sharedContent = pgTable("shared_content", {
  id: serial("id").primaryKey(),
  
  // Content reference
  contentType: text("content_type").$type<ContentType>().notNull(),
  contentId: integer("content_id").notNull(),
  userId: integer("user_id").notNull(),
  
  // Sharing metadata
  title: text("title").notNull(),
  description: text("description"),
  visibility: text("visibility").$type<Visibility>().default('public').notNull(),
  
  // Customization
  customTags: text("custom_tags").array(),
  highlightedText: text("highlighted_text"),
  customImage: text("custom_image"),
  
  // Analytics
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  shareCount: integer("share_count").default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  
  // Flags
  isFeatured: boolean("is_featured").default(false),
  isModerationFlagged: boolean("is_moderation_flagged").default(false),
  isRemoved: boolean("is_removed").default(false),
});

/**
 * Content reactions - likes, bookmarks, and other reactions
 */
export const contentReactions = pgTable("content_reactions", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull(),
  userId: integer("user_id").notNull(),
  reactionType: text("reaction_type").notNull(), // like, bookmark, celebrate, insightful, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => {
  return {
    // Create a unique constraint to prevent duplicate reactions
    uniqueReaction: unique().on(table.contentId, table.userId, table.reactionType),
  };
});

/**
 * Content comments - discussion on shared content
 */
export const contentComments = pgTable("content_comments", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull(),
  userId: integer("user_id").notNull(),
  
  text: text("text").notNull(),
  parentCommentId: integer("parent_comment_id"), // For threaded replies
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  
  likeCount: integer("like_count").default(0).notNull(),
  isEdited: boolean("is_edited").default(false),
  isRemoved: boolean("is_removed").default(false),
});

/**
 * Coaching recommendations - user-to-user recommendations
 */
export const coachingRecommendations = pgTable("coaching_recommendations", {
  id: serial("id").primaryKey(),
  
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  
  // What's being recommended
  contentType: text("content_type").$type<ContentType>().notNull(),
  contentId: integer("content_id").notNull(),
  
  // Recommendation details
  message: text("message"),
  relevanceReason: text("relevance_reason"),
  skillsTargeted: text("skills_targeted").array(),
  
  // Status
  status: text("status").default('pending').notNull(), // pending, accepted, declined, completed
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
  completedAt: timestamp("completed_at"),
  
  // Feedback
  feedbackRating: integer("feedback_rating"), // 1-5 rating after completion
  feedbackComment: text("feedback_comment"),
});

/**
 * Social feed items - unified feed entries
 */
export const socialFeedItems = pgTable("social_feed_items", {
  id: serial("id").primaryKey(),
  
  // Content reference
  contentType: text("content_type").$type<ContentType>().notNull(),
  contentId: integer("content_id").notNull(),
  
  // Activity metadata
  activityType: text("activity_type").notNull(), // shared, commented, achieved, recommended
  userId: integer("user_id").notNull(),
  targetUserId: integer("target_user_id"), // For user-to-user activities
  
  // Display data
  title: text("title").notNull(),
  summary: text("summary"),
  imageUrl: text("image_url"),
  
  // Rich content
  enrichmentData: jsonb("enrichment_data"), // Additional context data
  
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  
  // Visibility/status
  visibility: text("visibility").$type<Visibility>().default('public').notNull(),
  isPinned: boolean("is_pinned").default(false),
  isHighlighted: boolean("is_highlighted").default(false),
});

/**
 * User connection requests - for coach/player relationships
 */
export const userConnectionRequests = pgTable("user_connection_requests", {
  id: serial("id").primaryKey(),
  
  fromUserId: integer("from_user_id").notNull(),
  toUserId: integer("to_user_id").notNull(),
  
  connectionType: text("connection_type").notNull(), // coach, friend, mentor
  message: text("message"),
  
  status: text("status").default('pending').notNull(), // pending, accepted, declined
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

/**
 * User connections - established relationships
 */
export const userConnections = pgTable("user_connections", {
  id: serial("id").primaryKey(),
  
  userId: integer("user_id").notNull(),
  connectedUserId: integer("connected_user_id").notNull(),
  
  connectionType: text("connection_type").notNull(), // coach, friend, mentor
  status: text("status").default('active').notNull(), // active, inactive, blocked
  
  sharingPermissions: jsonb("sharing_permissions"), // What the connected user can see
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastInteractionAt: timestamp("last_interaction_at"),
});

// Define types from the schema
export type SharedContent = typeof sharedContent.$inferSelect;
export type InsertSharedContent = typeof sharedContent.$inferInsert;

export type ContentReaction = typeof contentReactions.$inferSelect;
export type InsertContentReaction = typeof contentReactions.$inferInsert;

export type ContentComment = typeof contentComments.$inferSelect;
export type InsertContentComment = typeof contentComments.$inferInsert;

export type CoachingRecommendation = typeof coachingRecommendations.$inferSelect;
export type InsertCoachingRecommendation = typeof coachingRecommendations.$inferInsert;

export type SocialFeedItem = typeof socialFeedItems.$inferSelect;
export type InsertSocialFeedItem = typeof socialFeedItems.$inferInsert;

export type UserConnectionRequest = typeof userConnectionRequests.$inferSelect;
export type InsertUserConnectionRequest = typeof userConnectionRequests.$inferInsert;

export type UserConnection = typeof userConnections.$inferSelect;
export type InsertUserConnection = typeof userConnections.$inferInsert;

// Create zod schemas for validation
export const insertSharedContentSchema = createInsertSchema(sharedContent);
export const insertContentReactionSchema = createInsertSchema(contentReactions);
export const insertContentCommentSchema = createInsertSchema(contentComments);
export const insertCoachingRecommendationSchema = createInsertSchema(coachingRecommendations);
export const insertSocialFeedItemSchema = createInsertSchema(socialFeedItems);
export const insertUserConnectionRequestSchema = createInsertSchema(userConnectionRequests);
export const insertUserConnectionSchema = createInsertSchema(userConnections);

// Extended validation schemas
export const sharedContentValidationSchema = insertSharedContentSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  customTags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
});

export const contentCommentValidationSchema = insertContentCommentSchema.extend({
  text: z.string().min(1, "Comment cannot be empty").max(1000, "Comment must be less than 1000 characters"),
});

export const coachingRecommendationValidationSchema = insertCoachingRecommendationSchema.extend({
  message: z.string().max(500, "Message must be less than 500 characters").optional(),
});