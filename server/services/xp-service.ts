import { User } from "@shared/schema";
import { db } from "../db";
import { users, activities } from "@shared/schema";
import { eq } from "drizzle-orm";
import { IXPService } from "./interfaces";

// XP required for each level
// Uses an exponential formula: base * 1.5^(level-1)
// With base starting at 100 XP
// This creates an exponential curve that requires more XP for each level
const MAX_LEVEL = 100;
const BASE_XP = 100;
const GROWTH_FACTOR = 1.15; // Each level requires 15% more XP than the previous

const LEVEL_THRESHOLDS = Array(MAX_LEVEL).fill(0).map((_, i) => {
  const level = i + 1;
  
  // For level 1, the threshold is simply BASE_XP
  if (level === 1) return BASE_XP;
  
  // For subsequent levels, we use the exponential formula
  // The total XP required is the sum of all previous levels plus this level
  let totalXP = 0;
  for (let l = 1; l <= level; l++) {
    totalXP += Math.floor(BASE_XP * Math.pow(GROWTH_FACTOR, l - 1));
  }
  
  return totalXP;
});

export class XPService implements IXPService {
  /**
   * Award XP to a user and record the activity
   */
  async awardXP(userId: number, amount: number, reason: string): Promise<User> {
    // First, get the user to apply multiplier if needed
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
      
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Apply XP multiplier if user has one
    const adjustedAmount = await this.applyMultiplier(userId, amount);
    
    // Award XP to the user
    const currentXP = user.xp || 0;
    const [updatedUser] = await db
      .update(users)
      .set({
        xp: currentXP + adjustedAmount
      })
      .where(eq(users.id, userId))
      .returning();
      
    // Check if the user has leveled up
    const oldLevel = this.calculateLevel(currentXP);
    const newLevel = this.calculateLevel(updatedUser.xp || 0);
    
    // If user leveled up, update their level
    if (newLevel > oldLevel) {
      const [leveledUser] = await db
        .update(users)
        .set({
          level: newLevel
        })
        .where(eq(users.id, userId))
        .returning();
        
      // Record the activity for both XP gain and level up
      await db.insert(activities).values({
        userId: userId,
        type: 'level_up',
        description: `Reached level ${newLevel}`,
        xpEarned: 0, // No XP from leveling up itself
        metadata: { oldLevel, newLevel }
      });
      
      // Return the user with updated level
      return leveledUser;
    }
    
    // Record the activity for XP gain
    await db.insert(activities).values({
      userId: userId,
      type: 'xp_gain',
      description: reason,
      xpEarned: adjustedAmount
    });
    
    return updatedUser;
  }
  
  /**
   * Calculate a user's level based on XP
   */
  calculateLevel(xp: number): number {
    // Find the highest level threshold that the XP exceeds
    const level = LEVEL_THRESHOLDS.findIndex(threshold => xp < threshold);
    
    // If no threshold is exceeded, return the max level
    if (level === -1) {
      return LEVEL_THRESHOLDS.length;
    }
    
    // Otherwise, return the level (add 1 because arrays are 0-indexed)
    return level === 0 ? 1 : level;
  }
  
  /**
   * Apply XP multiplier if user has one
   */
  async applyMultiplier(userId: number, amount: number): Promise<number> {
    // Get user's multiplier
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
      
    if (!user) {
      return amount;
    }
    
    // Apply multiplier if it exists
    const multiplier = user.xpMultiplier || 100;
    return Math.round(amount * (multiplier / 100));
  }
}