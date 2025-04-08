/**
 * XP Progress Bar Component
 * 
 * This component displays a user's XP progress including current level and progress toward next level
 */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useUserXP, calculateXPProgress } from "@/lib/sdk/xpSDK";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface XPProgressBarProps {
  userId: number;
  compact?: boolean;
  showLabel?: boolean;
  showLevel?: boolean;
  className?: string;
}

export default function XPProgressBar({ 
  userId, 
  compact = false, 
  showLabel = true, 
  showLevel = true,
  className = ""
}: XPProgressBarProps) {
  const xpQueryConfig = useUserXP(userId);
  const { data, isLoading, error } = useQuery(xpQueryConfig);
  const [progressData, setProgressData] = useState({
    currentLevel: 1,
    nextLevel: 2,
    currentLevelXP: 0,
    nextLevelXP: 100,
    xpNeeded: 100,
    progress: 0
  });

  useEffect(() => {
    if (data?.totalXP !== undefined) {
      const progress = calculateXPProgress(data.totalXP);
      setProgressData(progress);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        {showLabel && <Skeleton className="h-4 w-20 mb-2" />}
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`text-sm text-destructive ${className}`}>
        Error loading XP data
      </div>
    );
  }

  const { totalXP } = data;
  const { progress, currentLevel, nextLevel, xpNeeded } = progressData;

  // For compact view, just show the progress bar without details
  if (compact) {
    return (
      <div className={`w-full ${className}`}>
        <Progress value={progress} className="h-2 bg-muted" />
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-medium flex items-center">
            Experience Points
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Gain XP by playing matches, participating in tournaments, and earning achievements</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-sm text-muted-foreground">
            {totalXP} XP
          </div>
        </div>
      )}
      
      <Progress value={progress} className="h-3 bg-muted" />
      
      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
        {showLevel && (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="bg-background h-5 px-2 text-xs font-semibold">
              Level {currentLevel}
            </Badge>
            <span>→</span>
            <Badge variant="outline" className="bg-background h-5 px-2 text-xs font-semibold">
              Level {nextLevel}
            </Badge>
          </div>
        )}
        <div>
          {xpNeeded} XP needed
        </div>
      </div>
    </div>
  );
}