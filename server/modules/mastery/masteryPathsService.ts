/**
 * CourtIQ™ Mastery Paths Service
 * Provides business logic for tier management, promotion/demotion, and player tier status
 * 
 * Sprint: PKL-278651-RATE-0004-MADV
 */

import { db } from "../../db";
import { eq, and, gte, lte, desc, asc, sql, count } from "drizzle-orm";
import { 
  masteryTiers,
  masteryRules,
  playerTierStatus,
  tierProgressions,
  MasteryTier,
  MasteryRule,
  PlayerTierStatus as DbPlayerTierStatus,
  InsertPlayerTierStatus,
  InsertTierProgression
} from "../../../shared/courtiq-schema";
import { users } from "../../../shared/schema";
import { 
  MasteryTierName, 
  MasteryPath, 
  PlayerTierStatus,
  TierProgressionEntry,
  TIER_RATING_RANGES 
} from "../../../shared/mastery-paths";
import { initializeMasteryTiers } from "./initMasteryTiers";

/**
 * Convert from internal rating scale (1000-2500) to display scale (0-9)
 */
function convertRatingToDisplayScale(rating: number): number {
  // Convert from 1000-2500 scale to 0-5 scale
  const zeroToFive = (rating - 1000) / 300;
  // Convert from 0-5 scale to 0-9 scale
  return parseFloat((zeroToFive * 1.8).toFixed(1));
}

/**
 * Convert from display scale (0-9) to internal scale (1000-2500)
 */
function convertRatingToInternalScale(rating: number): number {
  // Convert from 0-9 scale to 0-5 scale
  const zeroToFive = rating / 1.8;
  // Convert from 0-5 scale to 1000-2500 scale
  return Math.round(1000 + (zeroToFive * 300));
}

/**
 * Main service class for Mastery Paths
 */
export class MasteryPathsService {
  constructor() {}
  
  /**
   * Initialize the Mastery Paths system
   */
  async initialize(): Promise<void> {
    await initializeMasteryTiers();
  }
  
  /**
   * Get all mastery tiers
   */
  async getAllTiers(): Promise<MasteryTier[]> {
    const tiers = await db.select().from(masteryTiers)
      .orderBy(asc(masteryTiers.order))
      .execute();
    return tiers;
  }
  
  /**
   * Get tiers for a specific path
   */
  async getTiersByPath(path: MasteryPath): Promise<MasteryTier[]> {
    const tiers = await db.select().from(masteryTiers)
      .where(eq(masteryTiers.path, path))
      .orderBy(asc(masteryTiers.order))
      .execute();
    return tiers;
  }
  
  /**
   * Get a tier by name
   */
  async getTierByName(name: MasteryTierName): Promise<MasteryTier | null> {
    const tier = await db.select().from(masteryTiers)
      .where(eq(masteryTiers.name, name))
      .execute();
    return tier.length > 0 ? tier[0] : null;
  }
  
  /**
   * Get the tier for a specific rating
   */
  async getTierForRating(rating: number): Promise<MasteryTier | null> {
    // Convert to internal scale if in display scale (0-9)
    const internalRating = rating < 100 ? convertRatingToInternalScale(rating) : rating;
    
    const tier = await db.select().from(masteryTiers)
      .where(
        and(
          lte(masteryTiers.minRating, internalRating),
          gte(masteryTiers.maxRating, internalRating)
        )
      )
      .execute();
    
    return tier.length > 0 ? tier[0] : null;
  }
  
  /**
   * Get tier rules for a specific tier
   */
  async getTierRules(tierId: number): Promise<MasteryRule | null> {
    const rules = await db.select().from(masteryRules)
      .where(eq(masteryRules.tierId, tierId))
      .execute();
    
    return rules.length > 0 ? rules[0] : null;
  }
  
  /**
   * Get the player's current tier status
   */
  async getPlayerTierStatus(userId: number): Promise<PlayerTierStatus | null> {
    // First get the database record
    const dbStatus = await db.select({
      playerStatus: playerTierStatus,
      tier: masteryTiers,
      rules: masteryRules
    }).from(playerTierStatus)
    .innerJoin(
      masteryTiers, 
      eq(playerTierStatus.tierId, masteryTiers.id)
    )
    .leftJoin(
      masteryRules,
      eq(masteryTiers.id, masteryRules.tierId)
    )
    .where(eq(playerTierStatus.userId, userId))
    .execute();
    
    if (dbStatus.length === 0) {
      return null;
    }
    
    const status = dbStatus[0];
    
    // Get global rank
    const globalRankData = await this.getPlayerGlobalRank(userId);
    
    // Get tier rank
    const tierRankData = await this.getPlayerTierRank(userId, status.tier.id);
    
    // Calculate days in tier
    const daysSinceJoined = status.playerStatus.joinedTierAt 
      ? Math.floor((Date.now() - status.playerStatus.joinedTierAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Calculate promotion progress
    const promotionProgress = status.rules
      ? (status.playerStatus.matchesAboveThreshold / status.rules.promotionMatchesRequired) * 100
      : 0;
    
    // Calculate demotion risk
    const demotionRisk = status.rules && status.rules.demotionMatchesRequired > 0
      ? (status.playerStatus.matchesBelowThreshold / status.rules.demotionMatchesRequired) * 100
      : 0;
    
    // Calculate tier health (inverse of demotion risk, factoring grace period)
    const tierHealth = status.playerStatus.gracePeriodRemainingMatches > 0
      ? 100 // Full health during grace period
      : Math.max(0, 100 - demotionRisk);
    
    // Calculate progress to next tier
    // This is based on the relative position within the current tier's rating range
    const tierRatingRange = status.tier.maxRating - status.tier.minRating;
    const playerPositionInTier = status.playerStatus.rating - status.tier.minRating;
    const progressToNextTier = Math.min(100, Math.round((playerPositionInTier / tierRatingRange) * 100));
    
    // Convert to shared type
    return {
      userId: userId,
      currentTier: status.tier.name as MasteryTierName,
      currentPath: status.tier.path as MasteryPath,
      rating: convertRatingToDisplayScale(status.playerStatus.rating),
      globalRank: globalRankData.rank,
      tierRank: tierRankData.rank,
      progressToNextTier,
      tierHealth,
      matchesInTier: status.playerStatus.matchesInTier,
      daysInTier: daysSinceJoined,
      promotionProgress,
      demotionRisk,
      gracePeriodRemaining: status.playerStatus.gracePeriodRemainingMatches,
      features: status.rules?.features || []
    };
  }
  
  /**
   * Get a player's global rank
   */
  async getPlayerGlobalRank(userId: number): Promise<{ rank: number; total: number }> {
    // First count total number of players
    const totalPlayers = await db.select({ count: count() }).from(playerTierStatus).execute();
    
    // Get all players ordered by rating
    const players = await db.select({
      userId: playerTierStatus.userId,
      rating: playerTierStatus.rating
    })
    .from(playerTierStatus)
    .orderBy(desc(playerTierStatus.rating))
    .execute();
    
    // Find the player's position
    const playerIndex = players.findIndex(p => p.userId === userId);
    
    if (playerIndex === -1) {
      return { rank: 0, total: totalPlayers[0]?.count || 0 };
    }
    
    return { 
      rank: playerIndex + 1, 
      total: totalPlayers[0]?.count || 0 
    };
  }
  
  /**
   * Get a player's rank within their current tier
   */
  async getPlayerTierRank(userId: number, tierId: number): Promise<{ rank: number; total: number }> {
    // First count total number of players in this tier
    const totalInTier = await db.select({ count: count() })
      .from(playerTierStatus)
      .where(eq(playerTierStatus.tierId, tierId))
      .execute();
    
    // Get all players in this tier ordered by rating
    const players = await db.select({
      userId: playerTierStatus.userId,
      rating: playerTierStatus.rating
    })
    .from(playerTierStatus)
    .where(eq(playerTierStatus.tierId, tierId))
    .orderBy(desc(playerTierStatus.rating))
    .execute();
    
    // Find the player's position
    const playerIndex = players.findIndex(p => p.userId === userId);
    
    if (playerIndex === -1) {
      return { rank: 0, total: totalInTier[0]?.count || 0 };
    }
    
    return { 
      rank: playerIndex + 1, 
      total: totalInTier[0]?.count || 0 
    };
  }
  
  /**
   * Initialize or update a player's tier status based on their rating
   */
  async createOrUpdatePlayerTierStatus(userId: number, rating: number): Promise<PlayerTierStatus | null> {
    // Convert to internal scale if in display scale (0-9)
    const internalRating = rating < 100 ? convertRatingToInternalScale(rating) : rating;
    
    // Find the proper tier for this rating
    const tier = await this.getTierForRating(internalRating);
    
    if (!tier) {
      console.error(`No tier found for rating ${rating} (internal: ${internalRating})`);
      return null;
    }
    
    // Check if player already has a tier status
    const existingStatus = await db.select().from(playerTierStatus)
      .where(eq(playerTierStatus.userId, userId))
      .execute();
    
    // Get tier rules
    const rules = await this.getTierRules(tier.id);
    
    if (existingStatus.length === 0) {
      // Create new tier status
      const newStatus: InsertPlayerTierStatus = {
        userId,
        tierId: tier.id,
        rating: internalRating,
        matchesInTier: 0,
        matchesAboveThreshold: 0,
        matchesBelowThreshold: 0,
        gracePeriodRemainingMatches: rules?.demotionGracePeriod || 0
      };
      
      await db.insert(playerTierStatus).values(newStatus).execute();
      
      // Return the full status
      return this.getPlayerTierStatus(userId);
    } else {
      // Check if tier has changed
      const currentStatus = existingStatus[0];
      const oldTierId = currentStatus.tierId;
      
      if (oldTierId !== tier.id) {
        // Tier has changed - record progression
        await this.recordTierProgression(
          userId,
          oldTierId,
          tier.id,
          internalRating,
          internalRating > currentStatus.rating ? 'promotion' : 'demotion'
        );
        
        // Update tier status
        await db.update(playerTierStatus)
          .set({
            tierId: tier.id,
            rating: internalRating,
            matchesInTier: 0, // Reset match count in new tier
            matchesAboveThreshold: 0, // Reset promotion counters
            matchesBelowThreshold: 0, // Reset demotion counters
            gracePeriodRemainingMatches: rules?.demotionGracePeriod || 0, // Set grace period
            joinedTierAt: new Date(), // Reset join date
            updatedAt: new Date()
          })
          .where(eq(playerTierStatus.userId, userId))
          .execute();
      } else {
        // Same tier, just update rating
        await db.update(playerTierStatus)
          .set({
            rating: internalRating,
            updatedAt: new Date()
          })
          .where(eq(playerTierStatus.userId, userId))
          .execute();
      }
      
      // Return the updated status
      return this.getPlayerTierStatus(userId);
    }
  }
  
  /**
   * Record a tier progression (promotion or demotion)
   */
  async recordTierProgression(
    userId: number,
    oldTierId: number,
    newTierId: number,
    rating: number,
    reason: 'promotion' | 'demotion' | 'season_reset' | 'manual_adjustment',
    matchId?: number
  ): Promise<void> {
    const progression: InsertTierProgression = {
      userId,
      oldTierId,
      newTierId,
      ratingAtProgression: rating,
      reason,
      matchId
    };
    
    await db.insert(tierProgressions).values(progression).execute();
  }
  
  /**
   * Get tier progression history for a player
   */
  async getPlayerTierProgressions(userId: number): Promise<TierProgressionEntry[]> {
    const progressions = await db.select({
      progression: tierProgressions,
      oldTier: {
        id: masteryTiers.id,
        name: masteryTiers.name,
        path: masteryTiers.path
      }
    })
    .from(tierProgressions)
    .innerJoin(
      masteryTiers,
      eq(tierProgressions.oldTierId, masteryTiers.id)
    )
    .where(eq(tierProgressions.userId, userId))
    .orderBy(desc(tierProgressions.createdAt))
    .execute();
    
    const progressionWithNewTier = await Promise.all(progressions.map(async (p) => {
      // Get new tier info
      const newTier = await db.select()
        .from(masteryTiers)
        .where(eq(masteryTiers.id, p.progression.newTierId))
        .execute();
      
      return {
        id: p.progression.id,
        userId: p.progression.userId,
        oldTier: p.oldTier.name as MasteryTierName,
        newTier: newTier[0].name as MasteryTierName,
        oldPath: p.oldTier.path as MasteryPath,
        newPath: newTier[0].path as MasteryPath,
        ratingAtProgression: convertRatingToDisplayScale(p.progression.ratingAtProgression),
        reason: p.progression.reason as 'promotion' | 'demotion' | 'season_reset' | 'manual_adjustment',
        matchId: p.progression.matchId || undefined, // Convert null to undefined
        createdAt: p.progression.createdAt || new Date().toISOString()
      };
    }));
    
    return progressionWithNewTier;
  }
  
  /**
   * Process a match result and update tier status
   */
  async processMatchResult(userId: number, newRating: number, won: boolean): Promise<{
    tierChanged: boolean;
    oldTier?: MasteryTierName;
    newTier?: MasteryTierName;
    oldPath?: MasteryPath;
    newPath?: MasteryPath;
  }> {
    // Get player's current tier status
    const status = await db.select({
      playerStatus: playerTierStatus,
      tier: masteryTiers,
      rules: masteryRules
    }).from(playerTierStatus)
    .innerJoin(
      masteryTiers, 
      eq(playerTierStatus.tierId, masteryTiers.id)
    )
    .leftJoin(
      masteryRules,
      eq(masteryTiers.id, masteryRules.tierId)
    )
    .where(eq(playerTierStatus.userId, userId))
    .execute();
    
    if (status.length === 0) {
      // No existing status, create one
      await this.createOrUpdatePlayerTierStatus(userId, newRating);
      return { tierChanged: false };
    }
    
    const currentStatus = status[0];
    
    // Convert to internal scale if in display scale (0-9)
    const internalRating = newRating < 100 ? convertRatingToInternalScale(newRating) : newRating;
    
    // Check if new rating puts player in a different tier
    const newTier = await this.getTierForRating(internalRating);
    
    if (!newTier) {
      console.error(`No tier found for rating ${newRating} (internal: ${internalRating})`);
      return { tierChanged: false };
    }
    
    // Update match count
    const newMatchesInTier = currentStatus.playerStatus.matchesInTier + 1;
    
    // Track progression based on match result and rating
    let newMatchesAboveThreshold = currentStatus.playerStatus.matchesAboveThreshold;
    let newMatchesBelowThreshold = currentStatus.playerStatus.matchesBelowThreshold;
    let gracePeriodRemainingMatches = currentStatus.playerStatus.gracePeriodRemainingMatches;
    
    // If player won and rating is near top of tier, increment matches above threshold
    const promotionThreshold = currentStatus.tier.maxRating - 
      Math.round((currentStatus.tier.maxRating - currentStatus.tier.minRating) * 0.15); // Top 15% of tier
    
    if (won && internalRating >= promotionThreshold) {
      newMatchesAboveThreshold += 1;
    } else {
      // Reset consecutive matches above threshold if required
      if (currentStatus.rules?.promotionRequiresConsecutive) {
        newMatchesAboveThreshold = 0;
      }
    }
    
    // If player lost and rating is near bottom of tier, increment matches below threshold
    const demotionThreshold = currentStatus.tier.minRating + 
      Math.round((currentStatus.tier.maxRating - currentStatus.tier.minRating) * 
        (currentStatus.rules?.demotionBufferZonePct || 10) / 100);
    
    if (!won && internalRating <= demotionThreshold) {
      // Only count towards demotion if not in grace period
      if (gracePeriodRemainingMatches <= 0) {
        newMatchesBelowThreshold += 1;
      }
    } else {
      // Reset consecutive matches below threshold if required
      if (currentStatus.rules?.demotionRequiresConsecutive) {
        newMatchesBelowThreshold = 0;
      }
    }
    
    // Decrement grace period if active
    if (gracePeriodRemainingMatches > 0) {
      gracePeriodRemainingMatches -= 1;
    }
    
    // Check for promotion based on matches above threshold
    let tierChanged = false;
    let oldTier: MasteryTierName | undefined;
    let newTierName: MasteryTierName | undefined;
    let oldPath: MasteryPath | undefined;
    let newPath: MasteryPath | undefined;
    
    const isPromotionEligible = currentStatus.rules && 
      newMatchesAboveThreshold >= currentStatus.rules.promotionMatchesRequired;
    
    const isDemotionEligible = currentStatus.rules && 
      newMatchesBelowThreshold >= currentStatus.rules.demotionMatchesRequired &&
      gracePeriodRemainingMatches <= 0;
    
    if (currentStatus.tier.id !== newTier.id) {
      // Natural tier change due to rating
      tierChanged = true;
      oldTier = currentStatus.tier.name as MasteryTierName;
      newTierName = newTier.name as MasteryTierName;
      oldPath = currentStatus.tier.path as MasteryPath;
      newPath = newTier.path as MasteryPath;
      
      // Record the progression
      await this.recordTierProgression(
        userId,
        currentStatus.tier.id,
        newTier.id,
        internalRating,
        internalRating > currentStatus.playerStatus.rating ? 'promotion' : 'demotion'
      );
      
      // Get rules for new tier
      const newTierRules = await this.getTierRules(newTier.id);
      
      // Update tier status
      await db.update(playerTierStatus)
        .set({
          tierId: newTier.id,
          rating: internalRating,
          matchesInTier: 0, // Reset for new tier
          matchesAboveThreshold: 0,
          matchesBelowThreshold: 0,
          gracePeriodRemainingMatches: newTierRules?.demotionGracePeriod || 0,
          joinedTierAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(playerTierStatus.userId, userId))
        .execute();
    } else if (isPromotionEligible && currentStatus.tier.order < 9) {
      // Forced promotion due to consistent performance
      const nextTierOrder = currentStatus.tier.order + 1;
      const nextTier = await db.select().from(masteryTiers)
        .where(eq(masteryTiers.order, nextTierOrder))
        .execute();
      
      if (nextTier.length > 0) {
        tierChanged = true;
        oldTier = currentStatus.tier.name as MasteryTierName;
        newTierName = nextTier[0].name as MasteryTierName;
        oldPath = currentStatus.tier.path as MasteryPath;
        newPath = nextTier[0].path as MasteryPath;
        
        // Calculate starting rating in new tier
        // Use promotion starting position percentage
        const tierRange = nextTier[0].maxRating - nextTier[0].minRating;
        const startingPct = currentStatus.rules?.promotionStartingPositionPct || 20;
        const newStartingRating = nextTier[0].minRating + Math.round((tierRange * startingPct) / 100);
        
        // Record the progression
        await this.recordTierProgression(
          userId,
          currentStatus.tier.id,
          nextTier[0].id,
          newStartingRating,
          'promotion'
        );
        
        // Get rules for new tier
        const newTierRules = await this.getTierRules(nextTier[0].id);
        
        // Update tier status
        await db.update(playerTierStatus)
          .set({
            tierId: nextTier[0].id,
            rating: newStartingRating,
            matchesInTier: 0,
            matchesAboveThreshold: 0,
            matchesBelowThreshold: 0,
            gracePeriodRemainingMatches: newTierRules?.demotionGracePeriod || 0,
            joinedTierAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(playerTierStatus.userId, userId))
          .execute();
      }
    } else if (isDemotionEligible && currentStatus.tier.order > 1) {
      // Forced demotion due to consistent underperformance
      const prevTierOrder = currentStatus.tier.order - 1;
      const prevTier = await db.select().from(masteryTiers)
        .where(eq(masteryTiers.order, prevTierOrder))
        .execute();
      
      if (prevTier.length > 0) {
        tierChanged = true;
        oldTier = currentStatus.tier.name as MasteryTierName;
        newTierName = prevTier[0].name as MasteryTierName;
        oldPath = currentStatus.tier.path as MasteryPath;
        newPath = prevTier[0].path as MasteryPath;
        
        // Calculate starting rating in previous tier
        // Use 80% of the previous tier's range
        const tierRange = prevTier[0].maxRating - prevTier[0].minRating;
        const startingRating = prevTier[0].minRating + Math.round(tierRange * 0.8);
        
        // Record the progression
        await this.recordTierProgression(
          userId,
          currentStatus.tier.id,
          prevTier[0].id,
          startingRating,
          'demotion'
        );
        
        // Get rules for new tier
        const newTierRules = await this.getTierRules(prevTier[0].id);
        
        // Update tier status
        await db.update(playerTierStatus)
          .set({
            tierId: prevTier[0].id,
            rating: startingRating,
            matchesInTier: 0,
            matchesAboveThreshold: 0,
            matchesBelowThreshold: 0,
            gracePeriodRemainingMatches: newTierRules?.demotionGracePeriod || 0,
            joinedTierAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(playerTierStatus.userId, userId))
          .execute();
      }
    } else {
      // No tier change, just update stats
      await db.update(playerTierStatus)
        .set({
          rating: internalRating,
          matchesInTier: newMatchesInTier,
          matchesAboveThreshold: newMatchesAboveThreshold,
          matchesBelowThreshold: newMatchesBelowThreshold,
          gracePeriodRemainingMatches,
          updatedAt: new Date(),
          lastMatchDate: new Date()
        })
        .where(eq(playerTierStatus.userId, userId))
        .execute();
    }
    
    return {
      tierChanged,
      oldTier,
      newTier: newTierName,
      oldPath,
      newPath
    };
  }
  
  /**
   * Get players by tier with optional paging
   */
  async getPlayersByTier(
    tierName: MasteryTierName,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ players: any[]; total: number }> {
    // Find tier by name
    const tier = await this.getTierByName(tierName);
    
    if (!tier) {
      return { players: [], total: 0 };
    }
    
    // Count total players in tier
    const totalCount = await db.select({ count: sql<number>`count(*)` })
      .from(playerTierStatus)
      .where(eq(playerTierStatus.tierId, tier.id))
      .execute();
    
    const total = totalCount[0]?.count || 0;
    
    // Calculate offset
    const offset = (page - 1) * pageSize;
    
    // Get players in tier with paging
    const players = await db.select({
      status: playerTierStatus,
      user: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        countryCode: users.countryCode
      }
    })
    .from(playerTierStatus)
    .innerJoin(
      users,
      eq(playerTierStatus.userId, users.id)
    )
    .where(eq(playerTierStatus.tierId, tier.id))
    .orderBy(desc(playerTierStatus.rating))
    .limit(pageSize)
    .offset(offset)
    .execute();
    
    // Format results
    const results = players.map((p, idx) => ({
      userId: p.user.id,
      username: p.user.username,
      displayName: p.user.displayName,
      avatarUrl: p.user.avatarUrl,
      countryCode: p.user.countryCode,
      rating: convertRatingToDisplayScale(p.status.rating),
      matchesInTier: p.status.matchesInTier,
      position: offset + idx + 1,
      tier: tierName,
      path: tier.path
    }));
    
    return { players: results, total };
  }
  
  /**
   * Get the progress needed for a player to reach the next tier
   */
  async getNextTierProgress(userId: number): Promise<{
    currentTier: MasteryTierName;
    nextTier: MasteryTierName | null;
    currentRating: number;
    requiredRating: number;
    progressPercent: number;
    matchesNeeded: number;
  }> {
    // Get player's current tier status
    const status = await this.getPlayerTierStatus(userId);
    
    if (!status) {
      throw new Error("Player tier status not found");
    }
    
    // Get current tier info
    const currentTier = await this.getTierByName(status.currentTier);
    
    if (!currentTier) {
      throw new Error("Current tier not found");
    }
    
    // Check if this is the highest tier
    if (currentTier.order >= 9) {
      return {
        currentTier: status.currentTier,
        nextTier: null,
        currentRating: status.rating,
        requiredRating: 0,
        progressPercent: 100,
        matchesNeeded: 0
      };
    }
    
    // Get next tier
    const nextTierOrder = currentTier.order + 1;
    const nextTier = await db.select().from(masteryTiers)
      .where(eq(masteryTiers.order, nextTierOrder))
      .execute();
    
    if (nextTier.length === 0) {
      throw new Error("Next tier not found");
    }
    
    // Get current tier rules
    const rules = await this.getTierRules(currentTier.id);
    
    // Calculate progress
    const minRatingForNextTier = convertRatingToDisplayScale(nextTier[0].minRating);
    const currentRating = status.rating;
    const currentTierMax = convertRatingToDisplayScale(currentTier.maxRating);
    const currentTierMin = convertRatingToDisplayScale(currentTier.minRating);
    
    // Calculate progress percentage (how close to next tier)
    const ratingRange = currentTierMax - currentTierMin;
    const playerProgress = Math.max(0, currentRating - currentTierMin);
    const progressPercent = Math.min(100, Math.round((playerProgress / ratingRange) * 100));
    
    // Estimate matches needed
    // This is a rough estimate based on tier rules
    let matchesNeeded = 0;
    
    if (rules) {
      // If already eligible for promotion based on consistency, use that
      if (status.promotionProgress >= 100) {
        matchesNeeded = 0;
      } else if (status.promotionProgress > 0) {
        // Partially on the way to consistency-based promotion
        const remainingMatches = Math.ceil(rules.promotionMatchesRequired * (1 - status.promotionProgress / 100));
        matchesNeeded = remainingMatches;
      } else {
        // Otherwise estimate based on rating gap and K-factor
        const ratingGap = minRatingForNextTier - currentRating;
        if (ratingGap <= 0) {
          matchesNeeded = 1; // Just needs one more match
        } else {
          // Rough estimate: Each win adds about maxRatingGain/2 points on average
          const avgGainPerWin = rules.maxRatingGain / 2;
          matchesNeeded = Math.ceil(convertRatingToInternalScale(ratingGap) / avgGainPerWin);
        }
      }
    }
    
    return {
      currentTier: status.currentTier,
      nextTier: nextTier[0].name as MasteryTierName,
      currentRating,
      requiredRating: minRatingForNextTier,
      progressPercent,
      matchesNeeded
    };
  }
}