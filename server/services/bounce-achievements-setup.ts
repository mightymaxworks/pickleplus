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
import { bounceAchievements } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Default achievement data for the Bounce system
 */
const DEFAULT_ACHIEVEMENTS = [
  {
    name: 'First Time Tester',
    code: 'first_time_tester',
    description: 'Completed your first Bounce test session',
    xpValue: 25,
    iconPath: '/assets/bounce/badges/first_time.svg',
    displayOrder: 1,
    category: 'Participation',
    isActive: true,
    rarity: 'Common'
  },
  {
    name: 'Bug Hunter',
    code: 'bug_hunter',
    description: 'Reported 5 findings through Bounce',
    xpValue: 50,
    iconPath: '/assets/bounce/badges/bug_hunter.svg',
    displayOrder: 2,
    category: 'Findings',
    isActive: true,
    rarity: 'Uncommon'
  },
  {
    name: 'First Finding',
    code: 'first_finding',
    description: 'Reported your first issue through Bounce',
    xpValue: 25,
    iconPath: '/assets/bounce/badges/first_finding.svg',
    displayOrder: 3,
    category: 'Findings',
    isActive: true,
    rarity: 'Common'
  },
  {
    name: 'Master Hunter',
    code: 'master_hunter',
    description: 'Reported 20 findings through Bounce',
    xpValue: 100,
    iconPath: '/assets/bounce/badges/master_hunter.svg',
    displayOrder: 4,
    category: 'Findings',
    isActive: true,
    rarity: 'Rare'
  },
  {
    name: 'Consistent Tester',
    code: 'consistent_tester',
    description: 'Tested for 5 days in a row',
    xpValue: 75,
    iconPath: '/assets/bounce/badges/consistent_tester.svg',
    displayOrder: 5,
    category: 'Participation',
    isActive: true,
    rarity: 'Rare'
  },
  {
    name: 'Verifier',
    code: 'verifier',
    description: 'Verified 5 findings reported by others',
    xpValue: 50,
    iconPath: '/assets/bounce/badges/verifier.svg',
    displayOrder: 6,
    category: 'Verification',
    isActive: true,
    rarity: 'Uncommon'
  },
  {
    name: 'Master Verifier',
    code: 'master_verifier',
    description: 'Verified 20 findings reported by others',
    xpValue: 100,
    iconPath: '/assets/bounce/badges/master_verifier.svg',
    displayOrder: 7,
    category: 'Verification',
    isActive: true,
    rarity: 'Rare'
  },
  {
    name: 'Bounce Enthusiast',
    code: 'bounce_enthusiast',
    description: 'Participated in 10 Bounce testing sessions',
    xpValue: 50,
    iconPath: '/assets/bounce/badges/enthusiast.svg',
    displayOrder: 8,
    category: 'Participation',
    isActive: true,
    rarity: 'Uncommon'
  },
  {
    name: 'Bounce Veteran',
    code: 'bounce_veteran',
    description: 'Participated in 30 Bounce testing sessions',
    xpValue: 100,
    iconPath: '/assets/bounce/badges/veteran.svg',
    displayOrder: 9,
    category: 'Participation',
    isActive: true,
    rarity: 'Rare'
  },
  {
    name: 'Critical Bug Catcher',
    code: 'critical_bug',
    description: 'Found a critical bug that could have caused major issues',
    xpValue: 150,
    iconPath: '/assets/bounce/badges/critical_bug.svg',
    displayOrder: 10,
    category: 'Findings',
    isActive: true,
    rarity: 'Epic'
  }
];

/**
 * Set up the default Bounce achievements if they don't exist
 */
export async function setupBounceAchievements(): Promise<void> {
  try {
    console.log('[Bounce Achievements Setup] Starting achievement setup...');
    
    // Check if achievements already exist
    const existingAchievements = await db
      .select({ code: bounceAchievements.code })
      .from(bounceAchievements);
    
    const existingCodes = new Set(existingAchievements.map(a => a.code));
    
    // Filter out achievements that already exist
    const achievementsToAdd = DEFAULT_ACHIEVEMENTS.filter(a => !existingCodes.has(a.code));
    
    // If no new achievements to add, we're done
    if (achievementsToAdd.length === 0) {
      console.log('[Bounce Achievements Setup] All achievements already exist, skipping setup');
      return;
    }
    
    // Add missing achievements
    console.log(`[Bounce Achievements Setup] Adding ${achievementsToAdd.length} new achievements...`);
    
    const now = new Date();
    
    // Add each achievement with createdAt and updatedAt timestamps
    for (const achievement of achievementsToAdd) {
      await db.insert(bounceAchievements).values({
        ...achievement,
        createdAt: now,
        updatedAt: now
      });
    }
    
    console.log('[Bounce Achievements Setup] Achievement setup complete');
  } catch (error) {
    console.error('[Bounce Achievements Setup] Error setting up achievements:', error);
    throw error;
  }
}

/**
 * Update any existing achievements
 */
export async function updateBounceAchievements(): Promise<void> {
  try {
    console.log('[Bounce Achievements Setup] Starting achievement updates...');
    
    // Update each achievement that already exists
    for (const achievement of DEFAULT_ACHIEVEMENTS) {
      const [existing] = await db
        .select()
        .from(bounceAchievements)
        .where(eq(bounceAchievements.code, achievement.code));
      
      if (existing) {
        // Check if there are differences
        if (
          existing.name !== achievement.name ||
          existing.description !== achievement.description ||
          existing.xpValue !== achievement.xpValue ||
          existing.iconPath !== achievement.iconPath ||
          existing.displayOrder !== achievement.displayOrder ||
          existing.category !== achievement.category ||
          existing.rarity !== achievement.rarity
        ) {
          // Update the achievement
          await db
            .update(bounceAchievements)
            .set({
              name: achievement.name,
              description: achievement.description,
              xpValue: achievement.xpValue,
              iconPath: achievement.iconPath,
              displayOrder: achievement.displayOrder,
              category: achievement.category,
              rarity: achievement.rarity,
              updatedAt: new Date()
            })
            .where(eq(bounceAchievements.code, achievement.code));
            
          console.log(`[Bounce Achievements Setup] Updated achievement: ${achievement.name}`);
        }
      }
    }
    
    console.log('[Bounce Achievements Setup] Achievement updates complete');
  } catch (error) {
    console.error('[Bounce Achievements Setup] Error updating achievements:', error);
    throw error;
  }
}