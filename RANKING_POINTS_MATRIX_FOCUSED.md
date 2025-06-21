# Ranking Points System - Core Matrix & Logic

## Primary Ranking Points System

Pickle+ uses a **dual-layer ranking points system**:

### Base Points Matrix

| Match Type | Winner Points | Loser Points | Weight Factor |
|------------|---------------|--------------|---------------|
| **Casual** | 3 points | 1 point | 0.5x (50% weight) |
| **League** | 3 points | 1 point | 0.67x (67% weight) |
| **Tournament** | 3 points | 1 point | 1.0x (100% weight) |

### Key Logic: Two-Tier Calculation

1. **Display Points** = Raw points (what users see)
2. **Competitive Points** = Weighted points (used for actual rankings)

#### Example Calculation:
- Casual Win: **3 display points**, **1.5 competitive points** (3 × 0.5)
- League Win: **3 display points**, **2 competitive points** (3 × 0.67)  
- Tournament Win: **3 display points**, **3 competitive points** (3 × 1.0)

## Tournament Tier Multipliers

### MatchRewardService (Variable System)
| Tournament Tier | Multiplier | Win Range | Loss Range |
|------------------|------------|-----------|------------|
| Club | 1.0x | 8-12 points | 2-3 points |
| Regional | 1.5x | 12-18 points | 3-5 points |
| National | 2.0x | 16-24 points | 4-6 points |
| International | 3.0x | 24-36 points | 6-9 points |

**Logic**: Random base points (8-12 for tournaments) × tier multiplier  
**Loser Points**: 25% of winner's points

### Tournament Management System
| Tournament Level | Multiplier | Example Points |
|------------------|------------|----------------|
| Club | 1.2x | 3.6 points |
| District | 1.5x | 4.5 points |
| City | 1.8x | 5.4 points |
| Provincial | 2.0x | 6.0 points |
| National | 2.5x | 7.5 points |
| Regional | 3.0x | 9.0 points |
| International | 4.0x | 12.0 points |

## Multi-Dimensional Ranking Service

### Simple Fixed Points
```typescript
async processMatchRankingPoints(
  winnerId: number,
  loserId: number,
  basePoints: number = 10  // Fixed base points
) {
  // Winner gets basePoints
  // Loser gets 0 points (no points lost)
}
```

## Milestone System

| Points | Tier Description |
|--------|------------------|
| 100 | Regional Player |
| 250 | Competitive Player |
| 500 | Advanced Player |
| 1000 | Elite Player |
| 2000 | Professional Level |
| 5000 | World Class |
| 10000+ | Legend Status |

## Active Implementation

The system currently uses **multiple calculation methods** depending on the endpoint:

1. **Primary System** (routes.ts): 3/1 points with weighting
2. **MatchRewardService**: Variable points (8-12) with tier multipliers
3. **Multi-Dimensional**: Fixed 10 points per win

### Weight Factor Application

```javascript
// Display calculation (what user sees)
displayPoints = basePoints; // 3 for win, 1 for loss

// Competitive calculation (for rankings)
competitivePoints = basePoints * weightMultiplier;
// Tournament: 3 × 1.0 = 3 points
// League: 3 × 0.67 = 2 points  
// Casual: 3 × 0.5 = 1.5 points
```

## Current Status

- **Display Points**: Always show full 3/1 points to users
- **Ranking Calculation**: Uses weighted points for actual ranking
- **Tournament Bonuses**: Applied via tier multipliers
- **No Point Loss**: Players never lose existing ranking points