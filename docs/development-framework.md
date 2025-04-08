# Pickle+ Development Framework 3.0

This document outlines the standardized approach to development within the Pickle+ platform. Adherence to these guidelines ensures consistency, reduces duplicate work, and maintains a high standard of code quality.

## Table of Contents

1. [Ticket Structure](#ticket-structure)
2. [Prompt Engineering Standards](#prompt-engineering-standards)
3. [Architecture Patterns](#architecture-patterns)
4. [Development Process](#development-process)
5. [Code Quality Standards](#code-quality-standards)
6. [Documentation Requirements](#documentation-requirements)

## Ticket Structure

### Ticket ID Format
- **Format**: `PICKLE-[MODULE]-[6-digit number]`
- **Modules**: 
  - USER: User management and profiles
  - MATCH: Match recording and history
  - TOURNAMENT: Tournament organization and management
  - XP: Experience points and progression
  - RANKING: Player ranking and leaderboards
  - SOCIAL: Social interactions and connections
  - ADMIN: Administration and moderation
  - AUTH: Authentication and authorization
  - UI: User interface components
  - CORE: Core platform functionality

### Priority Levels
- **P0**: Critical - Must fix immediately, blocks development
- **P1**: High - Required for the current release
- **P2**: Medium - Planned for current release but can be deferred
- **P3**: Low - Nice to have, can be scheduled for future releases

### Story Points Scale
- **1 Point**: Trivial change (< 2 hours)
- **2 Points**: Simple task (half-day)
- **3 Points**: Standard task (full day)
- **5 Points**: Complex task (2-3 days)
- **8 Points**: Very complex feature (1 week)
- **13 Points**: Major feature (2 weeks)
- **21 Points**: Epic (break into smaller tickets)

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

### Multi-Stage Prompt Development

All implementation prompts should be developed through these formal stages:

1. **Stage 1: Discovery**
   - Initial feature definition
   - Codebase analysis and mapping
   - Identification of existing components

2. **Stage 2: Integration Planning**
   - Define integration points with existing code
   - Identify potential conflicts or overlaps
   - Plan necessary refactoring

3. **Stage 3: Implementation Specification**
   - Detailed implementation requirements
   - Clear boundaries between existing and new code
   - Specific guidance on extending vs. creating components

## Architecture Patterns

### 4-Layer Architecture

The Pickle+ platform follows a strict 4-layer architecture:

1. **Database Layer**
   - **Location**: `shared/schema.ts` and related files
   - **Responsibility**: Define data models and schemas
   - **Technologies**: PostgreSQL, Drizzle ORM, Zod schema validation

2. **Server Layer**
   - **Location**: `server/` directory
   - **Responsibility**: Implement API endpoints, authentication, and business logic
   - **Technologies**: Express.js, Passport.js

3. **SDK Layer**
   - **Location**: `client/src/lib/sdk/` directory
   - **Responsibility**: Abstract API communication into client functions
   - **Technologies**: TypeScript, TanStack Query

4. **UI Layer**
   - **Location**: `client/src/components/` and `client/src/pages/` directories
   - **Responsibility**: Build user interface components and pages
   - **Technologies**: React, TypeScript, Tailwind CSS, shadcn/ui

### Data Flow

Data should flow through the layers in this sequence:

1. User interacts with UI Layer
2. UI calls SDK Layer functions
3. SDK Layer makes API requests to Server Layer
4. Server Layer performs business logic and interacts with Database Layer
5. Response flows back through the layers in reverse order

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

## Code Quality Standards

### TypeScript Usage

- **Strong Typing**: Use explicit types for all functions and variables
- **No `any` Type**: Avoid using `any` unless absolutely necessary
- **Interface Definitions**: Create interfaces for all data structures
- **Type Guards**: Use type guards for runtime type checking

### Error Handling

- **Graceful Degradation**: All functions should handle errors gracefully
- **User Feedback**: Provide meaningful error messages to users
- **Logging**: Log errors with context for debugging
- **Retry Logic**: Implement retry logic for transient failures

### Performance

- **Query Optimization**: Optimize database queries for performance
- **Caching**: Use appropriate caching strategies
- **Lazy Loading**: Implement lazy loading for resource-intensive components
- **Bundle Size**: Monitor and optimize bundle size

## Documentation Requirements

### Code Documentation

- **JSDoc Comments**: All public functions must have JSDoc comments
- **README Files**: Each module should have a README file
- **Architecture Diagrams**: Complex features should have architecture diagrams

### User Documentation

- **Help Articles**: Create help articles for user-facing features
- **Tooltips**: Add tooltips for complex UI elements
- **Onboarding**: Update onboarding flows for new features

### Technical Documentation

- **API Documentation**: Document all API endpoints
- **Database Schema**: Maintain up-to-date schema documentation
- **Component Inventory**: Update component inventory with new additions

## Component Inventory Management

### Database Tables

| Table Name | Location | Description | Related Features |
|------------|----------|-------------|-----------------|
| `users` | `shared/schema.ts` | User accounts and profiles | USER, AUTH |
| `matches` | `shared/schema.ts` | Match records and results | MATCH |
| `tournaments` | `shared/schema.ts` | Tournament data | TOURNAMENT |
| ...more tables... | | | |

### API Endpoints

| Endpoint | Method | Location | Description | Auth Required |
|----------|--------|----------|-------------|--------------|
| `/api/auth/login` | POST | `server/routes.ts` | User login | No |
| `/api/match/record` | POST | `server/routes.ts` | Record match | Yes |
| `/api/tournaments` | GET | `server/routes.ts` | List tournaments | No |
| ...more endpoints... | | | | |

### SDK Functions

| Function | Location | Description | Related API Endpoint |
|----------|----------|-------------|---------------------|
| `loginUser` | `client/src/lib/sdk/authSDK.ts` | Log in a user | `/api/auth/login` |
| `recordMatch` | `client/src/lib/sdk/matchSDK.ts` | Record a match | `/api/match/record` |
| `getTournaments` | `client/src/lib/sdk/tournamentSDK.ts` | Get tournaments | `/api/tournaments` |
| ...more functions... | | | |

### UI Components

| Component | Location | Description | Used In |
|-----------|----------|-------------|---------|
| `LoginForm` | `client/src/components/auth/LoginForm.tsx` | User login form | AuthPage |
| `MatchCard` | `client/src/components/match/MatchCard.tsx` | Display match details | ProfilePage, MatchHistoryPage |
| `TournamentList` | `client/src/components/tournament/TournamentList.tsx` | List tournaments | TournamentsPage |
| ...more components... | | | |