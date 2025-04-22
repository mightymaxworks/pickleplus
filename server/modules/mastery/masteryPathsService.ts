/**
 * CourtIQ™ Mastery Paths Service
 * Provides business logic for the tier-based ranking system
 * 
 * Sprint: PKL-278651-RATE-0004-MADV
 */

import { db } from "../../db";
import { sql, eq, and, or, desc, lt, gt, between } from "drizzle-orm";
import {
  masteryTiers,
  masteryRules,
  playerTierStatus,
  tierProgressions
} from "@shared/courtiq-schema";
import type { 
  MasteryTier,
  MasteryPath, 
  MasteryTierName,
  PlayerTierStatus,
  TierProgression,
  NextTierProgress
} from "@shared/mastery-paths";

export class MasteryPathsService {
  /**
   * Initialize the Mastery Paths system
   * This ensures all tiers are present in the database
   */
  async initialize(): Promise<void> {
    const tiers = await this.getAllTiers();
    
    if (tiers.length === 9) {
      console.log(`Mastery Tiers already initialized (${tiers.length} tiers found)`);
      return;
    }
    
    console.log("Initializing Mastery Tiers...");
    
    // Reset tables if needed
    await db.execute(sql`TRUNCATE mastery_tiers CASCADE`);
    
    // Create Foundation tiers
    await this.createTier({
      name: 'Explorer',
      path: 'Foundation',
      displayName: 'Explorer',
      tagline: 'Beginning the journey',
      minRating: 1000,
      maxRating: 1249,
      colorCode: '#4299E1',
      iconName: 'compass',
      order: 1
    });
    
    await this.createTier({
      name: 'Pathfinder',
      path: 'Foundation',
      displayName: 'Pathfinder',
      tagline: 'Discovering your potential',
      minRating: 1250,
      maxRating: 1499,
      colorCode: '#3182CE',
      iconName: 'map',
      order: 2
    });
    
    await this.createTier({
      name: 'Trailblazer',
      path: 'Foundation',
      displayName: 'Trailblazer',
      tagline: 'Mastering the basics',
      minRating: 1500,
      maxRating: 1749,
      colorCode: '#2B6CB0',
      iconName: 'mountain',
      order: 3
    });
    
    // Create Evolution tiers
    await this.createTier({
      name: 'Challenger',
      path: 'Evolution',
      displayName: 'Challenger',
      tagline: 'Pushing the limits',
      minRating: 1750,
      maxRating: 1999,
      colorCode: '#9F7AEA',
      iconName: 'zap',
      order: 4
    });
    
    await this.createTier({
      name: 'Innovator',
      path: 'Evolution',
      displayName: 'Innovator',
      tagline: 'Creating new possibilities',
      minRating: 2000,
      maxRating: 2249,
      colorCode: '#805AD5',
      iconName: 'lightbulb',
      order: 5
    });
    
    await this.createTier({
      name: 'Tactician',
      path: 'Evolution',
      displayName: 'Tactician',
      tagline: 'Strategic mastermind',
      minRating: 2250,
      maxRating: 2499,
      colorCode: '#6B46C1',
      iconName: 'layout-grid',
      order: 6
    });
    
    // Create Pinnacle tiers
    await this.createTier({
      name: 'Virtuoso',
      path: 'Pinnacle',
      displayName: 'Virtuoso',
      tagline: 'Exceptional talent',
      minRating: 2500,
      maxRating: 2749,
      colorCode: '#F6AD55',
      iconName: 'star',
      order: 7
    });
    
    await this.createTier({
      name: 'Luminary',
      path: 'Pinnacle',
      displayName: 'Luminary',
      tagline: 'Beaming with brilliance',
      minRating: 2750,
      maxRating: 2999,
      colorCode: '#ED8936',
      iconName: 'sun',
      order: 8
    });
    
    await this.createTier({
      name: 'Legend',
      path: 'Pinnacle',
      displayName: 'Legend',
      tagline: 'Immortalized greatness',
      minRating: 3000,
      maxRating: 9999,
      colorCode: '#DD6B20',
      iconName: 'crown',
      order: 9
    });
    
    console.log("Mastery Tiers initialized successfully");
  }
  
  /**
   * Get all mastery tiers
   */
  async getAllTiers(): Promise<MasteryTier[]> {
    const tiers = await db.select().from(masteryTiers).orderBy(masteryTiers.order);
    return tiers;
  }
  
  /**
   * Get tiers for a specific path
   */
  async getTiersByPath(path: MasteryPath): Promise<MasteryTier[]> {
    const tiers = await db
      .select()
      .from(masteryTiers)
      .where(eq(masteryTiers.path, path))
      .orderBy(masteryTiers.order);
    
    return tiers;
  }
  
  /**
   * Get a tier by name
   */
  async getTierByName(name: MasteryTierName): Promise<MasteryTier | undefined> {
    const [tier] = await db
      .select()
      .from(masteryTiers)
      .where(eq(masteryTiers.name, name));
    
    return tier;
  }
  
  /**
   * Create a new tier
   */
  private async createTier(tier: Omit<MasteryTier, 'id' | 'badgeUrl' | 'description'>): Promise<MasteryTier> {
    const [createdTier] = await db
      .insert(masteryTiers)
      .values({
        name: tier.name,
        path: tier.path,
        displayName: tier.displayName,
        tagline: tier.tagline,
        minRating: tier.minRating,
        maxRating: tier.maxRating,
        colorCode: tier.colorCode,
        iconName: tier.iconName,
        order: tier.order,
        badgeUrl: null,
        description: null
      })
      .returning();
    
    return createdTier;
  }
  
  /**
   * Get a player's current tier status
   */
  async getPlayerTierStatus(userId: number): Promise<PlayerTierStatus> {
    // Check if user already has a tier status
    const existingStatus = await db
      .select()
      .from(playerTierStatus)
      .where(eq(playerTierStatus.userId, userId))
      .limit(1);
    
    if (existingStatus.length > 0) {
      return existingStatus[0];
    }
    
    // If no existing status, create one with default rating of 1000
    const rating = 1000;
    
    // Find the tier for this rating
    const tiers = await this.getAllTiers();
    const currentTier = tiers.find(
      tier => rating >= tier.minRating && rating <= tier.maxRating
    ) || tiers[0]; // Default to first tier
    
    // Calculate progress percentage within current tier
    const tierRange = currentTier.maxRating - currentTier.minRating;
    const pointsIntoTier = rating - currentTier.minRating;
    const progressPercent = Math.min(100, Math.max(0, Math.floor((pointsIntoTier / tierRange) * 100)));
    
    // Look up next tier (if not highest)
    const nextTier = tiers.find(tier => tier.order === currentTier.order + 1);
    
    // Find all tiers in same path
    const tiersInPath = tiers.filter(tier => tier.path === currentTier.path);
    const pathProgressPercent = tiersInPath.length > 0 
      ? Math.floor(((currentTier.order - tiersInPath[0].order) / (tiersInPath.length - 1)) * 100)
      : 0;
    
    return {
      userId,
      currentTierId: currentTier.id,
      currentTierName: currentTier.name,
      currentPath: currentTier.path,
      progressPercent,
      pathProgressPercent,
      rating,
      nextTierId: nextTier?.id,
      nextTierName: nextTier?.name,
      pointsToNextTier: nextTier ? nextTier.minRating - rating : 0,
      tierHealth: 'good',
      matchesInTier: 0,
      lastMatch: new Date().toISOString()
    };
  }
  
  /**
   * Process a match result and update player tier
   */
  async processMatchResult(
    userId: number, 
    newRating: number,
    won: boolean
  ): Promise<{
    tierChanged: boolean;
    oldTier?: MasteryTier;
    newTier?: MasteryTier;
    oldPath?: MasteryPath;
    newPath?: MasteryPath;
  }> {
    // In a real implementation, this would update the player's tier
    // based on their new rating and record a progression event
    
    // Simplified mock implementation
    return {
      tierChanged: false
    };
  }
  
  /**
   * Get progress needed for next tier
   */
  async getNextTierProgress(userId: number): Promise<NextTierProgress> {
    const status = await this.getPlayerTierStatus(userId);
    
    return {
      currentTierName: status.currentTierName,
      nextTierName: status.nextTierName || null,
      currentRating: status.rating,
      pointsNeeded: status.pointsToNextTier,
      estimatedMatches: Math.ceil(status.pointsToNextTier / 20),
      progressPercent: status.progressPercent
    };
  }
  
  /**
   * Get players in a specific tier
   */
  async getPlayersByTier(
    tierName: MasteryTierName, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<{ 
    players: Array<{ 
      userId: number; 
      username: string; 
      displayName: string | null;
      avatarUrl: string | null;
      rating: number;
      progressPercent: number;
    }>;
    total: number;
  }> {
    // In a real implementation, this would query the database
    // for players in the specified tier
    
    // Mock implementation
    return {
      players: [],
      total: 0
    };
  }
  
  /**
   * Get a player's tier progression history
   */
  async getPlayerTierProgressions(userId: number): Promise<TierProgression[]> {
    // Mock implementation
    return [];
  }
}