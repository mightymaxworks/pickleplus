# CourtIQ™ Comprehensive System Documentation

## System Overview

CourtIQ™ is a dual-component rating and ranking system for Pickle+ that provides players with accurate skill assessment while encouraging engagement and progression.

### Core Philosophy

1. **Skill Measurement + Engagement Rewards:** Balances accurate skill assessment with positive progression mechanics
2. **Division-Aware Design:** Respects age divisions while encouraging cross-division play
3. **Format Specialization:** Recognizes different skills in singles, doubles, and mixed play
4. **Protection Mechanics:** Ensures positive experiences for new, casual, and returning players
5. **Social Integration:** Incorporates rivalry, teamwork, and community elements

## Component 1: Rating System

### Rating Mechanics

**Foundation:**
- ELO-based system (1000-2500 range)
- Tier structure with 10 named levels
- Separate ratings for each age division and format
- Visible as tiers with progress indicators

**K-Factor Structure:**
- Casual Matches: K=12
- League Matches: K=15
- Tournament Matches: K=24-70 (based on level)
- Additional modifiers for tournament rounds and match importance

**Protection Mechanics:**
- New player protection (first 10-15 matches)
- Tier-based loss protection (Bronze through Gold tiers)
- Challenge match exemptions (3-5 per month)
- Returning player adjustment periods

**Format Distinctions:**
- Singles, Men's/Women's Doubles, Mixed Doubles tracked separately
- Format-specific ratings with separate leaderboards
- Primary display rating can be format-specific or weighted average

## Component 2: Ranking Points

### Points Accumulation

**Points Sources:**
- Match wins: 5-50 base points (varies by match type)
- Tournament placement: Additional bonus points
- Seasonal accumulation for leaderboards
- Points never decrease from initial value

**Points Multipliers:**
- Opponent skill multiplier: 0.8-1.5×
- Tournament importance multiplier: 1.0-2.5×
- Division adjustment multiplier: 1.0-1.5× (for playing in younger divisions)

**Seasonal Structure:**
- 6-month seasons with soft reset
- Historical preservation of season-high achievements
- Season-end rewards based on points and rating achievements

## Tier Structure

**10 Distinctive Tiers:**
1. **Dink Dabbler** (Rating: 1000-1199)
2. **Paddle Prospect** (Rating: 1200-1399)
3. **Rally Ranger** (Rating: 1400-1599)
4. **Volley Voyager** (Rating: 1600-1799)
5. **Spin Specialist** (Rating: 1800-1999)
6. **Kitchen Commander** (Rating: 2000-2199)
7. **Smash Sovereign** (Rating: 2200-2399)
8. **Court Crusader** (Rating: 2400-2599)
9. **Pickleball Prophet** (Rating: 2600-2799)
10. **Tournament Titan** (Rating: 2800+)

**Tier Protection:**
- Bronze & Silver Tiers (Dink Dabbler, Paddle Prospect): No point loss
- Gold Tier (Rally Ranger, Volley Voyager): Minimal point loss (25% of standard)
- Platinum Tier (Spin Specialist, Kitchen Commander): Reduced point loss (50% of standard)
- Diamond & Master Tiers (Smash Sovereign and above): Full point loss mechanics

## Age Division Structure

### Division Setup

**Standard Age Divisions:**
- Open/19+ Division
- 35+ Division
- 50+ Division
- 60+ Division
- 70+ Division

**Division Eligibility:**
- Players automatically eligible for their age division and all younger divisions
- Younger players cannot play in older divisions
- All eligible divisions automatically activated in player profiles

**Division-Specific Ratings:**
- Separate CourtIQ™ rating for each eligible division
- Each division's rating evolves independently based on play within that division
- Initial rating when first playing a non-primary division is based on primary division rating

### 50+ Player Placement Example

**50+ Year Old Player Setup:**
1. Player enters birth date during registration
2. System automatically identifies eligible divisions: 50+, 35+, and Open/19+
3. All three divisions appear in player's profile
4. Initial rating established in primary division (50+) first
5. When playing in 35+ or Open, initial rating based on 50+ performance
6. Each division's rating evolves separately based on matches in that division

**Cross-Division Incentives:**
- Point multipliers when playing in younger divisions:
  - 50+ player in 35+ division: 1.15× points
  - 50+ player in 19+ division: 1.25× points
- Rating impact protection when playing in younger divisions:
  - Enhanced rating gains for wins
  - Reduced rating losses for defeats
- Special achievements for cross-division success

## Leaderboard Structure

### Multi-Dimensional Leaderboards

**Primary Leaderboard Types:**
1. **Global Rating Leaderboards:** Based on CourtIQ™ rating (tier-segmented)
2. **Global Points Leaderboards:** Based on seasonal ranking points
3. **Division-Specific Leaderboards:** Filtered by age division
4. **Format-Specific Leaderboards:** Singles, doubles, mixed doubles
5. **Combined Leaderboards:** Specific format+division combinations
6. **Specialty Leaderboards:** Improvement, activity, etc.

**Leaderboard Filters:**
- Time Period: Current season, all-time, monthly
- Geography: Global, regional, club
- Division: Age division selection
- Format: Play format selection
- Minimum Activity: Threshold for inclusion

**Personal Context:**
- Player's position highlighted
- Movement indicators (up/down)
- Distance to next milestone
- Rival comparisons

## Rating Development Examples

### New Player Journey

**Starter Experience:**
- Self-assessment or external rating import
- Initial placement in appropriate tier
- Protected matches during learning period
- Accelerated early advancement to find true level

**Growth Pattern:**
- Bronze/Silver tier protection encourages early play
- Gradual introduction to full rating mechanics
- Division-specific rating development
- Format specialization opportunities

### Experienced Player Integration

**External Rating Import:**
- DUPR/UTPR conversion with confidence factor
- Calibration period with accelerated adjustment
- Format-specific initial ratings
- Division-specific starting points

**Rating Maintenance:**
- Seasonal soft resets prevent inflation
- Division-specific ratings evolve independently
- Format specialists can have varied tier levels
- Cross-division play incentivized but not required

## Special Mechanics

### Team/Partnership Dynamics

**Doubles Handling:**
- Both partners receive rating adjustments
- Partner contribution factor develops over time
- Regular partnerships develop "team chemistry" recognition
- Cross-skill partnerships have protection mechanisms

### Tournament Structure

**Tournament-Specific Features:**
- Enhanced K-factors for significant events
- Round progression multipliers
- Placement bonuses
- Format-specific tournament ratings

### Protection Systems

**Player Protection Features:**
- New player protection period
- Division-appropriate adjustment rates
- Returning player "rust removal" period
- Challenge match exemptions
- Streak protection mechanisms

## Implementation Strategy

### Phase 1: Core System (1-2 Months)

**Focus Areas:**
- Basic rating algorithm
- Tier structure and visualization
- Match recording with rating adjustments
- Initial protection mechanics

**Key Deliverables:**
- Functional ELO-based rating calculator
- Basic match entry UI with rating impact preview
- Tier badge design and progression visualization
- Player profile with rating information

### Phase 2: Division & Format Structure (3-4 Months)

**Focus Areas:**
- Age division setup
- Format-specific ratings
- External rating import
- Tournament integration

**Key Deliverables:**
- Division selection in match recording
- Division-specific leaderboards
- Format tracking and specialization
- Tournament rating calculations

### Phase 3: Social & Community Features (5-6 Months)

**Focus Areas:**
- Rivalry system
- Team/partner mechanics
- Achievement integration
- Club/regional structures

**Key Deliverables:**
- Rival identification and tracking
- Club leaderboards and aggregation
- Achievement system for ratings milestones
- Social sharing of rating accomplishments

### Phase 4: Advanced Features (7+ Months)

**Focus Areas:**
- Machine learning enhancements
- Predictive analytics
- Advanced visualization
- Seasonal structure

**Key Deliverables:**
- Rating prediction tools
- Performance analysis dashboards
- Season-end processing and rewards
- Rating trend visualization

## Technical Requirements

### Database Structure

**Core Tables:**
- player_ratings (division and format specific)
- rating_history (match-by-match changes)
- ranking_points (seasonal accumulation)
- leaderboards (pre-calculated rankings)
- match_records (all recorded matches)

**Supporting Tables:**
- rating_protection_status
- rating_confidence_metrics
- division_eligibility
- format_specialization

### API Endpoints

**Essential Endpoints:**
- /api/ratings/current (get current ratings across divisions/formats)
- /api/ratings/history (get rating history with filters)
- /api/rankings/leaderboard (get leaderboard with filters)
- /api/matches/record (record match with rating impact)
- /api/ratings/preview (preview potential match rating impact)

### Frontend Components

**Key Interfaces:**
- Profile rating display with tier badges
- Match recording form with rating impact preview
- Leaderboard browser with filtering
- Rating history visualization
- Achievement showcase for rating milestones

## Key Decision Points & Discussion

### Division Management

**Current Approach:**
- Automatic division eligibility based on age
- All divisions active by default
- Independent rating evolution per division
- Cross-division play incentivized with multipliers

**Discussion Points:**
- Should divisions be organized differently (different age breakpoints)?
- How prominently should division distinction appear in UI?
- Should there be special recognition for multi-division excellence?

### Rating vs. Points Balance

**Current Approach:**
- Hybrid model with ELO-based rating determining tier
- Points system for seasonal accumulation and leaderboards
- Protection mechanics vary by tier level

**Discussion Points:**
- Is the protection balance appropriate for player retention?
- Should higher tiers have stricter rating mechanics?
- How much should activity be rewarded vs. pure skill?

### Social Integration Depth

**Current Approach:**
- Rival system identifies similar-rated players
- Club aggregation shows community standings
- Achievement system recognizes milestone accomplishments

**Discussion Points:**
- How much emphasis on individual vs. community?
- Should rating achievements have real-world rewards?
- How to prevent unhealthy competition?

## Final Considerations

The CourtIQ™ system balances:
1. **Mathematical Accuracy:** True skill assessment
2. **Psychological Safety:** Protection for development
3. **Social Engagement:** Community and competitive context
4. **Progressive Challenge:** Appropriate difficulty scaling
5. **Diverse Recognition:** Multiple paths to achievement

Implementation should prioritize player experience while maintaining system integrity, with regular review and adjustment based on actual usage patterns and community feedback.