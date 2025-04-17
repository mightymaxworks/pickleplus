# Community Hub Component Structure

## Overview

This document outlines the component hierarchy, data flow, and visual elements of the Community Hub module, following Framework 5.1 standards.

## Component Hierarchy

```
CommunitiesPage (container)
├── DashboardLayout (layout)
│   ├── Header
│   └── MainContent
├── CommunityProvider (context)
└── Community Tabs
    ├── CommunityDiscoveryMockup
    │   ├── SearchAndFilter
    │   ├── FilterPills
    │   └── CommunityGrid/List
    │       └── CommunityCard
    ├── CommunityProfileMockup
    ├── CommunityCreationMockup
    ├── CommunityEventsMockup
    └── CommunityAnnouncementsMockup
```

## File Structure

- `client/src/pages/communities/index.tsx` - Main container component
- `client/src/components/layout/DashboardLayout.tsx` - Layout component
- `client/src/core/modules/community/context/CommunityProvider.tsx` - Data provider
- `client/src/core/modules/community/components/mockups/*.tsx` - Tab content components

## Data Flow

1. **API Layer**:
   - `GET /api/communities` - Fetches community data from server
   - Data access via `community-storage.ts`

2. **SDK Layer**:
   - `client/src/lib/api/community.ts` - API client functions
   - Uses React Query for data fetching and caching

3. **UI Layer Flow**:
   - CommunityProvider fetches data from SDK
   - Data flows down to child components via context
   - User interactions trigger SDK functions
   - UI updates based on query state (loading/success/error)

## Visual Elements

### Community Header
- **Component**: `client/src/pages/communities/index.tsx`
- **ID**: `community-logo-container`
- **Visual**: Orange "COMMUNITY" logo (h-16 size)
- **Version**: 2.1.0 (Updated April 17, 2025)

### Tab Navigation
- **Component**: Navigation tabs in communities/index.tsx
- **Visual**: Modern icon-based navigation with confetti effects
- **Interactions**: Tab changes trigger animation and content switch

### Community Cards
- **Component**: Card components in CommunityDiscoveryMockup
- **Visual**: 
  - Grid view: 3-column responsive layout
  - List view: Single column with horizontal layout
- **Elements**:
  - Gradient header with community name
  - Feature badges for special communities
  - Statistics (members, events, founding date)
  - Action buttons (View Details, Join)

## Versioning

### Version 2.1.0 (April 17, 2025)
- Replaced text header with COMMUNITY logo
- Removed decorative elements for cleaner UI
- Preserved tab navigation and community card structure

### Version 2.0.0 (April 15, 2025)
- Implemented DashboardLayout integration
- Added tab-based navigation system
- Implemented grid/list view toggle

### Version 1.0.0 (April 10, 2025)
- Initial implementation of Community Hub
- Basic community discovery features

## Planned Components

### PKL-278651-COMM-0007-ENGAGE (Next Sprint)
- CommunityDiscussion component
- CommentThread component
- ReactionSystem component

### PKL-278651-COMM-0008-ADMIN (Future)
- CommunityManagement component
- ModerationTools component
- MembershipApproval component

## Testing IDs

For component testing and selection, the following data-testid attributes are used:

- `data-testid="community-header"` - Top logo container
- `data-testid="community-tabs"` - Tab navigation container
- `data-testid="community-grid"` - Grid view container
- `data-testid="community-list"` - List view container
- `data-testid="community-card-{id}"` - Individual community cards