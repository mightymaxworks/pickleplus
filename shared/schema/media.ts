/**
 * PKL-278651-COMM-0036-MEDIA
 * Community Media Management Schema
 * 
 * Defines the schema for community media management:
 * - Media: Individual media files (images, videos, etc.)
 * - Galleries: Collections of media
 * - GalleryItems: Maps media to galleries with ordering
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-20
 */

import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, boolean, uniqueIndex, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { communities, communityEvents } from "./community";
import { users } from "../schema";

/**
 * Media types supported by the platform
 */
export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  OTHER = "other"
}

/**
 * Privacy levels for galleries
 */
export enum GalleryPrivacyLevel {
  PUBLIC = "public",
  MEMBERS = "members", 
  PRIVATE = "private"
}

/**
 * Community Media table
 * Stores individual media items uploaded to communities
 */
export const communityMedia = pgTable("community_media", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  mediaType: varchar("media_type", { length: 50 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  thumbnailPath: varchar("thumbnail_path", { length: 500 }),
  createdByUserId: integer("created_by_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  fileSizeBytes: integer("file_size_bytes"),
  width: integer("width"),
  height: integer("height"),
  isFeatured: boolean("is_featured").default(false),
  tags: text("tags").array(),
  metadata: jsonb("metadata")
});

/**
 * Community Galleries table
 * Manages collections of media
 */
export const communityGalleries = pgTable("community_galleries", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdByUserId: integer("created_by_user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  eventId: integer("event_id").references(() => communityEvents.id, { onDelete: "set null" }),
  coverImageId: integer("cover_image_id"),
  isFeatured: boolean("is_featured").default(false),
  privacyLevel: varchar("privacy_level", { length: 50 }).default(GalleryPrivacyLevel.PUBLIC),
  sortOrder: integer("sort_order").default(0)
});

/**
 * Gallery Items table
 * Maps media items to galleries with ordering
 */
export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  galleryId: integer("gallery_id").notNull().references(() => communityGalleries.id, { onDelete: "cascade" }),
  mediaId: integer("media_id").notNull().references(() => communityMedia.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  caption: text("caption")
}, (table) => {
  return {
    // Ensure each media item appears only once in a gallery
    uniqGalleryMedia: uniqueIndex("uniq_gallery_media").on(table.galleryId, table.mediaId),
  };
});

/**
 * Relations for Community Media
 */
export const communityMediaRelations = relations(communityMedia, ({ one, many }) => ({
  community: one(communities, {
    fields: [communityMedia.communityId],
    references: [communities.id]
  }),
  createdBy: one(users, {
    fields: [communityMedia.createdByUserId],
    references: [users.id]
  }),
  galleryItems: many(galleryItems)
}));

/**
 * Relations for Community Galleries
 */
export const communityGalleriesRelations = relations(communityGalleries, ({ one, many }) => ({
  community: one(communities, {
    fields: [communityGalleries.communityId],
    references: [communities.id]
  }),
  createdBy: one(users, {
    fields: [communityGalleries.createdByUserId],
    references: [users.id]
  }),
  event: one(communityEvents, {
    fields: [communityGalleries.eventId],
    references: [communityEvents.id]
  }),
  coverImage: one(communityMedia, {
    fields: [communityGalleries.coverImageId],
    references: [communityMedia.id]
  }),
  galleryItems: many(galleryItems)
}));

/**
 * Relations for Gallery Items
 */
export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  gallery: one(communityGalleries, {
    fields: [galleryItems.galleryId],
    references: [communityGalleries.id]
  }),
  media: one(communityMedia, {
    fields: [galleryItems.mediaId],
    references: [communityMedia.id]
  })
}));

/**
 * Schemas for validation
 */

// Media
export const insertMediaSchema = createInsertSchema(communityMedia, {
  mediaType: z.nativeEnum(MediaType),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
}).omit({ id: true });

export const selectMediaSchema = createSelectSchema(communityMedia, {
  mediaType: z.nativeEnum(MediaType),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

// Galleries
export const insertGallerySchema = createInsertSchema(communityGalleries, {
  privacyLevel: z.nativeEnum(GalleryPrivacyLevel)
}).omit({ id: true });

export const selectGallerySchema = createSelectSchema(communityGalleries, {
  privacyLevel: z.nativeEnum(GalleryPrivacyLevel)
});

// Gallery Items
export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({ id: true });
export const selectGalleryItemSchema = createSelectSchema(galleryItems);

// Type definitions
export type Media = z.infer<typeof selectMediaSchema>;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type Gallery = z.infer<typeof selectGallerySchema>;
export type InsertGallery = z.infer<typeof insertGallerySchema>;

export type GalleryItem = z.infer<typeof selectGalleryItemSchema>;
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;

// Extended types with relations
export type MediaWithRelations = Media & {
  community?: typeof communities.$inferSelect;
  createdBy?: typeof users.$inferSelect;
};

export type GalleryWithRelations = Gallery & {
  community?: typeof communities.$inferSelect;
  createdBy?: typeof users.$inferSelect;
  event?: typeof communityEvents.$inferSelect;
  coverImage?: Media;
  items?: (GalleryItem & { media: Media })[];
};