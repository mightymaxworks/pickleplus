# Pickle+ Development Standard Operating Procedure

## Introduction

This document outlines the standardized development process for Pickle+ features. Following these procedures ensures consistent quality, maintainable code, and efficient development across all aspects of the platform.

## 4-Layer Architecture

All features in Pickle+ follow a strict 4-layer architecture:

1. **DATABASE LAYER**: Define data models and schemas
2. **SERVER LAYER**: Implement API endpoints
3. **SDK LAYER**: Create client SDK functions to abstract API communication
4. **UI LAYER**: Build components that use SDK functions

**Golden Rule**: Components should only talk to SDKs, not directly to APIs

## Feature Code System

Each feature is assigned a unique 6-letter code during the requirements gathering phase. This code serves as a reference point for all discussions and implementation related to that feature.

**Current Feature Codes:**
- **VALMAT** - Match Validation System

## Standardized Implementation Sequence

### Phase 1: Requirements & Design (Planning)
1. **Feature Definition**
   - Define clear requirements and user stories
   - Identify stakeholders and primary use cases
   - Document acceptance criteria
   - **Assign 6-letter feature code**

2. **Technical Specification**
   - Outline database schema changes
   - Define API contracts
   - Plan security and validation rules
   - Identify integration points with existing features

3. **UI/UX Design**
   - Create wireframes or mockups
   - Define user flows and interactions
   - Ensure consistent design language with existing components

### Phase 2: Implementation (Build)
4. **Database Layer**
   - Update shared/schema.ts with new models
   - Create migration scripts if needed
   - Define relationships between entities

5. **Server Layer**
   - Implement API endpoints in server/routes.ts
   - Create validation middleware
   - Implement business logic in storage layer

6. **SDK Layer**
   - Create or update SDK functions in client/src/lib/sdk/
   - Implement error handling and retries
   - Document SDK functions with JSDoc comments

7. **UI Layer**
   - Implement React components
   - Integrate SDK functions using React Query
   - Build forms with validation using react-hook-form and zod

### Phase 3: Quality & Deployment (Verify)
8. **Testing**
   - Verify data integrity across all layers
   - Test edge cases and error scenarios
   - Ensure mobile responsiveness

9. **Integration**
   - Ensure feature works with existing modules
   - Verify event publishing/subscribing if applicable

10. **Deployment**
    - Deploy changes
    - Monitor for errors
    - Collect user feedback

## Feature Implementation Prompt

When referring to a previously discussed feature, use the following prompt format:

```
Please implement feature [CODE] following our standardized development approach.
```

Upon receiving this prompt, the developer will:
1. Recall the detailed discussion about the feature requirements
2. Fill in the complete implementation plan based on those requirements
3. Confirm the implementation plan before proceeding
4. Begin implementation in the proper sequence once confirmed

## Implementation Principles

For every feature, always adhere to these principles:

1. **Start with Data Models**: Always begin with the database schema to ensure a solid foundation.

2. **API-First Development**: Define clear API contracts before implementing UI components.

3. **Module Independence**: Feature modules should be self-contained with clear interfaces for interaction.

4. **Progressive Enhancement**: Build core functionality first, then add enhancements.

5. **Consistent Error Handling**: Use the same patterns for errors across all layers.

6. **Validation at Every Layer**: Validate data at database, API, and UI levels.

7. **Documentation Inline**: Include clear documentation in code as you build.

8. **Event-Based Communication**: Use events for cross-module communication rather than direct dependencies.

## Feature Documentation Template

Each feature should be documented using the following template:

```markdown
# Feature: [NAME] ([CODE])

## Overview
Brief description of what the feature does and its purpose.

## Key Requirements
- Requirement 1
- Requirement 2
- Requirement 3

## Technical Implementation
### Database Changes
- Tables added/modified
- Key relationships

### API Endpoints
- `[METHOD] /api/path` - Description
- `[METHOD] /api/path/:param` - Description

### SDK Functions
- `functionName()` - Description
- `anotherFunction(param)` - Description

### UI Components
- ComponentName - Purpose/location

## Notes and Considerations
Any additional information about the feature implementation.
```

## Example: Match Validation System (VALMAT)

### Overview
The Match Validation System ensures match integrity by requiring all participants to validate matches. It includes optional feedback collection, implements anti-abuse measures, and provides a dispute resolution process.

### Key Requirements
1. All match participants must validate matches to prevent falsified records
2. Collect optional feedback from players about their matches
3. Implement daily match limits with diminishing returns for ranking points
4. Create a system to handle disputed matches

### Technical Implementation
#### Database Changes
- Added `validation_status` to matches table
- Created `match_validations` table to track individual responses
- Added `match_feedback` table for player comments/ratings
- Added fields for tracking daily match counts and point multipliers

#### API Endpoints
- `POST /api/match/validate/:matchId` - Confirm or dispute a match
- `POST /api/match/:matchId/feedback` - Submit player feedback
- `GET /api/match/daily-limits` - Check remaining full-point matches

#### SDK Functions
- `validateMatch()` - Confirm or dispute a match
- `provideFeedback()` - Submit feedback about a match
- `getDailyMatchLimits()` - Check point multipliers

#### UI Components
- MatchValidationCard - Card showing pending validation requests
- MatchFeedbackForm - Form for submitting match feedback

### Notes and Considerations
- Validation status is visible to all participants
- Match points are only awarded after full validation
- System includes notifications for pending validations