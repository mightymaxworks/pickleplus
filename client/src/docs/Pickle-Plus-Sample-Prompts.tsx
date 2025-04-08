/**
 * Pickle+ Sample Prompts
 * 
 * This file provides examples of how the serial code reference system works in practice,
 * with detailed sample prompts for each category.
 */

/**
 * This is a documentation-only file that doesn't export any functional components.
 */

/*
# Pickle+ Sample Prompts

## UI-278651 (UI/UX Framework) Sample

When you say: "Generate the prompt for UI-278651 for the Match Center revamp"

I would generate a detailed implementation plan like:

```
Implement a complete revamp of the Match Center following these specifications:

1. Mobile-First Implementation:
   - Create responsive breakpoints: XS (<576px), SM (576-767px), MD (768-991px), LG (992-1199px), XL (≥1200px)
   - Optimize for touch with minimum 44x44px touch targets
   - Implement bottom navigation for mobile views

2. Component Structure:
   - Create a TabView component with tabs for overview, rankings, history, and validation
   - Implement UserRankingSnapshot component at the top
   - Add floating action button (FAB) for match recording

3. CourtIQ Integration:
   - Add performance insights card showing player strengths/weaknesses
   - Implement skill radar chart visualization
   - Display match quality metrics

4. Visual Design:
   - Use primary color #FF5722 (orange) for key actions
   - Use secondary color #2196F3 (blue) for supporting elements
   - Ensure WCAG 2.1 AA compliance with all interactive elements

5. Data Display:
   - Implement card-based UI for main content sections
   - Use skeleton loaders for asynchronous data
   - Add pull-to-refresh for data updates on mobile
```

## FT-123456 (Feature Development) Sample

When you say: "Generate the prompt for FT-123456 for user achievements tracking"

I would generate:

```
Implement user achievements tracking following our 4-Layer Architecture:

1. DATABASE LAYER: Data Modeling
   - In shared/schema.ts:
     * Create achievements table schema (name, description, icon, points, criteria)
     * Design userAchievements join table (userId, achievementId, completionDate, isRewarded)
     * Define relations between users and achievements tables
     * Create insert/select types with drizzle-zod

2. SERVER LAYER: API Implementation
   - Create server/routes.ts endpoints:
     * GET /api/achievements - List all available achievements
     * GET /api/user/achievements - List user's completed/in-progress achievements
     * POST /api/user/achievements/:id/claim - Claim achievement rewards
   - Implement achievement service in server/services/achievement.ts:
     * Achievement validation logic
     * Achievement unlock triggers
     * Background processors for time-based achievements

3. SDK LAYER: Client Abstraction
   - Create client/src/lib/sdk/achievementSDK.ts with:
     * getAchievements() - Fetch all achievements
     * getUserAchievements() - Fetch current user's achievements
     * claimAchievement(id) - Claim achievement reward
     * useAchievements() hook with React Query
     * useUserAchievements() hook with React Query

4. UI LAYER: Frontend Components
   - Create components using SDK (never direct API calls):
     * client/src/components/achievements/AchievementDashboard.tsx
     * client/src/components/achievements/AchievementCard.tsx
     * client/src/components/achievements/AchievementUnlockToast.tsx
     * client/src/pages/achievements-page.tsx

5. Cross-Layer Integration:
   - Define achievement event handlers in server/events/achievements.ts
   - Create listeners for match completion, tournament participation
   - Register achievement components in the appropriate app sections

6. Testing Strategy:
   - Unit tests for achievement criteria validation
   - Integration tests for achievement unlocking flows
   - Component tests for achievement UI elements
   - End-to-end tests for complete achievement workflows
```

## DB-789012 (Debugging Framework) Sample

When you say: "Generate the prompt for DB-789012 for match recording validation issue"

I would generate:

```
Debug the match recording validation issue with a focus on root cause analysis:

1. Root Cause Identification (not symptom treatment):
   - Trace the validation issue to its source layer in our architecture
   - Determine whether this is a data, logic, or presentation issue
   - Create a reproducible test case with specific steps
   - Document the exact error messages and behavior

2. Systematic Layer-by-Layer Investigation:
   - DATABASE LAYER: 
     * Examine match schema for validation constraints
     * Verify data integrity in existing match records
     * Check for schema/migration inconsistencies
     * Test direct database queries to validate data

   - SERVER LAYER:
     * Review validation logic in server/routes.ts
     * Analyze API endpoint behavior with different inputs
     * Check middleware that might affect validation
     * Trace the request/response cycle with logging

   - SDK LAYER:
     * Inspect matchSDK.ts implementation for validation handling
     * Examine React Query mutation error handling
     * Verify proper error propagation to UI
     * Test SDK methods in isolation

   - UI LAYER:
     * Review form validation in match recording components
     * Check state management and error display
     * Verify UI validation matches backend expectations
     * Test user interactions that trigger validation

3. Comprehensive Documentation:
   - Document all investigation steps taken
   - Record findings at each layer of the architecture
   - Note any discovered discrepancies between layers
   - Create diagrams of the validation flow if helpful

4. Solution with Architectural Integrity:
   - Implement fixes at the appropriate layer (not just where symptoms appear)
   - Ensure each layer maintains its proper responsibilities
   - Standardize validation logic across all layers
   - Make sure fixes follow our established patterns

5. Thorough Verification:
   - Create unit tests specific to the identified issue
   - Test the validation flow end-to-end
   - Verify fix works for all edge cases (unusual scores, etc.)
   - Regression test related match functionality
   - Document the fix and update technical documentation
```

*/

// This is a documentation file only, so we export nothing
export {};