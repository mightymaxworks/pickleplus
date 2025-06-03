# PCP Global Ranking System - User Case Scenarios & User Journeys

## Core Principle: Complete Category Independence
Each ranking category (format + division) maintains completely separate point totals with no cross-contamination.

## User Case Scenarios

### Scenario 1: Multi-Format Competitive Player
**Profile:** Sarah, 38 years old, competitive player
**Eligible Categories:** Open, 35+ (all formats)

**Tournament Results:**
- Men's Singles Open: 2nd place City tournament = 80 points
- Men's Singles 35+: Winner District tournament = 105 points  
- Mixed Doubles Open: Semi-finalist Provincial = 100 points
- Mixed Doubles 35+: No tournaments played = 0 points

**Ranking Results:**
- Men's Singles Open: 80 tournament points + match points
- Men's Singles 35+: 105 tournament points + match points
- Mixed Doubles Open: 100 tournament points + match points
- Mixed Doubles 35+: 0 tournament points + match points only

**Key Insight:** Sarah's excellent singles performance doesn't affect her mixed doubles ranking.

### Scenario 2: Age Transition Player
**Profile:** Mike, 49 years old turning 50 mid-season
**Before 50th Birthday:** Eligible for Open, 35+ only
**After 50th Birthday:** Eligible for Open, 35+, 50+

**Journey:**
1. **Age 49:** Competes in 35+ division, builds ranking
2. **Turns 50:** Gains access to 50+ division
3. **New 50+ ranking starts at 0 points** (no carryover from 35+)
4. **35+ ranking continues independently**

**Strategic Decision:** Mike can choose to compete in 35+ (established ranking) or 50+ (fresh start, potentially easier competition).

### Scenario 3: Format Specialist
**Profile:** Alex, 42 years old, doubles specialist
**Focus:** Primarily plays doubles, rarely singles

**Tournament Activity:**
- Men's Doubles Open: Multiple tournaments, 450 points
- Men's Doubles 35+: Regional champion, 525 points
- Men's Singles Open: One tournament, 25 points
- Men's Singles 35+: No tournaments, 0 points

**Ranking Profile:**
- Strong doubles player across age divisions
- Weak singles rankings despite same skill level
- Each format tells a different competitive story

### Scenario 4: Strategic Age Division Player
**Profile:** Jennifer, 52 years old, strategic competitor
**Eligible Categories:** Open, 35+, 50+ (all formats)

**Strategy Analysis:**
- **Open Division:** Toughest competition, potential for high-level multipliers
- **35+ Division:** Moderate competition, established player base
- **50+ Division:** Newer division, opportunity for early ranking establishment

**Tournament Selection:**
- Chooses 50+ for Provincial tournaments (easier path to finals)
- Competes in Open for International tournaments (maximum points)
- Maintains 35+ ranking through regular City tournaments

## User Journey Examples

### Journey 1: New Player Onboarding
**Timeline:** 6 months

**Month 1-2: Account Setup**
1. Creates Pickle+ account
2. Completes profile (age: 28)
3. System determines eligible categories: Open only
4. All rankings show "Not Ranked - No tournament participation"

**Month 3-4: First Tournaments**
1. Enters Men's Singles Open club tournament (5th place)
2. Ranking updates: Men's Singles Open = 20 points
3. Other categories remain "Not Ranked"

**Month 5-6: Format Expansion**
1. Tries Mixed Doubles Open tournament (Semi-finalist)
2. Rankings now show:
   - Men's Singles Open: 20 points
   - Mixed Doubles Open: 50 points
   - All other categories: "Not Ranked"

### Journey 2: Age Milestone Transition
**Timeline:** 12 months spanning 35th birthday

**Pre-35th Birthday (6 months):**
- Men's Singles Open: 180 points (established ranking)
- Men's Doubles Open: 95 points
- Mixed Doubles Open: 220 points

**35th Birthday Event:**
- System automatically grants access to 35+ divisions
- Dashboard adds new ranking cards for 35+ categories
- All 35+ rankings start at "Not Ranked"

**Post-35th Birthday (6 months):**
- Competes in first Men's Singles 35+ tournament
- New independent ranking begins
- Open division rankings continue separately
- Final state: 6 independent ranking categories

### Journey 3: Competitive Player Career Arc
**Timeline:** 5 years (age 33-38)

**Year 1 (Age 33):** Open divisions only
- Builds initial rankings across all formats
- Focus on skill development

**Year 2-3 (Age 34-35):** Age transition
- Gains 35+ access at 35
- Strategic decision: continue Open or try 35+?
- Experiments with both divisions

**Year 4-5 (Age 36-38):** Peak performance
- Maintains rankings in multiple categories
- Strategic tournament selection based on ranking goals
- Uses category independence for optimal competitive positioning

## Strategic Considerations for Players

### Category Selection Strategy
1. **Skill Level vs Competition:** Choose division matching skill/competition level
2. **Tournament Availability:** Some locations have more 35+ than Open tournaments
3. **Ranking Goals:** Easier to build ranking in less competitive divisions
4. **Long-term Planning:** Consider where to invest tournament time

### Ranking Optimization
1. **Format Focus:** Specialize in strongest format for maximum points
2. **Division Strategy:** Balance between achievable success and challenging competition
3. **Tournament Level Selection:** Mix of club (frequent) and provincial+ (high multiplier)
4. **Geographic Considerations:** Travel for higher-level tournaments

## System Benefits

### For Players
- **Clear Competitive Identity:** Separate rankings show true performance per category
- **Strategic Flexibility:** Choose optimal competitive path
- **Age-Appropriate Competition:** Fair matchups within age groups
- **Format Recognition:** Specialists get appropriate ranking recognition

### For Tournament Organizers
- **Accurate Seeding:** Category-specific rankings for proper tournament seeding
- **Fair Competition:** Age and format appropriate divisions
- **Player Development:** Clear progression paths for different player types

### For the Ecosystem
- **Data Integrity:** Authentic tournament results only
- **Competitive Balance:** Prevents sandbagging across age groups
- **Growth Tracking:** Individual category development over time
- **Tournament Quality:** Better competitive balance through accurate rankings

## Technical Implementation Notes

### Database Structure
```
Rankings calculated per:
- User ID
- Format (mens_singles, mens_doubles, mixed_doubles, etc.)
- Division (open, 35+, 50+, 60+)
- Time period (52-week rolling window)
```

### Point Calculation
```
Tournament Points = Base Points × Tournament Level Multiplier × Draw Size Multiplier
Match Points = Win/Loss Points × Category Base Multiplier
Total Category Points = Tournament Points + Match Points (within 52 weeks)
```

### Age Eligibility Enforcement
```
Eligible Divisions = Based on current age at tournament registration
Historical Points = Remain in earned category regardless of current age
Category Access = Cannot compete in older age divisions
```

This system ensures complete ranking integrity while providing players with strategic flexibility and clear competitive pathways across their pickleball journey.