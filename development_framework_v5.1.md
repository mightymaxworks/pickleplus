# Framework 5.1 - Enhanced Development Architecture

## Core Architecture Principles

Framework 5.1 extends version 5.0 with enhanced practices for structured development of the Pickle+ platform. This architecture follows a strict layered approach while incorporating specific learnings to improve clarity, maintainability, and collaboration.

## Four-Layer Architecture

### 1. Database Layer
- **Location**: `shared/schema/*.ts`
- **Purpose**: Defines data models, relationships, and validation schemas
- **Key Files**:
  - `shared/schema/[module].ts` - Module-specific database schemas
  - `shared/schema/index.ts` - Consolidated schema exports
- **Best Practices**:
  - Define all tables before implementing other layers
  - Keep table definitions minimal with only necessary fields
  - Use explicit relationships between tables
  - Document field purposes with comments
  - Include example queries in comments

### 2. Server Layer
- **Location**: `server/modules/*/routes.ts`, `server/storage/*.ts`
- **Purpose**: Implements API endpoints and data access logic
- **Key Files**:
  - `server/storage/[module]-storage.ts` - Data access implementations
  - `server/modules/[module]/routes.ts` - API endpoint definitions
  - `server/middleware/*.ts` - Shared middleware (auth, validation)
- **Best Practices**:
  - Validate all inputs using Zod schemas
  - Implement consistent error handling patterns
  - Follow REST principles for endpoint design
  - Document API behaviors and edge cases
  - Add test scripts to validate functionality

### 3. SDK Layer
- **Location**: `client/src/lib/api/*.ts`
- **Purpose**: Provides type-safe access to server APIs
- **Key Files**:
  - `client/src/lib/api/[module].ts` - Module-specific API clients
  - `client/src/lib/queryClient.ts` - React Query configuration
- **Best Practices**:
  - Create a function for each API endpoint
  - Use React Query for state management
  - Handle loading, error, and success states consistently
  - Implement proper cache invalidation strategies
  - Add test functions to demonstrate usage

### 4. UI Layer
- **Location**: `client/src/components/*`, `client/src/pages/*`
- **Purpose**: Implements user interfaces using data from SDK layer
- **Key Files**:
  - `client/src/pages/[module]/index.tsx` - Main page components
  - `client/src/components/[module]/*.tsx` - Reusable UI components
  - `client/src/core/modules/[module]/components/**` - Module-specific components
- **Best Practices**:
  - Maintain consistent visual styling across components
  - Use component composition for complex interfaces
  - Implement responsive designs with mobile-first approach
  - Add semantic component identifiers
  - Include visual reference guides as comments

## Enhanced Module Organization

### Module Structure
Each module follows a consistent organization pattern:

```
📁 [module]
 ┣ 📁 database        # Database Layer
 ┃ ┗ 📜 schema.ts     # Data models and validation schemas
 ┣ 📁 server          # Server Layer
 ┃ ┣ 📜 storage.ts    # Data access implementations
 ┃ ┗ 📜 routes.ts     # API endpoint definitions
 ┣ 📁 sdk             # SDK Layer
 ┃ ┗ 📜 api.ts        # Type-safe API client
 ┗ 📁 ui              # UI Layer
   ┣ 📜 page.tsx      # Main page component
   ┗ 📁 components    # UI components
```

### Component Hierarchy Documentation
Each module maintains a `COMPONENTS.md` file documenting:
- Component hierarchy and relationships
- Data flow between components
- State management approach
- UI/UX patterns used

## Framework 5.1 Enhancements

### 1. Component Relationship Clarity
- **Implementation**: Add header comments documenting component relationships
```typescript
/**
 * @component CommunityPage
 * @layer UI
 * @parent App.tsx
 * @children
 * - CommunityDiscoveryMockup
 * - CommunityProfileMockup
 * - CommunityCreationMockup
 * - CommunityEventsMockup
 * - CommunityAnnouncementsMockup
 */
```

### 2. Visual Validation Checkpoints
- **Implementation**: Add comments documenting expected appearance
```typescript
/**
 * @visual
 * - Orange "COMMUNITY" logo at the top (h-16 size)
 * - Tab-based navigation system below the header
 * - Grid/List view options with filter functionality
 * - Card-based community display in responsive grid
 * @expectedBehavior
 * - Tabs switch content without page reload
 * - Search filters communities in real-time
 * - Grid/List toggle switches view modes
 */
```

### 3. Component Structure Documentation
- **Implementation**: Use consistent naming conventions that reflect hierarchy
```typescript
// Parent component: CommunityPage
// Child component: CommunityPage.Discovery
// Grandchild component: CommunityPage.Discovery.Card
```

### 4. Change Versioning and Preservation
- **Implementation**: Add versioning comments to track component evolution
```typescript
/**
 * @version 2.1.0
 * @lastModified 2025-04-17
 * @changes
 * - Replaced text header with COMMUNITY logo
 * - Removed decorative elements for cleaner UI
 * @preserves
 * - Tab navigation system
 * - Community card structure and styling
 */
```

### 5. Semantic Component Identification
- **Implementation**: Add component IDs for reference in discussions
```typescript
<div 
  className="community-page-header" 
  id="community-logo-container"
  data-testid="community-header"
>
  <img src="/src/assets/community-logo-new.png" alt="COMMUNITY" className="h-16" />
</div>
```

## Development Workflow

### 1. Planning Phase
- Define feature requirements
- Identify necessary database tables
- Design API endpoints
- Create component wireframes
- Document component relationships

### 2. Implementation Phase
1. **Database Layer**: Define and document data models
2. **Server Layer**: Implement API endpoints and storage
3. **SDK Layer**: Create type-safe API clients
4. **UI Layer**: Build user interfaces using the SDK layer

### 3. Testing Phase
- Add test scripts for each layer
- Validate component appearance
- Test data flow between layers
- Ensure responsive behavior

### 4. Documentation Phase
- Update component hierarchy documentation
- Add visual validation comments
- Document changes and preserved elements
- Update semantic identifiers

## Community Hub Module Example

### Database Layer (`shared/schema/community.ts`)
```typescript
/**
 * @layer Database
 * @module Community
 * @description Schema definitions for community features
 */
export const communityTable = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  // Additional fields...
});
```

### Server Layer (`server/modules/community/routes.ts`)
```typescript
/**
 * @layer Server
 * @module Community
 * @description API endpoints for community features
 * @dependsOn Database Layer (communityTable)
 */
app.get("/api/communities", async (req: Request, res: Response) => {
  // Implementation...
});
```

### SDK Layer (`client/src/lib/api/community.ts`)
```typescript
/**
 * @layer SDK
 * @module Community
 * @description Type-safe API client for community features
 * @dependsOn Server Layer (/api/communities endpoints)
 */
export const getCommunities = async () => {
  // Implementation...
};
```

### UI Layer (`client/src/pages/communities/index.tsx`)
```typescript
/**
 * @layer UI
 * @module Community
 * @description Main page component for Community Hub
 * @dependsOn SDK Layer (getCommunities)
 * @visual
 * - Orange "COMMUNITY" logo at the top
 * - Tab-based navigation with 5 sections
 * @version 2.1.0
 * @lastModified 2025-04-17
 */
export default function CommunitiesPage() {
  // Implementation...
}
```

## Implementation Guidelines

1. **Documentation First**: Begin with documenting the component relationships
2. **Layer-by-Layer**: Follow the strict bottom-up implementation approach
3. **Visual Validation**: Add expected appearance documentation
4. **Change Tracking**: Document version changes and preserved elements
5. **Semantic Identification**: Use consistent component naming and IDs

## Best Practices Checklist

- [ ] Database tables fully defined with proper relationships
- [ ] API endpoints follow REST principles
- [ ] SDK layer provides type-safe access to all endpoints
- [ ] UI components document hierarchy and relationships
- [ ] Visual validation comments included
- [ ] Versioning comments track component evolution
- [ ] Semantic IDs used for component identification
- [ ] Responsive design implemented for all components