# PKL-278651-JOUR-002: PickleJourney™ Dashboard Evolution

## Project Vision

PickleJourney™ is evolving from a simple journaling tool into a personalized growth center and comprehensive onboarding experience. This enhanced dashboard will serve as the genesis of each user's pickleball journey, supporting players with multiple roles in the ecosystem (player, coach, referee, etc.) while collecting meaningful data about their goals, preferences, and emotional states.

The PickleJourney™ dashboard will maintain a separate route (`/journey`) from the existing dashboard to ensure we preserve current functionality while building this new experience.

## Multi-Role Support

The platform already supports users having multiple roles through our database structure. This sprint will leverage and enhance this capability by:

1. Allowing users to identify all their current roles in pickleball
2. Prioritizing roles based on user preference
3. Providing role-specific content and prompts
4. Visualizing progress and interactions between roles
5. Enabling context-switching between role perspectives

## User Personas and Journeys

### Primary User Personas

1. **The Multi-Role Enthusiast**
   - Primary role: Competitive Player
   - Secondary role: Community Coach
   - Key need: Connecting insights between playing and coaching

2. **The Tournament Professional**
   - Primary role: Tournament Director
   - Secondary roles: Referee, Recreational Player
   - Key need: Leveraging officiating knowledge in play and organization

3. **The Skill Developer**
   - Primary role: Player in Development
   - Secondary role: Student
   - Aspirational role: Future Coach
   - Key need: Documenting learning journey and building coaching skills

4. **The Community Builder**
   - Primary role: Club Administrator
   - Secondary role: Recreational Player
   - Key need: Growing community while improving personal skills

### Key Journey Flows

1. **Multi-Role Onboarding Flow**
   - Role discovery and selection
   - Role prioritization
   - "Your Why" exploration for each role
   - Goal-setting across roles
   - Dashboard introduction

2. **Daily Check-in Journey Flow**
   - Role-specific prompt presentation
   - Emotional state check-in
   - Journaling with role context
   - Progress visualization across roles
   - Suggested next actions

3. **Reflection and Analysis Flow**
   - Multi-perspective review options
   - Timeline visualization with role indicators
   - Pattern identification between roles
   - Goal adjustment recommendations
   - Insights sharing (optional)

## Sprint PKL-278651-JOUR-002 Plan

### Sprint Goal
Create an immersive, multi-role PickleJourney™ dashboard that serves as both an onboarding experience and a personalized growth center for users, while maintaining the existing dashboard as a fallback option.

### Sprint Breakdown

#### PKL-278651-JOUR-002.1: Multi-Role Foundation (Days 1-5)

**Objective:** Build the core infrastructure for supporting multiple user roles and role-based content

**Key Deliverables:**

1. **Role Management System**
   - Enhance existing `userRoles` functionality with role prioritization
   - Create a role context provider for the PickleJourney dashboard
   - Implement local storage caching for role preferences 
   - Build a hook for accessing current role context: `useJourneyRoles()`

2. **Multi-Role Onboarding Experience**
   - Create `RoleDiscoveryWizard` component with:
     - Role selection interface (using existing role system)
     - Role prioritization UI
     - "Your Why" exploration for each role
     - Storage of responses in journey metadata
   - Make wizard accessible from the PickleJourney dashboard

3. **Role Switching Interface**
   - Build a role perspective toggle component
   - Implement role-context-aware styling (visual cues for current role)
   - Create smooth transitions between role perspectives

#### PKL-278651-JOUR-002.2: Adaptive Journey Dashboard (Days 6-10)

**Objective:** Create a dynamic dashboard that adapts to the user's roles and emotional state

**Key Deliverables:**

1. **Journey Map Visualization**
   - Design and implement a visual journey timeline
   - Support color-coding by role
   - Show role interconnections and shared milestones
   - Make visualization interactive (zoom, explore, focus)

2. **Contextual Prompts System**
   - Build a prompt engine that generates role-specific prompts
   - Create a database of prompts organized by role, experience level, and emotional state
   - Implement a prompt display component with response tracking
   - Support linking responses to the journal system

3. **Emotion-Aware Components**
   - Enhance the existing `EmotionReporter` component to include role context
   - Create adaptive UI elements that respond to emotional state
   - Build a theme system that shifts based on emotions

#### PKL-278651-JOUR-002.3: Integration & Enhancement (Days 11-14)

**Objective:** Connect the journey dashboard to other platform features and polish the experience

**Key Deliverables:**

1. **Cross-Module Integration**
   - Link journey dashboard to match history
   - Connect to CourtIQ™ rating visualization
   - Integrate with existing achievement system
   - Create hooks for SAGE to access journey data

2. **Enhanced Journaling**
   - Update `JournalEntryForm` to support role-specific templates
   - Create multi-role reflection interfaces
   - Build emotion and role tagging for entries
   - Enhance timeline visualization with emotional data

3. **Navigation & Accessibility**
   - Add prominent entry points to journey dashboard
   - Create smooth transitions between standard dashboard and journey experience
   - Implement progressive disclosure of features
   - Ensure all new components are fully responsive and accessible

## Technical Architecture

### Component Structure

```
client/src/modules/picklejourney/
├── components/
│   ├── dashboard/             # Dashboard components
│   │   ├── JourneyDashboard.tsx
│   │   ├── RoleSwitcher.tsx
│   │   └── ProgressVisualization.tsx
│   ├── onboarding/            # Onboarding components
│   │   ├── RoleDiscoveryWizard.tsx
│   │   ├── WhyExploration.tsx
│   │   └── RolePrioritization.tsx
│   ├── journaling/            # Enhanced journaling
│   │   ├── RoleSpecificJournal.tsx
│   │   ├── MultiRolePrompts.tsx
│   │   └── EmotionalInsightPanel.tsx
│   └── shared/                # Shared components
│       ├── RoleBadge.tsx
│       ├── EmotionAwareCard.tsx
│       └── JourneyNavigation.tsx
├── hooks/
│   ├── useJourneyRoles.ts     # Role management
│   ├── useRoleContext.ts      # Role context
│   ├── useJourneyProgress.ts  # Progress tracking
│   └── useEmotionalTheme.ts   # Theme adaptation
├── contexts/
│   ├── JourneyRoleContext.tsx # Role context provider
│   └── EmotionalStateContext.tsx # Emotion context
├── types.ts                   # Type definitions
└── index.ts                   # Module exports
```

### Data Model Extensions

```typescript
// Journey-specific user metadata
export interface JourneyMetadata {
  rolePreferences: {
    roles: UserRole[];          // All selected roles
    primaryRole: UserRole;      // Primary role focus
    roleWhys: Record<UserRole, string>; // Why for each role
  };
  onboardingStatus: {
    completed: boolean;
    lastStep: string;
    completedSteps: string[];
  };
  journeyProgress: {
    milestones: JourneyMilestone[];
    currentLevel: number;
    roleSpecificLevels: Record<UserRole, number>;
  };
}

// Role-specific journal entry extensions
export interface JournalEntryExtended extends JournalEntry {
  roles: UserRole[];           // Roles relevant to this entry
  primaryRole: UserRole;       // Primary role perspective 
  crossRoleInsights?: string;  // Insights across roles
  emotionalState: EmotionalState;
}
```

## Implementation Strategy

1. **Frontend-First Approach**
   - Develop client-side functionality first for rapid iteration
   - Use local storage for early prototyping when appropriate
   - Add server-side persistence once interfaces are stable

2. **Parallel Path Development**
   - Keep the existing dashboard fully functional throughout development
   - Ensure all new functionality lives at the separate `/journey` route
   - Implement clear navigation between experiences

3. **Progressive Enhancement**
   - Start with core role management system
   - Add one feature at a time with working (if simplified) implementations
   - Continuously test on the journey dashboard route

4. **User Experience Flow**
   - Design smooth pathways between standard and journey dashboards
   - Create clear entry and exit points
   - Use progressive disclosure to avoid overwhelming users

## Success Metrics

- Engagement: Time spent on journey dashboard vs standard dashboard
- Completion: Percentage of users completing role discovery
- Retention: Return visits to the journey dashboard
- Activity: Number of journal entries with role context
- Usage: Distribution of role perspectives accessed

## Next Steps

1. Begin development of the core Role Management System components
2. Design the Multi-Role Onboarding Experience
3. Implement the first version of the role-specific journaling interface
4. Create navigation between the standard dashboard and journey experience