# PCP Rating Calculation Algorithm - Official Documentation

## Overview
This document defines the standardized algorithm for calculating Player Competency Profile (PCP) ratings based on 55-skill coach assessments. This algorithm is part of the Unified Development Framework (UDF) and must be consistently implemented across all platform components.

## Algorithm Specification

### Input Data Structure
**55-Skill Assessment Categories:**
- **Groundstrokes/Serves (Technical)**: 11 skills
- **Dinks/Resets (Touch)**: 16 skills  
- **Volleys/Smashes (Power)**: 6 skills
- **Footwork/Fitness (Athletic)**: 10 skills
- **Mental Game (Mental)**: 10 skills

Each skill rated 1-10 by certified coaches.

### Category Weighting System
Based on pickleball strategic importance and skill impact analysis:

```javascript
const PCP_WEIGHTS = {
  TOUCH: 0.30,      // Dinks/Resets - Most critical for competitive play
  TECHNICAL: 0.25,  // Groundstrokes/Serves - Foundation skills
  MENTAL: 0.20,     // Mental Game - Separates good from great players
  ATHLETIC: 0.15,   // Footwork/Fitness - Enables all other skills
  POWER: 0.10       // Volleys/Smashes - Important but situational
};
```

### Core Calculation Formula

```javascript
function calculatePCPRating(assessmentData) {
  // 1. Calculate category averages
  const categoryAverages = {
    technical: calculateCategoryAverage(assessmentData, 'Groundstrokes and Serves'),
    touch: calculateCategoryAverage(assessmentData, 'Dinks and Resets'),
    power: calculateCategoryAverage(assessmentData, 'Volleys and Smashes'),
    athletic: calculateCategoryAverage(assessmentData, 'Footwork & Fitness'),
    mental: calculateCategoryAverage(assessmentData, 'Mental Game')
  };
  
  // 2. Apply weighted calculation
  const rawScore = (
    categoryAverages.touch * PCP_WEIGHTS.TOUCH +
    categoryAverages.technical * PCP_WEIGHTS.TECHNICAL +
    categoryAverages.mental * PCP_WEIGHTS.MENTAL +
    categoryAverages.athletic * PCP_WEIGHTS.ATHLETIC +
    categoryAverages.power * PCP_WEIGHTS.POWER
  );
  
  // 3. Scale to PCP range (2.0 - 8.0)
  const pcpRating = 2.0 + (rawScore - 1.0) * (6.0 / 9.0);
  
  // 4. Round to 1 decimal place
  return Math.round(pcpRating * 10) / 10;
}
```

### Category Average Calculation

```javascript
function calculateCategoryAverage(assessmentData, categoryName) {
  const categorySkills = SKILL_CATEGORIES[categoryName];
  let totalScore = 0;
  let skillCount = 0;
  
  categorySkills.forEach(skillName => {
    if (assessmentData[skillName] !== undefined) {
      totalScore += assessmentData[skillName];
      skillCount++;
    }
  });
  
  return skillCount > 0 ? totalScore / skillCount : 0;
}
```

### Skill Categories Mapping

```javascript
const SKILL_CATEGORIES = {
  'Groundstrokes and Serves': [
    'Serve Power', 'Serve Placement', 'Forehand Flat Drive', 'Forehand Topspin Drive',
    'Forehand Slice', 'Backhand Flat Drive', 'Backhand Topspin Drive', 'Backhand Slice',
    'Third Shot Drive', 'Forehand Return of Serve', 'Backhand Return of Serve'
  ],
  'Dinks and Resets': [
    'Forehand Topspin Dink', 'Forehand Dead Dink', 'Forehand Slice Dink', 'Backhand Topspin Dink',
    'Backhand Dead Dink', 'Backhand Slice Dink', 'Forehand Third Shot Drop', 'Forehand Top Spin Third Shot Drop',
    'Forehand Slice Third Shot Drop', 'Backhand Third Shot Drop', 'Backhand Top Spin Third Shot Drop',
    'Backhand Slice Third Shot Drop', 'Forehand Resets', 'Backhand Resets', 'Forehand Lob', 'Backhand Lob'
  ],
  'Volleys and Smashes': [
    'Forehand Punch Volley', 'Forehand Roll Volley', 'Backhand Punch Volley',
    'Backhand Roll Volley', 'Forehand Overhead Smash', 'Backhand Overhead Smash'
  ],
  'Footwork & Fitness': [
    'Split Step Readiness', 'Lateral Shuffles', 'Crossover Steps', 'Court Recovery',
    'First Step Speed', 'Balance & Core Stability', 'Agility', 'Endurance Conditioning',
    'Leg Strength & Power', 'Transition Speed (Baseline to Kitchen)'
  ],
  'Mental Game': [
    'Staying Present', 'Resetting After Errors', 'Patience & Shot Selection', 'Positive Self-Talk',
    'Visualization', 'Pressure Handling', 'Focus Shifts', 'Opponent Reading',
    'Emotional Regulation', 'Competitive Confidence'
  ]
};
```

## Validation Examples

### Example 1: Intermediate Player
```javascript
const assessmentData = {
  // Technical skills average: 6.0
  'Serve Power': 6, 'Serve Placement': 7, 'Forehand Flat Drive': 5, // etc.
  
  // Touch skills average: 7.0  
  'Forehand Topspin Dink': 7, 'Forehand Dead Dink': 8, // etc.
  
  // Power skills average: 5.0
  'Forehand Punch Volley': 5, 'Forehand Roll Volley': 4, // etc.
  
  // Athletic skills average: 6.0
  'Split Step Readiness': 6, 'Lateral Shuffles': 7, // etc.
  
  // Mental skills average: 6.5
  'Staying Present': 7, 'Resetting After Errors': 6, // etc.
};

// Calculation:
// rawScore = 7.0×0.30 + 6.0×0.25 + 6.5×0.20 + 6.0×0.15 + 5.0×0.10 = 6.35
// pcpRating = 2.0 + (6.35 - 1.0) × (6.0/9.0) = 5.6
```

## Implementation Requirements

### 1. UDF Compliance
- All PCP calculations MUST use this exact algorithm
- No component-specific variations allowed
- Changes require UDF documentation update

### 2. Data Validation
- Verify all 55 skills are present before calculation
- Handle missing skills appropriately (exclude from category average)
- Validate skill ratings are within 1-10 range

### 3. Consistency Checks
- PCP ratings must be between 2.0-8.0
- Round to exactly 1 decimal place
- Store both raw weighted score and final PCP rating

### 4. Audit Trail
- Log all PCP calculations with timestamp
- Store assessment data used for calculation
- Track coach who performed assessment

## Integration Points

### Database Storage
```sql
-- Add PCP rating fields to assessments table
ALTER TABLE match_pcp_assessments ADD COLUMN calculated_pcp_rating DECIMAL(3,1);
ALTER TABLE match_pcp_assessments ADD COLUMN raw_weighted_score DECIMAL(4,2);
ALTER TABLE match_pcp_assessments ADD COLUMN calculation_timestamp TIMESTAMP;
```

### API Response Format
```javascript
{
  "assessmentId": 123,
  "studentId": 456,
  "coachId": 789,
  "pcpRating": 5.6,
  "categoryBreakdown": {
    "technical": 6.0,
    "touch": 7.0,
    "power": 5.0,
    "athletic": 6.0,
    "mental": 6.5
  },
  "rawWeightedScore": 6.35,
  "calculationTimestamp": "2025-08-19T13:47:00Z"
}
```

## Version History
- **v1.0** (2025-08-19): Initial algorithm specification
- Weighted category approach with touch-emphasis
- 55-skill comprehensive assessment integration
- UDF framework compliance established

## Maintenance Notes
- Algorithm weights based on competitive pickleball analysis
- May require adjustment based on rating distribution data
- Changes must be backward compatible or include migration plan
- All implementations must be updated simultaneously

---
**Status**: ✅ APPROVED FOR IMPLEMENTATION  
**UDF Compliance**: ✅ VERIFIED  
**Last Updated**: August 19, 2025  
**Next Review**: January 2026