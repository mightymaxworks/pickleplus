# PickleJourney™ Technical Reference Guide

## Code Organization

### Directory Structure
```
client/src/modules/picklejourney/
├── components/
│   ├── dashboard/
│   │   ├── JourneyDashboard.tsx       # Main dashboard component
│   │   ├── RoleSwitcher.tsx           # Role switching UI
│   │   ├── JourneySummary.tsx         # Summary component for dashboard
│   │   └── RecentActivity.tsx         # Recent activity feed
│   ├── onboarding/
│   │   ├── RoleDiscoveryWizard.tsx    # Multi-step wizard for role discovery
│   │   ├── RoleSelectionPanel.tsx     # Role selection UI
│   │   └── GoalSetting.tsx            # Goal setting component
│   ├── EmotionallyAdaptivePrompt.tsx  # Prompt that adapts to emotional state
│   └── EmotionReporter.tsx            # Self-reporting emotional UI
├── contexts/
│   ├── JourneyRoleContext.tsx         # Context for role management
│   └── EmotionContext.tsx             # Context for emotional intelligence
├── hooks/
│   ├── useJourneyRoles.ts             # Hook for role management
│   └── useEmotionDetection.ts         # Hook for emotion detection
└── types.ts                           # Type definitions
```

### Key Files & Components

#### JourneyRoleContext
This context manages the user's current roles and active role.

```typescript
// Main exports
export const JourneyRoleContext = createContext<JourneyRoleContextType | null>(null);
export function JourneyRoleProvider({ children }: { children: ReactNode }) {...}
export function useJourneyRole() {...}
```

#### EmotionContext
This context manages the user's emotional state and provides methods for emotion detection.

```typescript
// Main exports
export const EmotionContext = createContext<EmotionContextType | null>(null);
export function EmotionProvider({ children }: EmotionProviderProps) {...}
export function useEmotion() {...}
```

#### useEmotionDetection Hook
This hook provides the core emotion detection functionality.

```typescript
// Main exports
export function useEmotionDetection() {...}
export default useEmotionDetection;
```

## Types and Interfaces

### Roles

```typescript
type UserRole = 'PLAYER' | 'COACH' | 'REFEREE' | 'ADMIN';

interface RoleDetails {
  id: UserRole;
  name: string;
  icon: React.FC<LucideProps>;
  color: string;
  description: string;
}
```

### Emotions

```typescript
type EmotionalState = 
  | 'frustrated-disappointed'
  | 'anxious-uncertain'
  | 'neutral-focused'
  | 'excited-proud'
  | 'determined-growth';

interface EmotionDetectionResult {
  primaryEmotion: EmotionalState;
  confidence: number;
  timestamp: Date;
  source: 'text-analysis' | 'interaction-pattern' | 'user-reported';
}
```

## Working with Emotion Detection

The emotion detection system classifies text using keyword matching. To detect emotions from text:

```typescript
// Inside a component
const { detectEmotionFromText } = useEmotion();

// Example usage
const journalEntry = "I'm feeling excited about my progress today!";
const emotionResult = detectEmotionFromText(journalEntry);
console.log(emotionResult);
// Output: { primaryEmotion: 'excited-proud', confidence: 0.75, ... }
```

For self-reporting emotions:

```typescript
// Inside a component
const { reportEmotionalState } = useEmotion();

// Example usage
const handleEmotionSelection = (emotion: EmotionalState) => {
  reportEmotionalState(emotion);
};
```

## Working with Roles

To access and change the active role:

```typescript
// Inside a component
const { activeRole, setActiveRole, availableRoles } = useJourneyRole();

// Example usage
const handleRoleChange = (role: UserRole) => {
  setActiveRole(role);
};
```

To check if a user has a specific role:

```typescript
// Inside a component
const { hasRole } = useJourneyRole();

// Example usage
if (hasRole('COACH')) {
  // Show coach-specific features
}
```

## EmotionallyAdaptivePrompt Component

This component shows different prompts based on the user's emotional state:

```tsx
// Example usage
<EmotionallyAdaptivePrompt 
  prompts={{
    'frustrated-disappointed': 'Take a deep breath and focus on small wins...',
    'anxious-uncertain': 'Let's break down your concerns one by one...',
    'neutral-focused': 'What aspect of your game would you like to work on today?',
    'excited-proud': 'Wonderful progress! How can we build on this momentum?',
    'determined-growth': 'Your dedication is impressive. Let's channel that energy...'
  }}
/>
```

## Current Implementation Status

- ✅ Basic emotion detection from text
- ✅ Self-reporting emotions
- ✅ Role switching UI and logic
- ✅ Adaptive components that respond to roles and emotions
- ⏳ Advanced NLP for emotion detection (future)
- ⏳ Historical emotional data tracking (future)
- ⏳ Role-specific analytics dashboard (future)

This document should provide a quick reference for when you return to the PickleJourney™ implementation.