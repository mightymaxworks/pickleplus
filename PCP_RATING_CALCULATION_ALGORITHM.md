# PCP Rating Calculation Algorithm - Official Documentation

## Overview
This document defines the standardized algorithm for calculating Player Competency Profile (PCP) ratings based on 55-skill coach assessments. This algorithm is part of the Unified Development Framework (UDF) and must be consistently implemented across all platform components.

## Algorithm Specification

### Progressive Assessment Model
**55-Skill Individual Tracking System:**
- **Groundstrokes/Serves (Technical)**: 11 skills
- **Dinks/Resets (Touch)**: 16 skills  
- **Volleys/Smashes (Power)**: 6 skills
- **Footwork/Fitness (Athletic)**: 10 skills
- **Mental Game (Mental)**: 10 skills

Each skill maintains its own persistent rating (1-10) that updates independently when assessed by certified coaches.

### Assessment Philosophy
**Focused Session Approach:**
- Coaches can assess any subset of skills during training sessions
- Individual skill ratings persist between sessions
- PCP rating calculated from current individual skill averages
- No requirement for complete 55-skill assessment each session

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

### Progressive Assessment Calculation

```javascript
function calculateEvolutionaryPCP(playerSkillProfile) {
  // 1. Calculate category averages from individual skill ratings
  const categoryAverages = {
    technical: calculateCategoryFromIndividualSkills(playerSkillProfile, 'Groundstrokes and Serves'),
    touch: calculateCategoryFromIndividualSkills(playerSkillProfile, 'Dinks and Resets'),
    power: calculateCategoryFromIndividualSkills(playerSkillProfile, 'Volleys and Smashes'),
    athletic: calculateCategoryFromIndividualSkills(playerSkillProfile, 'Footwork & Fitness'),
    mental: calculateCategoryFromIndividualSkills(playerSkillProfile, 'Mental Game')
  };
  
  // 2. Apply weighted calculation using most recent skill ratings
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

function calculateCategoryFromIndividualSkills(skillProfile, categoryName) {
  const categorySkills = SKILL_CATEGORIES[categoryName];
  let totalScore = 0;
  let skillCount = 0;
  
  categorySkills.forEach(skillName => {
    if (skillProfile[skillName] && skillProfile[skillName].currentRating) {
      totalScore += skillProfile[skillName].currentRating;
      skillCount++;
    }
  });
  
  return skillCount > 0 ? totalScore / skillCount : 0;
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

## Progressive Assessment Examples

### Example 1: Initial Comprehensive Assessment
```javascript
// Player starts with complete 55-skill baseline assessment
const initialSkillProfile = {
  'Serve Power': { currentRating: 6, lastAssessed: '2025-01-15', assessmentCount: 1 },
  'Forehand Topspin Dink': { currentRating: 7, lastAssessed: '2025-01-15', assessmentCount: 1 },
  // ... all 55 skills assessed
};
// Initial PCP: 5.2
```

### Example 2: Focused Dinks Session (Month 2)
```javascript
// Coach updates only dink skills during focused training
const updatedDinkSkills = {
  'Forehand Topspin Dink': { currentRating: 8, lastAssessed: '2025-02-20', assessmentCount: 2 },
  'Forehand Dead Dink': { currentRating: 7, lastAssessed: '2025-02-20', assessmentCount: 2 },
  // ... other dink skills improved
  // Technical, Power, Athletic, Mental skills retain previous ratings
};
// Updated PCP: 5.4 (Touch category improved, others unchanged)
```

### Example 3: Serve Training Session (Month 3)
```javascript
// Coach focuses on serve development
const updatedServeSkills = {
  'Serve Power': { currentRating: 7, lastAssessed: '2025-03-15', assessmentCount: 2 },
  'Serve Placement': { currentRating: 8, lastAssessed: '2025-03-15', assessmentCount: 2 },
  // All other skills retain their most recent ratings
};
// Updated PCP: 5.6 (Technical category improved)
```

### Example 4: Data Freshness Tracking
```javascript
const skillFreshness = {
  touch: { oldestAssessment: '2025-02-20', daysSince: 28, status: 'current' },
  technical: { oldestAssessment: '2025-03-15', daysSince: 5, status: 'current' },
  power: { oldestAssessment: '2025-01-15', daysSince: 95, status: 'stale' },
  athletic: { oldestAssessment: '2025-01-15', daysSince: 95, status: 'stale' },
  mental: { oldestAssessment: '2025-01-15', daysSince: 95, status: 'stale' }
};
// Recommendation: Assess Power and Athletic skills next session
```

## Implementation Requirements

### 1. UDF Compliance
- All PCP calculations MUST use this exact algorithm
- No component-specific variations allowed
- Changes require UDF documentation update

### 2. Progressive Assessment Data Management
- Store individual skill ratings with metadata (assessment date, coach, count)
- Use most recent rating for each skill in PCP calculation
- Track data freshness and recommend skill reassessment
- Validate skill ratings are within 1-10 range
- Require complete 55-skill baseline for new players

### 3. Consistency Checks
- PCP ratings must be between 2.0-8.0
- Round to exactly 1 decimal place
- Store both raw weighted score and final PCP rating

### 4. Individual Skill Tracking
- Maintain persistent rating for each of the 55 skills
- Track assessment history with timestamps and coach attribution
- Monitor skill improvement trends and regression detection
- Flag skills requiring reassessment based on data age

### 5. Quality Assurance
- Minimum assessment standards for new vs returning players
- Data freshness weighting (recent assessments weighted higher)
- Coach calibration tracking for rating consistency
- Confidence scoring based on assessment completeness and recency

## Integration Points

### Database Storage
```sql
-- Individual skill tracking table for progressive assessments
CREATE TABLE player_skill_ratings (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  skill_name VARCHAR(100) NOT NULL,
  current_rating DECIMAL(3,1) CHECK (current_rating >= 1.0 AND current_rating <= 10.0),
  assessment_count INTEGER DEFAULT 1,
  first_assessed TIMESTAMP DEFAULT NOW(),
  last_assessed TIMESTAMP DEFAULT NOW(),
  last_coach_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, skill_name)
);

-- Enhanced PCP assessments table
ALTER TABLE match_pcp_assessments ADD COLUMN calculated_pcp_rating DECIMAL(3,1);
ALTER TABLE match_pcp_assessments ADD COLUMN raw_weighted_score DECIMAL(4,2);
ALTER TABLE match_pcp_assessments ADD COLUMN calculation_timestamp TIMESTAMP;
ALTER TABLE match_pcp_assessments ADD COLUMN skills_assessed_count INTEGER;
ALTER TABLE match_pcp_assessments ADD COLUMN is_complete_assessment BOOLEAN DEFAULT FALSE;

-- Skill assessment history for audit trail
CREATE TABLE skill_assessment_history (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id),
  skill_name VARCHAR(100) NOT NULL,
  rating DECIMAL(3,1) NOT NULL,
  coach_id INTEGER REFERENCES users(id),
  assessment_date TIMESTAMP DEFAULT NOW(),
  session_notes TEXT,
  assessment_type VARCHAR(50) -- 'baseline', 'focused', 'comprehensive'
);
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
- **v2.0** (2025-08-19): Progressive Assessment Implementation
  - Individual skill persistence and tracking
  - Focused session assessment capability
  - Data freshness monitoring and quality assurance
  - Enhanced database schema for skill-level granularity

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