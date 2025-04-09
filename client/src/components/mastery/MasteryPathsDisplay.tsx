/**
 * MasteryPathsDisplay component for dashboard
 * Displays player's current mastery tier status and progress
 * 
 * Sprint: PKL-278651-RATE-0004-MADV-UI
 */

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMasteryTierStatus } from '@/hooks/use-mastery-tier-status';
import { useTierByName } from '@/hooks/use-mastery-tiers';
import { MasteryPath } from '@shared/mastery-paths';
import { 
  Shield, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  Heart, 
  Clock, 
  BarChart2,
  ChevronRight
} from 'lucide-react';

// Path to icon mapping
const PathIcon: Record<MasteryPath, React.ElementType> = {
  'Foundation': Shield,
  'Evolution': Award,
  'Pinnacle': Crown
};

// Get path-specific color
const getPathColor = (path: MasteryPath): string => {
  switch (path) {
    case 'Foundation': return 'text-blue-500';
    case 'Evolution': return 'text-purple-500';
    case 'Pinnacle': return 'text-amber-500';
    default: return 'text-gray-500';
  }
};

// Get tier health status info
const getTierHealthStatus = (healthPercentage: number): { text: string; color: string; icon: React.ElementType } => {
  if (healthPercentage >= 80) {
    return { text: 'Excellent', color: 'text-green-500', icon: Heart };
  } else if (healthPercentage >= 50) {
    return { text: 'Good', color: 'text-blue-500', icon: Heart };
  } else if (healthPercentage >= 30) {
    return { text: 'At Risk', color: 'text-amber-500', icon: Clock };
  } else {
    return { text: 'Critical', color: 'text-red-500', icon: TrendingDown };
  }
};

const MasteryPathsDisplay: React.FC = () => {
  const { data: tierStatus, isLoading, error } = useMasteryTierStatus();
  const { data: tierDetails } = useTierByName(tierStatus?.currentTier);
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Skeleton className="h-6 w-[200px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[150px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error || !tierStatus) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Mastery Tier Status</CardTitle>
          <CardDescription>There was an error loading your tier status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-500 rounded-md">
            Unable to load your mastery path information. Please try again later.
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Success state
  const PathIconComponent = PathIcon[tierStatus.currentPath];
  const pathColor = getPathColor(tierStatus.currentPath);
  const healthStatus = getTierHealthStatus(tierStatus.tierHealth);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <PathIconComponent className={`h-5 w-5 ${pathColor}`} />
          <span>{tierStatus.currentTier}</span>
          <Badge variant="outline" className={pathColor}>
            {tierStatus.currentPath} Path
          </Badge>
        </CardTitle>
        <CardDescription>
          {tierDetails?.tagline || "Your journey of mastery"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress to next tier */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next tier</span>
              <span className="font-medium">{tierStatus.progressToNextTier}%</span>
            </div>
            <Progress value={tierStatus.progressToNextTier} className="h-2" />
          </div>
          
          {/* Key stats */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-slate-50 p-2 rounded-md">
              <div className="text-muted-foreground">Rating</div>
              <div className="font-medium text-lg">{tierStatus.rating.toFixed(1)}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-md">
              <div className="text-muted-foreground">Tier Rank</div>
              <div className="font-medium text-lg">#{tierStatus.tierRank}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-md">
              <div className="text-muted-foreground">Global</div>
              <div className="font-medium text-lg">#{tierStatus.globalRank}</div>
            </div>
          </div>
          
          {/* Tier health indicator */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
            <div className="flex items-center gap-2">
              <healthStatus.icon className={`h-5 w-5 ${healthStatus.color}`} />
              <span>Tier Health: <span className={`font-medium ${healthStatus.color}`}>{healthStatus.text}</span></span>
            </div>
            <div className="text-sm text-muted-foreground">
              {tierStatus.matchesInTier} matches in tier
            </div>
          </div>
          
          {/* Promotion progress */}
          {tierStatus.promotionProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Promotion eligibility</span>
                <span className="font-medium">{Math.min(100, Math.round(tierStatus.promotionProgress))}%</span>
              </div>
              <Progress value={Math.min(100, tierStatus.promotionProgress)} className="h-2" />
            </div>
          )}
          
          {/* Grace period info */}
          {tierStatus.gracePeriodRemaining > 0 && (
            <div className="text-sm bg-blue-50 p-2 rounded-md flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Grace period: <span className="font-medium">{tierStatus.gracePeriodRemaining} matches</span> remaining</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-between">
        <Button variant="outline" size="sm" className="text-xs">
          View Benefits
        </Button>
        <Button variant="outline" size="sm" className="text-xs" asChild>
          <a href="/mastery-paths">
            View All Paths
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MasteryPathsDisplay;