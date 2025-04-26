# Frontend Calculation Patterns

This document outlines the patterns and best practices for implementing frontend-first calculations in the Pickle+ application.

## Overview

The frontend-first approach prioritizes client-side calculations and data processing to improve performance and responsiveness. Key benefits include:

- **Reduced API calls**: Minimizes backend load by performing calculations on the client
- **Immediate feedback**: Users see results instantly without waiting for server responses
- **Offline capability**: Core functions continue to work without network connectivity
- **Reduced server load**: Distributes computational work to client devices

## Core Components

### 1. DataCalculationService

The `DataCalculationService` is the central calculation engine that provides standardized methods for all frontend calculations:

```typescript
// Import specific calculation functions
import { calculateUserLevel, calculateXPProgress } from '@/services/DataCalculationService';

// Or use the service class directly
import { DataCalculationService } from '@/services/DataCalculationService';
```

The service offers both static methods and named exports for flexibility:

```typescript
// Using static methods
const level = DataCalculationService.calculateUserLevel(xp);

// Using named exports
const level = calculateUserLevel(xp);
```

### 2. DerivedDataContext

The `DerivedDataContext` provides a React Context for accessing calculated data throughout the component tree:

```typescript
// Use the general context hook
const { userStats, calculatedMetrics, isLoading, error } = useDerivedData();

// Or use metric-specific hooks
const { value: level, isLoading } = useDerivedMetric('level');
const { value: winRate, isLoading } = useDerivedMetric('winRate');
```

## Implementation Patterns

### Pattern 1: Direct Component Calculation

Use when a component needs a simple, one-off calculation:

```tsx
import { calculateUserLevel } from '@/services/DataCalculationService';

function UserBadge({ user }) {
  const level = calculateUserLevel(user.xp);
  
  return <div>Level {level}</div>;
}
```

### Pattern 2: Context-Based Calculation

Use for data that needs to be shared across components:

```tsx
import { useDerivedMetric } from '@/contexts/DerivedDataContext';

function XPDisplay() {
  const { value: level, isLoading } = useDerivedMetric('level');
  const { value: xpProgress, isLoading: progressLoading } = useDerivedMetric('xpProgress');
  
  if (isLoading || progressLoading) {
    return <Skeleton />;
  }
  
  return (
    <div>
      <div>Level {level}</div>
      <div>Progress: {xpProgress}%</div>
    </div>
  );
}
```

### Pattern 3: Fallback Calculations

Use when data might not be available from the context yet:

```tsx
import { useDerivedMetric } from '@/contexts/DerivedDataContext';
import { calculateUserLevel } from '@/services/DataCalculationService';

function UserLevel({ user }) {
  // Try to get from context first
  const { value: contextLevel, isLoading } = useDerivedMetric('level');
  
  // Fallback to direct calculation if context is not ready
  const level = contextLevel ?? calculateUserLevel(user.xp);
  
  return <div>Level {level}</div>;
}
```

## Best Practices

1. **Single Source of Truth**: Keep all calculation logic in the `DataCalculationService` to maintain consistency.

2. **Unit Testing**: Always write tests for calculation functions to verify accuracy.

3. **Loading States**: Always handle loading states when using context-based data.

4. **Data Validation**: Validate inputs to calculation functions to prevent errors.

5. **Fallback Mechanisms**: Implement fallbacks to ensure components work even if context data isn't ready.

6. **Performance Considerations**:
   - Cache calculation results when possible
   - Use React.memo for components that perform heavy calculations
   - Avoid recalculating values on every render

## Verification and Testing

When implementing frontend calculations, always verify:

1. **Correctness**: Results must match the expected values from the backend
2. **Edge Cases**: Test boundary conditions (zero values, null values, etc.)
3. **Performance**: Ensure calculations don't cause noticeable UI lag

Run the test suite to verify calculation accuracy:

```bash
npm test -- --testPathPattern=DataCalculationService
npm test -- --testPathPattern=calculateLevel
```

## Migration Guide

When migrating an existing component to use frontend calculations:

1. Identify the calculations currently performed by the API
2. Create corresponding methods in DataCalculationService
3. Write tests to verify calculation accuracy
4. Update the component to use frontend calculations
5. Add appropriate loading states and fallbacks
6. Verify the component works without API calls

## Common Patterns by Feature

### XP and Leveling

```typescript
import { calculateUserLevel, calculateXPProgress } from '@/services/DataCalculationService';
```

### CourtIQ Performance

```typescript
import { calculatePerformanceScore, calculateMasteryLevel } from '@/services/DataCalculationService';
```

### Match Statistics

```typescript
import { calculateWinRate, calculateRecentPerformance } from '@/services/DataCalculationService';
```