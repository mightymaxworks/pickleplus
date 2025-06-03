# ATP-Style Pickle+ Ranking System

## Core Principles

**Single Unified Ranking:**
- One ranking number per player (like ATP ranking)
- Points accumulate over rolling 52-week period
- Points automatically drop off after 52 weeks
- Simple, transparent, and universally comparable

## Points Award Structure

### Tournament Points (Primary Source)
**Tournament Level Multipliers:**
- Club/Local: 1.0x base points
- Regional: 2.0x base points  
- State/Provincial: 3.0x base points
- National: 5.0x base points
- International: 8.0x base points

**Placement Points (Base Values):**
- Winner: 100 points
- Runner-up: 60 points
- Semi-finalist: 35 points
- Quarter-finalist: 20 points
- Round of 16: 10 points
- Round of 32: 5 points
- First Round: 1 point

**Example Calculations:**
- Club Tournament Winner: 100 points
- Regional Tournament Winner: 200 points
- National Tournament Semi-finalist: 175 points (35 x 5.0)

### Match Points (Secondary Source)
**Casual/League Matches:**
- Win: 3 points
- Loss: 1 point
- Maximum 5 matches per day count toward ranking
- No anti-gaming penalties (just daily limit)

## Point Decay System
- Points earned remain for exactly 52 weeks
- Automatic weekly recalculation removes expired points
- Players must stay active to maintain ranking
- Encourages consistent participation

## Tournament Categories
**Draw Size Modifiers:**
- 4-8 players: 0.5x multiplier
- 9-16 players: 0.75x multiplier  
- 17-32 players: 1.0x multiplier
- 33-64 players: 1.25x multiplier
- 65+ players: 1.5x multiplier

## Format Divisions
**Separate Rankings For:**
- Men's Singles
- Women's Singles
- Men's Doubles
- Women's Doubles
- Mixed Doubles

**Age Divisions:**
- Open (18+)
- 35+, 45+, 55+, 65+, 75+
- Junior divisions: 18U, 16U, 14U, 12U

## Implementation Strategy

### Phase 1: Core System
1. Single ranking table per format/division
2. Rolling 52-week point accumulation
3. Tournament and match point awards
4. Weekly automated point decay

### Phase 2: Advanced Features
1. Draw size modifiers
2. Head-to-head comparisons
3. Ranking history graphs
4. Season-end championships qualification

### Phase 3: Professional Features
1. Live ranking updates during tournaments
2. Projected ranking calculations
3. Qualification thresholds for major events
4. Ranking-based seeding algorithms

## Benefits Over Current System

**Simplicity:**
- One number per player, easy to understand
- Direct comparison between any two players
- Clear path to improvement through tournaments

**Fairness:**
- Bigger tournaments = bigger rewards
- Consistent point values across all events
- Natural decay prevents point hoarding

**Motivation:**
- Clear incentive to play bigger tournaments
- Rewards both winning and participation
- Maintains competitiveness through decay

## Database Schema Updates Required

```sql
-- New unified ranking table
CREATE TABLE player_rankings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  format VARCHAR(20), -- 'mens_singles', 'womens_doubles', etc.
  division VARCHAR(10), -- 'open', '35+', '45+', etc.
  current_points INTEGER DEFAULT 0,
  peak_points INTEGER DEFAULT 0,
  peak_ranking INTEGER,
  current_ranking INTEGER,
  weeks_at_current_ranking INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Point history for 52-week rolling calculation
CREATE TABLE ranking_points_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  points_earned INTEGER,
  event_name VARCHAR(255),
  event_type VARCHAR(50), -- 'tournament', 'match'
  event_level VARCHAR(50), -- 'club', 'regional', 'national'
  date_earned DATE,
  expires_date DATE, -- date_earned + 52 weeks
  format VARCHAR(20),
  division VARCHAR(10)
);
```

## Migration Strategy

1. **Preserve existing data** in legacy tables
2. **Run parallel systems** during transition period
3. **Gradual rollout** format by format
4. **Player communication** about new system benefits
5. **Data validation** through comparison period

This ATP-style system provides clarity, fairness, and motivation while maintaining the competitive integrity that makes professional tennis rankings so respected globally.