/**
 * XPCard Component
 * 
 * A card displaying a player's XP information from the CourtIQ™ system.
 * This measures platform progression and engagement through experience points.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Zap, Medal, Trophy } from 'lucide-react';
import { useXPData } from '@/core/design-system/hooks/useXPData';
import { Progress } from '@/components/ui/progress';

interface XPCardProps {
  className?: string;
  userId?: number;
}

export function XPCard({ className, userId }: XPCardProps) {
  const { isLoading, error, xpData } = useXPData(userId);

  if (isLoading) {
    return <XPCardSkeleton className={className} />;
  }

  if (error) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle>Experience Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Error loading XP data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no XP data is available, show a fallback
  if (!xpData) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Experience Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-8 text-center">
            Start playing matches to earn experience points
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress percentage to next level
  const progressToNextLevel = () => {
    const { currentXP, levelInfo, nextLevelInfo } = xpData;
    
    if (!nextLevelInfo) return 100; // Max level reached
    
    const xpForCurrentLevel = levelInfo.minXP;
    const xpForNextLevel = nextLevelInfo.minXP;
    const xpRange = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = currentXP - xpForCurrentLevel;
    
    return Math.round((xpProgress / xpRange) * 100);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Experience Points
          </span>
          <Badge
            variant="outline"
            className="rounded-md text-xs px-2 py-1"
            style={{ 
              borderColor: xpData.levelInfo.colorCode || '#4CAF50', 
              color: xpData.levelInfo.colorCode || '#4CAF50' 
            }}
          >
            Level {xpData.levelInfo.level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current XP */}
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{xpData.currentXP}</span>
            <span className="text-xs text-muted-foreground">Total experience points</span>
          </div>

          {/* Progress to next level */}
          {xpData.nextLevelInfo && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Level {xpData.levelInfo.level}</span>
                <span>Level {xpData.nextLevelInfo.level}</span>
              </div>
              <Progress value={progressToNextLevel()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{xpData.levelInfo.minXP}</span>
                <span>{xpData.nextLevelInfo.minXP}</span>
              </div>
            </div>
          )}

          {/* XP Multipliers and Boosters */}
          {xpData.activeMultipliers && xpData.activeMultipliers.length > 0 && (
            <div className="pt-2">
              <div className="text-sm font-medium flex items-center gap-1 mb-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Active Boosters</span>
              </div>
              <div className="space-y-1">
                {xpData.activeMultipliers.map((multiplier, index) => (
                  <div key={index} className="text-sm flex justify-between items-center py-1 border-b border-dashed last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-xs">{multiplier.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Expires in {multiplier.remainingTime}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {multiplier.value}x
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level Milestone Benefits */}
          <div className="pt-2">
            <div className="text-sm font-medium flex items-center gap-1 mb-2">
              <Trophy className="h-4 w-4" />
              <span>Level {xpData.levelInfo.level} Benefits</span>
            </div>
            <div className="bg-muted/50 p-2 rounded-md">
              <p className="text-xs">{xpData.levelInfo.description || 'Progress through levels to unlock special benefits and features.'}</p>
              
              {xpData.levelInfo.unlocks && (
                <div className="mt-2 space-y-1">
                  {Array.isArray(xpData.levelInfo.unlocks) ? (
                    xpData.levelInfo.unlocks.map((unlock, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        <Medal className="h-3 w-3 text-primary" />
                        <span>{unlock}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-1 text-xs">
                      <Medal className="h-3 w-3 text-primary" />
                      <span>{xpData.levelInfo.unlocks}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent XP Gains */}
          {xpData.recentActivities && xpData.recentActivities.length > 0 && (
            <div className="pt-2">
              <div className="text-sm font-medium flex items-center gap-1 mb-2">
                <Activity className="h-4 w-4" />
                <span>Recent XP Gains</span>
              </div>
              <div className="space-y-1">
                {xpData.recentActivities.slice(0, 3).map((activity, index) => (
                  <div key={index} className="text-sm flex justify-between items-center py-1 border-b border-dashed last:border-0">
                    <div className="flex-1">
                      <div className="font-medium text-xs">{activity.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.date}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-primary">
                      +{activity.xpEarned} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function XPCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-36" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-12 w-24" />
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex justify-between items-center py-1">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}