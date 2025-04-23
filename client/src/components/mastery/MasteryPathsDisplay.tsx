/**
 * MasteryPathsDisplay component for dashboard
 * Displays player's current mastery tier status and progress
 * 
 * Sprint: PKL-278651-RATE-0004-MADV-UI
 */

import React from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMasteryTierStatus } from '@/hooks/use-mastery-tier-status';
import { useTierByName } from '@/hooks/use-mastery-tiers';
import { MasteryPath } from '@shared/mastery-paths';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  Heart, 
  Clock, 
  BarChart2,
  ChevronRight,
  Medal
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
  // Using the custom hook that handles authentication and data fetching
  const { data: tierStatus, isLoading, error, refetch } = useMasteryTierStatus();
  const { data: tierDetails } = useTierByName(tierStatus?.currentTierName);
  
  // Get authenticated user info
  const { user } = useAuth();
  
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
  
  // Error state - handle authentication errors gracefully
  if (error || !tierStatus) {
    // Check if it's an authentication error (most common cause)
    const isAuthError = error?.message?.includes('Not authenticated') ||
                        error?.message?.includes('401') ||
                        error?.message?.includes('Failed to fetch');
                        
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">CourtIQ™ Mastery Journey</CardTitle>
          <CardDescription>
            {isAuthError ? 'Let\'s get your data back on track!' : 'Hmm, we hit a little bump in the road'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-4 ${isAuthError ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'} rounded-md`}>
            {isAuthError 
              ? 'Your session needs a quick refresh to show your latest mastery achievements. Just one click and we\'ll have you back on the court!' 
              : 'We couldn\'t load your mastery path information right now. Don\'t worry - your progress is still being tracked behind the scenes!'}
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {isAuthError
              ? 'This usually happens when you\'ve been inactive for a while.'
              : 'Our CourtIQ™ system might be calculating new ratings. Check back soon!'}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant={isAuthError ? "default" : "outline"} 
            onClick={(e) => {
              e.preventDefault();
              // Refresh only this component data instead of full page
              refetch();
            }}
            className="w-full"
          >
            {isAuthError ? "Refresh My Data" : "Try Again"}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Check for missing mastery tier status (e.g., no DUPR rating)
  if (tierStatus.status === "no_rating" || (tierStatus.rating === 0 && !user?.duprRating)) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Ready to Start Your Journey?</CardTitle>
          <CardDescription>Let's set up your CourtIQ™ Mastery profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-md mb-4">
            <p className="mb-2 font-semibold">Update Your DUPR Rating</p>
            <p className="text-sm">Adding your DUPR rating helps us calculate your personalized CourtIQ™ Mastery tier and match you with players at a similar skill level.</p>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
            <Medal className="h-5 w-5 text-blue-500" />
            <div className="text-sm text-blue-700">Having a DUPR rating helps you get placed in the right mastery tier from the start!</div>
          </div>
        </CardContent>
        <CardFooter className="pt-3 justify-between border-t mt-4">
          <Button variant="outline" size="sm" className="text-xs">
            Learn About DUPR
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="text-xs"
            onClick={() => window.location.href = '/profile/edit'}
          >
            Update Profile
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If we have status with insufficient_data, show a friendly message
  if (tierStatus.status === "insufficient_data") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">CourtIQ™ Mastery Journey</CardTitle>
          <CardDescription>Your pickleball adventure is just beginning!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-md mb-4">
            <p className="mb-2 font-semibold">Your CourtIQ™ Profile is Growing</p>
            <p className="text-sm">We're getting to know your playing style! Record a few more matches and we'll unlock your personalized CourtIQ™ Mastery Path.</p>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Profile Development</span>
            <span className="font-medium">40%</span>
          </div>
          <Progress value={40} className="h-2 mb-4 bg-blue-100" />
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="inline-block p-1 bg-green-100 text-green-700 rounded-full">
              <ChevronRight className="h-3 w-3" />
            </span>
            <span>Just 3 more matches to unlock your full mastery profile!</span>
          </div>
        </CardContent>
        <CardFooter className="pt-3 justify-between border-t mt-4">
          <Button variant="outline" size="sm" className="text-xs">
            About CourtIQ™ Mastery
          </Button>
          <Button variant="default" size="sm" className="text-xs">
            Record a Match
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Success state
  const pathIcon = tierStatus.currentPath || 'Foundation';
  const PathIconComponent = PathIcon[pathIcon as MasteryPath];
  const pathColor = getPathColor(pathIcon as MasteryPath);
  const healthStatus = getTierHealthStatus(tierStatus.tierHealth === 'good' ? 100 : 50);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <PathIconComponent className={`h-5 w-5 ${pathColor}`} />
          <span>{tierStatus.currentTierName}</span>
          <Badge variant="outline" className={pathColor}>
            {pathIcon} Path
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
              <span className="font-medium">{tierStatus.progressPercent}%</span>
            </div>
            <Progress value={tierStatus.progressPercent} className="h-2" />
          </div>
          
          {/* Key stats */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-slate-50 p-2 rounded-md">
              <div className="text-muted-foreground">Rating</div>
              <div className="font-medium text-lg">{tierStatus.rating.toFixed(1)}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-md">
              <div className="text-muted-foreground">Matches</div>
              <div className="font-medium text-lg">{tierStatus.matchesInTier || 0}</div>
            </div>
            <div className="bg-slate-50 p-2 rounded-md">
              <div className="text-muted-foreground">Next Tier</div>
              <div className="font-medium text-lg">{tierStatus.pointsToNextTier || "--"}</div>
            </div>
          </div>
          
          {/* Tier health indicator */}
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
            <div className="flex items-center gap-2">
              <healthStatus.icon className={`h-5 w-5 ${healthStatus.color}`} />
              <span>Tier Health: <span className={`font-medium ${healthStatus.color}`}>{healthStatus.text}</span></span>
            </div>
            <div className="text-sm text-muted-foreground">
              {tierStatus.matchesInTier || 0} matches in tier
            </div>
          </div>
          
          {/* Path progress */}
          {tierStatus.pathProgressPercent > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Path progress</span>
                <span className="font-medium">{Math.min(100, Math.round(tierStatus.pathProgressPercent))}%</span>
              </div>
              <Progress value={Math.min(100, tierStatus.pathProgressPercent)} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-between">
        {/* PKL-278651-MAST-0009-CLICK - Fix unresponsive benefits button by adding dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              View Benefits
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mastery Path Benefits</DialogTitle>
            </DialogHeader>
            <div className="benefits-content space-y-4">
              <p>Earn XP and unlock exclusive rewards as you progress through mastery paths!</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-md">
                  <h3 className="text-sm font-semibold mb-1 flex items-center">
                    <Award className="h-4 w-4 mr-1 text-purple-500" />
                    Special Badges
                  </h3>
                  <p className="text-xs text-gray-600">Earn unique badges displayed on your profile as you achieve new tiers.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-md">
                  <h3 className="text-sm font-semibold mb-1 flex items-center">
                    <Crown className="h-4 w-4 mr-1 text-amber-500" />
                    Tournament Priority
                  </h3>
                  <p className="text-xs text-gray-600">Higher-tier players receive early access to tournaments and special events.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* PKL-278651-MAST-0009-CLICK - Fix "View All Paths" button with proper navigation */}
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => window.location.href = '/mastery-paths'}
        >
          View All Paths
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MasteryPathsDisplay;