/**
 * CourtIQ™ Rating System Database Storage Service
 * PKL-278651-RATINGS-0001-COURTIQ - Multi-dimensional Rating System
 * 
 * This service handles all database operations for the CourtIQ™ rating system.
 * It provides methods for storing and retrieving player ratings, match assessments,
 * and other rating-related data.
 */

import { db } from "../db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { 
  courtiqUserRatings, courtiqRatingImpacts, matchAssessments, incompleteAssessments,
  type CourtiqUserRating, type InsertCourtiqUserRating,
  type MatchAssessment, type InsertMatchAssessment,
  type CourtiqRatingImpact, type InsertCourtiqRatingImpact, 
  type IncompleteAssessment, type InsertIncompleteAssessment
} from "@shared/schema/courtiq";
import { users, matches } from "@shared/schema";

/**
 * CourtIQ Storage Service
 * Handles all database operations for the CourtIQ™ rating system
 */
class CourtIQStorageService {
  /**
   * Get a user's CourtIQ™ ratings
   * @param userId The user ID to get ratings for
   * @returns The user's CourtIQ™ ratings or undefined if not found
   */
  async getUserRatings(userId: number): Promise<CourtiqUserRating | undefined> {
    try {
      const [rating] = await db
        .select()
        .from(courtiqUserRatings)
        .where(eq(courtiqUserRatings.userId, userId));
      
      return rating;
    } catch (error) {
      console.error("Error getting user CourtIQ ratings:", error);
      throw error;
    }
  }

  /**
   * Create or update a user's CourtIQ™ ratings
   * @param data The rating data to store
   * @returns The stored rating data
   */
  async saveUserRatings(data: InsertCourtiqUserRating): Promise<CourtiqUserRating> {
    try {
      // Check if user already has ratings
      const existingRating = await this.getUserRatings(data.userId);
      
      if (existingRating) {
        // Update existing ratings with optimistic locking
        const currentVersion = existingRating.version || 0;
        const [updated] = await db
          .update(courtiqUserRatings)
          .set({
            ...data,
            version: currentVersion + 1,
            lastUpdated: new Date()
          })
          .where(
            and(
              eq(courtiqUserRatings.userId, data.userId),
              eq(courtiqUserRatings.version, currentVersion)
            )
          )
          .returning();
        
        if (!updated) {
          throw new Error("Rating was modified by another process. Please retry.");
        }
        
        return updated;
      } else {
        // Create new ratings
        const [rating] = await db
          .insert(courtiqUserRatings)
          .values({
            ...data,
            version: 1,
            lastUpdated: new Date(),
            createdAt: new Date()
          })
          .returning();
        
        return rating;
      }
    } catch (error) {
      console.error("Error saving user CourtIQ ratings:", error);
      throw error;
    }
  }

  /**
   * Get a user's match assessments
   * @param userId The user ID to get assessments for
   * @param limit The maximum number of assessments to return
   * @returns The user's match assessments
   */
  async getUserAssessments(userId: number, limit = 50): Promise<MatchAssessment[]> {
    try {
      const assessments = await db
        .select()
        .from(matchAssessments)
        .where(eq(matchAssessments.targetId, userId))
        .orderBy(desc(matchAssessments.createdAt))
        .limit(limit);
      
      return assessments;
    } catch (error) {
      console.error("Error getting user match assessments:", error);
      throw error;
    }
  }

  /**
   * Get match assessments for a specific match
   * @param matchId The match ID to get assessments for
   * @returns Match assessments for the specified match
   */
  async getMatchAssessments(matchId: number): Promise<MatchAssessment[]> {
    try {
      const assessments = await db
        .select()
        .from(matchAssessments)
        .where(eq(matchAssessments.matchId, matchId))
        .orderBy(desc(matchAssessments.createdAt));
      
      return assessments;
    } catch (error) {
      console.error("Error getting match assessments:", error);
      throw error;
    }
  }

  /**
   * Save a match assessment
   * @param data The assessment data to store
   * @returns The stored assessment data
   */
  async saveMatchAssessment(data: InsertMatchAssessment): Promise<MatchAssessment> {
    try {
      // Check if an assessment already exists for this match, assessor, and target
      const [existingAssessment] = await db
        .select()
        .from(matchAssessments)
        .where(
          and(
            eq(matchAssessments.matchId, data.matchId),
            eq(matchAssessments.assessorId, data.assessorId),
            eq(matchAssessments.targetId, data.targetId)
          )
        );
      
      if (existingAssessment) {
        // Update existing assessment
        const [updated] = await db
          .update(matchAssessments)
          .set({
            ...data,
            updatedAt: new Date()
          })
          .where(eq(matchAssessments.id, existingAssessment.id))
          .returning();
        
        return updated;
      } else {
        // Create new assessment
        const [assessment] = await db
          .insert(matchAssessments)
          .values({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        
        return assessment;
      }
    } catch (error) {
      console.error("Error saving match assessment:", error);
      throw error;
    }
  }

  /**
   * Record a rating impact event
   * @param data The rating impact data to store
   * @returns The stored rating impact data
   */
  async recordRatingImpact(data: InsertCourtiqRatingImpact): Promise<CourtiqRatingImpact> {
    try {
      const [impact] = await db
        .insert(courtiqRatingImpacts)
        .values({
          ...data,
          createdAt: new Date()
        })
        .returning();
      
      return impact;
    } catch (error) {
      console.error("Error recording rating impact:", error);
      throw error;
    }
  }

  /**
   * Get a user's rating impacts
   * @param userId The user ID to get rating impacts for
   * @param limit The maximum number of impacts to return
   * @returns The user's rating impacts
   */
  async getUserRatingImpacts(userId: number, limit = 50): Promise<CourtiqRatingImpact[]> {
    try {
      const impacts = await db
        .select()
        .from(courtiqRatingImpacts)
        .where(eq(courtiqRatingImpacts.userId, userId))
        .orderBy(desc(courtiqRatingImpacts.createdAt))
        .limit(limit);
      
      return impacts;
    } catch (error) {
      console.error("Error getting user rating impacts:", error);
      throw error;
    }
  }

  /**
   * Save an incomplete assessment (auto-save functionality)
   * @param data The incomplete assessment data to store
   * @returns The stored incomplete assessment data
   */
  async saveIncompleteAssessment(data: InsertIncompleteAssessment): Promise<IncompleteAssessment> {
    try {
      // Check if an incomplete assessment already exists
      const [existingAssessment] = await db
        .select()
        .from(incompleteAssessments)
        .where(
          and(
            eq(incompleteAssessments.matchId, data.matchId),
            eq(incompleteAssessments.assessorId, data.assessorId),
            eq(incompleteAssessments.targetId, data.targetId)
          )
        );
      
      if (existingAssessment) {
        // Update existing incomplete assessment
        const [updated] = await db
          .update(incompleteAssessments)
          .set({
            ...data,
            lastUpdated: new Date()
          })
          .where(eq(incompleteAssessments.id, existingAssessment.id))
          .returning();
        
        return updated;
      } else {
        // Create new incomplete assessment
        const [assessment] = await db
          .insert(incompleteAssessments)
          .values({
            ...data,
            createdAt: new Date(),
            lastUpdated: new Date()
          })
          .returning();
        
        return assessment;
      }
    } catch (error) {
      console.error("Error saving incomplete assessment:", error);
      throw error;
    }
  }

  /**
   * Get an incomplete assessment
   * @param matchId The match ID
   * @param assessorId The assessor's user ID
   * @param targetId The target player's user ID
   * @returns The incomplete assessment or undefined if not found
   */
  async getIncompleteAssessment(
    matchId: number,
    assessorId: number,
    targetId: number
  ): Promise<IncompleteAssessment | undefined> {
    try {
      const [assessment] = await db
        .select()
        .from(incompleteAssessments)
        .where(
          and(
            eq(incompleteAssessments.matchId, matchId),
            eq(incompleteAssessments.assessorId, assessorId),
            eq(incompleteAssessments.targetId, targetId)
          )
        );
      
      return assessment;
    } catch (error) {
      console.error("Error getting incomplete assessment:", error);
      throw error;
    }
  }

  /**
   * Delete an incomplete assessment (after completion)
   * @param matchId The match ID
   * @param assessorId The assessor's user ID
   * @param targetId The target player's user ID
   */
  async deleteIncompleteAssessment(
    matchId: number,
    assessorId: number,
    targetId: number
  ): Promise<void> {
    try {
      await db
        .delete(incompleteAssessments)
        .where(
          and(
            eq(incompleteAssessments.matchId, matchId),
            eq(incompleteAssessments.assessorId, assessorId),
            eq(incompleteAssessments.targetId, targetId)
          )
        );
    } catch (error) {
      console.error("Error deleting incomplete assessment:", error);
      throw error;
    }
  }

  /**
   * Get the top-rated players for a specific dimension
   * @param dimension The dimension to get top players for (TECH, TACT, PHYS, MENT, CONS)
   * @param limit The maximum number of players to return
   * @returns The top-rated players for the specified dimension
   */
  async getTopRatedPlayers(dimension: string, limit = 10): Promise<any[]> {
    try {
      // Map dimension to the corresponding rating field
      const ratingField = 
        dimension === 'TECH' ? courtiqUserRatings.technicalRating :
        dimension === 'TACT' ? courtiqUserRatings.tacticalRating :
        dimension === 'PHYS' ? courtiqUserRatings.physicalRating :
        dimension === 'MENT' ? courtiqUserRatings.mentalRating :
        dimension === 'CONS' ? courtiqUserRatings.consistencyRating :
        courtiqUserRatings.overallRating;
      
      // Join with users table to get player information
      const topPlayers = await db
        .select({
          userId: courtiqUserRatings.userId,
          username: users.username,
          displayName: users.displayName,
          rating: ratingField,
          confidenceScore: courtiqUserRatings.confidenceScore
        })
        .from(courtiqUserRatings)
        .innerJoin(users, eq(courtiqUserRatings.userId, users.id))
        .orderBy(desc(ratingField), desc(courtiqUserRatings.confidenceScore))
        .limit(limit);
      
      return topPlayers;
    } catch (error) {
      console.error(`Error getting top rated players for ${dimension}:`, error);
      throw error;
    }
  }

  /**
   * Get players with similar ratings to a specific player
   * @param userId The user ID to find similar players for
   * @param limit The maximum number of similar players to return
   * @returns Players with similar ratings
   */
  async getSimilarPlayers(userId: number, limit = 5): Promise<any[]> {
    try {
      // First get the user's ratings
      const userRating = await this.getUserRatings(userId);
      
      if (!userRating) {
        return [];
      }
      
      // Calculate similarity score based on all 5 dimensions
      // Uses PostgreSQL's least() and greatest() to compute a similarity score
      const similarPlayers = await db
        .select({
          userId: courtiqUserRatings.userId,
          username: users.username,
          displayName: users.displayName,
          technicalRating: courtiqUserRatings.technicalRating,
          tacticalRating: courtiqUserRatings.tacticalRating,
          physicalRating: courtiqUserRatings.physicalRating,
          mentalRating: courtiqUserRatings.mentalRating,
          consistencyRating: courtiqUserRatings.consistencyRating,
          overallRating: courtiqUserRatings.overallRating,
          similarityScore: sql`(
            5 - (
              abs(${courtiqUserRatings.technicalRating} - ${userRating.technicalRating}) +
              abs(${courtiqUserRatings.tacticalRating} - ${userRating.tacticalRating}) +
              abs(${courtiqUserRatings.physicalRating} - ${userRating.physicalRating}) +
              abs(${courtiqUserRatings.mentalRating} - ${userRating.mentalRating}) +
              abs(${courtiqUserRatings.consistencyRating} - ${userRating.consistencyRating})
            ) / 5.0
          )`
        })
        .from(courtiqUserRatings)
        .innerJoin(users, eq(courtiqUserRatings.userId, users.id))
        .where(
          and(
            // Exclude the user themselves
            sql`${courtiqUserRatings.userId} != ${userId}`,
            // Only include users with at least some ratings
            sql`${courtiqUserRatings.assessmentCount} > 0`
          )
        )
        // Order by similarity score (higher is more similar)
        .orderBy(desc(sql`similarityScore`))
        .limit(limit);
      
      return similarPlayers;
    } catch (error) {
      console.error("Error getting similar players:", error);
      throw error;
    }
  }

  /**
   * Get a user's rating progression over time
   * @param userId The user ID to get progression for
   * @param dimension The dimension to get progression for (TECH, TACT, PHYS, MENT, CONS, OVERALL)
   * @param startDate The start date for the progression (optional)
   * @param endDate The end date for the progression (optional)
   * @returns Rating progression data points
   */
  async getUserRatingProgression(
    userId: number, 
    dimension: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      // Build query conditions
      const conditions = [eq(courtiqRatingImpacts.userId, userId)];
      
      if (dimension !== 'OVERALL') {
        conditions.push(eq(courtiqRatingImpacts.dimension, dimension));
      }
      
      if (startDate) {
        conditions.push(gte(courtiqRatingImpacts.createdAt, startDate));
      }
      
      if (endDate) {
        conditions.push(lte(courtiqRatingImpacts.createdAt, endDate));
      }
      
      // Get all rating impacts for the user and dimension
      const impacts = await db
        .select({
          date: courtiqRatingImpacts.createdAt,
          dimension: courtiqRatingImpacts.dimension,
          value: courtiqRatingImpacts.impactValue,
          weight: courtiqRatingImpacts.impactWeight,
          reason: courtiqRatingImpacts.reason,
          matchId: courtiqRatingImpacts.matchId
        })
        .from(courtiqRatingImpacts)
        .where(and(...conditions))
        .orderBy(courtiqRatingImpacts.createdAt);
      
      return impacts;
    } catch (error) {
      console.error("Error getting user rating progression:", error);
      throw error;
    }
  }
  
  /**
   * Get all user ratings with optional filtering
   * @param limit Maximum number of ratings to return
   * @param offset Pagination offset
   * @returns List of user ratings
   */
  async getAllUserRatings(limit = 100, offset = 0): Promise<(CourtiqUserRating & { username: string, displayName: string | null })[]> {
    try {
      const ratings = await db
        .select({
          ...courtiqUserRatings,
          username: users.username,
          displayName: users.displayName
        })
        .from(courtiqUserRatings)
        .innerJoin(users, eq(courtiqUserRatings.userId, users.id))
        .orderBy(desc(courtiqUserRatings.overallRating))
        .limit(limit)
        .offset(offset);
      
      return ratings;
    } catch (error) {
      console.error("Error getting all user ratings:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const courtiqStorage = new CourtIQStorageService();