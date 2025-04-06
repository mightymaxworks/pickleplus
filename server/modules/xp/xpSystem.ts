/**
 * XP System Module
 * 
 * This module manages the Experience Points (XP) system, separate from the CourtIQ rating system.
 * XP is earned through platform engagement, match participation, achievements, and social activities.
 * It's used for level progression, feature unlocking, and gamification.
 */

import { db } from "../../db";
import { 
  eq, and, sql, desc, sum, lt, gte, asc, isNull, 
  inArray, or, not, lte 
} from "drizzle-orm";
import { serverEventBus, ServerEvents } from "../../core/events/eventBus";
import { users, activities } from "../../../shared/schema";
import { 
  xpLevels, 
  xpHistory, 
  xpMultipliers, 
  XpLevel, 
  InsertXpLevel, 
  InsertXpHistory, 
  InsertXpMultiplier,
  XpMultiplier
} from "../../../shared/courtiq-schema";
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
  constructor() {}
  
  /**
   * Initialize the XP level structure in the database
   * This only needs to be called once when setting up the system
   */
  async initializeLevelsInDatabase(): Promise<void> {
    // Check if levels already exist
    const existingLevels = await db.select({ count: sql<number>`count(*)` })
      .from(xpLevels)
      .execute();
    
    if (existingLevels[0] && existingLevels[0].count > 0) {
      console.log(`XP levels already initialized (${existingLevels[0].count} levels found)`);
      return;
    }
    
    // Define initial levels (1-49)
    // Levels 50-100 are reserved for future unlocks
    const definedLevels = [
      // Beginner tier (1-10)
      {
        level: 1,
        name: "Paddle Novice",
        minXP: 0,
        maxXP: 99,
        unlocks: ["Basic profile"],
        colorCode: "#8D99AE", // Slate Gray
        description: "Your pickleball journey begins"
      },
      {
        level: 2,
        name: "Court Rookie",
        minXP: 100,
        maxXP: 249,
        unlocks: ["Friend connections"],
        colorCode: "#8D99AE",
        description: "Taking your first steps on the court"
      },
      {
        level: 3,
        name: "Rally Beginner",
        minXP: 250,
        maxXP: 499,
        unlocks: ["Activity feed"],
        colorCode: "#8D99AE",
        description: "Learning the basics of rallies"
      },
      {
        level: 4,
        name: "Serve Starter",
        minXP: 500,
        maxXP: 749,
        unlocks: ["Custom profile picture"],
        colorCode: "#8D99AE",
        description: "Mastering the fundamentals of serving"
      },
      {
        level: 5,
        name: "Dink Dabbler",
        minXP: 750,
        maxXP: 999,
        unlocks: ["Match recording"],
        colorCode: "#8D99AE",
        description: "Getting comfortable with dinking"
      },
      
      // Intermediate tier (6-15)
      {
        level: 10,
        name: "Volley Apprentice",
        minXP: 1000,
        maxXP: 1999,
        unlocks: ["Tournament registration"],
        colorCode: "#2B2D42", // Dark Blue
        description: "Developing more consistent volleys"
      },
      {
        level: 15,
        name: "Kitchen Keeper",
        minXP: 2000,
        maxXP: 3999,
        unlocks: ["Community feed posting"],
        colorCode: "#2B2D42",
        description: "Becoming comfortable at the kitchen line"
      },
      
      // Advanced tier (16-25)
      {
        level: 20,
        name: "Spin Specialist",
        minXP: 4000,
        maxXP: 6999,
        unlocks: ["Match insights", "Advanced statistics"],
        colorCode: "#EF233C", // Red
        description: "Adding spin and variety to your shots"
      },
      {
        level: 25,
        name: "Volley Virtuoso",
        minXP: 7000,
        maxXP: 9999,
        unlocks: ["Custom avatars"],
        colorCode: "#EF233C",
        description: "Mastering the art of volleying"
      },
      
      // Expert tier (26-35)
      {
        level: 30,
        name: "Dink Dynamo",
        minXP: 10000,
        maxXP: 14999,
        unlocks: ["Profile backgrounds"],
        colorCode: "#D90429", // Crimson
        description: "Expert at soft game strategy"
      },
      {
        level: 35,
        name: "Smash Specialist",
        minXP: 15000,
        maxXP: 19999,
        unlocks: ["Coaching access"],
        colorCode: "#D90429",
        description: "Power player with precision"
      },
      
      // Elite tier (36-45)
      {
        level: 40,
        name: "Court Commander",
        minXP: 20000,
        maxXP: 29999,
        unlocks: ["Host tournaments", "Team captain features"],
        colorCode: "#E76F51", // Orange
        description: "Takes control of the court"
      },
      {
        level: 45,
        name: "Pickleball Pro",
        minXP: 30000,
        maxXP: 39999,
        unlocks: ["League commissioner", "Beta feature access"],
        colorCode: "#E76F51",
        description: "Playing at a professional level"
      },
      
      // Champion tier (46-49)
      {
        level: 49,
        name: "Legendary Competitor",
        minXP: 40000,
        maxXP: 49999,
        unlocks: ["Community moderator", "Feature input panel"],
        colorCode: "#F4A261", // Sandy
        description: "A force to be reckoned with on any court"
      }
    ];
    
    // Create a placeholder for future levels (50-100)
    const futureLevels = [];
    for (let i = 50; i <= 100; i++) {
      futureLevels.push({
        level: i,
        name: i == 100 ? "Grandmaster" : `Level ${i}`,
        minXP: 50000 + (i - 50) * 2000, // Increment by 2000 XP per level
        maxXP: 50000 + (i - 50 + 1) * 2000 - 1,
        unlocks: ["Coming soon"],
        colorCode: i == 100 ? "#540D6E" : "#264653", // Special color for level 100
        description: i == 100 ? "The ultimate achievement in Pickle+" : "Higher level with more to come"
      });
    }
    
    // Combine all levels
    const allLevels = [...definedLevels, ...futureLevels];
    
    // Insert all levels into the database
    try {
      for (const level of allLevels) {
        await db.insert(xpLevels).values({
          level: level.level,
          name: level.name,
          minXP: level.minXP,
          maxXP: level.maxXP,
          colorCode: level.colorCode,
          description: level.description,
          unlocks: level.unlocks
        });
      }
      console.log(`Initialized ${allLevels.length} XP levels in the database`);
    } catch (error) {
      console.error("Error initializing XP levels:", error);
      throw error;
    }
  }
  
  /**
   * Award XP to a user for an activity
   * @param userId User ID
   * @param source XP source type
   * @param amount Optional override amount (if not using default)
   * @param sourceId Optional related entity ID (match, tournament, etc.)
   * @param multiplier Optional XP multiplier (percentage, 100 = 1.0x)
   * @param notes Optional notes
   */
  async awardXP(
    userId: number,
    source: XPSource | string,
    amount?: number,
    sourceId?: number,
    multiplier: number = 100, // Store as percentage (100 = 1.0x)
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
    
    // Check for active multipliers in the database
    const activeMultipliers = await db.query.xpMultipliers.findMany({
      where: and(
        eq(xpMultipliers.userId, userId),
        eq(xpMultipliers.isActive, true),
        or(
          isNull(xpMultipliers.endDate),
          gte(xpMultipliers.endDate, new Date())
        )
      )
    });
    
    // Apply all stackable multipliers and the highest non-stackable one
    let totalMultiplier = multiplier; // Base multiplier (100 = 1.0x)
    let highestNonStackable = 0;
    
    activeMultipliers.forEach((m: XpMultiplier) => {
      if (m.stackable) {
        // Stackable multipliers are applied multiplicatively
        totalMultiplier = Math.round(totalMultiplier * m.value / 100);
      } else if (m.value > highestNonStackable) {
        // For non-stackable, use only the highest
        highestNonStackable = m.value;
      }
    });
    
    // Apply the highest non-stackable multiplier if it's better than the current total
    if (highestNonStackable > totalMultiplier) {
      totalMultiplier = highestNonStackable;
    }
    
    // Calculate final XP amount with multiplier
    const multipliedXP = Math.round(xpAmount * totalMultiplier / 100);
    
    // Check daily caps if applicable
    if (DAILY_CAPS[source as XPSource]) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calculate XP earned from this source today via XP history
      const todayXP = await db.select({
        total: sum(xpHistory.amount)
      })
      .from(xpHistory)
      .where(
        and(
          eq(xpHistory.userId, userId),
          eq(xpHistory.source, source),
          sql`DATE(${xpHistory.createdAt}) = CURRENT_DATE`
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
      if (alreadyEarned + multipliedXP > cap) {
        xpAmount = Math.floor((cap - alreadyEarned) * 100 / totalMultiplier); // Adjust base amount
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
    const newXP = oldXP + multipliedXP;
    
    // Determine new level based on XP
    const newLevel = await this.getLevelFromXP(newXP);
    const levelUp = newLevel > oldLevel;
    
    // Get level details for history record
    const levelDetails = levelUp ? await this.getLevelDetails(newLevel) : null;
    
    // Create XP history record
    await db.insert(xpHistory).values({
      userId,
      amount: multipliedXP,
      source,
      sourceId,
      multiplier: totalMultiplier,
      newTotal: newXP,
      newLevel,
      wasLevelUp: levelUp,
      notes,
      metadata: {
        oldLevel,
        baseAmount: xpAmount,
        newUnlocks: levelUp ? levelDetails?.unlocks : []
      }
    });
    
    // For compatibility with existing code, also create activity record
    await db.insert(activities).values({
      userId,
      type: source as string,
      description: notes || `Earned ${multipliedXP} XP from ${source}`,
      xpEarned: multipliedXP,
      metadata: {
        sourceId,
        multiplier: totalMultiplier,
        wasLevelUp: levelUp
      }
    });
    
    // Update user's XP and level
    await db.update(users)
      .set({
        xp: newXP,
        level: newLevel
      })
      .where(eq(users.id, userId));
    
    // Fire events
    await serverEventBus.publish(XPEvents.XP_AWARDED, {
      userId,
      source,
      amount: multipliedXP,
      baseAmount: xpAmount,
      multiplier: totalMultiplier,
      newTotal: newXP
    });
    
    if (levelUp) {
      await serverEventBus.publish(XPEvents.LEVEL_UP, {
        userId,
        oldLevel,
        newLevel,
        unlocks: levelDetails?.unlocks || []
      });
    }
    
    return {
      xpAwarded: multipliedXP,
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
    // Calculate end date
    const now = new Date();
    const endDate = new Date(now.getTime() + (durationHours * 60 * 60 * 1000));
    
    // Store multiplier in database
    const multiplierPercent = Math.round(multiplier * 100); // Convert to percentage value
    await db.insert(xpMultipliers).values({
      userId,
      value: multiplierPercent,
      reason: "redemption_code",
      startDate: now,
      endDate,
      isActive: true,
      stackable: false, // Default to non-stackable
      notes: `${multiplier}x XP Multiplier for ${durationHours} hours`
    });
    
    // Log and fire event
    console.log(`Applied ${multiplier}x XP multiplier for user ${userId} for ${durationHours} hours (until ${endDate.toISOString()})`);
    
    await serverEventBus.publish(XPEvents.MULTIPLIER_APPLIED, {
      userId,
      multiplier: multiplierPercent,
      durationHours,
      startDate: now,
      expiresAt: endDate
    });
    
    // Schedule a cleanup of expired multipliers
    this.cleanupExpiredMultipliers();
  }
  
  /**
   * Apply a permanent XP multiplier
   * @param userId User ID
   * @param multiplier XP multiplier value
   * @param reason Reason for the multiplier (e.g., "founding_member")
   * @param notes Additional notes about the multiplier
   * @param stackable Whether this multiplier can stack with others
   * @param sourceId Optional ID of the source (code ID, etc.)
   */
  async applyPermanentXPMultiplier(
    userId: number, 
    multiplier: number, 
    reason: string, 
    notes?: string,
    stackable: boolean = true,
    sourceId?: number
  ): Promise<void> {
    // Store permanent multiplier in database (no end date)
    const multiplierPercent = Math.round(multiplier * 100); // Convert to percentage value
    await db.insert(xpMultipliers).values({
      userId,
      value: multiplierPercent,
      reason,
      sourceId,
      startDate: new Date(),
      endDate: null, // Null end date indicates permanent
      isActive: true,
      stackable,
      notes: notes || `Permanent ${multiplier}x XP multiplier from ${reason}`
    });
    
    // Log and fire event
    console.log(`Applied permanent ${multiplier}x XP multiplier for user ${userId} from ${reason}`);
    
    await serverEventBus.publish(XPEvents.MULTIPLIER_APPLIED, {
      userId,
      multiplier: multiplierPercent,
      permanent: true,
      reason,
      stackable
    });
  }
  
  /**
   * Deactivate a specific multiplier
   * @param id Multiplier ID
   */
  async deactivateMultiplier(id: number): Promise<void> {
    await db.update(xpMultipliers)
      .set({ isActive: false })
      .where(eq(xpMultipliers.id, id));
  }
  
  /**
   * Get active multipliers for a user
   * @param userId User ID
   */
  async getUserMultipliers(userId: number): Promise<XpMultiplier[]> {
    return await db.query.xpMultipliers.findMany({
      where: and(
        eq(xpMultipliers.userId, userId),
        eq(xpMultipliers.isActive, true)
      ),
      orderBy: [desc(xpMultipliers.value)]
    });
  }
  
  /**
   * Clean up expired multipliers (mark them inactive)
   */
  async cleanupExpiredMultipliers(): Promise<void> {
    const now = new Date();
    
    // Update all expired multipliers to inactive
    await db.update(xpMultipliers)
      .set({ isActive: false })
      .where(
        and(
          eq(xpMultipliers.isActive, true),
          lt(xpMultipliers.endDate, now),
          // Only update those with an actual end date (not permanent ones)
          not(isNull(xpMultipliers.endDate))
        )
      );
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
    color: string;
    description: string;
    recentXP: { 
      amount: number; 
      source: string; 
      date: Date;
    }[];
    activeMultipliers: {
      value: number;
      source: string;
      description: string;
      expiresAt: Date | null;
    }[];
  }> {
    // Get user information
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { xp: true, level: true }
    });
    
    if (!user) {
      throw new Error(`User not found with ID ${userId}`);
    }
    
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    
    // Get current level details
    const levelDetails = await this.getLevelDetails(currentLevel);
    
    // Get next level details (if there is one)
    const nextLevel = currentLevel + 1;
    const nextLevelDetails = await db.query.xpLevels.findFirst({
      where: eq(xpLevels.level, nextLevel)
    });
    
    // Calculate next level XP target
    const nextLevelXP = nextLevelDetails ? nextLevelDetails.minXP : levelDetails.maxXP + 1;
    
    // Calculate progress to next level (0-100%)
    const levelStartXP = levelDetails.minXP;
    const xpInCurrentLevel = currentXP - levelStartXP;
    const totalXPForLevel = nextLevelXP - levelStartXP;
    
    const progress = Math.min(Math.round((xpInCurrentLevel / totalXPForLevel) * 100), 100);
    
    // Get recent XP history (last 5 entries)
    const recentXP = await db.query.xpHistory.findMany({
      where: eq(xpHistory.userId, userId),
      orderBy: [desc(xpHistory.createdAt)],
      limit: 5
    });
    
    // Get active multipliers
    const multipliers = await this.getUserMultipliers(userId);
    
    return {
      currentLevel,
      currentXP,
      nextLevelXP,
      progress,
      levelName: levelDetails.name,
      unlocks: levelDetails.unlocks as string[],
      color: levelDetails.colorCode || '#FF5722', // Default to system orange if no color
      description: levelDetails.description || '',
      recentXP: recentXP.map((xp) => ({
        amount: xp.amount,
        source: xp.source,
        date: xp.createdAt as Date
      })),
      activeMultipliers: multipliers.map(m => ({
        value: m.value,
        source: m.reason,
        description: m.notes || '',
        expiresAt: m.endDate
      }))
    };
  }
  
  /**
   * Determine level from XP amount
   * @param xp XP total
   */
  async getLevelFromXP(xp: number): Promise<number> {
    // Find the appropriate level based on XP value
    const level = await db.query.xpLevels.findFirst({
      where: and(
        lte(xpLevels.minXP, xp),
        gte(xpLevels.maxXP, xp)
      )
    });
    
    if (level) {
      return level.level;
    }
    
    // If no level found for some reason, find the highest level
    const highestLevel = await db.query.xpLevels.findFirst({
      orderBy: [desc(xpLevels.level)],
      limit: 1
    });
    
    return highestLevel?.level || 1; // Default to level 1 if no levels found
  }
  
  /**
   * Get level details from the database
   * @param level Level number
   */
  async getLevelDetails(level: number): Promise<XpLevel> {
    const levelDetails = await db.query.xpLevels.findFirst({
      where: eq(xpLevels.level, level)
    });
    
    if (!levelDetails) {
      // Fallback to first level if not found
      const firstLevel = await db.query.xpLevels.findFirst({
        where: eq(xpLevels.level, 1)
      });
      
      if (!firstLevel) {
        throw new Error("No XP levels defined in database");
      }
      
      return firstLevel;
    }
    
    return levelDetails;
  }
  
  /**
   * Get all XP levels from the database
   */
  async getAllLevels(): Promise<XpLevel[]> {
    return await db.query.xpLevels.findMany({
      orderBy: [asc(xpLevels.level)]
    });
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