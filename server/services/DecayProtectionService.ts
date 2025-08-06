/**
 * Decay Protection Service - Professional Tier Enhanced Weighting
 * 
 * Implements tier-specific tournament weighting for activity-responsive decay protection
 * 
 * Features:
 * - Standard Tiers: Tournament 2x, League 1.5x, Casual 1x
 * - Professional Tier: Tournament 3x, League 2x, Casual 0.75x
 * - Activity thresholds: 4+ weighted matches = no decay
 * - Seasonal adjustments for holidays
 * 
 * @framework Framework5.3 
 * @version 1.0.0 - FINALIZED WITH PROFESSIONAL ENHANCED WEIGHTING
 * @lastModified 2025-08-06
 */

import { db } from "../db";
import { users, matches, type User } from "@shared/schema";
import { eq, sql, gte, and, desc } from "drizzle-orm";

export interface PlayerTier {
  name: 'recreational' | 'competitive' | 'elite' | 'professional';
  pointsMin: number;
  pointsMax: number | null;
  baseDecayRate: number; // Weekly decay percentage
  holidayDecayRate: number; // Reduced rate during major holidays
}

export interface MatchWeighting {
  tournament: number;
  league: number;
  casual: number;
}

export interface ActivityLevel {
  weightedMatches: number;
  decayRate: number; // As percentage of base tier rate
  description: string;
}

export class DecayProtectionService {

  /**
   * Player tier definitions with decay rates
   */
  private static readonly PLAYER_TIERS: PlayerTier[] = [
    {
      name: 'recreational',
      pointsMin: 0,
      pointsMax: 300,
      baseDecayRate: 1.0,
      holidayDecayRate: 0.0 // No decay during holidays
    },
    {
      name: 'competitive', 
      pointsMin: 300,
      pointsMax: 1000,
      baseDecayRate: 2.0,
      holidayDecayRate: 0.0 // No decay during holidays
    },
    {
      name: 'elite',
      pointsMin: 1000,
      pointsMax: 1800,
      baseDecayRate: 5.0,
      holidayDecayRate: 2.5 // Reduced decay during holidays
    },
    {
      name: 'professional',
      pointsMin: 1800,
      pointsMax: null,
      baseDecayRate: 7.0,
      holidayDecayRate: 3.5 // Reduced decay during holidays
    }
  ];

  /**
   * Match weighting by tier
   */
  private static readonly MATCH_WEIGHTING: Record<string, MatchWeighting> = {
    standard: {
      tournament: 2.0,
      league: 1.5,
      casual: 1.0
    },
    professional: {
      tournament: 3.0,
      league: 2.0,
      casual: 0.75
    }
  };

  /**
   * Activity level thresholds
   */
  private static readonly ACTIVITY_LEVELS: ActivityLevel[] = [
    {
      weightedMatches: 4,
      decayRate: 0.0, // No decay
      description: 'High Activity'
    },
    {
      weightedMatches: 2,
      decayRate: 0.5, // 50% of tier decay rate  
      description: 'Moderate Activity'
    },
    {
      weightedMatches: 1,
      decayRate: 0.75, // 75% of tier decay rate
      description: 'Low Activity'
    },
    {
      weightedMatches: 0,
      decayRate: 1.0, // Full tier decay rate
      description: 'Inactive'
    }
  ];

  /**
   * Major holidays where decay is reduced/eliminated
   */
  private static readonly MAJOR_HOLIDAYS = [
    { start: '12-20', end: '01-05' }, // Christmas/New Year period
    { start: '03-25', end: '04-05' }, // Easter period (approximate)
  ];

  /**
   * Determine player tier based on ranking points
   */
  static getPlayerTier(rankingPoints: number): PlayerTier {
    for (const tier of this.PLAYER_TIERS.reverse()) {
      if (rankingPoints >= tier.pointsMin && (tier.pointsMax === null || rankingPoints <= tier.pointsMax)) {
        return tier;
      }
    }
    return this.PLAYER_TIERS[0]; // Default to recreational
  }

  /**
   * Get match weighting based on player tier
   */
  static getMatchWeighting(tier: PlayerTier): MatchWeighting {
    return tier.name === 'professional' 
      ? this.MATCH_WEIGHTING.professional
      : this.MATCH_WEIGHTING.standard;
  }

  /**
   * Calculate weighted match count for a player's recent activity
   */
  static async calculateWeightedActivity(
    userId: number,
    daysBack: number = 30
  ): Promise<{
    weightedMatches: number;
    breakdown: {
      tournament: { count: number; weighted: number };
      league: { count: number; weighted: number };
      casual: { count: number; weighted: number };
    };
    tier: PlayerTier;
  }> {
    
    // Get user's current tier
    const user = await db.query.users.findFirst({ 
      where: eq(users.id, userId),
      columns: { rankingPoints: true }
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    const tier = this.getPlayerTier(user.rankingPoints || 0);
    const weighting = this.getMatchWeighting(tier);

    // Get recent matches
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const recentMatches = await db.query.matches.findMany({
      where: and(
        eq(matches.playerId, userId),
        gte(matches.createdAt, cutoffDate)
      ),
      columns: { matchType: true }
    });

    // Calculate weighted totals
    const breakdown = {
      tournament: { count: 0, weighted: 0 },
      league: { count: 0, weighted: 0 },
      casual: { count: 0, weighted: 0 }
    };

    for (const match of recentMatches) {
      const matchType = match.matchType as keyof MatchWeighting;
      if (matchType in breakdown) {
        breakdown[matchType].count++;
        breakdown[matchType].weighted += weighting[matchType];
      }
    }

    const weightedMatches = breakdown.tournament.weighted + 
                          breakdown.league.weighted + 
                          breakdown.casual.weighted;

    return {
      weightedMatches,
      breakdown,
      tier
    };
  }

  /**
   * Calculate decay rate for a player based on activity and tier
   */
  static async calculateDecayRate(userId: number): Promise<{
    effectiveDecayRate: number;
    activityLevel: ActivityLevel;
    tier: PlayerTier;
    isHolidayPeriod: boolean;
    breakdown: {
      baseRate: number;
      activityAdjustment: number;
      holidayAdjustment: boolean;
      finalRate: number;
    };
  }> {
    
    const activity = await this.calculateWeightedActivity(userId);
    const tier = activity.tier;

    // Determine activity level
    let activityLevel = this.ACTIVITY_LEVELS[this.ACTIVITY_LEVELS.length - 1]; // Default to inactive
    for (const level of this.ACTIVITY_LEVELS) {
      if (activity.weightedMatches >= level.weightedMatches) {
        activityLevel = level;
        break;
      }
    }

    // Check if currently in holiday period
    const isHolidayPeriod = this.isCurrentlyHolidayPeriod();
    
    // Calculate effective decay rate
    const baseRate = isHolidayPeriod ? tier.holidayDecayRate : tier.baseDecayRate;
    const activityAdjustedRate = baseRate * activityLevel.decayRate;
    
    return {
      effectiveDecayRate: activityAdjustedRate,
      activityLevel,
      tier,
      isHolidayPeriod,
      breakdown: {
        baseRate: tier.baseDecayRate,
        activityAdjustment: activityLevel.decayRate,
        holidayAdjustment: isHolidayPeriod,
        finalRate: activityAdjustedRate
      }
    };
  }

  /**
   * Check if current date falls within major holiday periods
   */
  private static isCurrentlyHolidayPeriod(): boolean {
    const now = new Date();
    const currentMonthDay = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    
    for (const holiday of this.MAJOR_HOLIDAYS) {
      // Handle year-spanning holidays (like Christmas/New Year)
      if (holiday.start > holiday.end) {
        if (currentMonthDay >= holiday.start || currentMonthDay <= holiday.end) {
          return true;
        }
      } else {
        if (currentMonthDay >= holiday.start && currentMonthDay <= holiday.end) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Apply weekly decay to all eligible players
   */
  static async processWeeklyDecay(): Promise<{
    playersProcessed: number;
    totalPointsDecayed: number;
    tierBreakdown: Record<string, { players: number; pointsDecayed: number }>;
  }> {
    
    const allUsers = await db.query.users.findMany({
      where: sql`${users.rankingPoints} > 0`,
      columns: { id: true, rankingPoints: true }
    });

    const tierBreakdown: Record<string, { players: number; pointsDecayed: number }> = {};
    let playersProcessed = 0;
    let totalPointsDecayed = 0;

    for (const user of allUsers) {
      // Check if decay should be applied (weekly interval)
      // For now, apply decay to all users. In production, add lastDecayDate field to users schema
      const daysSinceDecay = 7; // Force weekly decay for testing

      const decayInfo = await this.calculateDecayRate(user.id);
      const pointsToDecay = Math.floor((user.rankingPoints || 0) * (decayInfo.effectiveDecayRate / 100));
      
      if (pointsToDecay > 0) {
        // Apply decay
        await db.update(users)
          .set({
            rankingPoints: sql`${users.rankingPoints} - ${pointsToDecay}`
            // TODO: Add lastDecayDate field to users schema
          })
          .where(eq(users.id, user.id));

        // Track statistics
        const tierName = decayInfo.tier.name;
        if (!tierBreakdown[tierName]) {
          tierBreakdown[tierName] = { players: 0, pointsDecayed: 0 };
        }
        
        tierBreakdown[tierName].players++;
        tierBreakdown[tierName].pointsDecayed += pointsToDecay;
        totalPointsDecayed += pointsToDecay;
        playersProcessed++;
      }
    }

    return {
      playersProcessed,
      totalPointsDecayed,
      tierBreakdown
    };
  }

  /**
   * Get decay protection status for a user
   */
  static async getProtectionStatus(userId: number): Promise<{
    isProtected: boolean;
    daysUntilDecay: number;
    currentDecayRate: number;
    activitySummary: string;
    recommendations: string[];
  }> {
    
    const decayInfo = await this.calculateDecayRate(userId);
    const activity = await this.calculateWeightedActivity(userId);
    
    const isProtected = decayInfo.effectiveDecayRate === 0;
    
    // Calculate days until next decay
    // TODO: Add lastDecayDate field to users schema for accurate calculation
    const daysUntilDecay = 7; // Default weekly cycle for now
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (!isProtected) {
      if (activity.tier.name === 'professional') {
        recommendations.push(`Play ${Math.ceil((4 - activity.weightedMatches) / 3)} more tournaments for full protection`);
        recommendations.push(`Or play ${Math.ceil((4 - activity.weightedMatches) / 2)} more league matches`);
      } else {
        recommendations.push(`Play ${Math.ceil((4 - activity.weightedMatches) / 2)} more tournaments for full protection`);
        recommendations.push(`Or play ${Math.ceil((4 - activity.weightedMatches) / 1.5)} more league matches`);
      }
    }
    
    const activitySummary = `${decayInfo.activityLevel.description} (${activity.weightedMatches.toFixed(1)} weighted matches)`;
    
    return {
      isProtected,
      daysUntilDecay,
      currentDecayRate: decayInfo.effectiveDecayRate,
      activitySummary,
      recommendations
    };
  }
}