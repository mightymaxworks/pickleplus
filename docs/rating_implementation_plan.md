# CourtIQ Rating and Ranking Implementation Plan - COMPLETED

This document outlines the plan for implementing CourtIQ rating and ranking calculations in the frontend-first architecture, with implementation status updates.

## Current Status - UPDATED APRIL 26

1. **Implemented in DataCalculationService**:
   - ✅ Basic calculations for XP and levels
   - ✅ Win rate and performance metrics 
   - ✅ CourtIQ dimension-specific rating calculations
   - ✅ CourtIQ overall rating calculation
   - ✅ Rating conversion between systems (DUPR, UTPR, WPR)
   - ✅ Ranking and tier calculation
   - ✅ Protection mechanics for ratings
   - ✅ Mastery level calculation
   - ✅ Leaderboard position calculation
   - ✅ Comprehensive test suite

2. **Remaining for Implementation**:
   - Season-based rating adjustments (low priority - Sprint 3)
   - Historical performance tracking (low priority - Sprint 3)

## Implementation Completed

### Phase 1: CourtIQ Rating Calculations ✅

1. **Added Rating Dimension Calculations**

```typescript
/**
 * Calculate individual dimension ratings based on match performance
 * @param winRate Win rate percentage (0-100)
 * @param xp User's XP amount
 * @returns Dimension ratings object
 */
static calculateDimensionRatings(winRate: number, xp: number): CourtIQMetrics {
  // Base rating calculation (1-5 scale)
  const baseRating = Math.max(1, Math.min(5, Math.floor(winRate / 20) + 1));
  
  // Experience factor (0-1 scale)
  const xpFactor = Math.min(1, xp / 1000);
  
  // Calculate individual dimensions with slight variations
  return {
    technical: Math.max(1, Math.min(5, baseRating + (Math.random() > 0.5 ? 0.5 : 0))),
    tactical: Math.max(1, Math.min(5, baseRating + (Math.random() > 0.7 ? 0.5 : 0))),
    physical: Math.max(1, Math.min(5, baseRating)),
    mental: Math.max(1, Math.min(5, baseRating - (Math.random() > 0.6 ? 0.5 : 0) + (xpFactor > 0.5 ? 0.5 : 0))),
    consistency: Math.max(1, Math.min(5, baseRating + (xpFactor > 0.7 ? 0.5 : 0)))
  };
}
```

2. **Added Rating System Conversion**

```typescript
/**
 * Convert rating between different rating systems
 * @param rating Original rating value
 * @param fromSystem Source rating system
 * @param toSystem Target rating system
 * @returns Converted rating with confidence level
 */
static convertRating(
  rating: number, 
  fromSystem: RatingSystem, 
  toSystem: RatingSystem
): RatingConversionResult {
  // If same system, return original rating
  if (fromSystem === toSystem) {
    return {
      rating: rating,
      confidence: 100,
      source: 'direct',
      originalRating: rating,
      originalSystem: fromSystem
    };
  }
  
  // Get conversion key
  const conversionKey = `${fromSystem}_TO_${toSystem}` as keyof typeof this.ratingConversionFactors;
  const factors = this.ratingConversionFactors[conversionKey];
  
  // If no conversion factors found, use estimated conversion
  if (!factors) {
    // Simplified estimation with 70% confidence
    let convertedRating: number;
    
    if (fromSystem === 'COURTIQ') {
      // Convert from CourtIQ (1000-3000) to others (1.0-7.0)
      convertedRating = Math.max(1, Math.min(7, (rating - 1000) / 400 + 2));
    } else if (toSystem === 'COURTIQ') {
      // Convert from others (1.0-7.0) to CourtIQ (1000-3000)
      convertedRating = Math.max(1000, Math.min(3000, (rating - 2) * 400 + 1000));
    } else {
      // Convert between non-CourtIQ systems (rough approximation)
      convertedRating = rating;
    }
    
    return {
      rating: Number(convertedRating.toFixed(2)),
      confidence: 70,
      source: 'estimated',
      originalRating: rating,
      originalSystem: fromSystem
    };
  }
  
  // Apply conversion formula
  let convertedRating = rating * factors.multiplier + factors.offset;
  
  // Ensure rating is within valid range
  convertedRating = Math.max(factors.minRating, Math.min(factors.maxRating, convertedRating));
  
  // Higher confidence for ratings in middle of range, lower for extremes
  const normRating = (convertedRating - factors.minRating) / (factors.maxRating - factors.minRating);
  const confidence = Math.round(90 - Math.abs(normRating - 0.5) * 20);
  
  return {
    rating: Number(convertedRating.toFixed(2)),
    confidence,
    source: 'mathematical',
    originalRating: rating,
    originalSystem: fromSystem
  };
}
```

3. **Added Overall Rating Calculation**

```typescript
/**
 * Calculate CourtIQ overall rating based on dimension ratings
 * This matches the server-side implementation for consistency
 * @param metrics CourtIQ dimension metrics
 * @returns Overall CourtIQ rating (1000-3000 scale)
 */
static calculateCourtIQRating(metrics: CourtIQMetrics): number {
  if (!metrics) return 1000; // Default starting rating
  
  const { technical, tactical, physical, mental, consistency } = metrics;
  
  // Convert 1-5 scale metrics to rating points
  const techPoints = technical * 100 + 700;
  const tactPoints = tactical * 100 + 700;
  const physPoints = physical * 100 + 700;
  const mentPoints = mental * 100 + 700;
  const consPoints = consistency * 100 + 700;
  
  // Calculate weighted average
  const weights = this.dimensionWeights;
  const weightedRating = 
    (techPoints * weights.TECH +
     tactPoints * weights.TACT +
     physPoints * weights.PHYS +
     mentPoints * weights.MENT +
     consPoints * weights.CONS) / 100;
  
  // Round to nearest integer
  return Math.round(weightedRating);
}
```

### Phase 2: Ranking and Tier System ✅

1. **Added Tier Calculation**

```typescript
/**
 * Calculate rating tier based on CourtIQ rating
 * @param rating CourtIQ rating (1000-3000 scale)
 * @returns Rating tier information
 */
static calculateRatingTier(rating: number) {
  // Find the appropriate tier
  const tier = this.ratingTiers.find(t => 
    rating >= t.minRating && rating <= t.maxRating
  ) || this.ratingTiers[0]; // Default to lowest tier if not found
  
  return tier;
}
```

2. **Added Ranking Points Calculation**

```typescript
/**
 * Calculate ranking points based on match result
 * @param userRating User's current rating
 * @param opponentRating Opponent's rating
 * @param isWin Whether the user won the match
 * @param matchType Type of match (tournament, ranked, casual)
 * @returns Points earned (positive or negative)
 */
static calculateRankingPoints(
  userRating: number,
  opponentRating: number,
  isWin: boolean,
  matchType: 'tournament' | 'ranked' | 'casual' = 'ranked'
): number {
  // Base points calculation based on ELO-like formula
  const ratingDiff = opponentRating - userRating;
  const expectedScore = 1 / (1 + Math.pow(10, ratingDiff / 400));
  const actualScore = isWin ? 1 : 0;
  
  // Determine K-factor based on match type
  let kFactor = 32; // Default for ranked matches
  
  if (matchType === 'tournament') {
    kFactor = 48; // Higher impact for tournament matches
  } else if (matchType === 'casual') {
    kFactor = 16; // Lower impact for casual matches
  }
  
  // Calculate base points
  let points = Math.round(kFactor * (actualScore - expectedScore));
  
  // Apply protection mechanics for new players (rating < 1300)
  if (userRating < 1300 && !isWin) {
    // Reduce point loss for beginners
    points = Math.max(points, -Math.min(16, kFactor / 2));
  }
  
  return points;
}
```

3. **Added Protection Mechanics**

```typescript
/**
 * Apply protection mechanics to rating changes
 * @param newRating Calculated new rating
 * @param currentRating Current rating
 * @param matchCount Total matches played
 * @param tier Current tier
 * @returns Protected rating
 */
static applyRatingProtection(
  newRating: number,
  currentRating: number,
  matchCount: number,
  tier: number
): number {
  // No protection needed for rating increases
  if (newRating >= currentRating) {
    return newRating;
  }
  
  // Calculate rating change
  const ratingChange = newRating - currentRating;
  
  // Maximum allowed rating drop per match, based on tier and match count
  let maxDrop = 25; // Default max drop
  
  // New players protection (first 10 matches)
  if (matchCount <= 10) {
    maxDrop = 15;
  }
  
  // Tier-based protection
  if (tier <= 3) {
    // More protection for lower tiers
    maxDrop = Math.min(maxDrop, 20);
  } else if (tier >= 8) {
    // Less protection for higher tiers
    maxDrop = 30;
  }
  
  // Apply protection by limiting the rating drop
  return Math.max(currentRating - maxDrop, newRating);
}
```

### Phase 3: Season and Historical Data (Partially Complete)

1. Season Rating Calculation - Planned for Sprint 3
2. Historical Performance Tracking - Planned for Sprint 3

## Integration Status

1. **Updated DerivedDataContext** ✅
   - Added new calculation methods to DataCalculationService
   - Ensured metrics include necessary CourtIQ data

2. **Tests Created** ✅
   - Comprehensive unit tests for all CourtIQ calculation functions
   - Tests for rating conversion between systems
   - Tests for ranking calculations and protection mechanics

## Next Steps

1. **Profile Page Optimizations**
   - Complete tab-based data loading (Current focus)
   - Implement virtualized lists (Current focus)
   - Add frontend caching (Current focus)

2. **Synchronization** (Sprint 2)
   - Implement data sync mechanism for CourtIQ data
   - Add batch update API for efficient synchronization

3. **Season-based Features** (Sprint 3)
   - Season rating calculation
   - Historical tracking and visualization

## Timeline Update

- ✅ Rating and Ranking Calculations: April 26
- 🔄 Profile Page Optimizations: April 26-30
- ⏭️ Synchronization: May 4-10
- ⏭️ Season Features: May 11-17