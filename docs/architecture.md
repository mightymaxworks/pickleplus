# Pickle+ Architecture

## Overview

Pickle+ is built using a modular architecture with separation of concerns to ensure maintainability, scalability, and ease of development. The application follows clean code standards and employs an event-driven approach for cross-module communication.

## Core Principles

1. **Modularity**: Features are organized into independent modules
2. **Separation of concerns**: Each module handles a specific domain
3. **Event-driven communication**: Modules communicate via a centralized event bus
4. **Feature toggling**: Gradual feature rollout via feature flags
5. **Clean code**: Consistent naming, organization, and documentation

## Application Structure

### Module System

The application is divided into seven core modules:

1. **User Module**: Authentication, user profiles, and passport functionality
2. **Match Module**: Match recording, history, and statistics
3. **Tournament Module**: Tournament registration, check-ins, and results
4. **Achievement Module**: Achievements, badges, and rewards
5. **Social Module**: Player connections, activity feeds, and social interactions
6. **Coaching Module**: Coach profiles, session booking, and training resources
7. **Guidance Module** (Planned): Interactive mascot, tutorials, and user guidance

### Core Infrastructure

- **Event Bus**: Centralized event system for cross-module communication
- **Feature Toggle System**: Controls gradual feature rollout and A/B testing
- **Module Registry**: Manages module loading and initialization

## Folder Structure

```
client/src/
├── core/             # Core infrastructure (event bus, module registry)
├── modules/          # Application modules
│   ├── user/         # User authentication and profiles
│   ├── match/        # Match recording and history
│   ├── tournament/   # Tournament management
│   ├── achievement/  # Achievements and rewards
│   ├── social/       # Social connections and interactions
│   ├── coaching/     # Coaching profiles and sessions
│   └── guidance/     # Interactive guidance (planned)
├── components/       # Shared UI components
├── hooks/            # Shared React hooks
├── lib/              # Shared utilities and services
└── pages/            # Application pages
```

## Module Structure

Each module follows a consistent internal structure:

```
module/
├── index.ts                # Module registration and initialization
├── components/             # Module-specific components
├── hooks/                  # Module-specific hooks
├── context/                # Module-specific context providers
├── api/                    # API calls related to the module
└── utils/                  # Module-specific utilities
```

## Communication Patterns

### Event Bus

Modules communicate with each other through the event bus using a publish/subscribe pattern:

```typescript
// Publishing an event
eventBus.publish('match:completed', { matchId, winnerId });

// Subscribing to an event
eventBus.subscribe('match:completed', (data) => {
  // Handle the event
});
```

### Feature Toggles

Features can be gradually rolled out using the feature toggle system:

```typescript
// Check if a feature is enabled
if (isFeatureEnabled('socialConnectionsEnabled')) {
  // Render the social connections feature
}
```

## Guidance Module (Planned)

The guidance module will provide interactive help and tutorials through an 8-bit mascot character.

### Structure

```
modules/guidance/
├── index.ts                  # Module registration
├── components/
│   ├── Mascot.tsx            # The 8-bit character component
│   ├── MascotAnimations.tsx  # Animation controller
│   ├── TutorialOverlay.tsx   # For step-by-step guides
│   └── TipBubble.tsx         # Speech/tip bubbles
├── context/
│   └── GuidanceContext.tsx   # Manage guidance state
├── hooks/
│   ├── useMascot.tsx         # Hook to control mascot
│   └── useTutorial.tsx       # Hook to manage tutorials
└── utils/
    ├── guidanceMessages.ts   # Content for different contexts
    └── tutorialSteps.ts      # Defined tutorial sequences
```

### Core Features

1. **Interactive 8-bit Mascot**: A character that guides users through the application
2. **Contextual Help**: Provides guidance based on current user context
3. **Onboarding Flows**: Helps new users learn the platform
4. **Achievement Celebrations**: Celebrates user milestones
5. **Tutorials**: Step-by-step guides for complex features

### Event Integration

The guidance module will subscribe to events from other modules to provide timely assistance:

```typescript
// Example event subscriptions
eventBus.subscribe('achievement:unlocked', (data) => {
  guidanceService.showMascotCelebration(data.achievementName);
});

eventBus.subscribe('user:firstLogin', () => {
  guidanceService.startOnboarding();
});
```

## Design Principles

- **Consistent Styling**: The application uses a cohesive design system
  - Primary Color: #FF5722 (Pickleball Orange)
  - Secondary Color: #2196F3 (Sport Blue)
  - Accent Color: #4CAF50 (Success Green)
- **Mobile-First Approach**: All features are designed for mobile devices first
- **Accessibility**: The application follows WCAG guidelines for accessibility
- **Performance**: Components are optimized for fast loading and rendering
