/**
 * Initialize the CourtIQ™ Mastery Paths tier system
 * Sprint: PKL-278651-RATE-0004-MADV
 * 
 * This script creates the initial tier structure and rules for the Mastery Paths system
 */

import { db } from "../../db";
import { count, eq, sql } from "drizzle-orm";
import { 
  masteryTiers, 
  masteryRules,
  insertMasteryTierSchema,
  insertMasteryRuleSchema,
  InsertMasteryTier
} from "../../../shared/courtiq-schema";
import { 
  MasteryPath, 
  MasteryTierName, 
  DEFAULT_TIER_COLORS, 
  DEFAULT_TIER_TAGLINES,
  TIER_RATING_RANGES
} from "../../../shared/mastery-paths";

/**
 * Convert rating from 0-9 scale to internal 1000-2500 scale
 */
function convertRatingToInternalScale(rating: number): number {
  // Convert from 0-9 scale to 0-5 scale
  const zeroToFive = rating / 1.8;
  // Convert from 0-5 scale to 1000-2500 scale
  return Math.round(1000 + (zeroToFive * 300));
}

/**
 * Initialize Mastery Tiers with default values
 */
export async function initializeMasteryTiers(): Promise<void> {
  // Check if tiers already exist
  const existingTiers = await db.select({ count: sql<number>`count(*)` })
    .from(masteryTiers)
    .execute();
  
  if (existingTiers[0] && existingTiers[0].count > 0) {
    console.log(`Mastery Tiers already initialized (${existingTiers[0].count} tiers found)`);
    return;
  }
  
  console.log("Initializing Mastery Paths tier system...");
  
  // Define the tiers
  const tiers: InsertMasteryTier[] = [
    // Foundation Path
    {
      name: "Explorer" as MasteryTierName,
      path: "Foundation" as MasteryPath,
      displayName: "Explorer",
      tagline: DEFAULT_TIER_TAGLINES["Explorer"],
      minRating: convertRatingToInternalScale(TIER_RATING_RANGES["Explorer"][0]),
      maxRating: convertRatingToInternalScale(TIER_RATING_RANGES["Explorer"][1]),
      colorCode: DEFAULT_TIER_COLORS["Explorer"],
      description: "Beginning your pickleball adventure. Focus on basic skills and having fun.",
      order: 1,
      iconName: "explore"
    },
    {
      name: "Pathfinder" as MasteryTierName,
      path: "Foundation" as MasteryPath,
      displayName: "Pathfinder",
      tagline: DEFAULT_TIER_TAGLINES["Pathfinder"],
      minRating: convertRatingToInternalScale(TIER_RATING_RANGES["Pathfinder"][0]),
      maxRating: convertRatingToInternalScale(TIER_RATING_RANGES["Pathfinder"][1]),
      colorCode: DEFAULT_TIER_COLORS["Pathfinder"],
      description: "Developing consistent play with improved mechanics and strategic awareness.",
      order: 2,
      iconName: "map"
    },
    {
      name: "Trailblazer" as MasteryTierName,
      path: "Foundation" as MasteryPath,
      displayName: "Trailblazer",
      tagline: DEFAULT_TIER_TAGLINES["Trailblazer"],
      minRating: convertRatingToInternalScale(TIER_RATING_RANGES["Trailblazer"][0]),
      maxRating: convertRatingToInternalScale(TIER_RATING_RANGES["Trailblazer"][1]),
      colorCode: DEFAULT_TIER_COLORS["Trailblazer"],
      description: "Establishing solid fundamentals with consistent serves and returns.",
      order: 3,
      iconName: "milestone"
    },
    
    // Evolution Path
    {
      name: "Challenger" as MasteryTierName,
      path: "Evolution" as MasteryPath,
      displayName: "Challenger",
      tagline: DEFAULT_TIER_TAGLINES["Challenger"],
      minRating: convertRatingToInternalScale(TIER_RATING_RANGES["Challenger"][0]),
      maxRating: convertRatingToInternalScale(TIER_RATING_RANGES["Challenger"][1]),
      colorCode: DEFAULT_TIER_COLORS["Challenger"],
      description: "Ready to challenge stronger opponents with elevated tactical play.",
      order: 4,
      iconName: "shield"
    },
    {
      name: "Innovator" as MasteryTierName,
      path: "Evolution" as MasteryPath,
      displayName: "Innovator",
      tagline: DEFAULT_TIER_TAGLINES["Innovator"],
      minRating: convertRatingToInternalScale(TIER_RATING_RANGES["Innovator"][0]),
      maxRating: convertRatingToInternalScale(TIER_RATING_RANGES["Innovator"][1]),
      colorCode: DEFAULT_TIER_COLORS["Innovator"],
      description: "Developing creative shots and a distinctive playing style.",
      order: 5,
      iconName: "lightbulb"
    },
    {
      name: "Tactician" as MasteryTierName,
      path: "Evolution" as MasteryPath,
      displayName: "Tactician",
      tagline: DEFAULT_TIER_TAGLINES["Tactician"],
      minRating: convertRatingToInternalScale(TIER_RATING_RANGES["Tactician"][0]),
      maxRating: convertRatingToInternalScale(TIER_RATING_RANGES["Tactician"][1]),
      colorCode: DEFAULT_TIER_COLORS["Tactician"],
      description: "Mastering court positioning and advanced strategy.",
      order: 6,
      iconName: "chess-knight"
    },
    
    // Pinnacle Path
    {
      name: "Virtuoso" as MasteryTierName,
      path: "Pinnacle" as MasteryPath,
      displayName: "Virtuoso",
      tagline: DEFAULT_TIER_TAGLINES["Virtuoso"],
      minRating: convertRatingToInternalScale(TIER_RATING_RANGES["Virtuoso"][0]),
      maxRating: convertRatingToInternalScale(TIER_RATING_RANGES["Virtuoso"][1]),
      colorCode: DEFAULT_TIER_COLORS["Virtuoso"],
      description: "Displaying exceptional shot selection and execution under pressure.",
      order: 7,
      iconName: "diamond"
    },
    {
      name: "Luminary" as MasteryTierName,
      path: "Pinnacle" as MasteryPath,
      displayName: "Luminary",
      tagline: DEFAULT_TIER_TAGLINES["Luminary"],
      minRating: convertRatingToInternalScale(TIER_RATING_RANGES["Luminary"][0]),
      maxRating: convertRatingToInternalScale(TIER_RATING_RANGES["Luminary"][1]),
      colorCode: DEFAULT_TIER_COLORS["Luminary"],
      description: "Illuminating the court with brilliance, competing at advanced tournament levels.",
      order: 8,
      iconName: "star"
    },
    {
      name: "Legend" as MasteryTierName,
      path: "Pinnacle" as MasteryPath,
      displayName: "Legend",
      tagline: DEFAULT_TIER_TAGLINES["Legend"],
      minRating: convertRatingToInternalScale(TIER_RATING_RANGES["Legend"][0]),
      maxRating: convertRatingToInternalScale(TIER_RATING_RANGES["Legend"][1]),
      colorCode: DEFAULT_TIER_COLORS["Legend"],
      description: "Elite mastery of all aspects of pickleball, defining the pinnacle of excellence.",
      order: 9,
      iconName: "crown"
    }
  ];
  
  // Insert the tiers into the database
  for (const tier of tiers) {
    const parsedTier = insertMasteryTierSchema.parse(tier);
    await db.insert(masteryTiers).values(parsedTier).execute();
  }
  
  console.log(`Created ${tiers.length} Mastery Tiers`);
  
  // Now initialize the tier-specific rules
  await initializeTierRules();
}

/**
 * Initialize Tier Rules for each Mastery Tier
 */
async function initializeTierRules(): Promise<void> {
  // Get all the tiers from the database
  const tiers = await db.select().from(masteryTiers).execute();
  
  // Check if rules already exist
  const existingRules = await db.select({ count: sql<number>`count(*)` })
    .from(masteryRules)
    .execute();
  
  if (existingRules[0] && existingRules[0].count > 0) {
    console.log(`Mastery Rules already initialized (${existingRules[0].count} rules found)`);
    return;
  }
  
  console.log("Initializing Mastery Path Rules...");
  
  for (const tier of tiers) {
    // Define path-specific rules
    let rules;
    
    if (tier.path === "Foundation") {
      // Foundation Path: Accelerated promotion, strong demotion protection
      rules = {
        tierId: tier.id,
        // Promotion rules
        promotionMatchesRequired: 3, // Only 3 matches needed above threshold
        promotionRequiresConsecutive: false,
        promotionCelebrationLevel: tier.order === 3 ? "enhanced" : "basic", // Enhanced celebration for path completion
        promotionStartingPositionPct: 15, // Start in the lower part of the next tier
        // Demotion rules
        demotionGracePeriod: 10, // Generous grace period
        demotionMatchesRequired: 8, // Need 8 matches below threshold to demote
        demotionRequiresConsecutive: false,
        inactivityThresholdDays: null, // No inactivity threshold for Foundation path
        demotionBufferZonePct: 20, // Large buffer zone
        // Rating parameters
        baseKFactor: 40, // Higher K factor for faster growth
        minRatingGain: 10, // Higher minimum gain
        maxRatingGain: 60, // Higher maximum gain
        minRatingLoss: 0, // No rating loss for Explorer tier
        maxRatingLoss: tier.name === "Explorer" ? 0 : 15, // Limited loss for other tiers
        underperformanceMultiplier: "0.50", // Reduced penalty (as string for decimal type)
        overperformanceMultiplier: "1.80", // Bonus for beating higher-rated players (as string for decimal type)
        // Features unlocked
        features: [
          "match_recording",
          "basic_statistics",
          "skill_development_tips",
          "community_features"
        ] 
      };
    } else if (tier.path === "Evolution") {
      // Evolution Path: Standard balanced approach
      rules = {
        tierId: tier.id,
        // Promotion rules
        promotionMatchesRequired: 4, // Standard 4 matches needed above threshold
        promotionRequiresConsecutive: tier.order > 5, // Higher tier needs consecutive wins
        promotionCelebrationLevel: tier.order === 6 ? "enhanced" : "basic", // Enhanced celebration for path completion
        promotionStartingPositionPct: 20, // Standard starting position
        // Demotion rules
        demotionGracePeriod: 7, // Standard grace period
        demotionMatchesRequired: 6, // Standard threshold
        demotionRequiresConsecutive: false,
        inactivityThresholdDays: 60, // Two months inactivity warning
        demotionBufferZonePct: 15, // Standard buffer zone
        // Rating parameters
        baseKFactor: 32, // Standard K factor
        minRatingGain: 8,
        maxRatingGain: 50,
        minRatingLoss: 5,
        maxRatingLoss: 25,
        underperformanceMultiplier: "1.00", // Standard multiplier (as string for decimal type)
        overperformanceMultiplier: "1.50", // Good bonus for upsets (as string for decimal type)
        // Features unlocked
        features: [
          "match_recording",
          "advanced_statistics",
          "performance_analysis",
          "match_history_insights",
          "community_features",
          "basic_coaching_tools"
        ]
      };
    } else {
      // Pinnacle Path: Rigorous validation
      rules = {
        tierId: tier.id,
        // Promotion rules
        promotionMatchesRequired: tier.order < 9 ? 5 : 7, // 5-7 matches needed (harder at top tiers)
        promotionRequiresConsecutive: true, // Requires consecutive wins
        promotionCelebrationLevel: tier.order === 9 ? "premium" : "enhanced", // Premium celebration for Legend tier
        promotionStartingPositionPct: 25, // Start in the lower-mid part of the next tier
        // Demotion rules
        demotionGracePeriod: 5, // Limited grace period
        demotionMatchesRequired: 5, // Quicker demotion
        demotionRequiresConsecutive: false,
        inactivityThresholdDays: 45, // 45 days inactivity warning
        demotionBufferZonePct: 10, // Smaller buffer zone
        // Rating parameters
        baseKFactor: 24, // Lower K factor (more stable ratings)
        minRatingGain: 5,
        maxRatingGain: 40,
        minRatingLoss: 8,
        maxRatingLoss: 35,
        underperformanceMultiplier: "1.20", // Higher penalty for underperformance (as string for decimal type)
        overperformanceMultiplier: "1.30", // Smaller bonus (harder to move up) (as string for decimal type)
        // Features unlocked
        features: [
          "match_recording",
          "advanced_statistics",
          "performance_analysis", 
          "match_history_insights",
          "community_features",
          "advanced_coaching_tools",
          "tournament_tools",
          "video_analysis",
          "exclusive_events"
        ]
      };
    }
    
    // Insert the rules into the database
    const parsedRules = insertMasteryRuleSchema.parse(rules);
    await db.insert(masteryRules).values(parsedRules).execute();
  }
  
  console.log(`Created rules for ${tiers.length} Mastery Tiers`);
}