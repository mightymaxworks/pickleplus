/**
 * PlayerXPCard Component
 * 
 * This component displays a player's XP level, progress,
 * and unlocked features.
 */

import { useQuery } from '@tanstack/react-query';
import { 
  Zap, 
  Star, 
  Lock, 
  Unlock,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

// XP level information from API
interface XPLevelInfo {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
  levelName: string;
  unlocks: string[];
}

// Recent XP activity from API
interface XPActivity {
  id: number;
  type: string;
  xpEarned: number;
  createdAt: string;
  notes?: string;
}

// Component props
interface PlayerXPCardProps {
  userId: number;
  showDetailedStats?: boolean;
  showRecentActivity?: boolean;
  compactView?: boolean;
}

export default function PlayerXPCard({
  userId,
  showDetailedStats = true,
  showRecentActivity = false,
  compactView = false
}: PlayerXPCardProps) {
  // Fetch player XP info
  const { 
    data: xpInfo, 
    isLoading: isLoadingXP, 
    error: xpError 
  } = useQuery({
    queryKey: ['/api/user/xp-tier', userId],
    queryFn: async () => {
      const response = await fetch(`/api/user/xp-tier/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch XP information');
      }
      
      return response.json();
    },
    enabled: !!userId,
  });
  
  // Fetch recent XP activity if needed
  const { 
    data: xpActivity, 
    isLoading: isLoadingActivity 
  } = useQuery({
    queryKey: ['/api/user/activities', userId, 'xp'],
    queryFn: async () => {
      const response = await fetch(`/api/user/activities/${userId}?type=xp&limit=5`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch XP activities');
      }
      
      return response.json();
    },
    enabled: !!userId && showRecentActivity,
  });
  
  // Format XP with comma separators for readability
  const formatXP = (xp: number): string => {
    return xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Format activity type for display
  const formatActivityType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };
  
  // Format timestamp to relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSec = Math.floor(diffInMs / 1000);
    
    if (diffInSec < 60) {
      return `${diffInSec} sec ago`;
    } else if (diffInSec < 3600) {
      const mins = Math.floor(diffInSec / 60);
      return `${mins} min ago`;
    } else if (diffInSec < 86400) {
      const hours = Math.floor(diffInSec / 3600);
      return `${hours} hr ago`;
    } else {
      const days = Math.floor(diffInSec / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  // Render loading state
  if (isLoadingXP) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CourtIQ XP Level</CardTitle>
          <CardDescription>Loading player experience...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (xpError) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading XP</CardTitle>
          <CardDescription>
            {xpError instanceof Error ? xpError.message : 'Could not load player XP data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again later or contact support if the problem persists.</p>
        </CardContent>
      </Card>
    );
  }
  
  // No XP data available
  if (!xpInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CourtIQ XP Level</CardTitle>
          <CardDescription>No experience data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Zap className="h-16 w-16 mb-4 text-muted-foreground opacity-30" />
            <p className="text-center">
              This player doesn't have any experience points yet.
              XP is earned by participating in matches and platform activities.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Compact view (for sidebars, widgets, etc.)
  if (compactView) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-md">Level {xpInfo.currentLevel}</CardTitle>
              <CardDescription>{xpInfo.levelName}</CardDescription>
            </div>
            <Badge variant="secondary" className="px-1.5">
              <Zap className="h-3.5 w-3.5 mr-1" /> 
              {formatXP(xpInfo.currentXP)} XP
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress to Level {xpInfo.currentLevel + 1}</span>
              <span>{xpInfo.progress}%</span>
            </div>
            <Progress value={xpInfo.progress} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>CourtIQ XP Level</CardTitle>
            <CardDescription>
              {xpInfo.levelName}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-md px-3 py-1">
            Level {xpInfo.currentLevel}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current XP</span>
              <span className="font-semibold flex items-center">
                <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                {formatXP(xpInfo.currentXP)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Level {xpInfo.currentLevel}</span>
              <span>Level {xpInfo.currentLevel + 1}</span>
            </div>
            
            <Progress value={xpInfo.progress} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>
                {formatXP(xpInfo.nextLevelXP - xpInfo.currentXP)} XP needed
              </span>
              <span>{formatXP(xpInfo.nextLevelXP)}</span>
            </div>
          </div>
          
          {/* Features Unlocked */}
          {showDetailedStats && (
            <div>
              <h4 className="font-medium mb-2">Features Unlocked</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {xpInfo.unlocks.map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                    <Unlock className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                
                {/* Show a couple next level unlocks if available */}
                {xpInfo.currentLevel < 10 && (
                  <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Unlock more at Level {xpInfo.currentLevel + 1}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Recent XP Activity */}
          {showRecentActivity && !isLoadingActivity && xpActivity?.activities?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recent XP Activity</h4>
              <div className="space-y-2">
                {xpActivity.activities.map((activity: XPActivity) => (
                  <HoverCard key={activity.id}>
                    <HoverCardTrigger asChild>
                      <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md text-sm cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{formatActivityType(activity.type)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">+{activity.xpEarned} XP</span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">
                            {formatActivityType(activity.type)}
                          </h4>
                          {activity.notes && (
                            <p className="text-sm text-muted-foreground">
                              {activity.notes}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
                
                <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  <span>View activity history for more</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          <span>
            Earn XP by playing matches, participating in tournaments, and engaging on the platform.
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}