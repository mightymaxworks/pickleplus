/**
 * PKL-278651-BOUNCE-0004-GAME - Bounce Achievements Setup
 * 
 * This file provides functions to set up default Bounce achievements
 * and ensure the database has the core achievement data needed.
 * 
 * @framework Framework5.2
 * @version 1.0.0
 * @lastModified 2025-04-21
 */

import { db } from '../db';
import { eq } from 'drizzle-orm';
import { 
  bounceAchievements, 
  BounceAchievementType,
  type InsertBounceAchievement
} from '@shared/schema';

/**
 * Default achievement data for the Bounce system
 */
const defaultAchievements: InsertBounceAchievement[] = [
  // Tester Participation Achievements
  {
    name: "Test Explorer",
    description: "Participate in Bounce testing for at least 30 minutes.",
    type: BounceAchievementType.TESTER_PARTICIPATION,
    icon: "award",
    badgeImageUrl: "/assets/badges/bounce/test-explorer.png",
    requiredPoints: 30, // 30 minutes
    xpReward: 15,
    isActive: true
  },
  {
    name: "Test Enthusiast",
    description: "Spend 2 hours testing with Bounce.",
    type: BounceAchievementType.TESTER_PARTICIPATION,
    icon: "award",
    badgeImageUrl: "/assets/badges/bounce/test-enthusiast.png",
    requiredPoints: 120, // 2 hours
    xpReward: 25,
    isActive: true
  },
  {
    name: "Test Champion",
    description: "Dedicate 5 hours to Bounce testing sessions.",
    type: BounceAchievementType.TESTER_PARTICIPATION,
    icon: "award",
    badgeImageUrl: "/assets/badges/bounce/test-champion.png",
    requiredPoints: 300, // 5 hours
    xpReward: 50,
    isActive: true
  },
  
  // Issue Discovery Achievements
  {
    name: "Bug Spotter",
    description: "Find your first issue with Bounce.",
    type: BounceAchievementType.ISSUE_DISCOVERY,
    icon: "bug",
    badgeImageUrl: "/assets/badges/bounce/bug-spotter.png",
    requiredInteractions: 1,
    xpReward: 10,
    isActive: true
  },
  {
    name: "Bug Hunter",
    description: "Discover 5 issues with Bounce.",
    type: BounceAchievementType.ISSUE_DISCOVERY,
    icon: "search",
    badgeImageUrl: "/assets/badges/bounce/bug-hunter.png",
    requiredInteractions: 5,
    xpReward: 25,
    isActive: true
  },
  {
    name: "Bug Exterminator",
    description: "Report 15 issues with Bounce.",
    type: BounceAchievementType.ISSUE_DISCOVERY,
    icon: "zap",
    badgeImageUrl: "/assets/badges/bounce/bug-exterminator.png",
    requiredInteractions: 15,
    xpReward: 50,
    isActive: true
  },
  
  // Verification Achievements
  {
    name: "Verification Rookie",
    description: "Verify your first Bounce finding from another tester.",
    type: BounceAchievementType.VERIFICATION,
    icon: "check",
    badgeImageUrl: "/assets/badges/bounce/verification-rookie.png",
    requiredInteractions: 1,
    xpReward: 5,
    isActive: true
  },
  {
    name: "Verification Expert",
    description: "Verify 10 Bounce findings from other testers.",
    type: BounceAchievementType.VERIFICATION,
    icon: "check-square",
    badgeImageUrl: "/assets/badges/bounce/verification-expert.png",
    requiredInteractions: 10,
    xpReward: 20,
    isActive: true
  },
  
  // Feedback Achievements
  {
    name: "Feedback Provider",
    description: "Submit detailed feedback on 3 Bounce findings.",
    type: BounceAchievementType.FEEDBACK,
    icon: "message-square",
    badgeImageUrl: "/assets/badges/bounce/feedback-provider.png",
    requiredInteractions: 3,
    xpReward: 15,
    isActive: true
  },
  
  // Milestone Achievements
  {
    name: "Founding Tester",
    description: "Join the Bounce testing program in its early days.",
    type: BounceAchievementType.MILESTONE,
    icon: "star",
    badgeImageUrl: "/assets/badges/bounce/founding-tester.png",
    xpReward: 50,
    isActive: true
  }
];

/**
 * Set up the default Bounce achievements if they don't exist
 */
export async function setupBounceAchievements(): Promise<void> {
  try {
    console.log('[Bounce] Setting up default achievements...');
    
    // Check if any achievements already exist
    const existingAchievements = await db.select().from(bounceAchievements);
    
    if (existingAchievements.length === 0) {
      // Insert all default achievements
      await db.insert(bounceAchievements).values(defaultAchievements);
      console.log(`[Bounce] Created ${defaultAchievements.length} default achievements.`);
    } else {
      console.log(`[Bounce] Found ${existingAchievements.length} existing achievements.`);
      
      // Check each default achievement and add it if missing
      let addedCount = 0;
      
      for (const achievement of defaultAchievements) {
        // Check if achievement with this name already exists
        const existingAchievement = existingAchievements.find(a => a.name === achievement.name);
        
        if (!existingAchievement) {
          await db.insert(bounceAchievements).values(achievement);
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        console.log(`[Bounce] Added ${addedCount} missing achievements.`);
      } else {
        console.log('[Bounce] All default achievements already exist.');
      }
    }
  } catch (error) {
    console.error('[Bounce] Error setting up achievements:', error);
  }
}

/**
 * Update any existing achievements
 */
export async function updateBounceAchievements(): Promise<void> {
  try {
    // This function could be expanded to update existing achievements
    // For example, updating icons, descriptions, or XP rewards
    console.log('[Bounce] Achievement updates complete.');
  } catch (error) {
    console.error('[Bounce] Error updating achievements:', error);
  }
}