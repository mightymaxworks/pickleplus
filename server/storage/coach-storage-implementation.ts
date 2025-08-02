/**
 * Coach Storage Implementation
 * PKL-278651-PCP-BASIC-TIER - Comprehensive Basic Tier Implementation
 * 
 * Database operations for coach profiles, applications, and comprehensive basic tier management
 */

import { eq, and, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { 
  coachProfiles, 
  coachApplications, 
  coachCertifications, 
  coachReviews,
  type CoachProfile,
  type InsertCoachProfile,
  type CoachApplication,
  type InsertCoachApplication,
  type CoachCertification,
  type InsertCoachCertification,
  type CoachReview,
  type InsertCoachReview
} from '../../shared/schema/coach-management';

export interface CoachStorageContext {
  getDb(): NodePgDatabase<any>;
}

// Coach Profile Operations (PKL-278651-PCP-BASIC-TIER)
export async function createCoachProfile(this: CoachStorageContext, profileData: InsertCoachProfile): Promise<CoachProfile> {
  const db = this.getDb();
  
  const [profile] = await db
    .insert(coachProfiles)
    .values({
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
    
  if (!profile) {
    throw new Error('Failed to create coach profile');
  }
  
  return profile;
}

export async function getCoachProfile(this: CoachStorageContext, userId: number): Promise<CoachProfile | undefined> {
  const db = this.getDb();
  
  const [profile] = await db
    .select()
    .from(coachProfiles)
    .where(eq(coachProfiles.userId, userId))
    .limit(1);
    
  return profile;
}

export async function updateCoachProfile(this: CoachStorageContext, userId: number, updates: Partial<CoachProfile>): Promise<CoachProfile | undefined> {
  const db = this.getDb();
  
  const [profile] = await db
    .update(coachProfiles)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(coachProfiles.userId, userId))
    .returning();
    
  return profile;
}

export async function deleteCoachProfile(this: CoachStorageContext, userId: number): Promise<boolean> {
  const db = this.getDb();
  
  const result = await db
    .delete(coachProfiles)
    .where(eq(coachProfiles.userId, userId));
    
  return result.rowCount > 0;
}

export async function getAllCoachProfiles(this: CoachStorageContext): Promise<CoachProfile[]> {
  const db = this.getDb();
  
  return await db
    .select()
    .from(coachProfiles)
    .where(eq(coachProfiles.isActive, true))
    .orderBy(desc(coachProfiles.createdAt));
}

export async function getCoachProfilesByPCPLevel(this: CoachStorageContext, pcpLevel: number): Promise<CoachProfile[]> {
  const db = this.getDb();
  
  return await db
    .select()
    .from(coachProfiles)
    .where(
      and(
        eq(coachProfiles.pcpLevel, pcpLevel),
        eq(coachProfiles.isActive, true)
      )
    )
    .orderBy(desc(coachProfiles.averageRating));
}

// Coach Application Operations
export async function createCoachApplication(this: CoachStorageContext, applicationData: InsertCoachApplication): Promise<CoachApplication> {
  const db = this.getDb();
  
  const [application] = await db
    .insert(coachApplications)
    .values({
      ...applicationData,
      submittedAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
    
  if (!application) {
    throw new Error('Failed to create coach application');
  }
  
  return application;
}

export async function getCoachApplication(this: CoachStorageContext, userId: number): Promise<CoachApplication | undefined> {
  const db = this.getDb();
  
  const [application] = await db
    .select()
    .from(coachApplications)
    .where(eq(coachApplications.userId, userId))
    .orderBy(desc(coachApplications.submittedAt))
    .limit(1);
    
  return application;
}

export async function updateCoachApplication(this: CoachStorageContext, applicationId: number, updates: Partial<CoachApplication>): Promise<CoachApplication | undefined> {
  const db = this.getDb();
  
  const [application] = await db
    .update(coachApplications)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(coachApplications.id, applicationId))
    .returning();
    
  return application;
}

// Coach Certification Operations
export async function createCoachCertification(this: CoachStorageContext, certificationData: InsertCoachCertification): Promise<CoachCertification> {
  const db = this.getDb();
  
  const [certification] = await db
    .insert(coachCertifications)
    .values({
      ...certificationData,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
    
  if (!certification) {
    throw new Error('Failed to create coach certification');
  }
  
  return certification;
}

export async function getCoachCertifications(this: CoachStorageContext, applicationId: number): Promise<CoachCertification[]> {
  const db = this.getDb();
  
  return await db
    .select()
    .from(coachCertifications)
    .where(eq(coachCertifications.applicationId, applicationId))
    .orderBy(desc(coachCertifications.createdAt));
}

export async function updateCoachCertification(this: CoachStorageContext, certificationId: number, updates: Partial<CoachCertification>): Promise<CoachCertification | undefined> {
  const db = this.getDb();
  
  const [certification] = await db
    .update(coachCertifications)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(coachCertifications.id, certificationId))
    .returning();
    
  return certification;
}

// Coach Review Operations
export async function createCoachReview(this: CoachStorageContext, reviewData: InsertCoachReview): Promise<CoachReview> {
  const db = this.getDb();
  
  const [review] = await db
    .insert(coachReviews)
    .values({
      ...reviewData,
      rating: reviewData.rating * 20, // Convert 1-5 scale to 20-100 for compatibility
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
    
  if (!review) {
    throw new Error('Failed to create coach review');
  }
  
  return review;
}

export async function getCoachReviews(this: CoachStorageContext, coachId: number): Promise<CoachReview[]> {
  const db = this.getDb();
  
  return await db
    .select()
    .from(coachReviews)
    .where(
      and(
        eq(coachReviews.coachId, coachId),
        eq(coachReviews.isPublic, true)
      )
    )
    .orderBy(desc(coachReviews.createdAt));
}

export async function updateCoachReview(this: CoachStorageContext, reviewId: number, updates: Partial<CoachReview>): Promise<CoachReview | undefined> {
  const db = this.getDb();
  
  const [review] = await db
    .update(coachReviews)
    .set({
      ...updates,
      updatedAt: new Date()
    })
    .where(eq(coachReviews.id, reviewId))
    .returning();
    
  return review;
}

// Analytics and Statistics
export async function getCoachStats(this: CoachStorageContext, coachId: number): Promise<{
  totalSessions: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
}> {
  const db = this.getDb();
  
  const [profile] = await db
    .select({
      totalSessions: coachProfiles.totalSessions,
      totalEarnings: coachProfiles.totalEarnings,
      averageRating: coachProfiles.averageRating,
      totalReviews: coachProfiles.totalReviews
    })
    .from(coachProfiles)
    .where(eq(coachProfiles.userId, coachId))
    .limit(1);
    
  return profile || {
    totalSessions: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0
  };
}

export async function updateCoachStats(this: CoachStorageContext, coachId: number, stats: {
  totalSessions?: number;
  totalEarnings?: number;
  averageRating?: number;
  totalReviews?: number;
}): Promise<CoachProfile | undefined> {
  const db = this.getDb();
  
  const [profile] = await db
    .update(coachProfiles)
    .set({
      ...stats,
      updatedAt: new Date()
    })
    .where(eq(coachProfiles.userId, coachId))
    .returning();
    
  return profile;
}

// Subscription Management (PKL-278651-PCP-BASIC-TIER)
export async function upgradeCoachSubscription(this: CoachStorageContext, userId: number, tier: 'basic' | 'premium'): Promise<CoachProfile | undefined> {
  const db = this.getDb();
  
  const subscriptionData: any = {
    subscriptionTier: tier,
    updatedAt: new Date()
  };
  
  if (tier === 'premium') {
    subscriptionData.subscriptionStartedAt = new Date();
    subscriptionData.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  
  const [profile] = await db
    .update(coachProfiles)
    .set(subscriptionData)
    .where(eq(coachProfiles.userId, userId))
    .returning();
    
  return profile;
}