/**
 * PKL-278651-COURTIQ-0001-GLOBAL
 * Rating System Converter for CourtIQ™
 * 
 * This module handles conversion between different rating systems,
 * including DUPR, IFP, UTPR, WPR, and IPTPA.
 */

import { db } from "../../db";
import { eq, and, between, gte, lte, sql, desc } from "drizzle-orm";
import { 
  userExternalRatings, 
  ratingSystems, 
  ratingConversions,
  playerRatings,
  UserExternalRating,
  RatingSystem,
  RatingConversion,
  InsertUserExternalRating
} from "../../../shared/courtiq-schema";

// Type helpers for SQL results
type SqlRecord = Record<string, unknown>;
type SqlResult = any[] & { [key: number]: SqlRecord };
type SqlResultRow = SqlRecord;

// Define rating system codes
export const RATING_SYSTEMS = {
  COURTIQ: 'COURTIQ', // Our internal system
  DUPR: 'DUPR',       // Dynamic Universal Pickleball Rating (2.0-7.0)
  IFP: 'IFP',         // International Federation of Pickleball (1.0-5.0)
  UTPR: 'UTPR',       // USA Pickleball Tournament Player Rating (2.5-6.0)
  WPR: 'WPR',         // World Pickleball Rating (0-10.0)
  IPTPA: 'IPTPA'      // International Pickleball Teaching Professional Association (1.0-5.0)
};

// Type for simplified conversion result
export interface ConversionResult {
  rating: number;       // The converted rating
  confidence: number;   // Confidence level (0-100)
  source: string;       // Source of conversion
  originalRating: number | null; // Original rating if applicable
  originalSystem: string | null; // Original system if applicable
}

export class RatingConverter {
  /**
   * Get all supported rating systems
   */
  async getSupportedSystems(): Promise<RatingSystem[]> {
    // Direct query using SQL since query builder is not yet set up for this table
    const systemsResult = await db.execute(
      sql`SELECT * FROM rating_systems WHERE is_active = true ORDER BY code`
    ) as SqlResult;
    
    // Cast to array of RatingSystem objects with proper typing
    return (Array.isArray(systemsResult) ? systemsResult : []) as unknown as RatingSystem[];
  }

  /**
   * Convert a rating from one system to another
   */
  async convertRating(
    fromSystemCode: string,
    toSystemCode: string, 
    rating: number
  ): Promise<ConversionResult> {
    // If converting to the same system, return as is
    if (fromSystemCode === toSystemCode) {
      return {
        rating,
        confidence: 100,
        source: 'direct',
        originalRating: rating,
        originalSystem: fromSystemCode
      };
    }

    try {
      // Get the system IDs
      const fromSystemResult = await db.execute(
        sql`SELECT * FROM rating_systems WHERE code = ${fromSystemCode}`
      ) as SqlResult;
      const fromSystem = fromSystemResult[0] as SqlResultRow;
      
      const toSystemResult = await db.execute(
        sql`SELECT * FROM rating_systems WHERE code = ${toSystemCode}`
      ) as SqlResult;
      const toSystem = toSystemResult[0] as SqlResultRow;

      if (!fromSystem || !toSystem) {
        throw new Error(`Rating system not found: ${!fromSystem ? fromSystemCode : toSystemCode}`);
      }

      // Look for an exact match in the conversion table
      const exactMatchResult = await db.execute(
        sql`SELECT * FROM rating_conversions WHERE 
            from_system_id = ${fromSystem.id} AND 
            to_system_id = ${toSystem.id} AND 
            source_rating = ${rating.toString()}`
      ) as SqlResult;
      const exactMatch = exactMatchResult[0] as SqlResultRow;

      if (exactMatch) {
        const confidenceModifier = exactMatch.confidenceModifier ? Number(exactMatch.confidenceModifier) : 0;
        return {
          rating: Number(exactMatch.targetRating),
          confidence: 95 + confidenceModifier,
          source: 'exact_match',
          originalRating: rating,
          originalSystem: fromSystemCode
        };
      }

      // Look for nearest values for interpolation
      const lowerBoundResult = await db.execute(
        sql`SELECT * FROM rating_conversions 
            WHERE from_system_id = ${fromSystem.id} 
            AND to_system_id = ${toSystem.id} 
            AND source_rating <= ${rating.toString()}
            ORDER BY source_rating DESC
            LIMIT 1`
      ) as unknown as SqlResult;
      const lowerBound = lowerBoundResult[0] as SqlResultRow;

      const upperBoundResult = await db.execute(
        sql`SELECT * FROM rating_conversions 
            WHERE from_system_id = ${fromSystem.id} 
            AND to_system_id = ${toSystem.id} 
            AND source_rating >= ${rating.toString()}
            ORDER BY source_rating ASC
            LIMIT 1`
      ) as unknown as SqlResult;
      const upperBound = upperBoundResult[0] as SqlResultRow;

      // Interpolate if we have bounds
      if (lowerBound && upperBound) {
        // Linear interpolation
        const lowerSourceRating = Number(lowerBound.sourceRating);
        const upperSourceRating = Number(upperBound.sourceRating);
        const lowerTargetRating = Number(lowerBound.targetRating);
        const upperTargetRating = Number(upperBound.targetRating);
        
        // Calculate the position between bounds (0-1)
        const position = (rating - lowerSourceRating) / (upperSourceRating - lowerSourceRating);
        
        // Interpolate the target rating
        const interpolatedRating = lowerTargetRating + position * (upperTargetRating - lowerTargetRating);
        
        // Calculate confidence (closer to bounds = higher confidence)
        const lowerConfidenceMod = lowerBound.confidenceModifier ? Number(lowerBound.confidenceModifier) : 0;
        const upperConfidenceMod = upperBound.confidenceModifier ? Number(upperBound.confidenceModifier) : 0;
        const confidenceModifier = Math.min(lowerConfidenceMod, upperConfidenceMod);
        
        const proximityToExact = 1 - Math.min(
          Math.abs(rating - lowerSourceRating),
          Math.abs(rating - upperSourceRating)
        ) / (upperSourceRating - lowerSourceRating);
        
        return {
          rating: interpolatedRating,
          confidence: Math.min(100, Math.max(70, 85 + confidenceModifier + (proximityToExact * 10))),
          source: 'interpolation',
          originalRating: rating,
          originalSystem: fromSystemCode
        };
      }
      
      // If we don't have interpolation data, use mathematical conversion as fallback
      const mathConversion = this.mathematicalConversion(fromSystemCode, toSystemCode, rating);
      
      return {
        ...mathConversion,
        originalRating: rating,
        originalSystem: fromSystemCode
      };
    } catch (error) {
      console.error("Error converting rating:", error);
      // Fallback to mathematical conversion on error
      const mathConversion = this.mathematicalConversion(fromSystemCode, toSystemCode, rating);
      
      return {
        ...mathConversion,
        originalRating: rating,
        originalSystem: fromSystemCode
      };
    }
  }

  /**
   * Convert a rating from any system to CourtIQ's internal 1000-2500 scale
   */
  async convertToInternalScale(
    systemCode: string, 
    rating: number,
    userId: number,
    format: string = "all",
    division: string = "all"
  ): Promise<number> {
    // If already in internal scale (COURTIQ), return as is
    if (systemCode === RATING_SYSTEMS.COURTIQ) {
      return rating;
    }
    
    const result = await this.convertRating(systemCode, RATING_SYSTEMS.COURTIQ, rating);
    
    // Record this external rating for the user
    try {
      const systemResult = await db.execute(
        sql`SELECT * FROM rating_systems WHERE code = ${systemCode} LIMIT 1`
      ) as unknown as SqlResult;
      const system = systemResult[0] as SqlResultRow;
      
      if (system) {
        // Insert the external rating
        await db.execute(
          sql`INSERT INTO user_external_ratings (
            user_id, system_id, rating, 
            division_context, format_context, source_type
          ) VALUES (
            ${userId}, ${system.id}, ${rating.toString()}, 
            ${division === "all" ? null : division}, 
            ${format === "all" ? null : format}, 
            'user_provided'
          )`
        );
      }
    } catch (error) {
      console.error("Error recording external rating:", error);
      // Non-blocking - we'll continue even if recording fails
    }
    
    return result.rating;
  }

  /**
   * Convert a user's CourtIQ internal rating to another system
   */
  async convertUserRatingToSystem(
    userId: number, 
    toSystemCode: string,
    format: string = "singles",
    division: string = "19+"
  ): Promise<ConversionResult> {
    try {
      // Get the user's internal rating
      const userRatingResult = await db.execute(
        sql`SELECT * FROM player_ratings 
            WHERE user_id = ${userId} 
            AND format = ${format} 
            AND division = ${division} 
            LIMIT 1`
      ) as unknown as SqlResult;
      const userRating = userRatingResult[0] as SqlResultRow;
      
      if (!userRating) {
        throw new Error(`No rating found for user ID ${userId} in ${format}/${division}`);
      }
      
      // Convert to the requested system
      return this.convertRating(RATING_SYSTEMS.COURTIQ, toSystemCode, Number(userRating.rating));
    } catch (error) {
      console.error("Error converting user rating:", error);
      throw error;
    }
  }

  /**
   * Mathematical conversion as a fallback when lookup table doesn't have data
   * This uses standard formulas for converting between systems based on documentation
   */
  private mathematicalConversion(
    fromSystemCode: string,
    toSystemCode: string,
    rating: number
  ): ConversionResult {
    let convertedRating: number;
    let confidence = 65; // Base confidence for mathematical conversions
    
    // From DUPR to other systems
    if (fromSystemCode === RATING_SYSTEMS.DUPR) {
      if (toSystemCode === RATING_SYSTEMS.COURTIQ) {
        // DUPR (2.0-7.0) to CourtIQ (1000-2500)
        convertedRating = 850 + (rating - 2.0) * 330;
      } else if (toSystemCode === RATING_SYSTEMS.IFP) {
        // DUPR (2.0-7.0) to IFP (1.0-5.0)
        convertedRating = Math.max(1.0, Math.min(5.0, (rating - 2.0) * 0.8 + 1.0));
      } else if (toSystemCode === RATING_SYSTEMS.UTPR) {
        // DUPR (2.0-7.0) to UTPR (2.5-6.0)
        convertedRating = Math.max(2.5, Math.min(6.0, (rating - 2.0) * 0.7 + 2.5));
      } else if (toSystemCode === RATING_SYSTEMS.WPR) {
        // DUPR (2.0-7.0) to WPR (0-10.0)
        convertedRating = Math.max(0, Math.min(10.0, (rating - 2.0) * 2.0));
      } else if (toSystemCode === RATING_SYSTEMS.IPTPA) {
        // DUPR (2.0-7.0) to IPTPA (1.0-5.0)
        convertedRating = Math.max(1.0, Math.min(5.0, (rating - 2.0) * 0.8 + 1.0));
      } else {
        throw new Error(`Unsupported conversion from ${fromSystemCode} to ${toSystemCode}`);
      }
    }
    // From CourtIQ to other systems
    else if (fromSystemCode === RATING_SYSTEMS.COURTIQ) {
      const normalizedRating = (rating - 1000) / 1500; // 0-1 scale
      
      if (toSystemCode === RATING_SYSTEMS.DUPR) {
        // CourtIQ (1000-2500) to DUPR (2.0-7.0)
        convertedRating = 2.0 + normalizedRating * 5.0;
      } else if (toSystemCode === RATING_SYSTEMS.IFP) {
        // CourtIQ (1000-2500) to IFP (1.0-5.0)
        convertedRating = 1.0 + normalizedRating * 4.0;
      } else if (toSystemCode === RATING_SYSTEMS.UTPR) {
        // CourtIQ (1000-2500) to UTPR (2.5-6.0)
        convertedRating = 2.5 + normalizedRating * 3.5;
      } else if (toSystemCode === RATING_SYSTEMS.WPR) {
        // CourtIQ (1000-2500) to WPR (0-10.0)
        convertedRating = normalizedRating * 10.0;
      } else if (toSystemCode === RATING_SYSTEMS.IPTPA) {
        // CourtIQ (1000-2500) to IPTPA (1.0-5.0)
        convertedRating = 1.0 + normalizedRating * 4.0;
      } else {
        throw new Error(`Unsupported conversion from ${fromSystemCode} to ${toSystemCode}`);
      }
    }
    // Other conversions can be implemented as needed
    else {
      // For other systems, convert to CourtIQ first, then to target
      const toCourtIQ = this.mathematicalConversion(fromSystemCode, RATING_SYSTEMS.COURTIQ, rating);
      const result = this.mathematicalConversion(RATING_SYSTEMS.COURTIQ, toSystemCode, toCourtIQ.rating);
      
      // Reduce confidence for double conversion
      result.confidence = Math.max(50, toCourtIQ.confidence - 10);
      return result;
    }
    
    return {
      rating: Number(convertedRating.toFixed(2)),
      confidence,
      source: 'mathematical',
      originalRating: rating,
      originalSystem: fromSystemCode
    };
  }

  /**
   * Initialize the rating systems and conversion tables in the database
   */
  async initializeRatingSystems() {
    try {
      // Check if the systems are already initialized
      const existingSystemsResult = await db.execute(
        sql`SELECT * FROM rating_systems`
      ) as unknown as SqlResult;
      if (existingSystemsResult && existingSystemsResult.length > 0) {
        console.log("Rating systems already initialized");
        return existingSystemsResult;
      }

      // Define the rating systems
      const systemsToInsert = [
        {
          code: RATING_SYSTEMS.COURTIQ,
          name: "CourtIQ Rating",
          minRating: 1000,
          maxRating: 2500,
          decimals: 0,
          description: "Pickle+ internal rating system (1000-2500)",
          isActive: true
        },
        {
          code: RATING_SYSTEMS.DUPR,
          name: "Dynamic Universal Pickleball Rating",
          minRating: 2.0,
          maxRating: 7.0,
          decimals: 2,
          description: "DUPR rating system (2.0-7.0)",
          websiteUrl: "https://mydupr.com",
          isActive: true
        },
        {
          code: RATING_SYSTEMS.IFP,
          name: "International Federation of Pickleball",
          minRating: 1.0,
          maxRating: 5.0,
          decimals: 1,
          description: "IFP rating system (1.0-5.0)",
          websiteUrl: "https://ifpickleball.org",
          isActive: true
        },
        {
          code: RATING_SYSTEMS.UTPR,
          name: "USA Pickleball Tournament Player Rating",
          minRating: 2.5,
          maxRating: 6.0,
          decimals: 1,
          description: "UTPR rating system (2.5-6.0)",
          websiteUrl: "https://usapickleball.org",
          isActive: true
        },
        {
          code: RATING_SYSTEMS.WPR,
          name: "World Pickleball Rating",
          minRating: 0.0,
          maxRating: 10.0,
          decimals: 1,
          description: "WPR rating system (0-10.0)",
          isActive: true
        },
        {
          code: RATING_SYSTEMS.IPTPA,
          name: "International Pickleball Teaching Professional Association",
          minRating: 1.0,
          maxRating: 5.0,
          decimals: 1,
          description: "IPTPA rating system (1.0-5.0)",
          websiteUrl: "https://iptpa.com",
          isActive: true
        }
      ];

      // Insert the systems
      const systemsInsertResults = [];
      const systemMap = {} as Record<string, number>;
      
      // Insert each system and track IDs
      for (const system of systemsToInsert) {
        const result = await db.execute(
          sql`INSERT INTO rating_systems (
            code, name, min_rating, max_rating, decimals, description, is_active, 
            website_url
          ) VALUES (
            ${system.code}, 
            ${system.name}, 
            ${system.minRating.toString()}, 
            ${system.maxRating.toString()}, 
            ${system.decimals}, 
            ${system.description}, 
            ${system.isActive},
            ${system.websiteUrl || null}
          ) RETURNING *`
        ) as unknown as SqlResult;
        
        const insertedSystem = result[0] as SqlResultRow;
        systemsInsertResults.push(insertedSystem);
        systemMap[insertedSystem.code as string] = insertedSystem.id as number;
      }

      // Define conversion mappings (reference points for interpolation)
      // DUPR to CourtIQ conversions
      const duprToCourtIQConversions = [
        { sourceRating: 2.0, targetRating: 1000 },
        { sourceRating: 2.5, targetRating: 1100 },
        { sourceRating: 3.0, targetRating: 1200 },
        { sourceRating: 3.5, targetRating: 1350 },
        { sourceRating: 4.0, targetRating: 1500 },
        { sourceRating: 4.5, targetRating: 1700 },
        { sourceRating: 5.0, targetRating: 1900 },
        { sourceRating: 5.5, targetRating: 2100 },
        { sourceRating: 6.0, targetRating: 2300 },
        { sourceRating: 6.5, targetRating: 2400 },
        { sourceRating: 7.0, targetRating: 2500 }
      ];

      // Insert DUPR to CourtIQ conversions
      for (const conv of duprToCourtIQConversions) {
        await db.execute(
          sql`INSERT INTO rating_conversions (
            from_system_id, to_system_id, source_rating, 
            target_rating, confidence_modifier
          ) VALUES (
            ${systemMap[RATING_SYSTEMS.DUPR]}, 
            ${systemMap[RATING_SYSTEMS.COURTIQ]}, 
            ${conv.sourceRating.toString()}, 
            ${conv.targetRating.toString()}, 
            0
          )`
        );
      }

      // Add more conversion mappings for other systems
      
      console.log("Rating systems initialized successfully");
      return systemsInsertResults;
    } catch (error) {
      console.error("Error initializing rating systems:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const ratingConverter = new RatingConverter();