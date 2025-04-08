/**
 * Ranking Badge Component
 * 
 * This component displays a user's ranking tier with an appropriate badge/emblem
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  useUserRanking, 
  calculateRankingProgress, 
  getTierColors,
  getRankingTier
} from "@/lib/sdk/rankingSDK";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ChevronUp, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingBadgeProps {
  userId: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  showPoints?: boolean;
  className?: string;
}

export default function RankingBadge({ 
  userId, 
  size = 'md', 
  showProgress = false,
  showPoints = true,
  className = ""
}: RankingBadgeProps) {
  const rankingQueryConfig = useUserRanking(userId);
  const { data, isLoading, error } = useQuery(rankingQueryConfig);
  const [progressData, setProgressData] = useState({
    currentTier: 'Bronze',
    nextTier: 'Silver',
    currentTierThreshold: 0,
    nextTierThreshold: 250,
    pointsNeeded: 250,
    progress: 0
  });

  useEffect(() => {
    if (data?.rankingPoints !== undefined) {
      const progress = calculateRankingProgress(data.rankingPoints);
      setProgressData(progress);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <Skeleton className={`h-${size === 'sm' ? '6' : size === 'md' ? '8' : '10'} w-${size === 'sm' ? '6' : size === 'md' ? '8' : '10'} rounded-full`} />
        <Skeleton className="h-4 w-16 ml-2" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`text-sm text-destructive ${className}`}>
        Error loading ranking data
      </div>
    );
  }

  const { rankingPoints } = data;
  const { currentTier, nextTier, pointsNeeded, progress } = progressData;
  const tierColors = getTierColors(currentTier);

  // Utility function to get the appropriate tier icon
  const getTierIcon = () => {
    switch (currentTier) {
      case 'Bronze':
      case 'Silver':
      case 'Gold':
        return <Star className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />;
      case 'Platinum':
      case 'Diamond':
        return <Star className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />;
      case 'Master':
      case 'Grandmaster':
        return <Award className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />;
      default:
        return <Star className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />;
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center">
        <div className={cn(
          `flex items-center justify-center rounded-full`,
          tierColors.primary,
          size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-10 w-10',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
        )}>
          {getTierIcon()}
        </div>
        
        <div className="ml-2">
          <div className={cn(
            "font-bold flex items-center",
            tierColors.text,
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
          )}>
            {currentTier}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className={`ml-1 text-muted-foreground cursor-help ${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Your CourtIQ™ Ranking tier is based on your Ranking Points</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {showPoints && (
            <div className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-sm'}`}>
              {rankingPoints} points
            </div>
          )}
        </div>
      </div>
      
      {showProgress && currentTier !== 'Grandmaster' && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <div className={`text-xs font-medium ${tierColors.text}`}>
              {currentTier}
            </div>
            <div className="text-xs font-medium flex items-center">
              <ChevronUp className="h-3 w-3 mr-0.5" />
              {nextTier}
            </div>
          </div>
          <Progress 
            value={progress} 
            className="h-1.5" 
            indicatorClassName={tierColors.primary} 
          />
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {pointsNeeded} points needed
          </div>
        </div>
      )}
    </div>
  );
}