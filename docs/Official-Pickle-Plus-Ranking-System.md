# Official Pickle+ Ranking System Documentation

## System Overview

The Pickle+ ranking system uses an ATP-style structure with rolling 52-week point accumulation. Players earn ranking points through tournament participation and casual/league matches, with points automatically expiring after one year to maintain active rankings.

## Tournament Structure & Point Multipliers

### Tournament Levels (Official Pickle+ Hierarchy)

| Level | Multiplier | Description |
|-------|------------|-------------|
| Club | 1.0x | Local club tournaments |
| District | 1.05x | District-level competitions |
| City | 1.2x | City-wide tournaments |
| Provincial | 2.0x | Provincial/state championships |
| National | 2.2x | National championships |
| Regional | 2.7x | Multi-national regional events |
| International | 3.5x | World-class international tournaments |

### Tournament Placement Points (Base Values)

| Placement | Base Points |
|-----------|-------------|
| Winner | 100 |
| Runner-up | 60 |
| Semi-finalist | 35 |
| Quarter-finalist | 20 |
| Round of 16 | 10 |
| Round of 32 | 5 |
| First Round | 1 |
| **Round Robin** | **1** |

**Important Rule:** Round robin matches count as first round matches and earn the same base points (1 point).

### Draw Size Multipliers

| Draw Size | Multiplier | Description |
|-----------|------------|-------------|
| 4-8 players | 0.5x | Small tournaments |
| 9-16 players | 0.75x | Medium tournaments |
| 17-32 players | 1.0x | Standard tournaments |
| 33-64 players | 1.25x | Large tournaments |
| 65+ players | 1.5x | Major tournaments |

## Point Calculation Formula

**Tournament Points = Base Points × Tournament Level Multiplier × Draw Size Multiplier**

### Example Calculations

#### Tournament Examples
1. **Club Tournament Winner (16 players)**
   - 100 base × 1.0 level × 0.75 draw = **75 points**

2. **District Tournament Runner-up (32 players)**
   - 60 base × 1.05 level × 1.0 draw = **63 points**

3. **City Tournament Semi-finalist (24 players)**
   - 35 base × 1.2 level × 0.75 draw = **32 points**

4. **Provincial Tournament Winner (64 players)**
   - 100 base × 2.0 level × 1.25 draw = **250 points**

5. **National Tournament Runner-up (128 players)**
   - 60 base × 2.2 level × 1.5 draw = **198 points**

6. **Regional Tournament Winner (96 players)**
   - 100 base × 2.7 level × 1.5 draw = **405 points**

7. **International Tournament Winner (256 players)**
   - 100 base × 3.5 level × 1.5 draw = **525 points**

8. **Round Robin Match (Club level)**
   - 1 base × 1.0 level × 1.0 draw = **1 point**

#### Match Examples
- **Casual Match Win:** 3 points
- **League Match Win:** 3 points
- **Casual/League Match Loss:** 1 point

## Match Points System

### Daily Limits
- Maximum 5 matches per day count toward ranking
- No anti-gaming penalties for ranking points (unlike Pickle Points)
- Simple daily limit to prevent system abuse

### Point Values
- **Win:** 3 points
- **Loss:** 1 point (participation credit)

## Format & Division Structure

### Separate Rankings For Each Format
- Men's Singles
- Women's Singles
- Men's Doubles
- Women's Doubles
- Mixed Doubles

### Age Divisions
- **Open** (18+)
- **35+, 45+, 55+, 65+, 75+**
- **Junior:** 18U, 16U, 14U, 12U

Each format/division combination maintains its own independent ranking list.

## Rolling 52-Week System

### Point Lifecycle
1. **Point Earning:** Players earn points from tournaments and matches
2. **Active Period:** Points remain active for exactly 52 weeks from earn date
3. **Automatic Expiry:** Points automatically drop off after 52 weeks
4. **Weekly Recalculation:** Rankings updated weekly to remove expired points

### Benefits
- **Current Performance:** Rankings reflect recent performance, not historical achievements
- **Motivation to Stay Active:** Players must continue participating to maintain ranking
- **Fair Competition:** Prevents point hoarding from past accomplishments
- **Natural Decay:** No artificial point reductions needed

## Ranking Position Calculation

Rankings are calculated by sorting all active points (within 52 weeks) in descending order within each format/division.

### Position Metrics
- **Ranking Position:** 1st, 2nd, 3rd, etc.
- **Total Players:** Number of active players in format/division
- **Percentile:** Player's position as percentage of total field

## Performance Milestones

| Points | Tier | Description |
|--------|------|-------------|
| 100+ | Regional Player | Consistent local tournament participation |
| 250+ | Competitive Player | Regular tournament success |
| 500+ | Advanced Player | Significant tournament achievements |
| 1000+ | Elite Player | High-level competitive success |
| 2000+ | Professional Level | Exceptional tournament performance |
| 5000+ | World Class | Elite international competition level |

## Implementation Requirements

### Database Schema
```sql
-- Player rankings table
CREATE TABLE player_rankings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  format VARCHAR(20), -- 'mens_singles', 'womens_doubles', etc.
  division VARCHAR(10), -- 'open', '35+', '45+', etc.
  current_points INTEGER DEFAULT 0,
  current_ranking INTEGER,
  peak_points INTEGER DEFAULT 0,
  peak_ranking INTEGER,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Point history for 52-week calculation
CREATE TABLE ranking_points_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  points_earned INTEGER,
  event_name VARCHAR(255),
  event_type VARCHAR(50), -- 'tournament', 'match'
  event_level VARCHAR(50), -- 'club', 'district', 'city', etc.
  placement VARCHAR(50), -- 'winner', 'runner_up', 'round_robin', etc.
  draw_size INTEGER,
  date_earned DATE,
  expires_date DATE, -- date_earned + 52 weeks
  format VARCHAR(20),
  division VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Features
1. **Automated Point Expiry:** Weekly job removes expired points
2. **Real-time Ranking Updates:** Rankings recalculate after each tournament
3. **Historical Tracking:** Maintain peak points and ranking achievements
4. **Format Flexibility:** Easy addition of new formats or divisions
5. **Tournament Integration:** Direct connection to tournament management system

## Migration from Current System

### Phase 1: Parallel Operation
- Run new ATP system alongside current ranking system
- Allow players to compare both systems
- Gather feedback and make adjustments

### Phase 2: Data Migration
- Convert existing tournament results to new point structure
- Maintain historical records for reference
- Preserve player achievements and milestones

### Phase 3: Full Implementation
- Switch all displays to new ATP rankings
- Deprecate old ranking calculations
- Update all tournament and match recording systems

## Benefits Over Previous System

### Simplicity
- Single ranking number per format/division
- Clear point calculation formula
- Universal understanding of ranking position

### Fairness
- Bigger tournaments reward bigger points
- Automatic point decay prevents stagnation
- Equal opportunity for all players to improve

### Motivation
- Clear path to advancement through tournament play
- Meaningful rewards for consistent participation
- Natural incentive to play at higher levels

### Professional Standards
- Based on proven ATP tennis model
- Internationally recognized ranking approach
- Suitable for eventual federation adoption

This ATP-style ranking system provides the foundation for a world-class pickleball ranking system that can scale from local clubs to international competition while maintaining fairness, transparency, and competitive integrity.