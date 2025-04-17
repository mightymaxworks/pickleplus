# Pickle+ Development Framework v5.2

## Core Principles

1. **Layered Architecture**: Database → Server → SDK → UI
2. **Modular Design**: Each feature is self-contained with its own database schema, server routes, SDK hooks, and UI components
3. **Semantic Identifiers**: Components and files follow a consistent naming scheme reflecting their functionality
4. **Open Source First**: Leverage high-quality open source solutions rather than building from scratch
5. **Visual Test-Driven Development**: Confirm functionality visually at each layer
6. **Mobile-First Responsive Design**: All UI components scale appropriately across device sizes

## Layer Implementation Guidelines

### Database Layer
- Define schema in `/shared/schema/{module}.ts`
- Use Drizzle ORM for type-safety and query building
- Implement migrations for schema changes using migration scripts
- **NEW**: Consider compatible storage abstractions for integrating open source solutions

### Server Layer
- Implement routes in `/server/modules/{module}/routes.ts`
- Follow RESTful API design principles
- Use unified error handling and response formatting
- Validate requests using Zod schemas from shared layer
- **NEW**: Design API gateways for bridging to integrated open source services

### SDK Layer
- Create hooks in `/src/lib/hooks/use{Feature}.ts`
- Use TanStack Query for data fetching and caching
- Implement mutations with optimistic updates
- Provide proper TypeScript typing for all functions
- **NEW**: Create adapter patterns for integrating open source service APIs

### UI Layer
- Build components in `/src/components/{module}/{Component}.tsx`
- Use Tailwind CSS with unified theme variables
- Ensure responsive design with mobile-first approach
- Implement accessibility best practices (ARIA, keyboard navigation)
- **NEW**: Prefer integrating and styling existing components over building from scratch

## NEW: Open Source Integration Strategy

### Evaluation Criteria
1. **Compatibility**: How well does the solution integrate with our existing stack?
2. **Maturity**: Is the project stable, well-maintained, and battle-tested?
3. **Customizability**: Can we adapt it to match our UI/UX requirements?
4. **Performance**: Will it meet our performance expectations at scale?
5. **Community**: Is there active development and support?

### Integration Approaches
1. **Direct Component Import**: Use React components directly from the library
2. **API Integration**: Connect to the service through API endpoints
3. **Iframe Embedding**: Embed the full solution in an iframe with SSO
4. **Headless Usage**: Use backend services with our own custom UI
5. **Fork and Adapt**: Fork the project and modify to fit our specific needs

### Recommended Open Source Solutions by Domain
- **Community Forums**: Discourse, NodeBB, Spectrum
- **Event Management**: Meetup API, Open Event, Strapi with event plugins
- **Content Management**: Strapi, Directus, Ghost Headless
- **User Authentication**: Auth0, Keycloak, Supabase Auth
- **Real-time Communications**: Matrix, Socket.io, Firebase Realtime DB

## Implementation Workflow

1. **Planning Phase**
   - Identify requirements and user stories
   - **NEW**: Evaluate available open source solutions before planning custom development
   - Design database schema
   - Create API specifications

2. **Development Phase**
   - Implement database schema and migrations
   - **NEW**: If using existing solution, implement integration patterns
   - Develop server-side endpoints or integration adapters
   - Create SDK hooks for data access
   - Build UI components with proper styling
   - **NEW**: Apply consistent theming to integrated open source components

3. **Testing Phase**
   - Validate database operations
   - Test API endpoints with Postman/cURL
   - Verify SDK hooks with mock data
   - **NEW**: Run integration tests for open source connections
   - Conduct visual testing across device sizes

4. **Documentation Phase**
   - Update schema documentation
   - Document API endpoints
   - **NEW**: Document integration points with open source services
   - Add component usage examples
   - Update architectural diagrams

## File Annotations

All files should include standardized annotations:

```typescript
/**
 * @component ComponentName
 * @layer UI|SDK|Server|DB
 * @module FeatureName
 * @version x.y.z
 * @description Brief description of the component's purpose
 * 
 * Detailed description of functionality, integration points, and usage notes.
 * 
 * @openSource Integrated with [package-name@version] 
 * @integrationPattern [Direct|API|Iframe|Headless|Fork]
 * @dependencies List of key dependencies
 * @lastModified YYYY-MM-DD
 */
```

## Sprint Coding Standards

Sprint codes follow the format: `PKL-{ID}-{FEATURE}-{NUMBER}-{TYPE}`

- **ID**: Project identifier (e.g., 278651)
- **FEATURE**: Short feature code (e.g., COMM for Community)
- **NUMBER**: Sequential feature number (e.g., 0007)
- **TYPE**: Implementation type:
  - ARCH: Architecture
  - DB: Database
  - API: Server API
  - SDK: SDK Layer 
  - UI: User Interface
  - TEST: Testing
  - **NEW**: OSI: Open Source Integration
  - **NEW**: ADAPT: Open Source Adaptation

## A/B Testing Implementation

**NEW**: For parallel implementation strategies:

1. Create route alternates with pattern `/module/feature-variant` (e.g., `/community/v2`)
2. Implement feature flags in the application config
3. Add tracking to measure performance metrics between variants
4. Document hypotheses and success criteria for each variant

## Example Implementation Flow with Open Source Integration

For community forum implementation:

1. **DB Layer**: Define schema that maps to integrated solution's data model
2. **Server Layer**: Create API gateway to translate between systems
3. **SDK Layer**: Implement adapter hooks to normalize data access
4. **UI Layer**: Either theme integrated components or build custom wrappers

## Visual Testing Checkpoints

Each layer implementation must include visual confirmation:
- Database: Verify schema creation and data integrity
- Server: Test API responses with tools like Postman
- SDK: Confirm data retrieval and update functions
- UI: Validate component rendering across device sizes
- **NEW**: Integration: Verify data flow between our system and integrated solutions