/**
 * PKL-278651-COMM-0007 - Enhanced Referral System & Community Ticker
 * Referral System Service
 * 
 * This file implements the business logic for the referral system.
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */
import { 
  Referral, 
  ReferralAchievement, 
  PickleballTip,
  InsertReferral,
  InsertReferralAchievement,
  InsertPickleballTip,
  referrals,
  referralAchievements,
  pickleballTips
} from '../../../shared/schema/referrals';
import { db } from '../../db';
import { users } from '../../../shared/schema';
import { and, eq, gte, sql } from 'drizzle-orm';

/**
 * Get referrals made by a specific referrer
 */
export async function getReferralsByReferrerId(referrerId: number): Promise<Referral[]> {
  try {
    return await db.query.referrals.findMany({
      where: eq(referrals.referrerId, referrerId),
      with: {
        referredUser: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            email: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching referrals by referrer ID:', error);
    throw error;
  }
}

/**
 * Get referrals where a user was referred by others
 */
export async function getReferralsByReferredUserId(referredUserId: number): Promise<Referral[]> {
  try {
    return await db.query.referrals.findMany({
      where: eq(referrals.referredUserId, referredUserId),
      with: {
        referrer: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            email: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching referrals by referred user ID:', error);
    throw error;
  }
}

/**
 * Get a specific referral between two users
 */
export async function getReferralByUsers(referrerId: number, referredUserId: number): Promise<Referral | undefined> {
  try {
    const results = await db.select().from(referrals).where(
      and(
        eq(referrals.referrerId, referrerId),
        eq(referrals.referredUserId, referredUserId)
      )
    );
    return results[0];
  } catch (error) {
    console.error('Error fetching referral by users:', error);
    throw error;
  }
}

/**
 * Create a new referral
 */
export async function createReferral(data: InsertReferral): Promise<Referral> {
  try {
    const [newReferral] = await db.insert(referrals).values(data).returning();
    return newReferral;
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
}

/**
 * Update a referral's activity status
 */
export async function updateReferralActivityStatus(
  referralId: number, 
  activityLevel: 'new' | 'casual' | 'active', 
  matchesPlayed: number
): Promise<Referral> {
  try {
    const [updatedReferral] = await db.update(referrals)
      .set({ 
        activityLevel, 
        matchesPlayed,
        lastActive: new Date()
      })
      .where(eq(referrals.id, referralId))
      .returning();
    return updatedReferral;
  } catch (error) {
    console.error('Error updating referral activity status:', error);
    throw error;
  }
}

/**
 * Get achievements earned by a user
 */
export async function getReferralAchievementsByUserId(userId: number): Promise<ReferralAchievement[]> {
  try {
    return await db.select().from(referralAchievements).where(eq(referralAchievements.userId, userId));
  } catch (error) {
    console.error('Error fetching referral achievements by user ID:', error);
    throw error;
  }
}

/**
 * Create a new referral achievement
 */
export async function createReferralAchievement(data: InsertReferralAchievement): Promise<ReferralAchievement> {
  try {
    const [newAchievement] = await db.insert(referralAchievements).values(data).returning();
    return newAchievement;
  } catch (error) {
    console.error('Error creating referral achievement:', error);
    throw error;
  }
}

/**
 * Get pickleball tips for the ticker
 */
export async function getPickleballTips(options: { limit?: number, isActive?: boolean } = {}): Promise<PickleballTip[]> {
  try {
    const { limit = 5, isActive = true } = options;
    
    let query = db.select().from(pickleballTips);
    
    if (isActive !== undefined) {
      query = query.where(eq(pickleballTips.isActive, isActive));
    }
    
    return await query.limit(limit).orderBy(pickleballTips.displayPriority);
  } catch (error) {
    console.error('Error fetching pickleball tips:', error);
    throw error;
  }
}

/**
 * Create a new pickleball tip
 */
export async function createPickleballTip(data: InsertPickleballTip): Promise<PickleballTip> {
  try {
    const [newTip] = await db.insert(pickleballTips).values(data).returning();
    return newTip;
  } catch (error) {
    console.error('Error creating pickleball tip:', error);
    throw error;
  }
}

/**
 * Update a user's activity level in all referrals
 */
export async function updateUserActivityInReferrals(userId: number, matchCount: number): Promise<void> {
  try {
    // Define activity thresholds
    const casualThreshold = 2; // 2+ matches = casual
    const activeThreshold = 5; // 5+ matches = active
    
    let activityLevel: 'new' | 'casual' | 'active' = 'new';
    
    if (matchCount >= activeThreshold) {
      activityLevel = 'active';
    } else if (matchCount >= casualThreshold) {
      activityLevel = 'casual';
    }
    
    // Update all referrals where this user was referred
    await db.update(referrals)
      .set({ 
        activityLevel, 
        matchesPlayed: matchCount,
        lastActive: new Date()
      })
      .where(eq(referrals.referredUserId, userId));
      
  } catch (error) {
    console.error('Error updating user activity in referrals:', error);
    throw error;
  }
}

/**
 * Get community activity for ticker
 */
export async function getCommunityActivity(limit: number = 5): Promise<any[]> {
  try {
    // Get recent user joins
    const recentJoins = await db.select({
      type: sql`'join'`.as('type'),
      userId: users.id,
      username: users.username,
      displayName: users.displayName,
      timestamp: users.createdAt
    })
    .from(users)
    .orderBy(sql`users.created_at DESC`)
    .limit(limit);
    
    // Get recent achievements
    const recentAchievements = await db.select({
      type: sql`'achievement'`.as('type'),
      userId: referralAchievements.userId,
      achievementName: referralAchievements.achievementName,
      timestamp: referralAchievements.dateAchieved
    })
    .from(referralAchievements)
    .orderBy(sql`referral_achievements.date_achieved DESC`)
    .limit(limit);
    
    // Combine and sort by timestamp (most recent first)
    const allActivities = [...recentJoins, ...recentAchievements]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return allActivities;
  } catch (error) {
    console.error('Error fetching community activity:', error);
    throw error;
  }
}

// Export all functions
export const referralService = {
  getReferralsByReferrerId,
  getReferralsByReferredUserId,
  getReferralByUsers,
  createReferral,
  updateReferralActivityStatus,
  getReferralAchievementsByUserId,
  createReferralAchievement,
  getPickleballTips,
  createPickleballTip,
  updateUserActivityInReferrals,
  getCommunityActivity
};