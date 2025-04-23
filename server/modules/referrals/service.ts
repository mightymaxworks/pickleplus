/**
 * PKL-278651-COMM-0007 - Enhanced Referral System
 * Service implementation for referral functionality
 * 
 * @version 1.0.0
 * @framework Framework5.3
 */

import { storage } from '../../storage';

/**
 * Record a new referral when a user signs up with a referral link
 */
export async function recordReferral(referrerId: number, newUserId: number): Promise<boolean> {
  try {
    // Store the referral relationship
    const referralData = {
      referrerId,
      referredId: newUserId,
      status: 'active',
      xpAwarded: Math.floor(Math.random() * 21) + 20 // Random XP between 20-40
    };
    
    await storage.createReferral(referralData);
    
    // Award XP to the referrer is handled in the storage layer
    
    // Check if this referral unlocks any achievements
    await checkForAchievements(referrerId);
    
    return true;
  } catch (error) {
    console.error('Error recording referral:', error);
    return false;
  }
}

/**
 * Check if user has earned any new referral achievements
 */
async function checkForAchievements(userId: number): Promise<void> {
  try {
    const referralCount = await storage.getUserReferralCount(userId);
    const earnedAchievements = await storage.getUserReferralAchievements(userId);
    
    // Define achievements thresholds and rewards
    const achievements = [
      { 
        id: 'first_steps', 
        name: 'First Steps', 
        description: 'Refer your first pickleball friend', 
        threshold: 1, 
        xpReward: 20 
      },
      { 
        id: 'growing_circle', 
        name: 'Growing Circle', 
        description: 'Refer 5 friends to the platform', 
        threshold: 5, 
        xpReward: 50 
      },
      { 
        id: 'community_builder', 
        name: 'Community Builder', 
        description: 'Refer 15 friends to the platform', 
        threshold: 15, 
        xpReward: 150 
      },
      { 
        id: 'pickle_evangelist', 
        name: 'Pickle Evangelist', 
        description: 'Refer 30 friends to the platform', 
        threshold: 30, 
        xpReward: 300 
      },
      { 
        id: 'founders_club', 
        name: 'Founders Club', 
        description: 'Refer 50 friends to the platform', 
        threshold: 50, 
        xpReward: 500 
      }
    ];
    
    // Check each achievement
    for (const achievement of achievements) {
      const achieved = earnedAchievements.some(a => a.id === achievement.id);
      
      // If not already achieved and threshold is met
      if (!achieved && referralCount >= achievement.threshold) {
        // Award the achievement
        await storage.awardReferralAchievement(userId, achievement.id);
        
        // Award XP for the achievement is handled by awardReferralAchievement
      }
    }
  } catch (error) {
    console.error('Error checking for achievements:', error);
  }
}

/**
 * Get the next achievement a user can earn
 */
export async function getNextAchievement(userId: number) {
  try {
    const referralCount = await storage.getUserReferralCount(userId);
    const earnedAchievements = await storage.getUserReferralAchievements(userId);
    
    // Define achievements with their thresholds
    const achievements = [
      { id: 'first_steps', name: 'First Steps', threshold: 1 },
      { id: 'growing_circle', name: 'Growing Circle', threshold: 5 },
      { id: 'community_builder', name: 'Community Builder', threshold: 15 },
      { id: 'pickle_evangelist', name: 'Pickle Evangelist', threshold: 30 },
      { id: 'founders_club', name: 'Founders Club', threshold: 50 }
    ];
    
    // Find the next unearned achievement
    for (const achievement of achievements) {
      const achieved = earnedAchievements.some(a => a.id === achievement.id);
      if (!achieved) {
        return {
          name: achievement.name,
          requiredReferrals: achievement.threshold
        };
      }
    }
    
    // If all achievements are earned
    return null;
  } catch (error) {
    console.error('Error getting next achievement:', error);
    return null;
  }
}