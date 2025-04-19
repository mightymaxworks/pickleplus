# Sprint Documentation: Community XP Leaderboards
**Created: April 19, 2025 - 12:15 PM ET**

## Sprint Information
- **Sprint ID**: PKL-278651-XP-0004-COMM-LEAD
- **Start Date/Time**: April 19, 2025 - 2:00 PM ET
- **Target Completion Date/Time**: April 26, 2025 - 5:00 PM ET
- **Actual Completion Date/Time**: [To be filled]

## Feature Overview
- **Feature ID**: PKL-278651-XP-0004-COMM-LEAD
- **Feature Name**: Community XP Leaderboards 
- **Business Priority**: High
- **Technical Complexity**: Medium

## Pre-Implementation Analysis
**Timestamp: April 19, 2025 - 12:20 PM ET**

### Related Files
| File Path | Purpose | Integration Points |
|-----------|---------|-------------------|
| server/modules/xp/xp-service.ts | Core XP awarding service | Handles all XP awards |
| server/modules/xp/community-xp-integration.ts | Community XP integration | Links community actions to XP |
| server/routes/xp-routes.ts | XP API endpoints | Provides XP data |
| shared/schema.ts | Database schema | XP tables and relationships |
| client/src/components/community/CommunityHeader.tsx | Community page header | Display location for top contributors |
| client/src/components/community/CommunityLeaderboard.tsx | [New file] | Will show community leaderboard |
| client/src/components/community/CommunityTabs.tsx | Community page tabs | Will need tab for leaderboard |
| client/src/pages/leaderboard.tsx | Global leaderboard page | Needs community filter |

### Current Implementation Patterns
1. **XP Transaction Recording**: All XP awards are recorded in xpTransactions table with source field
2. **Community Engagement**: Community activities are tracked in community_activities table
3. **Tab-Based UI**: Community pages use tabs for different content sections
4. **API Endpoint Pattern**: API endpoints use RESTful patterns with consistent error handling

### Change Plan
**Timestamp: April 19, 2025 - 12:30 PM ET**

#### Schema Changes
| File Path | Lines to Change | Intended Modification | 
|-----------|----------------|----------------------|
| shared/schema.ts | Add new schema | Add communityCategory field to xpTransactions table |

```typescript
// XP Transactions Schema Addition
export const xpTransactions = pgTable('xp_transactions', {
  // existing fields
  communityId: integer('community_id').references(() => communities.id),
  communityCategory: varchar('community_category', { length: 64 }),
});
```

#### Backend Changes
| File Path | Lines to Change | Intended Modification | 
|-----------|----------------|----------------------|
| server/modules/xp/xp-service.ts | Lines 40-60 | Enhance awardXp to support community-specific XP |
| server/modules/xp/community-xp-integration.ts | Lines 85-110 | Update to include communityId in XP awards |
| server/routes/xp-routes.ts | Add new routes | Add community leaderboard API endpoints |

#### Frontend Changes
| File Path | Lines to Change | Intended Modification | 
|-----------|----------------|----------------------|
| client/src/components/community/CommunityTabs.tsx | Lines 25-40 | Add leaderboard tab |
| client/src/components/community/CommunityLeaderboard.tsx | New file | Create leaderboard component |
| client/src/pages/leaderboard.tsx | Lines 150-180 | Add community filter to global leaderboard |

#### New Files to Create
| File Path | Purpose | Integration Points |
|-----------|---------|-------------------|
| server/routes/community-xp-routes.ts | Community XP API endpoints | XP Service, Community Module |
| client/src/components/community/CommunityLeaderboard.tsx | Leaderboard UI | Community pages, XP API |
| client/src/hooks/useCommunityLeaderboard.ts | Data fetching hook | React Query, XP API |

#### Potential Side Effects
- **XP Calculations**: Changes may affect total XP calculations if not carefully implemented
- **UI Performance**: Leaderboard might be resource-intensive for large communities
- **Data Migration**: Existing XP records lack community association

### Implementation Strategy
**Timestamp: April 19, 2025 - 12:40 PM ET**

1. **Database Schema First**
   - Add necessary fields to XP transactions table
   - Create indexes for efficient queries

2. **Backend Services**
   - Enhance XP Service to handle community-specific XP
   - Implement API endpoints for community leaderboards
   - Ensure backward compatibility for existing XP awards

3. **Frontend Components**
   - Create modular leaderboard components
   - Implement community leaderboard tab
   - Add filters to distinguish global vs. community XP

4. **Testing Strategy**
   - Unit test XP calculation logic
   - Integration test API endpoints
   - UI/UX testing of leaderboard display

## Detailed Implementation Plan

### Day 1: Schema & Backend Foundation
**Timestamp: April 20, 2025 - 10:00 AM ET**

#### Schema Updates
```typescript
/**
 * [PKL-278651-XP-0004-COMM-LEAD] Community XP Schema
 * Implementation timestamp: 2025-04-20 10:00 ET
 * 
 * Extends XP schema to support community-specific XP tracking.
 * 
 * Framework 5.2 compliance verified:
 * - Extends existing schema without breaking changes
 * - Maintains backward compatibility
 */
// Add to shared/schema.ts
export const xpTransactions = pgTable('xp_transactions', {
  // Existing fields preserved
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  source: varchar('source', { length: 255 }).notNull(),
  details: varchar('details', { length: 512 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  
  // New fields for community XP
  communityId: integer('community_id').references(() => communities.id),
  communityCategory: varchar('community_category', { length: 64 }),
});

// Add indexes for efficient queries
export const xpTransactionIndexes = {
  communityXpIndex: uniqueIndex('community_xp_idx').on(
    xpTransactions.userId, 
    xpTransactions.communityId
  ),
};
```

#### XP Service Enhancement
```typescript
/**
 * [PKL-278651-XP-0004-COMM-LEAD] Community XP Service
 * Implementation timestamp: 2025-04-20 11:00 ET
 * 
 * Enhances XP Service to support community-specific XP awards.
 * 
 * Framework 5.2 compliance verified:
 * - Extends existing service without breaking changes
 * - Maintains backward compatibility
 */
// Update in server/modules/xp/xp-service.ts

interface AwardXpParams {
  userId: number;
  amount: number;
  source: string;
  details?: string;
  // New parameters
  communityId?: number;
  communityCategory?: string;
}

async awardXp({
  userId,
  amount,
  source,
  details,
  communityId,
  communityCategory
}: AwardXpParams): Promise<boolean> {
  try {
    // Apply multiplier if needed based on source
    const adjustedAmount = await this.applyMultiplier(amount, source);
    
    // Record XP transaction
    await db.insert(xpTransactions).values({
      userId,
      amount: adjustedAmount,
      source,
      details,
      timestamp: new Date(),
      // Add community fields if provided
      ...(communityId && { communityId }),
      ...(communityCategory && { communityCategory }),
    });
    
    // Existing event pub/sub logic preserved
    this.eventBus.publish('xp:awarded', {
      userId,
      amount: adjustedAmount,
      source,
      communityId,
    });
    
    return true;
  } catch (error) {
    console.error('[XP] Error awarding XP:', error);
    return false;
  }
}
```

### Day 2: API Endpoints
**Timestamp: April 21, 2025 - 10:00 AM ET**

```typescript
/**
 * [PKL-278651-XP-0004-COMM-LEAD] Community XP API
 * Implementation timestamp: 2025-04-21 10:00 ET
 * 
 * Implements API endpoints for community XP leaderboards.
 * 
 * Framework 5.2 compliance verified:
 * - Follows existing API patterns
 * - Clear separation of concerns
 */
// New file: server/routes/community-xp-routes.ts

import { Router } from 'express';
import { db } from '../db';
import { xpTransactions } from '@shared/schema';
import { desc, eq, sql, and } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

export function registerCommunityXpRoutes(app: express.Express) {
  /**
   * GET /api/communities/:communityId/leaderboard
   * Get XP leaderboard for a specific community
   */
  app.get('/api/communities/:communityId/leaderboard', isAuthenticated, async (req, res) => {
    try {
      const { communityId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      
      // Get community leaderboard
      const leaderboard = await db.select({
        userId: xpTransactions.userId,
        totalXp: sql`sum(amount)`.as('totalXp'),
      })
      .from(xpTransactions)
      .where(eq(xpTransactions.communityId, parseInt(communityId, 10)))
      .groupBy(xpTransactions.userId)
      .orderBy(desc(sql`totalXp`))
      .limit(parseInt(limit as string, 10))
      .offset(parseInt(offset as string, 10));
      
      // Fetch user details for the leaderboard
      const userIds = leaderboard.map(entry => entry.userId);
      const userDetails = await db.select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImage: users.profileImage,
      })
      .from(users)
      .where(sql`${users.id} IN ${userIds}`);
      
      // Merge user details with leaderboard data
      const enrichedLeaderboard = leaderboard.map(entry => {
        const user = userDetails.find(u => u.id === entry.userId);
        return {
          ...entry,
          user: user || { id: entry.userId },
        };
      });
      
      res.status(200).json(enrichedLeaderboard);
    } catch (error) {
      console.error('[API] Error fetching community leaderboard:', error);
      res.status(500).json({ error: 'Error fetching community leaderboard' });
    }
  });
  
  /**
   * GET /api/communities/:communityId/leaderboard/me
   * Get current user's position in community leaderboard
   */
  app.get('/api/communities/:communityId/leaderboard/me', isAuthenticated, async (req, res) => {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;
      
      // Get user's community XP
      const userXp = await db.select({
        totalXp: sql`sum(amount)`.as('totalXp'),
      })
      .from(xpTransactions)
      .where(
        and(
          eq(xpTransactions.communityId, parseInt(communityId, 10)),
          eq(xpTransactions.userId, userId)
        )
      );
      
      // Get user's rank in community
      const userRankQuery = await db.execute(sql`
        SELECT position FROM (
          SELECT userId, SUM(amount) as total_xp,
          ROW_NUMBER() OVER (ORDER BY SUM(amount) DESC) as position
          FROM xp_transactions
          WHERE community_id = ${parseInt(communityId, 10)}
          GROUP BY userId
        ) as rankings
        WHERE userId = ${userId}
      `);
      
      const totalXp = userXp[0]?.totalXp || 0;
      const rank = userRankQuery.rows[0]?.position || null;
      
      res.status(200).json({
        userId,
        communityId: parseInt(communityId, 10),
        totalXp,
        rank,
      });
    } catch (error) {
      console.error('[API] Error fetching user community rank:', error);
      res.status(500).json({ error: 'Error fetching user community rank' });
    }
  });
  
  console.log('[API] Community XP routes registered');
}
```

### Day 3: Frontend Components
**Timestamp: April 22, 2025 - 10:00 AM ET**

```typescript
/**
 * [PKL-278651-XP-0004-COMM-LEAD] Community Leaderboard Hook
 * Implementation timestamp: 2025-04-22 10:00 ET
 * 
 * Custom hook for fetching community leaderboard data.
 * 
 * Framework 5.2 compliance verified:
 * - Follows existing hooks pattern
 * - Uses React Query for data fetching
 */
// New file: client/src/hooks/useCommunityLeaderboard.ts

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

interface LeaderboardEntry {
  userId: number;
  totalXp: number;
  user: {
    id: number;
    username?: string;
    displayName?: string;
    profileImage?: string;
  };
}

interface UserRank {
  userId: number;
  communityId: number;
  totalXp: number;
  rank: number | null;
}

export function useCommunityLeaderboard(communityId: number, limit = 10) {
  // Fetch community leaderboard
  const { 
    data: leaderboard,
    isLoading: isLeaderboardLoading,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = useQuery<LeaderboardEntry[]>({
    queryKey: [`/api/communities/${communityId}/leaderboard`, { limit }],
    queryFn: async () => {
      const url = `/api/communities/${communityId}/leaderboard?limit=${limit}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    },
  });

  // Fetch current user's rank
  const {
    data: userRank,
    isLoading: isUserRankLoading,
    error: userRankError,
  } = useQuery<UserRank>({
    queryKey: [`/api/communities/${communityId}/leaderboard/me`],
    queryFn: async () => {
      const url = `/api/communities/${communityId}/leaderboard/me`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch user rank');
      return res.json();
    },
  });
  
  // Calculate percentile rank if available
  const percentileRank = useMemo(() => {
    if (!userRank?.rank) return null;
    
    // This is a simplified calculation assuming we have total user count
    // In production, we'd want to fetch the total count from the API
    return 100 - (userRank.rank / 100) * 100;
  }, [userRank]);
  
  return {
    leaderboard,
    userRank,
    percentileRank,
    isLoading: isLeaderboardLoading || isUserRankLoading,
    error: leaderboardError || userRankError,
    refetch: refetchLeaderboard,
  };
}
```

```tsx
/**
 * [PKL-278651-XP-0004-COMM-LEAD] Community Leaderboard Component
 * Implementation timestamp: 2025-04-22 11:00 ET
 * 
 * Component for displaying community XP leaderboard.
 * 
 * Framework 5.2 compliance verified:
 * - Follows existing component patterns
 * - Uses ShadCN UI components
 */
// New file: client/src/components/community/CommunityLeaderboard.tsx

import React from 'react';
import { useCommunityLeaderboard } from '@/hooks/useCommunityLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CommunityLeaderboardProps {
  communityId: number;
  limit?: number;
}

export function CommunityLeaderboard({ communityId, limit = 10 }: CommunityLeaderboardProps) {
  const { 
    leaderboard, 
    userRank, 
    percentileRank,
    isLoading, 
    error 
  } = useCommunityLeaderboard(communityId, limit);
  
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Community Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            Failed to load leaderboard. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Community Leaderboard</span>
          {userRank && (
            <Badge variant="outline" className="ml-2">
              Your Rank: #{userRank.rank || '?'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard?.map((entry, index) => {
              const isCurrentUser = entry.userId === userRank?.userId;
              
              return (
                <div 
                  key={entry.userId} 
                  className={`flex items-center gap-4 p-2 rounded-md ${isCurrentUser ? 'bg-accent/20' : ''}`}
                >
                  <div className="flex-shrink-0 text-lg font-bold w-6 text-center">
                    {index + 1}
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={entry.user.profileImage} />
                    <AvatarFallback>
                      {entry.user.displayName?.[0] || entry.user.username?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-medium">
                      {entry.user.displayName || entry.user.username || `User #${entry.userId}`}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="ml-2">You</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.totalXp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Show user's rank if not in top 10 */}
            {userRank && !leaderboard?.some(entry => entry.userId === userRank.userId) && (
              <>
                <div className="my-2 border-t border-border" />
                <div className="flex items-center gap-4 p-2 rounded-md bg-accent/20">
                  <div className="flex-shrink-0 text-lg font-bold w-6 text-center">
                    {userRank.rank || '?'}
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-medium">
                      You
                      <Badge variant="secondary" className="ml-2">Your Rank</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userRank.totalXp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Show percentile if available */}
            {percentileRank !== null && (
              <div className="mt-4">
                <div className="text-sm text-muted-foreground mb-1">
                  You're in the top {Math.round(percentileRank)}% of contributors
                </div>
                <Progress value={percentileRank} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Day 4: Integration
**Timestamp: April 23, 2025 - 10:00 AM ET**

```tsx
/**
 * [PKL-278651-XP-0004-COMM-LEAD] Community Tabs with Leaderboard
 * Implementation timestamp: 2025-04-23 10:00 ET
 * 
 * Adds leaderboard tab to community page.
 * 
 * Framework 5.2 compliance verified:
 * - Extends existing component
 * - Maintains original functionality
 */
// Update file: client/src/components/community/CommunityTabs.tsx

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunityPosts } from './CommunityPosts';
import { CommunityEvents } from './CommunityEvents';
import { CommunityMembers } from './CommunityMembers';
import { CommunityLeaderboard } from './CommunityLeaderboard'; // New import

interface CommunityTabsProps {
  communityId: number;
  defaultTab?: string;
}

export function CommunityTabs({ communityId, defaultTab = 'posts' }: CommunityTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-8"> {/* Changed from cols-3 to cols-4 */}
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger> {/* New tab */}
      </TabsList>
      
      <TabsContent value="posts">
        <CommunityPosts communityId={communityId} />
      </TabsContent>
      
      <TabsContent value="events">
        <CommunityEvents communityId={communityId} />
      </TabsContent>
      
      <TabsContent value="members">
        <CommunityMembers communityId={communityId} />
      </TabsContent>
      
      <TabsContent value="leaderboard">
        <CommunityLeaderboard communityId={communityId} /> {/* New content */}
      </TabsContent>
    </Tabs>
  );
}
```

## Integration Testing Plan
**Timestamp: April 24, 2025 - 10:00 AM ET**

### Direct Functionality Tests
| Test Case | Expected Result | Verification Method |
|-----------|----------------|---------------------|
| Award XP with communityId | XP transaction recorded with proper communityId | Database query |
| Community leaderboard API | Returns top contributors sorted by XP | API response verification |
| User rank API | Returns correct rank for current user | API response verification |

### Adjacent Component Tests
| Component | Test Case | Expected Result | Verification Method |
|-----------|----------|----------------|---------------------|
| Community Tabs | Verify new leaderboard tab | Tab shows up and displays leaderboard | UI verification |
| Global XP | Check that community XP adds to global XP | Total XP includes community XP | Database query |
| Community Activity Feed | Activity that generates XP | XP award shows in activity feed | UI verification |

## Deployment Plan
**Timestamp: April 25, 2025 - 10:00 AM ET**

1. **Database Migration**
   - Run migration to add communityId and communityCategory fields
   - Create necessary indexes
   - Verify backward compatibility

2. **Backend Deployment**
   - Deploy updated XP service
   - Deploy community XP API endpoints
   - Verify services are operational

3. **Frontend Deployment**
   - Deploy new components
   - Deploy updated community tabs
   - Verify UI functionality

4. **Monitoring**
   - Monitor XP calculation performance
   - Watch for any errors in API responses
   - Check leaderboard rendering performance

## Success Criteria
**Timestamp: April 26, 2025 - 4:00 PM ET**

- Community leaderboards render correctly with proper data
- User rank is calculated correctly
- XP awards properly attribute community-specific XP
- All existing XP functionality continues to work
- Performance impact is minimal

## Rollback Plan
**Timestamp: April 26, 2025 - 4:30 PM ET**

If issues are detected:
1. Revert frontend changes first
2. Rollback API endpoints
3. If necessary, disable community-specific XP awards
4. Database schema can remain as it's backward compatible