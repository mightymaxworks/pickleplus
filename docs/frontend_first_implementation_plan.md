# Pickle+ Frontend-First Implementation Roadmap

**Document Created**: April 26, 2025  
**Author**: Pickle+ Development Team  
**Status**: Planning  

## Overview

This document outlines our strategy to transition Pickle+ to a frontend-first approach with periodic database synchronization. This architectural shift aims to improve performance, responsiveness, and user experience by reducing API calls and providing immediate feedback.

## Current Issues

1. **XP/Level Calculation Inconsistencies**: Users with 814 XP were displayed as Level 1 instead of Level 6
2. **Unresponsive Profile Page**: Heavy API usage and inefficient rendering causing performance issues
3. **Excessive API Calls**: Many components make separate API calls for similar data
4. **Delayed User Feedback**: Users must wait for server responses before seeing updates

## Implementation Phases

### Phase 1: Core Calculation Services (Sprint 1)

#### 1.1 Frontend Calculation Utility
- ✅ Create `calculateLevel.ts` utility for consistent level calculations
- ✅ Fix level display in Experience Points card 
- Add level calculation debugging and validation
- Unit tests for level calculation

#### 1.2 Data Calculation Service
```typescript
// client/src/services/DataCalculationService.ts
export class DataCalculationService {
  // Core data calculations
  static calculateUserLevel(xp: number): number { ... }
  static calculateXPProgress(xp: number, level: number): number { ... }
  
  // CourtIQ metrics
  static calculatePerformanceScore(stats: any): number { ... }
  static calculateMasteryLevel(metrics: any): number { ... }
  
  // Community metrics
  static calculateLeaderboardPosition(userScore: number, leaderboard: any[]): number { ... }
}
```

#### 1.3 Client-Side State Management
- Create React Context for derived data
- Implement hooks for accessing calculation results
- Set up caching mechanism for expensive calculations

### Phase 2: Profile Page Optimization (Sprint 1)

#### 2.1 Tab-Based Data Loading
```typescript
// In EnhancedProfilePage.tsx
const [activeTab, setActiveTab] = useState('overview');

// Only load data for the active tab
const { data: performanceData } = useQuery({
  queryKey: ['profile', 'performance', userId],
  queryFn: () => fetchPerformanceMetrics(userId),
  enabled: activeTab === 'performance',
  staleTime: 5 * 60 * 1000, // Cache for 5 minutes
});
```

#### 2.2 Virtualized Rendering
- Implement virtualized lists for match history
- Only render visible items in long lists
- Add progressive loading for performance-intensive components

#### 2.3 Frontend Caching
- Cache profile data to reduce repeated API calls
- Implement time-based cache invalidation
- Add loading states for uncached data

### Phase 3: Data Synchronization (Sprint 2)

#### 3.1 Create Sync Service
```typescript
// client/src/services/SyncService.ts
export class SyncService {
  // Queue for pending updates
  static pendingUpdates = [];
  
  // Add update to queue
  static queueUpdate(endpoint, data, priority) { ... }
  
  // Process queue based on priority
  static async processQueue() { ... }
  
  // Schedule periodic sync
  static setupPeriodicSync(intervalMs = 60000) { ... }
}
```

#### 3.2 Batch Update API
```typescript
// server/routes.ts
app.post("/api/batch-update", isAuthenticated, async (req, res) => {
  const { updates } = req.body;
  const results = await Promise.all(updates.map(async (update) => {
    // Process each update by type
  }));
  
  res.json({ results });
});
```

#### 3.3 Optimistic UI Updates
- Show UI changes immediately while updates are being processed
- Provide rollback mechanism for failed updates
- Implement retry logic for network failures

### Phase 4: Component Updates (Sprint 2)

#### 4.1 Experience & Level Components
- ✅ Update XPProgressCard.tsx
- Update PlayerPassport.tsx
- Update LevelProgress.tsx
- Update any other level-dependent components

#### 4.2 CourtIQ & Performance Components
- Update CourtIQStatsOverview.tsx
- Update MasteryPathsDisplay.tsx
- Update PCPRankings.tsx

#### 4.3 SAGE & Recommendation Components
- Update SimpleSageWidget.tsx
- Update SageRecommendationsWidget.tsx
- Implement drill recommendations based on frontend calculations

### Phase 5: Testing & Validation (Sprint 3)

#### 5.1 Performance Testing
- Measure response time improvements
- Compare API call frequency before and after
- Profile memory usage on frontend

#### 5.2 User Testing
- Verify smooth UX across various user profiles
- Test with different XP levels and performance metrics
- Gather feedback on perceived responsiveness

#### 5.3 Edge Case Testing
- Test with network interruptions
- Verify data consistency during sync failures
- Ensure correct behavior with extreme user data values

## Benefits

1. **Immediate UI Updates**: Users see changes instantly without waiting for server
2. **Reduced Server Load**: Fewer API calls means lower server costs
3. **Better Offline Support**: Core features work with intermittent connectivity
4. **Consistent Calculations**: Single source of truth for all calculations
5. **Improved Performance**: Smoother UI with fewer loading states

## Implementation Timeline

| Phase | Sprint | Start Date | End Date | Key Deliverables |
|-------|--------|------------|----------|------------------|
| 1     | 1      | Apr 26     | May 3    | Core calculation services, XP fix |
| 2     | 1      | Apr 26     | May 3    | Profile page optimization |
| 3     | 2      | May 4      | May 10   | Data sync mechanism, batch API |
| 4     | 2      | May 4      | May 10   | Update key components |
| 5     | 3      | May 11     | May 17   | Testing and validation |

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sync conflicts | Data inconsistency | Implement conflict resolution, server as source of truth |
| Calculation drift | Different results on different devices | Regular validation with server values |
| Increased client complexity | Harder to maintain | Thorough documentation, unit tests |
| Browser compatibility | Inconsistent experience | Feature detection, graceful degradation |

## Conclusion

Moving to a frontend-first approach will significantly improve the Pickle+ user experience while reducing server load. This hybrid approach maintains data integrity through periodic synchronization while providing the responsiveness of a client-side application.