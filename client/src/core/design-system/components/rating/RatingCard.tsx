/**
 * RatingCard Component
 * 
 * A card displaying a player's rating information from the CourtIQ™ system.
 */

import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { 
  InfoIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  HistoryIcon,
  AlertCircleIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { colors } from "../../tokens/colors";
import { RatingBadge } from "./RatingBadge";
import { useRatingData, useRatingTiers } from "../../hooks/useRatingData";
import type { RatingData, RatingTier } from "../../hooks/useRatingData";

// Helper function for formatting dates
const formatDate = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "N/A";
  }
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

interface RatingCardProps {
  className?: string;
  userId?: number;
}

export function RatingCard({ className }: RatingCardProps) {
  const [activeFormat, setActiveFormat] = useState<string>("Singles");
  const { data: ratings, isLoading: ratingsLoading, error: ratingsError } = useRatingData();
  const { data: tiers, isLoading: tiersLoading } = useRatingTiers();
  
  // Group ratings by format
  const formatMap: Record<string, RatingData> = {};
  if (ratings) {
    ratings.forEach(rating => {
      formatMap[rating.format] = rating;
    });
  }
  
  // Calculate tier progress
  const calculateTierProgress = (rating: RatingData): number => {
    if (!tiers) return 0;
    
    const currentTier = tiers.find(t => t.name === rating.tier);
    if (!currentTier) return 0;
    
    const nextTier = tiers.find(t => t.order === currentTier.order - 1);
    if (!nextTier) return 100; // Already at highest tier
    
    const tierRange = nextTier.minRating - currentTier.minRating;
    const playerProgress = rating.rating - currentTier.minRating;
    
    return Math.min(100, Math.max(0, (playerProgress / tierRange) * 100));
  };
  
  // Format dates for display
  const formatDisplayDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return formatDate(new Date(dateString));
  };
  
  if (ratingsLoading || tiersLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">CourtIQ™ Ratings</CardTitle>
          <CardDescription>Loading rating data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (ratingsError || !ratings || ratings.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">CourtIQ™ Ratings</CardTitle>
          <CardDescription>Player rating information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-40 gap-3">
          <AlertCircleIcon className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm text-center text-muted-foreground max-w-xs">
            No rating data available. Ratings are calculated after you play matches.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Get active rating data
  const activeRating = formatMap[activeFormat] || ratings[0];
  
  // Get available formats from ratings
  const formats = ratings.map(r => r.format);
  
  // Calculate tier progress for the active rating
  const tierProgress = calculateTierProgress(activeRating);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">CourtIQ™ Ratings</CardTitle>
            <CardDescription>Player rating information</CardDescription>
          </div>
          <RatingBadge 
            tier={activeRating.tier} 
            rating={activeRating.rating} 
            format={activeRating.format}
            showRating 
            showFormat
            size="lg"
          />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs defaultValue={activeFormat} onValueChange={setActiveFormat}>
          <TabsList className="w-full mb-4">
            {formats.map(format => (
              <TabsTrigger key={format} value={format} className="flex-1">
                {format}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {formats.map(format => {
            const rating = formatMap[format];
            return (
              <TabsContent key={format} value={format} className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Current Rating</h4>
                    <div className="text-2xl font-bold text-primary">{rating.rating}</div>
                  </div>
                  
                  <div className="text-right">
                    <h4 className="text-sm font-medium mb-1">Matches Played</h4>
                    <div className="text-xl font-medium">{rating.matchesPlayed}</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium">Progress to Next Tier</h4>
                    <span className="text-xs text-muted-foreground">{Math.round(tierProgress)}%</span>
                  </div>
                  <Progress value={tierProgress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-md">
                    <h4 className="text-xs font-medium mb-1 flex items-center">
                      <TrendingUpIcon className="w-3 h-3 mr-1" />
                      Season High
                    </h4>
                    <div className="font-medium">
                      {rating.currentSeasonHighRating || "N/A"}
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md">
                    <h4 className="text-xs font-medium mb-1 flex items-center">
                      <TrendingDownIcon className="w-3 h-3 mr-1" />
                      Season Low
                    </h4>
                    <div className="font-medium">
                      {rating.currentSeasonLowRating || "N/A"}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-medium mb-1 flex items-center">
                      <HistoryIcon className="w-3 h-3 mr-1" />
                      Last Match Date
                    </h4>
                    <div className="text-sm">
                      {formatDisplayDate(rating.lastMatchDate)}
                    </div>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-1">
                          <h4 className="text-xs font-medium">Confidence</h4>
                          <InfoIcon className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Confidence level indicates how accurate your rating is. 
                          It increases as you play more matches.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div>
                  <Progress 
                    value={rating.confidenceLevel * 100} 
                    className="h-1"
                  />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
      
      <CardFooter className="pt-2 text-xs text-muted-foreground">
        <p>
          Powered by CourtIQ™ Rating Algorithm
        </p>
      </CardFooter>
    </Card>
  );
}