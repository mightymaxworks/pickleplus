import { User } from "@shared/schema";
import { db } from "../db";
import { users, activities } from "@shared/schema";
import { eq } from "drizzle-orm";
import { IXPService } from "./interfaces";

// XP required for each level
// Uses a formula: (level^2) * 50
const LEVEL_THRESHOLDS = Array(100).fill(0).map((_, i) => {
  const level = i + 1;
  return level * level * 50;
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