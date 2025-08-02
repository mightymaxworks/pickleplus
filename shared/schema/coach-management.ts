/**
 * Coach Management Schema
 * PKL-278651-PCP-BASIC-TIER - Comprehensive Basic Tier Implementation
 * 
 * Unified schema for PCP coach profiles, applications, and subscription tiers
 */

import { pgTable, serial, integer, varchar, text, timestamp, boolean, decimal, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// PCP Level Configuration - Sequential Progression Required
export const PCP_LEVEL_CONFIG = {
  1: { name: 'Entry Coach', badge: '🥉', commission: 15, cost: 699, prerequisite: null },
  2: { name: 'Certified Coach', badge: '🥈', commission: 13, cost: 1299, prerequisite: 1 },
  3: { name: 'Advanced Coach', badge: '🥇', commission: 12, cost: 2499, prerequisite: 2 },
  4: { name: 'Master Coach', badge: '💎', commission: 10, cost: 4999, prerequisite: 3 },
  5: { name: 'Grand Master', badge: '👑', commission: 8, cost: 7999, prerequisite: 4 }
} as const;

// PCP Level Validation Helper
export function validatePCPLevelProgression(currentLevel: number, targetLevel: number): {
  isValid: boolean;
  error?: string;
  requiredPath?: number[];
} {
  if (targetLevel < 1 || targetLevel > 5) {
    return { isValid: false, error: 'Invalid PCP level. Must be between 1 and 5.' };
  }
  
  if (currentLevel === 0 && targetLevel !== 1) {
    return { 
      isValid: false, 
      error: 'Must start with Level 1 (Entry Coach) certification.',
      requiredPath: [1]
    };
  }
  
  if (targetLevel !== currentLevel + 1) {
    const requiredPath = [];
    for (let level = currentLevel + 1; level <= targetLevel; level++) {
      requiredPath.push(level);
    }
    
    return { 
      isValid: false, 
      error: `Cannot skip levels. Must complete Level ${currentLevel + 1} first.`,
      requiredPath
    };
  }
  
  return { isValid: true };
}

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  PREMIUM: 'premium'
} as const;

// Coach Profiles Table - Comprehensive Basic Tier Implementation
export const coachProfiles = pgTable('coach_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().unique(),
  
  // Coach Classification
  coachType: varchar('coach_type', { length: 50 }).notNull().default('certified-pcp'), // certified-pcp, community, etc.
  verificationLevel: varchar('verification_level', { length: 20 }).notNull().default('verified'), // verified, pending, unverified
  isActive: boolean('is_active').notNull().default(true),
  
  // PCP Certification Details - Sequential Progression Required
  pcpLevel: integer('pcp_level'), // Current highest completed level (1-5)
  completedLevels: json('completed_levels').notNull().default('[]'), // Array of completed level objects
  pcpCertificationNumber: varchar('pcp_certification_number', { length: 100 }),
  pcpCertifiedAt: timestamp('pcp_certified_at'),
  pcpExpiresAt: timestamp('pcp_expires_at'),
  
  // Profile Information
  bio: text('bio').notNull(),
  profileImageUrl: varchar('profile_image_url', { length: 500 }),
  specializations: json('specializations').notNull().default('[]'), // Array of specialization strings
  teachingStyle: text('teaching_style').notNull(),
  coachingPhilosophy: text('coaching_philosophy').notNull(),
  languagesSpoken: json('languages_spoken').notNull().default('["English"]'), // Array of language strings
  
  // Session Management
  hourlyRate: integer('hourly_rate').notNull(), // In cents
  sessionTypes: json('session_types').notNull().default('[]'), // Array of session type strings
  packageOfferings: json('package_offerings').notNull().default('[]'), // Array of package objects
  availabilitySchedule: json('availability_schedule').notNull().default('{}'), // Schedule object
  
  // Subscription & Tier Management (PKL-278651-PCP-BASIC-TIER)
  subscriptionTier: varchar('subscription_tier', { length: 20 }).notNull().default(SUBSCRIPTION_TIERS.BASIC),
  subscriptionStartedAt: timestamp('subscription_started_at'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  
  // Performance Metrics
  totalSessions: integer('total_sessions').notNull().default(0),
  totalEarnings: integer('total_earnings').notNull().default(0), // In cents
  averageRating: integer('average_rating').notNull().default(0), // 0-100 scale
  totalReviews: integer('total_reviews').notNull().default(0),
  
  // Status & Timestamps
  lastActiveAt: timestamp('last_active_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Coach Applications Table (for new coach applications)
export const coachApplications = pgTable('coach_applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  
  // Application Details
  applicationType: varchar('application_type', { length: 50 }).notNull().default('pcp-coach'),
  applicationStatus: varchar('application_status', { length: 20 }).notNull().default('pending'),
  
  // Application Content
  motivation: text('motivation').notNull(),
  experience: text('experience').notNull(),
  certifications: json('certifications').notNull().default('[]'),
  availability: json('availability').notNull().default('{}'),
  
  // Review Process
  reviewedBy: integer('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  rejectionReason: text('rejection_reason'),
  
  // Timestamps
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Coach Certifications Table (for tracking certifications)
export const coachCertifications = pgTable('coach_certifications', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').notNull(),
  
  // Certification Details
  certificationType: varchar('certification_type', { length: 100 }).notNull(),
  certificationLevel: varchar('certification_level', { length: 50 }),
  issuingOrganization: varchar('issuing_organization', { length: 200 }).notNull(),
  certificationNumber: varchar('certification_number', { length: 100 }),
  
  // Verification
  verificationStatus: varchar('verification_status', { length: 20 }).notNull().default('pending'),
  verificationDocumentUrl: varchar('verification_document_url', { length: 500 }),
  verifiedBy: integer('verified_by'),
  verifiedAt: timestamp('verified_at'),
  
  // Validity
  issuedAt: timestamp('issued_at').notNull(),
  expiresAt: timestamp('expires_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Coach Reviews Table (for student feedback)
export const coachReviews = pgTable('coach_reviews', {
  id: serial('id').primaryKey(),
  coachId: integer('coach_id').notNull(),
  studentId: integer('student_id').notNull(),
  sessionId: integer('session_id'),
  
  // Review Content
  rating: integer('rating').notNull(), // 1-5 stars (stored as 20-100 for compatibility)
  reviewText: text('review_text'),
  wouldRecommend: boolean('would_recommend').notNull().default(true),
  
  // Review Metadata
  isVerified: boolean('is_verified').notNull().default(false),
  isPublic: boolean('is_public').notNull().default(true),
  helpfulVotes: integer('helpful_votes').notNull().default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod Schemas for Validation
export const insertCoachProfileSchema = createInsertSchema(coachProfiles, {
  hourlyRate: z.number().min(5000).max(30000), // $50-$300 in cents
  bio: z.string().min(50).max(1000),
  coachingPhilosophy: z.string().min(30).max(500),
  teachingStyle: z.string().min(20).max(300)
});

export const selectCoachProfileSchema = createSelectSchema(coachProfiles);

export const insertCoachApplicationSchema = createInsertSchema(coachApplications, {
  motivation: z.string().min(100).max(2000),
  experience: z.string().min(50).max(2000)
});

export const selectCoachApplicationSchema = createSelectSchema(coachApplications);

export const insertCoachCertificationSchema = createInsertSchema(coachCertifications);
export const selectCoachCertificationSchema = createSelectSchema(coachCertifications);

export const insertCoachReviewSchema = createInsertSchema(coachReviews, {
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(10).max(1000).optional()
});

export const selectCoachReviewSchema = createSelectSchema(coachReviews);

// TypeScript Types
export type CoachProfile = typeof coachProfiles.$inferSelect;
export type InsertCoachProfile = typeof coachProfiles.$inferInsert;

export type CoachApplication = typeof coachApplications.$inferSelect;
export type InsertCoachApplication = typeof coachApplications.$inferInsert;

export type CoachCertification = typeof coachCertifications.$inferSelect;
export type InsertCoachCertification = typeof coachCertifications.$inferInsert;

export type CoachReview = typeof coachReviews.$inferSelect;
export type InsertCoachReview = typeof coachReviews.$inferInsert;

// Helper Types for Frontend
export type PCPLevel = 1 | 2 | 3 | 4 | 5;
export type SubscriptionTier = 'basic' | 'premium';

export interface PCPLevelConfig {
  name: string;
  badge: string;
  commission: number;
  cost: number;
  prerequisite: number | null;
}

export interface CompletedPCPLevel {
  level: number;
  certificationNumber: string;
  completedAt: Date;
  expiresAt?: Date;
}

// Comprehensive Basic Tier Features
export const BASIC_TIER_FEATURES = {
  unlimited_sessions: true,
  full_profile: true,
  basic_analytics: true,
  student_messaging: true,
  standard_payments: true,
  mobile_app_access: true,
  community_access: true,
  scheduling_tools: true
} as const;

export const PREMIUM_TIER_FEATURES = {
  ...BASIC_TIER_FEATURES,
  automated_payouts: true,
  advanced_analytics: true,
  marketing_tools: true,
  video_sessions: true,
  custom_packages: true,
  priority_support: true,
  business_reporting: true
} as const;