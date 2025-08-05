# PicklePlus Algorithm Document
**Version:** 2.0  
**Last Updated:** August 5, 2025  
**System:** Comprehensive Ranking Points & Pickle Points Algorithm

---

## 🎯 **EXECUTIVE SUMMARY**

The PicklePlus algorithm is a comprehensive scoring system that combines competitive ranking points with gamified Pickle Points rewards. The system uses multiple calculation methods with age-based multipliers, match type weights, and tournament tier scaling to create fair, engaging competition across all skill levels and demographics.

---

## 📊 **1. RANKING POINTS SYSTEM**

### **Base Point Structure**

| Result | Base Points | Description |
|--------|-------------|-------------|
| **Win** | 150 points | Standard victory reward |
| **Loss** | 75 points | Participation reward (50% of win) |

> **Note:** Our current CI/CD testing shows **two different base point systems** in use. We need to standardize this.

#### **Alternative Base Structure (StandardizedRankingService)**
| Result | Base Points |
|--------|-------------|
| **Win** | 3 points |
| **Loss** | 1 point |

### **Age Group Multipliers** ⚡

Age-based multipliers reward senior participation and acknowledge physical demands:

| Age Group | Multiplier | Reasoning |
|-----------|------------|-----------|
| **18-34** | 1.0x | Standard baseline |
| **35-49** | 1.1x | Early career professionals bonus |
| **50-59** | 1.3x | Masters division enhancement |
| **60-69** | 1.5x | Senior division significant boost |
| **70+** | 1.6x | Super senior maximum enhancement |

#### **Age Group Calculation**
- Automatic detection from player birth date
- Uses average multiplier for doubles matches
- Applied to final point calculation

### **Match Type Weight Factors** 🎾

Different match contexts receive scaled point rewards:

| Match Type | Weight | Points Adjustment | Competitive Value |
|------------|--------|-------------------|-------------------|
| **Casual** | 0.5x (50%) | Reduced rewards | Fun, practice matches |
| **League** | 0.75x (75%) | Moderate scaling | Regular competition |
| **Tournament** | 1.0x (100%) | Full points | Premier competition |

### **Competition Tier Multipliers** 🏆

Tournament scale dramatically affects point values:

| Tournament Tier | Multiplier | Example Events |
|-----------------|------------|----------------|
| **Club** | 1.0x | Local club events |
| **District** | 1.2x | Multi-club competitions |
| **City** | 1.5x | Municipal championships |
| **Provincial/State** | 2.0x | Regional championships |
| **Regional** | 2.5x | Multi-state competitions |
| **National** | 3.0x | National championships |
| **International** | 4.0x | World championships |

### **Final Ranking Points Calculation**

```
Final Points = Base Points × Age Multiplier × Match Type Weight × Tournament Tier Multiplier
```

#### **Calculation Examples:**

**Example 1: Young Tournament Player**
- Player: 25 years old, Tournament Singles Win
- Calculation: 150 × 1.0 × 1.0 × 2.0 = **300 points**

**Example 2: Senior League Player**
- Player: 65 years old, League Singles Win  
- Calculation: 150 × 1.5 × 0.75 × 1.0 = **169 points**

**Example 3: Masters National Championship**
- Player: 55 years old, Tournament Singles Win, National Event
- Calculation: 150 × 1.3 × 1.0 × 3.0 = **585 points**

---

## 🎮 **2. PICKLE POINTS SYSTEM**

### **Pickle Points vs Ranking Points**

| System | Purpose | Usage | Earning Method |
|--------|---------|-------|----------------|
| **Ranking Points** | Competitive standing | Tournament seeding, leaderboards | Match results only |
| **Pickle Points** | Gamification rewards | Equipment purchases, training access | Multiple activities |

### **Pickle Points Sources**

#### **Match-Based Rewards**
- **Tournament Win:** 50-200 Pickle Points
- **League Win:** 25-100 Pickle Points  
- **Casual Win:** 10-50 Pickle Points
- **Match Participation:** 5-25 Pickle Points (regardless of result)

#### **Activity-Based Rewards**
- **Training Session Completion:** 15-30 Pickle Points
- **Drill Practice:** 5-15 Pickle Points
- **Community Engagement:** 10-25 Pickle Points
- **Achievement Unlocks:** 25-100 Pickle Points

### **Pickle Points Redemption**
- Equipment discounts (10-30% off)
- Premium training content access
- Tournament entry fee reductions
- Coaching session credits
- Exclusive merchandise and apparel

---

## ⚙️ **3. ADMIN MANUAL OVERRIDE SYSTEM**

### **Override Capabilities**
Administrators can completely bypass automatic calculations for special circumstances:

#### **Separate Winner/Loser Control**
- **Winner Override:** 0-1000 points (independent of automatic calculation)
- **Loser Override:** 0-1000 points (independent of automatic calculation)  
- **Complete Bypass:** Manual points replace all automatic calculations

#### **Override Use Cases**
- **Exhibition Matches:** Custom point rewards for special events
- **Makeup Games:** Adjusted points for rescheduled critical matches
- **Penalty Adjustments:** Point corrections for rule violations
- **Special Achievements:** Bonus rewards for milestone performances

### **Competition Linking**
Administrators can link matches to specific competitions with automatic multiplier application:

- **Tournament Selection:** Dropdown shows all available competitions
- **Automatic Multipliers:** Tournament tier multipliers applied automatically
- **Venue Integration:** Location and event details displayed
- **Point Transparency:** Shows calculation breakdown with competition impact

---

## 📈 **4. MULTIPLE CALCULATION SYSTEMS**

### **Current Implementation Status**

We've identified **two different calculation systems** running simultaneously:

#### **System A: Match Recorder System**
- Base: 150 winner / 75 loser
- Age multipliers: 1.0x - 1.6x
- Used in QuickMatchRecorder

#### **System B: StandardizedRankingService**
- Base: 3 winner / 1 loser  
- Weight factors: 0.5x - 1.0x
- Tournament tiers: 1.0x - 4.0x

### **Standardization Needed**

**DISCUSSION POINT:** Which system should be the single source of truth?

**Option 1: High-Value System (System A)**
- Pro: More engaging with meaningful point totals
- Pro: Age group integration already working
- Con: May inflate point totals over time

**Option 2: Low-Value System (System B)**  
- Pro: More conservative, sustainable scaling
- Pro: Comprehensive tier system (7 levels)
- Con: May feel less rewarding to players

---

## 🔧 **5. TECHNICAL IMPLEMENTATION**

### **Age Group Detection**
```typescript
const getAgeGroup = (dateOfBirth: string): string => {
  const age = calculateAge(dateOfBirth);
  if (age >= 60) return '60+';
  if (age >= 50) return '50-59';
  if (age >= 35) return '35-49';
  return '18-34';
};
```

### **Point Calculation Engine**
```typescript
const calculateFinalPoints = (
  basePoints: number,
  ageMultiplier: number,
  matchTypeWeight: number,
  tournamentMultiplier: number
): number => {
  return Math.round(basePoints * ageMultiplier * matchTypeWeight * tournamentMultiplier);
};
```

### **Validation System**
The system includes comprehensive validation to ensure calculation consistency:

- **Test Coverage:** All age groups, match types, and tournament tiers tested
- **Edge Case Handling:** Zero points, maximum multipliers, decimal rounding
- **Audit Trail:** Complete transaction history for all point awards
- **Rollback Capability:** Admin can reverse incorrect point awards

---

## ❓ **DISCUSSION POINTS FOR FINALIZATION**

### **1. Base Point Standardization**
- **Question:** Should we use 150/75 or 3/1 base points?
- **Impact:** Affects all point totals across the platform
- **Recommendation Needed:** Single source of truth selection

### **2. Age Group Multiplier Refinement**
- **Current:** 1.0x to 1.6x range
- **Question:** Are these multipliers fair and motivating?
- **Consider:** Gender-specific multipliers needed?

### **3. Tournament Tier Expansion**
- **Current:** 7 tournament tiers (1.0x to 4.0x)
- **Question:** Do we need all 7 tiers or can we simplify?
- **Usage:** How often will International (4.0x) events occur?

### **4. Pickle Points Integration**
- **Current:** Basic implementation
- **Question:** Should Pickle Points be percentage of Ranking Points?
- **Consideration:** Fixed rewards vs dynamic scaling?

### **5. Match Type Categories**
- **Current:** Casual (50%), League (75%), Tournament (100%)
- **Question:** Should we add more categories (e.g., Practice, Exhibition)?
- **Balance:** Maintaining competitive integrity vs participation rewards

### **6. Manual Override Limits**
- **Current:** 0-1000 points for both winner and loser
- **Question:** Should there be different limits for different admin roles?
- **Security:** Audit logging for all manual overrides?

### **7. Seasonal Decay System**
- **Concept:** Points decay over time to maintain activity
- **Question:** Implement seasonal resets or rolling decay?
- **Balance:** Encouraging activity vs penalizing breaks

---

## 🎯 **NEXT STEPS**

1. **Discuss and finalize** each of the 7 discussion points above
2. **Select single source of truth** for base point calculation
3. **Standardize age group multipliers** across all systems
4. **Define final tournament tier structure** (3, 5, or 7 tiers?)
5. **Establish Pickle Points conversion rates** from ranking points
6. **Implement chosen algorithm** as single StandardizedRankingService
7. **Create comprehensive test suite** for all scenarios
8. **Document final algorithm** for deployment

---

**Ready for Discussion:** This document captures all current logic and identifies key decisions needed to finalize the PicklePlus algorithm. Let's discuss each point and create the definitive algorithm specification.