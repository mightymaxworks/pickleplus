# Tournament-CourtIQ™ Integration Documentation

## Overview

This document outlines how tournament match results integrate with the CourtIQ™ rating system in Pickle+ and will serve as a reference for the full tournament system development. The integration ensures tournament performance properly influences player ratings, provides accurate skill assessment, and rewards competitive achievements.

## Integration Flow

When a match score is submitted in a tournament, the following data flow and processing occurs:

```
┌────────────────────┐     ┌─────────────────────┐     ┌────────────────────┐
│                    │     │                     │     │                    │
│ Tournament Match   │────▶│  Match Result API   │────▶│ CourtIQ™ Rating    │
│ Score Submission   │     │  (Record Result)    │     │ System Processing  │
│                    │     │                     │     │                    │
└────────────────────┘     └─────────────────────┘     └────────────────────┘
                                                               │
                                                               ▼
┌────────────────────┐     ┌─────────────────────┐     ┌────────────────────┐
│                    │     │                     │     │                    │
│ UI Updates &       │◀────│ Event Publication   │◀────│ Rating Updates &   │
│ Notifications      │     │ & Cache Invalidation│     │ Points Allocation  │
│                    │     │                     │     │                    │
└────────────────────┘     └─────────────────────┘     └────────────────────┘
```

## Match Processing

### 1. Match Result Recording

When a match result is recorded:

- The front-end submits match data through the `recordMatchResult` API function
- Data includes winner/loser IDs, score details, and match context
- Back-end validates the data (team assignments, match status, score validity)
- Match is marked as completed in the database

### 2. CourtIQ™ Processing

After successful match recording:

```javascript
// Process match in CourtIQ for rating changes
ratingResults = await courtIQSystem.processMatch({
  matchId: match.id,
  players,
  format: matchData.formatType,
  division: matchData.division,
  matchType: matchData.matchType,
  eventTier: matchData.eventTier
});
```

- **Format Types**: singles, doubles, mixed doubles
- **Divisions**: open, 35+, 50+, 65+
- **Match Types**: tournament (with subtypes: bracket, round-robin, elimination)
- **Event Tiers**: local, regional, national, international

### 3. Ranking Points Calculation

Points are calculated based on match context:

```javascript
rankingPointsResult = await courtIQSystem.calculateRankingPointsForMatch({
  matchType: matchData.matchType,
  eventTier: matchData.eventTier,
  winner: {
    userId: matchData.winnerId,
    division: matchData.division,
    format: matchData.formatType
  },
  loser: {
    userId: loserId,
    division: matchData.division,
    format: matchData.formatType
  },
  // Tournament context affects point values
  isTournamentFinal: matchData.isTournamentFinal || false,
  isTournamentSemiFinal: matchData.isTournamentSemiFinal || false,
  participantCount: matchData.participantCount
});
```

### 4. Points Distribution

Points are awarded to all winning players:

```javascript
// Award points to the winning player
await courtIQSystem.awardEnhancedRankingPoints(
  matchData.winnerId,
  rankingPointsResult,
  matchData.division,
  matchData.formatType,
  "match_victory",
  matchData.matchType,
  matchData.eventTier,
  undefined,
  match.id,
  undefined,
  1.0,
  `Tournament victory against player #${loserId}`
);

// For doubles matches, award partner as well
if (partnerId) {
  await courtIQSystem.awardEnhancedRankingPoints(
    partnerId,
    rankingPointsResult,
    matchData.division,
    matchData.formatType,
    "match_victory",
    matchData.matchType,
    matchData.eventTier,
    undefined,
    match.id,
    undefined,
    1.0,
    `Tournament victory with partner #${matchData.winnerId}`
  );
}
```

## Tournament Context Factors

The following tournament contexts influence rating changes and point awards:

| Factor | Impact |
|--------|--------|
| Tournament Tier | International > National > Regional > Local |
| Round/Stage | Finals > Semifinals > Quarterfinals > Earlier rounds |
| Participant Count | Larger tournaments yield more points/rating impact |
| Opponent Skill Gap | Beating higher-rated opponents yields more points |
| Match Format | Format-specific ratings track specialized skills |

## Event Notifications

After processing, the system publishes events that notify the application:

- `courtiq.rating.updated` - When a player's rating changes
- `courtiq.rating.tier_changed` - When a player advances to a new tier
- `courtiq.rating.confidence_updated` - When rating confidence level changes

## UI Refresh Mechanisms

After match results are processed, multiple independent refresh mechanisms ensure UI updates:

1. **Granular Cache Invalidation**: Invalidates relevant API query caches
2. **Direct Bracket Cache Invalidation**: Refreshes specific bracket data
3. **Event-based Notification**: Components listen for match result changes
4. **UI Feedback**: Toast notifications inform users of results
5. **Delayed Secondary Notification**: Handles race conditions

## Future Enhancement Considerations

1. **Machine Learning Enhancements**:
   - Pattern detection for player improvement tracking
   - Fraud detection for suspicious results

2. **External Integration**:
   - Support for importing results from external tournament platforms
   - Integration with sanctioning bodies

3. **Enhanced Analytics**:
   - Video analysis of tournament matches
   - Detailed performance metrics

4. **Expanded Tournament Formats**:
   - Support for specialized tournament formats (waterfall, etc.)
   - Customizable scoring systems

## Reference Implementation

Core rating system processing in `server/modules/rating/ratingSystem.ts`:

```typescript
/**
 * CourtIQ™ Rating System
 * 
 * This module handles the rating system for Pickle+, which tracks player skill levels
 * across different divisions (age groups) and formats (singles, doubles, mixed).
 * 
 * The rating system uses an ELO-based algorithm with adjustments specific to pickleball,
 * taking into account factors like:
 * - Match format (singles vs doubles)
 * - Player experience level (provisional vs established)
 * - Score differentials
 * - Tournament vs casual play
 * 
 * Ratings range from 1000 (beginner) to 2500 (professional level).
 */
```

The tournament match results integration leverages this system to ensure competitive play is properly valued in player progression.