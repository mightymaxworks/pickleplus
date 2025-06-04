/**
 * Age-Division Ranking Service
 * Implements the comprehensive PCP Global Ranking System with age-specific logic
 * 
 * Key Rules:
 * 1. Casual matches: Points go to player's natural age division only
 * 2. Tournament/League matches: Points go to the event's specified division
 * 3. Players need 10+ matches before appearing in rankings
 * 4. Points decay after 3 months of inactivity
 * 5. Dynamic player pools based on actual birthdates
 */

import { storage } from '../storage';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { matches, users } from '@shared/schema';

export interface PlayerRankingPosition {
  userId: number;
  division: string;
  format: string;
  rankingPoints: number;
  rank: number;
  totalPlayersInDivision: number;
  matchCount: number;
  lastMatchDate: Date | null;
  isEligible: boolean;
  decayFactor: number;
}

export interface DivisionPlayerPool {
  division: string;
  format: string;
  totalPlayers: number;
  rankings: PlayerRankingPosition[];
}

export class AgeDivisionRankingService {
  
  /**
   * Calculate which age division a player naturally belongs to based on birthdate
   */
  private calculateNaturalAgeDivision(yearOfBirth: number): string {
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearOfBirth;
    
    if (age >= 70) return '70+';
    if (age >= 60) return '60+';
    if (age >= 50) return '50+';
    if (age >= 35) return '35+';
    return '19+';
  }

  /**
   * Calculate point decay based on last match date
   */
  private calculateDecayFactor(lastMatchDate: Date | null): number {
    if (!lastMatchDate) return 1.0;
    
    const now = new Date();
    const monthsSinceLastMatch = (now.getTime() - lastMatchDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsSinceLastMatch <= 3) return 1.0; // No decay for first 3 months
    
    // Linear decay: lose 10% per month after 3 months
    const decayMonths = monthsSinceLastMatch - 3;
    const decayFactor = Math.max(0.1, 1.0 - (decayMonths * 0.1));
    
    return decayFactor;
  }

  /**
   * Get all players eligible for a specific age division (optimized)
   */
  private async getPlayersEligibleForDivision(division: string, limit: number = 10): Promise<number[]> {
    const currentYear = new Date().getFullYear();
    
    let minAge: number;
    let maxAge: number = 120; // Reasonable max age
    
    switch (division) {
      case '70+':
        minAge = 70;
        break;
      case '60+':
        minAge = 60;
        break;
      case '50+':
        minAge = 50;
        break;
      case '35+':
        minAge = 35;
        break;
      case '19+':
      default:
        minAge = 19;
        break;
    }

    const maxBirthYear = currentYear - minAge;
    const minBirthYear = currentYear - maxAge;

    const eligibleUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          gte(users.yearOfBirth, minBirthYear),
          sql`${users.yearOfBirth} <= ${maxBirthYear}`
        )
      )
      .limit(limit);

    return eligibleUsers.map(user => user.id);
  }

  /**
   * Calculate ranking points for a player in a specific division and format
   */
  async calculatePlayerRankingPoints(
    userId: number, 
    division: string, 
    format: string
  ): Promise<{ points: number; matchCount: number; lastMatchDate: Date | null }> {
    
    const user = await storage.getUser(userId);
    if (!user || !user.yearOfBirth) {
      return { points: 0, matchCount: 0, lastMatchDate: null };
    }

    const naturalDivision = this.calculateNaturalAgeDivision(user.yearOfBirth);
    const userMatches = await storage.getMatchesByUser(userId, 100, 0, userId);
    
    let totalPoints = 0;
    let relevantMatches = 0;
    let lastMatchDate: Date | null = null;

    for (const match of userMatches) {
      // Skip if not the right format
      if (match.formatType !== format) continue;
      
      // Determine which division this match contributes to
      let contributesToDivision: string;
      
      if (match.matchType === 'casual') {
        // Casual matches always go to natural age division
        contributesToDivision = naturalDivision;
      } else {
        // Tournament/League matches go to the event's division
        contributesToDivision = match.division || 'open';
      }
      
      // Skip if this match doesn't contribute to the requested division
      if (contributesToDivision !== division) continue;
      
      // Only count wins
      if (match.winnerId !== userId) continue;
      
      relevantMatches++;
      
      // Calculate base points
      let basePoints = 3; // Standard win points
      
      // Apply weight multiplier
      let weightMultiplier = 1.0;
      if (match.matchType === 'league') {
        weightMultiplier = 0.67;
      } else if (match.matchType === 'casual') {
        weightMultiplier = 0.5;
      }
      
      totalPoints += Math.round(basePoints * weightMultiplier);
      
      // Track most recent match date
      if (match.matchDate) {
        if (!lastMatchDate || match.matchDate > lastMatchDate) {
          lastMatchDate = match.matchDate;
        }
      }
    }

    return { 
      points: totalPoints, 
      matchCount: relevantMatches, 
      lastMatchDate 
    };
  }

  /**
   * Get player's ranking position in a specific division and format
   */
  async getPlayerRankingPosition(
    userId: number,
    division: string,
    format: string
  ): Promise<PlayerRankingPosition> {
    
    const { points, matchCount, lastMatchDate } = await this.calculatePlayerRankingPoints(
      userId, 
      division, 
      format
    );
    
    // Check eligibility (10+ matches required)
    const isEligible = matchCount >= 10;
    
    // Apply decay factor
    const decayFactor = this.calculateDecayFactor(lastMatchDate);
    const adjustedPoints = Math.round(points * decayFactor);
    
    // Get all eligible players for this division
    const eligiblePlayerIds = await this.getPlayersEligibleForDivision(division);
    
    // Calculate rankings for all eligible players
    const allPlayerRankings: { userId: number; points: number }[] = [];
    
    for (const playerId of eligiblePlayerIds) {
      const playerData = await this.calculatePlayerRankingPoints(playerId, division, format);
      if (playerData.matchCount >= 10) { // Only include eligible players
        const playerDecayFactor = this.calculateDecayFactor(playerData.lastMatchDate);
        const playerAdjustedPoints = Math.round(playerData.points * playerDecayFactor);
        allPlayerRankings.push({ userId: playerId, points: playerAdjustedPoints });
      }
    }
    
    // Sort by points (descending)
    allPlayerRankings.sort((a, b) => b.points - a.points);
    
    // Find player's rank
    const playerRankIndex = allPlayerRankings.findIndex(p => p.userId === userId);
    const rank = playerRankIndex >= 0 ? playerRankIndex + 1 : null;
    
    return {
      userId,
      division,
      format,
      rankingPoints: adjustedPoints,
      rank: rank || 0,
      totalPlayersInDivision: allPlayerRankings.length,
      matchCount,
      lastMatchDate,
      isEligible,
      decayFactor
    };
  }

  /**
   * Get division leaderboard for a specific division and format
   */
  async getDivisionLeaderboard(
    division: string,
    format: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<DivisionPlayerPool> {
    
    const eligiblePlayerIds = await this.getPlayersEligibleForDivision(division);
    const playerRankings: PlayerRankingPosition[] = [];
    
    // Calculate rankings for all eligible players
    for (const playerId of eligiblePlayerIds) {
      const ranking = await this.getPlayerRankingPosition(playerId, division, format);
      if (ranking.isEligible) {
        playerRankings.push(ranking);
      }
    }
    
    // Sort by ranking points (descending)
    playerRankings.sort((a, b) => b.rankingPoints - a.rankingPoints);
    
    // Update ranks based on sorted order
    playerRankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });
    
    // Apply pagination
    const paginatedRankings = playerRankings.slice(offset, offset + limit);
    
    return {
      division,
      format,
      totalPlayers: playerRankings.length,
      rankings: paginatedRankings
    };
  }

  /**
   * Get all divisions a player is eligible for
   */
  getEligibleDivisions(yearOfBirth: number): string[] {
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearOfBirth;
    
    const divisions: string[] = ['19+']; // Everyone eligible for open
    
    if (age >= 35) divisions.push('35+');
    if (age >= 50) divisions.push('50+');
    if (age >= 60) divisions.push('60+');
    if (age >= 70) divisions.push('70+');
    
    return divisions;
  }
}

export const ageDivisionRankingService = new AgeDivisionRankingService();