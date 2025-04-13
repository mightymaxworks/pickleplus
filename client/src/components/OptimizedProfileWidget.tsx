/**
 * PKL-278651-PERF-0001.3-MEMO
 * Optimized Profile Widget Component
 * 
 * This component demonstrates using the optimization utilities
 * to prevent unnecessary re-renders.
 */

import { useState } from 'react';
import { EnhancedUser } from '@/lib/types';
import { useUserData } from '@/contexts/UserDataContext';
import { optimizeComponent, createOptimizedCallback, createOptimizedValue } from '@/utils/optimizeComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Props interface for the component
interface ProfileWidgetProps {
  showRating?: boolean;
  refreshInterval?: number;
}

// The component implementation using optimization utilities
function ProfileWidget({ showRating = true, refreshInterval = 0 }: ProfileWidgetProps) {
  const { userData, isLoading, refreshUserData } = useUserData();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Use memoized callback for refresh
  const handleRefresh = createOptimizedCallback(() => {
    refreshUserData();
    setLastRefreshed(new Date());
  }, [refreshUserData]);

  // Use memoized value for formatted time
  const formattedTime = createOptimizedValue(() => {
    return lastRefreshed.toLocaleTimeString();
  }, [lastRefreshed]);

  // Use memoized value for rating display
  const ratingDisplay = createOptimizedValue(() => {
    if (!userData) return 'N/A';
    return userData.rating ? userData.rating.toFixed(1) : 'Not Rated';
  }, [userData?.rating]);

  // Use memoized value for name display
  const fullName = createOptimizedValue(() => {
    if (!userData) return '';
    return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username;
  }, [userData?.firstName, userData?.lastName, userData?.username]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Not logged in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userData.avatarUrl || undefined} alt={userData.username} />
            <AvatarFallback>{userData.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{fullName}</h3>
            <div className="flex items-center mt-1 space-x-2">
              <p className="text-sm text-muted-foreground">@{userData.username}</p>
              {showRating && (
                <Badge variant="secondary" className="text-xs">
                  Rating: {ratingDisplay}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-right">
          Last updated: {formattedTime}
        </div>
      </CardContent>
    </Card>
  );
}

// Export the memoized version of the component
export default optimizeComponent(ProfileWidget, 'OptimizedProfileWidget');