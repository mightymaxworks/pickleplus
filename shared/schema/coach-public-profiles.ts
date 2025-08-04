// Coach Public Profile Schema - Enhanced public-facing coach profiles
import { pgTable, serial, integer, varchar, text, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Public profile customization settings
export const coachPublicProfiles = pgTable('coach_public_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(), // Unique URL slug like /coach/john-smith
  displayName: varchar('display_name', { length: 100 }).notNull(),
  tagline: varchar('tagline', { length: 200 }),
  bio: text('bio'),
  profileImageUrl: varchar('profile_image_url', { length: 500 }),
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  location: varchar('location', { length: 100 }),
  timezone: varchar('timezone', { length: 50 }),
  languages: json('languages').$type<string[]>().default([]),
  
  // Professional info
  yearsExperience: integer('years_experience'),
  specializations: json('specializations').$type<string[]>().default([]),
  certifications: json('certifications').$type<string[]>().default([]),
  playingLevel: varchar('playing_level', { length: 50 }),
  coachingPhilosophy: text('coaching_philosophy'),
  
  // Availability & Pricing
  hourlyRate: integer('hourly_rate'), // in cents
  sessionTypes: json('session_types').$type<string[]>().default([]), // ['individual', 'group', 'clinic']
  availabilitySchedule: jsonb('availability_schedule'),
  
  // Contact preferences
  contactEmail: varchar('contact_email', { length: 255 }),
  phoneNumber: varchar('phone_number', { length: 20 }),
  website: varchar('website', { length: 255 }),
  socialLinks: jsonb('social_links'), // { instagram: '', youtube: '', etc }
  
  // Profile settings
  isPublic: boolean('is_public').default(true),
  acceptingNewClients: boolean('accepting_new_clients').default(true),
  showContactInfo: boolean('show_contact_info').default(true),
  showPricing: boolean('show_pricing').default(true),
  showReviews: boolean('show_reviews').default(true),
  
  // SEO and discovery
  metaTitle: varchar('meta_title', { length: 200 }),
  metaDescription: text('meta_description'),
  keywords: json('keywords').$type<string[]>().default([]),
  
  // Analytics
  viewCount: integer('view_count').default(0),
  lastActive: timestamp('last_active').defaultNow(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Profile sections (customizable content blocks)
export const profileSections = pgTable('profile_sections', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').notNull(),
  sectionType: varchar('section_type', { length: 50 }).notNull(), // 'about', 'services', 'testimonials', 'gallery', etc
  title: varchar('title', { length: 100 }),
  content: text('content'),
  mediaUrls: json('media_urls').$type<string[]>().default([]),
  orderIndex: integer('order_index').default(0),
  isVisible: boolean('is_visible').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Coach services/packages
export const coachServices = pgTable('coach_services', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  duration: integer('duration'), // in minutes
  price: integer('price'), // in cents
  sessionType: varchar('session_type', { length: 50 }), // 'individual', 'group', 'clinic'
  maxParticipants: integer('max_participants').default(1),
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Public testimonials/reviews for profiles
export const profileTestimonials = pgTable('profile_testimonials', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').notNull(),
  clientName: varchar('client_name', { length: 100 }),
  clientTitle: varchar('client_title', { length: 100 }),
  content: text('content').notNull(),
  rating: integer('rating'), // 1-5 stars
  sessionType: varchar('session_type', { length: 50 }),
  isVerified: boolean('is_verified').default(false),
  isFeatured: boolean('is_featured').default(false),
  displayOrder: integer('display_order').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  approvedAt: timestamp('approved_at')
});

// Profile analytics tracking
export const profileAnalytics = pgTable('profile_analytics', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'view', 'contact_click', 'booking_start'
  visitorId: varchar('visitor_id', { length: 100 }),
  referrerUrl: varchar('referrer_url', { length: 500 }),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  
  createdAt: timestamp('created_at').defaultNow()
});

// Relations
export const coachPublicProfilesRelations = relations(coachPublicProfiles, ({ many }) => ({
  sections: many(profileSections),
  services: many(coachServices),
  testimonials: many(profileTestimonials),
  analytics: many(profileAnalytics)
}));

export const profileSectionsRelations = relations(profileSections, ({ one }) => ({
  profile: one(coachPublicProfiles, {
    fields: [profileSections.profileId],
    references: [coachPublicProfiles.id]
  })
}));

export const coachServicesRelations = relations(coachServices, ({ one }) => ({
  profile: one(coachPublicProfiles, {
    fields: [coachServices.profileId],
    references: [coachPublicProfiles.id]
  })
}));

export const profileTestimonialsRelations = relations(profileTestimonials, ({ one }) => ({
  profile: one(coachPublicProfiles, {
    fields: [profileTestimonials.profileId],
    references: [coachPublicProfiles.id]
  })
}));

export const profileAnalyticsRelations = relations(profileAnalytics, ({ one }) => ({
  profile: one(coachPublicProfiles, {
    fields: [profileAnalytics.profileId],
    references: [coachPublicProfiles.id]
  })
}));

// Zod schemas for validation
export const insertCoachPublicProfileSchema = createInsertSchema(coachPublicProfiles);
export const insertProfileSectionSchema = createInsertSchema(profileSections);
export const insertCoachServiceSchema = createInsertSchema(coachServices);
export const insertProfileTestimonialSchema = createInsertSchema(profileTestimonials);
export const insertProfileAnalyticsSchema = createInsertSchema(profileAnalytics);

// TypeScript types
export type CoachPublicProfile = typeof coachPublicProfiles.$inferSelect;
export type InsertCoachPublicProfile = typeof coachPublicProfiles.$inferInsert;
export type ProfileSection = typeof profileSections.$inferSelect;
export type InsertProfileSection = typeof profileSections.$inferInsert;
export type CoachService = typeof coachServices.$inferSelect;
export type InsertCoachService = typeof coachServices.$inferInsert;
export type ProfileTestimonial = typeof profileTestimonials.$inferSelect;
export type InsertProfileTestimonial = typeof profileTestimonials.$inferInsert;
export type ProfileAnalytics = typeof profileAnalytics.$inferSelect;
export type InsertProfileAnalytics = typeof profileAnalytics.$inferInsert;

// Extended types with relations
export type CoachPublicProfileWithRelations = CoachPublicProfile & {
  sections: ProfileSection[];
  services: CoachService[];
  testimonials: ProfileTestimonial[];
  analytics?: ProfileAnalytics[];
};

// Profile customization options
export const ProfileSectionTypes = {
  ABOUT: 'about',
  SERVICES: 'services',
  TESTIMONIALS: 'testimonials',
  GALLERY: 'gallery',
  CREDENTIALS: 'credentials',
  PHILOSOPHY: 'philosophy',
  ACHIEVEMENTS: 'achievements',
  CONTACT: 'contact'
} as const;

export const SessionTypes = {
  INDIVIDUAL: 'individual',
  GROUP: 'group', 
  CLINIC: 'clinic',
  ONLINE: 'online',
  ASSESSMENT: 'assessment'
} as const;