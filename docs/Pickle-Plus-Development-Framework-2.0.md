# Pickle+ Development Framework 2.0

## System Overview

This framework establishes a standardized system of prefixed serial codes that categorize 
our development work across different domains. Each code represents a comprehensive set of 
requirements, implementation details, and best practices.

## Reference Code Categories

Our reference codes are organized in a hierarchical structure that identifies both the module and the type of work.

### 1. Module Prefixes

Based on our application's modular architecture, we use these module prefixes:

- **USER**: User management, profiles, authentication
- **MATCH**: Match recording, validation, history
- **TOURN**: Tournament management, registration, brackets
- **ACHV**: Achievement system, badges, rewards
- **SOCIAL**: Social connections, messaging, interactions
- **COACH**: Coaching features, session management
- **GUIDE**: Guidance and tutorial systems
- **ADMIN**: Administrative functions and dashboards

### 2. Work Type Categories

Within each module, we categorize work by type:

- **UI**: UI/UX Implementation
- **FT**: Feature Development
- **DB**: Debugging & Maintenance

### 3. Serial Numbers

Each implementation has a unique 6-digit serial number.

## Reference Code Format

Each reference code follows the format:
[Module Prefix]-[Work Type]-[6-digit Serial Number][Implementation Context]

Where:
- **Module Prefix**: The functional area (MATCH, USER, TOURN, etc.)
- **Work Type**: The category of work (UI, FT, DB)
- **Serial Number**: A unique 6-digit identifier
- **Implementation Context** (optional): Specifies the implementation state

### Implementation Context Flags

We use the following implementation context flags to indicate the state of existing code:

- **[NEW]**: Complete implementation from scratch
- **[PARTIAL]**: Enhancement assuming partial implementation exists
- **[ENHANCE]**: Improvement of complete existing implementation
- **[REFACTOR]**: Restructuring of existing implementation
- **[FIX]**: Bug fixing in existing implementation

For example:
- MATCH-UI-278651[NEW]: New UI/UX implementation for the Match module
- USER-FT-123456[ENHANCE]: Enhancement of existing User feature
- ADMIN-DB-789012[FIX]: Bug fix for Admin module

## Foundational Frameworks

We have established foundational frameworks for each work type:

- UI-278651: Complete UI/UX Framework (our foundational design system)
- UI-456789: UI/UX Integration Framework (our structured approach to component integration)
- FT-123456: Feature Development Framework (our structured approach to building features)
- DB-789012: Debugging Framework (our methodical approach to solving issues)

## Usage Instructions

When referencing these codes in our communications:

1. Use the full code with module, type, and context prefixes (e.g., "MATCH-UI-278651[PARTIAL]")
2. To generate a complete implementation plan: "Generate the prompt for [code]"
3. To implement a feature using a specific framework: "Implement [feature] using [code]"
4. For foundational frameworks, you can use the type-only code (e.g., "UI-278651")

## Context-Aware Implementations

Each implementation context follows a specific structure to ensure we don't rebuild existing functionality:

### Discovery Phase

All implementation prompts should begin with a discovery phase:

```
## Discovery Phase
INSTRUCTION: Before proceeding, analyze the existing codebase to determine:
- Which components already exist and their current state
- Which API endpoints are already implemented
- Which database schemas are already defined
- Which SDK functions are already available

DO NOT regenerate or reimplement existing functionality unless explicitly requested for refactoring.
```

### Implementation Discovery Questions

Before generating implementation plans, we include these discovery questions:

```
## Discovery Questions
1. Does functionality for [feature] already exist? If so, what is its current structure?
2. What related components already exist?
3. What related API endpoints are already implemented?
4. What related database schemas are already defined?
5. What related SDK functions are already available?
6. What are the current limitations or issues with the existing implementation?
```

### Differential Implementation Plans

Our implementation plans specify:

```
## Differential Implementation Plan
### Keep (Do not modify)
- List components/code to keep as is

### Enhance (Modify existing)
- List components/code to enhance with specific changes

### Add (Create new)
- List completely new components/code to create

### Remove (If applicable)
- List components/code to remove or replace
```

### Pre-Implementation Checklist

Before any code changes, ensure there's a checklist:

```
## Pre-Implementation Checklist
- [ ] Examined existing related components
- [ ] Verified current API endpoints functionality
- [ ] Checked database schema for related tables
- [ ] Reviewed SDK layer for related functions
- [ ] Identified specific gaps or improvements needed
- [ ] Identified where in the existing UI the new component will be placed
- [ ] Documented the user navigation path to access the new feature
- [ ] Confirmed responsiveness on mobile and desktop devices
- [ ] Confirmed no duplication of existing functionality
```

## Framework Details

### UI-278651: UI/UX Framework

Our comprehensive UI/UX framework covering:

1. Core Development Principles
   - User-centric design
   - Platform performance
   - Development philosophy

2. Visual Design System
   - Brand identity (colors, themes)
   - Typography
   - Iconography
   - Spacing system

3. Responsive Design Framework
   - Breakpoint system
   - Mobile-first philosophy
   - Layout patterns
   - Responsive patterns

4. Component Architecture
   - Component hierarchy
   - Component guidelines
   - State management

5. Animation & Interaction
   - Motion principles
   - Interaction patterns
   - Micro-interactions

6. Accessibility Standards
   - WCAG compliance
   - Screen reader support
   - Inclusive design

7. UI Patterns Library
   - Navigation patterns
   - Data display patterns
   - Input patterns
   - Feedback patterns

8. Content Strategy
   - Microcopy guidelines
   - Content hierarchy
   - Loading states
   - Error handling

9. Implementation Process
   - Development workflow
   - Always integrate new components into the existing UI
   - Document access paths to new features
   - Test complete user flows, not just isolated components
   - Verify UI changes on all targeted devices
   - Quality assurance
   - Documentation

10. UI/UX Integration Guidelines
   - Always integrate components into the existing UI
   - Document access paths to newly created features
   - Test complete user flows, not just isolated components
   - Verify UI changes on all targeted devices

Using this code ensures consistent application of our design principles across the platform.

### FT-123456: Feature Development Framework

Our structured approach to developing new features:

1. Requirements Analysis
   - User story definition
   - Acceptance criteria
   - Technical constraints
   - Integration points

2. Modular Architecture
   - 4-Layer Architecture compliance (Database, Server, SDK, UI)
   - Module boundaries and interfaces
   - Clean separation of concerns
   - Cross-module communication patterns

3. Technical Implementation
   - Data modeling in shared/schema.ts
   - API design following RESTful principles
   - SDK layer abstractions for API communication
   - Component structure and state management

4. Development Approach
   - Test-driven development
   - Progressive enhancement
   - Performance considerations
   - Security measures

5. Quality Assurance
   - Unit testing strategy
   - Integration testing
   - User acceptance testing
   - Performance testing

6. Deployment Strategy
   - Feature flagging
   - Rollout approach
   - Monitoring plan
   - Rollback procedures

Using this code ensures a consistent, methodical approach to building new functionality that adheres to our modular architecture principles.

### DB-789012: Debugging Framework

Our methodical approach to debugging follows these core principles:

1. Root Cause Analysis (not symptom treatment)
   - Trace issues to their fundamental source
   - Identify the architectural layer where the issue originates
   - Understand the complete issue context and impact
   - Create reproducible test cases

2. Layer-by-Layer Investigation (respecting 4-layer architecture)
   - DATABASE: Examine data integrity, schema issues, query performance
   - SERVER: Analyze API endpoints, service logic, middleware issues
   - SDK: Review client abstraction layer, React Query implementation
   - UI: Inspect component rendering, state management, event handling

3. Comprehensive Documentation
   - Document the problem definition clearly
   - Record investigation steps taken
   - Note all findings, including what didn't work
   - Create technical documentation for the solution

4. Architectural Integrity Preservation
   - Ensure fixes maintain proper layer separation
   - Prevent cross-layer leakage of responsibilities
   - Apply fixes at the correct architectural layer
   - Follow established patterns for each layer

5. Thorough Verification
   - Unit test the specific fix
   - Test integration with adjacent components
   - Verify end-to-end functionality
   - Regression test related features

Using this code ensures we fix the root cause of issues while maintaining our architectural principles.

## Sample Prompts

Example of generating a context-aware UI implementation prompt:
"Generate the prompt for MATCH-UI-278651[PARTIAL] for the match recording interface"

Example of requesting a context-aware feature development:
"Implement user achievements tracking using ACHV-FT-123456[NEW]"

Example of requesting context-aware debugging assistance:
"Debug tournament registration validation issue using TOURN-DB-789012[FIX]"

Example of referencing a foundational framework:
"Apply the UI-278651 design principles to the coach profile page"

## UI/UX Integration Guidelines

### Component Integration Workflow

To ensure proper UI/UX integration, follow this workflow:

1. **Access Path Planning**:
   - Identify where in the existing UI the component will be placed
   - Document the navigation path users will follow to reach the feature
   - Update any necessary navigation elements (menus, tabs, links)

2. **Integration Testing**:
   - Test the complete user flow from entry point to the component
   - Verify all states (loading, error, empty, populated) display correctly
   - Confirm mobile and desktop responsiveness

3. **Documentation Requirements**:
   - Document the access path in technical documentation
   - Include screenshots of the component in context
   - Note any navigation changes made to support the new feature

4. **Common UI/UX Integration Pitfalls**:
   - Creating components that aren't linked to the UI ("orphaned components")
   - Adding features without clear navigation paths
   - Implementing desktop-only views without mobile considerations
   - Failing to test the complete user journey

Remember: **A feature that can't be found might as well not exist.**

### UI-456789: UI/UX Integration Framework

Our specific framework for ensuring proper integration of UI/UX components:

1. Integration Planning
   - Access path identification
   - User flow mapping
   - Navigation structure updates
   - Mobile and desktop consideration

2. Component Connectivity
   - Parent-child component relationship
   - Data flow planning
   - Event handling between components
   - State sharing strategies

3. Navigation Implementation
   - Menu item additions/modifications
   - Tab structure updates
   - Breadcrumb integration
   - Contextual navigation

4. Responsive Integration
   - Mobile layout adaptation
   - Desktop layout enhancement
   - Touch vs. mouse interaction differences
   - Viewport-specific component arrangements

5. Integration Testing
   - Full user journey validation
   - Navigation path verification
   - Cross-device testing
   - Performance impact assessment

6. Integration Documentation
   - Access path documentation
   - Screenshots in context
   - User flow diagrams
   - Release notes for new navigation

Using this code ensures components are properly integrated into the existing UI and accessible to users.
