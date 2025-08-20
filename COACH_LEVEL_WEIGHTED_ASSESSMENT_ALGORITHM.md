# Coach Level Weighted Assessment Algorithm Design

## Overview
This algorithm introduces differential weighting based on coach certification levels (L1-L5) to enhance PCP rating accuracy through expert assessment validation. Higher-level coaches receive greater influence on a player's final PCP rating due to their enhanced training, experience, and assessment capabilities.

**CRITICAL QUALITY REQUIREMENT:** All player PCP ratings remain **PROVISIONAL** until validated by at least one L4+ coach assessment. Only L4 and L5 coaches possess the expertise required to provide **CONFIRMED** ratings that establish a player's official PCP standing.

## Core Algorithm Structure

### 1. Coach Level Weight Matrix
```
L1 Coach: 0.7x base weight (minimal influence - foundational assessment)
L2 Coach: 1.0x weight (standard baseline - enhanced technical knowledge)
L3 Coach: 1.8x weight (80% increase - advanced tactical understanding)
L4 Coach: 3.2x weight (220% increase - expert-level analysis)
L5 Coach: 3.8x weight (280% increase - master-level assessment authority)
```

### 2. Assessment Confidence Factors
Each coach level has different confidence ratings for skill categories:

**L1 Coaches (Foundational)**
- Technical Skills: 0.8 confidence
- Tactical Skills: 0.7 confidence  
- Physical Skills: 0.9 confidence
- Mental Skills: 0.6 confidence

**L2 Coaches (Intermediate)**
- Technical Skills: 0.9 confidence
- Tactical Skills: 0.8 confidence
- Physical Skills: 0.9 confidence
- Mental Skills: 0.7 confidence

**L3 Coaches (Advanced)**
- Technical Skills: 0.95 confidence
- Tactical Skills: 0.9 confidence
- Physical Skills: 0.9 confidence
- Mental Skills: 0.8 confidence

**L4 Coaches (Expert)**
- Technical Skills: 0.98 confidence
- Tactical Skills: 0.95 confidence
- Physical Skills: 0.92 confidence
- Mental Skills: 0.9 confidence

**L5 Coaches (Master)**
- Technical Skills: 1.0 confidence
- Tactical Skills: 0.98 confidence
- Physical Skills: 0.95 confidence
- Mental Skills: 0.95 confidence

### 3. Multi-Coach Assessment Aggregation

When multiple coaches assess the same player:

```
Weighted_PCP = Σ(Coach_PCP × Coach_Weight × Confidence_Factor) / Σ(Coach_Weight × Confidence_Factor)
```

Where:
- `Coach_PCP` = Individual coach's assessment rating
- `Coach_Weight` = Level-based multiplier (1.0x to 2.5x)
- `Confidence_Factor` = Category-specific confidence for that coach level

### 4. Temporal Decay and Recency Weighting

Recent assessments from higher-level coaches carry more weight:

```
Time_Weight = max(0.5, 1.0 - (days_since_assessment / 90))
Final_Weight = Coach_Weight × Confidence_Factor × Time_Weight
```

### 5. Assessment Validation Thresholds & Rating Status

**PROVISIONAL RATINGS (L1-L3 Only):**
- All assessments from L1-L3 coaches produce PROVISIONAL ratings
- Provisional ratings are temporary and must be confirmed by L4+ assessment
- Provisional status displayed prominently in all interfaces
- Limited validity period: 60 days maximum before requiring L4+ confirmation

**CONFIRMED RATINGS (L4+ Required):**
- Only L4 and L5 coaches can establish CONFIRMED PCP ratings
- L4/L5 assessment immediately validates any existing provisional assessments
- Confirmed ratings valid for 120 days
- Official tournament eligibility requires CONFIRMED rating status

**Validation Timeline Requirements:**
- L1-L2 assessments: Require L4+ confirmation within 60 days
- L3 assessments: Require L4+ confirmation within 90 days  
- L4+ assessments: Provide immediate confirmation status
- Expired provisional ratings: Must be re-assessed by L4+ coach

### 6. Skill Category Expertise Zones

Different coach levels have enhanced authority in specific areas:

**L4/L5 Enhanced Authority:**
- Advanced tactical pattern recognition
- High-pressure performance analysis
- Complex technical fault diagnosis

**L3+ Enhanced Authority:**
- Multi-dimensional skill correlation
- Game situation assessment
- Strategic development planning

**All Levels Equal Authority:**
- Basic technical execution
- Fundamental physical attributes
- Observable behavioral traits

## Implementation Formula

```javascript
function calculateWeightedPCP(assessments) {
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (let assessment of assessments) {
    const baseWeight = getCoachLevelWeight(assessment.coachLevel);
    const confidenceFactors = getConfidenceFactors(assessment.coachLevel);
    const timeWeight = calculateTimeWeight(assessment.date);
    
    for (let category of ['technical', 'tactical', 'physical', 'mental']) {
      const categoryScore = assessment.scores[category];
      const categoryConfidence = confidenceFactors[category];
      const finalWeight = baseWeight * categoryConfidence * timeWeight;
      
      totalWeightedScore += categoryScore * finalWeight;
      totalWeight += finalWeight;
    }
  }
  
  return totalWeightedScore / totalWeight;
}
```

## Quality Assurance Mechanisms

### 1. Outlier Detection
- Flag assessments >2 standard deviations from weighted mean
- Require L4+ review for significant rating changes
- Auto-expire assessments with low confidence scores

### 2. Coach Calibration System
- Periodic cross-validation between coach levels
- Accuracy tracking against expert L5 assessments
- Dynamic confidence factor adjustment

### 3. Student Progression Validation
- Track improvement correlation with coaching level
- Validate assessment accuracy against match performance
- Identify coaching blind spots for development

## Benefits of This System

1. **Enhanced Accuracy:** Higher-level coaches with proven expertise carry appropriate influence
2. **Quality Control:** Multi-level validation prevents assessment errors
3. **Continuous Improvement:** System learns from expert assessments
4. **Fair Representation:** All coaches contribute while recognizing expertise levels
5. **Temporal Relevance:** Recent assessments from qualified coaches carry most weight

## Next Steps for Implementation

1. Create weighted assessment calculation utilities
2. Build coach level validation middleware
3. Implement multi-coach aggregation system
4. Design assessment confidence tracking
5. Create coach calibration dashboard

This algorithm ensures that player PCP ratings reflect the most accurate and expert-validated assessments while maintaining the integrity of the existing 55-skill framework.