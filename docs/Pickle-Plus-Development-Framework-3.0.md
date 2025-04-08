# Pickle+ Development Framework 3.0

## System Overview

This framework establishes a standardized system for development work across the Pickle+ platform. It provides comprehensive guidelines for:

1. Ticket structure and tracking
2. Prompt engineering and implementation specifications
3. Architectural patterns and code organization
4. Development processes and code quality standards
5. Documentation requirements and component inventory management

Version 3.0 includes enhanced codebase analysis integration to prevent duplicate development and standardized prompt structures for implementation.

## Prompt Engineering Standards

### Standardized Prompt Structure

All implementation prompts must follow this exact structure:

```
# [Feature Name] Implementation Prompt

**[Ticket ID]**: [Feature Short Description]

## Metadata
- **Framework Version**: Pickle+ Development Framework 3.0
- **Priority Level**: [P0/P1/P2/P3]
- **Story Points**: [number]
- **Lead Developer**: [name]
- **QA Owner**: [name]
- **Related Tickets**: [comma-separated list]

## Architecture Compliance
- **Pattern**: [4-Layer Architecture / Service-Oriented / Event-Driven]
- **Data Flow**: [Describe the data flow across layers]
- **Security Requirements**: [Authentication/Authorization requirements]
- **Performance Requirements**: [Specific metrics]

## Existing Implementation Analysis
- **Codebase Scan Date**: [yyyy-mm-dd]
- **Relevant Existing Files**:
  ```
  [List of full file paths with brief description of current functionality]
  ```
- **Existing Functionality**: [Detailed description of functionality already implemented]
- **Identified Gaps**: [Specific gaps that this ticket will address]
- **Integration Points**: [How new code will interact with existing implementations]
- **Refactoring Needs**: [Any refactoring required for integration]

## Feature Description
[Detailed description of the feature]

## Requirements
[Numbered list of specific requirements]

## Implementation Details

### Layer 1: Database Layer
[Specific schema changes, table structures, and relationships]
```
Database file paths:
- `shared/schema.ts` [EXISTING/NEW/REFERENCE]
- [other relevant files]
```

### Layer 2: Server Layer
[API endpoints, middleware, service functions]
```
Server file paths:
- `server/routes.ts` [EXISTING/NEW/REFERENCE]
- `server/controllers/[feature]Controller.ts` [EXISTING/NEW/REFERENCE]
- [other relevant files]
```

### Layer 3: SDK Layer
[Client SDK interfaces and implementations]
```
SDK file paths:
- `client/src/lib/sdk/[feature]SDK.ts` [EXISTING/NEW/REFERENCE]
- [other relevant files]
```

### Layer 4: UI Layer
[Components, pages, state management]
```
UI file paths:
- `client/src/components/[feature]/[Component].tsx` [EXISTING/NEW/REFERENCE]
- `client/src/pages/[Feature]Page.tsx` [EXISTING/NEW/REFERENCE]
- [other relevant files]
```

## Technical Specifications

### Type Definitions
```typescript
// Include exact TypeScript interfaces and types
interface ExampleType {
  property: string;
  required: boolean;
}
```

### Core Functions
```typescript
// Include function signatures with JSDoc
/**
 * Description of function
 * @param paramName Description of parameter
 * @returns Description of return value
 */
function exampleFunction(paramName: string): boolean;
```

### UI/UX Guidelines
- **Colors**: [Specific color codes]
- **Animations**: [Timing, easing]
- **Responsive Behavior**: [Breakpoints, layout changes]
- **Accessibility**: [WCAG compliance level]

## Testing Requirements
- **Unit Test Coverage**: [Percentage]
- **Critical Test Cases**: [List of specific test scenarios]
- **Integration Test Requirements**: [Specific integration tests]

## Documentation Requirements
- **Code Documentation**: [JSDoc standards]
- **User Documentation**: [Required user-facing documentation]
- **Architecture Documentation**: [System design documents]

## Rollout Strategy
- **Feature Flags**: [List of feature flags]
- **Migration Strategy**: [Data migration plans]
- **Monitoring**: [Metrics to track]
```

### File Path Reference System

In implementation prompts, use these tags to clearly indicate the status of files:

- **[EXISTING]**: For files that already exist and will be modified
- **[NEW]**: For files that will be created
- **[REFERENCE]**: For files that should be used as reference but not modified

Example:
```
- `shared/schema.ts` [EXISTING] - Add new fields to user schema
- `client/src/components/xp/XPHistoryList.tsx` [NEW] - Create new component
- `client/src/components/ui/ProgressBar.tsx` [REFERENCE] - Use as base for XP progress bar
```

## Development Process

### 1. Codebase Analysis

Before writing any new code:

1. **Search for Existing Components**:
   - Use code search tools to find similar functionality
   - Review related feature tickets
   - Check component inventory

2. **Identify Integration Points**:
   - Determine how new code will interact with existing code
   - Identify potential conflicts or duplications
   - Plan necessary refactoring

3. **Document Findings**:
   - Complete the "Existing Implementation Analysis" section in the prompt
   - List all relevant existing files
   - Detail current functionality and gaps

### 2. Implementation

1. **Follow 4-Layer Architecture**:
   - Start with schema changes (Database Layer)
   - Implement API endpoints (Server Layer)
   - Create SDK functions (SDK Layer)
   - Build UI components (UI Layer)

2. **Extend Existing Code**:
   - Always prefer extending existing code over creating duplicates
   - Follow established patterns and naming conventions
   - Add comments linking to related code

3. **Testing**:
   - Write unit tests for each layer
   - Create integration tests for critical flows
   - Test for edge cases and error scenarios

### 3. Documentation

1. **Code Documentation**:
   - Add JSDoc comments to all public functions
   - Document complex logic with inline comments
   - Update relevant README files

2. **Implementation Record**:
   - Update component inventory with new additions
   - Document integration points for future reference
   - Create architecture diagrams for complex features

## Component Inventory Management

To prevent duplicate development, we maintain an organized inventory of components across all layers of the architecture. This inventory must be consulted before any new development and updated after implementation.

### Database Tables Inventory

| Table Name | Location | Description | Related Features |
|------------|----------|-------------|-----------------|
| `users` | `shared/schema.ts` | User accounts and profiles | USER, AUTH |
| `matches` | `shared/schema.ts` | Match records and results | MATCH |
| `tournaments` | `shared/schema.ts` | Tournament data | TOURNAMENT |
| `xp_transactions` | `shared/schema.ts` | Experience point transactions | XP |
| `ranking_transactions` | `shared/schema.ts` | Ranking point transactions | RANKING |

### API Endpoints Inventory

| Endpoint | Method | Location | Description | Auth Required |
|----------|--------|----------|-------------|--------------|
| `/api/auth/login` | POST | `server/routes.ts` | User login | No |
| `/api/match/record` | POST | `server/routes.ts` | Record match | Yes |
| `/api/xp/award` | POST | `server/routes.ts` | Award XP to user | Yes (Admin) |
| `/api/rankings/current/:userId` | GET | `server/routes.ts` | Get user's current ranking | No |

### SDK Functions Inventory

| Function | Location | Description | Related API Endpoint |
|----------|----------|-------------|---------------------|
| `loginUser` | `client/src/lib/sdk/authSDK.ts` | Log in a user | `/api/auth/login` |
| `recordMatch` | `client/src/lib/sdk/matchSDK.ts` | Record a match | `/api/match/record` |
| `getUserXP` | `client/src/lib/sdk/xpSDK.ts` | Get user's XP | `/api/users/:userId` |
| `getUserRanking` | `client/src/lib/sdk/rankingSDK.ts` | Get user's ranking | `/api/rankings/current/:userId` |

### UI Components Inventory

| Component | Location | Description | Used In |
|-----------|----------|-------------|---------|
| `LoginForm` | `client/src/components/auth/LoginForm.tsx` | User login form | AuthPage |
| `MatchCard` | `client/src/components/match/MatchCard.tsx` | Display match details | ProfilePage, MatchHistoryPage |
| `XPProgressBar` | `client/src/components/xp/XPProgressBar.tsx` | XP progress visualization | ProfilePage, XPPage |
| `RankingBadge` | `client/src/components/ranking/RankingBadge.tsx` | Display ranking tier | ProfilePage, LeaderboardPage |

## Example: Implementing Existing Implementation Analysis

### Poor Example (Insufficient Analysis)
```
## Existing Implementation Analysis
- **Codebase Scan Date**: 2025-04-08
- **Relevant Existing Files**:
  ```
  - shared/schema.ts
  - client/src/components/xp/XPProgressBar.tsx
  ```
- **Existing Functionality**: Some XP functionality exists
- **Identified Gaps**: Need more XP features
- **Integration Points**: Will integrate with existing components
- **Refactoring Needs**: Some refactoring may be needed
```

### Good Example (Thorough Analysis)
```
## Existing Implementation Analysis
- **Codebase Scan Date**: 2025-04-08
- **Relevant Existing Files**:
  ```
  - shared/schema.ts [EXISTING] - Contains user schema with xp, level, and rankingPoints fields, but missing transaction history tables
  - client/src/lib/sdk/xpSDK.ts [EXISTING] - Contains getUserXP() function but missing transaction and calculations
  - client/src/components/xp/XPProgressBar.tsx [EXISTING] - Basic XP progress visualization without animations
  - server/controllers/xpController.ts [PARTIAL] - Contains basic XP calculation for matches but missing multipliers
  ```
- **Existing Functionality**: 
  - Basic XP storage in user schema (fields: xp, level, rankingPoints)
  - Simple XP progress bar visualization that shows current XP and next level requirement
  - Basic XP calculation for matches that awards 25 XP for participation
  - User profile displays current XP and level without history
  
- **Identified Gaps**:
  - No transaction history tables for tracking XP sources
  - No XP multiplier system for founding members (schema has xpMultiplier field but not used)
  - Missing randomized rewards for victories and tournaments
  - No level-up animations or notifications
  - No XP history display
  
- **Integration Points**:
  - Extend existing user schema with relation to new transaction tables
  - Enhance XPProgressBar component with level-up animations
  - Extend xpController.ts to use multiplier system
  - Add endpoints for fetching XP history
  
- **Refactoring Needs**:
  - Refactor XP calculation in xpController.ts to use new multiplier system
  - Update match recording flow to include XP visualization
  - Modify profile page to include XP history section
```

## Best Practices for Avoiding Duplicate Development

1. **Always Start With Search**: Before beginning any implementation, search for similar existing functionality.

2. **Check Component Inventory**: Consult the component inventory to identify reusable components.

3. **Examine Module Relationships**: Understand how your feature interacts with existing modules.

4. **Clarify With Stakeholders**: When uncertain about potential duplication, ask stakeholders.

5. **Document Your Findings**: Always document what you found and how your implementation will interact with it.

6. **Track Integration Points**: Create clear documentation of how new code integrates with existing functionality.

7. **Regular Inventory Updates**: Update the component inventory whenever you add or modify components.

8. **Incremental Improvement**: Prefer enhancing existing functionality over creating new components.

9. **Cross-Module Awareness**: Be aware of functionality in other modules that might be relevant.

10. **Comprehensive Testing**: Test how your changes interact with existing functionality.
