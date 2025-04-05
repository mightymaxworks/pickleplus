# Pickle+ Modular Architecture Reference Guide

## Table of Contents
1. [Communication Protocol](#communication-protocol)
2. [Module Development Guidelines](#module-development-guidelines)
3. [Event Bus Usage](#event-bus-usage)
4. [Feature Toggle System](#feature-toggle-system)
5. [Module Registry](#module-registry)
6. [Code Examples](#code-examples)
7. [Development Checklist](#development-checklist)
8. [Reminders for Team Collaboration](#reminders-for-team-collaboration)

## Communication Protocol

To maintain our modular architecture, use these phrases in your feature requests:

| Phrase | Example | Purpose |
|--------|---------|---------|
| "In the [X] module..." | "In the user module, add profile photo upload." | Specifies which module to modify |
| "Add an event that..." | "Add an event that notifies the achievement module when a match is completed." | Indicates event bus usage |
| "Update the [X] module API..." | "Update the match module API to include a new getPlayerStats method." | Modifies module's public interface |
| "Behind feature flag [X]..." | "Behind feature flag 'coachingBeta', add the coaching request feature." | Implements gradual rollout |
| "Cross-module interaction between [X] and [Y]..." | "Cross-module interaction between tournament and social modules for team formation." | Identifies module dependencies |

## Module Development Guidelines

### General Structure
Each module must maintain this structure:
```
modules/[module-name]/
├── api/         # API calls and data fetching
├── components/  # UI components specific to this module
├── hooks/       # Custom React hooks
├── utils/       # Utility functions
└── index.ts     # Module entry point and API implementation
```

### Module Responsibilities

1. **User Module**
   - Authentication
   - User profiles
   - Passports & QR codes
   - Account settings
   - Permissions

2. **Match Module**
   - Match recording
   - Match history
   - Statistics tracking
   - Performance analytics

3. **Tournament Module**
   - Tournament listings
   - Registration
   - Check-in
   - Brackets
   - Results

4. **Achievement Module**
   - XP system
   - Achievement tracking
   - User tiers
   - Activity feed
   - Redemption codes

5. **Social Module**
   - Player connections
   - Social feed
   - Messaging
   - Teams

6. **Coaching Module**
   - Coach profiles
   - Session booking
   - Feedback system
   - Training programs

## Event Bus Usage

### Event Naming Convention
Events should follow the format: `[module]:[action]:[entity]`

Examples:
- `user:updated:profile`
- `match:completed:singles`
- `tournament:registered:player`

### Publishing Events
```typescript
import { eventBus } from '@/core/events/eventBus';

// In the match module
function recordMatch(matchData) {
  // Process match data...
  
  // Publish event for other modules
  eventBus.publish('match:completed:singles', {
    matchId: newMatch.id,
    players: [player1, player2],
    scores: [score1, score2],
    timestamp: Date.now()
  });
  
  return newMatch;
}
```

### Subscribing to Events
```typescript
import { eventBus } from '@/core/events/eventBus';

// In the achievement module
function initAchievementListeners() {
  // Listen for match completion to check achievements
  eventBus.subscribe('match:completed:singles', async (data) => {
    await checkForNewAchievements(data.players, data.scores);
  });
  
  // Listen for tournament check-ins
  eventBus.subscribe('tournament:checked-in:player', async (data) => {
    await awardTournamentParticipationXP(data.userId, data.tournamentId);
  });
}
```

## Feature Toggle System

### Defining a Feature Flag
```typescript
import { featureFlags } from '@/core/features/featureFlags';

// Define the feature flag
featureFlags.defineFeature({
  id: 'enhancedMatchStats',
  name: 'Enhanced Match Statistics',
  description: 'Provides detailed stats breakdown after matches',
  enabled: false, // off by default
  userPercentage: 0, // 0% of users
});
```

### Checking Feature Flags
```typescript
import { featureFlags } from '@/core/features/featureFlags';

function MatchStatisticsComponent({ matchId }) {
  // Check if feature is enabled
  const isEnhancedStatsEnabled = featureFlags.isEnabled('enhancedMatchStats');
  
  return (
    <div>
      <h2>Match Statistics</h2>
      
      {/* Basic stats shown to everyone */}
      <BasicStats matchId={matchId} />
      
      {/* Enhanced stats only shown if feature is enabled */}
      {isEnhancedStatsEnabled && (
        <EnhancedStats matchId={matchId} />
      )}
    </div>
  );
}
```

## Module Registry

### Registering a Module
```typescript
// In modules/moduleRegistration.ts
import { moduleRegistry } from '@/core/modules/moduleRegistry';
import { userModule } from './user';
import { matchModule } from './match';
// Import other modules...

export function registerAllModules() {
  moduleRegistry.registerModule(userModule);
  moduleRegistry.registerModule(matchModule);
  // Register other modules...
  
  console.log('All modules registered successfully.');
  console.log('Registered modules:', moduleRegistry.getRegisteredModules());
}
```

### Accessing Module APIs
```typescript
import { moduleRegistry } from '@/core/modules/moduleRegistry';
import { UserModuleAPI } from '@/modules/types';

function LoginForm() {
  const handleSubmit = async (username, password) => {
    try {
      // Get the user module API
      const userAPI = moduleRegistry.getModule<UserModuleAPI>('user');
      
      // Use the API to login
      const user = await userAPI.login(username, password);
      
      // Handle successful login
      console.log('Logged in user:', user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  // Rest of the component...
}
```

## Code Examples

### Complete Module Example
```typescript
// modules/match/index.ts
import { Module } from '@/modules/types';
import { eventBus } from '@/core/events/eventBus';

// Match module API implementation
const matchAPI = {
  recordMatch: async (matchData) => {
    // API call to record match
    const response = await fetch('/api/matches', {
      method: 'POST',
      body: JSON.stringify(matchData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const newMatch = await response.json();
    
    // Publish event for other modules
    eventBus.publish('match:recorded', {
      matchId: newMatch.id,
      players: matchData.players,
      scores: matchData.scores,
    });
    
    return newMatch;
  },
  
  getPlayerMatches: async (playerId) => {
    // API call to get player matches
    const response = await fetch(`/api/players/${playerId}/matches`);
    return await response.json();
  },
  
  // Other methods...
};

// Export the module definition
export const matchModule: Module = {
  id: 'match',
  version: '0.8.0',
  api: matchAPI,
};
```

### Cross-Module Interaction Example
```typescript
// modules/achievement/services/achievementService.ts
import { eventBus } from '@/core/events/eventBus';
import { moduleRegistry } from '@/core/modules/moduleRegistry';
import { UserModuleAPI } from '@/modules/types';

export function initAchievementListeners() {
  // Listen for match events
  eventBus.subscribe('match:recorded', async (data) => {
    const newAchievements = await checkForMatchAchievements(data);
    
    if (newAchievements.length > 0) {
      // Get user module API
      const userAPI = moduleRegistry.getModule<UserModuleAPI>('user');
      
      // Update user XP for new achievements
      for (const achievement of newAchievements) {
        await userAPI.addUserXP(data.players[0], achievement.xpReward);
        
        // Publish achievement unlocked event
        eventBus.publish('achievement:unlocked', {
          userId: data.players[0],
          achievementId: achievement.id,
          timestamp: Date.now(),
        });
      }
    }
  });
}
```

## Development Checklist

When implementing new features, ensure:

- [ ] Feature is placed in the correct module
- [ ] Module's public API is updated in its index.ts
- [ ] Cross-module communication uses the event bus
- [ ] Event names follow the convention: `[module]:[action]:[entity]`
- [ ] Events include all necessary data for subscribers
- [ ] Feature toggles are used for gradual rollout
- [ ] TypeScript types are consistent with module interfaces
- [ ] Documentation is updated to reflect new functionality

## Reminders for Team Collaboration

### For the Developer
- Remember to explicitly mention which module(s) your feature relates to
- Specify when you need cross-module communication via the event bus
- Indicate when a feature should be behind a feature flag
- Mention any new APIs that should be added to a module's public interface

### For AI Assistant
- I will ask clarifying questions about module placement if unclear
- I will suggest appropriate event bus usage for cross-module interactions
- I will recommend feature flags for complex or experimental features
- I will maintain module isolation and use the module registry for cross-module access
- I will follow the established folder structure and naming conventions
- I will update relevant documentation when implementing new features

## Quick Reference Table

| When You Want To | Use This Pattern | Avoid This |
|------------------|------------------|------------|
| Add UI components | Place in relevant module's `components` folder | Don't create global components unless truly shared |
| Share functionality | Export through module's API in `index.ts` | Don't import directly from another module's internals |
| Notify other modules | Publish events via eventBus | Don't call other module functions directly |
| React to other modules | Subscribe to events via eventBus | Don't create circular dependencies |
| Add temporary features | Use feature flags | Don't build conditionals based on hard-coded values |
| Access another module | Use moduleRegistry.getModule() | Don't import from other module paths directly |