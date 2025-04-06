/**
 * XP System Module
 * 
 * This module manages the Experience Points (XP) system, separate from the CourtIQ rating system.
 * XP is earned through platform engagement, match participation, achievements, and social activities.
 * It's used for level progression, feature unlocking, and gamification.
 */

import { db } from "../../db";
import { eq, and, sql, desc, sum } from "drizzle-orm";
import { serverEventBus, ServerEvents } from "../../core/events/eventBus";
import { users } from "../../../shared/schema";
import { activities } from "../../../shared/schema";
import { CourtIQEvents } from "../rating/courtiq";

// Define XP levels and thresholds
interface XPLevel {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  unlocks: string[];  // Features or privileges unlocked
  badgeUrl?: string;  // URL to level badge
  color?: string;     // Level color for UI
}

// XP Sources and weights
enum XPSource {
  // Account activity
  PROFILE_COMPLETION = "profile_completion",
  DAILY_LOGIN = "daily_login",
  CONNECT_SOCIAL = "connect_social",
  
  // Match participation
  MATCH_RECORDED = "match_recorded",
  MATCH_WON = "match_won",
  TOURNAMENT_PARTICIPATION = "tournament_participation",
  TOURNAMENT_PLACEMENT = "tournament_placement",
  
  // Achievements
  ACHIEVEMENT_UNLOCKED = "achievement_unlocked",
  
  // Social
  FRIEND_CONNECTED = "friend_connected",
  COACH_SESSION = "coach_session",
  REFERRED_PLAYER = "referred_player",
  
  // CourtIQ
  TIER_PROMOTION = "tier_promotion",
  POINTS_MILESTONE = "points_milestone",
  
  // Admin/Special
  REDEMPTION_CODE = "redemption_code",
  SPECIAL_EVENT = "special_event",
  ADMIN_GRANT = "admin_grant"
}

// Base XP values for different actions
const XP_VALUES: Record<XPSource, number> = {
  [XPSource.PROFILE_COMPLETION]: 100,
  [XPSource.DAILY_LOGIN]: 10,
  [XPSource.CONNECT_SOCIAL]: 25,
  
  [XPSource.MATCH_RECORDED]: 30,
  [XPSource.MATCH_WON]: 50,
  [XPSource.TOURNAMENT_PARTICIPATION]: 75,
  [XPSource.TOURNAMENT_PLACEMENT]: 150,
  
  [XPSource.ACHIEVEMENT_UNLOCKED]: 200,
  
  [XPSource.FRIEND_CONNECTED]: 20,
  [XPSource.COACH_SESSION]: 100,
  [XPSource.REFERRED_PLAYER]: 150,
  
  [XPSource.TIER_PROMOTION]: 250,
  [XPSource.POINTS_MILESTONE]: 100,
  
  [XPSource.REDEMPTION_CODE]: 0, // Variable based on code
  [XPSource.SPECIAL_EVENT]: 0, // Variable based on event
  [XPSource.ADMIN_GRANT]: 0  // Variable based on admin
};

// Daily caps for XP sources to prevent grinding/spam
const DAILY_CAPS: Partial<Record<XPSource, number>> = {
  [XPSource.DAILY_LOGIN]: 10, // Once per day
  [XPSource.MATCH_RECORDED]: 90, // Equivalent to 3 matches
  [XPSource.MATCH_WON]: 150, // Equivalent to 3 wins
  [XPSource.FRIEND_CONNECTED]: 100, // Max 5 friends per day
};

export class XPSystem {
  private levels: XPLevel[] = [];
  
  constructor() {
    this.initializeLevels();
  }
  
  /**
   * Initialize the XP level structure
   */
  private initializeLevels(): void {
    // Define initial levels (1-49)
    // Levels 50-100 are reserved for future unlocks
    const definedLevels: XPLevel[] = [
      // Beginner tier (1-10)
      {
        level: 1,
        name: "Paddle Novice",
        minXP: 0,
        maxXP: 99,
        unlocks: ["Basic profile"],
        color: "#8D99AE" // Slate Gray
      },
      {
        level: 2,
        name: "Court Rookie",
        minXP: 100,
        maxXP: 249,
        unlocks: ["Friend connections"],
        color: "#8D99AE" 
      },
      {
        level: 3,
        name: "Rally Beginner",
        minXP: 250,
        maxXP: 499,
        unlocks: ["Activity feed"],
        color: "#8D99AE" 
      },
      {
        level: 4,
        name: "Serve Starter",
        minXP: 500,
        maxXP: 749,
        unlocks: ["Custom profile picture"],
        color: "#8D99AE" 
      },
      {
        level: 5,
        name: "Dink Dabbler",
        minXP: 750,
        maxXP: 999,
        unlocks: ["Match recording"],
        color: "#8D99AE" 
      },
      
      // Intermediate tier (6-15)
      {
        level: 10,
        name: "Volley Apprentice",
        minXP: 1000,
        maxXP: 1999,
        unlocks: ["Tournament registration"],
        color: "#2B2D42" // Dark Blue
      },
      {
        level: 15,
        name: "Kitchen Keeper",
        minXP: 2000,
        maxXP: 3999,
        unlocks: ["Community feed posting"],
        color: "#2B2D42"
      },
      
      // Advanced tier (16-25)
      {
        level: 20,
        name: "Spin Specialist",
        minXP: 4000,
        maxXP: 6999,
        unlocks: ["Match insights", "Advanced statistics"],
        color: "#EF233C" // Red
      },
      {
        level: 25,
        name: "Volley Virtuoso",
        minXP: 7000,
        maxXP: 9999,
        unlocks: ["Custom avatars"],
        color: "#EF233C"
      },
      
      // Expert tier (26-35)
      {
        level: 30,
        name: "Dink Dynamo",
        minXP: 10000,
        maxXP: 14999,
        unlocks: ["Profile backgrounds"],
        color: "#D90429" // Crimson
      },
      {
        level: 35,
        name: "Smash Specialist",
        minXP: 15000,
        maxXP: 19999,
        unlocks: ["Coaching access"],
        color: "#D90429"
      },
      
      // Elite tier (36-45)
      {
        level: 40,
        name: "Court Commander",
        minXP: 20000,
        maxXP: 29999,
        unlocks: ["Host tournaments", "Team captain features"],
        color: "#E76F51" // Orange
      },
      {
        level: 45,
        name: "Pickleball Pro",
        minXP: 30000,
        maxXP: 39999,
        unlocks: ["League commissioner", "Beta feature access"],
        color: "#E76F51"
      },
      
      // Champion tier (46-49)
      {
        level: 49,
        name: "Legendary Competitor",
        minXP: 40000,
        maxXP: 49999,
        unlocks: ["Community moderator", "Feature input panel"],
        color: "#F4A261" // Sandy
      }
    ];
    
    // Create a placeholder for future levels (50-100)
    const futureLevels: XPLevel[] = [];
    for (let i = 50; i <= 100; i++) {
      futureLevels.push({
        level: i,
        name: i == 100 ? "Grandmaster" : `Level ${i}`,
        minXP: 50000 + (i - 50) * 2000, // Increment by 2000 XP per level
        maxXP: 50000 + (i - 50 + 1) * 2000 - 1,
        unlocks: ["Coming soon"],
        color: i == 100 ? "#540D6E" : "#264653" // Special color for level 100
      });
    }
    
    // Combine all levels
    this.levels = [...definedLevels, ...futureLevels];
  }
  
  /**
   * Award XP to a user for an activity
   * @param userId User ID
   * @param source XP source type
   * @param amount Optional override amount (if not using default)
   * @param entityId Optional related entity ID (match, tournament, etc.)
   * @param multiplier Optional XP multiplier
   * @param notes Optional notes
   */
  async awardXP(
    userId: number,
    source: XPSource | string,
    amount?: number,
    entityId?: number,
    multiplier: number = 1.0,
    notes?: string
  ): Promise<{
    xpAwarded: number,
    newTotal: number,
    levelUp: boolean,
    oldLevel?: number,
    newLevel?: number
  }> {
    // Get basic XP amount based on source or use provided amount
    let xpAmount = amount;
    
    if (!xpAmount && source in XPSource) {
      xpAmount = XP_VALUES[source as XPSource];
    }
    
    if (!xpAmount) {
      xpAmount = 0; // Fallback
    }
    
    // Apply multiplier
    xpAmount = Math.round(xpAmount * multiplier);
    
    // Check daily caps if applicable
    if (DAILY_CAPS[source as XPSource]) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate XP earned from this source today
      const todayXP = await db.select({
        total: sum(activities.xpEarned)
      })
      .from(activities)
      .where(
        and(
          eq(activities.userId, userId),
          eq(activities.type, source),
          sql`DATE(${activities.createdAt}) = CURRENT_DATE`
        )
      )
      .execute();
      
      const alreadyEarned = (todayXP[0]?.total || 0) as number;
      const cap = DAILY_CAPS[source as XPSource] || 0;
      
      if (alreadyEarned >= cap) {
        // Already hit daily cap
        return {
          xpAwarded: 0,
          newTotal: await this.getUserXP(userId),
          levelUp: false
        };
      }
      
      // Cap the amount if it would exceed daily limit
      if (alreadyEarned + xpAmount > cap) {
        xpAmount = cap - alreadyEarned;
      }
    }
    
    // Get user's current XP and level
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, xp: true, level: true }
    });
    
    if (!user) {
      throw new Error(`User not found with ID ${userId}`);
    }
    
    const oldXP = user.xp || 0;
    const oldLevel = user.level || 1;
    
    // Calculate new total XP
    const newXP = oldXP + xpAmount;
    
    // Determine new level based on XP
    const newLevel = this.getLevelFromXP(newXP);
    const levelUp = newLevel > oldLevel;
    
    // Create activity record
    await db.insert(activities).values({
      userId,
      type: source,
      xpEarned: xpAmount,
      entityId,
      notes
    });
    
    // Update user's XP and level
    await db.update(users)
      .set({
        xp: newXP,
        level: newLevel
      })
      .where(eq(users.id, userId));
    
    // Fire events
    await serverEventBus.publish("xp:awarded", {
      userId,
      source,
      amount: xpAmount,
      newTotal: newXP
    });
    
    if (levelUp) {
      await serverEventBus.publish("xp:level_up", {
        userId,
        oldLevel,
        newLevel,
        unlocks: this.getLevelDetails(newLevel)?.unlocks || []
      });
    }
    
    return {
      xpAwarded: xpAmount,
      newTotal: newXP,
      levelUp,
      oldLevel: levelUp ? oldLevel : undefined,
      newLevel: levelUp ? newLevel : undefined
    };
  }
  
  /**
   * Apply an XP multiplier for a limited time
   * (This would typically be connected to a redemption code or special event)
   * @param userId User ID
   * @param multiplier XP multiplier value
   * @param durationHours Duration in hours
   */
  async applyXPMultiplier(userId: number, multiplier: number, durationHours: number): Promise<void> {
    // This would typically store the multiplier in a database table
    // and be checked when awarding XP
    
    // For now, just log and fire event
    console.log(`Applied ${multiplier}x XP multiplier for user ${userId} for ${durationHours} hours`);
    
    await serverEventBus.publish("xp:multiplier_applied", {
      userId,
      multiplier,
      durationHours,
      expiresAt: new Date(Date.now() + (durationHours * 60 * 60 * 1000))
    });
  }
  
  /**
   * Get a user's current XP total
   * @param userId User ID
   */
  async getUserXP(userId: number): Promise<number> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { xp: true }
    });
    
    return user?.xp || 0;
  }
  
  /**
   * Get user's current level
   * @param userId User ID
   */
  async getUserLevel(userId: number): Promise<number> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { level: true }
    });
    
    return user?.level || 1;
  }
  
  /**
   * Get detailed level information for a user
   * @param userId User ID
   */
  async getUserLevelDetails(userId: number): Promise<{
    currentLevel: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number;
    levelName: string;
    unlocks: string[];
  }> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { xp: true, level: true }
    });
    
    if (!user) {
      throw new Error(`User not found with ID ${userId}`);
    }
    
    const currentXP = user.xp || 0;
    const currentLevel = user.level || this.getLevelFromXP(currentXP);
    
    const levelDetails = this.getLevelDetails(currentLevel);
    const nextLevelDetails = this.getLevelDetails(currentLevel + 1);
    
    const nextLevelXP = nextLevelDetails ? nextLevelDetails.minXP : levelDetails.maxXP + 1;
    
    // Calculate progress to next level (0-100%)
    const levelStartXP = levelDetails.minXP;
    const xpInCurrentLevel = currentXP - levelStartXP;
    const totalXPForLevel = nextLevelXP - levelStartXP;
    
    const progress = Math.min(Math.round((xpInCurrentLevel / totalXPForLevel) * 100), 100);
    
    return {
      currentLevel,
      currentXP,
      nextLevelXP,
      progress,
      levelName: levelDetails.name,
      unlocks: levelDetails.unlocks
    };
  }
  
  /**
   * Determine level from XP amount
   * @param xp XP total
   */
  getLevelFromXP(xp: number): number {
    for (const level of this.levels) {
      if (xp >= level.minXP && xp <= level.maxXP) {
        return level.level;
      }
    }
    // Fallback to highest level if somehow XP is above max (shouldn't happen)
    return this.levels[this.levels.length - 1].level;
  }
  
  /**
   * Get level details
   * @param level Level number
   */
  getLevelDetails(level: number): XPLevel {
    const levelDetails = this.levels.find(l => l.level === level);
    
    if (!levelDetails) {
      // Fallback to first level if not found
      return this.levels[0];
    }
    
    return levelDetails;
  }
  
  /**
   * Get all XP levels
   */
  getAllLevels(): XPLevel[] {
    return [...this.levels];
  }
}

// Export singleton instance
export const xpSystem = new XPSystem();

// Register event handlers for various activities
serverEventBus.subscribe(ServerEvents.USER_CREATED, async (data: { userId: number }) => {
  await xpSystem.awardXP(data.userId, XPSource.PROFILE_COMPLETION);
});

serverEventBus.subscribe(ServerEvents.MATCH_RECORDED, async (data: { userId: number, matchId: number, isWinner: boolean }) => {
  // Award XP for recording match
  await xpSystem.awardXP(data.userId, XPSource.MATCH_RECORDED, undefined, data.matchId);
  
  // Extra XP for winning
  if (data.isWinner) {
    await xpSystem.awardXP(data.userId, XPSource.MATCH_WON, undefined, data.matchId);
  }
});

serverEventBus.subscribe(ServerEvents.ACHIEVEMENT_UNLOCKED, async (data: { userId: number, achievementId: number }) => {
  await xpSystem.awardXP(data.userId, XPSource.ACHIEVEMENT_UNLOCKED, undefined, data.achievementId);
});

serverEventBus.subscribe(ServerEvents.TOURNAMENT_CREATED, async (data: { userId: number, tournamentId: number }) => {
  await xpSystem.awardXP(data.userId, "tournament_created", 100, data.tournamentId);
});

// Listen for CourtIQ tier changes
serverEventBus.subscribe(CourtIQEvents.TIER_CHANGED, async (data: { userId: number, oldTier: string, newTier: string }) => {
  // Only award XP for promotions (moving up)
  const oldTierOrder = data.oldTier.split(" ")[0]; // This assumes tier names start with their order
  const newTierOrder = data.newTier.split(" ")[0];
  
  if (newTierOrder > oldTierOrder) {
    await xpSystem.awardXP(data.userId, XPSource.TIER_PROMOTION, undefined, undefined, undefined, `Promoted from ${data.oldTier} to ${data.newTier}`);
  }
});

// Listen for redemption code usage
serverEventBus.subscribe(ServerEvents.REDEMPTION_CODE_USED, async (data: { userId: number, codeId: number, xpAmount?: number, xpMultiplier?: number, duration?: number }) => {
  // Award XP if specified
  if (data.xpAmount && data.xpAmount > 0) {
    await xpSystem.awardXP(
      data.userId,
      XPSource.REDEMPTION_CODE,
      data.xpAmount,
      data.codeId
    );
  }
  
  // Apply multiplier if specified
  if (data.xpMultiplier && data.xpMultiplier > 1 && data.duration) {
    await xpSystem.applyXPMultiplier(
      data.userId,
      data.xpMultiplier,
      data.duration
    );
  }
});

// Export event names
export const XPEvents = {
  XP_AWARDED: "xp:awarded",
  LEVEL_UP: "xp:level_up",
  MULTIPLIER_APPLIED: "xp:multiplier_applied"
};