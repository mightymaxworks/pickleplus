# Frontend-First Development Guide

This guide provides a comprehensive overview of developing features using the frontend-first approach in Pickle+.

## Introduction

Frontend-first development focuses on building features that perform calculations and data processing on the client side, with synchronization to the backend for persistence. This approach improves performance, user experience, and reduces backend load.

## Architecture Overview

![Frontend-First Architecture](https://via.placeholder.com/800x400?text=Frontend-First+Architecture)

The architecture consists of several key components:

1. **Frontend Calculation Services**: Pure JavaScript/TypeScript functions that perform calculations
2. **React Contexts**: State management for derived data across components
3. **Sync Mechanism**: Responsible for persisting data to the backend
4. **Fallback Strategies**: Ensures functionality in different states (loading, offline, etc.)

## Development Workflow

### Step 1: Identify Frontend-Friendly Features

Good candidates for frontend-first development:

- User interface calculations (XP, levels, progress bars)
- Data transformations and filtering
- Statistics and metrics
- Form validation and preprocessing

### Step 2: Design the Data Model

1. Define clear interfaces for all data structures
2. Identify raw data vs. derived data
3. Determine calculation dependencies

Example:

```typescript
// Raw data from API
interface UserData {
  id: number;
  username: string;
  xp: number;
  matchesPlayed: number;
  matchesWon: number;
}

// Derived data calculated on frontend
interface UserMetrics {
  level: number;
  progressPercentage: number;
  winRate: number;
  nextLevelXp: number;
}
```

### Step 3: Implement Calculation Service

Create pure functions for all calculations:

```typescript
// In DataCalculationService.ts
export function calculateUserLevel(xp: number): number {
  // Level calculation logic
}

export function calculateWinRate(matchesPlayed: number, matchesWon: number): number | null {
  if (matchesPlayed === 0) return null;
  return (matchesWon / matchesPlayed) * 100;
}
```

### Step 4: Implement Context Provider

Create a context to share derived data:

```typescript
// In DerivedDataContext.tsx
export function DerivedDataProvider({ children }: { children: React.ReactNode }) {
  // Fetch raw data
  const { data: userData } = useQuery({ queryKey: ['/api/user'] });
  
  // Calculate derived metrics
  const userMetrics = useMemo(() => {
    if (!userData) return null;
    
    return {
      level: calculateUserLevel(userData.xp),
      progressPercentage: calculateProgressPercentage(userData.xp),
      winRate: calculateWinRate(userData.matchesPlayed, userData.matchesWon),
      nextLevelXp: getNextLevelXp(calculateUserLevel(userData.xp))
    };
  }, [userData]);
  
  // Provide context value
  return (
    <DerivedDataContext.Provider value={{ userData, userMetrics }}>
      {children}
    </DerivedDataContext.Provider>
  );
}
```

### Step 5: Create Component Hooks

Create hooks for components to access the derived data:

```typescript
// In useDerivedData.ts
export function useUserLevel() {
  const { userMetrics, isLoading } = useDerivedData();
  return {
    level: userMetrics?.level,
    isLoading
  };
}

export function useWinRate() {
  const { userMetrics, isLoading } = useDerivedData();
  return {
    winRate: userMetrics?.winRate,
    isLoading
  };
}
```

### Step 6: Update Components

Update components to use the frontend calculations:

```tsx
function UserProfile() {
  const { level, isLoading: levelLoading } = useUserLevel();
  const { winRate, isLoading: winRateLoading } = useWinRate();
  
  if (levelLoading || winRateLoading) {
    return <LoadingSkeleton />;
  }
  
  return (
    <div>
      <h2>Level: {level}</h2>
      <p>Win Rate: {winRate ? `${winRate.toFixed(1)}%` : 'No matches yet'}</p>
    </div>
  );
}
```

### Step 7: Implement Synchronization

For data that needs to be persisted:

```typescript
// In SyncService.ts
export async function syncUserProgress(progress: UserProgress) {
  // Add to the queue for syncing
  syncQueue.add({
    endpoint: '/api/user/progress',
    data: progress,
    priority: 'high'
  });
  
  // Try to sync immediately if online
  if (navigator.onLine) {
    await processSyncQueue();
  }
}
```

### Step 8: Add Offline Support

Handle offline scenarios:

```typescript
// In useSyncStatus.ts
export function useSyncStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingChanges, setPendingChanges] = useState(syncQueue.size);
  
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Return sync status
  return {
    online,
    pendingChanges,
    syncing: syncQueue.isSyncing
  };
}
```

## Testing Strategy

### Unit Tests

Test all calculation functions:

```typescript
describe('calculateUserLevel', () => {
  test('returns level 1 for 0 XP', () => {
    expect(calculateUserLevel(0)).toBe(1);
  });
  
  test('returns level 2 for 100 XP', () => {
    expect(calculateUserLevel(100)).toBe(2);
  });
  
  // More test cases...
});
```

### Integration Tests

Test contexts and hooks:

```typescript
test('DerivedDataContext provides correct metrics', async () => {
  // Mock API response
  server.use(
    rest.get('/api/user', (req, res, ctx) => {
      return res(ctx.json({ id: 1, xp: 250, matchesPlayed: 10, matchesWon: 6 }));
    })
  );
  
  const { result, waitForNextUpdate } = renderHook(() => useDerivedData(), {
    wrapper: DerivedDataProvider
  });
  
  await waitForNextUpdate();
  
  expect(result.current.userMetrics.level).toBe(3);
  expect(result.current.userMetrics.winRate).toBe(60);
});
```

### End-to-End Tests

Test complete user workflows:

```typescript
test('User can see correct level after gaining XP', async () => {
  // Set up initial state
  
  // Render app
  render(<App />);
  
  // Navigate to profile
  userEvent.click(screen.getByText('Profile'));
  
  // Verify initial level
  expect(screen.getByText('Level: 2')).toBeInTheDocument();
  
  // Complete action that gives XP
  userEvent.click(screen.getByText('Complete Daily Challenge'));
  
  // Verify level increased
  expect(screen.getByText('Level: 3')).toBeInTheDocument();
  
  // Verify sync occurred
  await waitFor(() => {
    expect(screen.getByText('All changes saved')).toBeInTheDocument();
  });
});
```

## Performance Considerations

### Memoization

Use React's `useMemo` to prevent recalculating values:

```typescript
const userMetrics = useMemo(() => {
  if (!userData) return null;
  return calculateAllMetrics(userData);
}, [userData]);
```

### Virtual Rendering

For long lists, use virtualization:

```tsx
import { FixedSizeList } from 'react-window';

function MatchHistory({ matches }) {
  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={matches.length}
      itemSize={80}
    >
      {({ index, style }) => (
        <MatchItem match={matches[index]} style={style} />
      )}
    </FixedSizeList>
  );
}
```

### Code Splitting

Split large calculation modules:

```typescript
// Only import what's needed
import { calculateUserLevel } from '@/services/DataCalculationService';

// Instead of
import { DataCalculationService } from '@/services/DataCalculationService';
```

## Troubleshooting

### Common Issues

**Issue**: Calculations don't match backend values
**Solution**: Verify algorithm implementation and edge cases

**Issue**: Components flicker during data updates
**Solution**: Implement proper loading states and transitions

**Issue**: Sync conflicts with other users' changes
**Solution**: Implement conflict resolution strategy in SyncService

## Best Practices

1. **Validate Inputs**: Always validate inputs to calculation functions
2. **Handle Edge Cases**: Account for zero values, nulls, undefined
3. **Provide Fallbacks**: Always have default values when data is missing
4. **Benchmark Performance**: Test calculation performance with large datasets
5. **Document Assumptions**: Clearly document calculation assumptions and limitations
6. **Use TypeScript**: Leverage TypeScript for type safety in calculations
7. **Prioritize User Experience**: Design for immediate feedback, even if data is estimated

## Further Resources

- [Frontend Calculation Patterns](./frontend_calculation_patterns.md)
- [Frontend-First Implementation Plan](./frontend_first_implementation_plan.md)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Performance Optimization](https://reactjs.org/docs/optimizing-performance.html)